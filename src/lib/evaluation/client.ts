import type { AssessmentAnswers, EvaluationResult } from "@/types/assessment";
import { ANS_SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import { parseEvaluationResult } from "./parse";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_BASE_URL = "https://api.302ai.cn/v1";
const SERVICE_UNAVAILABLE = "AI evaluation service unavailable";

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function isDev() {
  return process.env.NODE_ENV === "development";
}

/**
 * Normalize base URL to .../v1 without duplicating /v1.
 * Examples:
 *   https://api.302ai.cn     → https://api.302ai.cn/v1
 *   https://api.302ai.cn/v1  → https://api.302ai.cn/v1
 *   https://api.302ai.cn/v1/ → https://api.302ai.cn/v1
 */
function normalizeBaseUrl(raw: string): string {
  if (/^sk-/i.test(raw) || !/^https?:\/\//i.test(raw)) {
    throw new Error("Invalid 302 API base URL");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error("Invalid 302 API base URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Invalid 302 API base URL");
  }

  let path = parsed.pathname.replace(/\/+$/, "");
  if (!path || path === "/") {
    path = "/v1";
  } else if (!path.endsWith("/v1")) {
    // Keep custom paths, but ensure OpenAI-compatible /v1 when only host given.
    if (!path.includes("/v1")) {
      path = `${path}/v1`.replace(/\/{2,}/g, "/");
    }
  }

  // Collapse accidental /v1/v1
  path = path.replace(/(\/v1)+$/g, "/v1");

  return `${parsed.origin}${path}`;
}

/**
 * Resolve 302.AI config without swapping key and base URL.
 * 302_API_KEY  → Bearer token (sk-...)
 * 302_BASE_URL → API base (https://api.302ai.cn/v1)
 */
function get302Config() {
  const apiKey = readEnv("302_API_KEY", "ANS_302_API_KEY");
  const baseUrlRaw =
    readEnv("302_BASE_URL", "ANS_302_BASE_URL") || DEFAULT_BASE_URL;
  const model = readEnv("302_MODEL", "ANS_302_MODEL") || "gpt-5-mini";

  if (!apiKey) {
    throw new Error("Missing 302 API key");
  }

  if (/^https?:\/\//i.test(apiKey)) {
    throw new Error("Invalid 302 API base URL");
  }

  const baseUrl = normalizeBaseUrl(baseUrlRaw);

  if (isDev()) {
    console.log("[302 config] BASE_URL loaded:", Boolean(baseUrlRaw));
    console.log("[302 config] BASE_URL value:", baseUrl);
    console.log("[302 config] MODEL loaded:", Boolean(model));
    console.log("[302 config] MODEL value:", model);
    console.log("[302 config] API_KEY loaded:", Boolean(apiKey));
  }

  return { apiKey, baseUrl, model };
}

async function callChatCompletions(options: {
  endpoint: string;
  apiKey: string;
  model: string;
  answers: AssessmentAnswers;
}): Promise<string> {
  const { endpoint, apiKey, model, answers } = options;

  if (isDev()) {
    console.log("[302 request] endpoint:", endpoint);
    console.log("[302 request] model:", model);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: ANS_SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(answers) },
        ],
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (error) {
    if (isDev()) {
      const cause = (error as Error & { cause?: { code?: string } }).cause;
      console.error(
        "[302 request] fetch failed:",
        cause?.code || (error instanceof Error ? error.message : "unknown"),
      );
    }
    throw new Error(SERVICE_UNAVAILABLE);
  }

  let payload: ChatCompletionResponse;
  try {
    payload = (await response.json()) as ChatCompletionResponse;
  } catch {
    throw new Error(SERVICE_UNAVAILABLE);
  }

  if (!response.ok) {
    const message =
      payload.error?.message || `302.AI request failed (${response.status})`;
    throw new Error(message);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from 302.AI.");
  }

  return content;
}

export async function evaluateWith302(
  answers: AssessmentAnswers,
  _locale: "en" | "zh",
): Promise<EvaluationResult> {
  const { apiKey, baseUrl, model } = get302Config();
  const endpoint = `${baseUrl}/chat/completions`;

  // Guard against /v1/v1/chat/completions
  const safeEndpoint = endpoint.replace(/\/v1\/v1\//g, "/v1/");

  try {
    const content = await callChatCompletions({
      endpoint: safeEndpoint,
      apiKey,
      model,
      answers,
    });
    return parseEvaluationResult(content);
  } catch (error) {
    // If international node times out, retry once with China node.
    if (
      error instanceof Error &&
      error.message === SERVICE_UNAVAILABLE &&
      baseUrl.includes("api.302.ai")
    ) {
      const fallbackBase = normalizeBaseUrl("https://api.302ai.cn/v1");
      const fallbackEndpoint = `${fallbackBase}/chat/completions`;
      if (isDev()) {
        console.log("[302 request] retrying with China node:", fallbackEndpoint);
      }
      const content = await callChatCompletions({
        endpoint: fallbackEndpoint,
        apiKey,
        model,
        answers,
      });
      return parseEvaluationResult(content);
    }
    throw error;
  }
}
