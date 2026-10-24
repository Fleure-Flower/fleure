// Shared site behaviour: header, footer, cart, email contact and saving orders.
(function () {
  const shop = window.SHOP;
  const products = window.PRODUCTS;
  const byId = (id) => products.find((p) => p.id === id);
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rupees = (n) => "₹" + Number(n).toLocaleString("en-IN");

  const icons = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8.4 3 5 6.5 5c2 0 3.5 1.2 5.5 3.3C14 6.2 15.5 5 17.5 5 21 5 23 8.4 21.5 11.8 19.5 16.4 12 21 12 21z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9S10 4 7.5 5 9 9 12 9zm0 0s2-5 4.5-4S15 9 12 9z"/></svg>',
    ribbon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 12 5 7v10l7-5zm0 0 7-5v10l-7-5z"/><circle cx="12" cy="12" r="1.6"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  };
  window.ICONS = icons;

  // Email is the only contact. Until the shop email is set, links go to the contact form.
  const mailLink = (subject, body = "") => shop.email
    ? `mailto:${shop.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}` : "contact.html";
  window.mailLink = mailLink;
  window.emailUs = (text = "email us") => `<a href="${esc(mailLink("Custom bouquet request"))}">${text}</a>`;

  // Saves an order, custom request or message to the shop's Google Sheet (see scripts/orders-sheet.gs).
  window.sendToShop = async (record) => {
    if (!shop.orderSheetUrl) throw new Error("not-set-up");
    const res = await fetch(shop.orderSheetUrl, { method: "POST", body: new URLSearchParams({ data: JSON.stringify(record) }) });
    const out = await res.json();
    if (!out.ok) throw new Error(out.error || "not saved");
  };
  window.newOrderId = (prefix = "FL") => {
    const d = new Date(), pad = (n) => String(n).padStart(2, "0");
    return `${prefix}-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  };

  /* ---------- Header and footer ---------- */
  const page = document.body.dataset.page;
  const navItems = [
    ["home", "index.html", "Home"], ["shop", "shop.html", "Shop"], ["custom", "custom.html", "Custom Orders"],
    ["about", "about.html", "About"], ["order", "how-to-order.html", "How to Order"], ["contact", "contact.html", "Contact"],
  ];

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="container header-inner">
      <a class="logo" href="index.html" aria-label="${esc(shop.name)} home">
        <span class="logo-name">${esc(shop.name)}</span><span class="logo-sub">Handmade Flowers</span>
      </a>
      <nav class="nav" id="site-nav" aria-label="Main">
        ${navItems.map(([id, href, label]) => `<a href="${href}"${id === page ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <div class="header-actions">
        <a class="btn btn-primary header-wa" href="shop.html">Order Now</a>
        <button class="icon-btn" type="button" data-open-cart aria-label="Open cart">${icons.bag}<span class="badge" data-cart-count hidden>0</span></button>
        <button class="icon-btn menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">${icons.menu}</button>
      </div>
    </div>`;
  document.body.prepend(header);

  const toggle = $(".menu-toggle", header);
  toggle.addEventListener("click", () => {
    const open = $("#site-nav").classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  const socials = [
    shop.instagram ? `<a href="https://instagram.com/${esc(shop.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${icons.instagram}</a>` : "",
    shop.email ? `<a href="mailto:${esc(shop.email)}" aria-label="Email">${icons.mail}</a>` : "",
  ].join("");

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container footer-grid">
      <div>
        <a class="logo" href="index.html"><span class="logo-name">${esc(shop.name)}</span><span class="logo-sub">Handmade Flowers</span></a>
        <p class="muted" style="margin-top:12px">Handmade flowers, made with love.</p>
        ${socials ? `<div class="socials">${socials}</div>` : ""}
      </div>
      <div><h3>Shop</h3><ul>
        <li><a href="shop.html">All Bouquets</a></li>
        <li><a href="shop.html#ribbon">Ribbon Roses</a></li>
        <li><a href="shop.html#lily">Lily Bouquets</a></li>
        <li><a href="shop.html#gift">Gift Bouquets</a></li>
      </ul></div>
      <div><h3>Customer Care</h3><ul>
        <li><a href="custom.html">Custom Orders</a></li>
        <li><a href="how-to-order.html">How to Order</a></li>
        <li><a href="how-to-order.html#faq">FAQ</a></li>
        <li><a href="contact.html">Contact Us</a></li>
      </ul></div>
      <div><h3>About</h3><ul>
        <li><a href="about.html">Our Story</a></li>
        <li><a href="about.html#craft">The Craft Process</a></li>
        <li><a href="how-to-order.html#care">Care Guide</a></li>
      </ul></div>
    </div>
    <div class="container footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc(shop.name)} Handmade Flowers. All rights reserved.</span>
      <span>Made with love <span style="color:var(--rose)">♥</span></span>
    </div>`;
  document.body.append(footer);

  /* ---------- Cart ---------- */
  const KEY = "fleure-cart";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} render(); };

  const drawer = document.createElement("div");
  drawer.innerHTML = `
    <div class="drawer-backdrop" data-close-cart hidden></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" hidden>
      <div class="drawer-head"><h2 id="cart-title">Your bag</h2><button class="icon-btn" type="button" data-close-cart aria-label="Close cart">${icons.close}</button></div>
      <div class="drawer-body" data-cart-body></div>
      <div class="drawer-foot" data-cart-foot></div>
    </aside>`;
  document.body.append(drawer);
  const panel = $(".drawer", drawer), backdrop = $(".drawer-backdrop", drawer);
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    panel.hidden = backdrop.hidden = false;
    $("[data-close-cart].icon-btn", panel).focus();
  }
  function closeCart() {
    panel.hidden = backdrop.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-cart]")) openCart();
    if (e.target.closest("[data-close-cart]")) closeCart();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) closeCart(); });

  const lineTotal = (item) => (item.price ? item.price * item.qty : 0);

  // The bag as plain text, one bouquet per line, for the order sheet.
  window.itemsText = (items) => items.map((it, i) => {
    const opts = Object.entries(it.options || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ");
    const price = it.price ? `${rupees(it.price)} x ${it.qty} = ${rupees(lineTotal(it))}` : `x ${it.qty} (price to confirm)`;
    return `${i + 1}. ${it.name}${opts ? ` (${opts})` : ""}, ${price}${it.note ? `, gift note: ${it.note}` : ""}${it.request ? `, extra request: ${it.request}` : ""}`;
  }).join("\n");
  window.lineTotal = lineTotal;
  window.getCart = () => cart.slice();
  window.clearCart = () => { cart = []; save(); };

  function render() {
    const count = cart.reduce((s, it) => s + it.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((b) => { b.textContent = count; b.hidden = count === 0; });
    const body = $("[data-cart-body]"), foot = $("[data-cart-foot]");
    if (!cart.length) {
      body.innerHTML = `<div class="empty"><p>Your bag is empty.</p><a class="btn btn-secondary" href="shop.html">Browse bouquets</a></div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = cart.map((it, i) => `
      <div class="cart-item">
        <img src="${esc(it.image)}" alt="">
        <div><strong>${esc(it.name)}</strong>
          <div class="meta">${Object.entries(it.options || {}).filter(([, v]) => v).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(" · ")}</div>
          ${it.request ? `<div class="meta">Request: ${esc(it.request)}</div>` : ""}
          <div class="meta">Qty ${it.qty} · ${it.price ? rupees(lineTotal(it)) : "Price on request"}</div>
        </div>
        <button class="remove" type="button" data-remove="${i}">Remove</button>
      </div>`).join("");
    const total = cart.reduce((s, it) => s + lineTotal(it), 0);
    foot.innerHTML = `
      <div class="cart-total"><span>Total</span><span>${rupees(total)}${cart.some((it) => !it.price) ? " +" : ""}</span></div>
      <a class="btn btn-primary btn-block" href="checkout.html">Checkout</a>
      <p class="muted" style="font-size:.78rem;margin:0;text-align:center">Pickup is free. Delivery only in ${shop.delivery.area}: ₹${shop.delivery.day} (day) or ₹${shop.delivery.night} (night). No cash on delivery.</p>`;
    body.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => { cart.splice(Number(b.dataset.remove), 1); save(); }));
  }

  const toast = document.createElement("div");
  toast.className = "toast"; toast.hidden = true; toast.setAttribute("role", "status");
  document.body.append(toast);
  let toastTimer;
  function notify(msg) { toast.textContent = msg; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toast.hidden = true), 2400); }

  window.addToCart = function (item, quiet) {
    const key = JSON.stringify([item.id, item.options, item.note, item.request, item.price]);
    const existing = cart.find((it) => JSON.stringify([it.id, it.options, it.note, it.request, it.price]) === key);
    if (existing) existing.qty += item.qty; else cart.push(item);
    save();
    if (!quiet) notify(`${item.name} added to your bag`);
  };

  /* ---------- Product cards ---------- */
  window.priceLabel = (p) => (p.price == null ? "Ask us" : (p.priceFrom ? "from " : "") + rupees(p.price));
  // Drawn bouquet for the given choices; cards show a real photo when there is one.
  // Real photos exist for red ribbon roses with a red bow: every wrap, with and without glitter, 1 to 30 roses.
  // Photos reuse this script's ?v= stamp so browsers fetch new copies after each update.
  const version = new URL(document.currentScript.src).searchParams.get("v") || "";
  // Real photos by rose colour: folder under assets/sizes and the counts photographed in every wrap and finish, and single extra photos.
  const SIZE_PHOTOS = { Red: { dir: "", counts: { min: 1, max: 30 } }, Pink: { dir: "pink/", counts: [1, 3], extra: ["black-plain-7", "black-glitter-7", "newspaper-glitter-7", "white-glitter-7", "black-plain-10", "black-plain-20", "white-plain-7", "white-plain-10", "white-plain-13", "white-plain-17", "white-plain-20"] }, White: { dir: "white/", counts: [1, 3] }, Black: { dir: "black/", counts: [1, 3] } };
  // Real lily bouquet photos: [colour, wrap, number of lilies, file]. Lilies always show a real photo:
  // the exact match when there is one, otherwise the closest photo in the same colour (same wrap first).
  const LILY_PHOTOS = [
    ["Red", "White", 1, "assets/sizes/lily/red/white-plain-1.jpg"], ["Red", "Black", 1, "assets/sizes/lily/red/black-plain-1.jpg"],
    ["Red", "Newspaper", 1, "assets/sizes/lily/red/newspaper-plain-1.jpg"],
    ["White", "Black", 1, "assets/sizes/lily/white/black-plain-1.jpg"], ["White", "Black", 3, "assets/sizes/lily/white/black-plain-3.jpg"],
    ["White", "Black", 10, "assets/sizes/lily/white/black-plain-10.jpg"], ["White", "Newspaper", 1, "assets/sizes/lily/white/newspaper-plain-1.jpg"],
    ["White", "Newspaper", 3, "assets/sizes/lily/white/newspaper-plain-3.jpg"], ["White", "White", 10, "assets/photos/lily-white_white-wrap.jpg"],
    ["White", "Newspaper", 10, "assets/photos/lily-white_newspaper-wrap.jpg"],
    ["Pink", "Black", 1, "assets/sizes/lily/pink/black-plain-1.jpg"], ["Pink", "Black", 3, "assets/sizes/lily/pink/black-plain-3.jpg"],
    ["Pink", "Newspaper", 1, "assets/sizes/lily/pink/newspaper-plain-1.jpg"], ["Pink", "Newspaper", 3, "assets/sizes/lily/pink/newspaper-plain-3.jpg"],
    ["Red & White", "White", 10, "assets/photos/lily-red-white_white-wrap.jpg"],
  ];
  const lilyPhoto = (o) => {
    const same = LILY_PHOTOS.filter(([c]) => c === o.colours);
    if (!same.length) return null;
    const score = ([, w, n]) => (w === o.wrap ? 0 : 100) + Math.abs(n - o.count);
    const best = same.reduce((a, b) => (score(b) < score(a) ? b : a));
    return { src: `${best[3]}?v=${version}`, exact: score(best) === 0 };
  };
  window.photoIsExact = (p, choice) => {
    const o = Object.assign({ kind: p.kind, flowers: p.flowers }, p.look, choice || {});
    const lily = o.flowers && o.flowers[0] === "lily" && lilyPhoto(o);
    return lily ? lily.exact : Boolean(sizePhoto(o));
  };
  const sizePhoto = (o) => {
    if (o.kind !== "ribbon") { const lily = o.flowers && o.flowers[0] === "lily" && lilyPhoto(o); return lily ? lily.src : null; }
    const set = o.ribbon === o.colours && SIZE_PHOTOS[o.colours];
    if (!set) return null;
    const c = set.counts, has = Array.isArray(c) ? c.includes(o.count) : o.count >= c.min && o.count <= c.max;
    const name = `${o.wrap.toLowerCase()}-${o.glitter ? "glitter" : "plain"}-${o.count}`;
    return has || (set.extra || []).includes(name) ? `assets/sizes/${set.dir}${name}.jpg?v=${version}` : null;
  };
  window.drawBouquet = (p, choice) => {
    const o = Object.assign({ kind: p.kind, flowers: p.flowers }, p.look, choice || {});
    return sizePhoto(o) || bouquetSrc(o);
  };
  window.productImage = (p) => (p.images.length ? p.images[0] : drawBouquet(p));
  window.productCard = (p) => `
    <article class="card">
      <a class="card-link" href="product.html?id=${p.id}">
        <img class="card-img" src="${productImage(p)}" alt="${esc(p.name)} bouquet" loading="lazy" width="300" height="375">
        <h3>${esc(p.name)}</h3>
      </a>
      <span class="price">${priceLabel(p)}</span>
      <a class="btn btn-outline" href="product.html?id=${p.id}">Add / Order</a>
    </article>`;
  window.rupees = rupees;
  window.esc = esc;
  window.byId = byId;

  render();
})();
