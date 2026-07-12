import { useState } from 'react';
import type { MeetingBrief } from '../types';

interface BriefOutputProps {
  brief: MeetingBrief | null;
  isLoading: boolean;
  error: string | null;
  isSample?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in insecure contexts or if permission is denied;
      // the email text is still selectable manually, so this is a soft failure.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink hover:underline"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function BriefOutput({ brief, isLoading, error, isSample = false }: BriefOutputProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-panel-border">
        <p className="font-mono text-sm text-text-muted">Reading the transcript…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-rust/40 bg-rust/5 p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-rust">Something went wrong</p>
        <p className="max-w-xs text-sm text-text-muted">{error}</p>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-panel-border p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-text-muted">No brief yet</p>
        <p className="max-w-xs text-sm text-text-muted">
          Paste a transcript and your API key, then generate a brief to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="paper-grain relative rounded-md border border-paper-border bg-paper p-6 text-ink shadow-lg">
      <div className="stamp absolute -right-2 -top-3 rounded border-2 border-dashed border-rust/70 px-2 py-1">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-rust">
          {isSample ? 'Sample — no API call' : 'AI Generated'}
        </span>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">Meeting Brief</p>
      <h2 className="mt-1 font-serif text-2xl font-semibold leading-tight">Summary</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/90">{brief.summary}</p>

      <div className="mt-6 border-t border-dashed border-paper-border pt-4">
        <h3 className="font-serif text-lg font-semibold">Action items</h3>
        {brief.actionItems.length === 0 ? (
          <p className="mt-2 text-sm italic text-ink-muted">No concrete action items were mentioned.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {brief.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-sm border border-ink-muted" aria-hidden />
                <span>
                  {item.task}
                  {(item.owner || item.dueDate) && (
                    <span className="ml-1.5 font-mono text-[11px] text-ink-muted">
                      {item.owner && `— ${item.owner}`}
                      {item.owner && item.dueDate && ' · '}
                      {item.dueDate}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 border-t border-dashed border-paper-border pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">Follow-up email</h3>
          <CopyButton text={brief.followUpEmail} />
        </div>
        <pre className="mt-2 whitespace-pre-wrap rounded bg-ink/[0.03] p-3 font-sans text-sm leading-relaxed text-ink/90">
          {brief.followUpEmail}
        </pre>
      </div>
    </div>
  );
}
