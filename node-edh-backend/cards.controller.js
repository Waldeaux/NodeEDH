var con = require('./databaseConnection');

const { resolve } = require('path');
const controllerEndpoints = [];
controllerEndpoints.push(function(app){
    app.get('/cards/:id', async function(req, res){
        let cardId = req.params.id;
        let inventoryCount = await getInventoryCount(cardId);
        let decks = await getDecksByCard(cardId);
        let result = {
            name:decks.name,
            total:inventoryCount,
            locations:decks.locations,
            unused:inventoryCount - decks.locations.map(x => x.count).reduce((accumulator, currentValue) => accumulator + currentValue)
        }
        res.end(JSON.stringify(result));
    })
})
controllerEndpoints.push(
    function(app){
        app.post('/cards', async function(req, res){
            let promiseArray = [];
            req.body.forEach(card =>{
                promiseArray.push(insertCard(card));
            })
            Promise.all(promiseArray).then(x =>{
                console.log(x);
                res.end(JSON.stringify([]));
            });
        })
    }
)
module.exports = controllerEndpoints;


function getInventoryCount(cardId){
    let query = "select SUM(i.count) as count from cards c "
    query += "join cards name_cards on c.name = name_cards.name "
    query += "left join inventory i on name_cards.id = i.idcards "
    query += `where c.id = ${cardId};`
        return new Promise(resolve =>{
            con.query(query, function(err, result){
            resolve(result[0].count);
        })
    })
}


function getDecksByCard(cardId){
    let query = "select d.name as locations, dc.count, c.name as cardName from cards c "
    query += "join cards name_cards on c.name = name_cards.name "
    query += "join deck_cards dc on name_cards.id = dc.card_id "
    query += "left join decks d on dc.deck_id = d.iddecks "
    query += `where c.id = ${cardId};`
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve({
                name:result[0].cardName,
                locations:result.map(x => {return {location:x.locations,count:x.count}})});
        })
    })
}


function insertCard(card){
    let query = "INSERT INTO `NodeEDH`.`cards` (`artist`, `asciiName`, `availability`, `borderColor`, `cardKingdomFoilId`,"
    query += "`cardKingdomId`, `colorIdentity`, `colorIndicator`, `colors`, `convertedManaCost`, `duelDeck`, `edhrecRank`, `faceConvertedManaCost`, `faceName`, "
    query += "`flavorName`, `flavorText`, `frameEffects`, `frameVersion`, `hand`, `hasAlternativeDeckLimit`, `hasContentWarning`,"
    query += "`hasFoil`, `hasNonFoil`, `isAlternative`, `isFullArt`, `isOnlineOnly`, `isOversized`, `isPromo`, `isReprint`,"
    query += "`isReserved`, `isStarter`, `isStorySpotlight`, `isTextless`, `isTimeshifted`, `keywords`, `layout`, `leadershipSkills`, `life`, `loyalty`,"
    query += "`manaCost`, `mcmId`, `mcmMetaId`, `mtgArenaId`, `mtgjsonV4Id`, `mtgoFoilId`, `mtgoId`, `multiverseId`, `name`, `number`, `originalReleaseDate`,"
    query += "`originalText`, `originalType`, `otherFaceIds`, `power`, `printings`, `promoTypes`, `purchaseUrls`, `rarity`,"
    query += "`scryfallId`, `scryfallIllustrationId`, `scryfallOracleId`, `setCode`, `side`, `subtypes`, `supertypes`, `tcgplayerProductId`, `text`, `toughness`,"
    query += "`type`, `types`, `uuid`, `variations`, `watermark`, `standardized_name`) VALUES"
    query += `('${card.artist}',`
    query += `'${card.asciiName}',`
    query += `'${card.availability}',`
    query += `'${card.borderColor}',`
    query += `${card.cardKingdomFoilId},`
    query += `${card.cardKingdomId},`
    query += `'${card.colorIdentity}',`
    query += `'${card.colorIndicator}',`
    query += `'${card.colors}',`
    query += `${card.convertedManaCost},`
    query += `'${card.duelDeck}',`
    query += `${card.edhrecRank},`
    query += `${card.faceConvertedManaCost},`
    query += `'${card.faceName}',`
    query += `'${card.flavorName}',`
    query += `'${card.flavorText}',`
    query += `'${card.frameEffects}',`
    query += `'${card.frameVersion}',`
    query += `'${card.hand}',`
    query += `${card.hasAlternativeDeckLimit},`
    query += `${card.hasContentWarning},`
    query += `${card.hasFoil},`
    query += `${card.hasNonFoil},`
    query += `${card.isAlternative},`
    query += `${card.isFullArt},`
    query += `${card.isOnlineOnly},`
    query += `${card.isOversized},`
    query += `${card.isPromo},`
    query += `${card.isReprint},`
    query += `${card.isReserved},`
    query += `${card.isStarter},`
    query += `${card.isStorySpotlight},`
    query += `${card.isTextless},`
    query += `${card.isTimeshifted},`
    query += `'${card.keywords}',`
    query += `'${card.layout}',`
    query += `'${card.leadershipSkills}',`
    query += `'${card.life}',`
    query += `'${card.loyalty}',`
    query += `'${card.manaCost}',`
    query += `'${card.mcmId}',`
    query += `'${card.mcmMetaId}',`
    query += `'${card.mtgArenaId}',`
    query += `'${card.mtgjsonV4Id}',`
    query += `'${card.mtgoFoilId}',`
    query += `'${card.mtgoId}',`
    query += `'${card.multiverseId}',`
    query += `'${card.name}',`
    query += `'${card.number}',`
    query += `'${card.originalReleaseDate}',`
    query += `'${card.originalText}',`
    query += `'${card.originalType}',`
    query += `'${card.otherFaceIds}',`
    query += `'${card.power}',`
    query += `'${card.printings}',`
    query += `'${card.promoTypes}',`
    query += `'${card.purchaseUrls}',`
    query += `'${card.rarity}',`
    query += `'${card.scryfallId}',`
    query += `'${card.scryfallIllustrationId}',`
    query += `'${card.scryfallOracleId}',`
    query += `'${card.setCode}',`
    query += `'${card.side}',`
    query += `'${card.subtypes}',`
    query += `'${card.supertypes}',`
    query += `'${card.tcgplayerProductId}',`
    query += `'${card.text}',`
    query += `'${card.toughness}',`
    query += `'${card.type}',`
    query += `'${card.types}',`
    query += `'${card.uuid}',`
    query += `'${card.variations}',`
    query += `'${card.watermark}',`
    query += `'${card.standardized_name}');`
    query = query.replace(/\'undefined\'/g, 'null');
    query = query.replace(/undefined/g, 'null');
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve(result);
        })
    })
}