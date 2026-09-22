# Database Schema & Entity Design

## Entity Relationship Overview

All tenant-owned database entities contain an `organizationId` foreign key referencing `Organization(id)` to enforce tenant isolation.

### Key Entities
- **`User`**: Account holder belonging to an organization. Roles: `OWNER`, `ADMIN`, `AGENT`, `VIEWER`.
- **`Organization`**: Tenant workspace entity holding business AI profile context (`businessDescription`, `products`, `services`, `faq`, `tone`, `forbiddenClaims`, `handoffRules`).
- **`WhatsAppAccount`**: Connected Meta Cloud API phone number and credentials.
- **`Contact`**: Customer CRM profile (`name`, `phone`, `email`, `company`, `leadStatus`, `tags`, `notes`).
- **`Conversation`**: Conversation thread (`contactId`, `assignedUserId`, `status` [OPEN, CLOSED, PENDING, NEEDS_HUMAN], `unreadCount`, `lastMessageText`).
- **`Message`**: Individual chat message (`externalProviderId`, `direction` [INBOUND, OUTBOUND], `type`, `content`, `status`).
- **`Lead`**: Sales pipeline card (`title`, `value` in MAD, `pipelineId`, `stageId`, `buyingIntent`, `location`, `timeline`).
- **`MessageTemplate`**: Saved reply templates supporting `{{customer_name}}`, `{{business_name}}`, `{{agent_name}}`.
- **`AIAgent` & `AISkill`**: AI engine settings and modular skill configurations.
- **`AIExecution`**: Audit trail of every AI skill execution (token usage, input metadata, output, latency).
