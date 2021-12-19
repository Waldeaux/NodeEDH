const controllerEndpoints = [];
controllerEndpoints.push(function(app, con){
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
module.exports = controllerEndpoints;