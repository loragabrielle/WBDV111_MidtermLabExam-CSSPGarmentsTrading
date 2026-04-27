/* helper shortcuts */
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ── UTILS ─────────────────────────────────── */
function showToast(msg, type = 'default', duration = 3200) {
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', warning:'fa-triangle-exclamation', default:'fa-bell' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fa-solid ${icons[type] || icons.default}"></i>${msg}`;
  $('toastContainer').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 350); }, duration);
}

/* ── TICKER clone for infinite loop ─────────── */
const tickerTrack = $('tickerTrack');
if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;

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
  { name:'Coveralls (Blue)',   cat:'Uniforms',  price:'₱900',   img:'Assets/Products/UNI-PR1-Front-Coverall (Blue).JPG'   },
  { name:'Coveralls (Orange)', cat:'Uniforms',  price:'₱1,000', img:'Assets/Products/UNI-PR2-Front-Coverall (Orange).JPG' },
  { name:'Coveralls (Beige)',  cat:'Uniforms',  price:'₱950',   img:'Assets/Products/UNI-PR3-Front-Coverall (Beige).JPG'  },
  { name:"Chef's White Top",   cat:'Kitchen',   price:'₱800',   img:'Assets/Products/UNI-PR4-Front-Coverall (Chef\'s).JPG'},
  { name:'Full PPE Kit',       cat:'Safety',    price:'₱3,200', img:'https://placehold.co/42x42/e63946/fff?text=PPE'       },
  { name:'Safety Boot',        cat:'Footwear',  price:'₱1,800', img:'https://placehold.co/42x42/1a3a5c/f4d03f?text=Boot'  },
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

/* ── CURRENCY SWITCHER ────────────────────────── */
const rates = { PHP:{symbol:'₱',rate:1}, USD:{symbol:'$',rate:.018}, EUR:{symbol:'€',rate:.016} };
let currency = 'PHP';
$('currencyBtn').addEventListener('click', e => {
  e.stopPropagation();
  const open = $('currencyDropdown').classList.toggle('open');
  $('currencyBtn').setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', () => $('currencyDropdown').classList.remove('open'));
$$('#currencyDropdown li').forEach(li => {
  li.addEventListener('click', () => {
    currency = li.dataset.currency;
    $('activeCurrency').textContent = currency;
    $('currencyDropdown').classList.remove('open');
    $$('.card-price').forEach(el => {
      const base = parseFloat(el.dataset.base);
      const {symbol,rate} = rates[currency];
      el.textContent = symbol + (base*rate).toFixed(2);
    });
  });
});

/* ── HERO IMAGE SLIDESHOW LOGIC ──────────────── */
function initHeroImageRotation() {
  const frame = document.querySelector('.hero-image-frame');
  if (!frame) return;

  const images = frame.querySelectorAll('.hero-img-slide');
  let currentIndex = 0;

  setInterval(() => {
    // 1. Remove active class from current image
    images[currentIndex].classList.remove('img-active');

    // 2. Increment index (loop back to 0 if at the end)
    currentIndex = (currentIndex + 1) % images.length;

    // 3. Add active class to the next image
    images[currentIndex].classList.add('img-active');
  }, 3000); // 5000ms = 5 seconds
}

// Initialize the rotation
initHeroImageRotation();

/* ── FEATURED CARD → MODAL ────────────────────── */
$$('.featured-card').forEach(card => {
  function openModal() {
    const id = card.dataset.modal;
    const overlay = $(id);
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('.c-modal-close')?.focus();
  }
  card.addEventListener('click', openModal);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
});

/* Close modal buttons */
$$('.c-modal-close, .c-modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) {
      const overlay = el.closest('.c-modal-overlay') || el;
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
  });
});

/* ── CART (LocalStorage) ──────────────────────── */
function getCart() { return JSON.parse(localStorage.getItem('cssp_cart') || '[]'); }
function saveCart(c) { localStorage.setItem('cssp_cart', JSON.stringify(c)); }
function updateCartBadge() {
  const n = getCart().reduce((s,i) => s + i.qty, 0);
  $('cartBadge').textContent = n;
  $('cartBadge').style.transform = 'scale(1.5)';
  setTimeout(() => $('cartBadge').style.transform = '', 200);
}
updateCartBadge();

$$('.quick-add').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const card = btn.closest('.product-card');
    const name  = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const img   = card.dataset.img || '';
    const size  = card.querySelector('.size-select')?.value || 'One Size';
    const cart  = getCart();
    const key   = name + '-' + size;
    const found = cart.find(i => i.key === key);
    if (found) { found.qty++; }
    else { cart.push({ key, name, price, img, size, qty:1 }); }
    saveCart(cart);
    updateCartBadge();
    showToast(`<strong>${name}</strong> added to cart!`, 'success');
  });
});

$('cartIconBtn').addEventListener('click', () => {
  window.location.href = 'cart.html';
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
  }, 3000);
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

/* ── FAQ ACCORDION ────────────────────────────── */
$$('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    $$('.faq-item.open').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-q').setAttribute('aria-expanded','false'); });
    if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
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
