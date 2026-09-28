import "dotenv/config";
import { reviewCode } from "./reviewer.js";

const code = `
function login(username, password) {
    console.log("User login:", username);
    return password;
}
`;

const result = await reviewCode(code);

console.log("\n==============================");
console.log("🤖 AI CODE REVIEW");
console.log("==============================");

console.log(result.review);

console.log("\n==============================");
console.log("🧠 MEMORY USED");
console.log("==============================");

console.log(JSON.stringify(result.memories, null, 2));
