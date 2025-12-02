import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import api from '../api'

function Login({ setCurrentUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력하세요')
      return
    }

    setLoading(true)

    try {
      // 백엔드 API 로그인
      const response = await api.login(email, password)
      
      const user = {
        user_id: response.user_id,
        email: response.email,
        name: response.name,
        role: response.role
      }

      sessionStorage.setItem('currentUser', JSON.stringify(user))
      setCurrentUser(user)
      
      // 역할별 대시보드로 이동
      if (user.role === 'patient') {
        navigate('/patient-dashboard')
      } else if (user.role === 'caregiver') {
        navigate('/caregiver-dashboard')
      } else if (user.role === 'doctor') {
        navigate('/doctor-dashboard')
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('로그인 실패: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>뇌졸중 예측 시스템</h1>
          <p className="login-subtitle">Stroke Prediction System</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label>이메일</label>
            <input 
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="이메일을 입력하세요"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button className="btn-login" onClick={handleLogin} disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="demo-accounts">
            <p className="demo-title">데모 계정</p>
            <div className="demo-list">
              <div className="demo-item">
                <strong>환자:</strong> patient@test.com / patient
              </div>
              <div className="demo-item">
                <strong>보호자:</strong> caregiver@test.com / caregiver
              </div>
              <div className="demo-item">
                <strong>의사:</strong> doctor@test.com / doctor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
