/**
 * SRBC — Netlify Function: /.netlify/functions/simulate
 * ------------------------------------------------------------------
 * Esta función corre en el servidor (nunca en el navegador del usuario).
 * Es el único lugar donde vive FLUX1_API_KEY.
 *
 * IMPORTANTE: esta función SOLO se ejecuta si el sitio está desplegado
 * en Netlify conectado a un repositorio Git (Netlify CLI o Git deploy).
 * Un despliegue por "arrastrar y soltar" el zip NO ejecuta funciones —
 * solo sirve archivos estáticos.
 *
 * Configurar en Netlify → Site settings → Environment variables:
 *   FLUX1_API_KEY = <tu clave real de flux1.ai>
 *
 * ------------------------------------------------------------------
 * ESTADO: formato de petición/respuesta SIN VERIFICAR todavía contra
 * flux1.ai real. Está escrito siguiendo el patrón estándar que usan
 * varios revendedores de modelos FLUX/Nano Banana (JSON + input_image
 * en base64 para modo edición). Antes de usarlo en el sitio completo,
 * probar UNA vez de forma manual (ver instrucciones que te di aparte)
 * y ajustar este archivo si la respuesta real tiene una forma distinta.
 * ------------------------------------------------------------------
 */

const FLUX1_ENDPOINT = 'https://flux1.ai/api/v1/generations';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  const apiKey = process.env.FLUX1_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'FLUX1_API_KEY no está configurada en el servidor.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido.' }) };
  }

  const { photoDataUrl, prompt } = payload;
  if (!photoDataUrl || !prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Faltan photoDataUrl o prompt.' }),
    };
  }

  try {
    const response = await fetch(FLUX1_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nano-banana-2',
        prompt,
        input_image: photoDataUrl, // data URL en base64 — formato estándar de este tipo de API
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error del proveedor de IA', detail: data }),
      };
    }

    // ---- AJUSTAR ESTO según la respuesta real de flux1.ai ----
    // Muchos proveedores devuelven { data: [{ url: "..." }] } o { images: ["..."] }
    // o un id de tarea que hay que consultar aparte. Se intentan varias formas
    // comunes; si ninguna aplica, se devuelve la respuesta cruda para revisarla.
    const imageUrl =
      data?.data?.[0]?.url ||
      data?.images?.[0] ||
      data?.image_url ||
      data?.output?.[0] ||
      null;

    if (!imageUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'unknown_format',
          raw: data,
          note: 'No se reconoció el campo de la imagen. Revisa "raw" y ajusta netlify/functions/simulate.js',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'ok',
        simulationId: data.id || ('sim-' + Date.now()),
        imageUrl,
        demo: false,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No se pudo contactar al proveedor de IA.', detail: String(err) }),
    };
  }
};
