import { Page, expect, Locator } from 'playwright/test';
import * as dotenv from 'dotenv';
import { BaseLocator } from './baseLocator';
dotenv.config(); // Load environment variables from .env

export class BasePage {
  locator: BaseLocator;

  constructor(protected page: Page) {
    this.locator = new BaseLocator(page);
  }

  //#region Locators

  //#endregion

  //#region Actions

  async inputText(name: string, value: string) {
    await this.locator.input(name).fill(value);
  }

  async clickButton(name: string) {
    await this.locator.button(name).click();
  }

  //#endregion
}
