import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ResultPage.css'

function ResultPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)

  useEffect(() => {
    const resultData = sessionStorage.getItem('currentResult')
    if (resultData) {
      setResult(JSON.parse(resultData))
    } else {
      // 결과 데이터가 없으면 입력 페이지로 돌아가기
      navigate('/')
    }
  }, [navigate])

  const handleNewAssessment = () => {
    sessionStorage.removeItem('currentResult')
    navigate('/')
  }

  const handleViewDashboard = () => {
    navigate('/dashboard')
  }

  if (!result) {
    return <div>로딩 중...</div>
  }

  return (
    <div className="result-page-container">
      <div className="result-header">
        <h1>📊 뇌졸중 위험도 평가 결과</h1>
        <p className="assessment-time">평가 시간: {result.timestamp}</p>
      </div>

      <div className="result-main">
        <div className={`result-card-large ${result.color}`}>
          <div className="result-badge">
            <h2 className="risk-level-title">당신의 위험도 등급</h2>
            <div className={`large-badge ${result.color}`}>
              {result.riskLevel}
              <span className="stage-label">{result.stage}</span>
            </div>
            <div className="score-display">
              <span className="score-number">{result.totalScore}</span>
              <span className="score-label">점</span>
            </div>
          </div>

          <div className="result-message">
            <p>{result.message}</p>
          </div>

          <div className="score-guide">
            <h3>등급 범위</h3>
            <div className="guide-items">
              <div className="guide-item low">
                <strong>0–4점:</strong> Low (1단계) - 저위험군
              </div>
              <div className="guide-item medium">
                <strong>5–8점:</strong> Medium (2단계) - 중등위험군
              </div>
              <div className="guide-item high">
                <strong>≥9점:</strong> High (3단계) - 고위험군
              </div>
            </div>
          </div>
        </div>

        <div className="result-details">
          <h2>📋 입력하신 건강 정보</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>성별</label>
              <value>{result.formData.gender === 'Male' ? '남성' : '여성'}</value>
            </div>
            <div className="detail-item">
              <label>나이</label>
              <value>{result.formData.age}세</value>
            </div>
            <div className="detail-item">
              <label>평균 혈당 수치</label>
              <value>{result.formData.avg_glucose_level} mg/dL</value>
            </div>
            <div className="detail-item">
              <label>BMI</label>
              <value>{result.formData.bmi}</value>
            </div>
            <div className="detail-item">
              <label>고혈압</label>
              <value>{result.formData.hypertension === '1' ? '있음' : '없음'}</value>
            </div>
            <div className="detail-item">
              <label>심장질환</label>
              <value>{result.formData.heart_disease === '1' ? '있음' : '없음'}</value>
            </div>
            <div className="detail-item">
              <label>직업</label>
              <value>
                {result.formData.work_type === 'Private' && '민간 회사'}
                {result.formData.work_type === 'Govt_job' && '정부 기관'}
                {result.formData.work_type === 'Self-employed' && '자영업'}
                {result.formData.work_type === 'Never_worked' && '미취업'}
                {result.formData.work_type === 'Children' && '어린이'}
              </value>
            </div>
            <div className="detail-item">
              <label>흡연 상태</label>
              <value>
                {result.formData.smoking_status === 'never smoked' && '비흡연'}
                {result.formData.smoking_status === 'formerly smoked' && '과거 흡연'}
                {result.formData.smoking_status === 'smokes' && '현재 흡연'}
                {result.formData.smoking_status === 'Unknown' && '알 수 없음'}
              </value>
            </div>
          </div>
        </div>

        <div className="recommendations">
          <h2>💡 권장사항</h2>
          {result.riskLevel === 'High' && (
            <div className="recommendation-list high">
              <p>🏥 <strong>즉시 의료 전문가 상담이 필요합니다.</strong></p>
              <ul>
                <li>신경과 또는 심장내과 의사의 진찰을 받으세요</li>
                <li>혈압과 혈당을 정기적으로 모니터링하세요</li>
                <li>처방된 약을 정확히 복용하세요</li>
                <li>스트레스 관리와 충분한 수면을 취하세요</li>
                <li>정기적인 운동과 건강한 식단을 유지하세요</li>
              </ul>
            </div>
          )}
          {result.riskLevel === 'Medium' && (
            <div className="recommendation-list medium">
              <p>⚠️ <strong>정기적인 건강 관리가 필요합니다.</strong></p>
              <ul>
                <li>3개월마다 의료 전문가와 상담하세요</li>
                <li>혈압과 혈당을 주 1-2회 확인하세요</li>
                <li>주 3-4회 중등도 운동을 하세요</li>
                <li>염분 섭취를 줄이세요</li>
                <li>알코올 섭취를 제한하세요</li>
              </ul>
            </div>
          )}
          {result.riskLevel === 'Low' && (
            <div className="recommendation-list low">
              <p>✓ <strong>현재 건강 상태를 유지하세요.</strong></p>
              <ul>
                <li>3-6개월마다 정기적으로 재평가하세요</li>
                <li>주 3-5회 규칙적인 운동을 계속하세요</li>
                <li>건강한 식단 습관을 유지하세요</li>
                <li>스트레스를 효과적으로 관리하세요</li>
                <li>충분한 수면(7-9시간)을 취하세요</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={handleNewAssessment}>
          새로운 평가
        </button>
        <button className="btn btn-secondary" onClick={handleViewDashboard}>
          대시보드 보기
        </button>
      </div>
    </div>
  )
}

export default ResultPage
