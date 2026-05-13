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
    <div className="min-h-screen bg-[linear-gradient(145deg,#020818_0%,#040d20_35%,#060f1c_60%,#030a14_100%)] text-[#e0e0f0] font-['Space_Grotesk','Inter',sans-serif]">
      <header className="px-8 py-[18px] flex items-center backdrop-blur-xl sticky top-0 bg-[rgba(13,11,34,0.82)] border-b border-[rgba(99,102,241,0.13)] z-20">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_#ec4899]" />
          <span className="font-['Syne',sans-serif] font-extrabold text-base tracking-[0.1em] text-white">TALENT<span className="text-pink-500">DASH</span></span>
          <span className="text-indigo-400/30 mx-1.5">·</span>
          <span className="text-[11px] text-indigo-300 tracking-[0.1em]">GROWTH</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={() => navigateTo('hub')} className="px-3 py-1.5 text-[11px] bg-transparent border border-white/10 rounded-[6px] text-[#8890b0] cursor-pointer">Dashboard</button>
        </div>
        <div className="flex-1" />
      </header>

      <div className="max-w-[640px] mx-auto px-6 py-10">
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

        <div className="text-center mb-10">
          <h1 className="font-['Syne',sans-serif] text-4xl font-extrabold text-white mb-2">
            <span className="text-pink-500">Growth</span> Experiments
          </h1>
          <p className="text-[#697298] text-[13px]">Share TalentDash with friends and help us grow the community.</p>
        </div>

        <div className="flex gap-2 mb-7 justify-center">
          <button className={`tab-btn ${tab === 'refer' ? 'active' : ''}`} onClick={() => setTab('refer')}>🔗 Refer & Earn</button>
          <button className={`tab-btn ${tab === 'share' ? 'active' : ''}`} onClick={() => setTab('share')}>📤 Share Results</button>
          <button className={`tab-btn ${tab === 'invite' ? 'active' : ''}`} onClick={() => setTab('invite')}>✉️ Invite Friends</button>
        </div>

        {tab === 'refer' && (
          <div className="card">
            <div className="text-5xl mb-3">🔗</div>
            <h2 className="font-['Syne',sans-serif] text-[22px] text-white mb-2">Refer & Earn Points</h2>
            <p className="text-[#697298] text-[13px] leading-[1.7] mb-5">
              Share your referral link. When friends join and complete their activation, you earn bonus points.
            </p>
            <div className="flex gap-2 mb-4">
              <input readOnly value={referralLink} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-[10px] text-indigo-300 text-xs font-mono outline-none" />
              <button onClick={() => shareResults('copy')} className="px-5 py-3 bg-gradient-to-br from-pink-500 to-pink-700 text-white border-none rounded-[10px] cursor-pointer font-semibold text-xs">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="text-[11px] text-[#4a5070]">Earn 50 points per referral who completes activation</div>
          </div>
        )}

        {tab === 'share' && (
          <div className="card">
            <div className="text-5xl mb-3">📤</div>
            <h2 className="font-['Syne',sans-serif] text-[22px] text-white mb-2">Share Your Results</h2>
            <p className="text-[#697298] text-[13px] leading-[1.7] mb-6">
              Spread the word on social media. Every share helps someone discover their market worth.
            </p>
            <div className="flex flex-col gap-2.5">
              <button className="share-btn bg-[#1da1f2] text-white" onClick={() => shareResults('twitter')}>
                <span>🐦</span> Share on Twitter
              </button>
              <button className="share-btn bg-[#0a66c2] text-white" onClick={() => shareResults('linkedin')}>
                <span>💼</span> Share on LinkedIn
              </button>
              <button className="share-btn bg-[#25d366] text-white" onClick={() => shareResults('whatsapp')}>
                <span>💬</span> Share on WhatsApp
              </button>
            </div>
          </div>
        )}

        {tab === 'invite' && (
          <div className="card">
            <div className="text-5xl mb-3">✉️</div>
            <h2 className="font-['Syne',sans-serif] text-[22px] text-white mb-2">Invite via Email</h2>
            <p className="text-[#697298] text-[13px] leading-[1.7] mb-5">
              Send a personalized invite to your friends and colleagues.
            </p>
            <div className="flex gap-2">
              <input
                placeholder="friend@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-[10px] text-[#e8e8f0] text-[13px] font-['inherit'] outline-none"
              />
              <button onClick={sendInvite} className="px-6 py-3 bg-gradient-to-br from-pink-500 to-pink-700 text-white border-none rounded-[10px] cursor-pointer font-semibold text-xs">
                {sent ? 'Sent!' : 'Invite'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
