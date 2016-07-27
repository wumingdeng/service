/**
 * Created by kael on 15/5/28.
 */

var express=require('express');
var schemeName = 'User';

var db_proxy = require('../utils/dbconnectorS');
var user_router=express.Router();

user_router.route('/users').get(function(req,res){
    console.log('get');
    var db = db_proxy.mongo.collection(schemeName);
    db.find().toArray(function(err,doc){
        res.json(doc);
    });
}).post(function(req,res){
    console.log('post');
    var db = db_proxy.mongo.collection(schemeName);
    db.save(req.body,{},function(err){
        if(err){
            res.json({ok:0});
        }else{
            res.json({ok:1});
        }
    });
});

user_router.route('/users/:id').get(function(req,res){
    console.log('getone');
    var db = db_proxy.mongo.collection(schemeName);
    var x_idx = req.params.id;
    db.findOne({x:1},{_id:1,x:1},null,function(err,doc){
        if(err){
            res.json({ok:0});
        }else{
            if(doc == null){
                res.json({});
            }else{
                res.json(doc);
            }
        }
    });
}).put(function(req,res){
    console.log('put');
    var db = db_proxy.mongo.collection(schemeName);
    var x_idx = req.body.x;
    var newy = req.body.y;
    db.updateOne({x:x_idx},{$set:{y:newy}},null,function(err){
        if(err){
            res.json({ok:0});
        }else{
            res.json({ok:1});
        }
    });
}).delete(function(req,res){delet
    console.log('delete');
    var db = db_proxy.mongo.collection(schemeName);
    //var x_idx = req.body.x;
    var x_idx = Number(req.query.x);
    db.removeOne({x:x_idx},null,function(err){
        if(err){
            res.json({ok:0});
        }else{
            res.json({ok:1});
        }
    });
});

module.exports=user_router;
