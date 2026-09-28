import { useState } from "react";
import {
  Brain,
  Code2,
  History,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Database,
  MessageSquare,
  BookOpen,
  GitBranch,
  Zap,
  Clock3,
  RefreshCw,
} from "lucide-react";

import ReviewDetails from "./components/ReviewDetails";
import ReviewHistory from "./components/ReviewHistory";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialCode = `function createUser(req, res) {
  const user = {
    name: req.body.name,
    email: req.body.email
  };

  return res.json(user);
}`;

function App() {
  // ================================
  // NAVIGATION
  // ================================

  const [activePage, setActivePage] = useState("review");
  const [lastReviewId, setLastReviewId] = useState(null);
  // Used by the upcoming Review Details feature
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // ================================
  // REVIEW STATE
  // ================================

  const [code, setCode] = useState(initialCode);
  const [review, setReview] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [fileType, setFileType] = useState("Auto Detect");
  // ================================
  // TEACH AGENT
  // ================================

  const [feedback, setFeedback] = useState("");
  const [teaching, setTeaching] = useState(false);
  const [teachMessage, setTeachMessage] = useState("");

  // ================================
  // LEARNING EVENTS
  // ================================

  const [learningEvents, setLearningEvents] = useState([]);

  // ================================
  // REVIEW CODE
  // ================================

  async function handleReview() {
    if (!code.trim()) {
      setError("Please enter some code first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReview(null);

      const response = await fetch(`${API_URL}/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          fileType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to review code");
      }

      setReview(data.review);
      setMemories(data.memories || []);
      setLastReviewId(data.reviewId || null);

      setLearningEvents((previous) => [
        {
          id: Date.now(),
          type: "review",
          title: "Code review completed",
          description: `AI analyzed the code using ${
            data.memories?.length || 0
          } relevant memories.`,
          time: new Date().toLocaleTimeString(),
        },
        ...previous,
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to review code.");
    } finally {
      setLoading(false);
    }
  }

  // ================================
  // TEACH AGENT
  // ================================

  async function handleTeach() {
    if (!feedback.trim()) {
      setTeachMessage("Enter a rule or lesson first.");
      return;
    }

    try {
      setTeaching(true);
      setTeachMessage("");

      const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to teach agent");
      }

      setTeachMessage("Agent learned this rule successfully.");
      setFeedback("");

      setLearningEvents((previous) => [
        {
          id: Date.now(),
          type: "learning",
          title: "New team knowledge learned",
          description: feedback,
          time: new Date().toLocaleTimeString(),
        },
        ...previous,
      ]);
    } catch (err) {
      console.error(err);
      setTeachMessage(err.message || "Failed to teach the agent.");
    } finally {
      setTeaching(false);
    }
  }

  // ================================
  // NAVIGATION
  // ================================

  function openHistory() {
    setActivePage("history");
  }

  function openReview() {
    setActivePage("review");
    setSelectedReviewId(null);
  }

  // ================================
  // SCORE HELPERS
  // ================================

  function getScoreClass(score) {
    if (score >= 80) return "score-good";
    if (score >= 60) return "score-medium";
    return "score-bad";
  }

  function getSeverityClass(severity) {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "severity-critical";

      case "high":
        return "severity-high";

      case "medium":
        return "severity-medium";

      case "low":
        return "severity-low";

      default:
        return "severity-medium";
    }
  }

  return (
    <div className="app-shell">
      {/* ============================================
          TOP NAVIGATION
      ============================================ */}

      <header className="top-navigation">
        <div className="top-brand">
          <div className="top-brand-icon">
            <Brain size={21} />
          </div>

          <div>
            <div className="top-brand-name">CodeMind</div>
            <div className="top-brand-subtitle">AI Code Review Agent</div>
          </div>
        </div>

        <nav className="top-nav-links">
          <button
            className={`top-nav-item ${
              activePage === "review" ? "active" : ""
            }`}
            onClick={openReview}
          >
            <Code2 size={16} />
            New Review
          </button>

          <button
            className={`top-nav-item ${
              activePage === "history" ? "active" : ""
            }`}
            onClick={openHistory}
          >
            <History size={16} />
            Review History
          </button>
        </nav>

        <div className="top-nav-status">
          <span className="status-dot" />
          <span>Memory Active</span>
          <Brain size={15} />
        </div>
      </header>

      {/* ============================================
          MAIN AREA
      ============================================ */}

      <main className="main-area">
        {/* ==========================================
            REVIEW HISTORY PAGE
        ========================================== */}

        {activePage === "history" ? (
          selectedReviewId ? (
            <ReviewDetails
              reviewId={selectedReviewId}
              onBack={() => setSelectedReviewId(null)}
            />
          ) : (
            <ReviewHistory
              onSelectReview={(id) => {
                setSelectedReviewId(id);
              }}
            />
          )
        ) : (
          /* ==========================================
             NEW REVIEW PAGE
          ========================================== */

          <div className="workspace">
            {/* ========================================
                EDITOR SECTION
            ======================================== */}
            <div className="hero-section">
              <div className="hero-badge">
                <Sparkles size={13} />
                MEMORY-AWARE CODE REVIEW
              </div>

              <h1>
                Code review that <span>learns your team.</span>
              </h1>

              <p>
                Analyze code with AI reasoning powered by Groq and personalized
                using your team's long-term knowledge.
              </p>
            </div>

            <div className="review-workspace-grid">
              <section className="editor-section">
                <div className="section-header">
                  <div className="section-title">
                    <Code2 size={16} />
                    <span>Code Input</span>
                  </div>

                  <div className="language-selector">
                    <select
                      className="language-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="JavaScript">JavaScript</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="Java">Java</option>
                      <option value="Python">Python</option>
                      <option value="C++">C++</option>
                      <option value="C#">C#</option>
                      <option value="Go">Go</option>
                      <option value="SQL">SQL</option>
                    </select>

                    <select
                      className="language-select"
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                    >
                      <option value="Controller">Controller</option>
                      <option value="Service">Service</option>
                      <option value="Repository">Repository</option>
                      <option value="API">API</option>
                      <option value="Component">Component</option>
                      <option value="Utility">Utility</option>
                    </select>
                  </div>
                </div>

                <div className="editor-wrapper">
                  <div className="line-numbers">
                    {code.split("\n").map((_, index) => (
                      <div key={index}>{index + 1}</div>
                    ))}
                  </div>

                  <textarea
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="code-editor"
                    spellCheck={false}
                    placeholder="Paste your code here..."
                  />
                </div>

                <div className="editor-footer">
                  <span>{code.split("\n").length} lines</span>

                  <button
                    className="review-button"
                    onClick={handleReview}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={17} className="spin" />
                        Reviewing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={17} />
                        Review Code
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="error-banner">
                    <AlertTriangle size={17} />
                    {error}
                  </div>
                )}
              </section>

              {/* ========================================
                REVIEW RESULT
            ======================================== */}

              <section className="review-section">
                <div className="section-header">
                  <div>
                    <div className="section-title">
                      <Sparkles size={18} />
                      AI Review
                    </div>

                    <div className="section-description">
                      Analysis powered by Groq and personalized using Hindsight
                      memory.
                    </div>
                  </div>
                </div>
                {review && (
                  <div className="memory-applied-badge">
                    <Brain size={14} />
                    {memories.length > 0
                      ? `${memories.length} Hindsight ${
                          memories.length === 1 ? "memory" : "memories"
                        } applied`
                      : "No relevant Hindsight memory applied"}
                  </div>
                )}

                {!review && !loading && (
                  <div className="empty-review">
                    <div className="empty-review-icon">
                      <Brain size={30} />
                    </div>

                    <h3>Ready to review your code</h3>

                    <p>
                      Submit code and the agent will combine
                      software-engineering reasoning with your team's remembered
                      knowledge.
                    </p>

                    <div className="empty-flow">
                      <span>Code</span>
                      <ChevronRight size={15} />
                      <span>Hindsight</span>
                      <ChevronRight size={15} />
                      <span>Groq</span>
                      <ChevronRight size={15} />
                      <span>Review</span>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="loading-review">
                    <div className="loading-orb">
                      <Brain size={28} />
                    </div>

                    <h3>Agent is reviewing your code...</h3>

                    <p>
                      Searching team memory and generating a personalized
                      review.
                    </p>

                    <div className="loading-steps">
                      <span>Recall memory</span>
                      <span>Analyze code</span>
                      <span>Generate review</span>
                    </div>
                  </div>
                )}

                {review && !loading && (
                  <div className="review-result">
                    {/* SCORE */}

                    <div className="score-card">
                      <div>
                        <div className="result-label">CODE QUALITY SCORE</div>

                        <div className="score-value-row">
                          <span
                            className={`score-value ${getScoreClass(
                              review.score,
                            )}`}
                          >
                            {review.score}
                          </span>

                          <span className="score-max">/100</span>
                        </div>
                      </div>

                      <div className="score-ring">
                        <div
                          className="score-ring-progress"
                          style={{
                            background: `conic-gradient(
                            #818cf8 ${review.score * 3.6}deg,
                            #242630 ${review.score * 3.6}deg
                          )`,
                          }}
                        >
                          <div className="score-ring-inner">{review.score}</div>
                        </div>
                      </div>
                    </div>

                    {/* SUMMARY */}

                    <div className="result-card">
                      <div className="result-card-header">
                        <MessageSquare size={17} />
                        Summary
                      </div>

                      <p className="summary-text">{review.summary}</p>
                    </div>

                    {/* ISSUES */}

                    <div className="result-card">
                      <div className="result-card-header">
                        <AlertTriangle size={17} />
                        Issues
                        <span className="count-badge">
                          {review.issues?.length || 0}
                        </span>
                      </div>

                      {review.issues?.length ? (
                        <div className="issues-list">
                          {review.issues.map((issue, index) => (
                            <div className="issue-card" key={index}>
                              <div className="issue-top">
                                <span
                                  className={`severity-badge ${getSeverityClass(
                                    issue.severity,
                                  )}`}
                                >
                                  {issue.severity}
                                </span>

                                <span className="issue-category">
                                  {issue.category}
                                </span>
                              </div>

                              <h4>{issue.title}</h4>

                              <p>{issue.explanation}</p>

                              {issue.whyItMatters && (
                                <div className="issue-detail">
                                  <strong>Why it matters</strong>

                                  <span>{issue.whyItMatters}</span>
                                </div>
                              )}

                              {issue.suggestion && (
                                <div className="issue-detail suggestion">
                                  <strong>Suggested fix</strong>

                                  <span>{issue.suggestion}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-issues">
                          <CheckCircle2 size={20} />

                          <span>No important issues detected.</span>
                        </div>
                      )}
                    </div>

                    {/* TEAM PREFERENCES */}

                    <div className="result-card">
                      <div className="result-card-header">
                        <ShieldCheck size={17} />
                        Team Preferences
                        <span className="count-badge">
                          {review.teamPreferences?.length || 0}
                        </span>
                      </div>

                      {review.teamPreferences?.length ? (
                        <div className="preferences-list">
                          {review.teamPreferences.map((preference, index) => (
                            <div className="preference-card" key={index}>
                              <div className="preference-icon">
                                <Brain size={16} />
                              </div>

                              <div className="preference-content">
                                <div className="preference-top">
                                  <strong>{preference.rule}</strong>

                                  {preference.applied && (
                                    <span className="preference-applied">
                                      <CheckCircle2 size={12} />
                                      Applied
                                    </span>
                                  )}
                                </div>

                                <p>{preference.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-memory-message">
                          No relevant team preferences were applied to this
                          review.
                        </div>
                      )}
                    </div>

                    {/* POSITIVES */}

                    {review.positives?.length > 0 && (
                      <div className="result-card">
                        <div className="result-card-header">
                          <CheckCircle2 size={17} />
                          What You Did Well
                        </div>

                        <div className="positives-list">
                          {review.positives.map((positive, index) => (
                            <div className="positive-item" key={index}>
                              <CheckCircle2 size={15} />
                              <span>{positive}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* ========================================
                HINDSIGHT MEMORY
            ======================================== */}

            <section className="memory-section">
              <div className="section-header">
                <div>
                  <div className="section-title">
                    <Brain size={18} />
                    Hindsight Memory
                  </div>

                  <div className="section-description">
                    Long-term team knowledge retrieved for this review.
                  </div>
                </div>

                <div className="memory-count">
                  {memories.length}{" "}
                  {memories.length === 1 ? "memory" : "memories"}
                </div>
              </div>

              {memories.length === 0 ? (
                <div className="memory-empty">
                  <Database size={22} />

                  <span>No memories retrieved yet.</span>
                </div>
              ) : (
                <div className="memory-grid">
                  {memories.map((memory, index) => (
                    <div className="memory-card" key={index}>
                      <div className="memory-card-header">
                        <div className="memory-icon">
                          <Brain size={15} />
                        </div>

                        <div className="memory-card-title">
                          <span>
                            Team Memory {String(index + 1).padStart(2, "0")}
                          </span>

                          <small>Retrieved by Hindsight</small>
                        </div>
                      </div>

                      <p>
                        {typeof memory === "string"
                          ? memory
                          : memory.text ||
                            memory.content ||
                            memory.observation ||
                            JSON.stringify(memory)}
                      </p>

                      <div className="memory-retrieved">
                        <CheckCircle2 size={12} />
                        Relevant to this review
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ========================================
                MEMORY INFLUENCE
            ======================================== */}

            {review && (
              <section className="memory-influence">
                <div className="memory-influence-icon">
                  <Zap size={18} />
                </div>

                <div>
                  <h3>How memory influenced this review</h3>

                  <p>
                    The agent recalled relevant team knowledge before generating
                    this review. This allows the reviewer to become more
                    personalized over time.
                  </p>

                  <div className="influence-flow">
                    <div className="influence-step">
                      <Brain size={14} />
                      <span>Past team knowledge</span>
                    </div>

                    <ChevronRight size={15} />

                    <div className="influence-step">
                      <Brain size={14} />
                      <span>Hindsight recall</span>
                    </div>

                    <ChevronRight size={15} />

                    <div className="influence-step">
                      <Code2 size={14} />
                      <span>Current code</span>
                    </div>

                    <ChevronRight size={15} />

                    <div className="influence-step influence-final">
                      <Sparkles size={14} />
                      <span>Personalized review</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================
                TEACH AGENT
            ======================================== */}

            <section className="teach-section">
              <div className="section-header">
                <div>
                  <div className="section-title">
                    <BookOpen size={18} />
                    Teach the Agent
                  </div>

                  <div className="section-description">
                    Add a team rule, preference, security policy, or coding
                    lesson to long-term memory.
                  </div>
                </div>
              </div>

              <div className="teach-card">
                <textarea
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Example: Our team requires all database operations to be placed inside service classes."
                  className="teach-input"
                />

                <div className="teach-footer">
                  <span>This knowledge will be stored in Hindsight.</span>

                  <button
                    className="teach-button"
                    onClick={handleTeach}
                    disabled={teaching}
                  >
                    {teaching ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        Learning...
                      </>
                    ) : (
                      <>
                        <Brain size={16} />
                        Teach Agent
                      </>
                    )}
                  </button>
                </div>

                {teachMessage && (
                  <div className="teach-message">
                    <CheckCircle2 size={16} />
                    {teachMessage}
                  </div>
                )}
              </div>
            </section>

            {/* ========================================
                LEARNING JOURNEY
            ======================================== */}

            <section className="learning-journey">
              <div className="section-header">
                <div>
                  <div className="section-title">
                    <GitBranch size={18} />
                    Learning Journey
                  </div>

                  <div className="section-description">
                    See how the agent learns from reviews and developer
                    feedback.
                  </div>
                </div>
              </div>

              {learningEvents.length === 0 ? (
                <div className="journey-empty">
                  <Clock3 size={22} />

                  <div>
                    <strong>Your learning journey starts here.</strong>

                    <p>
                      Review code or teach the agent to create the first
                      learning event.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="journey-list">
                  {learningEvents.map((event) => (
                    <div className="journey-item" key={event.id}>
                      <div className="journey-dot">
                        {event.type === "learning" ? (
                          <Brain size={14} />
                        ) : (
                          <Code2 size={14} />
                        )}
                      </div>

                      <div className="journey-content">
                        <div className="journey-top">
                          <strong>{event.title}</strong>

                          <span>{event.time}</span>
                        </div>

                        <p>{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ========================================
                AGENT WORKFLOW
            ======================================== */}

            <section className="workflow-section">
              <div className="section-header">
                <div>
                  <div className="section-title">
                    <GitBranch size={18} />
                    Agent Workflow
                  </div>

                  <div className="section-description">
                    How CodeMind combines memory and reasoning.
                  </div>
                </div>
              </div>

              <div className="workflow">
                <div className="workflow-step">
                  <div className="workflow-icon">
                    <Code2 size={18} />
                  </div>

                  <strong>Code</strong>

                  <span>Developer submits code</span>
                </div>

                <ChevronRight className="workflow-arrow" />

                <div className="workflow-step">
                  <div className="workflow-icon">
                    <Brain size={18} />
                  </div>

                  <strong>Recall</strong>

                  <span>Hindsight retrieves relevant knowledge</span>
                </div>

                <ChevronRight className="workflow-arrow" />

                <div className="workflow-step">
                  <div className="workflow-icon">
                    <Sparkles size={18} />
                  </div>

                  <strong>Reason</strong>

                  <span>Groq analyzes the code</span>
                </div>

                <ChevronRight className="workflow-arrow" />

                <div className="workflow-step">
                  <div className="workflow-icon">
                    <Database size={18} />
                  </div>
                  <strong>Remember</strong>
                  <span>Hindsight retains learned team knowledge</span>{" "}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
