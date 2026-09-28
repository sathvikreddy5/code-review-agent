import "dotenv/config";
import { remember } from "../src/hindsight.js";

const rules = [
  "Input validation is required before processing user-provided data.",

  "Controllers should only handle HTTP request and response logic.",

  "Database operations must be handled inside service classes.",

  "Never log passwords, API keys, authentication tokens, or credentials.",

  "Controller input should use DTOs instead of raw request objects.",
];

for (const rule of rules) {
  await remember(rule, {
    type: "world",
  });

  console.log("Stored:", rule);
}

console.log("✅ Hindsight team knowledge seeded successfully.");
