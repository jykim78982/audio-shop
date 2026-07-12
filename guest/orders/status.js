(function () {
  "use strict";

  var STAGES = ["접수", "배송준비중", "배송중", "배송완료"];

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

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var phone = params.get("phone");
  var order = id && phone ? ShopUtils.findGuestOrder(id, phone) : null;

  if (!order) {
    document.getElementById("not-found").hidden = false;
    return;
  }

  document.getElementById("order-view").hidden = false;
  document.getElementById("order-id").textContent = "주문번호 " + order.id;
  document.getElementById("order-date").textContent = formatDate(order.createdAt);

  var statusChip = document.getElementById("order-status-chip");
  statusChip.className = chipClass(order.status);
  statusChip.textContent = order.status;

  var itemsEl = document.getElementById("order-items");
  order.items.forEach(function (item) {
    var row = document.createElement("div");
    row.className = "order-item-row";

    var left = document.createElement("span");
    left.className = "item-name";
    left.textContent = item.name;

    var qty = document.createElement("span");
    qty.className = "item-qty";
    qty.textContent = "x " + item.qty;

    var right = document.createElement("span");
    right.textContent = (item.price * item.qty).toLocaleString() + "원";

    var left2 = document.createElement("span");
    left2.appendChild(left);
    left2.appendChild(document.createTextNode(" "));
    left2.appendChild(qty);

    row.appendChild(left2);
    row.appendChild(right);
    itemsEl.appendChild(row);
  });

  document.getElementById("order-total").textContent = order.total.toLocaleString() + "원";
  document.getElementById("order-address").textContent = order.address || "-";
  document.getElementById("order-payment").textContent = order.paymentMethod || "-";

  var shipping = order.shipping || { carrier: "", trackingNumber: "", statusHistory: [] };

  if (shipping.trackingNumber) {
    document.getElementById("shipping-help").hidden = true;
    var info = document.getElementById("shipping-info");
    info.hidden = false;
    document.getElementById("shipping-carrier").textContent = shipping.carrier || "택배사 미정";
    document.getElementById("shipping-tracking").textContent = shipping.trackingNumber;
    document.getElementById("tracking-link").addEventListener("click", function (e) {
      e.preventDefault();
      alert("모의 배송 조회 페이지입니다 (실제 연동 없음).");
    });
  }

  var timelineEl = document.getElementById("timeline");
  var history = shipping.statusHistory || [];

  STAGES.forEach(function (stage) {
    var entry = history.find(function (h) { return h.status === stage; });
    var li = document.createElement("li");

    var name = document.createElement("span");
    name.className = "stage-name";
    name.textContent = stage;

    var time = document.createElement("span");
    time.className = "stage-time";

    if (entry) {
      time.textContent = formatDate(entry.at);
    } else {
      li.className = "is-pending";
      time.textContent = "-";
    }

    li.appendChild(name);
    li.appendChild(time);
    timelineEl.appendChild(li);
  });
})();
