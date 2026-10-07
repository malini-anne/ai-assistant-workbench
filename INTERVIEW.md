# Interview rehearsal — AI Assistant Workbench

---

### Q: What problem does this UI solve?

**A:** Internal or customer-facing AI desks need more than a chatbot bubble. Operators must see tool activity, sources, and model settings. I built a workbench layout that makes those surfaces first-class while keeping the agent mocked so the demo always works offline.

---

### Q: How does your streaming work?

**A:** `simulateTokenStream` splits the answer into word tokens and appends them with `setTimeout`. Temperature adds jitter to the delay so the control feels connected. In production I’d read SSE or a fetch byte stream and call the same `onToken` path — the React state model stays identical.

---

### Q: What are the fake tools doing?

**A:** `search_docs` returns snippets from a static catalog; `create_ticket` invents a ticket id and summary. The timeline shows pending → running → success so I can talk about agent transparency and debugging bad tool arguments.

---

### Q: How is this FDE-adjacent?

**A:** Forward-deployed / AI product engineers often ship the operator UI around agents: timelines, approvals, citations, eval hooks. This project focuses on that product shell rather than training models.

---

### Q: What would you add next?

**A:** Real SSE against a small Express proxy, human-in-the-loop approval before `create_ticket`, retry/cancel for tool steps, and session history persistence. Also dark/light theme tokens and keyboard shortcuts for power users.

---

### Q: Tell me about a UX risk with agent UIs.

**A:** Silent tool failures and hidden provenance. If the model calls the wrong tool or cites nothing, the UI must surface that. I keep the timeline and sources visible even when the prose sounds confident.
