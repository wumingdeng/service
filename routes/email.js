/**
 * Created by czw on 15-11-30.
 */
var ObjectId = require('mongodb').ObjectID;
var express = require('express');
var schemeName = 'email';
var gv = require('../utils/GlobalVar');
var gf = require('../utils/GlobalFunc');
var cf = require('../utils/clubFunc');
var db_proxy = require('../utils/dbconnectorS');
var email_router = express.Router();

email_router.route('/email/send').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _msg = req.body.msg;    //消息内容
    var _to = req.body.to;  //发送的对象
    var db = db_proxy.mongo.collection(schemeName);
    db.save(
        {
            uid: _to,
            zid: _zid,
            from: _uid,
            type: gv.emailType.PERSONAL_MSG,
            msg: _msg
        },

        function (err) {
            if (err) {
                res.json({ok: 0});
            } else {
                res.json({ok: 1});
            }
        }
    );
});


//删除邮件
email_router.route('/email/delete').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _id = req.body.id;
    var db = db_proxy.mongo.collection(schemeName);
    db.deleteOne(
        {uid: _uid, zid: _zid, _id: ObjectId(_id)},
        function (err, r) {
            if (err) {
                res.json({ok: 0})
            }
            else {
                res.json({ok: 1})
            }

        }
    )
});


//查询用户的所有邮件
email_router.route('/email/query').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var db = db_proxy.mongo.collection(schemeName);
    //把过期邮件删掉
    var now = new Date(Date.now());
    now = now.getTime();

    var expire = now - 86400000 * gv.EMAIL_EXPIRE_DATE   //86400是一天的秒数
    db.deleteMany(
        {
            uid: _uid,
            zid: _zid,
            time: {$lt: expire}
        },
        function (err, r) {
            if (err) {

            }
        }
    ),
        db.find(
            {uid: _uid, zid: _zid}
        ).toArray(
            function (err, r) {
                if (err) {
                    res.json({ok: 0})
                }
                else {
                    //把所有邮件发给玩家
                    res.json(r)
                }
            })
});


//查看邮件
email_router.route('/email/readEmail').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _id = req.body.id;
    var db = db_proxy.mongo.collection(schemeName);
    db.updateOne(
        {uid: _uid, zid: _zid, _id: ObjectId(_id)},
        {$set:{state:1}},
        function (err, r) {
            if (err) {
                res.json({ok: 0})
            }
            else {
                res.json({ok: 1})
            }

        }
    )
});


//领取系统奖励
email_router.route('/email/receiveSystemAward').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _id = req.body.id;  //邮件id
    var db = db_proxy.mongo.collection(schemeName);
    db.findOneAndUpdate(
        {uid: _uid, zid: _zid, _id: ObjectId(_id)},
        {
            $set: {
                state: 1    //已领取当成已读
            }
        },
        function (err, r) {
            if (err) {
                res.json({ok: 0});
            } else {
                //体力增加
                if (r.value) {
                    if (r.value.state == 1) {
                        //已经领取过奖励
                        res.json({err: gv.errorCode.ReceiveSystemAwardAgain});
                        return;
                    }
                    //取奖励内容  没有的默认值是0
                    var data = r.value.msg
                    data.money = data.money != null ? data.money : 0;
                    data.coin = data.coin != null ? data.coin : 0;
                    data.energy = data.energy != null ? data.energy : 0;
                    var edb = db_proxy.mongo.collection('UserDetail0');
                    edb.updateOne(
                        {uid: _uid, zid: _zid},
                        {
                            $inc: {eng: data.energy, m: data.money, c: data.coin},
                        },
                        function (err, r) {
                            if (err) {
                                res.json({ok: 0});
                            } else {
                                if (r.modifiedCount > 0) {
                                    res.json({ok: 1, d: data})   //领取系统奖励成功
                                }
                                else {
                                    res.json({ok: 0})
                                }
                            }
                        });
                }
                else {
                    //要操作的邮件不存在
                    res.json({err: gv.errorCode.HaveNotEmail});
                }
            }
        }
    );
})

