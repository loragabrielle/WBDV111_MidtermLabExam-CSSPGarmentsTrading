/* helper shortcuts */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

/* ticker "+=" = infinite effect  */
const tickerTrack = $('tickerTrack');
if (tickerTrack) {
  tickerTrack.innerHTML += tickerTrack.innerHTML;
}

/* shadow after 50px and back to top*/ 
const hdr = $('siteHeader');
window.addEventListener('scroll', () => {
  hdr.classList.toggle('scrolled', window.scrollY > 50);
  $('backToTop').classList.toggle('visible', window.scrollY > 300);
}, { passive: true });
const html = document.documentElement;
const themeToggle = $('themeToggle');


const savedTheme = localStorage.getItem('themeMode') || localStorage.getItem('cssp-theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon();

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('themeMode', next);
  localStorage.setItem('cssp-theme', next);
  updateThemeIcon();
});

function updateThemeIcon() {
  const icon = themeToggle?.querySelector('i');
  if (icon) {
    icon.className = html.getAttribute('data-theme') === 'light' 
      ? 'fa-solid fa-sun' 
      : 'fa-solid fa-moon';
  }
}

/* currency switch */
let currentCurrency = localStorage.getItem('selectedCurrency') || localStorage.getItem('cssp-currency') || 'PHP';

const currencyRates = {
  PHP: 1,
  USD: 0.018,
  GBP: 0.014
};

const currencySymbols = {
  PHP: '₱',
  USD: '$',
  GBP: '£'
};

function formatPrice(amount, { currency = currentCurrency, convert = true } = {}) {
  const rawAmount = Number(amount);
  const safeAmount = Number.isFinite(rawAmount) ? rawAmount : 0;
  const rate = currencyRates[currency] ?? 1;
  const symbol = currencySymbols[currency] ?? '$';
  const converted = convert ? safeAmount * rate : safeAmount;
  const safeConverted = Number.isFinite(converted) ? converted : safeAmount;
  return `${symbol}${safeConverted.toFixed(2)}`;
}

function formatShippingLabelPrice(type) {
  const standardUsd = 5;
  const expressUsd = 8;

  if (destinationType === 'national') {
    return type === 'express' ? '₱250' : '₱150';
  }

  const amountUsd = type === 'express' ? expressUsd : standardUsd;
  if (currentCurrency === 'GBP') {
    const usdToGbp = Number.isFinite(currencyRates.GBP) && Number.isFinite(currencyRates.USD)
      ? currencyRates.GBP / currencyRates.USD
      : 0.78;
    const value = Number(amountUsd);
    const converted = Number.isFinite(value) && Number.isFinite(usdToGbp) ? value * usdToGbp : null;
    return converted !== null ? `£${converted.toFixed(2)}` : `$${amountUsd.toFixed(2)}`;
  }

  return `$${amountUsd.toFixed(2)}`;
}

function getShippingFeeAmount(type) {
  if (destinationType === 'national') {
    return type === 'express' ? 250 : 150;
  }

  const amountUsd = type === 'express' ? 8 : 5;
  const usdRate = currencyRates.USD || 0.018;
  const phpAmount = amountUsd / usdRate;
  return Number.isFinite(phpAmount) ? phpAmount : (type === 'express' ? 250 : 150);
}

const TAX_RATE = 0.0;
let lastRemovedItem = null;

function updateCurrencyDisplay() {
  const el = $('activeCurrency');
  if (el) el.textContent = currentCurrency;
  $$('#currencyDropdown li').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === currentCurrency);
  });
  renderCart();
  updateShippingDisplay();
  updateCartSummary();
  updateShippingRatesDisplay();
  validateCurrencyShippingMatch();
}


let lastShippingCurrencyMismatch = null;

function getCurrencyShippingMismatch() {
  if (!destinationType) return null;

  if (destinationType === 'international' && currentCurrency === 'PHP') {
    return {
      type: 'international-php',
      message: 'International shipping does not match PHP currency. For international delivery, switch to USD or GBP, or choose Philippines shipping.',
      recommendedCurrency: 'USD'
    };
  }

  if (destinationType === 'national' && currentCurrency !== 'PHP') {
    return {
      type: 'domestic-foreign',
      message: 'Domestic shipping should be paid in PHP. Switch to Philippine Peso or choose international shipping for foreign delivery.',
      recommendedCurrency: 'PHP'
    };
  }
  
  return null;
}

function removeExistingMismatchToast() {
  const container = $('toastContainer');
  if (!container) return;
  container.querySelectorAll('.shipping-mismatch-toast').forEach(toast => toast.remove());
}

function validateCurrencyShippingMatch({ forceToast = false } = {}) {
  const mismatch = getCurrencyShippingMismatch();
  const mismatchKey = mismatch ? mismatch.type : 'ok';

  if (mismatchKey === lastShippingCurrencyMismatch && !forceToast) {
    return;
  }

  lastShippingCurrencyMismatch = mismatchKey;
  removeExistingMismatchToast();

  if (!mismatch) {
    return;
  }

  showToast(
    'warning',
    'Shipping / Currency Mismatch',
    mismatch.message,
    `Switch to ${mismatch.recommendedCurrency}`,
    () => {
      currentCurrency = mismatch.recommendedCurrency;
      localStorage.setItem('selectedCurrency', currentCurrency);
      localStorage.setItem('cssp-currency', currentCurrency);
      updateCurrencyDisplay();
      updateShippingRatesDisplay();
    },
    'shipping-mismatch-toast'
  );
}

/* currency dropdown toggle */
$('currencyBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  $('currencyDropdown').classList.toggle('open');
});

/* currency selection */ 
$$('#currencyDropdown li').forEach(item => {
  item.addEventListener('click', () => {
    currentCurrency = item.dataset.currency;
    localStorage.setItem('selectedCurrency', currentCurrency);
    localStorage.setItem('cssp-currency', currentCurrency);
    updateCurrencyDisplay();
    updateShippingRatesDisplay();
    validateCurrencyShippingMatch({ forceToast: true });
    $('currencyDropdown').classList.remove('open');
  });
});

document.addEventListener('click', () => {
  $('currencyDropdown')?.classList.remove('open');
});

window.addEventListener('storage', (event) => {
  if (event.key === 'cssp-cart') {
    renderCart();
    updateCartBadge();
  }

  if (event.key === 'selectedCurrency' || event.key === 'cssp-currency') {
    currentCurrency = localStorage.getItem('selectedCurrency') || localStorage.getItem('cssp-currency') || currentCurrency;
    updateCurrencyDisplay();
  }

  if (event.key === 'themeMode' || event.key === 'cssp-theme') {
    const saved = localStorage.getItem('themeMode') || localStorage.getItem('cssp-theme') || 'light';
    html.setAttribute('data-theme', saved);
    updateThemeIcon();
  }
});

/* search bar */ 
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

/* toast notification */
function showToast(type, title, message, actionLabel, actionCallback, customClass) {
  const container = $('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  if (customClass) toast.classList.add(customClass);
  
  const icon = type === 'success' ? 'fa-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-exclamation-triangle';
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fa-solid ${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <div class="toast-actions"></div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  const actions = toast.querySelector('.toast-actions');
  if (actionLabel && typeof actionCallback === 'function' && actions) {
    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'toast-action';
    actionBtn.textContent = actionLabel;
    actionBtn.addEventListener('click', () => {
      actionCallback();
      toast.remove();
    });
    actions.appendChild(actionBtn);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 100);
    }
  }, 1000);
}

