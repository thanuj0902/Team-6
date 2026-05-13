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
    <div className="min-h-screen bg-[linear-gradient(145deg,#020818_0%,#040d20_35%,#060f1c_60%,#030a14_100%)] text-[#e0e0f0] font-['Space_Grotesk','Inter',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>
      <header className="py-[18px] px-8 flex items-center backdrop-blur-3xl sticky top-0 bg-[rgba(13,11,34,0.82)] border-b border-[rgba(99,102,241,0.13)] z-20">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
          <span className="font-['Syne',sans-serif] font-extrabold text-base tracking-[0.1em] text-white">TALENT<span className="text-amber-400">DASH</span></span>
          <span className="text-[rgba(99,102,241,0.3)] mx-1.5">·</span>
          <span className="text-[11px] text-indigo-300 tracking-[0.1em]">ACTIVATION</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={() => navigateTo('hub')} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded text-[#8890b0] cursor-pointer">Dashboard</button>
        </div>
        <div className="flex-1" />
      </header>

      <div className="max-w-[720px] mx-auto px-6 py-10">
        <div className="text-center mb-12">
          <h1 className="font-['Syne',sans-serif] text-[42px] font-extrabold text-white mb-3">
            Your <span className="text-amber-400">Activation</span> Journey
          </h1>
          <p className="text-[#697298] text-sm leading-relaxed max-w-[480px] mx-auto">
            Complete each step to unlock the full power of TalentDash and earn achievement badges.
          </p>
        </div>

        <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(255,255,255,0.07)] p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-[#697298] tracking-[0.06em]">OVERALL PROGRESS</div>
            <div className="text-[13px] text-amber-400 font-semibold">{completedCount}/{totalSteps} steps · {totalPoints} pts</div>
          </div>
          <div className="w-full h-1.5 bg-[rgba(255,255,255,0.06)] rounded-[3px] overflow-hidden">
            <div className="h-full bg-[linear-gradient(90deg,#f59e0b,#d97706)] rounded-[3px] duration-[800ms] ease-[cubic-bezier(.4,0,.2,1)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {loading ? (
          <div className="text-center p-10 text-[#697298]">Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {STEPS.map((step, i) => {
              const done = isComplete(step.id);
              return (
                <div key={step.id} className={`rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:border-[rgba(245,158,11,0.3)] hover:bg-[rgba(245,158,11,0.04)] ${done ? 'border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.05)] opacity-70' : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)]'}`}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: done ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.1)' }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">{step.icon}</span>
                      <span className="font-semibold text-sm" style={{ color: done ? '#10b981' : '#e0e0f0' }}>{step.label}</span>
                      {done && <span className="text-[10px] text-emerald-500 bg-[rgba(16,185,129,0.1)] px-2 py-0.5 rounded">✓ Done</span>}
                    </div>
                    <div className="text-xs text-[#697298]">{step.desc}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[#4a5070] mb-1">+{REWARDS[step.id].points} pts</div>
                    {done ? (
                      <span className="text-[10px] text-emerald-500 bg-[rgba(16,185,129,0.1)] px-2.5 py-1 rounded-md">{REWARDS[step.id].badge}</span>
                    ) : (
                      <button
                        className="px-5 py-2.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all duration-200 bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white border-none"
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
