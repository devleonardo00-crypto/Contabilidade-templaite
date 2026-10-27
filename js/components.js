/**
 * ÁPICE CONTABILIDADE — INTERACTIVE COMPONENTS & EDITORIAL SYSTEMS
 */

class SiteComponents {
  constructor() {
    this.initLenis();
    this.initNavigation();
    this.initFAQ();
    this.initContactModal();
    this.initTimelineProgress();
    this.initAmbientAudio();
    this.initReducedMotion();
  }

  /**
   * Smooth Lenis scrolling for editorial fluid feel with zero conflict
   */
  initLenis() {
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Disable Lenis on mobile: native touch momentum scrolling is superior and
    // Lenis can conflict with iOS scroll position detection by GSAP ScrollTrigger.
    if (window.Lenis && !isMobile && !prefersReducedMotion) {
      window.lenis = new Lenis({
        duration: 0.9,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2
      });

      // Synchronize with GSAP Ticker exclusively
      if (window.gsap && window.ScrollTrigger) {
        window.lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
          window.lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          window.lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }
  }

  /**
   * Navigation bar dynamic appearance and mobile drawer
   */
  initNavigation() {
    const navbar = document.getElementById('mainNavbar');
    const menuBtn = document.getElementById('mobileMenuBtn');
    const menuCloseBtn = document.getElementById('mobileMenuCloseBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar blur and elevation on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('bg-deep-forest/90', 'backdrop-blur-md', 'border-b', 'border-white/10', 'py-4');
        navbar.classList.remove('py-6');
      } else {
        navbar.classList.remove('bg-deep-forest/90', 'backdrop-blur-md', 'border-b', 'border-white/10', 'py-4');
        navbar.classList.add('py-6');
      }
    }, { passive: true });

