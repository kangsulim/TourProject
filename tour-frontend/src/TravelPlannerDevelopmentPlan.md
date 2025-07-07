# 여행 계획 작성 시스템 개발 계획서

## 📋 프로젝트 개요

여행 계획 작성을 위한 통합 플랫폼 개발
- **주요 기능**: 지도 기반 여행지 검색, 교통편 조회, 날씨 정보, 일정 관리
- **기술 스택**: React + TypeScript, Material-UI, Google Maps API, OpenWeather API
- **상태 관리**: Recoil/Zustand
- **HTTP 클라이언트**: Axios

## 🗂 DB 구조 분석

### Tour (여행)
- `tourId`: 여행 ID (Primary Key)
- `userId`: 사용자 ID (Foreign Key)
- `title`: 여행 제목
- `startDate`: 여행 시작일
- `endDate`: 여행 종료일
- `createDate`, `modifiedDate`: 생성/수정 일시

### Schedule (일정)
- `scheduleId`: 일정 ID (Primary Key)
- `tourId`: 여행 ID (Foreign Key)
- `scheduleTitle`: 일정 제목
- `content`: 일정 내용
- `date`: 일정 날짜
- `startTime`, `endTime`: 시작/종료 시간
- `createDate`, `modifiedDate`: 생성/수정 일시

### MapEntity (여행지)
- `mapId`: 지도 엔티티 ID (Primary Key)
- `scheduleId`: 일정 ID (Foreign Key)
- `tourId`: 여행 ID (Foreign Key)
- `location`: 위치 정보 (여행지 이름 + 구글맵 링크)
- `createDate`: 생성 일시

### Traffic (교통편)
- `trafficId`: 교통편 ID (Primary Key)
- `tourId`: 여행 ID (Foreign Key)
- `vehicle`: 교통수단 정보 (상세 경로 정보 포함)
- `spendTime`: 소요 시간
- `price`: 요금

### Weather (날씨) - DB 저장 예정이지만 현재 단계에서는 실시간 조회만
- `weatherId`: 날씨 ID (Primary Key)
- `tourId`: 여행 ID (Foreign Key)
- `temperature`: 온도
- `description`: 날씨 설명
- `createDate`, `modifiedDate`: 생성/수정 일시

## 🎯 개발 단계별 계획

### Phase 1: 기본 구조 및 타입 정의

#### 1.1 TypeScript 타입 정의 (types/)
```typescript
// types/travel.ts
export interface TourType {
  tourId?: number;
  title: string;
  startDate: string;
  endDate: string;
}

export interface ScheduleType {
  scheduleId?: number;
  tourId: number;
  scheduleTitle: string;
  content: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface MapEntityType {
  mapId?: number;
  scheduleId: number;
  tourId: number;
  location: string; // 여행지 이름
  googleMapLink: string; // 구글맵 링크
  photoUrl?: string; // 구글 Places API에서 가져온 사진
  rating?: number; // 구글 별점
}

export interface TrafficType {
  trafficId?: number;
  tourId: number;
  vehicle: string; // 교통수단 상세 정보 (JSON 형태)
  spendTime: string; // ISO datetime format
  price: number;
  departureTime: string;
  arrivalTime: string;
  route: string; // 경로 설명
}

export interface WeatherType {
  temperature: number;
  description: string;
  date: string;
  icon?: string;
}

export interface RouteResult {
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number; // 분 단위
  transfers: number;
  price: number;
  route: RouteStep[];
}

export interface RouteStep {
  mode: 'BUS' | 'SUBWAY';
  line: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
}
```

#### 1.2 상태 관리 설정 (store/)
```typescript
// store/travelStore.ts (Zustand 사용)
interface TravelState {
  currentTour: TourType | null;
  schedules: ScheduleType[];
  mapEntities: MapEntityType[];
  trafficData: TrafficType[];
  selectedLocation: google.maps.places.PlaceResult | null;
  routeResults: RouteResult[];
  weatherData: WeatherType[];
  isRoutePanelOpen: boolean;
}
```

