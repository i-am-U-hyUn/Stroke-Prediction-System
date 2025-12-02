# Stroke Prediction System - Backend Classes

## 개요
뇌졸중 예방 시스템의 백엔드 클래스 구조입니다. 설계 문서에 기반하여 작성되었습니다.

## 파일 구조
```
backend/
├── models.py       # 엔티티 모델 클래스
├── services.py     # 비즈니스 로직 서비스 클래스
├── demo.py         # 사용 예시 데모
└── README.md       # 이 파일
```

## 클래스 다이어그램

### 1. 모델 클래스 (models.py)

#### 사용자 클래스 계층
```
User (추상 클래스)
├── Patient          # 환자
├── Caregiver        # 보호자
├── Doctor           # 의사
└── Administrator    # 관리자
```

#### 건강 데이터 클래스
- `HealthData`: 건강 데이터 (혈압, 혈당, BMI 등)
- `RiskAssessment`: 위험도 평가 결과
- `FASTTest`: FAST 검사 (Face, Arms, Speech, Time)

#### 메시징 클래스
- `Message`: 사용자 간 메시지
- `Notification`: 시스템 알림
- `Alert`: 긴급 경고 알림

### 2. 서비스 클래스 (services.py)

#### 핵심 서비스
- `RiskCalculator`: 위험도 계산 엔진
- `DataAnalyzer`: 건강 데이터 분석
- `NotificationService`: 알림 관리
- `SharingService`: 데이터 공유 관리
- `MessageService`: 메시지 관리

## 주요 기능

### Patient (환자) 클래스
```python
- add_health_data(): 건강 데이터 입력
- add_risk_assessment(): 위험도 평가 추가
- perform_fast_test(): FAST 검사 수행
- share_data_with(): 데이터 공유
- get_dashboard_data(): 대시보드 데이터 조회
```

### Caregiver (보호자) 클래스
```python
- add_monitored_patient(): 환자 모니터링 추가
- send_encouragement_message(): 응원 메시지 전송
- receive_alert(): 위험 알림 수신
- get_dashboard_data(): 대시보드 데이터 조회
```

### Doctor (의사) 클래스
```python
- add_patient(): 담당 환자 추가
- add_consultation_note(): 진단 메모 작성
- add_prescription(): 처방 메모 작성
- get_patient_panel(): 환자 패널 조회 (위험도 순)
- get_dashboard_data(): 대시보드 데이터 조회
```

### Administrator (관리자) 클래스
```python
- update_content(): 시스템 콘텐츠 관리
- update_alert_policy(): 알림 정책 설정
- set_risk_threshold(): 위험 임계치 설정
- get_dashboard_data(): 대시보드 데이터 조회
```

## RiskCalculator 서비스

### 위험도 계산 알고리즘
```python
가중치:
- 나이: 15%
- 고혈압: 20%
- 심장질환: 20%
- 혈당: 15%
- BMI: 15%
- 흡연: 15%

위험도 수준:
- Low: 0-39점
- Medium: 40-69점
- High: 70-100점
```

### 주요 메서드
```python
- calculate_risk_score(): 위험도 점수 계산
- determine_risk_level(): 위험도 수준 결정
- generate_recommendations(): 맞춤 권장사항 생성
- assess_risk(): 종합 위험도 평가
```

## 사용 예시

### 1. 환자 생성 및 건강 데이터 입력
```python
from models import Patient, HealthData
from services import RiskCalculator

# 환자 생성
patient = Patient(
    user_id="P001",
    email="patient@test.com",
    name="김환자",
    password="patient123"
)

# 건강 데이터 입력
health_data = HealthData(patient.user_id, {
    'age': 65,
    'gender': 'Male',
    'hypertension': 1,
    'heart_disease': 0,
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
```

