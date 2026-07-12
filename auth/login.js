(function () {
  "use strict";

  ShopData.init();
  ShopUtils.init();

  if (ShopUtils.getCurrentUser()) {
    location.href = "../";
    return;
  }

  var form = document.getElementById("login-form");
  var errorEl = document.getElementById("form-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    var session = ShopUtils.login(email, password);
    if (session) {
      location.href = "../";
      return;
    }

    var adminSession = ShopUtils.adminLogin(email, password);
    if (adminSession) {
      location.href = ShopUtils.adminRoot();
      return;
    }

    errorEl.textContent = "이메일 또는 비밀번호가 올바르지 않습니다.";
    errorEl.hidden = false;
  });
})();
