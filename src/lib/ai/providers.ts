// AI provider abstraction for search (OpenAI-compatible). NVIDIA is primary.
import { getEnv, isProduction } from "@/lib/env";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ProviderCompletion {
  content: string;
  provider: string;
}

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

function parseOrder(): string[] {
  const raw = getEnv("AI_PROVIDER_ORDER", "nvidia,openrouter,groq,openai");
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getProviderConfigs(): ProviderConfig[] {
  const order = parseOrder();
  const map: Record<string, ProviderConfig> = {
    nvidia: {
      name: "nvidia",
      baseUrl: getEnv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"),
      apiKey: getEnv("NVIDIA_API_KEY", ""),
      model: getEnv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct"),
    },
    openrouter: {
      name: "openrouter",
      baseUrl: getEnv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
      apiKey: getEnv("OPENROUTER_API_KEY", ""),
      model: getEnv("OPENROUTER_MODEL", "meta/llama-3.3-70b-instruct"),
    },
    groq: {
      name: "groq",
      baseUrl: getEnv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
      apiKey: getEnv("GROQ_API_KEY", ""),
      model: getEnv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    },
    openai: {
      name: "openai",
      baseUrl: getEnv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
      apiKey: getEnv("OPENAI_API_KEY", ""),
      model: getEnv("OPENAI_MODEL", "gpt-4o-mini"),
    },
  };
  return order
    .map((k) => map[k])
    .filter((p): p is ProviderConfig => Boolean(p && p.apiKey));
}

async function chatCompletion(
  cfg: ProviderConfig,
  messages: ChatMessage[],
  timeoutMs = 20000,
): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Provider ${cfg.name} failed: ${res.status}`);
    }
    const data: any = await res.json();
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      "";
    return typeof content === "string" ? content : JSON.stringify(content);
  } finally {
    clearTimeout(t);
  }
}

export async function completeWithFallback(
  messages: ChatMessage[],
): Promise<ProviderCompletion> {
  const configs = getProviderConfigs();
  const errors: unknown[] = [];
  for (const c of configs) {
    try {
      const content = await chatCompletion(c, messages);
      return { content, provider: c.name };
    } catch (e) {
      errors.push(e);
    }
  }
  const err = new Error("No AI providers available");
  (err as any).cause = errors;
  throw err;
}
