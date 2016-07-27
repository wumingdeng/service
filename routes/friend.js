/**
 * Created by Fizzo on 15/12/23.
 */
var express = require("express");
var ob = require('mongodb').ObjectID;
var emailFunc = require('../utils/emailFunc');
var friendSchemeName = 'friend';
var UserDataSchemeName = 'UserDetail'
var db_proxy = require('../utils/dbconnectorS');
var friend_router = express.Router();

friend_router.route("/getAllFriend").get(function (req, res) {
    var uid = new ob(req.query.uid);
    var zid = Number(req.query.zid);
    var fDB = db_proxy.mongo.collection(friendSchemeName + Math.floor(zid / 10));
    var userDB = db_proxy.mongo.collection(UserDataSchemeName + Math.floor(zid / 10));
    var time = new Date().getTime();
    fDB.find({f1: uid, zid: zid, t: 1}, {f2: 1, e2: 1, s2: 1}).toArray(function (err1, doc1) {
        if (err1) {
            res.json({ok: 0})
        } else {
            fDB.find({f2: uid, zid: zid, t: 1}, {f1: 1, e1: 1, s1: 1}).toArray(function (err2, doc2) {
                if (err2) {
                    res.json({ok: 0})
                } else {
                    var data = doc1.concat(doc2);
                    var uidArr = new Array()
                    data.forEach(function(e) {
                        if (e.hasOwnProperty("f2")) {
                            uidArr.push({uid: e.f2.toString()})
                        } else {
                            uidArr.push({uid: e.f1.toString()})
                        }
                    })
                    userDB.find({$or:uidArr},{uid:1,nn:1,lv:1,hid:1}).toArray(function(userErr,userDoc){
                        if(userErr){
                            res.json({ok: 0})
                        }else{
                            var idx = 0
                            uidArr.forEach(function(u){
                                var userDocLength = userDoc.length;
                                for(var i =0;i<userDocLength;i++){
                                    var user = userDoc[i]
                                    if (user.uid == u.uid ){
                                        data[idx]["nn"] = user.nn;
                                        data[idx]["lv"] = user.lv;
                                        data[idx]["hid"] = user.hid;
                                        var createDt = new Date(data[idx].dt);
                                        var nowDt = new Date();
                                        if (createDt.getMonth() == nowDt.getMonth() && createDt.getDate() == nowDt.getDate()) {
                                            data[idx]["g"] = 0
                                        }else{
                                            data[idx]["g"] = 1
                                        }
                                        userDoc.splice(i,1);
                                        idx++
                                        break;
                                    }
                                }
                            })
                            res.json({ok: 1, d: data})
                        }
                    })
                }
            })
        }
    })
});

//ok == 2 查找不到好友信息
friend_router.route('/findFriendByName').post(function(req,res){
    var zid = req.body.zid;
    var name = req.body.nn;
    var mixName = new RegExp("^.*"+name+".*$")
    var userDB = db_proxy.mongo.collection(UserDataSchemeName + Math.floor(zid / 10));
    userDB.find({nn:mixName},{uid:1,nn:1,lv:1,hid:1}).toArray(function(err,doc){
        if(err){
            res.json({ok:0})
        }else{
            if(doc.length == 0){
                res.json({ok:2})
            }else{
                res.json({ok:1,d:doc})
            }
        }
    })
})

friend_router.route('/getRecommendFriend').get(function(req,res){
    var zid = req.query.zid;
    var uid = ob(req.query.uid);
    var userDB = db_proxy.mongo.collection(UserDataSchemeName + Math.floor(zid / 10));
    var friendDB = db_proxy.mongo.collection(friendSchemeName + Math.floor(zid / 10));
    var resultArr = new Array()
    userDB.find({uid : {"$ne" : req.query.uid}},{uid:1,nn:1,lv:1,hid:1}).sort({cem:-1}).limit(40).toArray(function(err,userDoc){
        if(err){
            res.json({ok:0})
        }else{
            friendDB.find({$or:[{f1:uid},{f2:uid}]}).toArray(function(err,friendDoc){
                if(err){
                    res.json({ok:0})
                }else{
                    function sortResult(){
                        for(var i=0;i<friendDoc.length;i++){
                            var friend = friendDoc[i];
                            var j = 0;
                            for(;j<userDoc.length;j++){
                                var user = userDoc[j]
                                if(user.uid == friend.f2.toString() || user.uid == friend.f1.toString())break;
                            }
                            userDoc.splice(j,1)
                        }
                        return userDoc.slice(0,20);
                    }
                    //TODO 需要在不足20条的情况下继续索引
                    resultArr = sortResult();
                    res.json({ok:1,d:resultArr});
                }
            })
        }
    })
})

friend_router.route('/addFriend').post(function (req, res) {
    var f1Id = new ob(req.body.uid);
    var f2Id = new ob(req.body.aUid);
    var name1 = req.body.n1;
    var name2 = req.body.n2;
    var zid = req.body.zid;
    var fDB = db_proxy.mongo.collection(friendSchemeName + Math.floor(zid / 10));
    fDB.findOne({$or: [{f1: f1Id, f2: f2Id}, {f1: f2Id, f2: f1Id}], zid: zid}, {t: 1}, null, function (err, item) {
        if (err) {
            res.json({ok: 0})
        } else {
            if (item) {
                //已经有记录咯
                res.json({ok: 2})
            } else {
                fDB.insertOne({zid:zid,f1:f1Id,f2:f2Id,n1:name1,n2:name2,e1:0,e2:0,s1:0,s2:0,t:0,dt:0,ct:0},null,function(err,result){
                    if (err) {
                        res.json({ok: 0})
                    } else {
                        function failCallBack(e){res.json(e)}
                        function successCallBack(){res.json({ok:1})}
                        emailFunc.applicationFriend(req.body.uid, zid, req.body.aUid, name1, failCallBack,successCallBack)
                    }
                })
            }
        }
    })
});

