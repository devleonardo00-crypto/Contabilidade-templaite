/**
 * ÁPICE CONTABILIDADE — APPLICATION BOOTSTRAP
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Ápice Contabilidade — Initializing $10,000 Cinematic Digital Experience...');

  // 1. Initialize Interactive Components (Lenis, Navigation, FAQ, Modal, Timeline)
  const components = new window.SiteComponents();

  // 2. Initialize Cinematic Scroll Engine (Video scrub, GSAP ScrollTrigger, 6 Chapters)
  const cinematic = new window.CinematicScrollExperience();

  // 3. Subtle navbar entrance
  if (window.gsap) {
    gsap.from('#mainNavbar', {
      y: -20,
      opacity: 0,
      duration: 1.0,
      ease: 'power2.out',
      delay: 0.1
    });
  }

  // 4. Preloader hide
  const preloader = document.getElementById('sitePreloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 200);
  }
});
