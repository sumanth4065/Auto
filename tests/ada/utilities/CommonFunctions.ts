const faker = require('faker');

function get_DateTime() {
    //"TX","258"
    let newDate = new Date();
    let datetimestr = (newDate.getMonth() + 1) + "_" + newDate.getDate() + "_" + newDate.getFullYear() + "_" + newDate.getTime()
    return datetimestr

}

function get_DateAndTime() {
    let newDate = new Date();
    const formatData = (input) => {
        if (input > 9) {
            return input;
        } else return `0${input}`;
    };
    const formatHour = (input) => {
        if (input === 0) {
            return 12; // Midnight is 12 AM
        }
        if (input > 12) {
            return input - 12;
        }
        return input;
    };

    //let datestr = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + newDate.getFullYear();
    let datestr = (formatData(newDate.getMonth() + 1)) + "/" + formatData(newDate.getDate()) + "/" + newDate.getFullYear();
    let hours = newDate.getHours();
    let HH = formatData(formatHour(hours));
    let MM = formatData(newDate.getMinutes()); // FIX: Don't apply formatHour to minutes!
    let ampm = hours >= 12 ? 'PM' : 'AM'; // FIX: Properly determine AM/PM
    let timestr = `${HH} : ${MM} ${ampm}`; // FIX: Format with spaces and colon "hh : mm aa"

    return [datestr, timestr];

}
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
module.exports = {
    get_DateTime, get_FirstName, get_StreetAddress, get_City, get_PhoneNumber, get_RandomColor, get_LastName, get_Email, get_CompanyName, parseJwt, getAutoPolicy, get_DateAndTime, getHomePolicy, getEAQPolicy
}