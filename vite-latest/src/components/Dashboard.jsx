import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

function Dashboard({ userResults }) {
  const navigate = useNavigate()
  const [localResults, setLocalResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)

  useEffect(() => {
    // localStorage에서 모든 평가 결과 불러오기
    const savedResults = localStorage.getItem('allResults')
    if (savedResults) {
      const results = JSON.parse(savedResults)
      setLocalResults(results)
      if (results.length > 0) {
        setSelectedResult(results[0])
      }
    } else if (userResults.length > 0) {
      // userResults가 있으면 그걸 사용하고 localStorage에 저장
      setLocalResults(userResults)
      localStorage.setItem('allResults', JSON.stringify(userResults))
      setSelectedResult(userResults[0])
    }
  }, [userResults])

  const handleResultClick = (result) => {
    setSelectedResult(result)
  }

  const handleDeleteResult = (id) => {
    const updated = localResults.filter(r => r.id !== id)
    setLocalResults(updated)
    localStorage.setItem('allResults', JSON.stringify(updated))
    if (selectedResult?.id === id) {
      setSelectedResult(updated.length > 0 ? updated[0] : null)
    }
  }

  const getRiskStats = () => {
    if (localResults.length === 0) return { high: 0, medium: 0, low: 0 }
    return {
      high: localResults.filter(r => r.riskLevel === 'High').length,
      medium: localResults.filter(r => r.riskLevel === 'Medium').length,
      low: localResults.filter(r => r.riskLevel === 'Low').length
    }
  }

  const stats = getRiskStats()
  const averageScore = localResults.length > 0 
    ? (localResults.reduce((sum, r) => sum + r.totalScore, 0) / localResults.length).toFixed(1)
    : 0

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📈 건강 대시보드</h1>
        <p>당신의 뇌졸중 위험도 평가 이력을 확인하세요</p>
      </div>

      {localResults.length === 0 ? (
        <div className="no-data">
          <h2>아직 평가 기록이 없습니다</h2>
          <p>입력 페이지에서 건강 정보를 입력하여 평가를 시작하세요</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            평가 시작하기
          </button>
        </div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>총 평가 횟수</h3>
              <p className="stat-value">{localResults.length}회</p>
            </div>
            <div className="stat-card">
              <h3>평균 점수</h3>
              <p className="stat-value">{averageScore}점</p>
            </div>
            <div className="stat-card low">
              <h3>저위험 (Low)</h3>
              <p className="stat-value">{stats.low}회</p>
            </div>
            <div className="stat-card medium">
              <h3>중등위험 (Medium)</h3>
              <p className="stat-value">{stats.medium}회</p>
            </div>
            <div className="stat-card high">
              <h3>고위험 (High)</h3>
              <p className="stat-value">{stats.high}회</p>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="results-list">
              <h2>평가 기록</h2>
              <div className="list-container">
                {localResults.map((result) => (
                  <div
                    key={result.id}
                    className={`result-item ${result.color} ${selectedResult?.id === result.id ? 'active' : ''}`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="item-header">
                      <span className={`badge ${result.color}`}>{result.riskLevel}</span>
                      <span className="item-score">{result.totalScore}점</span>
                    </div>
                    <div className="item-date">{result.timestamp}</div>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('이 평가 기록을 삭제하시겠습니까?')) {
                          handleDeleteResult(result.id)
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedResult && (
              <div className="result-detail">
                <h2>상세 정보</h2>
                <div className={`detail-card ${selectedResult.color}`}>
                  <div className="detail-header">
                    <h3 className={`detail-badge ${selectedResult.color}`}>
                      {selectedResult.riskLevel} ({selectedResult.stage})
                    </h3>
                    <span className="detail-score">{selectedResult.totalScore}점</span>
                  </div>

                  <p className="detail-message">{selectedResult.message}</p>

                  <div className="detail-info">
                    <h4>입력 정보</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">나이:</span>
                        <span className="info-value">{selectedResult.formData.age}세</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">혈당:</span>
                        <span className="info-value">{selectedResult.formData.avg_glucose_level} mg/dL</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">BMI:</span>
                        <span className="info-value">{selectedResult.formData.bmi}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">고혈압:</span>
                        <span className="info-value">
                          {selectedResult.formData.hypertension === '1' ? '있음' : '없음'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">심장질환:</span>
                        <span className="info-value">
                          {selectedResult.formData.heart_disease === '1' ? '있음' : '없음'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">흡연:</span>
                        <span className="info-value">
                          {selectedResult.formData.smoking_status === 'never smoked' && '비흡연'}
                          {selectedResult.formData.smoking_status === 'formerly smoked' && '과거 흡연'}
                          {selectedResult.formData.smoking_status === 'smokes' && '현재 흡연'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">평가 시간:</span>
                        <span className="info-value">{selectedResult.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              새로운 평가
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
