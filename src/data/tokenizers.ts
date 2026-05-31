/**
 * OpenAI Tokenizer Encodings & Model Mappings
 * Source: js-tiktoken (https://github.com/dqbd/tiktoken)
 * Last updated: 2026-05-31
 */

// ─── Encoding Names ───────────────────────────────────────────────────────────

export type EncodingName =
  | "gpt2"
  | "r50k_base"
  | "p50k_base"
  | "p50k_edit"
  | "cl100k_base"
  | "o200k_base";

export const ENCODINGS: EncodingName[] = [
  "gpt2",        // ~50k vocab – earliest GPT-2 models
  "r50k_base",   // ~50k vocab – GPT-3 (ada/babbage/curie/davinci) family
  "p50k_base",   // ~50k vocab – Codex + text-davinci-002/003
  "p50k_edit",   // ~50k vocab – edit-model variant (text-davinci-edit-001 etc.)
  "cl100k_base", // ~100k vocab – GPT-3.5-Turbo, GPT-4, text-embedding-3
  "o200k_base",  // ~200k vocab – GPT-4o, o1, o3, o4, GPT-4.1, GPT-5 family
];

// ─── Model → Encoding Map ─────────────────────────────────────────────────────

export type OpenAIModel = keyof typeof MODEL_TO_ENCODING;

