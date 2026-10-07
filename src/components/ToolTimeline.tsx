/**
 * ToolTimeline — shows agent tool calls as a vertical status feed.
 *
 * Why this panel exists in AI products:
 *   Users (and internal operators) need to see *what the agent did*,
 *   not only the final prose. Transparency builds trust and helps
 *   debug wrong tool args.
 *
 * FDE-adjacent angle: this is the UI face of tool-calling / function-calling.
 */

import type { ToolCallEvent } from '../lib/types';

interface Props {
  events: ToolCallEvent[];
}

const STATUS_LABEL: Record<ToolCallEvent['status'], string> = {
  pending: 'Queued',
  running: 'Running',
  success: 'Success',
  error: 'Error',
};

export function ToolTimeline({ events }: Props) {
  return (
    <section className="panel timeline" aria-label="Tool call timeline">
      <header className="panel-header">
        <h2>Tool timeline</h2>
        <p className="muted">Fake tools: search_docs, create_ticket</p>
      </header>

      {events.length === 0 && (
        <p className="empty">Tool calls will appear here when the agent runs.</p>
      )}

      <ol className="timeline-list">
        {events.map((ev) => (
          <li key={ev.id} className={`tool-card status-${ev.status}`}>
            <div className="tool-top">
              <code className="tool-name">{ev.tool}</code>
              <span className={`pill status-${ev.status}`}>{STATUS_LABEL[ev.status]}</span>
            </div>
            <pre className="tool-args">{JSON.stringify(ev.args, null, 2)}</pre>
            {ev.resultSummary && <p className="tool-result">{ev.resultSummary}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
