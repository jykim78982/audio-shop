(function () {
  "use strict";

  ShopData.init();
  ShopUtils.init();

  var user = ShopUtils.getCurrentUser();
  if (user) {
    document.getElementById("guest-actions").hidden = true;
    document.getElementById("member-actions").hidden = false;
    document.getElementById("member-name").textContent = user.name + "님";
    document.getElementById("logout-btn").addEventListener("click", function () {
      ShopUtils.logout();
      location.href = "../../";
    });
  }

  var cartCount = ShopUtils.getCartCount();
  var cartBadge = document.getElementById("cart-badge");
  if (cartCount > 0) {
    cartBadge.textContent = cartCount;
    cartBadge.hidden = false;
  }

  var form = document.getElementById("lookup-form");
  var errorEl = document.getElementById("form-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    var orderId = document.getElementById("order-id").value.trim();
    var phone = document.getElementById("phone").value.trim();

    var order = ShopUtils.findGuestOrder(orderId, phone);
    if (!order) {
      errorEl.textContent = "주문번호 또는 연락처가 일치하는 주문을 찾을 수 없습니다.";
      errorEl.hidden = false;
      return;
    }

    location.href = "status?id=" + encodeURIComponent(orderId) + "&phone=" + encodeURIComponent(phone);
  });
})();
