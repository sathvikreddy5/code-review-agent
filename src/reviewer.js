import { remember, recall } from "./hindsight.js";
import { generateReview } from "./aiReviewer.js";

export async function reviewCode(
  code,
  language = "JavaScript",
  fileType = "Auto Detect",
) {
  console.log("🧠 Searching Hindsight for relevant team knowledge...");

  const memoryQuery = `
Find team knowledge relevant to reviewing this code.

Consider:

- Coding standards
- Security policies
- Input validation requirements
- Architecture decisions
- Controller/service boundaries
- Database usage
- Error handling
- Maintainability
- Developer preferences
- Lessons learned from previous reviews

Review context:

Programming language: ${language}
File type: ${fileType}

IMPORTANT:

Only return knowledge that can reasonably influence
the current review.

If the file type is explicitly known, use that context.

CURRENT CODE:

${code}
`;
  const memories = await recall(memoryQuery);

  console.log("🧠 Relevant memories retrieved:", memories);

  const memoryResults = Array.isArray(memories?.results)
    ? memories.results
    : [];

  const uniqueMemories = [];
  const seen = new Set();

  for (const memory of memoryResults) {
    const text = String(memory.text || "").trim();

    if (!text) continue;

    const key = text.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);

    uniqueMemories.push({
      type: memory.type,
      text,
    });

    if (uniqueMemories.length >= 6) break;
  }

  console.log(
    `🧠 Using ${uniqueMemories.length} unique Hindsight memories for the AI review`,
  );

  console.log("🤖 Asking AI to review the code...");

  const review = await generateReview(code, language, uniqueMemories, fileType);

  // -------------------------------------------------
  // DETERMINISTIC SCORE
  // -------------------------------------------------

  review.score = calculateScore(review.issues || []);

  return {
    review,
    memories,
  };
}

// =====================================================
// SCORE CALCULATION
// =====================================================

function calculateScore(issues) {
  let score = 100;

  const deductions = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 3,
  };

  for (const issue of issues) {
    const severity = String(issue.severity || "").toLowerCase();

    score -= deductions[severity] || 0;
  }

  return Math.max(0, Math.min(100, score));
}

// =====================================================
// LEARN FROM FEEDBACK
// =====================================================

export async function learnFromFeedback(feedback) {
  console.log("🧠 Learning from developer feedback...");

  await remember(`
Developer feedback from a CodeMind code review:

${feedback}

This feedback represents a team coding preference,
engineering standard, architectural decision,
or lesson learned.

Use this knowledge when reviewing future code.
`);

  console.log("✅ Feedback stored in Hindsight!");
}
