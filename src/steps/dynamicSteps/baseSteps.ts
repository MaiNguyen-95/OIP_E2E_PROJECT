import { Given, Then, When } from "@cucumber/cucumber";
import { CustomWorld } from "../../support/world";

// Fill input
When(
  "I fill input {string} with {string}",
  async function (inputName: string, value: string) {
    await this.basePage.fillInGeneralInputField(inputName, value);
  },
);
// Click button login
When("I click button {string}", async function (text: string) {
  await this.basePage.clickButtonByText(text);
});
//Click to open dropdown filter
When("I click filter {string}", async function (datatestid: string) {
  await this.basePage.clickFilter(datatestid);
});
//Select option in dropdown filter
When(
  "I selects {string} option on filter",
  async function (filtername: string) {
    await this.basePage.clickOptionFilter(filtername);
    await this.page.waitForTimeout(3000);
  },
);
//Select timerange
When(
  "I select {string} timerange {string}",
  async function (timerange: string, datatestid: string) {
    await this.basePage.selectTimerange(datatestid, timerange);
    await this.page.waitForTimeout(2000);
  },
);
//Click to expand list of service
When(
  "I click to expand list of service at {string}",
  async function (expandservice: string) {
    await this.basePage.clickExpandListOfService(expandservice);
    await this.page.waitForTimeout(2000);
  },
);
//function to Login with magic link
Given(
  "I select tenant {string} when clicking {string}",
  { timeout: 120 * 1000 },
  async function (this: CustomWorld, tenant: string, flag: string) {
    await this.basePage.goto(this.config.baseUrl);
    await this.basePage.fillInGeneralInputField("email", "huyen.le@yara.com");
    await this.basePage.clickButtonByText("Send login link");
    const outlookContext = await this.context.browser()!.newContext({
      storageState: "outlook-auth.json",
    });
    try {
      const outlookPage = await outlookContext.newPage();
      await outlookPage.goto("https://outlook.office.com/mail");
      await outlookPage.waitForSelector("div[role='main']", { timeout: 60000 });
      let magicLink: string | null = null;
      for (let i = 0; i < 12; i++) {
        console.log(`Checking inbox attempt ${i + 1}`);
        await outlookPage.reload();
        await outlookPage.waitForSelector("div[role='option']", {
          timeout: 20000,
        });
        await outlookPage.waitForTimeout(5000);
        const emails = outlookPage.locator("div[role='option']");
        const count = await emails.count();
        console.log("Email count:", count);
        for (let j = 0; j < count; j++) {
          const email = emails.nth(j);
          const text = await email.innerText();
          console.log(`Email ${j}:`, text);
          if (!text.includes("Login to DVCS Ops Insights")) {
            continue;
          }
          console.log("Found login email");
          await email.click();
          await outlookPage.waitForSelector(
            "text=We've received a login request",
          );
          const linkElement = outlookPage.locator("a:has-text('Log In')");
          await linkElement.waitFor({
            state: "visible",
            timeout: 30000,
          });
          magicLink = await linkElement.getAttribute("href");
          break;
        }
        if (magicLink) {
          break;
        }
        console.log("Hasn't found login email...");
        await outlookPage.waitForTimeout(5000);
      }
      if (!magicLink) {
        throw new Error("Cannot find login link");
      }
      console.log("LOGIN LINK:", magicLink);
      await this.page.goto(magicLink, {
        waitUntil: "domcontentloaded",
      });
      await this.page.waitForLoadState("networkidle");
    } finally {
      await outlookContext.close();
    }
    await this.page.waitForURL(
      `${process.env.BASE_URL}/en-us/dashboard?countryCode=gh`,
    );
    await this.basePage.clickButtonBycombobox(flag);
    await this.basePage.selectOptionFromCombobox(tenant);
  },
);
