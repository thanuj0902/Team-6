import React, { useState } from 'react';
import './GrowthExperiments.css';

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
    <div className="ge-page">
      <header className="ge-header">
        <div className="ge-header-left">
          <div className="ge-dot" />
          <span className="ge-logo">TALENT<span className="ge-logo-highlight">DASH</span></span>
          <span className="ge-separator">·</span>
          <span className="ge-growth-label">GROWTH</span>
        </div>
        <div className="ge-header-actions">
          <button onClick={() => navigateTo('hub')} className="ge-dashboard-btn">Dashboard</button>
        </div>
        <div className="ge-spacer" />
      </header>

      <div className="ge-container">
        <div className="ge-section-header">
          <h1 className="ge-page-title">
            <span className="ge-page-title-highlight">Growth</span> Experiments
          </h1>
          <p className="ge-page-subtitle">Share TalentDash with friends and help us grow the community.</p>
        </div>

        <div className="ge-tab-row">
          <button className={`tab-btn ${tab === 'refer' ? 'active' : ''}`} onClick={() => setTab('refer')}>🔗 Refer & Earn</button>
          <button className={`tab-btn ${tab === 'share' ? 'active' : ''}`} onClick={() => setTab('share')}>📤 Share Results</button>
          <button className={`tab-btn ${tab === 'invite' ? 'active' : ''}`} onClick={() => setTab('invite')}>✉️ Invite Friends</button>
        </div>

        {tab === 'refer' && (
          <div className="card">
            <div className="ge-emoji-icon">🔗</div>
            <h2 className="ge-card-title">Refer & Earn Points</h2>
            <p className="ge-card-text">
              Share your referral link. When friends join and complete their activation, you earn bonus points.
            </p>
            <div className="ge-input-row">
              <input readOnly value={referralLink} className="ge-inline-input" />
              <button onClick={() => shareResults('copy')} className="ge-primary-btn">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="ge-card-footnote">Earn 50 points per referral who completes activation</div>
          </div>
        )}

        {tab === 'share' && (
          <div className="card">
            <div className="ge-emoji-icon">📤</div>
            <h2 className="ge-card-title">Share Your Results</h2>
            <p className="ge-card-text-lg">
              Spread the word on social media. Every share helps someone discover their market worth.
            </p>
            <div className="ge-share-stack">
              <button className="share-btn ge-share-twitter" onClick={() => shareResults('twitter')}>
                <span>🐦</span> Share on Twitter
              </button>
              <button className="share-btn ge-share-linkedin" onClick={() => shareResults('linkedin')}>
                <span>💼</span> Share on LinkedIn
              </button>
              <button className="share-btn ge-share-whatsapp" onClick={() => shareResults('whatsapp')}>
                <span>💬</span> Share on WhatsApp
              </button>
            </div>
          </div>
        )}

        {tab === 'invite' && (
          <div className="card">
            <div className="ge-emoji-icon">✉️</div>
            <h2 className="ge-card-title">Invite via Email</h2>
            <p className="ge-card-text">
              Send a personalized invite to your friends and colleagues.
            </p>
            <div className="ge-invite-input-row">
              <input
                placeholder="friend@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="ge-email-input"
              />
              <button onClick={sendInvite} className="ge-invite-btn">
                {sent ? 'Sent!' : 'Invite'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
