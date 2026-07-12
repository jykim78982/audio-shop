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

  var tabsEl = document.getElementById("status-tabs");
  var tbody = document.getElementById("order-tbody");
  var emptyState = document.getElementById("empty-state");

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
      return user ? user.name + " (회원)" : "탈퇴한 회원";
    }
    return "비회원 (" + (order.guestPhone || "연락처 없음") + ")";
  }

  function activeStatus() {
    var active = tabsEl.querySelector("button.is-active");
    return active ? active.dataset.status : "";
  }

  function render() {
    var orders = ShopUtils.getOrders().slice().sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    var status = activeStatus();
    if (status) {
      orders = orders.filter(function (o) { return o.status === status; });
    }

    tbody.innerHTML = "";
    emptyState.hidden = orders.length > 0;

    orders.forEach(function (order) {
      var tr = document.createElement("tr");
      tr.className = "row-clickable";
      tr.addEventListener("click", function (e) {
        if (e.target.closest("a, button")) return;
        location.href = "status?id=" + encodeURIComponent(order.id);
      });

      var tdId = document.createElement("td");
      var link = document.createElement("a");
      link.className = "id-link";
      link.href = "status?id=" + encodeURIComponent(order.id);
      link.textContent = order.id;
      tdId.appendChild(link);

      var tdDate = document.createElement("td");
      tdDate.textContent = formatDate(order.createdAt);

      var tdCustomer = document.createElement("td");
      tdCustomer.className = "customer-type";
      tdCustomer.textContent = customerLabel(order);

      var tdTotal = document.createElement("td");
      tdTotal.textContent = order.total.toLocaleString() + "원";

      var tdStatus = document.createElement("td");
      var chip = document.createElement("span");
      chip.className = chipClass(order.status);
      chip.textContent = order.status;
      tdStatus.appendChild(chip);

      var tdActions = document.createElement("td");
      var viewLink = document.createElement("a");
      viewLink.className = "btn btn-outline";
      viewLink.href = "status?id=" + encodeURIComponent(order.id);
      viewLink.textContent = "상세보기";
      tdActions.appendChild(viewLink);

      tr.appendChild(tdId);
      tr.appendChild(tdDate);
      tr.appendChild(tdCustomer);
      tr.appendChild(tdTotal);
      tr.appendChild(tdStatus);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  }

  tabsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    tabsEl.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
    btn.classList.add("is-active");
    render();
  });

  render();
})();
