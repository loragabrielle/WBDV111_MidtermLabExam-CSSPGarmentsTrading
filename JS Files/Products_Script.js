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

      el.textContent = symbol + (base * rate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
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

// toast notification 


// add to cart function
function getCart() {
  const cart = localStorage.getItem('cssp-cart');
  return cart ? JSON.parse(cart) : [];
}

// function saveCart(cartItem) {
//  let cart = JSON.parse(localStorage.getItem('cssp-cart')) || [];

//  cart.push(cartItem);

// localStorage.setItem('cssp-cart', JSON.stringify(cart));

//  updateCartBadge();
// }

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

  const featuresBox = document.getElementById("modalFeatures");

  if (featuresBox) {
    let features = [];

    if (name.includes("Coverall")) {
      features = [
        "Reflectorized Safety Design",
        "Heavy Duty Cotton Twill",
        "Trusted for Deck Operations"
      ];
    }

    else if (
      name.includes("Chef's Polo Long Sleeve") ||
      name.includes("Kitchen Crew Polo")
    ) {
      features = [
        "Heatproof Uniform for Cooking Environments",
        "Breathable Fabric for Hot Kitchens",
        "Comfortable Fit for Long Shifts"
      ];
    }

    else if (
      name.includes("Chef's Pants") ||
      name.includes("Checkered Pants")
    ) {
      features = [
        "Heat-Resistant Fabric for High Heat Kitchens",
        "Protective Design for Safety in Cooking",
        "Reinforced Stitching for Durability"
      ];
    }

    else if (
      name.includes("Winter Jacket") ||
      name.includes("Ordinary Jacket")
    ) {

      features = [
        "Reflectorized Design for Night Visibility",
        "Wind-Resistant Outer Layer",
        "Durable Stitching for Long-Term Use"
      ];

      if (name.includes("Winter Jacket")) {
        features[1] = "Insulated + Wind-Resistant Protection for Cold Weather";
      }

      else if (name.includes("Ordinary Jacket")) {
        features[1] = "Lightweight Wind-Resistant Protection for Daily Wear";
      }
    }

    else if (name.includes("MG Safety (High Cut)")) {
      features = [
        "Steel Toe Cap Protection",
        "High-Cut Design for Ankle Support",
        "Puncture-Resistant Midsole"
      ];
    }

    else if (
      name.includes("Rockwinner") ||
      name.includes("MG Safety (Low Cut)")
    ) {
      features = [
        "Low-Cut Design for Lightweight Movement",
        "Steel Toe Protection",
        "Slip-Resistant Outsole for Stable Grip"
      ];
    }

    featuresBox.innerHTML = features.map(item => `
      <div class="feature-item">
        <i class="fa-solid fa-circle-check"></i> ${item}
      </div>
    `).join("");
  }

  const materialBox = document.getElementById("modalMaterial");
  const material = card.dataset.material;

  if (materialBox) {
    materialBox.innerHTML = material
      ? material.split(",").map(item => `
          <div class="care-item">
            <i class="fa-solid fa-layer-group"></i>
            <span>${item.trim()}</span>
          </div>
        `).join("")
      : `<div class="care-item">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>No material info available.</span>
        </div>`;
  }

  const careBox = document.getElementById("modalCare");

  let care = [];

  if (name.includes("Coverall")) {
    care = [
      "Machine wash cold",
      "Do not bleach",
      "Tumble dry low",
      "Iron on medium heat if needed"
    ];
  }

  else if (name.includes("Chef") || name.includes("Kitchen")) {
    care = [
      "Wash after every use",
      "Use mild detergent",
      "Do not use harsh bleach",
      "Air dry recommended"
    ];
  }

  else if (name.includes("Jacket")) {
    care = [
      "Dry clean recommended",
      "Do not wring",
      "Hang dry only",
      "Avoid high heat ironing"
    ];
  }

  else if (name.includes("MG Safety") || name.includes("Rockwinner")) {
    care = [
      "Wipe with damp cloth",
      "Do not machine wash",
      "Air dry only",
      "Keep away from direct heat"
    ];
  }

  if (careBox) {
    const careIcons = {
      wash: "fa-solid fa-soap",
      dry: "fa-solid fa-wind",
      iron: "fa-solid fa-temperature-high",
      bleach: "fa-solid fa-flask",
      warning: "fa-solid fa-triangle-exclamation"
    };

    careBox.innerHTML = care.map(item => {
      let icon = careIcons.warning;

      if (item.toLowerCase().includes("wash")) icon = careIcons.wash;
      else if (item.toLowerCase().includes("dry")) icon = careIcons.dry;
      else if (item.toLowerCase().includes("iron")) icon = careIcons.iron;
      else if (item.toLowerCase().includes("bleach")) icon = careIcons.bleach;

      return `
        <div class="care-item">
          <i class="${icon}"></i>
          <span>${item}</span>
        </div>
      `;
    }).join("");
  }

  const sizeSelect = document.getElementById("modalSize");
  sizeSelect.innerHTML = `<option value="" disabled selected>Select size</option>`;

  if (type === "Uniforms") {
    sizeSelect.innerHTML += `
      <option value="S">Small</option>
      <option value="M">Medium</option>
      <option value="L">Large</option>
      <option value="XL">XL</option>
      <option value="XXL">XXL</option>
    `;
  }

  if (type === "Shoes") {
    sizeSelect.innerHTML += `
      <option value="41">41</option>
      <option value="42">42</option>
      <option value="43">43</option>
      <option value="44">44</option>
      <option value="45">45</option>
    `;
  }

  images = [];
  if (extra1) images.push(extra1);
  if (extra2) images.push(extra2);
  if (front) images.push(front);
  if (back) images.push(back);
  

  if (images.length === 0) {
    const img = card.querySelector("img");
    if (img) images.push(img.src);
  }

  index = 0;
  document.getElementById("modalImage").src = images[0] || "";

  document.getElementById("modalQty").value = 1;

  document.getElementById("cartModal").classList.add("active");
}

