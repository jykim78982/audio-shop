(function () {
  "use strict";

  if (ShopStorage.getCurrentAdmin()) {
    location.href = ShopStorage.adminRoot() + "index.html";
    return;
  }

  var form = document.getElementById("login-form");
  var errorEl = document.getElementById("form-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    var session = ShopStorage.adminLogin(email, password);
    if (!session) {
      errorEl.textContent = "이메일 또는 비밀번호가 올바르지 않습니다.";
      errorEl.hidden = false;
      return;
    }

    location.href = ShopStorage.adminRoot() + "index.html";
  });
})();
