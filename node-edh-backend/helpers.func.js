
var con = require('./databaseConnection');
exports.getCard = function (card){
    let name = card.cardText;
    name = name.replace('\'','').replace(',','');
    let query = `select id from NodeEDH.cards where standardized_name = "${name}" limit 1;`
    return new Promise(resolve =>{
        con.query(query, function(err, result){
            if(result.length == 0){
                errorArray.push({error:true, name});
                resolve({error:true, name});
            }
            else{
                resolve({id:result[0].id, count:card.count, board:card.board});
            }
        })
    })
}