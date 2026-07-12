# 🎧 음향기기 쇼핑몰 웹앱 청사진

## 1. 개요
- **목적**: 고객(회원/비회원)이 웹에서 음향기기(헤드폰, 이어폰, 스피커, 앰프 등) 상품을 둘러보고 장바구니에 담아 주문하고, 관리자가 상품과 주문을 관리할 수 있는 쇼핑몰 앱.
- **기술 스택**: 정적 HTML + CSS + Vanilla JavaScript (빌드 도구 없음, 프레임워크 없음).
- **데이터 저장**: 브라우저 `localStorage` (서버/DB 없음).
- **결제**: 모의 결제 (실제 PG 연동 없이 "주문 완료" 처리만 수행).
- **인증**: 실제 서버 인증은 없고, `localStorage`에 계정/세션을 저장하는 **모의 로그인**.
  - 고객: 회원(`my/`)과 비회원(`guest/`)의 화면·주문 조회 방식이 다름.
  - 관리자(`admin/`)는 별도 로그인(`admin/auth/login`)이 필요하며, 상품 등록/수정/삭제와 주문 상태 관리를 담당.

> ⚠️ **구조적 한계**: localStorage는 브라우저별로 독립적으로 저장되므로, 고객 화면과 관리자 화면은 **같은 브라우저**에서 열어야 데이터가 공유됩니다. 여러 기기 간 실시간 동기화는 되지 않습니다 (데모/프로토타입 용도로 적합).