function getCart() {
  const cart = localStorage.getItem('cssp-cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('cssp-cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = $('cartBadge');
  if (badge) {
    badge.textContent = totalQty;
  }
}

function calculateTotal(cart) {
  const selected = cart.filter(item => item.selected);
  return selected.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function toggleSelectAll() {
  const selectAll = $('selectAll').checked;
  let cart = getCart();
  
  cart = cart.map(item => ({
    ...item,
    selected: selectAll
  }));
  
  saveCart(cart);
  renderCart();
}

function toggleItemSelection(id) {
  let cart = getCart();
  
  cart = cart.map(item => {
    if (item.id === id) {
      item.selected = !item.selected;
    }
    return item;
  });
  
  saveCart(cart);
  renderCart();
  updateCartSummary();
}

function deleteSelectedItems() {
  let cart = getCart();
  const selected = cart.filter(item => item.selected);
  if (selected.length === 0) {
    showToast('error', 'No Items Selected', 'Please select items before deleting');
    return;
  }
  cart = cart.filter(item => !item.selected);
  saveCart(cart);
  renderCart();
  updateCartSummary();
  showToast('success', 'Deleted Selected Items', `${selected.length} item(s) were deleted`);
}

function updateQuantity(id, type) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  if (type === 'increase') {
    if (item.quantity < 50) {
      item.quantity++;
      saveCart(cart);
      renderCart();
    } else {
      showToast('warning', 'Quantity Limit', 'Bulk orders above 50 pieces require direct contact. Visit the Contact Us page or email csspgarments@gmail.com');
    }
  } else if (type === 'decrease') {
    if (item.quantity > 1) {
      item.quantity--;
      saveCart(cart);
      renderCart();
    } else {
      removeItem(id);
    }
  }
}

function handleQuantityInput(event) {
  const input = event.target;
  const cleaned = input.value.replace(/[^0-9]/g, '');
  input.value = cleaned;
}

function setItemQuantity(id, value) {
  let qty = Number(value);
  if (!Number.isInteger(qty) || qty < 1) qty = 1;

  if (qty > 50) {
    qty = 50;
    showToast('warning', 'Quantity Limit', 'Bulk orders above 50 pieces require direct contact. Visit the Contact Us page or email csspgarments@gmail.com');
  }

  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity = qty;
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  
  // Store removed item with full state including selected
  lastRemovedItem = { ...item };
  
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();

  showToast(
    'success',
    'Item Removed',
    `${item.name} was removed`,
    'Undo',
    () => {
      if (lastRemovedItem) {
        const restoredCart = getCart();
        restoredCart.push({ ...lastRemovedItem });
        saveCart(restoredCart);
        renderCart();
        showToast('success', 'Restored', `${lastRemovedItem.name} has been restored`);
        lastRemovedItem = null;
      }
    }
  );
}

function renderCart() {
  const cart = getCart();
  const itemsList = $('cartItemsList');
  const emptyCart = $('emptyCart');
  const cartContent = $('cartContent');
  const selectAll = $('selectAll');

  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    cartContent.style.display = 'none';
    return;
  }

  emptyCart.style.display = 'none';
  cartContent.style.display = 'grid';

  // sync select all checkbox state
  const allSelected = cart.length > 0 && cart.every(item => item.selected);
  selectAll.checked = allSelected;

  const bulkActions = $('bulkActions');
  if (bulkActions) {
    bulkActions.style.display = 'flex';
  }

  itemsList.innerHTML = cart.map(item => {
    const productType = item.type && item.type !== 'undefined' && item.type !== 'null'
      ? item.type
      : (item.category || item.productType || 'Uniform');
    return `
    <div class="cart-item">
      <div class="cart-item-checkbox">
        <input type="checkbox" class="cart-checkbox" ${item.selected ? 'checked' : ''} 
               onchange="toggleItemSelection(${item.id})">
      </div>
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">
          <span><i class="fa-solid fa-tag"></i> ${productType}</span>
          <span><i class="fa-solid fa-ruler"></i> Size: ${item.size}</span>
        </div>
        <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-controls">
          <button onclick="updateQuantity(${item.id}, 'decrease')" title="${item.quantity === 1 ? 'Remove item' : 'Decrease'}">
            <i class="fa-solid fa-minus"></i>
          </button>
          <input type="number" min="1" max="50" value="${item.quantity}"
                 oninput="handleQuantityInput(event)"
                 onchange="setItemQuantity(${item.id}, this.value)"
                 aria-label="Quantity for ${item.name} ${item.size}">
          <button onclick="updateQuantity(${item.id}, 'increase')">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <button class="remove-item" onclick="removeItem(${item.id})">
          <i class="fa-solid fa-trash"></i>
          Remove
        </button>
      </div>
    </div>
  `;
  }).join('');

  // update summary counts
  const selectedItems = cart.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const summaryList = $('selectedItemsList');
  if (summaryList) {
    if (selectedItems.length === 0) {
      summaryList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No items selected</p>';
    } else {
      summaryList.innerHTML = selectedItems.map(item => {
        const productType = item.type && item.type !== 'undefined' && item.type !== 'null'
          ? item.type
          : (item.category || item.productType || 'Shoes');
        return `
        <div class="summary-item-card">
          <div class="summary-item-thumb">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="summary-item-details">
            <div class="summary-item-title">${item.name}</div>
            <div class="summary-item-meta">
              <span>${productType}</span>
              <span>Size: ${item.size}</span>
            </div>
          </div>
          <div class="summary-item-side">
            <span class="summary-item-badge">Qty ${item.quantity}</span>
            <span class="summary-item-price">${formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      `;
      }).join('');
    }
  }
  
  $('subtotalAmount').textContent = formatPrice(subtotal);
  $('totalItems').textContent = selectedCount;
  $('selectedCount').textContent = selectedItems.length;
  updateCartSummary();
  
  // update bulk action buttons state
  const deleteBtn = $('deleteSelectedBtn');
  if (deleteBtn) deleteBtn.disabled = selectedItems.length === 0;
}

function updateCartSummary() {
  const cart = getCart();
  const selectedItems = cart.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let shippingValue = destinationType && deliveryType ? shippingFee : 0;
  if (voucherType === 'freeship') shippingValue = 0;

  const taxValue = subtotal * TAX_RATE;
  const discountValue = voucherType === 'percentage' ? subtotal * (voucherDiscount / 100) : 0;
  const total = subtotal + shippingValue + taxValue - discountValue;

  // update main cart summary
  const subtotalEl = $('subtotalAmount');
  const shippingEl = $('shippingAmount');
  const taxEl = $('taxAmount');
  const totalEl = $('totalAmount');
  const discountRowEl = $('discountRow');
  const discountAmountEl = $('discountAmount');
  
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = formatPrice(shippingValue);
  if (taxEl) taxEl.textContent = formatPrice(taxValue);
  if (totalEl) totalEl.textContent = formatPrice(total);
  validateCurrencyShippingMatch();

  if (discountRowEl) {
    if (discountValue > 0) {
      discountRowEl.style.display = 'flex';
      if (discountAmountEl) discountAmountEl.textContent = `-${formatPrice(discountValue)}`;
    } else {
      discountRowEl.style.display = 'none';
    }
  }
}

/* checkout system */
let currentStep = 1;
let selectedPaymentMethod = null;
let selectedShippingMethod = null;
let shippingFee = 0;
let voucherDiscount = 0;
let voucherType = null;
let voucherCode = null;
let orderData = {};

// shipping upgrade variables
let destinationType = null; // 'national' or 'international'
let deliveryType = null; // 'standard' or 'express'
let shippingSelectedRegion = ''; // for shipping region selector
let destinationTypeLocked = false;

// location data storage
let cityData = [];
let barangayData = [];

function openCheckout() {
  const cart = getCart();
  const selectedItems = cart.filter(item => item.selected);
  
  if (selectedItems.length === 0) {
    showToast('error', 'No Items Selected', 'Please select items to checkout');
    return;
  }
  
  currentStep = 1;
  showStep(1);
  $('checkoutModal').classList.add('active');
}

