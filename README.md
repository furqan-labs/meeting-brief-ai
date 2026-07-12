# Meeting Brief AI

Paste a raw meeting transcript, get back a structured brief: a plain-language summary, action items with owners and due dates, and a ready-to-send follow-up email. Built to demonstrate a real full-stack + LLM integration — not a toy demo with mocked data.

## How it works

1. You paste a transcript and your own Anthropic API key into the client.
2. The client sends both to a small Express backend.
3. The backend calls Claude with a prompt that asks for structured JSON output, validates the response against a schema, and returns it.
4. The client renders the result as a "memo" — summary, checkable action items, and a copyable email draft.

Your API key is never stored, logged, or written to disk anywhere in this project — it's forwarded directly with your request and used once.

## Trying it without an API key

Click **"See a sample result"** on the page — it shows a realistic example (a full summary, action items, and follow-up email) instantly, with no API call and no key required. It's clearly labeled as a static sample. To generate a brief from your own transcript, you'll need an Anthropic API key, since that part does make a real, live call.

## Why a backend at all?

Anthropic's API doesn't allow direct browser calls (no CORS support), so a thin server is required to proxy the request. That server also validates input, rate-limits requests, and translates upstream errors (bad key, rate limit, malformed response) into clean messages instead of leaking raw API errors to the client.

## Tech stack

**Backend:** Node.js, Express, TypeScript, Zod, Vitest + Supertest
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Vitest + Testing Library

## Project structure

```
server/
  src/
    routes/analyze.ts        POST /api/analyze — validates input, calls Claude, returns a brief
    utils/anthropicClient.ts Thin wrapper around the Claude Messages API
    utils/brief.ts           Prompt building + response parsing (pure functions, fully unit tested)
    utils/validation.ts      Request body schema (Zod)
  tests/                     22 tests: prompt/parsing logic, validation, and the route with a mocked Claude client

client/
  src/
    components/TranscriptForm.tsx   Transcript + API key input
    components/BriefOutput.tsx      Renders the generated brief
    lib/api.ts                      Backend API client
  src/components/*.test.tsx         11 tests covering form validation and output rendering
```

## Getting started

You'll need an Anthropic API key from [console.anthropic.com](https://console.anthropic.com/settings/keys) to actually generate a brief (the app runs fine without one — you just won't get a result back).

```bash
npm run install:all   # installs both server and client dependencies
npm run dev            # runs server (port 4000) and client (port 5173) together
```

Then open `http://localhost:5173`, paste a transcript, paste your API key, and generate a brief.

Run everything individually instead, if you prefer two terminals:

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Testing

```bash
npm test   # runs both server and client test suites (36 tests total)
```

The backend tests never make a real network call — the Claude client is mocked in `tests/analyze.test.ts`, so the suite runs fully offline and doesn't need an API key.

## Design notes

The interface deliberately looks like two different things at once: a dark technical tool on the left (where you do the work) and a printed memo on the right (what you get back) — reinforcing that the output is a real deliverable, not just another UI panel. The "AI Generated" stamp on the memo is an honest disclosure, not a decoration.

On the backend, prompt construction and response parsing are pure functions with no dependency on Express or the network. That's what makes it possible to unit test "does this prompt produce the right shape of output" independently of "does the HTTP call work" — the same pattern used in the other projects in this portfolio.

## Possible extensions

- Persist brief history per session (currently stateless)
- Support file upload for transcripts (e.g. a `.vtt` or `.srt` export from a video call)
- Streaming responses instead of waiting for the full generation
- Support for other providers (OpenAI, etc.) behind the same interface

## License

MIT
