# 🎧 Audio Shop

음향기기(헤드폰, 이어폰, 스피커, 앰프 등)를 둘러보고 주문할 수 있는 쇼핑몰 웹앱입니다. 빌드 도구나 프레임워크 없이 정적 HTML/CSS/Vanilla JS로 만들며, 데이터는 브라우저 `localStorage`에 저장합니다 (별도 백엔드 없음).

## 진행 상태

현재는 설계 단계로, 실제 구현 코드는 아직 없고 [BLUEPRINT.md](BLUEPRINT.md)에 청사진만 정리되어 있습니다. 구현은 BLUEPRINT.md 하단의 **"8. 구현 체크리스트"**에 정리된 Phase 순서(공유 자원 → 관리자 상품 관리 → 상품 조회 → 회원 인증 → 회원/비회원 장바구니·주문 → 관리자 주문 관리 → 통합 점검) 대로 진행할 예정입니다.

## 주요 기능 (예정)

**고객**
- 상품 목록/상세 조회 (카테고리 필터, 브랜드/가격 정렬)
- 장바구니 (회원/비회원 공용, 모의 결제)
- 주문 조회 + 배송 상태 타임라인 (배송사·운송장번호 포함)

**관리자**
- 대시보드 (주문 수, 매출, 배송 준비중 주문 집계)
- 상품 관리 (등록/조회/수정/삭제)
- 주문 관리 (상태 변경: 접수 → 배송준비중 → 배송중 → 배송완료)

## 기술 스택

- HTML / CSS / JavaScript (Vanilla, 프레임워크 없음)
- `localStorage` 기반 데이터 저장 (별도 백엔드 없음)

## 폴더 구조 (예정)

리소스 단위 폴더 구성이며, 관리자 상품 관리는 CRUD 동작별로 파일을 분리합니다(`create` / `list` / `view` / `edit`). 전체 구조와 설계 근거는 [BLUEPRINT.md](BLUEPRINT.md)의 "2. 파일 구조"를 참고하세요.

```
audio-shop/
├── index.html              # 고객 인덱스
├── products/                # 상품 목록/상세 (공용)
├── auth/                    # 회원 로그인/가입
├── my/                      # 회원 전용 (장바구니, 주문내역)
├── guest/                   # 비회원 전용 (장바구니, 주문조회)
├── admin/                   # 관리자 (인증, 대시보드, 상품/주문 관리)
├── css/                     # 공용 스타일(variables.css)
├── js/                      # 공용 데이터/유틸(data.js, utils.js)
└── images/                  # 상품 이미지
```

## 데이터 모델

`shop_products`, `shop_users`/`shop_session`, `shop_admin`/`shop_admin_session`, `shop_cart`, `shop_orders` 등 localStorage 키 설계는 [BLUEPRINT.md](BLUEPRINT.md)의 "3. 데이터 모델"에 정리되어 있습니다.
