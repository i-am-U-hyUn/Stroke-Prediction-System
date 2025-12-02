"""
Stroke Prediction System - Demo
시스템 사용 예시 및 테스트

설계안에 따른 클래스 사용 예제
"""

from models import (
    Patient, Caregiver, Doctor, Administrator,
    HealthData, FASTTest, UserRole
)
from services import (
    RiskCalculator, DataAnalyzer,
    NotificationService, SharingService, MessageService
)


def demo_patient_workflow():
    """환자 워크플로우 데모"""
    print("="*60)
    print("1. 환자 워크플로우 데모")
    print("="*60)
    
    # 1. 환자 생성
    patient = Patient(
        user_id="P001",
        email="patient@test.com",
        name="김환자",
        password="patient123"
    )
    print(f"✓ 환자 생성: {patient.name} ({patient.email})")
    
    # 2. 건강 데이터 입력
    health_data_input = {
        'age': 65,
        'gender': 'Male',
        'hypertension': 1,
        'heart_disease': 0,
        'ever_married': 'Yes',
        'work_type': 'Private',
        'Residence_type': 'Urban',
        'avg_glucose_level': 150,
        'bmi': 28.5,
        'smoking_status': 'formerly smoked'
    }
    
    health_data = HealthData(patient.user_id, health_data_input)
    patient.add_health_data(health_data)
    print(f"✓ 건강 데이터 입력 완료")
    print(f"  - 나이: {health_data.age}세")
    print(f"  - 혈당: {health_data.avg_glucose_level} mg/dL")
    print(f"  - BMI: {health_data.bmi}")
    
    # 3. 위험도 평가
    calculator = RiskCalculator()
    assessment = calculator.assess_risk(patient, health_data)
    print(f"\n✓ 위험도 평가 완료")
    print(f"  - 점수: {assessment.score}점")
    print(f"  - 위험도: {assessment.risk_level.value}")
    print(f"  - 권장사항:")
    for rec in assessment.recommendations:
        print(f"    • {rec}")
    
    # 4. FAST 검사 수행
    fast_test = FASTTest(patient.user_id)
    is_emergency = fast_test.perform_test(face=False, arms=False, speech=False)
    patient.perform_fast_test(fast_test)
    print(f"\n✓ FAST 검사 완료")
    print(f"  - 응급 상황: {'예' if is_emergency else '아니오'}")
    
    # 5. 대시보드 데이터 조회
    dashboard = patient.get_dashboard_data()
    print(f"\n✓ 환자 대시보드:")
    print(f"  - 총 건강 기록: {dashboard['total_records']}개")
    print(f"  - 최신 위험도: {dashboard['latest_risk_level']}")
    
    return patient


def demo_caregiver_workflow(patient: Patient):
    """보호자 워크플로우 데모"""
    print("\n" + "="*60)
    print("2. 보호자 워크플로우 데모")
    print("="*60)
    
    # 1. 보호자 생성
    caregiver = Caregiver(
        user_id="C001",
        email="caregiver@test.com",
        name="김보호",
        password="caregiver123"
    )
    print(f"✓ 보호자 생성: {caregiver.name} ({caregiver.email})")
    
    # 2. 환자 데이터 공유
    SharingService.share_with_caregiver(patient, caregiver)
    print(f"✓ 환자 데이터 공유 완료")
    print(f"  - {patient.name} → {caregiver.name}")
    
    # 3. 응원 메시지 전송
    message = MessageService.send_encouragement(
        sender=caregiver,
        patient=patient,
        subject="힘내세요!",
        content="규칙적인 운동과 건강한 식단으로 건강을 관리하세요. 항상 응원합니다!"
    )
    print(f"\n✓ 응원 메시지 전송 완료")
    print(f"  - 제목: {message.subject}")
    print(f"  - 내용: {message.content}")
    
    # 4. 대시보드 데이터 조회
    dashboard = caregiver.get_dashboard_data()
    print(f"\n✓ 보호자 대시보드:")
    print(f"  - 모니터링 중인 환자: {dashboard['monitored_patients_count']}명")
    print(f"  - 전송한 메시지: {dashboard['messages_sent_count']}개")
    
    return caregiver


