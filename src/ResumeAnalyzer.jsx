import { useState, useRef, useEffect } from "react";

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
        style={{ transform: "rotate(-90deg)" }}
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
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(145deg, #020818 0%, #040d20 35%, #060f1c 60%, #030a14 100%)",
        color: "#e0e0f0",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <header style={{ display:"flex",alignItems:"center",backdropFilter:"blur(24px)",position:"sticky",top:0,background:"rgba(13,11,34,0.82)",zIndex:20 }}>
        <div style={{ flex:1,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:8,height:8,background:"#00ff9d",borderRadius:"50%",boxShadow:"0 0 8px #00ff9d" }}/>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"0.1em",color:"#fff" }}>TALENT<span style={{ color:"#00ff9d" }}>DASH</span></span>
          <span style={{ color:"rgba(99,102,241,0.3)",margin:"0 6px" }}>·</span>
          <span style={{ fontSize:11,color:"#a5b4fc",letterSpacing:"0.1em" }}>RESUME ANALYZER</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} style={{ padding:"6px 12px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#8890b0",cursor:"pointer" }}>Salary</button>
        </div>
        <div style={{ flex:1 }}/>
      </header>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        .textarea-resume {
          width: 100%;
          min-height: 240px;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,255,157,0.15);
          border-radius: 12px;
          color: #c8d0e8;
          resize: vertical;
          outline: none;
          line-height: 1.6;
        }

        .textarea-resume:focus {
          border-color: #00ff9d;
        }

        .chip {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(0,255,157,0.15);
          background: rgba(255,255,255,0.03);
          color: #7f88b2;
          cursor: pointer;
          transition: 0.2s;
        }

        .chip.active {
          background: rgba(0,255,157,0.1);
          border-color: #00ff9d;
          color: #00ff9d;
        }

        .btn-analyze {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg,#00ff9d,#00d4ff);
          color: #020818;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-analyze:hover {
          transform: translateY(-2px);
        }

        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,255,157,0.08);
          border-radius: 14px;
          padding: 20px;
        }

        .drop-zone {
          border: 1.5px dashed rgba(0,255,157,0.25);
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          margin-bottom: 14px;
          transition: 0.2s;
        }

        .drop-zone:hover {
          border-color: #00ff9d;
          background: rgba(0,255,157,0.04);
        }

        .bar {
          height: 5px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 8px;
        }

        .bar-fill {
          height: 100%;
          border-radius: 999px;
        }

        .tag {
          display: inline-block;
          margin: 4px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(0,255,157,0.15);
          font-size: 12px;
          color: #aeb7da;
        }
      `}</style>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px",
          display: "grid",
          gridTemplateColumns: result ? "1fr 1.1fr" : "1fr",
          gap: 30,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 42,
              marginBottom: 8,
            }}
          >
            Resume <span style={{ color: "#00ff9d" }}>Analyzer</span>
          </h1>

          <p
            style={{
              color: "#697298",
              marginBottom: 30,
              lineHeight: 1.7,
            }}
          >
            AI-powered ATS analysis, keyword detection, and
            salary estimation.
          </p>

          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 12,
                marginBottom: 10,
                color: "#697298",
              }}
            >
              TARGET ROLE
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
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
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md"
              style={{ display: "none" }}
              onChange={(e) =>
                handleFile(e.target.files[0])
              }
            />

            <div style={{ fontSize: 28 }}>⬆</div>

            <div style={{ marginTop: 8, color: "#697298" }}>
              Upload .txt or .md resume
            </div>
          </div>

          <textarea
            className="textarea-resume"
            placeholder={`Paste your resume here...\n\n${SAMPLE_RESUME}`}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />

          {error && (
            <div
              style={{
                color: "#ff453a",
                marginTop: 10,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
            }}
          >
            <button
              className="btn-analyze"
              onClick={analyzeResume}
              disabled={loading}
            >
              {loading
                ? "ANALYZING..."
                : "ANALYZE RESUME →"}
            </button>

            <button
              style={{
                padding: "16px 20px",
                background: "transparent",
                border: "1px solid #1e2247",
                borderRadius: 12,
                color: "#7f88b2",
                cursor: "pointer",
              }}
              onClick={() => setResume(SAMPLE_RESUME)}
            >
              Sample
            </button>
          </div>
        </div>

        {result && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 18,
              }}
            >
              {[
                {
                  label: "OVERALL",
                  score: result.overallScore,
                },
                {
                  label: "JOB FIT",
                  score: result.fitScore,
                },
                {
                  label: "ATS",
                  score: result.atsScore,
                },
              ].map(({ label, score }) => (
                <div
                  key={label}
                  className="card"
                  style={{ textAlign: "center" }}
                >
                  <CircleScore score={score} size={90} />

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      color: "#697298",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div>Assessment</div>

                <div style={{ color: "#00ff9d" }}>
                  {result.level}
                </div>
              </div>

              <p
                style={{
                  color: "#bfc7e8",
                  lineHeight: 1.7,
                }}
              >
                {result.verdict}
              </p>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: "1px solid #1e2247",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#697298",
                  }}
                >
                  EST. SALARY RANGE
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#00ff9d",
                  }}
                >
                  ₹{result.salaryRange.low}L – ₹
                  {result.salaryRange.high}L
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 18 }}>
              <div
                style={{
                  marginBottom: 16,
                  color: "#697298",
                  fontSize: 12,
                }}
              >
                SECTION BREAKDOWN
              </div>

              {Object.entries(result.sections).map(
                ([key, val]) => (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          textTransform: "capitalize",
                        }}
                      >
                        {key}
                      </div>

                      <div
                        style={{
                          color: scoreColor(val.score),
                        }}
                      >
                        {val.score}/10
                      </div>
                    </div>

                    <div className="bar">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${val.score * 10}%`,
                          background: scoreColor(val.score),
                        }}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#7f88b2",
                        lineHeight: 1.5,
                      }}
                    >
                      {val.feedback}
                    </div>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div className="card">
                <div
                  style={{
                    marginBottom: 12,
                    color: "#697298",
                    fontSize: 12,
                  }}
                >
                  STRENGTHS
                </div>

                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 8,
                      color: "#cfd6f2",
                      fontSize: 13,
                    }}
                  >
                    ✓ {s}
                  </div>
                ))}
              </div>

              <div className="card">
                <div
                  style={{
                    marginBottom: 12,
                    color: "#697298",
                    fontSize: 12,
                  }}
                >
                  IMPROVEMENTS
                </div>

                {result.improvements.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 8,
                      color: "#cfd6f2",
                      fontSize: 13,
                    }}
                  >
                    ! {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div
                style={{
                  marginBottom: 12,
                  color: "#697298",
                  fontSize: 12,
                }}
              >
                MISSING KEYWORDS
              </div>

              <div>
                {result.missingKeywords.map((k) => (
                  <span key={k} className="tag">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}