### 2. 데이터 공유
```python
from models import Patient, Caregiver, Doctor
from services import SharingService

patient = Patient("P001", "patient@test.com", "김환자", "pass")
caregiver = Caregiver("C001", "caregiver@test.com", "김보호", "pass")
doctor = Doctor("D001", "doctor@test.com", "이의사", "pass", "신경과")

# 보호자와 공유
SharingService.share_with_caregiver(patient, caregiver)

# 의사와 공유
SharingService.share_with_doctor(patient, doctor)
```

### 3. 응원 메시지 전송
```python
from services import MessageService

message = MessageService.send_encouragement(
    sender=caregiver,
    patient=patient,
    subject="힘내세요!",
    content="규칙적인 운동과 건강한 식단으로 건강을 관리하세요."
)
```

### 4. FAST 검사
```python
from models import FASTTest

fast_test = FASTTest(patient.user_id)
is_emergency = fast_test.perform_test(
    face=False,  # 얼굴 비대칭
    arms=False,  # 팔 약화
    speech=False # 언어 장애
)

if is_emergency:
    print("응급 상황! 즉시 119에 연락하세요!")
```

### 5. 데이터 분석
```python
from services import DataAnalyzer

# 트렌드 분석
glucose_trend = DataAnalyzer.analyze_trend(
    patient.health_records, 
    'avg_glucose_level'
)

# 이상 지표 감지
abnormalities = DataAnalyzer.detect_abnormal_indicators(
    patient.get_latest_health_data()
)

# 개인 리포트 생성
report = DataAnalyzer.generate_personal_report(patient)
```

## 데모 실행

전체 시스템의 동작을 확인하려면 데모를 실행하세요:

```bash
python backend/demo.py
```

데모는 다음 워크플로우를 보여줍니다:
1. 환자 워크플로우 (건강 데이터 입력, 위험도 평가, FAST 검사)
2. 보호자 워크플로우 (환자 모니터링, 응원 메시지)
3. 의사 워크플로우 (환자 관리, 진단/처방 메모)
4. 관리자 워크플로우 (콘텐츠 관리, 정책 설정)
5. 데이터 분석 서비스
6. 알림 서비스

## 설계 원칙

### 객체 지향 설계
- **상속**: User 추상 클래스를 상속받는 역할별 클래스
- **캡슐화**: 각 클래스의 데이터와 메서드를 적절히 캡슐화
- **다형성**: User 인터페이스를 통한 다형적 동작
- **단일 책임**: 각 클래스와 서비스는 명확한 단일 책임

### 서비스 레이어 패턴
- 비즈니스 로직을 서비스 클래스로 분리
- 모델은 데이터 구조만 담당
- 서비스는 로직과 연산 담당

### SOLID 원칙
- **Single Responsibility**: 각 클래스는 하나의 책임만
- **Open/Closed**: 확장에는 열려있고 수정에는 닫혀있음
- **Liskov Substitution**: User 하위 클래스는 User로 대체 가능
- **Interface Segregation**: 필요한 메서드만 구현
- **Dependency Inversion**: 추상화에 의존

## 향후 확장 가능성

### 데이터베이스 통합
현재는 메모리 기반이지만, 다음과 같이 확장 가능:
```python
# SQLAlchemy, MongoDB 등과 연동
class UserRepository:
    def save(self, user: User): pass
    def find_by_id(self, user_id: str): pass
```

### API 서버 통합
Flask/FastAPI와 쉽게 통합:
```python
from flask import Flask, jsonify
from models import Patient
from services import RiskCalculator

app = Flask(__name__)

@app.route('/api/assess-risk', methods=['POST'])
def assess_risk():
    # 클래스 활용
    pass
```

### 머신러닝 모델 통합
```python
class MLRiskPredictor(RiskCalculator):
    def __init__(self, model_path):
        self.model = load_model(model_path)
    
    def calculate_risk_score(self, health_data):
        # ML 모델 활용
        pass
```

## 라이센스
이 코드는 교육용으로 작성되었습니다.
