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
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#0c111d 0%,#161d31 35%,#0f162a 65%,#070b18 100%)", fontFamily: "'Inter', sans-serif", color: "#e2e2f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pill { display:inline-flex;align-items:center;padding:9px 17px;border-radius:9px;border:1.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.18s;font-size:13px;font-family:inherit;color:#8890b0; }
        .pill:hover { border-color:rgba(99,102,241,0.5);color:#c8d0f0;background:rgba(99,102,241,0.08); }
        .pill.active { border-color:#6366f1;background:rgba(99,102,241,0.18);color:#a5b4fc;font-weight:600; }
        .inp { width:100%;padding:14px 18px;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.09);border-radius:12px;color:#e8e8f0;font-size:15px;font-family:inherit;outline:none;transition:all 0.2s; }
        .inp:focus { border-color:#6366f1;background:rgba(99,102,241,0.07);box-shadow:0 0 0 3px rgba(99,102,241,0.12); }
        .range-inp { width:100%;-webkit-appearance:none;appearance:none;height:4px;background:rgba(255,255,255,0.1);outline:none;border-radius:2px; }
        .range-inp::-webkit-slider-thumb { -webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:3px solid #0d0b22;box-shadow:0 0 10px rgba(99,102,241,0.5); }
        .divider { border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0; }
        .result-card { background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);color:#f5f4f0;border-radius:18px;padding:40px;border:1px solid rgba(255,255,255,0.08); }
        .btn-calc { width:100%;padding:16px;background:linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#3b82f6 100%);color:#fff;border:none;border-radius:13px;font-size:14px;font-family:inherit;cursor:pointer;font-weight:600;letter-spacing:0.05em;transition:all 0.2s;box-shadow:0 4px 24px rgba(99,102,241,0.4); }
        .btn-calc:hover { transform:translateY(-2px);box-shadow:0 8px 36px rgba(99,102,241,0.6); }
        .fade { animation: fadeUp 0.3s ease forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <header style={{ padding: "18px 32px", borderBottom: "1px solid rgba(99,102,241,0.13)", display: "flex", alignItems: "center", backdropFilter: "blur(24px)", position: "sticky", top: 0, background: "rgba(13,11,34,0.82)", zIndex: 10 }}>
        <div style={{ flex:1, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%" }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", color: "#fff" }}>TALENT<span style={{ color: "#6366f1" }}>DASH</span></span>
          <span style={{ color: "rgba(99,102,241,0.3)", margin: "0 6px" }}>·</span>
          <span style={{ fontSize: 11, color: "#3d4468", letterSpacing: "0.08em" }}>SALARY INTELLIGENCE</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Resume</button>
        </div>
        <div style={{ flex:1 }}/>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 65px)" }}>
        <div style={{ padding: "48px 40px", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 46, fontWeight: 800, lineHeight: 1.1, marginBottom: 8, color: "#fff" }}>Salary<br /><em style={{ color: "#6366f1" }}>Calculator</em></h1>
          <p style={{ fontSize: 13, color: "#5a6080", marginBottom: 40, lineHeight: 1.7 }}>Real compensation data from 2M+ professionals across India's tech ecosystem.</p>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3d4468", marginBottom: 12 }}>ROLE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ROLES.map(r => <button key={r} className={`pill${role === r ? " active" : ""}`} onClick={() => setRole(r)}>{r}</button>)}
            </div>
          </div>
          <hr className="divider" style={{ marginBottom: 32 }} />
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3d4468", marginBottom: 12 }}>COMPANY NAME</div>
            <input className="inp" type="text" placeholder="e.g. Google, Razorpay..." value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <hr className="divider" style={{ marginBottom: 32 }} />
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3d4468" }}>EXPERIENCE</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#fff" }}>{exp} <span style={{ fontSize: 13, color: "#5a6080" }}>yrs</span></div>
            </div>
            <input type="range" className="range-inp" min={0} max={20} step={1} value={exp} onChange={e => setExp(+e.target.value)} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3d4468", marginTop: 8 }}>
              <span>Fresher</span><span>5yr</span><span>10yr</span><span>15yr</span><span>20yr</span>
            </div>
          </div>
          <hr className="divider" style={{ marginBottom: 32 }} />
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3d4468", marginBottom: 12 }}>COMPANY TYPE</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(TIER_LABELS).map(([k, v]) => (
                <button key={k} className={`pill${tier === k ? " active" : ""}`} onClick={() => setTier(k)}>{v}</button>
              ))}
            </div>
          </div>
          <hr className="divider" style={{ marginBottom: 32 }} />
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3d4468", marginBottom: 12 }}>LOCATION</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CITIES.map(c => <button key={c} className={`pill${city === c ? " active" : ""}`} onClick={() => setCity(c)}>{c}</button>)}
            </div>
          </div>
          <hr className="divider" style={{ marginBottom: 32 }} />
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3d4468", marginBottom: 12 }}>TAX REGIME</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`pill${taxRegime === "new" ? " active" : ""}`} onClick={() => setTaxRegime("new")}>New Regime</button>
              <button className={`pill${taxRegime === "old" ? " active" : ""}`} onClick={() => setTaxRegime("old")}>Old Regime</button>
            </div>
          </div>
          <hr className="divider" style={{ marginBottom: 32 }} />
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3d4468", marginBottom: 12 }}>HIGH-VALUE SKILLS <span style={{ color: "#5a6080" }}>(select all that apply)</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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

        <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: show ? "flex-start" : "center" }}>
          {!show ? (
            <div style={{ textAlign: "center", color: "#3d4468" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 13, letterSpacing: "0.04em" }}>Configure your profile and calculate</p>
            </div>
          ) : (
            <div className="fade">
              <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: "0.12em", marginBottom: 24 }}>ESTIMATED COMPENSATION</div>
              <div className="result-card" style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: "#8c8880", letterSpacing: "0.1em", marginBottom: 8 }}>SALARY RANGE</div>
                <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, marginBottom: 4, color: "#fff" }}>{fmtL(low)}</div>
                <div style={{ fontSize: 13, color: "#8c8880", marginBottom: 4 }}>to</div>
                <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, color: "#fff" }}>{fmtL(high)}</div>
                <div style={{ fontSize: 11, color: "#8c8880", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>MIDPOINT <span style={{ color: "#a5b4fc", fontSize: 15, fontWeight: 600 }}>{fmtL(estimated)}</span></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "AVG BONUS", val: fmtL(bonus), sub: "~15% of base" },
                  { label: "EQUITY / ESOP", val: fmtL(equity), sub: "4-yr vest" },
                  { label: "TAKE-HOME / MO", val: fmtL(takeHomeMonthly), sub: `Tax: ${taxRegime === "new" ? "New" : "Old"} Regime` },
                  { label: "TOTAL CTC", val: fmtL(estimated + bonus + equity / 4), sub: "incl. all comp" },
                ].map(({ label, val, sub }) => (
                  <div key={label} style={{ padding: "20px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontSize: 10, color: "#3d4468", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: "#e2e2f0" }}>{val}</div>
                    <div style={{ fontSize: 11, color: "#5a6080", marginTop: 4 }}>{sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "20px", background: "rgba(99,102,241,0.05)", borderRadius: 12, border:"1px solid rgba(99,102,241,0.15)" }}>
                <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: "0.1em", marginBottom: 12 }}>PROFILE CONTEXT</div>
                {[
                  { k: "Company", v: company || "Not specified" },
                  { k: "Role", v: role },
                  { k: "Experience", v: `${exp} years` },
                  { k: "Company Type", v: TIER_LABELS[tier] },
                  { k: "Location", v: city },
                  { k: "Skills Premium", v: `+${(skills.reduce((a, s) => a + (SKILL_BONUS[s] || 0), 0) * 50).toFixed(0)}%` },
                ].map(({ k, v }) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#8890b0" }}>
                    <span>{k}</span><span style={{ color: "#fff", fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 24,
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(0,0,0,0))',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 14,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 12, color: '#a5b4fc', marginBottom: 12 }}>Want to reach the top 10% of this range?</div>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'resume' }))}
                  style={{
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  Optimize My Resume →
                </button>
              </div>

              <p style={{ fontSize: 10, color: "#3d4468", marginTop: 20, lineHeight: 1.6 }}>
                Estimates based on aggregated market data. Actual compensation varies by company, performance, and negotiation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
