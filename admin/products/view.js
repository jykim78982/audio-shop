(function () {
  "use strict";

  ShopData.init();
  ShopUtils.init();

  var admin = ShopUtils.requireAdminSession();
  if (!admin) return;

  document.getElementById("logout-btn").addEventListener("click", function () {
    ShopUtils.adminLogout();
    location.href = ShopUtils.adminRoot() + "auth/login.html";
  });

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var product = id ? ShopData.getProductById(id) : null;

  if (!product) {
    document.getElementById("not-found").hidden = false;
    return;
  }

  document.getElementById("product-view").hidden = false;
  document.getElementById("view-name").textContent = product.name;
  document.getElementById("view-brand").textContent = product.brand;
  document.getElementById("view-category").textContent = product.category;
  document.getElementById("view-price").textContent = product.price.toLocaleString() + "원";
  document.getElementById("view-description").textContent = product.description || "등록된 설명이 없습니다.";
  document.getElementById("edit-link").href = "edit.html?id=" + encodeURIComponent(product.id);

  var statusChip = document.getElementById("view-status");
  statusChip.textContent = product.soldOut ? "품절" : "판매중";
  statusChip.className = "chip " + (product.soldOut ? "chip-danger" : "chip-success");

  var img = document.getElementById("view-image");
  if (product.image) {
    img.src = ShopUtils.assetUrl(product.image);
    img.alt = product.name;
  } else {
    img.remove();
  }
})();
