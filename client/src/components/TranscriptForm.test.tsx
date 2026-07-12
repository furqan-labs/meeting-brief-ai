import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranscriptForm } from './TranscriptForm';

const validTranscript = 'Alice: We need to finalize the budget by Friday. Bob: I will send the numbers.';
const validKey = 'sk-ant-api03-abcdefghijklmnop';

describe('TranscriptForm', () => {
  it('disables the submit button when fields are empty', () => {
    render(<TranscriptForm onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: /generate brief/i })).toBeDisabled();
  });

  it('enables the submit button once a valid transcript and key are entered', async () => {
    const user = userEvent.setup();
    render(<TranscriptForm onSubmit={vi.fn()} isLoading={false} />);

    await user.type(screen.getByLabelText(/meeting transcript/i), validTranscript);
    await user.type(screen.getByLabelText(/anthropic api key/i), validKey);

    expect(screen.getByRole('button', { name: /generate brief/i })).toBeEnabled();
  });

  it('calls onSubmit with trimmed values on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TranscriptForm onSubmit={onSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/meeting transcript/i), `  ${validTranscript}  `);
    await user.type(screen.getByLabelText(/anthropic api key/i), validKey);
    await user.click(screen.getByRole('button', { name: /generate brief/i }));

    expect(onSubmit).toHaveBeenCalledWith(validTranscript, validKey);
  });

  it('does not call onSubmit when the API key has the wrong prefix', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TranscriptForm onSubmit={onSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/meeting transcript/i), validTranscript);
    await user.type(screen.getByLabelText(/anthropic api key/i), 'sk-openai-wrongprefix');
    // Button should be disabled, so a direct submit via Enter/click should not fire onSubmit
    expect(screen.getByRole('button', { name: /generate brief/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a loading label and disables the button while isLoading is true', () => {
    render(<TranscriptForm onSubmit={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: /generating brief/i })).toBeDisabled();
  });

  it('toggles API key visibility', async () => {
    const user = userEvent.setup();
    render(<TranscriptForm onSubmit={vi.fn()} isLoading={false} />);

    const input = screen.getByLabelText(/anthropic api key/i) as HTMLInputElement;
    expect(input.type).toBe('password');

    await user.click(screen.getByRole('button', { name: /show/i }));
    expect(input.type).toBe('text');
  });
});
