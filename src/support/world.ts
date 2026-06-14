import { Browser, BrowserContext, Page } from "@playwright/test";
import { IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import { config } from "../support/config";
import { BaseDashboard } from "../pages/dashboard/baseDashboard";
import { BasePage } from "../pages/dynamicLocator/basePage";
export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  baseDashboard!: BaseDashboard;
  basePage!: BasePage;

  config = config;
  accessToken: string | undefined;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
