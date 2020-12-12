var express = require('express');
var mysql = require('mysql');
var app = express();
var cors = require('cors');
app.use(express.json({limit:'10mb'}));
app.use(cors());
var https = require('https');
const { resolve } = require('path');
var con;
main();
async function main(){
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
    });})
    await promise;

    app.get('/decks',function(req, res){
        let query = "select * from decks";
        con.query(query, function(err, result){
            if(err) {
                res.end(JSON.stringify([]));
                return;
            };
            res.end(JSON.stringify(result));
        })
    });

    app.get('/decks/:id', function(req, res){
        let query = "select * from decks where iddecks = " + req.params.id;
        let deckPromise = new Promise(resolve =>{
            con.query(query, function(err, result){
                resolve(result[0]);
            })
        }).then(resolve =>{
            let query = "SELECT if(c.layout in ('adventure', 'transform', 'modal_dfc', 'flip', 'meld'), c.faceName,c.name) as name, dc.count, c.multiverseId FROM NodeEDH.cards as c join NodeEDH.deck_cards as dc on dc.card_id = c.id where dc.deck_id = " + req.params.id + " order by name;"
            con.query(query, function(err, result){
                let resultObject = {
                    name:resolve.name,
                    cards:result
                };
                res.end(JSON.stringify(resultObject));
            });
        })

    })

    app.post('/decks', async function(req, res){
        let name = req.body.name;
        let cards = req.body.cards;
        let promiseArray = [];
        let deckId = -1;
        let cardsList = [];
        cards.forEach(x =>{
            promiseArray.push(getCard(x));
        })
        await Promise.all(promiseArray).then(resolve =>{
            cardsList = resolve;
            return createDeck(name);
        })
        .then(resolve =>{
            let promiseArray = [];
            deckId = resolve;
            cardsList.forEach(element =>{
                promiseArray.push(insertDeckCard(deckId, element.id, element.count));
            })

            return Promise.all(promiseArray);
        });

        res.end(deckId.toString());
        
    })
    app.get('/inventory', async function(req, res){
        getInventory().then(response =>{
            res.end(JSON.stringify(response));
        })
    })
    app.put('/decks/:id', async function(req, res){
        let promiseArray = [];
        let name = req.body.name;
        let cards = req.body.cards;
        var cardIdList = [];
        let deckId = req.params.id;
            //For each unique card name submitted, get the appropriate id
            cards.forEach(x =>{
                promiseArray.push(getCard(x));
            })
            await Promise.all(promiseArray).then(result =>{
                cardIdList = result;
                resolve();
            })
            .then(resolve =>{
                //Get the current cards of the updating deck
                return new Promise(resolve =>{
                    let query = "select count, card_id from deck_cards where deck_id = " + deckId + " order by card_id";
                    con.query(query, function(err, result){
                        resolve(result);
                    })
                })
            })
            .then(resolve =>{

                let promiseArray = [];
                promiseArray.push(updateDeckName(deckId, name));
                //Order the submitted cards by card id
                cardIdList = cardIdList.sort((a,b) =>{
                    if(a.id < b.id){
                        return -1;
                    }
                    return 1;
                });
                resolve = resolve.sort((a,b) =>{
                    
                    if(a.card_id < b.card_id){
                        return -1;
                    }
                    return 1;
                })
                //For each submitted card, check if it exists, and if it does, check if the count needs to be updated
                cardIdList.forEach(submitCard =>{
                    let cardExists = false;
                    let countSame = false;
                    let index = -1;
                    resolve.forEach((currentCard, key) =>{
                        if(submitCard.id === currentCard.card_id){
                            cardExists = true;
                            index = key;
                            if(submitCard.count === currentCard.count){
                                countSame = true;
                            }
                            return false;
                        }
                        if(submitCard.id < currentCard.card_id){
                            return false;
                        }
                    })
                    //If the card already exists in that deck, update the record if the count is different
                    //Then remove the card from the currentDeckList for optimization and removal later on
                    if(cardExists){
                        if(!countSame){
                            //Update
                            promiseArray.push(updateCardCount(deckId, submitCard.id, submitCard.count))
                        }
                        resolve.splice(index, 1);
                    }
        
                    //If it doesn't exist, add a record for it to that deck
                    else{
                        //Insert
                        promiseArray.push(insertDeckCard(deckId, submitCard.id,submitCard.count))
                    }
                });
                //Any cards remaining in the current deck array need to be removed. They are not in the most recently submitted deck list
                resolve.forEach(currentCard =>{
                    //Delete
                    promiseArray.push(deleteDeckCard(deckId, currentCard.card_id))
                })

                return Promise.all(promiseArray).then(x =>{
                    Promise.resolve();
                })

            });
        res.end(JSON.stringify([]));
    })

    app.get('/inventory/comparison', async function(req, res){
        await getNeededCards().then(result =>{
            res.end(JSON.stringify(result));
        })
    })

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

    app.delete('/decks/:id', async function(req, res){
        let deckId = req.params.id;
        await deleteDeck(deckId);
        res.end(JSON.stringify([]));
    })

    app.put('/inventory', async function(req, res){
        let promiseArray = [];
        let inventory = req.body.inventory;
        var cardIdList = [];
        var currentCard;
        //For each unique card name submitted, get the appropriate id
        try{
            inventory.forEach(x =>{
                currentCard = x;
                console.log(currentCard);
                promiseArray.push(getCard(x));
            })
            await Promise.all(promiseArray).then(result =>{
                cardIdList = result;
                resolve();
            })
            .then(resolve =>{
                //Get the current cards of the updating deck
                return new Promise(resolve =>{
                    let query = "select count, idcards from NodeEDH.inventory order by idcards";
                    con.query(query, function(err, result){
                        resolve(result);
                    })
                })
            })
            .then(resolve =>{
                let promiseArray = [];
                //Order the submitted cards by card id
                cardIdList = cardIdList.sort((a,b) =>{
                    if(a.id < b.id){
                        return -1;
                    }
                    return 1;
                });
                resolve = resolve.sort((a,b) =>{
                    
                    if(a.card_id < b.card_id){
                        return -1;
                    }
                    return 1;
                })
                //For each submitted card, check if it exists, and if it does, check if the count needs to be updated
                cardIdList.forEach(submitCard =>{
                    let cardExists = false;
                    let countSame = false;
                    let index = -1;
                    resolve.forEach((currentCard, key) =>{
                        if(submitCard.id === currentCard.idcards){
                            cardExists = true;
                            index = key;
                            if(submitCard.count === currentCard.count){
                                countSame = true;
                            }
                            return false;
                        }
                        if(submitCard.id < currentCard.idcards){
                            return false;
                        }
                    })
                    //If the card already exists in that deck, update the record if the count is different
                    //Then remove the card from the currentDeckList for optimization and removal later on
                    if(cardExists){
                        if(!countSame){
                            //Update
                            promiseArray.push(updateInventoryCardCount(submitCard.id, submitCard.count))
                        }
                        resolve.splice(index, 1);
                    }
        
                    //If it doesn't exist, add a record for it to that deck
                    else{
                        //Insert
                        promiseArray.push(insertInventoryCard(submitCard.id,submitCard.count))
                    }
                });
                //Any cards remaining in the current deck array need to be removed. They are not in the most recently submitted deck list
                resolve.forEach(currentCard =>{
                    //Delete
                    promiseArray.push(deleteInventoryCard(currentCard.idcards))
                })

                return Promise.all(promiseArray).then(x =>{
                    Promise.resolve();
                })
            });
        }
        catch{
            console.log("error")
            console.log(currentCard);
        }
        res.end(JSON.stringify([]));
    })
    app.listen(8081, function(){

    })
}

