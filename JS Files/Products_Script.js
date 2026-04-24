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


// toggles mobile nav and mega menu
const hamburger = $('hamburger');
const mainNav = $('mainNav');

if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mainNav.classList.toggle('open');
  });
}

// mega menu toggle for mobile
$$('.nav-item.has-mega .nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      link.closest('.nav-item')?.classList.toggle('open');
    }
  });
});

// toggles search bar and focuses input
const searchToggle = $('searchToggle');
const searchBar = $('searchBar');
const searchInput = $('searchInput');

if (searchToggle && searchBar && searchInput) {
  searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) {
      searchInput.focus();
    }
  });
}

// ESC key closes UI
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchBar?.classList.remove('open');
    mainNav?.classList.remove('open');
    hamburger?.classList.remove('open');
  }
});

// toggles light/dark mode and saves preference in localStorage
const themeToggle = $('themeToggle');
const themeIcon = $('themeIcon');
const htmlEl = document.documentElement;

if (htmlEl) {
  const savedTheme = localStorage.getItem('cssp-theme') || 'light';
  htmlEl.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';

    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('cssp-theme', next);
    updateThemeUI(next);
  });
}

// updates the theme toggle icon based on current theme
function updateThemeUI(theme) {
  if (theme === 'dark') {
    themeIcon.className = 'fa-solid fa-moon';
  } else {
    themeIcon.className = 'fa-solid fa-sun';
  }
}

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


// add item to cart and add the badge count
let cartCount = 0;
const cartBadge = $('cartBadge');

$$('.quick-add').forEach(btn => {
  btn.addEventListener('click', () => {
    cartCount++;

    if (cartBadge) {
      cartBadge.textContent = cartCount;

      cartBadge.style.transform = 'scale(1.4)';
      setTimeout(() => {
        cartBadge.style.transform = 'scale(1)';
      }, 200);
    }
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

let selectedProduct = null;

// OPEN MODAL
function openCartModal(btn) {
    const card = btn.closest('.product-card');

    const name = card.querySelector('.card-name').innerText;
    const category = card.querySelector('.card-category').innerText;

    selectedProduct = { name, category };

    document.getElementById('modalProductName').innerText = name;

    document.getElementById('modalProductDesc').innerText =
        `${category} • Premium quality, durable and designed for professional use.`;

    document.getElementById('modalSize').value = "";
    document.getElementById('modalQty').value = 1;

    document.getElementById('cartModal').classList.add('active');
}

// CLOSE MODAL
function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
}

// CONFIRM ADD TO CART
function confirmAddToCart() {
    const size = document.getElementById('modalSize').value;
    const qty = parseInt(document.getElementById('modalQty').value);

    if (!size) {
        alert("Please select a size");
        return;
    }

    const badge = document.getElementById('cartBadge');
    let count = parseInt(badge.innerText) || 0;

    badge.innerText = count + qty;

    closeCartModal();

    alert(`${selectedProduct.name} added to cart (${size}, x${qty})`);
}

// CLOSE WHEN CLICKING OUTSIDE BOX
document.getElementById('cartModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCartModal();
    }
});