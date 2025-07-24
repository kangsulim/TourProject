# 여행 플래너 (Travel Planner) ✈️
> 팀 프로젝트 - AI 기반 스마트 여행 계획 플랫폼

## 📋 프로젝트 개요
-   **프로젝트명**: 여행 플래너 (Travel Planner)
-   **개발 기간**: 2025-06-11 ~ 2025-07-25 (6주)
-   **개발 인원**: 4명 (팀 프로젝트)
-   **프로젝트 타입**: 웹 애플리케이션 (풀스택)

## 🎯 개발 배경
여행 계획을 세우는 과정의 복잡함과 시간 소요를 줄이고자 했어요.  
날씨, 교통, 예산 등을 고려한 최적화된 여행 일정을 자동으로 생성하고, 커뮤니티를 통해 경험을 공유할 수 있는 올인원 여행 플래너를 목표로 개발했어요!

## ✨ 주요 기능
-   🔐 `JWT 기반 인증 시스템`
-   🗺️ `Google Maps 연동 여행지 검색`
-   📅 `드래그 앤 드롭 일정 관리`
-   🌤️ `실시간 날씨 정보 제공`
-   🚗 `경로 및 교통 정보 안내`
-   💰 `예산 계획 및 관리`
-   💬 `여행 후기 커뮤니티`
-   📸 `이미지 업로드 및 관리`
-   📄 `PDF 일정표 생성`
-   🔔 `실시간 알림 시스템`

## 🛠️ 기술 스택

### Frontend
-   **React** (18.2.0)
-   **TypeScript** (5.8.3)
-   **Vite** (4.4.5)
-   **Material-UI** (7.1.2)
-   **React Router DOM** (7.6.2)
-   **Recoil & Zustand** (상태 관리)
-   **Axios** (API 통신)
-   **React Beautiful DnD** (드래그 앤 드롭)
-   **Google Maps API** (지도 서비스)

### Backend
-   **Java 17**
-   **Spring Boot** (3.5.0)
-   **Spring Security**
-   **Spring Data JPA**
-   **JWT** (인증)
-   **Lombok**

### Database
-   **MariaDB**
-   **Flyway** (DB 마이그레이션)

### 개발 도구 및 배포
-   **Git & GitHub**
-   **IntelliJ IDEA**
-   **VS Code**
-   **Gradle**
-   **ESLint**

## 🎨 코드 컨벤션

### 공통 규칙
-   **변수명**: `camelCase` 형식으로 작성
-   **Lint**: K&R 형식 `if(a === 1) { }` 사용
-   **주석**: 코드 상단에 어떠한 역할을 하는지 간단하게 작성
-   **커밋 메시지**: `타입: 간단한 설명` 형식 사용

### 커밋 메시지 컨벤션

#### 타입
| 타입     | 설명                    |
| -------- | ----------------------- |
| `feat`   | 새로운 기능 추가        |
| `fix`    | 버그 수정               |
| `design` | CSS 파일 및 디자인 변경 |
| `rename` | 폴더명 변경             |
| `remove` | 파일 삭제               |

#### 예시
```
feat: 여행 일정 생성 기능 구현
fix: 날씨 API 호출 오류 수정
design: 반응형 일정표 디자인 구현
rename: TourController를 TravelController로 변경
remove: 미사용 유틸리티 함수 제거
```

## 🌟 Git 워크플로우

#### 브랜치 전략
-   **`main`**: 메인 배포 브랜치
-   **`dev`**: 개발 중인 기능 통합 브랜치

## 🚀 API 문서
백엔드 서버가 실행 중일 때 Swagger UI를 통해 API 문서를 확인할 수 있어요!
-   **Swagger UI**: http://localhost:8080/swagger-ui/index.html
-   **API Docs**: http://localhost:8080/v3/api-docs
