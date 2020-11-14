var express = require('express');
var mysql = require('mysql');
var app = express();
var cors = require('cors');
app.use(express.json());
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
            let query = "SELECT c.name, dc.count, c.multiverseId FROM NodeEDH.cards as c join NodeEDH.deck_cards as dc on dc.card_id = c.id where dc.deck_id = " + req.params.id + ";"
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
    app.put('/decks/:id', async function(req, res){
        let promiseArray = [];
        let name = req.body.name;
        console.log(name);
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
            console.log(resolve);
            //For each submitted card, check if it exists, and if it does, check if the count needs to be updated
            cardIdList.forEach(submitCard =>{
                let cardExists = false;
                let countSame = false;
                let index = -1;
                resolve.forEach((currentCard, key) =>{
                    console.log(submitCard.id);
                    console.log(key);
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
                console.log(cardExists);
                //If the card already exists in that deck, update the record if the count is different
                //Then remove the card from the currentDeckList for optimization and removal later on
                if(cardExists){
                    if(!countSame){
                        //Update
                        promiseArray.push(updateCardCount(deckId, submitCard.id, submitCard.count))
                    }
                    console.log("remove");
                    resolve.splice(index, 1);
                }
    
                //If it doesn't exist, add a record for it to that deck
                else{
                    //Insert
                    console.log(submitCard);
                    promiseArray.push(insertDeckCard(deckId, submitCard.id,submitCard.count))
                }
            });

            console.log(resolve);
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

    app.listen(8081, function(){

    })
}

function getCard(card){
    let query = `select id from NodeEDH.cards where name = "${card.cardText}" limit 1;`
    return new Promise(resolve =>{
        con.query(query, function(err, result){
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

function updateCardCount(deckId, cardId, count){
    let query = "UPDATE `NodeEDH`.`deck_cards` set `count` = " + count+ " WHERE deck_id = "+deckId+" and card_id = " + cardId +";"
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
    console.log(deckId);
    console.log(name);
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