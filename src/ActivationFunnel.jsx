import React, { useState, useEffect } from 'react';
import './ActivationFunnel.css';

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
    <div className="af-container">
      <header className="af-header">
        <div className="af-header-left">
          <div className="af-logo-dot"/>
          <span className="af-brand">TALENT<span className="af-highlight">DASH</span></span>
          <span className="af-separator">·</span>
          <span className="af-activation-label">ACTIVATION</span>
        </div>
        <div className="af-header-right">
          <button className="af-dashboard-btn" onClick={() => navigateTo('hub')}>Dashboard</button>
        </div>
        <div className="af-header-spacer"/>
      </header>

      <div className="af-content">


        <div className="af-title-section">
          <h1 className="af-title">
            Your <span className="af-highlight">Activation</span> Journey
          </h1>
          <p className="af-subtitle">
            Complete each step to unlock the full power of TalentDash and earn achievement badges.
          </p>
        </div>

        <div className="af-progress-card">
          <div className="af-progress-header">
            <div className="af-progress-label">OVERALL PROGRESS</div>
            <div className="af-progress-stats">{completedCount}/{totalSteps} steps · {totalPoints} pts</div>
          </div>
          <div className="af-progress-track">
            <div className="af-progress-fill" style={{ width: `${progress}%` }}/>
          </div>
        </div>

        {loading ? (
          <div className="af-loading">Loading...</div>
        ) : (
          <div className="af-steps">
            {STEPS.map((step, i) => {
              const done = isComplete(step.id);
              return (
                <div key={step.id} className={`step-card ${done ? 'done' : ''}`}>
                  <div className="af-step-icon" style={{ background: done ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.1)' }}>
                    {done ? '✓' : i + 1}
                  </div>
                    <div className="af-step-content">
                      <div className="af-step-title-row">
                        <span className="af-step-icon-emoji">{step.icon}</span>
                        <span className="af-step-label" style={{ color: done ? '#10b981' : '#e0e0f0' }}>{step.label}</span>
                        {done && <span className="af-step-done-badge">✓ Done</span>}
                      </div>
                      <div className="af-step-desc">{step.desc}</div>
                    </div>
                  <div className="af-step-right">
                    <div className="af-step-points">+{REWARDS[step.id].points} pts</div>
                    {done ? (
                      <span className="af-step-badge">{REWARDS[step.id].badge}</span>
                    ) : (
                      <button
                        className="btn-act"
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
