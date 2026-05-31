# tokenizor-gui

A fast, browser-based token counter for OpenAI models — built with React, TypeScript, and [js-tiktoken](https://github.com/dqbd/tiktoken).

---

## Features

- **Prompt input** — type or paste any text directly into the editor
- **File upload** — drag & drop or click to browse; supports `.txt`, `.md`, `.json`, `.py`, `.ts`, and [many more](#supported-file-types)
- **Model / encoding selector** — grouped by encoding, flagship models sorted to the top
- **Live stats** — token count, character count, word count, line count, and chars-per-token ratio, computed with a 300 ms debounce so it never blocks typing
- **~100 OpenAI models** covered across all 6 tiktoken encodings (`gpt2`, `r50k_base`, `p50k_base`, `p50k_edit`, `cl100k_base`, `o200k_base`)

---

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
pnpm build
pnpm preview
```

---

## Supported encodings

| Encoding | Vocab size | Models |
|---|---|---|
| `o200k_base` | ~200k | GPT-4o, o1, o3, o4, GPT-4.1, GPT-5 family |
| `cl100k_base` | ~100k | GPT-4, GPT-3.5-Turbo, text-embedding-3 |
| `p50k_base` | ~50k | Codex, text-davinci-002/003 |
| `p50k_edit` | ~50k | text-davinci-edit-001, code-davinci-edit-001 |
| `r50k_base` | ~50k | GPT-3 (ada / babbage / curie / davinci) |
| `gpt2` | ~50k | GPT-2 |

---

## Supported file types

`.txt` `.md` `.mdx` `.markdown` `.json` `.jsonl` `.csv` `.tsv` `.yaml` `.yml` `.toml` `.xml` `.html` `.htm` `.js` `.ts` `.jsx` `.tsx` `.py` `.rb` `.go` `.rs` `.java` `.c` `.cpp` `.h` `.cs` `.sh` `.bash` `.zsh` `.env` `.log`

Max file size: **5 MB**.

---

## Project structure

```
src/
├── components/
│   ├── Tokenizer.tsx   # Main tokenizer UI component
│   └── Tokenizer.css   # Component styles
├── data/
│   └── tokenizers.ts   # All encodings, model→encoding map, and helpers
├── hooks/
│   └── useDebounce.ts  # Generic debounce hook
├── App.tsx
└── main.tsx
```

---

## Stack

- [React 19](https://react.dev/) with the React Compiler enabled
- [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [js-tiktoken](https://github.com/dqbd/tiktoken) — pure-JS port of OpenAI's tiktoken
- [pnpm](https://pnpm.io/)
