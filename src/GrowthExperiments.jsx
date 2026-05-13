import React, { useState } from 'react';

export default function GrowthExperiments() {
  const [tab, setTab] = useState('refer');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const userId = localStorage.getItem('userId');
  const referralCode = userId ? userId.slice(0, 8) : 'guest';
  const referralLink = `https://talentdash.ai/ref/${referralCode}`;

  const shareResults = async (platform) => {
    const texts = {
      twitter: 'I just analyzed my offer on TalentDash — check it out!',
      linkedin: 'Just benchmarked my compensation using TalentDash. Great tool for tech professionals!',
      whatsapp: `Check out TalentDash - I used it to analyze my offer: ${referralLink}`,
    };

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(texts.twitter)}&url=${encodeURIComponent(referralLink)}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(texts.whatsapp)}`,
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
      return;
    }

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const sendInvite = async () => {
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3000);

    if (userId) {
      try {
        await fetch('http://localhost:3001/api/activity/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action: 'sent_invite', metadata: { email } }),
        });
      } catch {}
    }
  };

  const navigateTo = (tab) => window.dispatchEvent(new CustomEvent('changeTab', { detail: tab }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #020818 0%, #040d20 35%, #060f1c 60%, #030a14 100%)',
      color: '#e0e0f0',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    }}>
      <header style={{ padding:"18px 32px",display:"flex",alignItems:"center",backdropFilter:"blur(24px)",position:"sticky",top:0,background:"rgba(13,11,34,0.82)",borderBottom:"1px solid rgba(99,102,241,0.13)",zIndex:20 }}>
        <div style={{ flex:1,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:8,height:8,background:"#ec4899",borderRadius:"50%",boxShadow:"0 0 8px #ec4899" }}/>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"0.1em",color:"#fff" }}>TALENT<span style={{ color:"#ec4899" }}>DASH</span></span>
          <span style={{ color:"rgba(99,102,241,0.3)",margin:"0 6px" }}>·</span>
          <span style={{ fontSize:11,color:"#a5b4fc",letterSpacing:"0.1em" }}>GROWTH</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={() => navigateTo('hub')} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Dashboard</button>
        </div>
        <div style={{ flex:1 }}/>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
          .tab-btn {
            padding:10px 20px;border-radius:8px;font-size:12px;font-family:inherit;cursor:pointer;
            transition:all 0.2s;border:1.5px solid rgba(255,255,255,0.08);background:transparent;color:#697298;
          }
          .tab-btn.active { border-color:#ec4899;background:rgba(236,72,153,0.12);color:#f9a8d4;font-weight:600; }
          .card {
            background: rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
            border-radius:16px;padding:24px;text-align:center;
          }
          .share-btn {
            display:flex;align-items:center;justify-content:center;gap:8;
            width:100%;padding:14px;border-radius:10px;border:none;
            font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;
          }
        `}</style>

        <div style={{ textAlign:'center',marginBottom:40 }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,color:'#fff',marginBottom:8 }}>
            <span style={{ color:'#ec4899' }}>Growth</span> Experiments
          </h1>
          <p style={{ color:'#697298',fontSize:13 }}>Share TalentDash with friends and help us grow the community.</p>
        </div>

        <div style={{ display:'flex',gap:8,marginBottom:28,justifyContent:'center' }}>
          <button className={`tab-btn ${tab === 'refer' ? 'active' : ''}`} onClick={() => setTab('refer')}>🔗 Refer & Earn</button>
          <button className={`tab-btn ${tab === 'share' ? 'active' : ''}`} onClick={() => setTab('share')}>📤 Share Results</button>
          <button className={`tab-btn ${tab === 'invite' ? 'active' : ''}`} onClick={() => setTab('invite')}>✉️ Invite Friends</button>
        </div>

        {tab === 'refer' && (
          <div className="card">
            <div style={{ fontSize:48,marginBottom:12 }}>🔗</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:22,color:'#fff',marginBottom:8 }}>Refer & Earn Points</h2>
            <p style={{ color:'#697298',fontSize:13,lineHeight:1.7,marginBottom:20 }}>
              Share your referral link. When friends join and complete their activation, you earn bonus points.
            </p>
            <div style={{ display:'flex',gap:8,marginBottom:16 }}>
              <input readOnly value={referralLink} style={{
                flex:1,padding:'12px 16px',background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,
                color:'#a5b4fc',fontSize:12,fontFamily:'monospace',outline:'none',
              }} />
              <button onClick={() => shareResults('copy')} style={{
                padding:'12px 20px',background:'linear-gradient(135deg,#ec4899,#db2777)',
                color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:12,
              }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ fontSize:11,color:'#4a5070' }}>Earn 50 points per referral who completes activation</div>
          </div>
        )}

        {tab === 'share' && (
          <div className="card">
            <div style={{ fontSize:48,marginBottom:12 }}>📤</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:22,color:'#fff',marginBottom:8 }}>Share Your Results</h2>
            <p style={{ color:'#697298',fontSize:13,lineHeight:1.7,marginBottom:24 }}>
              Spread the word on social media. Every share helps someone discover their market worth.
            </p>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <button className="share-btn" style={{ background:'#1da1f2',color:'#fff' }} onClick={() => shareResults('twitter')}>
                <span>🐦</span> Share on Twitter
              </button>
              <button className="share-btn" style={{ background:'#0a66c2',color:'#fff' }} onClick={() => shareResults('linkedin')}>
                <span>💼</span> Share on LinkedIn
              </button>
              <button className="share-btn" style={{ background:'#25d366',color:'#fff' }} onClick={() => shareResults('whatsapp')}>
                <span>💬</span> Share on WhatsApp
              </button>
            </div>
          </div>
        )}

        {tab === 'invite' && (
          <div className="card">
            <div style={{ fontSize:48,marginBottom:12 }}>✉️</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:22,color:'#fff',marginBottom:8 }}>Invite via Email</h2>
            <p style={{ color:'#697298',fontSize:13,lineHeight:1.7,marginBottom:20 }}>
              Send a personalized invite to your friends and colleagues.
            </p>
            <div style={{ display:'flex',gap:8 }}>
              <input
                placeholder="friend@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex:1,padding:'12px 16px',background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,
                  color:'#e8e8f0',fontSize:13,fontFamily:'inherit',outline:'none',
                }}
              />
              <button onClick={sendInvite} style={{
                padding:'12px 24px',background:'linear-gradient(135deg,#ec4899,#db2777)',
                color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:12,
              }}>
                {sent ? 'Sent!' : 'Invite'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