function renderCheckoutItems() {
  const cart = getCart();
  const selectedItems = cart.filter(item => item.selected);
  const container = $('checkoutItemsList');
  if (!container) return;

  if (selectedItems.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted);">No items selected.</p>';
    return;
  }

  container.innerHTML = selectedItems.map(item => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:var(--bg-alt); border-radius:var(--radius-sm); border:1px solid var(--border);">
      <div>
        <div style="font-weight:700; font-size:0.95rem;">${item.name}</div>
        <div style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">
          ${item.type} &nbsp;·&nbsp; Size: ${item.size} &nbsp;·&nbsp; Qty: ${item.quantity}
        </div>
      </div>
      <div style="font-weight:700; color:var(--navy); font-size:0.95rem;">${formatPrice(item.price * item.quantity)}</div>
    </div>
  `).join('');
}

function updateCheckoutSummary() {
  const cart = getCart();
  const selectedItems = cart.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discount = 0;
  if (voucherType === 'percentage') discount = subtotal * (voucherDiscount / 100);

  let shipping = 0;
  if (deliveryType && destinationType) shipping = shippingFee;
  if (voucherType === 'freeship') shipping = 0;

  const total = subtotal - discount + shipping;

  const subtotalEl = $('checkoutSubtotal');
  const shippingEl = $('checkoutShipping');
  const totalEl = $('checkoutTotal');
  const discountRowEl = $('discountRow');
  const discountAmountEl = $('discountAmount');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping > 0 ? formatPrice(shipping) : (deliveryType ? formatPrice(0) : '—');
  if (totalEl) totalEl.textContent = formatPrice(total);
  validateCurrencyShippingMatch();

  if (discountRowEl) {
    if (discount > 0) {
      discountRowEl.style.display = 'flex';
      if (discountAmountEl) discountAmountEl.textContent = `-${formatPrice(discount)}`;
    } else {
      discountRowEl.style.display = 'none';
    }
  }
}

function closeCheckout() {
  $('checkoutModal').classList.remove('active');
  setTimeout(() => {
    resetCheckoutForm();
  }, 300);
}

function showStep(step) {
  $$('.checkout-step').forEach(s => s.classList.remove('active'));
  setTimeout(() => {
    $(`step${step}`).classList.add('active');
  }, 50);
  currentStep = step;
}

function goToStep1() {
  showStep(1);
}

function goToStep2() {
  // validate customer info
  const firstName = $('firstName').value.trim();
  const lastName = $('lastName').value.trim();
  const email = $('customerEmail').value.trim();
  const phoneCountry = $('phoneCountry').value;
  const phone = $('customerPhone').value.trim();

  // validate address fields
  const country = $('country').value;
  const city = $('cityValue').value;
  const barangay = $('barangayValue').value;
  const street = $('streetAddress').value.trim();

  let hasError = false;

  // reset errors
  $$('.error-text').forEach(el => el.classList.remove('show'));

  if (!firstName) {
    $('firstNameError').textContent = 'Please enter your first name';
    $('firstNameError').classList.add('show');
    hasError = true;
  }

  if (!lastName) {
    $('lastNameError').textContent = 'Please enter your last name';
    $('lastNameError').classList.add('show');
    hasError = true;
  }

  if (!email || !email.includes('@')) {
    $('emailError').textContent = 'Please enter a valid email address';
    $('emailError').classList.add('show');
    hasError = true;
  }

  const isPhoneValid = validatePhone(phone, phoneCountry);
  if (!phone || !isPhoneValid) {
    const message = getPhoneValidationMessage(phoneCountry);
    $('phoneError').textContent = message;
    $('phoneError').classList.add('show');
    $('customerPhone')?.classList.add('invalid');
    showToast('error', 'Invalid Phone', message);
    hasError = true;
  }

  if (!country) {
    $('countryError').textContent = 'Please select a country';
    $('countryError').classList.add('show');
    hasError = true;
  }

  if (!city) {
    $('cityError').textContent = 'Please select a city';
    $('cityError').classList.add('show');
    hasError = true;
  }

  if (country === 'PH' && !barangay) {
    $('barangayError').textContent = 'Please select a barangay';
    $('barangayError').classList.add('show');
    hasError = true;
  }

  if (!street) {
    $('addressError').textContent = 'Please enter your street address';
    $('addressError').classList.add('show');
    hasError = true;
  }

  if (hasError) {
    showToast('error', 'Validation Error', 'Please fill in all required fields correctly');
    return;
  }

  // store customer data
  orderData.firstName = firstName;
  orderData.lastName = lastName;
  orderData.email = email;
  orderData.phoneCountry = phoneCountry;
  orderData.phone = phone;

  // store address data
  orderData.country = country;
  orderData.city = city;
  orderData.barangay = barangay;
  orderData.street = street;
  orderData.postal = $('postalCode').value.trim();

  // auto-set destination based on country
  if (country === 'PH') {
    selectDestination('national');
    destinationTypeLocked = true;
    updateDestinationLockStyles();
  } else {
    selectDestination('international');
    destinationTypeLocked = true;
    updateDestinationLockStyles();
  }

  // render cart items in step 2
  renderCheckoutItems();

  // sync checkout subtotal/total
  updateCheckoutSummary();

  showStep(2);
}

/* phone tel validation */
function getPhoneValidationMessage(country) {
  const messages = {
    'Philippines': 'Enter 11 digits and start with 09 for Philippines.',
    'USA': 'Enter 10 digits or 11 digits starting with 1 for USA.',
    'UK': 'Enter 11 digits and start with 07 for UK.'
  };
  return messages[country] || 'Invalid phone number.';
}

function validatePhone(phone, country) {
  const cleaned = phone.replace(/\D/g, '');
  const len = cleaned.length;

  if (!/^\d+$/.test(cleaned)) return false;
  if (country === 'Philippines') return len === 11 && cleaned.startsWith('09');
  if (country === 'USA') return len === 10 || (len === 11 && cleaned.startsWith('1'));
  if (country === 'UK') return len === 11 && cleaned.startsWith('07');
  return false;
}

function updatePhoneValidationUI(phone, country, showToastOnError = false) {
  const errorEl = $('phoneError');
  const phoneEl = $('customerPhone');
  const cleaned = phone.replace(/\D/g, '');
  const valid = validatePhone(cleaned, country);
  const message = valid ? '' : getPhoneValidationMessage(country);

  const nextBtn = $('step1NextBtn');
  if (nextBtn) {
    nextBtn.disabled = phone && !valid;
  }

  if (phone && !valid) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
    phoneEl?.classList.add('invalid');
    phoneEl?.classList.remove('valid');
    if (showToastOnError) {
      showToast('error', 'Invalid Phone', message);
    }
  } else {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
    phoneEl?.classList.remove('invalid');
    if (cleaned.length > 0) {
      phoneEl?.classList.add('valid');
    } else {
      phoneEl?.classList.remove('valid');
    }
  }

  return valid;
}

/* tel phone first number validation */
$('customerPhone')?.addEventListener('input', (e) => {
  const rawValue = e.target.value;
  const country = $('phoneCountry').value;
  const cleaned = rawValue.replace(/\D/g, '');

  if (rawValue !== cleaned) {
    showToast('error', 'Phone must contain numbers only', 'Use digits only for the phone number.');
  }

  e.target.value = cleaned;

  const maxLengths = {
    'Philippines': 11,
    'USA': 11,
    'UK': 11
  };

  if (e.target.value.length > maxLengths[country]) {
    e.target.value = e.target.value.slice(0, maxLengths[country]);
  }

  updatePhoneValidationUI(e.target.value, country, false);
});

$('customerPhone')?.addEventListener('blur', (e) => {
  const country = $('phoneCountry').value;
  updatePhoneValidationUI(e.target.value, country, true);
});

$('phoneCountry')?.addEventListener('change', () => {
  const phoneEl = $('customerPhone');
  const country = $('phoneCountry').value;
  const placeholders = {
    'Philippines': '09XXXXXXXXX',
    'USA': '10 digit or 11 digits with leading 1',
    'UK': '07XXXXXXXXX'
  };
  const maxLengths = {
    'Philippines': 11,
    'USA': 11,
    'UK': 11
  };

  if (phoneEl) {
    phoneEl.value = '';
    phoneEl.placeholder = placeholders[country] || 'Enter phone number';
    phoneEl.maxLength = maxLengths[country] || 11;
    phoneEl.classList.remove('invalid', 'valid');
  }

  $('phoneError').classList.remove('show');
});

// Real-time name validation (letters + spaces only, no numbers/symbols)
function validateNameInput(value) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/.test(value);
}

$('firstName')?.addEventListener('input', (e) => {
  // remove invalid chars
  const clean = e.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s\-']/g, '');
  if (e.target.value !== clean) {
    e.target.value = clean;
    showToast('error', 'Input should contain letters only', 'First name can only include letters and spaces');
  }
  
  const err = $('firstNameError');
  if (e.target.value.trim() && !validateNameInput(e.target.value.trim())) {
    err.textContent = 'First name: letters and spaces only';
    err.classList.add('show');
  } else {
    err.classList.remove('show');
  }
});

$('lastName')?.addEventListener('input', (e) => {
  const clean = e.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s\-']/g, '');
  if (e.target.value !== clean) {
    e.target.value = clean;
    showToast('error', 'Input should contain letters only', 'Last name can only include letters and spaces');
  }
  
  const err = $('lastNameError');
  if (e.target.value.trim() && !validateNameInput(e.target.value.trim())) {
    err.textContent = 'Last name: letters and spaces only';
    err.classList.add('show');
  } else {
    err.classList.remove('show');
  }
});

$('agreePolicy')?.addEventListener('change', () => {
  const placeOrderBtn = $('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.disabled = !$('agreePolicy').checked;
  }
});

// show toast if checkout button is clicked while agree is unchecked 
$('placeOrderBtn')?.addEventListener('click', (e) => {
  if (!$('agreePolicy')?.checked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    showToast('error', 'Agreement Required', 'Please agree before proceeding');
  }
}, true);

const megaItems = $$('.nav-item.has-mega');
megaItems.forEach(item => {
  const btn = item.querySelector('.nav-link');
  const menu = item.querySelector('.mega-menu');

  btn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = item.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    menu?.setAttribute('aria-hidden', String(!isOpen));

    megaItems.forEach(other => {
      if (other !== item) {
        other.classList.remove('nav-open');
        other.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
        other.querySelector('.mega-menu')?.setAttribute('aria-hidden', 'true');
      }
    });
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-item.has-mega') && !e.target.closest('.hamburger')) {
    megaItems.forEach(item => {
      item.classList.remove('nav-open');
      item.querySelector('.nav-link')?.setAttribute('aria-expanded','false');
      item.querySelector('.mega-menu')?.setAttribute('aria-hidden','true');
    });
  }
});

$('hamburger')?.addEventListener('click', () => {
  const isOpen = $('mainNav').classList.toggle('open');
  $('hamburger').classList.toggle('open', isOpen);
  $('hamburger').setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    megaItems.forEach(item => {
      item.classList.remove('nav-open');
      item.querySelector('.nav-link')?.setAttribute('aria-expanded','false');
      item.querySelector('.mega-menu')?.setAttribute('aria-hidden','true');
    });
    $('mainNav')?.classList.remove('open');
    $('hamburger')?.classList.remove('open');
    $('hamburger')?.setAttribute('aria-expanded', 'false');
  }
});

/* searchable location bcs of json */
let locationConfig = null;
let selectedCountryConfig = null;
let allPhCities = [];     // full ph_cities.json array
let allPhBarangays = [];  // full ph_barangays.json array
let selectedCityObj = null;
let selectedBrgyObj = null;
let selectedRegion = '';
let regionData = [];      // for ph regions

/* initializationch */
async function initLocationSystem() {
    try {
        const response = await fetch('../JSON Files/country.json');
        if (!response.ok) throw new Error('Failed to fetch country.json');
        
        const data = await response.json();
        locationConfig = data.countries;
        
        const countrySelect = $('country');
        if (countrySelect) {
            const firstOption = countrySelect.options[0];
            countrySelect.innerHTML = '';
            countrySelect.appendChild(firstOption);
            
            locationConfig.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.textContent = country.name;
                countrySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Location System Init Error:', error);
    }
}

/* handle sudden country change*/
async function loadCountryData() {
    const countryCode = $('country').value;
    const citySearch = $('citySearch');
    const cityValue = $('cityValue');
    const cityCodeValue = $('cityCodeValue');
    const barangayGroup = $('barangayGroup');
    const regionGroup = $('regionGroup');
    const barangaySearch = $('barangaySearch');
    const barangayValue = $('barangayValue');
    const barangayCodeValue = $('barangayCodeValue');
    
    // reset all fields
    citySearch.value = '';
    cityValue.value = '';
    if (cityCodeValue) cityCodeValue.value = '';
    if (barangaySearch) barangaySearch.value = '';
    if (barangayValue) barangayValue.value = '';
    if (barangayCodeValue) barangayCodeValue.value = '';
    if ($('regionSelect')) $('regionSelect').value = '';
    if ($('regionSearch')) $('regionSearch').value = '';
    if ($('regionValue')) $('regionValue').value = '';
    if ($('postalCode')) $('postalCode').value = '';
    cityData = [];
    barangayData = [];
    allPhCities = [];
    selectedCityObj = null;
    selectedBrgyObj = null;
    selectedRegion = '';
    regionData = [];
    
    // reset shipping selections
    destinationType = null;
    deliveryType = null;
    selectedShippingMethod = null;
    shippingFee = 0;
    shippingSelectedRegion = '';
    destinationTypeLocked = false;
    $('destNational').classList.remove('selected');
    $('destInternational').classList.remove('selected');
    $('deliveryTypeGroup').style.display = 'none';
    $('shippingOptionsList').innerHTML = '';
    updateDestinationLockStyles();
    
    if (!countryCode) {
        barangayGroup.style.display = 'none';
        if (regionGroup) regionGroup.style.display = 'none';
        if ($('cityDropdown')) $('cityDropdown').classList.remove('active');
        if ($('barangayDropdown')) $('barangayDropdown').classList.remove('active');
        updatePaymentMethodVisibility();
        return;
    }

    selectedCountryConfig = locationConfig ? locationConfig.find(c => c.code === countryCode) : null;
    
    // update labels
    const cityLabel = $('cityLabel');
    if (cityLabel && selectedCountryConfig && selectedCountryConfig.addressFormat && selectedCountryConfig.addressFormat.city) {
        cityLabel.textContent = selectedCountryConfig.addressFormat.city + ' *';
    } else if (cityLabel) {
        cityLabel.textContent = 'City *';
    }

    const regionLabel = $('regionLabel');
    if (regionLabel && selectedCountryConfig && selectedCountryConfig.addressFormat && selectedCountryConfig.addressFormat.region) {
        regionLabel.textContent = selectedCountryConfig.addressFormat.region + (selectedCountryConfig.code === 'PH' ? ' *' : '');
    }

    // toggle barangay field visibility
    if (selectedCountryConfig && selectedCountryConfig.hasBarangay) {
        barangayGroup.style.display = 'block';
    } else {
        barangayGroup.style.display = 'none';
    }

    // for ph: auto-assign national shipping and load region selector
    if (countryCode === 'PH') {
        destinationTypeLocked = true;
        selectDestination('national');
        updateDestinationLockStyles();
        if (regionGroup) regionGroup.style.display = 'block';
        try {
            const citySource = selectedCountryConfig ? selectedCountryConfig.citySource : '../JSON/ph_cities.json';
            const response = await fetch(citySource);
            if (!response.ok) throw new Error('Failed to load cities');
            const rawData = await response.json();

            // Support both array format and {cities:[]} format
            allPhCities = Array.isArray(rawData) ? rawData : (rawData.cities || []);

            // Populate Region data
            const regions = [...new Set(allPhCities.map(c => c.regDesc).filter(Boolean))].sort();
            regionData = regions;
            
            // Reset region search
            if ($('regionSearch')) $('regionSearch').value = '';
            if ($('regionDropdown')) $('regionDropdown').classList.remove('active');
        } catch (error) {
            showToast('error', 'Load Error', 'Unable to load city data');
            console.error('City Load Error:', error);
        }
    } else if (countryCode === 'US' || countryCode === 'UK') {
        destinationTypeLocked = true;
        selectDestination('international');
        updateDestinationLockStyles();
        if (regionGroup) regionGroup.style.display = 'none';
        if (selectedCountryConfig && selectedCountryConfig.citySource) {
            try {
                const response = await fetch(selectedCountryConfig.citySource);
                if (!response.ok) throw new Error('Failed to load cities');
                const rawData = await response.json();
                cityData = Array.isArray(rawData) ? rawData : (rawData.cities || []);
            } catch (error) {
                showToast('error', 'Load Error', 'Unable to load cities');
                console.error('City Load Error:', error);
            }
        }
    } else {
        destinationTypeLocked = false;
        updateDestinationLockStyles();
        if (regionGroup) regionGroup.style.display = 'none';
        // Non-PH: load cities normally
        if (selectedCountryConfig && selectedCountryConfig.citySource) {
            try {
                const response = await fetch(selectedCountryConfig.citySource);
                if (!response.ok) throw new Error('Failed to load cities');
                const rawData = await response.json();
                cityData = Array.isArray(rawData) ? rawData : (rawData.cities || []);
            } catch (error) {
                showToast('error', 'Load Error', 'Unable to load cities');
                console.error('City Load Error:', error);
            }
        }
    }
    updatePaymentMethodVisibility();
}

/* load cities in ph */
function loadCitiesForRegion() {
    const regionSelect = $('regionSearch');
    selectedRegion = regionSelect ? regionSelect.value : '';
    
    // reset city + barangay fields
    $('citySearch').value = '';
    $('cityValue').value = '';
    if ($('cityCodeValue')) $('cityCodeValue').value = '';
    if ($('barangaySearch')) $('barangaySearch').value = '';
    if ($('barangayValue')) $('barangayValue').value = '';
    if ($('barangayCodeValue')) $('barangayCodeValue').value = '';
    if ($('postalCode')) $('postalCode').value = '';
    selectedCityObj = null;
    selectedBrgyObj = null;
    
    if ($('regionValue')) $('regionValue').value = selectedRegion;

    const cityDropdown = $('cityDropdown');
    if (cityDropdown) {
        cityDropdown.innerHTML = '';
        cityDropdown.classList.remove('active');
    }
    const barangayDropdown = $('barangayDropdown');
    if (barangayDropdown) {
        barangayDropdown.innerHTML = '';
        barangayDropdown.classList.remove('active');
    }
    
    // filter cities by region
    cityData = selectedRegion ? allPhCities.filter(c => c.regDesc === selectedRegion) : [];

    if (!selectedRegion && cityDropdown) {
        cityDropdown.innerHTML = '<div class="no-results">Select a region first to show cities.</div>';
    }
    
    if (destinationType) {
      renderDeliveryOptions();
      updateCartSummary();
    }
}

/* filter and search as they type gantu gantu */
$('citySearch')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = $('cityDropdown');

    if (!dropdown) return;
    if (!query) {
        dropdown.classList.remove('active');
        return;
    }

    if (cityData.length === 0) {
        const message = selectedCountryConfig?.code === 'PH' && !selectedRegion
            ? 'Select a region first to search cities.'
            : 'No cities are available yet.';
        dropdown.innerHTML = `<div class="no-results">${message}</div>`;
        dropdown.classList.add('active');
        return;
    }

    const filtered = cityData.filter(city => {
        const name = city.citymunDesc || city.name || '';
        return name.toLowerCase().includes(query);
    }).slice(0, 50);

    if (filtered.length > 0) {
        dropdown.innerHTML = filtered.map(city => {
            const name = city.citymunDesc || city.name || '';
            const code = city.citymunCode || city.code || '';
            const reg = city.regDesc || city.region || city.state || '';
            return `<div class="search-dropdown-item" onclick="selectCity('${name.replace(/'/g, "\\'")}', '${code}', '${reg.replace(/'/g, "\\'")}')">
                <strong>${name}</strong>${reg ? `<small style="opacity:0.7; margin-left:8px;">${reg}</small>` : ''}
            </div>`;
        }).join('');
        dropdown.classList.add('active');
    } else {
        dropdown.innerHTML = '<div class="no-results">No cities found</div>';
        dropdown.classList.add('active');
    }
});

$('regionSearch')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = $('regionDropdown');

    if (!dropdown) return;
    if (!query) {
        dropdown.classList.remove('active');
        return;
    }

    if (regionData.length === 0) {
        dropdown.innerHTML = '<div class="no-results">No regions available</div>';
        dropdown.classList.add('active');
        return;
    }

    const filtered = regionData.filter(region => region.toLowerCase().includes(query)).slice(0, 50);

    if (filtered.length > 0) {
        dropdown.innerHTML = filtered.map(region => `<div class="search-dropdown-item" onclick="selectRegion('${region.replace(/'/g, "\\'")}')">${region}</div>`).join('');
        dropdown.classList.add('active');
    } else {
        dropdown.innerHTML = '<div class="no-results">No regions found</div>';
        dropdown.classList.add('active');
    }
});

