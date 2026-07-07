import { Given } from '@cucumber/cucumber';
import { BaseDashboard } from '../../pages/dashboard/dashboardPage';
import { CustomWorld } from '@support/world';

Given('User opens the dashboard page', async function (this: CustomWorld) {
  const dashboardPage = new BaseDashboard(this.page);
  await dashboardPage.navigateTodashboardPage();
});
