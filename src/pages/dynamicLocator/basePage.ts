import { Page, expect, Locator } from "playwright/test";
import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

export class BasePage {
  static selectTenant(tenantName: string) {
    throw new Error("Method not implemented.");
  }
  protected page: Page;
  readonly tenantDropdown: Locator;
  constructor(page: Page) {
    this.page = page;
    this.page = page;
    this.tenantDropdown = page.locator('button[data-testid="tenant-dropdown"]');
    this.page.setDefaultTimeout(30_000);
  }

  //#region Locators
  txtGeneralInputField = (name: string) =>
    this.page.locator(`xpath=//input[@name='${name}']`);
  private get btncombobox() {
    return (flag: string) =>
      this.page.locator(`button[role="combobox"]:has([aria-label="${flag}"])`);
  }
  btnByText = (text: string) =>
    this.page.locator(
      `xpath=(//button[@type="submit" and normalize-space()="${text}"])`,
    );
  btnfilter = (datatestid: string) =>
    this.page.locator(
      `xpath=(//div[@data-testid="${datatestid}"]//button[@type="button" and @role="combobox"])`,
    );
  timerange = (datatestid: string, timerange: string) =>
    this.page.locator(
      `xpath=(//div[@data-testid="${datatestid}"]//button[normalize-space()="${timerange}"])[1]`,
    );
  clickbarchart = (barchart: string, barchartindex: number) =>
    this.page.locator(
      `xpath=(//span[contains(.,'${barchart}')]/following::div[@data-state='closed' and contains(@class,'cursor-pointer')])[${barchartindex}]`,
    );
  selectboxfilter = (submodule: string, color: string) =>
    this.page.locator(
      `xpath=//button[contains(.,'${submodule}')]//div[contains(@class,'${color}')]`,
    );
  expandService = (expandservice: string) =>
    this.page.locator(`xpath=(//span[.="${expandservice}"]/../button)`);
  btntopic = (text: string) =>
    this.page.locator(
      `xpath=(//div//p[normalize-space()='${text}']/ancestor::div[contains(@class,'cursor-pointer')])`,
    );
  btnOpenDropdownListTenant = (filter: string) =>
    this.page.locator(
      `xpath=(//form//button[.//span[normalize-space()='${filter}']])`,
    );
  //#endregion
  //#region Actions
  // URL navigation
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.waitForLoadState("domcontentloaded", { timeout: 30000 });
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectTextVisible(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }
  //#endregion
  //#region Actions
  // Function to click button using this locator
  async clickButtonByText(text: string): Promise<void> {
    const button = this.btnByText(text);
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click();
  }
  //Click to open dropdown list to select tenant
  async clickButtonBycombobox(flag: string): Promise<void> {
    const button = this.btncombobox(flag);
    await button.waitFor({ state: "visible", timeout: 5000 });
    await button.click();
  }
  //Click to select incident detail
  async selectDropdownByText(
    selectId: string,
    optionText: string | null,
  ): Promise<void> {
    if (!optionText) return;
    const select = this.page.locator(`select#${selectId}`);
    await select.waitFor({ state: "visible" });
    await select.selectOption({ label: optionText });
  }
  //Click to open dropdown filter
  async clickFilter(datatestid: string): Promise<void> {
    const button = this.btnfilter(datatestid);
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click();
  }
  //Select option in dropdown filter
  async clickOptionFilter(option: string): Promise<void> {
    const opt = this.page.getByRole("option", { name: option });
    await opt.waitFor();
    await opt.click();
  }
  //Select tenant option
  async selectOptionFromCombobox(optionText: string): Promise<void> {
    const option = this.page.locator(`text=${optionText}`);
    await option.waitFor({ state: "visible", timeout: 30000 });
    await option.click();
  }
  //Click to expand list of service
  async clickExpandListOfService(expandservice: string): Promise<void> {
    const expandListOfServiceLocator = this.expandService(expandservice);
    await expandListOfServiceLocator.waitFor({
      state: "visible",
      timeout: 10000,
    });
    await expandListOfServiceLocator.click();
  }
  //Select time range
  async selectTimerange(datatestid: string, timerange: string): Promise<void> {
    const option = this.timerange(datatestid, timerange);
    await option.waitFor({ state: "visible", timeout: 15000 });
    await option.click({ timeout: 15000 });
  }
  //Input email to textbox to login
  async fillInGeneralInputField(nameOrId: string, value: string | null) {
    if (!value) return;
    const input = this.txtGeneralInputField(nameOrId);
    await input.waitFor({ state: "visible" });
    await input.fill(value);
  }
  //Click any barchart in dashboard by module name
  async clickBarchart(barchart: string, barchartindex: number): Promise<void> {
    const button = this.clickbarchart(barchart, barchartindex);
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click();
  }
  //Click filter "Total pending lag/Critical Issues"
  async clickBtnTotalPendingLag(text: string): Promise<void> {
    const button = this.btntopic(text);
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click();
  }
  //Click to open checkbox list tenant
  async clickBtnOpenDropdownListTenant(text: string): Promise<void> {
    const button = this.btnOpenDropdownListTenant(text);
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click();
  }
  // Verify the filter displays the number of selected countries
  async verifyCountryFilter(expected: string): Promise<void> {
    await expect(this.btnOpenDropdownListTenant(expected)).toHaveText(expected);
  }
  //#endregion
}

//#endregion