/* select city from dropdown */
async function selectCity(name, code, regDesc) {
    const citySearch = $('citySearch');
    const cityValue = $('cityValue');
    const cityCodeValue = $('cityCodeValue');
    const dropdown = $('cityDropdown');
    
    citySearch.value = name;
    cityValue.value = name;
    if (cityCodeValue) cityCodeValue.value = code;
    dropdown.classList.remove('active');
    
    // store selected city object
    const cityRegion = selectedCountryConfig?.code === 'UK'
        ? (cityData.find(c => (c.citymunCode || c.code || '') === code)?.region || regDesc)
        : (cityData.find(c => (c.citymunCode || c.code || '') === code)?.regDesc || cityData.find(c => (c.citymunCode || c.code || '') === code)?.region || cityData.find(c => (c.citymunCode || c.code || '') === code)?.state || regDesc);

    selectedCityObj = cityData.find(c => (c.citymunCode || c.code || '') === code) || { citymunDesc: name, citymunCode: code, regDesc: cityRegion };

    // auto-fill postal code from city or suggested format
    const postalField = $('postalCode');
    const postalValueField = $('postalValue');
    let postalSuggestion = selectedCityObj.postalCode || '';

    if (!postalSuggestion && selectedCountryConfig?.code === 'UK') {
        const ukPostalMap = {
            London: 'SW1A',
            Manchester: 'M1',
            Birmingham: 'B1',
            Glasgow: 'G1',
            Liverpool: 'L1',
            Bristol: 'BS1',
            Edinburgh: 'EH1',
            Leeds: 'LS1',
            Sheffield: 'S1',
            Leicester: 'LE1'
        };
        postalSuggestion = ukPostalMap[name] || '';
    }

    if (!postalSuggestion && selectedCountryConfig?.code === 'US') {
        const usZipMap = {
            'New York': '10001',
            'Los Angeles': '90001',
            'Chicago': '60601',
            'Houston': '77001',
            'Phoenix': '85001',
            'Philadelphia': '19101',
            'San Antonio': '78201',
            'San Diego': '92101',
            'Dallas': '75201',
            'San Jose': '95101'
        };
        postalSuggestion = usZipMap[name] || '';
    }

    if (postalField) {
        postalField.value = postalSuggestion;
        if (postalSuggestion) postalField.placeholder = postalSuggestion;
    }
    if (postalValueField) {
        postalValueField.value = postalSuggestion;
    }

    // update region
    selectedRegion = cityRegion;
    if ($('regionValue')) $('regionValue').value = cityRegion || '';
    
    // re-render delivery options if destination selected
    if (destinationType) {
        renderDeliveryOptions();
        updateCartSummary();
    }

    // if country has barangays (like PH), load them based on city code
    if (selectedCountryConfig && selectedCountryConfig.hasBarangay && code) {
        // Reset barangay
        if ($('barangaySearch')) $('barangaySearch').value = '';
        if ($('barangayValue')) $('barangayValue').value = '';
        if ($('barangayCodeValue')) $('barangayCodeValue').value = '';
        selectedBrgyObj = null;
        await loadBarangayData(code);
    }
}

