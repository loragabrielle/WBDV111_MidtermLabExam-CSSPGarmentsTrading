/* helper shortcuts */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ── TICKER clone for infinite loop ─────────── */
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

/* ── BACK TO TOP ──────────────────────────────── */
$('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── SCROLL REVEAL ────────────────────────────── */
$$('section').forEach(s => s.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: .1 });
$$('.reveal').forEach(el => revealObserver.observe(el));
