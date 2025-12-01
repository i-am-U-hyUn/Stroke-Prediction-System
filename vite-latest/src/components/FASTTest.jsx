import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/HealthForm.css'

function FASTTest({ currentUser }) {
  const navigate = useNavigate()
  const [testResults, setTestResults] = useState({
    face: null,      // Face: 얼굴 비대칭
    arms: null,      // Arms: 팔 힘 약화
    speech: null,    // Speech: 언어 장애
    time: null       // Time: 시간 기록
  })
  const [emergency, setEmergency] = useState(false)

  const handleTestChange = (category, value) => {
    setTestResults(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const evaluateResults = () => {
    const { face, arms, speech } = testResults
    
    // 하나라도 이상이 있으면 긴급
    if (face === 'abnormal' || arms === 'abnormal' || speech === 'abnormal') {
      return { emergency: true, score: 3 }
    }
    
    // 모두 정상
    if (face === 'normal' && arms === 'normal' && speech === 'normal') {
      return { emergency: false, score: 0 }
    }
    
    // 일부 미완료
    return { emergency: false, score: -1 }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!currentUser || currentUser.role !== 'patient') {
      alert('FAST 테스트는 환자 계정으로만 실행할 수 있습니다.')
      return
    }

    const evaluation = evaluateResults()
    
    if (evaluation.score === -1) {
      alert('모든 테스트 항목을 완료해주세요.')
      return
    }

    const testRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('ko-KR'),
      patientEmail: currentUser.email,
      results: testResults,
      emergency: evaluation.emergency
    }

    // localStorage에 FAST 테스트 결과 저장
    try {
      const allTests = JSON.parse(localStorage.getItem('fast_tests') || '[]')
      allTests.unshift(testRecord)
      localStorage.setItem('fast_tests', JSON.stringify(allTests))
    } catch (e) {
      console.error('FAST 테스트 저장 실패', e)
    }

    if (evaluation.emergency) {
      setEmergency(true)
      
      // Alert 생성 및 보호자에게 알림
      const alert = {
        id: Date.now(),
        patientEmail: currentUser.email,
        type: 'FAST_EMERGENCY',
        severity: 'HIGH',
        message: '뇌졸중 의심 증상 발견 - 즉시 119에 연락하세요!',
        timestamp: new Date().toLocaleString('ko-KR')
      }
      
      try {
        const alerts = JSON.parse(localStorage.getItem('alerts') || '[]')
        alerts.unshift(alert)
        localStorage.setItem('alerts', JSON.stringify(alerts))
      } catch (e) {
        console.error('Alert 저장 실패', e)
      }

      // 보호자에게 긴급 메시지 전송 (shared_records 활용)
      try {
        const sharedRecords = JSON.parse(localStorage.getItem('shared_records') || '[]')
        const guardians = sharedRecords
          .filter(r => r.patientEmail === currentUser.email && r.recipientRole === 'caregiver')
          .map(r => r.recipientEmail)
        
        if (guardians.length > 0) {
          const messages = JSON.parse(localStorage.getItem('messages') || '[]')
          guardians.forEach(guardianEmail => {
            messages.unshift({
              id: Date.now() + Math.random(),
              from: currentUser.email,
              to: guardianEmail,
              subject: '긴급: FAST 테스트 이상',
              body: `${currentUser.email} 환자의 FAST 테스트에서 뇌졸중 의심 증상이 발견되었습니다. 즉시 확인이 필요합니다.`,
              timestamp: new Date().toLocaleString('ko-KR'),
              read: false
            })
          })
          localStorage.setItem('messages', JSON.stringify(messages))
        }
      } catch (e) {
        console.error('보호자 알림 전송 실패', e)
      }
    }

    sessionStorage.setItem('fast_result', JSON.stringify(testRecord))
    navigate('/fast-result')
  }

  const handleReset = () => {
    setTestResults({
      face: null,
      arms: null,
      speech: null,
      time: null
    })
    setEmergency(false)
  }

  return (
    <div className="health-form-container">
      <header className="form-header">
        <h1>⚡ FAST 테스트</h1>
        <p>뇌졸중 조기 발견을 위한 간단한 테스트입니다</p>
      </header>

      <div className="health-form">
        <div className="form-section" style={{backgroundColor: '#fee', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
          <h3 style={{color: '#c00', marginBottom: '0.5rem'}}>⚠️ 중요 안내</h3>
          <p style={{fontSize: '0.9rem', lineHeight: '1.6', color: '#dc2626'}}>
            FAST는 뇌졸중의 주요 증상을 빠르게 확인하는 테스트입니다. 
            <strong>하나라도 이상이 발견되면 즉시 119에 연락하세요!</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>F - Face (얼굴)</h2>
            <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem'}}>
              거울을 보고 웃어보세요. 얼굴 한쪽이 처지거나 비대칭인가요?
            </p>
            
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', padding: '0.75rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <input 
                  type="radio" 
                  name="face" 
                  value="normal"
                  checked={testResults.face === 'normal'}
                  onChange={(e) => handleTestChange('face', e.target.value)}
                />
                <span style={{marginLeft: '0.5rem'}}>정상 (양쪽 대칭)</span>
              </label>
            </div>
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', padding: '0.75rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <input 
                  type="radio" 
                  name="face" 
                  value="abnormal"
                  checked={testResults.face === 'abnormal'}
                  onChange={(e) => handleTestChange('face', e.target.value)}
                />
                <span style={{marginLeft: '0.5rem'}}>이상 (한쪽이 처지거나 비대칭)</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>A - Arms (팔)</h2>
            <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem'}}>
              눈을 감고 양팔을 앞으로 들어올려 10초간 유지하세요. 한쪽 팔이 떨어지나요?
            </p>
            
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', padding: '0.75rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <input 
                  type="radio" 
                  name="arms" 
                  value="normal"
                  checked={testResults.arms === 'normal'}
                  onChange={(e) => handleTestChange('arms', e.target.value)}
                />
                <span style={{marginLeft: '0.5rem'}}>정상 (양팔 모두 유지됨)</span>
              </label>
            </div>
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', padding: '0.75rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <input 
                  type="radio" 
                  name="arms" 
                  value="abnormal"
                  checked={testResults.arms === 'abnormal'}
                  onChange={(e) => handleTestChange('arms', e.target.value)}
                />
                <span style={{marginLeft: '0.5rem'}}>이상 (한쪽 팔이 떨어지거나 약함)</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>S - Speech (언어)</h2>
            <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem'}}>
              "가나다라마바사"를 말해보세요. 발음이 어눌하거나 말이 잘 안 나오나요?
            </p>
            
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', padding: '0.75rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <input 
                  type="radio" 
                  name="speech" 
                  value="normal"
                  checked={testResults.speech === 'normal'}
                  onChange={(e) => handleTestChange('speech', e.target.value)}
                />
                <span style={{marginLeft: '0.5rem'}}>정상 (말이 또렷함)</span>
              </label>
            </div>
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', padding: '0.75rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <input 
                  type="radio" 
                  name="speech" 
                  value="abnormal"
                  checked={testResults.speech === 'abnormal'}
                  onChange={(e) => handleTestChange('speech', e.target.value)}
                />
                <span style={{marginLeft: '0.5rem'}}>이상 (발음 어눌, 말이 안 나옴)</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>T - Time (시간)</h2>
            <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem'}}>
              위 증상 중 하나라도 발견되면 <strong style={{color: '#dc2626'}}>즉시 시간을 확인하고 119에 연락</strong>하세요. 뇌졸중은 빠른 치료가 생명을 구합니다!
            </p>
            
            <div style={{padding: '1.5rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '2px solid #dc2626'}}>
              <h3 style={{color: '#dc2626', marginTop: 0}}>⏰ 골든타임</h3>
              <p style={{margin: '0.5rem 0', lineHeight: '1.6'}}>
                뇌졸중 증상 발생 후 <strong>3시간 이내</strong>가 치료의 골든타임입니다. 
                증상이 의심되면 <strong>망설이지 말고 즉시 119</strong>에 연락하세요.
              </p>
              <p style={{margin: '0.5rem 0', fontSize: '0.9rem', color: '#7f1d1d'}}>
                💡 증상이 나타난 시간을 기억하거나 메모해두세요.
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!currentUser || currentUser.role !== 'patient'}
            >
              결과 확인
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
            <div style={{marginTop: '0.5rem', color: '#6b7280', textAlign: 'center'}}>
              <strong>알림:</strong> FAST 테스트는 환자 계정으로 로그인해야 실행할 수 있습니다. <a href="/login">로그인</a>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default FASTTest
