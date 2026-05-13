import { useState, useEffect } from "react";

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

const fmtL = (n) => `\u20B9${(n / 100000).toFixed(1)}L`;

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
    <div className="min-h-screen font-body text-td-foreground bg-[linear-gradient(145deg,#0c111d_0%,#161d31_35%,#0f162a_65%,#070b18_100%)]">
      <header className="px-8 py-[18px] border-b border-td-indigo/13 flex items-center backdrop-blur-xl sticky top-0 bg-td-dark-2/82 z-10">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="font-display font-extrabold text-[16px] tracking-[0.1em] text-white">TALENT<span className="text-td-indigo">DASH</span></span>
          <span className="text-td-indigo/30 mx-1.5">·</span>
          <span className="text-[11px] text-td-muted-dark tracking-[0.08em]">SALARY INTELLIGENCE</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-white/10 rounded-md text-td-muted cursor-pointer">Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-white/10 rounded-md text-td-muted cursor-pointer">Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-white/10 rounded-md text-td-muted cursor-pointer">Resume</button>
        </div>
        <div className="flex-1" />
      </header>

      <div className="grid grid-cols-2 min-h-[calc(100vh-65px)]">
        <div className="px-10 py-12 border-r border-white/8">
          <h1 className="font-display text-[46px] font-extrabold leading-[1.1] mb-2 text-white">Salary<br /><em className="text-td-indigo">Calculator</em></h1>
          <p className="text-[13px] text-td-muted-darker mb-10 leading-[1.7]">Real compensation data from 2M+ professionals across India's tech ecosystem.</p>

          <div className="mb-8">
            <div className="text-[10px] tracking-[0.12em] text-td-muted-dark mb-3">ROLE</div>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border cursor-pointer transition-all duration-150 text-[13px] ${
                    role === r
                      ? 'border-td-indigo bg-td-indigo/[0.18] text-[#a5b4fc] font-semibold'
                      : 'border-white/8 bg-white/[0.03] text-td-muted hover:border-td-indigo/50 hover:text-td-foreground-muted hover:bg-td-indigo-soft'
                  }`}
                  onClick={() => setRole(r)}
                >{r}</button>
              ))}
            </div>
          </div>
          <hr className="border-0 border-t border-white/8 m-0 mb-8" />
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.12em] text-td-muted-dark mb-3">COMPANY NAME</div>
            <input
              className="w-full px-[18px] py-[14px] bg-white/[0.05] border border-white/9 rounded-xl text-[#e8e8f0] text-[15px] outline-none transition-all duration-200 focus:border-td-indigo focus:bg-td-indigo/[0.07] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
              type="text"
              placeholder="e.g. Google, Razorpay..."
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>
          <hr className="border-0 border-t border-white/8 m-0 mb-8" />
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-4">
              <div className="text-[10px] tracking-[0.12em] text-td-muted-dark">EXPERIENCE</div>
              <div className="text-4xl font-bold text-white">{exp} <span className="text-[13px] text-td-muted-darker">yrs</span></div>
            </div>
            <input type="range" className="w-full accent-td-indigo" min={0} max={20} step={1} value={exp} onChange={e => setExp(+e.target.value)} />
            <div className="flex justify-between text-[10px] text-td-muted-dark mt-2">
              <span>Fresher</span><span>5yr</span><span>10yr</span><span>15yr</span><span>20yr</span>
            </div>
          </div>
          <hr className="border-0 border-t border-white/8 m-0 mb-8" />
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.12em] text-td-muted-dark mb-3">COMPANY TYPE</div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TIER_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border cursor-pointer transition-all duration-150 text-[13px] ${
                    tier === k
                      ? 'border-td-indigo bg-td-indigo/[0.18] text-[#a5b4fc] font-semibold'
                      : 'border-white/8 bg-white/[0.03] text-td-muted hover:border-td-indigo/50 hover:text-td-foreground-muted hover:bg-td-indigo-soft'
                  }`}
                  onClick={() => setTier(k)}
                >{v}</button>
              ))}
            </div>
          </div>
          <hr className="border-0 border-t border-white/8 m-0 mb-8" />
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.12em] text-td-muted-dark mb-3">LOCATION</div>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(c => (
                <button
                  key={c}
                  className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border cursor-pointer transition-all duration-150 text-[13px] ${
                    city === c
                      ? 'border-td-indigo bg-td-indigo/[0.18] text-[#a5b4fc] font-semibold'
                      : 'border-white/8 bg-white/[0.03] text-td-muted hover:border-td-indigo/50 hover:text-td-foreground-muted hover:bg-td-indigo-soft'
                  }`}
                  onClick={() => setCity(c)}
                >{c}</button>
              ))}
            </div>
          </div>
          <hr className="border-0 border-t border-white/8 m-0 mb-8" />
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.12em] text-td-muted-dark mb-3">TAX REGIME</div>
            <div className="flex gap-2">
              <button
                className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border cursor-pointer transition-all duration-150 text-[13px] ${
                  taxRegime === "new"
                    ? 'border-td-indigo bg-td-indigo/[0.18] text-[#a5b4fc] font-semibold'
                    : 'border-white/8 bg-white/[0.03] text-td-muted hover:border-td-indigo/50 hover:text-td-foreground-muted hover:bg-td-indigo-soft'
                }`}
                onClick={() => setTaxRegime("new")}
              >New Regime</button>
              <button
                className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border cursor-pointer transition-all duration-150 text-[13px] ${
                  taxRegime === "old"
                    ? 'border-td-indigo bg-td-indigo/[0.18] text-[#a5b4fc] font-semibold'
                    : 'border-white/8 bg-white/[0.03] text-td-muted hover:border-td-indigo/50 hover:text-td-foreground-muted hover:bg-td-indigo-soft'
                }`}
                onClick={() => setTaxRegime("old")}
              >Old Regime</button>
            </div>
          </div>
          <hr className="border-0 border-t border-white/8 m-0 mb-8" />
          <div className="mb-10">
            <div className="text-[10px] tracking-[0.12em] text-td-muted-dark mb-3">HIGH-VALUE SKILLS <span className="text-td-muted-darker">(select all that apply)</span></div>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button
                  key={s}
                  className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border cursor-pointer transition-all duration-150 text-[13px] ${
                    skills.includes(s)
                      ? 'border-td-indigo bg-td-indigo/[0.18] text-[#a5b4fc] font-semibold'
                      : 'border-white/8 bg-white/[0.03] text-td-muted hover:border-td-indigo/50 hover:text-td-foreground-muted hover:bg-td-indigo-soft'
                  }`}
                  onClick={() => toggleSkill(s)}
                >{s}</button>
              ))}
            </div>
          </div>
          <button
            className="w-full py-4 bg-gradient-to-br from-td-indigo via-indigo-600 to-blue-500 text-white border-0 rounded-[13px] text-[14px] cursor-pointer font-semibold tracking-[0.05em] transition-all duration-200 shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(99,102,241,0.6)]"
            onClick={() => {
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

        <div className={`px-10 py-12 flex flex-col ${show ? 'justify-start' : 'justify-center'}`}>
          {!show ? (
            <div className="text-center text-td-muted-dark">
              <div className="text-[64px] mb-4">🔍</div>
              <p className="text-[13px] tracking-[0.04em]">Configure your profile and calculate</p>
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="text-[10px] text-td-indigo tracking-[0.12em] mb-6">ESTIMATED COMPENSATION</div>
              <div className="bg-white/[0.03] backdrop-blur-[20px] text-[#f5f4f0] rounded-[18px] p-10 border border-white/8 mb-6">
                <div className="text-[11px] text-[#8c8880] tracking-[0.1em] mb-2">SALARY RANGE</div>
                <div className="text-[52px] font-bold leading-none mb-1 text-white">{fmtL(low)}</div>
                <div className="text-[13px] text-[#8c8880] mb-1">to</div>
                <div className="text-[52px] font-bold leading-none text-white">{fmtL(high)}</div>
                <div className="text-[11px] text-[#8c8880] mt-4 pt-4 border-t border-white/10">MIDPOINT <span className="text-[#a5b4fc] text-[15px] font-semibold">{fmtL(estimated)}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "AVG BONUS", val: fmtL(bonus), sub: "~15% of base" },
                  { label: "EQUITY / ESOP", val: fmtL(equity), sub: "4-yr vest" },
                  { label: "TAKE-HOME / MO", val: fmtL(takeHomeMonthly), sub: `Tax: ${taxRegime === "new" ? "New" : "Old"} Regime` },
                  { label: "TOTAL CTC", val: fmtL(estimated + bonus + equity / 4), sub: "incl. all comp" },
                ].map(({ label, val, sub }) => (
                  <div key={label} className="p-5 border border-white/8 rounded-xl bg-white/[0.02]">
                    <div className="text-[10px] text-td-muted-dark tracking-[0.1em] mb-1.5">{label}</div>
                    <div className="text-[22px] font-semibold text-td-foreground">{val}</div>
                    <div className="text-[11px] text-td-muted-darker mt-1">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-td-indigo/[0.05] rounded-xl border border-td-indigo/15">
                <div className="text-[10px] text-td-indigo tracking-[0.1em] mb-3">PROFILE CONTEXT</div>
                {[
                  { k: "Company", v: company || "Not specified" },
                  { k: "Role", v: role },
                  { k: "Experience", v: `${exp} years` },
                  { k: "Company Type", v: TIER_LABELS[tier] },
                  { k: "Location", v: city },
                  { k: "Skills Premium", v: `+${(skills.reduce((a, s) => a + (SKILL_BONUS[s] || 0), 0) * 50).toFixed(0)}%` },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/5 text-td-muted">
                    <span>{k}</span><span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 bg-gradient-to-br from-td-indigo/10 to-transparent border border-td-indigo/20 rounded-[14px] text-center">
                <div className="text-xs text-[#a5b4fc] mb-3">Want to reach the top 10% of this range?</div>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'resume' }))}
                  className="bg-td-indigo text-white border-0 px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Optimize My Resume →
                </button>
              </div>

              <p className="text-[10px] text-td-muted-dark mt-5 leading-[1.6]">
                Estimates based on aggregated market data. Actual compensation varies by company, performance, and negotiation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
