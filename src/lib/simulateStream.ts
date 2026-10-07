/**
 * ============================================================================
 * SIMULATED TOKEN STREAM
 * ============================================================================
 *
 * Real chat UIs consume Server-Sent Events (SSE) or WebSockets where the
 * model emits tokens (or small string deltas) over time. React state then
 * appends each delta so the bubble "types" itself.
 *
 * This helper fakes that with setTimeout so the portfolio has zero backend.
 * Interview talking point: "The UI is streaming-ready; today the source is
 * a timer, in production I'd swap the producer for an SSE reader."
 *
 * UX patterns demonstrated:
 *   - Optimistic user message immediately
 *   - Assistant bubble appears empty with a streaming cursor
 *   - Tool timeline events interleave BEFORE the final answer (agent feel)
 *   - Citations attach when the stream completes
 */

export interface StreamHandlers {
  onToken: (token: string) => void;
  onDone: () => void;
}

/**
 * Split text into pseudo-tokens (words + spaces) and emit with delay.
 * Higher temperature → slightly more jitter in delays (cosmetic only).
 */
export function simulateTokenStream(
  fullText: string,
  temperature: number,
  handlers: StreamHandlers,
): () => void {
  const tokens = fullText.split(/(\s+)/).filter((t) => t.length > 0);
  let i = 0;
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const baseDelay = 18; // ms between tokens
  const jitter = Math.max(0, Math.min(temperature, 1.5)) * 22;

  const tick = () => {
    if (cancelled) return;
    if (i >= tokens.length) {
      handlers.onDone();
      return;
    }
    handlers.onToken(tokens[i]!);
    i += 1;
    const delay = baseDelay + Math.random() * jitter;
    timer = setTimeout(tick, delay);
  };

  timer = setTimeout(tick, 120);

  // Return cancel function so React can clean up on unmount / new request.
  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}

/**
 * Run a sequence of async steps with delays (used for tool timeline).
 * Returns a cancel function.
 */
export function runTimedSteps(
  steps: Array<{ delayMs: number; run: () => void }>,
): () => void {
  let cancelled = false;
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  let acc = 0;

  for (const step of steps) {
    acc += step.delayMs;
    const t = setTimeout(() => {
      if (!cancelled) step.run();
    }, acc);
    timers.push(t);
  }

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}
