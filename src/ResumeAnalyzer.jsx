import { useState, useRef, useEffect } from "react";
import './ResumeAnalyzer.css'

const SAMPLE_RESUME = `John Doe | john@email.com | linkedin.com/in/johndoe | Bangalore

EXPERIENCE
Senior Software Engineer — Swiggy (2021–Present)
• Built order tracking microservice handling 50K RPM
• Led team of 4 engineers for checkout redesign
• Reduced API latency by 40% via Redis caching

Software Engineer — Infosys (2019–2021)
• Developed REST APIs for banking clients using Java Spring Boot
• Maintained legacy Oracle DB queries

EDUCATION
B.Tech Computer Science — VIT Vellore (2015–2019)

SKILLS
React, Node.js, Java, Python, Redis, PostgreSQL, AWS`;

export default function ResumeAnalyzer() {
  const [resume, setResume] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef();

  const logActivity = (action, metadata) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    fetch('http://localhost:3001/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, metadata: metadata || {} }),
    }).catch(() => {});
  };

  const ROLES = [
    "Software Engineer",
    "Senior Engineer",
    "Product Manager",
    "Data Scientist",
    "Engineering Manager",
    "Designer",
    "DevOps Engineer",
  ];

  const analyzeResume = async () => {
    if (!resume.trim()) {
      setError("Please paste your resume text.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const text = resume.toLowerCase();

      const hasJava = text.includes("java");
      const hasReact = text.includes("react");
      const hasNode = text.includes("node");
      const hasPython = text.includes("python");
      const hasAws = text.includes("aws");
      const hasDocker = text.includes("docker");
      const hasKubernetes = text.includes("kubernetes");

      let score = 50;

      if (hasReact) score += 10;
      if (hasNode) score += 10;
      if (hasJava) score += 8;
      if (hasPython) score += 8;
      if (hasAws) score += 12;
      if (hasDocker) score += 5;
      if (hasKubernetes) score += 5;

      score += Math.min(10, Math.floor(resume.length / 500));

      const finalScore = Math.min(98, score);

      const simulationResult = {
        overallScore: finalScore,

        level:
          finalScore > 90
            ? "Staff"
            : finalScore > 80
            ? "Senior"
            : finalScore > 70
            ? "Mid-level"
            : "Junior",

        fitScore: Math.min(98, finalScore - 5),

        sections: {
          impact: {
            score: 7,
            feedback:
              "Good quantification of results, but could use more measurable business impact.",
          },

          skills: {
            score: hasReact || hasNode ? 9 : 6,
            feedback:
              "Strong modern engineering stack aligned with industry demand.",
          },

          experience: {
            score: 8,
            feedback:
              "Clear progression and relevant engineering experience.",
          },

          format: {
            score: 9,
            feedback:
              "Clean ATS-friendly formatting with strong readability.",
          },

          keywords: {
            score: hasAws || hasDocker ? 8 : 6,
            feedback:
              "Good keyword coverage but missing some advanced system design terminology.",
          },
        },

        strengths: [
          "Strong technical foundation",
          "Clear impact statements",
          "ATS-friendly formatting",
          "Good career progression",
        ],

        improvements: [
          "Add more quantified metrics",
          "Include GitHub/project links",
          "Add architecture/system design achievements",
          "Mention leadership contributions",
        ],

        missingKeywords: [
          !hasDocker && "Docker",
          !hasKubernetes && "Kubernetes",
          "CI/CD",
          "System Design",
        ].filter(Boolean),

        salaryRange: {
          low: finalScore > 85 ? 18 : 10,
          high: finalScore > 85 ? 40 : 25,
        },

        verdict:
          finalScore > 85
            ? "Excellent resume with strong technical depth and ATS optimization."
            : "Strong resume overall. Add more measurable achievements and modern infrastructure keywords to stand out further.",

        atsScore: Math.max(60, finalScore - 3),
      };

      setResult(simulationResult);
      logActivity('analyzed_resume', { role, score: simulationResult.overallScore });

      fetch('http://localhost:3001/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          overallScore: simulationResult.overallScore,
          atsScore: simulationResult.atsScore,
          role,
          level: simulationResult.level,
          missingKeywords: simulationResult.missingKeywords,
          strengths: simulationResult.strengths,
          improvements: simulationResult.improvements
        })
      }).then(r => { if (!r.ok) console.error('Failed to save resume'); }).catch(e => console.error('Save resume error:', e));
    } catch (e) {
      console.error(e);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;

    if (
      !file.name.endsWith(".txt") &&
      !file.name.endsWith(".md")
    ) {
      setError("Only .txt and .md files supported currently.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setResume(e.target.result);
    };

    reader.readAsText(file);
  };

  const scoreColor = (s, max = 10) => {
    const pct = s / max;

    if (pct >= 0.8) return "#00ff9d";
    if (pct >= 0.6) return "#ffd60a";
    if (pct >= 0.4) return "#ff9500";

    return "#ff453a";
  };

  const CircleScore = ({ score, size = 120, stroke = 8 }) => {
    const r = (size - stroke) / 2;

    const circ = 2 * Math.PI * r;

    const offset = circ * (1 - score / 100);

    const color = scoreColor(score, 100);

    return (
      <svg
        width={size}
        height={size}
        className="ra-gauge-svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition:
              "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)",
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />

        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: "#fff",
            fontSize: size / 4,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            transform: "rotate(90deg)",
            transformOrigin: `${size / 2}px ${size / 2}px`,
          }}
        >
          {score}
        </text>
      </svg>
    );
  };

  return (
    <div className="ra-wrapper">
      <header className="ra-header">
        <div className="ra-header-left">
          <div className="ra-logo-dot"/>
          <span className="ra-logo">TALENT<span className="ra-logo-accent">DASH</span></span>
          <span className="ra-sep">·</span>
          <span className="ra-badge">RESUME ANALYZER</span>
        </div>
        <div className="ra-header-nav">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} className="ra-header-btn">Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} className="ra-header-btn">Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} className="ra-header-btn">Salary</button>
        </div>
        <div className="ra-header-spacer"/>
      </header>

      <div className={`ra-container ${result ? 'ra-container-split' : 'ra-container-single'}`}>
        <div>
          <h1 className="ra-title">
            Resume <span className="ra-title-accent">Analyzer</span>
          </h1>

          <p className="ra-sub">
            AI-powered ATS analysis, keyword detection, and salary estimation.
          </p>

          <div className="ra-field-group">
            <div className="ra-field-label">TARGET ROLE</div>

            <div className="ra-chip-row">
              {ROLES.map((r) => (
                <button
                  key={r}
                  className={`chip ${role === r ? "active" : ""}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div
            className="drop-zone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <div className="ra-drop-icon">⬆</div>
            <div className="ra-drop-text">Upload .txt or .md resume</div>
          </div>

          <textarea
            className="textarea-resume"
            placeholder={`Paste your resume here...\n\n${SAMPLE_RESUME}`}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />

          {error && <div className="ra-error-msg">{error}</div>}

          <div className="ra-btn-row">
            <button className="btn-analyze" onClick={analyzeResume} disabled={loading}>
              {loading ? "ANALYZING..." : "ANALYZE RESUME →"}
            </button>
            <button className="ra-sample-btn" onClick={() => setResume(SAMPLE_RESUME)}>Sample</button>
          </div>
        </div>

        {result && (
          <div>
            <div className="ra-score-grid">
              {[
                { label: "OVERALL", score: result.overallScore },
                { label: "JOB FIT", score: result.fitScore },
                { label: "ATS", score: result.atsScore },
              ].map(({ label, score }) => (
                <div key={label} className="card ra-score-card">
                  <CircleScore score={score} size={90} />
                  <div className="ra-score-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="card ra-assessment-card">
              <div className="ra-assessment">
                <div>Assessment</div>
                <div className="ra-assessment-level">{result.level}</div>
              </div>
              <p className="ra-verdict">{result.verdict}</p>
              <div className="ra-salary-section">
                <div className="ra-salary-label">EST. SALARY RANGE</div>
                <div className="ra-salary-value">₹{result.salaryRange.low}L – ₹{result.salaryRange.high}L</div>
              </div>
            </div>

            <div className="card ra-section-card">
              <div className="ra-section-header">SECTION BREAKDOWN</div>
              {Object.entries(result.sections).map(([key, val]) => (
                <div key={key} className="ra-section-row">
                  <div className="ra-section-top">
                    <div className="ra-section-name">{key}</div>
                    <div className="ra-section-score" style={{ color: scoreColor(val.score) }}>{val.score}/10</div>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${val.score * 10}%`, background: scoreColor(val.score) }} />
                  </div>
                  <div className="ra-section-feedback">{val.feedback}</div>
                </div>
              ))}
            </div>

            <div className="ra-split-grid">
              <div className="card">
                <div className="ra-list-title">STRENGTHS</div>
                {result.strengths.map((s, i) => (
                  <div key={i} className="ra-list-item">✓ {s}</div>
                ))}
              </div>
              <div className="card">
                <div className="ra-list-title">IMPROVEMENTS</div>
                {result.improvements.map((s, i) => (
                  <div key={i} className="ra-list-item">! {s}</div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="ra-list-title">MISSING KEYWORDS</div>
              <div>
                {result.missingKeywords.map((k) => (
                  <span key={k} className="tag">{k}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}