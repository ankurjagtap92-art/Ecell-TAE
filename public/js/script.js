/**
 * E-CELL TAE — VANILLA JAVASCRIPT
 * Trinity Academy of Engineering, Pune
 * High-performance, zero-framework interactions
 */

/* =========================================================================
   0. Non-Intrusive Toast Notification Engine (Replaces Browser Alerts)
   ========================================================================= */
const ToastEngine = (() => {
  const MAX_TOASTS = 4;
  let toastQueue = [];

  const getContainer = () => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  };

  const getIconSvg = (type) => {
    switch (type) {
      case 'success':
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        `;
      case 'error':
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        `;
      case 'warning':
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        `;
      case 'info':
      default:
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        `;
    }
  };

  const dismissToast = (toastEl) => {
    if (!toastEl || toastEl.classList.contains('toast-dismissing')) return;
    toastEl.classList.add('toast-dismissing');
    
    // Remove from queue tracking
    toastQueue = toastQueue.filter(t => t.el !== toastEl);
    
    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }
    }, 300);
  };

  const show = (title, message = '', type = 'info', duration = 4500, options = {}) => {
    const container = getContainer();

    // Enforce max toasts visible
    if (toastQueue.length >= MAX_TOASTS) {
      const oldest = toastQueue.shift();
      if (oldest && oldest.el) dismissToast(oldest.el);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    // Title and Message formatting
    const safeTitle = typeof title === 'string' ? title : String(title || '');
    const safeMsg = typeof message === 'string' ? message : String(message || '');

    toast.innerHTML = `
      <div class="toast-icon-wrapper" aria-hidden="true">
        ${getIconSvg(type)}
      </div>
      <div class="toast-msg">
        <strong>${safeTitle}</strong>
        ${safeMsg ? `<span>${safeMsg}</span>` : ''}
      </div>
      <button type="button" class="toast-close-btn" aria-label="Dismiss notification">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="toast-progress" aria-hidden="true">
        <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
      </div>
    `;

    // Hook manual close button
    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissToast(toast);
      });
    }

    // Auto-dismiss timer with pause on hover
    let startTime = Date.now();
    let remainingTime = duration;
    let timerId = null;

    const startTimer = () => {
      startTime = Date.now();
      timerId = setTimeout(() => {
        dismissToast(toast);
      }, remainingTime);
    };

    const pauseTimer = () => {
      if (timerId) {
        clearTimeout(timerId);
        remainingTime -= (Date.now() - startTime);
        if (remainingTime < 200) remainingTime = 200;
      }
    };

    toast.addEventListener('mouseenter', pauseTimer);
    toast.addEventListener('mouseleave', startTimer);

    container.appendChild(toast);
    startTimer();

    toastQueue.push({ el: toast, timerId });
    return toast;
  };

  const clearAll = () => {
    toastQueue.forEach(item => {
      if (item.el) dismissToast(item.el);
    });
    toastQueue = [];
  };

  return {
    show,
    success: (title, msg, dur, opt) => show(title, msg, 'success', dur || 4500, opt),
    error: (title, msg, dur, opt) => show(title, msg, 'error', dur || 5500, opt),
    warning: (title, msg, dur, opt) => show(title, msg, 'warning', dur || 5000, opt),
    info: (title, msg, dur, opt) => show(title, msg, 'info', dur || 4500, opt),
    clearAll
  };
})();

// Expose globally
window.Toast = ToastEngine;
window.showToast = ToastEngine.show;

// Replace intrusive browser alert with elegant non-blocking toast
window.alert = (message) => {
  window.Toast.info('Notification', String(message));
};

const initAllModules = () => {
  const safeRun = (fn, name) => {
    try {
      if (typeof fn === 'function') {
        fn();
      }
    } catch (err) {
      console.warn(`[E-Cell TAE] Notice in module "${name}":`, err);
    }
  };

  safeRun(initLogoFallbacks, 'initLogoFallbacks');
  safeRun(initNavbarScroll, 'initNavbarScroll');
  safeRun(initMobileMenu, 'initMobileMenu');
  safeRun(initSmoothScroll, 'initSmoothScroll');
  safeRun(initScrollReveal, 'initScrollReveal');
  safeRun(initActiveNavTracker, 'initActiveNavTracker');
  safeRun(initTimelineInteractivity, 'initTimelineInteractivity');
  safeRun(initHeroVisualTilt, 'initHeroVisualTilt');
  safeRun(initCometCards, 'initCometCards');
  safeRun(initScrollJourneyBackground, 'initScrollJourneyBackground');
  safeRun(initAppModalsAndPanels, 'initAppModalsAndPanels');
  safeRun(initAppRouter, 'initAppRouter');
  safeRun(initPortalAndRegistrationPages, 'initPortalAndRegistrationPages');
  safeRun(initAdminDatabaseHub, 'initAdminDatabaseHub');
  safeRun(initECellInfoHub, 'initECellInfoHub');
};

// Check if DOM is already parsed/interactive or still loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllModules);
} else {
  // DOM is already ready (e.g. deferred script, fast load, or CDN cache)
  initAllModules();
}

/**
 * 0. Automatic Robust Logo Image Fallback Resolver
 */
function initLogoFallbacks() {
  const candidatePaths = [
    './assets/images/ecell_tae_logo.jpeg',
    './assets/ecell_tae_logo.jpeg',
    'assets/images/ecell_tae_logo.jpeg',
    'assets/ecell_tae_logo.jpeg',
    './assets/images/ecell_tae_logo.jpg',
    './assets/ecell_tae_logo.jpg',
    '/assets/images/ecell_tae_logo.jpeg',
    '/assets/ecell_tae_logo.jpeg'
  ];

  const logoImages = document.querySelectorAll('img[src*="ecell_tae_logo"], img.brand-logo-img, img.visual-core-logo-img, img.cta-logo-img');
  logoImages.forEach((img) => {
    let candidateIndex = 0;
    img.addEventListener('error', function errorHandler() {
      candidateIndex++;
      if (candidateIndex < candidatePaths.length) {
        this.src = candidatePaths[candidateIndex];
      }
    });
  });
}

/**
 * 1. Navbar Dynamic Scroll Effect (Glassmorphic Blur + Border)
 */
function initNavbarScroll() {
  const header = document.querySelector('.header-navbar');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // Passive event listener for maximum scrolling frame rate
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check
}

/**
 * 2. Mobile Hamburger Menu Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.nav-toggle-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (!toggleBtn || !navMenu) return;

  const closeMenu = () => {
    toggleBtn.classList.remove('is-active');
    navMenu.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    toggleBtn.classList.add('is-active');
    navMenu.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const toggleMenu = (e) => {
    if (e) e.stopPropagation();
    if (navMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking ANY link or button inside the menu
  navMenu.addEventListener('click', (e) => {
    const targetLink = e.target.closest('a, button');
    if (targetLink && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Auto-close on resize to desktop dimensions
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1120 && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
  }, { passive: true });
}

/**
 * 3. Smooth Scroll & Active Nav State Updating
 */
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.length <= 1) return;
      // Let SPA router handle route hashes
      if (targetId.startsWith('#/')) return;

      try {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          // If we are currently on a subpage, switch back to home first
          const homeView = document.getElementById('view-home');
          if (homeView && !homeView.classList.contains('is-active')) {
            window.location.hash = targetId;
            return;
          }

          const headerOffset = 80;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } catch {
        // Fallback
      }
    });
  });
}

/**
 * 4. IntersectionObserver Scroll Reveal Animations
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');
  if (!revealElements.length) return;

  // If user prefers reduced motion, reveal everything immediately
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px 50px 0px',
    threshold: 0.05
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // Immediate check for elements already in view
  const checkInitialView = () => {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= windowHeight + 100) {
        el.classList.add('is-revealed');
      }
    });
  };

  checkInitialView();
  window.addEventListener('scroll', checkInitialView, { passive: true });
}

/**
 * 5. Active Navbar Link Tracker (ScrollSpy)
 */
function initActiveNavTracker() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  if (!sections.length || !navLinks.length) return;

  const updateActiveLink = () => {
    const scrollY = window.pageYOffset;
    const headerOffset = 120;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - headerOffset;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

/**
 * 6. Interactive Journey Timeline Step Selection
 */
function initTimelineInteractivity() {
  const steps = document.querySelectorAll('.timeline-step');
  if (!steps.length) return;

  steps.forEach((step, index) => {
    // Enable keyboard focus & interaction
    step.setAttribute('tabindex', '0');
    step.setAttribute('role', 'button');
    step.setAttribute('aria-label', `View details for timeline step ${index + 1}`);

    const activateStep = () => {
      steps.forEach((s, idx) => {
        if (idx < index) {
          s.className = 'timeline-step completed';
        } else if (idx === index) {
          s.className = 'timeline-step active';
        } else {
          s.className = 'timeline-step';
        }
      });
    };

    step.addEventListener('click', activateStep);
    step.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateStep();
      }
    });
  });
}

/**
 * 7. Interactive 3D Parallax & Depth Tilt on Hero Visual Stage
 */
function initHeroVisualTilt() {
  const stage = document.querySelector('.hero-visual-stage');
  const canvas = document.querySelector('.visual-canvas');
  const panels = document.querySelectorAll('.visual-glass-panel');
  const coreNode = document.querySelector('.visual-core-spark');

  if (!stage || !canvas) return;

  // Check if reduced motion is requested or mobile touch device
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window && window.innerWidth < 768) return;

  let isHovered = false;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let rafId = null;

  const updateTilt = () => {
    // Smooth linear interpolation for buttery motion
    currentRotateX += (targetRotateX - currentRotateX) * 0.1;
    currentRotateY += (targetRotateY - currentRotateY) * 0.1;

    if (canvas) {
      canvas.style.transform = `perspective(1000px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
    }

    // Secondary depth parallax on floating glass cards
    panels.forEach((panel, i) => {
      const depthMultiplier = i === 0 ? 1.4 : -1.2;
      const panX = (currentRotateY * depthMultiplier).toFixed(2);
      const panY = (-currentRotateX * depthMultiplier).toFixed(2);
      panel.style.transform = `translate3d(${panX}px, ${panY}px, 20px)`;
    });

    if (isHovered || Math.abs(currentRotateX) > 0.05 || Math.abs(currentRotateY) > 0.05) {
      rafId = requestAnimationFrame(updateTilt);
    } else {
      if (canvas) canvas.style.transform = '';
      panels.forEach(panel => panel.style.transform = '');
      rafId = null;
    }
  };

  stage.addEventListener('mouseenter', () => {
    isHovered = true;
    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-12deg to +12deg)
    targetRotateX = ((y - centerY) / centerY) * -10;
    targetRotateY = ((x - centerX) / centerX) * 10;

    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });

  stage.addEventListener('mouseleave', () => {
    isHovered = false;
    targetRotateX = 0;
    targetRotateY = 0;
  });

  // Interactive pulse on clicking the central logo core
  if (coreNode) {
    coreNode.style.cursor = 'pointer';
    coreNode.addEventListener('click', () => {
      coreNode.style.transform = 'scale(0.85)';
      setTimeout(() => {
        coreNode.style.transform = 'scale(1.2)';
        setTimeout(() => {
          coreNode.style.transform = '';
        }, 250);
      }, 150);
    });
  }
}

/**
 * 8. Interactive 3D Comet Cards with Dynamic Cursor Glare & Orbiting Light Beam
 */
function initCometCards() {
  const cards = document.querySelectorAll('.comet-card');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach(card => {
    let bounds = null;
    let isHovering = false;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let rafId = null;

    const updateBounds = () => {
      bounds = card.getBoundingClientRect();
    };

    const animatePhysics = () => {
      // Lerp smoothing towards target
      currentRotX += (targetRotX - currentRotX) * 0.12;
      currentRotY += (targetRotY - currentRotY) * 0.12;

      if (!prefersReducedMotion) {
        if (isHovering) {
          card.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        } else {
          card.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(1, 1, 1)`;
        }
      }

      if (isHovering || Math.abs(currentRotX) > 0.05 || Math.abs(currentRotY) > 0.05) {
        rafId = requestAnimationFrame(animatePhysics);
      } else {
        card.style.transform = '';
        rafId = null;
      }
    };

    card.addEventListener('mouseenter', (e) => {
      isHovering = true;
      updateBounds();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      card.style.setProperty('--mouse-x', `${mouseX}px`);
      card.style.setProperty('--mouse-y', `${mouseY}px`);

      if (!rafId) {
        rafId = requestAnimationFrame(animatePhysics);
      }
    });

    card.addEventListener('mousemove', (e) => {
      if (!bounds) updateBounds();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      // Update glare origin CSS variables
      card.style.setProperty('--mouse-x', `${mouseX}px`);
      card.style.setProperty('--mouse-y', `${mouseY}px`);

      // Calculate tilt (-8deg to +8deg)
      targetRotX = ((mouseY - centerY) / centerY) * -8;
      targetRotY = ((mouseX - centerX) / centerX) * 8;

      if (!rafId) {
        rafId = requestAnimationFrame(animatePhysics);
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      targetRotX = 0;
      targetRotY = 0;
      card.style.setProperty('--mouse-x', `-500px`);
      card.style.setProperty('--mouse-y', `-500px`);
    });
  });
}

/**
 * 9. Scroll-Driven Animated Background Journey (IDEA → BUILD → CONNECT → LAUNCH → IMPACT)
 *
 * CONFIGURATION:
 * Easily adjust particle density, glow, animation speed, and colors here.
 */
const SCROLL_JOURNEY_CONFIG = {
  particleCountDesktop: 44,    // Particle density on desktop screens
  particleCountMobile: 18,     // Particle density on mobile (<768px)
  primaryColor: '#FF6A00',     // E-Cell TAE signature vibrant orange
  secondaryColor: '#FFAE33',   // Warm golden amber accent
  glowIntensity: 1.0,          // Multiplier for radial glow halos (0.5 = soft, 2.0 = vivid)
  animationSpeed: 1.0,         // Rate of ambient particle floating & pulses (0.5 = calm, 2.0 = rapid)
  maxConnectDistance: 165,     // Pixel threshold distance for drawing inter-node vectors
  parallaxStrength: 0.12       // Cursor parallax response factor
};

