/* 상품/카테고리 데이터 레이어. localStorage에 저장하고, 관리자 CRUD와 고객 조회가 공통으로 사용합니다. */
(function (global) {
  "use strict";

  var STORAGE_KEY = "shop_products";

  var CATEGORIES = ["헤드폰", "이어폰", "스피커", "앰프/리시버", "마이크", "액세서리"];

  var SEED_PRODUCTS = [
    {
      id: "p1",
      category: "헤드폰",
      brand: "Sonoré",
      name: "Sonoré Aria 무선 헤드폰",
      price: 259000,
      image: "images/products/headphone.jpg",
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
      image: "images/products/earphone.jpg",
      description: "IPX4 방수와 자동 노이즈 캔슬링을 지원하는 트루 와이어리스 이어폰입니다.",
      soldOut: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "p3",
      category: "스피커",
      brand: "Sonoré",
      name: "Sonoré Tower 플로어스탠딩 스피커",
      price: 980000,
      image: "images/products/speaker.jpg",
      description: "듀얼 우퍼와 실크 트위터를 탑재한 하이파이 플로어스탠딩 스피커입니다. 홈시어터와 감상용 오디오 시스템에 어울립니다.",
      soldOut: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "p4",
      category: "앰프/리시버",
      brand: "Ampline",
      name: "Ampline Spider 20 컴팩트 앰프",
      price: 189000,
      image: "images/products/amp.jpg",
      description: "20W 출력의 콤보형 앰프로, 다양한 사운드 모델링과 튜너를 내장해 연습·소규모 공연에 적합합니다.",
      soldOut: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "p5",
      category: "마이크",
      brand: "Studio Voice",
      name: "Studio Voice C100 콘덴서 마이크",
      price: 239000,
      image: "images/products/mic.jpg",
      description: "팝필터와 쇼크마운트가 포함된 대구경 콘덴서 마이크입니다. 보컬 녹음, 팟캐스트, 스트리밍에 적합합니다.",
      soldOut: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "p6",
      category: "액세서리",
      brand: "AudioLink",
      name: "AudioLink 포터블 오디오 인터페이스",
      price: 279000,
      image: "images/products/accessory.jpg",
      description: "스피콘·XLR·네트워크 단자를 지원하는 컴팩트 오디오 인터페이스입니다. 공연·녹음 현장의 신호 변환과 연결에 활용됩니다.",
      soldOut: false,
      createdAt: new Date().toISOString()
    }
  ];

  function read() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function write(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products;
  }

  function init() {
    if (read() === null) write(SEED_PRODUCTS);
  }

  function uid() {
    return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function getCategories() {
    return CATEGORIES.slice();
  }

  function getProducts() {
    return read() || [];
  }

  function getProductById(id) {
    return getProducts().find(function (p) { return p.id === id; }) || null;
  }

  function addProduct(data) {
    var products = getProducts();
    var product = {
      id: uid(),
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
    write(products);
    return product;
  }

  function updateProduct(id, updates) {
    var products = getProducts();
    var index = products.findIndex(function (p) { return p.id === id; });
    if (index === -1) return null;
    products[index] = Object.assign({}, products[index], updates, {
      price: updates.price !== undefined ? Number(updates.price) || 0 : products[index].price
    });
    write(products);
    return products[index];
  }

  function deleteProduct(id) {
    write(getProducts().filter(function (p) { return p.id !== id; }));
  }

  global.ShopData = {
    init: init,
    getCategories: getCategories,
    getProducts: getProducts,
    getProductById: getProductById,
    addProduct: addProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct
  };
})(window);
