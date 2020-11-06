var express = require('express');
var mysql = require('mysql');
var app = express();
var cors = require('cors');
app.use(cors());
var https = require('https');
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
            let query = "SELECT c.name, dc.count FROM NodeEDH.cards as c join NodeEDH.deck_cards as dc on dc.card_id = c.id where dc.deck_id = " + req.params.id + ";"
            con.query(query, function(err, result){
                let resultObject = {
                    name:resolve.name,
                    cards:result
                };
                res.end(JSON.stringify(resultObject));
            });
        })

    })

    app.listen(8081, function(){

    })
}