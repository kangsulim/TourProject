📁 public/
│   └── 📁 fonts/
│       └── NotoSansKR-Regular.ttf 
📁 src/
└── 📁 context             # 인증 상태 전역관리
      └── AuthContext.ts    #앱 전역에서 인증 상태를 공유할 수 있게 해주는 "틀"
      └── AuthProvider.tsx  # 로그인/로그아웃 시 토큰(내부적으로 token.ts 사용)을 저장 및 삭제하고, 인증 상태를 변경하는 "기능"을 구현한 Provider 컴포넌트
│
├── 📁 components/        # 재사용 가능한 공통 UI 컴포넌트(버튼,카드헤더,버튼,카드 등 공통 UI 컴포넌트)
│   ├── 📁 TransportSection/
│   │   └── index.tsx   
│   ├── 📁 TravelInfor/
│   │   └── index.ts 
│   │   └── TravelInfor.tsx  
│   ├── AuthModal.tsx
│   ├── Footer.tsx
│   ├── LogoutButton.tsx   #로그아웃 버튼만 따로 만듬 (로직이있어서 따로 로그아웃버튼만 만드는게 좋다고함.)
│   ├── Header.tsx         # 웹 앱의 상단 바(네비게이션 바) 로그인/아웃 회원가입 버튼 및 상태체크
│   └── Modal.tsx
    └── ProtectedRoute.tsx #로그인한 사용자만 특정 페이지나 기능에 접근할 수 있게 프론트에서 미리 
    막아줌
    └── PDFDownloadButton.tsx 
└── 📁 config             # 인증 상태 전역관리
      └── index.ts    
│
├── 📁 pages/                # 라우트(페이지) 단위 컴포넌트
│   ├── 📁 adminpage/
│   │   └── AdminPage.tsx         # 로그인 컴포넌트 페이지. userApi.ts 불러옴 
│   ├── 📁 comments/
│   │   └── Comments.tsx
│   ├── 📁 Login/
│   │   ├── Login.tsx         # 로그인 컴포넌트 페이지. userApi.ts 불러옴  
│   ├── 📁 Signup/
│   │   └── Signup.tsx       #사용자 입력을 받고 userApi.signup() 함수를 호출하는 UI 컴포넌트  
│   ├── 📁 mainpage/
│   │   └── MainPage.tsx
│   ├── 📁 Mypage/
│   │   └── Mypage.tsx         * 마이페이지 컴포넌트. 인증된 사용자만 접근하며 회원정보수정도 구현   
│   ├── 📁 Threads/
│   │   └── ThreadsList.tsx       #게시글 목록 조회/ mui 페이지네이션 
│   │   └── ThreadsCreate.tsx     #게시글 작성 페이지
│   │   └── ThreadsDetail.tsx     #게시글 상세 보기(게시글 수정기능 추가함)  
│   ├── 📁 Comments/
│   │   └── Comments.tsx  
│   ├── 📁 Notifications/
│   │   └── Notifications.tsx 
│   ├── 📁 Maps/
│   │   └── Maps.tsx  
│   │   └── 📁 MapsComponent/
│   │        └── GoogleMapContainer.tsx 
│   │        └── GoogleMapsLoader.tsx 
│   │        └── PlaceSearchInput.tsx 
│   │        └── MapSearchBox.tsx 
│   │        └── PlaceSearchInput.tsx 
│   │        └── RouteLocationInput.tsx 
│   │        └── RouteSearchService.ts 
│   │        └── index.ts
│   ├── 📁 Schedules/
│   │   └── Schedules.tsx 
│   ├── 📁 TourList/
│   │   └── index.ts 
│   │   └── TourList.tsx 
│   ├── 📁 Tours/
│   │   └── Tours.tsx  
│   │   └── 📁 components/
│   │        └── 📁ScheduleEditModal
│   │            └── DateTabs.tsx 
│   │            └── PlaceSearchInput.tsx 
│   │            └── ScheduleList.tsx 
│   │               └── 📁ScheduleEditModal
│   │                    └── index.tsx
│   ├── 📁 Traffics/
│   │   └── Traffics.tsx 
│   └── 📁 Weathers/
│       └── Weathers.tsx
│
├── 📁 services/             # API 요청 관련 모듈 (axios, fetch 등): 서버끼리 데이터 전달이 잘되도록 도와줌
│   ├── api.ts          # axios 기본설정(공통 API 서버와 통신할 준비가 된 axios 버전을 만들어 제공함) 토큰 자동 포함 기능
│   ├── userApi.ts           # “유저 관련 기능(로그인, 회원가입, 프로필 조회)을 실행하는 API 함수 집합
                                 Axios를 통해 백엔드 API를 호출하는 로직 * 로그아웃 api는 만들 필요없음 
                               -> 요청 데이터와 응답 데이터 타입은 user.d.ts에서 가져와 사용
