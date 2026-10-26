import type { Page } from '@playwright/test';

export interface Credentials {
  username: string;
  password: string;
}

export interface CredentialTestCase extends Credentials {
  name: string;
}

export interface TestUser {
  username: string;
  password: string;
}

export interface EmployeeRecord {
  empNumber: number;
  employeeId: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  terminationId: number | null;
}

export interface SystemUserRecord {
  userName: string;
  employee: { empNumber: number } | null;
}

export interface ApiCollection<T> {
  data: T[];
  meta?: {
    total?: number;
  };
}

export interface EmployeeSearchResult {
  data: EmployeeRecord[];
}

export interface CreatedSystemUserResponse {
  data: SystemUserRecord;
}

export interface AuthenticatedFixtures {
  authenticatedPage: Page;
}
