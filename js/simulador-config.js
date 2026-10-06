/**
 * SRBC — Configuración central del Simulador
 * ------------------------------------------------------------------
 * Este archivo es la única fuente de verdad de los procedimientos que
 * aparecen en el simulador. Para agregar, editar o desactivar un
 * procedimiento, modifica este arreglo — el resto de la app lo lee
 * de aquí automáticamente, sin tocar HTML ni lógica de la interfaz.
 *
 * Los procedimientos listados corresponden exactamente a los servicios
 * publicados en la sección "Servicios" del sitio (index.html). No se
 * inventan procedimientos que SRBC no ofrezca.
 * ------------------------------------------------------------------
 */

const SIM_PROCEDURES = [
  // ---------- CUERPO ----------
  {
    id: 'lipo360',
    name: 'Lipoescultura 360°',
    category: 'cuerpo',
    description: 'Lipo de alta definición en abdomen, cintura, espalda y flancos.',
    referenceImage: null,
    aiInstructions: 'Afinar sutilmente cintura, abdomen y espalda manteniendo proporciones anatómicas naturales y la identidad de la persona.',
    allowMultiple: false,
    warning: 'Los resultados reales varían según composición corporal, piel y técnica quirúrgica.',
    active: true,
  },
  {
    id: 'abdominoplastia',
    name: 'Abdominoplastia estructural',
    category: 'cuerpo',
    description: 'Retiro de exceso de piel y definición de cintura.',
    referenceImage: null,
    aiInstructions: 'Simular un abdomen más firme y definido, sin alterar el resto del cuerpo ni el rostro.',
    allowMultiple: false,
    warning: 'Los resultados reales dependen de la calidad de piel y anatomía individual.',
    active: true,
  },
  {
    id: 'bbl',
    name: 'Diseño de glúteos (BBL)',
    category: 'cuerpo',
    description: 'Proyección y forma glútea mediante transferencia de grasa autóloga.',
    referenceImage: null,
    aiInstructions: 'Aumentar sutilmente proyección y redondez de glúteos manteniendo proporción con el resto del cuerpo.',
    allowMultiple: false,
    warning: 'El resultado real depende de la grasa disponible para transferencia y de la anatomía individual.',
    active: true,
  },
  {
    id: 'lipo-brazos',
    name: 'Lipo de brazos y espalda',
    category: 'cuerpo',
    description: 'Eliminación de grasa localizada en brazos, axilas y espalda.',
    referenceImage: null,
    aiInstructions: 'Afinar sutilmente el contorno de brazos y espalda alta, sin exagerar la definición muscular.',
    allowMultiple: false,
    warning: 'Los resultados reales varían según composición corporal y calidad de piel.',
    active: true,
  },

  // ---------- SENOS ----------
  {
    id: 'aumento-mamario',
    name: 'Aumento mamario',
    category: 'senos',
    description: 'Selección de implante o técnica según anatomía y expectativa estética.',
    referenceImage: null,
    aiInstructions: 'Aumentar sutilmente el volumen mamario manteniendo proporción corporal natural.',
    allowMultiple: false,
    warning: 'El volumen final real depende de la anatomía torácica y la técnica indicada por la Dra. De La Cruz Rosa.',
    active: true,
  },
  {
    id: 'levantamiento-mamario',
    name: 'Levantamiento mamario',
    category: 'senos',
    description: 'Reposiciona el busto para una forma más firme y simétrica.',
    referenceImage: null,
    aiInstructions: 'Simular una posición más firme y simétrica del busto sin alterar el volumen de forma exagerada.',
    allowMultiple: false,
    warning: 'El resultado real depende del grado de flacidez y calidad de piel de cada paciente.',
    active: true,
  },
  {
    id: 'aumento-levantamiento',
    name: 'Aumento + levantamiento',
    category: 'senos',
    description: 'Combina volumen y reposicionamiento en un solo procedimiento.',
    referenceImage: null,
    aiInstructions: 'Simular un busto con más volumen y una posición más firme de forma equilibrada y natural.',
    allowMultiple: false,
    warning: 'Procedimiento combinado; el resultado real se define en la evaluación con la cirujana.',
    active: true,
  },
  {
    id: 'reduccion-mamaria',
    name: 'Reducción mamaria',
    category: 'senos',
    description: 'Alivio funcional junto con proporción corporal natural.',
    referenceImage: null,
    aiInstructions: 'Reducir sutilmente el volumen mamario manteniendo proporción con el resto del cuerpo.',
    allowMultiple: false,
    warning: 'El resultado real depende de la anatomía y el objetivo funcional de cada paciente.',
    active: true,
  },

  // ---------- ROSTRO ----------
  {
    id: 'rinoplastia',
    name: 'Rinoplastia',
    category: 'rostro',
    description: 'Armonización del perfil nasal con el resto del rostro.',
    referenceImage: null,
    aiInstructions: 'Ajustar sutilmente el perfil nasal manteniendo el resto del rostro y la identidad de la persona intactos.',
    allowMultiple: false,
    warning: 'El resultado real depende de la estructura ósea y cartilaginosa individual.',
    active: true,
  },
  {
    id: 'mentoplastia',
    name: 'Mentoplastia',
    category: 'rostro',
    description: 'Proyección y armonía del mentón con el perfil facial.',
    referenceImage: null,
    aiInstructions: 'Ajustar sutilmente la proyección del mentón manteniendo el resto del rostro sin cambios.',
    allowMultiple: false,
    warning: 'El resultado real depende de la anatomía ósea individual.',
    active: true,
  },
  {
    id: 'blefaroplastia',
    name: 'Blefaroplastia',
    category: 'rostro',
    description: 'Rejuvenecimiento del contorno de los párpados.',
    referenceImage: null,
    aiInstructions: 'Simular un contorno de párpados más descansado, sin alterar la forma natural de los ojos.',
    allowMultiple: false,
    warning: 'El resultado real depende de la anatomía y calidad de piel periocular.',
    active: true,
  },
];

