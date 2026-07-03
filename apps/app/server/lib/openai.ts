import OpenAI from "openai";

function resolveOpenAIConfig() {
  const apiKey =
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;

  const baseURL =
    process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    "https://api.openai.com/v1";

  if (!apiKey) {
    throw new Error(
      "OpenAI API key missing. Set OPENAI_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY.",
    );
  }

  return { apiKey, baseURL };
}

export const openai = new OpenAI(resolveOpenAIConfig());

export const OPENAI_CHAT_MODEL =
  process.env.OPENAI_CHAT_MODEL || "gpt-4o";

export const OPENAI_IMAGE_MODEL =
  process.env.OPENAI_IMAGE_MODEL || "dall-e-3";
