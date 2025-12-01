import { useState, useEffect } from 'react'
import '../styles/Dashboard.css'

function DietRecommendation({ currentUser }) {
  const [healthData, setHealthData] = useState(null)
  const [recommendations, setRecommendations] = useState(null)

  useEffect(() => {
    loadLatestHealthData()
  }, [currentUser])

  const loadLatestHealthData = () => {
    const allResults = JSON.parse(localStorage.getItem('allResults') || '[]')
    
    if (currentUser && currentUser.role === 'patient') {
      const userResults = allResults.filter(r => r.patientEmail === currentUser.email)
      if (userResults.length > 0) {
        setHealthData(userResults[0])
        generateRecommendations(userResults[0])
      }
    } else if (allResults.length > 0) {
      setHealthData(allResults[0])
      generateRecommendations(allResults[0])
    }
  }

  const generateRecommendations = (data) => {
    const { formData, riskLevel, totalScore } = data
    const glucose = parseFloat(formData.avg_glucose_level)
    const bmi = parseFloat(formData.bmi)
    const hasHypertension = formData.hypertension === '1'
    const hasHeartDisease = formData.heart_disease === '1'

    let dietPlan = {
      avoid: [],
      encourage: [],
      portions: '',
      meals: []
    }

    // 혈당 관리
    if (glucose >= 150) {
      dietPlan.avoid.push('당분이 많은 음식 (사탕, 케이크, 탄산음료)')
      dietPlan.avoid.push('정제된 탄수화물 (흰 쌀, 흰 빵)')
      dietPlan.encourage.push('통곡물 (현미, 귀리, 통밀빵)')
      dietPlan.encourage.push('저혈당 지수 식품 (채소, 콩류)')
    } else if (glucose >= 125) {
      dietPlan.avoid.push('과도한 당분 섭취')
      dietPlan.encourage.push('식이섬유가 풍부한 음식')
    }

    // BMI 관리
    if (bmi >= 30) {
      dietPlan.avoid.push('고칼로리 패스트푸드')
      dietPlan.avoid.push('튀긴 음식')
      dietPlan.encourage.push('채소 중심 식단')
      dietPlan.encourage.push('적정 칼로리 유지 (1일 1500-1800kcal)')
      dietPlan.portions = '한 끼 접시의 1/2은 채소, 1/4은 단백질, 1/4은 통곡물'
    } else if (bmi >= 25) {
      dietPlan.encourage.push('균형 잡힌 식사')
      dietPlan.portions = '적당한 양 섭취, 과식 피하기'
    }

    // 고혈압
    if (hasHypertension) {
      dietPlan.avoid.push('나트륨 과다 (짠 음식, 가공식품, 라면)')
      dietPlan.avoid.push('카페인 과다 섭취')
      dietPlan.encourage.push('칼륨이 풍부한 음식 (바나나, 시금치, 고구마)')
      dietPlan.encourage.push('DASH 식단 (과일, 채소, 저지방 유제품)')
    }

    // 심장질환
    if (hasHeartDisease) {
      dietPlan.avoid.push('포화지방 (붉은 고기, 버터)')
      dietPlan.avoid.push('트랜스지방 (마가린, 가공 스낵)')
      dietPlan.encourage.push('오메가-3 지방산 (연어, 고등어, 호두)')
      dietPlan.encourage.push('올리브유, 아보카도 (건강한 지방)')
    }

    // 위험도별 식단 예시
    if (riskLevel === 'High') {
      dietPlan.meals = [
        {
          time: '아침',
          menu: '통밀빵 + 계란 흰자 + 샐러드 + 저지방 우유',
          note: '단백질과 식이섬유 중심'
        },
        {
          time: '점심',
          menu: '현미밥 + 생선구이 (연어/고등어) + 채소볶음 + 된장국',
          note: '오메가-3와 채소 충분히'
        },
        {
          time: '저녁',
          menu: '귀리죽 + 두부 + 나물 무침 + 과일 소량',
          note: '저칼로리, 저염식'
        }
      ]
    } else if (riskLevel === 'Medium') {
      dietPlan.meals = [
        {
          time: '아침',
          menu: '현미밥 + 계란 + 나물 + 김치',
          note: '균형 잡힌 한식'
        },
        {
          time: '점심',
          menu: '잡곡밥 + 닭가슴살 + 채소 샐러드 + 과일',
          note: '단백질과 비타민'
        },
        {
          time: '저녁',
          menu: '통밀 파스타 + 토마토 소스 + 채소',
          note: '적당량 섭취'
        }
      ]
    } else {
      dietPlan.meals = [
        {
          time: '아침',
          menu: '통곡물 시리얼 + 우유 + 과일',
          note: '건강한 습관 유지'
        },
        {
          time: '점심',
          menu: '다양한 색깔의 채소와 단백질',
          note: '균형잡힌 식사'
        },
        {
          time: '저녁',
          menu: '가벼운 식사, 과식 피하기',
          note: '저녁은 가볍게'
        }
      ]
    }

    // 기본 권장사항
    if (dietPlan.encourage.length === 0) {
      dietPlan.encourage.push('다양한 색깔의 채소와 과일')
      dietPlan.encourage.push('물 충분히 마시기 (1일 2L)')
    }

    if (dietPlan.avoid.length === 0) {
      dietPlan.avoid.push('과도한 음주')
      dietPlan.avoid.push('과식')
    }

    setRecommendations(dietPlan)
  }

  if (!healthData) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>🍎 식이 권장사항</h1>
          <p>건강 데이터를 기반으로 맞춤 식단을 제공합니다</p>
        </div>
        <div className="no-data">
          <h2>건강 평가 기록이 없습니다</h2>
          <p>먼저 건강 데이터를 입력하여 위험도 평가를 받으세요</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
            평가 시작하기
          </button>
        </div>
      </div>
    )
  }

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>식이 권장사항</h1>
          <p>당신의 건강 상태에 맞춘 식단 가이드</p>
        </div>      <div className="result-details">
        <div style={{marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd'}}>
          <h3>📊 현재 건강 상태</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem'}}>
            <div><strong>위험도:</strong> <span className={`badge ${healthData.color}`}>{healthData.riskLevel}</span></div>
            <div><strong>혈당:</strong> {healthData.formData.avg_glucose_level} mg/dL</div>
            <div><strong>BMI:</strong> {healthData.formData.bmi}</div>
            <div><strong>고혈압:</strong> {healthData.formData.hypertension === '1' ? '있음' : '없음'}</div>
          </div>
        </div>

        <div className="detail-card" style={{marginBottom: '1.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca'}}>
          <h2>❌ 피해야 할 음식</h2>
          <ul style={{paddingLeft: '1.5rem', lineHeight: '2', marginTop: '0.5rem'}}>
            {recommendations.avoid.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="detail-card" style={{marginBottom: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0'}}>
          <h2>✅ 권장 음식</h2>
          <ul style={{paddingLeft: '1.5rem', lineHeight: '2', marginTop: '0.5rem'}}>
            {recommendations.encourage.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {recommendations.portions && (
          <div className="detail-card" style={{marginBottom: '1.5rem', backgroundColor: '#fefce8', border: '1px solid #fde047'}}>
            <h2>📏 식사 분량</h2>
            <p style={{marginTop: '0.5rem', fontSize: '1rem', lineHeight: '1.6'}}>{recommendations.portions}</p>
          </div>
        )}

        <div className="detail-card">
          <h2>🍽️ 하루 식단 예시</h2>
          <div style={{marginTop: '1rem'}}>
            {recommendations.meals.map((meal, idx) => (
              <div key={idx} style={{marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                <h3 style={{color: '#1f2937', marginBottom: '0.5rem'}}>{meal.time}</h3>
                <div style={{fontSize: '1rem', marginBottom: '0.5rem'}}><strong>메뉴:</strong> {meal.menu}</div>
                <div style={{fontSize: '0.9rem', color: '#6b7280'}}><em>{meal.note}</em></div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop: '2rem', padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #93c5fd'}}>
          <h3 style={{color: '#1e40af', marginBottom: '0.5rem'}}>💡 추가 조언</h3>
          <ul style={{paddingLeft: '1.5rem', lineHeight: '2', fontSize: '0.95rem'}}>
            <li>규칙적인 식사 시간을 유지하세요</li>
            <li>천천히 씹어 먹고, 과식하지 마세요</li>
            <li>간식은 건강한 선택 (견과류, 과일)</li>
            <li>음식 일기를 작성해 식습관을 관찰하세요</li>
            <li>영양사 상담을 통해 개인 맞춤 식단을 받는 것도 좋습니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DietRecommendation
