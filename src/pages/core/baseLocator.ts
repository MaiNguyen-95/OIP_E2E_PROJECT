import { Page, Locator } from '@playwright/test';

export class BaseLocator {
  constructor(protected page: Page) {}

  //Locator for input
  input(name: string): Locator {
    return this.page.locator(`input[placeholder="${name}"], [data-testid="input-${name}"]`);
  }

  //Locator for button
  button(name: string): Locator {
    return this.page.locator(`button:has-text("${name}"), [data-testid="btn-${name}"]`);
  }
}
