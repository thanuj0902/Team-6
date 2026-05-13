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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #020818 0%, #040d20 35%, #060f1c 60%, #030a14 100%)',
      color: '#e0e0f0',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    }}>
      <header style={{ padding:"18px 32px",display:"flex",alignItems:"center",backdropFilter:"blur(24px)",position:"sticky",top:0,background:"rgba(13,11,34,0.82)",borderBottom:"1px solid rgba(99,102,241,0.13)",zIndex:20 }}>
        <div style={{ flex:1,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:8,height:8,background:"#8b5cf6",borderRadius:"50%",boxShadow:"0 0 8px #8b5cf6" }}/>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"0.1em",color:"#fff" }}>TALENT<span style={{ color:"#8b5cf6" }}>DASH</span></span>
          <span style={{ color:"rgba(99,102,241,0.3)",margin:"0 6px" }}>·</span>
          <span style={{ fontSize:11,color:"#a5b4fc",letterSpacing:"0.1em" }}>CONTRIBUTE</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={() => navigateTo('hub')} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Dashboard</button>
          <button onClick={() => navigateTo('activation')} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Progress</button>
        </div>
        <div style={{ flex:1 }}/>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
          .inp {
            width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);
            border:1.5px solid rgba(255,255,255,0.09);border-radius:10px;color:#e8e8f0;
            font-size:14px;font-family:inherit;outline:none;transition:all 0.2s;
          }
          .inp:focus { border-color:#8b5cf6;background:rgba(139,92,246,0.06); }
          .inp-sel { cursor:pointer; }
          .btn-sub {
            padding:14px 28px;border-radius:10px;font-size:13px;font-family:inherit;cursor:pointer;
            font-weight:600;transition:all 0.2s;border:none;
          }
          .tab-btn {
            padding:10px 20px;border-radius:8px;font-size:12px;font-family:inherit;cursor:pointer;
            transition:all 0.2s;border:1.5px solid rgba(255,255,255,0.08);background:transparent;color:#697298;
          }
          .tab-btn.active { border-color:#8b5cf6;background:rgba(139,92,246,0.12);color:#c4b5fd;font-weight:600; }
        `}</style>

        <div style={{ textAlign:'center',marginBottom:40 }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,color:'#fff',marginBottom:8 }}>
            Contribute <span style={{ color:'#8b5cf6' }}>Data</span>
          </h1>
          <p style={{ color:'#697298',fontSize:13,lineHeight:1.7 }}>
            Share your salary or company experience to help the community. You earn points for every contribution.
          </p>
        </div>

        <div style={{ display:'flex',gap:8,marginBottom:28,justifyContent:'center' }}>
          <button className={`tab-btn ${tab === 'salary' ? 'active' : ''}`} onClick={() => setTab('salary')}>💰 Salary Data</button>
          <button className={`tab-btn ${tab === 'review' ? 'active' : ''}`} onClick={() => setTab('review')}>⭐ Company Review</button>
        </div>

        {success && (
          <div style={{ padding:'12px 16px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:10,color:'#10b981',fontSize:13,marginBottom:20 }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ padding:'12px 16px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:10,color:'#ef4444',fontSize:13,marginBottom:20 }}>
            {error}
          </div>
        )}

        {tab === 'salary' && (
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <p style={{ fontSize:11,color:'#4a5070',letterSpacing:'0.06em',marginBottom:4 }}>SALARY CONTRIBUTION — EARN 10 POINTS</p>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>COMPANY</label>
              <select name="company" className="inp inp-sel" value={salaryForm.company} onChange={handleSalaryChange}>
                <option value="">Select company</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>ROLE</label>
              <select name="role" className="inp inp-sel" value={salaryForm.role} onChange={handleSalaryChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <div>
                <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>CITY</label>
                <select name="city" className="inp inp-sel" value={salaryForm.city} onChange={handleSalaryChange}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>EXPERIENCE</label>
                <select name="expLevel" className="inp inp-sel" value={salaryForm.expLevel} onChange={handleSalaryChange}>
                  {EXP_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <div>
                <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>BASE SALARY (₹)</label>
                <input name="baseSalary" className="inp" type="number" placeholder="e.g. 1800000" value={salaryForm.baseSalary} onChange={handleSalaryChange} />
              </div>
              <div>
                <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>ANNUAL BONUS (₹)</label>
                <input name="bonus" className="inp" type="number" placeholder="e.g. 200000" value={salaryForm.bonus} onChange={handleSalaryChange} />
              </div>
            </div>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>EQUITY/ESOP TOTAL (₹)</label>
              <input name="equity" className="inp" type="number" placeholder="e.g. 4000000" value={salaryForm.equity} onChange={handleSalaryChange} />
            </div>
            <button className="btn-sub" style={{ background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',marginTop:8 }} onClick={submitSalary}>
              Submit Salary Data →
            </button>
          </div>
        )}

        {tab === 'review' && (
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <p style={{ fontSize:11,color:'#4a5070',letterSpacing:'0.06em',marginBottom:4 }}>COMPANY REVIEW — EARN 15 POINTS</p>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>COMPANY</label>
              <select name="company" className="inp inp-sel" value={reviewForm.company} onChange={handleReviewChange}>
                <option value="">Select company</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>YOUR ROLE</label>
              <select name="role" className="inp inp-sel" value={reviewForm.role} onChange={handleReviewChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>REVIEW TITLE</label>
              <input name="title" className="inp" placeholder="e.g. Great engineering culture" value={reviewForm.title} onChange={handleReviewChange} />
            </div>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>RATING</label>
              <div style={{ display:'flex',gap:8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})} style={{
                    width:44,height:44,borderRadius:10,border: n === reviewForm.rating ? '2px solid #8b5cf6' : '1.5px solid rgba(255,255,255,0.08)',
                    background: n <= reviewForm.rating ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                    cursor:'pointer',fontSize:18,transition:'all 0.2s'
                  }}>{n === 1 ? '😞' : n === 2 ? '😐' : n === 3 ? '😊' : n === 4 ? '😄' : '🤩'}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>PROS</label>
              <textarea name="pros" className="inp" style={{ minHeight:80,resize:'vertical' }} placeholder="What do you like about this company?" value={reviewForm.pros} onChange={handleReviewChange} />
            </div>
            <div>
              <label style={{ fontSize:10,color:'#697298',marginBottom:6,display:'block' }}>CONS</label>
              <textarea name="cons" className="inp" style={{ minHeight:80,resize:'vertical' }} placeholder="What could be improved?" value={reviewForm.cons} onChange={handleReviewChange} />
            </div>
            <button className="btn-sub" style={{ background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff' }} onClick={submitReview}>
              Submit Review →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
