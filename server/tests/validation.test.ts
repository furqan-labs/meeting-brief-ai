import { describe, it, expect } from 'vitest';
import { analyzeRequestSchema } from '../src/utils/validation';

describe('analyzeRequestSchema', () => {
  const validKey = 'sk-ant-api03-abcdefghijklmnop';
  const validTranscript = 'Alice: Let\'s finalize the budget by Friday. Bob: I will send the numbers.';

  it('accepts a valid transcript and API key', () => {
    const result = analyzeRequestSchema.safeParse({ transcript: validTranscript, apiKey: validKey });
    expect(result.success).toBe(true);
  });

  it('rejects a transcript that is too short', () => {
    const result = analyzeRequestSchema.safeParse({ transcript: 'Hi', apiKey: validKey });
    expect(result.success).toBe(false);
  });

  it('rejects a transcript over the length limit', () => {
    const result = analyzeRequestSchema.safeParse({
      transcript: 'a'.repeat(50001),
      apiKey: validKey,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an API key that does not start with sk-ant-', () => {
    const result = analyzeRequestSchema.safeParse({
      transcript: validTranscript,
      apiKey: 'sk-openai-something',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing API key', () => {
    const result = analyzeRequestSchema.safeParse({ transcript: validTranscript });
    expect(result.success).toBe(false);
  });
});
