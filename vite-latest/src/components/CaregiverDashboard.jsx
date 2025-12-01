import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../styles/RoleDashboard.css'

function CaregiverDashboard({ currentUser }) {
  const navigate = useNavigate()
  const [sharedRecords, setSharedRecords] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'caregiver') {
      navigate('/login')
      return
    }

    // 공유된 환자 기록 로드
    const allShared = JSON.parse(localStorage.getItem('shared_records') || '[]')
    const caregiverRecords = allShared.filter(r => 
      r.recipientRole === 'caregiver' && r.recipientEmail === currentUser.email
    )
    setSharedRecords(caregiverRecords)

    // 메시지 로드
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]')
    const caregiverMessages = allMessages.filter(m => 
      m.to === currentUser.email || m.from === currentUser.email
    ).slice(0, 5)
    setMessages(caregiverMessages)
  }, [currentUser, navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser')
    window.location.href = '/Stroke-Prediction-System/login'
  }

  if (!currentUser) return null

  // 환자별 최신 기록만 추출
  const latestByPatient = {}
  sharedRecords.forEach(record => {
    const email = record.patientEmail
    if (!latestByPatient[email] || new Date(record.timestamp) > new Date(latestByPatient[email].timestamp)) {
      latestByPatient[email] = record
    }
  })
  const patientSummaries = Object.values(latestByPatient)

  return (
    <div className="role-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>보호자 포털</h2>
          <p className="user-info">{currentUser.name || currentUser.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate('/caregiver-dashboard')}>
            <span>대시보드</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/messages')}>
            <span>메시지</span>
          </button>
        </nav>

        <button className="btn-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <div className="dashboard-main">
        <div className="main-header">
          <h1>보호자 대시보드</h1>
          <p>담당 환자의 건강 상태를 모니터링하세요</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card stats-card">
            <h3>알림 현황</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{sharedRecords.length}</div>
                <div className="stat-label">공유받은 기록</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{messages.filter(m => !m.read && m.to === currentUser.email).length}</div>
                <div className="stat-label">읽지 않은 메시지</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {sharedRecords.filter(p => p.riskLevel === 'High').length}
                </div>
                <div className="stat-label">고위험 알림</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card wide-card">
            <h3>최근 공유받은 건강 기록</h3>
            {sharedRecords.length === 0 ? (
              <p className="empty-state">아직 공유된 환자 기록이 없습니다</p>
            ) : (
              <div className="records-list">
                {sharedRecords.slice(0, 5).map(record => (
                  <div 
                    key={record.id} 
                    className="record-item clickable"
                    onClick={() => setSelectedRecord(record)}
                    style={{cursor: 'pointer'}}
                  >
                    <div className="record-header">
                      <span className="record-time">{record.timestamp}</span>
                      <span className={`badge-small ${record.color}`}>{record.riskLevel}</span>
                    </div>
                    <div className="record-info">
                      <div className="info-row">
                        <span>위험도 점수:</span>
                        <strong>{record.totalScore}점</strong>
                      </div>
                      <div className="info-row">
                        <span>환자 상태:</span>
                        <span>{record.message}</span>
                      </div>
                    </div>
                    <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#667eea'}}>
                      클릭하여 상세보기 →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <h3>최근 메시지</h3>
            {messages.length === 0 ? (
              <p className="empty-state">메시지가 없습니다</p>
            ) : (
              <div className="messages-list-compact">
                {messages.map(msg => (
                  <div key={msg.id} className="message-compact">
                    <div className="message-header">
                      <span className="message-from">
                        {msg.from === currentUser.email ? '보냄' : '받음'}
                      </span>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                    <div className="message-subject">{msg.subject}</div>
                  </div>
                ))}
              </div>
            )}
            <button className="link-btn" onClick={() => navigate('/messages')}>
              전체 메시지 보기
            </button>
          </div>

          <div className="dashboard-card info-card">
            <h3>보호자 가이드</h3>
            <ul className="tips-list">
              <li>정기적으로 환자 상태를 확인하세요</li>
              <li>고위험 환자는 특별히 주의 깊게 관찰하세요</li>
              <li>이상 증상 발견 시 즉시 의료진에게 연락하세요</li>
              <li>환자와 지속적인 소통을 유지하세요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 상세 보기 모달 */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>건강 기록 상세 정보</h2>
              <button className="modal-close" onClick={() => setSelectedRecord(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>평가 결과</h3>
                <div className="result-summary">
                  <div className={`risk-badge ${selectedRecord.color}`}>
                    {selectedRecord.riskLevel} - {selectedRecord.stage}
                  </div>
                  <div className="score-info">
                    <span className="score-label">위험도 점수</span>
                    <span className="score-value">{selectedRecord.totalScore}점</span>
                  </div>
                  <p className="assessment-time">평가 시간: {selectedRecord.timestamp}</p>
                </div>
                <div className="status-message">
                  {selectedRecord.message}
                </div>
              </div>

              <div className="detail-section">
                <h3>건강 정보</h3>
                <div className="health-data-grid">
                  <div className="health-item">
                    <label>성별</label>
                    <value>
                      {selectedRecord.formData?.gender === 'Male' && '남성'}
                      {selectedRecord.formData?.gender === 'Female' && '여성'}
                      {selectedRecord.formData?.gender === 'Other' && '기타'}
                    </value>
                  </div>
                  <div className="health-item">
                    <label>나이</label>
                    <value>{selectedRecord.formData?.age || 'N/A'}세</value>
                  </div>
                  <div className="health-item">
                    <label>평균 혈당</label>
                    <value>{selectedRecord.formData?.avg_glucose_level || 'N/A'} mg/dL</value>
                  </div>
                  <div className="health-item">
                    <label>BMI</label>
                    <value>{selectedRecord.formData?.bmi || 'N/A'}</value>
                  </div>
                  <div className="health-item">
                    <label>고혈압</label>
                    <value>{selectedRecord.formData?.hypertension === '1' ? '있음' : '없음'}</value>
                  </div>
                  <div className="health-item">
                    <label>심장질환</label>
                    <value>{selectedRecord.formData?.heart_disease === '1' ? '있음' : '없음'}</value>
                  </div>
                  <div className="health-item">
                    <label>흡연 상태</label>
                    <value>
                      {selectedRecord.formData?.smoking_status === 'never smoked' && '비흡연'}
                      {selectedRecord.formData?.smoking_status === 'formerly smoked' && '과거 흡연'}
                      {selectedRecord.formData?.smoking_status === 'smokes' && '현재 흡연'}
                      {selectedRecord.formData?.smoking_status === 'Unknown' && '알 수 없음'}
                    </value>
                  </div>
                  <div className="health-item">
                    <label>직업</label>
                    <value>
                      {selectedRecord.formData?.work_type === 'Private' && '민간 회사'}
                      {selectedRecord.formData?.work_type === 'Govt_job' && '정부 기관'}
                      {selectedRecord.formData?.work_type === 'Self-employed' && '자영업'}
                      {selectedRecord.formData?.work_type === 'Never_worked' && '미취업'}
                      {selectedRecord.formData?.work_type === 'Children' && '어린이'}
                    </value>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>권장사항</h3>
                {selectedRecord.riskLevel === 'High' && (
                  <ul className="recommendations-list high">
                    <li>🏥 즉시 의료 전문가 상담이 필요합니다</li>
                    <li>혈압과 혈당을 정기적으로 모니터링하세요</li>
                    <li>처방된 약을 정확히 복용하세요</li>
                    <li>스트레스 관리와 충분한 수면을 취하세요</li>
                  </ul>
                )}
                {selectedRecord.riskLevel === 'Medium' && (
                  <ul className="recommendations-list medium">
                    <li>⚠️ 정기적인 건강 관리가 필요합니다</li>
                    <li>3개월마다 의료 전문가와 상담하세요</li>
                    <li>주 3-4회 중등도 운동을 하세요</li>
                    <li>염분 섭취를 줄이세요</li>
                  </ul>
                )}
                {selectedRecord.riskLevel === 'Low' && (
                  <ul className="recommendations-list low">
                    <li>✓ 현재 건강 상태를 유지하세요</li>
                    <li>3-6개월마다 정기적으로 재평가하세요</li>
                    <li>규칙적인 운동을 계속하세요</li>
                    <li>건강한 식단 습관을 유지하세요</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CaregiverDashboard