def demo_doctor_workflow(patient: Patient):
    """의사 워크플로우 데모"""
    print("\n" + "="*60)
    print("3. 의사 워크플로우 데모")
    print("="*60)
    
    # 1. 의사 생성
    doctor = Doctor(
        user_id="D001",
        email="doctor@test.com",
        name="이의사",
        password="doctor123",
        specialty="신경과"
    )
    print(f"✓ 의사 생성: {doctor.name} ({doctor.specialty})")
    
    # 2. 환자 데이터 공유
    SharingService.share_with_doctor(patient, doctor)
    print(f"✓ 환자 데이터 공유 완료")
    print(f"  - {patient.name} → {doctor.name}")
    
    # 3. 진단 메모 작성
    doctor.add_consultation_note(
        patient.user_id,
        "고혈압 및 고혈당 수치 확인됨. 정기적인 모니터링 필요."
    )
    print(f"\n✓ 진단 메모 작성 완료")
    
    # 4. 처방 메모 작성
    doctor.add_prescription(
        patient.user_id,
        "혈압약 1일 1회, 혈당약 1일 2회 복용. 3개월 후 재검사."
    )
    print(f"✓ 처방 메모 작성 완료")
    
    # 5. 환자 패널 조회
    patients_data = [
        {'patient_id': 'P001', 'name': '김환자', 'risk_level': 'Medium'},
        {'patient_id': 'P002', 'name': '박환자', 'risk_level': 'High'},
        {'patient_id': 'P003', 'name': '이환자', 'risk_level': 'Low'},
    ]
    sorted_panel = doctor.get_patient_panel(patients_data)
    print(f"\n✓ 환자 패널 (위험도 순 정렬):")
    for idx, p in enumerate(sorted_panel, 1):
        print(f"  {idx}. {p['name']} - {p['risk_level']}")
    
    # 6. 대시보드 데이터 조회
    dashboard = doctor.get_dashboard_data()
    print(f"\n✓ 의사 대시보드:")
    print(f"  - 총 환자 수: {dashboard['total_patients']}명")
    print(f"  - 진단 메모: {dashboard['consultation_notes_count']}개")
    print(f"  - 처방 기록: {dashboard['prescriptions_count']}개")
    
    return doctor


def demo_administrator_workflow():
    """관리자 워크플로우 데모"""
    print("\n" + "="*60)
    print("4. 관리자 워크플로우 데모")
    print("="*60)
    
    # 1. 관리자 생성
    admin = Administrator(
        user_id="A001",
        email="admin@test.com",
        name="관리자",
        password="admin123"
    )
    print(f"✓ 관리자 생성: {admin.name}")
    
    # 2. 콘텐츠 업데이트
    admin.update_content(
        content_type="lifestyle_guide",
        content_data={
            'title': '뇌졸중 예방 생활습관 가이드',
            'items': [
                '규칙적인 운동 (주 3-5회, 30분 이상)',
                '저염식, 저지방 식단',
                '금연 및 절주',
                '정기적인 건강 검진'
            ]
        }
    )
    print(f"✓ 생활습관 가이드 업데이트 완료")
    
    # 3. 위험 임계치 설정
    admin.set_risk_threshold('high', 75)
    admin.set_risk_threshold('medium', 45)
    print(f"\n✓ 위험 임계치 설정 완료")
    print(f"  - 고위험: 75점 이상")
    print(f"  - 중등위험: 45점 이상")
    
    # 4. 알림 정책 업데이트
    admin.update_alert_policy('retest_interval_days', 60)
    print(f"✓ 재검사 주기 업데이트: 60일")
    
    # 5. 대시보드 데이터 조회
    dashboard = admin.get_dashboard_data()
    print(f"\n✓ 관리자 대시보드:")
    print(f"  - 관리 콘텐츠: {dashboard['content_count']}개")
    print(f"  - 현재 정책: {dashboard['current_policies']}")
    
    return admin


