import type { TestUser } from '../types';

export function generateTestUser(): TestUser {
  const uniqueId = globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 12);

  return {
    username: `qa_user_${uniqueId}`,
    password: `Qa!${uniqueId}9a`,
  };
}
