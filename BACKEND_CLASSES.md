# 뇌졸중 예방 시스템 - 백엔드 클래스 구조

## 📋 개요

이 프로젝트는 **뇌졸중 예방 시스템(Stroke Prediction System)**의 백엔드 클래스 구조를 설계 문서에 기반하여 구현한 것입니다.

## 🎯 주요 특징

### 설계 원칙
- **객체 지향 설계 (OOP)**: 상속, 캡슐화, 다형성, 추상화
- **SOLID 원칙** 준수
- **서비스 레이어 패턴**: 비즈니스 로직 분리
- **확장 가능한 구조**: 데이터베이스, API 통합 용이

### 주요 액터 (Actor)
1. **환자 (Patient)**: 건강 데이터 입력, 위험도 조회, FAST 검사
2. **보호자 (Caregiver)**: 환자 모니터링, 응원 메시지 전송
3. **의사 (Doctor)**: 환자 패널 관리, 진단/처방 메모
4. **관리자 (Administrator)**: 시스템 콘텐츠 및 정책 관리

## 📁 파일 구조

```
backend/
├── models.py              # 엔티티 모델 클래스
│   ├── User (추상 클래스)
│   ├── Patient, Caregiver, Doctor, Administrator
│   ├── HealthData, RiskAssessment, FASTTest
│   └── Message, Notification, Alert
│
├── services.py            # 비즈니스 로직 서비스
│   ├── RiskCalculator     # 위험도 계산
│   ├── DataAnalyzer       # 데이터 분석
│   ├── NotificationService # 알림 관리
│   ├── SharingService     # 데이터 공유
│   └── MessageService     # 메시지 관리
│
├── demo.py                # 전체 시스템 데모
├── generate_diagram.py    # 클래스 다이어그램 생성
├── class_diagram.puml     # PlantUML 다이어그램
└── README.md              # 상세 문서
```

## 🚀 빠른 시작

### 1. 데모 실행
```bash
python backend/demo.py
```

**데모 내용:**
- ✅ 환자 워크플로우 (건강 데이터 입력, 위험도 평가, FAST 검사)
- ✅ 보호자 워크플로우 (환자 모니터링, 응원 메시지)
- ✅ 의사 워크플로우 (환자 관리, 진단/처방 메모)
- ✅ 관리자 워크플로우 (콘텐츠 관리, 정책 설정)
- ✅ 데이터 분석 서비스
- ✅ 알림 서비스

### 2. 클래스 다이어그램 생성
```bash
python backend/generate_diagram.py
```

