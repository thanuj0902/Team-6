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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #020818 0%, #040d20 35%, #060f1c 60%, #030a14 100%)',
      color: '#e0e0f0',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    }}>
      <header style={{ width:"100%",display:"flex",alignItems:"center",backdropFilter:"blur(24px)",position:"sticky",top:0,background:"rgba(13,11,34,0.82)",zIndex:20 }}>
        <div style={{ flex:1,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ width:9,height:9,background:"linear-gradient(135deg,#6366f1,#3b82f6)",borderRadius:"50%",boxShadow:"0 0 12px #6366f1aa" }}/>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"0.1em",color:"#fff" }}>TALENT<span style={{ color:"#6366f1" }}>DASH</span></span>
          <span style={{ color:"rgba(99,102,241,0.3)",margin:"0 6px" }}>·</span>
          <span style={{ fontSize:11,color:"#a5b4fc",letterSpacing:"0.1em" }}>GROWTH SUITE</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Salary</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Resume</button>
        </div>
        <div style={{ flex:1 }}/>
      </header>
      <div style={{ padding: '40px 24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        .hub-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 255, 157, 0.08);
          border-radius: 20px;
          padding: 32px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        .hub-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0, 255, 157, 0.3);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .hub-tag {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 4px 10px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 16px;
          display: inline-block;
        }
        .hub-icon {
          font-size: 40px;
          margin-bottom: 20px;
          display: block;
        }
        .hub-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #fff;
        }
        .hub-desc {
          font-size: 14px;
          color: #8890b0;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .hub-cta {
          font-size: 13px;
          font-weight: 600;
          color: #00ff9d;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #fff, #8890b0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Growth Intelligence <span style={{ color: '#00ff9d' }}>Suite</span>
          </h1>
          <p style={{ color: '#4a5070', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
            Everything you need to analyze your market value, optimize your resume, and negotiate the perfect offer.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
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
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-20%',
                width: '150px',
                height: '150px',
                background: `${tool.color}10`,
                filter: 'blur(40px)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 60,
          padding: '32px',
          borderRadius: 20,
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#fff', marginBottom: 12 }}>Ready to unlock your full potential?</h3>
          <p style={{ color: '#8890b0', fontSize: 14, marginBottom: 20 }}>
            Sign up for TalentDash to save your analysis and get personalized growth roadmaps.
          </p>
          <button onClick={() => onSelectTool('onboarding')} style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
          }}>
            Create Free Account
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ToolsHub;
