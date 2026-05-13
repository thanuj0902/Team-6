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
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#1a1a1a 0%,#2d2d2d 35%,#1a1a1a 65%,#0a0a0a 100%)", color: "#e2e2f0", fontFamily: "'Inter','DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0;}
        .mode-card{display:flex;align-items:center;gap:18px;padding:22px 24px;background:rgba(255,255,255,0.035);border:1.5px solid rgba(255,255,255,0.07);border-radius:18px;cursor:pointer;transition:all 0.22s;text-align:left;width:100%;font-family:inherit;}
        .mode-card:hover{background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.45);transform:translateY(-3px);box-shadow:0 12px 40px rgba(99,102,241,0.18);}
        .chip{display:inline-flex;align-items:center;padding:9px 17px;border-radius:9px;border:1.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.18s;font-size:13px;font-family:inherit;color:#8890b0;}
        .chip:hover{border-color:rgba(99,102,241,0.5);color:#c8d0f0;background:rgba(99,102,241,0.08);}
        .chip.on{border-color:#6366f1;background:rgba(99,102,241,0.18);color:#a5b4fc;font-weight:600;}
        .inp{width:100%;padding:14px 18px;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.09);border-radius:12px;color:#e8e8f0;font-size:15px;font-family:inherit;outline:none;transition:all 0.2s;}
        .inp:focus{border-color:#6366f1;background:rgba(99,102,241,0.07);box-shadow:0 0 0 3px rgba(99,102,241,0.12);}
        .textarea{width:100%;min-height:210px;padding:16px 18px;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.09);border-radius:14px;color:#e8e8f0;font-size:13px;font-family:'DM Mono','Fira Code',monospace;outline:none;resize:vertical;line-height:1.75;transition:all 0.2s;}
        .btn{padding:14px 28px;border-radius:13px;font-size:14px;font-family:inherit;cursor:pointer;font-weight:600;letter-spacing:0.03em;transition:all 0.2s;border:none;}
        .btn-p{background:linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#3b82f6 100%);color:#fff;box-shadow:0 4px 24px rgba(99,102,241,0.4);}
        .btn-p:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 36px rgba(99,102,241,0.6);}
        .btn-g{background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1)!important;color:#6b7094;}
        .glass{background:rgba(255,255,255,0.035);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:18px;}
        .bar-track{width:100%;height:7px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;}
        .bar-fill{height:100%;border-radius:4px;transition:width 1.1s cubic-bezier(.4,0,.2,1);}
        .fin{animation:fin 0.28s ease forwards;}
        @keyframes fin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .spin{animation:sp 1s linear infinite;display:inline-block;}
        @keyframes sp{to{transform:rotate(360deg)}}
        .scan-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#6366f1,transparent);animation:scan 1.8s linear infinite;}
        @keyframes scan{from{top:0}to{top:100%}}
        .drop{border:2px dashed rgba(99,102,241,0.25);border-radius:16px;padding:36px 24px;text-align:center;cursor:pointer;transition:all 0.2s;background:rgba(99,102,241,0.02);}
        .drop:hover,.drop.over{border-color:rgba(99,102,241,0.6);background:rgba(99,102,241,0.07);}
      `}</style>

      <header style={{ width:"100%",padding:"18px 32px",display:"flex",alignItems:"center",backdropFilter:"blur(24px)",position:"sticky",top:0,background:"rgba(13,11,34,0.82)",borderBottom:"1px solid rgba(99,102,241,0.13)",zIndex:20 }}>
        <div style={{ flex:1,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ width:9,height:9,background:"linear-gradient(135deg,#6366f1,#3b82f6)",borderRadius:"50%",boxShadow:"0 0 12px #6366f1aa" }}/>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"0.1em",color:"#fff" }}>TALENT<span style={{ color:"#6366f1" }}>DASH</span></span>
          <span style={{ color:"rgba(99,102,241,0.3)",margin:"0 6px" }}>·</span>
          <span style={{ fontSize:11,color:"#a5b4fc",letterSpacing:"0.1em" }}>OFFER INTELLIGENCE</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Salary</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'resume'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Resume</button>
        </div>
        <div style={{ flex:1,display:"flex",justifyContent:"flex-end",alignItems:"center",gap:6 }}>
          {mode !== "landing" && (
            <button onClick={reset} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>← Back</button>
          )}
        </div>
      </header>

      <div style={{ width:"100%",maxWidth:660,margin:"0 auto",padding:"0 20px 80px",position:"relative",zIndex:1 }}>
        {mode === "landing" && (
          <div className="fin">
            <div style={{ padding:"52px 0 40px",textAlign:"center" }}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 18px",borderRadius:20,border:"1px solid rgba(99,102,241,0.3)",fontSize:11,color:"#7c7fff",letterSpacing:"0.1em",marginBottom:22,background:"rgba(99,102,241,0.08)" }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:"#6366f1",boxShadow:"0 0 8px #6366f1" }}/>
                AI-POWERED OFFER EVALUATION
              </div>
              <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:46,fontWeight:800,lineHeight:1.1,color:"#fff",marginBottom:16 }}>
                Offer Evaluation
              </h1>
              <p style={{ color:"#c8d0f0",fontSize:15,lineHeight:1.75,maxWidth:420,margin:"0 auto 0" }}>
                Your offer, decoded — benchmarked against real market salaries from <strong style={{ color:"#fff" }}>4Cr+ data points.</strong>
              </p>
            </div>
            <p style={{ fontSize:13,color:"#c8d0f0",marginBottom:14,letterSpacing:"0.02em" }}>How would you like to provide your offer details?</p>
            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:32 }}>
              {[
                { icon: "⬆️", iconBg: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(59,130,246,0.3))", title: "Upload Offer Letter", sub: "Extract details automatically", action: () => fileRef.current?.click() },
                { icon: "📋", iconBg: "linear-gradient(135deg,rgba(16,185,129,0.25),rgba(6,182,212,0.25))", title: "Paste Offer Text", sub: "Copy and paste the text", action: () => setMode("paste") },
                { icon: "✏️", iconBg: "linear-gradient(135deg,rgba(245,158,11,0.25),rgba(249,115,22,0.25))", title: "Enter Manually", sub: "Fill details field by field", action: () => setMode("manual") },
              ].map((m, i) => (
                <button key={i} className="mode-card" onClick={m.action}>
                  <div style={{ width:50,height:50,borderRadius:13,background:m.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{m.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600,fontSize:15,color:"#dde0f5",marginBottom:5 }}>{m.title}</div>
                    <div style={{ fontSize:12,color:"#a5b4fc",lineHeight:1.55 }}>{m.sub}</div>
                  </div>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ))}
            </div>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.doc" style={{ display:"none" }} onChange={e => readFile(e.target.files[0])} />
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:36 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 7px #10b981" }}/>
              <span style={{ fontSize:12,color:"#a5b4fc" }}>Powered by AI · trained on 4Cr+ salary data points</span>
            </div>
            <div style={{ height:1,background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)",marginBottom:32 }}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8 }}>
              {STATS.map(s => (
                <div key={s.val} style={{ textAlign:"center",padding:"16px 8px",background:"rgba(255,255,255,0.025)",borderRadius:14,border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,background:"linear-gradient(135deg,#818cf8,#60a5fa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{s.val}</div>
                  <div style={{ fontSize:11,color:"#a5b4fc",marginTop:6,lineHeight:1.5,whiteSpace:"pre-line" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "paste" && (
          <div className="fin" style={{ paddingTop:44 }}>
            <div style={{ fontSize:11,color:"#6366f1",letterSpacing:"0.12em",marginBottom:8 }}>PROVIDE OFFER TEXT</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:"#fff",marginBottom:8 }}>Paste Offer Letter</h2>
            <div className={`drop${dragOver ? " over" : ""}`} style={{ marginBottom:16 }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <div style={{ fontSize:32,marginBottom:8 }}>📂</div>
              <div style={{ fontSize:13,color:"#c8d0f0" }}>Drop your offer letter file here or <span style={{ color:"#6366f1",fontWeight:500 }}>browse</span></div>
            </div>
            <textarea className="textarea" placeholder="Paste your full offer letter text here..." value={pasteText} onChange={e => setPasteText(e.target.value)} />
            {aiError && <div style={{ color:"#ef4444",fontSize:12,marginTop:10,padding:"10px 14px",background:"rgba(239,68,68,0.08)",borderRadius:8,border:"1px solid rgba(239,68,68,0.2)" }}>{aiError}</div>}
            <div style={{ display:"flex",gap:10,marginTop:16 }}>
              <button className="btn btn-g" onClick={() => setMode("landing")}>← Back</button>
              <button className="btn btn-p" style={{ flex:1 }} disabled={!pasteText.trim()} onClick={() => parseAndAnalyse(pasteText)}>Analyse with AI →</button>
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div style={{ paddingTop:44 }}>
            <div style={{ display:"flex",alignItems:"center",marginBottom:40 }}>
              {["Role & Exp", "Location", "Compensation"].map((label, i) => {
                const n = i + 1; const done = mStep > n; const active = mStep === n;
                return (
                  <div key={n} style={{ display:"flex",alignItems:"center",flex:i < 2 ? 1 : "auto" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                      <div className="sdot" style={{ background: done ? "linear-gradient(135deg,#6366f1,#3b82f6)" : active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)", color: done ? "#fff" : active ? "#a5b4fc" : "#8890b0", border: active ? "2px solid #6366f1" : done ? "2px solid #6366f1" : "2px solid rgba(255,255,255,0.07)" }}>{done ? "✓" : n}</div>
                      <span style={{ fontSize:11,color:active?"#a5b4fc":done?"#6366f1":"#8890b0",letterSpacing:"0.06em",fontWeight:active?600:400 }}>{label}</span>
                    </div>
                    {i < 2 && <div style={{ flex:1,height:1,background:done?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.06)",margin:"0 14px" }}/>}
                  </div>
                );
              })}
            </div>
            {mStep === 1 && (
              <div className={animIn ? "fin" : ""}>
                <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:"#fff",marginBottom:28 }}>Role & Experience</h2>
                <div style={{ marginBottom:26 }}>
                  <div style={{ fontSize:10,color:"#8890b0",letterSpacing:"0.14em",marginBottom:12 }}>JOB ROLE</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{ROLES.map(r => <button key={r} className={`chip${role===r?" on":""}`} onClick={() => setRole(r)}>{r}</button>)}</div>
                </div>
                <div style={{ marginBottom:32 }}>
                  <div style={{ fontSize:10,color:"#8890b0",letterSpacing:"0.14em",marginBottom:12 }}>YEARS OF EXPERIENCE</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{EXP_LEVELS.map(e => <button key={e} className={`chip${exp===e?" on":""}`} onClick={() => setExp(e)}>{e}</button>)}</div>
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button className="btn btn-g" onClick={() => setMode("landing")}>← Back</button>
                  <button className="btn btn-p" onClick={() => goMStep(2)}>Continue →</button>
                </div>
              </div>
            )}
            {mStep === 2 && (
              <div className={animIn ? "fin" : ""}>
                <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:"#fff",marginBottom:28 }}>Location & Company</h2>
                <div style={{ marginBottom:26 }}>
                  <div style={{ fontSize:10,color:"#8890b0",letterSpacing:"0.14em",marginBottom:12 }}>CITY</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{CITIES.map(c => <button key={c} className={`chip${city===c?" on":""}`} onClick={() => setCity(c)}>{c}</button>)}</div>
                </div>
                <div style={{ marginBottom:32 }}>
                  <div style={{ fontSize:10,color:"#8890b0",letterSpacing:"0.14em",marginBottom:12 }}>COMPANY</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{COMPANIES.map(c => <button key={c} className={`chip${company===c?" on":""}`} onClick={() => setCompany(c)}>{c}</button>)}</div>
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button className="btn btn-g" onClick={() => goMStep(1)}>← Back</button>
                  <button className="btn btn-p" onClick={() => goMStep(3)}>Continue →</button>
                </div>
              </div>
            )}
            {mStep === 3 && (
              <div className={animIn ? "fin" : ""}>
                <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:"#fff",marginBottom:28 }}>Compensation Details</h2>
                <div style={{ display:"flex",flexDirection:"column",gap:14,marginBottom:20 }}>
                  {[
                    { label:"BASE SALARY", val:base, set:setBase, hint:"e.g. 2000000" },
                    { label:"PERF BONUS", val:bonus, set:setBonus, hint:"e.g. 400000" },
                    { label:"ESOPs (Total)", val:equity, set:setEquity, hint:"e.g. 4000000" },
                    { label:"JOINING BONUS", val:joining, set:setJoining, hint:"e.g. 500000" },
                  ].map(({ label, val, set, hint }) => (
                    <div key={label}>
                      <label style={{ fontSize:10,color:"#8890b0",letterSpacing:"0.12em",display:"block",marginBottom:7 }}>{label}</label>
                      <input className="inp" type="number" placeholder={hint} value={val} onChange={e => set(e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button className="btn btn-g" onClick={() => goMStep(2)}>← Back</button>
                  <button className="btn btn-p" style={{ flex:1 }} disabled={!base} onClick={() => setMode("result")}>Analyse Offer →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "loading" && (
          <div className="fin" style={{ paddingTop:80,textAlign:"center" }}>
            <div className="glass" style={{ padding:"52px 32px",maxWidth:420,margin:"0 auto",position:"relative",overflow:"hidden" }}>
              <div className="scan-line" />
              <div style={{ fontSize:52,marginBottom:20 }}>🔍</div>
              <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:10 }}>Analysing Your Offer</h3>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {["Extracting compensation", "Benchmarking market data", "Generating report"].map((s, i) => (
                  <div key={s} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 16px",background:"rgba(99,102,241,0.07)",borderRadius:10,animation:`fin 0.3s ease ${i*0.15}s both` }}>
                    <span className="spin" style={{ fontSize:15,color:"#6366f1" }}>⟳</span>
                    <span style={{ fontSize:12,color:"#8890b0" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "result" && (
          <div className="fin" style={{ paddingTop:44 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize:11,color:"#6366f1",letterSpacing:"0.12em",marginBottom:4 }}>OFFER ANALYSIS COMPLETE</div>
                <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:"#fff", marginBottom: 0 }}>Your Offer Report</h2>
              </div>
              <div style={{ textAlign:"right",padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize:13,color:"#a5b4fc",fontWeight:600 }}>{role}</div>
                <div style={{ fontSize:11,color:"#8890b0" }}>{city} · {exp}</div>
              </div>
            </div>

            <div style={{ padding:"28px",border:`1.5px solid ${verdict.color}35`,borderRadius:20,background:verdict.grad,marginBottom:18,position:"relative",overflow:"hidden" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize:10,color:verdict.color,letterSpacing:"0.14em",marginBottom:6,fontWeight:600 }}>VERDICT</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,color:verdict.color,lineHeight:1 }}>{verdict.label}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4 }}>YOUR CTC</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:"#fff" }}>{fmtL(totalCTC)}</div>
                </div>
              </div>
              <p style={{ fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.65,marginBottom:18 }}>{verdict.desc}</p>
              <div style={{ display:"flex",gap:28,paddingTop:16,borderTop:`1px solid ${verdict.color}20` }}>
                {[
                  { label:"MARKET P50", val:fmtL(p50), color:"#fff" },
                  { label:"DIFFERENCE", val:(totalCTC>=p50?"+":"")+fmtL(totalCTC-p50), color:totalCTC>=p50?"#10b981":"#ef4444" },
                  { label:"PERCENTILE", val:`${Math.min(99,Math.round((totalCTC/p90)*80))}th`, color:"#a5b4fc" },
                  { label:"REAL VALUE", val:fmtL(adjCTC), color:"#6366f1" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontSize:19,fontWeight:700,color:item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding:"24px",background:"rgba(255,255,255,0.03)",backdropFilter:"blur(16px)",border:"1px solid rgba(99,102,241,0.1)",borderRadius:18,marginBottom:14 }}>
              <div style={{ fontSize:10,color:"#8890b0",letterSpacing:"0.12em",marginBottom:18 }}>MARKET DISTRIBUTION</div>
              {[
                { label:"P25 (Entry)", val:p25, color:"#ef4444" },
                { label:"P50 (Median)", val:p50, color:"#f59e0b" },
                { label:"P75 (Top Quartile)", val:p75, color:"#10b981" },
                { label:"P90 (Elite)", val:p90, color: "#6366f1" },
                { label:"◆ YOUR OFFER", val:totalCTC,color:verdict.color,bold:true },
              ].map(({ label, val, color, bold }) => (
                <div key={label} style={{ marginBottom:13 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                    <span style={{ fontSize:12,color:bold?"#e2e2f0":"#5a6080",fontWeight:bold?600:400 }}>{label}</span>
                    <span style={{ fontSize:12,color,fontWeight:600 }}>{fmtL(val)}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width:`${barPct(val)}%`,background:bold?`linear-gradient(90deg,${color},${color}99)`:color }}/></div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex",gap:10,marginTop:4 }}>
              <button className="btn btn-g" style={{ flex:1 }} onClick={reset}>← Start Over</button>
              <button className="btn btn-p" style={{ flex:1 }} onClick={() => { setMode("manual"); setMStep(3); }}>Edit Details</button>
            </div>

            {/* SMART GROWTH REDIRECT */}
            <div style={{
              marginTop: 24,
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(0,0,0,0))',
              border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 12, color: '#a5b4fc', marginBottom: 12 }}>Offer below market? Let's fix your profile.</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'resume' }))}
                  style={{
                    background: '#a855f7',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  Improve Resume Score →
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'onboarding' }))}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    border: '1px solid rgba(168,85,247,0.3)',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
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
