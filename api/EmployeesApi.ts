import type { APIRequestContext, Response } from '@playwright/test';
import { URLS } from '../data/constants';
import type { ApiCollection, EmployeeRecord } from '../types';

export class EmployeesApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  async getAllEmployees(): Promise<EmployeeRecord[]> {
    const url = new URL(URLS.allEmployees, this.baseUrl).toString();
    const response = await this.request.get(url);
    if (!response.ok()) {
      throw new Error(
        `Failed to retrieve employees. HTTP status: ${response.status()}`,
      );
    }

    const collection = (await response.json()) as ApiCollection<EmployeeRecord>;
    if (!Array.isArray(collection.data)) {
      throw new Error(
        'The employee API response does not contain an employee list.',
      );
    }

    return collection.data;
  }

  async readEmployeeSearchResponse(
    response: Response,
  ): Promise<EmployeeRecord[]> {
    if (!response.ok()) {
      throw new Error(
        `Employee search failed. HTTP status: ${response.status()}`,
      );
    }

    const result = (await response.json()) as ApiCollection<EmployeeRecord>;
    if (!Array.isArray(result.data)) {
      throw new Error(
        'The employee search response does not contain an employee list.',
      );
    }

    return result.data;
  }
}
