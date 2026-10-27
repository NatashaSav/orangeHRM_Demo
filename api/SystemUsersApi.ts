import type { APIRequestContext } from '@playwright/test';
import { URLS } from '../data/constants';
import type { ApiCollection, SystemUserRecord } from '../types';

export class SystemUsersApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  async getAllUsers(): Promise<SystemUserRecord[]> {
    const url = new URL(URLS.allAdminUsers, this.baseUrl).toString();
    const response = await this.request.get(url);
    if (!response.ok()) {
      throw new Error(
        `Failed to retrieve system users. HTTP status: ${response.status()}`,
      );
    }

    const collection =
      (await response.json()) as ApiCollection<SystemUserRecord>;
    if (!Array.isArray(collection.data)) {
      throw new Error(
        'The system users API response does not contain a user list.',
      );
    }

    return collection.data;
  }
}
