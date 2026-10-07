/**
 * SourcesPanel — citations / grounding attached to the latest turn.
 *
 * Pattern: keep sources persistent for the active answer so reviewers
 * can audit without scrolling the chat. In production, clicking a source
 * would open the document viewer at the right span.
 */

import type { Citation } from '../lib/types';

interface Props {
  citations: Citation[];
}

export function SourcesPanel({ citations }: Props) {
  return (
    <section className="panel sources" aria-label="Sources">
      <header className="panel-header">
        <h2>Sources</h2>
        <p className="muted">Grounding from mock search_docs results</p>
      </header>

      {citations.length === 0 && (
        <p className="empty">Citations show up after a successful search_docs call.</p>
      )}

      <ul className="source-list">
        {citations.map((c) => (
          <li key={c.id}>
            <strong>{c.title}</strong>
            <span className="path">{c.urlOrPath}</span>
            <p>{c.snippet}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
