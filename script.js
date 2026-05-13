/* =========================================================
   Cyber AgentFlow — script.js
   Features: navbar scroll, mobile menu, smooth scroll,
             copy-to-clipboard, screenshot modal, scroll reveal
========================================================= */

// ── Year ──────────────────────────────────────────────────
document.getElementById('footerYear').textContent = new Date().getFullYear();

// ── Navbar scroll effect ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile nav toggle ─────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Smooth scroll for anchor links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 68; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Copy-to-clipboard buttons ─────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    }
  });
});

// ── Screenshot Carousel Engine ───────────────────────────
const carouselContainer = document.querySelector('.screenshots-carousel-container');
const carouselTrack     = document.querySelector('.screenshots-track');

let isScrollingManually = false;
let scrollSpeed = 0.8; // pixels per frame
let currentScrollPos = 0;
let manualScrollTimer = null;

function getUniqueWidth() {
  const cards = Array.from(document.querySelectorAll('.screenshot-card'));
  if (cards.length < 8) return 0;
  const firstCard = cards[0];
  const eighthCard = cards[7];
  const gap = 16; 
  return (eighthCard.offsetLeft + eighthCard.offsetWidth + gap) - firstCard.offsetLeft;
}

function animateCarousel() {
  if (carouselContainer && !isScrollingManually) {
    currentScrollPos += scrollSpeed;
    
    const uniqueWidth = getUniqueWidth();
    if (uniqueWidth > 0) {
      if (currentScrollPos >= uniqueWidth) {
        currentScrollPos = 0;
      }
      carouselContainer.scrollLeft = currentScrollPos;
    }
  } else if (carouselContainer) {
    // Keep internal pos in sync with manual scroll
    currentScrollPos = carouselContainer.scrollLeft;
  }
  requestAnimationFrame(animateCarousel);
}

window.addEventListener('load', () => {
  if (carouselContainer) {
    carouselContainer.style.scrollBehavior = 'auto';
    currentScrollPos = 0;
    carouselContainer.scrollLeft = 0;
    requestAnimationFrame(animateCarousel);
    
    // Manual wheel scroll
    carouselContainer.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        carouselContainer.scrollLeft += e.deltaY;
      }
      isScrollingManually = true;
      clearTimeout(manualScrollTimer);
      manualScrollTimer = setTimeout(() => { isScrollingManually = false; }, 2000);
    }, { passive: false });

    // Drag to scroll
    let isDown = false;
    let startX;
    let scrollLeft;

    carouselContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      carouselContainer.style.cursor = 'grabbing';
      startX = e.pageX - carouselContainer.offsetLeft;
      scrollLeft = carouselContainer.scrollLeft;
    });
    carouselContainer.addEventListener('mouseleave', () => { isDown = false; carouselContainer.style.cursor = 'grab'; });
    carouselContainer.addEventListener('mouseup', () => { isDown = false; carouselContainer.style.cursor = 'grab'; });
    carouselContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carouselContainer.offsetLeft;
      const walk = (x - startX) * 2;
      carouselContainer.scrollLeft = scrollLeft - walk;
      isScrollingManually = true;
      clearTimeout(manualScrollTimer);
      manualScrollTimer = setTimeout(() => { isScrollingManually = false; }, 2000);
    });
  }
});


// ── Screenshot modal ─────────────────────────────────────
const modal         = document.getElementById('ssModal');

const modalImg      = document.getElementById('ssModalImg');
const modalCaption  = document.getElementById('ssModalCaption');
const modalClose    = document.getElementById('ssModalClose');
const modalBackdrop = document.getElementById('ssModalBackdrop');
const modalPrev     = document.getElementById('ssModalPrev');
const modalNext     = document.getElementById('ssModalNext');

// All unique screenshots (the first 8 items in the track)
const allSsCards  = Array.from(document.querySelectorAll('.screenshot-card')).slice(0, 8);
const screenshots = allSsCards.map(card => ({
  src: card.querySelector('img').src,
  caption: card.dataset.caption || ''
}));
let currentSsIndex = 0;

function openModal(index) {
  currentSsIndex = index;
  updateModalContent();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { modalImg.src = ''; }, 300);
}

function updateModalContent() {
  const { src, caption } = screenshots[currentSsIndex];
  modalImg.style.opacity = '0';
  setTimeout(() => {
    modalImg.src = src;
    modalImg.alt = caption;
    modalCaption.textContent = caption;
    modalImg.style.opacity = '1';
  }, 150);
}

function navigateModal(dir) {
  currentSsIndex = (currentSsIndex + dir + screenshots.length) % screenshots.length;
  updateModalContent();
}

// Event Listeners
document.querySelectorAll('.screenshot-card').forEach((card, i) => {
  card.addEventListener('click', () => {
    openModal(i % 8); // Mode 8 for duplicates in carousel
  });
});

modalPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(-1); });
modalNext.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(1); });

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (!modal.classList.contains('active')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft') navigateModal(-1);
  if (e.key === 'ArrowRight') navigateModal(1);
});


// ── Scroll-reveal ─────────────────────────────────────────
const revealTargets = [
  '.section-label',
  '.section-title',
  '.section-desc',
  '.about-text p',
  '.callout',
  '.feature-card',
  '.arch-layer',
  '.install-step',
  '.team-card',
  '.contact-box',
  '.req-box',
  '.hero-badge',
  '.hero-sub',
  '.hero-cta',
  '.hero-stats',
];

revealTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 60}ms`;
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Active nav highlighting ───────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));

// ── Terminal typing animation (subtle enhancement) ────────
// The terminal is pre-populated in HTML; this just adds a
// slow flicker to make it feel alive.
const termLines = document.querySelectorAll('.t-line');
termLines.forEach((line, i) => {
  line.style.opacity = '0';
  line.style.transition = 'opacity 0.3s ease';
  setTimeout(() => { line.style.opacity = '1'; }, 800 + i * 180);
});
