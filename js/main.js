/**
 * Ronanto Interactive — main.js  |  Version 2.0
 *
 * Responsibilities:
 *   1. Navigation scroll state
 *   2. Mobile menu
 *   3. Active nav link highlighting
 *   4. Smooth scroll with nav offset
 *   5. Scroll-reveal (IntersectionObserver)
 *
 * Removed from v1: particle system, hero parallax,
 *   cursor glow, animated counters.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     1. NAVIGATION SCROLL STATE
     Adds `.scrolled` class to the header when the user scrolls
     past the threshold, triggering the white background effect.
  ────────────────────────────────────────────────────────── */
  const header            = document.getElementById('site-header');
  const SCROLL_THRESHOLD  = 24; // px before nav locks in

  function handleNavScroll() {
    header.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Evaluate immediately on load

  /* ──────────────────────────────────────────────────────────
     2. MOBILE MENU
     Toggles the drawer open/closed and manages ARIA attributes,
     body scroll lock, and outside-click dismissal.
  ────────────────────────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  /**
   * setMenuOpen — opens or closes the mobile menu.
   * @param {boolean} open
   */
  function setMenuOpen(open) {
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute(
      'aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu'
    );
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('is-open', open);
    // Prevent background scroll while menu is open
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // Toggle on hamburger click
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  // Close when a mobile nav link is activated
  mobileMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  // Close when clicking outside the menu or hamburger
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('is-open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      setMenuOpen(false);
    }
  });

  /* ──────────────────────────────────────────────────────────
     3. ACTIVE NAV LINK HIGHLIGHTING
     Watches which section is in the viewport and marks the
     corresponding nav link as active.
  ────────────────────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[data-section]');

  function updateActiveLink() {
    let activeSectionId = '';

    sections.forEach(section => {
      const { top, bottom } = section.getBoundingClientRect();
      // Mark active if the section straddles the upper viewport zone
      if (top <= 120 && bottom >= 120) {
        activeSectionId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.dataset.section === activeSectionId);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ──────────────────────────────────────────────────────────
     4. SMOOTH SCROLL
     Intercepts anchor clicks and scrolls to the target while
     accounting for the fixed nav height.
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');

      // Ignore bare "#" links (e.g. page-top placeholders)
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Read nav height from CSS variable so responsive overrides apply
      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h'),
        10
      ) || 68;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ──────────────────────────────────────────────────────────
     5. SCROLL REVEAL
     Elements with `.reveal` animate in when they enter the
     viewport. Uses IntersectionObserver for performance.
     Stagger delays are handled by `.reveal--d1` through `--d4`
     CSS classes applied in HTML.
  ────────────────────────────────────────────────────────── */
  const revealElements = document.querySelectorAll('.reveal');

  // Respect the user's motion preference — skip animation entirely
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // Show all elements immediately — CSS rule also handles this,
    // but JS ensures no FOUC during the observer setup.
    revealElements.forEach(el => el.classList.add('is-revealed'));

  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Each element animates once and is then untracked
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -28px 0px',
      }
    );

    revealElements.forEach(el => observer.observe(el));
  }

}); // end DOMContentLoaded
