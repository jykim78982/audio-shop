(function () {
  "use strict";

  var admin = ShopStorage.requireAdminSession();
  if (!admin) return;

  document.getElementById("logout-btn").addEventListener("click", function () {
    ShopStorage.adminLogout();
    location.href = ShopStorage.adminRoot() + "auth/login.html";
  });

  var categorySelect = document.getElementById("category");
  ShopStorage.getCategories().forEach(function (cat) {
    var opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  var form = document.getElementById("create-form");
  var errorEl = document.getElementById("form-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    var name = document.getElementById("name").value.trim();
    var brand = document.getElementById("brand").value.trim();
    var price = document.getElementById("price").value;

    if (!name || !brand || !price) {
      errorEl.textContent = "상품명, 브랜드, 가격은 필수입니다.";
      errorEl.hidden = false;
      return;
    }

    ShopStorage.addProduct({
      name: name,
      brand: brand,
      category: categorySelect.value,
      price: price,
      image: document.getElementById("image").value.trim(),
      description: document.getElementById("description").value.trim(),
      soldOut: document.getElementById("soldOut").checked
    });

    location.href = "list.html";
  });
})();