/* select region from dropdown */
function selectRegion(name) {
    const regionSearch = $('regionSearch');
    const dropdown = $('regionDropdown');
    
    regionSearch.value = name;
    selectedRegion = name;
    if ($('regionValue')) $('regionValue').value = name;
    dropdown.classList.remove('active');
    
    loadCitiesForRegion();
}

function updatePaymentMethodVisibility() {
    const isPhilippines = selectedCountryConfig?.code === 'PH';
    const cod = $('methodCOD');
    const gcash = $('methodGCash');
    const paypal = $('methodPayPal');

    if (paypal) paypal.style.display = 'flex';
    if (cod) cod.style.display = isPhilippines ? 'flex' : 'none';
    if (gcash) gcash.style.display = isPhilippines ? 'flex' : 'none';

    if (!isPhilippines && (selectedPaymentMethod === 'cod' || selectedPaymentMethod === 'gcash')) {
        selectedPaymentMethod = null;
        setActivePaymentMethod(null);
        if ($('cardFields')) $('cardFields').classList.remove('active');
    }
}

/* load brgy from specific/selected city */
async function loadBarangayData(citymunCode) {
    try {
        const brgySource = selectedCountryConfig ? selectedCountryConfig.barangaySource : 'ph_barangays.json';
        
        // if it haven't loaded all barangays yet, load them now rnch
        if (allPhBarangays.length === 0) {
            const response = await fetch(brgySource);
            if (!response.ok) throw new Error('Failed to load barangay data');
            const rawData = await response.json();
            allPhBarangays = Array.isArray(rawData) ? rawData : (rawData.barangays || []);
        }
        
        // filter barangays by citymuncode
        barangayData = allPhBarangays.filter(b => b.citymunCode === citymunCode);
        
        // reset brgy fields and dropdown state
        if ($('barangaySearch')) $('barangaySearch').value = '';
        if ($('barangayValue')) $('barangayValue').value = '';
        const barangayDropdown = $('barangayDropdown');
        if (barangayDropdown) {
            barangayDropdown.innerHTML = '';
            barangayDropdown.classList.remove('active');
        }
        
    } catch (error) {
        showToast('error', 'Load Error', 'Unable to load barangays');
        console.error('Barangay Load Error:', error);
    }
}

/* search and filter brgy as user type.... */
$('barangaySearch')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim().replace(/brgy/gi, 'Barangay');
    const dropdown = $('barangayDropdown');

    if (!dropdown) return;
    if (!query) {
        dropdown.classList.remove('active');
        return;
    }

    if (barangayData.length === 0) {
        const message = selectedCityObj?.citymunCode
            ? 'No barangays found for the selected city.'
            : 'Select a city first to search barangays.';
        dropdown.innerHTML = `<div class="no-results">${message}</div>`;
        dropdown.classList.add('active');
        return;
    }

    const filtered = barangayData.filter(brgy => 
        (brgy.brgyDesc || '').toLowerCase().includes(query)
    ).slice(0, 50);

    if (filtered.length > 0) {
        dropdown.innerHTML = filtered.map(brgy => 
            `<div class="search-dropdown-item" onclick="selectBarangay('${(brgy.brgyDesc || '').replace(/'/g, "\\'")}', '${(brgy.brgyCode || '').replace(/'/g, "\\'")}')">
                ${brgy.brgyDesc}
            </div>`
        ).join('');
        dropdown.classList.add('active');
    } else {
        dropdown.innerHTML = '<div class="no-results">No barangays found</div>';
        dropdown.classList.add('active');
    }
});

function selectBarangay(name, code) {
    $('barangaySearch').value = name;
    $('barangayValue').value = name;
    if ($('barangayCodeValue')) $('barangayCodeValue').value = code;
    $('barangayDropdown').classList.remove('active');
    
    // Store full barangay object
    selectedBrgyObj = barangayData.find(b => b.brgyCode === code) || { brgyDesc: name, brgyCode: code };
    
    // Update postal from barangay if city didn't provide one
    if (!$('postalCode').value && selectedBrgyObj && selectedBrgyObj.postalCode) {
        $('postalCode').value = selectedBrgyObj.postalCode;
    }
}

