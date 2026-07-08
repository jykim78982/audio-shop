(function () {
  "use strict";

  var admin = ShopStorage.requireAdminSession();
  if (!admin) return;

  document.getElementById("admin-name").textContent = admin.name + "님 환영합니다";

  var orders = ShopStorage.getOrders();
  var products = ShopStorage.getProducts();

  var revenue = orders.reduce(function (sum, o) { return sum + (o.total || 0); }, 0);
  var preparing = orders.filter(function (o) { return o.status === "배송준비중"; }).length;

  document.getElementById("stat-order-count").textContent = orders.length;
  document.getElementById("stat-revenue").textContent = revenue.toLocaleString() + "원";
  document.getElementById("stat-preparing").textContent = preparing;
  document.getElementById("stat-product-count").textContent = products.length;

  document.getElementById("logout-btn").addEventListener("click", function () {
    ShopStorage.adminLogout();
    location.href = ShopStorage.adminRoot() + "auth/login.html";
  });
})();
