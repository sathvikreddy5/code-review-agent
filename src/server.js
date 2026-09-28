import "dotenv/config";
import express from "express";
import cors from "cors";

import prisma from "./prisma.js";
import { reviewCode, learnFromFeedback } from "./reviewer.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Code Review Agent API is running 🚀",
  });
});

// =====================================================
// REVIEW CODE
// =====================================================

app.post("/api/review", async (req, res) => {
  try {
    const {
      code,
      language = "JavaScript",
      filetype = "Auto Detect",
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        error: "Code is required",
      });
    }

    console.log("🔍 Starting code review...");

    // Hindsight + Groq review
    const result = await reviewCode(code, language, filetype);

    // -------------------------------------------------
    // SAVE REVIEW TO POSTGRESQL
    // -------------------------------------------------

    const savedReview = await prisma.review.create({
      data: {
        code,
        summary: result.review.summary,
        score: result.review.score,
        issues: result.review.issues || [],
        teamPreferences: result.review.teamPreferences || [],
        positives: result.review.positives || [],
      },
    });

    console.log(`💾 Review saved to PostgreSQL: ${savedReview.id}`);

    res.json({
      success: true,

      review: result.review,

      memories: result.memories || [],

      reviewId: savedReview.id,
    });
  } catch (error) {
    console.error("Review error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to review code",
    });
  }
});

// =====================================================
// TEACH AGENT
// =====================================================

app.post("/api/feedback", async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        error: "Feedback is required",
      });
    }

    await learnFromFeedback(feedback);

    res.json({
      success: true,
      message: "Feedback learned successfully 🧠",
    });
  } catch (error) {
    console.error("❌ Feedback error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to store feedback",
    });
  }
});

// =====================================================
// REVIEW HISTORY
// =====================================================

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("History error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch review history",
    });
  }
});

// =====================================================
// SINGLE REVIEW
// =====================================================

app.get("/api/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("❌ Review error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to review code",
    });
  }
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Code Review Agent running on port ${PORT}`);
});
