"""
Stroke Prediction System - Service Layer
비즈니스 로직 및 서비스 클래스

주요 서비스:
- RiskCalculator: 위험도 계산
- DataAnalyzer: 데이터 분석
- NotificationService: 알림 서비스
- SharingService: 데이터 공유 서비스
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from models import (
    Patient, Caregiver, Doctor, Administrator,
    HealthData, RiskAssessment, FASTTest,
    Message, Notification, Alert,
    RiskLevel, UserRole
)


class RiskCalculator:
    """
    위험도 계산 서비스
    건강 데이터를 기반으로 뇌졸중 위험도 계산
    """
    
    def __init__(self):
        # 위험 요인별 가중치
        self.weights = {
            'age': 0.15,
            'hypertension': 0.20,
            'heart_disease': 0.20,
            'glucose': 0.15,
            'bmi': 0.15,
            'smoking': 0.15
        }
    
    def calculate_risk_score(self, health_data: HealthData) -> float:
        """
        위험도 점수 계산 (0-100)
        """
        score = 0.0
        
        # 나이 점수 (나이가 높을수록 위험)
        age_score = min((health_data.age / 100) * 100, 100)
        score += age_score * self.weights['age']
        
        # 고혈압 점수
        hypertension_score = 100 if health_data.hypertension == 1 else 0
        score += hypertension_score * self.weights['hypertension']
        
        # 심장질환 점수
        heart_disease_score = 100 if health_data.heart_disease == 1 else 0
        score += heart_disease_score * self.weights['heart_disease']
        
        # 혈당 점수 (정상 범위: 70-100 mg/dL)
        if health_data.avg_glucose_level:
            if health_data.avg_glucose_level > 125:
                glucose_score = min(((health_data.avg_glucose_level - 125) / 175) * 100, 100)
            elif health_data.avg_glucose_level < 70:
                glucose_score = min(((70 - health_data.avg_glucose_level) / 70) * 100, 100)
            else:
                glucose_score = 0
            score += glucose_score * self.weights['glucose']
        
        # BMI 점수 (정상 범위: 18.5-24.9)
        if health_data.bmi:
            if health_data.bmi > 30:
                bmi_score = min(((health_data.bmi - 30) / 20) * 100, 100)
            elif health_data.bmi < 18.5:
                bmi_score = min(((18.5 - health_data.bmi) / 18.5) * 100, 100)
            else:
                bmi_score = 0
            score += bmi_score * self.weights['bmi']
        
        # 흡연 점수
        smoking_scores = {
            'never smoked': 0,
            'formerly smoked': 50,
            'smokes': 100
        }
        smoking_score = smoking_scores.get(health_data.smoking_status, 0)
        score += smoking_score * self.weights['smoking']
        
        return round(score, 2)
    
    def determine_risk_level(self, score: float) -> RiskLevel:
        """
        점수 기반 위험도 수준 결정
        """
        if score >= 70:
            return RiskLevel.HIGH
        elif score >= 40:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def generate_recommendations(self, health_data: HealthData, risk_level: RiskLevel) -> List[str]:
        """
        위험도 및 건강 데이터 기반 권장사항 생성
        """
        recommendations = []
        
        if risk_level == RiskLevel.HIGH:
            recommendations.append("🏥 즉시 의료 전문가 상담이 필요합니다")
            recommendations.append("혈압과 혈당을 정기적으로 모니터링하세요")
            recommendations.append("처방된 약을 정확히 복용하세요")
        elif risk_level == RiskLevel.MEDIUM:
            recommendations.append("⚠️ 정기적인 건강 관리가 필요합니다")
            recommendations.append("3개월마다 의료 전문가와 상담하세요")
            recommendations.append("주 3-4회 중등도 운동을 하세요")
        else:
            recommendations.append("✓ 현재 건강 상태를 유지하세요")
            recommendations.append("3-6개월마다 정기적으로 재평가하세요")
            recommendations.append("규칙적인 운동을 계속하세요")
        
        # 특정 위험 요인에 대한 맞춤 권장사항
        if health_data.hypertension == 1:
            recommendations.append("염분 섭취를 줄이세요")
        
        if health_data.avg_glucose_level and health_data.avg_glucose_level > 125:
            recommendations.append("당 섭취를 제한하고 혈당을 관리하세요")
        
        if health_data.bmi and health_data.bmi > 30:
            recommendations.append("체중 감량을 통해 BMI를 정상 범위로 낮추세요")
        
        if health_data.smoking_status == 'smokes':
            recommendations.append("금연을 시작하세요")
        
        return recommendations
    
    def assess_risk(self, patient: Patient, health_data: HealthData) -> RiskAssessment:
        """
        종합 위험도 평가 수행
        """
        # 위험도 점수 계산
        score = self.calculate_risk_score(health_data)
        
        # 위험도 수준 결정
        risk_level = self.determine_risk_level(score)
        
        # 위험도 평가 객체 생성
        assessment = RiskAssessment(patient.user_id, health_data, score, risk_level)
        
        # 권장사항 생성 및 추가
        recommendations = self.generate_recommendations(health_data, risk_level)
        for rec in recommendations:
            assessment.add_recommendation(rec)
        
        # 환자에게 평가 추가
        patient.add_risk_assessment(assessment)
        
        return assessment


class DataAnalyzer:
    """
    데이터 분석 서비스
    건강 데이터 트렌드 분석, 이상 지표 감지
    """
    
    @staticmethod
    def analyze_trend(health_records: List[HealthData], metric: str) -> Dict:
        """
        특정 지표의 트렌드 분석
        """
        if not health_records:
            return {'trend': 'no_data', 'change_rate': 0}
        
        values = []
        for record in health_records:
            value = getattr(record, metric, None)
            if value is not None:
                values.append(value)
        
        if len(values) < 2:
            return {'trend': 'insufficient_data', 'change_rate': 0}
        
        # 변화율 계산
        first_value = values[0]
        last_value = values[-1]
        change_rate = ((last_value - first_value) / first_value) * 100 if first_value != 0 else 0
        
        # 트렌드 결정
        if change_rate > 10:
            trend = 'increasing'
        elif change_rate < -10:
            trend = 'decreasing'
        else:
            trend = 'stable'
        
        return {
            'trend': trend,
            'change_rate': round(change_rate, 2),
            'first_value': first_value,
            'last_value': last_value,
            'data_points': len(values)
        }
    
    @staticmethod
    def detect_abnormal_indicators(health_data: HealthData) -> List[str]:
        """
        이상 지표 감지
        """
        abnormalities = []
        
        # 고혈압
        if health_data.hypertension == 1:
            abnormalities.append("고혈압")
        
        # 심장질환
        if health_data.heart_disease == 1:
            abnormalities.append("심장질환")
        
        # 혈당 이상
        if health_data.avg_glucose_level:
            if health_data.avg_glucose_level > 125:
                abnormalities.append(f"고혈당 ({health_data.avg_glucose_level} mg/dL)")
            elif health_data.avg_glucose_level < 70:
                abnormalities.append(f"저혈당 ({health_data.avg_glucose_level} mg/dL)")
        
        # BMI 이상
        if health_data.bmi:
            if health_data.bmi > 30:
                abnormalities.append(f"비만 (BMI {health_data.bmi})")
            elif health_data.bmi < 18.5:
                abnormalities.append(f"저체중 (BMI {health_data.bmi})")
        
        # 흡연
        if health_data.smoking_status == 'smokes':
            abnormalities.append("현재 흡연 중")
        
        return abnormalities
    
    @staticmethod
    def generate_personal_report(patient: Patient) -> Dict:
        """
        개인 리포트 생성
        최근 건강 변화, 주요 위험 요인, 개인 목표 포함
        """
        if not patient.health_records:
            return {'status': 'no_data'}
        
        latest_health_data = patient.get_latest_health_data()
        latest_risk = patient.get_latest_risk_level()
        
        # 트렌드 분석
        glucose_trend = DataAnalyzer.analyze_trend(patient.health_records, 'avg_glucose_level')
        bmi_trend = DataAnalyzer.analyze_trend(patient.health_records, 'bmi')
        
        # 이상 지표 감지
        abnormalities = DataAnalyzer.detect_abnormal_indicators(latest_health_data)
        
        return {
            'patient_id': patient.user_id,
            'report_date': datetime.now().isoformat(),
            'current_risk_level': latest_risk.value if latest_risk else 'Unknown',
            'total_assessments': len(patient.risk_assessments),
            'trends': {
                'glucose': glucose_trend,
                'bmi': bmi_trend
            },
            'abnormal_indicators': abnormalities,
            'goals': [
                '정기적인 건강 체크',
                '건강한 생활습관 유지',
                '위험 요인 관리'
            ]
        }


class NotificationService:
    """
    알림 서비스
    정기 검사 알림, 위험 알림, 일반 알림 관리
    """
    
    @staticmethod
    def send_reminder(patient: Patient, reminder_type: str, message: str) -> Notification:
        """
        정기 검사 알림 전송
        """
        notification = Notification(
            user_id=patient.user_id,
            title=f"{reminder_type} 알림",
            message=message,
            notification_type="reminder"
        )
        patient.notifications.append(notification)
        return notification
    
    @staticmethod
    def send_high_risk_alert(patient: Patient, recipients: List[tuple]) -> List[Alert]:
        """
        고위험 알림 전송 (보호자 및 의사에게)
        recipients: [(user_id, user_role), ...]
        """
        alerts = []
        
        for recipient_id, recipient_role in recipients:
            alert = Alert(
                patient_id=patient.user_id,
                recipient_id=recipient_id,
                alert_type="high_risk",
                severity="critical",
                message=f"환자 {patient.name}의 뇌졸중 위험도가 높음으로 평가되었습니다. 즉시 확인이 필요합니다."
            )
            alerts.append(alert)
        
        return alerts
    
    @staticmethod
    def send_fast_emergency_alert(patient: Patient, fast_test: FASTTest, emergency_contact: str) -> Alert:
        """
        FAST 검사 응급 알림
        """
        alert = Alert(
            patient_id=patient.user_id,
            recipient_id=emergency_contact,
            alert_type="emergency",
            severity="critical",
            message=f"응급 상황! 환자 {patient.name}의 FAST 검사 결과 이상 징후가 발견되었습니다. 즉시 119에 연락하세요!"
        )
        return alert
    
    @staticmethod
    def check_retest_due(patient: Patient, interval_days: int = 90) -> bool:
        """
        재검사 시기 확인
        """
        if not patient.health_records:
            return True
        
        latest_record = patient.get_latest_health_data()
        days_since_last = (datetime.now() - latest_record.timestamp).days
        
        return days_since_last >= interval_days


class SharingService:
    """
    데이터 공유 서비스
    환자 데이터를 보호자 또는 의사와 공유
    """
    
    @staticmethod
    def share_with_caregiver(patient: Patient, caregiver: Caregiver) -> bool:
        """
        보호자와 데이터 공유
        """
        # 환자가 보호자에게 공유
        patient.share_data_with(caregiver.user_id, UserRole.CAREGIVER)
        
        # 보호자가 환자를 모니터링 목록에 추가
        caregiver.add_monitored_patient(patient.user_id)
        
        # 알림 생성
        notification = Notification(
            user_id=caregiver.user_id,
            title="환자 데이터 공유",
            message=f"{patient.name}님이 건강 데이터를 공유했습니다.",
            notification_type="info"
        )
        
        return True
    
    @staticmethod
    def share_with_doctor(patient: Patient, doctor: Doctor) -> bool:
        """
        의사와 데이터 공유
        """
        # 환자가 의사에게 공유
        patient.share_data_with(doctor.user_id, UserRole.DOCTOR)
        
        # 의사가 환자를 담당 목록에 추가
        doctor.add_patient(patient.user_id)
        
        # 알림 생성
        notification = Notification(
            user_id=doctor.user_id,
            title="신규 환자 공유",
            message=f"{patient.name}님이 건강 데이터를 공유했습니다.",
            notification_type="info"
        )
        
        return True
    
    @staticmethod
    def get_shared_data(patient: Patient, recipient_role: UserRole) -> Dict:
        """
        공유된 데이터 조회
        """
        return {
            'patient_id': patient.user_id,
            'patient_name': patient.name,
            'patient_email': patient.email,
            'latest_health_data': patient.get_latest_health_data().to_dict() if patient.health_records else None,
            'latest_risk_level': patient.get_latest_risk_level().value if patient.get_latest_risk_level() else None,
            'total_records': len(patient.health_records),
            'shared_at': datetime.now().isoformat()
        }


class MessageService:
    """
    메시지 서비스
    응원 메시지 및 일반 메시지 관리
    """
    
    @staticmethod
    def send_encouragement(sender: Caregiver, patient: Patient, subject: str, content: str) -> Message:
        """
        보호자가 환자에게 응원 메시지 전송
        """
        message = Message(
            from_user_id=sender.user_id,
            to_user_id=patient.user_id,
            subject=subject,
            content=content,
            message_type="encouragement"
        )
        
        sender.send_encouragement_message(patient.user_id, message)
        patient.messages_received.append(message)
        
        return message
    
    @staticmethod
    def send_message(from_user_id: str, to_user_id: str, subject: str, content: str, 
                     message_type: str = "general") -> Message:
        """
        일반 메시지 전송
        """
        message = Message(
            from_user_id=from_user_id,
            to_user_id=to_user_id,
            subject=subject,
            content=content,
            message_type=message_type
        )
        
        return message
    
    @staticmethod
    def get_unread_messages(user_messages: List[Message]) -> List[Message]:
        """
        읽지 않은 메시지 조회
        """
        return [msg for msg in user_messages if not msg.is_read]
