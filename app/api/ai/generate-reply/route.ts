import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { buildAgentContext, logAIExecution } from '@/agents/core/agent';
import { UnderstandMessageSkill } from '@/skills/understand-message';
import { GenerateReplySkill } from '@/skills/generate-reply';
import { QualifyLeadSkill } from '@/skills/qualify-lead';
import { DetectSentimentSkill } from '@/skills/detect-sentiment';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const auth = await validateTenantContext(req, 'AGENT');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId, session } = auth.context!;

  try {
    const body = await req.json();
    const { conversationId, customPrompt } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'conversationId is required' }, { status: 400 });
    }

    // 1. Build Agent Context
    const agentContext = await buildAgentContext(conversationId, organizationId);
    if (!agentContext) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Conversation not found' }, { status: 404 });
    }

    const lastCustomerMessage = customPrompt || [...agentContext.recentMessages].reverse().find((m) => m.sender === 'CUSTOMER')?.content || agentContext.recentMessages[agentContext.recentMessages.length - 1]?.content || 'Bonjour';

    // 2. Execute Understand Message Skill
    const understanding = await UnderstandMessageSkill.execute(
      {
        message: lastCustomerMessage,
        conversationHistory: agentContext.recentMessages.map((m) => ({ sender: m.sender, content: m.content })),
      },
      agentContext
    );

    // 3. Execute Sentiment Skill
    const sentimentResult = await DetectSentimentSkill.execute({ message: lastCustomerMessage });
    if (sentimentResult.needsHuman) {
      // Flag conversation as NEEDS_HUMAN in DB
      await db.conversation.update({
        where: { id: conversationId },
        data: { status: 'NEEDS_HUMAN' },
      });
    }

    // 4. Execute Generate Reply Skill (Produces Option A, B, C)
    const replySuggestions = await GenerateReplySkill.execute(
      {
        customerMessage: lastCustomerMessage,
        intent: understanding.intent,
        businessProfile: agentContext.businessProfile,
        templates: agentContext.templates,
        conversationHistory: agentContext.recentMessages.map((m) => ({ sender: m.sender, content: m.content })),
      },
      agentContext
    );

    // 5. Execute Qualify Lead Skill (Async lead extraction)
    const leadData = await QualifyLeadSkill.execute(
      {
        message: lastCustomerMessage,
        conversationHistory: agentContext.recentMessages,
      },
      agentContext
    );

    const latencyMs = Date.now() - startTime;

    // 6. Log AI Execution for Auditability
    await logAIExecution({
      organizationId,
      userId: session.userId,
      conversationId,
      skillKey: 'generate-reply',
      inputMetadata: { lastCustomerMessage, intent: understanding.intent },
      output: { replySuggestions, leadData, sentimentResult },
      latencyMs,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      suggestions: {
        professional: replySuggestions.optionA,
        friendly: replySuggestions.optionB,
        sales: replySuggestions.optionC,
      },
      confidence: replySuggestions.confidence,
      reasoning: replySuggestions.reasoning,
      analysis: {
        intent: understanding.intent,
        language: understanding.language,
        sentiment: sentimentResult.sentiment,
        needsHuman: sentimentResult.needsHuman,
      },
      extractedLead: leadData,
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    await logAIExecution({
      organizationId,
      userId: session.userId,
      skillKey: 'generate-reply',
      inputMetadata: {},
      output: {},
      latencyMs,
      status: 'FAILED',
      error: error.message,
    });

    return NextResponse.json({ error: 'AI_ERROR', message: error.message || 'Failed to generate AI suggestions' }, { status: 500 });
  }
}
