var config = {};
var db_proxy = require('./dbconnectorS');

function loadInside(tableName,callback){
    var collection = db_proxy.mongo.collection(tableName);
    collection.find({},{_id:0}).toArray(function(err, docs) {
        if(!err){
            config[tableName] = docs;
            callback();
        }
    });
}

function loadAllConfig(){
    // fucking ugly
    loadInside('prizeConfig',function(){
        loadInside('signDailyConfig',function(){
            loadInside('taskConfig', function(){
                loadInside('activityConfig', function () {
                    loadInside('petConfig', function () {
                        // run activity check
                        // timer staff
                        var ts = require('./cronTasks');
                        ts.cCrons();
                        ts.aCrons();
                    });
                });
            });
        });
    });
}

module.exports = {
    cfg:config,
    loadCfg:loadAllConfig
}