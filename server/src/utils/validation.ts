import { z } from 'zod';

export const analyzeRequestSchema = z.object({
  transcript: z
    .string()
    .min(20, 'Transcript is too short to summarize meaningfully.')
    .max(50000, 'Transcript is too long (50,000 character limit).'),
  apiKey: z
    .string()
    .min(10, 'That does not look like a valid API key.')
    .startsWith('sk-ant-', 'Anthropic API keys start with "sk-ant-".'),
});
