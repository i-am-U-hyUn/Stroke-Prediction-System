import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import HealthForm from './components/HealthForm'
import ResultPage from './components/ResultPage'
import Dashboard from './components/Dashboard'
import Doctor from './components/Doctor'
import Caregiver from './components/Caregiver'
import Login from './components/Login'
import FASTTest from './components/FASTTest'
import FASTResult from './components/FASTResult'
import Messages from './components/Messages'
import DietRecommendation from './components/DietRecommendation'
import PatientDashboard from './components/PatientDashboard'
import CaregiverDashboard from './components/CaregiverDashboard'
import DoctorDashboard from './components/DoctorDashboard'

function App() {
  const [userResults, setUserResults] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = sessionStorage.getItem('currentUser')
    if (u) setCurrentUser(JSON.parse(u))
    setLoading(false)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  // 로그인하지 않은 경우 로그인 페이지만 표시
  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    )
  }

  // 로그인한 사용자에게 역할별 라우트 제공
  return (
    <Router>
      <Routes>
        {/* 역할별 대시보드 */}
        <Route path="/patient-dashboard" element={<PatientDashboard currentUser={currentUser} />} />
        <Route path="/caregiver-dashboard" element={<CaregiverDashboard currentUser={currentUser} />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard currentUser={currentUser} />} />
        
        {/* 공통 기능 */}
        <Route path="/" element={<HealthForm setUserResults={setUserResults} currentUser={currentUser} />} />
        <Route path="/result" element={<ResultPage currentUser={currentUser} />} />
        <Route path="/dashboard" element={<Dashboard userResults={userResults} />} />
        <Route path="/fast-test" element={<FASTTest currentUser={currentUser} />} />
        <Route path="/fast-result" element={<FASTResult />} />
        <Route path="/messages" element={<Messages currentUser={currentUser} />} />
        <Route path="/diet" element={<DietRecommendation currentUser={currentUser} />} />
        <Route path="/caregiver" element={<Caregiver currentUser={currentUser} />} />
        <Route path="/doctor" element={<Doctor currentUser={currentUser} />} />
        
        {/* 로그인 페이지는 이미 로그인한 상태이므로 대시보드로 리디렉션 */}
        <Route path="/login" element={
          currentUser.role === 'patient' ? <Navigate to="/patient-dashboard" replace /> :
          currentUser.role === 'caregiver' ? <Navigate to="/caregiver-dashboard" replace /> :
          <Navigate to="/doctor-dashboard" replace />
        } />
        
        {/* 기본 경로는 역할별 대시보드로 리디렉션 */}
        <Route path="*" element={
          currentUser.role === 'patient' ? <Navigate to="/patient-dashboard" replace /> :
          currentUser.role === 'caregiver' ? <Navigate to="/caregiver-dashboard" replace /> :
          <Navigate to="/doctor-dashboard" replace />
        } />
      </Routes>
    </Router>
  )
}

export default App
