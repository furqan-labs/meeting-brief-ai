import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { SAMPLE_BRIEF } from './lib/sampleData';

describe('App — sample mode', () => {
  it('shows the empty state before any interaction', () => {
    render(<App />);
    expect(screen.getByText(/no brief yet/i)).toBeInTheDocument();
  });

  it('renders the sample brief when "See a sample result" is clicked, without calling the API', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /see a sample result/i }));

    expect(screen.getByText(SAMPLE_BRIEF.actionItems[0].task, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/sample — no api call/i)).toBeInTheDocument();
  });
});
