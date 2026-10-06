# SRBC — Simulador con IA (estado actual y siguientes pasos)

## ⚠️ Estado actual: integración con flux1.ai EN PRUEBAS

- `DEMO_MODE` ya está en `false` en `js/simulador-config.js`.
- `netlify/functions/simulate.js` ya llama a `flux1.ai` — pero el formato
  exacto de la petición/respuesta **no está verificado** todavía, porque
  no existe documentación pública independiente de ese proveedor.
- **Antes de usar el simulador completo en el sitio**, probar manualmente
  con UNA sola imagen (para no arriesgar el crédito de $10 en llamadas
  con un formato incorrecto). Ver instrucciones que Claude te dio en el
  chat para ese test manual.
- Si la respuesta real de flux1.ai tiene una forma distinta a la que
  espera `simulate.js`, hay que ajustar la sección marcada
  `AJUSTAR ESTO según la respuesta real` en ese archivo.
- `MAX_SIMULATIONS_PER_SESSION` está bajado a `3` mientras se prueba con
  crédito limitado. Súbelo cuando confirmes que todo funciona.

## Cómo publicar con la función activa (importante)

Arrastrar el zip a [netlify.app/drop](https://app.netlify.com/drop) **ya
no alcanza** — ese método solo sirve archivos estáticos y no ejecuta
`netlify/functions/simulate.js`. Para que la IA real funcione hace falta:

1. Subir esta carpeta a un repositorio de GitHub.
2. En Netlify: **Add new site → Import an existing project → conectar
   ese repositorio de GitHub**.
3. En **Site settings → Environment variables**, agregar:
   - `FLUX1_API_KEY` = tu clave real de flux1.ai
4. Netlify detectará `netlify.toml` automáticamente y desplegará tanto el
   sitio como la función.

Mientras tanto, para seguir usando el drag-and-drop sin backend, basta con
volver a poner `DEMO_MODE: true` en `js/simulador-config.js`.

## Qué existía antes de conectar flux1.ai (para volver atrás si hace falta)

El simulador (`simulador.html`) funciona completo de principio a fin, pero
**no está conectado a ningún proveedor de inteligencia artificial todavía**.
En modo demo:

- La fotografía del usuario **nunca sale del navegador** (se procesa con
  `FileReader`, en memoria local).
- El "resultado" que se muestra es la misma fotografía subida, con un filtro
  visual sutil — solo para poder probar el comparador antes/después.
- No hay backend, ni base de datos, ni llamadas a APIs externas.

Esto permite mostrar y ajustar todo el diseño y flujo antes de gastar un
solo dólar en un proveedor de IA.

## Archivos involucrados

| Archivo | Qué hace |
|---|---|
| `simulador.html` | Estructura de las 5 pantallas del simulador |
| `css/simulador.css` | Estilos, coherentes con la identidad de SRBC |
| `js/simulador-config.js` | **Única fuente de verdad** de los procedimientos disponibles y parámetros generales (`SIM_CONFIG`) |
| `js/simulador-service.js` | Capa que genera (o simula) el resultado — el único archivo que hay que tocar para conectar una IA real |
| `js/simulador-app.js` | Lógica de interfaz (pasos, subida de foto, selección, comparador) |

## Cómo agregar o quitar un procedimiento

Edita únicamente `js/simulador-config.js`, dentro del arreglo `SIM_PROCEDURES`.
No hace falta tocar HTML ni el resto del JavaScript.

## Cómo conectar un proveedor de IA real (cuando SRBC lo decida)

**Nunca** llames a un proveedor de IA (OpenAI, Stability, Replicate, etc.)
directamente desde el navegador — eso expondría la API key a cualquiera que
inspeccione el código. El flujo correcto es:

```
Frontend (simulador-service.js)
      ↓  fetch('/api/simulate', { method:'POST', body: FormData })
Backend / API Route segura   ← aquí vive la API key, como variable de entorno
      ↓
Proveedor de IA de generación/edición de imágenes
      ↓
Frontend (recibe la URL de la imagen ya generada)
```

Pasos:

1. Crear un backend pequeño (por ejemplo, una función serverless en Netlify
   Functions, Vercel, o un servidor Node/Express) con una ruta `/api/simulate`
   que reciba la foto + el/los procedimiento(s) seleccionados.
2. En ese backend, guardar la API key del proveedor de IA como variable de
   entorno (nunca en el código, nunca en este repositorio de frontend).
3. En `js/simulador-config.js`, cambiar:
   ```js
   AI_PROVIDER: null,     // → 'openai' | 'stability' | 'replicate' | ...
   DEMO_MODE: true,       // → false
   ```
4. En `js/simulador-service.js`, descomentar y ajustar el bloque marcado como
   "INTEGRACIÓN REAL (pendiente)" — ya está escrito el `fetch` de ejemplo.
5. Definir en el backend, según el proveedor elegido:
   - `AI_PROVIDER`
   - `AI_API_KEY`
   - `MAX_IMAGE_SIZE` (ya validado también del lado del cliente)
   - `IMAGE_RETENTION_TIME` (cuánto tiempo se guarda la foto antes de borrarla)
   - `MAX_SIMULATIONS_PER_SESSION` (además del límite básico que ya existe
     del lado del cliente, vía `sessionStorage`)

## Privacidad (para cuando exista backend real)

- No almacenar las fotografías de forma permanente.
- Usar almacenamiento temporal con borrado automático (definir
  `IMAGE_RETENTION_TIME`).
- No usar las fotos de pacientes para entrenar modelos de IA.
- No compartir las fotos con terceros distintos del proveedor de IA
  estrictamente necesario para generar la simulación.
- Mostrar una política de privacidad y pedir consentimiento explícito antes
  de subir la foto (el paso "Importante" ya cubre el consentimiento sobre
  el carácter ilustrativo de la simulación; falta la política de datos
  cuando exista backend real).

## Control de abuso

Ya implementado del lado del cliente (`simulador-service.js`, objeto
`SimRateLimit`): límite de simulaciones por sesión de navegador.

Cuando exista backend, reforzar además con:
- Límite por IP/usuario en el servidor.
- CAPTCHA o verificación similar si se detecta abuso.
- Validación de tipo y tamaño de archivo también del lado del servidor
  (la validación actual del frontend es solo la primera barrera).
