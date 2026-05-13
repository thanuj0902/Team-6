import { useState, useEffect } from "react";
import './SalaryCalculator.css'

const ROLES = ["Software Engineer", "Senior Engineer", "Staff Engineer", "Principal Engineer", "Engineering Manager", "Director of Engineering", "VP Engineering", "Product Manager", "Senior PM", "Data Scientist", "ML Engineer", "Designer", "DevOps / SRE", "QA Engineer"];
const SKILLS = ["React", "Node.js", "Python", "Java", "Go", "Kubernetes", "AWS/GCP", "PostgreSQL", "Machine Learning", "System Design", "Leadership", "Product Sense"];
const COMPANIES = { Tier1: ["Google", "Meta", "Microsoft", "Amazon", "Apple"], Tier2: ["Flipkart", "Swiggy", "Razorpay", "CRED", "Zepto", "PhonePe", "Meesho", "Groww"], Tier3: ["TCS", "Infosys", "Wipro", "HCL", "Capgemini"], Startup: ["Pre-Series A", "Series A", "Series B", "Series C+"] };
const CITIES = ["Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Remote"];

const BASE_SALARIES = {
  "Software Engineer": 1800000, "Senior Engineer": 3200000, "Staff Engineer": 5500000,
  "Principal Engineer": 8000000, "Engineering Manager": 6000000, "Director of Engineering": 12000000,
  "VP Engineering": 18000000, "Product Manager": 2800000, "Senior PM": 5000000,
  "Data Scientist": 2500000, "ML Engineer": 3500000, "Designer": 1800000,
  "DevOps / SRE": 2800000, "QA Engineer": 1200000,
};
const EXP_MULT = { 0: 0.55, 1: 0.65, 2: 0.78, 3: 0.9, 4: 1.0, 5: 1.15, 6: 1.28, 7: 1.42, 8: 1.55, 9: 1.68, 10: 1.82, 11: 1.95, 12: 2.1, 15: 2.4, 20: 2.8 };
const CITY_MULT = { "Bangalore": 1.0, "Mumbai": 0.92, "Delhi NCR": 0.88, "Hyderabad": 0.85, "Pune": 0.8, "Chennai": 0.78, "Remote": 1.05 };
const TIER_MULT = { Tier1: 1.8, Tier2: 1.2, Tier3: 0.7, Startup: 1.0 };
const SKILL_BONUS = { "React": 0.05, "Node.js": 0.03, "Python": 0.06, "Java": 0.04, "Go": 0.08, "Kubernetes": 0.09, "AWS/GCP": 0.07, "PostgreSQL": 0.03, "Machine Learning": 0.12, "System Design": 0.1, "Leadership": 0.1, "Product Sense": 0.08 };

const fmtL = (n) => `₹${(n / 100000).toFixed(1)}L`;

function lerp(obj, key) {
  const keys = Object.keys(obj).map(Number).sort((a, b) => a - b);
  if (key <= keys[0]) return obj[keys[0]];
  if (key >= keys[keys.length - 1]) return obj[keys[keys.length - 1]];
  const lo = keys.filter(k => k <= key).pop();
  const hi = keys.filter(k => k > key)[0];
  const t = (key - lo) / (hi - lo);
  return obj[lo] + t * (obj[hi] - obj[lo]);
}

