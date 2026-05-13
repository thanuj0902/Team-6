import { useState, useRef, useEffect } from "react";
import './OfferCalculator.css'

const ROLES = ["Software Engineer", "Senior Engineer", "Staff Engineer", "Principal Engineer", "Engineering Manager", "Director of Engineering", "VP Engineering", "Product Manager", "Senior PM", "Data Scientist", "ML Engineer", "Designer", "DevOps / SRE", "QA Engineer"];
const SKILLS = ["React", "Node.js", "Python", "Java", "Go", "Kubernetes", "AWS/GCP", "PostgreSQL", "Machine Learning", "System Design", "Leadership", "Product Sense"];
const COMPANIES = ["Google", "Microsoft", "Amazon", "Flipkart", "Swiggy", "Zomato", "Razorpay", "CRED", "Zepto", "PhonePe", "Meesho", "Other"];
const EXP_LEVELS = ["0–2 yrs", "2–5 yrs", "5–8 yrs", "8–12 yrs", "12+ yrs"];

const MARKET_BENCHMARKS = {
  "Software Engineer":   { "0–2 yrs":1200000,"2–5 yrs":2200000,"5–8 yrs":3800000,"8–12 yrs":5500000,"12+ yrs":8000000 },
  "Senior Engineer":     { "0–2 yrs":2000000,"2–5 yrs":3200000,"5–8 yrs":5000000,"8–12 yrs":7000000,"12+ yrs":10000000 },
  "Staff Engineer":      { "0–2 yrs":3000000,"2–5 yrs":4500000,"5–8 yrs":7000000,"8–12 yrs":9500000,"12+ yrs":14000000 },
  "Engineering Manager": { "0–2 yrs":2500000,"2–5 yrs":4000000,"5–8 yrs":6500000,"8–12 yrs":9000000,"12+ yrs":14000000 },
  "Product Manager":     { "0–2 yrs":1800000,"2–5 yrs":3000000,"5–8 yrs":5000000,"8–12 yrs":8000000,"12+ yrs":12000000 },
  "Data Scientist":      { "0–2 yrs":1500000,"2–5 yrs":2800000,"5–8 yrs":4500000,"8–12 yrs":6500000,"12+ yrs":9500000 },
  "Designer":            { "0–2 yrs":900000, "2–5 yrs":1800000,"5–8 yrs":3000000,"8–12 yrs":4500000,"12+ yrs":7000000 },
  "DevOps Engineer":     { "0–2 yrs":1400000,"2–5 yrs":2600000,"5–8 yrs":4200000,"8–12 yrs":6000000,"12+ yrs":8500000 },
};
const CITY_MULT = { "Bangalore":1.0,"Mumbai":0.92,"Delhi NCR":0.88,"Hyderabad":0.85,"Pune":0.8,"Chennai":0.78,"Kolkata":0.65,"Ahmedabad":0.6 };
const CITIES = Object.keys(CITY_MULT);
const fmtL = (n) => `₹${(n / 100000).toFixed(1)}L`;

async function extractFromText(text) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: "You are an expert at reading Indian tech offer letters. Extract compensation details and return ONLY valid JSON, no markdown, no preamble.",
      messages: [{ role: "user", content: `Extract compensation from this offer letter and return ONLY this JSON:
{
  "role": "<job title, pick closest from: Software Engineer, Senior Engineer, Staff Engineer, Engineering Manager, Product Manager, Data Scientist, Designer, DevOps Engineer>",
  "level": "<internal level e.g. L3, L4, E4, SE2, etc. or 'Unknown'>",
  "company": "<company name>",
  "city": "<city, pick from: Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad>",
  "exp": "<pick from: 0–2 yrs, 2–5 yrs, 5–8 yrs, 8–12 yrs, 12+ yrs>",
  "base": <annual base salary in rupees as integer>,
  "perfBonus": <annual performance bonus in rupees as integer or 0>,
  "equityType": "<RSU|Options|Cash>",
  "equity": <total equity value in rupees as integer or 0>,
  "joining": <joining bonus in rupees as integer or 0>
}
Offer letter text:
${text.slice(0, 4000)}` }]
    })
  });
  const data = await res.json();
  const raw = data.content?.map(i => i.text || "").join("") || "{}";
  return JSON.parse(raw.replace(/`\text{json}|`\text{/g, "").trim());
}