export const MODEL_TO_ENCODING = {
  // ── gpt2 ──────────────────────────────────────────────────────────────────
  "gpt2": "gpt2",

  // ── r50k_base ─────────────────────────────────────────────────────────────
  "ada":                            "r50k_base",
  "babbage":                        "r50k_base",
  "babbage-002":                    "r50k_base",
  "code-search-ada-code-001":       "r50k_base",
  "code-search-babbage-code-001":   "r50k_base",
  "curie":                          "r50k_base",
  "davinci":                        "r50k_base",
  "text-ada-001":                   "r50k_base",
  "text-babbage-001":               "r50k_base",
  "text-curie-001":                 "r50k_base",
  "text-davinci-001":               "r50k_base",
  "text-search-ada-doc-001":        "r50k_base",
  "text-search-babbage-doc-001":    "r50k_base",
  "text-search-curie-doc-001":      "r50k_base",
  "text-search-davinci-doc-001":    "r50k_base",
  "text-similarity-ada-001":        "r50k_base",
  "text-similarity-babbage-001":    "r50k_base",
  "text-similarity-curie-001":      "r50k_base",
  "text-similarity-davinci-001":    "r50k_base",

  // ── p50k_base ─────────────────────────────────────────────────────────────
  "code-cushman-001":   "p50k_base",
  "code-cushman-002":   "p50k_base",
  "code-davinci-001":   "p50k_base",
  "code-davinci-002":   "p50k_base",
  "cushman-codex":      "p50k_base",
  "davinci-codex":      "p50k_base",
  "davinci-002":        "p50k_base",
  "text-davinci-002":   "p50k_base",
  "text-davinci-003":   "p50k_base",

  // ── p50k_edit ─────────────────────────────────────────────────────────────
  "code-davinci-edit-001":  "p50k_edit",
  "text-davinci-edit-001":  "p50k_edit",

  // ── cl100k_base ───────────────────────────────────────────────────────────
  "gpt-3.5-turbo":              "cl100k_base",
  "gpt-3.5-turbo-0301":        "cl100k_base",
  "gpt-3.5-turbo-0613":        "cl100k_base",
  "gpt-3.5-turbo-16k":         "cl100k_base",
  "gpt-3.5-turbo-16k-0613":    "cl100k_base",
  "gpt-3.5-turbo-1106":        "cl100k_base",
  "gpt-3.5-turbo-0125":        "cl100k_base",
  "gpt-3.5-turbo-instruct":    "cl100k_base",
  "gpt-3.5-turbo-instruct-0914": "cl100k_base",
  "gpt-35-turbo":               "cl100k_base",
  "gpt-4":                      "cl100k_base",
  "gpt-4-0314":                 "cl100k_base",
  "gpt-4-0613":                 "cl100k_base",
  "gpt-4-32k":                  "cl100k_base",
  "gpt-4-32k-0314":             "cl100k_base",
  "gpt-4-32k-0613":             "cl100k_base",
  "gpt-4-turbo":                "cl100k_base",
  "gpt-4-turbo-preview":        "cl100k_base",
  "gpt-4-turbo-2024-04-09":     "cl100k_base",
  "gpt-4-0125-preview":         "cl100k_base",
  "gpt-4-1106-preview":         "cl100k_base",
  "gpt-4-vision-preview":       "cl100k_base",
  "text-embedding-ada-002":     "cl100k_base",
  "text-embedding-3-small":     "cl100k_base",
  "text-embedding-3-large":     "cl100k_base",

  // ── o200k_base ────────────────────────────────────────────────────────────
  // GPT-4o
  "gpt-4o":                     "o200k_base",
  "gpt-4o-2024-05-13":          "o200k_base",
  "gpt-4o-2024-08-06":          "o200k_base",
  "gpt-4o-2024-11-20":          "o200k_base",
  "gpt-4o-mini":                "o200k_base",
  "gpt-4o-mini-2024-07-18":     "o200k_base",
  "chatgpt-4o-latest":          "o200k_base",
  // GPT-4o search / audio / realtime
  "gpt-4o-search-preview":                      "o200k_base",
  "gpt-4o-search-preview-2025-03-11":           "o200k_base",
  "gpt-4o-mini-search-preview":                 "o200k_base",
  "gpt-4o-mini-search-preview-2025-03-11":      "o200k_base",
  "gpt-4o-audio-preview":                       "o200k_base",
  "gpt-4o-audio-preview-2024-10-01":            "o200k_base",
  "gpt-4o-audio-preview-2024-12-17":            "o200k_base",
  "gpt-4o-mini-audio-preview":                  "o200k_base",
  "gpt-4o-mini-audio-preview-2024-12-17":       "o200k_base",
  "gpt-4o-realtime":                            "o200k_base",
  "gpt-4o-realtime-preview-2024-10-01":         "o200k_base",
  "gpt-4o-realtime-preview-2024-12-17":         "o200k_base",
  "gpt-4o-mini-realtime-preview":               "o200k_base",
  "gpt-4o-mini-realtime-preview-2024-12-17":    "o200k_base",
  // GPT-4.1 family
  "gpt-4.1":                    "o200k_base",
  "gpt-4.1-2025-04-14":         "o200k_base",
  "gpt-4.1-mini":               "o200k_base",
  "gpt-4.1-mini-2025-04-14":    "o200k_base",
  "gpt-4.1-nano":               "o200k_base",
  "gpt-4.1-nano-2025-04-14":    "o200k_base",
  // GPT-4.5
  "gpt-4.5-preview":            "o200k_base",
  "gpt-4.5-preview-2025-02-27": "o200k_base",
  // o1 family
  "o1":                         "o200k_base",
  "o1-2024-12-17":              "o200k_base",
  "o1-mini":                    "o200k_base",
  "o1-mini-2024-09-12":         "o200k_base",
  "o1-preview":                 "o200k_base",
  "o1-preview-2024-09-12":      "o200k_base",
  "o1-pro":                     "o200k_base",
  "o1-pro-2025-03-19":          "o200k_base",
  // o3 family
  "o3":                         "o200k_base",
  "o3-2025-04-16":              "o200k_base",
  "o3-mini":                    "o200k_base",
  "o3-mini-2025-01-31":         "o200k_base",
  // o4 family
  "o4-mini":                    "o200k_base",
  "o4-mini-2025-04-16":         "o200k_base",
  // GPT-5 family
  "gpt-5":                      "o200k_base",
  "gpt-5-2025-08-07":           "o200k_base",
  "gpt-5-nano":                 "o200k_base",
  "gpt-5-nano-2025-08-07":      "o200k_base",
  "gpt-5-mini":                 "o200k_base",
  "gpt-5-mini-2025-08-07":      "o200k_base",
  "gpt-5-chat-latest":          "o200k_base",
} as const satisfies Record<string, EncodingName>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the encoding name for a given model, or undefined if unknown. */
export function getEncodingForModel(model: string): EncodingName | undefined {
  return (MODEL_TO_ENCODING as Record<string, EncodingName>)[model];
}

/** Returns all model names that use a given encoding. */
export function getModelsForEncoding(encoding: EncodingName): OpenAIModel[] {
  return (Object.entries(MODEL_TO_ENCODING) as [OpenAIModel, EncodingName][])
    .filter(([, enc]) => enc === encoding)
    .map(([model]) => model);
}

/** Groups models by their encoding. */
export const MODELS_BY_ENCODING: Record<EncodingName, OpenAIModel[]> =
  ENCODINGS.reduce(
    (acc, enc) => ({ ...acc, [enc]: getModelsForEncoding(enc) }),
    {} as Record<EncodingName, OpenAIModel[]>
  );

