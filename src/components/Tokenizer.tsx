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
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  ListSubheader,
  FormControl,
  InputLabel,
  LinearProgress,
  Stack,
  Chip,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";

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

interface SelectGroup {
  encoding: EncodingName;
  label: string;
  priority: string[];
}

const SELECT_GROUPS: SelectGroup[] = [
  {
    encoding: "o200k_base",
    label: "Latest  ·  o200k_base",
    priority: [
      "gpt-4o", "gpt-4o-mini", "o4-mini", "o3", "o3-mini", "o1-pro", "o1",
      "o1-mini", "o1-preview", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano",
      "gpt-5", "gpt-5-mini", "gpt-5-nano", "chatgpt-4o-latest", "gpt-4.5-preview",
    ],
  },
  {
    encoding: "cl100k_base",
    label: "GPT-4 / Embeddings  ·  cl100k_base",
    priority: [
      "gpt-4-turbo", "gpt-4", "gpt-4-32k", "gpt-3.5-turbo",
      "gpt-3.5-turbo-instruct", "text-embedding-3-large",
      "text-embedding-3-small", "text-embedding-ada-002",
    ],
  },
  {
    encoding: "p50k_base",
    label: "Codex / Davinci  ·  p50k_base",
    priority: ["text-davinci-003", "text-davinci-002", "code-davinci-002", "code-cushman-002"],
  },
  {
    encoding: "p50k_edit",
    label: "Edit models  ·  p50k_edit",
    priority: ["text-davinci-edit-001", "code-davinci-edit-001"],
  },
  {
    encoding: "r50k_base",
    label: "GPT-3  ·  r50k_base",
    priority: ["davinci", "curie", "babbage", "ada", "text-davinci-001", "text-curie-001", "text-babbage-001", "text-ada-001"],
  },
  {
    encoding: "gpt2",
    label: "GPT-2  ·  gpt2",
    priority: ["gpt2"],
  },
];

function sortModels(models: readonly string[], priority: string[]): string[] {
  const prioritySet = new Set(priority);
  const rest = [...models].filter((m) => !prioritySet.has(m)).sort((a, b) => a.localeCompare(b));
  const head = priority.filter((m) => (models as string[]).includes(m));
  return [...head, ...rest];
}

const ACCEPTED_EXTENSIONS =
  ".txt,.md,.mdx,.markdown,.json,.jsonl,.csv,.tsv,.yaml,.yml,.toml,.xml,.html,.htm,.js,.ts,.jsx,.tsx,.py,.rb,.go,.rs,.java,.c,.cpp,.h,.cs,.sh,.bash,.zsh,.env,.log";

const DEFAULT_VALUE: SelectValue = "gpt-5";

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatItem = ({ label, value, highlight }: StatItemProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      textAlign: "center",
      borderColor: highlight ? "primary.main" : "divider",
      bgcolor: highlight ? "primary.main" : "background.paper",
      flex: "1 1 120px",
      minWidth: 100,
    }}
  >
    <Typography
      variant="h5"
      sx={{ fontWeight: 700, color: highlight ? "primary.contrastText" : "text.primary" }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{ color: highlight ? "primary.contrastText" : "text.secondary", opacity: highlight ? 0.85 : 1 }}
    >
      {label}
    </Typography>
  </Paper>
);

// ─── Context Bar ──────────────────────────────────────────────────────────────

interface ContextBarProps {
  used: number;
  total: number;
}

const ContextBar = ({ used, total }: ContextBarProps) => {
  const pct = Math.min((used / total) * 100, 100);
  const danger = pct >= 90;
  const warn = pct >= 70;
  const color = danger ? "error" : warn ? "warning" : "primary";
  const label = `${used.toLocaleString()} / ${total.toLocaleString()} tokens (${pct.toFixed(1)}%)`;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Context window
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: danger ? "error.main" : warn ? "warning.main" : "text.primary" }}
        >
          {label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
        aria-label={label}
      />
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

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
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* ── File drop zone ── */}
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, fontWeight: 500 }}>
          File
        </Typography>
        <Paper
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          aria-label="Upload a file"
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          sx={{
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            borderStyle: "dashed",
            borderColor: isDragging ? "primary.main" : "divider",
            bgcolor: isDragging ? "action.hover" : "background.paper",
            transition: "border-color 0.2s, background-color 0.2s",
            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            style={{ display: "none" }}
            onChange={handleFileInput}
            tabIndex={-1}
          />
          {fileName ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <InsertDriveFileIcon color="primary" />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {fileName}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                aria-label="Remove file"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <UploadFileIcon sx={{ fontSize: 36, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Drop a file here or <strong>click to browse</strong>
              </Typography>
              <Typography variant="caption" color="text.disabled">
                txt · md · json · py · ts · and more
              </Typography>
            </Box>
          )}
        </Paper>
        {fileError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {fileError}
          </Alert>
        )}
      </Box>

      {/* ── Prompt textarea ── */}
      <Box>
        <TextField
          id="tk-prompt"
          label="Prompt"
          multiline
          rows={7}
          fullWidth
          placeholder="…or paste / type your prompt here"
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setFileName(null); }}
          slotProps={{ htmlInput: { spellCheck: false } }}
          helperText={`${prompt.length.toLocaleString()} chars`}
        />
      </Box>

      {/* ── Model / encoding select ── */}
      <FormControl fullWidth>
        <InputLabel id="tk-model-label">Model / Encoding</InputLabel>
        <Select
          labelId="tk-model-label"
          id="tk-model"
          value={selected}
          label="Model / Encoding"
          onChange={(e) => setSelected(e.target.value as SelectValue)}
          MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360 } } } }}
        >
          {SELECT_GROUPS.map(({ encoding, label, priority }) => [
            <ListSubheader key={`header-${encoding}`}>{label}</ListSubheader>,
            <MenuItem key={encoding} value={encoding}>
              <em>{encoding} (raw encoding)</em>
            </MenuItem>,
            ...sortModels(MODELS_BY_ENCODING[encoding], priority).map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>

      {/* ── Stats output ── */}
      <Box aria-live="polite">
        {stats === null ? (
          <Typography variant="body2" color="text.disabled" sx={{ textAlign: "center", py: 2 }}>
            Enter a prompt to see token stats.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <StatItem label="Tokens"        value={stats.tokenCount.toLocaleString()} highlight />
              <StatItem label="Characters"    value={stats.charCount.toLocaleString()} />
              <StatItem label="Words"         value={stats.wordCount.toLocaleString()} />
              <StatItem label="Lines"         value={stats.lineCount.toLocaleString()} />
              <StatItem label="Tokens / word" value={stats.avgTokensPerWord.toString()} />
              <StatItem label="Chars / token" value={stats.avgCharsPerToken.toString()} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Encoding:</Typography>
              <Chip label={stats.encoding} size="small" variant="outlined" />
            </Box>
          </Stack>
        )}
      </Box>

      {/* ── Context window ── */}
      {stats !== null && stats.contextWindow !== null && (
        <>
          <Divider />
          <ContextBar used={stats.tokenCount} total={stats.contextWindow} />
        </>
      )}
    </Stack>
  );
};

export default Tokenizer;