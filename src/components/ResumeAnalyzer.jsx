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
        className="rotate-[-90deg]"
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
    <div className="min-h-screen bg-[linear-gradient(145deg,#020818_0%,#040d20_35%,#060f1c_60%,#030a14_100%)] text-[#e0e0f0] font-['Space_Grotesk',sans-serif]">
      <header className="flex items-center backdrop-blur-3xl sticky top-0 bg-[rgba(13,11,34,0.82)] z-20">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00ff9d] rounded-full shadow-[0_0_8px_#00ff9d]" />
          <span className="font-['Syne',sans-serif] font-extrabold text-base tracking-[0.1em] text-white">TALENT<span className="text-[#00ff9d]">DASH</span></span>
          <span className="text-[rgba(99,102,241,0.3)] mx-1.5">·</span>
          <span className="text-[11px] text-[#a5b4fc] tracking-[0.1em]">RESUME ANALYZER</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'hub'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Dashboard</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'offer'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Offer</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeTab',{detail:'salary'}))} className="px-3 py-1.5 text-[11px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md text-[#8890b0] cursor-pointer">Salary</button>
        </div>
        <div className="flex-1" />
      </header>

      <div
        className="max-w-[1200px] mx-auto px-6 py-10 grid gap-[30px]"
        style={{
          gridTemplateColumns: result ? "1fr 1.1fr" : "1fr",
        }}
      >
        <div>
          <h1 className="text-[42px] mb-2">
            Resume <span className="text-[#00ff9d]">Analyzer</span>
          </h1>

          <p className="text-[#697298] mb-[30px] leading-[1.7]">
            AI-powered ATS analysis, keyword detection, and
            salary estimation.
          </p>

          <div className="mb-[18px]">
            <div className="text-xs mb-2.5 text-[#697298]">
              TARGET ROLE
            </div>

            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  className={`px-4 py-2 rounded-lg border border-[rgba(0,255,157,0.15)] bg-[rgba(255,255,255,0.03)] text-[#7f88b2] cursor-pointer transition-all duration-200 hover:border-[#00ff9d] hover:text-[#00ff9d] ${role === r ? "bg-[rgba(0,255,157,0.1)] border-[#00ff9d] text-[#00ff9d]" : ""}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div
            className="border-[1.5px] border-dashed border-[rgba(0,255,157,0.25)] p-6 rounded-xl text-center cursor-pointer mb-3.5 transition-all duration-200 hover:border-[#00ff9d] hover:bg-[rgba(0,255,157,0.04)]"
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
              className="hidden"
              onChange={(e) =>
                handleFile(e.target.files[0])
              }
            />

            <div className="text-[28px]">⬆</div>

            <div className="mt-2 text-[#697298]">
              Upload .txt or .md resume
            </div>
          </div>

          <textarea
            className="w-full min-h-[240px] p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,157,0.15)] rounded-xl text-[#c8d0e8] resize-y outline-none leading-[1.6] focus:border-[#00ff9d]"
            placeholder={`Paste your resume here...\n\n${SAMPLE_RESUME}`}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />

          {error && (
            <div className="text-[#ff453a] mt-2.5 text-[13px]">
              {error}
            </div>
          )}

          <div className="flex gap-2.5 mt-4">
            <button
              className="w-full p-4 border-none rounded-xl bg-[linear-gradient(135deg,#00ff9d,#00d4ff)] text-[#020818] font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              onClick={analyzeResume}
              disabled={loading}
            >
              {loading
                ? "ANALYZING..."
                : "ANALYZE RESUME →"}
            </button>

            <button
              className="px-5 py-4 bg-transparent border border-[#1e2247] rounded-xl text-[#7f88b2] cursor-pointer"
              onClick={() => setResume(SAMPLE_RESUME)}
            >
              Sample
            </button>
          </div>
        </div>

        {result && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-[18px]">
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
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,157,0.08)] rounded-[14px] p-5 text-center"
                >
                  <CircleScore score={score} size={90} />

                  <div className="mt-2.5 text-[11px] text-[#697298]">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,157,0.08)] rounded-[14px] p-5 mb-[18px]">
              <div className="flex justify-between mb-3.5">
                <div>Assessment</div>

                <div className="text-[#00ff9d]">
                  {result.level}
                </div>
              </div>

              <p className="text-[#bfc7e8] leading-[1.7]">
                {result.verdict}
              </p>

              <div className="mt-[18px] pt-[18px] border-t border-[#1e2247]">
                <div className="text-xs text-[#697298]">
                  EST. SALARY RANGE
                </div>

                <div className="mt-2 text-[22px] font-bold text-[#00ff9d]">
                  ₹{result.salaryRange.low}L – ₹
                  {result.salaryRange.high}L
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,157,0.08)] rounded-[14px] p-5 mb-[18px]">
              <div className="mb-4 text-[#697298] text-xs">
                SECTION BREAKDOWN
              </div>

              {Object.entries(result.sections).map(
                ([key, val]) => (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between">
                      <div className="capitalize">
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

                    <div className="h-[5px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${val.score * 10}%`,
                          background: scoreColor(val.score),
                        }}
                      />
                    </div>

                    <div className="mt-1.5 text-xs text-[#7f88b2] leading-[1.5]">
                      {val.feedback}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-[18px]">
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,157,0.08)] rounded-[14px] p-5">
                <div className="mb-3 text-[#697298] text-xs">
                  STRENGTHS
                </div>

                {result.strengths.map((s, i) => (
                  <div key={i} className="mb-2 text-[#cfd6f2] text-[13px]">
                    ✓ {s}
                  </div>
                ))}
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,157,0.08)] rounded-[14px] p-5">
                <div className="mb-3 text-[#697298] text-xs">
                  IMPROVEMENTS
                </div>

                {result.improvements.map((s, i) => (
                  <div key={i} className="mb-2 text-[#cfd6f2] text-[13px]">
                    ! {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,157,0.08)] rounded-[14px] p-5">
              <div className="mb-3 text-[#697298] text-xs">
                MISSING KEYWORDS
              </div>

              <div>
                {result.missingKeywords.map((k) => (
                  <span key={k} className="inline-block m-1 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(0,255,157,0.15)] text-xs text-[#aeb7da]">
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
