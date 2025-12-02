// API 설정
// 같은 서버에서 실행되므로 상대 경로 사용
const API_BASE_URL = '';

// API 클라이언트
class StrokeAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.sessionId = sessionStorage.getItem('sessionId') || null;
  }

  // 로그인
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.sessionId = data.session_id;
    sessionStorage.setItem('sessionId', data.session_id);
    return data;
  }

  // 건강 데이터 제출 및 위험도 평가
  async submitHealthData(healthData) {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/api/health-data?session_id=${this.sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(healthData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit health data');
    }

    return await response.json();
  }

  // FAST 검사
  async performFASTTest(testData) {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/api/fast-test?session_id=${this.sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to perform FAST test');
    }

    return await response.json();
  }

  // 대시보드 데이터
  async getDashboard() {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/api/dashboard?session_id=${this.sessionId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch dashboard');
    }

    return await response.json();
  }

  // 데이터 공유
  async shareData(recipientEmail, recipientRole) {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/api/share?session_id=${this.sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          recipient_role: recipientRole,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to share data');
    }

    return await response.json();
  }

  // 메시지 전송
  async sendMessage(toEmail, subject, content) {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/api/messages?session_id=${this.sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: toEmail,
          subject,
          content,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return await response.json();
  }

  // 환자 리포트
  async getPatientReport() {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/api/patient/report?session_id=${this.sessionId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch report');
    }

    return await response.json();
  }

  // 의사: 환자 목록
  async getDoctorPatients() {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/api/doctor/patients?session_id=${this.sessionId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch patients');
    }

    return await response.json();
  }

  // 보호자: 모니터링 환자
  async getCaregiverPatients() {
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/api/caregiver/monitored?session_id=${this.sessionId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch monitored patients');
    }

    return await response.json();
  }

  // 로그아웃
  logout() {
    this.sessionId = null;
    sessionStorage.removeItem('sessionId');
  }
}

// 싱글톤 인스턴스
const api = new StrokeAPI();

export default api;