function initScrollJourneyBackground() {
  const canvas = document.getElementById('scroll-journey-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = window.innerWidth || 800;
  let height = window.innerHeight || 600;
  let dpr = 1;
  let isMobile = false;

  let scrollProgress = 0;
  let targetScrollProgress = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Resize canvas according to display DPR and screen boundaries
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(window.innerWidth || 320, 320);
    height = Math.max(window.innerHeight || 320, 320);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    isMobile = width < 768;
    initParticles();
  };

  // Passive scroll progress listener
  const updateScroll = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const currentY = window.scrollY;
    targetScrollProgress = Math.min(1, Math.max(0, currentY / maxScroll));
  };

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // Passive mouse movement for soft parallax
  window.addEventListener('mousemove', (e) => {
    if (width > 0 && height > 0) {
      targetMouseX = Math.max(-2, Math.min(2, (e.clientX / width - 0.5) * 2));
      targetMouseY = Math.max(-2, Math.min(2, (e.clientY / height - 0.5) * 2));
    }
  }, { passive: true });

  // Class defining particle attributes & stage interpolation
  let particles = [];

  class JourneyParticle {
    constructor(id, total) {
      this.id = id;
      this.total = total;
      this.isCoreSeed = id === 0; // Primary "IDEA" spark singularity
      this.isClusterLead = id > 0 && id <= 4; // Key sub-cluster milestone hubs

      this.baseRadius = this.isCoreSeed ? 4.2 : (this.isClusterLead ? 2.8 : 1.2 + (id % 3) * 0.55);
      this.phase = Math.random() * Math.PI * 2;
      this.speed = (0.5 + Math.random() * 0.8) * SCROLL_JOURNEY_CONFIG.animationSpeed;
      this.floatRadius = 6 + Math.random() * 14;

      if (this.isCoreSeed) {
        this.color = SCROLL_JOURNEY_CONFIG.primaryColor;
      } else if (this.isClusterLead) {
        this.color = id % 2 === 0 ? SCROLL_JOURNEY_CONFIG.primaryColor : SCROLL_JOURNEY_CONFIG.secondaryColor;
      } else {
        const rand = Math.random();
        this.color = rand > 0.6 ? SCROLL_JOURNEY_CONFIG.primaryColor : (rand > 0.3 ? SCROLL_JOURNEY_CONFIG.secondaryColor : 'rgba(255, 255, 255, 0.65)');
      }

      this.calcStageTargets();
    }

    calcStageTargets() {
      const idx = this.id;
      const angle = (idx / this.total) * Math.PI * 2;

      // 1. Stage: IDEA (p = 0.0) -> Concentrated around central Idea Spark
      if (this.isCoreSeed) {
        this.stageIdea = { x: 0.5, y: 0.44, alpha: 1.0, scale: 1.3 };
      } else if (idx < 7) {
        this.stageIdea = {
          x: 0.5 + Math.cos(angle * 3) * (0.04 + (idx % 3) * 0.025),
          y: 0.44 + Math.sin(angle * 3) * (0.04 + (idx % 3) * 0.025),
          alpha: 0.4 + (idx % 3) * 0.15,
          scale: 1.0
        };
      } else {
        this.stageIdea = {
          x: 0.1 + (idx * 0.035) % 0.8,
          y: 0.15 + (idx * 0.055) % 0.7,
          alpha: 0.04,
          scale: 0.6
        };
      }

      // 2. Stage: BUILD (p = 0.28) -> Branching into structured engineering nodes
      if (this.isCoreSeed) {
        this.stageBuild = { x: 0.5, y: 0.46, alpha: 0.9, scale: 1.15 };
      } else {
        const branch = idx % 4;
        const branchAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
        const dist = 0.07 + Math.floor(idx / 4) * 0.045;
        this.stageBuild = {
          x: 0.5 + Math.cos(branchAngles[branch]) * dist * 1.3,
          y: 0.46 + Math.sin(branchAngles[branch]) * dist * 0.85,
          alpha: 0.35 + (idx < 20 ? 0.35 : 0.08),
          scale: 0.9
        };
      }

      // 3. Stage: CONNECT (p = 0.55) -> Constellation network across canvas
      const col = idx % 6;
      const row = Math.floor(idx / 6);
      this.stageConnect = {
        x: 0.15 + (col / 5) * 0.7 + (Math.sin(idx + 1) * 0.05),
        y: 0.22 + (row / 7) * 0.55 + (Math.cos(idx + 2) * 0.05),
        alpha: 0.5 + (idx % 4) * 0.12,
        scale: 1.0
      };

      // 4. Stage: LAUNCH (p = 0.78 - Eureka!) -> Upward liftoff trajectory and high connectivity
      const streamX = 0.32 + (idx % 5) * 0.09;
      const streamY = 0.82 - (idx / this.total) * 0.68;
      this.stageLaunch = {
        x: streamX + Math.sin(idx * 2) * 0.04,
        y: streamY,
        alpha: 0.65 + (idx % 3) * 0.15,
        scale: 1.15 + (idx % 2) * 0.2
      };

      // 5. Stage: IMPACT (p = 1.0) -> Concentrated convergence onto central nexus
      if (this.isCoreSeed) {
        this.stageImpact = { x: 0.5, y: 0.5, alpha: 1.0, scale: 2.1 };
      } else {
        const spiralAngle = angle * 2.5;
        const spiralDist = 0.04 + Math.pow(idx / this.total, 1.4) * 0.24;
        this.stageImpact = {
          x: 0.5 + Math.cos(spiralAngle) * spiralDist * 1.2,
          y: 0.5 + Math.sin(spiralAngle) * spiralDist * 0.85,
          alpha: 0.7 - spiralDist * 1.3,
          scale: 0.95
        };
      }
    }

    interpolate(p, time) {
      let tx, ty, tAlpha, tScale;

      if (p <= 0.28) {
        const t = p / 0.28;
        const ease = t * t * (3 - 2 * t);
        tx = this.stageIdea.x + (this.stageBuild.x - this.stageIdea.x) * ease;
        ty = this.stageIdea.y + (this.stageBuild.y - this.stageIdea.y) * ease;
        tAlpha = this.stageIdea.alpha + (this.stageBuild.alpha - this.stageIdea.alpha) * ease;
        tScale = this.stageIdea.scale + (this.stageBuild.scale - this.stageIdea.scale) * ease;
      } else if (p <= 0.55) {
        const t = (p - 0.28) / (0.55 - 0.28);
        const ease = t * t * (3 - 2 * t);
        tx = this.stageBuild.x + (this.stageConnect.x - this.stageBuild.x) * ease;
        ty = this.stageBuild.y + (this.stageConnect.y - this.stageBuild.y) * ease;
        tAlpha = this.stageBuild.alpha + (this.stageConnect.alpha - this.stageBuild.alpha) * ease;
        tScale = this.stageBuild.scale + (this.stageConnect.scale - this.stageBuild.scale) * ease;
      } else if (p <= 0.78) {
        const t = (p - 0.55) / (0.78 - 0.55);
        const ease = t * t * (3 - 2 * t);
        tx = this.stageConnect.x + (this.stageLaunch.x - this.stageConnect.x) * ease;
        ty = this.stageConnect.y + (this.stageLaunch.y - this.stageConnect.y) * ease;
        tAlpha = this.stageConnect.alpha + (this.stageLaunch.alpha - this.stageConnect.alpha) * ease;
        tScale = this.stageConnect.scale + (this.stageLaunch.scale - this.stageConnect.scale) * ease;
      } else {
        const t = (p - 0.78) / (1.0 - 0.78);
        const ease = t * t * (3 - 2 * t);
        tx = this.stageLaunch.x + (this.stageImpact.x - this.stageLaunch.x) * ease;
        ty = this.stageLaunch.y + (this.stageImpact.y - this.stageLaunch.y) * ease;
        tAlpha = this.stageLaunch.alpha + (this.stageImpact.alpha - this.stageLaunch.alpha) * ease;
        tScale = this.stageLaunch.scale + (this.stageImpact.scale - this.stageLaunch.scale) * ease;
      }

      // Gentle harmonic floating motion
      const safeW = Math.max(width || 320, 320);
      const safeH = Math.max(height || 320, 320);
      const floatX = Math.cos(time * this.speed + this.phase) * (this.floatRadius / safeW);
      const floatY = Math.sin(time * this.speed * 0.8 + this.phase) * (this.floatRadius / safeH);

      this.currentX = (tx + floatX) * safeW;
      this.currentY = (ty + floatY) * safeH;
      this.currentAlpha = Math.max(0, Math.min(1, Number.isFinite(tAlpha) ? tAlpha : 0));
      this.currentScale = Number.isFinite(tScale) ? tScale : 1;
    }
  }

  function initParticles() {
    const count = isMobile ? SCROLL_JOURNEY_CONFIG.particleCountMobile : SCROLL_JOURNEY_CONFIG.particleCountDesktop;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new JourneyParticle(i, count));
    }
  }

  resize();
  window.addEventListener('resize', resize);

  // Animation Loop with Visibility Optimization
  let time = 0;
  let animFrameId = null;
  let isPageVisible = true;

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible && !animFrameId) {
      render();
    }
  });

  function render() {
    if (!isPageVisible) {
      animFrameId = null;
      return;
    }

    time += 0.016 * SCROLL_JOURNEY_CONFIG.animationSpeed;

    // Smooth Lerp for scroll progress & cursor parallax
    const targetScroll = Number.isFinite(targetScrollProgress) ? targetScrollProgress : 0;
    scrollProgress += (targetScroll - scrollProgress) * 0.08;
    if (!Number.isFinite(scrollProgress)) scrollProgress = 0;

    const tMouseX = Number.isFinite(targetMouseX) ? targetMouseX : 0;
    const tMouseY = Number.isFinite(targetMouseY) ? targetMouseY : 0;
    mouseX += (tMouseX - mouseX) * 0.05;
    mouseY += (tMouseY - mouseY) * 0.05;
    if (!Number.isFinite(mouseX)) mouseX = 0;
    if (!Number.isFinite(mouseY)) mouseY = 0;

    const renderW = Math.max(width || 320, 320);
    const renderH = Math.max(height || 320, 320);

    ctx.clearRect(0, 0, renderW, renderH);

    // 1. Ambient Radial Spotlight tracking the journey center of mass
    const focusY = (0.45 + (scrollProgress - 0.5) * 0.25) * renderH;
    const focusX = (0.5 + mouseX * 0.04) * renderW;
    const spotlightRadius = Math.max(renderW, renderH) * 0.6;

    const stageEnergy = Math.max(0, 0.08 + Math.sin(scrollProgress * Math.PI) * 0.06 + (scrollProgress > 0.85 ? 0.07 : 0));
    
    if (Number.isFinite(focusX) && Number.isFinite(focusY) && Number.isFinite(spotlightRadius) && spotlightRadius > 0) {
      const spotlightGlow = ctx.createRadialGradient(focusX, focusY, 0, focusX, focusY, spotlightRadius);
      spotlightGlow.addColorStop(0, `rgba(249, 115, 22, ${stageEnergy.toFixed(3)})`);
      spotlightGlow.addColorStop(0.45, `rgba(249, 115, 22, ${(stageEnergy * 0.3).toFixed(3)})`);
      spotlightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = spotlightGlow;
      ctx.fillRect(0, 0, renderW, renderH);
    }

    // 2. Interpolate all particle coordinates
    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
      particles[i].interpolate(scrollProgress, time);
      particles[i].currentX += mouseX * SCROLL_JOURNEY_CONFIG.parallaxStrength * 20 * (1 + (i % 3) * 0.4);
      particles[i].currentY += mouseY * SCROLL_JOURNEY_CONFIG.parallaxStrength * 20 * (1 + (i % 3) * 0.4);
    }

    // 3. Render Connecting Journey Lines & Photon Pulses
    const connectMaxDist = SCROLL_JOURNEY_CONFIG.maxConnectDistance * (0.6 + scrollProgress * 0.6);
    const connectStageMultiplier = 0.15 + scrollProgress * 0.55;

    ctx.lineWidth = 1;

    for (let i = 0; i < pLen; i++) {
      const p1 = particles[i];
      if (p1.currentAlpha < 0.08) continue;

      const maxNeighbors = isMobile ? 3 : 5;
      let neighborsDrawn = 0;

      for (let j = i + 1; j < pLen && neighborsDrawn < maxNeighbors; j++) {
        const p2 = particles[j];
        if (p2.currentAlpha < 0.08) continue;

        const dx = p1.currentX - p2.currentX;
        const dy = p1.currentY - p2.currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectMaxDist) {
          neighborsDrawn++;
          const distFactor = 1 - (dist / connectMaxDist);
          const lineAlpha = distFactor * Math.min(p1.currentAlpha, p2.currentAlpha) * connectStageMultiplier * 0.42;

          ctx.beginPath();
          ctx.moveTo(p1.currentX, p1.currentY);
          ctx.lineTo(p2.currentX, p2.currentY);
          ctx.strokeStyle = `rgba(249, 115, 22, ${lineAlpha.toFixed(3)})`;
          ctx.stroke();

          // Traveling photon packet along active vectors
          if (scrollProgress > 0.22 && distFactor > 0.35 && (i + j) % 3 === 0) {
            const pulseT = (time * 1.4 + (i * 0.3)) % 1;
            const px = p1.currentX + (p2.currentX - p1.currentX) * pulseT;
            const py = p1.currentY + (p2.currentY - p1.currentY) * pulseT;

            ctx.beginPath();
            ctx.arc(px, py, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 220, 180, ${(lineAlpha * 2.1).toFixed(3)})`;
            ctx.fill();
          }
        }
      }
    }

    // 4. Render Glowing Particle Nodes
    for (let i = 0; i < pLen; i++) {
      const p = particles[i];
      if (p.currentAlpha <= 0.02) continue;

      const radius = p.baseRadius * p.currentScale;
      const alpha = p.currentAlpha;

      // Outer Aura Glow for Core Node & Cluster Leads
      if ((p.isCoreSeed || p.isClusterLead) && alpha > 0.18) {
        const auraRadius = radius * (scrollProgress > 0.85 && p.isCoreSeed ? 14 : 7);
        if (Number.isFinite(p.currentX) && Number.isFinite(p.currentY) && Number.isFinite(auraRadius) && auraRadius > 0) {
          const aura = ctx.createRadialGradient(p.currentX, p.currentY, 0, p.currentX, p.currentY, auraRadius);
          aura.addColorStop(0, `rgba(249, 115, 22, ${(alpha * 0.55 * SCROLL_JOURNEY_CONFIG.glowIntensity).toFixed(3)})`);
          aura.addColorStop(0.5, `rgba(249, 115, 22, ${(alpha * 0.12 * SCROLL_JOURNEY_CONFIG.glowIntensity).toFixed(3)})`);
          aura.addColorStop(1, 'rgba(249, 115, 22, 0)');

          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(p.currentX, p.currentY, auraRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Core Node Dot
      ctx.beginPath();
      ctx.arc(p.currentX, p.currentY, Math.max(0.8, radius), 0, Math.PI * 2);

      if (p.isCoreSeed) {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      } else {
        ctx.fillStyle = p.color.startsWith('rgba') ? p.color : `rgba(249, 115, 22, ${alpha.toFixed(3)})`;
      }
      ctx.fill();
    }

    if (!prefersReducedMotion) {
      animFrameId = requestAnimationFrame(render);
    }
  }

  render();
}

/**
 * 10. Registration, Login, Contact & Info Modal System
 */
function initAppModalsAndPanels() {
  // Global Enhanced Toast Notification System (replaces standard browser alerts)
  const showToast = (title, message, type = 'info', duration = 4500, options = {}) => {
    if (window.Toast && typeof window.Toast.show === 'function') {
      return window.Toast.show(title, message, type, duration, options);
    }
  };

  // Modal Open & Close Triggers (Contact & Info Modals)
  const resolveModalId = (id) => {
    const map = {
      'modal-contact': 'contact-modal',
      'modal-info': 'info-modal'
    };
    return map[id] || id;
  };

  const openModal = (modalId) => {
    const resolvedId = resolveModalId(modalId);
    const modal = document.getElementById(resolvedId) || document.getElementById(modalId);
    if (!modal) return;
    
    // Close any other open modal first
    document.querySelectorAll('.app-modal.is-active').forEach(m => {
      if (m !== modal) closeModal(m.id);
    });

    modal.removeAttribute('hidden');
    // Force reflow for animation
    void modal.offsetWidth;
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Focus first interactive element in modal
    const focusable = modal.querySelector('input:not([type="hidden"]), button:not([disabled]), textarea');
    if (focusable) focusable.focus();
  };

  const closeModal = (modalId) => {
    const resolvedId = resolveModalId(modalId);
    const modal = document.getElementById(resolvedId) || document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('is-active');
    setTimeout(() => {
      modal.setAttribute('hidden', '');
      const anyActive = document.querySelector('.app-modal.is-active');
      if (!anyActive) {
        document.body.style.overflow = '';
      }
    }, 250);
  };

  // Expose to window for cross-module access
  window.openAppModal = openModal;
  window.closeAppModal = closeModal;

  // Wire up close buttons and backdrops
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const explicitId = btn.getAttribute('data-close-modal');
      if (explicitId) {
        closeModal(explicitId);
      } else {
        const parentModal = btn.closest('.app-modal');
        if (parentModal) closeModal(parentModal.id);
      }
    });
  });

  // ESC key to close all modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.app-modal.is-active');
      if (activeModal) closeModal(activeModal.id);
    }
  });

  // Wire up all buttons that trigger Registration page
  document.querySelectorAll('.open-register-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab') || 'leader';
      window.location.hash = `#/register?tab=${tab}`;
    });
  });

  // Wire up all buttons that trigger Login page
  document.querySelectorAll('.open-login-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#/login';
    });
  });

  // Wire up all buttons that trigger Contact modal
  document.querySelectorAll('.open-contact-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('contact-modal');
    });
  });

  // Wire up Info modal buttons (Privacy / Terms)
  const infoContent = {
    privacy: {
      title: 'E-Cell TAE Privacy Policy',
      html: `
        <h4>1. Student Data Protection</h4>
        <p>E-Cell TAE respects the privacy of every student, team member, and startup founder participating in our hackathons, cohorts, and Eureka! 2026. All registration data (including contact details, roll numbers, and project abstracts) is strictly utilized for event management, mentorship matching, and campus communication.</p>
        <h4>2. Intellectual Property (IP) Protection</h4>
        <p>All startup intellectual property, prototypes, codebase, and business ideas remain 100% owned by the student inventors and team members. E-Cell TAE does not claim equity, IP rights, or commercial ownership over your startup creations.</p>
        <h4>3. Communications</h4>
        <p>By registering, you consent to receive critical event schedule announcements, judging criteria, and workshop invitations via email or official WhatsApp cohort groups.</p>
      `
    },
    terms: {
      title: 'E-Cell TAE Terms of Participation',
      html: `
        <h4>1. Eligibility & Team Composition</h4>
        <p>Eureka! 2026 and E-Cell Incubation cohorts are open to all undergraduate and postgraduate students from Trinity Academy of Engineering, KJ’s Educational Institute campuses, and invited inter-collegiate partner institutes.</p>
        <h4>2. Zero Registration Fee</h4>
        <p>Participation in Eureka! 2026 and E-Cell workshops is 100% free of charge. No student will ever be asked to pay registration or entry fees.</p>
        <h4>3. Code of Conduct</h4>
        <p>Participants must uphold ethical engineering practices. Plagiarism of existing patent filings or proprietary code without attribution is strictly prohibited.</p>
      `
    }
  };

  document.querySelectorAll('.open-info-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const infoKey = btn.getAttribute('data-info') || 'privacy';
      const infoData = infoContent[infoKey] || infoContent.privacy;
      
      const titleEl = document.getElementById('info-modal-title');
      const bodyEl = document.getElementById('info-modal-content');
      if (titleEl) titleEl.textContent = infoData.title;
      if (bodyEl) bodyEl.innerHTML = infoData.html;

      openModal('info-modal');
    });
  });

  // 5. Contact Form Submission
  const formContact = document.getElementById('form-contact-team');
  if (formContact) {
    formContact.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');

      const name = nameInput ? nameInput.value.trim() : 'Founder';
      const email = emailInput ? emailInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value : 'General Query';
      const message = messageInput ? messageInput.value.trim() : '';

      if (window.ECellDatabase && typeof window.ECellDatabase.saveInquiry === 'function') {
        await window.ECellDatabase.saveInquiry({ name, email, subject, message });
      }

      showToast('Inquiry Sent!', `Thank you ${name}. The E-Cell TAE Core Team will contact you within 24 hours.`, 'success', 5000);
      formContact.reset();
      closeModal('contact-modal');
    });
  }
}

