/* =========================================================
   ShopEase | script.js
   Plain JavaScript, no libraries.
   Sections: data, helpers, products, cart, UI (menu, search),
   offers (countdown, coupon), start-up.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Data (edit these to change the store) ---------- */
  var CURRENCY = '₹';
  var FREE_SHIPPING_AT = 999;

  var CATEGORIES = [
    { id: 'electronics', name: 'Electronics', icon: 'p-headphones' },
    { id: 'fashion', name: 'Fashion', icon: 'p-tshirt' },
    { id: 'home', name: 'Home & Living', icon: 'p-lamp' },
    { id: 'beauty', name: 'Beauty', icon: 'p-jar' },
    { id: 'sports', name: 'Sports', icon: 'p-dumbbell' },
    { id: 'accessories', name: 'Accessories', icon: 'p-watch' }
  ];

  var PRODUCTS = [
    { id: 1, name: 'Aura Wireless Headphones', cat: 'electronics', price: 4999, old: 6999, rating: 4.7, reviews: 1284, badge: 'Best seller', icon: 'p-headphones', tint: '#ede9fe' },
    { id: 2, name: 'Pulse Smartwatch S2', cat: 'accessories', price: 3499, old: 4499, rating: 4.5, reviews: 862, badge: 'Sale', icon: 'p-watch', tint: '#e9d5ff' },
    { id: 3, name: 'Echo Mini Speaker', cat: 'electronics', price: 1999, old: 2599, rating: 4.4, reviews: 540, badge: '', icon: 'p-speaker', tint: '#ddd6fe' },
    { id: 4, name: 'Lumen Mirrorless Camera', cat: 'electronics', price: 18999, old: 21999, rating: 4.8, reviews: 214, badge: 'New', icon: 'p-camera', tint: '#e0e7ff' },
    { id: 5, name: 'Stride Run Sneakers', cat: 'fashion', price: 2799, old: 3999, rating: 4.6, reviews: 1530, badge: 'Sale', icon: 'p-sneaker', tint: '#f3e8ff' },
    { id: 6, name: 'Classic Cotton Tee', cat: 'fashion', price: 799, old: 999, rating: 4.3, reviews: 2210, badge: '', icon: 'p-tshirt', tint: '#ede9fe' },
    { id: 7, name: 'Urban Daypack 24L', cat: 'accessories', price: 1899, old: 2499, rating: 4.6, reviews: 688, badge: '', icon: 'p-backpack', tint: '#e9d5ff' },
    { id: 8, name: 'Shade Aviator Sunglasses', cat: 'accessories', price: 1299, old: 0, rating: 4.2, reviews: 390, badge: '', icon: 'p-glasses', tint: '#ddd6fe' },
    { id: 9, name: 'Halo Desk Lamp', cat: 'home', price: 1599, old: 1999, rating: 4.5, reviews: 471, badge: '', icon: 'p-lamp', tint: '#f3e8ff' },
    { id: 10, name: 'Steel Flask 750 ml', cat: 'home', price: 699, old: 0, rating: 4.7, reviews: 1893, badge: 'Eco pick', icon: 'p-bottle', tint: '#e0e7ff' },
    { id: 11, name: 'Glow Vitamin C Serum', cat: 'beauty', price: 899, old: 1199, rating: 4.4, reviews: 967, badge: '', icon: 'p-jar', tint: '#ede9fe' },
    { id: 12, name: 'Pro Grip Dumbbell Set', cat: 'sports', price: 2499, old: 2999, rating: 4.5, reviews: 325, badge: '', icon: 'p-dumbbell', tint: '#e9d5ff' }
  ];

  /* ---------- 2. Small helpers ---------- */
  function $(selector) { return document.querySelector(selector); }
  function $all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }

  function money(n) { return CURRENCY + Number(n).toLocaleString('en-IN'); }

  function catName(id) {
    for (var i = 0; i < CATEGORIES.length; i++) { if (CATEGORIES[i].id === id) { return CATEGORIES[i].name; } }
    return '';
  }

  function productById(id) {
    for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].id === id) { return PRODUCTS[i]; } }
    return null;
  }

  function icon(id, size) {
    return '<svg class="icon" width="' + size + '" height="' + size + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  var toastTimer = null;
  function toast(message) {
    var el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------- 3. Products: filter, sort, render ---------- */
  var state = { category: 'all', sort: 'featured', query: '' };

  function renderCategories() {
    var html = '';
    CATEGORIES.forEach(function (c) {
      html += '<button class="cat-card" type="button" data-cat="' + c.id + '">' +
        '<span class="cat-icon">' + icon(c.icon, 30) + '</span>' + c.name + '</button>';
    });
    $('#categoryGrid').innerHTML = html;
  }

  function renderChips() {
    var html = '<button class="chip" type="button" data-chip="all" aria-pressed="' + (state.category === 'all') + '">All</button>';
    CATEGORIES.forEach(function (c) {
      html += '<button class="chip" type="button" data-chip="' + c.id + '" aria-pressed="' + (state.category === c.id) + '">' + c.name + '</button>';
    });
    $('#filterChips').innerHTML = html;

    // Highlight the matching link in the top navigation
    $all('.primary-nav a[data-cat]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-cat') === state.category);
    });
  }

  function visibleProducts() {
    var q = state.query.toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      var inCategory = state.category === 'all' || p.cat === state.category;
      var matches = !q || (p.name + ' ' + catName(p.cat)).toLowerCase().indexOf(q) !== -1;
      return inCategory && matches;
    });

    if (state.sort === 'price-asc') { list.sort(function (a, b) { return a.price - b.price; }); }
    if (state.sort === 'price-desc') { list.sort(function (a, b) { return b.price - a.price; }); }
    if (state.sort === 'rating') { list.sort(function (a, b) { return b.rating - a.rating; }); }
    return list;
  }

  function productCard(p) {
    var discount = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
    var badgeClass = p.badge === 'Sale' ? 'badge sale' : 'badge';
    var fill = Math.round((p.rating / 5) * 100);

    return '<article class="card">' +
      '<div class="card-media" style="--tint:' + p.tint + '">' +
        (p.badge ? '<span class="' + badgeClass + '">' + p.badge + '</span>' : '') +
        icon(p.icon, 96) +
      '</div>' +
      '<div class="card-body">' +
        '<p class="card-cat">' + catName(p.cat) + '</p>' +
        '<h3 class="card-title">' + p.name + '</h3>' +
        '<div class="rating">' +
          '<span class="stars" role="img" aria-label="Rated ' + p.rating + ' out of 5">' +
            '<span aria-hidden="true">★★★★★</span>' +
            '<span class="stars-fill" aria-hidden="true" style="width:' + fill + '%">★★★★★</span>' +
          '</span>' +
          '<span>' + p.rating + ' (' + p.reviews.toLocaleString('en-IN') + ')</span>' +
        '</div>' +
        '<div class="price-row">' +
          '<span class="price">' + money(p.price) + '</span>' +
          (p.old ? '<span class="old">' + money(p.old) + '</span><span class="off">' + discount + '% off</span>' : '') +
        '</div>' +
        '<button class="btn btn-primary" type="button" data-add="' + p.id + '">Add to Cart</button>' +
      '</div>' +
    '</article>';
  }

  function renderProducts() {
    var list = visibleProducts();
    var html = '';
    list.forEach(function (p) { html += productCard(p); });
    $('#productGrid').innerHTML = html;
    $('#emptyState').hidden = list.length !== 0;

    var label = state.category === 'all' ? 'all categories' : catName(state.category);
    var text = 'Showing ' + list.length + (list.length === 1 ? ' product' : ' products') + ' in ' + label;
    if (state.query) { text += ' for "' + state.query + '"'; }
    $('#resultCount').textContent = text;
  }

  function refresh() { renderChips(); renderProducts(); }

  function setCategory(id, scroll) {
    state.category = id;
    refresh();
    if (scroll) { $('#products').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  /* ---------- 4. Cart (saved in localStorage) ---------- */
  var cart = loadCart();

  function loadCart() {
    try {
      var saved = JSON.parse(localStorage.getItem('shopease-cart'));
      return saved && typeof saved === 'object' ? saved : {};
    } catch (e) { return {}; }
  }

  function saveCart() {
    try { localStorage.setItem('shopease-cart', JSON.stringify(cart)); } catch (e) { /* storage may be blocked */ }
  }

  function cartCount() {
    var n = 0;
    Object.keys(cart).forEach(function (id) { n += cart[id]; });
    return n;
  }

  function cartSubtotal() {
    var sum = 0;
    Object.keys(cart).forEach(function (id) {
      var p = productById(Number(id));
      if (p) { sum += p.price * cart[id]; }
    });
    return sum;
  }

  function renderCart() {
    var ids = Object.keys(cart).filter(function (id) { return productById(Number(id)); });
    var count = cartCount();
    var subtotal = cartSubtotal();

    // Header badge
    var badge = $('#cartCount');
    badge.textContent = count;
    badge.hidden = count === 0;
    $('#cartBtn').setAttribute('aria-label', 'Open cart, ' + count + (count === 1 ? ' item' : ' items'));

    // Items
    var html = '';
    ids.forEach(function (id) {
      var p = productById(Number(id));
      var qty = cart[id];
      html += '<li class="cart-item">' +
        '<div class="cart-media" style="--tint:' + p.tint + '">' + icon(p.icon, 32) + '</div>' +
        '<div>' +
          '<p class="cart-name">' + p.name + '</p>' +
          '<p class="cart-price">' + money(p.price) + ' each</p>' +
          '<div class="qty">' +
            '<button type="button" data-dec="' + p.id + '" aria-label="Decrease quantity of ' + p.name + '">' + icon('i-minus', 16) + '</button>' +
            '<span aria-live="polite">' + qty + '</span>' +
            '<button type="button" data-inc="' + p.id + '" aria-label="Increase quantity of ' + p.name + '">' + icon('i-plus', 16) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-line">' +
          '<strong>' + money(p.price * qty) + '</strong>' +
          '<button class="remove" type="button" data-remove="' + p.id + '" aria-label="Remove ' + p.name + ' from cart">' + icon('i-trash', 18) + '</button>' +
        '</div>' +
      '</li>';
    });
    $('#cartList').innerHTML = html;

    // Empty vs filled states
    var empty = ids.length === 0;
    $('#cartEmpty').hidden = !empty;
    $('#cartList').hidden = empty;
    $('#cartFoot').hidden = empty;
    $('#shipProgress').hidden = empty;

    $('#cartSubtotal').textContent = money(subtotal);

    // Free shipping progress
    var remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
    $('#shipText').textContent = remaining > 0
      ? 'Add ' + money(remaining) + ' more for free shipping'
      : 'You have unlocked free shipping!';
    $('#shipBar').style.width = Math.min(100, Math.round((subtotal / FREE_SHIPPING_AT) * 100)) + '%';
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    toast(productById(id).name + ' added to cart');
  }

  function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) { delete cart[id]; }
    saveCart();
    renderCart();
  }

  function removeItem(id) {
    delete cart[id];
    saveCart();
    renderCart();
  }

  /* Drawer open/close with basic keyboard support */
  var drawer = $('#cartDrawer');
  var overlay = $('#overlay');
  var lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    $('#closeCart').focus();
  }

  function closeCart() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  function trapFocus(e) {
    if (e.key !== 'Tab' || !drawer.classList.contains('open')) { return; }
    var focusable = $all('#cartDrawer button:not([hidden])').filter(function (el) { return el.offsetParent !== null; });
    if (!focusable.length) { return; }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- 5. Menu, search and filters ---------- */
  var menuBtn = $('#menuBtn');
  var nav = $('#primaryNav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close categories menu' : 'Open categories menu');
  }

  function bindUI() {
    // Mobile menu
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    window.addEventListener('resize', function () { if (window.innerWidth > 820) { setMenu(false); } });

    // Any link or button with data-cat filters the grid (nav, footer, offer cards, category tiles)
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-cat]');
      if (el) {
        if (el.tagName === 'A') { e.preventDefault(); }
        setCategory(el.getAttribute('data-cat'), true);
        setMenu(false);
        return;
      }
      // Clicking any other nav link closes the mobile menu
      if (e.target.closest('#primaryNav a')) { setMenu(false); }
    });

    // Filter chips
    $('#filterChips').addEventListener('click', function (e) {
      var chip = e.target.closest('[data-chip]');
      if (chip) { setCategory(chip.getAttribute('data-chip'), false); }
    });

    // Sort
    $('#sortSelect').addEventListener('change', function (e) {
      state.sort = e.target.value;
      renderProducts();
    });

    // Search: filters while typing, scrolls to results on submit
    var input = $('#searchInput');
    input.addEventListener('input', function () {
      state.query = input.value.trim();
      renderProducts();
    });
    $('#searchForm').addEventListener('submit', function (e) {
      e.preventDefault();
      state.query = input.value.trim();
      state.category = 'all';
      refresh();
      $('#products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#resetFilters').addEventListener('click', function () {
      state.category = 'all';
      state.query = '';
      state.sort = 'featured';
      input.value = '';
      $('#sortSelect').value = 'featured';
      refresh();
    });

    // Add to cart (event delegation on the grid)
    $('#productGrid').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-add]');
      if (btn) { addToCart(Number(btn.getAttribute('data-add'))); }
    });

    // Cart drawer controls
    $('#cartBtn').addEventListener('click', openCart);
    $('#closeCart').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    $('#continueShopping').addEventListener('click', function () {
      closeCart();
      $('#products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) { closeCart(); }
      trapFocus(e);
    });

    $('#cartList').addEventListener('click', function (e) {
      var inc = e.target.closest('[data-inc]');
      var dec = e.target.closest('[data-dec]');
      var rem = e.target.closest('[data-remove]');
      if (inc) { changeQty(Number(inc.getAttribute('data-inc')), 1); }
      if (dec) { changeQty(Number(dec.getAttribute('data-dec')), -1); }
      if (rem) { removeItem(Number(rem.getAttribute('data-remove'))); }
    });

    $('#checkoutBtn').addEventListener('click', function () {
      toast('Demo only: checkout is not connected');
    });

    // Newsletter
    $('#newsletterForm').addEventListener('submit', function (e) {
      e.preventDefault();
      e.target.reset();
      toast('Thanks for subscribing!');
    });
  }

  /* ---------- 6. Offers: countdown and coupon ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function startCountdown() {
    var KEY = 'shopease-offer-end';
    var end = 0;
    try { end = Number(localStorage.getItem(KEY)) || 0; } catch (e) { end = 0; }
    if (end < Date.now()) {
      end = Date.now() + (2 * 24 + 6) * 3600 * 1000; // 2 days 6 hours from now
      try { localStorage.setItem(KEY, String(end)); } catch (e) { /* ignore */ }
    }

    function tick() {
      var diff = Math.max(0, end - Date.now());
      var s = Math.floor(diff / 1000);
      $('#tDays').textContent = pad(Math.floor(s / 86400));
      $('#tHours').textContent = pad(Math.floor((s % 86400) / 3600));
      $('#tMins').textContent = pad(Math.floor((s % 3600) / 60));
      $('#tSecs').textContent = pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  function bindCoupon() {
    $('#copyCoupon').addEventListener('click', function () {
      var code = $('#couponCode').textContent;
      function done() { toast('Code ' + code + ' copied'); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, done);
      } else {
        var temp = document.createElement('textarea');
        temp.value = code;
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand('copy'); } catch (e) { /* ignore */ }
        document.body.removeChild(temp);
        done();
      }
    });
  }

  /* ---------- 7. Start-up ---------- */
  function init() {
    $('#year').textContent = new Date().getFullYear();
    renderCategories();
    refresh();
    renderCart();
    bindUI();
    bindCoupon();
    startCountdown();
  }

  init();
})();