**주요 확인 사항**:
- TypeScript 타입이 백엔드 Entity와 정확히 매칭되는지 확인
- Google Maps API 타입과 우리 커스텀 타입 간의 변환 로직 검증
- 상태 관리 라이브러리 Zustand 결정

### Phase 2: Google Maps 통합 및 지도 기능 구현

#### 2.1 Maps.tsx 기본 구조
```typescript
// pages/Maps/Maps.tsx
export const Maps: React.FC = () => {
  // Google Maps 로딩
  // 검색창 구현
  // 지도 표시
  // 검색 결과 표시 (왼쪽 패널)
  // 길찾기 패널 (오른쪽, 토글 방식)
}
```

#### 2.2 핵심 기능 구현
1. **Google Maps 초기화**
   - `@react-google-maps/api` 사용
   - 기본 위치: 서울 중심
   - 줌 레벨: 13

2. **검색창 구현**
   - Google Places Autocomplete API 연동
   - 검색 결과: 관광지, 레스토랑, 명소 등
   - 검색창 위치: 지도 상단 중앙

3. **검색 결과 표시 (왼쪽 패널)**
   - 여행지 이름, 사진, 별점, 주소
   - 구글맵 링크 (새 창)
   - "일정 추가" 버튼

4. **길찾기 기능 (오른쪽 패널)**
   - 출발지/목적지 입력
   - 출발 시간 선택 (DateTimePicker)
   - Google Maps Routes API 연동
   - 대중교통만 (TRANSIT 모드)
   - 결과 최대 5개 표시
   - "일정 추가" 버튼

**주요 확인 사항**:
- Google Maps API 키 설정 및 권한 확인
- Places API, Routes API 할당량 확인
- 지도 크기 및 반응형 디자인 검증
- 검색 결과 패널과 길찾기 패널의 UI/UX 충돌 방지

### Phase 3: 교통편 조회 및 결과 표시

#### 3.1 Google Maps Routes API 연동
```typescript
// services/routeService.ts
export const getPublicTransitRoutes = async (
  origin: string,
  destination: string,
  departureTime: Date
): Promise<RouteResult[]> => {
  // Google Maps Routes API 호출
  // 대중교통 결과 파싱
  // 최대 5개 결과 반환
}
```

#### 3.2 교통편 결과 컴포넌트
```typescript
// components/RouteResults.tsx
export const RouteResults: React.FC<{
  routes: RouteResult[];
  onAddToSchedule: (route: RouteResult) => void;
}> = ({ routes, onAddToSchedule }) => {
  // 각 경로별 상세 정보 표시
  // 소요시간, 환승횟수, 요금
  // "일정 추가" 버튼
}
```

**주요 확인 사항**:
- Routes API 응답 데이터 구조 분석 및 파싱 로직 검증
- 대중교통 정보의 정확성 (실시간 정보 vs 정적 정보)
- 요금 정보 가용성 확인 (Google API에서 제공 여부)
- 교통편 검색 시 로딩 상태 및 에러 처리

### Phase 4: 날씨 정보 연동

#### 4.1 OpenWeather API 연동
```typescript
// services/weatherService.ts
export const getWeatherForecast = async (
  lat: number,
  lng: number
): Promise<WeatherType[]> => {
  // OpenWeather API 5일 예보 조회
  // 데이터 변환 및 반환
}
```

#### 4.2 날씨 컴포넌트
```typescript
// pages/Weathers/Weathers.tsx
export const Weathers: React.FC<{
  location: { lat: number; lng: number } | null;
}> = ({ location }) => {
  // 5일간 날씨 예보 표시
  // 간단한 UI (작은 크기)
  // 온도, 날씨 아이콘, 간단한 설명
}
```

**주요 확인 사항**:
- OpenWeather API 키 설정 및 할당량 확인
- 위치 좌표 정확성 (Google Places API에서 가져온 좌표)
- 날씨 아이콘 표시 방식 결정
- 섭씨 온도 표시

