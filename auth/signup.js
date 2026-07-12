(function () {
  "use strict";

  ShopData.init();
  ShopUtils.init();

  if (ShopUtils.getCurrentUser()) {
    location.href = "../";
    return;
  }

  var form = document.getElementById("signup-form");
  var errorEl = document.getElementById("form-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    var result = ShopUtils.addUser({ name: name, email: email, password: password });
    if (result.error) {
      errorEl.textContent = result.error;
      errorEl.hidden = false;
      return;
    }

    ShopUtils.login(email, password);
    location.href = "../";
  });
})();