### 1.1 디자인 레퍼런스
- **메인 인덱스(`index.html`)**: [shokz.co.kr](https://shokz.co.kr/) 홈 참고 — 다크 그라디언트 히어로 배너, 밑줄 탭 형태의 카테고리 내비게이션, 하단 다크 CTA 배너.
- **그 외 모든 페이지**(상품 목록/상세, 관리자 포함): [shokz.co.kr/shop/all](https://shokz.co.kr/shop/all) 참고 — 화이트 캔버스, 테두리/그림자 없는 카탈로그형 상품 카드, 밑줄 탭 카테고리 필터.
- **공통 토큰**(`css/variables.css`): 화이트+블랙 베이스에 코랄(`--color-accent: #ff5a3c`) 포인트, 테두리·그림자 최소화. 색상/여백 토큰과 리셋, 가장 널리 쓰이는 원자 컴포넌트(`.card`, `.btn`)만 여기 두고, `.tabs`(밑줄 탭)·`.product-grid`/`.product-card`(테두리 없는 카드)·`.hero`/`.cta-banner`(다크 배너)·헤더/내비 같은 페이지 합성 컴포넌트는 각 페이지 CSS에 자체 포함시킨다(2.2 참고). **이후 Phase(5~9)에서 새 페이지를 만들 때도 같은 톤·같은 클래스명을 그대로 재사용**할 것 — 새로운 색상/버튼 스타일을 임의로 추가하지 않는다.

---

## 2. 파일 구조 (클린 URL / 리소스 기반)

리소스(상품/주문 등) 단위 폴더로 구성하고, URL이 곧 리소스 경로가 되도록 합니다.

### 2.1 역할별 CRUD 파일 분리 원칙
같은 리소스라도 **CRUD 동작마다 별도 파일**로 쪼개서, 역할(관리자/회원/비회원)별 권한이 파일 단위로 명확히 드러나도록 합니다.

| 동작 | 파일명 규칙 | 비고 |
|---|---|---|
| Create | `create.html`/`create.js` | 등록 폼 전용 |
| Read (목록) | `list.html`/`list.js` | 목록 조회 전용 |
| Read (단건) | `view.html`/`view.js` | **읽기 전용** 상세 — 입력 필드 없이 정보만 표시 |
| Update | `edit.html`/`edit.js` | 수정 폼 전용 — `view.html`과 분리 |
| Delete | 별도 파일 없음 | 목록(`list.html`)에서 삭제 버튼 + `confirm()`으로 즉시 처리. 삭제는 파괴적이고 단순한 단발성 동작이라 별도 페이지로 분리하면 오히려 클릭 단계만 늘어나므로, 다른 CRUD와 달리 의도적으로 인라인 처리합니다. |

이 원칙은 **완전한 CRUD 권한을 가진 리소스**에만 적용합니다:
- **적용 대상**: `admin/products/` (관리자가 상품을 Create/Read/Update/Delete 모두 수행)
- **적용하지 않는 대상과 이유**:
  - `admin/orders/`: 관리자는 주문을 Read·Update(상태 변경)만 하고 Create·Delete는 하지 않음(주문은 고객이 결제 시 생성, 감사 추적을 위해 삭제 불가) → `list.html`(목록) + `status.html`(상세+상태변경) 2개로 충분
  - `my/cart/`, `guest/cart/`: 담기(Create)는 `products/detail.html`에서 이미 일어나고, 장바구니 화면 자체는 수량변경(Update)·삭제(Delete)가 한 화면 안에서 즉시 반영되는 것이 일반적인 장바구니 UX이므로 `index.html` 단일 파일 유지
  - `my/orders/`, `guest/orders/`: 고객은 자신의 주문을 조회(Read)만 하고 수정/삭제는 할 수 없음 → `list.html`/`lookup.html` + `status.html`만 존재

```
audio-shop/
├── index.html                      # GET /                → 고객 인덱스(홈)
│
├── products/
│   ├── list.html                   # GET /products/list     → 상품 목록 (회원/비회원 공용)
│   ├── list.js
│   ├── detail.html                 # GET /products/detail    → 상품 상세 (?id=p1)
│   └── detail.js
│
├── auth/                            # 🔑 회원 인증 (모의 로그인)
│   ├── login.html                  # GET /auth/login           → 로그인
│   ├── login.js
│   ├── signup.html                 # GET /auth/signup          → 회원가입
│   └── signup.js
│
├── my/                              # 👤 회원 전용 (로그인 필요, 미로그인 시 /auth/login 으로 리다이렉트)
│   ├── cart/
│   │   ├── index.html              # GET /my/cart              → 장바구니
│   │   └── index.js
│   └── orders/
│       ├── list.html               # GET /my/orders/list       → 주문 내역 조회(목록)
│       ├── list.js
│       ├── status.html             # GET /my/orders/status     → 주문 상세/배송 상태 조회
│       └── status.js
│
├── guest/                           # 🕶️ 비회원(익명) 전용 (로그인 불필요)
│   ├── cart/
│   │   ├── index.html              # GET /guest/cart           → 장바구니
│   │   └── index.js
│   └── orders/
│       ├── lookup.html             # GET /guest/orders/lookup  → 주문번호+연락처로 조회
│       ├── lookup.js
│       ├── status.html             # GET /guest/orders/status  → 조회된 주문 상세/배송 상태
│       └── status.js
│
├── admin/                            # 🧑‍💼 관리자 전용 (로그인 필요, 미로그인 시 /admin/auth/login 으로 리다이렉트)
│   ├── auth/
│   │   ├── login.html               # GET /admin/auth/login     → 관리자 로그인
│   │   └── login.js
│   ├── index.html                   # GET /admin                → 대시보드
│   ├── index.js
│   ├── products/                    # 상품 관리 — CRUD 동작별 파일 분리 (2.1 참고)
│   │   ├── list.html               # GET /admin/products/list   → 상품 목록 (Read/목록, 품절토글·삭제는 인라인)
│   │   ├── list.js
│   │   ├── view.html               # GET /admin/products/view   → 상품 상세 조회 (Read/단건, 읽기 전용)
│   │   ├── view.js
│   │   ├── edit.html               # GET /admin/products/edit   → 상품 수정 (Update, ?id=p1)
│   │   ├── edit.js
│   │   ├── create.html             # GET /admin/products/create → 상품 등록 (Create)
│   │   └── create.js
│   └── orders/                      # 주문 관리
│       ├── list.html               # GET /admin/orders/list    → 주문 목록
│       ├── list.js
│       ├── status.html             # GET /admin/orders/status  → 주문 상세/상태 변경
│       └── status.js
│
├── css/                             # 🔧 공용 스타일
│   └── variables.css                # 디자인 토큰 + 리셋 + 원자 컴포넌트(.card, .btn) — cafe의 css/variables.css와 동일한 위상 (2.2 참고)
│
├── js/                              # 🔧 공용 데이터/유틸
│   ├── data.js                      # ShopData — 상품/카테고리 CRUD (localStorage 읽기/쓰기)
│   └── utils.js                     # ShopUtils — 회원·관리자 인증, 장바구니, 주문, 경로(assetUrl) 등 나머지 전부
│
└── images/                          # 🔧 이미지
    ├── hero-listening.jpg           # 인덱스 히어로 사진 (특정 리소스에 속하지 않는 이미지)
    └── products/                    # 상품 사진 (리소스명 하위 폴더, cafe의 images/menus/와 동일한 위상)
```

- 각 페이지의 `*.css`는 그 페이지가 쓰는 컴포넌트 스타일을 전부 자체 포함하고, `css/variables.css`에서는 토큰·리셋·`.card`·`.btn`만 가져다 씀 (2.2 참고).
- 모든 화면은 항상 `js/data.js`(상품/카테고리)·`js/utils.js`(그 외 전부)를 통해서만 localStorage에 접근함 (개별 페이지가 키를 직접 건드리지 않도록 캡슐화). 각 페이지 JS는 최상단에서 `ShopData.init()`과 `ShopUtils.init()`을 명시적으로 호출해야 함(자동 실행 아님, cafe의 `CafeData.init()` 호출 관례와 동일).
- `view.html`·`edit.html`(관리자 상품)·`detail.html`(고객용 상품 상세)·`status.html`(주문)류 페이지는 리소스 id를 쿼리스트링(`?id=p1`)으로 받아 렌더링 (예: `/admin/products/edit?id=p1`, `/my/orders/status?id=o20260701-001`).
- **관리자 로그인**: `/admin/*` 진입 시 `shop_admin_session` 여부를 체크해 미로그인이면 `/admin/auth/login`으로 리다이렉트.
- **회원/비회원 분기**: `products/detail.html`의 "담기" 버튼은 로그인 여부(`shop_session`)를 확인해 `/my/cart` 또는 `/guest/cart`로 이동. `my/` 하위 페이지는 진입 시 로그인 여부를 체크해 미로그인이면 `/auth/login`으로 리다이렉트.
- **비회원 주문 조회 보안**: `guest/orders/lookup.html`에서 입력한 주문번호+연락처가 `shop_orders`의 `id`·`guestPhone`과 모두 일치해야만 `guest/orders/status.html`에서 상세를 노출 (주문번호만으로 타인 주문을 열람할 수 없도록 방지).

### 클린 URL에 대한 참고
파일명 자체(`list.html` 등)는 그대로 유지하지만, 모든 내부 이동 링크는 확장자 없는 형태로 씁니다. 배경과 상세 내용은 2.3 참고.

### 2.2 리소스 배치 리팩터링 — cafe 프로젝트 스타일로 전환 (완료)

같은 작업자가 만든 `cafe` 프로젝트는 공용 리소스(css/js/images)를 `common/` 하위에 몰아넣지 않고 **루트에 바로 풀어놓는** 방식을 씁니다. audio-shop도 `구조변경` 브랜치에서 이 방식으로 전환을 완료했습니다.

**cafe와 대응 관계**

| 이전 audio-shop | 현재 audio-shop (cafe 스타일) | 비고 |
|---|---|---|
| `common/css/style.css` | `css/variables.css` | cafe의 `css/variables.css`처럼 **디자인 토큰 + 리셋 + `.card`/`.btn`만** 남기고, 헤더/내비·탭·상품카드·히어로 같은 합성 컴포넌트는 각 페이지 CSS로 이동 |
| `common/js/storage.js` (단일 모듈) | `js/data.js` + `js/utils.js` | cafe의 `CafeData`(메뉴)/`CafeUtils`(장바구니·포맷팅) 2분할처럼, **`data.js`는 상품/카테고리 데이터**, **`utils.js`는 나머지 전부**(회원·관리자 인증, 장바구니, 주문, `assetUrl` 경로 유틸)를 담당. `ShopStorage` → `ShopData`/`ShopUtils`로 전역 객체명도 분리 |
| `common/assets/images/` | `images/products/` | cafe의 `images/menus/`처럼 리소스명 하위 폴더 사용. 히어로 사진처럼 특정 리소스에 속하지 않는 이미지는 `images/` 바로 아래에 둠(cafe의 `assets/videos/hero-coffee.mp4`와 동급) |
| 각 페이지가 `ShopStorage.init()` 자동 실행에 의존 | 각 페이지 JS 최상단에서 `ShopData.init()`/`ShopUtils.init()` 명시적 호출 | cafe의 `CafeData.init()`을 각 페이지가 직접 호출하는 관례와 동일 |
| `admin/products/view.html` | *(변경 없음, `view.html` 유지)* | cafe의 관리자 상세 페이지는 이름이 `detail.html`이지만, audio-shop은 고객용 상품 상세(`products/detail.html`)와 이름이 겹치는 걸 피하고 "읽기 전용"이라는 의미를 살리기 위해 **`view.html` 이름은 의도적으로 유지** (2.1 원칙과 일관성 유지) |
| `admin/orders/status.html` (예정) | *(변경 없음, `status.html` 유지 예정)* | cafe는 동일한 역할(주문 상세 조회 + 상태 변경 Update)을 `detail.html`이라는 이름으로 둠. audio-shop은 "조회뿐 아니라 상태변경도 한다"는 걸 이름에서 드러내려고 **`status.html`을 의도적으로 유지** — cafe와 이름은 다르지만 기능은 동일 |
| 페이지별 `*.css`/`*.js` 파일이 페이지와 같은 폴더에 위치 | *(변경 없음)* | audio-shop도 이미 cafe와 동일하게 페이지-CSS-JS를 같은 폴더에 붙여서 관리 중이므로 그대로 유지 |

**cafe와 다르게 그대로 유지하는 부분 (구조 아님, 기능 범위 차이)**
- **`admin/auth/`(관리자 로그인)**: cafe는 관리자 로그인 자체가 없어서 대응되는 폴더가 없음. audio-shop은 모의 관리자 인증이 BLUEPRINT 1장부터 정한 핵심 요구사항이라 그대로 유지.
- **`my/` · `guest/` 분리**: cafe는 회원/비회원 구분 없이 `basket/`, `orders/`, `my/index.html`(주문내역) 하나씩만 있음. audio-shop은 회원/비회원 장바구니·주문조회 흐름이 다르다는 게 핵심 설계라서(3장 데이터 모델의 `customerType` 등) 이 분리는 유지. 즉 이번 리팩터링은 **공용 리소스(css/js/images) 배치 방식만** cafe에 맞추는 것이고, 화면 구성 자체를 cafe만큼 단순화하는 건 범위 밖.

**최상위 트리 (2. 파일 구조의 전체 트리와 동일, 여기서는 공용 리소스 부분만 발췌)**
```
audio-shop/
├── index.html / index.css / index.js
├── products/       (list, detail — 각 html/css/js)
├── auth/           (login, signup — Phase 5 예정)
├── my/cart/, my/orders/ (Phase 6 예정)
├── guest/cart/, guest/orders/ (Phase 7 예정)
├── admin/          (auth/, index, products/, orders/ — orders/는 Phase 8 예정)
│
├── css/
│   └── variables.css      # 디자인 토큰 전용 (구 common/css/style.css)
│
├── js/
│   ├── data.js             # 상품/카테고리 (구 storage.js 일부)
│   └── utils.js            # 인증·장바구니·주문 등 나머지 (구 storage.js 일부)
│
└── images/
    ├── hero-listening.jpg
    └── products/            # 상품 사진 (구 common/assets/images/)
```

**적용 결과**: 모든 페이지의 `<link>`/`<script src>` 경로를 `css/variables.css`, `js/data.js`, `js/utils.js` 기준으로 갱신했고, `assetUrl()`이 찾는 스크립트 경로 힌트도 `"js/utils.js"` 문자열 매칭으로 옮겼습니다. 헤더/내비·탭·상품카드·히어로·폼 등 합성 컴포넌트 CSS는 이를 사용하는 각 페이지 CSS 파일에 전부 자체 포함시켰고(파일 수가 많아 페이지 그룹별로 나눠서 진행), 기존 `common/` 폴더는 삭제했습니다. 헤드리스 브라우저로 고객 13개·관리자 11개 시나리오 전부 재검증 완료.

### 2.3 클린 URL 링크 전환 — 확장자 제거 (완료)

**배경**: 배포용으로 쓰는 `serve`(`npm start` → `serve -l 3132`)는 기본적으로 `cleanUrls` 옵션이 켜져 있어서, `.html`로 끝나는 주소로 접속하면 확장자를 뗀 주소로 301 리다이렉트를 겁니다. 이 리다이렉트 과정에서 **쿼리스트링이 통째로 사라지는** 문제가 있어서, `products/detail.html?id=p1`처럼 `?id=`에 의존하는 페이지가 정상적으로 안 열렸습니다. `cleanUrls`를 끄는 대신, 애초에 내부 링크 자체를 확장자 없는 주소로 걸어서 리다이렉트가 아예 발생하지 않게 만드는 쪽으로 해결했습니다.

**적용 내용**: 파일명 자체(`list.html`, `detail.html` 등)는 그대로 두고, 페이지 이동에 쓰이는 모든 `<a href>`와 `location.href`만 확장자를 뗀 형태로 바꿨습니다.
- 일반 페이지: `list.html` → `list`, `detail.html?id=p1` → `detail?id=p1`
- 폴더의 대표 페이지(`index.html`): 확장자만 떼는 게 아니라 폴더 경로로 씀 — `index.html` → `./`, `admin/index.html` → `admin/`(또는 그 폴더 안에서는 `./`). 클린 URL 서버는 폴더 경로로 들어오면 자동으로 그 폴더의 `index.html`을 찾아줌.
- `<link>`/`<script src>`(CSS/JS/이미지 로딩)는 손대지 않음 — `cleanUrls`는 `.html` 주소에만 적용되고 리소스 로딩에는 영향 없음.

**주의**: 이 방식은 서버가 확장자 없는 요청을 `.html` 파일로 알아서 찾아준다는 전제가 있어야 합니다. `serve`(cleanUrls 기본값)와 이 프로젝트의 `verify-server.ps1`은 지원하지만, **VS Code Live Server는 기본적으로 지원하지 않아서** Live Server로 로컬 테스트할 때는 페이지 이동이 깨질 수 있습니다.

---

## 3. 데이터 모델 (localStorage 키 설계)

### `shop_products` — 상품 목록
```json
[
  {
    "id": "p1",
    "name": "무선 노이즈캔슬링 헤드폰",
    "brand": "SoundPeak",
    "category": "헤드폰",
    "price": 259000,
    "description": "ANC 지원, 최대 30시간 재생",
    "image": "/common/assets/images/headphone1.jpg",
    "stock": 12,
    "soldOut": false
  }
]
```
- **category 예시**: 헤드폰, 이어폰, 스피커, 앰프/리시버, 마이크, 액세서리

### `shop_users` — 회원 계정 (모의 로그인용)
```json
[
  { "id": "u1", "email": "user@example.com", "password": "1234", "name": "김철수" }
]
```

### `shop_session` — 현재 로그인 상태 (회원)
```json
{ "userId": "u1" }
```
- 로그아웃 상태면 키 자체가 없거나 `null`. `guest/` 화면은 이 값과 무관하게 항상 접근 가능.

### `shop_admin` — 관리자 계정
```json
[
  { "id": "a1", "email": "admin@shop.com", "password": "admin1234", "name": "관리자" }
]
```
- 초기 시드 데이터로 관리자 계정 1개를 미리 넣어둠.

### `shop_admin_session` — 현재 관리자 로그인 상태
```json
{ "adminId": "a1" }
```
- 회원용 `shop_session`과는 별개의 키. 고객 로그인과 관리자 로그인은 서로 영향을 주지 않음.

### `shop_cart` — 현재 장바구니 (브라우저 세션 기준, 회원/비회원 공용 1개)
```json
[
  { "productId": "p1", "name": "무선 노이즈캔슬링 헤드폰", "price": 259000, "qty": 1 }
]
```
- 한 브라우저는 특정 시점에 로그인 상태이거나 아니거나 둘 중 하나이므로 장바구니는 하나만 존재. `my/cart`와 `guest/cart`는 같은 `shop_cart` 키를 읽고 쓰되, 진입 화면(회원/비회원)만 다름.

### `shop_orders` — 주문 목록
```json
[
  {
    "id": "o20260701-001",
    "items": [{ "productId": "p1", "name": "무선 노이즈캔슬링 헤드폰", "qty": 1, "price": 259000 }],
    "totalPrice": 259000,
    "status": "결제완료",
    "createdAt": "2026-07-01T10:20:00+09:00",
    "shippingAddress": "서울시 강남구 ...",
    "customerType": "member",
    "userId": "u1",
    "guestPhone": null,
    "shipping": {
      "carrier": "CJ대한통운",
      "trackingNumber": "123456789012",
      "statusHistory": [
        { "status": "주문접수", "at": "2026-07-01T10:20:00+09:00" },
        { "status": "배송준비중", "at": "2026-07-01T15:00:00+09:00" },
        { "status": "배송중", "at": "2026-07-02T09:10:00+09:00" },
        { "status": "배송완료", "at": null }
      ]
    }
  }
]
```
- **status 값**: `주문접수` → `배송준비중` → `배송중` → `배송완료` (관리자가 변경)
- **customerType**: `member`(→ `userId` 채움) 또는 `guest`(→ `guestPhone` 채움, 주문 시 연락처 입력 필수)
- **shipping**: 관리자가 상태를 `배송중`으로 바꿀 때 `carrier`(배송사)와 `trackingNumber`(운송장번호)를 함께 입력. `statusHistory`는 상태가 바뀔 때마다 한 건씩 추가되어 주문 상세에서 타임라인으로 표시됨. `trackingNumber`가 있으면 상세 화면에서 배송사 조회 페이지로 연결되는 링크(모의)를 노출.

---

## 4. 화면 & 기능 구성

### 4.1 공용 (회원/비회원 모두 접근)
1. **인덱스 — `/` (`index.html`)**
   - 쇼핑몰 배너 + "상품 보러가기" 진입 버튼
   - 로그인 상태에 따라 우측 상단 표시 분기: 미로그인 → 로그인/회원가입 링크, 로그인 → 이름 + 로그아웃
   - 장바구니 아이콘(담긴 개수 뱃지), 내 주문 조회 링크 (로그인 여부에 따라 `/my/orders/list` 또는 `/guest/orders/lookup`으로 연결)
2. **상품 목록 — `/products/list`**
   - 카테고리 필터(헤드폰/이어폰/스피커/앰프 등), 브랜드/가격 정렬
   - 상품 카드: 이미지, 이름, 브랜드, 가격, "상세보기" 버튼
   - 품절(soldOut) 상품은 흐리게 표시
3. **상품 상세 — `/products/detail?id=p1`**
   - 상품 이미지, 이름, 브랜드, 가격, 설명, 스펙
   - 수량 선택 후 "담기" 버튼 → 로그인 여부에 따라 이후 흐름이 `/my/cart` 또는 `/guest/cart`로 갈라짐 (장바구니 데이터 자체는 공용 `shop_cart`)

### 4.2 회원 인증 — `/auth/`
1. **로그인 — `/auth/login`**: 이메일/비밀번호 입력 → 아래 순서로 대조하는 **통합 로그인**
   1. `shop_users`(회원)와 대조 → 일치하면 `shop_session` 저장 → `/index.html`로 이동
   2. 회원 계정에 없으면 `shop_admin`(관리자)과 대조 → 일치하면 `shop_admin_session` 저장 → `/admin/index.html`(대시보드)로 이동
   3. 둘 다 일치하지 않으면 "이메일 또는 비밀번호가 올바르지 않습니다" 에러 표시
   - 즉 이 화면에서 관리자 계정(`admin@shop.com` 등)으로 로그인해도 바로 관리자 기능으로 진입할 수 있음. `admin/auth/login.html`은 관리자 전용 진입점으로 별도 유지(관리자 세션이 끊겨 `admin/*` 접근 가드에 걸렸을 때 리다이렉트되는 대상).
2. **회원가입 — `/auth/signup`**: 이름/이메일/비밀번호 입력 → `shop_users`에 추가

### 4.3 회원 전용 — `/my/` *(로그인 필요, 미로그인 접근 시 `/auth/login`으로 리다이렉트)*
1. **장바구니 — `/my/cart`**
   - 담긴 항목 목록, 수량 +/- 조절, 개별 삭제, 전체 비우기
   - 실시간 합계 금액 계산, 배송지 입력
   - "결제하기" → 모의 결제 확인 모달 → 주문 생성(`customerType: member`) → `/my/orders/status?id=...`로 이동
2. **주문 내역 조회 — `/my/orders/list`, `/my/orders/status`**
   - `list`: 로그인한 회원 본인(`userId`) 명의 주문 목록과 상태 확인 (배송중인 주문은 뱃지로 강조)
   - `status`: 주문 상세(상품, 수량, 금액, 배송지, 상태 타임라인) + **배송 조회**
     - `shipping.trackingNumber`가 있으면 배송사(`carrier`)·운송장번호 표시, 클릭 시 해당 택배사 조회 페이지로 연결(모의 링크)
     - `shipping.statusHistory`를 시간순 타임라인으로 렌더링 (주문접수 → 배송준비중 → 배송중 → 배송완료, 각 단계의 처리 시각)
     - 아직 발생하지 않은 단계는 흐리게 표시, 운송장번호가 없으면 "상품 준비중" 안내만 노출

### 4.4 비회원 전용 — `/guest/` *(로그인 불필요)*
1. **장바구니 — `/guest/cart`**
   - `my/cart`와 동일한 담기/수정 UI, 단 결제 시 **연락처(전화번호)와 배송지 입력이 필수**
   - "결제하기" → 모의 결제 확인 모달 → 주문 생성(`customerType: guest`, `guestPhone` 저장) → `/guest/orders/status?id=...&phone=...`로 이동
2. **주문 조회 — `/guest/orders/lookup`, `/guest/orders/status`**
   - `lookup`: 주문번호 + 연락처 입력 폼 → 일치하는 주문 검색
   - `status`: 조회 성공 시에만 주문 상세 노출 (주문번호만으로는 열람 불가) + `/my/orders/status`와 동일한 **배송 조회**(배송사·운송장번호·상태 타임라인) 제공

### 4.5 관리자 *(로그인 필요, 미로그인 접근 시 `/admin/auth/login`으로 리다이렉트)*
1. **로그인 — `/admin/auth/login`**
   - 이메일/비밀번호 입력 → `shop_admin`과 대조 → `shop_admin_session` 저장 → `/admin`(대시보드)으로 이동
2. **대시보드 — `/admin`**
   - 오늘 주문 수, 매출 합계, 배송 준비중인 주문 수 요약
3. **상품 관리 — `/admin/products/list`, `/view`, `/edit`, `/create`** *(CRUD 동작별 파일 분리, 2.1 참고)*
   - `list`: 등록된 상품 목록 (Read/목록) — 품절 토글·삭제는 이 화면에서 즉시 처리(Update/Delete 인라인), `view`/`edit` 페이지로 이동하는 링크 제공
   - `view`: 상품 단건 조회 (Read/단건, 읽기 전용, `?id=p1`) — 입력 폼 없이 정보만 표시, "수정" 버튼으로 `edit`으로 이동
   - `edit`: 상품 수정 폼 (Update, `?id=p1`)
   - `create`: 신규 상품 등록 폼 (Create)
4. **주문 관리 — `/admin/orders/list`, `/status`**
   - `list`: 전체 주문 목록 확인
   - `status`: 주문 상태 변경 (접수 → 배송준비중 → 배송중 → 배송완료), 항목 확인 (`?id=o20260701-001`)
     - 상태를 `배송중`으로 변경할 때 배송사(`carrier`)·운송장번호(`trackingNumber`) 입력 필수 → `shipping` 필드에 저장, `statusHistory`에 이벤트 추가
     - 이후 상태 변경(배송완료 등)도 동일하게 `statusHistory`에 시각과 함께 누적

---

## 5. 핵심 사용자 흐름

**회원**
```
(/auth/login 로그인) → /products/list → /products/detail?id=... → (담기) → /my/cart → (주문하기, 모의 결제) → /my/orders/status?id=...
                                                                                                                        ↓
                                                          /admin/orders/list → /admin/orders/status?id=... (상태 변경)
                                                                                                                        ↓
                                                              /my/orders/list, /my/orders/status 에서 상태 갱신 확인
```

**비회원**
```
/products/list → /products/detail?id=... → (담기) → /guest/cart → (연락처+배송지 입력 후 주문, 모의 결제) → /guest/orders/status?id=...&phone=...
                                                                                                                        ↓
                                                          /admin/orders/list → /admin/orders/status?id=... (상태 변경)
                                                                                                                        ↓
                                        /guest/orders/lookup (주문번호+연락처 재입력) → /guest/orders/status 에서 상태 갱신 확인
```

**관리자**
```
/admin/auth/login (로그인) → /admin (대시보드)
                                  ├─ /admin/products/list → /view·/edit·/create (상품 CRUD)
                                  └─ /admin/orders/list → /admin/orders/status?id=... (상태 변경)
```

---

## 6. 향후 확장 여지 (지금은 구현하지 않음, 구조만 고려)
- 실제 백엔드(Node/Express + DB)로 전환 시 `storage.js`의 인터페이스만 API 호출로 교체 가능하도록 설계 (`shop_users`/`shop_session`도 서버 인증(JWT/세션 쿠키)으로 대체)
- 실제 PG 연동 (토스페이먼츠 등), 실제 배송 조회 API 연동
- 상품 리뷰/평점, 위시리스트
- 쿠폰/할인, 포인트 적립

---

## 7. 다음 단계
이 청사진을 검토하신 후 확정되면, 위 파일 구조대로 실제 코드를 구현하겠습니다. 수정하고 싶은 부분(상품 카테고리 구성, 디자인 톤, 종업원 역할 필요 여부, 추가 기능 등)이 있으면 알려주세요.

---

## 8. 구현 체크리스트

뼈대 세팅 단계에서 폴더 구조와 공용 리소스(css/js/assets)를 한 번에 갖추고, 그 다음 **관리자/상품 관리를 최우선**으로 구현해 관리자가 먼저 상품 데이터를 만들 수 있는 상태를 만든 뒤 고객 화면(조회 → 장바구니 → 주문 → 배송 조회)을 이어가는 순서입니다.

### Phase 0. 프로젝트 뼈대 세팅 (폴더 구조 + 공용 리소스)
- [x] `audio-shop/` 루트 폴더 및 전체 디렉토리 구조 생성 (`products/`, `auth/`, `my/`, `guest/`, `admin/`, `common/`)
- [x] `common/css/style.css` — 공통 레이아웃, 색상, 반응형 기본 스타일
- [ ] `common/assets/images/` — 상품 플레이스홀더 이미지 준비 (헤드폰/이어폰/스피커/앰프 등)
- [x] `common/js/storage.js` — localStorage 공용 데이터 레이어
  - [x] `shop_products` 읽기/쓰기 함수 (초기 시드는 최소화하거나 생략 — 관리자가 직접 등록)
  - [x] `shop_admin`, `shop_admin_session` 읽기/쓰기 함수 + 관리자 계정 1개 시드
  - [x] `shop_users`, `shop_session` 읽기/쓰기 함수 (회원)
  - [x] `shop_cart` 읽기/쓰기 함수 (담기/수량변경/삭제/합계 계산)
  - [x] `shop_orders` 읽기/쓰기 함수 (생성/상태변경/조회, 주문번호 채번 규칙)
  - [x] `shop_orders`의 `shipping.statusHistory` 갱신 함수 (상태 변경 시 타임스탬프 기록)
  - [x] localStorage 최초 실행 시 시드 데이터 자동 초기화 로직 (키가 없을 때만)

### Phase 1. 관리자 인증 (`admin/auth/`) ✅
- [x] `admin/auth/login.html` + `login.js` — 이메일/비밀번호 → `shop_admin` 대조 → `shop_admin_session` 저장
- [x] 인증 가드 유틸: 미로그인 시 `/admin/auth/login`으로 리다이렉트

### Phase 2. 관리자 대시보드 (`admin/index.html`) ✅
- [x] 오늘 주문 수 / 매출 합계 / 배송 준비중 주문 수 집계 로직 (초기엔 0으로 표시, 주문 데이터는 이후 Phase에서 채워짐)
- [x] 상품 관리 / 주문 관리 내비게이션

### Phase 3. 상품 관리 (`admin/products/`) — 관리자 전용 ⭐ 최우선 구현 ✅
- [x] `create.html` + `create.js` — 신규 상품 등록 폼(이름/브랜드/카테고리/가격/설명/이미지/재고) → `shop_products`에 추가
- [x] `list.html` + `list.js` — 상품 목록, 품절 토글(Update)·삭제(Delete)는 인라인 처리
- [x] `view.html` + `view.js` — 상품 상세(읽기 전용, Read), 수정 폼 없이 정보만 표시 + `edit.html`로 이동하는 링크
- [x] `edit.html` + `edit.js` — 기존 값이 채워진 수정 폼(Update), `view.html`과 파일 분리(2.1 원칙 준수)
- [x] 이 단계까지 완료 후 관리자 로그인 → 상품 등록까지 엔드투엔드로 동작 확인

### Phase 4. 상품 조회 (공개, 회원/비회원 공용) ✅
- [x] `index.html` — 인덱스 페이지 (배너, 로그인 상태별 헤더 분기, 장바구니/주문조회 링크)
- [x] `products/list.html` + `list.js` — 카테고리 필터, 브랜드/가격 정렬, (Phase 3에서 등록한) 상품 카드 렌더링, 품절 비활성화
- [x] `products/detail.html` + `detail.js` — 상품 상세(이미지/브랜드/가격/설명/스펙), 수량 선택
- [x] "담기" 클릭 시 로그인 여부(`shop_session`) 분기 → `/my/cart` or `/guest/cart` 이동 로직 (두 페이지 자체는 Phase 6/7에서 구현 예정이라 현재는 이동만 하고 404)

### Phase 5. 회원 인증 (`auth/`) ✅
- [x] `auth/signup.html` + `signup.js` — 회원가입 폼, 이메일 중복 체크, `shop_users`에 추가
- [x] `auth/login.html` + `login.js` — 통합 로그인: `shop_users` 우선 대조(일치 시 `shop_session` 저장 → `/index.html`) → 없으면 `shop_admin` 대조(일치 시 `shop_admin_session` 저장 → `/admin/index.html`) → 둘 다 불일치면 에러

### Phase 6. 회원 장바구니 & 주문 (`my/`) ✅
- [x] 인증 가드: 미로그인 시 `/auth/login`으로 리다이렉트
- [x] `my/cart/index.html` + `index.js` — 담긴 항목 목록, 수량 +/- 조절, 개별 삭제, 전체 비우기, 합계 계산, 배송지 입력
- [x] "결제하기" → 모의 결제 확인 모달 → 주문 생성 → `/my/orders/status?id=...` 이동
- [x] `my/orders/list.html` + `list.js` — 본인(`userId`) 명의 주문 목록, 배송중 주문 뱃지 표시
- [x] `my/orders/status.html` + `status.js` — 주문 상세 + **배송 조회**(배송사/운송장번호 표시, 조회 링크, `statusHistory` 타임라인 렌더링)

### Phase 7. 비회원 장바구니 & 주문 (`guest/`) ✅
- [x] `guest/cart/index.html` + `index.js` — `my/cart`와 동일 UI, 결제 시 연락처+배송지 입력 필수
- [x] "결제하기" → 모의 결제 확인 모달 → 주문 생성(`guestPhone` 저장) → `/guest/orders/status?id=...&phone=...` 이동
- [x] `guest/orders/lookup.html` + `lookup.js` — 주문번호 + 연락처 입력 폼 → 일치 주문 검색
- [x] `guest/orders/status.html` + `status.js` — 조회 성공 시에만 상세 노출 + **배송 조회**(회원용과 동일한 타임라인 UI)

### Phase 8. 관리자 주문 관리 (`admin/orders/`) ✅
- [x] `list.html` + `list.js` — 전체 주문 목록 확인 (상태별 필터)
- [x] `status.html` + `status.js` — 주문 상세, 상태 변경(접수 → 배송준비중 → 배송중 → 배송완료)
- [x] `배송중`으로 변경 시 배송사/운송장번호 입력 폼 → `shipping` 필드 저장
- [x] 상태 변경 시마다 `shipping.statusHistory`에 이벤트 추가

### Phase 9. 통합 점검 & 마무리
- [x] 회원 전체 흐름 점검: 로그인 → 상품 조회 → 담기 → 결제 → 주문 상세 → 배송 조회
- [x] 비회원 전체 흐름 점검: 상품 조회 → 담기 → 결제(연락처 입력) → 주문 조회(lookup) → 배송 조회
- [x] 관리자 흐름 점검: 로그인 → 상품 등록/수정/삭제 → 주문 상태 변경(배송사/운송장 입력) → 대시보드 집계 반영
- [x] 엣지 케이스 점검: 품절 상품 담기 방지, 빈 장바구니 결제 방지, 비회원 주문번호만으로 타인 주문 조회 불가, 운송장번호 없는 주문의 배송 조회 화면
- [x] 반응형(모바일/데스크톱) 레이아웃 점검
