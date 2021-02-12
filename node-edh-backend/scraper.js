const { mainModule } = require('process');
var mysql = require('mysql');
const puppeteer = require('puppeteer');

var con;
var query = "";
main();
async function main(){
    await multiverseIdScraping();
    await populateMultiverse();
}
async function populateMultiverse(){
    con = mysql.createConnection({
        host:'nodeedh.cwlxyhjp27tf.us-east-1.rds.amazonaws.com',
        port:'3306',
        user:'tswalden95',
        password:'Tsw1594567533236395!'
    });
    var promise = new Promise(resolve => {
        con.connect(function(error){
            if(error) throw error;
            con.query("use NodeEDH");
            resolve();
        });
    })
    await promise;
    console.log("connected to database");
    await new Promise(resolve => {
        con.query(query, function(err, result){
            if(err) {
                console.log(err);
                return;
            };
            resolve();
        })
    })
    console.log("success!");
}

async function multiverseIdScraping(){
    
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = (await browser.pages())[0];
    await page.goto('https://gatherer.wizards.com/Pages/Advanced.aspx');
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // declare promise
    await page.click('#wizardCookieBannerOptOut');
    const newPage = await newPagePromise;
    await newPage.close();  
    await page.type('#autoCompleteSourceBoxsetAddText0_InnerTextBox', 'Commander Legends');
    await page.click('#ctl00_ctl00_MainContent_Content_setAdd');
    await Promise.all([
        page.waitForNavigation(),
        page.click('#ctl00_ctl00_MainContent_Content_filterSubmit'),
    ]);
    let x = 1;
    while(true){
          x = 1;
        while(true){
            try{
                await Promise.all([
                    page.waitForNavigation(),
                    page.click('.cardItemTable table:nth-child(' + x +') .cardTitle a')
                ]);
            }
            catch{
                break;
            }
            const url = page.url();
            const regex = /\bmultiverseid=\b[0-9]+[?]?/;
            const result = url.match(regex)[0];
            const multiverseId = Number.parseInt(result.split('=')[1]);
            let element = await page.$('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContentHeader_subtitleDisplay')
            let name = await page.evaluate(el => el.textContent, element);
            name = name.trim();
            name = name.replace(/'/g, '\\\'');
            console.log(name);
            query += ("UPDATE `NodeEDH`.`cards` SET `multiverseId` = "+ multiverseId + " WHERE `name` = '" + name + "' and `setCode` = 'CMR';");
            await Promise.all([
                page.waitForNavigation(),
                page.goBack()
            ]);
            x++;
        }
        let element = await page.$('#ctl00_ctl00_ctl00_MainContent_SubContent_topPagingControlsContainer a:last-child')
        if(!element){
            break;
        }
        else{
            await Promise.all([
                page.waitForNavigation(),
                page.click('#ctl00_ctl00_ctl00_MainContent_SubContent_topPagingControlsContainer a:last-child')
            ]);
        }
    }
}

async function insertScraping(){
    
}