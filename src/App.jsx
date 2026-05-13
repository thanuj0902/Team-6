import React, { useState, useEffect } from 'react'
import OfferCalculator from './OfferCalculator'
import ResumeAnalyzer from './ResumeAnalyzer'
import SalaryCalculator from './SalaryCalculator'
import ToolsHub from './ToolsHub'
import Onboarding from './Onboarding'
import ActivationFunnel from './ActivationFunnel'
import ContributionFlow from './ContributionFlow'
import EngagementDashboard from './EngagementDashboard'
import GrowthExperiments from './GrowthExperiments'

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
    activation: { name: 'Activation', component: <ActivationFunnel /> },
    contribute: { name: 'Contribute', component: <ContributionFlow /> },
    engagement: { name: 'Engagement', component: <EngagementDashboard /> },
    growth: { name: 'Growth', component: <GrowthExperiments /> },
  };

  return (
    <div className="min-h-screen bg-[#020818] text-white font-sans">
      <main className="p-5">
        {tabs[activeTab].component}
      </main>
    </div>
  )
}

export default App
