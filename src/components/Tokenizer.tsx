import { useState, useMemo, useRef, useCallback, type DragEvent } from "react";
import { getEncoding, encodingForModel } from "js-tiktoken";
import {
  ENCODINGS,
  MODELS_BY_ENCODING,
  MODEL_CONTEXT_WINDOWS,
  type EncodingName,
  type OpenAIModel,
} from "../data/tokenizers";
import { useDebounce } from "../hooks/useDebounce";
import "./Tokenizer.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectValue = EncodingName | OpenAIModel;

interface Stats {
  tokenCount: number;
  charCount: number;
  wordCount: number;
  lineCount: number;
  avgCharsPerToken: number;
  avgTokensPerWord: number;
  encoding: EncodingName;
  contextWindow: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEncoding(value: SelectValue): value is EncodingName {
  return (ENCODINGS as readonly string[]).includes(value);
}

function tokenize(text: string, value: SelectValue): Stats {
  const enc = isEncoding(value)
    ? getEncoding(value)
    : encodingForModel(value as OpenAIModel);

  const tokens = enc.encode(text);
  const tokenCount = tokens.length;
  const charCount = text.length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const lineCount = text === "" ? 0 : text.split("\n").length;

  // Determine the actual encoding name used
  const resolvedEncoding: EncodingName = isEncoding(value)
    ? value
    : (ENCODINGS.find((e) =>
        (MODELS_BY_ENCODING[e] as readonly string[]).includes(value)
      ) ?? "cl100k_base");

  const contextWindow = MODEL_CONTEXT_WINDOWS[value] ?? null;

  return {
    tokenCount,
    charCount,
    wordCount,
    lineCount,
    avgCharsPerToken: tokenCount === 0 ? 0 : parseFloat((charCount / tokenCount).toFixed(2)),
    avgTokensPerWord: wordCount === 0 ? 0 : parseFloat((tokenCount / wordCount).toFixed(2)),
    encoding: resolvedEncoding,
    contextWindow,
  };
}

// ─── Curated select groups ────────────────────────────────────────────────────
//
// Encoding groups run newest → oldest.
// Within each group, flagship / most-used models come first; dated snapshots
// and niche variants are pushed to the end.

interface SelectGroup {
  encoding: EncodingName;
  label: string;
  /** Models shown first, in this exact order. The rest follow alphabetically. */
  priority: string[];
}

const SELECT_GROUPS: SelectGroup[] = [
  {
    encoding: "o200k_base",
    label: "Latest  ·  o200k_base",
    priority: [
      // GPT-4o
      "gpt-4o",
      "gpt-4o-mini",
      // Reasoning
      "o4-mini",
      "o3",
      "o3-mini",
      "o1-pro",
      "o1",
      "o1-mini",
      "o1-preview",
      // GPT-4.1 family
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      // GPT-5 family
      "gpt-5",
      "gpt-5-mini",
      "gpt-5-nano",
      // Misc current
      "chatgpt-4o-latest",
      "gpt-4.5-preview",
    ],
  },
  {
    encoding: "cl100k_base",
    label: "GPT-4 / Embeddings  ·  cl100k_base",
    priority: [
      "gpt-4-turbo",
      "gpt-4",
      "gpt-4-32k",
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-instruct",
      "text-embedding-3-large",
      "text-embedding-3-small",
      "text-embedding-ada-002",
    ],
  },
  {
    encoding: "p50k_base",
    label: "Codex / Davinci  ·  p50k_base",
    priority: [
      "text-davinci-003",
      "text-davinci-002",
      "code-davinci-002",
      "code-cushman-002",
    ],
  },
  {
    encoding: "p50k_edit",
    label: "Edit models  ·  p50k_edit",
    priority: [
      "text-davinci-edit-001",
      "code-davinci-edit-001",
    ],
  },
  {
    encoding: "r50k_base",
    label: "GPT-3  ·  r50k_base",
    priority: [
      "davinci",
      "curie",
      "babbage",
      "ada",
      "text-davinci-001",
      "text-curie-001",
      "text-babbage-001",
      "text-ada-001",
    ],
  },
  {
    encoding: "gpt2",
    label: "GPT-2  ·  gpt2",
    priority: ["gpt2"],
  },
];

/** Sorts a model list: priority items first (in order), rest alphabetically. */
function sortModels(models: readonly string[], priority: string[]): string[] {
  const prioritySet = new Set(priority);
  const rest = [...models]
    .filter((m) => !prioritySet.has(m))
    .sort((a, b) => a.localeCompare(b));
  const head = priority.filter((m) => (models as string[]).includes(m));
  return [...head, ...rest];
}

const ACCEPTED_EXTENSIONS =
  ".txt,.md,.mdx,.markdown,.json,.jsonl,.csv,.tsv,.yaml,.yml,.toml,.xml,.html,.htm,.js,.ts,.jsx,.tsx,.py,.rb,.go,.rs,.java,.c,.cpp,.h,.cs,.sh,.bash,.zsh,.env,.log";

const DEFAULT_VALUE: SelectValue = "gpt-4o";

const Tokenizer = () => {
  const [prompt, setPrompt] = useState("");
  const [selected, setSelected] = useState<SelectValue>(DEFAULT_VALUE);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedPrompt = useDebounce(prompt, 300);

  const loadFile = useCallback((file: File) => {
    setFileError(null);
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File is too large (max 5 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setPrompt(text);
        setFileName(file.name);
      }
    };
    reader.onerror = () => setFileError("Failed to read file.");
    reader.readAsText(file);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
      // reset so the same file can be re-selected
      e.target.value = "";
    },
    [loadFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const clearFile = useCallback(() => {
    setPrompt("");
    setFileName(null);
    setFileError(null);
  }, []);

  const stats = useMemo<Stats | null>(() => {
    if (debouncedPrompt.trim() === "") return null;
    try {
      return tokenize(debouncedPrompt, selected);
    } catch {
      return null;
    }
  }, [debouncedPrompt, selected]);

  return (
    <div className="tokenizer">
      {/* ── File drop zone ── */}
      <div className="tk-field">
        <span className="tk-label">File</span>
        <div
          className={`tk-dropzone${isDragging ? " tk-dropzone--active" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload a file"
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="tk-file-input"
            onChange={handleFileInput}
            tabIndex={-1}
          />
          {fileName ? (
            <div className="tk-file-loaded">
              <span className="tk-file-icon">📄</span>
              <span className="tk-file-name">{fileName}</span>
              <button
                type="button"
                className="tk-file-clear"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="tk-dropzone-hint">
              <span className="tk-upload-icon">↑</span>
              <span>Drop a file here or <strong>click to browse</strong></span>
              <span className="tk-file-types">txt · md · json · py · ts · and more</span>
            </div>
          )}
        </div>
        {fileError && <span className="tk-file-error">{fileError}</span>}
      </div>

      {/* ── Prompt textarea ── */}
      <div className="tk-field">
        <label htmlFor="tk-prompt" className="tk-label">
          Prompt
        </label>
        <textarea
          id="tk-prompt"
          className="tk-textarea"
          rows={7}
          placeholder="…or paste / type your prompt here"
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setFileName(null); }}
          spellCheck={false}
        />
        <span className="tk-char-hint">{prompt.length.toLocaleString()} chars</span>
      </div>

      {/* ── Model / encoding select ── */}
      <div className="tk-field">
        <label htmlFor="tk-model" className="tk-label">
          Model / Encoding
        </label>
        <select
          id="tk-model"
          className="tk-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value as SelectValue)}
        >
          {SELECT_GROUPS.map(({ encoding, label, priority }) => (
            <optgroup key={encoding} label={label}>
              <option value={encoding}>{encoding} (raw encoding)</option>
              {sortModels(MODELS_BY_ENCODING[encoding], priority).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* ── Stats output ── */}
      <div className="tk-stats" aria-live="polite">
        {stats === null ? (
          <p className="tk-empty">Enter a prompt to see token stats.</p>
        ) : (
          <dl className="tk-dl">
            <StatItem label="Tokens"         value={stats.tokenCount.toLocaleString()} highlight />
            <StatItem label="Characters"     value={stats.charCount.toLocaleString()} />
            <StatItem label="Words"          value={stats.wordCount.toLocaleString()} />
            <StatItem label="Lines"          value={stats.lineCount.toLocaleString()} />
            <StatItem label="Tokens / word"  value={stats.avgTokensPerWord.toString()} />
            <StatItem label="Chars / token"  value={stats.avgCharsPerToken.toString()} />
            <StatItem label="Encoding"       value={stats.encoding} />
          </dl>
        )}
      </div>

      {/* ── Context window ── */}
      {stats !== null && stats.contextWindow !== null && (
        <ContextBar used={stats.tokenCount} total={stats.contextWindow} />
      )}
    </div>
  );
};

// ─── Sub-component ────────────────────────────────────────────────────────────

interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatItem = ({ label, value, highlight }: StatItemProps) => (
  <div className={`tk-stat${highlight ? " tk-stat--highlight" : ""}`}>
    <dt className="tk-stat-label">{label}</dt>
    <dd className="tk-stat-value">{value}</dd>
  </div>
);

// ─── Context bar ──────────────────────────────────────────────────────────────

interface ContextBarProps {
  used: number;
  total: number;
}

const ContextBar = ({ used, total }: ContextBarProps) => {
  const pct = Math.min((used / total) * 100, 100);
  const danger = pct >= 90;
  const warn  = pct >= 70;
  const label = `${used.toLocaleString()} / ${total.toLocaleString()} tokens (${pct.toFixed(1)}%)`;

  return (
    <div className="tk-ctx">
      <div className="tk-ctx-header">
        <span className="tk-ctx-label">Context window</span>
        <span className={`tk-ctx-pct${danger ? " tk-ctx-pct--danger" : warn ? " tk-ctx-pct--warn" : ""}`}>
          {label}
        </span>
      </div>
      <div className="tk-ctx-track">
        <div
          className={`tk-ctx-fill${danger ? " tk-ctx-fill--danger" : warn ? " tk-ctx-fill--warn" : ""}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label}
        />
      </div>
    </div>
  );
};

export default Tokenizer;