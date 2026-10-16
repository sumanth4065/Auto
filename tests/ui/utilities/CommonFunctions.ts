import { Page } from '@playwright/test';
//const faker = require('faker');
import faker from 'faker';
let generatedDates = [];

/* function get_DateTime() {
    //"TX","258"
    let newDate = new Date();
    let datetimestr = (newDate.getMonth() + 1) + "_" + newDate.getDate() + "_" + newDate.getFullYear() + "_" + newDate.getTime()
    return datetimestr

} */

function get_DateAndTime(): [string, string] {
    const newDate: Date = new Date();

    const randomDaysAgo: number = Math.floor(Math.random() * (180 - 10 + 1)) + 10;
    newDate.setDate(newDate.getDate() - randomDaysAgo);

    const mm: string = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd: string = String(newDate.getDate()).padStart(2, '0');
    const yyyy: number = newDate.getFullYear();
    const datestr: string = `${mm}/${dd}/${yyyy}`;

    let hours: number = newDate.getHours();
    const minutes: string = String(newDate.getMinutes()).padStart(2, '0');
    const ampm: string = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // if hours is 0, make it 12
    const hourStr: string = String(hours).padStart(2, '0');
 
    const timestr: string = `${hourStr}:${minutes}${ampm}`;
 
    console.log(`Test Data Created -> Date: ${datestr}, Time: ${timestr}`);
 
    return [datestr, timestr];
}
/* function get_DateAndTime() {
    let newDate = new Date();
    let today = new Date();
    let randomMonths = Math.floor(Math.random() * 2) + 6; 
    newDate.setMonth(newDate.getMonth() - randomMonths);

    let lastDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    let maxDay = lastDayOfMonth;
    if (randomMonths === 0) {
        maxDay = today.getDate(); 
    }

    let randomDay = Math.floor(Math.random() * maxDay) + 1;
    newDate.setDate(randomDay);
    let dateKey = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;

    while (generatedDates.includes(dateKey)) {
        newDate = new Date();
        today = new Date();
        randomMonths = Math.floor(Math.random() * 2) + 6 ; 
        newDate.setMonth(newDate.getMonth() - randomMonths);

        lastDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
        maxDay = lastDayOfMonth;

        if (randomMonths === 0) {
            maxDay = today.getDate(); 
        }
        randomDay = Math.floor(Math.random() * maxDay) + 1;
        newDate.setDate(randomDay);
        dateKey = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    }
    generatedDates.push(dateKey);

    const formatData = (input) => {
        return input > 9 ? input : `0${input}`;
    };

    const formatHour = (input) => {
        return input > 12 ? input - 12 : input;
    };
    let datestr = `${formatData(newDate.getMonth() + 1)}/${formatData(newDate.getDate())}/${newDate.getFullYear()}`;
    let HH = formatData(formatHour(newDate.getHours()));
    let MM = formatData(newDate.getMinutes());
    let timestr = `${HH}:${MM}AM`;

    console.log(datestr);
    return [datestr, timestr];

} */
function get_FirstName() {
    return faker.name.firstName();

}
function get_LastName() {
    return faker.name.lastName();

}
function get_CompanyName() {
    return faker.company.companyName();
}
function get_Email() {
    return get_FirstName() + "@qa.com";
}
function get_StreetAddress() {
    return faker.address.streetAddress();
}
function get_City() {
    return faker.address.city();
}
function get_PhoneNumber() {
    return faker.phone.phoneNumberFormat();
}
function get_Text() {
    try {
        return faker.lorem.sentences();
    } catch (error) {
        console.error()

    }
}
function get_RandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // console.log(atob(base64));
    // var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    //     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    // }).join(''));

    var jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString().split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);

};
function getAutoPolicy(scopeItem, state) {
    let fscope;
    switch (state) {
        case 'CA':
            fscope = 'CAA';
            break;
        case 'TX':
            fscope = 'TPA';
            break;
        case 'MO':
            fscope = 'MOA';
            break;
        case 'EC':
            fscope = 'PAA';
            break;
        case 'HI':
            fscope = 'HIA';
            break;
        case 'NM':
            fscope = 'NMA';
            break;
        case 'TW':
            fscope = 'VAA';
            break;
        case 'NNE':
            fscope = 'MEA';
            break;
        default:
            fscope = 'CAA';
    }
    let autopolicynum;
    if (scopeItem.find(item => item.includes(fscope))) {
        autopolicynum = scopeItem.find(item => item.includes(fscope)).substr(22, 12);
    }
    else {
        autopolicynum = 0;
        //console.log("No home policy found");
    }
    return autopolicynum;
}
function getHomePolicy(scopeItem, state) {
    let fscope;
    switch (state) {
        case 'CA':
            fscope = 'CHO';
            break;
        case 'TX':
            fscope = 'THO';
            break;
        default:
            fscope = 'CHO';
    }
    let homepolicynum;
    if (scopeItem.find(item => item.includes(fscope))) {
        homepolicynum = scopeItem.find(item => item.includes(fscope)).substr(22, 12);
    }
    else {
        homepolicynum = 0;
        //console.log("No home policy found");
    }
    return homepolicynum;
}
function getEAQPolicy(scopeItem, state) {
    let fscope;
    switch (state) {
        case 'CA':
            fscope = 'CEA';
            break;
        case 'TX':
            fscope = 'THO';
            break;
        default:
            fscope = 'CEA';
    }
    let eaqpolicynum;
    if (scopeItem.find(item => item.includes(fscope))) {
        eaqpolicynum = scopeItem.find(item => item.includes(fscope)).substr(22, 12);
    }
    else {
        eaqpolicynum = 0;
        //console.log("No home policy found");
    }
    return eaqpolicynum;
}
export async function reloadIfPageBlank(
  page: Page,
  checkInterval: number = 1000,
  timeout: number = 50000
): Promise<void> {
  const startTime = Date.now();
 
  await page.waitForLoadState('domcontentloaded');

  while (Date.now() - startTime < timeout) {
    let isBlank = true;

    try {
      isBlank = await page.evaluate(() => {
        if (!document.body) return true;
        return document.body.innerText.trim().length === 0;
      });
    } catch (err){
      console.log('Retrying evaluate...');
    }

    if (!isBlank) return;

    await page.waitForTimeout(checkInterval);
  }

  console.warn('Page remained blank after timeout, reloading...');
  await page.reload();
}

module.exports = {
    get_FirstName, get_StreetAddress, get_City, get_PhoneNumber, get_RandomColor, get_LastName, get_Email, get_CompanyName, parseJwt, getAutoPolicy, get_DateAndTime, getHomePolicy, getEAQPolicy,reloadIfPageBlank
}