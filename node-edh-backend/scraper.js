const { mainModule } = require('process');
var mysql = require('mysql');
const puppeteer = require('puppeteer');
var page;
var con;
var query = "";
var queryValues = [];
var frontFaces = [];
var symbolSwitch = symbolSwitchFunction;
main();
async function main(){
    //await testInsertScrape();
    await insertScraping();
    //await getCardsById();
    console.log(query);
    await queryDb();
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
                console.log(err);
                return;
            };
            resolve();
        })
    })
    console.log("success!");
}

async function getCardsById(){
    const cards = [
        {
            id:503657,
            firstAppend:'_ctl03',
            secondAppend:'_ctl04'
        },
        
        {
            id:503646,
            firstAppend:'_ctl03',
            secondAppend:'_ctl04'
        },
        
        
        {
            id:503766,
            firstAppend:'_ctl03',
            secondAppend:'_ctl04'
        }
        ];
    const browser = await puppeteer.launch({
        headless: false,
    });
    page = (await browser.pages())[0];
    await page.goto('https://gatherer.wizards.com/Pages/Advanced.aspx');
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // declare promise
    await page.click('#wizardCookieBannerOptOut');
    const newPage = await newPagePromise;
    await newPage.close();
    //cards.forEach(async function (element) {
        for(const id of cards){
        await Promise.all([
            page.waitForNavigation(),
            page.goto('https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid='+id.id),
        ]);
        await insertModalCard(id.firstAppend, id.secondAppend);
    }
    //})
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
    
    const browser = await puppeteer.launch({
        headless: false,
    });
    page = (await browser.pages())[0];
    await page.goto('https://gatherer.wizards.com/Pages/Advanced.aspx');
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // declare promise
    await page.click('#wizardCookieBannerOptOut');
    const newPage = await newPagePromise;
    await newPage.close();
    await page.type('#autoCompleteSourceBoxsetAddText0_InnerTextBox', 'Kaldheim');
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
            let layoutAppend = '';
            let name = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContentHeader_subtitleDisplay`);
            let faceName = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=nameRow] .value`);
            if(name != faceName){
            await Promise.all([
                page.waitForNavigation(),
                page.goBack()
            ]);
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
            }
            await Promise.all([
                page.waitForNavigation(),
                page.goBack()
            ]);
                x++;
                continue;
            //name = name.replace(/`/g, `\\\``);
            let artist = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_artistRow .value a`);
            let cmc = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_cmcRow .value`);
            let number = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_numberRow .value`);
            let type = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_typeRow .value`)
            let imageChildren = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_textRow img`, nodes => nodes.map(n => n.alt));
            imageChildren = imageChildren.map(x => symbolSwitch(x));
            let text = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_textRow .cardtextbox`, nodes => nodes.map(n => n.innerHTML));
            let textString= text.join('\n');
            for(let x = 0; x < imageChildren.length; x++){
                textString = textString.replace(/<img[ A-Za-z0-9?;&="\/.]+>/, `{${imageChildren[x]}}`);
            }
            let manaCost = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_manaRow .value img`, nodes => nodes.map(n => n.alt));
            let manaCostText = manaCost.map(x =>symbolSwitch(x)
            ).join('}{');
            if(manaCostText.length >0){
                manaCostText = `{${manaCostText}}`
            }
            let ptType = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_ptRow .label`);
        
            let ptText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_ptRow .value`);
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
            let typeString = types.join(',');
            let supertypeString = supertypes.join(',');
            let subtypeString = subtypes.join(',');
            let flavorText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_FlavorText .value`);
            let rarity = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${layoutAppend}_rarityRow .value span`);
            let setCode = 'STA';
            let standardized_name = name.replace(/[',\-]*/g, '');
        
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
            let colorString = colors.join(',');
            let colorIdentityString = colorIdentity.join(',');
        
            //textString = textString.replace(/'/g, `\\\'`);
            query = " INSERT INTO cards"
            + "(artist,"
            + "colorIdentity,"
            + "colors,"
            + "convertedManaCost,"
            + "flavorText,"
            + "loyalty,"
            + "manaCost,"
            + "multiverseId,"
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
            + "standardized_name)"
            + "VALUES ?";
            queryValues.push([artist,
            colorIdentityString,
            colorString,
            cmc,
            flavorText,
            loyalty,
            manaCostText,
            multiverseId,
            name,
            number,
            number+"-" +setCode,
            power,
            rarity,
            setCode,
            subtypeString,
            supertypeString,
            textString,
            toughness,
            type,
            typeString,
            standardized_name]);
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
    page.close();
}


