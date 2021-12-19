var con = require('../databaseConnection');

const { resolve } = require('path');
const getCard = require('../helpers.func').getCard
const controllerEndpoints = [];

controllerEndpoints.push(
    function(app){
        app.get('/inventory', async function(req, res){
            getInventory().then(response =>{
                res.end(JSON.stringify(response));
            })
        })
    }
)

controllerEndpoints.push(
    function(app){ 
        app.get('/inventory/comparison', async function(req, res){
            await getNeededCards().then(result =>{
                res.end(JSON.stringify(result));
            })
        })
    }
)

controllerEndpoints.push(
    function(app){
        app.get('/inventory/comparison/:id', async function(req, res){
            await getNeededCardsForDeck(req.params.id).then(result =>{
                res.end(JSON.stringify(result));
            })
        })
    }
)
controllerEndpoints.push(
    function(app){
        app.put('/inventory', async function(req, res){
            let promiseArray = [];
            let inventory = req.body.inventory;
            var cardIdList = [];
            var currentCard;
            //For each unique card name submitted, get the appropriate id
            try{
                inventory.forEach(x =>{
                    currentCard = x;
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
                        let deleteCard = false;
                        resolve.forEach((currentCard, key) =>{
                            if(submitCard.id === currentCard.idcards && submitCard.board === currentCard.board){
                                cardExists = true;
                                index = key;
                                if(submitCard.count === 0){
                                    deleteCard = true;
                                }
                                else if(submitCard.count === currentCard.count){
                                    countSame = true;
                                }
                                return false;
                            }
                            if(submitCard.id < currentCard.idcards){
                                return false;
                            }
                        })
    
                        if(deleteCard){
                            promiseArray.push(deleteInventoryCard(submitCard.id));
                        }
                        //If the card already exists in that deck, update the record if the count is different
                        //Then remove the card from the currentDeckList for optimization and removal later on
                        else if(cardExists){
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
    
                    return Promise.all(promiseArray).then(x =>{
                        Promise.resolve();
                    })
                });
            }
            catch{
            }
            res.end(JSON.stringify([]));
        })
    }
)
module.exports = controllerEndpoints;

function getNeededCards(){
    let query = "select c.name, SUM(dc.count) as dcCount, if(ic.iCount is null, 0, ic.iCount) as iCount from deck_cards dc left join cards c on c.id = dc.card_id";
    query += " left join (select SUM(count) as iCount, c.name from inventory i left join cards c on c.id = i.idcards group by c.name) ic on c.name = ic.name";
    query += " left join decks d on dc.deck_id = d.iddecks where d.draft = false and dc.board != 'side'"
    query += " group by c.name";
    query += " having dcCount > iCount";
    query += " order by c.name";
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve(result);
        })
    })
}

function getNeededCardsForDeck(deckId){
    let query = "select c.name, SUM(dc.count) as dcCount, if(ic.iCount is null, 0, ic.iCount) as iCount from deck_cards dc left join cards c on c.id = dc.card_id";
    query += " left join (select SUM(count) as iCount, c.name from inventory i left join cards c on c.id = i.idcards group by c.name) ic on c.name = ic.name";
    query += " left join decks d on dc.deck_id = d.iddecks"
    query += " where d.iddecks = " + deckId;
    query += " group by c.name";
    query += " having dcCount > iCount";
    query += " order by c.name";
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve(result);
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
function getInventory(){
    let query = "SELECT if(c.layout in ('adventure', 'transform', 'modal_dfc', 'flip', 'meld'), c.faceName, c.name) as name, i.count FROM NodeEDH.inventory i left join NodeEDH.cards c on c.id = i.idcards order by name;";
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            resolve(result);
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