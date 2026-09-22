# AI Agent Architecture & Context Builder

## AI Copilot Workflow

1. **Context Ingestion**:
   - `buildAgentContext()` aggregates up to 8 recent conversation messages, contact CRM metadata, business profile (products, FAQ, policies, forbidden claims), and saved templates.
2. **Modular Skill Execution**:
   - Executes intent classification (`understand-message`), sentiment check (`detect-sentiment`), lead extraction (`qualify-lead`), and 3-option reply generation (`generate-reply`).
3. **Guardrails & Human Handoff**:
   - Human-in-the-loop: AI suggestions are presented to human agents in the Inbox for insertion or editing.
   - If negative sentiment or complaints are detected, conversation status automatically updates to `NEEDS_HUMAN`.
4. **Execution Audit Log**:
   - Every AI execution records token usage, input metadata, output JSON, latency in milliseconds, and status into `AIExecution`.
