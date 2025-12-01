import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../styles/RoleDashboard.css'

function CaregiverDashboard({ currentUser }) {
  const navigate = useNavigate()
  const [sharedRecords, setSharedRecords] = useState([])
  const [messages, setMessages] = useState([])

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
          <button className="nav-item" onClick={() => navigate('/caregiver')}>
            <span>환자 목록</span>
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
            <h3>모니터링 현황</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{patientSummaries.length}</div>
                <div className="stat-label">담당 환자 수</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{sharedRecords.length}</div>
                <div className="stat-label">총 기록 수</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {patientSummaries.filter(p => p.riskLevel === 'High').length}
                </div>
                <div className="stat-label">고위험 환자</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card wide-card">
            <h3>환자 상태 요약</h3>
            {patientSummaries.length === 0 ? (
              <p className="empty-state">아직 공유된 환자 기록이 없습니다</p>
            ) : (
              <div className="patient-grid">
                {patientSummaries.map(record => (
                  <div key={record.id} className="patient-card">
                    <div className="patient-header">
                      <div className="patient-email">{record.patientEmail}</div>
                      <span className={`badge-small ${record.color}`}>{record.riskLevel}</span>
                    </div>
                    <div className="patient-info">
                      <div className="info-row">
                        <span>위험도 점수:</span>
                        <strong>{record.totalScore}점</strong>
                      </div>
                      <div className="info-row">
                        <span>최근 평가:</span>
                        <span>{record.timestamp}</span>
                      </div>
                      <div className="info-row">
                        <span>연령:</span>
                        <span>{record.formData?.age || 'N/A'}세</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="link-btn" onClick={() => navigate('/caregiver')}>
              상세 내역 보기
            </button>
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
    </div>
  )
}

export default CaregiverDashboard
