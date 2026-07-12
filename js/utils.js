/* 공통 유틸리티: 회원/관리자 인증, 장바구니, 주문(localStorage)과 경로/포맷팅. 모든 역할별 페이지가 공통으로 사용합니다. */
(function (global) {
  "use strict";

  var KEYS = {
    users: "shop_users",
    session: "shop_session",
    admin: "shop_admin",
    adminSession: "shop_admin_session",
    cart: "shop_cart",
    orders: "shop_orders"
  };

  var SEED_ADMIN = { id: "a1", email: "admin@shop.com", password: "admin1234", name: "관리자" };

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStamp() {
    var d = new Date();
    return (
      d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function init() {
    if (!localStorage.getItem(KEYS.users)) writeJSON(KEYS.users, []);
    if (!localStorage.getItem(KEYS.admin)) writeJSON(KEYS.admin, [SEED_ADMIN]);
    if (!localStorage.getItem(KEYS.cart)) writeJSON(KEYS.cart, []);
    if (!localStorage.getItem(KEYS.orders)) writeJSON(KEYS.orders, []);
  }

  /* ===== 경로 (사이트 루트를 현재 스크립트 태그 위치에서 역산) ===== */
  function siteRoot() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      var idx = src.indexOf("js/utils.js");
      if (idx !== -1) return src.slice(0, idx);
    }
    return "";
  }

  function assetUrl(path) {
    if (!path) return path;
    if (/^https?:\/\//.test(path) || path.charAt(0) === "/") return path;
    return siteRoot() + path;
  }

  /* ===== 관리자 인증 ===== */
  function getCurrentAdmin() {
    return readJSON(KEYS.adminSession, null);
  }

  function adminLogin(email, password) {
    var admins = readJSON(KEYS.admin, []);
    var found = admins.find(function (a) { return a.email === email && a.password === password; });
    if (!found) return null;
    var session = { id: found.id, email: found.email, name: found.name };
    writeJSON(KEYS.adminSession, session);
    return session;
  }

  function adminLogout() {
    localStorage.removeItem(KEYS.adminSession);
  }

  function adminRoot() {
    var m = location.pathname.match(/^(.*\/admin\/)/);
    return m ? m[1] : "/admin/";
  }

  function requireAdminSession() {
    var admin = getCurrentAdmin();
    if (!admin) {
      location.href = adminRoot() + "auth/login";
      return null;
    }
    return admin;
  }

  /* ===== 회원 인증 ===== */
  function getCurrentUser() {
    return readJSON(KEYS.session, null);
  }

  function getUserById(id) {
    var users = readJSON(KEYS.users, []);
    return users.find(function (u) { return u.id === id; }) || null;
  }

  function addUser(data) {
    var users = readJSON(KEYS.users, []);
    if (users.some(function (u) { return u.email === data.email; })) {
      return { error: "이미 가입된 이메일입니다." };
    }
    var user = {
      id: uid("u"),
      email: data.email,
      password: data.password,
      name: data.name,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    writeJSON(KEYS.users, users);
    return user;
  }

  function login(email, password) {
    var users = readJSON(KEYS.users, []);
    var found = users.find(function (u) { return u.email === email && u.password === password; });
    if (!found) return null;
    var session = { id: found.id, email: found.email, name: found.name };
    writeJSON(KEYS.session, session);
    return session;
  }

  function logout() {
    localStorage.removeItem(KEYS.session);
  }

  /* ===== 장바구니 ===== */
  function getCart() {
    return readJSON(KEYS.cart, []);
  }

  function addToCart(productId, qty) {
    var cart = getCart();
    var item = cart.find(function (c) { return c.productId === productId; });
    if (item) {
      item.qty += qty || 1;
    } else {
      cart.push({ productId: productId, qty: qty || 1 });
    }
    writeJSON(KEYS.cart, cart);
    return cart;
  }

  function updateCartQty(productId, qty) {
    var cart = getCart();
    var item = cart.find(function (c) { return c.productId === productId; });
    if (item) item.qty = Math.max(1, qty);
    writeJSON(KEYS.cart, cart);
    return cart;
  }

  function removeFromCart(productId) {
    var cart = getCart().filter(function (c) { return c.productId !== productId; });
    writeJSON(KEYS.cart, cart);
    return cart;
  }

  function clearCart() {
    writeJSON(KEYS.cart, []);
  }

  function getCartCount() {
    return getCart().reduce(function (sum, c) { return sum + c.qty; }, 0);
  }

  function getCartTotal() {
    return getCart().reduce(function (sum, c) {
      var product = global.ShopData.getProductById(c.productId);
      return sum + (product ? product.price * c.qty : 0);
    }, 0);
  }

  /* ===== 주문 ===== */
  function getOrders() {
    return readJSON(KEYS.orders, []);
  }

  function getOrderById(id) {
    return getOrders().find(function (o) { return o.id === id; }) || null;
  }

  function getOrdersByUserId(userId) {
    return getOrders().filter(function (o) { return o.userId === userId; });
  }

  function findGuestOrder(orderId, phone) {
    var order = getOrderById(orderId);
    if (!order || order.userId) return null;
    return order.guestPhone === phone ? order : null;
  }

  function createOrder(data) {
    var orders = getOrders();
    var seq = orders.filter(function (o) { return o.id.indexOf("o" + todayStamp()) === 0; }).length + 1;
    var id = "o" + todayStamp() + "-" + String(seq).padStart(3, "0");
    var now = new Date().toISOString();
    var order = {
      id: id,
      userId: data.userId || null,
      guestName: data.guestName || "",
      guestPhone: data.guestPhone || "",
      items: data.items || [],
      total: data.total || 0,
      address: data.address || "",
      paymentMethod: data.paymentMethod || "카드",
      status: "접수",
      shipping: {
        carrier: "",
        trackingNumber: "",
        statusHistory: [{ status: "접수", at: now }]
      },
      createdAt: now
    };
    orders.push(order);
    writeJSON(KEYS.orders, orders);
    return order;
  }

  function updateOrderStatus(id, status, extra) {
    var orders = getOrders();
    var order = orders.find(function (o) { return o.id === id; });
    if (!order) return null;
    order.status = status;
    if (extra && extra.carrier !== undefined) order.shipping.carrier = extra.carrier;
    if (extra && extra.trackingNumber !== undefined) order.shipping.trackingNumber = extra.trackingNumber;
    order.shipping.statusHistory.push({ status: status, at: new Date().toISOString() });
    writeJSON(KEYS.orders, orders);
    return order;
  }

  global.ShopUtils = {
    init: init,
    assetUrl: assetUrl,
    getCurrentAdmin: getCurrentAdmin,
    adminLogin: adminLogin,
    adminLogout: adminLogout,
    adminRoot: adminRoot,
    requireAdminSession: requireAdminSession,
    getCurrentUser: getCurrentUser,
    getUserById: getUserById,
    addUser: addUser,
    login: login,
    logout: logout,
    getCart: getCart,
    addToCart: addToCart,
    updateCartQty: updateCartQty,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    getCartCount: getCartCount,
    getCartTotal: getCartTotal,
    getOrders: getOrders,
    getOrderById: getOrderById,
    getOrdersByUserId: getOrdersByUserId,
    findGuestOrder: findGuestOrder,
    createOrder: createOrder,
    updateOrderStatus: updateOrderStatus
  };
})(window);
