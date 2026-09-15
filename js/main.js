/**
 * ORAL GOLD ODONTOLOGIA — JAVASCRIPT REFINADO & LEVE
 * Fluidez de scroll, status de atendimento real e agendamento via WhatsApp
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

/* 1. SCROLL REVEAL SUAVE & ORGÂNICO */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  });

  elements.forEach(el => observer.observe(el));
}

/* 2. HEADER COMPACTO NA ROLAGEM */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* 3. STATUS DA CLÍNICA EM TEMPO REAL */
function initClinicStatus() {
  const statusEl = document.querySelector('.live-status');
  if (!statusEl) return;

  const dot = statusEl.querySelector('.status-dot');
  const text = statusEl.querySelector('.status-text');
  if (!dot || !text) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Dom, 1 = Seg, ..., 6 = Sáb
  const time = now.getHours() + now.getMinutes() / 60;

  let isOpen = false;
  let msg = '';

  if (day >= 1 && day <= 5) {
    if (time >= 9.0 && time < 19.0) {
      isOpen = true;
      msg = 'Aberto hoje até 19h';
    } else if (time < 9.0) {
      msg = 'Abre hoje às 09h';
    } else {
      msg = day === 5 ? 'Abre sábado às 08h' : 'Abre amanhã às 09h';
    }
  } else if (day === 6) {
    if (time >= 8.0 && time < 13.0) {
      isOpen = true;
      msg = 'Aberto hoje até 13h';
    } else {
      msg = 'Abre segunda às 09h';
    }
  } else {
    msg = 'Abre segunda às 09h';
  }

  text.textContent = msg;
  dot.style.background = isOpen ? '#25D366' : '#D99B38';
}

/* 4. PARALLAX SUTIL EM IMAGENS */
function initParallax() {
  if (window.innerWidth < 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;

  let ticking = false;

  const update = () => {
    const vh = window.innerHeight;
    items.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.05;
      if (rect.top < vh && rect.bottom > 0) {
        const offset = (rect.top - vh / 2) * speed;
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      }
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* 5. MODAL DE AGENDAMENTO SIMPLES VIA WHATSAPP */
function initModal() {
  const modal = document.getElementById('modalAgendamento');
  if (!modal) return;

  const openBtns = document.querySelectorAll('[data-open-modal="agendamento"]');
  const closeBtn = modal.querySelector('.modal-close');
  const form = document.getElementById('formAgendamento');

  const open = () => {
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) close();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = form.querySelector('#inputNome')?.value.trim() || '';
      const servico = form.querySelector('#inputServico')?.value || 'Avaliação';

      let text = `Olá! Meu nome é *${nome}*.\n`;
      text += `Gostaria de agendar uma avaliação na Oral Gold em Ibirité para *${servico}*.`;

      const url = `https://wa.me/5531991757023?text=${encodeURIComponent(text)}`;
      close();
      window.open(url, '_blank');
    });
  }
}

/* 6. MENU MOBILE */
function initMobileMenu() {
  const btn = document.querySelector('.nav-toggle-btn');
  const drawer = document.querySelector('.mobile-drawer-clean');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const links = document.querySelectorAll('.mobile-drawer-clean a');

  if (!btn || !drawer) return;

  const toggle = (state) => {
    drawer.classList.toggle('is-open', state);
    document.body.style.overflow = state ? 'hidden' : '';
  };

  btn.addEventListener('click', () => toggle(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));
  links.forEach(l => l.addEventListener('click', () => toggle(false)));
}

/* 7. SCROLL SUAVE PARA LINKS INTERNOS */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = document.querySelector('.site-header')?.offsetHeight || 70;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - headerH,
          behavior: 'smooth'
        });
      }
    });
  });
}
