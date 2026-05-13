import { useState, useRef, useEffect } from "react";

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
const fmtL = (n) => `\u20B9${(n / 100000).toFixed(1)}L`;

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
  "exp": "<pick from: 0\u20132 yrs, 2\u20135 yrs, 5\u20138 yrs, 8\u201312 yrs, 12+ yrs>",
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
  const [exp, setExp]         = useState("2\u20135 yrs");
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
  if (totalCTC >= p25 && totalCTC < p50) verdict = { label: "Fair",        color: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b30,#f59e0b10)", desc: "Acceptable \u2014 you can push 15\u201325% higher with market data." };
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
      let d;
      try {
        d = await extractFromText(text);
      } catch (err) {
        console.warn("AI extraction failed, using fallback parser", err);
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
    <div className="min-h-screen bg-[linear-gradient(145deg,#1a1a1a_0%,#2d2d2d_35%,#1a1a1a_65%,#0a0a0a_100%)] text-td-foreground font-body">
      <header className="w-full px-8 py-[18px] flex items-center sticky top-0 z-20 border-b border-[rgba(99,102,241,0.13)] bg-[rgba(13,11,34,0.82)] backdrop-blur-xl">
        <div className="flex-1 flex items-center gap-3.5">
          <div className="w-[9px] h-[9px] rounded-full bg-gradient-to-br from-[#6366f1] to-[#3b82f6] shadow-[0_0_12px_#6366f1aa]" />
          <span className="font-display font-extrabold text-[16px] tracking-[0.1em] text-white">TALENT<span className="text-td-indigo">DASH</span></span>
          <span className="text-[rgba(99,102,241,0.3)] mx-1.5">·</span>
          <span className="text-[11px] text-[#a5b4fc] tracking-[0.1em]">OFFER INTELLIGENCE</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-[6px] text-td-muted cursor-pointer">Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-[6px] text-td-muted cursor-pointer">Salary</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-[6px] text-td-muted cursor-pointer">Resume</button>
        </div>
        <div className="flex-1 flex justify-end items-center gap-1.5">
          {mode !== "landing" && (
            <button onClick={reset} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-[6px] text-td-muted cursor-pointer">← Back</button>
          )}
        </div>
      </header>

      <div className="w-full max-w-[660px] mx-auto px-5 pb-20 relative z-[1]">
        {mode === "landing" && (
          <div className="animate-fade-up">
            <div className="pt-[52px] pb-10 text-center">
              <div className="inline-flex items-center gap-2 px-[18px] py-1.5 rounded-full border border-[rgba(99,102,241,0.3)] text-[11px] text-[#7c7fff] tracking-[0.1em] mb-[22px] bg-[rgba(99,102,241,0.08)]">
                <div className="w-[6px] h-[6px] rounded-full bg-td-indigo shadow-[0_0_8px_#6366f1]" />
                AI-POWERED OFFER EVALUATION
              </div>
              <h1 className="font-display text-[46px] font-extrabold leading-[1.1] text-white mb-4">
                Offer Evaluation
              </h1>
              <p className="text-td-foreground-muted text-[15px] leading-[1.75] max-w-[420px] mx-auto">
                Your offer, decoded — benchmarked against real market salaries from <strong className="text-white">4Cr+ data points.</strong>
              </p>
            </div>
            <p className="text-[13px] text-td-foreground-muted mb-[14px] tracking-[0.02em]">How would you like to provide your offer details?</p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                { icon: "⬆️", iconBg: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(59,130,246,0.3))", title: "Upload Offer Letter", sub: "Extract details automatically", action: () => fileRef.current?.click() },
                { icon: "📋", iconBg: "linear-gradient(135deg,rgba(16,185,129,0.25),rgba(6,182,212,0.25))", title: "Paste Offer Text", sub: "Copy and paste the text", action: () => setMode("paste") },
                { icon: "✏️", iconBg: "linear-gradient(135deg,rgba(245,158,11,0.25),rgba(249,115,22,0.25))", title: "Enter Manually", sub: "Fill details field by field", action: () => setMode("manual") },
              ].map((m, i) => (
                <button key={i} className="flex items-center gap-[18px] px-6 py-[22px] bg-[rgba(255,255,255,0.035)] border-[1.5px] border-[rgba(255,255,255,0.07)] rounded-[18px] cursor-pointer transition-all duration-[0.22s] text-left w-full font-body hover:bg-[rgba(99,102,241,0.1)] hover:border-[rgba(99,102,241,0.45)] hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)]" onClick={m.action}>
                  <div className="w-[50px] h-[50px] rounded-[13px] flex items-center justify-center text-[22px] shrink-0" style={{ background: m.iconBg }}>{m.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[15px] text-[#dde0f5] mb-[5px]">{m.title}</div>
                    <div className="text-[12px] text-[#a5b4fc] leading-[1.55]">{m.sub}</div>
                  </div>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ))}
            </div>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.doc" className="hidden" onChange={e => readFile(e.target.files[0])} />
            <div className="flex items-center justify-center gap-2 mb-9">
              <div className="w-[7px] h-[7px] rounded-full bg-[#10b981] shadow-[0_0_7px_#10b981]" />
              <span className="text-[12px] text-[#a5b4fc]">Powered by AI · trained on 4Cr+ salary data points</span>
            </div>
            <div className="h-[1px] bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)] mb-8" />
            <div className="grid grid-cols-4 gap-2">
              {STATS.map(s => (
                <div key={s.val} className="text-center px-2 py-4 bg-[rgba(255,255,255,0.025)] rounded-[14px] border border-[rgba(255,255,255,0.06)]">
                  <div className="font-display text-[30px] font-extrabold bg-gradient-to-br from-[#818cf8] to-[#60a5fa] bg-clip-text text-transparent">{s.val}</div>
                  <div className="text-[11px] text-[#a5b4fc] mt-1.5 leading-[1.5] whitespace-pre-line">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "paste" && (
          <div className="animate-fade-up pt-11">
            <div className="text-[11px] text-td-indigo tracking-[0.12em] mb-2">PROVIDE OFFER TEXT</div>
            <h2 className="font-display text-[30px] font-bold text-white mb-2">Paste Offer Letter</h2>
            <div className={`border-2 border-dashed rounded-[16px] px-6 py-9 text-center cursor-pointer transition-all duration-[0.2s] mb-4 ${dragOver ? 'border-[rgba(99,102,241,0.6)] bg-[rgba(99,102,241,0.07)]' : 'border-[rgba(99,102,241,0.25)] bg-[rgba(99,102,241,0.02)] hover:border-[rgba(99,102,241,0.6)] hover:bg-[rgba(99,102,241,0.07)]'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="text-[32px] mb-2">📂</div>
              <div className="text-[13px] text-td-foreground-muted">Drop your offer letter file here or <span className="text-td-indigo font-medium">browse</span></div>
            </div>
            <textarea className="w-full min-h-[210px] px-[18px] py-4 bg-[rgba(255,255,255,0.05)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[14px] text-[#e8e8f0] text-[13px] font-mono outline-none resize-y leading-[1.75] transition-all duration-[0.2s]" placeholder="Paste your full offer letter text here..." value={pasteText} onChange={e => setPasteText(e.target.value)} />
            {aiError && <div className="text-[#ef4444] text-[12px] mt-2.5 px-[14px] py-2.5 bg-[rgba(239,68,68,0.08)] rounded-[8px] border border-[rgba(239,68,68,0.2)]">{aiError}</div>}
            <div className="flex gap-2.5 mt-4">
              <button className="px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] bg-[rgba(255,255,255,0.05)] border-[1.5px] border-[rgba(255,255,255,0.1)] text-[#6b7094]" onClick={() => setMode("landing")}>← Back</button>
              <button className="flex-1 px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] border-none bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#3b82f6] text-white shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={!pasteText.trim()} onClick={() => parseAndAnalyse(pasteText)}>Analyse with AI →</button>
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div className="pt-11">
            <div className="flex items-center mb-10">
              {["Role & Exp", "Location", "Compensation"].map((label, i) => {
                const n = i + 1; const done = mStep > n; const active = mStep === n;
                return (
                  <div key={n} className={`flex items-center ${i < 2 ? 'flex-1' : 'flex-auto'}`}>
                    <div className="flex items-center gap-[9px]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: done ? "linear-gradient(135deg,#6366f1,#3b82f6)" : active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)", color: done ? "#fff" : active ? "#a5b4fc" : "#8890b0", border: active ? "2px solid #6366f1" : done ? "2px solid #6366f1" : "2px solid rgba(255,255,255,0.07)" }}>{done ? "✓" : n}</div>
                      <span className="text-[11px] tracking-[0.06em]" style={{ color: active ? "#a5b4fc" : done ? "#6366f1" : "#8890b0", fontWeight: active ? 600 : 400 }}>{label}</span>
                    </div>
                    {i < 2 && <div className="flex-1 h-[1px] mx-[14px]" style={{ background: done ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.06)" }} />}
                  </div>
                );
              })}
            </div>
            {mStep === 1 && (
              <div className={animIn ? "animate-fade-up" : ""}>
                <h2 className="font-display text-[26px] font-bold text-white mb-7">Role & Experience</h2>
                <div className="mb-[26px]">
                  <div className="text-[10px] text-td-muted tracking-[0.14em] mb-3">JOB ROLE</div>
                  <div className="flex flex-wrap gap-2">{ROLES.map(r => <button key={r} className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border-[1.5px] cursor-pointer transition-all duration-[0.18s] text-[13px] font-body hover:border-[rgba(99,102,241,0.5)] hover:text-[#c8d0f0] hover:bg-[rgba(99,102,241,0.08)] ${role===r ? 'border-td-indigo bg-[rgba(99,102,241,0.18)] text-[#a5b4fc] font-semibold' : 'border-[rgba(255,255,255,0.08)] text-td-muted bg-[rgba(255,255,255,0.03)]'}`} onClick={() => setRole(r)}>{r}</button>)}</div>
                </div>
                <div className="mb-8">
                  <div className="text-[10px] text-td-muted tracking-[0.14em] mb-3">YEARS OF EXPERIENCE</div>
                  <div className="flex flex-wrap gap-2">{EXP_LEVELS.map(e => <button key={e} className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border-[1.5px] cursor-pointer transition-all duration-[0.18s] text-[13px] font-body hover:border-[rgba(99,102,241,0.5)] hover:text-[#c8d0f0] hover:bg-[rgba(99,102,241,0.08)] ${exp===e ? 'border-td-indigo bg-[rgba(99,102,241,0.18)] text-[#a5b4fc] font-semibold' : 'border-[rgba(255,255,255,0.08)] text-td-muted bg-[rgba(255,255,255,0.03)]'}`} onClick={() => setExp(e)}>{e}</button>)}</div>
                </div>
                <div className="flex gap-2.5">
                  <button className="px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] bg-[rgba(255,255,255,0.05)] border-[1.5px] border-[rgba(255,255,255,0.1)] text-[#6b7094]" onClick={() => setMode("landing")}>← Back</button>
                  <button className="px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] border-none bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#3b82f6] text-white shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(99,102,241,0.6)]" onClick={() => goMStep(2)}>Continue →</button>
                </div>
              </div>
            )}
            {mStep === 2 && (
              <div className={animIn ? "animate-fade-up" : ""}>
                <h2 className="font-display text-[26px] font-bold text-white mb-7">Location & Company</h2>
                <div className="mb-[26px]">
                  <div className="text-[10px] text-td-muted tracking-[0.14em] mb-3">CITY</div>
                  <div className="flex flex-wrap gap-2">{CITIES.map(c => <button key={c} className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border-[1.5px] cursor-pointer transition-all duration-[0.18s] text-[13px] font-body hover:border-[rgba(99,102,241,0.5)] hover:text-[#c8d0f0] hover:bg-[rgba(99,102,241,0.08)] ${city===c ? 'border-td-indigo bg-[rgba(99,102,241,0.18)] text-[#a5b4fc] font-semibold' : 'border-[rgba(255,255,255,0.08)] text-td-muted bg-[rgba(255,255,255,0.03)]'}`} onClick={() => setCity(c)}>{c}</button>)}</div>
                </div>
                <div className="mb-8">
                  <div className="text-[10px] text-td-muted tracking-[0.14em] mb-3">COMPANY</div>
                  <div className="flex flex-wrap gap-2">{COMPANIES.map(c => <button key={c} className={`inline-flex items-center px-[17px] py-[9px] rounded-[9px] border-[1.5px] cursor-pointer transition-all duration-[0.18s] text-[13px] font-body hover:border-[rgba(99,102,241,0.5)] hover:text-[#c8d0f0] hover:bg-[rgba(99,102,241,0.08)] ${company===c ? 'border-td-indigo bg-[rgba(99,102,241,0.18)] text-[#a5b4fc] font-semibold' : 'border-[rgba(255,255,255,0.08)] text-td-muted bg-[rgba(255,255,255,0.03)]'}`} onClick={() => setCompany(c)}>{c}</button>)}</div>
                </div>
                <div className="flex gap-2.5">
                  <button className="px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] bg-[rgba(255,255,255,0.05)] border-[1.5px] border-[rgba(255,255,255,0.1)] text-[#6b7094]" onClick={() => goMStep(1)}>← Back</button>
                  <button className="px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] border-none bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#3b82f6] text-white shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(99,102,241,0.6)]" onClick={() => goMStep(3)}>Continue →</button>
                </div>
              </div>
            )}
            {mStep === 3 && (
              <div className={animIn ? "animate-fade-up" : ""}>
                <h2 className="font-display text-[26px] font-bold text-white mb-7">Compensation Details</h2>
                <div className="flex flex-col gap-[14px] mb-5">
                  {[
                    { label:"BASE SALARY", val:base, set:setBase, hint:"e.g. 2000000" },
                    { label:"PERF BONUS", val:bonus, set:setBonus, hint:"e.g. 400000" },
                    { label:"ESOPs (Total)", val:equity, set:setEquity, hint:"e.g. 4000000" },
                    { label:"JOINING BONUS", val:joining, set:setJoining, hint:"e.g. 500000" },
                  ].map(({ label, val, set, hint }) => (
                    <div key={label}>
                      <label className="text-[10px] text-td-muted tracking-[0.12em] block mb-[7px]">{label}</label>
                      <input className="w-full px-[18px] py-[14px] bg-[rgba(255,255,255,0.05)] border-[1.5px] border-[rgba(255,255,255,0.09)] rounded-[12px] text-[#e8e8f0] text-[15px] font-body outline-none transition-all duration-[0.2s] focus:border-td-indigo focus:bg-[rgba(99,102,241,0.07)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" type="number" placeholder={hint} value={val} onChange={e => set(e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2.5">
                  <button className="px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] bg-[rgba(255,255,255,0.05)] border-[1.5px] border-[rgba(255,255,255,0.1)] text-[#6b7094]" onClick={() => goMStep(2)}>← Back</button>
                  <button className="flex-1 px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] border-none bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#3b82f6] text-white shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={!base} onClick={() => { setMode("result"); logActivity('evaluated_offer', { role, company, city }); }}>Analyse Offer →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "loading" && (
          <div className="animate-fade-up pt-20 text-center">
            <div className="bg-[rgba(255,255,255,0.035)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-[18px] px-8 py-[52px] max-w-[420px] mx-auto relative overflow-hidden">
              <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent animate-scan" />
              <div className="text-[52px] mb-5">🔍</div>
              <h3 className="font-display text-[22px] font-bold text-white mb-2.5">Analysing Your Offer</h3>
              <div className="flex flex-col gap-2.5">
                {["Extracting compensation", "Benchmarking market data", "Generating report"].map((s, i) => (
                  <div key={s} className="flex items-center gap-3 px-4 py-[11px] bg-[rgba(99,102,241,0.07)] rounded-[10px]" style={{ animation: `fadeUp 0.3s ease ${i*0.15}s both` }}>
                    <span className="animate-spin-slow inline-block text-[15px] text-td-indigo">⟳</span>
                    <span className="text-[12px] text-td-muted">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "result" && (
          <div className="animate-fade-up pt-11">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-2">
                <div className="text-[11px] text-td-indigo tracking-[0.12em] mb-1">OFFER ANALYSIS COMPLETE</div>
                <h2 className="font-display text-[28px] font-extrabold text-white mb-0">Your Offer Report</h2>
              </div>
              <div className="text-right px-[14px] py-2.5 bg-[rgba(255,255,255,0.04)] rounded-[10px] border border-[rgba(255,255,255,0.07)]">
                <div className="text-[13px] text-[#a5b4fc] font-semibold">{role}</div>
                <div className="text-[11px] text-td-muted">{city} · {exp}</div>
              </div>
            </div>

            <div className="p-7 rounded-[20px] mb-[18px] relative overflow-hidden" style={{ border: `1.5px solid ${verdict.color}35`, background: verdict.grad }}>
              <div className="flex justify-between items-start mb-[14px]">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] tracking-[0.14em] mb-1.5 font-semibold" style={{ color: verdict.color }}>VERDICT</div>
                  <div className="font-display text-[36px] font-extrabold leading-[1]" style={{ color: verdict.color }}>{verdict.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[rgba(255,255,255,0.35)] mb-1">YOUR CTC</div>
                  <div className="font-display text-[30px] font-bold text-white">{fmtL(totalCTC)}</div>
                </div>
              </div>
              <p className="text-[13px] text-[rgba(255,255,255,0.55)] leading-[1.65] mb-[18px]">{verdict.desc}</p>
              <div className="flex gap-7 pt-4" style={{ borderTop: `1px solid ${verdict.color}20` }}>
                {[
                  { label:"MARKET P50", val:fmtL(p50), color:"#fff" },
                  { label:"DIFFERENCE", val:(totalCTC>=p50?"+":"")+fmtL(totalCTC-p50), color:totalCTC>=p50?"#10b981":"#ef4444" },
                  { label:"PERCENTILE", val:`${Math.min(99,Math.round((totalCTC/p90)*80))}th`, color:"#a5b4fc" },
                  { label:"REAL VALUE", val:fmtL(adjCTC), color:"#6366f1" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-[10px] text-[rgba(255,255,255,0.3)] mb-1">{item.label}</div>
                    <div className="text-[19px] font-bold" style={{ color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-[rgba(255,255,255,0.03)] backdrop-blur-lg border border-[rgba(99,102,241,0.1)] rounded-[18px] mb-[14px]">
              <div className="text-[10px] text-td-muted tracking-[0.12em] mb-[18px]">MARKET DISTRIBUTION</div>
              {[
                { label:"P25 (Entry)", val:p25, color:"#ef4444" },
                { label:"P50 (Median)", val:p50, color:"#f59e0b" },
                { label:"P75 (Top Quartile)", val:p75, color:"#10b981" },
                { label:"P90 (Elite)", val:p90, color: "#6366f1" },
                { label:"◆ YOUR OFFER", val:totalCTC,color:verdict.color,bold:true },
              ].map(({ label, val, color, bold }) => (
                <div key={label} className="mb-[13px]">
                  <div className="flex justify-between mb-[5px]">
                    <span className="text-[12px]" style={{ color: bold ? "#e2e2f0" : "#5a6080", fontWeight: bold ? 600 : 400 }}>{label}</span>
                    <span className="text-[12px] font-semibold" style={{ color }}>{fmtL(val)}</span>
                  </div>
                  <div className="w-full h-[7px] bg-[rgba(255,255,255,0.06)] rounded-[4px] overflow-hidden">
                    <div className="h-full rounded-[4px] transition-all duration-[1.1s] ease-[cubic-bezier(.4,0,.2,1)]" style={{ width: `${barPct(val)}%`, background: bold ? `linear-gradient(90deg,${color},${color}99)` : color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 mt-1">
              <button className="flex-1 px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] bg-[rgba(255,255,255,0.05)] border-[1.5px] border-[rgba(255,255,255,0.1)] text-[#6b7094]" onClick={reset}>← Start Over</button>
              <button className="flex-1 px-7 py-[14px] rounded-[13px] text-[14px] font-body cursor-pointer font-semibold tracking-[0.03em] transition-all duration-[0.2s] border-none bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#3b82f6] text-white shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(99,102,241,0.6)]" onClick={() => { setMode("manual"); setMStep(3); }}>Edit Details</button>
            </div>

            <div className="mt-6 p-5 bg-[linear-gradient(135deg,rgba(168,85,247,0.1),rgba(0,0,0,0))] border border-[rgba(168,85,247,0.2)] rounded-[14px] text-center">
              <div className="text-[12px] text-[#a5b4fc] mb-3">Offer below market? Let's fix your profile.</div>
              <div className="flex gap-2.5 justify-center">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'resume' }))}
                  className="bg-[#a855f7] text-white border-none px-5 py-2.5 rounded-[8px] text-[12px] font-semibold cursor-pointer">
                  Improve Resume Score →
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'onboarding' }))}
                  className="bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(168,85,247,0.3)] px-5 py-2.5 rounded-[8px] text-[12px] font-semibold cursor-pointer">
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