### Phase 5: 일정 관리 시스템

#### 5.1 일정 상태 관리
```typescript
// store/scheduleStore.ts
interface ScheduleState {
  currentSchedules: ScheduleType[];
  addLocationToSchedule: (location: MapEntityType) => void;
  addRouteToSchedule: (route: RouteResult) => void;
  updateScheduleTime: (scheduleId: number, startTime: string, endTime: string) => void;
  removeFromSchedule: (scheduleId: number) => void;
}
```

#### 5.2 일정 표시 컴포넌트
```typescript
// pages/Schedules/Schedules.tsx
export const Schedules: React.FC = () => {
  // 일정 목록 표시
  // 드래그&드롭으로 순서 변경
  // 시간 클릭으로 수정 가능
  // 저장 버튼
}
```

**주요 확인 사항**:
- 일정 추가 시 기본 시간 설정 로직 (예: 2시간 간격)
- 여행지와 교통편이 혼재된 일정의 시간 순서 정렬
- 일정 수정 시 실시간 업데이트
- 저장 전 임시 저장 (로컬 스토리지 활용)

### Phase 6: 데이터 영속성 및 API 연동

#### 6.1 API 서비스 구현
```typescript
// services/api.ts
export const tourAPI = {
  createTour: (tour: TourType) => Promise<TourType>,
  savePlan: (tourId: number, schedules: ScheduleType[], maps: MapEntityType[], traffic: TrafficType[]) => Promise<void>,
  getTour: (tourId: number) => Promise<TourType>,
  updateTour: (tour: TourType) => Promise<TourType>
}
```

#### 6.2 저장 로직 구현
- 여행 기본 정보 저장 (Tour)
- 일정별 세부 정보 저장 (Schedule)
- 여행지 정보 저장 (MapEntity)
- 교통편 정보 저장 (Traffic)
- 트랜잭션 처리로 데이터 무결성 보장

**주요 확인 사항**:
- 백엔드 API 엔드포인트 확인
- 데이터 검증 로직 (필수 필드, 형식 검증)
- 저장 실패 시 롤백 처리
- 네트워크 오류 시 재시도 로직

### Phase 7: 통합 및 Tours.tsx 구현

#### 7.1 메인 컴포넌트 구조
```typescript
// pages/Tours/Tours.tsx
export const Tours: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* 지도 영역 (60%) */}
      <Box sx={{ flex: '0 0 60%' }}>
        <Maps />
      </Box>
      
      {/* 사이드 패널 영역 (40%) */}
      <Box sx={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column' }}>
        {/* 날씨 정보 (20%) */}
        <Box sx={{ flex: '0 0 20%' }}>
          <Weathers location={selectedLocation} />
        </Box>
        
        {/* 일정 관리 (80%) */}
        <Box sx={{ flex: '1' }}>
          <Schedules />
        </Box>
      </Box>
    </Box>
  )
}
```

**주요 확인 사항**:
- 컴포넌트 간 데이터 흐름 및 상태 공유
- 반응형 디자인 (모바일/태블릿 대응)
- 성능 최적화 (불필요한 리렌더링 방지)
- 사용자 경험 (로딩 상태, 에러 메시지)

## ❓ 질문 및 확인 사항 (답변 완료)

### 1. 데이터 저장 형식 관련 ✅
- **MapEntity의 location 필드**: JSON 형태로 저장 확정
  ```json
  {
    "name": "여행지명",
    "link": "구글맵URL",
    "placeId": "구글PlaceID",
    "address": "주소",
    "photoUrl": "사진URL",
    "rating": 4.5
  }
  ```
  
- **Traffic의 vehicle 필드**: JSON 형태로 경로 전체 정보 저장 확정
  ```json
  {
    "mode": "TRANSIT",
    "steps": [
      {
        "mode": "BUS",
        "line": "버스번호",
        "departure": "출발지",
        "arrival": "도착지",
        "departureTime": "출발시간",
        "arrivalTime": "도착시간"
      }
    ],
    "totalDuration": "총소요시간",
    "transfers": "환승횟수"
  }
  ```

