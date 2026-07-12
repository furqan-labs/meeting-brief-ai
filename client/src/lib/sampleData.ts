import type { MeetingBrief } from '../types';

export const SAMPLE_TRANSCRIPT = `Alice: Thanks for jumping on, everyone. Let's lock the Q3 roadmap today — the dashboard redesign needs to ship before the conference on August 20th.
Bob: I can have the new designs ready by next Wednesday. I'll need Priya to review them before I hand off to engineering.
Priya: Works for me, I'll block time Thursday morning for the review.
Alice: Great. Once staging is up, can we loop in the QA team?
Bob: Yep, I'll send the staging link by Friday so QA can start early next week.
Alice: Perfect. Last thing — someone needs to update the changelog before the conference announcement goes out.
Priya: I can take that, I'll have it done by August 18th.
Alice: Awesome, thanks everyone. Let's regroup Thursday after the design review.`;

export const SAMPLE_BRIEF: MeetingBrief = {
  summary:
    'The team aligned on shipping the dashboard redesign before the August 20th conference. Bob will deliver designs for Priya to review, then hand off to engineering once staging is ready. QA will be looped in early, and Priya will handle the changelog update ahead of the announcement.',
  actionItems: [
    { task: 'Deliver dashboard redesign mockups', owner: 'Bob', dueDate: 'Wednesday' },
    { task: 'Review design mockups', owner: 'Priya', dueDate: 'Thursday morning' },
    { task: 'Send staging link to QA', owner: 'Bob', dueDate: 'Friday' },
    { task: 'Update changelog for conference announcement', owner: 'Priya', dueDate: 'August 18th' },
  ],
  followUpEmail: `Hi team,

Thanks for a productive sync today. Quick recap of where we landed on the Q3 dashboard redesign:

We're on track to ship before the August 20th conference. Bob will have new designs ready by Wednesday, with Priya reviewing Thursday morning before handoff to engineering. Once staging is live, Bob will share the link with QA by Friday so testing can start early next week. Priya will also update the changelog ahead of the announcement, targeting August 18th.

Let's regroup Thursday after the design review to check progress.

Thanks all,
Alice`,
};
