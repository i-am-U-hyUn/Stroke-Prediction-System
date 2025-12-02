"""
Stroke Prediction System - Class Diagram Visualization
클래스 다이어그램 시각화

설계안 기반 클래스 구조를 PlantUML 형식으로 표현
"""

class_diagram = """
@startuml Stroke Prediction System - Class Diagram

' 스타일 설정
skinparam classAttributeIconSize 0
skinparam class {
    BackgroundColor<<abstract>> #E8E8E8
    BackgroundColor<<entity>> #B3E5FC
    BackgroundColor<<service>> #C8E6C9
    BorderColor #333333
}

' ===== 추상 클래스 =====
abstract class User <<abstract>> {
    - user_id: str
    - email: str
    - name: str
    - password: str
    - role: UserRole
    - created_at: datetime
    - last_login: datetime
    --
    + {abstract} get_dashboard_data(): Dict
    + login(): bool
    + logout(): bool
    + to_dict(): Dict
}

' ===== 사용자 클래스 =====
class Patient <<entity>> {
    - health_records: List<HealthData>
    - risk_assessments: List<RiskAssessment>
    - fast_tests: List<FASTTest>
    - shared_with: List<str>
    - messages_received: List<Message>
    - notifications: List<Notification>
    --
    + add_health_data(health_data)
    + get_latest_health_data(): HealthData
    + add_risk_assessment(assessment)
    + get_latest_risk_level(): RiskLevel
    + share_data_with(recipient_id, role)
    + perform_fast_test(fast_test): FASTTest
    + get_dashboard_data(): Dict
}

class Caregiver <<entity>> {
    - monitored_patients: List<str>
    - alerts_received: List<Alert>
    - messages_sent: List<Message>
    --
    + add_monitored_patient(patient_id)
    + send_encouragement_message(patient_id, message)
    + receive_alert(alert)
    + get_dashboard_data(): Dict
}

class Doctor <<entity>> {
    - specialty: str
    - assigned_patients: List<str>
    - consultation_notes: Dict<str, List<str>>
    - prescriptions: Dict<str, List<str>>
    --
    + add_patient(patient_id)
    + add_consultation_note(patient_id, note)
    + add_prescription(patient_id, prescription)
    + get_patient_panel(patients_data): List<Dict>
    + get_dashboard_data(): Dict
}

class Administrator <<entity>> {
    - managed_content: List<Dict>
    - alert_policies: Dict
    --
    + update_content(type, data)
    + update_alert_policy(key, value)
    + set_risk_threshold(level, threshold)
    + get_dashboard_data(): Dict
}

' ===== 건강 데이터 클래스 =====
class HealthData <<entity>> {
    - health_data_id: str
    - patient_id: str
    - timestamp: datetime
    - age: int
    - gender: str
    - hypertension: int
    - heart_disease: int
    - ever_married: str
    - work_type: str
    - residence_type: str
    - avg_glucose_level: float
    - bmi: float
    - smoking_status: str
    --
    + to_dict(): Dict
}

class RiskAssessment <<entity>> {
    - assessment_id: str
    - patient_id: str
    - health_data_id: str
    - timestamp: datetime
    - score: float
    - risk_level: RiskLevel
    - recommendations: List<str>
    --
    + add_recommendation(recommendation)
    + get_risk_color(): str
    + to_dict(): Dict
}

class FASTTest <<entity>> {
    - test_id: str
    - patient_id: str
    - timestamp: datetime
    - face_asymmetry: bool
    - arm_weakness: bool
    - speech_difficulty: bool
    - is_emergency: bool
    --
    + perform_test(face, arms, speech): bool
    + get_result(): Dict
}

' ===== 메시징 클래스 =====
class Message <<entity>> {
    - message_id: str
    - from_user_id: str
    - to_user_id: str
    - subject: str
    - content: str
    - message_type: str
    - timestamp: datetime
    - is_read: bool
    --
    + mark_as_read()
    + to_dict(): Dict
}

class Notification <<entity>> {
    - notification_id: str
    - user_id: str
    - title: str
    - message: str
    - notification_type: str
    - timestamp: datetime
    - is_read: bool
    --
    + mark_as_read()
    + to_dict(): Dict
}

class Alert <<entity>> {
    - alert_id: str
    - patient_id: str
    - recipient_id: str
    - alert_type: str
    - severity: str
    - message: str
    - timestamp: datetime
    - is_read: bool
    - is_acknowledged: bool
    --
    + acknowledge()
    + to_dict(): Dict
}

' ===== 서비스 클래스 =====
class RiskCalculator <<service>> {
    - weights: Dict
    --
    + calculate_risk_score(health_data): float
    + determine_risk_level(score): RiskLevel
    + generate_recommendations(health_data, risk_level): List<str>
    + assess_risk(patient, health_data): RiskAssessment
}

class DataAnalyzer <<service>> {
    --
    + {static} analyze_trend(health_records, metric): Dict
    + {static} detect_abnormal_indicators(health_data): List<str>
    + {static} generate_personal_report(patient): Dict
}

class NotificationService <<service>> {
    --
    + {static} send_reminder(patient, type, message): Notification
    + {static} send_high_risk_alert(patient, recipients): List<Alert>
    + {static} send_fast_emergency_alert(patient, fast_test, contact): Alert
    + {static} check_retest_due(patient, interval): bool
}

class SharingService <<service>> {
    --
    + {static} share_with_caregiver(patient, caregiver): bool
    + {static} share_with_doctor(patient, doctor): bool
    + {static} get_shared_data(patient, role): Dict
}

class MessageService <<service>> {
    --
    + {static} send_encouragement(sender, patient, subject, content): Message
    + {static} send_message(from_id, to_id, subject, content, type): Message
    + {static} get_unread_messages(messages): List<Message>
}

' ===== 열거형 =====
enum UserRole {
    PATIENT
    CAREGIVER
    DOCTOR
    ADMINISTRATOR
}

enum RiskLevel {
    LOW
    MEDIUM
    HIGH
}

' ===== 관계 =====
User <|-- Patient
User <|-- Caregiver
User <|-- Doctor
User <|-- Administrator

User --> UserRole

Patient "1" *-- "0..*" HealthData : has
Patient "1" *-- "0..*" RiskAssessment : has
Patient "1" *-- "0..*" FASTTest : has
Patient "1" *-- "0..*" Message : receives
Patient "1" *-- "0..*" Notification : has

Caregiver "1" *-- "0..*" Alert : receives
Caregiver "1" *-- "0..*" Message : sends

RiskAssessment --> RiskLevel
RiskAssessment --> HealthData : evaluates

RiskCalculator ..> Patient : uses
RiskCalculator ..> HealthData : analyzes
RiskCalculator ..> RiskAssessment : creates

DataAnalyzer ..> Patient : analyzes
DataAnalyzer ..> HealthData : uses

NotificationService ..> Patient : notifies
NotificationService ..> Notification : creates
NotificationService ..> Alert : creates

SharingService ..> Patient : shares
SharingService ..> Caregiver : shares with
SharingService ..> Doctor : shares with

MessageService ..> Message : creates
MessageService ..> Patient : sends to
MessageService ..> Caregiver : sends from

note top of User
    추상 기본 클래스
    모든 사용자 타입의 공통 속성
end note

note right of RiskCalculator
    위험도 계산 알고리즘:
    - 나이, 고혈압, 심장질환,
      혈당, BMI, 흡연 등 고려
    - 가중치 기반 점수 계산
end note

note bottom of Patient
    환자의 주요 기능:
    - 건강 데이터 입력
    - 위험도 평가 조회
    - FAST 검사
    - 데이터 공유
end note

@enduml
"""

# PlantUML 텍스트를 파일로 저장
with open('/workspaces/Stroke-Prediction-System-Copy/backend/class_diagram.puml', 'w', encoding='utf-8') as f:
    f.write(class_diagram.strip())

print("클래스 다이어그램이 생성되었습니다!")
print("파일: backend/class_diagram.puml")
print("\nPlantUML을 사용하여 이미지로 변환할 수 있습니다.")
print("온라인: https://www.plantuml.com/plantuml/uml/")
print("또는 VS Code PlantUML 확장을 사용하세요.")