### 2. 기본값 설정 ✅
- **일정 추가 시 기본 시간**: 
  - 여행지: 2시간 기본 설정
  - 교통편: Google Routes API에서 제공하는 실제 소요시간 사용
  
- **교통편 요금**: Google API에서 제공하지 않을 경우 "요금 정보 없음" 표시

### 3. 기술적 고려사항 ✅
- **Weather 정보**: 
  - 현재 단계에서는 실시간 조회만 구현
  - DB 저장 기능은 추후 순서 관리를 위해 준비 (여행지, 교통, 날씨 등의 저장 순서 복원)
  - 현재는 OpenWeather API로 실시간 조회만 사용
  
- **API 할당량**: Google Maps API와 OpenWeather API 무료 버전 제한 내에서 사용
  - Google Maps API: 월 $200 크레딧 (무료)
  - OpenWeather API: 1,000 calls/day (무료)

### 4. UI/UX 관련 ✅
- **화면 레이아웃**: 60%(지도) + 40%(사이드패널) 비율로 진행
- **모바일 대응**: 반응형 디자인 필수 구현
  - 모바일에서는 탭 방식으로 지도/일정 전환
  - 태블릿에서는 상하 분할 레이아웃

### 5. 추가 기술적 고려사항
- **API 키 관리**: 환경변수로 안전하게 관리
- **에러 처리**: API 호출 실패, 네트워크 오류 등
- **성능 최적화**: 지도 렌더링, 대용량 검색 결과 처리
- **접근성**: 키보드 내비게이션, 스크린 리더 지원

### 6. 개발 우선순위
1. **1순위**: Maps.tsx (검색 기능)
2. **2순위**: Schedules.tsx (일정 관리)
3. **3순위**: 교통편 조회 기능
4. **4순위**: Weathers.tsx
5. **5순위**: 데이터 저장 기능
6. **6순위**: Tours.tsx 통합

## 🔄 개발 프로세스

### 단계별 검증 체크리스트

#### Phase 1 완료 시
- [ ] TypeScript 타입 정의 완료
- [ ] 상태 관리 스토어 설정 완료
- [ ] Google Maps API 키 설정 및 테스트
- [ ] OpenWeather API 키 설정 및 테스트

#### Phase 2 완료 시
- [ ] 지도 정상 렌더링
- [ ] 검색창 자동완성 기능 동작
- [ ] 검색 결과 목록 표시
- [ ] 마커 표시 및 클릭 이벤트

#### Phase 3 완료 시
- [ ] 길찾기 패널 토글 기능
- [ ] 대중교통 경로 검색 결과 표시
- [ ] 경로 상세 정보 표시
- [ ] 일정 추가 기능 연동

#### Phase 4 완료 시
- [ ] 선택된 위치의 날씨 정보 표시
- [ ] 5일 예보 정확성 확인
- [ ] 날씨 아이콘 및 UI 완성

#### Phase 5 완료 시
- [ ] 일정 목록 표시 및 관리
- [ ] 시간 수정 기능
- [ ] 드래그&드롭 순서 변경
- [ ] 저장 버튼 기능

#### Phase 6 완료 시
- [ ] 백엔드 API 연동 완료
- [ ] 데이터 저장/조회 기능 테스트
- [ ] 에러 처리 및 예외 상황 대응

#### Phase 7 완료 시
- [ ] 전체 기능 통합 테스트
- [ ] 사용자 시나리오 테스트
- [ ] 성능 및 접근성 검증
- [ ] 크로스 브라우저 테스트

## 📚 참고 자료

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Google Routes API](https://developers.google.com/maps/documentation/routes)
- [OpenWeather API](https://openweathermap.org/api)
- [Material-UI 문서](https://mui.com/)
- [React Router 문서](https://reactrouter.com/)

---

**최종 업데이트**: 2025-07-07
**개발 예상 기간**: 4-6주
**개발자**: Full-Stack Developer
