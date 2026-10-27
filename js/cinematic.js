/**
 * ÁPICE CONTABILIDADE — CINEMATIC SCROLL EXPERIENCE & STORYTELLING ENGINE
 * Sincronização determinística e contínua do vídeo e da camada de narrativa sobre o vídeo.
 */

/**
 * CAMADA DE NARRATIVA CINEMATOGRÁFICA
 * Responsável por posicionar, animar e sincronizar os 6 capítulos sobre o vídeo.
 */
class CinematicStoryOverlay {
  constructor() {
    this.overlay = document.getElementById('cinematicStoryOverlay');
    
    // Intervalos oficiais do Storyboard:
    // CAPÍTULO 01: 0% A 15% (Abertura)
    // CAPÍTULO 02: 15% A 30% (Problema)
    // CAPÍTULO 03: 30% A 45% (Solução)
    // CAPÍTULO 04: 45% A 65% (Diferenciais)
    // CAPÍTULO 05: 65% A 85% (Serviços)
    // CAPÍTULO 06: 85% A 100% (Conclusão)
    this.chapters = [
      { id: 'ch1', range: [0.00, 0.15], name: '01 / ABERTURA', el: document.getElementById('story-ch-1') || document.getElementById('chapter-1'), isFirst: true },
      { id: 'ch2', range: [0.15, 0.30], name: '02 / O CENÁRIO', el: document.getElementById('story-ch-2') || document.getElementById('chapter-2') },
      { id: 'ch3', range: [0.30, 0.45], name: '03 / TRANSFORMAÇÃO', el: document.getElementById('story-ch-3') || document.getElementById('chapter-3') },
      { id: 'ch4', range: [0.45, 0.65], name: '04 / DIFERENCIAIS', el: document.getElementById('story-ch-4') || document.getElementById('chapter-4') },
      { id: 'ch5', range: [0.65, 0.85], name: '05 / SERVIÇOS', el: document.getElementById('story-ch-5') || document.getElementById('chapter-5') },
      { id: 'ch6', range: [0.85, 1.00], name: '06 / CONCLUSÃO', el: document.getElementById('story-ch-6') || document.getElementById('chapter-6'), isLast: true }
    ];

    this.currentChapterName = '01 / ABERTURA';

    // Garante que o Capítulo 01 esteja 100% visível imediatamente
    this.update(0);
  }

  /**
   * Atualização determinística chamada em cada movimento do scroll
   * @param {number} progress Progresso normalizado entre 0.0 e 1.0
   */
  update(progress) {
    let activeName = '01 / ABERTURA';

    for (let i = 0; i < this.chapters.length; i++) {
      const ch = this.chapters[i];
      if (!ch.el) continue;

      const [start, end] = ch.range;
      const isFirst = !!ch.isFirst;
      const isLast = !!ch.isLast;
      const span = end - start;

      // Janela de transição suave (~18% do intervalo do capítulo)
      const fade = Math.min(Math.max(span * 0.18, 0.02), 0.04);

      let opacity = 0;
      let y = 0;
      let isVisible = false;

      if (progress < start - 0.015 || progress > end + 0.015) {
        // Fora do intervalo
        opacity = 0;
        y = progress < start ? 24 : -24;
        isVisible = false;
      } else if (isFirst) {
        // CAPÍTULO 01: 100% visível na abertura (progresso 0.00 até 0.11), saída suave até 0.15
        if (progress <= end - fade) {
          opacity = 1;
          y = 0;
          isVisible = true;
        } else {
          const exitRatio = (progress - (end - fade)) / fade;
          opacity = Math.max(0, 1 - exitRatio);
          y = -24 * exitRatio;
          isVisible = opacity > 0.01;
        }
      } else if (isLast) {
        // CAPÍTULO 06: entrada suave em 0.85, permanece 100% visível até 1.00
        if (progress < start + fade) {
          const enterRatio = (progress - start) / fade;
          opacity = Math.min(1, Math.max(0, enterRatio));
          y = 24 * (1 - opacity);
          isVisible = opacity > 0.01;
        } else {
          opacity = 1;
          y = 0;
          isVisible = true;
        }
      } else {
        // CAPÍTULOS 02, 03, 04, 05: entrada suave -> platô estável de 100% visibilidade -> saída suave
        if (progress < start + fade) {
          // Fase de entrada
          const enterRatio = (progress - start) / fade;
          opacity = Math.min(1, Math.max(0, enterRatio));
          y = 24 * (1 - opacity);
          isVisible = opacity > 0.01;
        } else if (progress > end - fade) {
          // Fase de saída
          const exitRatio = (progress - (end - fade)) / fade;
          opacity = Math.max(0, 1 - exitRatio);
          y = -24 * exitRatio;
          isVisible = opacity > 0.01;
        } else {
          // Platô de visibilidade total (100% legível)
          opacity = 1;
          y = 0;
          isVisible = true;
        }
      }

      // Aplicação direta no elemento sem atrito ou atraso assíncrono
      ch.el.style.opacity = opacity.toFixed(3);
      ch.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      ch.el.style.visibility = isVisible ? 'visible' : 'hidden';
      ch.el.style.pointerEvents = opacity > 0.35 ? 'auto' : 'none';

      if (progress >= start && progress <= end) {
        activeName = ch.name;
      }
    }

    this.currentChapterName = activeName;
    return activeName;
  }
}

