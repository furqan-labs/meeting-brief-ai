import { useState } from 'react';

interface TranscriptFormProps {
  onSubmit: (transcript: string, apiKey: string) => void;
  isLoading: boolean;
}

const PLACEHOLDER = `Alice: Let's lock the Q3 roadmap today. The dashboard redesign needs to ship before the conference.
Bob: I can have the designs ready by next Wednesday.
Alice: Great, and can you also loop in the QA team once staging is up?
Bob: Will do. I'll send the staging link by Friday.`;

export function TranscriptForm({ onSubmit, isLoading }: TranscriptFormProps) {
  const [transcript, setTranscript] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [touched, setTouched] = useState(false);

  const transcriptTooShort = transcript.trim().length > 0 && transcript.trim().length < 20;
  const keyLooksWrong = apiKey.length > 0 && !apiKey.startsWith('sk-ant-');
  const canSubmit = transcript.trim().length >= 20 && apiKey.startsWith('sk-ant-') && !isLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSubmit(transcript.trim(), apiKey.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-5">
      <div>
        <label htmlFor="transcript" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-text-muted">
          Meeting transcript
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={12}
          className="w-full resize-none rounded-md border border-panel-border bg-shell/60 p-3 font-mono text-[13px]
                     leading-relaxed text-text placeholder:text-text-muted/60 focus:outline-none focus:border-amber"
        />
        {touched && transcriptTooShort && (
          <p className="mt-1 text-xs text-rust">That's a bit short to summarize meaningfully — paste more of the conversation.</p>
        )}
      </div>

      <div>
        <label htmlFor="apiKey" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-text-muted">
          Your Anthropic API key
        </label>
        <div className="relative">
          <input
            id="apiKey"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full rounded-md border border-panel-border bg-shell/60 p-3 pr-16 font-mono text-[13px]
                       text-text placeholder:text-text-muted/60 focus:outline-none focus:border-amber"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-wide
                       text-text-muted hover:text-text"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        {touched && keyLooksWrong && (
          <p className="mt-1 text-xs text-rust">Anthropic keys start with "sk-ant-". Double-check you copied the whole thing.</p>
        )}
        <p className="mt-1.5 text-xs text-text-muted">
          Sent directly to your own request, never stored or logged. Get a key at{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-amber"
          >
            console.anthropic.com
          </a>
          .
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-auto rounded-md bg-amber py-2.5 font-semibold text-shell transition-opacity
                   hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? 'Generating brief…' : 'Generate brief'}
      </button>
    </form>
  );
}
