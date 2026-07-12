(function () {
  "use strict";

  ShopData.init();
  ShopUtils.init();

  var user = ShopUtils.getCurrentUser();

  document.getElementById("cart-link").href = user ? "../my/cart/" : "../guest/cart/";
  document.getElementById("orders-link").href = user ? "../my/orders/list" : "../guest/orders/lookup";

  var cartCount = ShopUtils.getCartCount();
  var cartBadge = document.getElementById("cart-badge");
  if (cartCount > 0) {
    cartBadge.textContent = cartCount;
    cartBadge.hidden = false;
  }

  if (user) {
    document.getElementById("guest-actions").hidden = true;
    document.getElementById("member-actions").hidden = false;
    document.getElementById("member-name").textContent = user.name + "님";
    document.getElementById("logout-btn").addEventListener("click", function () {
      ShopUtils.logout();
      location.href = "../";
    });
  }

  var tabsEl = document.getElementById("category-tabs");
  ShopData.getCategories().forEach(function (cat) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cat;
    btn.dataset.category = cat;
    tabsEl.appendChild(btn);
  });

  var params = new URLSearchParams(location.search);
  var initialCategory = params.get("category") || "";
  if (initialCategory) {
    tabsEl.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.category === initialCategory);
    });
  }

  var sortSelect = document.getElementById("sort-select");
  var grid = document.getElementById("product-grid");
  var emptyState = document.getElementById("empty-state");
  var addedModal = document.getElementById("added-modal");

  var viewToggle = document.getElementById("view-toggle");
  var VIEW_KEY = "shop_view_mode";

  function applyView(mode) {
    grid.classList.toggle("is-list-view", mode === "list");
    viewToggle.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.view === mode);
    });
    localStorage.setItem(VIEW_KEY, mode);
  }

  applyView(localStorage.getItem(VIEW_KEY) || "grid");

  viewToggle.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    applyView(btn.dataset.view);
  });

  function updateCartBadge() {
    var count = ShopUtils.getCartCount();
    cartBadge.textContent = count;
    cartBadge.hidden = count === 0;
  }

  function renderCard(p) {
    var card = document.createElement("a");
    card.className = "product-card" + (p.soldOut ? " is-soldout" : "");
    card.href = "detail?id=" + encodeURIComponent(p.id);

    var thumb = document.createElement("div");
    thumb.className = "product-thumb";
    if (p.image) {
      var img = document.createElement("img");
      img.src = ShopUtils.assetUrl(p.image);
      img.alt = p.name;
      thumb.appendChild(img);
    }
    if (p.soldOut) {
      var chip = document.createElement("span");
      chip.className = "chip chip-pill chip-danger";
      chip.textContent = "품절";
      thumb.appendChild(chip);
    }

    var category = document.createElement("p");
    category.className = "product-category";
    category.textContent = p.category;

    var name = document.createElement("p");
    name.className = "product-name";
    name.textContent = p.name;

    var price = document.createElement("p");
    price.className = "product-price";
    price.textContent = p.price.toLocaleString() + "원";

    var actions = document.createElement("div");
    actions.className = "product-card-actions";

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-outline btn-sm";
    addBtn.textContent = "담기";
    addBtn.disabled = p.soldOut;
    addBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      ShopUtils.addToCart(p.id, 1);
      updateCartBadge();
      addedModal.hidden = false;
    });

    var buyBtn = document.createElement("button");
    buyBtn.type = "button";
    buyBtn.className = "btn btn-accent btn-sm";
    buyBtn.textContent = "구매";
    buyBtn.disabled = p.soldOut;
    buyBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      ShopUtils.addToCart(p.id, 1);
      location.href = user ? "../my/cart/" : "../guest/cart/";
    });

    actions.appendChild(addBtn);
    actions.appendChild(buyBtn);

    card.appendChild(thumb);
    card.appendChild(category);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(actions);
    return card;
  }

  function activeCategory() {
    var active = tabsEl.querySelector("button.is-active");
    return active ? active.dataset.category : "";
  }

  function render() {
    var products = ShopData.getProducts();
    var category = activeCategory();
    if (category) {
      products = products.filter(function (p) { return p.category === category; });
    }

    var sort = sortSelect.value;
    if (sort === "price-asc") {
      products.sort(function (a, b) { return a.price - b.price; });
    } else if (sort === "price-desc") {
      products.sort(function (a, b) { return b.price - a.price; });
    } else if (sort === "brand") {
      products.sort(function (a, b) { return a.brand.localeCompare(b.brand); });
    }

    grid.innerHTML = "";
    emptyState.hidden = products.length > 0;
    products.forEach(function (p) { grid.appendChild(renderCard(p)); });
  }

  tabsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    tabsEl.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
    btn.classList.add("is-active");
    render();
  });
  sortSelect.addEventListener("change", render);

  document.getElementById("keep-shopping-btn").addEventListener("click", function () {
    addedModal.hidden = true;
  });

  document.getElementById("go-cart-btn").addEventListener("click", function () {
    location.href = user ? "../my/cart/" : "../guest/cart/";
  });

  render();
})();