/**
 * MOTOR CINEMATOGRÁFICO DE VÍDEO E SCROLLTRIGGER
 */
class CinematicScrollExperience {
  constructor() {
    this.container = document.getElementById('cinematic');
    this.sticky = document.getElementById('cinematicSticky');
    this.video = document.getElementById('cinematicVideo');
    
    // Debug HUD Elements
    this.debugHud = document.getElementById('cinematicDebugHUD');
    this.dbgProgress = document.getElementById('dbgProgress');
    this.dbgTime = document.getElementById('dbgTime');
    this.dbgDuration = document.getElementById('dbgDuration');
    this.dbgChapter = document.getElementById('dbgChapter');
    this.dbgState = document.getElementById('dbgState');
    this.dbgSeeking = document.getElementById('dbgSeeking');
    this.dbgPlayBtn = document.getElementById('dbgPlayTest');

    // User-facing HUD Elements
    this.hudFill = document.querySelector('.hud-progress-fill');
    this.hudChapter = document.querySelector('.hud-current-chapter');
    this.hudPercent = document.querySelector('.hud-current-percent');

    this.progress = 0;
    this.duration = 7.0; // Fallback duration until metadata decodes
    this.targetTime = 0;
    this.isSeeking = false;
    this.pendingTime = null;
    this.isMobile = window.innerWidth <= 768;
    this.hasUnlockedDecoder = false;

    // Throttle seek calls on mobile for better performance
    this._seekThrottle = null;

    this.init();
  }

  init() {
    if (!this.container || !this.video) {
      console.error('CinematicScrollExperience: container or video element missing.');
      return;
    }

    console.log('CinematicScrollExperience: Initializing engine and story overlay...');

    // 1. Instancia a camada de narrativa sobre o vídeo
    this.storyOverlay = new CinematicStoryOverlay();

    // 2. Setup video media source & event listeners (PRESERVADO)
    this.setupVideoSource();
    this.setupVideoEvents();

    // 3. Setup GSAP ScrollTrigger for pinning & continuous scrubbing
    this.setupScrollTrigger();

    // 4. Garante sincronização no estado inicial
    this.onScroll(0);

    // 5. Debug button binding
    if (this.dbgPlayBtn) {
      this.dbgPlayBtn.addEventListener('click', () => this.unlockDecoder());
    }

    // 6. Wake up decoder on first user scroll or interaction
    const unlockOnce = () => {
      this.unlockDecoder();
      window.removeEventListener('scroll', unlockOnce);
      window.removeEventListener('click', unlockOnce);
      window.removeEventListener('touchstart', unlockOnce);
    };
    window.addEventListener('scroll', unlockOnce, { passive: true });
    window.addEventListener('click', unlockOnce, { passive: true });
    window.addEventListener('touchstart', unlockOnce, { passive: true });
  }

  /**
   * Selects mobile or desktop video source with automatic fallback (PRESERVADO)
   */
  setupVideoSource() {
    this.isMobile = window.innerWidth <= 768;
    const desktopSources = [
      'public/videos/hero-desktop.mp4.mp4',
      'public/videos/hero-desktop.mp4',
      './public/videos/hero-desktop.mp4.mp4',
      './public/videos/hero-desktop.mp4',
      './videos/hero-desktop.mp4.mp4',
      './videos/hero-desktop.mp4'
    ];

    const mobileSources = [
      'public/videos/hero-mobile.mp4.mp4',
      'public/videos/hero-mobile.mp4',
      './public/videos/hero-mobile.mp4.mp4',
      './public/videos/hero-mobile.mp4',
      './videos/hero-mobile.mp4.mp4',
      './videos/hero-mobile.mp4'
    ];

    // On mobile, prefer mobile video; fallback to desktop
    const targetList = this.isMobile ? mobileSources : desktopSources;
    
    // Set direct source if not already active
    if (!this.video.currentSrc) {
      this.video.src = targetList[0];
      // On mobile, use 'metadata' preload to save bandwidth until interaction
      if (this.isMobile) {
        this.video.preload = 'metadata';
      }
      this.video.load();
    }

    // Fallback if file extension is single .mp4
    this.video.addEventListener('error', () => {
      console.warn('Video failed to load from primary source. Attempting secondary fallback...');
      if (this.video.src.includes('.mp4.mp4')) {
        this.video.src = this.video.src.replace('.mp4.mp4', '.mp4');
        this.video.load();
      } else if (this.isMobile && !this.video.src.includes('desktop')) {
        // Mobile video not available, fall back to desktop
        console.warn('Mobile video unavailable. Falling back to desktop video.');
        this.video.src = desktopSources[1];
        this.video.load();
      }
    }, { once: true });
  }

