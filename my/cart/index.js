(function () {
  "use strict";

  ShopData.init();
  ShopUtils.init();

  var user = ShopUtils.getCurrentUser();
  if (!user) {
    location.href = "../../auth/login";
    return;
  }

  document.getElementById("member-name").textContent = user.name + "님";
  document.getElementById("logout-btn").addEventListener("click", function () {
    ShopUtils.logout();
    location.href = "../../";
  });

  var cartLayout = document.getElementById("cart-layout");
  var listEl = document.getElementById("cart-list");
  var emptyState = document.getElementById("empty-state");
  var totalEl = document.getElementById("cart-total");
  var addressEl = document.getElementById("address");
  var addressError = document.getElementById("address-error");
  var cartBadge = document.getElementById("cart-badge");

  function updateBadge() {
    var count = ShopUtils.getCartCount();
    if (count > 0) {
      cartBadge.textContent = count;
      cartBadge.hidden = false;
    } else {
      cartBadge.hidden = true;
    }
  }

  function renderRow(item) {
    var product = ShopData.getProductById(item.productId);
    if (!product) return null;

    var row = document.createElement("div");
    row.className = "cart-row";

    var thumb = document.createElement("div");
    thumb.className = "cart-thumb";
    if (product.image) {
      var img = document.createElement("img");
      img.src = ShopUtils.assetUrl(product.image);
      img.alt = product.name;
      thumb.appendChild(img);
    }

    var info = document.createElement("div");
    info.className = "cart-info";
    var name = document.createElement("p");
    name.className = "name";
    name.textContent = product.name;
    var price = document.createElement("p");
    price.className = "price";
    price.textContent = product.price.toLocaleString() + "원";
    info.appendChild(name);
    info.appendChild(price);

    var qtyControl = document.createElement("div");
    qtyControl.className = "qty-control";
    var minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.textContent = "-";
    minusBtn.setAttribute("aria-label", "수량 감소");
    minusBtn.addEventListener("click", function () {
      ShopUtils.updateCartQty(item.productId, Math.max(1, item.qty - 1));
      render();
    });
    var qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = item.qty;
    qtyInput.addEventListener("change", function () {
      var qty = Math.max(1, Number(qtyInput.value) || 1);
      ShopUtils.updateCartQty(item.productId, qty);
      render();
    });
    var plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.textContent = "+";
    plusBtn.setAttribute("aria-label", "수량 증가");
    plusBtn.addEventListener("click", function () {
      ShopUtils.updateCartQty(item.productId, item.qty + 1);
      render();
    });
    qtyControl.appendChild(minusBtn);
    qtyControl.appendChild(qtyInput);
    qtyControl.appendChild(plusBtn);

    var lineTotal = document.createElement("p");
    lineTotal.className = "line-price";
    lineTotal.textContent = (product.price * item.qty).toLocaleString() + "원";

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "삭제";
    removeBtn.addEventListener("click", function () {
      ShopUtils.removeFromCart(item.productId);
      render();
    });

    row.appendChild(thumb);
    row.appendChild(info);
    row.appendChild(qtyControl);
    row.appendChild(lineTotal);
    row.appendChild(removeBtn);
    return row;
  }

  function render() {
    var cart = ShopUtils.getCart();
    updateBadge();

    if (cart.length === 0) {
      cartLayout.hidden = true;
      emptyState.hidden = false;
      return;
    }

    cartLayout.hidden = false;
    emptyState.hidden = true;

    listEl.innerHTML = "";
    cart.forEach(function (item) {
      var row = renderRow(item);
      if (row) listEl.appendChild(row);
    });

    totalEl.textContent = ShopUtils.getCartTotal().toLocaleString() + "원";
  }

  document.getElementById("clear-cart-btn").addEventListener("click", function () {
    if (ShopUtils.getCart().length === 0) return;
    if (!confirm("장바구니를 비우시겠습니까?")) return;
    ShopUtils.clearCart();
    render();
  });

  var modal = document.getElementById("checkout-modal");
  var modalTotal = document.getElementById("modal-total");

  document.getElementById("checkout-btn").addEventListener("click", function () {
    addressError.hidden = true;
    if (!addressEl.value.trim()) {
      addressError.hidden = false;
      addressEl.focus();
      return;
    }
    modalTotal.textContent = ShopUtils.getCartTotal().toLocaleString() + "원";
    modal.hidden = false;
  });

  document.getElementById("cancel-checkout-btn").addEventListener("click", function () {
    modal.hidden = true;
  });

  document.getElementById("confirm-checkout-btn").addEventListener("click", function () {
    var cart = ShopUtils.getCart();
    var items = cart.map(function (item) {
      var product = ShopData.getProductById(item.productId);
      return {
        productId: item.productId,
        name: product ? product.name : "",
        price: product ? product.price : 0,
        qty: item.qty
      };
    }).filter(function (item) { return item.price > 0 || item.name; });

    var paymentInput = document.querySelector('input[name="payment"]:checked');

    var order = ShopUtils.createOrder({
      userId: user.id,
      items: items,
      total: ShopUtils.getCartTotal(),
      address: addressEl.value.trim(),
      paymentMethod: paymentInput ? paymentInput.value : "카드"
    });

    ShopUtils.clearCart();
    location.href = "../orders/status?id=" + encodeURIComponent(order.id);
  });

  render();
})();
