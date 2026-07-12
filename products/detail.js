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

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var product = id ? ShopData.getProductById(id) : null;

  if (!product) {
    document.getElementById("not-found").hidden = false;
    return;
  }

  document.getElementById("detail-view").hidden = false;
  document.getElementById("detail-content").hidden = false;
  document.getElementById("detail-name").textContent = product.name;
  document.getElementById("detail-brand").textContent = product.brand;
  document.getElementById("detail-category").textContent = product.category;
  document.getElementById("detail-price").textContent = product.price.toLocaleString() + "원";
  document.getElementById("detail-description").textContent = product.description || "등록된 설명이 없습니다.";

  document.getElementById("spec-brand").textContent = product.brand;
  document.getElementById("spec-category").textContent = product.category;
  document.getElementById("spec-price").textContent = product.price.toLocaleString() + "원";
  document.getElementById("spec-status").textContent = product.soldOut ? "품절" : "판매중";

  var statusChip = document.getElementById("detail-status");
  statusChip.textContent = product.soldOut ? "품절" : "판매중";
  statusChip.className = "chip chip-pill " + (product.soldOut ? "chip-danger" : "chip-success");

  var img = document.getElementById("detail-image");
  if (product.image) {
    img.src = ShopUtils.assetUrl(product.image);
    img.alt = product.name;
  } else {
    img.remove();
  }

  var qtyInput = document.getElementById("qty");
  document.getElementById("qty-minus").addEventListener("click", function () {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });
  document.getElementById("qty-plus").addEventListener("click", function () {
    qtyInput.value = Number(qtyInput.value) + 1;
  });
  qtyInput.addEventListener("change", function () {
    if (Number(qtyInput.value) < 1) qtyInput.value = 1;
  });

  var addCartBtn = document.getElementById("add-cart-btn");
  var buyNowBtn = document.getElementById("buy-now-btn");
  var addedModal = document.getElementById("added-modal");
  if (product.soldOut) {
    addCartBtn.disabled = true;
    buyNowBtn.disabled = true;
    document.getElementById("soldout-help").hidden = false;
  } else {
    addCartBtn.addEventListener("click", function () {
      ShopUtils.addToCart(product.id, Number(qtyInput.value));
      var count = ShopUtils.getCartCount();
      cartBadge.textContent = count;
      cartBadge.hidden = count === 0;
      addedModal.hidden = false;
    });

    document.getElementById("keep-shopping-btn").addEventListener("click", function () {
      addedModal.hidden = true;
    });

    document.getElementById("go-cart-btn").addEventListener("click", function () {
      location.href = user ? "../my/cart/" : "../guest/cart/";
    });

    buyNowBtn.addEventListener("click", function () {
      ShopUtils.addToCart(product.id, Number(qtyInput.value));
      location.href = user ? "../my/cart/" : "../guest/cart/";
    });
  }
})();
