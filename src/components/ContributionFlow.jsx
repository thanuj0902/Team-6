import React, { useState } from 'react';

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
    <div className="min-h-screen bg-[linear-gradient(145deg,#020818_0%,#040d20_35%,#060f1c_60%,#030a14_100%)] text-[#e0e0f0] font-['Space_Grotesk','Inter',sans-serif]">
      <header className="px-8 py-[18px] flex items-center backdrop-blur-xl sticky top-0 bg-[rgba(13,11,34,0.82)] border-b border-[rgba(99,102,241,0.13)] z-20">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_#8b5cf6]" />
          <span className="font-['Syne',sans-serif] font-extrabold text-base tracking-[0.1em] text-white">TALENT<span className="text-violet-500">DASH</span></span>
          <span className="text-[rgba(99,102,241,0.3)] mx-1.5">·</span>
          <span className="text-[11px] text-indigo-300 tracking-[0.1em]">CONTRIBUTE</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={() => navigateTo('hub')} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Dashboard</button>
          <button onClick={() => navigateTo('activation')} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Progress</button>
        </div>
        <div className="flex-1" />
      </header>

      <div className="max-w-[640px] mx-auto px-6 py-10">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        `}</style>

        <div className="text-center mb-10">
          <h1 className="font-['Syne',sans-serif] text-4xl font-extrabold text-white mb-2">
            Contribute <span className="text-violet-500">Data</span>
          </h1>
          <p className="text-[#697298] text-[13px] leading-[1.7]">
            Share your salary or company experience to help the community. You earn points for every contribution.
          </p>
        </div>

        <div className="flex gap-2 mb-7 justify-center">
          <button className={`px-5 py-2.5 rounded-lg text-xs cursor-pointer transition-all duration-200 bg-transparent ${tab === 'salary' ? 'border-[1.5px] border-violet-500 bg-[rgba(139,92,246,0.12)] text-[#c4b5fd] font-semibold' : 'border-[1.5px] border-[rgba(255,255,255,0.08)] text-[#697298]'}`} onClick={() => setTab('salary')}>💰 Salary Data</button>
          <button className={`px-5 py-2.5 rounded-lg text-xs cursor-pointer transition-all duration-200 bg-transparent ${tab === 'review' ? 'border-[1.5px] border-violet-500 bg-[rgba(139,92,246,0.12)] text-[#c4b5fd] font-semibold' : 'border-[1.5px] border-[rgba(255,255,255,0.08)] text-[#697298]'}`} onClick={() => setTab('review')}>⭐ Company Review</button>
        </div>

        {success && (
          <div className="px-4 py-3 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] rounded-[10px] text-emerald-500 text-[13px] mb-5">
            {success}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-[10px] text-red-500 text-[13px] mb-5">
            {error}
          </div>
        )}

        {tab === 'salary' && (
          <div className="flex flex-col gap-4">
            <p className="text-[11px] text-[#4a5070] tracking-[0.06em] mb-1">SALARY CONTRIBUTION — EARN 10 POINTS</p>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">COMPANY</label>
              <select name="company" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)] cursor-pointer" value={salaryForm.company} onChange={handleSalaryChange}>
                <option value="">Select company</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">ROLE</label>
              <select name="role" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)] cursor-pointer" value={salaryForm.role} onChange={handleSalaryChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#697298] mb-1.5 block">CITY</label>
                <select name="city" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)] cursor-pointer" value={salaryForm.city} onChange={handleSalaryChange}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#697298] mb-1.5 block">EXPERIENCE</label>
                <select name="expLevel" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)] cursor-pointer" value={salaryForm.expLevel} onChange={handleSalaryChange}>
                  {EXP_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#697298] mb-1.5 block">BASE SALARY (₹)</label>
                <input name="baseSalary" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)]" type="number" placeholder="e.g. 1800000" value={salaryForm.baseSalary} onChange={handleSalaryChange} />
              </div>
              <div>
                <label className="text-[10px] text-[#697298] mb-1.5 block">ANNUAL BONUS (₹)</label>
                <input name="bonus" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)]" type="number" placeholder="e.g. 200000" value={salaryForm.bonus} onChange={handleSalaryChange} />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">EQUITY/ESOP TOTAL (₹)</label>
              <input name="equity" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)]" type="number" placeholder="e.g. 4000000" value={salaryForm.equity} onChange={handleSalaryChange} />
            </div>
            <button className="px-7 py-3.5 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all duration-200 border-0 bg-gradient-to-br from-violet-500 to-violet-700 text-white mt-2" onClick={submitSalary}>
              Submit Salary Data →
            </button>
          </div>
        )}

        {tab === 'review' && (
          <div className="flex flex-col gap-4">
            <p className="text-[11px] text-[#4a5070] tracking-[0.06em] mb-1">COMPANY REVIEW — EARN 15 POINTS</p>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">COMPANY</label>
              <select name="company" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)] cursor-pointer" value={reviewForm.company} onChange={handleReviewChange}>
                <option value="">Select company</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">YOUR ROLE</label>
              <select name="role" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)] cursor-pointer" value={reviewForm.role} onChange={handleReviewChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">REVIEW TITLE</label>
              <input name="title" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)]" placeholder="e.g. Great engineering culture" value={reviewForm.title} onChange={handleReviewChange} />
            </div>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">RATING</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})}
                    className="w-11 h-11 rounded-[10px] cursor-pointer text-lg transition-all duration-200"
                    style={{
                      border: n === reviewForm.rating ? '2px solid #8b5cf6' : '1.5px solid rgba(255,255,255,0.08)',
                      background: n <= reviewForm.rating ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                    }}>{n === 1 ? '😞' : n === 2 ? '😐' : n === 3 ? '😊' : n === 4 ? '😄' : '🤩'}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">PROS</label>
              <textarea name="pros" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)] min-h-[80px] resize-y" placeholder="What do you like about this company?" value={reviewForm.pros} onChange={handleReviewChange} />
            </div>
            <div>
              <label className="text-[10px] text-[#697298] mb-1.5 block">CONS</label>
              <textarea name="cons" className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[10px] text-[#e8e8f0] text-sm outline-none transition-all duration-200 focus:border-violet-500 focus:bg-[rgba(139,92,246,0.06)] min-h-[80px] resize-y" placeholder="What could be improved?" value={reviewForm.cons} onChange={handleReviewChange} />
            </div>
            <button className="px-7 py-3.5 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all duration-200 border-0 bg-gradient-to-br from-violet-500 to-violet-700 text-white" onClick={submitReview}>
              Submit Review →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
