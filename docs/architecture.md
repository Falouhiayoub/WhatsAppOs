# Product Architecture & Technical Design

## Architectural Overview

`AI WhatsApp Business OS` is structured as a modular, multi-tenant SaaS application designed around isolated domain services and an asynchronous message handling flow.

```
                    AI WHATSAPP BUSINESS OS
                            
                            Dashboard
                               |
        ------------------------------------------------
        |              |              |                |
      Inbox          CRM          Analytics          AI
        |              |              |                |
   Conversations     Leads        Metrics          Agent
        |              |                           |
     Messages       Contacts                    Skills
        |                                          |
   WhatsApp API                                  Tools
        |                                          |
        ---------------- Event Bus / Jobs -----------
                               |
                        Database (Prisma)
```

## Domain Modules & Isolation
- **Multi-Tenancy Isolation**: Every tenant entity explicitly carries `organizationId`. All DB operations and API route handlers strictly validate the requesting user's tenant context before executing database queries.
- **Provider Abstractions**:
  - `WhatsAppProvider`: Encapsulates Meta WhatsApp Business Cloud API with a mock fallback adapter.
  - `AIProvider`: Encapsulates LLM completions with fallback structured output handling.