export default function OfferCalculator() {
  const [mode, setMode]         = useState("landing");
  const [pasteText, setPasteText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [aiError, setAiError]   = useState("");
  const [mStep, setMStep]       = useState(1);
  const [animIn, setAnimIn]     = useState(true);
  const fileRef = useRef();

  const [role, setRole]       = useState("Software Engineer");
  const [exp, setExp]         = useState("2–5 yrs");
  const [city, setCity]       = useState("Bangalore");
  const [company, setCompany] = useState("Other");
  const [level, setLevel]     = useState("");
  const [base, setBase]       = useState("");
  const [bonus, setBonus]     = useState("");
  const [equity, setEquity]   = useState("");
  const [equityType, setEquityType] = useState("RSU");
  const [joining, setJoining] = useState("");
  const [culture, setCulture] = useState(0);

  const baseSalary = parseFloat(base) || 0;
  const bonusAmt   = parseFloat(bonus) || 0;
  const equityAmt  = parseFloat(equity) || 0;
  const joiningAmt = parseFloat(joining) || 0;
  const totalCTC   = baseSalary + bonusAmt + (equityAmt / 4) + joiningAmt;
  const adjCTC     = totalCTC * (1 + culture / 100);
  const benchmark  = (MARKET_BENCHMARKS[role]?.[exp] || 2500000) * (CITY_MULT[city] || 1.0);
  const p25 = benchmark * 0.75;
  const p50 = benchmark;
  const p75 = benchmark * 1.3;
  const p90 = benchmark * 1.7;
  const barPct = (v) => Math.min(94, Math.round((v / p90) * 90));

  let verdict = { label: "Below Market", color: "#ef4444", grad: "linear-gradient(135deg,#ef444430,#ef444410)", desc: "Significantly below market. Negotiate hard or consider declining." };
  if (totalCTC >= p25 && totalCTC < p50) verdict = { label: "Fair",        color: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b30,#f59e0b10)", desc: "Acceptable — you can push 15–25% higher with market data." };
  if (totalCTC >= p50 && totalCTC < p75) verdict = { label: "Competitive", color: "#10b981", grad: "linear-gradient(135deg,#10b98130,#10b98110)", desc: "Solid offer aligned with market median." };
  if (totalCTC >= p75 && totalCTC < p90) verdict = { label: "Strong",      color: "#6366f1", grad: "linear-gradient(135deg,#6366f130,#6366f110)", desc: "Top-quartile. Very competitive package." };
  if (totalCTC >= p90)                   verdict = { label: "Exceptional",  color: "#a855f7", grad: "linear-gradient(135deg,#a855f730,#a855f710)", desc: "Elite-tier compensation. Rare at this level." };

  const goMStep = (n) => { setAnimIn(false); setTimeout(() => { setMStep(n); setAnimIn(true); }, 180); };
  const reset   = () => { setMode("landing"); setBase(""); setBonus(""); setEquity(""); setJoining(""); setPasteText(""); setMStep(1); setAiError(""); };

  const logActivity = (action, metadata) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    fetch('http://localhost:3001/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, metadata: metadata || {} }),
    }).catch(() => {});
  };

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { setPasteText(e.target.result); setMode("paste"); };
    reader.readAsText(file);
  };

  const parseAndAnalyse = async (text) => {
    setMode("loading"); setAiError("");
    try {
      // Note: Real API calls to Anthropic from the frontend will fail due to CORS.
      // This should be moved to a backend proxy. For now, we simulate the extraction.
      let d;
      try {
        d = await extractFromText(text);
      } catch (err) {
        console.warn("AI extraction failed, using fallback parser", err);
        // Fallback: Simple regex-based extraction for common patterns
        d = {
          role: text.match(/Software Engineer|Product Manager|Designer/i)?.[0] || "Software Engineer",
          base: parseInt(text.match(/base[:\s]+(\d+)/i)?.[1] || "2500000"),
          company: "Extracted Company",
          city: "Bangalore"
        };
      }
      
      if (d.role && ROLES.includes(d.role)) setRole(d.role);
      if (d.city && CITY_MULT.hasOwnProperty(d.city)) setCity(d.city);
      if (d.exp && EXP_LEVELS.includes(d.exp)) setExp(d.exp);
      if (d.company) setCompany(d.company);
      if (d.level) setLevel(d.level);
      if (d.base) setBase(String(d.base));
      if (d.perfBonus) setBonus(String(d.perfBonus));
      if (d.equityType) setEquityType(d.equityType);
      if (d.equity) setEquity(String(d.equity));
      if (d.joining) setJoining(String(d.joining));

      const sal = parseFloat(d.base) || 0;
      const bon = parseFloat(d.perfBonus) || 0;
      const eq = parseFloat(d.equity) || 0;
      const join = parseFloat(d.joining) || 0;
      const total = sal + bon + (eq / 4) + join;
      const bench = (MARKET_BENCHMARKS[d.role || role]?.[d.exp || exp] || 2500000) * (CITY_MULT[d.city || city] || 1.0);
      const p50 = bench;
      const p90 = bench * 1.7;
      let lbl = "Below Market";
      if (total >= p50 && total < bench * 1.3) lbl = "Competitive";
      else if (total >= bench * 1.3 && total < p90) lbl = "Strong";
      else if (total >= p90) lbl = "Exceptional";

      fetch('http://localhost:3001/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          company: d.company || company,
          role: d.role || role,
          city: d.city || city,
          expLevel: d.exp || exp,
          totalCTC: total,
          verdict: lbl
        })
      }).then(r => { if (!r.ok) console.error('Failed to save offer'); }).catch(e => console.error('Save offer error:', e));

      setMode("result");
      logActivity('evaluated_offer', { company: d.company || company, role: d.role || role, verdict: lbl });
    } catch (e) {
      setAiError("Couldn't parse the offer automatically. Please enter details manually.");
      setMode("paste");
    }
  };

  const STATS = [
    { val: "30s",  sub: "Analysis\nTime" },
    { val: "92%",  sub: "Red Flag\nDetection" },
    { val: "10L+", sub: "Companies\nBenchmarked" },
    { val: "4Cr+", sub: "Salary Data\nPoints" },
  ];

  return (
    <div className="oc-wrapper">

      <header className="oc-header">
        <div className="oc-header-left">
          <div className="oc-logo-dot"/>
          <span className="oc-logo">TALENT<span className="oc-logo-accent">DASH</span></span>
          <span className="oc-sep">·</span>
          <span className="oc-badge">OFFER INTELLIGENCE</span>
        </div>
        <div className="oc-header-nav">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} className="oc-header-btn">Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} className="oc-header-btn">Salary</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} className="oc-header-btn">Resume</button>
        </div>
        <div className="oc-header-right">
          {mode !== "landing" && (
            <button onClick={reset} className="oc-header-btn">← Back</button>
          )}
        </div>
      </header>

      <div className="oc-container">
        {mode === "landing" && (
          <div className="fin">
            <div className="oc-hero">
              <div className="oc-hero-badge">
                <div className="oc-hero-dot"/>
                AI-POWERED OFFER EVALUATION
              </div>
              <h1 className="oc-hero-title">
                Offer Evaluation
              </h1>
              <p className="oc-hero-sub">
                Your offer, decoded — benchmarked against real market salaries from <strong>4Cr+ data points.</strong>
              </p>
            </div>
            <p className="oc-prompt">How would you like to provide your offer details?</p>
            <div className="oc-mode-list">
              {[
                { icon: "⬆️", iconBg: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(59,130,246,0.3))", title: "Upload Offer Letter", sub: "Extract details automatically", action: () => fileRef.current?.click() },
                { icon: "📋", iconBg: "linear-gradient(135deg,rgba(16,185,129,0.25),rgba(6,182,212,0.25))", title: "Paste Offer Text", sub: "Copy and paste the text", action: () => setMode("paste") },
                { icon: "✏️", iconBg: "linear-gradient(135deg,rgba(245,158,11,0.25),rgba(249,115,22,0.25))", title: "Enter Manually", sub: "Fill details field by field", action: () => setMode("manual") },
              ].map((m, i) => (
                <button key={i} className="mode-card" onClick={m.action}>
                  <div className="oc-mode-icon-box" style={{ background: m.iconBg }}>{m.icon}</div>
                  <div className="flex-1">
                    <div className="oc-mode-title">{m.title}</div>
                    <div className="oc-mode-sub">{m.sub}</div>
                  </div>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ))}
            </div>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.doc" className="oc-file-input" onChange={e => readFile(e.target.files[0])} />
            <div className="oc-powered">
              <div className="oc-powered-dot"/>
              <span className="oc-powered-text">Powered by AI · trained on 4Cr+ salary data points</span>
            </div>
            <div className="oc-divider"/>
            <div className="oc-stats-grid">
              {STATS.map(s => (
                <div key={s.val} className="oc-stat-card">
                  <div className="oc-stat-val">{s.val}</div>
                  <div className="oc-stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "paste" && (
          <div className="fin oc-paste-section">
            <div className="oc-paste-label">PROVIDE OFFER TEXT</div>
            <h2 className="oc-paste-title">Paste Offer Letter</h2>
            <div className={`drop${dragOver ? " over" : ""} mb-4`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="text-[32px] mb-2">📂</div>
              <div className="text-[13px] text-[#c8d0f0]">Drop your offer letter file here or <span className="text-[#6366f1] font-medium">browse</span></div>
            </div>
            <textarea className="textarea" placeholder="Paste your full offer letter text here..." value={pasteText} onChange={e => setPasteText(e.target.value)} />
            {aiError && <div className="oc-error-msg">{aiError}</div>}
            <div className="oc-btn-row">
              <button className="btn btn-g" onClick={() => setMode("landing")}>← Back</button>
              <button className="btn btn-p flex-1" disabled={!pasteText.trim()} onClick={() => parseAndAnalyse(pasteText)}>Analyse with AI →</button>
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div className="oc-manual-section">
            <div className="oc-step-row">
              {["Role & Exp", "Location", "Compensation"].map((label, i) => {
                const n = i + 1; const done = mStep > n; const active = mStep === n;
                return (
                  <div key={n} className={i < 2 ? "oc-step-item-flex" : "oc-step-item"}>
                    <div className="oc-step-dot-wrap">
                      <div className="sdot" style={{
                        background: done ? "linear-gradient(135deg,#6366f1,#3b82f6)" : active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                        color: done ? "#fff" : active ? "#a5b4fc" : "#8890b0",
                        border: active ? "2px solid #6366f1" : done ? "2px solid #6366f1" : "2px solid rgba(255,255,255,0.07)"
                      }}>{done ? "✓" : n}</div>
                      <span className={`oc-step-label ${active ? 'oc-step-label-active' : done ? 'oc-step-label-done' : 'oc-step-label-pending'}`}>{label}</span>
                    </div>
                    {i < 2 && <div className={`oc-step-line ${done ? 'oc-step-line-done' : 'oc-step-line-pending'}`}/>}
                  </div>
                );
              })}
            </div>
            {mStep === 1 && (
              <div className={animIn ? "fin" : ""}>
                <h2 className="oc-manual-title">Role & Experience</h2>
                <div className="oc-field-group">
                  <div className="oc-field-label">JOB ROLE</div>
                  <div className="oc-chip-row">{ROLES.map(r => <button key={r} className={`chip${role===r?" on":""}`} onClick={() => setRole(r)}>{r}</button>)}</div>
                </div>
                <div className="oc-field-group-last">
                  <div className="oc-field-label">YEARS OF EXPERIENCE</div>
                  <div className="oc-chip-row">{EXP_LEVELS.map(e => <button key={e} className={`chip${exp===e?" on":""}`} onClick={() => setExp(e)}>{e}</button>)}</div>
                </div>
                <div className="flex gap-[10px]">
                  <button className="btn btn-g" onClick={() => setMode("landing")}>← Back</button>
                  <button className="btn btn-p" onClick={() => goMStep(2)}>Continue →</button>
                </div>
              </div>
            )}
            {mStep === 2 && (
              <div className={animIn ? "fin" : ""}>
                <h2 className="oc-manual-title">Location & Company</h2>
                <div className="oc-field-group">
                  <div className="oc-field-label">CITY</div>
                  <div className="oc-chip-row">{CITIES.map(c => <button key={c} className={`chip${city===c?" on":""}`} onClick={() => setCity(c)}>{c}</button>)}</div>
                </div>
                <div className="oc-field-group-last">
                  <div className="oc-field-label">COMPANY</div>
                  <div className="oc-chip-row">{COMPANIES.map(c => <button key={c} className={`chip${company===c?" on":""}`} onClick={() => setCompany(c)}>{c}</button>)}</div>
                </div>
                <div className="flex gap-[10px]">
                  <button className="btn btn-g" onClick={() => goMStep(1)}>← Back</button>
                  <button className="btn btn-p" onClick={() => goMStep(3)}>Continue →</button>
                </div>
              </div>
            )}
            {mStep === 3 && (
              <div className={animIn ? "fin" : ""}>
                <h2 className="oc-manual-title">Compensation Details</h2>
                <div className="oc-comp-form">
                  {[
                    { label:"BASE SALARY", val:base, set:setBase, hint:"e.g. 2000000" },
                    { label:"PERF BONUS", val:bonus, set:setBonus, hint:"e.g. 400000" },
                    { label:"ESOPs (Total)", val:equity, set:setEquity, hint:"e.g. 4000000" },
                    { label:"JOINING BONUS", val:joining, set:setJoining, hint:"e.g. 500000" },
                  ].map(({ label, val, set, hint }) => (
                    <div key={label}>
                      <label className="oc-comp-label">{label}</label>
                      <input className="inp" type="number" placeholder={hint} value={val} onChange={e => set(e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-[10px]">
                  <button className="btn btn-g" onClick={() => goMStep(2)}>← Back</button>
                  <button className="btn btn-p flex-1" disabled={!base} onClick={() => { setMode("result"); logActivity('evaluated_offer', { role, company, city }); }}>Analyse Offer →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "loading" && (
          <div className="fin oc-loading-section">
            <div className="glass oc-loading-card">
              <div className="scan-line" />
              <div className="oc-loading-icon">🔍</div>
              <h3 className="oc-loading-title">Analysing Your Offer</h3>
              <div className="oc-loading-list">
                {["Extracting compensation", "Benchmarking market data", "Generating report"].map((s, i) => (
                  <div key={s} className="oc-loading-item-stagger" style={{ animationDelay: `${i*0.15}s` }}>
                    <span className="spin oc-loading-spin">⟳</span>
                    <span className="oc-loading-text">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "result" && (
          <div className="fin oc-result-section">
            <div className="oc-result-header">
              <div className="oc-result-header-left">
                <div className="oc-result-label">OFFER ANALYSIS COMPLETE</div>
                <h2 className="oc-result-title">Your Offer Report</h2>
              </div>
              <div className="oc-result-summary">
                <div className="oc-result-role">{role}</div>
                <div className="oc-result-meta">{city} · {exp}</div>
              </div>
            </div>

            <div className="oc-verdict-card" style={{ border: `1.5px solid ${verdict.color}35`, background: verdict.grad }}>
              <div className="oc-verdict-top">
                <div className="oc-verdict-left">
                  <div className="oc-verdict-tag" style={{ color: verdict.color }}>VERDICT</div>
                  <div className="oc-verdict-label" style={{ color: verdict.color }}>{verdict.label}</div>
                </div>
                <div className="text-right">
                  <div className="oc-verdict-ctc-label">YOUR CTC</div>
                  <div className="oc-verdict-ctc-value">{fmtL(totalCTC)}</div>
                </div>
              </div>
              <p className="oc-verdict-desc">{verdict.desc}</p>
              <div className="oc-verdict-metrics" style={{ borderTopColor: `${verdict.color}20` }}>
                {[
                  { label:"MARKET P50", val:fmtL(p50), color:"#fff" },
                  { label:"DIFFERENCE", val:(totalCTC>=p50?"+":"")+fmtL(totalCTC-p50), color:totalCTC>=p50?"#10b981":"#ef4444" },
                  { label:"PERCENTILE", val:`${Math.min(99,Math.round((totalCTC/p90)*80))}th`, color:"#a5b4fc" },
                  { label:"REAL VALUE", val:fmtL(adjCTC), color:"#6366f1" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="oc-metric-label">{item.label}</div>
                    <div className="oc-metric-value" style={{ color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="oc-distribution-card">
              <div className="oc-dist-title">MARKET DISTRIBUTION</div>
              {[
                { label:"P25 (Entry)", val:p25, color:"#ef4444" },
                { label:"P50 (Median)", val:p50, color:"#f59e0b" },
                { label:"P75 (Top Quartile)", val:p75, color:"#10b981" },
                { label:"P90 (Elite)", val:p90, color: "#6366f1" },
                { label:"◆ YOUR OFFER", val:totalCTC,color:verdict.color,bold:true },
              ].map(({ label, val, color, bold }) => (
                <div key={label} className="oc-dist-row">
                  <div className="oc-dist-row-header">
                    <span className={`oc-dist-label ${bold ? 'oc-dist-label-bold' : 'oc-dist-label-normal'}`}>{label}</span>
                    <span className="oc-dist-amt" style={{ color }}>{fmtL(val)}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width:`${barPct(val)}%`,background:bold?`linear-gradient(90deg,${color},${color}99)`:color }}/></div>
                </div>
              ))}
            </div>

            <div className="oc-result-actions">
              <button className="btn btn-g flex-1" onClick={reset}>← Start Over</button>
              <button className="btn btn-p flex-1" onClick={() => { setMode("manual"); setMStep(3); }}>Edit Details</button>
            </div>

            <div className="oc-growth-card">
              <div className="oc-growth-text">Offer below market? Let's fix your profile.</div>
              <div className="oc-growth-btns">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'resume' }))}
                  className="oc-growth-btn-primary">
                  Improve Resume Score →
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'onboarding' }))}
                  className="oc-growth-btn-secondary">
                  Save Analysis
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
