/**
 * ============================================================================
 * MOCK AGENT ORCHESTRATION
 * ============================================================================
 *
 * Pretend agent loop (what FDE / AI product teams build):
 *   1. Model plans tool calls (search_docs, create_ticket)
 *   2. Runtime executes tools
 *   3. Model writes a final answer grounded in tool outputs
 *
 * Here everything is scripted from the user prompt so demos are reliable.
 * Comments explain where a real tool-calling LLM would plug in.
 */

import { MOCK_DOCS } from '../data/mockCatalog';
import type { Citation, ToolCallEvent } from './types';

export interface AgentPlan {
  toolEvents: Omit<ToolCallEvent, 'status' | 'startedAt' | 'finishedAt' | 'resultSummary'>[];
  /** Final assistant prose (will be streamed). */
  answer: string;
  citations: Citation[];
}

/**
 * Build a deterministic plan from the latest user text.
 * Keyword checks keep the demo predictable for interviews.
 */
export function planAgentTurn(userText: string): AgentPlan {
  const lower = userText.toLowerCase();
  const wantsRefund = /refund|credit|money back/.test(lower);
  const wantsSla = /sla|urgent|response time/.test(lower);

  const matched = MOCK_DOCS.filter((d) => {
    if (wantsRefund && d.id === 'doc-refunds') return true;
    if (wantsSla && d.id === 'doc-sla') return true;
    // Always include onboarding if nothing matched — shows search still ran.
    return !wantsRefund && !wantsSla ? d.id === 'doc-onboarding' : false;
  });

  const docs = matched.length > 0 ? matched : [MOCK_DOCS[0]!];

  const citations: Citation[] = docs.map((d) => ({
    id: d.id,
    title: d.title,
    urlOrPath: d.path,
    snippet: d.body,
  }));

  const searchArgs = {
    query: userText.slice(0, 120),
    top_k: docs.length,
  };

  const toolEvents: AgentPlan['toolEvents'] = [
    {
      id: `tool-search-${Date.now()}`,
      tool: 'search_docs',
      args: searchArgs,
    },
  ];

  // Second tool: create_ticket — only when the prompt smells like a case.
  if (wantsRefund || /ticket|escalat|customer/.test(lower)) {
    toolEvents.push({
      id: `tool-ticket-${Date.now() + 1}`,
      tool: 'create_ticket',
      args: {
        title: wantsRefund ? 'Refund request follow-up' : 'Customer support follow-up',
        priority: wantsSla ? 'High' : 'Medium',
        tags: ['assistant-drafted'],
      },
    });
  }

  const answer = buildAnswer(userText, docs, toolEvents.some((t) => t.tool === 'create_ticket'));

  return { toolEvents, answer, citations };
}

function buildAnswer(
  userText: string,
  docs: typeof MOCK_DOCS,
  createdTicket: boolean,
): string {
  const lines: string[] = [];
  lines.push('Here is a grounded draft you can send or edit:');
  lines.push('');

  for (const d of docs) {
    lines.push(`• From “${d.title}”: ${d.body}`);
  }

  lines.push('');
  if (createdTicket) {
    lines.push(
      'I also drafted a follow-up ticket via the create_ticket tool so this does not get lost in chat.',
    );
  } else {
    lines.push(
      'No ticket was created. Ask me to open one if you want this tracked in the queue.',
    );
  }

  lines.push('');
  lines.push(
    `_(Demo note: tools and answer are mocked from your prompt: “${truncate(userText, 80)}”. No model API was called.)_`,
  );

  return lines.join('\n');
}

function truncate(s: string, n: number): string {
  const t = s.trim();
  return t.length <= n ? t : t.slice(0, n - 1) + '…';
}

/** Pretty status copy for the timeline. */
export function toolResultSummary(
  tool: ToolCallEvent['tool'],
  args: Record<string, unknown>,
  citations: Citation[],
): string {
  if (tool === 'search_docs') {
    return `Found ${citations.length} doc(s): ${citations.map((c) => c.title).join(', ')}`;
  }
  if (tool === 'create_ticket') {
    return `Created ticket “${String(args.title ?? 'Untitled')}” (${String(args.priority ?? 'Medium')}) — mock id TCK-${Math.floor(Math.random() * 9000 + 1000)}`;
  }
  return 'Done';
}