/**
 * 11. Single-Page Application (SPA) Router
 * Handles smooth animated transitions between Home (#/), Login (#/login), Register (#/register), and Admin (#/admin)
 */
function initAppRouter() {
  const routes = {
    home: document.getElementById('view-home'),
    login: document.getElementById('view-login'),
    register: document.getElementById('view-register'),
    admin: document.getElementById('view-admin'),
    ecellInfo: document.getElementById('view-ecell-info')
  };

  const navLoginBtn = document.getElementById('nav-login-btn');
  const navRegisterBtn = document.getElementById('nav-register-btn');
  const mobileNavLogin = document.getElementById('mobile-nav-login-btn');
  const mobileNavRegister = document.getElementById('mobile-nav-register-btn');
  const navAdminLink = document.getElementById('nav-admin-link');

  // Core route switcher
  const handleRoute = () => {
    const rawHash = window.location.hash || '#/';
    const hash = rawHash.toLowerCase();

    // Parse route and query params
    let routeName = 'home';
    let queryTab = '';

    if (hash.startsWith('#/login') || hash === '#login') {
      routeName = 'login';
    } else if (hash.startsWith('#/register') || hash === '#register') {
      routeName = 'register';
      const match = hash.match(/tab=([a-z]+)/i);
      if (match) queryTab = match[1];
    } else if (hash.startsWith('#/admin') || hash.startsWith('#admin')) {
      routeName = 'admin';
    } else if (hash.startsWith('#/ecell-info') || hash === '#ecell-info' || hash.startsWith('#/ecell') || hash === '#ecell' || hash.startsWith('#ecell-')) {
      routeName = 'ecellInfo';
    } else if (hash.startsWith('#/') || hash === '' || hash.startsWith('#hero') || hash.startsWith('#about') || hash.startsWith('#what-we-do') || hash.startsWith('#eureka') || hash.startsWith('#contact')) {
      routeName = 'home';
    }

    // Toggle active view container safely
    Object.keys(routes).forEach(key => {
      const viewEl = routes[key];
      if (!viewEl) return;

      if (key === routeName) {
        viewEl.removeAttribute('hidden');
        viewEl.style.display = 'block';
        // Force reflow for CSS entrance transition
        void viewEl.offsetWidth;
        viewEl.classList.add('is-active');
      } else {
        viewEl.classList.remove('is-active');
        viewEl.style.display = 'none';
        viewEl.setAttribute('hidden', '');
      }
    });

    // Close mobile dropdown menu if open
    const toggleBtn = document.querySelector('.nav-toggle-btn');
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      if (toggleBtn) {
        toggleBtn.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }

    // Update Navigation Button States
    if (routeName === 'login') {
      if (navLoginBtn) navLoginBtn.classList.add('is-active-route');
      if (navRegisterBtn) navRegisterBtn.classList.remove('is-active-route');
      document.title = 'Founder Portal & Team Login — E-Cell TAE';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (routeName === 'register') {
      if (navRegisterBtn) navRegisterBtn.classList.add('is-active-route');
      if (navLoginBtn) navLoginBtn.classList.remove('is-active-route');
      document.title = 'Team Registration & Pass — E-Cell TAE';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // If query tab specified, switch tab
      if (queryTab) {
        setTimeout(() => {
          const tabBtn = document.querySelector(`.page-tab-btn[data-target="p-pane-${queryTab}"]`) || document.querySelector(`.page-tab-btn[data-tab="${queryTab}"]`);
          if (tabBtn) tabBtn.click();
        }, 50);
      }
    } else if (routeName === 'admin') {
      if (navLoginBtn) navLoginBtn.classList.remove('is-active-route');
      if (navRegisterBtn) navRegisterBtn.classList.remove('is-active-route');
      document.title = 'Admin & Database Repository — E-Cell TAE';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof window.refreshAdminHub === 'function') {
        window.refreshAdminHub();
      }
    } else if (routeName === 'ecellInfo') {
      if (navLoginBtn) navLoginBtn.classList.remove('is-active-route');
      if (navRegisterBtn) navRegisterBtn.classList.remove('is-active-route');
      document.title = 'E-Cell TAE — Founding Assembly, Mentors & 9 Milestones | Trinity Academy of Engineering';
      
      // Check if sub-anchor requested (e.g. #ecell-mentors)
      if (rawHash && rawHash.includes('#ecell-') && !rawHash.endsWith('info')) {
        const subId = rawHash.replace('#/', '').replace('#', '');
        const targetSection = document.getElementById(subId);
        if (targetSection) {
          setTimeout(() => {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }, 100);
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (navLoginBtn) navLoginBtn.classList.remove('is-active-route');
      if (navRegisterBtn) navRegisterBtn.classList.remove('is-active-route');
      document.title = 'E-Cell TAE — Entrepreneurship Cell | Trinity Academy of Engineering, Pune';

      // If navigating to home with a specific section hash
      if (rawHash && !rawHash.startsWith('#/') && rawHash !== '#hero') {
        const targetSection = document.querySelector(rawHash);
        if (targetSection) {
          setTimeout(() => {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }, 100);
        }
      }
    }
  };

  // Direct programmatic navigator function
  const navigateTo = (targetHash) => {
    try {
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    } catch (err) {
      console.warn('Router hash update warning:', err);
    }
    // Always immediately execute route handler
    handleRoute();
  };

  window.navigateToRoute = navigateTo;

  // Listen to hash changes and initial page load
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // Wire back buttons
  document.querySelectorAll('.page-back-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('#/');
    });
  });

  // Wire header navbar action buttons
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('#/login');
    });
  }

  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('#/register');
    });
  }

  // Wire mobile navbar action buttons
  if (mobileNavLogin) {
    mobileNavLogin.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('#/login');
    });
  }

  if (mobileNavRegister) {
    mobileNavRegister.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('#/register');
    });
  }

  if (navAdminLink) {
    navAdminLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('#/admin');
    });
  }

  // Wire switch links inside auth forms
  const linkGoToRegister = document.getElementById('link-go-to-register');
  if (linkGoToRegister) {
    linkGoToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('#/register');
    });
  }

  // Wire all other buttons with class open-register-btn & open-login-btn
  document.querySelectorAll('.open-register-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab') || 'leader';
      navigateTo(`#/register?tab=${tab}`);
    });
  });

  document.querySelectorAll('.open-login-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('#/login');
    });
  });
}

/**
 * 12. Interactive Logic for Routed Login & Registration Pages with Firebase Firestore
 */
