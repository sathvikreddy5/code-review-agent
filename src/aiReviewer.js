import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateReview(code, language, memories) {
  const prompt = `
You are a senior software engineer performing a professional code review.

PROGRAMMING LANGUAGE:
${language}

CURRENT CODE:
${code}

PREVIOUS TEAM KNOWLEDGE:
${JSON.stringify(memories)}

Your job is to review the code specifically according to the programming
language mentioned above.

For example:
- If the language is Java, consider Java-specific issues such as
  exception handling, null safety, collections, OOP, concurrency,
  resource management, etc.
- If the language is JavaScript, consider JavaScript/Node.js-specific
  issues such as async handling, promises, validation, security,
  error handling, etc.
- If the language is Python, consider Python-specific issues such as
  exception handling, mutable defaults, type safety, resource handling,
  etc.
- If the language is SQL, consider SQL-specific issues such as
  injection, indexing, transactions, joins, and query performance.

Also use relevant team knowledge retrieved from Hindsight.

Return ONLY valid JSON using this exact structure:

{
  "summary": "One or two simple sentences explaining the overall situation.",
  "score": 75,
  "issues": [
    {
      "severity": "high",
      "category": "Security",
      "title": "Short problem title",
      "explanation": "Explain the problem in simple language.",
      "whyItMatters": "Explain why the developer should care.",
      "suggestion": "Give a practical fix."
    }
  ],
  "teamPreferences": [
    {
      "rule": "The team preference that was remembered.",
      "applied": true,
      "explanation": "Explain how this preference relates to the current code."
    }
  ],
  "positives": [
    "Something the code is doing correctly."
  ]
}

RULES:

1. Review the code according to the specified programming language.
2. Make the review easy for a developer to understand.
3. Keep explanations short and practical.
4. Avoid unnecessary jargon.
5. Focus on the most important issues first.
6. Give a concrete fix for every issue.
7. Use severity:
   - "critical" for serious security, data-loss, or credential exposure issues
   - "high" for important bugs, security, or architecture problems
   - "medium" for correctness, maintainability, or reliability concerns
   - "low" for minor improvements
8. Do not invent team preferences.
9. Only include team preferences supported by the provided Hindsight memories.
10. If no relevant team preference exists, return an empty array.
11. Score the code from 0 to 100 based on correctness, security,
    maintainability, and overall quality.
12. Be honest about the score.
13. Do not artificially increase or decrease the score.
14. Only include genuine positives.
15. Prefer 2-5 important issues rather than listing every tiny issue.
16. Do not repeat the same issue in multiple categories.
17. Return ONLY valid JSON.
18. Do not include markdown or explanations outside the JSON.
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
    response_format: {
      type: "json_object",
    },
  });

  const content = response.choices[0].message.content;

  return JSON.parse(content);
}
