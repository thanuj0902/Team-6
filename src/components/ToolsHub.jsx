import React from 'react';

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
    <div className="min-h-screen bg-[#020818] text-[#e0e0f0] font-body"
      style={{ background: 'linear-gradient(145deg, #020818 0%, #040d20 35%, #060f1c 60%, #030a14 100%)' }}>
      <header className="w-full flex items-center sticky top-0 z-20 px-4 py-3 bg-[rgba(13,11,34,0.82)] backdrop-blur-xl">
        <div className="flex-1 flex items-center gap-3.5">
          <div className="w-[9px] h-[9px] rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 shadow-[0_0_12px_#6366f1aa]" />
          <span className="font-display font-extrabold text-base tracking-[0.1em] text-white">
            TALENT<span className="text-[#6366f1]">DASH</span>
          </span>
          <span className="text-[rgba(99,102,241,0.3)] mx-1.5">·</span>
          <span className="text-[11px] text-[#a5b4fc] tracking-[0.1em]">GROWTH SUITE</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))}
            className="px-3 py-1.5 text-[11px] bg-transparent border border-white/10 rounded text-[#8890b0] cursor-pointer hover:border-indigo-400/50 transition-colors">Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))}
            className="px-3 py-1.5 text-[11px] bg-transparent border border-white/10 rounded text-[#8890b0] cursor-pointer hover:border-indigo-400/50 transition-colors">Salary</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))}
            className="px-3 py-1.5 text-[11px] bg-transparent border border-white/10 rounded text-[#8890b0] cursor-pointer hover:border-indigo-400/50 transition-colors">Resume</button>
        </div>
        <div className="flex-1" />
      </header>

      <div className="px-6 py-10 max-w-[1200px] mx-auto">
        <div className="text-center mb-[60px]">
          <h1 className="text-5xl font-bold mb-4 tracking-tight"
            style={{ background: 'linear-gradient(to right, #fff, #8890b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Growth Intelligence <span className="text-[#00ff9d]" style={{ WebkitTextFillColor: '#00ff9d' }}>Suite</span>
          </h1>
          <p className="text-[#4a5070] text-base max-w-[600px] mx-auto">
            Everything you need to analyze your market value, optimize your resume, and negotiate the perfect offer.
          </p>
        </div>

        <div className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {tools.map(tool => (
            <div key={tool.id} onClick={() => onSelectTool(tool.id)}
              className="group rounded-[20px] p-8 cursor-pointer text-left relative overflow-hidden transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 255, 157, 0.08)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 157, 0.3)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 157, 0.08)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.boxShadow = '';
              }}>
              <div className="text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 rounded inline-block mb-4"
                style={{ color: tool.color, border: `1px solid ${tool.color}30`, background: 'rgba(255,255,255,0.05)' }}>
                {tool.tag}
              </div>
              <span className="text-4xl block mb-5">{tool.icon}</span>
              <div className="text-2xl font-bold mb-3 text-white">{tool.name}</div>
              <div className="text-sm text-[#8890b0] leading-relaxed mb-6">{tool.description}</div>
              <div className="text-[13px] font-semibold text-[#00ff9d] flex items-center gap-2">
                Launch Tool <span>→</span>
              </div>
              <div className="absolute -top-1/5 -right-1/5 w-[150px] h-[150px] rounded-full pointer-events-none"
                style={{ background: `${tool.color}10`, filter: 'blur(40px)' }} />
            </div>
          ))}
        </div>

        <div className="mt-[60px] p-8 rounded-[20px] text-center bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
          <h3 className="text-white mb-3 text-lg font-bold">Ready to unlock your full potential?</h3>
          <p className="text-[#8890b0] text-sm mb-5">
            Sign up for TalentDash to save your analysis and get personalized growth roadmaps.
          </p>
          <button onClick={() => onSelectTool('onboarding')}
            className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer border-none bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[0_4px_15px_rgba(99,102,241,0.3)]">
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolsHub;