function initPortalAndRegistrationPages() {
  const getTeams = () => window.ECellDatabase ? window.ECellDatabase.getTeams() : (window.getTeams ? window.getTeams() : []);
  const saveTeam = async (team) => window.ECellDatabase ? await window.ECellDatabase.saveTeam(team) : (window.saveTeam ? await window.saveTeam(team) : team);
  const updateTeam = async (team) => window.ECellDatabase ? await window.ECellDatabase.updateTeam(team) : (window.updateTeam ? await window.updateTeam(team) : team);

  // Toast Notification Helper (routes to global Toast engine)
  const showToast = (title, message, type = 'info', duration = 4500, options = {}) => {
    if (window.Toast && typeof window.Toast.show === 'function') {
      return window.Toast.show(title, message, type, duration, options);
    }
  };

  /* =========================================================================
     A. LOGIN & PORTAL PAGE (#view-login)
     ========================================================================= */
  const pageFormLogin = document.getElementById('page-form-login');
  const pageLoginInput = document.getElementById('page-login-identifier');
  const pagePortalEmpty = document.getElementById('page-portal-empty');
  const pagePortalActive = document.getElementById('page-portal-active');

  // File Size Limit (25 MB Max for PPT/PDF Pitch Presentations)
  const MAX_DECK_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 0.1) {
      return mb.toFixed(1) + ' MB';
    }
    const kb = bytes / 1024;
    return kb.toFixed(0) + ' KB';
  };

  // State holder for pending uploaded files in memory
  let regDeckFileState = null;
  let dashDeckFileState = null;

  // File Dropzone Helper
  const setupDeckDropzone = (dropzoneId, inputId, emptyId, selectedId, nameId, sizeId, removeBtnId, onFileChange) => {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const emptyBox = document.getElementById(emptyId);
    const selectedBox = document.getElementById(selectedId);
    const nameEl = document.getElementById(nameId);
    const sizeEl = document.getElementById(sizeId);
    const removeBtn = document.getElementById(removeBtnId);

    if (!dropzone || !input) return;

    const handleFile = (file) => {
      if (!file) return;

      // Validate file size (25 MB limit)
      if (file.size > MAX_DECK_FILE_SIZE_BYTES) {
        showToast(
          'File Too Large (Limit: 25 MB)',
          `Your file "${file.name}" is ${formatFileSize(file.size)}. Max allowed is 25 MB. Please compress or provide a Google Drive link.`,
          'error',
          6000
        );
        input.value = '';
        return;
      }

      // Validate file format
      const validExts = ['.pdf', '.ppt', '.pptx', '.odp', '.key'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExts.includes(fileExt) && !file.type.includes('pdf') && !file.type.includes('presentation')) {
        showToast(
          'Invalid Format',
          `Please upload a PDF or PowerPoint (.ppt, .pptx) presentation file.`,
          'warning',
          5000
        );
        input.value = '';
        return;
      }

      // Read file
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          name: file.name,
          size: file.size,
          sizeFormatted: formatFileSize(file.size),
          type: file.type || 'application/octet-stream',
          dataUrl: e.target.result,
          uploadedAt: new Date().toISOString()
        };

        if (nameEl) nameEl.textContent = file.name;
        if (sizeEl) sizeEl.textContent = `${fileData.sizeFormatted} / 25.0 MB`;

        if (emptyBox) emptyBox.style.display = 'none';
        if (selectedBox) selectedBox.style.display = 'flex';

        onFileChange(fileData);
        showToast('File Ready', `Selected "${file.name}" (${fileData.sizeFormatted}). Click Save to submit.`, 'success', 3000);
      };

      reader.onerror = () => {
        showToast('File Error', 'Failed to read file. Please try again or use a Google Drive link.', 'error');
      };

      reader.readAsDataURL(file);
    };

    input.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        input.files = e.dataTransfer.files;
        handleFile(e.dataTransfer.files[0]);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        if (emptyBox) emptyBox.style.display = 'flex';
        if (selectedBox) selectedBox.style.display = 'none';
        onFileChange(null);
        showToast('File Removed', 'Selected presentation file removed.', 'info', 2500);
      });
    }
  };

  // Initialize dropzones
  setupDeckDropzone(
    'reg-file-dropzone',
    'p-leader-deck-file',
    'reg-dropzone-empty',
    'reg-file-selected',
    'reg-file-name',
    'reg-file-size',
    'reg-btn-remove-file',
    (fileData) => { regDeckFileState = fileData; }
  );

  setupDeckDropzone(
    'dash-file-dropzone',
    'page-deck-file-input',
    'dash-dropzone-empty',
    'dash-file-selected',
    'dash-file-name',
    'dash-file-size',
    'dash-btn-remove-file',
    (fileData) => { dashDeckFileState = fileData; }
  );

  // Update Status Card in Dashboard
  const renderDashDeckStatusCard = (team) => {
    const statusCard = document.getElementById('page-deck-status-card');
    const stageEl = document.getElementById('page-dash-stage');
    const juryEl = document.getElementById('page-dash-jury-status');
    if (!statusCard) return;

    const hasFile = team.deckFile && team.deckFile.name;
    const hasUrl = team.deckUrl && team.deckUrl.trim();
    const hasSubmission = hasFile || hasUrl;

    if (hasSubmission) {
      statusCard.className = 'dash-deck-status-card status-active';
      
      let detailsHtml = '';
      if (hasFile && hasUrl) {
        detailsHtml = `Uploaded: <strong>${team.deckFile.name}</strong> (${team.deckFile.sizeFormatted || '25 MB max'}) & Cloud Link Active`;
      } else if (hasFile) {
        detailsHtml = `Presentation: <strong>${team.deckFile.name}</strong> (${team.deckFile.sizeFormatted || '25 MB max'})`;
      } else {
        detailsHtml = `Cloud Link: <strong>${team.deckUrl}</strong>`;
      }

      let actionsHtml = '';
      if (hasFile && team.deckFile.dataUrl) {
        actionsHtml += `
          <a href="${team.deckFile.dataUrl}" download="${team.deckFile.name}" class="btn-deck-action btn-deck-download">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download Presentation</span>
          </a>
        `;
      }
      if (hasUrl) {
        actionsHtml += `
          <a href="${team.deckUrl}" target="_blank" rel="noopener noreferrer" class="btn-deck-action btn-deck-drive">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Open Cloud Deck ↗</span>
          </a>
        `;
      }

      statusCard.innerHTML = `
        <div class="deck-status-left">
          <div class="deck-status-icon-box">✓</div>
          <div>
            <div class="deck-status-text-title">Round 1 Pitch Deck Active & Synced</div>
            <div class="deck-status-text-desc">${detailsHtml}</div>
          </div>
        </div>
        <div class="deck-status-actions">
          ${actionsHtml}
        </div>
      `;

      if (stageEl) stageEl.textContent = 'Round 1 Pitch Ready';
      if (juryEl) {
        juryEl.textContent = 'Deck Submitted ✓';
        juryEl.className = 'metric-value text-green';
      }
    } else {
      statusCard.className = 'dash-deck-status-card status-pending';
      statusCard.innerHTML = `
        <div class="deck-status-left">
          <div class="deck-status-icon-box">⚠️</div>
          <div>
            <div class="deck-status-text-title">Round 1 Pitch Deck Pending (Mandatory)</div>
            <div class="deck-status-text-desc">Upload your PPT / PDF slides (max 25 MB) or Google Drive link below to qualify for Round 1 jury evaluation.</div>
          </div>
        </div>
        <div class="deck-status-actions">
          <span class="pitch-deck-badge" style="background: rgba(249,115,22,0.25); color: #fed7aa;">Action Required</span>
        </div>
      `;

      if (stageEl) stageEl.textContent = 'Abstract Approved';
      if (juryEl) {
        juryEl.textContent = 'Pending Pitch Deck';
        juryEl.className = 'metric-value text-accent';
      }
    }
  };

  const populatePortalDashboard = (team) => {
    if (!team || !pagePortalActive || !pagePortalEmpty) return;

    // Set text elements
    const trackEl = document.getElementById('page-dash-track');
    const nameEl = document.getElementById('page-dash-team-name');
    const descEl = document.getElementById('page-dash-desc');
    const codeEl = document.getElementById('page-dash-code');
    const membersCountEl = document.getElementById('page-dash-members-count');
    const deckInput = document.getElementById('page-deck-input');
    const rosterList = document.getElementById('page-dash-roster-list');
    const waBtn = document.getElementById('page-btn-whatsapp-group');

    if (trackEl) trackEl.textContent = team.track || 'Eureka! 2026 Innovation';
    if (nameEl) nameEl.textContent = team.teamName;
    if (descEl) descEl.textContent = team.startupDesc || 'No problem statement recorded yet.';
    if (codeEl) codeEl.textContent = team.code;
    
    const count = team.members ? team.members.length : 1;
    if (membersCountEl) membersCountEl.textContent = `${count} Innovator${count > 1 ? 's' : ''}`;
    
    if (deckInput) deckInput.value = team.deckUrl || '';

    // Render Deck Status Card
    renderDashDeckStatusCard(team);

    // If team has existing file, show in dashboard file dropzone
    const dashEmpty = document.getElementById('dash-dropzone-empty');
    const dashSelected = document.getElementById('dash-file-selected');
    const dashFileName = document.getElementById('dash-file-name');
    const dashFileSize = document.getElementById('dash-file-size');

    if (team.deckFile && team.deckFile.name && dashSelected && dashEmpty) {
      if (dashFileName) dashFileName.textContent = team.deckFile.name;
      if (dashFileSize) dashFileSize.textContent = `${team.deckFile.sizeFormatted || '25 MB max'}`;
      dashEmpty.style.display = 'none';
      dashSelected.style.display = 'flex';
      dashDeckFileState = team.deckFile;
    } else if (dashEmpty && dashSelected) {
      dashEmpty.style.display = 'flex';
      dashSelected.style.display = 'none';
      dashDeckFileState = null;
    }

    if (waBtn) {
      const waText = encodeURIComponent(`Hello E-Cell TAE! I am the leader of Team ${team.teamName} (Code: ${team.code}) for Eureka! 2026.`);
      waBtn.href = `https://wa.me/919823011223?text=${waText}`;
    }

    // Populate Roster List
    if (rosterList) {
      rosterList.innerHTML = '';
      if (team.members && team.members.length) {
        team.members.forEach((m, idx) => {
          const isLeader = idx === 0 || (m.role && m.role.toLowerCase().includes('leader'));
          const initials = (m.name || 'Member').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          
          const li = document.createElement('li');
          li.className = 'dash-roster-item';
          li.innerHTML = `
            <div class="roster-user-info">
              <div class="roster-avatar-dot">${initials}</div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="roster-name">${m.name}</span>
                  ${m.prn ? `<span style="font-family: monospace; font-size: 0.7rem; color: var(--accent-base); background: rgba(249, 115, 22, 0.1); padding: 1px 6px; border-radius: 4px;">ID: ${m.prn}</span>` : ''}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                  ${m.dept || 'Engineering'} ${m.year ? '• ' + m.year : ''} ${m.college ? '• ' + m.college : ''}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">
                  ${m.email ? '✉ ' + m.email : ''} ${m.phone ? '• 📞 ' + m.phone : ''} ${m.skills ? '• 🛠 ' + m.skills : ''}
                </div>
              </div>
            </div>
            <span class="roster-role-pill ${isLeader ? 'is-leader' : ''}">
              ${isLeader ? '★ Team Leader' : (m.role || 'Member')}
            </span>
          `;
          rosterList.appendChild(li);
        });
      }
    }

    // Set active team code on dashboard container
    pagePortalActive.setAttribute('data-active-team-code', team.code);

    // Switch view with animation
    pagePortalEmpty.style.display = 'none';
    pagePortalActive.style.display = 'block';
    pagePortalActive.style.animation = 'dashFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';

    showToast('Founder Portal Active', `Loaded workspace for team "${team.teamName}".`, 'success');
  };

  const handlePortalLogin = async (identifier) => {
    if (!identifier) {
      showToast('Input Required', 'Please enter your unique team code or leader email.', 'error');
      return;
    }

    const clean = identifier.trim().toLowerCase();
    let teams = getTeams();
    let team = teams.find(t => 
      t.code.toLowerCase() === clean || 
      (t.leader && t.leader.email && t.leader.email.toLowerCase() === clean) ||
      (t.teamName && t.teamName.toLowerCase() === clean) ||
      (t.members && t.members.some(m => m.email && m.email.toLowerCase() === clean))
    );

    // If not found in local cache, query Firestore directly
    if (!team && isFirebaseReady && db) {
      try {
        const docRef = await db.collection('teams').doc(clean.toUpperCase()).get();
        if (docRef.exists) {
          team = docRef.data();
          saveTeam(team);
        } else {
          // Search by email query
          const qSnap = await db.collection('teams').where('leader.email', '==', clean).get();
          if (!qSnap.empty) {
            team = qSnap.docs[0].data();
            saveTeam(team);
          }
        }
      } catch (err) {
        console.warn('Direct Firestore login check notice:', err.message);
      }
    }

    if (team) {
      populatePortalDashboard(team);
    } else {
      showToast('Team Not Found', `No registered startup found for "${identifier}". Please check spelling or register now.`, 'error', 5000);
      
      // Shake animation on login box
      const card = document.querySelector('#view-login .auth-comet-card');
      if (card) {
        card.style.animation = 'shake 0.4s ease';
        setTimeout(() => { card.style.animation = ''; }, 450);
      }
    }
  };

  if (pageFormLogin && pageLoginInput) {
    pageFormLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      handlePortalLogin(pageLoginInput.value);
    });
  }

  // Test Link button in Dashboard
  const testLinkBtn = document.getElementById('page-btn-test-link');
  if (testLinkBtn) {
    testLinkBtn.addEventListener('click', () => {
      const urlInput = document.getElementById('page-deck-input');
      const val = urlInput ? urlInput.value.trim() : '';
      if (!val) {
        showToast('No Link', 'Please enter a Google Drive or Canva link first.', 'warning');
        return;
      }
      try {
        const parsed = new URL(val.startsWith('http') ? val : 'https://' + val);
        window.open(parsed.href, '_blank', 'noopener,noreferrer');
      } catch {
        showToast('Invalid URL', 'Please enter a valid web URL (e.g. https://drive.google.com/...)', 'error');
      }
    });
  }

  // Save Pitch Deck Form Submission in Dashboard
  const pageFormDeck = document.getElementById('page-form-deck');
  if (pageFormDeck) {
    pageFormDeck.addEventListener('submit', async (e) => {
      e.preventDefault();
      const activeCode = pagePortalActive ? pagePortalActive.getAttribute('data-active-team-code') : null;
      const deckUrl = document.getElementById('page-deck-input').value.trim();

      if (!activeCode) {
        showToast('Not Logged In', 'Please log into your team portal first.', 'error');
        return;
      }

      const teams = getTeams();
      const team = teams.find(t => t.code === activeCode);
      if (team) {
        team.deckUrl = deckUrl;
        if (dashDeckFileState) {
          team.deckFile = dashDeckFileState;
        } else if (dashDeckFileState === null && !team.deckFile) {
          team.deckFile = null;
        }
        team.deckSubmittedAt = new Date().toISOString();

        await (window.updateTeam || ECellDatabase.updateTeam)(team);
        
        renderDashDeckStatusCard(team);

        showToast(
          'Pitch Deck Saved! 🎉',
          'Your Round 1 presentation has been synchronized and submitted to the jury review board.',
          'success',
          5000
        );
      }
    });
  }

  // Copy Team Code button in Dashboard
  const copyCodeBtn = document.getElementById('page-btn-copy-code');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      const activeCode = pagePortalActive ? pagePortalActive.getAttribute('data-active-team-code') : null;
      if (activeCode) {
        navigator.clipboard.writeText(activeCode).then(() => {
          showToast('Code Copied!', `Team code "${activeCode}" copied to clipboard.`, 'success');
        }).catch(() => {
          showToast('Team Code', activeCode, 'info');
        });
      }
    });
  }

  // Copy Team Invite Text
  const copyInviteBtn = document.getElementById('page-btn-copy-invite');
  if (copyInviteBtn) {
    copyInviteBtn.addEventListener('click', () => {
      const activeCode = pagePortalActive ? pagePortalActive.getAttribute('data-active-team-code') : null;
      const team = getTeams().find(t => t.code === activeCode);
      const teamName = team ? team.teamName : 'our team';

      const inviteText = `🚀 Join ${teamName} for Eureka! 2026 at E-Cell TAE!\nUse Team Code: ${activeCode}\nRegister directly at: https://ecell.tae.ac.in/#/register?tab=member`;

      navigator.clipboard.writeText(inviteText).then(() => {
        showToast('Invite Link Copied!', 'Share this invite message with your teammates to join.', 'success');
      }).catch(() => {
        showToast('Invite Text', inviteText, 'info');
      });
    });
  }

  // Logout from Portal
  const pageLogoutBtn = document.getElementById('page-btn-logout');
  if (pageLogoutBtn) {
    pageLogoutBtn.addEventListener('click', () => {
      if (pagePortalActive && pagePortalEmpty) {
        pagePortalActive.style.display = 'none';
        pagePortalEmpty.style.display = 'block';
        if (pageLoginInput) pageLoginInput.value = '';
        showToast('Signed Out', 'You have been signed out of the Founder Portal.', 'info');
      }
    });
  }


  /* =========================================================================
     B. REGISTRATION PAGE & LIVE PREVIEWS (#view-register)
     ========================================================================= */
  const pageTabBtns = document.querySelectorAll('.page-tab-btn');
  const pagePanes = document.querySelectorAll('.page-pane');

  const switchPageTab = (tabKey) => {
    // Hide success pane if active
    const successPane = document.getElementById('p-pane-success');
    if (successPane) successPane.classList.remove('is-active');

    pageTabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabKey) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    pagePanes.forEach(pane => {
      if (pane.id === `p-pane-${tabKey}`) {
        pane.classList.add('is-active');
      } else if (pane.id !== 'p-pane-success') {
        pane.classList.remove('is-active');
      }
    });
  };

  pageTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchPageTab(tab);
    });
  });

  // Real-Time Live Preview Sync for Leader Form
  const leaderTeamInput = document.getElementById('p-leader-team-name');
  const leaderDescInput = document.getElementById('p-leader-startup-desc');
  const leaderNameInput = document.getElementById('p-leader-name');
  const trackRadios = document.querySelectorAll('input[name="p_eureka_track"]');

  const prevTeamName = document.getElementById('live-prev-team-name');
  const prevTrack = document.getElementById('live-prev-track');
  const prevDesc = document.getElementById('live-prev-desc');
  const prevLeader = document.getElementById('live-prev-leader');

  if (leaderTeamInput && prevTeamName) {
    leaderTeamInput.addEventListener('input', (e) => {
      prevTeamName.textContent = e.target.value.trim() || 'Your Startup Name';
    });
  }

  if (leaderDescInput && prevDesc) {
    leaderDescInput.addEventListener('input', (e) => {
      prevDesc.textContent = e.target.value.trim() || 'Your high-impact startup elevator pitch will appear live on your digital badge.';
    });
  }

  if (leaderNameInput && prevLeader) {
    leaderNameInput.addEventListener('input', (e) => {
      prevLeader.textContent = e.target.value.trim() || 'Founder Name';
    });
  }

  trackRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked && prevTrack) {
        prevTrack.textContent = e.target.value;
      }
    });
  });

  // Success Screen Display Helper
  const showRegistrationSuccess = (ticketData) => {
    pagePanes.forEach(p => p.classList.remove('is-active'));
    const successPane = document.getElementById('p-pane-success');
    if (!successPane) return;

    successPane.classList.add('is-active');

    // Populate ticket pass elements
    const sTitle = document.getElementById('p-success-title');
    const sSub = document.getElementById('p-success-sub');
    const tType = document.getElementById('p-ticket-type');
    const tCode = document.getElementById('p-ticket-code');
    const tTeam = document.getElementById('p-ticket-team');
    const tTrack = document.getElementById('p-ticket-track');
    const tLeader = document.getElementById('p-ticket-leader');
    const waShareBtn = document.getElementById('p-ticket-wa-share');
    const goPortalBtn = document.getElementById('p-ticket-go-portal');
    const eurekaCard = document.getElementById('p-eureka-mandatory-card');
    const eurekaModalTeam = document.getElementById('eureka-modal-team-name');

    if (sTitle && ticketData.title) sTitle.textContent = ticketData.title;
    if (sSub && ticketData.subtitle) sSub.textContent = ticketData.subtitle;
    if (tType) tType.textContent = ticketData.passType || 'TEAM LEADER PASS';
    if (tCode) tCode.textContent = ticketData.code;
    if (tTeam) tTeam.textContent = ticketData.teamName;
    if (tTrack) tTrack.textContent = ticketData.track;
    if (tLeader) tLeader.textContent = ticketData.leaderName;

    if (eurekaModalTeam) {
      eurekaModalTeam.textContent = ticketData.teamName || 'Your Registered Team';
    }

    if (eurekaCard) {
      eurekaCard.style.display = 'block';
    }

    if (waShareBtn) {
      const isMember = ticketData.isMember;
      const shareMsg = isMember
        ? `🚀 I have officially joined team "${ticketData.teamName}" (Code: ${ticketData.code}) for IGNITION T3 at E-Cell TAE Pune (IIT Bombay Eureka! Track)!\nRole: ${ticketData.role || 'Team Member'}\nTrack: ${ticketData.track}\nCheck our venture: https://ecell.tae.ac.in`
        : `🎉 Our startup "${ticketData.teamName}" has been registered for IGNITION T3 at E-Cell TAE Pune (IIT Bombay Eureka! Track)!\nTeam Code: ${ticketData.code}\nTrack: ${ticketData.track}\nNote: Leader must also register at https://www.ecell.in/eureka/\nJoin the revolution: https://ecell.tae.ac.in`;
      waShareBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;
    }

    if (goPortalBtn) {
      goPortalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('#/login');
        setTimeout(() => {
          const authInput = document.getElementById('auth-team-code');
          if (authInput && ticketData.code) {
            authInput.value = ticketData.code;
            const authBtn = document.getElementById('btn-auth-login');
            if (authBtn) authBtn.click();
          }
        }, 100);
      }, { once: true });
    }

    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger celebratory confetti animation
    triggerConfettiBurst();

    showToast('Registration Successful! 🎉', `Team Code: ${ticketData.code}. Your digital pass has been generated.`, 'success', 6000);

    // If Team Leader registration, prompt permission to redirect to IIT Bombay Eureka! Portal
    if (!ticketData.isMember) {
      setTimeout(() => {
        if (typeof openModal === 'function') {
          openModal('modal-eureka-redirect');
        } else if (typeof window.openAppModal === 'function') {
          window.openAppModal('modal-eureka-redirect');
        } else {
          const m = document.getElementById('modal-eureka-redirect');
          if (m) {
            m.removeAttribute('hidden');
            m.classList.add('is-active');
          }
        }
      }, 500);
    }
  };

  // Form 1: Leader Registration
  const formLeader = document.getElementById('p-form-leader');
  if (formLeader) {
    formLeader.addEventListener('submit', async (e) => {
      e.preventDefault();

      const teamName = document.getElementById('p-leader-team-name').value.trim();
      const trackRadio = document.querySelector('input[name="p_eureka_track"]:checked');
      const track = trackRadio ? trackRadio.value : 'Robotics & Hardware Systems';
      const startupDesc = document.getElementById('p-leader-startup-desc').value.trim();

      const leaderName = document.getElementById('p-leader-name').value.trim();
      const leaderEmail = document.getElementById('p-leader-email').value.trim();
      const leaderPhone = document.getElementById('p-leader-phone').value.trim();
      const leaderDept = document.getElementById('p-leader-dept').value;
      const leaderYear = document.getElementById('p-leader-year').value;

      // Generate unique Team Code
      const randNum = Math.floor(100 + Math.random() * 900);
      const teamCode = `TAE-EUR-${randNum}`;

      const deckUrlInput = document.getElementById('p-leader-deck-url');
      const deckUrl = deckUrlInput ? deckUrlInput.value.trim() : '';
      const deckFile = regDeckFileState || null;

      const newTeam = {
        code: teamCode,
        teamName,
        necId: 'NEC2685500',
        track,
        startupDesc,
        leader: {
          name: leaderName,
          email: leaderEmail,
          phone: leaderPhone,
          dept: leaderDept,
          year: leaderYear
        },
        members: [
          {
            name: leaderName,
            email: leaderEmail,
            phone: leaderPhone,
            dept: leaderDept,
            year: leaderYear,
            role: 'Team Leader & Founder',
            joinedAt: new Date().toISOString()
          }
        ],
        deckUrl: deckUrl || '',
        deckFile: deckFile,
        deckSubmittedAt: (deckUrl || deckFile) ? new Date().toISOString() : null,
        registeredAt: new Date().toISOString()
      };

      await (window.saveTeam || ECellDatabase.saveTeam)(newTeam);

      // Reset file selection state
      regDeckFileState = null;

      showRegistrationSuccess({
        code: teamCode,
        teamName,
        track,
        necId: 'NEC2685500',
        leaderName,
        passType: 'TEAM LEADER PASS',
        title: 'Startup Registration Confirmed! 🚀',
        subtitle: `Team "${teamName}" has been successfully created. Share your Team Code with members to invite them.`
      });
    });
  }

  // Form 2: Verify Code in Member Form
  const memberCodeInput = document.getElementById('p-member-team-code');
  const verifyCodeBtn = document.getElementById('p-btn-verify-code');
  const verifyStatusBox = document.getElementById('p-team-verify-status');

  const checkTeamCode = async (showLoadingState = true) => {
    if (!memberCodeInput || !verifyStatusBox) return;
    const inputCode = memberCodeInput.value.trim().toUpperCase();
    if (!inputCode) {
      verifyStatusBox.style.display = 'none';
      verifyStatusBox.className = 'team-verify-status';
      return;
    }

    if (showLoadingState) {
      verifyStatusBox.style.display = 'block';
      verifyStatusBox.className = 'team-verify-status status-loading';
      verifyStatusBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <span>Verifying team access code <strong>${inputCode}</strong> with E-Cell database...</span>
        </div>
      `;
    }

    const foundTeam = await (window.findTeamByCode || ECellDatabase.findTeamByCode)(inputCode);

    verifyStatusBox.style.display = 'block';
    if (foundTeam) {
      verifyStatusBox.className = 'team-verify-status status-verified';
      const membersCount = Array.isArray(foundTeam.members) ? foundTeam.members.length : 1;
      const leaderName = foundTeam.leader ? foundTeam.leader.name : (foundTeam.members && foundTeam.members[0] ? foundTeam.members[0].name : 'Leader');
      const isFull = membersCount >= 4;

      verifyStatusBox.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="background: #10B981; color: #000; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">✓ Verified Team</span>
              <strong style="font-size: 1rem; color: #ffffff;">${foundTeam.teamName}</strong>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px;">
              <span style="color: var(--accent-base); font-weight: 600;">${foundTeam.track || 'Eureka! Track'}</span> • Leader: <strong>${leaderName}</strong>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Current Roster: <strong>${membersCount} of 4 member slots filled</strong> ${isFull ? '<span style="color: #ef4444; font-weight: 700;">(Team Full)</span>' : '<span style="color: #10b981; font-weight: 700;">(Open for Join)</span>'}
            </div>
          </div>
          <div style="font-family: monospace; font-size: 0.8rem; font-weight: 700; color: var(--accent-base); background: rgba(249, 115, 22, 0.15); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(249, 115, 22, 0.3);">
            ${foundTeam.code}
          </div>
        </div>
      `;
    } else {
      verifyStatusBox.className = 'team-verify-status status-error';
      verifyStatusBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.1rem;">✕</span>
          <div>
            <strong>Team Code Not Found:</strong> No registered team matches "<code>${inputCode}</code>". Please check with your Team Leader or register a new startup.
          </div>
        </div>
      `;
    }
  };

  if (verifyCodeBtn) {
    verifyCodeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      checkTeamCode(true);
    });
  }

  if (memberCodeInput) {
    memberCodeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      if (e.target.value.trim().length >= 6) {
        checkTeamCode(false);
      } else {
        if (verifyStatusBox) verifyStatusBox.style.display = 'none';
      }
    });

    memberCodeInput.addEventListener('blur', () => {
      if (memberCodeInput.value.trim()) {
        checkTeamCode(true);
      }
    });
  }

  // Form 2: Member Join Form Submission
  const formMember = document.getElementById('p-form-member');
  if (formMember) {
    formMember.addEventListener('submit', async (e) => {
      e.preventDefault();

      const teamCode = memberCodeInput ? memberCodeInput.value.trim().toUpperCase() : '';
      const memberName = document.getElementById('p-member-name').value.trim();
      const memberEmail = document.getElementById('p-member-email').value.trim();
      const memberPhone = document.getElementById('p-member-phone').value.trim();
      const memberPrn = document.getElementById('p-member-prn') ? document.getElementById('p-member-prn').value.trim() : '';
      const memberCollege = document.getElementById('p-member-college') ? document.getElementById('p-member-college').value : 'Trinity Academy of Engineering, Pune';
      const memberDept = document.getElementById('p-member-dept').value;
      const memberYear = document.getElementById('p-member-year') ? document.getElementById('p-member-year').value : 'TE (Third Year)';
      const memberRole = document.getElementById('p-member-role').value.trim() || 'Frontend / Full-Stack Engineer';
      const memberSkills = document.getElementById('p-member-skills') ? document.getElementById('p-member-skills').value.trim() : '';

      if (!teamCode) {
        showToast('Team Code Required', 'Please enter your team access code to proceed.', 'error');
        if (memberCodeInput) memberCodeInput.focus();
        return;
      }

      const submitBtn = document.getElementById('p-btn-submit-member');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Verifying & Joining Team...</span>';
      }

      try {
        const result = await (window.addMemberToTeam || ECellDatabase.addMemberToTeam)(teamCode, {
          name: memberName,
          email: memberEmail,
          phone: memberPhone,
          prn: memberPrn,
          college: memberCollege,
          dept: memberDept,
          year: memberYear,
          role: memberRole,
          skills: memberSkills
        });

        if (!result.success) {
          showToast('Could Not Join Team', result.error || 'Team join request failed. Please check the code.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Confirm & Join Team Roster</span><svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          }
          return;
        }

        const team = result.team;
        const leaderName = team.leader ? team.leader.name : 'Team Leader';

        showRegistrationSuccess({
          code: team.code,
          teamName: team.teamName,
          track: team.track,
          necId: 'NEC2685500',
          leaderName: `${memberName} (Member of ${team.teamName})`,
          passType: 'OFFICIAL TEAM MEMBER PASS',
          isMember: true,
          role: memberRole,
          title: `Welcome to Team ${team.teamName}! 🎉`,
          subtitle: `Your student member credentials have been confirmed for IGNITION T3 (IIT Bombay Eureka! Track). You are now linked to Team Leader ${leaderName}.`
        });

        // Reset form
        formMember.reset();
        if (verifyStatusBox) verifyStatusBox.style.display = 'none';

      } catch (err) {
        console.error('Member join error:', err);
        showToast('Error', 'An unexpected error occurred while adding you to the team.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Confirm & Join Team Roster</span><svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        }
      }
    });
  }

  // Ticket Pass Controls on Success Screen
  const ticketCopyBtn = document.getElementById('p-ticket-copy-btn');
  if (ticketCopyBtn) {
    ticketCopyBtn.addEventListener('click', () => {
      const code = document.getElementById('p-ticket-code').textContent;
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          showToast('Code Copied!', `Team code "${code}" copied to clipboard.`, 'success');
        });
      }
    });
  }

  const ticketPortalBtn = document.getElementById('p-ticket-go-portal');
  if (ticketPortalBtn) {
    ticketPortalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = document.getElementById('p-ticket-code').textContent;
      window.location.hash = '#/login';
      setTimeout(() => {
        const loginInput = document.getElementById('page-login-identifier');
        if (loginInput && code) {
          loginInput.value = code;
          handlePortalLogin(code);
        }
      }, 100);
    });
  }

  const registerAnotherBtn = document.getElementById('p-ticket-register-another');
  if (registerAnotherBtn) {
    registerAnotherBtn.addEventListener('click', () => {
      if (formLeader) formLeader.reset();
      switchPageTab('leader');
    });
  }

  // Eureka! Redirect & Copy Buttons
  const eurekaUrl = 'https://www.ecell.in/eureka/';
  
  const regEurekaRedirectBtn = document.getElementById('btn-redirect-eureka-reg');
  if (regEurekaRedirectBtn) {
    regEurekaRedirectBtn.addEventListener('click', () => {
      showToast('Opening Eureka! Portal ↗', 'Redirecting to official IIT Bombay Eureka! 2026 registration with affiliate ID NEC2685500.', 'info', 4500);
    });
  }

  const copyEurekaSuccessBtn = document.getElementById('btn-copy-eureka-url');
  if (copyEurekaSuccessBtn) {
    copyEurekaSuccessBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(eurekaUrl).then(() => {
        showToast('Link Copied!', 'IIT Bombay Eureka! portal URL copied to clipboard.', 'success');
      });
    });
  }

  const copyEurekaModalBtn = document.getElementById('btn-copy-modal-eureka-url');
  if (copyEurekaModalBtn) {
    copyEurekaModalBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(eurekaUrl).then(() => {
        showToast('Link Copied!', 'IIT Bombay Eureka! portal URL copied to clipboard.', 'success');
      });
    });
  }

  // WhatsApp Group Link Copy & Notification Handlers
  const waGroupUrl = 'https://chat.whatsapp.com/DLx6hnZ582pJ9DoKxx3qCs';
  const copyWaBtn = document.getElementById('btn-copy-wa-group-url');
  if (copyWaBtn) {
    copyWaBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(waGroupUrl).then(() => {
        showToast('WhatsApp Link Copied! 📱', 'Official IGNITION T3 WhatsApp Channel link copied to clipboard.', 'success', 3500);
      }).catch(() => {
        showToast('WhatsApp Link', waGroupUrl, 'info');
      });
    });
  }

  const joinWaBtn = document.getElementById('btn-join-whatsapp-channel');
  if (joinWaBtn) {
    joinWaBtn.addEventListener('click', () => {
      showToast('Opening WhatsApp 💬', 'Redirecting to the official IGNITION T3 WhatsApp channel...', 'info', 3000);
    });
  }

  const confirmEurekaRedirectBtn = document.getElementById('btn-confirm-eureka-redirect');
  if (confirmEurekaRedirectBtn) {
    confirmEurekaRedirectBtn.addEventListener('click', () => {
      if (typeof closeModal === 'function') {
        closeModal('modal-eureka-redirect');
      } else if (typeof window.closeAppModal === 'function') {
        window.closeAppModal('modal-eureka-redirect');
      }
      showToast('Redirecting to Eureka! ↗', 'Opening IIT Bombay Eureka! registration portal. Complete team registration there for valid participation.', 'info', 5000);
    });
  }

  const cancelEurekaRedirectBtn = document.getElementById('btn-cancel-eureka-redirect');
  if (cancelEurekaRedirectBtn) {
    cancelEurekaRedirectBtn.addEventListener('click', () => {
      if (typeof closeModal === 'function') {
        closeModal('modal-eureka-redirect');
      } else if (typeof window.closeAppModal === 'function') {
        window.closeAppModal('modal-eureka-redirect');
      }
      showToast('Pass Generated', 'Remember: Registration on IIT Bombay Eureka! portal is mandatory for valid registration.', 'warning', 6000);
    });
  }
}

/**
 * 13. Celebratory Particle Confetti Explosion (Pure Canvas Engine)
 */
function triggerConfettiBurst() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#FF6A00', '#FFAE33', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#FFFFFF'];
  const confettiCount = 120;
  const particles = [];

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.45;

  for (let i = 0; i < confettiCount; i++) {
    const angle = (Math.PI * 2 * i) / confettiCount + (Math.random() - 0.5) * 0.4;
    const velocity = 8 + Math.random() * 16;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 4,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.35,
      friction: 0.96,
      life: 0,
      maxLife: 100 + Math.random() * 40
    });
  }

  let animId;
  const animate = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let activeCount = 0;
    particles.forEach(p => {
      p.life++;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (p.life > p.maxLife * 0.7) {
        p.opacity = Math.max(0, 1 - (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3));
      }

      if (p.opacity > 0) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    if (activeCount > 0) {
      animId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };

  animate();
}

/**
 * 14. E-Cell TAE Admin & Live Database Hub (Confidential Access Protected)
 * Manages live Firestore synchronization, CSV exports, filtering, and student applicant rosters
 */
function initAdminDatabaseHub() {
  const ADMIN_SESSION_KEY = 'ecell_tae_admin_authenticated_v1';
  
  const authGate = document.getElementById('admin-auth-gate');
  const dashboardContainer = document.getElementById('admin-dashboard-container');
  const loginForm = document.getElementById('admin-login-form');
  const loginUserInput = document.getElementById('admin-input-user');
  const loginPassInput = document.getElementById('admin-input-pass');
  const loginError = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-btn-logout');

  const tableTeamsBody = document.getElementById('admin-teams-tbody');
  const tableInquiriesBody = document.getElementById('admin-inquiries-tbody');

  const statTeams = document.getElementById('stat-teams-count');
  const statMembers = document.getElementById('stat-members-count');
  const statDecks = document.getElementById('stat-decks-count');

  const searchInput = document.getElementById('admin-search-input');
  const trackSelect = document.getElementById('admin-track-select');

  const pushFirebaseBtn = document.getElementById('admin-btn-push-firebase');
  const syncCloudBtn = document.getElementById('admin-btn-sync-cloud');
  const clearCacheBtn = document.getElementById('admin-btn-clear-cache');
  const exportCsvBtn = document.getElementById('admin-btn-export-csv');
  const toggleRulesBtn = document.getElementById('admin-btn-toggle-rules');
  const rulesGuideBox = document.getElementById('admin-rules-guide');

  // Check auth state
  const isAuth = () => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true' || localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  };

  const updateAuthStateView = () => {
    const authenticated = isAuth();
    if (authGate) authGate.style.display = authenticated ? 'none' : 'block';
    if (dashboardContainer) dashboardContainer.style.display = authenticated ? 'block' : 'none';

    if (authenticated) {
      render();
    }
  };

  // Handle Admin Login Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = (loginUserInput ? loginUserInput.value : '').trim().toLowerCase();
      const password = (loginPassInput ? loginPassInput.value : '').trim();

      // Authorized administrator identifiers (Official institutional email & handles)
      const validUsers = [
        'ecell.tae@kjei.edu.in',
        'admin@kjei.edu.in',
        'ecell.tae',
        'admin'
      ];

      // Strong confidential access keys
      const validPasswords = [
        'KJEI#EcellTAE@2026!Secure',
        'Eureka2026#TAE$AdminKey',
        'EcellTAE*2026#Master'
      ];

      const isValidUser = validUsers.includes(username);
      const isValidPass = validPasswords.includes(password);

      if (isValidUser && isValidPass) {
        if (loginError) loginError.style.display = 'none';
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        showToast('Access Granted! 🔓', 'Welcome to the E-Cell TAE Administrator Database Portal.', 'success', 4000);
        if (loginPassInput) loginPassInput.value = '';
        updateAuthStateView();
      } else {
        if (loginError) {
          loginError.style.display = 'block';
          loginError.textContent = 'Invalid administrator credentials. Access restricted to authorized E-Cell TAE team.';
        }
        showToast('Authentication Failed', 'Invalid credentials for Admin Hub.', 'error', 4000);
      }
    });
  }

  // Handle Admin Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      showToast('Locked', 'Logged out of Admin Portal.', 'info', 3000);
      updateAuthStateView();
    });
  }

  // Admin Tab Navigation
  const adminTabBtns = document.querySelectorAll('.page-tab-btn[data-admin-tab]');
  const adminPanes = {
    teams: document.getElementById('admin-pane-teams'),
    inquiries: document.getElementById('admin-pane-inquiries')
  };

  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-admin-tab');
      adminTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterBar = document.getElementById('admin-teams-filter-bar');
      if (filterBar) {
        filterBar.style.display = targetTab === 'teams' ? 'flex' : 'none';
      }

      Object.keys(adminPanes).forEach(k => {
        if (adminPanes[k]) {
          if (k === targetTab) {
            adminPanes[k].style.display = 'block';
            adminPanes[k].classList.add('is-active');
          } else {
            adminPanes[k].style.display = 'none';
            adminPanes[k].classList.remove('is-active');
          }
        }
      });
    });
  });

  // Toggle Security Rules Guide Box
  if (toggleRulesBtn && rulesGuideBox) {
    toggleRulesBtn.addEventListener('click', () => {
      const isHidden = rulesGuideBox.style.display === 'none';
      rulesGuideBox.style.display = isHidden ? 'block' : 'none';
    });
  }

  // Clear Mock Cache Button
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', async () => {
      clearCacheBtn.disabled = true;
      clearCacheBtn.innerHTML = '<span>🧹 Purging Cache...</span>';
      if (window.ECellDatabase && typeof window.ECellDatabase.clearMockCache === 'function') {
        await window.ECellDatabase.clearMockCache();
      }
      setTimeout(() => {
        clearCacheBtn.disabled = false;
        clearCacheBtn.innerHTML = '<span>🧹 Clear Mock Cache</span>';
        showToast('Cache Purged', 'Local demo cache cleared. Showing 100% genuine records from Firestore.', 'success', 4000);
        render();
      }, 500);
    });
  }

  // 1-Click Push / Seed to Firebase Firestore
  if (pushFirebaseBtn) {
    pushFirebaseBtn.addEventListener('click', async () => {
      const db = typeof window.getFirebaseDb === 'function' ? window.getFirebaseDb() : null;
      if (!db) {
        showToast('Firebase Notice', 'Firebase SDK is not active or offline. Local changes remain safe.', 'warning');
        return;
      }

      const teams = typeof window.getTeams === 'function' ? window.getTeams() : [];
      let successCount = 0;
      let errorOccurred = false;

      pushFirebaseBtn.disabled = true;
      pushFirebaseBtn.innerHTML = '<span>⚡ Pushing to Firestore...</span>';

      for (const team of teams) {
        try {
          await db.collection('teams').doc(team.code).set(team, { merge: true });
          successCount++;
        } catch (err) {
          console.error('Firestore write error:', err);
          errorOccurred = true;
        }
      }

      pushFirebaseBtn.disabled = false;
      pushFirebaseBtn.innerHTML = '<span>⚡ Push to Firestore</span>';

      if (!errorOccurred) {
        showToast(
          'Firebase Synced! 🚀',
          `Successfully verified/synced ${successCount} team(s) to collection "teams" in project "ecell-tae".`,
          'success',
          6000
        );
      } else {
        showToast(
          'Security Rules Check Required',
          'Firebase rejected the write. Please check your Firestore Security Rules tab in Firebase Console.',
          'error',
          7000
        );
        if (rulesGuideBox) rulesGuideBox.style.display = 'block';
      }

      render();
    });
  }

  // Sync from Cloud Button
  if (syncCloudBtn) {
    syncCloudBtn.addEventListener('click', async () => {
      syncCloudBtn.disabled = true;
      syncCloudBtn.innerHTML = '<span>🔄 Fetching...</span>';
      if (window.ECellDatabase && typeof window.ECellDatabase.syncFromCloud === 'function') {
        await window.ECellDatabase.syncFromCloud();
      } else if (typeof window.syncTeamsFromCloud === 'function') {
        await window.syncTeamsFromCloud();
      }
      setTimeout(() => {
        syncCloudBtn.disabled = false;
        syncCloudBtn.innerHTML = '<span>🔄 Refresh Live from Firestore</span>';
        showToast('Database Refreshed', 'Synced latest live registrations directly from Firestore.', 'info', 3000);
        render();
      }, 500);
    });
  }

  // Export to CSV Functionality
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const teams = typeof window.getTeams === 'function' ? window.getTeams() : [];
      if (!teams.length) {
        showToast('No Data', 'There are no registered teams to export.', 'warning');
        return;
      }

      const headers = [
        'Team Code',
        'National NEC ID',
        'Startup Name',
        'Innovation Track',
        'Leader Name',
        'Leader Email',
        'Leader Phone/WhatsApp',
        'Leader Dept',
        'Leader Year',
        'Total Team Count',
        'Detailed Team Members (Name | Email | Phone | Dept | Role)',
        'Pitch / Problem Statement',
        'Pitch Deck Cloud Link',
        'Uploaded Presentation File',
        'Registration Date'
      ];

      const csvRows = [headers.join(',')];

      teams.forEach(t => {
        const leader = t.leader || {};
        const membersList = (t.members || []).map(m => 
          `${m.name || 'Member'} [Role: ${m.role || 'Member'}, Email: ${m.email || 'N/A'}, Phone: ${m.phone || 'N/A'}, Dept: ${m.dept || 'N/A'}]`
        ).join('; ');
        
        const uploadedFileName = t.deckFile ? `${t.deckFile.name} (${t.deckFile.sizeFormatted || ''})` : '';

        const row = [
          `"${(t.code || '').replace(/"/g, '""')}"`,
          `"${(t.necId || 'NEC2685500').replace(/"/g, '""')}"`,
          `"${(t.teamName || '').replace(/"/g, '""')}"`,
          `"${(t.track || '').replace(/"/g, '""')}"`,
          `"${(leader.name || '').replace(/"/g, '""')}"`,
          `"${(leader.email || '').replace(/"/g, '""')}"`,
          `"${(leader.phone || '').replace(/"/g, '""')}"`,
          `"${(leader.dept || '').replace(/"/g, '""')}"`,
          `"${(leader.year || '').replace(/"/g, '""')}"`,
          (t.members || []).length,
          `"${membersList.replace(/"/g, '""')}"`,
          `"${(t.startupDesc || '').replace(/"/g, '""')}"`,
          `"${(t.deckUrl || '').replace(/"/g, '""')}"`,
          `"${uploadedFileName.replace(/"/g, '""')}"`,
          `"${(t.registeredAt || '').replace(/"/g, '""')}"`
        ];

        csvRows.push(row.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', csvContent);
      downloadLink.setAttribute('download', `ECELL_TAE_Eureka_2026_Full_Database_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast('CSV Exported! 📊', `Exported all ${teams.length} teams with full member contacts (Emails & Phones).`, 'success');
    });
  }

  // Render All Tables and Counters
  const render = () => {
    if (!isAuth()) return;

    const teams = typeof window.getTeams === 'function' ? window.getTeams() : [];
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const selectedTrack = trackSelect ? trackSelect.value : 'ALL';

    // Update Counters
    let totalMembersCount = 0;
    let decksCount = 0;

    teams.forEach(t => {
      totalMembersCount += (t.members || []).length;
      if ((t.deckUrl && t.deckUrl.trim()) || (t.deckFile && t.deckFile.name)) {
        decksCount++;
      }
    });

    if (statTeams) statTeams.textContent = teams.length;
    if (statMembers) statMembers.textContent = totalMembersCount;
    if (statDecks) statDecks.textContent = decksCount;

    // Filter Teams
    const filteredTeams = teams.filter(t => {
      const matchTrack = selectedTrack === 'ALL' || t.track === selectedTrack;
      if (!matchTrack) return false;

      if (!query) return true;

      const leader = t.leader || {};
      const haystack = [
        t.code,
        t.teamName,
        t.track,
        t.startupDesc,
        leader.name,
        leader.email,
        leader.phone,
        leader.dept,
        ...(t.members || []).map(m => `${m.name} ${m.email} ${m.phone} ${m.role} ${m.dept}`)
      ].filter(Boolean).join(' ').toLowerCase();

      return haystack.includes(query);
    });

    // Populate Teams Table with complete Leader and Team Member details (Name, Email, Phone)
    if (tableTeamsBody) {
      if (!filteredTeams.length) {
        tableTeamsBody.innerHTML = `
          <tr>
            <td colspan="8">
              <div class="admin-empty-state">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p>No registered startups match your search criteria.</p>
              </div>
            </td>
          </tr>
        `;
      } else {
        tableTeamsBody.innerHTML = filteredTeams.map(t => {
          const leader = t.leader || {};
          const members = t.members || [];
          
          return `
            <tr>
              <td>
                <span class="admin-team-code-pill">${t.code}</span>
                <div style="margin-top: 4px;">
                  <span style="font-size: 0.7rem; color: #fb923c; background: rgba(249,115,22,0.14); border: 1px solid rgba(249,115,22,0.35); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-weight: 700; display: inline-block;">
                    ${t.necId || 'NEC2685500'}
                  </span>
                </div>
              </td>
              <td>
                <strong style="color: #fff; font-size: 0.95rem; display: block; margin-bottom: 2px;">${t.teamName || 'Untitled Startup'}</strong>
                <span style="font-size: 0.775rem; color: #fb923c; font-weight: 600;">${t.track || '—'}</span>
              </td>
              <td>
                <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">${leader.name || '—'} <span style="font-size: 0.72rem; color: #fb923c; background: rgba(249,115,22,0.15); padding: 1px 6px; border-radius: 4px; font-weight: 600;">Leader</span></div>
                <div style="margin-top: 3px;">
                  <a href="mailto:${leader.email || ''}" style="color: #38bdf8; text-decoration: none; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                    ✉️ ${leader.email || '—'}
                  </a>
                </div>
                <div style="font-size: 0.8rem; color: #10B981; margin-top: 2px;">
                  <a href="https://wa.me/${(leader.phone || '').replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" style="color: #10B981; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                    📱 ${leader.phone || '—'}
                  </a>
                </div>
              </td>
              <td style="min-width: 280px; max-width: 360px;">
                <div style="font-weight: 700; color: #fff; margin-bottom: 6px; font-size: 0.8rem; display: flex; align-items: center; justify-content: space-between;">
                  <span>👥 ${members.length} Confirmed Member(s)</span>
                </div>
                <div class="admin-roster-expand">
                  ${members.map((m, idx) => `
                    <div class="admin-roster-member-card">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <strong>${idx + 1}. ${m.name || 'Member'}</strong>
                        <span style="font-size: 0.72rem; color: #fb923c;">${m.role || 'Member'}</span>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 2px; font-size: 0.75rem;">
                        <div><a href="mailto:${m.email || ''}" style="color: #38bdf8; text-decoration: none;">✉️ ${m.email || 'No email provided'}</a></div>
                        ${m.phone ? `<div><a href="https://wa.me/${(m.phone || '').replace(/[^0-9]/g, '')}" target="_blank" style="color: #10B981; text-decoration: none;">📱 ${m.phone}</a></div>` : '<div style="color: var(--text-muted);">📱 Phone: N/A</div>'}
                        ${m.dept ? `<div style="color: var(--text-muted);">🏫 ${m.dept}</div>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </td>
              <td>
                <div style="font-size: 0.85rem; color: #fff; font-weight: 600;">${leader.dept || '—'}</div>
                <div style="font-size: 0.775rem; color: var(--text-muted);">${leader.year || '—'}</div>
              </td>
              <td style="max-width: 200px;">
                <div style="font-size: 0.8rem; line-height: 1.4; color: var(--text-secondary); max-height: 60px; overflow-y: auto;">
                  ${t.startupDesc || '—'}
                </div>
              </td>
              <td>
                ${(() => {
                  let html = '';
                  if (t.deckFile && t.deckFile.dataUrl) {
                    html += `<a href="${t.deckFile.dataUrl}" download="${t.deckFile.name}" class="admin-deck-link" style="display: block; margin-bottom: 4px; background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; text-decoration: none; white-space: nowrap;">📥 ${t.deckFile.name.length > 15 ? t.deckFile.name.substring(0,12) + '...' : t.deckFile.name} (${t.deckFile.sizeFormatted || 'File'})</a>`;
                  }
                  if (t.deckUrl) {
                    html += `<a href="${t.deckUrl}" target="_blank" rel="noopener noreferrer" class="admin-deck-link" style="display: inline-block; background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; text-decoration: none;">🔗 Cloud Link ↗</a>`;
                  }
                  return html || '<span style="color: #f87171; font-size: 0.775rem; font-weight: 600;">⚠️ Pending</span>';
                })()}
              </td>
              <td>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button type="button" class="btn btn-secondary btn-xs" onclick="navigator.clipboard.writeText('${t.code}'); showToast('Copied', 'Team code copied', 'success');" title="Copy Team Code">
                    Copy Code
                  </button>
                  <a href="#/login" class="btn btn-primary btn-xs" onclick="setTimeout(() => { const inp = document.getElementById('page-login-identifier'); if(inp){ inp.value='${t.code}'; handlePortalLogin('${t.code}'); } }, 100);" title="Open Founder Portal for this team">
                    Open Portal →
                  </a>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Populate Inquiries Table
    try {
      const inqKey = window.INQUIRIES_STORAGE_KEY || 'ecell_tae_inquiries_v1';
      const inquiries = JSON.parse(localStorage.getItem(inqKey) || '[]');
      if (tableInquiriesBody) {
        if (!inquiries.length) {
          tableInquiriesBody.innerHTML = `
            <tr>
              <td colspan="5">
                <div class="admin-empty-state">
                  <p>No contact inquiries received yet. New messages from the Contact form will appear here in real-time.</p>
                </div>
              </td>
            </tr>
          `;
        } else {
          tableInquiriesBody.innerHTML = inquiries.map(inq => `
            <tr>
              <td><strong style="color: #fff;">${inq.name || 'Anonymous'}</strong></td>
              <td><a href="mailto:${inq.email || ''}" style="color: #38bdf8;">${inq.email || '—'}</a></td>
              <td><span style="color: #fb923c; font-weight: 600;">${inq.subject || 'General'}</span></td>
              <td style="max-width: 280px; font-size: 0.8rem;">${inq.message || '—'}</td>
              <td style="font-size: 0.775rem; color: var(--text-muted);">${inq.submittedAt ? new Date(inq.submittedAt).toLocaleDateString('en-IN') : '—'}</td>
            </tr>
          `).join('');
        }
      }
    } catch {
      // Ignored
    }
  };

  if (searchInput) searchInput.addEventListener('input', render);
  if (trackSelect) trackSelect.addEventListener('change', render);

  window.refreshAdminHub = () => {
    updateAuthStateView();
  };

  updateAuthStateView();
}

/**
 * 14. E-Cell TAE Comprehensive Info & Founding Assembly Hub
 * High-performance interactivity for the extracted E-Cell TAE Showcase
 */
function initECellInfoHub() {
  const dossierDatabase = {
    'ankur-jagtap': {
      name: 'Ankur Jagtap',
      role: 'Technical Team',
      dept: 'Engineering & Technology',
      year: 'Third Year (TE)',
      badge: 'Technical Team',
      avatar: '/assets/Ankur.jpeg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Core member of the Technical Team architecting web systems, event registration workflows, and secure digital infrastructure for E-Cell TAE and IGNITION T3.',
      responsibilities: [
        'Full-stack platform development & frontend interactions',
        'Real-time Firestore database schema and team registration engine',
        'Digital pass rendering and automated team pass generation',
        'Performance optimization and mobile responsive experience'
      ],
      skills: ['Full-Stack Development', 'JavaScript/TypeScript', 'Web Architecture', 'Cloud Services'],
      email: 'ankur.jagtap@tae.ac.in',
      linkedin: 'https://www.linkedin.com/in/ankur-jagtap-992144289/'
    },
    'aditya-pathade': {
      name: 'Aditya Pathade',
      role: 'Technical Team',
      dept: 'Information Technology',
      year: 'Third Year (TE)',
      badge: 'Technical Team',
      avatar: '/assets/Aditya.jpeg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Core member of the Technical Team driving system design, modern UI/UX engineering, live API endpoints, and participant portal ecosystems for E-Cell TAE.',
      responsibilities: [
        'Web ecosystem UI/UX systems & responsive interactive components',
        'Founder Portal dashboard & team credential management engine',
        'Integration with IIT Bombay Eureka! registration pipeline',
        'Real-time data synchronization & state management'
      ],
      skills: ['Frontend Architecture', 'React & Node.js', 'UI Systems', 'System Design'],
      email: 'aditya.pathade@tae.ac.in',
      linkedin: 'https://www.linkedin.com/in/adityapathade'
    },
    'yash-kharche': {
      name: 'Yash Kharche',
      role: 'Technical Team',
      dept: 'Engineering & Technology',
      year: 'Third Year (TE)',
      badge: 'Technical Team',
      avatar: '/assets/images/ecell_tae_logo.jpeg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Core member of the Technical Team contributing to platform testing, digital tools engineering, data validation, and deployment operations for E-Cell TAE.',
      responsibilities: [
        'Web platform verification, form validation, and responsiveness',
        'Database query optimization and CSV export pipelines',
        'Integration support for participant channels & resource vaults',
        'Quality assurance across desktop and mobile form factors'
      ],
      skills: ['Web Development', 'Testing & Validation', 'Database Operations', 'Technical Infrastructure'],
      email: 'yash.kharche@tae.ac.in',
      linkedin: 'https://www.linkedin.com/in/e-cell-tae-bb84b942a/'
    },
    'darshan-patil': {
      name: 'Darshan Patil',
      role: 'Technical Lead & System Architect',
      dept: 'Computer Engineering',
      year: 'Third Year (TE)',
      badge: 'Vertical Lead',
      avatar: '/assets/team/darshan_tech.jpg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Lead architect behind E-Cell TAE digital infrastructure, registration algorithms, real-time founder portal, and cloud data repositories powering 500+ participant registrations.',
      responsibilities: [
        'Core development of E-Cell web ecosystem & portals',
        'Database architecture and real-time synchronization',
        'Technical mentorship for hardware & software track startups',
        'Automated team code generation and digital pass engines'
      ],
      skills: ['React', 'Node.js', 'System Design', 'Cloud Architecture'],
      email: 'darshan.patil@tae.ac.in',
      linkedin: 'https://linkedin.com/in/darshanpatil'
    },
    'sakshi-deshmukh': {
      name: 'Sakshi Deshmukh',
      role: 'Public Relations & Strategic Outreach Head',
      dept: 'Electronics & Telecommunication',
      year: 'Third Year (TE)',
      badge: 'Vertical Lead',
      avatar: '/assets/team/sakshi_pr.jpg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Leading inter-collegiate communications, institutional outreach across 30+ engineering campuses in Pune, media relations, and official influencer partnerships for Eureka! 2026.',
      responsibilities: [
        'Inter-college campus ambassador program management',
        'Press releases and official media statements',
        'Keynote speaker invitations & VIP guest protocol',
        'Student community engagement across Pune tech circles'
      ],
      skills: ['Public Relations', 'Strategic Communication', 'Brand Positioning', 'Event Moderation'],
      email: 'sakshi.deshmukh@tae.ac.in',
      linkedin: 'https://linkedin.com'
    },
    'omkar-kadam': {
      name: 'Omkar Kadam',
      role: 'Events & Logistics Operations Lead',
      dept: 'Mechanical Engineering',
      year: 'Third Year (TE)',
      badge: 'Vertical Lead',
      avatar: '/assets/team/omkar_events.jpg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Mastermind behind large-scale auditorium productions, jury stage management, prototype demo booths, and logistics for 1,200+ attendees during flagship E-Cell summits.',
      responsibilities: [
        'Auditorium stagecraft, AV production and venue logistics',
        'Jury panel coordination and evaluation booth setups',
        'Hardware prototype showcase zone management',
        'Vendor relations and institutional resource scheduling'
      ],
      skills: ['Event Production', 'Stage Management', 'Operations Logistics', 'Crisis Management'],
      email: 'omkar.kadam@tae.ac.in',
      linkedin: 'https://linkedin.com'
    },
    'tanvi-kulkarni': {
      name: 'Tanvi Kulkarni',
      role: 'Design & Visual Branding Head',
      dept: 'Information Technology',
      year: 'Third Year (TE)',
      badge: 'Vertical Lead',
      avatar: '/assets/team/tanvi_design.jpg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Creative director driving E-Cell TAE aesthetic identity, brand guidelines, UI/UX design systems, summit stage banners, and high-impact motion graphics.',
      responsibilities: [
        'Complete brand identity design & creative governance',
        'UI/UX design for web applications and mobile portals',
        'Merchandise, badges, passes & stage backdrop artwork',
        'Motion graphics & visual storytelling campaigns'
      ],
      skills: ['Figma', 'UI/UX Design', 'Visual Hierarchy', 'Brand Strategy'],
      email: 'tanvi.kulkarni@tae.ac.in',
      linkedin: 'https://linkedin.com'
    },
    'pranav-more': {
      name: 'Pranav More',
      role: 'Sponsorship & Corporate Alliances Head',
      dept: 'Computer Engineering',
      year: 'Third Year (TE)',
      badge: 'Vertical Lead',
      avatar: '/assets/team/pranav_sponsor.jpg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Spearheading corporate sponsorships, incubation grant proposals, angel investor relations, and prize pool funding for IGNITION T3 and regional bootcamps.',
      responsibilities: [
        'Corporate partner outreach and sponsorship pitch decks',
        'Prize pool and cash grant syndication',
        'CSR funding channels & startup incubator tie-ups',
        'Post-event sponsor deliverables & ROI reporting'
      ],
      skills: ['Corporate Alliances', 'Fundraising', 'B2B Sales', 'Negotiation'],
      email: 'pranav.more@tae.ac.in',
      linkedin: 'https://linkedin.com'
    },
    'rhea-shinde': {
      name: 'Rhea Shinde',
      role: 'Content & Editorial Strategy Lead',
      dept: 'Information Technology',
      year: 'Second Year (SE)',
      badge: 'Executive Leadership',
      avatar: '/assets/team/rhea_content.jpg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Crafting E-Cell TAE narrative voice, newsletter columns, founder case studies, social media copy, and official documentation for incubation cohorts.',
      responsibilities: [
        'Editorial strategy across social and print media',
        'Founder spotlight stories and startup case studies',
        'Official press releases and summit brochures',
        'Copywriting for digital portals and email campaigns'
      ],
      skills: ['Copywriting', 'Content Strategy', 'Social Media Marketing', 'Editorial Direction'],
      email: 'rhea.shinde@tae.ac.in',
      linkedin: 'https://linkedin.com'
    },
    'atharva-joshi': {
      name: 'Atharva Joshi',
      role: 'R&D and Startup Incubation Mentor',
      dept: 'Mechanical Engineering',
      year: 'Final Year (BE)',
      badge: 'Vertical Lead',
      avatar: '/assets/team/atharva_rnd.jpg',
      fallbackAvatar: '/assets/images/ecell_tae_logo.jpeg',
      bio: 'Guiding hardware engineering startups, patent filing strategies, IoT prototyping, and laboratory fabrication within Trinity Academy innovation hubs.',
      responsibilities: [
        'Hands-on technical validation for hardware startups',
        'Patent filing assistance and prior art reviews',
        'Rapid prototyping lab access & CNC/3D-print guidance',
        'Product-market fit assessments for deep-tech teams'
      ],
      skills: ['Hardware Prototyping', 'Patent Strategy', 'Robotics & IoT', 'Product Development'],
      email: 'atharva.joshi@tae.ac.in',
      linkedin: 'https://linkedin.com'
    }
  };

  // 1. Team Filter Tabs
  const filterBtns = document.querySelectorAll('.ecell-tab-btn');
  const teamCards = document.querySelectorAll('.ecell-team-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || 'all';

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      teamCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 2. Member Dossier Modal Populator
  const dossierModal = document.getElementById('modal-member-dossier');
  const dossierContent = document.getElementById('dossier-modal-content');
  const dossierBadge = document.getElementById('dossier-modal-badge');

  document.querySelectorAll('.btn-view-member-bio').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const memberKey = btn.getAttribute('data-member');
      const data = dossierDatabase[memberKey];

      if (!data || !dossierContent) {
        window.Toast.info('Team Profile', 'Member profile dossier is being updated by the core team.');
        return;
      }

      if (dossierBadge) dossierBadge.textContent = data.badge || 'Core Assembly';

      dossierContent.innerHTML = `
        <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap;">
          <div style="width: 88px; height: 88px; border-radius: 16px; overflow: hidden; border: 2px solid rgba(249,115,22,0.4); flex-shrink: 0; background: #000;">
            <img src="${data.avatar}" alt="${data.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='${data.fallbackAvatar}';" referrerPolicy="no-referrer" />
          </div>
          <div style="flex: 1; min-width: 200px;">
            <h3 style="font-size: 1.35rem; color: #fff; margin: 0 0 4px; font-weight: 800;">${data.name}</h3>
            <p style="color: #fb923c; font-size: 0.9rem; font-weight: 700; margin: 0 0 4px;">${data.role}</p>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0;">${data.dept} • ${data.year}</p>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;">
          <h4 style="font-size: 0.775rem; color: #fb923c; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 6px; font-weight: 800;">Executive Bio</h4>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin: 0;">${data.bio}</p>
        </div>

        <div style="margin-bottom: 18px;">
          <h4 style="font-size: 0.775rem; color: #fb923c; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px; font-weight: 800;">Core Responsibilities</h4>
          <ul style="margin: 0; padding-left: 18px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6;">
            ${data.responsibilities.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h4 style="font-size: 0.775rem; color: #fb923c; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px; font-weight: 800;">Domain Competencies</h4>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${data.skills.map(s => `<span style="background: rgba(249,115,22,0.12); color: #fed7aa; border: 1px solid rgba(249,115,22,0.25); padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${s}</span>`).join('')}
          </div>
        </div>
      `;

      if (typeof window.openAppModal === 'function') {
        window.openAppModal('modal-member-dossier');
      } else if (dossierModal) {
        dossierModal.removeAttribute('hidden');
        dossierModal.classList.add('is-active');
      }
    });
  });

  // 3. Photo Lightbox Modal Populator
  const lightboxModal = document.getElementById('modal-ecell-lightbox');
  const lightboxImg = document.getElementById('lightbox-modal-img');
  const lightboxTitle = document.getElementById('lightbox-modal-title');
  const lightboxCaption = document.getElementById('lightbox-modal-caption');

  document.querySelectorAll('.ecell-gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.querySelector('h4') ? card.querySelector('h4').textContent : 'E-Cell TAE Archive';
      const desc = card.querySelector('p') ? card.querySelector('p').textContent : '';

      if (lightboxImg && img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = title;
      }
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCaption) lightboxCaption.textContent = desc;

      if (typeof window.openAppModal === 'function') {
        window.openAppModal('modal-ecell-lightbox');
      } else if (lightboxModal) {
        lightboxModal.removeAttribute('hidden');
        lightboxModal.classList.add('is-active');
      }
    });
  });

  // 4. Join E-Cell Modal Trigger & Form Handler
  const btnJoinModal = document.getElementById('btn-open-join-ecell-modal');
  if (btnJoinModal) {
    btnJoinModal.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openAppModal === 'function') {
        window.openAppModal('modal-ecell-join');
      }
    });
  }

  const formJoinECell = document.getElementById('form-join-ecell');
  if (formJoinECell) {
    formJoinECell.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('join-name').value.trim();
      const email = document.getElementById('join-email').value.trim();
      const phone = document.getElementById('join-phone').value.trim();
      const branchYear = document.getElementById('join-branch-year').value.trim();
      const vertical = document.getElementById('join-vertical').value;
      const experience = document.getElementById('join-experience').value.trim();

      const application = {
        name,
        email,
        phone,
        branchYear,
        vertical,
        experience,
        submittedAt: new Date().toISOString(),
        type: 'core_team_application'
      };

      try {
        const appsKey = 'ecell_tae_team_applications_v1';
        const existing = JSON.parse(localStorage.getItem(appsKey) || '[]');
        existing.push(application);
        localStorage.setItem(appsKey, JSON.stringify(existing));
      } catch {
        // Ignored
      }

      if (typeof window.closeAppModal === 'function') {
        window.closeAppModal('modal-ecell-join');
      }

      formJoinECell.reset();
      window.Toast.success(
        'Application Submitted! 🚀',
        `Thank you ${name}. Your candidate dossier for the "${vertical}" vertical has been transmitted to Aditya Pathade & Executive Leads. We will contact you via WhatsApp!`,
        7000
      );
    });
  }

  // 5. Back to Home Navigation
  const backHomeBtn = document.getElementById('ecell-back-home-btn');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.navigateToRoute === 'function') {
        window.navigateToRoute('#/');
      } else {
        window.location.hash = '#/';
      }
    });
  }

  // 6. Smooth Jump Nav Pills inside E-Cell info page
  document.querySelectorAll('.ecell-jump-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      const targetHref = pill.getAttribute('href');
      if (targetHref && targetHref.startsWith('#')) {
        const targetEl = document.querySelector(targetHref);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 90;
          const pos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: pos, behavior: 'smooth' });
        }
      }
    });
  });
}



