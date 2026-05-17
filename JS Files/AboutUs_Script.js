/* helper shortcuts */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// Ticker duplication logic
const tickerTrack = $('tickerTrack');
if (tickerTrack) {
  tickerTrack.innerHTML += tickerTrack.innerHTML;
}

/* ── SCROLL → sticky shadow ──────────────────── */
const hdr = $('siteHeader');
window.addEventListener('scroll', () => {
  hdr.classList.toggle('scrolled', window.scrollY > 50);
  $('backToTop').classList.toggle('visible', window.scrollY > 300);
}, { passive: true });


/* ── MEGA MENU (click-based, outside-click closes) ── */
const megaItems = document.querySelectorAll('.nav-item.has-mega'); 

megaItems.forEach(item => {
  const btn = item.querySelector('.nav-link');

  btn.addEventListener('click', e => {
    // Check current state once
    const isOpen = item.classList.contains('nav-open');
    
    // Logic for Mobile (<= 768px)
    if (window.innerWidth <= 768) {
      // If the menu is closed, prevent the link from navigating and open the menu instead
      if (!isOpen) {
        e.preventDefault();
        e.stopPropagation();
      } 
      // If the link is just a placeholder "#", always prevent navigation
      else if (btn.getAttribute('href') === '#') {
        e.preventDefault();
      }
    } else {
      // Desktop behavior: Always treat the top-level click as a toggle
      e.preventDefault();
      e.stopPropagation();
    }

    /* Close all other open mega menus */
    megaItems.forEach(i => {
      if (i !== item) {
        i.classList.remove('nav-open');
        i.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
      }
    });

    /* Toggle the clicked menu */
    const newState = !isOpen;
    item.classList.toggle('nav-open', newState);
    btn.setAttribute('aria-expanded', String(newState));
  });
});

/* Clicking outside closes any open menus */
document.addEventListener('click', () => {
  megaItems.forEach(i => {
    i.classList.remove('nav-open');
    i.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
  });
});

/* Clicking outside closes all menus */
document.addEventListener('click', () => {
  megaItems.forEach(i => {
    i.classList.remove('nav-open');
    i.querySelector('.nav-link').setAttribute('aria-expanded','false');
    i.querySelector('.mega-menu').setAttribute('aria-hidden','true');
  });
});

/* Escape key also closes */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    megaItems.forEach(i => {
      i.classList.remove('nav-open');
      i.querySelector('.nav-link').setAttribute('aria-expanded','false');
    });
    $('searchBar').classList.remove('open');
    $('mainNav').classList.remove('open');
    $('hamburger').classList.remove('open');
    $('hamburger').setAttribute('aria-expanded','false');
  }
});

/* ── HAMBURGER (mobile nav) ───────────────────── */
$('hamburger').addEventListener('click', () => {
  const isOpen = $('mainNav').classList.toggle('open');
  $('hamburger').classList.toggle('open', isOpen);
  $('hamburger').setAttribute('aria-expanded', String(isOpen));
});

/* ── SEARCH BAR ───────────────────────────────── */
/* Product data for live filtering */
const productData = [
  { name: 'Royal Blue — 100% Cotton Twill Coverall (Reflectorized)', cat:'Uniforms', price:'₱1,000', img:'Assets/Products/UNI-PR1-Front-Coverall (Blue).png'},
  { name: 'Orange — 100% Cotton Twill Coverall (Reflectorized)', cat:'Uniforms', price:'₱1,000', img:'Assets/Products/UNI-PR2-Front-Coverall (Orange).png'},
  { name: 'Khaki — 100% Cotton Twill Coverall (Reflectorized)', cat:'Uniforms', price:'₱1,000', img:'Assets/Products/UNI-PR3-Front-Coverall (Khaki).png'},
  
  { name: "Chef's Polo Long Sleeve",   cat:'Kitchen', price:'₱800', img:'Assets/Products/UNI-PR4-Front-Top1.png'},
  { name: "Chef's Polo Long Sleeve — 100% Cotton Twill ", cat:'Kitchen', price:'₱950', img:'Assets/Products/UNI-PR5-Front-Top2.png'},
  { name: "Kitchen Crew Polo", cat:'Kitchen', price:'₱800', img:'Assets/Products/UNI-PR6-Front-Top3.png'},
  
  { name: "Chef Pants", cat:'Kitchen', price:'₱500', img:'Assets/Products/UNI-PR7-Front-Pants1.png'},
  { name:"Kitchen Crew Checkered Pants", cat:'Kitchen', price:'₱500', img:'Assets/Products/UNI-PR8-Front-Pants2.png'},
  
  { name:'Winter Jacket - Reflectorized', cat:'Jacket', price:'₱1,500', img:'Assets/Products/UNI-PR10-Front-Jacket2.png'},
  { name:'Ordinary Jacket - Reflectorized', cat:'Jacket', price:'₱1,500', img:'Assets/Products/UNI-PR9-Front-Jacket1.png'},
  
  { name:"MG Safety (High Cut)", cat:'Safety Shoes', price:'₱1,500', img:'Assets/Products/SHO-PR1-Front-High Cut (MG Safety).png'},
  { name:'MG Safety (Low Cut)', cat:'Safety Shoes', price:'₱1,200', img:'Assets/Products/SHO-PR3-Front-Low Cut (MG Safety).png'},
  { name:'PPE - Shoes Rockwinner (Low Cut)', cat:'Safety Shoes', price:'₱1,200', img:'Assets/Products/SHO-PR2-Front-Low Cut (Rockwinner).png'  },
];

