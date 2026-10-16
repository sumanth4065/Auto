import { Page } from '@playwright/test';
import { HomePage } from '../pages/pageRepository/HomePage';
import { EmailAddressPage } from '../pages/pageRepository/EmailAddressPage';
import { TestBase } from '../lib/TestBase';
export class AuthenticationWorkflow  {
    private page: Page;
  private homePage: HomePage;
  private emailAddressPage: EmailAddressPage;
  private token: string;
  private guid: string;
  private baseURL: string;
  private clubname: string;
  private region: string;
  private env: string;
  private username: string;
  private password: string;

     constructor(page: Page, token?: string, guid?: string, baseURL?: string, clubname?: string, region?: string, env?: string, username?: string, password?: string) {
     this.page = page;
    this.homePage = new HomePage(page);
    this.emailAddressPage = new EmailAddressPage(page);
    this.token = token || '';
    this.guid = guid || '';
    this.baseURL = baseURL || '';
    this.clubname = clubname || '';
    this.region = region || '';
    this.env = env || '';
    this.username = username || '';
    this.password = password || '';
   }

    async authenticateAndVerifyEmail(ptoken?: any, pbaseurl?: any, pguid?: any, pclubname?: any, pregion?: any, penv?: any, pusername?: any, ppassword?: any){
        // Support both old pattern (with parameters) and new pattern (using instance properties)
        const token = ptoken !== undefined ? ptoken : this.token;
        const baseURL = pbaseurl !== undefined ? pbaseurl : this.baseURL;
        const guid = pguid !== undefined ? pguid : this.guid;
        const clubname = pclubname !== undefined ? pclubname : this.clubname;
        const region = pregion !== undefined ? pregion : this.region;
        const env = penv !== undefined ? penv : this.env;
        const username = pusername !== undefined ? pusername : this.username;
        const password = ppassword !== undefined ? ppassword : this.password;
        
        await this.homePage.goToBehindLoginPage(token, baseURL, guid, clubname, region, env, username, password);
        await this.homePage.loginToApplication(username, password);
        await this.emailAddressPage.verifyEmailAndClickAskMeLaterBtn();
  }

}