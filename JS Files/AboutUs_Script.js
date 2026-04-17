// helper functions for easier element selection
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const tickerTrack = $('tickerTrack');
if (tickerTrack) {
  const clone = tickerTrack.innerHTML;
  tickerTrack.innerHTML += clone; // duplicate content
}

//  adds shadow to header after scrolling down 50px
const header = $('siteHeader');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/// toggles mobile nav and mega menu
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

// toggles search bar and focuses input
const searchToggle = $('searchToggle');
const searchBar    = $('searchBar');
const searchInput  = $('searchInput');

searchToggle.addEventListener('click', () => {
  searchBar.classList.toggle('open');
  if (searchBar.classList.contains('open')) {
    searchInput.focus(); 
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchBar.classList.remove('open');
    mainNav.classList.remove('open');
    hamburger.classList.remove('open');
  }
});

// toggles light/dark mode and saves preference in localStorage
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const htmlEl      = document.documentElement;

const savedTheme = localStorage.getItem('cssp-theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
updateThemeUI(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  const next    = current === 'light' ? 'dark' : 'light';
  
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('cssp-theme', next);
  updateThemeUI(next);
});

// updates the theme toggle icon based on current theme
function updateThemeUI(theme) {
  if (theme === 'dark') {
    themeIcon.className = 'fa-solid fa-moon';
  } else {
    themeIcon.className = 'fa-solid fa-sun';
  }
}

// exchange rates relative to PHP (base currency)
const rates = {
  PHP: { symbol: '₱', rate: 1 },
  USD: { symbol: '$', rate: 0.018 },
  EUR: { symbol: '€', rate: 0.016 }
};

let currentCurrency = 'PHP';

// toggle dropdown visibility
$('currencyBtn').addEventListener('click', () => {
  $('currencyDropdown').classList.toggle('open');
});

// close dropdown when clicking outside
document.addEventListener('click', e => {
  const switcher = $('currencySwitcher');
  if (!switcher.contains(e.target)) {
    $('currencyDropdown').classList.remove('open');
  }
});

// when user picks a currency, update everything
$$('#currencyDropdown li').forEach(item => {
  item.addEventListener('click', () => {
    const chosen = item.getAttribute('data-currency');
    currentCurrency = chosen;
    $('activeCurrency').textContent = chosen;
    $('currencyDropdown').classList.remove('open');

    // update all product price elements
    $$('.card-price').forEach(el => {
      const basePHP = parseFloat(el.getAttribute('data-base'));
      const { symbol, rate } = rates[chosen];
      const converted = (basePHP * rate).toFixed(2);
      el.textContent = symbol + converted;
    });
  });
});

//  add item to cart and add the badge count
let cartCount = 0;

$$('.quick-add').forEach(btn => {
  btn.addEventListener('click', () => {
    cartCount++;
    $('cartBadge').textContent = cartCount;

    // brief bounce animation on the badge
    $('cartBadge').style.transform = 'scale(1.4)';
    setTimeout(() => {
      $('cartBadge').style.transform = 'scale(1)';
    }, 200);
  });
});

// history section slider
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

// photo card hover effect
$$('.tailor-photo-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-8px)';
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// photo grid items reveal
$$('.people-grid-item').forEach(item => {
  item.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-4px)';
  });
  item.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// back to top button
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

// smooth reveal on scroll
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
