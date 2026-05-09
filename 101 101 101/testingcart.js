function updateCartBadgeGlobal() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let badge = document.getElementById("cartBadge");

  if (!badge) return;

  let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalQty;
}

console.log("CART JS LOADED");

// helper functions for easier element selection
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ticker duplication logic
const tickerTrack = $('tickerTrack');
if (tickerTrack) {
  tickerTrack.innerHTML += tickerTrack.innerHTML;
}

// adds shadow to header after scrolling down 50px
const header = $('siteHeader');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

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
  EUR: { symbol: '€', rate: 0.016 }
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

      el.textContent = symbol + (base * rate).toFixed(2);
    });
  });
});

// back to top button logic
const backBtn = $('backToTop');

if (backBtn) {
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > 300);
  });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// section reveal transitions
const style = document.createElement('style');
style.textContent = `
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
`;
document.head.appendChild(style);

$$('section').forEach(sec => sec.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

$$('.reveal').forEach(el => observer.observe(el));

// add to cart function
function addToCart() {
  const cartBadge = $('cartBadge');
  if (!cartBadge) return;

  let count = parseInt(cartBadge.textContent || "0");
  cartBadge.textContent = count + 1;

  alert('Added to Cart Successfully!');
}

// =========================================================================
const cartItemsList = document.getElementById("cartItemsList");
const emptyCart = document.getElementById("emptyCart");
const cartContent = document.getElementById("cartContent");

function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const emptyCart = document.getElementById("emptyCart");
  const cartContent = document.getElementById("cartContent");
  const cartItemsList = document.getElementById("cartItemsList");

  if (cart.length === 0) {
    emptyCart.style.display = "block";
    cartContent.style.display = "none";
    return;
  }

  emptyCart.style.display = "none";
  cartContent.style.display = "flex";

  cartItemsList.innerHTML = "";

  cart.forEach((item, index) => {
    cartItemsList.innerHTML += `
      <div class="cart-item">

        <!-- checkbox -->
        <input type="checkbox" class="item-check" onchange="updateSummary()">

        <!-- image -->
        <img src="${item.image}" class="cart-img">

        <!-- details -->
        <div class="cart-info">
          <h3>${item.name}</h3>

          <div class="cart-meta">
            <span>Size: ${item.size}</span>
          </div>

          <div class="cart-price">₱${item.price}</div>
        </div>

        <!-- qty -->
        <div class="qty-controls">
          <button onclick="changeQty(${index}, -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${index}, 1)">+</button>
        </div>

        <!-- remove -->
        <button class="remove-btn" onclick="removeItem(${index})">
          <i class="fa-solid fa-trash"></i> Remove
        </button>

      </div>
    `;
  });

  updateSummary();
  updateCartBadge();
}

function changeQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart[index].qty = Number(cart[index].qty) + change;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartBadge();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartBadge();
}

function updateSummary() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let total = 0;
  let count = 0;

  const items = document.querySelectorAll(".cart-item");

  items.forEach((item, i) => {
    const checkbox = item.querySelector(".item-check");

    if (checkbox?.checked) {
      total += cart[i].price * cart[i].qty;
      count += cart[i].qty;
    }
  });

  document.getElementById("subtotalAmount").textContent = "₱" + total.toFixed(2);
  document.getElementById("totalAmount").textContent = "₱" + total.toFixed(2);
  document.getElementById("selectedCount").textContent = count;
  document.getElementById("totalItems").textContent = count;
}

function toggleSelectAll() {
  const selectAll = document.getElementById("selectAll").checked;
  document.querySelectorAll(".item-check").forEach(cb => {
    cb.checked = selectAll;
  });
  updateSummary();
}

function openCheckout() {
  alert("Checkout coming soon!");
}

function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let badge = document.getElementById("cartBadge");
  if (!badge) return;

  let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalQty;
}

updateCartBadge();

loadCart();