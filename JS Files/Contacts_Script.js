/* helper shortcuts */
const $ = id => document.getElementById(id);
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

function saveCart(cartItem) {
  let cart = JSON.parse(localStorage.getItem('cssp-cart')) || [];

  const existingItem = cart.find(item =>
    item.name === cartItem.name &&
    item.size === cartItem.size
  );

  if (existingItem) {

    const newTotal = existingItem.quantity + cartItem.quantity;

    if (newTotal > 50) {

      showToast(
        "warning",
        "Maximum Limit Reached",
        "You have reached the maximum limit of 50 items for this product. If you wish to order more than 50 pieces, please proceed to our Contact Page to connect with our team."
      );

      shakeModal();
      return false;
    }

    existingItem.quantity = newTotal;
  }

  else {
    if (cartItem.quantity > 50) {

      showToast(
        "warning",
        "Bulk Order Limit",
        "Maximum order per product is 50 pieces only. For bulk orders, please proceed to the Contact Page to get in touch with our team."
      );

      shakeModal();
      return false;
    }

    cart.push(cartItem);
  }

  localStorage.setItem('cssp-cart', JSON.stringify(cart));

  updateCartBadge();

  return true;
}

function updateCartBadge() {
  const cart = getCart();

  const totalQty = cart.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0);
  }, 0);

  const badge = $('cartBadge');

  if (badge) {
    badge.textContent = totalQty;
  }
}

updateCartBadge();

let images = [];
let index = 0;
let currentProductData = null;

function openCartModal(btn) {
  if (!btn) return;

  const card = btn.closest(".product-card");
  if (!card) return;

  const name = card.dataset.name;
  const type = card.dataset.type;
  const price = card.dataset.price;

  const priceEl = document.getElementById("modalProductPrice");

  if (priceEl) {
    const base = parseFloat(price);
    
    const { symbol, rate } = rates[currentCurrency] || { symbol: "₱", rate: 1 };

    priceEl.textContent = symbol + (base * rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const front = card.dataset.front;
  const back = card.dataset.back;
  const extra1 = card.dataset.extra1;
  const extra2 = card.dataset.extra2;

  currentProductData = {
    name,
    type,
    price: parseFloat(price),
    image: front || card.querySelector("img")?.src
  };

  document.getElementById("modalProductName").textContent = name;

/* ── CONTACTS NOTIF ────────────────────────── */
function showNotif(message, isSuccess = false) { 
  const notif = $('customNotif');  
  const notifMsg = $('notifMessage');  
  const notifIcon = $('notifIcon');
  if(!notif || !notifMsg) return;

  notifIcon.textContent = isSuccess ? "✅" : "⚠️";
  notifMsg.textContent = message;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3000);
}

function showInlineError(inputEl, errorId, msg) {
  const errorEl = $(errorId);
  if (inputEl) {
    inputEl.classList.add('shake');
    setTimeout(() => inputEl.classList.remove('shake'), 500);
  }
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }
}

if ($('contactName')) {
  $('contactName').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[0-9]/g, '');
  });
}

const cBtn = $('contactBtn'); 
if (cBtn) {
  cBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Reset errors
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(el => el.classList.remove('shake'));

    const nameEl = $('contactName');
    const emailEl = $('contactEmail');
    const msgEl = $('contactMsg');

    const name = nameEl.value.trim();    
    const email = emailEl.value.trim();
    const message = msgEl.value.trim();
    
    // Check missing fields (Phone removed from validation)
    if (!name || !email || !message) {       
      showNotif("Please fill out all required fields!"); 
      if(!name) showInlineError(nameEl, 'nameError', 'Name is required.');
      if(!email) showInlineError(emailEl, 'emailError', 'Email is required.');
      if(!message) showInlineError(msgEl, 'msgError', 'Message cannot be empty.');
      return; 
    }

    // Name validation
    const namePattern = /^[a-zA-Z\sñÑ]*$/; 
    if (!namePattern.test(name)) {
      return;
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|ph|io|me|info)$/i;
    if (!emailPattern.test(email)) {
      showInlineError(emailEl, 'emailError', 'Please enter a valid email address.');
      return;
    }

    // Success logic
    showNotif("Message sent successfully!", true);
    setTimeout(() => {         
      nameEl.value = "";          
      emailEl.value = "";
      msgEl.value = ""; 
    }, 1000);    
  });
}

/* ── BACK TO TOP ──────────────────────────────── */
$('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── SCROLL REVEAL ────────────────────────────── */
$$('section').forEach(s => s.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: .1 });
$$('.reveal').forEach(el => revealObserver.observe(el));
