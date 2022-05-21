const cardInsert = require('./card-insert.js').CardInsert
const { mainModule } = require('process');
var mysql = require('mysql');
const puppeteer = require('puppeteer');
var page;
var con;
var query = "";
var queryValues = [];
var globalSetCode = "SNC"
var setName = 'Streets of New Capenna';
var browser;
var symbolSwitch = symbolSwitchFunction;
main();
async function main(){
    composeQuery();
    try{
    await insertScraping();
    await queryDb();
    }
    catch(e){
        console.log(queryValues);
    }
    browser.close();
    return;
}
async function queryDb(){
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
    await new Promise(resolve => {
        con.query(query, [queryValues], function(err, result){
            if(err) {
                return;
            };
            resolve();
        })
    }).then(() => {
    })
}

async function goBack(){
    await Promise.all([
        page.waitForNavigation(),
        page.goBack()
    ]);
}

async function clearCookieNotification(){
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // declare promise
    await page.click('#wizardCookieBannerOptOut');
    //const newPage = await newPagePromise;
    //await newPage.close();
}

async function insertScraping(){
    browser = await puppeteer.launch({
        headless: false,
    });
    page = (await browser.pages())[0];
    await page.goto('https://gatherer.wizards.com/Pages/Advanced.aspx');
    //await clearCookieNotification();
    await page.type('#autoCompleteSourceBoxsetAddText0_InnerTextBox', setName);
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
            let cardObject = new cardInsert();
            cardObject.multiverseId = result.split('=')[1];
            let name = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContentHeader_subtitleDisplay`);
            let faceName = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=nameRow] .value`);
            if(name != faceName){
                console.log("name");
                console.log("faceName");
                await goBack();
                x++;
                continue;
            }
            let layoutTest = await page.$(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ArtistCredit`);
            if(!layoutTest){
                let firstVariationLinkIds = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 a.variationLink`, nodes => nodes.map(n => n.id));
                let secondVariationLinkIds = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent1 a.variationLink`, nodes => nodes.map(n => n.id));
                let isFront = firstVariationLinkIds.every(x =>{
                    return secondVariationLinkIds.includes((parseInt(x)+1).toString());
                });
                if(isFront)
                {
                    await dynamicInsertModalCard();
                }
                await goBack();
                x++;
                continue;
            }
            
            cardObject.artist = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_artistRow .value a`);
            cardObject.cmc = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cmcRow .value`);
            cardObject.number = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_numberRow .value`);
            let type = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_typeRow .value`)
            let imageChildren = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_textRow img`, nodes => nodes.map(n => n.alt));
            imageChildren = imageChildren.map(x => symbolSwitch(x));
            let text = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_textRow .cardtextbox`, nodes => nodes.map(n => n.innerHTML));
            let textString= text.join('\n');
            for(let x = 0; x < imageChildren.length; x++){
                textString = textString.replace(/<img[ A-Za-z0-9?;&="\/.]+>/, `{${imageChildren[x]}}`);
            }
            let manaCost = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_manaRow .value img`, nodes => nodes.map(n => n.alt));
            let manaCostText = manaCost.map(x =>symbolSwitch(x)
            ).join('}{');
            if(manaCostText.length >0){
                manaCostText = `{${manaCostText}}`
            }
            let ptType = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ptRow .label`);
        
            let ptText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ptRow .value`);
            let power = 0;
            let toughness = 0;
            let loyalty = 0;
            if(ptType == 'Loyalty:'){
                loyalty = ptText;
            }
            else{
                let pt = ptText.split('/');
                if(pt.length > 1){
                    power = pt[0].trim();
                    toughness = pt[1].trim();
                }
            }
            let typeArray = type.split(/[ ]+/);
            let typeindex = typeArray.indexOf('—');
            let subtypesFound = true;
            let supertypes = [];
            let subtypes = [];
            let possibleTypes = ['Land', 'Creature', 'Artifact', 'Planeswalker', 'Sorcery', 'Instant', 'Enchantment', 'Tribal'];
            let types = [];
            if(typeindex == -1){
                typeindex = typeArray.length;
                subtypesFound = false;
            }
            if(typeindex > 0){
                if(subtypesFound){
                    supertypes = typeArray.slice(0, typeindex);
                }
                else{
                    supertypes = typeArray;
                }
            }
            if(subtypesFound){
                subtypes = typeArray.slice(typeindex + 1, typeArray.length + 1);
            }
        
            supertypes.forEach((element, index) => {
                if(possibleTypes.includes(element)){
                    supertypes.splice(index, 1);
                    types.push(element);
                }
            });
            cardObject.typeString = types.join(',');
            cardObject.supertypeString = supertypes.join(',');
            cardObject.subtypeString = subtypes.join(',');
            cardObject.flavorText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_FlavorText .value`);
            cardObject.rarity = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_rarityRow .value span`);
            cardObject.setCode = globalSetCode;
            cardObject.standardized_name = name.replace(/[',\-]*/g, '');
        
            let colors = [];
            let colorIdentity = [];
            let possibleColors = ['W', 'U', 'B', 'R', 'G'];
            possibleColors.forEach(x =>{
                if(colorIdentitySearch(x, manaCostText)){
                    colors.push(x);
                    colorIdentity.push(x);
                }
                else if(colorIdentitySearch(x, textString)){
                    colorIdentity.push(x);
                }
            })
            cardObject.colorString = colors.join(',');
            cardObject.colorIdentityString = colorIdentity.join(',');
        
            textString = textString.replace(/'/g, `\\\'`);
            console.log(name);
            cardObject.loyalty = loyalty;
            cardObject.manaCostText = manaCostText;
            cardObject.faceName = name;
            cardObject.name = name;
            cardObject.power = power;
            cardObject.textString = textString;
            cardObject.toughness = toughness;
            cardObject.type = type;
            cardObject.layout = 'normal';
            
            insertQueryValues(cardObject);
            await goBack();
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
    page.close();
}

async function dynamicInsertModalCard(){
    const url = page.url();
    const regex = /\bmultiverseid=\b[0-9]+[?]?/;
    const result = url.match(regex)[0];
    let cardObject = new cardInsert();
    cardObject.multiverseId = result.split('=')[1];
    let faceName = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=nameRow] .value`);
    let backName = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent1 [id*=nameRow] .value`);
    
    cardObject.artist = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=ArtistCredit] a`);
    cardObject.cmc = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=cmcRow] .value`);
    cardObject.number = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=numberRow] .value`);
    let type = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=typeRow] .value`)
    let imageChildren = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=textRow] img`, nodes => nodes.map(n => n.alt));
    imageChildren = imageChildren.map(x => symbolSwitch(x));
    let text = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=textRow] .cardtextbox`, nodes => nodes.map(n => n.innerHTML));
    let textString= text.join('\n');
    for(let x = 0; x < imageChildren.length; x++){
        textString = textString.replace(/<img[ A-Za-z0-9?;&="\/.]+>/, `{${imageChildren[x]}}`);
    }
    let backText = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=textRow] .cardtextbox`, nodes => nodes.map(n => n.innerHTML));
    let backTextString= backText.join('\n');
    for(let x = 0; x < imageChildren.length; x++){
        backTextString = backTextString.replace(/<img[ A-Za-z0-9?;&="\/.]+>/, `{${imageChildren[x]}}`);
    }
    let manaCost = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=manaRow] .value img`, nodes => nodes.map(n => n.alt));
    let manaCostText = manaCost.map(x =>symbolSwitch(x)
    ).join('}{');
    if(manaCostText.length >0){
        manaCostText = `{${manaCostText}}`
    }
    let backManaCost = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent1 [id*=manaRow] .value img`, nodes => nodes.map(n => n.alt));
    let backManaCostText = backManaCost.map(x =>symbolSwitch(x)
    ).join('}{');
    if(backManaCostText.length >0){
        backManaCostText = `{${backManaCostText}}`
    }
    let ptType = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=ptRow] .label`);

    let ptText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=ptRow] .value`);
    let power = 0;
    let toughness = 0;
    let loyalty = 0;
    if(ptType == 'Loyalty:'){
        loyalty = ptText;
    }
    else{
        let pt = ptText.split('/');
        if(pt.length > 1){
            power = pt[0].trim();
            toughness = pt[1].trim();
        }
    }
    cardObject.power = power;
    cardObject.toughness = toughness;
    cardObject.loyalty = loyalty;
    let typeArray = type.split(/[ ]+/);
    let typeindex = typeArray.indexOf('—');
    let subtypesFound = true;
    let supertypes = [];
    let subtypes = [];
    let possibleTypes = ['Land', 'Creature', 'Artifact', 'Planeswalker', 'Sorcery', 'Instant', 'Enchantment', 'Tribal'];
    let types = [];
    if(typeindex == -1){
        typeindex = typeArray.length;
        subtypesFound = false;
    }
    if(typeindex > 0){
        if(subtypesFound){
            supertypes = typeArray.slice(0, typeindex);
        }
        else{
            supertypes = typeArray;
        }
    }
    if(subtypesFound){
        subtypes = typeArray.slice(typeindex + 1, typeArray.length + 1);
    }

    supertypes.forEach((element, index) => {
        if(possibleTypes.includes(element)){
            supertypes.splice(index, 1);
            types.push(element);
        }
    });
    cardObject.typeString = types.join(',');
    cardObject.supertypeString = supertypes.join(',');
    cardObject.subtypeString = subtypes.join(',');
    cardObject.flavorText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=FlavorText] .value`);
    cardObject.rarity = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=rarityRow] span`);
    cardObject.setCode = globalSetCode;
    cardObject.standardized_name = faceName.replace(/[',\-]*/g, '');

    let colors = [];
    let colorIdentity = [];
    let combinedTextString = textString + ' ' + backTextString;
    let possibleColors = ['W', 'U', 'B', 'R', 'G'];
    possibleColors.forEach(x =>{
        if(colorIdentitySearch(x, manaCostText)){
            colors.push(x);
        }
    })
    let combinedManaCostText = manaCostText + ' ' + backManaCostText;
    possibleColors.forEach(x =>{
        if(colorIdentitySearch(x, combinedManaCostText)){
            colorIdentity.push(x);
        }
        else if(colorIdentitySearch(x, combinedTextString)){
            colorIdentity.push(x);
        }
    })
    cardObject.colorString = colors.join(',');
    cardObject.colorIdentityString = colorIdentity.join(',');

    cardObject.name = faceName + ' // ' + backName;

    textString = textString.replace(/'/g, `\\\'`);
    cardObject.manaCostText = manaCostText;
    cardObject.faceName = faceName;
    cardObject.textString = textString;
    cardObject.type = type;
    cardObject.layout = "transform";
    insertQueryValues(cardObject);
    return Promise.resolve();
}

