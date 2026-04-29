/* ============================================================
   1. HELPERS & GLOBAL LOGIC
   ============================================================ */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// Ticker duplication logic
const tickerTrack = $('tickerTrack');
if (tickerTrack) {
  tickerTrack.innerHTML += tickerTrack.innerHTML;
}

// Scroll Event: Sticky shadow & Back to Top visibility
const hdr = $('siteHeader');
window.addEventListener('scroll', () => {
  if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 50);
  const btt = $('backToTop');
  if (btt) btt.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });

/* ============================================================
   2. MEGA MENU LOGIC
   ============================================================ */
const megaItems = document.querySelectorAll('.nav-item.has-mega'); 

megaItems.forEach(item => {
  const btn = item.querySelector('.nav-link');

  btn.addEventListener('click', e => {
    const isOpen = item.classList.contains('nav-open');
    
    if (window.innerWidth <= 768) {
      if (!isOpen) {
        e.preventDefault();
        e.stopPropagation();
      } else if (btn.getAttribute('href') === '#') {
        e.preventDefault();
      }
    } else {
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

    const newState = !isOpen;
    item.classList.toggle('nav-open', newState);
    btn.setAttribute('aria-expanded', String(newState));
  });
});

/* Clicking outside or pressing Escape closes menus */
document.addEventListener('click', () => {
  megaItems.forEach(i => {
    i.classList.remove('nav-open');
    i.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
    const mm = i.querySelector('.mega-menu');
    if (mm) mm.setAttribute('aria-hidden', 'true');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    megaItems.forEach(i => {
      i.classList.remove('nav-open');
      i.querySelector('.nav-link').setAttribute('aria-expanded','false');
    });
    if ($('searchBar')) $('searchBar').classList.remove('open');
    if ($('mainNav')) $('mainNav').classList.remove('open');
    if ($('hamburger')) {
        $('hamburger').classList.remove('open');
        $('hamburger').setAttribute('aria-expanded','false');
    }
  }
});

/* ============================================================
   3. NAVIGATION & SEARCH
   ============================================================ */
// Hamburger (Mobile Nav)
const hamburger = $('hamburger');
if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = $('mainNav').classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
}

// Search Bar Logic
const productData = [
  { name:'Coveralls (Blue)',   cat:'Uniforms',  price:'₱900',   img:'Assets/Products/UNI-PR1-Front-Coverall (Blue).JPG'   },
  { name:'Coveralls (Orange)', cat:'Uniforms',  price:'₱1,000', img:'Assets/Products/UNI-PR2-Front-Coverall (Orange).JPG' },
  { name:'Coveralls (Beige)',  cat:'Uniforms',  price:'₱950',   img:'Assets/Products/UNI-PR3-Front-Coverall (Beige).JPG'  },
  { name:"Chef's White Top",   cat:'Kitchen',   price:'₱800',   img:'Assets/Products/UNI-PR4-Front-Coverall (Chef\'s).JPG'},
  { name:'Full PPE Kit',       cat:'Safety',    price:'₱3,200', img:'https://placehold.co/42x42/e63946/fff?text=PPE'       },
  { name:'Safety Boot',        cat:'Footwear',  price:'₱1,800', img:'https://placehold.co/42x42/1a3a5c/f4d03f?text=Boot'  },
];

const searchToggle = $('searchToggle');
if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      const open = $('searchBar').classList.toggle('open');
      if (open) $('searchInput').focus();
      searchToggle.setAttribute('aria-expanded', String(open));
    });
}

const searchInput = $('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
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
}

/* ============================================================
   4. THEME & CURRENCY
   ============================================================ */
// Theme Toggle
const themeIcon = $('themeIcon');
const html = document.documentElement;
(function initTheme() {
  const saved = localStorage.getItem('cssp-theme') || 'light';
  html.setAttribute('data-theme', saved);
  if (themeIcon) themeIcon.className = saved === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
})();

if ($('themeToggle')) {
    $('themeToggle').addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('cssp-theme', next);
      if (themeIcon) themeIcon.className = next === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    });
}

// Currency Switcher
const rates = { PHP: { symbol: '₱', rate: 1 }, USD: { symbol: '$', rate: 0.018 }, EUR: { symbol: '€', rate: 0.016 } };
let currentCurrency = 'PHP';

if ($('currencyBtn')) {
  $('currencyBtn').addEventListener('click', () => $('currencyDropdown').classList.toggle('open'));
}

document.addEventListener('click', (e) => {
  if ($('currencySwitcher') && !$('currencySwitcher').contains(e.target)) {
    $('currencyDropdown')?.classList.remove('open');
  }
});

$$('#currencyDropdown li').forEach(item => {
  item.addEventListener('click', () => {
    const chosen = item.dataset.currency;
    currentCurrency = chosen;
    if ($('activeCurrency')) $('activeCurrency').textContent = chosen;
    $('currencyDropdown')?.classList.remove('open');
    $$('.card-price').forEach(el => {
      const base = parseFloat(el.dataset.base || "0");
      const { symbol, rate } = rates[chosen];
      el.textContent = symbol + (base * rate).toFixed(2);
    });
  });
});

/* ============================================================
   5. CONTACT FORM & NOTIFICATIONS
   ============================================================ */
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

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      showInlineError(emailEl, 'emailError', 'Please enter a valid email address.');
      return;
    }

    // Success logic
    showNotif("Message sent successfully!", true);
    setTimeout(() => {         
      nameEl.value = "";          
      emailEl.value = "";
      if($('contactPhone')) $('contactPhone').value = ""; // Clear phone if exists, but don't format/validate
      msgEl.value = ""; 
    }, 1000);    
  });
}

/* ============================================================
   6. POLICY AGREEMENT & UTILS
   ============================================================ */
const policyChecks  = $$('.policy-check');
const policyBtn     = $('policySubmit');

if (policyBtn) {
    policyBtn.addEventListener('click', () => {
        let missing = [];
        policyChecks.forEach(box => { if (!box.checked) missing.push(box.getAttribute('data-name')); });

        if (missing.length === 0) {
            $('successToast')?.classList.add('show');
            setTimeout(() => $('successToast')?.classList.remove('show'), 3000);
        } else {
            if($('warningMsg')) $('warningMsg').textContent = `Please check all.`;
            $('warningToast')?.classList.add('show');
            setTimeout(() => $('warningToast')?.classList.remove('show'), 4000);
        }
    });
}
// Back to Top functionality
if ($('backToTop')) {
    $('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Scroll Reveal
$$('section').forEach(s => s.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { 
      if (e.isIntersecting) { 
          e.target.classList.add('visible'); 
          revealObserver.unobserve(e.target); 
      } 
  });
}, { threshold: .1 });
$$('.reveal').forEach(el => revealObserver.observe(el));
