import "dotenv/config";
import express from "express";
import cors from "cors";
import { reviewCode, learnFromFeedback } from "./reviewer.js";
import prisma from "./prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Code Review Agent API is running 🚀",
  });
});

// ===============================
// REVIEW CODE
// ===============================

app.post("/api/review", async (req, res) => {
  try {
    const { code, language = "JavaScript" } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        error: "Code is required",
      });
    }

    const result = await reviewCode(code, language);

    res.json({
      success: true,
      review: result.review,
      memories: result.memories,
      reviewId: result.reviewId,
    });
  } catch (error) {
    console.error("Review error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to review code",
    });
  }
});

// ===============================
// TEACH AGENT
// ===============================

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
    console.error("Feedback error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to store feedback",
    });
  }
});

// ===============================
// REVIEW HISTORY
// ===============================

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

// ===============================
// SINGLE REVIEW
// ===============================

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
    console.error("Review details error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch review",
    });
  }
});

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
      error: "Failed to load review history",
    });
  }
});

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
      error: "Failed to load review history",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Code Review Agent running on port ${PORT}`);
});
