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

  var tbody = document.getElementById("product-tbody");
  var emptyState = document.getElementById("empty-state");

  function render() {
    var products = ShopData.getProducts();
    tbody.innerHTML = "";
    emptyState.hidden = products.length > 0;

    products.forEach(function (p) {
      var tr = document.createElement("tr");

      var tdName = document.createElement("td");
      var link = document.createElement("a");
      link.className = "name-link";
      link.href = "view.html?id=" + encodeURIComponent(p.id);
      link.textContent = p.name;
      tdName.appendChild(link);

      var tdBrand = document.createElement("td");
      tdBrand.textContent = p.brand;

      var tdCategory = document.createElement("td");
      tdCategory.textContent = p.category;

      var tdPrice = document.createElement("td");
      tdPrice.textContent = p.price.toLocaleString() + "원";

      var tdStatus = document.createElement("td");
      var chip = document.createElement("span");
      chip.className = "chip " + (p.soldOut ? "chip-danger" : "chip-success");
      chip.textContent = p.soldOut ? "품절" : "판매중";
      tdStatus.appendChild(chip);

      var tdActions = document.createElement("td");
      var actions = document.createElement("div");
      actions.className = "row-actions";

      var toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "btn btn-outline toggle-btn";
      toggleBtn.textContent = p.soldOut ? "판매중으로" : "품절로";
      toggleBtn.addEventListener("click", function () {
        ShopData.updateProduct(p.id, { soldOut: !p.soldOut });
        render();
      });

      var editLink = document.createElement("a");
      editLink.className = "btn btn-outline toggle-btn";
      editLink.href = "edit.html?id=" + encodeURIComponent(p.id);
      editLink.textContent = "수정";

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-danger delete-btn";
      deleteBtn.textContent = "삭제";
      deleteBtn.addEventListener("click", function () {
        if (!confirm(p.name + " 상품을 삭제하시겠습니까?")) return;
        ShopData.deleteProduct(p.id);
        render();
      });

      actions.appendChild(toggleBtn);
      actions.appendChild(editLink);
      actions.appendChild(deleteBtn);
      tdActions.appendChild(actions);

      tr.appendChild(tdName);
      tr.appendChild(tdBrand);
      tr.appendChild(tdCategory);
      tr.appendChild(tdPrice);
      tr.appendChild(tdStatus);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  }

  render();
})();
