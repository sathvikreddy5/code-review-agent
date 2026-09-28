import { remember, recall } from "./hindsight.js";
import { generateReview } from "./aiReviewer.js";

export async function reviewCode(code, language = "JavaScript") {
  console.log("🧠 Searching Hindsight for relevant team knowledge...");

  const memoryQuery = `
Find any previously learned team rules, coding standards,
architecture decisions, security policies, developer preferences,
or lessons that should be considered when reviewing code.

The review is for:
- Programming language: ${language}
- Architecture
- Database usage
- Controllers and services
- Security
- Input validation
- Error handling
- Maintainability
- Team coding conventions

Retrieve relevant team knowledge even if the memory was learned
during an earlier review or teaching session.

CURRENT CODE:
${code}
`;

  const memories = await recall(memoryQuery);

  console.log("🧠 Relevant memories retrieved:", memories);

  console.log("🤖 Asking AI to review the code...");

  const review = await generateReview(code, language, memories);

  return {
    review,
    memories,
  };
}

export async function learnFromFeedback(feedback) {
  console.log("🧠 Learning from developer feedback...");

  await remember(`
Developer feedback from a code review:

${feedback}

This feedback represents a team coding preference,
engineering standard, architectural decision, or lesson
that should be considered in future code reviews.
`);

  console.log("✅ Feedback stored in Hindsight!");
}
