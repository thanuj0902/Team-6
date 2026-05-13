import React from 'react';
import './ToolsHub.css';

const ToolsHub = ({ onSelectTool }) => {
  const tools = [
    {
      id: 'salary',
      name: 'Salary Calculator',
      description: 'Benchmark your current or expected salary against 4Cr+ market data points.',
      icon: '💰',
      color: '#6366f1',
      tag: 'Market Insights'
    },
    {
      id: 'resume',
      name: 'Resume Analyzer',
      description: 'AI-powered ATS scoring and skill gap analysis to optimize your profile.',
      icon: '📄',
      color: '#00ff9d',
      tag: 'AI Profiling'
    },
    {
      id: 'offer',
      name: 'Offer Calculator',
      description: 'Decode your offer letter and compare it against top-tier company benchmarks.',
      icon: '✉️',
      color: '#a855f7',
      tag: 'Negotiation'
    },
    {
      id: 'activation',
      name: 'Activation Journey',
      description: 'Guided onboarding checklist to unlock all features and earn badges.',
      icon: '🚀',
      color: '#f59e0b',
      tag: 'Growth'
    },
    {
      id: 'contribute',
      name: 'Contribute Data',
      description: 'Share salary data and company reviews to help the community.',
      icon: '📊',
      color: '#8b5cf6',
      tag: 'Community'
    },
    {
      id: 'engagement',
      name: 'Activity Dashboard',
      description: 'Track streaks, earn badges, and monitor your engagement history.',
      icon: '🏆',
      color: '#10b981',
      tag: 'Engagement'
    },
    {
      id: 'growth',
      name: 'Growth Experiments',
      description: 'Refer friends, share results, and help us grow the TalentDash community.',
      icon: '🌱',
      color: '#ec4899',
      tag: 'Referral'
    },
  ];

  return (
    <div className="th-container">
      <div className="th-header">
        <div className="th-header-left">
          <div className="th-dot"/>
          <span className="th-brand">TALENT<span className="th-brand-accent">DASH</span></span>
          <span className="th-separator">·</span>
          <span className="th-subtitle">GROWTH SUITE</span>
        </div>
        <div className="th-header-spacer"/>
      </div>
      <div className="th-content">

      <div className="th-container-inner">
        <div className="th-hero">
          <h1 className="th-hero-title">
            Growth Intelligence <span className="th-hero-accent">Suite</span>
          </h1>
          <p className="th-hero-sub">
            Everything you need to analyze your market value, optimize your resume, and negotiate the perfect offer.
          </p>
        </div>

        <div className="th-grid">
          {tools.map(tool => (
            <div key={tool.id} className="hub-card" onClick={() => onSelectTool(tool.id)}>
              <div className="hub-tag" style={{ color: tool.color, borderColor: `${tool.color}30` }}>
                {tool.tag}
              </div>
              <span className="hub-icon">{tool.icon}</span>
              <div className="hub-title">{tool.name}</div>
              <div className="hub-desc">{tool.description}</div>
              <div className="hub-cta">
                Launch Tool <span>→</span>
              </div>
              {/* Subtle glow effect based on tool color */}
              <div className="hub-glow" style={{ background: `${tool.color}10` }} />
            </div>
          ))}
        </div>

        <div className="th-cta-section">
          <h3 className="th-cta-title">Ready to unlock your full potential?</h3>
          <p className="th-cta-text">
            Sign up for TalentDash to save your analysis and get personalized growth roadmaps.
          </p>
          <button className="th-cta-btn" onClick={() => onSelectTool('onboarding')}>
            Create Free Account
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ToolsHub;
