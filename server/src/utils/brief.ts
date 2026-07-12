import { z } from 'zod';
import type { MeetingBrief } from '../types';

const actionItemSchema = z.object({
  task: z.string(),
  owner: z.string().nullable(),
  dueDate: z.string().nullable(),
});

const meetingBriefSchema = z.object({
  summary: z.string(),
  actionItems: z.array(actionItemSchema),
  followUpEmail: z.string(),
});

export const SYSTEM_PROMPT = `You are an assistant that turns raw meeting transcripts into a structured brief.

Read the transcript and respond with ONLY a JSON object (no markdown fences, no commentary) matching exactly this shape:

{
  "summary": string,           // 2-4 sentence plain-language summary of what was discussed and decided
  "actionItems": [
    { "task": string, "owner": string | null, "dueDate": string | null }
  ],                            // every concrete action mentioned; owner/dueDate are null if not stated
  "followUpEmail": string      // a ready-to-send follow-up email, professional tone, summarizing the meeting and listing action items
}

If the transcript has no clear action items, return an empty array for actionItems. Never invent an owner or due date that wasn't stated or clearly implied.`;

export function buildUserPrompt(transcript: string): string {
  return `Transcript:\n"""\n${transcript.trim()}\n"""`;
}

/**
 * The model is asked to return raw JSON, but models sometimes wrap it in
 * markdown code fences anyway. This strips those before parsing.
 */
export function extractJson(rawText: string): string {
  const trimmed = rawText.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

export class BriefParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BriefParseError';
  }
}

export function parseModelResponse(rawText: string): MeetingBrief {
  const jsonText = extractJson(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new BriefParseError('The model response was not valid JSON.');
  }

  const result = meetingBriefSchema.safeParse(parsed);
  if (!result.success) {
    throw new BriefParseError(
      `The model response did not match the expected shape: ${result.error.message}`
    );
  }

  return result.data;
}
