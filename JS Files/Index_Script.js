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

// toggles mobile nav and mega menu
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

const rates = {
  PHP: { symbol: '₱', rate: 1 },
  USD: { symbol: '$', rate: 0.018 },
  EUR: { symbol: '€', rate: 0.016 }
};

let currentCurrency = 'PHP';

// Toggle dropdown visibility
$('currencyBtn').addEventListener('click', () => {
  $('currencyDropdown').classList.toggle('open');
});

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  const switcher = $('currencySwitcher');
  if (!switcher.contains(e.target)) {
    $('currencyDropdown').classList.remove('open');
  }
});

// When user picks a currency, update everything
$$('#currencyDropdown li').forEach(item => {
  item.addEventListener('click', () => {
    const chosen = item.getAttribute('data-currency');
    currentCurrency = chosen;
    $('activeCurrency').textContent = chosen;
    $('currencyDropdown').classList.remove('open');

    // Update all product price elements
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

    // Brief bounce animation on the badge
    $('cartBadge').style.transform = 'scale(1.4)';
    setTimeout(() => {
      $('cartBadge').style.transform = 'scale(1)';
    }, 200);
  });
});

//  auto-plays and can be clicked via dots
const reviewCards = $$('.review-card');
const sliderDots  = $$('.slider-dot');
let currentSlide  = 0;
let autoSlide;

function goToSlide(n) {
  reviewCards[currentSlide].classList.remove('active');
  sliderDots[currentSlide].classList.remove('active');
  currentSlide = (n + reviewCards.length) % reviewCards.length;
  reviewCards[currentSlide].classList.add('active');
  sliderDots[currentSlide].classList.add('active');
}

// dot click navigation
sliderDots.forEach(dot => {
  dot.addEventListener('click', () => {
    clearInterval(autoSlide);
    goToSlide(parseInt(dot.dataset.index));
    startAutoSlide();
  });
});

// auto advance every 5 seconds
function startAutoSlide() {
  autoSlide = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 5000);
}
startAutoSlide();

//  let users pick 1-5 stars interactively
const stars    = $$('#starPicker span');
let selectedStars = 0;

stars.forEach(star => {
  star.addEventListener('mouseover', () => {
    const val = parseInt(star.dataset.val);
    stars.forEach((s, i) => {
      s.classList.toggle('selected', i < val);
    });
  });

  star.addEventListener('click', () => {
    selectedStars = parseInt(star.dataset.val);
    stars.forEach((s, i) => {
      s.classList.toggle('selected', i < selectedStars);
    });
  });

  star.addEventListener('mouseout', () => {
    stars.forEach((s, i) => {
      s.classList.toggle('selected', i < selectedStars);
    });
  });
});


// review form submission
$('submitReview').addEventListener('click', () => {
  const name = $('reviewName').value.trim();
  const text = $('reviewText').value.trim();

  if (!name || !text || selectedStars === 0) {
    // basic validation – shake the button
    $('submitReview').style.transform = 'translateX(-4px)';
    setTimeout(() => {
      $('submitReview').style.transform = 'translateX(4px)';
      setTimeout(() => {
        $('submitReview').style.transform = '';
      }, 100);
    }, 100);
    return;
  }

  // show message after submitting
  $('reviewSuccess').style.display = 'flex';
  $('reviewName').value = '';
  $('reviewText').value = '';
  selectedStars = 0;
  stars.forEach(s => s.classList.remove('selected'));

  setTimeout(() => {
    $('reviewSuccess').style.display = 'none';
  }, 4000);
});


// faq interactive toggle
$$('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    $$('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
    });

    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

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


// reveal on scroll
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