friend_router.route('/modifyFriend').post(function (req, res) {
    var uid = new ob(req.body.uid);
    var f1Id = req.body.f1;
    var f2Id = req.body.f2;
    var fromName = req.body.nn;
    var e = req.body.e;
    var s = req.body.s;
    var zid = req.body.zid;
    var fDB = db_proxy.mongo.collection(friendSchemeName + Math.floor(zid / 10));
    var filterData = {};
    if (f1Id) {
        filterData = {f1: new ob(f1Id), f2: uid, zid: zid}
    } else if (f2Id) {
        filterData = {f1: uid, f2: new ob(f2Id), zid: zid}
    }
    fDB.findOne(filterData, {f1: 1, f2: 1, e1: 1, e2: 1, s1: 1, s2: 1, dt: 1}, null, function (err, item) {
        if (err) {
            res.json({ok: 0})
        } else {
            var createDt = new Date(item.dt);
            var nowDt = new Date();
            if (createDt.getMonth() == nowDt.getMonth() && createDt.getDate() == nowDt.getDate()) {
                res.json({ok: 2})
            } else {
                var updateData = {};
                var updateFilterData = {};
                if (uid.toString() == item.f1.toString()) {
                    if (e) {
                        updateData = {e2: e}
                    }
                    if(s){
                        updateData = {s2:new Date().getTime()/1000}
                    }
                    updateFilterData = {f1: uid, f2: item.f2, zid: zid}
                } else if (uid.toString() == item.f2.toString()) {
                    if (e) {
                        updateData = {e1: e}
                    }
                    if(s){
                        updateData = {s1:new Date().getTime()/1000}
                    }
                    updateFilterData = {f2: uid, f1: item.f1, zid: zid}
                }
                updateData.dt = nowDt.getTime()
                fDB.updateOne(updateFilterData, {$set: updateData}, null, function (err) {
                    if (err) {
                        res.json({ok: 0})
                    } else {
                        //TODO 暂且体力领取设置为 10
                        if (e) {
                            function giveSuccessCallBack(){
                                res.json({ok: 1, d: updateData})
                            }
                            function giveFailCallBack(){
                                res.json({ok: 0})
                            }
                            var fUid = f1Id?f1Id:f2Id;
                            emailFunc.giveEnergy(req.body.uid, zid, fUid, fromName, 10,giveSuccessCallBack,giveFailCallBack)
                        }
                    }
                })
            }
        }
    })
});

friend_router.route('/removeFriendByFid').post(function (req, res) {
    var uid = new ob(req.body.uid);
    var f1Id = req.body.f1;
    var f2Id = req.body.f2;
    var zid = req.body.zid;
    var fDB = db_proxy.mongo.collection(friendSchemeName + Math.floor(zid / 10));
    var filterData = {};
    if (f1Id) {
        filterData = {f1: new ob(f1Id), f2: uid, zid: zid}
    } else if (f2Id) {
        filterData = {f1: uid, f2: new ob(f2Id), zid: zid}
    }
    fDB.removeOne(filterData, null, function (err) {
        if (err) {
            res.json({ok: 0})
        } else {
            res.json({ok: 1})
        }
    })
});

//取好友的技能
friend_router.route("/getFriendSkill").get(function (req, res) {
    var uid = new ob(req.query.uid);
    var zid = Number(req.query.zid);
    var fDB = db_proxy.mongo.collection(friendSchemeName + Math.floor(zid / 10));
    fDB.find({f1: uid, zid: zid, t: 1}, {f2: 1, e2: 1, s2: 1, n2: 1}).toArray(function (err1, doc1) {
        if (err1) {
            res.json({ok: 0})
        } else {
            fDB.find({f2: uid, zid: zid, t: 1}, {f1: 1, e1: 1, s1: 1, n1: 1}).toArray(function (err2, doc2) {
                if (err2) {
                    res.json({ok: 0})
                } else {
                    var data = doc1.concat(doc2);
                    //到UserDetail中取好友的技能数据
                    var udb = db_proxy.mongo.collection(UserDataSchemeName + Math.floor(zid / 10))
                    var skillTab = new Array()
                    var friendNum = data.length;
                    var count = 0;
                    if (friendNum == 0) {
                        res.json({ok: 1, d: data})
                    }
                    for (var i in data) {
                        var fuid = data[i].f1 || data[i].f2;
                        fuid = fuid.toString()  //用户数据中存的是字符串
                        udb.findOne({uid: fuid, zid: zid}, {nn: 1, sk: 1},null,function(err3,item){
                            if (err3) {
                                res.json({ok: 0})
                            } else {
                                if (item){
                                    var sData = new Array()
                                    sData.push(item.nn);
                                    sData.push(item.sk);
                                    var cd = data[count].s1 || data[count].s2 || 0;  //取CD时间
                                    sData.push(cd);
                                    var fid;    //好友ID
                                    if (data[count].f1) {
                                        fid = "f1`" + fuid
                                    } else {
                                        fid = 'f2`' + fuid
                                    }
                                    sData.push(fid)
                                    skillTab.push(sData)

                                    if (count == friendNum-1){
                                        res.json({ok: 1, d: skillTab})
                                        return;
                                    }
                                }
                                count++;
                            }
                        })
                    }
                }
            });
        }
        ;
    })
});

module.exports=friend_router;