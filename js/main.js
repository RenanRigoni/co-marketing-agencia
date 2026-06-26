'use strict';

/* ================================================================
   CO-MARKETING AGÊNCIA — main.js
   Responsável por:
   1. Header scroll (fundo + borda ao rolar)
   2. Menu hambúrguer (mobile)
   3. FAQ accordion
   4. Reveal animations (IntersectionObserver)
   5. Fechar menu ao clicar em link de navegação
================================================================= */


/* ----------------------------------------------------------------
   1. HEADER — adiciona classe .scrolled ao rolar
----------------------------------------------------------------- */
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // executa uma vez no carregamento
})();


/* ----------------------------------------------------------------
   2. HAMBÚRGUER — abre/fecha menu mobile
----------------------------------------------------------------- */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('header-nav');
  if (!hamburger || !nav) return;

  const open  = () => {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    nav.classList.add('open');
    document.body.style.overflow = 'hidden'; // trava scroll do body
  };

  const close = () => {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  };

  const toggle = () => nav.classList.contains('open') ? close() : open();

  hamburger.addEventListener('click', toggle);

  // Fecha ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) close();
  });

  // Fecha ao clicar em qualquer link do menu
  nav.querySelectorAll('.header__nav-link').forEach((link) => {
    link.addEventListener('click', close);
  });
})();


/* ----------------------------------------------------------------
   3. FAQ ACCORDION
----------------------------------------------------------------- */
(function initFaq() {
  const faqList = document.querySelector('.faq-list');
  if (!faqList) return;

  faqList.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-btn');
    if (!btn) return;

    const isOpen   = btn.getAttribute('aria-expanded') === 'true';
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);
    if (!answer) return;

    // Fecha todos os outros itens abertos
    faqList.querySelectorAll('.faq-btn[aria-expanded="true"]').forEach((openBtn) => {
      if (openBtn === btn) return;
      openBtn.setAttribute('aria-expanded', 'false');
      const openAnswer = document.getElementById(openBtn.getAttribute('aria-controls'));
      if (openAnswer) openAnswer.hidden = true;
    });

    // Abre ou fecha o clicado
    btn.setAttribute('aria-expanded', String(!isOpen));
    answer.hidden = isOpen;
  });
})();


/* ----------------------------------------------------------------
   4. REVEAL ANIMATIONS — IntersectionObserver
----------------------------------------------------------------- */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Respeita preferência de motion reduzido
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // anima apenas uma vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();


/* ----------------------------------------------------------------
   5. SMOOTH SCROLL — garantia de fallback para Safari antigo
      (navegadores modernos já respeitam scroll-behavior: smooth no CSS)
----------------------------------------------------------------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      // CSS já cuida do smooth; este bloco é só para fallback
      if (!CSS.supports('scroll-behavior', 'smooth')) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ----------------------------------------------------------------
   6. IMAGENS HERO — fade-in quando carregadas
----------------------------------------------------------------- */
(function initImageFade() {
  document.querySelectorAll('.hero__img').forEach((img) => {
    const show = () => { img.style.opacity = '1'; };

    if (img.complete && img.naturalWidth > 0) {
      show();
    } else {
      img.addEventListener('load', show);
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';
    }
  });
})();


/* ----------------------------------------------------------------
   Preferência de movimento reduzido — desliga efeitos de cursor
----------------------------------------------------------------- */
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;


/* ----------------------------------------------------------------
   7. SPOTLIGHT + TILT 3D — segue o cursor (CSS vars --mx/--my/--rx/--ry)
----------------------------------------------------------------- */
(function initTilt() {
  if (prefersReducedMotion || !isFinePointer) return;

  // Spotlight em qualquer superfície interativa
  const spotEls = document.querySelectorAll(
    '.card, .step, .diff-item, .audience-card, .metric'
  );
  // Tilt 3D apenas em cards e etapas (peso visual maior)
  const tiltEls = document.querySelectorAll('.card, .step');

  const MAX_TILT = 5; // graus — sutil

  spotEls.forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
  });

  tiltEls.forEach((el) => {
    let raf = null;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform =
          `perspective(900px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) ` +
          `rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateY(-6px)`;
      });
    });
    el.addEventListener('pointerleave', () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    });
  });
})();


/* ----------------------------------------------------------------
   8. BOTÕES MAGNÉTICOS — leve atração ao cursor
----------------------------------------------------------------- */
(function initMagnetic() {
  if (prefersReducedMotion || !isFinePointer) return;

  const STRENGTH = 0.25; // quão forte o botão segue o cursor
  document.querySelectorAll('.btn--gold').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * STRENGTH;
      const y = (e.clientY - r.top - r.height / 2) * STRENGTH;
      btn.style.transform = `translate(${x.toFixed(1)}px, ${(y - 2).toFixed(1)}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
})();


/* ----------------------------------------------------------------
   9. NAV ATIVA — indica a seção visível no header (desktop)
----------------------------------------------------------------- */
(function initActiveNav() {
  const links = Array.from(document.querySelectorAll('.header__nav-link'));
  if (!links.length) return;

  const map = new Map();
  links.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) map.set(section, link);
  });
  if (!map.size) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('is-active'));
        const link = map.get(entry.target);
        if (link) link.classList.add('is-active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  map.forEach((_, section) => observer.observe(section));
})();


/* ----------------------------------------------------------------
   10. STEPS TIMELINE — anima a linha conectora ao entrar na viewport
----------------------------------------------------------------- */
(function initStepsLine() {
  const steps = document.querySelector('.steps');
  if (!steps) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          steps.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(steps);
})();


/* ----------------------------------------------------------------
   11. CARDS EXPANSÍVEIS — toggle de detalhe (touch/sem hover)
----------------------------------------------------------------- */
(function initExpandableCards() {
  document.querySelectorAll('.card__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card--service');
      if (!card) return;
      const open = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.firstChild.textContent = open ? 'Ocultar detalhes ' : 'Ver detalhes ';
    });
  });

  // Em telas touch, um toque no card revela o detalhe das ações
  document.querySelectorAll('.action-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (!isFinePointer) item.classList.toggle('is-open');
    });
  });
})();
