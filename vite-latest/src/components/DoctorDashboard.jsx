import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../styles/RoleDashboard.css'

function DoctorDashboard({ currentUser }) {
  const navigate = useNavigate()
  const [sharedRecords, setSharedRecords] = useState([])
  const [statistics, setStatistics] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  })

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'doctor') {
      navigate('/login')
      return
    }

    // 공유된 환자 기록 로드
    const allShared = JSON.parse(localStorage.getItem('shared_records') || '[]')
    const doctorRecords = allShared.filter(r => 
      r.recipientRole === 'doctor' && r.recipientEmail === currentUser.email
    )
    setSharedRecords(doctorRecords)

    // 통계 계산
    const stats = {
      total: doctorRecords.length,
      high: doctorRecords.filter(r => r.riskLevel === 'High').length,
      medium: doctorRecords.filter(r => r.riskLevel === 'Medium').length,
      low: doctorRecords.filter(r => r.riskLevel === 'Low').length
    }
    setStatistics(stats)
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

  // 고위험 환자 우선 정렬
  patientSummaries.sort((a, b) => {
    const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
  })

  return (
    <div className="role-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>의사 포털</h2>
          <p className="user-info">{currentUser.name || currentUser.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate('/doctor-dashboard')}>
            <span>대시보드</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/doctor')}>
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
          <h1>의사 대시보드</h1>
          <p>환자 건강 상태를 종합적으로 관리하세요</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card stats-card wide-card">
            <h3>환자 통계</h3>
            <div className="stats-grid">
              <div className="stat-item large">
                <div className="stat-value">{patientSummaries.length}</div>
                <div className="stat-label">총 환자 수</div>
              </div>
              <div className="stat-item high-risk">
                <div className="stat-value">{statistics.high}</div>
                <div className="stat-label">고위험</div>
              </div>
              <div className="stat-item medium-risk">
                <div className="stat-value">{statistics.medium}</div>
                <div className="stat-label">중등위험</div>
              </div>
              <div className="stat-item low-risk">
                <div className="stat-value">{statistics.low}</div>
                <div className="stat-label">저위험</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card wide-card">
            <h3>고위험 환자 우선순위</h3>
            {patientSummaries.length === 0 ? (
              <p className="empty-state">아직 공유된 환자 기록이 없습니다</p>
            ) : (
              <div className="patient-table">
                <table>
                  <thead>
                    <tr>
                      <th>환자</th>
                      <th>위험도</th>
                      <th>점수</th>
                      <th>연령</th>
                      <th>혈당</th>
                      <th>BMI</th>
                      <th>최근 평가</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientSummaries.slice(0, 10).map(record => (
                      <tr key={record.id} className={record.riskLevel === 'High' ? 'highlight-row' : ''}>
                        <td>{record.patientEmail}</td>
                        <td>
                          <span className={`badge-small ${record.color}`}>
                            {record.riskLevel}
                          </span>
                        </td>
                        <td><strong>{record.totalScore}</strong></td>
                        <td>{record.formData?.age || 'N/A'}</td>
                        <td>{record.formData?.avg_glucose_level || 'N/A'}</td>
                        <td>{record.formData?.bmi || 'N/A'}</td>
                        <td>{record.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button className="link-btn" onClick={() => navigate('/doctor')}>
              전체 환자 목록 보기
            </button>
          </div>

          <div className="dashboard-card">
            <h3>주의사항</h3>
            <div className="alerts-summary">
              <div className="alert-summary-item high">
                <div className="alert-count">{statistics.high}</div>
                <div className="alert-text">고위험 환자 즉시 확인 필요</div>
              </div>
              {statistics.medium > 0 && (
                <div className="alert-summary-item medium">
                  <div className="alert-count">{statistics.medium}</div>
                  <div className="alert-text">중등위험 환자 정기 모니터링</div>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card info-card">
            <h3>진료 가이드</h3>
            <ul className="tips-list">
              <li>고위험 환자는 우선적으로 진료 스케줄을 조정하세요</li>
              <li>위험 요인(혈압, 혈당, BMI)을 종합적으로 평가하세요</li>
              <li>환자별 맞춤 치료 계획을 수립하세요</li>
              <li>정기적인 추적 관찰을 권장하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
