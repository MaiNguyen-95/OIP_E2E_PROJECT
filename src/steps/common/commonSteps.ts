import { Given, Then, When } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';
import { BasePage } from '../../pages/core/basePage';

//#region Step Definitions

// Step input text into a field
When('User inputs {string} in the {string} field', async function (value: string, name: string) {
  const basePage: BasePage = this.basePage;
  await basePage.inputText(name, value);
});

//Step click button
When('User clicks on the {string} button', async function (name: string) {
  const basePage: BasePage = this.basePage;
  await basePage.clickButton(name);
});
