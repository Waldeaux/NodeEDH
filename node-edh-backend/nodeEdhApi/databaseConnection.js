
var mysql = require('mysql');
var con;
async function createConnection(){
    con = mysql.createConnection({
        host:'nodeedhdb.cwlxyhjp27tf.us-east-1.rds.amazonaws.com',
        port:'3306',
        user:'tswalden95',
        password:'NodeEDH1594567533236395!'
    });
    var promise = new Promise(resolve => {
        con.connect(function(error){
            if(error) throw error;
            resolve();
        });
    }).then(resolve => {
        return new Promise(resolve => {
        con.query("use NodeEDH");
        resolve();
        })
    })
    await promise;
    return con;
}
createConnection();
module.exports = con;