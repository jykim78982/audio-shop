(function () {
  "use strict";

  var user = ShopStorage.getCurrentUser();

  document.getElementById("cart-link").href = user ? "my/cart/index.html" : "guest/cart/index.html";
  document.getElementById("orders-link").href = user ? "my/orders/list.html" : "guest/orders/lookup.html";

  var cartCount = ShopStorage.getCartCount();
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
      ShopStorage.logout();
      location.href = "index.html";
    });
  }

  var tabsEl = document.getElementById("category-tabs");
  ShopStorage.getCategories().forEach(function (cat) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cat;
    btn.dataset.category = cat;
    tabsEl.appendChild(btn);
  });

  var grid = document.getElementById("product-grid");

  function renderCard(p) {
    var card = document.createElement("a");
    card.className = "product-card" + (p.soldOut ? " is-soldout" : "");
    card.href = "products/detail.html?id=" + encodeURIComponent(p.id);

    var thumb = document.createElement("div");
    thumb.className = "product-thumb";
    if (p.image) {
      var img = document.createElement("img");
      img.src = ShopStorage.assetUrl(p.image);
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

    card.appendChild(thumb);
    card.appendChild(category);
    card.appendChild(name);
    card.appendChild(price);
    return card;
  }

  function render(category) {
    var products = ShopStorage.getProducts();
    if (category) {
      products = products.filter(function (p) { return p.category === category; });
    }
    grid.innerHTML = "";
    products.slice(0, 8).forEach(function (p) {
      grid.appendChild(renderCard(p));
    });
  }

  tabsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    tabsEl.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
    btn.classList.add("is-active");
    render(btn.dataset.category);
  });

  render("");
})();
