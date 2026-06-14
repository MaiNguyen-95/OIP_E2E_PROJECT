import { When, Then, Before } from "@cucumber/cucumber";
//View all service
When(
  "From {string} I click {string}",
  async function (datatestid: string, text: string) {
    await this.baseDashboard.clicktopservice(datatestid, text);
    await this.page.waitForTimeout(2000);
  },
);
//Click to close popup Services latency
When(
  "I click to {string} button to close popup Services latency",
  async function (btnclose: string) {
    await this.baseDashboard.clickbtnClose(btnclose);
  },
);
//Verify popup list of service
Then("I verify popup is {string}", async function (state: string) {
  await this.baseDashboard.verifyPopup(
    this.baseDashboard.popupService(),
    state as "open" | "closed",
  );
});
//Verify UI Uptime values match with API response
Then(
  "I verify uptime for {string} matches API field {string}",
  async function (timeLabel: string, apiKey: string) {
    await this.baseDashboard.verifyDynamicUptimeMatchesApi(timeLabel, apiKey);
  },
);
//Verify UI Latency values match with API response
Then(
  "I verify both {string} and {string} latency metrics for {string} timerange on card {string} match API",
  async function (p95Label, p99Label, timerange, cardName) {
    await this.baseDashboard.verifyAllLatencyMetrics(cardName, timerange);
  },
);
