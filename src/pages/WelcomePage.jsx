import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;500&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .welcome-root {
    min-height: 100vh;
    background: #f7f3ee;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    direction: rtl;
    font-family: 'Heebo', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* רקע גיאומטרי עדין */
  .welcome-root::before {
    content: '';
    position: absolute;
    top: -120px;
    left: -120px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, #d4e9d0 0%, transparent 70%);
    z-index: 0;
  }
  .welcome-root::after {
    content: '';
    position: absolute;
    bottom: -100px;
    right: -100px;
    width: 350px;
    height: 350px;
    border-radius: 50%;
    background: radial-gradient(circle, #c8dff5 0%, transparent 70%);
    z-index: 0;
  }

  .welcome-card {
    position: relative;
    z-index: 1;
    background: white;
    border-radius: 24px;
    padding: 56px 64px;
    max-width: 480px;
    width: 90%;
    box-shadow: 0 4px 32px rgba(0,0,0,0.08);
    text-align: center;
    animation: fadeUp 0.6s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .logo-area {
    margin-bottom: 32px;
  }

  .logo-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 8px;
  }

  .logo-title {
    font-family: 'Frank Ruhl Libre', serif;
    font-size: 32px;
    font-weight: 900;
    color: #1a2e1a;
    line-height: 1.2;
  }

  .logo-title span {
    color: #3a7d44;
  }

  .welcome-subtitle {
    font-size: 15px;
    color: #7a8c7a;
    font-weight: 300;
    margin-top: 6px;
    letter-spacing: 0.02em;
  }

  .divider {
    width: 40px;
    height: 3px;
    background: #3a7d44;
    border-radius: 2px;
    margin: 28px auto;
    opacity: 0.4;
  }

  .question {
    font-size: 17px;
    color: #3a4a3a;
    font-weight: 500;
    margin-bottom: 28px;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    font-family: 'Heebo', sans-serif;
    font-size: 17px;
    font-weight: 500;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    text-align: right;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn-volunteer {
    background: #3a7d44;
    color: white;
  }

  .btn-rider {
    background: #eef5f0;
    color: #1a2e1a;
    border: 1.5px solid #c8dfc8;
  }

  .btn-label {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .btn-sub {
    font-size: 12px;
    font-weight: 300;
    opacity: 0.75;
  }

  .btn-arrow {
    font-size: 20px;
    opacity: 0.6;
  }

  .footer-note {
    margin-top: 28px;
    font-size: 12px;
    color: #aab8aa;
    font-weight: 300;
  }
`;

function WelcomePage({ onNavigate }) {
  const [pressed, setPressed] = useState(null);

  const handleClick = (role) => {
    setPressed(role);
    // כאן יבוא הניווט האמיתי:
    // onNavigate(role === 'volunteer' ? '/login' : '/ride-request')
    alert(role === 'volunteer' ? 'ניווט לדף התחברות מתנדב' : 'ניווט לטופס בקשת נסיעה');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="welcome-root">
        <div className="welcome-card">

          <div className="logo-area">
            <span className="logo-icon">🤝</span>
            <h1 className="logo-title">
              Hesed<span>Ride</span>
            </h1>
            <p className="welcome-subtitle">רשת ההסעות הרפואיות ההתנדבותית</p>
          </div>

          <div className="divider" />

          <p className="question">כיצד נוכל לעזור היום?</p>

          <div className="btn-group">
            <button
              className="btn btn-volunteer"
              onClick={() => handleClick('volunteer')}
              aria-label="כניסה כמתנדב"
            >
              <span className="btn-label">
                <span>אני מתנדב</span>
                <span className="btn-sub">כניסה והצגת בקשות</span>
              </span>
              <span className="btn-arrow">←</span>
            </button>

            <button
              className="btn btn-rider"
              onClick={() => handleClick('rider')}
              aria-label="הגשת בקשת נסיעה"
            >
              <span className="btn-label">
                <span>אני נוסע</span>
                <span className="btn-sub">הגשת בקשת הסעה</span>
              </span>
              <span className="btn-arrow">←</span>
            </button>
          </div>

          <p className="footer-note">HesedRide © 2025 — כל הזכויות שמורות</p>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;