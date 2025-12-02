"""
Stroke Prediction System - FastAPI Backend Server
백엔드 클래스를 활용한 REST API 서버

설계안의 클래스 구조를 기반으로 API 엔드포인트 제공
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
import sys
import os

# 백엔드 모듈 import를 위한 경로 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import (
    Patient, Caregiver, Doctor, Administrator,
    HealthData, FASTTest, UserRole, RiskLevel
)
from services import (
    RiskCalculator, DataAnalyzer,
    NotificationService, SharingService, MessageService
)

# FastAPI 앱 생성
app = FastAPI(
    title="Stroke Prediction System API",
    description="뇌졸중 예방 시스템 백엔드 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드와 통신을 위해)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# React 빌드 경로 설정
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "vite-latest", "dist"))
assets_path = os.path.join(dist_path, "assets")

# ===== 메모리 기반 데이터 저장소 (실제로는 DB 사용) =====
users_db: Dict[str, Patient | Caregiver | Doctor | Administrator] = {}
sessions_db: Dict[str, str] = {}  # session_id -> user_id

# 초기 테스트 사용자 생성
def init_test_users():
    """테스트용 초기 사용자 생성"""
    if not users_db:
        # 환자
        patient = Patient("P001", "patient@test.com", "김환자", "patient")
        users_db["patient@test.com"] = patient
        
        # 보호자
        caregiver = Caregiver("C001", "caregiver@test.com", "김보호", "caregiver")
        users_db["caregiver@test.com"] = caregiver
        
        # 의사
        doctor = Doctor("D001", "doctor@test.com", "이의사", "doctor", "신경과")
        users_db["doctor@test.com"] = doctor
        
        # 관리자
        admin = Administrator("A001", "admin@test.com", "관리자", "admin")
        users_db["admin@test.com"] = admin

init_test_users()

# ===== Pydantic 모델 (Request/Response) =====

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    user_id: str
    email: str
    name: str
    role: str
    session_id: str

class HealthDataRequest(BaseModel):
    age: int
    gender: str
    hypertension: int
    heart_disease: int
    ever_married: str
    work_type: str
    Residence_type: str
    avg_glucose_level: float
    bmi: float
    smoking_status: str

class RiskAssessmentResponse(BaseModel):
    assessment_id: str
    patient_id: str
    score: float
    risk_level: str
    risk_color: str
    recommendations: List[str]
    timestamp: str

class FASTTestRequest(BaseModel):
    face_asymmetry: bool
    arm_weakness: bool
    speech_difficulty: bool

class FASTTestResponse(BaseModel):
    test_id: str
    is_emergency: bool
    recommendation: str
    timestamp: str

class ShareDataRequest(BaseModel):
    recipient_email: EmailStr
    recipient_role: str  # "caregiver" or "doctor"

class MessageRequest(BaseModel):
    to_email: EmailStr
    subject: str
    content: str

# ===== API 엔드포인트 =====

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """사용자 로그인"""
    user = users_db.get(request.email)
    
    if not user or user.password != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 세션 생성
    session_id = f"session_{user.user_id}_{datetime.now().timestamp()}"
    sessions_db[session_id] = user.user_id
    
    # 로그인 처리
    user.login()
    
    return LoginResponse(
        success=True,
        user_id=user.user_id,
        email=user.email,
        name=user.name,
        role=user.role.value,
        session_id=session_id
    )

@app.post("/api/health-data", response_model=RiskAssessmentResponse)
async def submit_health_data(
    data: HealthDataRequest,
    session_id: str
):
    """건강 데이터 제출 및 위험도 평가"""
    # 세션 확인
    user_id = sessions_db.get(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # 환자 조회
    patient = None
    for user in users_db.values():
        if user.user_id == user_id and isinstance(user, Patient):
            patient = user
            break
    
    if not patient:
        raise HTTPException(status_code=403, detail="Only patients can submit health data")
    
    # 건강 데이터 생성
    health_data = HealthData(patient.user_id, data.dict())
    patient.add_health_data(health_data)
    
    # 위험도 평가
    calculator = RiskCalculator()
    assessment = calculator.assess_risk(patient, health_data)
    
    return RiskAssessmentResponse(
        assessment_id=assessment.assessment_id,
        patient_id=assessment.patient_id,
        score=assessment.score,
        risk_level=assessment.risk_level.value,
        risk_color=assessment.get_risk_color(),
        recommendations=assessment.recommendations,
        timestamp=assessment.timestamp.isoformat()
    )

@app.post("/api/fast-test", response_model=FASTTestResponse)
async def perform_fast_test(
    test_data: FASTTestRequest,
    session_id: str
):
    """FAST 검사 수행"""
    user_id = sessions_db.get(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    patient = None
    for user in users_db.values():
        if user.user_id == user_id and isinstance(user, Patient):
            patient = user
            break
    
    if not patient:
        raise HTTPException(status_code=403, detail="Only patients can perform FAST test")
    
    # FAST 검사 수행
    fast_test = FASTTest(patient.user_id)
    is_emergency = fast_test.perform_test(
        test_data.face_asymmetry,
        test_data.arm_weakness,
        test_data.speech_difficulty
    )
    patient.perform_fast_test(fast_test)
    
    # 응급 상황 시 알림 전송
    if is_emergency:
        # 공유된 보호자/의사에게 알림
        for shared_user_id in patient.shared_with:
            for user in users_db.values():
                if user.user_id == shared_user_id:
                    if isinstance(user, Caregiver):
                        alert = NotificationService.send_fast_emergency_alert(
                            patient, fast_test, user.user_id
                        )
                        user.receive_alert(alert)
    
    result = fast_test.get_result()
    return FASTTestResponse(
        test_id=result['test_id'],
        is_emergency=result['is_emergency'],
        recommendation=result['recommendation'],
        timestamp=result['timestamp']
    )

@app.post("/api/share")
async def share_data(
    request: ShareDataRequest,
    session_id: str
):
    """건강 데이터 공유"""
    user_id = sessions_db.get(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # 환자 조회
    patient = None
    for user in users_db.values():
        if user.user_id == user_id and isinstance(user, Patient):
            patient = user
            break
    
    if not patient:
        raise HTTPException(status_code=403, detail="Only patients can share data")
    
    # 수신자 조회
    recipient = users_db.get(request.recipient_email)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # 공유 처리
    if request.recipient_role == "caregiver" and isinstance(recipient, Caregiver):
        SharingService.share_with_caregiver(patient, recipient)
    elif request.recipient_role == "doctor" and isinstance(recipient, Doctor):
        SharingService.share_with_doctor(patient, recipient)
    else:
        raise HTTPException(status_code=400, detail="Invalid recipient role")
    
    return {"success": True, "message": f"Data shared with {recipient.name}"}

@app.post("/api/messages")
async def send_message(
    request: MessageRequest,
    session_id: str
):
    """메시지 전송"""
    user_id = sessions_db.get(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # 발신자 조회
    sender = None
    for user in users_db.values():
        if user.user_id == user_id:
            sender = user
            break
    
    # 수신자 조회
    recipient = users_db.get(request.to_email)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # 메시지 전송
    if isinstance(sender, Caregiver) and isinstance(recipient, Patient):
        message = MessageService.send_encouragement(
            sender, recipient, request.subject, request.content
        )
    else:
        message = MessageService.send_message(
            sender.user_id, recipient.user_id,
            request.subject, request.content
        )
    
    return {
        "success": True,
        "message_id": message.message_id,
        "timestamp": message.timestamp.isoformat()
    }

@app.get("/api/dashboard")
async def get_dashboard(session_id: str):
    """대시보드 데이터 조회"""
    user_id = sessions_db.get(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user = None
    for u in users_db.values():
        if u.user_id == user_id:
            user = u
            break
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get_dashboard_data()

@app.get("/api/patient/report")
async def get_patient_report(session_id: str):
    """환자 개인 리포트 조회"""
    user_id = sessions_db.get(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    patient = None
    for user in users_db.values():
        if user.user_id == user_id and isinstance(user, Patient):
            patient = user
            break
    
    if not patient:
        raise HTTPException(status_code=403, detail="Only patients can view reports")
    
    report = DataAnalyzer.generate_personal_report(patient)
    return report

@app.get("/api/doctor/patients")
async def get_doctor_patients(session_id: str):
    """의사의 담당 환자 목록 (위험도 순)"""
    user_id = sessions_db.get(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    doctor = None
    for user in users_db.values():
        if user.user_id == user_id and isinstance(user, Doctor):
            doctor = user
            break
    
    if not doctor:
        raise HTTPException(status_code=403, detail="Only doctors can view patient panel")
    
    # 담당 환자 정보 수집
    patients_data = []
    for patient_id in doctor.assigned_patients:
        for user in users_db.values():
            if user.user_id == patient_id and isinstance(user, Patient):
                risk_level = user.get_latest_risk_level()
                patients_data.append({
                    'patient_id': user.user_id,
                    'name': user.name,
                    'email': user.email,
                    'risk_level': risk_level.value if risk_level else 'Unknown',
                    'total_records': len(user.health_records)
                })
    
    # 위험도 순 정렬
    sorted_patients = doctor.get_patient_panel(patients_data)
    return {"patients": sorted_patients}

@app.get("/api/caregiver/monitored")
async def get_monitored_patients(session_id: str):
    """보호자가 모니터링하는 환자 목록"""
    user_id = sessions_db.get(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    caregiver = None
    for user in users_db.values():
        if user.user_id == user_id and isinstance(user, Caregiver):
            caregiver = user
            break
    
    if not caregiver:
        raise HTTPException(status_code=403, detail="Only caregivers can view monitored patients")
    
    # 모니터링 중인 환자 정보 수집
    patients_data = []
    for patient_id in caregiver.monitored_patients:
        for user in users_db.values():
            if user.user_id == patient_id and isinstance(user, Patient):
                shared_data = SharingService.get_shared_data(user, UserRole.CAREGIVER)
                patients_data.append(shared_data)
    
    return {"patients": patients_data}

@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "users_count": len(users_db),
        "sessions_count": len(sessions_db)
    }

# ===== React 정적 파일 서빙 =====
# /assets 경로는 정적 파일로 서빙
if os.path.exists(dist_path) and os.path.exists(assets_path):
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# 루트 경로 - React 앱의 index.html 반환
@app.get("/")
async def read_root():
    index_file = os.path.join(dist_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Stroke Prediction System API", "version": "1.0.0", "docs": "/docs"}

# SPA 라우팅 지원 - API가 아닌 모든 경로는 index.html 반환
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # API 경로나 docs 경로는 건너뜀
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404, detail="Not found")
    
    index_file = os.path.join(dist_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Not found")

# ===== 서버 실행 =====
if __name__ == "__main__":
    import uvicorn
    print("=" * 80)
    print("🏥 Stroke Prediction System API Server")
    print("=" * 80)
    print("Starting server at http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("React App: http://localhost:8000/")
    print("=" * 80)
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
