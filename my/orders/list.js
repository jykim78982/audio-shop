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

  var cartBadge = document.getElementById("cart-badge");
  var cartCount = ShopUtils.getCartCount();
  if (cartCount > 0) {
    cartBadge.textContent = cartCount;
    cartBadge.hidden = false;
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function chipClass(status) {
    if (status === "배송중") return "chip chip-accent";
    if (status === "배송완료") return "chip chip-success";
    return "chip chip-neutral";
  }

  function itemsSummary(items) {
    if (!items.length) return "-";
    var first = items[0].name || "상품";
    if (items.length === 1) return first;
    return first + " 외 " + (items.length - 1) + "건";
  }

  var tbody = document.getElementById("order-tbody");
  var emptyState = document.getElementById("empty-state");
  var card = document.getElementById("order-list-card");

  var orders = ShopUtils.getOrdersByUserId(user.id).slice().sort(function (a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (orders.length === 0) {
    card.querySelector("table").hidden = true;
    emptyState.hidden = false;
    return;
  }

  orders.forEach(function (order) {
    var tr = document.createElement("tr");

    var tdId = document.createElement("td");
    var link = document.createElement("a");
    link.className = "id-link";
    link.href = "status?id=" + encodeURIComponent(order.id);
    link.textContent = order.id;
    tdId.appendChild(link);

    var tdDate = document.createElement("td");
    tdDate.textContent = formatDate(order.createdAt);

    var tdItems = document.createElement("td");
    tdItems.className = "items-summary";
    tdItems.textContent = itemsSummary(order.items);

    var tdTotal = document.createElement("td");
    tdTotal.textContent = order.total.toLocaleString() + "원";

    var tdStatus = document.createElement("td");
    var chip = document.createElement("span");
    chip.className = chipClass(order.status);
    chip.textContent = order.status;
    tdStatus.appendChild(chip);

    tr.appendChild(tdId);
    tr.appendChild(tdDate);
    tr.appendChild(tdItems);
    tr.appendChild(tdTotal);
    tr.appendChild(tdStatus);
    tbody.appendChild(tr);
  });
})();