export default function SalaryCalculator() {
  const [role, setRole] = useState("Software Engineer");
  const [exp, setExp] = useState(4);
  const [city, setCity] = useState("Bangalore");
  const [tier, setTier] = useState("Tier2");
  const [company, setCompany] = useState("");
  const [taxRegime, setTaxRegime] = useState("new");
  const [skills, setSkills] = useState([]);
  const [show, setShow] = useState(false);

  const logActivity = (action, metadata) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    fetch('http://localhost:3001/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, metadata: metadata || {} }),
    }).catch(() => {});
  };

  const toggleSkill = (s) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const base = BASE_SALARIES[role] || 2000000;
  const expMult = lerp(EXP_MULT, exp);
  const skillBonus = skills.reduce((acc, s) => acc + (SKILL_BONUS[s] || 0), 0);
  const cityMult = CITY_MULT[city] || 1.0;
  const tierMult = TIER_MULT[tier] || 1.0;
  const estimated = base * expMult * cityMult * tierMult * (1 + skillBonus * 0.5);
  const low = estimated * 0.8;
  const high = estimated * 1.35;
  const bonus = estimated * 0.15;
  const equity = estimated * (tier === "Tier1" ? 0.6 : tier === "Startup" ? 0.8 : 0.3);

  const calculateTax = (salary) => {
    if (taxRegime === "old") return salary * 0.28;
    else return salary * 0.20;
  };

  const taxAmt = calculateTax(estimated);
  const takeHomeMonthly = ((estimated - taxAmt) / 12);

  const TIER_LABELS = { Tier1: "FAANG / Top MNC", Tier2: "Product Unicorn", Tier3: "Service / IT", Startup: "Startup" };

  return (
    <div className="sc-wrapper">
      <header className="sc-header">
        <div className="sc-header-left">
          <div className="sc-logo-dot" />
          <span className="sc-logo">TALENT<span className="sc-logo-accent">DASH</span></span>
          <span className="sc-sep">·</span>
          <span className="sc-badge">SALARY INTELLIGENCE</span>
        </div>
        <div className="sc-header-nav">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} className="sc-header-btn">Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} className="sc-header-btn">Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} className="sc-header-btn">Resume</button>
        </div>
        <div className="sc-header-spacer"/>
      </header>

      <div className="sc-main">
        <div className="sc-left">
          <h1 className="sc-title">Salary<br /><em className="sc-title-em">Calculator</em></h1>
          <p className="sc-sub">Real compensation data from 2M+ professionals across India's tech ecosystem.</p>

          <div className="sc-field-group">
            <div className="sc-field-label">ROLE</div>
            <div className="sc-chip-row">
              {ROLES.map(r => <button key={r} className={`pill${role === r ? " active" : ""}`} onClick={() => setRole(r)}>{r}</button>)}
            </div>
          </div>
          <hr className="divider" />
          <div className="sc-field-group">
            <div className="sc-field-label">COMPANY NAME</div>
            <input className="inp" type="text" placeholder="e.g. Google, Razorpay..." value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <hr className="divider" />
          <div className="sc-field-group">
            <div className="sc-exp-header">
              <div className="sc-field-label">EXPERIENCE</div>
              <div className="sc-exp-value">{exp} <span className="sc-exp-unit">yrs</span></div>
            </div>
            <input type="range" className="range-inp" min={0} max={20} step={1} value={exp} onChange={e => setExp(+e.target.value)} />
            <div className="sc-range-labels">
              <span>Fresher</span><span>5yr</span><span>10yr</span><span>15yr</span><span>20yr</span>
            </div>
          </div>
          <hr className="divider" />
          <div className="sc-field-group">
            <div className="sc-field-label">COMPANY TYPE</div>
            <div className="sc-chip-row">
              {Object.entries(TIER_LABELS).map(([k, v]) => (
                <button key={k} className={`pill${tier === k ? " active" : ""}`} onClick={() => setTier(k)}>{v}</button>
              ))}
            </div>
          </div>
          <hr className="divider" />
          <div className="sc-field-group">
            <div className="sc-field-label">LOCATION</div>
            <div className="sc-chip-row">
              {CITIES.map(c => <button key={c} className={`pill${city === c ? " active" : ""}`} onClick={() => setCity(c)}>{c}</button>)}
            </div>
          </div>
          <hr className="divider" />
          <div className="sc-field-group">
            <div className="sc-field-label">TAX REGIME</div>
            <div className="flex gap-2">
              <button className={`pill${taxRegime === "new" ? " active" : ""}`} onClick={() => setTaxRegime("new")}>New Regime</button>
              <button className={`pill${taxRegime === "old" ? " active" : ""}`} onClick={() => setTaxRegime("old")}>Old Regime</button>
            </div>
          </div>
          <hr className="divider" />
          <div className="sc-field-group sc-field-group-last">
            <div className="sc-field-label">HIGH-VALUE SKILLS <span className="sc-skill-hint">(select all that apply)</span></div>
            <div className="sc-chip-row">
              {SKILLS.map(s => <button key={s} className={`pill${skills.includes(s) ? " active" : ""}`} onClick={() => toggleSkill(s)}>{s}</button>)}
            </div>
          </div>
          <button className="btn-calc" onClick={() => {
            setShow(true);
            logActivity('calculated_salary', { role, company, city, tier });
            fetch('http://localhost:3001/api/salary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: localStorage.getItem('userId'),
                role,
                experience: exp,
                city,
                company,
                companyTier: tier,
                baseSalary: estimated,
                bonus,
                equity,
                totalCTC: estimated + bonus + equity / 4
              })
            }).then(r => { if (!r.ok) console.error('Failed to save salary'); }).catch(e => console.error('Save salary error:', e));
          }}>CALCULATE SALARY RANGE →</button>
        </div>

        <div className={`sc-right ${show ? 'sc-right-top' : 'sc-right-center'}`}>
          {!show ? (
            <div className="sc-empty-state">
              <div className="sc-empty-icon">🔍</div>
              <p className="sc-empty-text">Configure your profile and calculate</p>
            </div>
          ) : (
            <div className="fade">
              <div className="sc-result-label">ESTIMATED COMPENSATION</div>
              <div className="result-card mb-6">
                <div className="sc-range-label">SALARY RANGE</div>
                <div className="sc-range-amt sc-range-amt-first">{fmtL(low)}</div>
                <div className="sc-range-to">to</div>
                <div className="sc-range-amt">{fmtL(high)}</div>
                <div className="sc-midpoint">MIDPOINT <span className="sc-midpoint-val">{fmtL(estimated)}</span></div>
              </div>
              <div className="sc-metrics-grid">
                {[
                  { label: "AVG BONUS", val: fmtL(bonus), sub: "~15% of base" },
                  { label: "EQUITY / ESOP", val: fmtL(equity), sub: "4-yr vest" },
                  { label: "TAKE-HOME / MO", val: fmtL(takeHomeMonthly), sub: `Tax: ${taxRegime === "new" ? "New" : "Old"} Regime` },
                  { label: "TOTAL CTC", val: fmtL(estimated + bonus + equity / 4), sub: "incl. all comp" },
                ].map(({ label, val, sub }) => (
                  <div key={label} className="sc-metric-card">
                    <div className="sc-metric-label">{label}</div>
                    <div className="sc-metric-val">{val}</div>
                    <div className="sc-metric-sub">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="sc-context-card">
                <div className="sc-context-label">PROFILE CONTEXT</div>
                {[
                  { k: "Company", v: company || "Not specified" },
                  { k: "Role", v: role },
                  { k: "Experience", v: `${exp} years` },
                  { k: "Company Type", v: TIER_LABELS[tier] },
                  { k: "Location", v: city },
                  { k: "Skills Premium", v: `+${(skills.reduce((a, s) => a + (SKILL_BONUS[s] || 0), 0) * 50).toFixed(0)}%` },
                ].map(({ k, v }) => (
                  <div key={k} className="sc-context-row">
                    <span>{k}</span><span className="sc-context-val">{v}</span>
                  </div>
                ))}
              </div>

              <div className="sc-growth-card">
                <div className="sc-growth-text">Want to reach the top 10% of this range?</div>
                <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'resume' }))} className="sc-growth-btn">
                  Optimize My Resume →
                </button>
              </div>

              <p className="sc-disclaimer">
                Estimates based on aggregated market data. Actual compensation varies by company, performance, and negotiation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
