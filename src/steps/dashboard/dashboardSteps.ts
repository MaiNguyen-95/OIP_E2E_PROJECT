import { When, Then, Before } from '@cucumber/cucumber';
import { BaseDashboard } from '../../pages/dashboard/dashboardPage';
import { CustomWorld } from '@support/world';

//View all service
When('From {string} I click {string}', async function (datatestid: string, text: string) {
  await this.baseDashboard.clicktopservice(datatestid, text);
  await this.page.waitForTimeout(2000);
});
//Click to close popup Services latency
When('I click to {string} button to close popup Services latency', async function (btnclose: string) {
  await this.baseDashboard.clickbtnClose(btnclose);
});
//Verify popup list of service
Then('I verify popup is {string}', async function (state: string) {
  await this.baseDashboard.verifyPopup(this.baseDashboard.popupService(), state as 'open' | 'closed');
});
//Verify UI Uptime values match with API response
Then('I verify uptime for {string} matches API field {string}', async function (timeLabel: string, apiKey: string) {
  await this.baseDashboard.verifyDynamicUptimeMatchesApi(timeLabel, apiKey);
});
//Verify UI Latency values match with API response
Then(
  'I verify both {string} and {string} latency metrics for {string} timerange on card {string} match API',
  async function (p95Label, p99Label, timerange, cardName) {
    await this.baseDashboard.verifyAllLatencyMetrics(cardName, timerange);
  },
);

//Verify Logo
Then('the logo should be displayed correctly', async function (this: CustomWorld) {
  await this.baseDashboard.verifyLogo();
});

//Verify Logo Text
Then('the logo text should be displayed correctly', async function (this: CustomWorld) {
  await this.baseDashboard.verifyLogoText();
});

//Verify usere name, email and logout button
Then('the user name should display {string}', async function (this: CustomWorld, name: string) {
  await this.baseDashboard.verifyUserFullName(name);
});

Then('the user email should display {string}', async function (this: CustomWorld, email: string) {
  await this.baseDashboard.verifyUserEmail(email);
});

Then('the logout button should be visible', async function (this: CustomWorld) {
  await this.baseDashboard.verifyLogoutButton();
});

//verify UI Uptime overall
Then('all uptime period colors should match their percentage thresholds', async function (this: CustomWorld) {
  await this.baseDashboard.verifyAllUptimeColors();
});
