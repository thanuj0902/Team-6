import React, { useState, useEffect } from 'react';
import './EngagementDashboard.css';

const ACTION_LABELS = {
  completed_profile: 'Completed profile setup',
  completed_resume: 'Analyzed resume',
  completed_salary: 'Calculated salary range',
  completed_offer: 'Evaluated an offer',
  completed_contribute: 'Contributed data',
  contributed_data: 'Shared salary/review data',
  analyzed_resume: 'Ran resume analysis',
  calculated_salary: 'Used salary calculator',
  evaluated_offer: 'Evaluated an offer',
};

export default function EngagementDashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    Promise.all([
      fetch(`http://localhost:3001/api/user/stats?userId=${userId}`).then(r => r.json()),
      fetch(`http://localhost:3001/api/activity?userId=${userId}`).then(r => r.json()),
      fetch(`http://localhost:3001/api/streak?userId=${userId}`).then(r => r.json()),
    ]).then(([statsRes, actRes, streakRes]) => {
      setStats(statsRes.data);
      setActivities(actRes.data || []);
      setStreak(streakRes.data);
      fetch('http://localhost:3001/api/streak/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).then(r => r.json()).then(d => setStreak(d.data)).catch(() => {});
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const navigateTo = (tab) => window.dispatchEvent(new CustomEvent('changeTab', { detail: tab }));

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const badges = [
    { name: 'Early Adopter', desc: 'Joined in the first month', earned: true },
    { name: 'Data Champion', desc: 'Contributed 5+ data points', earned: (stats?.contributions || 0) >= 5 },
    { name: 'Resume Star', desc: 'Analyzed 3+ resumes', earned: (stats?.resumes || 0) >= 3 },
    { name: 'Streak Master', desc: '7-day login streak', earned: (streak?.longestStreak || 0) >= 7 },
    { name: 'Offer Expert', desc: 'Evaluated 10+ offers', earned: (stats?.offers || 0) >= 10 },
    { name: 'Market Scout', desc: '5+ salary calculations', earned: (stats?.salaries || 0) >= 5 },
  ];

  return (
    <div className="ed-container">
      <header className="ed-header">
        <div className="ed-header-left">
          <div className="ed-dot" />
          <span className="ed-logo">TALENT<span className="ed-logo-accent">DASH</span></span>
          <span className="ed-sep">·</span>
          <span className="ed-label">ENGAGEMENT</span>
        </div>
        <div className="ed-header-right">
          <button onClick={() => navigateTo('hub')} className="ed-dashboard-btn">Dashboard</button>
        </div>
        <div className="ed-header-spacer" />
      </header>

      <div className="ed-main">
        {!userId ? (
          <div className="ed-signed-out">
            <div className="ed-lock-icon">🔒</div>
            <h2 className="ed-heading">Sign in to track engagement</h2>
            <p className="ed-description">Create an account to unlock streaks, badges, and activity tracking.</p>
            <button onClick={() => navigateTo('onboarding')} className="ed-cta-btn">
              Create Free Account
            </button>
          </div>
        ) : loading ? (
          <div className="ed-loading">Loading...</div>
        ) : (
          <>
            <div className="ed-section-header">
              <h1 className="ed-page-title">
                Your <span className="ed-page-title-accent">Activity</span>
              </h1>
              <p className="ed-page-subtitle">Track your journey, maintain streaks, and earn badges.</p>
            </div>

            <div className="ed-stats-grid">
              <div className="card ed-stat-card">
                <div className="ed-stat-value">{streak?.currentStreak || 0}</div>
                <div className="ed-stat-label">DAY STREAK</div>
              </div>
              <div className="card ed-stat-card">
                <div className="ed-stat-value">{streak?.longestStreak || 0}</div>
                <div className="ed-stat-label">BEST STREAK</div>
              </div>
              <div className="card ed-stat-card">
                <div className="ed-stat-value">{stats?.total || 0}</div>
                <div className="ed-stat-label">ACTIONS</div>
              </div>
              <div className="card ed-stat-card">
                <div className="ed-stat-value">{stats?.contributions || 0}</div>
                <div className="ed-stat-label">CONTRIBUTIONS</div>
              </div>
            </div>

            <div className="card ed-achievements-card">
              <div className="ed-section-label">ACHIEVEMENT BADGES</div>
              <div className="ed-badges-container">
                {badges.map(b => (
                  <div key={b.name} className={`ed-badge ${b.earned ? 'earned' : 'locked'}`}>
                    <span>{b.earned ? '🏅' : '🔒'}</span>
                    <div>
                      <div className="ed-badge-name">{b.name}</div>
                      <div className="ed-badge-desc">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ed-card">
              <div className="ed-section-label">RECENT ACTIVITY</div>
              {activities.length === 0 ? (
                <div className="ed-empty-activity">
                  No activity yet. Start using the tools to build your history.
                </div>
              ) : (
                <div className="ed-activity-list">
                  {activities.map((act, i) => (
                    <div key={act.id || i} className="ed-activity-item">
                      <div className="ed-activity-left">
                        <span className="ed-activity-emoji">
                          {act.action.includes('resume') ? '📄' : act.action.includes('salary') || act.action.includes('offer') ? '💰' : act.action.includes('contribute') ? '📊' : '👤'}
                        </span>
                        <span className="ed-activity-action">
                          {ACTION_LABELS[act.action] || act.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="ed-activity-date">{formatDate(act.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
