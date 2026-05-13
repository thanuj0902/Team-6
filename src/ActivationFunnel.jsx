import React, { useState, useEffect } from 'react';

const STEPS = [
  { id: 'profile', label: 'Complete Profile', icon: '👤', desc: 'Set up your professional profile' },
  { id: 'resume', label: 'Analyze Resume', icon: '📄', desc: 'Get your ATS score and skill insights' },
  { id: 'salary', label: 'Calculate Salary', icon: '💰', desc: 'Benchmark your market worth' },
  { id: 'offer', label: 'Evaluate Offer', icon: '✉️', desc: 'Compare offers against market data' },
  { id: 'contribute', label: 'Contribute Data', icon: '📊', desc: 'Share salary data & earn points' },
];

const REWARDS = {
  profile: { points: 20, badge: 'Profile Pro' },
  resume: { points: 50, badge: 'Resume Star' },
  salary: { points: 30, badge: 'Market Scout' },
  offer: { points: 40, badge: 'Offer Master' },
  contribute: { points: 100, badge: 'Data Champion' },
};

export default function ActivationFunnel() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animIn, setAnimIn] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    setLoading(true);
    try {
      if (userId) {
        const res = await fetch(`http://localhost:3001/api/activation?userId=${userId}`);
        const json = await res.json();
        setSteps(json.data || []);
      }
    } catch (e) {
      console.error('Failed to load activation steps', e);
    }
    setLoading(false);
  };

  const isComplete = (stepId) => steps.some(s => s.step === stepId && s.completed);

  const completeStep = async (stepId) => {
    if (!userId) return;
    try {
      await fetch('http://localhost:3001/api/activation/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, step: stepId }),
      });
      loadSteps();
    } catch (e) {
      console.error('Failed to complete step', e);
    }
  };

  const navigateTo = (tab) => {
    window.dispatchEvent(new CustomEvent('changeTab', { detail: tab }));
  };

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = STEPS.length;
  const progress = (completedCount / totalSteps) * 100;
  const totalPoints = steps.filter(s => s.completed).reduce((acc, s) => acc + (REWARDS[s.step]?.points || 0), 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #020818 0%, #040d20 35%, #060f1c 60%, #030a14 100%)',
      color: '#e0e0f0',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    }}>
      <header style={{ padding:"18px 32px",display:"flex",alignItems:"center",backdropFilter:"blur(24px)",position:"sticky",top:0,background:"rgba(13,11,34,0.82)",borderBottom:"1px solid rgba(99,102,241,0.13)",zIndex:20 }}>
        <div style={{ flex:1,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:8,height:8,background:"#f59e0b",borderRadius:"50%",boxShadow:"0 0 8px #f59e0b" }}/>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"0.1em",color:"#fff" }}>TALENT<span style={{ color:"#f59e0b" }}>DASH</span></span>
          <span style={{ color:"rgba(99,102,241,0.3)",margin:"0 6px" }}>·</span>
          <span style={{ fontSize:11,color:"#a5b4fc",letterSpacing:"0.1em" }}>ACTIVATION</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={() => navigateTo('hub')} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Dashboard</button>
        </div>
        <div style={{ flex:1 }}/>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
          .step-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 16px;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.3s;
          }
          .step-card:hover {
            border-color: rgba(245,158,11,0.3);
            background: rgba(245,158,11,0.04);
          }
          .step-card.done {
            border-color: rgba(16,185,129,0.25);
            background: rgba(16,185,129,0.05);
            opacity: 0.7;
          }
          .btn-act {
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:42,fontWeight:800,color:'#fff',marginBottom:12 }}>
            Your <span style={{ color:'#f59e0b' }}>Activation</span> Journey
          </h1>
          <p style={{ color:'#697298',fontSize:14,lineHeight:1.7,maxWidth:480,margin:'0 auto' }}>
            Complete each step to unlock the full power of TalentDash and earn achievement badges.
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '24px',
          marginBottom: 32,
        }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
            <div style={{ fontSize:12,color:'#697298',letterSpacing:'0.06em' }}>OVERALL PROGRESS</div>
            <div style={{ fontSize:13,color:'#f59e0b',fontWeight:600 }}>{completedCount}/{totalSteps} steps · {totalPoints} pts</div>
          </div>
          <div style={{ width:'100%',height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${progress}%`,background:'linear-gradient(90deg,#f59e0b,#d97706)',borderRadius:3,transition:'width 0.8s cubic-bezier(.4,0,.2,1)' }}/>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center',padding:40,color:'#697298' }}>Loading...</div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {STEPS.map((step, i) => {
              const done = isComplete(step.id);
              return (
                <div key={step.id} className={`step-card ${done ? 'done' : ''}`}>
                  <div style={{
                    width:44,height:44,borderRadius:12,
                    background: done ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.1)',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:2 }}>
                      <span style={{ fontSize:16 }}>{step.icon}</span>
                      <span style={{ fontWeight:600,fontSize:14,color:done?'#10b981':'#e0e0f0' }}>{step.label}</span>
                      {done && <span style={{ fontSize:10,color:'#10b981',background:'rgba(16,185,129,0.1)',padding:'2px 8px',borderRadius:4 }}>✓ Done</span>}
                    </div>
                    <div style={{ fontSize:12,color:'#697298' }}>{step.desc}</div>
                  </div>
                  <div style={{ textAlign:'right',flexShrink:0 }}>
                    <div style={{ fontSize:10,color:'#4a5070',marginBottom:4 }}>+{REWARDS[step.id].points} pts</div>
                    {done ? (
                      <span style={{ fontSize:10,color:'#10b981',background:'rgba(16,185,129,0.1)',padding:'4px 10px',borderRadius:6 }}>{REWARDS[step.id].badge}</span>
                    ) : (
                      <button
                        className="btn-act"
                        style={{
                          background:'linear-gradient(135deg,#f59e0b,#d97706)',
                          color:'#fff',border:'none',
                        }}
                        onClick={() => {
                          const tabMap = { resume:'resume', salary:'salary', offer:'offer', contribute:'contribute' };
                          if (step.id === 'profile') {
                            navigateTo('onboarding');
                            completeStep('profile');
                          } else if (step.id === 'contribute') {
                            navigateTo('contribute');
                          } else {
                            navigateTo(tabMap[step.id]);
                          }
                        }}
                      >
                        {step.id === 'profile' ? 'Setup →' : step.id === 'contribute' ? 'Contribute →' : 'Launch →'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
