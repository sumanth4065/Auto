import { chromium, FullConfig } from '@playwright/test';
import { MyOptions } from './utilities/TestFixture';
import { LoginPage } from './pages/pageRepository/LoginPage';

async function globalSetup(config: FullConfig, options: MyOptions) {
  const projectArg = process.argv.find(arg => arg.includes('project'));
  const projectname = projectArg.split("=")[1];
  const currentprojectname: any = config.projects.find((project) => project.name === projectname);
  const { storageState, username, password, env, clubname } = currentprojectname.use;
  const browser = await chromium.launch({ headless: true });
  //const context = await browser.newContext();
  //await context.clearCookies();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.goToHomePage(username, password, clubname, env);
  await page.context().storageState({ path: `${storageState}` });
  await browser.close();
}

export default globalSetup;