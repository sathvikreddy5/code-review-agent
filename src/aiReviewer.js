import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateReview(
  code,
  language,
  memories,
  fileType = "Auto Detect",
) {
  const prompt = `
You are a senior software engineer performing a professional code review.

PROGRAMMING LANGUAGE:
${language}

ARCHITECTURAL / FILE CONTEXT:
${fileType}

CURRENT CODE:
${code}

PREVIOUS TEAM KNOWLEDGE FROM HINDSIGHT:
${JSON.stringify(memories)}

==================================================
REVIEW PRINCIPLES
==================================================

Review the code based on evidence present in the code and the provided
architectural/file context.

Never invent facts about the code.

Never assume a method belongs to a controller, service, repository,
or another architectural layer when the context is "Auto Detect" and
the code does not provide enough evidence.

If the architectural layer is explicitly provided, use that context.

For example:

If the context is:

File Type: Controller

and the code contains:

userRepository.update(id, name);

then a team rule requiring database operations to be inside service
classes can be applied as a confirmed architecture issue.

If the context is:

File Type: Service

and the code contains:

userRepository.update(id, name);

then this is normally an appropriate service-to-repository interaction
and should NOT be flagged as an architecture violation.

If the context is:

Auto Detect

and there is not enough evidence to determine the layer, do NOT claim
that an architecture rule is definitely violated.

Instead, explain that the architectural concern cannot be confirmed
without knowing the layer.

==================================================
HINDSIGHT MEMORY
==================================================

Hindsight contains long-term team knowledge such as:

- Coding standards
- Architecture decisions
- Security rules
- Developer preferences
- Lessons learned from previous reviews

Use only memories that are relevant to the current code.

Do NOT invent team preferences.

A team preference should only be marked as "applied" when:

1. The memory is relevant.
2. The current code provides enough evidence.
3. The rule can reasonably be evaluated.

If a memory is relevant but cannot be confirmed because context is
missing, explain that clearly.

==================================================
CODE REVIEW
==================================================

Evaluate:

1. Correctness
2. Security
3. Input validation
4. Error handling
5. Architecture
6. Maintainability
7. Performance
8. Language-specific best practices
9. Team-specific standards from Hindsight

Focus on genuine and important problems.

Do not create issues simply to increase the issue count.

Do not report the same problem multiple times.

Do not call something a security vulnerability without evidence.

Missing validation is not automatically a security vulnerability.

A short method is not automatically bad code.

Consider whether the code is actually wrong before reporting an issue.

If there are no significant issues, say so.

==================================================
ISSUE SEVERITY
==================================================

critical:
Serious security vulnerabilities, credential exposure, major data loss,
or severe production failures.

high:
Important bugs, confirmed security problems, serious architecture
violations, or reliability problems.

medium:
Meaningful correctness, maintainability, validation, or reliability
concerns.

low:
Minor improvements or style-related suggestions.

==================================================
IMPORTANT
==================================================

Distinguish between:

- Confirmed problem
- Potential problem
- Recommendation

If something cannot be confirmed from the available context, say so.

For every issue provide:

- What is wrong
- Why it matters
- Practical fix

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Do not include a score.
The application will calculate the score separately.
Use exactly this structure:

{
  "summary": "One or two simple sentences explaining the overall situation.",
  "issues": [
    {
      "severity": "high",
      "category": "Architecture",
      "title": "Short problem title",
      "explanation": "Explain the problem accurately.",
      "whyItMatters": "Explain why it matters.",
      "suggestion": "Give a practical fix."
    }
  ],
  "teamPreferences": [
    {
      "rule": "The remembered team preference.",
      "applied": true,
      "explanation": "Explain exactly how it relates to the code."
    }
  ],
  "positives": [
    "Something the code is doing correctly."
  ]
}

Return ONLY valid JSON.

Do not include a score.
The application will calculate the score separately.`;

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