function getCard(card){
    let name = card.cardText;
    name = name.replace('\'','').replace(',','');
    let query = `select id from NodeEDH.cards where standardized_name = "${name}" limit 1;`
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            console.log(card);
            resolve({id:result[0].id, count:card.count});
        })
    })
}

function insertDeckCard(deckId, cardId, count){
    let query = "INSERT INTO `NodeEDH`.`deck_cards` (`deck_id`,`card_id`,`count`) VALUES (" + deckId + ", "+ cardId +"," + count+ ");"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}

function insertInventoryCard(cardId, count){
    let query = "INSERT INTO `NodeEDH`.`inventory` (`idcards`,`count`) VALUES ("+ cardId +"," + count+ ");"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}
function updateInventoryCardCount(cardId, count){
    let query = "UPDATE `NodeEDH`.`inventory` set `count` = " + count+ " WHERE idcards = " + cardId +";"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}
function updateCardCount(deckId, cardId, count){
    let query = "UPDATE `NodeEDH`.`deck_cards` set `count` = " + count+ " WHERE deck_id = "+deckId+" and card_id = " + cardId +";"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}

function deleteDeck(deckId){
    let query = "delete from `NodeEDH`.`deck_cards` where deck_id = " + deckId + ";"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    }).then(item =>{
        return new Promise(resolve =>{
            query = "Delete from `NodeEDH`.`decks` WHERE iddecks = " + deckId +";"
            con.query(query, function(err, result){
                resolve();
            })
        })
    })
}

function deleteInventoryCard(cardId){
    let query = "Delete from `NodeEDH`.`inventory` WHERE idcards = " + cardId +";"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}
function deleteDeckCard(deckId, cardId){
    let query = "Delete from `NodeEDH`.`deck_cards` WHERE deck_id = "+deckId+" and card_id = " + cardId +";"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}

function updateDeckName(deckId, name){
    let query = "UPDATE `NodeEDH`.`decks` set `name` = \"" + name+ "\" WHERE iddecks = "+deckId +";"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}

function createDeck(name){
    let query = "INSERT INTO `NodeEDH`.`decks` (`name`) VALUES(\"" + name + "\");"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve(result.insertId);
        })
    })
}

function getInventory(){
    let query = "SELECT if(c.layout in ('adventure', 'transform', 'modal_dfc', 'flip', 'meld'), c.faceName, c.name) as name, i.count FROM NodeEDH.inventory i left join NodeEDH.cards c on c.id = i.idcards order by name;";
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve(result);
        })
    })
}

function getNeededCards(){
    let query = "select c.name, SUM(dc.count) as dcCount, if(ic.iCount is null, 0, ic.iCount) as iCount from deck_cards dc left join cards c on c.id = dc.card_id";
    query += " left join (select SUM(count) as iCount, c.name from inventory i left join cards c on c.id = i.idcards group by c.name) ic on c.name = ic.name";
    query += " group by c.name";
    query += " having dcCount > iCount";
    query += " order by c.name";
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve(result);
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