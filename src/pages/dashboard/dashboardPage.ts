import { Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import { BasePage } from '../core/basePage';

dotenv.config();

export class BaseDashboard extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateTodashboardPage(): Promise<void> {
    await this.goto('/dashboard');
  }
}