//领取体力
email_router.route('/email/receiveEnergy').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _id = req.body.id;  //邮件中的条数
    var db = db_proxy.mongo.collection(schemeName);
    db.findOneAndUpdate(
        {uid: _uid, zid: _zid, _id: ObjectId(_id)},
        {
            $set: {
                state: 1
            }
        },
        function (err, r) {
            if (err) {
                res.json({ok: 0});
            } else {
                //体力增加
                if (r.value) {
                    //已经领取过体力了
                    if (r.value.state == 1) {
                        res.json({err: gv.errorCode.ReceiveEnergyAgain});
                    }
                    else {
                        var edb = db_proxy.mongo.collection('UserDetail0');
                        edb.updateOne({uid: _uid, zid: _zid}, {$inc: {eng: r.value.msg}}, function (err, cr) {
                            if (err) {
                                res.json({ok: 0});
                            } else {
                                if (cr.modifiedCount > 0) {
                                    var data = {};
                                    data.energy = r.value.msg;
                                    res.json({ok: 1, d: data});  //领取体力成功
                                }
                                else {
                                    res.json({ok: 0})
                                }
                            }
                        });
                    }
                }else{
                    //要操作的邮件不存在
                    res.json({err: gv.errorCode.HaveNotEmail});
                }
            }
        }
    );
})

//在邮箱中处理好友申请的操作(同意或拒绝)
email_router.route('/email/applicationFriend').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _id = req.body.id;  //邮件中的条数
    var _op = req.body.op;  //操作   1 同意 2 拒绝
    var db = db_proxy.mongo.collection(schemeName);
    db.updateOne(
        {uid: _uid, zid: _zid, _id: ObjectId(_id)},
        {
            $set: {
                state: _op
            }
        },
        function (err, r) {
            if (err) {
                res.json({ok: 0});
            } else {
                //体力增加
                if (r.modifiedCount > 0) {
                    //TODO 添加好友
                    var f1Id = ObjectId(req.body.uid)
                    var f2Id = ObjectId(req.body.fid)
                    var fDB = db_proxy.mongo.collection('friend' + Math.floor(_zid / 10))
                    if (_op == 2) {
                        fDB.removeOne({$or: [{f1: f1Id, f2: f2Id}, {f1: f2Id, f2: f1Id}]}, null, function (err) {
                            if (err) {
                                res.json({ok: 0})
                            } else {
                                res.json({ok: 1, op: _op})
                            }
                        })
                    } else {
                        fDB.findOne({
                            $or: [{f1: f1Id, f2: f2Id}, {f1: f2Id, f2: f1Id}],
                            zid: _zid
                        }, {t: 1}, null, function (err, item) {
                            if (err) {
                                res.json({ok: 0})
                            } else {
                                if (item.t == 1) {
                                    //已经是好友咯
                                    res.json({ok: 2})
                                } else {
                                    fDB.updateOne({
                                        $or: [{f1: f1Id, f2: f2Id}, {f1: f2Id, f2: f1Id}],
                                        zid: _zid
                                    }, {$set: {t: 1, ct: new Date().getTime()}}, null, function (err) {
                                        if (err) {
                                            res.json({ok: 0})
                                        } else {
                                            res.json({ok: 1, op: _op})
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
                else {   //已经处理过这条请求了
                    res.json({ok: 2});
                }
            }
        }
    );
});

//在邮箱中处理工会申请的操作(同意或拒绝)
email_router.route('/email/applicationUnion').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var cid = ObjectId(req.body.cid);
    var auidStr = req.body.fid;
    var _id = req.body.id;  //邮件中的条数
    var _op = req.body.op;  //操作   1 同意 2 拒绝
    var db = db_proxy.mongo.collection(schemeName);
    db.updateOne(
        {uid: _uid, zid: _zid, _id: ObjectId(_id)},
        {
            $set: {
                state: _op
            }
        },
        function (err, r) {
            if (err) {
                res.json({ok: 0});
            } else {
                if (r.modifiedCount > 0) {
                    //TODO 加入工会
                    function failCallBack(result){
                        if(result.ok === 2){
                            db.removeOne({_id:ObjectId(_id)},null,function(err){
                                if(err){
                                    res.json({ok:0})
                                }else{
                                    res.json({ok:2})
                                }
                            })
                        }else{
                            res.json(result)
                        }
                    }
                    function successCallBack(result){
                        res.json(result)
                    }
                    cf.joinClub(cid,_uid,_zid,auidStr,_op,failCallBack,successCallBack);
                }
                else {   //已经处理过了
                    res.json({ok: 0});
                }
            }
        }
    );
});


module.exports = email_router;