/* closed after clicking outside */
document.addEventListener('click', (e) => {
    if (!e.target.closest('.searchable-input')) {
        $$('.search-dropdown').forEach(dd => dd.classList.remove('active'));
    }
});

/* check if typed value matches an item in the list */
function validateLocationInput() {
    const country = $('country').value;
    const cityInput = $('citySearch').value.trim();
    const cityVal = $('cityValue');
    const brgyInput = $('barangaySearch')?.value.trim();
    const brgyVal = $('barangayValue');

    if (!country) return false;

    let isValid = true;

    // check if city exists in loaded data
    const validCity = cityData.find(c => (c.citymunDesc || c.name || '').toLowerCase() === cityInput.toLowerCase());
    if (validCity) {
        cityVal.value = validCity.citymunDesc || validCity.name;
        if (!selectedRegion && validCity.regDesc) {
            selectedRegion = validCity.regDesc;
            if ($('regionValue')) $('regionValue').value = selectedRegion;
        }
    } else {
        cityVal.value = '';
        isValid = false;
    }

    // check if barangay exists if required
    if (selectedCountryConfig?.hasBarangay) {
        const validBrgy = barangayData.find(b => (b.brgyDesc || '').toLowerCase() === (brgyInput || '').toLowerCase());
        if (validBrgy) {
            brgyVal.value = validBrgy.brgyDesc;
        } else {
            brgyVal.value = '';
            isValid = false;
        }
    }

    if (selectedCountryConfig?.code === 'PH' && !selectedRegion) {
        isValid = false;
    }

    return isValid;
}

// initialize
document.addEventListener('DOMContentLoaded', () => {
  initLocationSystem();
  updatePaymentMethodVisibility();
});

/* shipping and voucher system */
function updateDestinationLockStyles() {
    const national = $('destNational');
    const international = $('destInternational');
    if (destinationTypeLocked) {
        if (national) national.classList.toggle('locked', destinationType !== 'national');
        if (international) international.classList.toggle('locked', destinationType !== 'international');
    } else {
        if (national) national.classList.remove('locked');
        if (international) international.classList.remove('locked');
    }
}

function selectDestination(type) {
    if (destinationTypeLocked && destinationType && type !== destinationType) return;
    destinationType = type;
    
    // update ui
    $('destNational').classList.toggle('selected', type === 'national');
    $('destInternational').classList.toggle('selected', type === 'international');
    updateDestinationLockStyles();
    
    // show delivery type options
    $('deliveryTypeGroup').style.display = 'block';
    
    // reset delivery type
    deliveryType = null;
    selectedShippingMethod = null;
    shippingFee = 0;
    
    // render delivery options
    renderDeliveryOptions();
    updateCartSummary();
    updateCheckoutSummary();
    validateCurrencyShippingMatch({ forceToast: true });
    
    // hide shipping error
    $('shippingError').classList.remove('show');
}

function renderDeliveryOptions() {
    const container = $('shippingOptionsList');
    if (!container) {
        return;
    }
    if (!destinationType) {
        container.innerHTML = '';
        return;
    }

    const options = [
        { type: 'standard', label: 'Standard', time: '4–7 days' },
        { type: 'express', label: 'Express', time: '1–3 days' }
    ];

    container.innerHTML = options.map(option => {
        const fee = getShippingFeeAmount(option.type);
        const priceLabel = formatShippingLabelPrice(option.type);
        const priceText = option.type === 'express' ? `* ${priceLabel}` : priceLabel;
        const isSelected = selectedShippingMethod === `${destinationType}-${option.type}`;

        return `
            <div class="shipping-option${isSelected ? ' selected' : ''}" data-method="${destinationType}-${option.type}" data-fee="${fee}" onclick="selectDelivery(this, '${option.type}')">
                <div class="shipping-option-title">
                    <i class="fa-solid fa-truck"></i> ${option.label}
                </div>
                <div class="shipping-option-time">${option.time}</div>
                <div class="shipping-option-price">${priceText}</div>
            </div>
        `;
    }).join('');
}

function onShippingRegionChange() {
    const rSel = $('shippingRegionSelect');
    shippingSelectedRegion = rSel ? rSel.value : '';
    renderDeliveryOptions();
    updateCartSummary();
    validateCurrencyShippingMatch();
    if ($('shippingRegionError')) $('shippingRegionError').classList.remove('show');
}

function updateShippingRatesDisplay() {
    renderDeliveryOptions();
    validateCurrencyShippingMatch();
}

function selectDelivery(element, type) {
    deliveryType = type;
    shippingFee = getShippingFeeAmount(type);
    selectedShippingMethod = `${destinationType}-${type}`;

    $$('#shippingOptionsList .shipping-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    updateCartSummary();
    updateCheckoutSummary();
    validateCurrencyShippingMatch({ forceToast: true });
    $('shippingError').classList.remove('show');
}

function selectShipping(method, fee) {
  selectedShippingMethod = method;
  shippingFee = fee;
  
  $$('.shipping-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.method === method);
  });
}

function updateShippingDisplay() {
  renderDeliveryOptions();
}

function applyVoucher() {
  const code = $('voucherCode').value.trim().toUpperCase();
  
  if (!code) {
    showToast('error', 'Invalid Voucher', 'Please enter a voucher code');
    return;
  }

  // Voucher validation
  if (code === 'CSSP10') {
    voucherType = 'percentage';
    voucherDiscount = 10; // 10% discount
    voucherCode = code;
    $('voucherName').textContent = 'CSSP10 (10% off)';
    $('voucherApplied').classList.add('active');
    showToast('success', 'Voucher Applied', '10% discount applied to your order');
    updateCartSummary();
    updateCheckoutSummary();
  } else if (code === 'FREESHIP') {
    voucherType = 'freeship';
    voucherDiscount = 0;
    voucherCode = code;
    $('voucherName').textContent = 'FREESHIP';
    $('voucherApplied').classList.add('active');
    showToast('success', 'Voucher Applied', 'Free shipping applied to your order');
    updateCartSummary();
    updateCheckoutSummary();
  } else {
    showToast('error', 'Invalid Voucher', 'This voucher code is not valid');
  }
}

function removeVoucher() {
  voucherType = null;
  voucherDiscount = 0;
  voucherCode = null;
  $('voucherCode').value = '';
  $('voucherApplied').classList.remove('active');
  showToast('success', 'Voucher Removed', 'Discount code removed');
  updateCartSummary();
  updateCheckoutSummary();
}

/* payment system */
async function selectPayment(method) {
  if ((method === 'cod' || method === 'gcash') && selectedCountryConfig?.code !== 'PH') {
    return;
  }

  const isCard = method === 'card';
  const isPayPal = method === 'paypal';
  const isGCash = method === 'gcash';

  if (isPayPal || isGCash) {
    const success = isPayPal ? await showPayPalLogin() : await showGCashLogin();
    if (!success) {
      setActivePaymentMethod(null);
      selectedPaymentMethod = null;
      return;
    }
    selectedPaymentMethod = method;
    setActivePaymentMethod(method);
    $('cardFields').classList.remove('active');
    return;
  }

  selectedPaymentMethod = method;
  setActivePaymentMethod(method);
  if ($('cardFields')) {
    if (isCard) {
      $('cardFields').classList.add('active');
    } else {
      $('cardFields').classList.remove('active');
    }
  }

  if (method === 'cod') {
    showToast('warning', 'Cash on Delivery selected', 'CSSP Garments will review and verify the order. The seller reviews the order details and the buyer’s profile for suspicious activity or previous failed COD deliveries.');
  }
}

function setActivePaymentMethod(method) {
  $$('.payment-method').forEach(pm => {
    const selected = pm.dataset.method === method;
    pm.classList.toggle('selected', selected);
  });
}

function handlePaymentKey(event, method) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectPayment(method);
  }
}

function toggleCardVisibility() {
  const show = $('showCardDetails').checked;
  const type = show ? 'text' : 'password';
  
  $('cardNumber').type = type;
  $('cardExpiry').type = type;
  $('cardCVV').type = type;
}

