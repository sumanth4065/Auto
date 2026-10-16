const faker = require('faker');


function get_DateAndTime() {
    let newDate = new Date();
    let datetimestr = (newDate.getMonth() + 1) + "_" + newDate.getDate() + "_" + newDate.getFullYear() + "_" + newDate.getTime()
    return datetimestr

}
function get_FirstName() {
    return ("Test-" + faker.name.firstName());
}

function get_StreetAddress() {
    return  faker.address.streetAddress();
}

function get_City() {
    return  faker.address.city();
}

function get_PhoneNumber() {
    return  faker.phone.phoneNumberFormat();
}


module.exports = {
    get_DateAndTime, get_FirstName,get_StreetAddress,get_City,get_PhoneNumber
}