import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ResultPage.css'

function FASTResult() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)

  useEffect(() => {
    const resultData = sessionStorage.getItem('fast_result')
    if (resultData) {
      setResult(JSON.parse(resultData))
    } else {
      navigate('/fast-test')
    }
  }, [navigate])

  const handleEmergencyCall = () => {
    alert('119에 연락하는 시뮬레이션입니다.\n\n실제 상황에서는 즉시 119에 전화하세요!')
    // 실제 구현: window.location.href = 'tel:119'
  }

  const handleBackToTest = () => {
    sessionStorage.removeItem('fast_result')
    navigate('/fast-test')
  }

  if (!result) {
    return <div>로딩 중...</div>
  }

  return (
    <div className="result-page-container">
      <div className="result-header">
        <h1>⚡ FAST 테스트 결과</h1>
        <p className="assessment-time">검사 시간: {result.timestamp}</p>
      </div>

      <div className="result-main">
        {result.emergency ? (
          <div className="result-card-large high">
            <div className="result-badge">
              <h2 className="risk-level-title" style={{color: '#dc2626'}}>🚨 긴급 상황</h2>
              <div className="large-badge high">
                뇌졸중 의심
              </div>
            </div>

            <div className="result-message" style={{fontSize: '1.1rem', fontWeight: 'bold', color: '#991b1b'}}>
              <p>FAST 테스트에서 뇌졸중 의심 증상이 발견되었습니다!</p>
              <p style={{marginTop: '0.5rem'}}>⏰ Time is Brain - 즉시 119에 연락하세요!</p>
            </div>

            <div style={{marginTop: '2rem', padding: '1.5rem', backgroundColor: '#fee', borderRadius: '8px', border: '2px solid #dc2626'}}>
              <h3 style={{color: '#991b1b', marginBottom: '1rem'}}>⚠️ 즉시 해야 할 일</h3>
              <ol style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
                <li><strong>119에 즉시 전화</strong>하여 뇌졸중 의심 증상을 알리세요</li>
                <li>환자를 안전한 곳에 눕히고 <strong>머리를 약간 높게</strong> 유지하세요</li>
                <li>구토 시 <strong>고개를 옆으로</strong> 돌려 기도 폐쇄를 방지하세요</li>
                <li><strong>음식이나 물을 주지 마세요</strong></li>
                <li>증상 발생 시각을 기억하고 119에 정확히 전달하세요</li>
              </ol>
              
              <button 
                className="btn btn-primary" 
                onClick={handleEmergencyCall}
                style={{
                  marginTop: '1.5rem', 
                  width: '100%', 
                  fontSize: '1.2rem', 
                  padding: '1rem',
                  backgroundColor: '#dc2626'
                }}
              >
                📞 119 긴급 연락 (시뮬레이션)
              </button>
            </div>
          </div>
        ) : (
          <div className="result-card-large low">
            <div className="result-badge">
              <h2 className="risk-level-title">✅ 정상</h2>
              <div className="large-badge low">
                이상 없음
              </div>
            </div>

            <div className="result-message">
              <p>FAST 테스트 결과, 현재 뇌졸중 의심 증상은 발견되지 않았습니다.</p>
              <p style={{marginTop: '0.5rem'}}>하지만 증상이 나타나면 즉시 병원을 방문하세요.</p>
            </div>

            <div style={{marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac'}}>
              <h3 style={{color: '#166534', marginBottom: '1rem'}}>💡 예방 수칙</h3>
              <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
                <li>정기적으로 혈압과 혈당을 체크하세요</li>
                <li>규칙적인 운동과 건강한 식단을 유지하세요</li>
                <li>금연하고 과도한 음주를 피하세요</li>
                <li>스트레스를 관리하고 충분히 휴식하세요</li>
                <li>정기적으로 건강검진을 받으세요</li>
              </ul>
            </div>
          </div>
        )}

        <div className="result-details">
          <h2>📋 테스트 상세 결과</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>얼굴 (Face)</label>
              <value style={{color: result.results.face === 'abnormal' ? '#dc2626' : '#16a34a'}}>
                {result.results.face === 'normal' ? '✅ 정상' : '⚠️ 이상'}
              </value>
            </div>
            <div className="detail-item">
              <label>팔 (Arms)</label>
              <value style={{color: result.results.arms === 'abnormal' ? '#dc2626' : '#16a34a'}}>
                {result.results.arms === 'normal' ? '✅ 정상' : '⚠️ 이상'}
              </value>
            </div>
            <div className="detail-item">
              <label>언어 (Speech)</label>
              <value style={{color: result.results.speech === 'abnormal' ? '#dc2626' : '#16a34a'}}>
                {result.results.speech === 'normal' ? '✅ 정상' : '⚠️ 이상'}
              </value>
            </div>
          </div>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={handleBackToTest}>
          새 테스트
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/patient-dashboard')}>
          대시보드로
        </button>
      </div>
    </div>
  )
}

export default FASTResult