생성된 `class_diagram.puml` 파일을 [PlantUML 온라인](https://www.plantuml.com/plantuml/uml/)에서 열어 시각화할 수 있습니다.

## 💡 사용 예시

### 환자 생성 및 위험도 평가
```python
from models import Patient, HealthData
from services import RiskCalculator

# 환자 생성
patient = Patient("P001", "patient@test.com", "김환자", "pass123")

# 건강 데이터 입력
health_data = HealthData(patient.user_id, {
    'age': 65,
    'hypertension': 1,
    'avg_glucose_level': 150,
    'bmi': 28.5,
    'smoking_status': 'formerly smoked'
})
patient.add_health_data(health_data)

# 위험도 평가
calculator = RiskCalculator()
assessment = calculator.assess_risk(patient, health_data)

print(f"위험도: {assessment.risk_level.value}")
print(f"점수: {assessment.score}")
print("권장사항:")
for rec in assessment.recommendations:
    print(f"  • {rec}")
```

### 데이터 공유
```python
from models import Caregiver, Doctor
from services import SharingService

caregiver = Caregiver("C001", "caregiver@test.com", "김보호", "pass")
doctor = Doctor("D001", "doctor@test.com", "이의사", "pass", "신경과")

# 보호자와 공유
SharingService.share_with_caregiver(patient, caregiver)

# 의사와 공유
SharingService.share_with_doctor(patient, doctor)
```

### FAST 검사
```python
from models import FASTTest

fast_test = FASTTest(patient.user_id)
is_emergency = fast_test.perform_test(
    face=True,   # 얼굴 비대칭
    arms=False,  # 팔 약화
    speech=False # 언어 장애
)

if is_emergency:
    print("⚠️ 응급 상황! 즉시 119에 연락하세요!")
```

## 🧮 위험도 계산 알고리즘

### 가중치 시스템
```python
weights = {
    'age': 15%,          # 나이
    'hypertension': 20%, # 고혈압
    'heart_disease': 20%,# 심장질환
    'glucose': 15%,      # 혈당
    'bmi': 15%,          # BMI
    'smoking': 15%       # 흡연
}
```

### 위험도 수준
- **Low (저위험)**: 0-39점
- **Medium (중등위험)**: 40-69점
- **High (고위험)**: 70-100점

## 📊 클래스 계층 구조

```
User (추상 클래스)
├── Patient          # 건강 데이터 관리, 위험도 평가
├── Caregiver        # 환자 모니터링, 응원 메시지
├── Doctor           # 환자 패널, 진단/처방
└── Administrator    # 시스템 관리, 정책 설정

HealthData          # 건강 정보
RiskAssessment      # 위험도 평가 결과
FASTTest            # FAST 검사 (Face, Arms, Speech, Time)

Message             # 사용자 간 메시지
Notification        # 시스템 알림
Alert               # 긴급 경고

Services:
├── RiskCalculator      # 위험도 계산 엔진
├── DataAnalyzer        # 트렌드 분석, 이상 지표 감지
├── NotificationService # 알림 발송
├── SharingService      # 데이터 공유 관리
└── MessageService      # 메시지 관리
```

## 🔧 확장 가능성

### 데이터베이스 통합
```python
# SQLAlchemy 예시
from sqlalchemy import Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class PatientModel(Base):
    __tablename__ = 'patients'
    user_id = Column(String, primary_key=True)
    email = Column(String, unique=True)
    name = Column(String)
    # ... 기존 Patient 클래스 속성 매핑
```

### API 서버 통합
```python
# FastAPI 예시
from fastapi import FastAPI
from models import Patient, HealthData
from services import RiskCalculator

app = FastAPI()

@app.post("/api/assess-risk")
async def assess_risk(health_data: dict):
    patient = get_patient()  # DB에서 조회
    data = HealthData(patient.user_id, health_data)
    calculator = RiskCalculator()
    assessment = calculator.assess_risk(patient, data)
    return assessment.to_dict()
```

### 머신러닝 모델 통합
```python
import joblib

class MLRiskCalculator(RiskCalculator):
    def __init__(self, model_path):
        super().__init__()
        self.ml_model = joblib.load(model_path)
    
    def calculate_risk_score(self, health_data):
        # 머신러닝 모델을 사용한 예측
        features = self._extract_features(health_data)
        return self.ml_model.predict([features])[0]
```

## 📈 주요 기능

### Patient (환자)
- ✅ 건강 데이터 입력 및 조회
- ✅ 위험도 평가 및 이력 관리
- ✅ FAST 검사 수행
- ✅ 데이터 공유 (보호자/의사)
- ✅ 개인 대시보드

### Caregiver (보호자)
- ✅ 환자 건강 상태 모니터링
- ✅ 위험 알림 수신
- ✅ 응원 메시지 전송
- ✅ 공유된 건강 기록 조회

### Doctor (의사)
- ✅ 환자 패널 관리 (위험도 순 정렬)
- ✅ 진단 메모 작성
- ✅ 처방 메모 기록
- ✅ 환자 트렌드 모니터링

### Administrator (관리자)
- ✅ 시스템 콘텐츠 관리
- ✅ 알림 정책 설정
- ✅ 위험 임계치 조정
- ✅ 재검사 주기 설정

## 🎓 설계 패턴

1. **추상 팩토리 패턴**: User 추상 클래스와 구체적 사용자 타입
2. **서비스 레이어 패턴**: 비즈니스 로직 분리
3. **전략 패턴**: RiskCalculator 확장 가능
4. **옵저버 패턴**: 알림 시스템 (NotificationService)
5. **싱글톤 패턴**: 서비스 클래스들 (Static 메서드)

## 📚 참고 문서

- [backend/README.md](backend/README.md) - 상세 API 문서
- [backend/class_diagram.puml](backend/class_diagram.puml) - PlantUML 다이어그램
- [설계 문서] - Activity Diagram, Use Case

## 👥 개발팀

**TEAM 5**
- 소프트웨어 설계 프로젝트
- 뇌졸중 예방 시스템

## 📄 라이센스

교육용 프로젝트

---

**Note**: 이 클래스 구조는 설계 문서의 요구사항을 충실히 반영하여 작성되었으며, 실제 프로덕션 환경에서 사용하기 위해서는 데이터베이스, 인증, API 레이어 등의 추가 구현이 필요합니다.
