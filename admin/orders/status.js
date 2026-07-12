(function () {
  "use strict";

  var STAGES = ["접수", "배송준비중", "배송중", "배송완료"];
  var PARTICLE = { "배송준비중": "으로", "배송중": "으로", "배송완료": "로" };

  ShopData.init();
  ShopUtils.init();

  var admin = ShopUtils.requireAdminSession();
  if (!admin) return;

  document.getElementById("logout-btn").addEventListener("click", function () {
    ShopUtils.adminLogout();
    location.href = ShopUtils.adminRoot() + "auth/login";
  });

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function chipClass(status) {
    if (status === "배송중") return "chip chip-accent";
    if (status === "배송완료") return "chip chip-success";
    return "chip chip-neutral";
  }

  function customerLabel(order) {
    if (order.userId) {
      var user = ShopUtils.getUserById(order.userId);
      return user ? "회원 · " + user.name + " (" + user.email + ")" : "회원 · 탈퇴한 계정";
    }
    return "비회원 · 연락처 " + (order.guestPhone || "-");
  }

  var params = new URLSearchParams(location.search);
  var id = params.get("id");

  var orderView = document.getElementById("order-view");
  var notFound = document.getElementById("not-found");
  var itemsEl = document.getElementById("order-items");
  var timelineEl = document.getElementById("timeline");
  var statusChip = document.getElementById("order-status-chip");
  var advanceSection = document.getElementById("advance-section");
  var shippingFields = document.getElementById("shipping-fields");
  var shippingError = document.getElementById("shipping-error");
  var advanceBtn = document.getElementById("advance-btn");
  var doneMessage = document.getElementById("done-message");
  var carrierInput = document.getElementById("carrier");
  var trackingInput = document.getElementById("tracking");

  function render() {
    var order = id ? ShopUtils.getOrderById(id) : null;
    if (!order) {
      notFound.hidden = false;
      orderView.hidden = true;
      return;
    }

    orderView.hidden = false;
    notFound.hidden = true;

    document.getElementById("order-id").textContent = "주문번호 " + order.id;
    document.getElementById("order-date").textContent = formatDate(order.createdAt);
    document.getElementById("order-customer").textContent = customerLabel(order);

    statusChip.className = chipClass(order.status);
    statusChip.textContent = order.status;

    itemsEl.innerHTML = "";
    order.items.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "order-item-row";

      var left = document.createElement("span");
      var nameSpan = document.createElement("span");
      nameSpan.className = "item-name";
      nameSpan.textContent = item.name;
      var qtySpan = document.createElement("span");
      qtySpan.className = "item-qty";
      qtySpan.textContent = " x " + item.qty;
      left.appendChild(nameSpan);
      left.appendChild(qtySpan);

      var right = document.createElement("span");
      right.textContent = (item.price * item.qty).toLocaleString() + "원";

      row.appendChild(left);
      row.appendChild(right);
      itemsEl.appendChild(row);
    });

    document.getElementById("order-total").textContent = order.total.toLocaleString() + "원";
    document.getElementById("order-address").textContent = order.address || "-";
    document.getElementById("order-payment").textContent = order.paymentMethod || "-";

    var shipping = order.shipping || { statusHistory: [] };
    var history = shipping.statusHistory || [];

    timelineEl.innerHTML = "";
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

    var currentIndex = STAGES.indexOf(order.status);
    var nextStage = currentIndex >= 0 && currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1] : null;

    if (!nextStage) {
      advanceSection.hidden = true;
      doneMessage.hidden = false;
      return;
    }

    advanceSection.hidden = false;
    doneMessage.hidden = true;
    shippingError.hidden = true;
    shippingFields.hidden = nextStage !== "배송중";
    advanceBtn.textContent = nextStage + PARTICLE[nextStage] + " 변경";

    advanceBtn.onclick = function () {
      var extra;
      if (nextStage === "배송중") {
        var carrier = carrierInput.value.trim();
        var tracking = trackingInput.value.trim();
        if (!carrier || !tracking) {
          shippingError.hidden = false;
          return;
        }
        extra = { carrier: carrier, trackingNumber: tracking };
      }
      ShopUtils.updateOrderStatus(order.id, nextStage, extra);
      render();
    };
  }

  render();
})();