  /**
   * Hardware video decoder initialization (PRESERVADO)
   */
  unlockDecoder() {
    if (this.hasUnlockedDecoder || !this.video) return;
    this.hasUnlockedDecoder = true;

    this.video.muted = true;
    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.video.pause();
          this.video.currentTime = this.targetTime || 0;
          console.log('Video decoder successfully activated.');
          if (this.dbgState) this.dbgState.textContent = 'Decodificador Ativo (Pronto)';
        })
        .catch((err) => {
          console.log('Decoder unlock notice:', err.message);
        });
    }
  }

  setupVideoEvents() {
    const handleMeta = () => {
      if (this.video.duration && !isNaN(this.video.duration) && isFinite(this.video.duration)) {
        this.duration = this.video.duration;
      }
      console.log(`Video ready. Duration: ${this.duration.toFixed(2)}s, Dimensions: ${this.video.videoWidth}x${this.video.videoHeight}`);
      if (this.dbgDuration) this.dbgDuration.textContent = `${this.duration.toFixed(2)}s`;
      if (this.dbgState) this.dbgState.textContent = `Carregado (${this.video.videoWidth}x${this.video.videoHeight})`;
      
      // Update at initial scroll position
      this.seekToTime(this.targetTime);
    };

    this.video.addEventListener('loadedmetadata', handleMeta);
    this.video.addEventListener('loadeddata', handleMeta);
    this.video.addEventListener('canplay', handleMeta);

    // Seek completion handling with pending queue (PRESERVADO)
    this.video.addEventListener('seeked', () => {
      this.isSeeking = false;
      if (this.dbgSeeking) this.dbgSeeking.textContent = 'false';
      if (this.dbgTime) this.dbgTime.textContent = `${this.video.currentTime.toFixed(2)}s`;

      // If scroll position changed while the browser was decoding the previous frame
      if (this.pendingTime !== null) {
        const nextTime = this.pendingTime;
        this.pendingTime = null;
        this.seekToTime(nextTime);
      }
    });

    if (this.video.readyState >= 1) {
      handleMeta();
    }
  }

  /**
   * Deterministic Video Seek with Pending Buffer (PRESERVADO)
   */
  seekToTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return;
    const clamped = Math.max(0, Math.min(this.duration, seconds));
    this.targetTime = clamped;

    if (this.isSeeking) {
      this.pendingTime = clamped;
      return;
    }

    try {
      this.isSeeking = true;
      if (this.dbgSeeking) this.dbgSeeking.textContent = 'true';
      this.video.currentTime = clamped;
      if (this.dbgTime) this.dbgTime.textContent = `${clamped.toFixed(2)}s`;
    } catch (e) {
      this.isSeeking = false;
    }
  }

  /**
   * GSAP ScrollTrigger Setup: Pinned 600vh Storytelling Controller
   */
  setupScrollTrigger() {
    if (!window.gsap || !window.ScrollTrigger) {
      console.error('GSAP or ScrollTrigger missing!');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: this.container,
      start: 'top top',
      end: 'bottom bottom',
      pin: this.sticky,
      pinSpacing: false,
      scrub: true,
      onUpdate: (self) => {
        const progress = Math.min(Math.max(self.progress, 0), 1);
        this.onScroll(progress);
      },
      onLeave: () => {
        const hud = document.querySelector('.cinematic-hud');
        if (hud) hud.classList.add('is-hidden');
      },
      onEnterBack: () => {
        const hud = document.querySelector('.cinematic-hud');
        if (hud) hud.classList.remove('is-hidden');
      }
    });

    console.log('ScrollTrigger pinning & scrub controller initialized.');
  }

  /**
   * Invoked on every scroll frame with normalized progress [0.0 ... 1.0]
   */
  onScroll(progress) {
    this.progress = progress;

    // 1. Advance / Reverse Video Frame (PRESERVADO)
    const targetSeconds = progress * this.duration;
    this.seekToTime(targetSeconds);

    // 2. Synchronize Narrative Chapters Over Video
    let activeChapterName = '01 / ABERTURA';
    if (this.storyOverlay) {
      activeChapterName = this.storyOverlay.update(progress);
    }

    // 3. Update HUDs
    this.updateDebugHUD(progress, activeChapterName);
    this.updateUserHUD(progress, activeChapterName);
  }

  updateDebugHUD(progress, chapterName) {
    if (!this.debugHud) return;
    const pct = (progress * 100).toFixed(1);
    if (this.dbgProgress) this.dbgProgress.textContent = `${pct}%`;
    if (this.dbgChapter && chapterName) this.dbgChapter.textContent = chapterName;
    if (this.dbgTime && this.video) {
      this.dbgTime.textContent = `${this.video.currentTime.toFixed(2)}s`;
    }
  }

  updateUserHUD(progress, chapterName) {
    if (this.hudFill) {
      this.hudFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }
    if (this.hudPercent) {
      this.hudPercent.textContent = `${Math.round(progress * 100)}%`;
    }
    if (this.hudChapter && chapterName) {
      this.hudChapter.textContent = chapterName;
    }
  }
}

// Export for window scope
window.CinematicStoryOverlay = CinematicStoryOverlay;
window.CinematicScrollExperience = CinematicScrollExperience;
