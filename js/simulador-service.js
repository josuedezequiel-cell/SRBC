/**
 * SRBC — Servicio de simulación
 * ------------------------------------------------------------------
 * Esta capa aísla TODA la lógica de "cómo se genera la imagen simulada"
 * del resto de la interfaz. La UI solo llama a simSimulate(...) y no
 * necesita saber si la respuesta viene de un modo demo o de un
 * proveedor de IA real.
 *
 * Cuando se conecte un proveedor de IA real, este es el ÚNICO archivo
 * que debe cambiar (además del backend). La llamada real NUNCA debe
 * hacerse directamente desde el navegador al proveedor de IA:
 *
 *   Frontend (este archivo)
 *        ↓  fetch('/api/simulate', { method:'POST', body: FormData })
 *   Backend / API route segura   ← aquí vive AI_API_KEY, como variable
 *        ↓                          de entorno del servidor
 *   Proveedor de IA (imagen)
 *        ↓
 *   Frontend (recibe la imagen ya generada)
 *
 * El backend / API route (/api/simulate) queda fuera del alcance de
 * este sitio estático y debe implementarse por separado cuando SRBC
 * decida conectar un proveedor de IA real.
 * ------------------------------------------------------------------
 */

/**
 * Genera (o simula) el resultado visual de un procedimiento.
 * @param {Object} params
 * @param {string} params.photoDataUrl - Foto del usuario en formato data URL.
 * @param {string[]} params.procedureIds - IDs de procedimientos seleccionados.
 * @returns {Promise<{status:string, simulationId:string, imageUrl:string, demo:boolean}>}
 */
async function simSimulate({ photoDataUrl, procedureIds }) {
  if (SIM_CONFIG.DEMO_MODE || !SIM_CONFIG.AI_PROVIDER) {
    // ================= MODO DEMOSTRACIÓN =================
    // No se envía la fotografía a ningún servidor. Se simula el tiempo
    // de procesamiento y se devuelve la misma imagen, para poder probar
    // y pulir todo el flujo de la interfaz antes de conectar una IA real.
    await new Promise((resolve) => setTimeout(resolve, 2600));
    return {
      status: 'ok',
      simulationId: 'demo-' + Date.now(),
      imageUrl: photoDataUrl,
      demo: true,
    };
  }

  // ================= INTEGRACIÓN REAL: flux1.ai vía Netlify Function =================
  // La API key vive solo en netlify/functions/simulate.js (servidor), nunca aquí.
  const procedures = procedureIds
    .map((id) => SIM_PROCEDURES.find((p) => p.id === id))
    .filter(Boolean);

  const prompt = procedures.map((p) => p.aiInstructions).join(' ') ||
    'Edita esta fotografía de forma sutil y natural, conservando la identidad de la persona.';

  const res = await fetch('/.netlify/functions/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoDataUrl, prompt }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'No se pudo generar la simulación.');
  }

  const result = await res.json();
  if (result.status === 'unknown_format') {
    console.warn('Respuesta de flux1.ai con formato no reconocido:', result.raw);
    throw new Error('El proveedor respondió en un formato inesperado. Revisa la consola.');
  }

  return result;
}

/**
 * Control de abuso básico (nivel sesión de navegador).
 * Cuando exista backend, esto debe reforzarse también del lado del servidor
 * (límite por IP/usuario), pero esta capa ya deja el flujo preparado.
 */
const SimRateLimit = {
  KEY: 'srbc_sim_count',

  getCount() {
    return parseInt(sessionStorage.getItem(this.KEY) || '0', 10);
  },

  increment() {
    sessionStorage.setItem(this.KEY, String(this.getCount() + 1));
  },

  remaining() {
    return Math.max(0, SIM_CONFIG.MAX_SIMULATIONS_PER_SESSION - this.getCount());
  },

  hasReachedLimit() {
    return this.getCount() >= SIM_CONFIG.MAX_SIMULATIONS_PER_SESSION;
  },
};
