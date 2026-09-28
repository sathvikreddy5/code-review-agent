import "dotenv/config";
import { learnFromFeedback, reviewCode } from "./reviewer.js";

// ============================================
// STEP 1: Developer gives feedback
// ============================================

const feedback = `
Our team prefers database operations to be handled
inside service classes rather than directly inside controllers.
`;

await learnFromFeedback(feedback);

// ============================================
// STEP 2: Later, a new piece of code arrives
// ============================================

const newCode = `
function getUser(req, res) {
    const user = db.users.find(req.params.id);

    return res.json(user);
}
`;

// ============================================
// STEP 3: Agent reviews the new code
// ============================================

const result = await reviewCode(newCode);

console.log("\n================================");
console.log("🤖 AI CODE REVIEW");
console.log("================================");

console.log(result.review);

console.log("\n================================");
console.log("🧠 MEMORY USED");
console.log("================================");

console.log(JSON.stringify(result.memories, null, 2));
