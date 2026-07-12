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

  var tbody = document.getElementById("product-tbody");
  var tableView = document.getElementById("table-view");
  var emptyStateTable = document.getElementById("empty-state-table");
  var grid = document.getElementById("product-grid");
  var emptyStateGrid = document.getElementById("empty-state-grid");
  var viewToggle = document.getElementById("view-toggle");
  var VIEW_KEY = "shop_admin_product_view";

  function toggleProduct(p) {
    ShopData.updateProduct(p.id, { soldOut: !p.soldOut });
    render();
  }

  function deleteProduct(p) {
    if (!confirm(p.name + " 상품을 삭제하시겠습니까?")) return;
    ShopData.deleteProduct(p.id);
    render();
  }

  function buildActions(p, className) {
    var actions = document.createElement("div");
    actions.className = className;

    var toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "btn btn-outline toggle-btn";
    toggleBtn.textContent = p.soldOut ? "판매중으로" : "품절로";
    toggleBtn.addEventListener("click", function () { toggleProduct(p); });

    var editLink = document.createElement("a");
    editLink.className = "btn btn-outline toggle-btn";
    editLink.href = "edit?id=" + encodeURIComponent(p.id);
    editLink.textContent = "수정";

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-danger delete-btn";
    deleteBtn.textContent = "삭제";
    deleteBtn.addEventListener("click", function () { deleteProduct(p); });

    actions.appendChild(toggleBtn);
    actions.appendChild(editLink);
    actions.appendChild(deleteBtn);
    return actions;
  }

  function renderRow(p) {
    var tr = document.createElement("tr");
    tr.className = "row-clickable";
    tr.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      location.href = "view?id=" + encodeURIComponent(p.id);
    });

    var tdName = document.createElement("td");
    var link = document.createElement("a");
    link.className = "name-link";
    link.href = "view?id=" + encodeURIComponent(p.id);
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
    tdActions.appendChild(buildActions(p, "row-actions"));

    tr.appendChild(tdName);
    tr.appendChild(tdBrand);
    tr.appendChild(tdCategory);
    tr.appendChild(tdPrice);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);
    return tr;
  }

  function renderCard(p) {
    var card = document.createElement("div");
    card.className = "product-card" + (p.soldOut ? " is-soldout" : "");
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      location.href = "view?id=" + encodeURIComponent(p.id);
    });

    var thumb = document.createElement("div");
    thumb.className = "product-thumb";
    if (p.image) {
      var img = document.createElement("img");
      img.src = ShopUtils.assetUrl(p.image);
      img.alt = p.name;
      thumb.appendChild(img);
    }
    var chip = document.createElement("span");
    chip.className = "chip chip-pill " + (p.soldOut ? "chip-danger" : "chip-success");
    chip.textContent = p.soldOut ? "품절" : "판매중";
    thumb.appendChild(chip);

    var category = document.createElement("p");
    category.className = "product-category";
    category.textContent = p.category;

    var name = document.createElement("p");
    name.className = "product-name";
    var nameLink = document.createElement("a");
    nameLink.href = "view?id=" + encodeURIComponent(p.id);
    nameLink.textContent = p.name;
    name.appendChild(nameLink);

    var price = document.createElement("p");
    price.className = "product-price";
    price.textContent = p.price.toLocaleString() + "원";

    card.appendChild(thumb);
    card.appendChild(category);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(buildActions(p, "product-card-actions"));
    return card;
  }

  function currentView() {
    return localStorage.getItem(VIEW_KEY) || "list";
  }

  function applyView(mode) {
    tableView.hidden = mode !== "list";
    grid.hidden = mode !== "grid";
    viewToggle.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.view === mode);
    });
    localStorage.setItem(VIEW_KEY, mode);
    render();
  }

  function render() {
    var products = ShopData.getProducts();
    var mode = currentView();

    if (mode === "list") {
      tbody.innerHTML = "";
      emptyStateTable.hidden = products.length > 0;
      emptyStateGrid.hidden = true;
      products.forEach(function (p) { tbody.appendChild(renderRow(p)); });
    } else {
      grid.innerHTML = "";
      emptyStateGrid.hidden = products.length > 0;
      emptyStateTable.hidden = true;
      products.forEach(function (p) { grid.appendChild(renderCard(p)); });
    }
  }

  viewToggle.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    applyView(btn.dataset.view);
  });

  applyView(currentView());
})();
