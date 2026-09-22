export type Role = 'OWNER' | 'ADMIN' | 'AGENT' | 'VIEWER';

export type ConversationStatus = 'OPEN' | 'CLOSED' | 'PENDING' | 'NEEDS_HUMAN';

export type MessageDirection = 'INBOUND' | 'OUTBOUND';

export type MessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
