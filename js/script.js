// Año dinámico en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Hero: secuencia video → logo → foto de la Dra. (con fundidos suaves)
(function () {
  const watermark = document.getElementById('heroWatermark');
  const video = document.getElementById('heroVideo');
  if (!watermark || !video) return;

  const LOGO_HOLD_MS = 1600; // cuánto tiempo se queda el logo en pantalla

  function showLogoThenPhoto() {
    watermark.classList.add('is-logo');
    window.setTimeout(() => {
      watermark.classList.add('is-photo');
    }, LOGO_HOLD_MS);
  }

  video.addEventListener('ended', showLogoThenPhoto);

  // Si el video falla al cargar, mostrar la foto directamente
  video.addEventListener('error', () => watermark.classList.add('no-video'));

  // Si tras un instante el navegador no lo está reproduciendo (autoplay
  // bloqueado, poco común pero posible), caer también a la foto directa.
  // No llamamos a video.play() manualmente para no competir con el
  // autoplay nativo del atributo "autoplay" del <video>.
  window.setTimeout(() => {
    if (video.paused) watermark.classList.add('no-video');
  }, 1200);
})();

// Menú móvil
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Nav: fondo sólido al hacer scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.style.background = 'rgba(14,12,10,0.92)';
  } else {
    nav.style.background = 'linear-gradient(to bottom, rgba(14,12,10,0.85), rgba(14,12,10,0))';
  }
});

// Carrusel de fotos de Instagram (efecto 3D Coverflow)
if (window.Swiper) {
  new Swiper('.igSwiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    loop: true,
    slidesPerView: 'auto',
    coverflowEffect: {
      rotate: 35,
      stretch: 0,
      depth: 120,
      modifier: 1,
      slideShadows: false,
    },
    autoplay: {
      delay: 2800,
      disableOnInteraction: false,
    },
  });
}

// Carrusel de fotos de la Dra.
(function () {
  const track = document.getElementById('doctorTrack');
  const dotsWrap = document.getElementById('doctorDots');
  const prevBtn = document.getElementById('doctorPrev');
  const nextBtn = document.getElementById('doctorNext');
  if (!track) return;

  const slides = track.children.length;
  let index = 0;

  for (let i = 0; i < slides; i++) {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function goTo(i) {
    index = (i + slides) % slides;
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dotsWrap.children].forEach((d, di) => d.classList.toggle('active', di === index));
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  let auto = setInterval(() => goTo(index + 1), 6000);
  track.closest('.doctor__carousel').addEventListener('mouseenter', () => clearInterval(auto));
})();