async function insertModalCard(firstAppend, secondAppend){
    const url = page.url();
    const regex = /\bmultiverseid=\b[0-9]+[?]?/;
    const result = url.match(regex)[0];
    const multiverseId = Number.parseInt(result.split('=')[1]);
    let layoutAppend = '';
    await Promise.all([
        page.waitForSelector(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_nameRow .value`)
    ]);
    let faceName = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_nameRow .value`);
    let backName = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${secondAppend}_nameRow .value`);
    let artist = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_ArtistCredit a`);
    let cmc = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_cmcRow .value`);
    let number = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_numberRow .value`);
    let type = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_typeRow .value`)
    let imageChildren = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_textRow img`, nodes => nodes.map(n => n.alt));
    imageChildren = imageChildren.map(x => symbolSwitch(x));
    let text = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_textRow .cardtextbox`, nodes => nodes.map(n => n.innerHTML));
    let textString= text.join('\n');
    for(let x = 0; x < imageChildren.length; x++){
        textString = textString.replace(/<img[ A-Za-z0-9?;&="\/.]+>/, `{${imageChildren[x]}}`);
    }
    let backText = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_textRow .cardtextbox`, nodes => nodes.map(n => n.innerHTML));
    let backTextString= backText.join('\n');
    for(let x = 0; x < imageChildren.length; x++){
        backTextString = backTextString.replace(/<img[ A-Za-z0-9?;&="\/.]+>/, `{${imageChildren[x]}}`);
    }
    let manaCost = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_manaRow .value img`, nodes => nodes.map(n => n.alt));
    let manaCostText = manaCost.map(x =>symbolSwitch(x)
    ).join('}{');
    if(manaCostText.length >0){
        manaCostText = `{${manaCostText}}`
    }
    let backManaCost = await page.$$eval(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${secondAppend}_manaRow .value img`, nodes => nodes.map(n => n.alt));
    let backManaCostText = backManaCost.map(x =>symbolSwitch(x)
    ).join('}{');
    if(backManaCostText.length >0){
        backManaCostText = `{${backManaCostText}}`
    }
    let ptType = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_ptRow .label`);

    let ptText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_ptRow .value`);
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
    let typeString = types.join(',');
    let supertypeString = supertypes.join(',');
    let subtypeString = subtypes.join(',');
    let flavorText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_FlavorText .value`);
    let rarity = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent${firstAppend}_rarityRow .value span`);
    
    let setCode = 'KHM';
    let standardized_name = faceName.replace(/[',\-]*/g, '');

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
    let colorString = colors.join(',');
    let colorIdentityString = colorIdentity.join(',');

    let combinedName = faceName + ' // ' + backName;

    //textString = textString.replace(/'/g, `\\\'`);
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
    + "standardized_name)"
    + "VALUES ?";
    queryValues.push([artist,
    colorIdentityString,
    colorString,
    cmc,
    flavorText,
    loyalty,
    manaCostText,
    multiverseId,
    faceName,
    combinedName,
    number,
    number+"-" +setCode,
    power,
    rarity,
    setCode,
    subtypeString,
    supertypeString,
    textString,
    toughness,
    type,
    typeString,
    standardized_name]);
    return Promise.resolve();
}

async function dynamicInsertModalCard(){
    const url = page.url();
    const regex = /\bmultiverseid=\b[0-9]+[?]?/;
    const result = url.match(regex)[0];
    const multiverseId = Number.parseInt(result.split('=')[1]);
    let layoutAppend = '';
    let faceName = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=nameRow] .value`);
    let backName = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent1 [id*=nameRow] .value`);
    let artist = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=ArtistCredit] a`);
    let cmc = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=cmcRow] .value`);
    let number = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=numberRow] .value`);
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
    let typeString = types.join(',');
    let supertypeString = supertypes.join(',');
    let subtypeString = subtypes.join(',');
    let flavorText = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=FlavorText] .value`);
    let rarity = await getInnerContent(`#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardComponent0 [id*=rarityRow] span`);
    switch(rarity){
        case('Mythic Rare'):
        rarity = 'mythic';
        break;
    }
    console.log(rarity);
    let setCode = 'KHM';
    let standardized_name = faceName.replace(/[',\-]*/g, '');

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
    let colorString = colors.join(',');
    let colorIdentityString = colorIdentity.join(',');

    let combinedName = faceName + ' // ' + backName;

    //textString = textString.replace(/'/g, `\\\'`);
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
    queryValues.push([artist,
    colorIdentityString,
    colorString,
    cmc,
    flavorText,
    loyalty,
    manaCostText,
    multiverseId,
    faceName,
    combinedName,
    number,
    number+"-" +setCode,
    power,
    rarity,
    setCode,
    subtypeString,
    supertypeString,
    textString,
    toughness,
    type,
    typeString,
    standardized_name,
    "modal_dfc"]);
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