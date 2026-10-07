/**
 * App — AI Assistant Workbench shell.
 *
 * Layout (explain this first in interviews):
 *   ┌─────────────┬──────────────────┬─────────────┐
 *   │ Settings    │ Conversation     │ Sources     │
 *   │             │                  │             │
 *   │ Tool        │                  │             │
 *   │ timeline    │                  │             │
 *   └─────────────┴──────────────────┴─────────────┘
 *
 * Turn lifecycle:
 *   send → append user msg → enqueue tool events (pending→running→success)
 *        → stream assistant tokens → attach citations → clear running flag
 */

import { useEffect, useRef, useState } from 'react';
import { ConversationPanel } from './components/ConversationPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { SourcesPanel } from './components/SourcesPanel';
import { ToolTimeline } from './components/ToolTimeline';
import { SEED_USER_PROMPT } from './data/mockCatalog';
import { planAgentTurn, toolResultSummary } from './lib/mockAgent';
import { runTimedSteps, simulateTokenStream } from './lib/simulateStream';
import type { AssistantSettings, ChatMessage, Citation, ToolCallEvent } from './lib/types';

const DEFAULT_SETTINGS: AssistantSettings = {
  modelName: 'mock-gpt-demo',
  temperature: 0.4,
  systemPrompt:
    'You are a helpful support copilot. Prefer policy docs. Use tools when you need evidence or when work should be tracked as a ticket. (Demo: this prompt is not sent to any API.)',
};

export default function App() {
  const [settings, setSettings] = useState<AssistantSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys-1',
      role: 'system',
      content:
        'Workbench ready. Try the suggested prompt or ask about refunds / SLA. All tools and streaming are simulated locally.',
      createdAt: Date.now(),
    },
  ]);
  const [toolEvents, setToolEvents] = useState<ToolCallEvent[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Keep cancel handles so a fast remount / StrictMode double-invoke stays safe.
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => cancelRef.current?.();
  }, []);

  function updateTool(id: string, patch: Partial<ToolCallEvent>) {
    setToolEvents((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function handleSend(text: string) {
    cancelRef.current?.();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    const assistantId = `asst-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      createdAt: Date.now(),
    };

    const plan = planAgentTurn(text);
    const now = Date.now();

    // Seed tool rows as pending; timed steps will advance them.
    const initialTools: ToolCallEvent[] = plan.toolEvents.map((t) => ({
      ...t,
      status: 'pending',
      startedAt: now,
    }));

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setToolEvents(initialTools);
    setCitations([]);
    setIsRunning(true);

    const cancels: Array<() => void> = [];

    // --- Tool timeline animation ---
    const toolSteps: Array<{ delayMs: number; run: () => void }> = [];
    let gap = 0;
    initialTools.forEach((tool, idx) => {
      gap = idx === 0 ? 350 : 650;
      const id = tool.id;
      toolSteps.push({
        delayMs: gap,
        run: () => updateTool(id, { status: 'running' }),
      });
      toolSteps.push({
        delayMs: 500,
        run: () =>
          updateTool(id, {
            status: 'success',
            finishedAt: Date.now(),
            resultSummary: toolResultSummary(tool.tool, tool.args, plan.citations),
          }),
      });
    });

    // After tools "finish", publish citations and start token stream.
    const toolsTotalMs =
      toolSteps.reduce((s, x) => s + x.delayMs, 0) + 200;

    const cancelTools = runTimedSteps(toolSteps);
    cancels.push(cancelTools);

    const startStreamTimer = setTimeout(() => {
      setCitations(plan.citations);

      const cancelStream = simulateTokenStream(
        plan.answer,
        settings.temperature,
        {
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + token } : m,
              ),
            );
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, isStreaming: false, citations: plan.citations }
                  : m,
              ),
            );
            setIsRunning(false);
          },
        },
      );
      cancels.push(cancelStream);
    }, toolsTotalMs);

    cancels.push(() => clearTimeout(startStreamTimer));

    cancelRef.current = () => {
      cancels.forEach((c) => c());
      setIsRunning(false);
    };
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>AI Assistant Workbench</h1>
          <p className="muted">
            Product UI for an agent desk — streaming, tools, sources, settings.
          </p>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="ghost"
            disabled={isRunning}
            onClick={() => handleSend(SEED_USER_PROMPT)}
          >
            Run sample prompt
          </button>
          <span className="badge">Portfolio · Malini Anne</span>
        </div>
      </header>

      <main className="grid">
        <div className="col left">
          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            disabled={isRunning}
          />
          <ToolTimeline events={toolEvents} />
        </div>
        <div className="col center">
          <ConversationPanel
            messages={messages}
            isRunning={isRunning}
            onSend={handleSend}
          />
        </div>
        <div className="col right">
          <SourcesPanel citations={citations} />
        </div>
      </main>
    </div>
  );
}
