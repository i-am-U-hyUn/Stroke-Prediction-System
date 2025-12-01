import { useState, useEffect } from 'react'
import '../styles/Dashboard.css'

function Messages({ currentUser }) {
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [composing, setComposing] = useState(false)
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    body: ''
  })

  useEffect(() => {
    loadMessages()
  }, [currentUser])

  const loadMessages = () => {
    if (!currentUser) return
    
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]')
    const userMessages = allMessages.filter(m => 
      m.to === currentUser.email || m.from === currentUser.email
    )
    setMessages(userMessages)
  }

  const handleSendMessage = () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.body) {
      alert('모든 필드를 입력하세요')
      return
    }

    const message = {
      id: Date.now(),
      from: currentUser.email,
      to: newMessage.to,
      subject: newMessage.subject,
      body: newMessage.body,
      timestamp: new Date().toLocaleString('ko-KR'),
      read: false
    }

    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]')
    allMessages.unshift(message)
    localStorage.setItem('messages', JSON.stringify(allMessages))
    
    setNewMessage({ to: '', subject: '', body: '' })
    setComposing(false)
    loadMessages()
    alert('메시지를 전송했습니다!')
  }

  const handleReadMessage = (msg) => {
    setSelectedMessage(msg)
    
    // 읽음 처리
    if (!msg.read && msg.to === currentUser.email) {
      const allMessages = JSON.parse(localStorage.getItem('messages') || '[]')
      const updated = allMessages.map(m => 
        m.id === msg.id ? { ...m, read: true } : m
      )
      localStorage.setItem('messages', JSON.stringify(updated))
      loadMessages()
    }
  }

  const unreadCount = messages.filter(m => !m.read && m.to === currentUser.email).length

  if (!currentUser) {
    return (
      <div className="dashboard-container">
        <div className="no-data">
          <h2>로그인이 필요합니다</h2>
          <p>메시지 기능을 사용하려면 로그인하세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>메시지</h1>
        <p>보호자와 환자 간 응원 메시지를 주고받으세요</p>
        {unreadCount > 0 && (
          <span style={{
            display: 'inline-block',
            marginLeft: '1rem',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.9rem'
          }}>
            {unreadCount}개의 새 메시지
          </span>
        )}
      </div>

      <div style={{marginBottom: '1rem'}}>
        <button 
          className="btn btn-primary" 
          onClick={() => setComposing(!composing)}
        >
          {composing ? '취소' : '새 메시지 작성'}
        </button>
      </div>

      {composing && (
        <div className="result-details" style={{marginBottom: '2rem', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px'}}>
          <h2>새 메시지</h2>
          <div className="form-group">
            <label>받는 사람 (이메일)</label>
            <input 
              value={newMessage.to} 
              onChange={e => setNewMessage({...newMessage, to: e.target.value})}
              placeholder="recipient@example.com"
            />
          </div>
          <div className="form-group">
            <label>제목</label>
            <input 
              value={newMessage.subject} 
              onChange={e => setNewMessage({...newMessage, subject: e.target.value})}
              placeholder="메시지 제목"
            />
          </div>
          <div className="form-group">
            <label>내용</label>
            <textarea 
              value={newMessage.body} 
              onChange={e => setNewMessage({...newMessage, body: e.target.value})}
              placeholder="응원 메시지를 입력하세요..."
              rows="5"
              style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px'}}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSendMessage}>전송</button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="results-list">
          <h2>받은/보낸 메시지</h2>
          {messages.length === 0 ? (
            <div className="no-data">
              <p>메시지가 없습니다</p>
            </div>
          ) : (
            <div className="list-container">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`result-item ${selectedMessage?.id === msg.id ? 'active' : ''} ${!msg.read && msg.to === currentUser.email ? 'high' : ''}`}
                  onClick={() => handleReadMessage(msg)}
                  style={{cursor: 'pointer'}}
                >
                  <div className="item-header">
                    <span style={{fontWeight: !msg.read && msg.to === currentUser.email ? 'bold' : 'normal'}}>
                      {msg.from === currentUser.email ? `📤 To: ${msg.to}` : `📥 From: ${msg.from}`}
                    </span>
                    {!msg.read && msg.to === currentUser.email && (
                      <span className="badge high" style={{fontSize: '0.75rem'}}>NEW</span>
                    )}
                  </div>
                  <div style={{marginTop: '0.25rem', fontSize: '0.95rem', fontWeight: 'bold'}}>
                    {msg.subject}
                  </div>
                  <div className="item-date">{msg.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedMessage && (
          <div className="result-detail">
            <h2>메시지 내용</h2>
            <div className="detail-card">
              <div style={{marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb'}}>
                <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                  <strong>보낸 사람:</strong> {selectedMessage.from}
                </div>
                <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                  <strong>받는 사람:</strong> {selectedMessage.to}
                </div>
                <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                  <strong>시간:</strong> {selectedMessage.timestamp}
                </div>
                <div style={{fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.5rem'}}>
                  {selectedMessage.subject}
                </div>
              </div>
              <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>
                {selectedMessage.body}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
