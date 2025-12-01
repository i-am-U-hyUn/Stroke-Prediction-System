import { useState } from 'react'
import '../styles/Dashboard.css'

function Doctor() {
  const [email, setEmail] = useState('')
  const [records, setRecords] = useState([])

  const loadRecords = () => {
    const all = JSON.parse(localStorage.getItem('shared_records') || '[]')
    const filtered = all.filter(r => r.recipientRole === 'doctor' && r.recipientEmail === email)
    setRecords(filtered)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🩺 의사 포털</h1>
        <p>공유된 환자 목록을 이메일로 조회하세요</p>
      </div>

      <div className="result-details">
        <div style={{display:'flex',gap:'1rem',alignItems:'center',marginBottom:'1rem'}}>
          <input placeholder="의사 이메일 입력" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn btn-primary" onClick={loadRecords}>조회</button>
        </div>

        {records.length === 0 ? (
          <div className="no-data">
            <h2>공유된 환자 없음</h2>
            <p>환자가 결과 페이지에서 의사에게 공유해야 목록에 나타납니다.</p>
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
                <div style={{marginTop:'0.5rem'}}>
                  <strong>환자 정보</strong>
                  <div>{r.formData.gender} · {r.formData.age}세 · BMI {r.formData.bmi}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Doctor
