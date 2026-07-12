import { useState } from 'react';
import { TranscriptForm } from './components/TranscriptForm';
import { BriefOutput } from './components/BriefOutput';
import { analyzeTranscript, ApiRequestError } from './lib/api';
import { SAMPLE_BRIEF } from './lib/sampleData';
import type { MeetingBrief } from './types';

function App() {
  const [brief, setBrief] = useState<MeetingBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);

  async function handleSubmit(transcript: string, apiKey: string) {
    setIsLoading(true);
    setError(null);
    setBrief(null);
    setIsSample(false);

    try {
      const result = await analyzeTranscript(transcript, apiKey);
      setBrief(result);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Could not reach the server. Is the backend running?');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleShowSample() {
    setError(null);
    setIsLoading(false);
    setBrief(SAMPLE_BRIEF);
    setIsSample(true);
  }

  return (
    <div className="grid-backdrop min-h-screen">
      <header className="mx-auto max-w-6xl px-6 pt-10 sm:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
          Meeting Brief AI
        </p>
        <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Turn a transcript into a brief
        </h1>
        <p className="mt-2 max-w-lg text-sm text-text-muted">
          Paste a raw meeting transcript. Claude reads it and produces a summary,
          action items with owners, and a ready-to-send follow-up email.
        </p>
        <button
          type="button"
          onClick={handleShowSample}
          className="mt-3 rounded-md border border-panel-border px-3 py-1.5 font-mono text-xs uppercase
                     tracking-wider text-text-muted transition-colors hover:border-amber hover:text-amber"
        >
          See a sample result — no API key needed
        </button>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:px-10 lg:grid-cols-2">
        <section className="rounded-lg border border-panel-border bg-panel p-5">
          <TranscriptForm onSubmit={handleSubmit} isLoading={isLoading} />
        </section>

        <section className="min-h-[24rem]">
          <BriefOutput brief={brief} isLoading={isLoading} error={error} isSample={isSample} />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Your API key is sent directly with your request and never stored on the server.
        </p>
      </footer>
    </div>
  );
}

export default App;
