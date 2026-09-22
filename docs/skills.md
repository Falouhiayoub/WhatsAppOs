# Modular AI Skills Reference

Every skill follows a strict Zod schema contract and can be executed independently.

## Initial Phase 1 Skills

| Skill Key | Name | Description |
|-----------|------|-------------|
| `understand-message` | Understand Customer Message | Classifies intent (`PRICE_INQUIRY`, `DELIVERY`, etc.), language, sentiment, urgency |
| `generate-reply` | Generate Reply Suggestions | Produces Option A (Professional), Option B (Friendly), Option C (Sales) |
| `qualify-lead` | Lead Qualification | Extracts customer need, product interest, budget (MAD), timeline, location |
| `summarize-conversation` | Conversation Summarizer | Generates 1-2 sentence executive conversation summary |
| `detect-language` | Multilingual Detection | Detects French, Darija, Arabic, English, or Mixed phrasing |
| `detect-sentiment` | Sentiment & Handoff | Detects negative sentiment and triggers `NEEDS_HUMAN` escalation |
| `tone-selection` | Tone Selection | Configures tone guidelines for AI reply generation |
