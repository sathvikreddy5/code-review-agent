import { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Code2,
  Calendar,
  Loader2,
  MessageSquare,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function getScoreClass(score) {
  if (score >= 80) return "details-score-good";
  if (score >= 60) return "details-score-medium";
  return "details-score-bad";
}

function getSeverityClass(severity) {
  switch (severity?.toLowerCase()) {
    case "critical":
    case "high":
      return "details-severity-high";

    case "medium":
      return "details-severity-medium";

    case "low":
      return "details-severity-low";

    default:
      return "details-severity-medium";
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReviewDetails({
  reviewId,
  onBack,
}) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReview() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/reviews/${reviewId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load review"
          );
        }

        setReview(data.review);
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Failed to load review details."
        );
      } finally {
        setLoading(false);
      }
    }

    if (reviewId) {
      loadReview();
    }
  }, [reviewId]);

  if (loading) {
    return (
      <div className="details-state">
        <Loader2
          size={28}
          className="details-spin"
        />

        <p>Loading review details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-state">
        <AlertTriangle size={28} />

        <p>{error}</p>

        <button
          className="details-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to History
        </button>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="review-details-page">
      {/* HEADER */}

      <div className="details-header">
        <button
          className="details-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Review History
        </button>

        <div className="details-header-info">
          <div className="details-title">
            <Code2 size={20} />
            Review Details
          </div>

          <div className="details-id">
            #{review.id}
          </div>
        </div>
      </div>

      {/* SCORE + SUMMARY */}

      <div className="details-overview">
        <div className="details-score-card">
          <span className="details-label">
            CODE QUALITY
          </span>

          <div
            className={`details-score ${getScoreClass(
              review.score
            )}`}
          >
            {review.score}
            <span>/100</span>
          </div>

          <div className="details-score-bar">
            <div
              style={{
                width: `${review.score}%`,
              }}
            />
          </div>
        </div>

        <div className="details-summary-card">
          <div className="details-card-title">
            <MessageSquare size={17} />
            Summary
          </div>

          <p>{review.summary}</p>

          <div className="details-date">
            <Calendar size={14} />
            {formatDate(review.createdAt)}
          </div>
        </div>
      </div>

      {/* ORIGINAL CODE */}

      <section className="details-card">
        <div className="details-card-title">
          <Code2 size={17} />
          Original Code
        </div>

        <div className="details-code">
          <pre>
            <code>{review.code}</code>
          </pre>
        </div>
      </section>

      {/* ISSUES */}

      <section className="details-card">
        <div className="details-card-title">
          <AlertTriangle size={17} />
          Issues

          <span className="details-count">
            {review.issues?.length || 0}
          </span>
        </div>

        {review.issues?.length ? (
          <div className="details-issues">
            {review.issues.map((issue, index) => (
              <div
                className="details-issue"
                key={index}
              >
                <div className="details-issue-top">
                  <span
                    className={`details-severity ${getSeverityClass(
                      issue.severity
                    )}`}
                  >
                    {issue.severity}
                  </span>

                  <span className="details-category">
                    {issue.category}
                  </span>

                  {issue.confidence && (
                    <span className="details-confidence">
                      {issue.confidence} confidence
                    </span>
                  )}
                </div>

                <h3>{issue.title}</h3>

                <p>{issue.explanation}</p>

                {issue.whyItMatters && (
                  <div className="details-explanation">
                    <strong>
                      Why it matters
                    </strong>

                    <span>
                      {issue.whyItMatters}
                    </span>
                  </div>
                )}

                {issue.suggestion && (
                  <div className="details-suggestion">
                    <strong>
                      Suggested fix
                    </strong>

                    <span>
                      {issue.suggestion}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="details-empty">
            <CheckCircle2 size={19} />
            No issues were detected.
          </div>
        )}
      </section>

      {/* TEAM PREFERENCES */}

      <section className="details-card">
        <div className="details-card-title">
          <ShieldCheck size={17} />
          Team Preferences

          <span className="details-count">
            {review.teamPreferences?.length || 0}
          </span>
        </div>

        {review.teamPreferences?.length ? (
          <div className="details-preferences">
            {review.teamPreferences.map(
              (preference, index) => (
                <div
                  className="details-preference"
                  key={index}
                >
                  <Brain size={17} />

                  <div>
                    <strong>
                      {preference.rule}
                    </strong>

                    <p>
                      {preference.explanation}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="details-empty">
            No team preferences were applied.
          </div>
        )}
      </section>

      {/* POSITIVES */}

      {review.positives?.length > 0 && (
        <section className="details-card">
          <div className="details-card-title">
            <CheckCircle2 size={17} />
            What Was Done Well
          </div>

          <div className="details-positives">
            {review.positives.map(
              (positive, index) => (
                <div
                  className="details-positive"
                  key={index}
                >
                  <CheckCircle2 size={15} />
                  {positive}
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}