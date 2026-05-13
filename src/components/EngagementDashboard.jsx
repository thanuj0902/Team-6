import React, { useState, useEffect } from 'react';

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
    <div className="min-h-screen text-[#e0e0f0] font-['Space_Grotesk','Inter',sans-serif] bg-[linear-gradient(145deg,#020818_0%,#040d20_35%,#060f1c_60%,#030a14_100%)]">
      <header className="sticky top-0 z-20 flex items-center px-8 py-[18px] bg-[rgba(13,11,34,0.82)] backdrop-blur-[24px] border-b border-[rgba(99,102,241,0.13)]">
        <div className="flex items-center flex-1 gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"/>
          <span className="font-['Syne',sans-serif] font-extrabold text-base tracking-[0.1em] text-white">TALENT<span className="text-emerald-500">DASH</span></span>
          <span className="text-[rgba(99,102,241,0.3)] mx-1.5">·</span>
          <span className="text-[11px] text-indigo-300 tracking-[0.1em]">ENGAGEMENT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => navigateTo('hub')} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer hover:bg-white/5">Dashboard</button>
        </div>
        <div className="flex-1"/>
      </header>

      <div className="max-w-[800px] mx-auto px-6 py-10">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
          .card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 16px;
            padding: 20px 24px;
          }
          .badge {
            display: inline-flex;align-items:center;gap:8;
            padding: 10px 16px;border-radius: 10px;
            font-size: 12px;transition: all 0.2s;
          }
          .badge.earned {
            background: rgba(16,185,129,0.1);
            border: 1px solid rgba(16,185,129,0.2);
            color: #6ee7b7;
          }
          .badge.locked {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.06);
            color: #4a5070;
            opacity: 0.6;
          }
        `}</style>

        {!userId ? (
          <div className="text-center p-[60px]">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-['Syne',sans-serif] text-2xl text-white mb-2">Sign in to track engagement</h2>
            <p className="text-[#697298] text-[13px] mb-5">Create an account to unlock streaks, badges, and activity tracking.</p>
            <button onClick={() => navigateTo('onboarding')} className="px-6 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 rounded-[10px] cursor-pointer font-semibold hover:from-emerald-400 hover:to-emerald-500">
              Create Free Account
            </button>
          </div>
        ) : loading ? (
          <div className="text-center p-10 text-[#697298]">Loading...</div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="font-['Syne',sans-serif] text-4xl font-extrabold text-white mb-2">
                Your <span className="text-emerald-500">Activity</span>
              </h1>
              <p className="text-[#697298] text-[13px]">Track your journey, maintain streaks, and earn badges.</p>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="card text-center">
                <div className="text-[28px] font-bold text-emerald-500">{streak?.currentStreak || 0}</div>
                <div className="text-[10px] text-[#697298] mt-1">DAY STREAK</div>
              </div>
              <div className="card text-center">
                <div className="text-[28px] font-bold text-emerald-500">{streak?.longestStreak || 0}</div>
                <div className="text-[10px] text-[#697298] mt-1">BEST STREAK</div>
              </div>
              <div className="card text-center">
                <div className="text-[28px] font-bold text-emerald-500">{stats?.total || 0}</div>
                <div className="text-[10px] text-[#697298] mt-1">ACTIONS</div>
              </div>
              <div className="card text-center">
                <div className="text-[28px] font-bold text-emerald-500">{stats?.contributions || 0}</div>
                <div className="text-[10px] text-[#697298] mt-1">CONTRIBUTIONS</div>
              </div>
            </div>

            <div className="card mb-6">
              <div className="text-[11px] text-[#697298] tracking-[0.06em] mb-4">ACHIEVEMENT BADGES</div>
              <div className="flex flex-wrap gap-2">
                {badges.map(b => (
                  <div key={b.name} className={`badge ${b.earned ? 'earned' : 'locked'}`}>
                    <span>{b.earned ? '🏅' : '🔒'}</span>
                    <div>
                      <div className="font-semibold text-xs">{b.name}</div>
                      <div className="text-[10px] opacity-70">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="text-[11px] text-[#697298] tracking-[0.06em] mb-4">RECENT ACTIVITY</div>
              {activities.length === 0 ? (
                <div className="text-center p-8 text-[#4a5070] text-[13px]">
                  No activity yet. Start using the tools to build your history.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {activities.map((act, i) => (
                    <div key={act.id || i} className="flex justify-between items-center px-3.5 py-2.5 bg-[rgba(255,255,255,0.02)] rounded-[10px] border border-[rgba(255,255,255,0.04)]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">
                          {act.action.includes('resume') ? '📄' : act.action.includes('salary') || act.action.includes('offer') ? '💰' : act.action.includes('contribute') ? '📊' : '👤'}
                        </span>
                        <span className="text-[13px] text-[#c8d0e8]">
                          {ACTION_LABELS[act.action] || act.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#4a5070]">{formatDate(act.createdAt)}</span>
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
