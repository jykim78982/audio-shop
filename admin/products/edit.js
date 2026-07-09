(function () {
  "use strict";

  ShopData.init();
  ShopUtils.init();

  var admin = ShopUtils.requireAdminSession();
  if (!admin) return;

  document.getElementById("logout-btn").addEventListener("click", function () {
    ShopUtils.adminLogout();
    location.href = ShopUtils.adminRoot() + "auth/login";
  });

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var product = id ? ShopData.getProductById(id) : null;

  if (!product) {
    document.getElementById("not-found").hidden = false;
    return;
  }

  document.getElementById("edit-card").hidden = false;

  var categorySelect = document.getElementById("category");
  ShopData.getCategories().forEach(function (cat) {
    var opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  document.getElementById("name").value = product.name;
  document.getElementById("brand").value = product.brand;
  categorySelect.value = product.category;
  document.getElementById("price").value = product.price;
  document.getElementById("image").value = product.image || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("soldOut").checked = product.soldOut;

  var form = document.getElementById("edit-form");
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

    ShopData.updateProduct(product.id, {
      name: name,
      brand: brand,
      category: categorySelect.value,
      price: price,
      image: document.getElementById("image").value.trim(),
      description: document.getElementById("description").value.trim(),
      soldOut: document.getElementById("soldOut").checked
    });

    location.href = "view?id=" + encodeURIComponent(product.id);
  });
})();
