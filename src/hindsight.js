import { HindsightClient } from "@vectorize-io/hindsight-client";

const hindsight = new HindsightClient({
  baseUrl: process.env.HINDSIGHT_BASE_URL,
  apiKey: process.env.HINDSIGHT_API_KEY,
});

const bankId = process.env.HINDSIGHT_BANK_ID;

export async function remember(text) {
  await hindsight.retain(bankId, text);
}

export async function recall(query) {
  const response = await hindsight.recall(bankId, query, {
    preferObservations: true,
    budget: "mid",
  });

  return response.results || [];
}
