import "dotenv/config";
import { reflect } from "./hindsight.js";

async function runTest() {
  try {
    console.log("🧠 Testing Hindsight Reflect...\n");

    const result = await reflect(`
Analyze the team's accumulated engineering knowledge.

Answer these questions:

1. What coding standards has the team explicitly established?
2. What architectural preferences appear repeatedly?
3. What developer feedback has influenced those standards?
4. Are there any signs that a previous team rule has changed?
5. What should CodeMind prioritize during future code reviews?

Give a concise engineering-focused answer.
`);

    console.log("========================================");
    console.log("HINDSIGHT REFLECT RESULT");
    console.log("========================================\n");

    console.log(result.text);
    console.log("\n========================================");
    console.log("MEMORIES USED");
    console.log("========================================\n");

    const sourceMemories = result.based_on?.memories || [];

    if (sourceMemories.length > 0) {
      console.log(
        `🧠 ${sourceMemories.length} memories influenced this reflection.\n`,
      );

      sourceMemories.forEach((memory, index) => {
        console.log(`${index + 1}. [${memory.type}] ${memory.text}`);
      });
    } else {
      console.log("No source memories returned.");
    }

    console.log("\n✅ Reflect test completed.");
  } catch (error) {
    console.error("\n❌ Reflect test failed:");
    console.error(error);
  }
}

runTest();
