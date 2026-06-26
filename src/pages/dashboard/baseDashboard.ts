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

  private normalizeUptimeColor(cssColor: string): string {
    const map: Record<string, string> = {
      "rgb(243, 86, 37)": "red", // < 98%
      "rgb(245, 158, 11)": "orange", // 98% - 99%
      "rgb(40, 202, 158)": "green", // >= 99%
    };
    return map[cssColor] ?? "unknown";
  }

  // Percent → expected color theo business rule (red, orange, green)
  private getExpectedUptimeColor(percentage: number): string {
    if (percentage < 98) return "red";
    if (percentage < 99) return "orange";
    return "green";
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
  //header
  logoImage = () => this.page.locator('xpath=//img[@alt="Logo"]');
  logoText = () => this.page.locator('xpath=//span[@class="text-[#00205C]"]');
  userName = () =>
    this.page.locator(
      'xpath=//span[@class="text-sm font-medium text-gray-700"]',
    );
  userEmail = () =>
    this.page.locator('xpath=//span[@class="text-xs text-neutral-500"]');
  logoutButton = () => this.page.locator('xpath=//button[text()="Logout"]');

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

  //verify logo
  async verifyLogo(): Promise<void> {
    await expect(this.logoImage()).toBeVisible();
  }
  //verify logo text
  async verifyLogoText(): Promise<void> {
    await expect(this.logoText()).toHaveText("DVCS Ops Insights");
  }

  //Verify username and email
  async verifyUserFullName(expectedName: string): Promise<void> {
    await expect(this.userName()).toHaveText(expectedName);
  }

  async verifyUserEmail(expectedEmail: string): Promise<void> {
    await expect(this.userEmail()).toHaveText(expectedEmail);
  }

  //Verify logout button is visible
  async verifyLogoutButton(): Promise<void> {
    await expect(this.logoutButton()).toBeVisible();
  }

  // Verify UI Uptime overall
  // Verify color of all uptime periods
  async verifyAllUptimeColors(): Promise<void> {
    const timePeriods = ["Last 1h", "Last 24h", "Last 7d", "Last 30d"];

    for (const period of timePeriods) {
      // use locator to get the value
      const valueSpan = this.uptimeValueByTime(period);
      await valueSpan.waitFor({ state: "visible", timeout: 10000 });

      // get text content of the value
      const valueText = (await valueSpan.textContent()) ?? "";
      const percentage = parseFloat(valueText.replace("%", ""));
      const cssColor = await valueSpan.evaluate(
        (el) => (el as HTMLElement).style.color,
      );

      const actualColor = this.normalizeUptimeColor(cssColor);
      const expectedColor = this.getExpectedUptimeColor(percentage);

      console.log(
        `[Uptime] ${period}: ${percentage}% → color: ${actualColor} (expected: ${expectedColor})`,
      );

      expect(actualColor).toBe(expectedColor);
    }
  }
  //#endregion
}
//#endregion
