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


      <main style={{ padding: '20px' }}>
        {tabs[activeTab].component}
      </main>
    </div>
  )
}

export default App
