import React, { useState } from 'react';
import './Onboarding.css';

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
    <div className="ob-container">
      <header className="ob-header">
        <div className="ob-header-left">
          <div className="ob-logo-dot"/>
          <span className="ob-logo-text">TALENT<span className="ob-logo-accent">DASH</span></span>
          <span className="ob-separator">·</span>
          <span className="ob-onboarding-label">ONBOARDING</span>
        </div>
        <div className="ob-header-right">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} className="ob-header-btn">Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} className="ob-header-btn">Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} className="ob-header-btn">Salary</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} className="ob-header-btn">Resume</button>
        </div>
        <div className="ob-header-spacer"/>
      </header>
      <div className="ob-main">


        <div className="onboard-card">
          <div className="step-indicator">
            {[1, 2, 3].map(i => <div key={i} className={`step-dot ${step === i ? 'active' : ''}`} />)}
          </div>

          {step === 1 && (
            <div className="fade">
              <h2 className="ob-title">Create Account</h2>
              <p className="ob-subtitle">Save your analysis and unlock personalized growth roadmaps.</p>
              <input name="email" className="inp-onboard" placeholder="Email Address" value={formData.email} onChange={handleInput} />
              <input name="password" type="password" className="inp-onboard" placeholder="Password" value={formData.password} onChange={handleInput} />
              <button className="btn-next" onClick={nextStep}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div className="fade">
              <h2 className="ob-title">Tell us about you</h2>
              <p className="ob-subtitle">We'll use this to refine your market benchmarks.</p>
              <input name="name" className="inp-onboard" placeholder="Full Name" value={formData.name} onChange={handleInput} />
              <div className="ob-field-group">
                <label className="ob-label">Current Role</label>
                <select
                  name="role"
                  className="inp-onboard"
                  value={formData.role}
                  onChange={handleInput}
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
              <div className="ob-rocket">🚀</div>
              <h2 className="ob-title">You're all set!</h2>
              <p className="ob-subtitle">Your profile is now connected to our market data. You can now save and track all your analyses.</p>
              <button
                className="btn-next"
                onClick={async () => {
                  try {
                    const res = await fetch('http://localhost:3001/api/user', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: formData.email, name: formData.name, role: formData.role }),
                    });
                    const json = await res.json();
                    if (json.success) localStorage.setItem('userId', json.data.id);
                  } catch (e) { console.error('Failed to create user', e); }
                  window.dispatchEvent(new CustomEvent('changeTab', { detail: 'hub' }));
                }}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
