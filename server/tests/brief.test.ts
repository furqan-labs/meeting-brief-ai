import { describe, it, expect } from 'vitest';
import { extractJson, parseModelResponse, BriefParseError, buildUserPrompt } from '../src/utils/brief';

describe('buildUserPrompt', () => {
  it('wraps the transcript in triple-quoted delimiters', () => {
    const prompt = buildUserPrompt('Alice: Let\'s ship on Friday.');
    expect(prompt).toContain('"""');
    expect(prompt).toContain("Alice: Let's ship on Friday.");
  });

  it('trims surrounding whitespace from the transcript', () => {
    const prompt = buildUserPrompt('   hello world   ');
    expect(prompt).toContain('"""\nhello world\n"""');
  });
});

describe('extractJson', () => {
  it('returns raw JSON text unchanged', () => {
    const raw = '{"summary": "test"}';
    expect(extractJson(raw)).toBe(raw);
  });

  it('strips markdown json code fences', () => {
    const raw = '```json\n{"summary": "test"}\n```';
    expect(extractJson(raw)).toBe('{"summary": "test"}');
  });

  it('strips plain code fences without a language tag', () => {
    const raw = '```\n{"summary": "test"}\n```';
    expect(extractJson(raw)).toBe('{"summary": "test"}');
  });
});

describe('parseModelResponse', () => {
  const validResponse = JSON.stringify({
    summary: 'The team discussed the Q3 roadmap and agreed to ship the new dashboard by August.',
    actionItems: [
      { task: 'Finalize dashboard designs', owner: 'Maria', dueDate: '2026-07-20' },
      { task: 'Set up staging environment', owner: null, dueDate: null },
    ],
    followUpEmail: 'Hi team,\n\nThanks for a productive meeting...',
  });

  it('parses a well-formed response', () => {
    const brief = parseModelResponse(validResponse);
    expect(brief.summary).toContain('Q3 roadmap');
    expect(brief.actionItems).toHaveLength(2);
    expect(brief.actionItems[0].owner).toBe('Maria');
    expect(brief.actionItems[1].owner).toBeNull();
  });

  it('parses a response wrapped in markdown fences', () => {
    const wrapped = '```json\n' + validResponse + '\n```';
    const brief = parseModelResponse(wrapped);
    expect(brief.summary).toContain('Q3 roadmap');
  });

  it('throws BriefParseError on invalid JSON', () => {
    expect(() => parseModelResponse('not json at all')).toThrow(BriefParseError);
  });

  it('throws BriefParseError when required fields are missing', () => {
    const incomplete = JSON.stringify({ summary: 'Missing other fields' });
    expect(() => parseModelResponse(incomplete)).toThrow(BriefParseError);
  });

  it('throws BriefParseError when actionItems is not an array', () => {
    const malformed = JSON.stringify({
      summary: 'Test',
      actionItems: 'not an array',
      followUpEmail: 'Test',
    });
    expect(() => parseModelResponse(malformed)).toThrow(BriefParseError);
  });

  it('accepts an empty actionItems array', () => {
    const noActions = JSON.stringify({
      summary: 'Just a casual chat, nothing was decided.',
      actionItems: [],
      followUpEmail: 'Hi, thanks for chatting today...',
    });
    const brief = parseModelResponse(noActions);
    expect(brief.actionItems).toEqual([]);
  });
});
