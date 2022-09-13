var express = require('express');
var app = express();
var cors = require('cors');
app.use(express.json({limit:'10mb'}));
app.use(cors());
const endpoints = require('./controllers/controllers.module');
main();
function initializeEndpoints(endpoints){
    Object.values(endpoints).forEach(_ =>{
        switch(typeof(_)){
            case('object'):
                initializeEndpoints(_);
                break;
            case('function'):
                _(app);
                break;
        }
    });
}
app.get('/', function (req, res) {
    res.status(200);
    res.write('Success!');
    res.end();
})
async function main(){
    
    initializeEndpoints(endpoints);
    const port = process.env.PORT || 8081;
    app.listen(port, function(){
    })
}