import "dotenv/config";
import { HindsightClient } from "@vectorize-io/hindsight-client";

const client = new HindsightClient({
  baseUrl: process.env.HINDSIGHT_BASE_URL,
  apiKey: process.env.HINDSIGHT_API_KEY,
});

const bankId = process.env.HINDSIGHT_BANK_ID;

// 1. Store a coding rule in Hindsight
await client.retain(
  bankId,
  "Our team prefers business logic to be placed in service classes instead of controllers.",
);

console.log("✅ Memory stored successfully!");

// 2. Ask Hindsight to remember that rule
const result = await client.recall(
  bankId,
  "Where does our team prefer business logic to be placed?",
);

console.log("\n🧠 Hindsight recalled:");
console.log(result);
