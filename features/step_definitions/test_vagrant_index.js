const { Given, Then, When, And} = require('cucumber');
const { By } = require('selenium-webdriver');
const World = require('../support/world');
const url = require('url');
const http = require("http");

var propertiesReader = require('properties-reader');
var properties = propertiesReader('features/varianceLogic.file');

var assert = require('assert').strict;

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

Given(/^I go to NDTV website$/, () => World.goToNdtvPage());

When(/^I open the weather page$/, async () => {
await snooze(1000);

await World.driver.findElement(By.xpath('//a[@class="topnavmore"]')).click();

await snooze(2000);
await World.driver.findElement(By.xpath('//a[contains(@href,"Weather/report")]')).click();
})

When(/^I search temperature of city: (.*)$/, async (cityName) =>{

await snooze(3000);
await World.driver.findElement(By.xpath('//input[@class="searchBox"]')).sendKeys(cityName);

await snooze(2000);
await World.driver.findElement(By.xpath('//input[@id="'+cityName+'"][@type="checkbox"]')).click();
})


Then(/^I should see (.*) city on map with its temperature$/, async (cityName) => {

await snooze(2000);
 let city = await World.driver.findElement(By.xpath('//div[contains(text(),"'+cityName+'")]')).getText();
 console.log(city);

const temperature = await World.driver.findElement(By.xpath('//div[contains(text(),"' + cityName + '")]/preceding-sibling::div/span[@class="tempRedText"]')).getText();


global.temperatureOnNDTV  = temperature.split('')[0] + temperature.split('')[1];
temperatureOnNDTV = temperatureOnNDTV;

console.log('-------------------------------------------NDTV temperature---------------------------')
console.log('temperatureOnNDTV :' + temperatureOnNDTV);

})




When(/^I fetch the weather details using host: (.*), path: (.*) and city: (.*)$/, async (host, path, city) => {

const requestUrl = url.parse(url.format({
    protocol: 'http',
    hostname: host,
    pathname: path,
    query: {
        q: city,
        appid: '7fe67bf08c80ded756e598d6f8fedaea',
        units: 'metric'
    }
}));

console.log("(" + host + path + ")" + "Sending GET request")
 console.log(url.format(requestUrl))
 global.temperature = '';
 http.get(url.format(requestUrl),(resp) => {
        let data = ''
        // A chunk of data has been received.
           resp.on('data', (apiresponse) => {
            console.log("API Response :- " + apiresponse); 
            data += apiresponse;
         });


         // The whole response has been received. Print out the result.
        resp.on('end', () => {
             var jsonResponse = JSON.parse(data);
             console.log('-------------------------------------------------Response--------------------------');
             temperature = jsonResponse.main.temp;
             console.log('Temperature : ' + temperature);
         });


     }).on("error", (err) => {
         console.log("GET Error: " + err);
     });
})

Then(/^I should match the temperature with NDTV website as per variance condition$/ , async () => {

await snooze(4000);

var property =  properties.get('varianceTolerance');
console.log('varianceTolerance : ' + property);

console.log('Difference between temperatures: ' + Math.abs(temperature - temperatureOnNDTV));

/**************
Below code compares the difference between
Temperature recorded on NDTV weather portal and Temperature fetched via API
with the variance condition
***************/

return assert.ok( Math.abs(temperature - temperatureOnNDTV) <= property);

})