    // Mobile Drawer
    if (menuBtn && mobileDrawer) {
      menuBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        menuBtn.setAttribute('aria-expanded', 'true');
        gsap.fromTo(mobileDrawer, 
          { opacity: 0, y: -20 }, 
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
        gsap.fromTo('.mobile-nav-link', 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, stagger: 0.08, delay: 0.15, duration: 0.4, ease: 'power2.out' }
        );
      });

      const closeMenu = () => {
        menuBtn.setAttribute('aria-expanded', 'false');
        gsap.to(mobileDrawer, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            mobileDrawer.classList.add('hidden');
            document.body.style.overflow = '';
          }
        });
      };

      if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);
      navLinks.forEach(link => link.addEventListener('click', closeMenu));

      // Also close when clicking mobile nav links inside the drawer
      document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      // Close drawer on ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileDrawer.classList.contains('hidden')) {
          closeMenu();
        }
      });
    }

    // Smooth anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            if (window.lenis) {
              window.lenis.scrollTo(targetEl, { offset: -60, duration: 1.5 });
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    });
  }

  /**
   * Minimalist FAQ Accordion
   */
  initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const header = item.querySelector('.faq-header');
      if (!header) return;

      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close other open items
        faqItems.forEach(other => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
          }
        });

        // Toggle clicked
        if (isOpen) {
          item.classList.remove('is-open');
        } else {
          item.classList.add('is-open');
        }
      });
    });
  }

  /**
   * Contact / Diagnostic Consultation Modal
   */
  initContactModal() {
    const modal = document.getElementById('contactModal');
    const openBtns = document.querySelectorAll('.open-contact-modal');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('contactForm');
    const successMsg = document.getElementById('contactSuccess');

    if (!modal) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        gsap.fromTo(modal.querySelector('.modal-card'),
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
        );
      });
    });

    const closeModal = () => {
      gsap.to(modal.querySelector('.modal-card'), {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
          if (successMsg) successMsg.classList.add('hidden');
          if (form) form.classList.remove('hidden');
        }
      });
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Form submission
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = form.querySelector('#inputName')?.value || 'Cliente';
        const empresa = form.querySelector('#inputCompany')?.value || 'Empresa';
        
        // Show success
        form.classList.add('hidden');
        if (successMsg) {
          successMsg.classList.remove('hidden');
          const clientSpan = successMsg.querySelector('.client-name-slot');
          if (clientSpan) clientSpan.textContent = nome;
        }

        // WhatsApp direct link trigger
        const whatsappBtn = document.getElementById('sendWhatsappBtn');
        if (whatsappBtn) {
          const msg = encodeURIComponent(`Olá Ápice Contabilidade, me chamo ${nome} da empresa ${empresa} e gostaria de agendar um diagnóstico contábil estratégico.`);
          whatsappBtn.href = `https://wa.me/5511999999999?text=${msg}`;
        }
      });
    }
  }

  /**
   * Scroll-Driven Process Timeline (Section 05 — Como Funciona)
   */
  initTimelineProgress() {
    const timelineSection = document.getElementById('como-funciona');
    const timelineBar = document.querySelector('.timeline-progress-bar');
    const stepCards = document.querySelectorAll('.timeline-step-card');

    if (!timelineSection || !window.ScrollTrigger) return;

    ScrollTrigger.create({
      trigger: timelineSection,
      start: 'top 70%',
      end: 'bottom 85%',
      scrub: true,
      onUpdate: (self) => {
        if (timelineBar) {
          timelineBar.style.height = `${self.progress * 100}%`;
        }
        stepCards.forEach((card, idx) => {
          const threshold = (idx) / stepCards.length;
          if (self.progress >= threshold) {
            card.classList.add('is-active-step');
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
          } else {
            card.classList.remove('is-active-step');
            card.style.opacity = '0.35';
            card.style.transform = 'translateX(-8px)';
          }
        });
      }
    });
  }

  /**
   * Synthetic ambient tone generator using Web Audio API for an exquisite luxury experience
   */
  initAmbientAudio() {
    const soundToggle = document.getElementById('soundToggle');
    const soundLabel = document.getElementById('soundToggleLabel');
    if (!soundToggle) return;

    let audioCtx = null;
    let isPlaying = false;
    let gainNode = null;
    let osc1 = null;
    let osc2 = null;

    soundToggle.addEventListener('click', () => {
      if (!isPlaying) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          
          gainNode = audioCtx.createGain();
          gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 2.5); // Very soft, relaxing pad

          // 432 Hz warm resonant fundamental
          osc1 = audioCtx.createOscillator();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(216, audioCtx.currentTime); // Soft sub-harmonic

          // Secondary harmonic
          osc2 = audioCtx.createOscillator();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(324, audioCtx.currentTime);

          // Biquad lowpass filter for velvety warmth
          const filter = audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, audioCtx.currentTime);

          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(filter);
          filter.connect(audioCtx.destination);

          osc1.start();
          osc2.start();

          isPlaying = true;
          soundToggle.classList.add('bg-white/20');
          if (soundLabel) soundLabel.textContent = 'SOM: ATIVO';
        } catch (e) {
          console.warn('Audio API unavailable', e);
        }
      } else {
        if (gainNode && audioCtx) {
          gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
          setTimeout(() => {
            if (osc1) osc1.stop();
            if (osc2) osc2.stop();
            if (audioCtx) audioCtx.close();
            isPlaying = false;
            soundToggle.classList.remove('bg-white/20');
            if (soundLabel) soundLabel.textContent = 'SOM: DESLIGADO';
          }, 1000);
        }
      }
    });
  }

  /**
   * Accessibility: Reduced Motion handling
   */
  initReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.log('Reduced motion mode active.');
      document.body.classList.add('reduced-motion');
      // If reduced motion is requested, display all chapters in static sequence
      document.querySelectorAll('.chapter-view').forEach(ch => {
        ch.style.position = 'relative';
        ch.style.opacity = '1';
        ch.style.visibility = 'visible';
      });
    }
  }
}

window.SiteComponents = SiteComponents;
