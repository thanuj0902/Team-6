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
    <div className="min-h-screen bg-[linear-gradient(145deg,#020818_0%,#040d20_35%,#060f1c_60%,#030a14_100%)] text-[#e0e0f0] font-['Space_Grotesk','Inter',sans-serif]">
      <header className="px-8 py-[18px] flex items-center backdrop-blur-2xl sticky top-0 bg-[rgba(13,11,34,0.82)] border-b border-[rgba(99,102,241,0.13)] z-20">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00ff9d] rounded-full shadow-[0_0_8px_#00ff9d]" />
          <span className="font-['Syne',sans-serif] font-extrabold text-base tracking-[0.1em] text-white">TALENT<span className="text-[#00ff9d]">DASH</span></span>
          <span className="text-[rgba(99,102,241,0.3)] mx-1.5">·</span>
          <span className="text-[11px] text-indigo-300 tracking-[0.1em]">ONBOARDING</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Salary</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Resume</button>
        </div>
        <div className="flex-1" />
      </header>
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-60px)]">
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
              <h2 className="text-[32px] font-bold mb-3">Create Account</h2>
              <p className="text-[#8890b0] mb-8 text-sm">Save your analysis and unlock personalized growth roadmaps.</p>
              <input name="email" className="inp-onboard" placeholder="Email Address" value={formData.email} onChange={handleInput} />
              <input name="password" type="password" className="inp-onboard" placeholder="Password" value={formData.password} onChange={handleInput} />
              <button className="btn-next" onClick={nextStep}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div className="fade">
              <h2 className="text-[32px] font-bold mb-3">Tell us about you</h2>
              <p className="text-[#8890b0] mb-8 text-sm">We'll use this to refine your market benchmarks.</p>
              <input name="name" className="inp-onboard" placeholder="Full Name" value={formData.name} onChange={handleInput} />
              <div className="mb-6">
                <label className="block text-left text-xs text-[#8890b0] mb-2">Current Role</label>
                <select
                  name="role"
                  className="inp-onboard cursor-pointer"
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
              <div className="text-[50px] mb-5">🚀</div>
              <h2 className="text-[32px] font-bold mb-3">You're all set!</h2>
              <p className="text-[#8890b0] mb-8 text-sm">Your profile is now connected to our market data. You can now save and track all your analyses.</p>
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
