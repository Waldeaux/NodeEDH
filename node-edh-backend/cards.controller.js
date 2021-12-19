const controllerEndpoints = [];
controllerEndpoints.push(function(app, con){
    app.get('/cards/:id', async function(req, res){
        let cardId = req.params.id;
        let inventoryCount = await getInventoryCount(cardId, con);
        let decks = await getDecksByCard(cardId, con);
        let result = {
            name:decks.name,
            total:inventoryCount,
            locations:decks.locations,
            unused:inventoryCount - decks.locations.map(x => x.count).reduce((accumulator, currentValue) => accumulator + currentValue)
        }
        res.end(JSON.stringify(result));
    })
})

module.exports = controllerEndpoints;


function getInventoryCount(cardId, con){
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


function getDecksByCard(cardId, con){
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