import "dotenv/config";
import express from "express";
import cors from "cors";

import prisma from "./prisma.js";
import { reviewCode, learnFromFeedback } from "./reviewer.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// =====================================================
// CONSTANTS
// =====================================================

const SUPPORTED_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Java",
  "Python",
  "C++",
  "C",
  "Go",
  "Rust",
  "SQL",
];

const SUPPORTED_FILE_TYPES = [
  "Auto Detect",
  "Controller",
  "Service",
  "Repository",
  "Component",
  "Utility",
  "API Route",
  "Other",
];

// =====================================================
// HEALTH
// =====================================================

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
      fileType = "Auto Detect",
    } = req.body;

    // -------------------------------------------------
    // INPUT VALIDATION
    // -------------------------------------------------

    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: "Code is required",
      });
    }

    // Prevent extremely large requests
    const MAX_CODE_LENGTH = 30000;

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Code is too large. Maximum allowed size is ${MAX_CODE_LENGTH} characters.`,
      });
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported programming language: ${language}`,
      });
    }

    if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported file type: ${fileType}`,
      });
    }

    console.log("🔍 Starting code review...");
    console.log(`💻 Language: ${language}`);
    console.log(`📁 File type: ${fileType}`);

    // -------------------------------------------------
    // HINDSIGHT + GROQ
    // -------------------------------------------------

    const result = await reviewCode(code, language, fileType);

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

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({
      success: true,

      review: result.review,

      memories: result.memories || [],

      reviewId: savedReview.id,

      language,

      fileType,
    });
  } catch (error) {
    console.error("❌ Review error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to review code",
    });
  }
});

// =====================================================
// TEACH AGENT / FEEDBACK
// =====================================================

app.post("/api/feedback", async (req, res) => {
  try {
    const { feedback, type = "teach" } = req.body;

    // -------------------------------------------------
    // INPUT VALIDATION
    // -------------------------------------------------

    if (typeof feedback !== "string" || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        error: "Feedback is required",
      });
    }

    if (feedback.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "Feedback is too long.",
      });
    }

    // -------------------------------------------------
    // VALID FEEDBACK TYPES
    // -------------------------------------------------

    const allowedTypes = ["teach", "accept", "dismiss"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid feedback type.",
      });
    }

    console.log(`🧠 Feedback type: ${type}`);

    // -------------------------------------------------
    // STORE IN HINDSIGHT
    // -------------------------------------------------

    await learnFromFeedback(feedback);

    // -------------------------------------------------
    // STORE EVENT IN POSTGRESQL
    // -------------------------------------------------

    const feedbackEvent = await prisma.feedbackEvent.create({
      data: {
        type,
        feedback: feedback.trim(),
      },
    });

    console.log(`💾 Feedback event saved to PostgreSQL: ${feedbackEvent.id}`);

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({
      success: true,
      message: "Feedback learned successfully 🧠",
      feedbackEventId: feedbackEvent.id,
    });
  } catch (error) {
    console.error("❌ Feedback error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to store feedback",
    });
  }
});

// ==========================================
// INSIGHTS
// ==========================================

app.get("/api/insights", async (req, res) => {
  try {
    const [
      totalReviews,
      acceptedSuggestions,
      dismissedSuggestions,
      taughtRules,
      recentReviews,
    ] = await Promise.all([
      prisma.review.count(),

      prisma.feedbackEvent.count({
        where: {
          type: "accept",
        },
      }),

      prisma.feedbackEvent.count({
        where: {
          type: "dismiss",
        },
      }),

      prisma.feedbackEvent.count({
        where: {
          type: "teach",
        },
      }),

      prisma.review.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          score: true,
          issues: true,
          teamPreferences: true,
          createdAt: true,
        },
      }),
    ]);

    const categoryCounts = {};

    for (const review of recentReviews) {
      const issues = Array.isArray(review.issues) ? review.issues : [];

      for (const issue of issues) {
        const category = issue.category || "Other";

        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    }

    const recurringIssues = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,

      overview: {
        totalReviews,
        acceptedSuggestions,
        dismissedSuggestions,
        taughtRules,
      },

      feedback: {
        total: acceptedSuggestions + dismissedSuggestions,
        accepted: acceptedSuggestions,
        dismissed: dismissedSuggestions,
      },

      recurringIssues,

      recentReviews: recentReviews.map((review) => ({
        id: review.id,
        score: review.score,
        createdAt: review.createdAt,
      })),
    });
  } catch (error) {
    console.error("❌ Insights error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to load insights",
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
      error: error.message || "Failed to fetch review",
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
