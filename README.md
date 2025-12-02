# Stroke-Prediction-System
뇌졸중 예방 시스템

https://github.com/user-attachments/assets/af564078-e6a2-4144-bcd1-44428f596372

---

## 🚀 1. Backend Development (Python / FastAPI)

### ✔ 객체 지향 설계 기반 클래스 구조 설계 및 구현

* `models.py` 전체 505줄 규모
* **User 추상 클래스**를 기반으로

  * Patient
  * Caregiver
  * Doctor
  * Administrator
    4가지 역할별 세부 클래스를 **상속 구조로 구현**
* **추상화, 다형성, 캡슐화** 등 OOP 원칙을 프로젝트 전반에 적용
* 유지보수가 용이하고 역할 기반 확장 가능한 구조 확립

---

### ✔ 서비스 레이어 비즈니스 로직 개발

`services.py` (451줄)

* **RiskCalculator**: 건강 데이터 기반 뇌졸중 위험도 계산 알고리즘 개발

  * 가중치 기반 점수 계산 로직 설계
* **DataAnalyzer**: FAST 테스트 및 건강 데이터 분석 기능 구현
* **NotificationService**, **SharingService**, **MessageService** 등 사용자 간 커뮤니케이션 및 공유 기능 개발
* 복잡한 비즈니스 로직을 컨트롤러(API)와 분리하여 **MVC 아키텍처의 서비스 레이어 구조** 완성

---

### ✔ RESTful API 서버 설계 및 구현

`api.py` (462줄)

* FastAPI 기반 백엔드 API 20개 이상 개발

  * 인증/로그인
  * 건강 데이터 제출 API
  * FAST 테스트 결과 처리
  * 역할 기반 대시보드 데이터 제공
  * 메시지/공유 기능
* CORS 설정, 정적 파일 서빙 등 실제 서비스 배포 수준 세팅
* Request/Response 모델 구조화로 API 사용성을 향상

---

## 🎨 2. Frontend Development (React / Vite)

### ✔ UI 컴포넌트 개발

총 **13개의 React 컴포넌트** 개발

* Login, HealthForm, ResultPage, Dashboard 등 핵심 페이지 구현
* 사용자 역할별 대시보드:

  * PatientDashboard
  * CaregiverDashboard
  * DoctorDashboard
* FAST 테스트 UI, 메시지 기능, 식단 추천 UI 등 특화 기능 포함

---

### ✔ 라우팅 및 상태 관리

* React Router 기반 **역할별 접근 제어 시스템 구현**
* SessionStorage 활용한 인증 상태·유저 정보 관리
* 요청자 관점에서 직관적이고 안정적인 사용자 흐름 제공

---

<img width="948" height="1248" alt="image" src="https://github.com/user-attachments/assets/38372bad-33e0-44b5-8e2d-5e89e20acb3d" />
