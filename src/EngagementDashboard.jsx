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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #020818 0%, #040d20 35%, #060f1c 60%, #030a14 100%)',
      color: '#e0e0f0',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    }}>
      <header style={{ padding:"18px 32px",display:"flex",alignItems:"center",backdropFilter:"blur(24px)",position:"sticky",top:0,background:"rgba(13,11,34,0.82)",borderBottom:"1px solid rgba(99,102,241,0.13)",zIndex:20 }}>
        <div style={{ flex:1,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:8,height:8,background:"#10b981",borderRadius:"50%",boxShadow:"0 0 8px #10b981" }}/>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"0.1em",color:"#fff" }}>TALENT<span style={{ color:"#10b981" }}>DASH</span></span>
          <span style={{ color:"rgba(99,102,241,0.3)",margin:"0 6px" }}>·</span>
          <span style={{ fontSize:11,color:"#a5b4fc",letterSpacing:"0.1em" }}>ENGAGEMENT</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={() => navigateTo('hub')} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Dashboard</button>
        </div>
        <div style={{ flex:1 }}/>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
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
          <div style={{ textAlign:'center',padding:60 }}>
            <div style={{ fontSize:48,marginBottom:16 }}>🔒</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:24,color:'#fff',marginBottom:8 }}>Sign in to track engagement</h2>
            <p style={{ color:'#697298',fontSize:13,marginBottom:20 }}>Create an account to unlock streaks, badges, and activity tracking.</p>
            <button onClick={() => navigateTo('onboarding')} style={{ padding:'12px 24px',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:600 }}>
              Create Free Account
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign:'center',padding:40,color:'#697298' }}>Loading...</div>
        ) : (
          <>
            <div style={{ textAlign:'center',marginBottom:40 }}>
              <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,color:'#fff',marginBottom:8 }}>
                Your <span style={{ color:'#10b981' }}>Activity</span>
              </h1>
              <p style={{ color:'#697298',fontSize:13 }}>Track your journey, maintain streaks, and earn badges.</p>
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:24 }}>
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:28,fontWeight:700,color:'#10b981' }}>{streak?.currentStreak || 0}</div>
                <div style={{ fontSize:10,color:'#697298',marginTop:4 }}>DAY STREAK</div>
              </div>
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:28,fontWeight:700,color:'#10b981' }}>{streak?.longestStreak || 0}</div>
                <div style={{ fontSize:10,color:'#697298',marginTop:4 }}>BEST STREAK</div>
              </div>
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:28,fontWeight:700,color:'#10b981' }}>{stats?.total || 0}</div>
                <div style={{ fontSize:10,color:'#697298',marginTop:4 }}>ACTIONS</div>
              </div>
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:28,fontWeight:700,color:'#10b981' }}>{stats?.contributions || 0}</div>
                <div style={{ fontSize:10,color:'#697298',marginTop:4 }}>CONTRIBUTIONS</div>
              </div>
            </div>

            <div className="card" style={{ marginBottom:24 }}>
              <div style={{ fontSize:11,color:'#697298',letterSpacing:'0.06em',marginBottom:16 }}>ACHIEVEMENT BADGES</div>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                {badges.map(b => (
                  <div key={b.name} className={`badge ${b.earned ? 'earned' : 'locked'}`}>
                    <span>{b.earned ? '🏅' : '🔒'}</span>
                    <div>
                      <div style={{ fontWeight:600,fontSize:12 }}>{b.name}</div>
                      <div style={{ fontSize:10,opacity:0.7 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize:11,color:'#697298',letterSpacing:'0.06em',marginBottom:16 }}>RECENT ACTIVITY</div>
              {activities.length === 0 ? (
                <div style={{ textAlign:'center',padding:30,color:'#4a5070',fontSize:13 }}>
                  No activity yet. Start using the tools to build your history.
                </div>
              ) : (
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {activities.map((act, i) => (
                    <div key={act.id || i} style={{
                      display:'flex',justifyContent:'space-between',alignItems:'center',
                      padding:'10px 14px',background:'rgba(255,255,255,0.02)',borderRadius:10,
                      border:'1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <span style={{ fontSize:16 }}>
                          {act.action.includes('resume') ? '📄' : act.action.includes('salary') || act.action.includes('offer') ? '💰' : act.action.includes('contribute') ? '📊' : '👤'}
                        </span>
                        <span style={{ fontSize:13,color:'#c8d0e8' }}>
                          {ACTION_LABELS[act.action] || act.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span style={{ fontSize:10,color:'#4a5070' }}>{formatDate(act.createdAt)}</span>
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
