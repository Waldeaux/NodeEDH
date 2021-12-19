var con = require('../databaseConnection');

const { resolve } = require('path');
var getCard = require('../helpers.func').getCard;
const controllerEndpoints = [];
controllerEndpoints.push(
    function(app){
    app.get('/decks',function(req, res){
        let query = "select * from decks order by name";
        con.query(query, function(err, result){
            if(err) {
                res.end(JSON.stringify([]));
                return;
            };
            res.end(JSON.stringify(result));
        })
    });
})
controllerEndpoints.push(
    function(app){
        app.get('/decks/:id', async function(req, res){
            getCards(req.params.id, res);
        })
    }
)

async function getCards(deckId, res){
    let query = "select * from decks where iddecks = " + deckId;
        let deckPromise = new Promise(resolve =>{
            con.query(query, function(err, result){
                resolve(result[0]);
            })
        }).then(async(resolve) =>{
            let mainboardQuery = "SELECT if(c.layout in ('adventure', 'transform', 'modal_dfc', 'flip', 'meld'), c.faceName,c.name) as name, dc.count, c.multiverseId, c.id FROM NodeEDH.cards as c join NodeEDH.deck_cards as dc on dc.card_id = c.id where dc.deck_id = " + deckId + " and dc.board='main' order by name;"
            let sideboardQuery = "SELECT if(c.layout in ('adventure', 'transform', 'modal_dfc', 'flip', 'meld'), c.faceName,c.name) as name, dc.count, c.multiverseId, c.id FROM NodeEDH.cards as c join NodeEDH.deck_cards as dc on dc.card_id = c.id where dc.deck_id = " + deckId + " and dc.board='side' order by name;"
            let boardResults = [];
            boardResults.push(new Promise(resolve =>{
                con.query(mainboardQuery, function(err, result){
                    resolve(result);
                })
            }));
            boardResults.push(new Promise(resolve =>{
                con.query(sideboardQuery, function(err, result){
                    resolve(result);
                })
            }));
            await Promise.all(boardResults).then(result =>{
                let resultObject = {
                    name:resolve.name,
                    draft:resolve.draft,
                    cards:result[0],
                    sideboard:result[1]
                };
                res.end(JSON.stringify(resultObject));
            })
        })
}
controllerEndpoints.push(
    function(app){
        app.post('/decks', async function(req, res){
            let name = req.body.name;
            let cards = req.body.cards;
            let promiseArray = [];
            errorArray = [];
            let deckId = -1;
            let cardsList = [];
            cards.concat(req.body.sideboard).forEach(x =>{
                promiseArray.push(getCard(x));
            })
            await Promise.all(promiseArray).then(resolve =>{
                if(errorArray.length > 0){
                    
                    return Promise.reject(errorArray.map(x => x.name).join(', '));
                }
                cardsList = resolve;
                return createDeck(name);
            })
            .then(resolve =>{
                let promiseArray = [];
                deckId = resolve;
                cardsList.forEach(element =>{
                    promiseArray.push(insertDeckCard(deckId, element.id, element.count, element.board));
                })

                return Promise.all(promiseArray);
            })
            .then(resolve =>{
                    res.write(deckId.toString());
                    return true;
                }
            )
            .catch(error =>{
                res.status(400);
                res.write(`Cards not found: ${error}`);
            });
            res.end();
        })
    }
)
controllerEndpoints.push(
    function(app){
        app.put('/decks/:id', async function(req, res){
            let promiseArray = [];
            let name = req.body.name;
            let draft = req.body.draft;
            let cards = req.body.cards;
            var cardIdList = [];
            let deckId = req.params.id;
                //For each unique card name submitted, get the appropriate id
                cards.concat(req.body.sideboard).forEach(x =>{
                    promiseArray.push(getCard(x));
                })
                await Promise.all(promiseArray).then(result =>{
                    cardIdList = result;
                    resolve();
                })
                .then(resolve =>{
                    //Get the current cards of the updating deck
                    return new Promise(resolve =>{
                        let query = "select count, card_id, board from deck_cards where deck_id = " + deckId + " order by card_id";
                        con.query(query, function(err, result){
                            resolve(result);
                        })
                    })
                })
                .then(resolve =>{

                    let promiseArray = [];
                    promiseArray.push(updateDeckName(deckId, name, draft));
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
                            if(submitCard.id === currentCard.card_id && submitCard.board === currentCard.board){
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
                                promiseArray.push(updateCardCount(deckId, submitCard.id, submitCard.count, submitCard.board))
                            }
                            resolve.splice(index, 1);
                        }
            
                        //If it doesn't exist, add a record for it to that deck
                        else{
                            //Insert
                            promiseArray.push(insertDeckCard(deckId, submitCard.id,submitCard.count,submitCard.board))
                        }
                    });
                    //Any cards remaining in the current deck array need to be removed. They are not in the most recently submitted deck list
                    resolve.forEach(currentCard =>{
                        //Delete
                        promiseArray.push(deleteDeckCard(deckId, currentCard.card_id, currentCard.board))
                    })

                    return Promise.all(promiseArray).then(x =>{
                        Promise.resolve();
                    })

                });
            res.end(JSON.stringify([]));
        })
    }
)

controllerEndpoints.push(
    function(app){
        app.delete('/decks/:id', async function(req, res){
            let deckId = req.params.id;
            await deleteDeck(deckId);
            res.end(JSON.stringify([]));
        })
    }
)
module.exports = controllerEndpoints;
function updateDeckName(deckId, name,draft){
    let query = "UPDATE `NodeEDH`.`decks` set `name` = \"" + name+ "\", `draft`=\"" + (draft ? 1:0) + "\" WHERE iddecks = "+deckId +";"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}function createDeck(name){
    let query = "INSERT INTO `NodeEDH`.`decks` (`name`) VALUES(\"" + name + "\");"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve(result.insertId);
        })
    })
}

function deleteDeckCard(deckId, cardId, board){
    let query = "Delete from `NodeEDH`.`deck_cards` WHERE deck_id = "+deckId+" and card_id = " + cardId +" and board = '" + board + "';"
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
function insertDeckCard(deckId, cardId, count,board){
    let query = "INSERT INTO `NodeEDH`.`deck_cards` (`deck_id`,`card_id`,`count`, `board`) VALUES (" + deckId + ", "+ cardId +"," + count+ ",'" + board +"');"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}


function updateCardCount(deckId, cardId, count, board){
    let query = "UPDATE `NodeEDH`.`deck_cards` set `count` = " + count+ " WHERE deck_id = "+deckId+" and card_id = " + cardId +" and board = '" + board + "';"
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve();
        })
    })
}