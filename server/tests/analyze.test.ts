import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the Claude client before importing the app, so the route uses our fake.
vi.mock('../src/utils/anthropicClient', () => ({
  callClaude: vi.fn(),
  AnthropicApiError: class AnthropicApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

import app from '../src/app';
import { callClaude, AnthropicApiError } from '../src/utils/anthropicClient';

const mockedCallClaude = vi.mocked(callClaude);

const validBody = {
  transcript: 'Alice: We need to finalize the budget by Friday. Bob: I will send the numbers over.',
  apiKey: 'sk-ant-api03-abcdefghijklmnop',
};

const validModelResponse = JSON.stringify({
  summary: 'The team discussed the budget deadline for Friday.',
  actionItems: [{ task: 'Send budget numbers', owner: 'Bob', dueDate: 'Friday' }],
  followUpEmail: 'Hi team, thanks for the meeting...',
});

describe('POST /api/analyze', () => {
  beforeEach(() => {
    mockedCallClaude.mockReset();
  });

  it('returns a parsed brief on success', async () => {
    mockedCallClaude.mockResolvedValueOnce(validModelResponse);

    const res = await request(app).post('/api/analyze').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.summary).toContain('budget deadline');
    expect(res.body.actionItems).toHaveLength(1);
  });

  it('rejects a request with a missing transcript', async () => {
    const res = await request(app).post('/api/analyze').send({ apiKey: validBody.apiKey });
    expect(res.status).toBe(400);
    expect(mockedCallClaude).not.toHaveBeenCalled();
  });

  it('rejects a request with an invalid API key format', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ transcript: validBody.transcript, apiKey: 'not-a-real-key' });
    expect(res.status).toBe(400);
    expect(mockedCallClaude).not.toHaveBeenCalled();
  });

  it('returns 401 when Claude reports an auth error', async () => {
    mockedCallClaude.mockRejectedValueOnce(new AnthropicApiError('bad key', 401));

    const res = await request(app).post('/api/analyze').send(validBody);
    expect(res.status).toBe(401);
  });

  it('returns 429 when Claude reports a rate limit error', async () => {
    mockedCallClaude.mockRejectedValueOnce(new AnthropicApiError('slow down', 429));

    const res = await request(app).post('/api/analyze').send(validBody);
    expect(res.status).toBe(429);
  });

  it('returns 502 when the model response cannot be parsed', async () => {
    mockedCallClaude.mockResolvedValueOnce('not valid json');

    const res = await request(app).post('/api/analyze').send(validBody);
    expect(res.status).toBe(502);
  });
});
