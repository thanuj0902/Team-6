import React, { useState, useEffect } from 'react'
import OfferCalculator from './OfferCalculator'
import ResumeAnalyzer from './ResumeAnalyzer'
import SalaryCalculator from './SalaryCalculator'
import ToolsHub from './ToolsHub'
import Onboarding from './Onboarding'

function App() {
  const [activeTab, setActiveTab] = useState('hub');

  useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const tabs = {
    hub: { name: 'Dashboard', component: <ToolsHub onSelectTool={setActiveTab} /> },
    offer: { name: 'Offer Calculator', component: <OfferCalculator /> },
    resume: { name: 'Resume Analyzer', component: <ResumeAnalyzer /> },
    salary: { name: 'Salary Calculator', component: <SalaryCalculator /> },
    onboarding: { name: 'Onboarding', component: <Onboarding /> },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0c29',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        padding: '20px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(99,102,241,0.3)'
      }}>
        {Object.entries(tabs).map(([id, { name }]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              background: activeTab === id ? '#6366f1' : 'transparent',
              color: 'white',
              border: '1px solid #6366f1',
              borderRadius: '8px',
              transition: '0.2s'
            }}
          >
            {name}
          </button>
        ))}
      </nav>

      <main style={{ padding: '20px' }}>
        {tabs[activeTab].component}
      </main>
    </div>
  )
}

export default App
