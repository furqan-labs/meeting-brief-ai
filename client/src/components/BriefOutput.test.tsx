import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BriefOutput } from './BriefOutput';
import type { MeetingBrief } from '../types';

const sampleBrief: MeetingBrief = {
  summary: 'The team agreed to ship the dashboard redesign before the conference.',
  actionItems: [
    { task: 'Finalize designs', owner: 'Bob', dueDate: 'Wednesday' },
    { task: 'Loop in QA', owner: null, dueDate: null },
  ],
  followUpEmail: 'Hi team, thanks for the meeting today...',
};

describe('BriefOutput', () => {
  it('shows an empty state when there is no brief yet', () => {
    render(<BriefOutput brief={null} isLoading={false} error={null} />);
    expect(screen.getByText(/no brief yet/i)).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    render(<BriefOutput brief={null} isLoading={true} error={null} />);
    expect(screen.getByText(/reading the transcript/i)).toBeInTheDocument();
  });

  it('shows an error state', () => {
    render(<BriefOutput brief={null} isLoading={false} error="Invalid API key." />);
    expect(screen.getByText(/invalid api key/i)).toBeInTheDocument();
  });

  it('renders the summary, action items, and follow-up email when a brief is present', () => {
    render(<BriefOutput brief={sampleBrief} isLoading={false} error={null} />);

    expect(screen.getByText(/ship the dashboard redesign/i)).toBeInTheDocument();
    expect(screen.getByText(/finalize designs/i)).toBeInTheDocument();
    expect(screen.getByText(/loop in qa/i)).toBeInTheDocument();
    expect(screen.getByText(/thanks for the meeting today/i)).toBeInTheDocument();
  });

  it('shows a fallback message when there are no action items', () => {
    const noActions: MeetingBrief = { ...sampleBrief, actionItems: [] };
    render(<BriefOutput brief={noActions} isLoading={false} error={null} />);
    expect(screen.getByText(/no concrete action items/i)).toBeInTheDocument();
  });

  it('shows a "Sample" stamp instead of "AI Generated" when isSample is true', () => {
    render(<BriefOutput brief={sampleBrief} isLoading={false} error={null} isSample />);
    expect(screen.getByText(/sample — no api call/i)).toBeInTheDocument();
    expect(screen.queryByText(/^ai generated$/i)).not.toBeInTheDocument();
  });
});
