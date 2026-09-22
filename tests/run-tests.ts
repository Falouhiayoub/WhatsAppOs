import { runSkillsTests } from './unit/skills.test';
import { runTenantTests } from './unit/tenant.test';
import { runWebhookTests } from './integration/webhook.test';

async function main() {
  console.log('🚀 Executing AI WhatsApp Business OS Test Suite...\n');
  const startTime = Date.now();

  try {
    await runTenantTests();
    await runSkillsTests();
    await runWebhookTests();

    const durationMs = Date.now() - startTime;
    console.log(`🎉 ALL TESTS PASSED SUCCESSFULLY! (${durationMs}ms)`);
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exit(1);
  }
}

main();