const SIM_CATEGORIES = [
  { id: 'cuerpo', label: 'Cuerpo' },
  { id: 'senos', label: 'Senos' },
  { id: 'rostro', label: 'Rostro' },
];

/**
 * Configuración general del simulador.
 * IMPORTANTE — SEGURIDAD:
 *   AI_API_KEY nunca debe tener un valor real aquí ni en ningún archivo
 *   que se sirva al navegador. Cuando se conecte un proveedor de IA real,
 *   la llave debe vivir únicamente como variable de entorno del backend
 *   (por ejemplo /api/simulate), nunca en este repositorio de frontend.
 */
const SIM_CONFIG = {
  // Proveedor activo. La llamada real ocurre en netlify/functions/simulate.js.
  AI_PROVIDER: 'flux1ai',

  // NUNCA debe tener un valor real aquí. La clave real vive SOLO como
  // variable de entorno FLUX1_API_KEY en Netlify (servidor), nunca en
  // este archivo ni en ningún código que se sirva al navegador.
  AI_API_KEY: null,

  // Tamaño máximo de fotografía permitido, en megabytes.
  MAX_IMAGE_SIZE_MB: 8,

  // Tipos de archivo permitidos.
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  // Tiempo de retención de imágenes en el backend real (cuando exista).
  // En modo demo esto no aplica: la foto nunca sale del navegador.
  IMAGE_RETENTION_TIME: '24 horas (a definir junto con el proveedor de IA)',

  // Límite de simulaciones por sesión de navegador (control de abuso básico,
  // funciona incluso sin backend, vía sessionStorage).
  // Bajado a 3 mientras se prueba con crédito real limitado ($10) — súbelo
  // cuando confirmes que todo funciona y quieras usarlo con más libertad.
  MAX_SIMULATIONS_PER_SESSION: 3,

  // false = usa el proveedor de IA real (flux1.ai) vía Netlify Function.
  // Cambia a true en cualquier momento para volver al modo demo sin costo.
  DEMO_MODE: false,

  // Enlaces oficiales de SRBC usados en el CTA final del simulador.
  PREEVAL_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSfpy3Q2WQ31fbOKQL_Ang1kvFFuwmuh7iSYCo7qlQDqe3Dbtg/viewform',
  WHATSAPP_URL: 'https://wa.link/4ilnt2',
};
