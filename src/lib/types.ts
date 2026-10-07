/**
 * Domain types for the AI assistant workbench.
 *
 * Interview framing: an "agent desk" UI usually needs four surfaces —
 * conversation, tool activity, grounding sources, and model settings.
 * Keeping types explicit makes the product model easy to explain.
 */

export type Role = 'user' | 'assistant' | 'system';

export interface Citation {
  id: string;
  title: string;
  urlOrPath: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  /** Full text once streaming completes (or immediately for user). */
  content: string;
  /** True while tokens are still arriving. */
  isStreaming?: boolean;
  citations?: Citation[];
  createdAt: number;
}

/**
 * A single tool invocation in the agent timeline.
 * In real agent frameworks (OpenAI tools, LangGraph, custom FDE agents)
 * the model emits a structured tool call; the runtime executes it and
 * feeds the result back as another message.
 */
export type ToolName = 'search_docs' | 'create_ticket';
export type ToolStatus = 'pending' | 'running' | 'success' | 'error';

export interface ToolCallEvent {
  id: string;
  tool: ToolName;
  /** Arguments the model "decided" to pass (mock JSON). */
  args: Record<string, unknown>;
  status: ToolStatus;
  /** Human-readable result summary for the timeline. */
  resultSummary?: string;
  startedAt: number;
  finishedAt?: number;
}

export interface AssistantSettings {
  /** Display name only — no real model is called. */
  modelName: string;
  /**
   * Temperature controls randomness in real LLMs (0 = deterministic,
   * ~1 = creative). Here it only affects how "spread out" our fake
   * token delays feel, so the setting is visible and explainable.
   */
  temperature: number;
  systemPrompt: string;
}

export interface WorkbenchState {
  messages: ChatMessage[];
  toolEvents: ToolCallEvent[];
  citations: Citation[];
  settings: AssistantSettings;
}
