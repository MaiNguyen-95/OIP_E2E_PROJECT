import { setDefaultTimeout } from "@cucumber/cucumber";
setDefaultTimeout(30 * 1000);

import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium, Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { BaseDashboard } from "../pages/dashboard/baseDashboard";
import { BasePage } from "../pages/dynamicLocator/basePage";

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({ headless: false });
});

Before(async function (this: CustomWorld) {
  this.context = await browser.newContext({
    extraHTTPHeaders: {
      "x-tenant-id": process.env.TENANT_ID!,
      Origin: process.env.BASE_URL!,
      Referer: process.env.BASE_URL!,
    },
  });

  this.page = await this.context.newPage();

  this.baseDashboard = new BaseDashboard(this.page);
  this.basePage = new BasePage(this.page);
});

After(async function (this: CustomWorld) {
  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();
});