function validateCardExpiry(value) {
  const normalized = (value || '').trim();
  const match = normalized.match(/^\s*(0[1-9]|1[0-2])\/(\d{2})\s*$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = Number(match[2]) + 2000;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return month >= 1 && month <= 12;
}

function watchCardExpiry() {
  const expiryInput = $('cardExpiry');
  if (!expiryInput) return;

  expiryInput.addEventListener('input', () => {
    const value = expiryInput.value;
    if (value.length === 5) {
      const valid = validateCardExpiry(value);
      if (!valid) {
        const now = new Date();
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear();
        showToast('warning', 'Card might be expired', `Please use a card with an expiry date after ${currentMonth} ${currentYear}.`);
      }
    }
  });
}

watchCardExpiry();

async function processPayment() {
  let hasError = false;

  // Reset errors
  $$('.error-text').forEach(el => el.classList.remove('show'));

  if (!destinationType) {
    $('shippingError').textContent = 'Please select a destination';
    $('shippingError').classList.add('show');
    hasError = true;
  }

  if (!deliveryType) {
    $('shippingError').textContent = 'Please select a delivery type';
    $('shippingError').classList.add('show');
    hasError = true;
  }

  const agreed = $('agreePolicy')?.checked;
  if (!agreed) {
    $('agreeError').textContent = 'You must agree to the shipping policy, terms and privacy policy';
    $('agreeError').classList.add('show');
    hasError = true;
  } else {
    $('agreeError').classList.remove('show');
  }

  if (!selectedPaymentMethod) {
    $('paymentError').textContent = 'Please select a payment method';
    $('paymentError').classList.add('show');
    hasError = true;
  }

  if (hasError) {
    showToast('error', 'Validation Error', 'Please complete all required fields');
    return;
  }

  // Store shipping data
  orderData.destinationType = destinationType;
  orderData.deliveryType = deliveryType;
  orderData.shippingMethod = selectedShippingMethod;
  orderData.shippingFee = shippingFee;
  orderData.paymentMethod = selectedPaymentMethod;

  // Process based on payment method
  if (selectedPaymentMethod === 'card') {
    const cardName = $('cardName').value.trim();
    const cardNum = $('cardNumber').value.trim();
    const cardExp = $('cardExpiry').value.trim();
    const cardCVV = $('cardCVV').value.trim();

    if (!cardName || !cardNum || !cardExp || !cardCVV) {
      showToast('error', 'Card Details Required', 'Please enter all card details');
      return;
    }

    const expiryValid = validateCardExpiry(cardExp);
    if (!expiryValid) {
      showToast('warning', 'Card might be expired', 'Please use a card with an expiry date after the current month.');
      return;
    }
  }

  // generate order and show confirmation
  completeOrder();
}

function completeOrder() {
  const orderID = generateOrderID();
  orderData.orderID = orderID;
  
  // calculate final totals
  const cart = getCart();
  const selectedItems = cart.filter(item => item.selected);
  const subtotal = calculateTotal(cart);
  
  let finalShipping = shippingFee;
  if (voucherType === 'freeship') {
    finalShipping = 0;
  }
  
  let discount = 0;
  if (voucherType === 'percentage') {
    discount = subtotal * (voucherDiscount / 100);
  }
  
  const total = subtotal + finalShipping - discount;
  
  orderData.items = selectedItems;
  orderData.subtotal = subtotal;
  orderData.shippingFee = finalShipping;
  orderData.discount = discount;
  orderData.total = total;
  orderData.voucher = voucherCode;
  
  // display order details
  $('orderIdDisplay').textContent = orderID;
  $('confirmationEmail').textContent = orderData.email;
  
  // populate receipt
  populateReceipt();
  
  showStep(3);
  startTrackingAnimation();
  
  // remove selected items from cart
  let newCart = cart.filter(item => !item.selected);
  localStorage.setItem('cssp-cart', JSON.stringify(newCart));
  updateCartBadge();
  renderCart();
  
  showToast('success', 'Order Placed!', `Order ${orderID} confirmed`);
}

function populateReceipt() {
  const receipt = $('receiptDetails');
  
  // items html - include category, size, qty, unit price, subtotal
  let itemsHTML = orderData.items.map(item => `
    <div class="receipt-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
      <div style="width:100%; display:flex; justify-content:space-between; font-weight:700;">
        <span>${item.name}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
      <div style="font-size:0.82rem; color:var(--text-muted);">
        Category: ${item.type} &nbsp;·&nbsp; Size: ${item.size} &nbsp;·&nbsp; Qty: ${item.quantity} &nbsp;·&nbsp; Unit: ${formatPrice(item.price)}
      </div>
    </div>
  `).join('');
  
  let barangayRow = '';
  if (orderData.country === 'PH' && orderData.barangay) {
    barangayRow = `
      <div class="receipt-row">
        <span>Barangay:</span>
        <span>${orderData.barangay}</span>
      </div>
    `;
  }
  
  let discountRow = '';
  if (orderData.discount > 0) {
    discountRow = `
      <div class="receipt-row">
        <span>Voucher Discount (${orderData.voucher}):</span>
        <span style="color: var(--green)">-${formatPrice(orderData.discount)}</span>
      </div>
    `;
  }

  const deliveryLabel = orderData.deliveryType === 'express' ? 'Express (1–3 days)' : 'Standard (4–7 days)';
  
  receipt.innerHTML = `
    <div class="receipt-section">
      <h4><i class="fa-solid fa-user" style="margin-right:8px;"></i>Customer Details</h4>
      <div class="receipt-row">
        <span>Name:</span>
        <span>${orderData.firstName} ${orderData.lastName}</span>
      </div>
      <div class="receipt-row">
        <span>Email:</span>
        <span>${orderData.email}</span>
      </div>
      <div class="receipt-row">
        <span>Phone:</span>
        <span>${orderData.phoneCountry} – ${orderData.phone}</span>
      </div>
    </div>
    
    <div class="receipt-section">
      <h4><i class="fa-solid fa-location-dot" style="margin-right:8px;"></i>Shipping Address</h4>
      <div class="receipt-row">
        <span>Country:</span>
        <span>${orderData.country}</span>
      </div>
      <div class="receipt-row">
        <span>City:</span>
        <span>${orderData.city}</span>
      </div>
      ${barangayRow}
      <div class="receipt-row">
        <span>Street:</span>
        <span>${orderData.street}</span>
      </div>
      ${orderData.postal ? `<div class="receipt-row"><span>Postal:</span><span>${orderData.postal}</span></div>` : ''}
    </div>
    
    <div class="receipt-section">
      <h4><i class="fa-solid fa-box-open" style="margin-right:8px;"></i>Order Details</h4>
      ${itemsHTML}
    </div>

    <div class="receipt-section">
      <h4><i class="fa-solid fa-truck" style="margin-right:8px;"></i>Shipping Info</h4>
      <div class="receipt-row">
        <span>Delivery Type:</span>
        <span>${deliveryLabel}</span>
      </div>
      <div class="receipt-row">
        <span>Shipping Fee:</span>
        <span>${formatPrice(orderData.shippingFee)}</span>
      </div>
    </div>
    
    <div class="receipt-section">
      <h4><i class="fa-solid fa-receipt" style="margin-right:8px;"></i>Payment Summary</h4>
      <div class="receipt-row">
        <span>Subtotal:</span>
        <span>${formatPrice(orderData.subtotal)}</span>
      </div>
      ${discountRow}
      <div class="receipt-row">
        <span>Shipping:</span>
        <span>${formatPrice(orderData.shippingFee)}</span>
      </div>
      <div class="receipt-row total">
        <span>Total Paid:</span>
        <span>${formatPrice(orderData.total)}</span>
      </div>
    </div>
    
    <div class="receipt-section">
      <h4><i class="fa-solid fa-credit-card" style="margin-right:8px;"></i>Payment Method</h4>
      <div class="receipt-row">
        <span>${orderData.paymentMethod === 'card' ? 'Credit / Debit Card' : orderData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : orderData.paymentMethod === 'gcash' ? 'GCash' : 'Existing payment method(s)'}</span>
        <span><i class="fa-solid fa-check-circle" style="color: var(--green);"></i> Confirmed</span>
      </div>
    </div>
  `;
}

function generateOrderID() {
  return 'ORD-' + Math.floor(Math.random() * 99999);
}

function showPayPalLogin() {
  return new Promise((resolve) => {
    const modal = $('paypalModal');
    const emailInput = $('paypalEmail');
    const passwordInput = $('paypalPassword');
    const loginButton = $('paypalLoginBtn');

    if (!modal || !emailInput || !passwordInput || !loginButton) {
      return resolve(false);
    }

    modal.classList.add('active');
    modal.focus?.();
    document.body.style.overflow = 'hidden';
    emailInput.value = '';
    passwordInput.value = '';
    loginButton.disabled = false;
    loginButton.classList.remove('loading');

    const cleanup = (result) => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      emailInput.value = '';
      passwordInput.value = '';
      loginButton.disabled = false;
      loginButton.classList.remove('loading');
      resolve(result);
    };

    window.confirmPayPal = () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        showToast('error', 'Login Required', 'Please enter your PayPal credentials');
        return;
      }

      loginButton.disabled = true;
      loginButton.classList.add('loading');
      setTimeout(() => {
        cleanup(true);
        showToast('success', 'PayPal Connected', 'Payment authorized');
      }, 800);
    };

    window.closePayPal = () => {
      cleanup(false);
    };
  });
}

