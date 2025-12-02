"""
Stroke Prediction System - Model Classes
뇌졸중 예방 시스템 모델 클래스

설계 기반 Entity 클래스 정의:
- User (추상 기본 클래스)
- Patient, Caregiver, Doctor, Administrator (User 상속)
- HealthData, RiskAssessment, FASTTest
- Message, Notification, Alert
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Optional
from enum import Enum


class UserRole(Enum):
    """사용자 역할 열거형"""
    PATIENT = "patient"
    CAREGIVER = "caregiver"
    DOCTOR = "doctor"
    ADMINISTRATOR = "administrator"


class RiskLevel(Enum):
    """위험도 수준"""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class User(ABC):
    """
    사용자 추상 기본 클래스
    모든 사용자 타입의 공통 속성과 메서드 정의
    """
    
    def __init__(self, user_id: str, email: str, name: str, password: str, role: UserRole):
        self.user_id = user_id
        self.email = email
        self.name = name
        self.password = password
        self.role = role
        self.created_at = datetime.now()
        self.last_login = None
    
    @abstractmethod
    def get_dashboard_data(self) -> Dict:
        """각 사용자 타입별 대시보드 데이터 반환"""
        pass
    
    def login(self):
        """로그인 처리"""
        self.last_login = datetime.now()
        return True
    
    def logout(self):
        """로그아웃 처리"""
        return True
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return {
            'user_id': self.user_id,
            'email': self.email,
            'name': self.name,
            'role': self.role.value,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class Patient(User):
    """
    환자 클래스
    건강 데이터 입력, 위험도 평가, FAST 검사, 개인 리포트 기능
    """
    
    def __init__(self, user_id: str, email: str, name: str, password: str):
        super().__init__(user_id, email, name, password, UserRole.PATIENT)
        self.health_records: List['HealthData'] = []
        self.risk_assessments: List['RiskAssessment'] = []
        self.fast_tests: List['FASTTest'] = []
        self.shared_with: List[str] = []  # 공유 대상 user_id 리스트
        self.messages_received: List['Message'] = []
        self.notifications: List['Notification'] = []
    
    def add_health_data(self, health_data: 'HealthData'):
        """건강 데이터 추가"""
        self.health_records.append(health_data)
    
    def get_latest_health_data(self) -> Optional['HealthData']:
        """최신 건강 데이터 조회"""
        return self.health_records[-1] if self.health_records else None
    
    def add_risk_assessment(self, assessment: 'RiskAssessment'):
        """위험도 평가 추가"""
        self.risk_assessments.append(assessment)
    
    def get_latest_risk_level(self) -> Optional[RiskLevel]:
        """최신 위험도 조회"""
        if self.risk_assessments:
            return self.risk_assessments[-1].risk_level
        return None
    
    def share_data_with(self, recipient_id: str, recipient_role: UserRole):
        """데이터 공유"""
        if recipient_id not in self.shared_with:
            self.shared_with.append(recipient_id)
        return True
    
    def perform_fast_test(self, fast_test: 'FASTTest'):
        """FAST 검사 수행"""
        self.fast_tests.append(fast_test)
        return fast_test
    
    def get_dashboard_data(self) -> Dict:
        """환자 대시보드 데이터"""
        return {
            'user_info': self.to_dict(),
            'total_records': len(self.health_records),
            'latest_risk_level': self.get_latest_risk_level().value if self.get_latest_risk_level() else None,
            'unread_messages': len([m for m in self.messages_received if not m.is_read]),
            'shared_count': len(self.shared_with)
        }


class Caregiver(User):
    """
    보호자 클래스
    공유된 환자 데이터 모니터링, 위험 알림 수신, 응원 메시지 전송
    """
    
    def __init__(self, user_id: str, email: str, name: str, password: str):
        super().__init__(user_id, email, name, password, UserRole.CAREGIVER)
        self.monitored_patients: List[str] = []  # 모니터링 중인 환자 user_id
        self.alerts_received: List['Alert'] = []
        self.messages_sent: List['Message'] = []
    
    def add_monitored_patient(self, patient_id: str):
        """모니터링 환자 추가"""
        if patient_id not in self.monitored_patients:
            self.monitored_patients.append(patient_id)
        return True
    
    def send_encouragement_message(self, patient_id: str, message: 'Message'):
        """응원 메시지 전송"""
        self.messages_sent.append(message)
        return True
    
    def receive_alert(self, alert: 'Alert'):
        """위험 알림 수신"""
        self.alerts_received.append(alert)
    
    def get_dashboard_data(self) -> Dict:
        """보호자 대시보드 데이터"""
        return {
            'user_info': self.to_dict(),
            'monitored_patients_count': len(self.monitored_patients),
            'unread_alerts': len([a for a in self.alerts_received if not a.is_read]),
            'messages_sent_count': len(self.messages_sent)
        }


class Doctor(User):
    """
    의사 클래스
    환자 패널 관리, 위험도 순 정렬, 진단 메모, 처방 메모 작성
    """
    
    def __init__(self, user_id: str, email: str, name: str, password: str, specialty: str = ""):
        super().__init__(user_id, email, name, password, UserRole.DOCTOR)
        self.specialty = specialty
        self.assigned_patients: List[str] = []  # 담당 환자 user_id
        self.consultation_notes: Dict[str, List[str]] = {}  # {patient_id: [notes]}
        self.prescriptions: Dict[str, List[str]] = {}  # {patient_id: [prescriptions]}
    
    def add_patient(self, patient_id: str):
        """담당 환자 추가"""
        if patient_id not in self.assigned_patients:
            self.assigned_patients.append(patient_id)
        return True
    
    def add_consultation_note(self, patient_id: str, note: str):
        """진단 메모 추가"""
        if patient_id not in self.consultation_notes:
            self.consultation_notes[patient_id] = []
        self.consultation_notes[patient_id].append({
            'note': note,
            'timestamp': datetime.now().isoformat()
        })
        return True
    
    def add_prescription(self, patient_id: str, prescription: str):
        """처방 메모 추가"""
        if patient_id not in self.prescriptions:
            self.prescriptions[patient_id] = []
        self.prescriptions[patient_id].append({
            'prescription': prescription,
            'timestamp': datetime.now().isoformat()
        })
        return True
    
    def get_patient_panel(self, patients_data: List[Dict]) -> List[Dict]:
        """환자 패널 조회 (위험도 순 정렬)"""
        # 위험도 우선순위: High > Medium > Low
        risk_priority = {'High': 0, 'Medium': 1, 'Low': 2}
        sorted_patients = sorted(
            patients_data, 
            key=lambda x: risk_priority.get(x.get('risk_level', 'Low'), 3)
        )
        return sorted_patients
    
    def get_dashboard_data(self) -> Dict:
        """의사 대시보드 데이터"""
        return {
            'user_info': self.to_dict(),
            'specialty': self.specialty,
            'total_patients': len(self.assigned_patients),
            'consultation_notes_count': sum(len(notes) for notes in self.consultation_notes.values()),
            'prescriptions_count': sum(len(presc) for presc in self.prescriptions.values())
        }


class Administrator(User):
    """
    관리자 클래스
    시스템 콘텐츠 관리, 알림 정책 설정, 위험 임계치 관리
    """
    
    def __init__(self, user_id: str, email: str, name: str, password: str):
        super().__init__(user_id, email, name, password, UserRole.ADMINISTRATOR)
        self.managed_content: List[Dict] = []
        self.alert_policies: Dict = {
            'risk_thresholds': {
                'high': 70,
                'medium': 40
            },
            'retest_interval_days': 90,
            'warning_accumulation_threshold': 3
        }
    
    def update_content(self, content_type: str, content_data: Dict):
        """콘텐츠 업데이트 (생활습관 가이드, 체크리스트, 교육자료)"""
        self.managed_content.append({
            'type': content_type,
            'data': content_data,
            'updated_at': datetime.now().isoformat()
        })
        return True
    
    def update_alert_policy(self, policy_key: str, policy_value):
        """알림 정책 업데이트"""
        if policy_key in self.alert_policies:
            self.alert_policies[policy_key] = policy_value
            return True
        return False
    
    def set_risk_threshold(self, level: str, threshold: int):
        """위험 임계치 설정"""
        if level in ['high', 'medium']:
            self.alert_policies['risk_thresholds'][level] = threshold
            return True
        return False
    
    def get_dashboard_data(self) -> Dict:
        """관리자 대시보드 데이터"""
        return {
            'user_info': self.to_dict(),
            'content_count': len(self.managed_content),
            'current_policies': self.alert_policies
        }


# ===== 건강 데이터 관련 클래스 =====

class HealthData:
    """
    건강 데이터 클래스
    환자의 건강 정보 저장 (혈압, 혈당, 흡연, 음주, 활동량 등)
    """
    
    def __init__(self, patient_id: str, data: Dict):
        self.health_data_id = f"HD_{patient_id}_{datetime.now().timestamp()}"
        self.patient_id = patient_id
        self.timestamp = datetime.now()
        
        # 건강 데이터 필드
        self.age = data.get('age')
        self.gender = data.get('gender')
        self.hypertension = data.get('hypertension', 0)
        self.heart_disease = data.get('heart_disease', 0)
        self.ever_married = data.get('ever_married')
        self.work_type = data.get('work_type')
        self.residence_type = data.get('Residence_type')
        self.avg_glucose_level = data.get('avg_glucose_level')
        self.bmi = data.get('bmi')
        self.smoking_status = data.get('smoking_status')
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return {
            'health_data_id': self.health_data_id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat(),
            'age': self.age,
            'gender': self.gender,
            'hypertension': self.hypertension,
            'heart_disease': self.heart_disease,
            'ever_married': self.ever_married,
            'work_type': self.work_type,
            'residence_type': self.residence_type,
            'avg_glucose_level': self.avg_glucose_level,
            'bmi': self.bmi,
            'smoking_status': self.smoking_status
        }


class RiskAssessment:
    """
    위험도 평가 클래스
    건강 데이터 기반으로 뇌졸중 위험도 계산 및 저장
    """
    
    def __init__(self, patient_id: str, health_data: HealthData, score: float, risk_level: RiskLevel):
        self.assessment_id = f"RA_{patient_id}_{datetime.now().timestamp()}"
        self.patient_id = patient_id
        self.health_data_id = health_data.health_data_id
        self.timestamp = datetime.now()
        self.score = score
        self.risk_level = risk_level
        self.recommendations: List[str] = []
    
    def add_recommendation(self, recommendation: str):
        """권장사항 추가"""
        self.recommendations.append(recommendation)
    
    def get_risk_color(self) -> str:
        """위험도 색상 반환"""
        color_map = {
            RiskLevel.LOW: 'green',
            RiskLevel.MEDIUM: 'yellow',
            RiskLevel.HIGH: 'red'
        }
        return color_map.get(self.risk_level, 'gray')
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return {
            'assessment_id': self.assessment_id,
            'patient_id': self.patient_id,
            'health_data_id': self.health_data_id,
            'timestamp': self.timestamp.isoformat(),
            'score': self.score,
            'risk_level': self.risk_level.value,
            'risk_color': self.get_risk_color(),
            'recommendations': self.recommendations
        }


class FASTTest:
    """
    FAST 검사 클래스
    Face(얼굴), Arms(팔), Speech(언어), Time(시간) 검사
    """
    
    def __init__(self, patient_id: str):
        self.test_id = f"FAST_{patient_id}_{datetime.now().timestamp()}"
        self.patient_id = patient_id
        self.timestamp = datetime.now()
        self.face_asymmetry = False  # 얼굴 비대칭
        self.arm_weakness = False  # 팔 약화
        self.speech_difficulty = False  # 언어 장애
        self.is_emergency = False
    
    def perform_test(self, face: bool, arms: bool, speech: bool):
        """FAST 검사 수행"""
        self.face_asymmetry = face
        self.arm_weakness = arms
        self.speech_difficulty = speech
        
        # 하나라도 True면 응급 상황
        self.is_emergency = face or arms or speech
        return self.is_emergency
    
    def get_result(self) -> Dict:
        """검사 결과 반환"""
        return {
            'test_id': self.test_id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat(),
            'face_asymmetry': self.face_asymmetry,
            'arm_weakness': self.arm_weakness,
            'speech_difficulty': self.speech_difficulty,
            'is_emergency': self.is_emergency,
            'recommendation': '즉시 119에 연락하세요!' if self.is_emergency else '정상 범위입니다.'
        }


# ===== 메시지 및 알림 클래스 =====

class Message:
    """
    메시지 클래스
    사용자 간 응원 메시지 및 일반 메시지
    """
    
    def __init__(self, from_user_id: str, to_user_id: str, subject: str, content: str, 
                 message_type: str = "encouragement"):
        self.message_id = f"MSG_{datetime.now().timestamp()}"
        self.from_user_id = from_user_id
        self.to_user_id = to_user_id
        self.subject = subject
        self.content = content
        self.message_type = message_type  # encouragement, notification, general
        self.timestamp = datetime.now()
        self.is_read = False
    
    def mark_as_read(self):
        """읽음 처리"""
        self.is_read = True
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return {
            'message_id': self.message_id,
            'from': self.from_user_id,
            'to': self.to_user_id,
            'subject': self.subject,
            'content': self.content,
            'type': self.message_type,
            'timestamp': self.timestamp.isoformat(),
            'is_read': self.is_read
        }


class Notification:
    """
    알림 클래스
    정기 검사 알림, 일반 알림
    """
    
    def __init__(self, user_id: str, title: str, message: str, notification_type: str = "reminder"):
        self.notification_id = f"NOTIF_{datetime.now().timestamp()}"
        self.user_id = user_id
        self.title = title
        self.message = message
        self.notification_type = notification_type  # reminder, info, system
        self.timestamp = datetime.now()
        self.is_read = False
    
    def mark_as_read(self):
        """읽음 처리"""
        self.is_read = True
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return {
            'notification_id': self.notification_id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.notification_type,
            'timestamp': self.timestamp.isoformat(),
            'is_read': self.is_read
        }


class Alert:
    """
    경고 알림 클래스
    고위험 상황 발생 시 보호자/의사에게 전송되는 긴급 알림
    """
    
    def __init__(self, patient_id: str, recipient_id: str, alert_type: str, severity: str, message: str):
        self.alert_id = f"ALERT_{datetime.now().timestamp()}"
        self.patient_id = patient_id
        self.recipient_id = recipient_id
        self.alert_type = alert_type  # high_risk, emergency, abnormal_indicator
        self.severity = severity  # critical, high, medium
        self.message = message
        self.timestamp = datetime.now()
        self.is_read = False
        self.is_acknowledged = False
    
    def acknowledge(self):
        """경고 확인 처리"""
        self.is_acknowledged = True
        self.is_read = True
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return {
            'alert_id': self.alert_id,
            'patient_id': self.patient_id,
            'recipient_id': self.recipient_id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'message': self.message,
            'timestamp': self.timestamp.isoformat(),
            'is_read': self.is_read,
            'is_acknowledged': self.is_acknowledged
        }
