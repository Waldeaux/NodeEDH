var express = require('express');
var app = express();
var cors = require('cors');
app.use(express.json({limit:'10mb'}));
app.use(cors());
const endpoints = require('./controllers.module');
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
async function main(){
    
    initializeEndpoints(endpoints);
    app.listen(8081, function(){
    })
}