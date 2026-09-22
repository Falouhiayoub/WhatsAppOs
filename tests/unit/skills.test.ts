import assert from 'assert';
import { UnderstandMessageSkill } from '@/skills/understand-message';
import { GenerateReplySkill } from '@/skills/generate-reply';
import { QualifyLeadSkill } from '@/skills/qualify-lead';
import { SummarizeConversationSkill } from '@/skills/summarize-conversation';
import { DetectLanguageSkill } from '@/skills/detect-language';
import { DetectSentimentSkill } from '@/skills/detect-sentiment';
import { ToneSelectionSkill } from '@/skills/tone-selection';

export async function runSkillsTests() {
  console.log('🧪 Testing Modular AI Agent Skills Contract...');

  // 1. Understand Message Skill
  const understandResult = await UnderstandMessageSkill.execute({
    message: 'Salam, ch\'hal thaman dyal kaftan royal khdari?',
    conversationHistory: [],
  });
  assert(understandResult.intent === 'PRICE_INQUIRY', 'Intent should be PRICE_INQUIRY');
  assert(understandResult.confidence > 0, 'Confidence should be positive');
  console.log('  ✔ UnderstandMessageSkill contract passed');

  // 2. Generate Reply Skill
  const replyResult = await GenerateReplySkill.execute({
    customerMessage: 'Est-ce que la livraison est disponible sur Rabat?',
    intent: 'DELIVERY',
    businessProfile: { name: 'Dar Al Kaftan', industry: 'Fashion' },
  });
  assert(typeof replyResult.optionA === 'string' && replyResult.optionA.length > 0, 'Option A must be a valid non-empty string');
  assert(typeof replyResult.optionB === 'string' && replyResult.optionB.length > 0, 'Option B must be a valid non-empty string');
  assert(typeof replyResult.optionC === 'string' && replyResult.optionC.length > 0, 'Option C must be a valid non-empty string');
  console.log('  ✔ GenerateReplySkill (Option A/B/C) contract passed');

  // 3. Qualify Lead Skill
  const leadResult = await QualifyLeadSkill.execute({
    message: 'Je veux acheter 2 caftans pour mon mariage à Rabat',
  });
  assert(['LOW', 'MEDIUM', 'HIGH'].includes(leadResult.buyingIntent), 'buyingIntent must be LOW, MEDIUM, or HIGH');
  console.log('  ✔ QualifyLeadSkill contract passed');

  // 4. Summarize Conversation Skill
  const summaryResult = await SummarizeConversationSkill.execute({
    messages: [{ sender: 'CUSTOMER', content: 'Prix du caftan?' }],
  });
  assert(typeof summaryResult.summary === 'string', 'Summary should be string');
  console.log('  ✔ SummarizeConversationSkill contract passed');

  // 5. Detect Language Skill
  const langResult = await DetectLanguageSkill.execute({ text: 'Salam kidayr labas' });
  assert(langResult.detectedLanguage === 'Darija', 'Language should be detected as Darija');
  console.log('  ✔ DetectLanguageSkill contract passed');

  // 6. Detect Sentiment Skill
  const sentimentResult = await DetectSentimentSkill.execute({ message: 'Je suis très satisfait de votre service' });
  assert(typeof sentimentResult.needsHuman === 'boolean', 'needsHuman should be boolean');
  console.log('  ✔ DetectSentimentSkill contract passed');

  // 7. Tone Selection Skill
  const toneResult = await ToneSelectionSkill.execute({ preferredTone: 'FRIENDLY' });
  assert(toneResult.selectedTone === 'FRIENDLY', 'Tone should be FRIENDLY');
  console.log('  ✔ ToneSelectionSkill contract passed');

  console.log('✅ All 7 AI Modular Skills tests passed!\n');
}