def demo_data_analysis(patient: Patient):
    """데이터 분석 서비스 데모"""
    print("\n" + "="*60)
    print("5. 데이터 분석 서비스 데모")
    print("="*60)
    
    # 추가 건강 데이터 입력 (트렌드 분석용)
    for i in range(3):
        data = {
            'age': 65 + i,
            'gender': 'Male',
            'hypertension': 1,
            'heart_disease': 0,
            'ever_married': 'Yes',
            'work_type': 'Private',
            'Residence_type': 'Urban',
            'avg_glucose_level': 150 + (i * 5),
            'bmi': 28.5 - (i * 0.5),
            'smoking_status': 'formerly smoked'
        }
        health_data = HealthData(patient.user_id, data)
        patient.add_health_data(health_data)
    
    # 트렌드 분석
    glucose_trend = DataAnalyzer.analyze_trend(patient.health_records, 'avg_glucose_level')
    print(f"✓ 혈당 트렌드 분석:")
    print(f"  - 변화 추세: {glucose_trend['trend']}")
    print(f"  - 변화율: {glucose_trend['change_rate']}%")
    
    bmi_trend = DataAnalyzer.analyze_trend(patient.health_records, 'bmi')
    print(f"\n✓ BMI 트렌드 분석:")
    print(f"  - 변화 추세: {bmi_trend['trend']}")
    print(f"  - 변화율: {bmi_trend['change_rate']}%")
    
    # 이상 지표 감지
    latest_data = patient.get_latest_health_data()
    abnormalities = DataAnalyzer.detect_abnormal_indicators(latest_data)
    print(f"\n✓ 이상 지표 감지:")
    for abnorm in abnormalities:
        print(f"  ⚠ {abnorm}")
    
    # 개인 리포트 생성
    report = DataAnalyzer.generate_personal_report(patient)
    print(f"\n✓ 개인 리포트 생성 완료")
    print(f"  - 총 평가 횟수: {report['total_assessments']}회")
    print(f"  - 현재 위험도: {report['current_risk_level']}")


def demo_notification_service(patient: Patient, caregiver: Caregiver):
    """알림 서비스 데모"""
    print("\n" + "="*60)
    print("6. 알림 서비스 데모")
    print("="*60)
    
    # 정기 검사 알림
    NotificationService.send_reminder(
        patient,
        "정기 건강 검진",
        "3개월이 지났습니다. 건강 검진을 받으세요."
    )
    print(f"✓ 정기 검사 알림 전송 완료")
    
    # 고위험 알림
    alerts = NotificationService.send_high_risk_alert(
        patient,
        [(caregiver.user_id, UserRole.CAREGIVER)]
    )
    print(f"✓ 고위험 알림 전송 완료")
    print(f"  - 수신자: {len(alerts)}명")
    
    # FAST 응급 알림
    fast_test = FASTTest(patient.user_id)
    fast_test.perform_test(face=True, arms=True, speech=False)
    
    if fast_test.is_emergency:
        emergency_alert = NotificationService.send_fast_emergency_alert(
            patient,
            fast_test,
            caregiver.user_id
        )
        print(f"✓ FAST 응급 알림 전송 완료")
        print(f"  - 심각도: {emergency_alert.severity}")


def main():
    """메인 데모 실행"""
    print("\n" + "="*60)
    print("뇌졸중 예방 시스템 - 클래스 구조 데모")
    print("Stroke Prediction System - Class Structure Demo")
    print("="*60)
    
    # 1. 환자 워크플로우
    patient = demo_patient_workflow()
    
    # 2. 보호자 워크플로우
    caregiver = demo_caregiver_workflow(patient)
    
    # 3. 의사 워크플로우
    doctor = demo_doctor_workflow(patient)
    
    # 4. 관리자 워크플로우
    admin = demo_administrator_workflow()
    
    # 5. 데이터 분석 서비스
    demo_data_analysis(patient)
    
    # 6. 알림 서비스
    demo_notification_service(patient, caregiver)
    
    print("\n" + "="*60)
    print("데모 완료!")
    print("="*60)
    print("\n모든 클래스가 설계안에 따라 정상적으로 동작합니다.")
    print("- 모델 클래스: User, Patient, Caregiver, Doctor, Administrator")
    print("- 데이터 클래스: HealthData, RiskAssessment, FASTTest")
    print("- 메시징 클래스: Message, Notification, Alert")
    print("- 서비스 클래스: RiskCalculator, DataAnalyzer, NotificationService, SharingService")


if __name__ == "__main__":
    main()
