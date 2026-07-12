import { Router } from 'express';
import { analyzeRequestSchema } from '../utils/validation';
import { callClaude, AnthropicApiError } from '../utils/anthropicClient';
import { parseModelResponse, BriefParseError } from '../utils/brief';
import { analyzeLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/', analyzeLimiter, async (req, res) => {
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { transcript, apiKey } = parsed.data;

  try {
    const rawResponse = await callClaude(apiKey, transcript);
    const brief = parseModelResponse(rawResponse);
    return res.json(brief);
  } catch (err) {
    if (err instanceof AnthropicApiError) {
      // Surface auth errors clearly; don't leak the raw upstream body for other cases.
      if (err.status === 401) {
        return res.status(401).json({ error: 'Invalid API key.' });
      }
      if (err.status === 429) {
        return res.status(429).json({ error: 'Claude API rate limit reached. Try again shortly.' });
      }
      return res.status(502).json({ error: 'The AI service failed to respond. Please try again.' });
    }

    if (err instanceof BriefParseError) {
      return res.status(502).json({ error: 'Could not parse the AI response. Please try again.' });
    }

    console.error('Unexpected error in /analyze:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
