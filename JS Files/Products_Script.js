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

// global variables for modal image switching
let images = [];
let index = 0;

// opens the cart modal and puts the correct product info 
function openCartModal(btn) {
  let card = btn.closest(".product-card");

  let name = card.dataset.name;
  let desc = card.dataset.desc;
  let type = card.dataset.type; 

  let front = card.dataset.front;
  let back = card.dataset.back;
  let extra1 = card.dataset.extra1;
  let extra2 = card.dataset.extra2;

  // show product info
  document.getElementById("modalProductName").textContent = name;
  document.getElementById("modalProductDesc").textContent = desc;

  // for the size options (based on what product card ang pinindot)
  const sizeSelect = document.getElementById("modalSize");

  sizeSelect.innerHTML = `<option value="" disabled selected>Select size</option>`;

  if (type === "Uniforms") {
    sizeSelect.innerHTML += `
      <option value="S">Small</option>
      <option value="M">Medium</option>
      <option value="L">Large</option>
      <option value="XL">Extra Large</option>
      <option value="XXL">Double Extra Large</option>
    `;
  }

  if (type === "Shoes") {
    sizeSelect.innerHTML += `
      <option value="41">41</option>
      <option value="42">42</option>
      <option value="43">43</option>
      <option value="44">44</option>
      <option value="45">45</option>
      <option value="45">46</option>
    `;
  }

  // reset images
  images = [];
    if (extra1) images.push(extra1);
    if (extra2) images.push(extra2);
    if (front) images.push(front);
    if (back) images.push(back);

    // fallback image
    if (images.length == 0) {
      let img = card.querySelector("img");
      images.push(img.src);
    }

    index = 0;
    document.getElementById("modalImage").src = images[index];

    // show modal
    document.getElementById("cartModal").classList.add("active");
}

// closes the cart modal (yung x na button)
function closeCartModal() {
  document.getElementById("cartModal").classList.remove("active");
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

// add to cart confirmation (for size and quantity)
function confirmAddToCart() {
  let size = document.getElementById("modalSize").value;
  let qty = Number(document.getElementById("modalQty").value);

  let sizeNotif = document.getElementById("sizeNotif");
  let qtyNotif = document.getElementById("qtyNotif");

  let hasError = false;

    // reset first
    if (sizeNotif) sizeNotif.style.display = "none";
    if (qtyNotif) qtyNotif.style.display = "none";
    
    // size check
    if (size == "") {
      sizeNotif.textContent = "⚠ Please select a size before adding to cart.";
      sizeNotif.style.display = "block";

        setTimeout(() => {
          sizeNotif.style.display = "none";
        }, 2000);
      
      shakeModal();
      hasError = true;
    }

    // quantity check
    if (qty <= 0) {
      qtyNotif.textContent = "⚠ Quantity must be at least 1.";
      qtyNotif.style.display = "block";

        setTimeout(() => {
            qtyNotif.style.display = "none";
        }, 2000);

      shakeModal();
      hasError = true;
    } 
    
    else if (qty > 50) {
      qtyNotif.textContent = "⚠ Maximum order per product is 50 pieces only. For bulk orders, please proceed to the Contact Page to get in touch with our team.";
      qtyNotif.style.display = "block";

        setTimeout(() => {
          qtyNotif.style.display = "none";
        }, 2000);
        
      shakeModal();
      hasError = true;
    }

    // stop only if error exists
    if (hasError) return;

    // success add to cart
    let badge = document.getElementById("cartBadge");

    if (badge) {
      badge.textContent = Number(badge.textContent) + qty;
    }

    closeCartModal();
    showSuccessModal();
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