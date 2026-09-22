import assert from 'assert';
import { hasPermission } from '@/server/middleware/tenantContext';

export async function runTenantTests() {
  console.log('🧪 Testing Multi-Tenancy Role Hierarchy & Authorization...');

  assert(hasPermission('OWNER', 'ADMIN') === true, 'OWNER should have ADMIN rights');
  assert(hasPermission('ADMIN', 'AGENT') === true, 'ADMIN should have AGENT rights');
  assert(hasPermission('AGENT', 'VIEWER') === true, 'AGENT should have VIEWER rights');
  assert(hasPermission('VIEWER', 'ADMIN') === false, 'VIEWER should NOT have ADMIN rights');
  assert(hasPermission('AGENT', 'OWNER') === false, 'AGENT should NOT have OWNER rights');

  console.log('  ✔ Role permissions hierarchy verified (OWNER > ADMIN > AGENT > VIEWER)');
  console.log('✅ Multi-Tenancy Authorization tests passed!\n');
}
