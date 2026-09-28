import { useEffect, useState } from "react";
import {
  Clock3,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getScoreClass(score) {
  if (score >= 80) return "good";
  if (score >= 60) return "medium";
  return "bad";
}

function getScoreIcon(score) {
  if (score >= 80) return <CheckCircle2 size={16} />;
  if (score >= 60) return <AlertTriangle size={16} />;
  return <ShieldAlert size={16} />;
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

export default function ReviewHistory({ onSelectReview }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/reviews`);

      if (!response.ok) {
        throw new Error("Failed to load review history");
      }

      const data = await response.json();

      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load review history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <div className="history-title-row">
            <Clock3 size={22} />
            <h2>Review History</h2>
          </div>

          <p>Every review you've run is stored securely in PostgreSQL.</p>
        </div>

        <button className="refresh-history" onClick={loadReviews}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="history-state">
          <Loader2 className="spin" size={22} />
          <span>Loading review history...</span>
        </div>
      )}

      {!loading && error && (
        <div className="history-state error-state">
          <ShieldAlert size={22} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="history-state">
          <Clock3 size={32} />
          <h3>No reviews yet</h3>
          <p>Run your first code review and it will appear here.</p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="review-history-list">
          {reviews.map((review) => (
            <button
              key={review.id}
              className="review-history-card"
              onClick={() => onSelectReview?.(review.id)}
            >
              <div className="review-card-score">
                <div className={`score-badge ${getScoreClass(review.score)}`}>
                  {getScoreIcon(review.score)}
                  {review.score}
                </div>
              </div>

              <div className="review-card-main">
                <div className="review-card-top">
                  <span className="review-id">
                    Review #{review.id.slice(-6)}
                  </span>

                  <span className="review-date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <h3>{review.summary}</h3>

                <div className="review-card-meta">
                  <span>
                    {Array.isArray(review.issues) ? review.issues.length : 0}{" "}
                    issues
                  </span>

                  <span>
                    {Array.isArray(review.teamPreferences)
                      ? review.teamPreferences.length
                      : 0}{" "}
                    team preferences
                  </span>
                </div>
              </div>

              <ChevronRight size={20} className="history-arrow" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
