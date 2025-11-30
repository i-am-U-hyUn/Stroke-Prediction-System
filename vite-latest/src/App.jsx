import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import HealthForm from './components/HealthForm'
import ResultPage from './components/ResultPage'
import Dashboard from './components/Dashboard'

function App() {
  const [userResults, setUserResults] = useState([])

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🏥 뇌졸중 예측 시스템
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">입력</Link>
              </li>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">대시보드</Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route 
            path="/" 
            element={<HealthForm setUserResults={setUserResults} />} 
          />
          <Route 
            path="/result" 
            element={<ResultPage />} 
          />
          <Route 
            path="/dashboard" 
            element={<Dashboard userResults={userResults} />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
