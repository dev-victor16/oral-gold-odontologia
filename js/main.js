/**
 * ORAL GOLD ODONTOLOGIA — JAVASCRIPT PRINCIPAL
 * Motor de scroll, microinterações, cálculo de status em tempo real e agendamento WhatsApp
 * Ibirité - MG
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initHeaderScroll();
  initClinicStatus();
  initParallax();
  initModal();
  initMobileMenu();
  initSmoothScroll();
});

/* ==========================================================================
   1. MOTOR DE SCROLL REVEAL (INSPIRADO NA FLUÍDEZ DA TR TURISMO)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal], .title-mask-reveal, .journey-steps');

  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // Revela apenas uma vez para não ficar cansativo
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   2. HEADER DINÂMICO COM GLASSMORPHISM NO SCROLL
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   3. STATUS DE FUNCIONAMENTO EM TEMPO REAL
   Horários confirmados: Seg-Sex 09:00-19:00 | Sáb 08:00-13:00 | Dom Fechado
   ========================================================================== */
function initClinicStatus() {
  const statusContainer = document.querySelector('.header-status');
  if (!statusContainer) return;

  const statusText = statusContainer.querySelector('.status-text');
  const statusDot = statusContainer.querySelector('.status-dot');
  if (!statusText || !statusDot) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60;

  let isOpen = false;
  let statusMessage = '';

  if (day >= 1 && day <= 5) {
    // Segunda a Sexta: 09:00 às 19:00
    if (currentTime >= 9.0 && currentTime < 19.0) {
      isOpen = true;
      statusMessage = 'Aberto hoje até 19h';
    } else if (currentTime < 9.0) {
      statusMessage = 'Abre hoje às 09h';
    } else {
      statusMessage = day === 5 ? 'Abre sábado às 08h' : 'Abre amanhã às 09h';
    }
  } else if (day === 6) {
    // Sábado: 08:00 às 13:00
    if (currentTime >= 8.0 && currentTime < 13.0) {
      isOpen = true;
      statusMessage = 'Aberto hoje até 13h';
    } else if (currentTime < 8.0) {
      statusMessage = 'Abre hoje às 08h';
    } else {
      statusMessage = 'Abre segunda às 09h';
    }
  } else {
    // Domingo
    statusMessage = 'Abre segunda às 09h';
  }

  statusText.textContent = statusMessage;
  if (isOpen) {
    statusDot.style.background = '#25D366';
  } else {
    statusDot.style.background = '#E5A93C'; // Laranja elegante quando em recesso
  }
}

/* ==========================================================================
   4. PARALLAX SUTIL EM ELEMENTOS VISUAIS (60FPS COM RAF)
   ========================================================================== */
function initParallax() {
  // Desativa em dispositivos móveis ou caso prefira movimento reduzido
  if (window.innerWidth < 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (!parallaxElements.length) return;

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.08;

      // Executa apenas quando o elemento está próximo ou visível na tela
      if (rect.top < windowHeight && rect.bottom > 0) {
        const offset = (rect.top - windowHeight / 2) * speed;
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      }
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   5. MODAL DE AGENDAMENTO INTELIGENTE INTEGRADO AO WHATSAPP
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('modalAgendamento');
  if (!modal) return;

  const openTriggers = document.querySelectorAll('[data-open-modal="agendamento"]');
  const closeTriggers = modal.querySelectorAll('.modal-close, .modal-backdrop-close');
  const form = document.getElementById('formAgendamento');

  const openModal = (specialtyPreset = '') => {
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    if (specialtyPreset && form) {
      const select = form.querySelector('#inputEspecialidade');
      if (select) select.value = specialtyPreset;
    }

    const firstInput = form ? form.querySelector('input') : null;
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  };

  const closeModal = () => {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const preset = btn.getAttribute('data-preset-treatment') || '';
      openModal(preset);
    });
  });

  closeTriggers.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Envio do formulário para o WhatsApp com mensagem formatada
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = form.querySelector('#inputNome').value.trim();
      const telefone = form.querySelector('#inputTelefone').value.trim();
      const especialidade = form.querySelector('#inputEspecialidade').value;
      const periodo = form.querySelector('#inputPeriodo').value;

      let mensagem = `Olá! Meu nome é *${nome}*.\n`;
      mensagem += `Gostaria de agendar uma avaliação na Oral Gold em Ibirité.\n\n`;
      mensagem += `• *Especialidade de interesse:* ${especialidade}\n`;
      mensagem += `• *Melhor período para mim:* ${periodo}\n`;
      if (telefone) mensagem += `• *Telefone para contato:* ${telefone}\n`;

      const encodedMsg = encodeURIComponent(mensagem);
      const whatsappUrl = `https://wa.me/5531991757023?text=${encodedMsg}`;

      closeModal();
      window.open(whatsappUrl, '_blank');
    });
  }
}

/* ==========================================================================
   6. MENU MOBILE (DRAWER LATERAL ELEGANTE)
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-menu-drawer');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const navLinks = document.querySelectorAll('.mobile-drawer-links a, .mobile-drawer-cta');

  if (!toggleBtn || !drawer) return;

  const toggleDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggleDrawer(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));

  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });
}

/* ==========================================================================
   7. SCROLL SUAVE COM COMPENSAÇÃO DE HEADER FIXO
   ========================================================================== */
function initSmoothScroll() {
  const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 75;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
