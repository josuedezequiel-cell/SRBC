/**
 * SRBC — Interfaz del simulador
 * Maneja únicamente la UI/flujo. Toda la lógica de "cómo se genera la
 * imagen" vive en simulador-service.js; toda la lista de procedimientos
 * vive en simulador-config.js.
 */
(function () {
  const STEP_ORDER = ['aviso', 'foto', 'procedimiento', 'resultado'];

  const state = {
    photoDataUrl: null,
    photoName: '',
    selectedProcedureIds: [],
  };

  // ---------- Navegación entre pantallas ----------
  function showScreen(name) {
    document.querySelectorAll('.sim-screen').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.screen === name);
    });

    const progress = document.getElementById('simProgress');
    if (name === 'landing' || name === 'procesando') {
      progress.hidden = true;
    } else {
      progress.hidden = false;
      const idx = STEP_ORDER.indexOf(name);
      progress.querySelectorAll('.sim-progress__step').forEach((step, i) => {
        step.classList.toggle('is-done', i < idx);
        step.classList.toggle('is-active', i === idx);
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => showScreen(btn.dataset.back));
  });

  // ---------- Landing ----------
  document.getElementById('btnStart').addEventListener('click', () => showScreen('aviso'));

  // ---------- Aviso ----------
  const chkAviso = document.getElementById('chkAviso');
  const btnAvisoContinuar = document.getElementById('btnAvisoContinuar');
  chkAviso.addEventListener('change', () => {
    btnAvisoContinuar.disabled = !chkAviso.checked;
    btnAvisoContinuar.classList.toggle('is-disabled', !chkAviso.checked);
  });
  btnAvisoContinuar.addEventListener('click', () => {
    if (chkAviso.checked) showScreen('foto');
  });

  // ---------- Subir fotografía ----------
  const dropzone = document.getElementById('simDropzone');
  const fileInput = document.getElementById('simFileInput');
  const preview = document.getElementById('simPreview');
  const previewImg = document.getElementById('simPreviewImg');
  const fileNameEl = document.getElementById('simFileName');
  const errorEl = document.getElementById('simFotoError');
  const btnFotoContinuar = document.getElementById('btnFotoContinuar');
  const removePhotoBtn = document.getElementById('simRemovePhoto');

  document.getElementById('simMaxSize').textContent = SIM_CONFIG.MAX_IMAGE_SIZE_MB;

  dropzone.addEventListener('click', () => fileInput.click());
  ['dragover', 'dragenter'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    })
  );
  ['dragleave', 'dragend'].forEach((evt) =>
    dropzone.addEventListener(evt, () => dropzone.classList.remove('is-dragover'))
  );
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('is-dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  function showFotoError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('is-active');
  }
  function clearFotoError() {
    errorEl.textContent = '';
    errorEl.classList.remove('is-active');
  }

  function handleFile(file) {
    clearFotoError();

    if (!SIM_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      showFotoError('Formato no permitido. Sube una imagen JPG, PNG o WEBP.');
      return;
    }
    const maxBytes = SIM_CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      showFotoError(`La imagen supera el tamaño máximo permitido (${SIM_CONFIG.MAX_IMAGE_SIZE_MB} MB).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      state.photoDataUrl = reader.result;
      state.photoName = file.name;
      previewImg.src = reader.result;
      fileNameEl.textContent = file.name;
      preview.classList.add('is-active');
      btnFotoContinuar.disabled = false;
      btnFotoContinuar.classList.remove('is-disabled');
    };
    reader.onerror = () => showFotoError('No se pudo leer la imagen. Intenta con otra foto.');
    reader.readAsDataURL(file);
  }

  removePhotoBtn.addEventListener('click', () => {
    state.photoDataUrl = null;
    state.photoName = '';
    fileInput.value = '';
    preview.classList.remove('is-active');
    btnFotoContinuar.disabled = true;
    btnFotoContinuar.classList.add('is-disabled');
  });

  btnFotoContinuar.addEventListener('click', () => {
    if (!state.photoDataUrl) return;
    renderProcedures();
    showScreen('procedimiento');
  });

  // ---------- Selección de procedimiento ----------
  const categoriesEl = document.getElementById('simProcedureCategories');
  const btnProcedimientoContinuar = document.getElementById('btnProcedimientoContinuar');
  const limitNote = document.getElementById('simLimitNote');

  function renderProcedures() {
    categoriesEl.innerHTML = '';
    state.selectedProcedureIds = [];
    updateProcedimientoContinuar();

    SIM_CATEGORIES.forEach((cat) => {
      const procs = SIM_PROCEDURES.filter((p) => p.active && p.category === cat.id);
      if (!procs.length) return;

      const block = document.createElement('div');
      block.className = 'sim-category';
      block.innerHTML = `<p class="sim-category__label">${cat.label}</p>`;

      const grid = document.createElement('div');
      grid.className = 'sim-proc-grid';

      procs.forEach((proc) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'sim-proc-card';
        card.dataset.id = proc.id;
        card.innerHTML = `<h3>${proc.name}</h3><p>${proc.description}</p>`;
        card.addEventListener('click', () => toggleProcedure(proc));
        grid.appendChild(card);
      });

      block.appendChild(grid);
      categoriesEl.appendChild(block);
    });

    updateLimitNote();
  }

  function toggleProcedure(proc) {
    const isSelected = state.selectedProcedureIds.includes(proc.id);

    if (isSelected) {
      state.selectedProcedureIds = state.selectedProcedureIds.filter((id) => id !== proc.id);
    } else if (proc.allowMultiple) {
      // Solo se acumula con otros procedimientos que también permitan combinarse.
      const allCurrentAllowMultiple = state.selectedProcedureIds.every((id) => {
        const p = SIM_PROCEDURES.find((sp) => sp.id === id);
        return p && p.allowMultiple;
      });
      if (!allCurrentAllowMultiple) state.selectedProcedureIds = [];
      state.selectedProcedureIds.push(proc.id);
    } else {
      // Procedimiento de selección única: reemplaza cualquier selección previa.
      state.selectedProcedureIds = [proc.id];
    }

    categoriesEl.querySelectorAll('.sim-proc-card').forEach((card) => {
      card.classList.toggle('is-selected', state.selectedProcedureIds.includes(card.dataset.id));
    });
    updateProcedimientoContinuar();
  }

  function updateProcedimientoContinuar() {
    const has = state.selectedProcedureIds.length > 0;
    btnProcedimientoContinuar.disabled = !has;
    btnProcedimientoContinuar.classList.toggle('is-disabled', !has);
  }

  function updateLimitNote() {
    if (SimRateLimit.hasReachedLimit()) {
      limitNote.textContent = 'Alcanzaste el límite de simulaciones de demostración para esta sesión.';
    } else {
      limitNote.textContent = `Te quedan ${SimRateLimit.remaining()} simulaciones de demostración en esta sesión.`;
    }
  }

  // ---------- Generar simulación ----------
  const imgBefore = document.getElementById('simImgBefore');
  const imgAfter = document.getElementById('simImgAfter');

  btnProcedimientoContinuar.addEventListener('click', async () => {
    if (!state.selectedProcedureIds.length) return;

    if (SimRateLimit.hasReachedLimit()) {
      updateLimitNote();
      return;
    }

    showScreen('procesando');

    try {
      const result = await simSimulate({
        photoDataUrl: state.photoDataUrl,
        procedureIds: state.selectedProcedureIds,
      });

      SimRateLimit.increment();

      imgBefore.src = state.photoDataUrl;
      imgAfter.src = result.imageUrl;
      imgAfter.classList.toggle('sim-demo-filter', !!result.demo);
      resetCompareSlider();

      showScreen('resultado');
    } catch (err) {
      showScreen('procedimiento');
      updateLimitNote();
      alert('No se pudo generar la simulación. Intenta nuevamente en unos segundos.');
    }
  });

  // ---------- Comparador antes / simulación ----------
  const compareRange = document.getElementById('simRange');
  const compareHandle = document.getElementById('simHandle');

  function setComparePosition(pct) {
    imgAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
    compareHandle.style.left = pct + '%';
  }
  function resetCompareSlider() {
    compareRange.value = 50;
    setComparePosition(50);
  }
  compareRange.addEventListener('input', () => setComparePosition(compareRange.value));

  // ---------- CTAs finales ----------
  document.getElementById('ctaEvaluacion').href = SIM_CONFIG.PREEVAL_FORM_URL;
  document.getElementById('ctaWhatsapp').href = SIM_CONFIG.WHATSAPP_URL;

  document.getElementById('btnNuevaSimulacion').addEventListener('click', () => {
    renderProcedures();
    showScreen('procedimiento');
  });
})();
