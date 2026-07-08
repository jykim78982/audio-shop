/* 공용 localStorage 저장소 모듈. 모든 페이지가 window.ShopStorage로 접근합니다. */
(function (global) {
  "use strict";

  var KEYS = {
    products: "shop_products",
    users: "shop_users",
    session: "shop_session",
    admin: "shop_admin",
    adminSession: "shop_admin_session",
    cart: "shop_cart",
    orders: "shop_orders"
  };

  var CATEGORIES = ["헤드폰", "이어폰", "스피커", "앰프/리시버", "마이크", "액세서리"];

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

  var SEED_ADMIN = { id: "a1", email: "admin@shop.com", password: "admin1234", name: "관리자" };

  var SEED_PRODUCTS = [
    {
      id: "p1",
      category: "헤드폰",
      brand: "Sonoré",
      name: "Sonoré Aria 무선 헤드폰",
      price: 259000,
      image: "",
      description: "40mm 다이나믹 드라이버와 액티브 노이즈 캔슬링을 탑재한 오버이어 무선 헤드폰입니다.",
      soldOut: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "p2",
      category: "이어폰",
      brand: "Nuvox",
      name: "Nuvox Bud Pro 인이어",
      price: 149000,
      image: "",
      description: "IPX4 방수와 자동 노이즈 캔슬링을 지원하는 트루 와이어리스 이어폰입니다.",
      soldOut: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "p3",
      category: "스피커",
      brand: "Basswave",
      name: "Basswave Cube 블루투스 스피커",
      price: 89000,
      image: "",
      description: "360도 사운드와 12시간 연속 재생을 지원하는 휴대용 스피커입니다.",
      soldOut: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "p4",
      category: "앰프/리시버",
      brand: "Ampline",
      name: "Ampline R7 스테레오 리시버",
      price: 420000,
      image: "",
      description: "2채널 100W 출력의 홈오디오용 스테레오 리시버입니다.",
      soldOut: true,
      createdAt: new Date().toISOString()
    }
  ];

  function init() {
    if (!localStorage.getItem(KEYS.products)) writeJSON(KEYS.products, SEED_PRODUCTS);
    if (!localStorage.getItem(KEYS.users)) writeJSON(KEYS.users, []);
    if (!localStorage.getItem(KEYS.admin)) writeJSON(KEYS.admin, [SEED_ADMIN]);
    if (!localStorage.getItem(KEYS.cart)) writeJSON(KEYS.cart, []);
    if (!localStorage.getItem(KEYS.orders)) writeJSON(KEYS.orders, []);
  }

  /* ===== 카테고리 / 상품 ===== */
  function getCategories() {
    return CATEGORIES.slice();
  }

  function getProducts() {
    return readJSON(KEYS.products, []);
  }

  function getProductById(id) {
    return getProducts().find(function (p) { return p.id === id; }) || null;
  }

  function addProduct(data) {
    var products = getProducts();
    var product = {
      id: uid("p"),
      category: data.category,
      brand: data.brand,
      name: data.name,
      price: Number(data.price) || 0,
      image: data.image || "",
      description: data.description || "",
      soldOut: !!data.soldOut,
      createdAt: new Date().toISOString()
    };
    products.push(product);
    writeJSON(KEYS.products, products);
    return product;
  }

  function updateProduct(id, data) {
    var products = getProducts();
    var idx = products.findIndex(function (p) { return p.id === id; });
    if (idx === -1) return null;
    products[idx] = Object.assign({}, products[idx], data, {
      price: data.price !== undefined ? Number(data.price) || 0 : products[idx].price
    });
    writeJSON(KEYS.products, products);
    return products[idx];
  }

  function deleteProduct(id) {
    var products = getProducts().filter(function (p) { return p.id !== id; });
    writeJSON(KEYS.products, products);
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
      location.href = adminRoot() + "auth/login.html";
      return null;
    }
    return admin;
  }

  /* ===== 회원 인증 ===== */
  function getCurrentUser() {
    return readJSON(KEYS.session, null);
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
      var product = getProductById(c.productId);
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

  global.ShopStorage = {
    init: init,
    getCategories: getCategories,
    getProducts: getProducts,
    getProductById: getProductById,
    addProduct: addProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    getCurrentAdmin: getCurrentAdmin,
    adminLogin: adminLogin,
    adminLogout: adminLogout,
    adminRoot: adminRoot,
    requireAdminSession: requireAdminSession,
    getCurrentUser: getCurrentUser,
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

  init();
})(window);
