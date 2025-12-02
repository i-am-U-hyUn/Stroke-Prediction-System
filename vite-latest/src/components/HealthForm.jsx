import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/HealthForm.css'
import api from '../api'

function HealthForm({ setUserResults, currentUser }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    gender: 'Male',
    age: '',
    hypertension: '0',
    heart_disease: '0',
    ever_married: 'Yes',
    work_type: 'Private',
    residence_type: 'Urban',
    avg_glucose_level: '',
    bmi: '',
    smoking_status: 'never smoked'
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateStrokeRisk = (data) => {
    let totalScore = 0

    // 1. 연령 점수
    const age = parseFloat(data.age)
    if (age >= 75) totalScore += 4
    else if (age >= 60) totalScore += 3
    else if (age >= 45) totalScore += 2

    // 2. 평균 혈당 (avg_glucose_level)
    const glucose = parseFloat(data.avg_glucose_level)
    if (glucose >= 150) totalScore += 3
    else if (glucose >= 125) totalScore += 1

    // 3. BMI
    const bmi = parseFloat(data.bmi)
    if (bmi >= 35) totalScore += 1
    else if (bmi >= 30) totalScore += 2
    else if (bmi >= 25) totalScore += 2

    // 4. 고혈압
    if (data.hypertension === '1') totalScore += 3

    // 5. 심장질환
    if (data.heart_disease === '1') totalScore += 4

    // 6. 흡연 상태
    if (data.smoking_status === 'smokes') totalScore += 1
    else if (data.smoking_status === 'formerly smoked') totalScore += 2

    // 7. 결혼여부, 거주지, 직업 - 기본 0점

    return totalScore
  }

  const getRiskLevel = (score) => {
    if (score <= 4) return { level: 'Low', stage: '1단계', color: 'low' }
    else if (score <= 8) return { level: 'Medium', stage: '2단계', color: 'medium' }
    else return { level: 'High', stage: '3단계', color: 'high' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // 접근 제어: 환자만 제출 가능
    const canSubmit = currentUser && currentUser.role === 'patient'
    if (!canSubmit) {
      alert('예측을 실행하려면 환자 계정으로 로그인하세요.')
      setLoading(false)
      return
    }
    try {
      // 입력 데이터 검증
      const age = parseFloat(formData.age)
      const glucose = parseFloat(formData.avg_glucose_level)
      const bmi = parseFloat(formData.bmi)
      
      if (!age || !glucose || !bmi || age < 0 || glucose < 0 || bmi < 0) {
        throw new Error('모든 필드를 올바르게 입력해주세요.')
      }

      // 백엔드 API 호출하여 위험도 평가
      const healthDataRequest = {
        age: parseInt(formData.age),
        gender: formData.gender,
        hypertension: parseInt(formData.hypertension),
        heart_disease: parseInt(formData.heart_disease),
        ever_married: formData.ever_married,
        work_type: formData.work_type,
        Residence_type: formData.residence_type,
        avg_glucose_level: parseFloat(formData.avg_glucose_level),
        bmi: parseFloat(formData.bmi),
        smoking_status: formData.smoking_status
      }

      // 백엔드 API 호출
      const assessment = await api.submitHealthData(healthDataRequest)
      
      // formData의 깊은 복사본 생성
      const formDataCopy = {
        gender: formData.gender,
        age: formData.age,
        hypertension: formData.hypertension,
        heart_disease: formData.heart_disease,
        ever_married: formData.ever_married,
        work_type: formData.work_type,
        residence_type: formData.residence_type,
        avg_glucose_level: formData.avg_glucose_level,
        bmi: formData.bmi,
        smoking_status: formData.smoking_status
      }
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const resultData = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('ko-KR'),
        patientEmail: currentUser?.email || null,
        formData: formDataCopy,
        totalScore: assessment.score,
        riskLevel: assessment.risk_level,
        stage: assessment.risk_level === 'High' ? '3단계' : assessment.risk_level === 'Medium' ? '2단계' : '1단계',
        color: assessment.risk_color,
        recommendations: assessment.recommendations,
        message: assessment.risk_level === 'High' 
          ? '⚠️ 뇌졸중 고위험군입니다. 의료 전문가와 상담하세요.'
          : assessment.risk_level === 'Medium'
          ? '⚠️ 뇌졸중 중등위험군입니다. 건강 관리가 필요합니다.'
          : '✓ 뇌졸중 저위험군입니다. 건강 습관을 유지하세요.'
      }
      
      console.log('=== 백엔드 응답 ===')
      console.log('Assessment:', assessment)
      console.log('저장될 resultData:', resultData)

      // 대시보드용 데이터 저장
      setUserResults(prev => [resultData, ...prev])
      // 전체 결과를 localStorage에도 저장 (영구 보관)
      try {
        const all = JSON.parse(localStorage.getItem('allResults') || '[]')
        all.unshift(resultData)
        localStorage.setItem('allResults', JSON.stringify(all))
      } catch (e) {
        console.error('localStorage 저장 실패', e)
      }
      
      // 세션 스토리지에 현재 결과 저장
      sessionStorage.setItem('currentResult', JSON.stringify(resultData))
      
      console.log('총 위험도 점수:', assessment.score)
      console.log('위험 등급:', assessment.risk_level)
      console.log('sessionStorage 저장 완료')
      
      // 결과 페이지로 이동
      navigate('/result')
    } catch (error) {
      alert(error.message || '예측 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      gender: 'Male',
      age: '',
      hypertension: '0',
      heart_disease: '0',
      ever_married: 'Yes',
      work_type: 'Private',
      residence_type: 'Urban',
      avg_glucose_level: '',
      bmi: '',
      smoking_status: 'never smoked'
    })
    setResult(null)
  }

  return (
    <div className="health-form-container">
      <header className="form-header">
        <h1>뇌졸중 위험 예측 시스템</h1>
        <p>건강 정보를 입력하여 뇌졸중 위험도를 확인하세요</p>
      </header>

      <form onSubmit={handleSubmit} className="health-form">
        <div className="form-section">
          <h2>기본 정보</h2>
          
          <div className="form-group">
            <label htmlFor="gender">성별</label>
            <select 
              id="gender"
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              required
            >
              <option value="Male">남성</option>
              <option value="Female">여성</option>
              <option value="Other">기타</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="age">나이</label>
            <input 
              id="age"
              type="number" 
              name="age" 
              value={formData.age} 
              onChange={handleChange}
              min="0"
              max="120"
              required
              placeholder="나이를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ever_married">결혼 여부</label>
            <select 
              id="ever_married"
              name="ever_married" 
              value={formData.ever_married} 
              onChange={handleChange}
              required
            >
              <option value="Yes">예</option>
              <option value="No">아니오</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="residence_type">거주 지역</label>
            <select 
              id="residence_type"
              name="residence_type" 
              value={formData.residence_type} 
              onChange={handleChange}
              required
            >
              <option value="Urban">도시</option>
              <option value="Rural">시골</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>의료 정보</h2>
          
          <div className="form-group">
            <label htmlFor="hypertension">고혈압</label>
            <select 
              id="hypertension"
              name="hypertension" 
              value={formData.hypertension} 
              onChange={handleChange}
              required
            >
              <option value="0">없음</option>
              <option value="1">있음</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="heart_disease">심장질환</label>
            <select 
              id="heart_disease"
              name="heart_disease" 
              value={formData.heart_disease} 
              onChange={handleChange}
              required
            >
              <option value="0">없음</option>
              <option value="1">있음</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="avg_glucose_level">평균 혈당 수치</label>
            <input 
              id="avg_glucose_level"
              type="number" 
              name="avg_glucose_level" 
              value={formData.avg_glucose_level} 
              onChange={handleChange}
              step="0.01"
              min="0"
              max="300"
              required
              placeholder="예: 120.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bmi">BMI (체질량지수)</label>
            <input 
              id="bmi"
              type="number" 
              name="bmi" 
              value={formData.bmi} 
              onChange={handleChange}
              step="0.1"
              min="10"
              max="60"
              required
              placeholder="예: 25.5"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>생활 습관</h2>
          
          <div className="form-group">
            <label htmlFor="work_type">직업 유형</label>
            <select 
              id="work_type"
              name="work_type" 
              value={formData.work_type} 
              onChange={handleChange}
              required
            >
              <option value="Private">민간 회사</option>
              <option value="Govt_job">정부 기관</option>
              <option value="Self-employed">자영업</option>
              <option value="Never_worked">미취업</option>
              <option value="Children">어린이</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="smoking_status">흡연 상태</label>
            <select 
              id="smoking_status"
              name="smoking_status" 
              value={formData.smoking_status} 
              onChange={handleChange}
              required
            >
              <option value="never smoked">비흡연</option>
              <option value="formerly smoked">과거 흡연</option>
              <option value="smokes">현재 흡연</option>
              <option value="Unknown">알 수 없음</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !(currentUser && currentUser.role === 'patient')}
          >
            {loading ? '예측 중...' : '예측 분석'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleReset}
          >
            초기화
          </button>
        </div>
        {!(currentUser && currentUser.role === 'patient') && (
          <div style={{marginTop:'0.5rem',color:'#6b7280'}}>
            <strong>알림:</strong> 예측은 <em>환자</em> 계정으로 로그인해야 실행할 수 있습니다. <a href="/login">로그인</a>
          </div>
        )}
      </form>
    </div>
  )
}

export default HealthForm
