/**
 * ConversationPanel — primary chat surface with streaming cursor.
 *
 * AI product UX patterns called out in comments:
 *   - Streaming text reduces perceived latency
 *   - A blinking cursor signals "still generating"
 *   - System / helper hints stay visually quieter than user/assistant
 *   - Composer disables during a turn (prevents overlapping agent runs)
 */

import { FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../lib/types';

interface Props {
  messages: ChatMessage[];
  isRunning: boolean;
  onSend: (text: string) => void;
}

export function ConversationPanel({ messages, isRunning, onSend }: Props) {
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isRunning) return;
    onSend(text);
    setDraft('');
  }

  return (
    <section className="panel conversation" aria-label="Conversation">
      <header className="panel-header">
        <h2>Conversation</h2>
        <p className="muted">Simulated token stream · mock tools underneath</p>
      </header>

      <div className="messages" role="log" aria-live="polite">
        {messages.map((m) => (
          <article key={m.id} className={`msg msg-${m.role}`}>
            <span className="msg-role">{m.role}</span>
            <pre className="msg-body">
              {m.content}
              {m.isStreaming && <span className="cursor" aria-hidden="true" />}
            </pre>
          </article>
        ))}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={submit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask the assistant desk…"
          disabled={isRunning}
          aria-label="Message"
        />
        <button type="submit" disabled={isRunning || !draft.trim()}>
          {isRunning ? 'Running…' : 'Send'}
        </button>
      </form>
    </section>
  );
}
