import { Page, Locator, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

export type PopupState = "open" | "closed";

export class BaseDashboard {
  static selectTenant(tenantName: string) {
    throw new Error("Method not implemented.");
  }

  protected page: Page;
  readonly tenantDropdown: Locator;
  private capturedApiJson: any = null;
  private capturedLatencyJson: any = null;

  constructor(page: Page) {
    this.page = page;
    this.tenantDropdown = page.locator('button[data-testid="tenant-dropdown"]');
    this.page.setDefaultTimeout(30_000);
    this.initNetworkSpy();
  }

  private async initNetworkSpy(): Promise<void> {
    await this.page.route("**/backend-for-frontend/overview", async (route) => {
      const response = await route.fetch();
      if (response.status() === 200) {
        try {
          this.capturedApiJson = await response.json();
        } catch (e) {}
      }
      await route.fulfill({ response });
    });

    await this.page.route(
      "**/backend-for-frontend/overview/latency*",
      async (route) => {
        const response = await route.fetch();
        if (response.status() === 200) {
          try {
            this.capturedLatencyJson = await response.json();
          } catch (e) {}
        }
        await route.fulfill({ response });
      },
    );
  }
  //#region Locators
  btntopservice = (datatestid: string, text: string) =>
    this.page.locator(
      `xpath=(//div[@data-testid="${datatestid}"]//button[text()="${text}"])`,
    );
  btnclose = (Close: string) =>
    this.page.locator(`xpath=(//button[.//span[text()='${Close}']])`);
  popupService = () => this.page.locator(`xpath=(//div[@role='dialog'])`);
  uptimeValueByTime = (timeLabel: string): Locator =>
    this.page
      .locator('[data-testid="uptime-item"]', { hasText: timeLabel })
      .locator("span")
      .last();
  //#endregion
  //#region Actions
  //Click to open top service popup
  async clicktopservice(datatestid: string, text: string): Promise<void> {
    const button = this.btntopservice(datatestid, text);
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click();
  }
  //Click to close top service popup
  async clickbtnClose(btnclose: string): Promise<void> {
    const button = this.btnclose(btnclose);
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click();
  }
  //Verify popup list of service
  async verifyPopup(popupLocator: Locator, state: PopupState): Promise<void> {
    const isOpen = state === "open";
    if (isOpen) {
      await popupLocator.waitFor({ state: "visible", timeout: 5000 });
      await expect(popupLocator).toBeVisible();
      return;
    }
    await expect(popupLocator).toBeHidden();
  }
  //Verify Uptime UI values match with API response
  async verifyAllLatencyMetrics(meanlatency: string): Promise<void> {
    await this.page.waitForTimeout(2500);
    const actualBody = this.capturedLatencyJson;
    if (!actualBody)
      throw new Error(`[Error] Failed to capture latency API response.`);
    const actualSummary = actualBody?.current?.summary;
    const apiP95Summary = parseFloat(
      actualSummary.p95?.value?.toString().replace(/[^0-9.]/g, "") ?? "0",
    );
    const apiP99Summary = parseFloat(
      actualSummary.p99?.value?.toString().replace(/[^0-9.]/g, "") ?? "0",
    );
    const cardRawText =
      (await this.page
        .locator(`[data-testid="${meanlatency}"]`)
        .textContent()) ?? "";
    const matchP95 = cardRawText.match(/([\d,.]+)\s*ms\s*for\s*95th/);
    const matchP99 = cardRawText.match(/([\d,.]+)\s*ms\s*for\s*99th/);
    const uiP95Num = parseFloat(
      matchP95 ? matchP95[1].replace(/[^0-9.]/g, "") : "0",
    );
    const uiP99Num = parseFloat(
      matchP99 ? matchP99[1].replace(/[^0-9.]/g, "") : "0",
    );
    console.log(`\n[LOG] SUMMARY METRICS COMPARISON`);
    console.log(`| Metric | UI Value (ms) | API Value (ms) | Status |`);
    console.log(`|--------|---------------|----------------|--------|`);
    console.log(
      `| P95    | ${uiP95Num.toString().padStart(13, " ")} | ${apiP95Summary.toFixed(2).padStart(14, " ")} | ${Math.abs(uiP95Num - apiP95Summary) <= 2 ? "Pass ✅" : "Fail ❌"} |`,
    );
    console.log(
      `| P99    | ${uiP99Num.toString().padStart(13, " ")} | ${apiP99Summary.toFixed(2).padStart(14, " ")} | ${Math.abs(uiP99Num - apiP99Summary) <= 2 ? "Pass ✅" : "Fail ❌"} |`,
    );
    const timeSeries = actualBody?.timeSeries || [];
    console.log(`\n[LOG] TIME-SERIES DATA (API SOURCE)`);
    console.log(`| ID  | Date  | Time | P95 API (ms)| P99 API (ms)|`);
    console.log(`|-----|-------|------|-------------|-------------|`);
    for (let i = 0; i < timeSeries.length; i++) {
      const dp = timeSeries[i];
      const dateObj = new Date(dp.timestamp);
      const dateStr = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      const timeStr = dateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const p95A = Number(dp.p95).toFixed(0);
      const p99A = Number(dp.p99).toFixed(0);
      console.log(
        `| ${String(i + 1).padStart(3, " ")} ` +
          `| ${dateStr} ` +
          `| ${timeStr.padEnd(5, " ")} ` +
          `| ${p95A.padStart(12, " ")} |` +
          ` ${p99A.padStart(12, " ")} |`,
      );
    }
    expect(uiP95Num).toBeGreaterThanOrEqual(apiP95Summary - 2);
    expect(uiP95Num).toBeLessThanOrEqual(apiP95Summary + 2);
    expect(uiP99Num).toBeGreaterThanOrEqual(apiP99Summary - 2);
    expect(uiP99Num).toBeLessThanOrEqual(apiP99Summary + 2);
  }
  //#endregion
}
//#endregion
