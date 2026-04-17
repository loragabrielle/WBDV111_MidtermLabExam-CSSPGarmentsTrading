// Shorthand for document.getElementById
const $ = id => document.getElementById(id);
const $$ = selector => document.querySelectorAll(selector);

// =============================================
//  PRE-HEADER TICKER (Infinite scroll)
// =============================================
const tickerTrack = $('tickerTrack');
if (tickerTrack) {
  const clone = tickerTrack.innerHTML;
  tickerTrack.innerHTML += clone;
}

// =============================================
//  STICKY HEADER – adds shadow on scroll
// =============================================
const header = $('siteHeader');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// =============================================
//  HAMBURGER MENU (Mobile nav toggle) - FIXED
// =============================================
const hamburger = $('hamburger');
const mainNav   = $('mainNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mainNav.classList.toggle('open');
});

$$('.nav-item.has-mega .nav-link').forEach(link => {
  link.addEventListener('click', e => {
    // for small screens
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parent = link.closest('.nav-item');
      parent.classList.toggle('open');
    }
  });
});


// =============================================
//   LIGHT / DARK MODE TOGGLE
// =============================================
const themeToggle = $('themeToggle');
const themeIcon = $('themeIcon');
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem('cssp-theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('cssp-theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    themeIcon.className = 'fa-solid fa-moon';
   
  } else {
    themeIcon.className = 'fa-solid fa-sun';
  }
}

// =============================================
//  HISTORY SECTION SLIDER - RESPONSIVE FIXED
// =============================================
const yearStrips = $('yearStrips');
const yearLabels = $$('.year-label');
const descItems = $$('.growth-desc');
const imgSlides = $$('.img-slide');
const dots = $$('.dot');
let currentYear = 0;


function updateHistory(index) {
  // Calculate the correct height based on viewport
  const yearViewport = document.querySelector('.year-viewport');
  const yearHeight = yearViewport.offsetHeight;
 
  currentYear = ((index % 3) + 3) % 3; // Ensure proper looping

  // Animate year strips - responsive height
  yearStrips.style.transform = `translateY(-${currentYear * yearHeight}px)`;

  // Update descriptions with fade
  descItems.forEach((desc, i) => {
    desc.classList.remove('active');
    if (i === currentYear) {
      desc.classList.add('active');
    }
  });

  // Update images with fade
  imgSlides.forEach((img, i) => {
    img.classList.remove('active');
    if (i === currentYear) {
      img.classList.add('active');
    }
  });

  // Update year labels
  yearLabels.forEach((label, i) => {
    label.classList.toggle('active', i === currentYear);
  });

  // Update pagination dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentYear);
  });
}

// Initialize first slide
updateHistory(0);

// Year label buttons
yearLabels.forEach((label, index) => {
  label.addEventListener('click', () => {
    updateHistory(index);
  });
});

// Arrow buttons
$$('.arrow').forEach(arrow => {
  arrow.addEventListener('click', () => {
    const direction = arrow.dataset.slide;
    if (direction === 'next') {
      updateHistory(currentYear + 1);
    } else {
      updateHistory(currentYear - 1);
    }
  });
});

// Pagination dots
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    updateHistory(index);
  });
});

// window resize
window.addEventListener('resize', () => {
  updateHistory(currentYear);
});

// =============================================
//  PHOTO CARDS HOVER EFFECT
// =============================================
$$('.tailor-photo-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-8px)';
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// =============================================
//  PEOPLE GRID ITEMS REVEAL
// =============================================
$$('.people-grid-item').forEach(item => {
  item.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-4px)';
  });
  item.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// =============================================
//  BACK TO TOP BUTTON
// =============================================
const backBtn = $('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backBtn.classList.add('visible');
  } else {
    backBtn.classList.remove('visible');
  }
});

backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =============================================
// SMOOTH REVEAL ON SCROLL 
// =============================================
const style = document.createElement('style');
style.textContent = `
  .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(style);

$$('section').forEach(sec => {
  sec.classList.add('reveal');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

$$('.reveal').forEach(el => observer.observe(el));