async function getInnerContent(selector){
    let name = '';
    try{
        let element = await page.$(selector);
        name = await page.evaluate(el => el.textContent, element);
        name = name.trim();
    }
    catch{
    }
    return name;
}

function colorIdentitySearch(input, text){
    input = `{${input}}`;
    return text.search(input) > 0;
}

function symbolSwitchFunction(x){
        switch(x){
            case('White'):
                return 'W';
                case('Blue'):
                    return 'U';
                case('Black'):
                    return 'B'; 
            case('Red'):
            return 'R';
            case('Green'):
            return 'G';
            case('Tap'):
            return 'T';
            case('Snow'):
            return 'S';
            case('Variable Colorless'):
            return 'X';
            default:
                return x;
        }
}

function composeQuery(){
    query = " INSERT INTO cards"
    + "(artist,"
    + "colorIdentity,"
    + "colors,"
    + "convertedManaCost,"
    + "flavorText,"
    + "loyalty,"
    + "manaCost,"
    + "multiverseId,"
    + "faceName,"
    + "name,"
    + "number,"
    + "uuid,"
    + "power,"
    + "rarity,"
    + "setCode,"
    + "subtypes,"
    + "supertypes,"
    + "text,"
    + "toughness,"
    + "type,"
    + "types,"
    + "standardized_name,"
    + "layout)"
    + "VALUES ?";
}

function insertQueryValues(cardObject){
    if(!(cardObject instanceof cardInsert)){
        return;
    }
    queryValues.push(cardObject.getQueryValues());
}