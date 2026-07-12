import { SYSTEM_PROMPT, buildUserPrompt } from './brief';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5-20250929';

export class AnthropicApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AnthropicApiError';
    this.status = status;
  }
}

/**
 * Builds the request body sent to Anthropic's Messages API.
 * Separated from the network call itself so it can be unit tested
 * without making a real HTTP request.
 */
export function buildAnthropicRequestBody(transcript: string) {
  return {
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user' as const, content: buildUserPrompt(transcript) }],
  };
}

export async function callClaude(apiKey: string, transcript: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(buildAnthropicRequestBody(transcript)),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AnthropicApiError(
      `Claude API request failed (${response.status}): ${errorBody}`,
      response.status
    );
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text?: string }>;
  };

  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock?.text) {
    throw new AnthropicApiError('Claude API response contained no text content.', 502);
  }

  return textBlock.text;
}
