import React, { useState } from 'react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Software Engineer',
  });

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #020818 0%, #040d20 35%, #060f1c 60%, #030a14 100%)',
      color: '#e0e0f0',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        .onboard-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 255, 157, 0.15);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          text-align: center;
        }
        .inp-onboard {
          width: 100%;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-family: inherit;
          margin-bottom: 20px;
          outline: none;
          transition: all 0.2s;
        }
        .inp-onboard:focus {
          border-color: #00ff9d;
          background: rgba(0, 255, 157, 0.05);
        }
        .btn-next {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #00ff9d, #00d4ff);
          color: #020818;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-next:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 255, 157, 0.3);
        }
        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 32px;
        }
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
        }
        .step-dot.active {
          background: #00ff9d;
          box-shadow: 0 0 8px #00ff9d;
          width: 20px;
          border-radius: 4px;
        }
      `}</style>

      <div className="onboard-card">
        <div className="step-indicator">
          {[1, 2, 3].map(i => <div key={i} className={`step-dot ${step === i ? 'active' : ''}`} />)}
        </div>

        {step === 1 && (
          <div className="fade">
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Create Account</h2>
            <p style={{ color: '#8890b0', marginBottom: 32, fontSize: 14 }}>Save your analysis and unlock personalized growth roadmaps.</p>
            <input name="email" className="inp-onboard" placeholder="Email Address" value={formData.email} onChange={handleInput} />
            <input name="password" type="password" className="inp-onboard" placeholder="Password" value={formData.password} onChange={handleInput} />
            <button className="btn-next" onClick={nextStep}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div className="fade">
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Tell us about you</h2>
            <p style={{ color: '#8890b0', marginBottom: 32, fontSize: 14 }}>We'll use this to refine your market benchmarks.</p>
            <input name="name" className="inp-onboard" placeholder="Full Name" value={formData.name} onChange={handleInput} />
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', textAlign: 'left', fontSize: 12, color: '#8890b0', marginBottom: 8 }}>Current Role</label>
              <select
                name="role"
                className="inp-onboard"
                value={formData.role}
                onChange={handleInput}
                style={{ cursor: 'pointer' }}
              >
                <option>Software Engineer</option>
                <option>Senior Engineer</option>
                <option>Staff Engineer</option>
                <option>Product Manager</option>
                <option>Data Scientist</option>
              </select>
            </div>
            <button className="btn-next" onClick={nextStep}>Almost there →</button>
          </div>
        )}

        {step === 3 && (
          <div className="fade">
            <div style={{ fontSize: 50, marginBottom: 20 }}>🚀</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>You're all set!</h2>
            <p style={{ color: '#8890b0', marginBottom: 32, fontSize: 14 }}>Your profile is now connected to our market data. You can now save and track all your analyses.</p>
            <button
              className="btn-next"
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'hub' }))}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
