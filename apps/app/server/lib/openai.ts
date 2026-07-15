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

let client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI(resolveOpenAIConfig());
  }
  return client;
}

// Lazily constructed so importing this module (or anything that transitively
// imports it) never crashes server startup when no API key is configured yet.
// The key is only required once a route actually calls into the client.
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
}) as OpenAI;

export const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o";

export const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";
