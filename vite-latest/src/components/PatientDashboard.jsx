import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../styles/RoleDashboard.css'

function PatientDashboard({ currentUser }) {
  const navigate = useNavigate()
  const [recentResults, setRecentResults] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'patient') {
      navigate('/login')
      return
    }

    // 최근 평가 결과 로드
    const allResults = JSON.parse(localStorage.getItem('allResults') || '[]')
    const userResults = allResults.filter(r => r.patientEmail === currentUser.email).slice(0, 3)
    setRecentResults(userResults)

    // 알림 로드
    const allAlerts = JSON.parse(localStorage.getItem('alerts') || '[]')
    const userAlerts = allAlerts.filter(a => a.patientEmail === currentUser.email).slice(0, 5)
    setAlerts(userAlerts)
  }, [currentUser, navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser')
    window.location.href = '/Stroke-Prediction-System/login'
  }

  if (!currentUser) return null

  return (
    <div className="role-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>환자 포털</h2>
          <p className="user-info">{currentUser.name || currentUser.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate('/patient-dashboard')}>
            <span>대시보드</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/')}>
            <span>건강 평가</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/fast-test')}>
            <span>FAST 테스트</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/diet')}>
            <span>식이 권장</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/messages')}>
            <span>메시지</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span>이력 조회</span>
          </button>
        </nav>

        <button className="btn-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <div className="dashboard-main">
        <div className="main-header">
          <h1>환자 대시보드</h1>
          <p>건강 상태를 모니터링하고 관리하세요</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>빠른 액션</h3>
            <div className="action-buttons">
              <button className="action-btn primary" onClick={() => navigate('/')}>
                새로운 건강 평가
              </button>
              <button className="action-btn secondary" onClick={() => navigate('/fast-test')}>
                FAST 테스트 실행
              </button>
              <button className="action-btn tertiary" onClick={() => navigate('/diet')}>
                식단 추천 보기
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>최근 평가 결과</h3>
            {recentResults.length === 0 ? (
              <p className="empty-state">아직 평가 기록이 없습니다</p>
            ) : (
              <div className="results-list-compact">
                {recentResults.map(result => (
                  <div key={result.id} className={`result-compact ${result.color}`}>
                    <div className="result-info">
                      <span className={`badge-small ${result.color}`}>{result.riskLevel}</span>
                      <span className="result-score">{result.totalScore}점</span>
                    </div>
                    <div className="result-date">{result.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
            <button className="link-btn" onClick={() => navigate('/dashboard')}>
              전체 이력 보기
            </button>
          </div>

          <div className="dashboard-card">
            <h3>알림</h3>
            {alerts.length === 0 ? (
              <p className="empty-state">새 알림이 없습니다</p>
            ) : (
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-header">
                      <span className="alert-type">{alert.type}</span>
                      <span className="alert-time">{alert.timestamp}</span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card info-card">
            <h3>건강 관리 팁</h3>
            <ul className="tips-list">
              <li>규칙적인 혈압 체크를 하세요</li>
              <li>균형 잡힌 식사와 충분한 수면을 취하세요</li>
              <li>스트레스를 관리하고 규칙적인 운동을 하세요</li>
              <li>이상 증상 발견 시 즉시 의료진과 상담하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
