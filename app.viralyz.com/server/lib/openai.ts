import OpenAI from "openai";

function resolveOpenAIConfig() {
  const apiKey =
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

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

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI(resolveOpenAIConfig());
  }
  return _client;
}

/** @deprecated Use getOpenAI() — lazy init avoids boot crash without keys */
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    const client = getOpenAI();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o";

export const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";
