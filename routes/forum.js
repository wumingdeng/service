/**
 * Created by czw on 16/2/25.
 */
var express = require('express');
var schemeName = 'forum';
var ObjectId = require('mongodb').ObjectID;
var gv = require('../utils/GlobalVar');
var gf = require('../utils/GlobalFunc');
var db_proxy = require('../utils/dbconnectorS');
var forum_route = express.Router();

//发送讨论区消息
forum_route.route('/forum/sendMsg').post(function (req, res) {
    var zid = req.body.zid;
    var uid = req.body.uid;
    var msg = req.body.msg;
    var nn = req.body.nn;
    var forumDB = db_proxy.mongo.collection(schemeName + Math.floor(zid / 10));
    forumDB.insertOne(
        {uid: uid, zid: zid, nn: nn, msg: msg},
        function (err, rc) {
            if (err) {
                res.json({ok: 0})
            } else {
                forumDB.count({},function(err,count){
                    if(err){

                    }
                    else if (count > gv.forumMaxNum) {
                        forumDB.removeOne();    //超过规定的数量就删除之前的数据
                    }
                })

                res.json({ok: rc.result.ok})
            }
        }
    );
});

//取讨论区消息数据
forum_route.route('/forum/getMsg').get(function (req, res) {
    var zid = Number(req.query.zid);
    var idx = req.query.id; //某条数据的_id 取这条数据之后的所有数据
    idx = idx || "000000000000000000000000";
    var forumDB = db_proxy.mongo.collection(schemeName + Math.floor(zid / 10));
    forumDB.find({zid: zid, _id: {$gt:ObjectId(idx)}},{zid: 0}).toArray(function (err, doc) {
        if (err) {
            res.json({ok: 0})
        } else {
            res.json({ok: 1, d: doc})
        }
    })
});

module.exports = forum_route;