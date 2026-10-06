SRBC — Sitio web (vista previa)
================================

Cómo subir a Netlify:
1. Ve a https://app.netlify.com/drop
2. Arrastra esta carpeta completa (o el .zip) a la ventana del navegador.
3. Netlify te dará una URL temporal tipo "nombre-al-azar.netlify.app" para ver el sitio en vivo.
4. Cuando quieras, puedes comprar un dominio propio y conectarlo desde el panel de Netlify (Site settings > Domain management).

Estructura de archivos:
- index.html      → página principal
- css/style.css    → estilos
- js/script.js     → interacciones (menú móvil, año automático)
- assets/          → logo e íconos extraídos de tu PDF original

Para editar textos, teléfono, correo o dirección, abre index.html en cualquier editor
de texto y busca la sección correspondiente (Contacto, Servicios, etc.). Los colores y
tipografías se controlan desde css/style.css.

Nota: el formulario de contacto es solo visual (no envía correos todavía). Para que
funcione necesitarás conectarlo a Netlify Forms, un servicio como Formspree, o tu propio backend.
