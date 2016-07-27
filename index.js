/**
 * Created by kael on 15/5/28.
 */

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
// init db client here
var dbmgr = require('./utils/dbconnectorS');

// load config
var sc = require('./utils/staticConfigs');

// api controllers
var route_table = require('./routeTable');
//
//app.use(express.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// middleware after body parsed
var decrypt = require('./utils/decryptMiddleware');
app.use(decrypt);

// ip function
//var ipmid = require('./utils/ipMiddleware');
//app.use(ipmid);

// middleware count statistics
var statistics = require('./utils/statisticsMiddleware');
app.use(statistics);
// init routes
//app.get('/login',function(req,res){
//    res.write("<html><h1>hello sir</h1></html>");
//})
for(var key in route_table){
    app.use('/api',route_table[key]);
}

app.set('port', process.env.PORT || 8080);

var MongoClient = require('mongodb').MongoClient;
var redis = require("redis");
var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
    var ip_mongo = process.env.MONGODB_PORT_27019_TCP_ADDR || 'localhost';
    //var ip_redis = process.env.REDISDB_PORT_6379_TCP_ADDR || 'localhost';
    //var redis_client = redis.createClient(6379,ip_redis,null);
    var url = 'mongodb://'+ip_mongo+':27017/test';
    MongoClient.connect(url,function(err,db){
        if(err){
            console.log(err);
            server.stop();
        }else{
            // 授权
            db.authenticate('fizzo','a008040',function(err){
                dbmgr.mongo = db;
                //dbmgr.redis = redis_client;
                //var textDb = dbmgr.mongo.collection('club');
                //textDb.find().toArray(function(err,doc){
                //    console.log(doc[0].nm)
                //});
                //sc.loadCfg();
            });
        }
    });
});

// mongo --port 27017 -u kael -p 2932615qian --authenticationDatabase kael
//var assert = require('assert');
//var fs = require('fs');

//var url = 'mongodb://localhost:27017/kael';
//// test code
//MongoClient.connect(url, function(err, db) {
//    //assert.equal(null, err);
//    console.log("Connected correctly to server");
//    var collection = db.collection('User');
//    collection.find({a:{$gt:100}}).toArray(function(err, docs) {
//        console.log("Found the following records");
//        console.dir(docs);
//        db.close();
//    });
//});