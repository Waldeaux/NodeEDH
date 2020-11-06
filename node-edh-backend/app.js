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
        console.log("connected");
        con.query("use NodeEDH");
        resolve();
    });})
    await promise;

    app.get('/decks',function(req, res){
        let query = "select * from decks";
        con.query(query, function(err, result){
            if(err) {
                console.log(err);
                res.end(JSON.stringify([]));
                return;
            };
            console.log(result);
            res.end(JSON.stringify(result));
        })
    });

    app.listen(8081, function(){

    })
}