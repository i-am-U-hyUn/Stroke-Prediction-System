import { useState, useEffect } from 'react'
import '../styles/Dashboard.css'

function Caregiver() {
  const [email, setEmail] = useState('')
  const [records, setRecords] = useState([])

  useEffect(() => {
    // no-op until an email is provided
  }, [])

  const loadRecords = () => {
    const all = JSON.parse(localStorage.getItem('shared_records') || '[]')
    const filtered = all.filter(r => r.recipientRole === 'caregiver' && r.recipientEmail === email)
    setRecords(filtered)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👪 보호자 모니터링</h1>
        <p>공유된 환자 데이터를 이메일로 조회하세요</p>
      </div>

      <div className="result-details">
        <div style={{display:'flex',gap:'1rem',alignItems:'center',marginBottom:'1rem'}}>
          <input placeholder="보호자 이메일 입력" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn btn-primary" onClick={loadRecords}>조회</button>
        </div>

        {records.length === 0 ? (
          <div className="no-data">
            <h2>공유된 기록이 없습니다</h2>
            <p>결과 페이지에서 환자가 보호자에게 공유해야 기록을 볼 수 있습니다.</p>
          </div>
        ) : (
          <div className="list-container">
            {records.map(r => (
              <div key={r.id} className={`result-item ${r.color || ''}`}>
                <div className="item-header">
                  <span className={`badge ${r.color || ''}`}>{r.riskLevel}</span>
                  <span className="item-score">{r.totalScore}점</span>
                </div>
                <div className="item-date">{r.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Caregiver