$('searchToggle').addEventListener('click', () => {
  const open = $('searchBar').classList.toggle('open');
  if (open) $('searchInput').focus();
  $('searchToggle').setAttribute('aria-expanded', String(open));
});

$('searchInput').addEventListener('input', () => {
  const q = $('searchInput').value.trim().toLowerCase();
  const res = $('searchResults');
  if (!q) { res.classList.remove('show'); res.innerHTML=''; return; }
  const hits = productData.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
  if (!hits.length) {
    res.innerHTML = `<p class="search-empty">No products found for "<strong>${q}</strong>"</p>`;
    res.classList.add('show');
    return;
  }
  res.innerHTML = hits.map(p =>
    `<div class="search-result-item" onclick="window.location.href='products.html'">
      <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/42x42/cccccc/666?text=?'"/>
      <div><span class="sri-name">${p.name}</span><span class="sri-cat">${p.cat} · ${p.price}</span></div>
    </div>`
  ).join('');
  res.classList.add('show');
});

/* ── THEME TOGGLE ─────────────────────────────── */
const themeIcon = $('themeIcon');
const html = document.documentElement;
(function initTheme() {
  const saved = localStorage.getItem('cssp-theme') || 'light';
  html.setAttribute('data-theme', saved);
  themeIcon.className = saved === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
})();
$('themeToggle').addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('cssp-theme', next);
  themeIcon.className = next === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
});


// currency system
const rates = {
  PHP: { symbol: '₱', rate: 1 },
  USD: { symbol: '$', rate: 0.018 },
  GBP: { symbol: '£', rate: 0.014 }
};

let currentCurrency = 'PHP';

const currencyBtn = $('currencyBtn');
const currencyDropdown = $('currencyDropdown');
const activeCurrency = $('activeCurrency');
const currencySwitcher = $('currencySwitcher');

if (currencyBtn && currencyDropdown) {
  currencyBtn.addEventListener('click', () => {
    currencyDropdown.classList.toggle('open');
  });
}

// close dropdown outside click
document.addEventListener('click', (e) => {
  if (currencySwitcher && !currencySwitcher.contains(e.target)) {
    currencyDropdown?.classList.remove('open');
  }
});

// currency selection
$$('#currencyDropdown li').forEach(item => {
  item.addEventListener('click', () => {
    const chosen = item.dataset.currency;
    currentCurrency = chosen;

    if (activeCurrency) {
      activeCurrency.textContent = chosen;
    }

    currencyDropdown?.classList.remove('open');

    $$('.card-price').forEach(el => {
      const base = parseFloat(el.dataset.base || "0");
      const { symbol, rate } = rates[chosen];

      el.textContent = symbol + (base * rate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    });
  });
});

/* ── CART (LocalStorage) ──────────────────────── */
function getCart() {
  const cart = localStorage.getItem('cssp-cart');
  return cart ? JSON.parse(cart) : [];
}

function updateCartBadge() {
  const cart = getCart();

  const totalQty = cart.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0);
  }, 0);

  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = totalQty;
}

updateCartBadge();

/* ── HISTORY SLIDER ────────────────────────── */
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

/* ── BACK TO TOP ──────────────────────────────── */
$('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── SCROLL REVEAL ────────────────────────────── */
$$('section').forEach(s => s.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: .1 });
$$('.reveal').forEach(el => revealObserver.observe(el));