│   ├── threadApi.ts          #게시글 관련 API 함수
│   ├── commentApi.ts           #댓글 관련 API 함수 (댓글 가져오기/작성 함수 정의)
│   ├── mapApi.ts
│   ├── scheduleApi.ts
│   ├── tourApi.ts
│   ├── trafficApi.ts
│   └── weatherApi.ts
│   └── notificationApi.ts
│   └── routesApi.ts
│   └── weatherServiceApi.ts
│
├── 📁 store/                # 상태관리 (Recoil, Redux 등)
│   ├── index.ts
│   └── authState.tsx
│   └── routesStore.ts
│   └── travelStore.ts
│   └── userStore.ts
│
├── 📁 types/                # 전역 타입 정의 (백엔드 DTO와 대응됨)
│   ├── user.d.ts             # 유저 로그인 가입 등 주고받을 데이터 형태(유저 관련 DTO 정의)
│   ├── thread.d.ts           # 게시판 데이터 구조 정의
│   └── notification.d.ts
│   └── comment.d.ts          # 댓글 데이터 구조 정의
│   └── travel.ts
│   └── routes.ts
│   └── googleMaps.ts
│
├── 📁 utils/                # 공통 유틸 함수 (토큰 관리, 날짜 포맷 등)
│   ├── token.ts             # 토큰을 localStorage에 저장/조회/삭제하는 유틸 함수 모음(AuthProvider.tsx가 사용)
│   ├── dateUtils.ts
│   └── validate.ts
│   └── tourDataConverter.ts
│   └── routeUtils.ts
│   └── token.ts
│   └── travelUtils.ts
│   └── pdfGenerator.ts 
│
├── App.tsx                 # 전체 라우팅 구성
├── main.tsx                # 앱 진입점
└── vite-env.d.ts           # Vite 타입 지원용 파일



   1. **PDF 생성 라이브러리 선택:**
   - `jsPDF + html2canvas`: HTML을 이미지로 변환 후 PDF에 삽입
   - `@react-pdf/renderer`: React 컴포넌트로 PDF 생성 (더 깔끔한 결과) 


1. **새로 추가할 파일들:**
   - `src/utils/pdfGenerator.ts`:  여행 데이터를 받아서PDF 생성 유틸리티 함수
   - `src/components/PDFDownloadButton.tsx`: 재사용 가능한 PDF 다운로드UI 버튼 컴포넌트 + 클릭 핸들러

2. **수정할 파일들:**
   - `src/pages/Tours/Tours.tsx`: PDF 다운로드 기능 추가, 전체/날짜별 PDF 생성 버튼 추가
   - `src/types/travel.ts`: PDF 관련 타입 추가 (필요시)
   - `package.json` (의존성 추가)

* 백엔드 수정 필요 여부
기본적으로 백엔드 수정 불필요하지만, 다음을 확인해야 해요:

기존 API 응답 확인: 현재 tourApi.ts, scheduleApi.ts에서 제공하는 데이터가 PDF 생성에 충분한지 확인
데이터 부족 시: 기존 API 응답에 필요한 필드만 추가 (대규모 구조 변경 없이)

AI에 할 질문 
React TypeScript + Spring Boot 팀프로젝트에서 여행 일정을 PDF로 저장하는 기능을 구현

현재 상황:
- 프론트엔드: React TypeScript
- 백엔드: Java Spring Boot  
- 팀프로젝트로 기존 코드를 이어받음

구현하고 싶은 기능:
1. 여행계획 페이지에서 날짜별 또는 전체 일정을 PDF로 저장
2. 나의 여행 페이지에서 전체 여행일정을 PDF로 저장
(실시간 미리보기 가능)

방향
1. 프론트엔드에서 PDF 생성 
2.팀프로젝트 기존 코드 최소 수정

**구현 순서:**
1. PDF 라이브러리 설치 및 기본 PDF 생성 함수 작성
2. 재사용 가능한 PDF 다운로드 버튼 컴포넌트 생성
3. Tours 페이지에 PDF 다운로드 기능 추가
4. 테스트 및 디버깅