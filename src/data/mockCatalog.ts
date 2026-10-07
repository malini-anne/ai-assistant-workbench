/**
 * Static mock catalog used by fake tools.
 * Nothing here is a real backend — it exists so the timeline and citations
 * panels have believable content during a live demo.
 */

export interface MockDoc {
  id: string;
  title: string;
  path: string;
  body: string;
}

export const MOCK_DOCS: MockDoc[] = [
  {
    id: 'doc-onboarding',
    title: 'Agent onboarding checklist',
    path: 'handbook/onboarding.md',
    body: 'New agents complete SSO setup, shadow two tickets, and enable Slack alerts for Urgent priority.',
  },
  {
    id: 'doc-refunds',
    title: 'Refund policy (demo)',
    path: 'policies/refunds.md',
    body: 'Full refunds within 14 days for unused seats. Partial credit after 14 days requires manager approval.',
  },
  {
    id: 'doc-sla',
    title: 'Support SLA summary',
    path: 'ops/sla.md',
    body: 'Urgent first response is 30 minutes. High is 2 business hours. SLA pauses while Waiting on Customer.',
  },
];

/** Seed conversation so the empty state isn't blank during screenshots. */
export const SEED_USER_PROMPT =
  'A customer wants a refund after 20 days and also asked about Urgent SLA. Help me respond.';
