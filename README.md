# AI WhatsApp Business OS 🇲🇦

> **Turn WhatsApp into your business operating system.**

A multi-tenant SaaS application engineered for SMEs, sales teams, clinics, real estate agencies, restaurants, e-commerce stores, and service providers (primarily in Morocco and expanding globally).

---

## 🌟 Primary Features (Phase 1 MVP)

- 🔒 **Multi-Tenant Scoping & Data Isolation**: Every customer belongs to an Organization with role-based access control (`OWNER`, `ADMIN`, `AGENT`, `VIEWER`).
- 💬 **WhatsApp Business Cloud API Integration**: Complete `WhatsAppProvider` abstraction with real Meta Cloud API integration & mock sandbox provider for testing. Idempotent webhook handling prevents duplicate messages.
- 📥 **3-Column Inbox Experience**:
  - **Left**: Real-time conversation list, search filters, unread counts, and lead status badges.
  - **Center**: Active chat history with delivery/read receipts, message reply bar, template selector, and **Copilote IA 3-Option Reply Cards** (Professional, Friendly, Sales-oriented).
  - **Right**: CRM Lead & Contact drawer (tags, internal notes, intent level, location, budget).
- 🤖 **Modular AI Agent & 7 Custom Skills**:
  1. `understand-message`: Classifies intent (`PRICE_INQUIRY`, `APPOINTMENT`, `DELIVERY`, etc.), language (French, Darija, Arabic, English), sentiment, and urgency.
  2. `generate-reply`: Produces 3 tone options (Professional, Friendly, Sales) with reasoning metadata.
  3. `qualify-lead`: Extracts budget, timeline, location, and buying intent.
  4. `summarize-conversation`: Synthesizes 1-2 sentence executive conversation summaries.
  5. `detect-language`: Multilingual detection (French, Darija, Arabic, English).
  6. `detect-sentiment`: Flags negative sentiment and triggers human handoff (`NEEDS_HUMAN` state).
  7. `tone-selection`: Configures tone guidelines according to business profile.
- 📊 **CRM Leads Kanban Pipeline**: Stages (`Nouveau Lead`, `Contacté`, `Qualifié`, `Devis / Proposition`, `Négociation`, `Gagné`, `Perdu`) with value tracking in MAD.
- 📑 **Saved Replies & Message Templates**: Variable engine supporting `{{customer_name}}`, `{{business_name}}`, and `{{agent_name}}`.
- 📈 **Real Analytics & Billing**: Live KPIs (conversion rate, average response times, lead pipeline values) & subscription usage limits.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Server-side Route Handlers, Service-oriented domain modules.
- **Database**: PostgreSQL / SQLite dev database, Prisma ORM.
- **AI Abstraction**: Provider pattern (`OpenAIProvider`, `MockAIProvider`).
- **Messaging**: Meta WhatsApp Business Cloud API (`MetaWhatsAppProvider`, `MockWhatsAppProvider`).

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd WhatssapOs
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Setup Database & Seed Demo Data
```bash
# Push schema to SQLite database (dev.db)
npx prisma db push

# Seed realistic Moroccan demo business data (Dar Al Kaftan Casablanca)
npm run seed
```

### 4. Run Test Suite
```bash
npm test
```

### 5. Launch Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔑 Demo Credentials

- **Email**: `owner@darkaftan.ma`
- **Password**: `password123`