// closes the cart modal (yung x na button)
function closeCartModal() {
  document.getElementById("cartModal").classList.remove("active");
  currentProductData = null;
}

// next image in the modal carousel (yung right arrow)
function nextImage() {
  if (images.length == 0) return;
    index++;

    if (index >= images.length) {
      index = 0;
    }

    document.getElementById("modalImage").src = images[index];
}

// previous image in the modal carousel (yung left arrow)
function prevImage() {
  if (images.length == 0) return;
  index--;

    if (index < 0) {
      index = images.length - 1;
    }

    document.getElementById("modalImage").src = images[index];
}

function confirmAddToCart() {

  const container = document.getElementById("toastContainer");
  container.innerHTML = ""; 

  const size = document.getElementById("modalSize").value;
  const qty = Number(document.getElementById("modalQty").value);

  let errors = [];

  if (size === "") {
    errors.push({
      type: "error",
      title: "No Size Selected",
      message: "Please select a size before adding to cart."
    });
  }

  if (qty <= 0) {
    errors.push({
      type: "warning",
      title: "Invalid Quantity",
      message: "Quantity must be at least 1."
    });
  }

  if (qty > 50) {
    errors.push({
      type: "warning",
      title: "Bulk Order Limit",
      message: "Maximum order per product is 50 pieces only. For bulk orders, please proceed to the Contact Page to get in touch with our team."
    });
  }

  if (errors.length > 0) {
    shakeModal();
    errors.forEach(err => showToast(err.type, err.title, err.message));
    return;
  }

  const cart = getCart();

  const existingQty = cart
    .filter(item =>
      item.name === currentProductData.name &&
      item.size === size
    )
    .reduce((total, item) => total + item.quantity, 0);

  const totalQty = existingQty + qty;
  const remaining = 50 - existingQty;

  if (totalQty > 50) {
    showToast(
      "warning",
      "Maximum Limit Reached",
      `You already have ${existingQty} item(s) of this product in your cart. You can only add ${remaining} more piece(s). Adding ${qty} more would exceed the limit of 50. For bulk orders, please proceed to the Contact Page to get in touch with our team.`
    );
    shakeModal();
    return;
  }
  
  const cartItem = {
    id: Date.now(),
    name: currentProductData.name,
    price: currentProductData.price,
    image: currentProductData.image,
    size,
    quantity: qty
  };

  const added = saveCart(cartItem);

    if (added) {
    showSuccessModal();

    setTimeout(() => {
      closeCartModal();
    }, 2000);
  }
}

function showToast(type, title, message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon =
    type === "success"
      ? "fa-check"
      : type === "error"
      ? "fa-xmark"
      : "fa-triangle-exclamation";

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fa-solid ${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  const timeoutId = setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 3000);

  const closeBtn = toast.querySelector(".toast-close");

  closeBtn.addEventListener("click", () => {
    clearTimeout(timeoutId);

    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  });
}

function showSuccessModal() {
    const modal = document.getElementById("successModal");

    modal.classList.add("active");

    setTimeout(() => {
      modal.classList.remove("active");
    }, 2000);
}

function shakeModal() {
  const box = document.querySelector(".cart-box");

  box.classList.remove("shake"); 
  void box.offsetWidth; 
  box.classList.add("shake");

  setTimeout(() => {
    box.classList.remove("shake");
  }, 400);
}

const cartModal = document.getElementById("cartModal");

cartModal.addEventListener("click", function (e) {
  if (e.target === cartModal) {
    closeCartModal();
  }
});
