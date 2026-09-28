// src/hindsight.js

import { HindsightClient } from "@vectorize-io/hindsight-client";

const hindsight = new HindsightClient({
  baseUrl: process.env.HINDSIGHT_BASE_URL,
  apiKey: process.env.HINDSIGHT_API_KEY,
});

const bankId = process.env.HINDSIGHT_BANK_ID;

// ========================================
// RETAIN
// Store learned knowledge / experiences
// ========================================

export async function remember(text, options = {}) {
  if (!text || !text.trim()) {
    throw new Error("Memory content cannot be empty");
  }

  return await hindsight.retain(bankId, text, {
    ...options,
  });
}

// ========================================
// RECALL
// Retrieve relevant memories
// ========================================

export async function recall(query, options = {}) {
  if (!query || !query.trim()) {
    throw new Error("Recall query cannot be empty");
  }

  const result = await hindsight.recall(bankId, query, {
    ...options,
  });

  return result;
}

// ========================================
// REFLECT
// Reason over accumulated memories
// ========================================

export async function reflect(query, options = {}) {
  if (!query || !query.trim()) {
    throw new Error("Reflect query cannot be empty");
  }

  const result = await hindsight.reflect(bankId, query, {
    includeFacts: true,
    ...options,
  });

  return result;
}

// ========================================
// HEALTH CHECK
// ========================================

export async function testHindsightConnection() {
  if (!bankId) {
    throw new Error("HINDSIGHT_BANK_ID is not configured");
  }

  const result = await hindsight.recall(
    bankId,
    "What team coding standards and engineering preferences are known?",
  );

  return {
    success: true,
    bankId,
    memoriesFound: result.results?.length || 0,
  };
}