function showGCashLogin() {
  return new Promise((resolve) => {
    const modal = $('gcashModal');
    const numberInput = $('gcashNumber');
    const passwordInput = $('gcashPassword');
    const loginButton = $('gcashLoginBtn');

    if (!modal || !numberInput || !passwordInput || !loginButton) {
      return resolve(false);
    }

    modal.classList.add('active');
    modal.focus?.();
    document.body.style.overflow = 'hidden';
    numberInput.value = '';
    passwordInput.value = '';
    loginButton.disabled = false;
    loginButton.classList.remove('loading');

    const cleanup = (result) => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      numberInput.value = '';
      passwordInput.value = '';
      loginButton.disabled = false;
      loginButton.classList.remove('loading');
      resolve(result);
    };

    window.confirmGCash = () => {
      const account = numberInput.value.trim();
      const mpin = passwordInput.value.trim();

      if (!account || !mpin) {
        showToast('error', 'Login Required', 'Please enter your GCash login details');
        return;
      }

      loginButton.disabled = true;
      loginButton.classList.add('loading');
      setTimeout(() => {
        cleanup(true);
        showToast('success', 'GCash Connected', 'Payment authorized');
      }, 800);
    };

    window.closeGCash = () => {
      cleanup(false);
    };
  });
}

function startTrackingAnimation(stage = 2) {
  const steps = ['track1', 'track2', 'track3', 'track4'];
  const progress = $('trackingProgress');
  const target = Math.min(Math.max(stage, 1), steps.length);

  steps.forEach((stepId, index) => {
    const step = $(stepId);
    if (!step) return;
    step.classList.toggle('active', index < target);
  });

  if (progress) {
    const width = target > 1 ? ((target - 1) / (steps.length - 1)) * 100 : 0;
    progress.style.width = `${width}%`;
  }
}

    function downloadReceipt() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    

    // helper function to check space and add a page safely
    function checkPageOverflow(currentY, neededSpace) {
        if (currentY + neededSpace > 270) {
        doc.addPage();
        return 20; // Reset y to top of new page
        }
        return currentY;
    }

    function formatPriceForPDF(amount) {
        if (currentCurrency === 'PHP') {
        return `PHP ${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        }
        return formatPrice(amount); // Ensure formatPrice global function exists
    }

/* main receipt render */
    function renderReceipt() {
        let y = 20;

        // header
        doc.setFont('Poppins-Black', 'normal'); // Using standard safe font
        doc.setFontSize(20);
        doc.text('CSSP Garments Trading', 105, y, { align: 'center' });

        y += 8;
        doc.setFontSize(12);
        doc.setFont('Poppins-Black', 'normal');
        doc.text('Order Receipt', 105, y, { align: 'center' });

        // order id
        y += 15;
        doc.setFontSize(14);
        doc.setFont('Poppins-Black', 'normal');
        doc.text(`Order ID: ${orderData.orderID}`, 20, y);

        // customer info
        y += 12;
        doc.setFontSize(12);
        doc.text('Customer Information:', 20, y);

        doc.setFont('Poppins-Black', 'normal');
        y += 8;
        doc.text(`Name: ${orderData.firstName} ${orderData.lastName}`, 20, y);
        y += 6;
        doc.text(`Email: ${orderData.email}`, 20, y);
        y += 6;
        doc.text(`Phone: ${orderData.phoneCountry} - ${orderData.phone}`, 20, y);

        // shipment details
        y += 10;
        doc.setFont('Poppins-Black', 'normal');
        doc.text('Shipping Address:', 20, y);

        doc.setFont('Poppins-Black', 'normal');
        y += 8;
        doc.text(`${orderData.street}`, 20, y);
        y += 6;

        if (orderData.barangay) {
        doc.text(`${orderData.barangay}, ${orderData.city}`, 20, y);
        y += 6;
        } else {
        doc.text(`${orderData.city}`, 20, y);
        y += 6;
        }

        doc.text(`${orderData.country} ${orderData.postal}`, 20, y);

        // items
        y += 12;
        doc.setFont('Poppins-Black', 'normal');
        doc.text('Order Items:', 20, y);

        doc.setFont('Poppins-Black', 'normal');
        y += 8;

        orderData.items.forEach(item => {
        y = checkPageOverflow(y, 6);
        
        doc.text(`${item.name} (x${item.quantity})`, 20, y);
        doc.text(
            formatPriceForPDF(item.price * item.quantity),
            190,
            y,
            { align: 'right' }
        );
        y += 6;
        });

        // total math
        y = checkPageOverflow(y, 35); // Ensures room for all totals safely

        y += 4;
        doc.text('Subtotal:', 20, y);
        doc.text(formatPriceForPDF(orderData.subtotal), 190, y, { align: 'right' });

        y += 6;
        doc.text(`Shipping (${orderData.shippingMethod}):`, 20, y);
        doc.text(formatPriceForPDF(orderData.shippingFee), 190, y, { align: 'right' });

        if (orderData.discount > 0) {
        y += 6;
        doc.text(`Discount (${orderData.voucher}):`, 20, y);
        doc.text(`-${formatPriceForPDF(orderData.discount)}`, 190, y, { align: 'right' });
        }

        y += 8;
        doc.setFont('Poppins-Black', 'normal');
        doc.text('Total:', 20, y);
        doc.text(formatPriceForPDF(orderData.total), 190, y, { align: 'right' });

        // payment
        y += 12;
        doc.setFont('Poppins-Black', 'normal');
        doc.text('Payment Method:', 20, y);

        const paymentLabel =
        orderData.paymentMethod === 'card'
            ? 'Credit / Debit Card'
            : orderData.paymentMethod === 'cod'
            ? 'Cash on Delivery (COD)'
            : orderData.paymentMethod === 'gcash'
            ? 'GCash'
            : 'PayPal';

        doc.text(paymentLabel, 70, y);

        // footer (ty)
        doc.setFontSize(10);
        doc.setFont('Poppins-Black', 'normal');
        doc.text(
        'Thank you for shopping with CSSP Garments Trading!',
        105,
        285,
        { align: 'center' }
        );

        // download sana gumana 
        doc.save(`CSSP-Receipt-${orderData.orderID}.pdf`);

        if (typeof showToast === 'function') {
        showToast('success', 'PDF Downloaded', 'Receipt saved successfully');
        }
    }

    // watermark
    const watermark = new Image();
    watermark.src = './Assets/logo opacity 50% watermark.png';

    watermark.onload = () => {
        try {
        if (typeof doc.setGState === 'function') {
            doc.setGState({ opacity: 0.15 });
        }

        doc.addImage(watermark, 'PNG', 55, 40, 100, 100);

        if (typeof doc.setGState === 'function') {
            doc.setGState({ opacity: 1 });
        }
        } catch (err) {
        console.warn('Watermark layout properties failed:', err);
        }
        renderReceipt();
    };

    watermark.onerror = () => {
        console.warn('Watermark image failed to load. Downloading without watermark...');
        renderReceipt();
    };
    }


function finishCheckout() {
  closeCheckout();
  setTimeout(() => {
    window.location.href = 'products.html';
  }, 300);
}


function resetCheckoutForm() {
  // Reset all form fields
  $('firstName').value = '';
  $('lastName').value = '';
  $('customerEmail').value = '';
  $('phoneCountry').value = 'Philippines';
  $('customerPhone').value = '';
  $('country').value = '';
  $('citySearch').value = '';
  $('cityValue').value = '';
  $('barangaySearch').value = '';
  $('barangayValue').value = '';
  $('streetAddress').value = '';
  $('postalCode').value = '';
  
  selectedPaymentMethod = null;
  selectedShippingMethod = null;
  shippingFee = 0;
  voucherType = null;
  voucherDiscount = 0;
  voucherCode = null;
  destinationType = null;
  deliveryType = null;
  shippingSelectedRegion = '';
  destinationTypeLocked = false;

  window.closePayPal?.();
  window.closeGCash?.();
  
  if ($('regionSearch')) $('regionSearch').value = '';
  if ($('regionGroup')) $('regionGroup').style.display = 'none';
  
  $$('.payment-method').forEach(pm => pm.classList.remove('selected'));
  $$('.shipping-option').forEach(so => so.classList.remove('selected'));
  $('cardFields').classList.remove('active');
  $('voucherApplied').classList.remove('active');
  $('voucherCode').value = '';
  
  if ($('destNational')) $('destNational').classList.remove('selected', 'locked');
  if ($('destInternational')) $('destInternational').classList.remove('selected', 'locked');
  if ($('deliveryTypeGroup')) $('deliveryTypeGroup').style.display = 'none';
  if ($('shippingOptionsList')) $('shippingOptionsList').innerHTML = '';
  
  $('cardName').value = '';
  $('cardNumber').value = '';
  $('cardExpiry').value = '';
  $('cardCVV').value = '';
  $('showCardDetails').checked = false;
  
  $$('.error-text').forEach(el => el.classList.remove('show'));
  
  orderData = {};
}

 /* back to top */
 $('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      
updateCartBadge();
updateCurrencyDisplay();
renderCart();
