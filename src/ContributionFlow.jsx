import React, { useState } from 'react';
import './ContributionFlow.css';

const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Razorpay', 'CRED', 'Zepto', 'PhonePe', 'Meesho', 'Other'];
const ROLES = ['Software Engineer', 'Senior Engineer', 'Staff Engineer', 'Engineering Manager', 'Product Manager', 'Data Scientist', 'Designer', 'DevOps Engineer'];
const CITIES = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Remote'];
const EXP_LEVELS = ['0-2 yrs', '2-5 yrs', '5-8 yrs', '8-12 yrs', '12+ yrs'];

export default function ContributionFlow() {
  const [mode, setMode] = useState('select');
  const [tab, setTab] = useState('salary');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [salaryForm, setSalaryForm] = useState({
    company: '', role: 'Software Engineer', city: 'Bangalore',
    expLevel: '2-5 yrs', baseSalary: '', bonus: '', equity: '',
  });
  const [reviewForm, setReviewForm] = useState({
    company: '', role: 'Software Engineer', rating: 3,
    title: '', pros: '', cons: '', recommend: true,
  });

  const userId = localStorage.getItem('userId');

  const handleSalaryChange = (e) => setSalaryForm({ ...salaryForm, [e.target.name]: e.target.value });

  const handleReviewChange = (e) => setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });

  const submitSalary = async () => {
    setError(''); setSuccess('');
    if (!salaryForm.company || !salaryForm.baseSalary) {
      setError('Company and base salary are required');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, type: 'salary',
          company: salaryForm.company,
          role: salaryForm.role,
          city: salaryForm.city,
          salary: parseFloat(salaryForm.baseSalary) + parseFloat(salaryForm.bonus || 0) + parseFloat(salaryForm.equity || 0) / 4,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Salary data submitted! You earned 10 points.');
        try { await fetch('http://localhost:3001/api/activity/log', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, action:'contributed_data', metadata:{type:'salary'} }) }); } catch {}
        setSalaryForm({ company: '', role: 'Software Engineer', city: 'Bangalore', expLevel: '2-5 yrs', baseSalary: '', bonus: '', equity: '' });
      }
    } catch (e) {
      setError('Failed to submit. Please try again.');
    }
  };

  const submitReview = async () => {
    setError(''); setSuccess('');
    if (!reviewForm.company) {
      setError('Company is required');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, type: 'review',
          company: reviewForm.company,
          role: reviewForm.role,
          rating: reviewForm.rating,
          content: JSON.stringify({ title: reviewForm.title, pros: reviewForm.pros, cons: reviewForm.cons, recommend: reviewForm.recommend }),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Review submitted! You earned 15 points.');
        setReviewForm({ company: '', role: 'Software Engineer', rating: 3, title: '', pros: '', cons: '', recommend: true });
      }
    } catch (e) {
      setError('Failed to submit. Please try again.');
    }
  };

  const navigateTo = (tab) => window.dispatchEvent(new CustomEvent('changeTab', { detail: tab }));

  return (
    <div className="cf-page">
      <header className="cf-header">
        <div className="cf-header-left">
          <div className="cf-dot" />
            <span className="cf-brand">TALENT<span className="cf-brand-accent">DASH</span></span>
          <span className="cf-separator">·</span>
          <span className="cf-contribute-label">CONTRIBUTE</span>
        </div>
        <div className="cf-header-actions">
          <button onClick={() => navigateTo('hub')} className="cf-nav-btn">Dashboard</button>
          <button onClick={() => navigateTo('activation')} className="cf-nav-btn">Progress</button>
        </div>
        <div className="cf-spacer" />
      </header>

      <div className="cf-container">


        <div className="cf-heading-section">
          <h1 className="cf-title">
            Contribute             <span className="cf-title-accent">Data</span>
          </h1>
          <p className="cf-description">
            Share your salary or company experience to help the community. You earn points for every contribution.
          </p>
        </div>

        <div className="cf-tabs">
          <button className={`cf-tab-btn ${tab === 'salary' ? 'active' : ''}`} onClick={() => setTab('salary')}>💰 Salary Data</button>
          <button className={`cf-tab-btn ${tab === 'review' ? 'active' : ''}`} onClick={() => setTab('review')}>⭐ Company Review</button>
        </div>

        {success && (
          <div className="cf-success">
            {success}
          </div>
        )}
        {error && (
          <div className="cf-error">
            {error}
          </div>
        )}

        {tab === 'salary' && (
          <div className="cf-form">
            <p className="cf-section-label">SALARY CONTRIBUTION — EARN 10 POINTS</p>
            <div>
              <label className="cf-field-label">COMPANY</label>
              <select name="company" className="cf-inp cf-inp-sel" value={salaryForm.company} onChange={handleSalaryChange}>
                <option value="">Select company</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="cf-field-label">ROLE</label>
              <select name="role" className="cf-inp cf-inp-sel" value={salaryForm.role} onChange={handleSalaryChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="cf-grid">
              <div>
                <label className="cf-field-label">CITY</label>
                <select name="city" className="cf-inp cf-inp-sel" value={salaryForm.city} onChange={handleSalaryChange}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="cf-field-label">EXPERIENCE</label>
                <select name="expLevel" className="cf-inp cf-inp-sel" value={salaryForm.expLevel} onChange={handleSalaryChange}>
                  {EXP_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div className="cf-grid">
              <div>
                <label className="cf-field-label">BASE SALARY (₹)</label>
                <input name="baseSalary" className="cf-inp" type="number" placeholder="e.g. 1800000" value={salaryForm.baseSalary} onChange={handleSalaryChange} />
              </div>
              <div>
                <label className="cf-field-label">ANNUAL BONUS (₹)</label>
                <input name="bonus" className="cf-inp" type="number" placeholder="e.g. 200000" value={salaryForm.bonus} onChange={handleSalaryChange} />
              </div>
            </div>
            <div>
              <label className="cf-field-label">EQUITY/ESOP TOTAL (₹)</label>
              <input name="equity" className="cf-inp" type="number" placeholder="e.g. 4000000" value={salaryForm.equity} onChange={handleSalaryChange} />
            </div>
            <button className="cf-btn-sub cf-submit-btn cf-mt-8" onClick={submitSalary}>
              Submit Salary Data →
            </button>
          </div>
        )}

        {tab === 'review' && (
          <div className="cf-form">
            <p className="cf-section-label">COMPANY REVIEW — EARN 15 POINTS</p>
            <div>
              <label className="cf-field-label">COMPANY</label>
              <select name="company" className="cf-inp cf-inp-sel" value={reviewForm.company} onChange={handleReviewChange}>
                <option value="">Select company</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="cf-field-label">YOUR ROLE</label>
              <select name="role" className="cf-inp cf-inp-sel" value={reviewForm.role} onChange={handleReviewChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="cf-field-label">REVIEW TITLE</label>
              <input name="title" className="cf-inp" placeholder="e.g. Great engineering culture" value={reviewForm.title} onChange={handleReviewChange} />
            </div>
            <div>
              <label className="cf-field-label">RATING</label>
              <div className="cf-rating-group">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})} className="cf-rating-btn" style={{
                    border: n === reviewForm.rating ? '2px solid #8b5cf6' : '1.5px solid rgba(255,255,255,0.08)',
                    background: n <= reviewForm.rating ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                  }}>{n === 1 ? '😞' : n === 2 ? '😐' : n === 3 ? '😊' : n === 4 ? '😄' : '🤩'}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="cf-field-label">PROS</label>
              <textarea name="pros" className="cf-inp cf-textarea" placeholder="What do you like about this company?" value={reviewForm.pros} onChange={handleReviewChange} />
            </div>
            <div>
              <label className="cf-field-label">CONS</label>
              <textarea name="cons" className="cf-inp cf-textarea" placeholder="What could be improved?" value={reviewForm.cons} onChange={handleReviewChange} />
            </div>
            <button className="cf-btn-sub cf-submit-btn" onClick={submitReview}>
              Submit Review →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
