/**
 * Created by fizzo on 15/12/2.
 */
var express=require('express');
var schemeName = 'UserDetail';
var emailFunc = require('../utils/emailFunc');
var ob = require('mongodb').ObjectID;
var gv = require('../utils/GlobalVar');
var gf = require('../utils/GlobalFunc');
var db_proxy = require('../utils/dbconnectorS');
var club_router=express.Router();

club_router.route('/findClubByName').get(function(req,res){
    var clubName = req.query.cn;
    var zid = Number(req.query.zid);
    var cn = new RegExp("^.*"+clubName+".*$")
    var db = db_proxy.mongo.collection('club'+Math.floor(zid/10));
    db.find({cn:cn,zid:zid}).toArray(function(err,doc){
        if(err){
            res.json({ok:0})
        }else
        {
            res.json({ok:1,data:doc})
        }
    });
});

club_router.route('/getClubByUid').get(function(req,res){
    var uid = req.query.uid;
    var zid = Number(req.query.zid);
    var db = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
    db.findOne({uid:uid,zid:zid},{cid:1},null,function(err,userItem){
        if(err){
            res.json({ok:0})
        }else
        {
            if(userItem && userItem.cid){
                var clubDB = db_proxy.mongo.collection('club'+Math.floor(zid/10));
                clubDB.findOne({_id:userItem.cid,zid:zid},null,null,function(err,clubItem){
                    if(err){
                        res.json({ok:0})
                    }else{
                        db.find({cid:userItem.cid,zid:zid},{uid:1,nn:1,cj:1,hid:1,hst:1,hs:1,hsd:1}).toArray(function(err,doc){
                            if(err){
                                res.json({ok:0})
                            }else{
                                var fDB = db_proxy.mongo.collection('friend'+Math.floor(zid/10));
                                fDB.find({$or:[{f1:ob(uid)},{f2:ob(uid)}],zid:zid,t:1},{f1:1,f2:1}).toArray(function(err1,friendArr){
                                    if(err1){
                                        res.json({ok:0})
                                    }else{
                                        for(var i= 0;i<doc.length;i++){
                                            var tagUid = doc[i].uid
                                            if(tagUid == uid.toString()){
                                                doc[i].t=1;
                                                continue;
                                            }
                                            doc[i].t=0;
                                            for(var j=0;j<friendArr.length;j++){
                                                var friend = friendArr[j]
                                                //check tagUid is friend?
                                                if (tagUid == friend.f1.toString() || tagUid == friend.f2.toString()){
                                                    doc[i].t=1
                                                    friendArr.splice(j,1);
                                                    break;
                                                }
                                            }
                                        }
                                        res.json({ok:1,data:doc,club:clubItem})
                                    }
                                })
                            }
                        })
                    }
                })
            }else{
                res.json({ok:0})
            }
        }
    });
});

club_router.route("/modifyClue").post(function(req,res) {
    var introduce = req.body.intdc;
    var uid = req.body.uid;
    var cid = ob(req.body.cid);
    var zid = req.body.zid;
    //TODO 工会经验的方式目前没有确定
    var clueExp = req.body.exp;
    var updateDate = {};
    if(clueExp && introduce){
        updateDate = {ci:introduce,exp:clueExp}
    }else if(clueExp){
        updateDate = {exp:clueExp}
    }else if(introduce){
        updateDate = {ci:introduce}
    }
    var userDB = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
    userDB.findOne({uid:uid,zid:zid},{cj:1},null,function(err, item){
        if(err){
            res.json({ok:0})
        }else{
            if(item && item.cj>2){
                var clubDB = db_proxy.mongo.collection('club'+Math.floor(zid/10));
                clubDB.updateOne({_id:cid,zid:zid},{$set:updateDate},null,function(err){
                    if(err){
                        res.json({ok:0})
                    }else{
                        res.json({ok:1})
                    }
                })
            }else{
                res.json({ok:0})
            }
        }
    })
});

club_router.route('/getAllClub').get(function(req,res){
    var startPage = Number(req.query.sp);
    var endPage = Number(req.query.ep);
    var zid = Number(req.query.zid);
    var cid = req.query.cid;
    var ud = {}
    if(cid==""){
        ud = {zid:zid}
    }else{
        ud =  {zid:zid,_id : {"$ne":ob(req.query.cid)}}
    }
    var db = db_proxy.mongo.collection('club'+Math.floor(zid/10));
    db.find(ud).limit(endPage).skip(startPage).toArray(function(err,doc){
        if(err){
            res.json({ok:0})
        }
        else{
            res.json({ok:1,d:doc})
        }
    });
});

club_router.route('/getClubByCid').get(function(req,res) {
    var uid = ob(req.query.uid);
    var cidStr = req.query.cid;
    var zid = Number(req.query.zid);
    if (cidStr == ""){
        res.json({ok:0});
        return
    }
    var cid = new ob(cidStr)
    var clubDB = db_proxy.mongo.collection('club'+Math.floor(zid/10));
    clubDB.findOne({_id:cid,zid:zid},null,null,function(err,item){
        if(err){
            res.json({ok:0})
        }else {
            var userDB = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
            userDB.find({cid:cid,zid:zid},{uid:1,nn:1,cj:1,hid:1,hst:1,hs:1,hsd:1,lv:1}).sort({cj:1}).toArray(function(err,doc){
                if(err){
                    res.json({ok:0})
                }else{
                    var fDB = db_proxy.mongo.collection('friend'+Math.floor(zid/10));
                    fDB.find({$or:[{f1:uid},{f2:uid}],zid:zid},{f1:1,f2:1}).toArray(function(err1,friendArr){
                        if(err1){
                            res.json({ok:0})
                        }else{
                            for(var i= 0;i<doc.length;i++){
                                var tagUid = doc[i].uid
                                if(tagUid == uid.toString()){
                                    doc[i].t=1;
                                    continue;
                                }
                                doc[i].t=0;
                                for(var j=0;j<friendArr.length;j++){
                                    var friend = friendArr[j]
                                    //check tagUid is friend?
                                    if (tagUid == friend.f1.toString() || tagUid == friend.f2.toString()){
                                        doc[i].t=1
                                        friendArr.splice(j,1);
                                        break;
                                    }
                                }
                            }
                            res.json({ok:1,data:doc,club:item})
                        }
                    })
                }
            })
        }
    });
});

club_router.route('/createClub').post(function(req,res){
    var clubName = req.body.cn;
    var clubIntroduce = req.body.ci;
    var zid = req.body.zid;
    var uid = req.body.uid;
    var db = db_proxy.mongo.collection('club'+Math.floor(zid/10));
    db.findOne({cn:clubName,zid:zid},null,null,function(err,item){
        if(err){
            res.json({ok:0})
        }else{
            if(item){
                res.json({ok:2})
            }else{
                db.insertOne({cn:clubName,ci:clubIntroduce,exp:0,cr:"0",cp:0,cc:1,ca:"",zid:zid},null,function(err,item){
                    if(err){
                        res.json({ok:0,str:"创建公会失败"})
                    }else
                    {
                        var cid = item.insertedId;
                        var userDB = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
                        userDB.updateOne({uid:uid,zid:zid},{$set:{cid:cid,cj:3,cpt:[]}},null,function(err){
                            if(err){
                                res.json({ok:0})
                            }else{
                                res.json({ok:1,cid:cid})
                            }
                        })
                    }
                })
            }
        }
    })
});

club_router.route('/clubApplyByUserId').post(function(req,res){
    var uid = req.body.uid;
    var cid = new ob(req.body.cid);
    var _zid = req.body.zid;
    var fromName = req.body.nn;
    var db = db_proxy.mongo.collection('club'+Math.floor(_zid/10));
    db.findOne({_id:cid,zid:_zid},{ca:1},null,function(err,item){
        if(err){
            res.json({ok:0})
        }else{
            var idx = item.ca.search("`"+uid);
            if(idx == -1){
                var clubApply = item.ca +"`"+uid;
                db.updateOne({_id:cid,zid:_zid},{$set:{ca:clubApply}},null,function(err){
                    if(err){
                        res.json({ok:0,e:err.toString()})
                    }else
                    {
                        var userDB = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
                        userDB.findOne({cid:cid,cj:3,zid:_zid},{uid:1},null,function(err,userItem){
                            if(err){
                                res.json({ok:0})
                            }else{
                                if(userItem){
                                    function failCallBack(){res.json({ok:0})}
                                    function successCallBack(){res.json({ok:1})}
                                    emailFunc.applicationUnion(uid,_zid,userItem.uid.toString(),fromName,failCallBack,successCallBack)
                                }else{
                                    res.json({ok:0})
                                }
                            }
                        })
                    }
                })
            }else{
                res.json({ok:0,e:"have been committed"})
            }
        }
    })
});

club_router.route('/appointClubManager').post(function(req,res){
    var uid = req.body.uid;
    var auid = req.body.auid;
    var job = req.body.job;
    var zid = req.body.zid;
    var db = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
    db.findOne({uid:auid,zid:zid},{cj:1},null,function(err,aitem){
        if(err){
            res.json({ok:0})
        }else{
            if(aitem.cj==3){
                db.findOne({uid:uid,zid:zid},{cj:1},null,function(err,item){
                    if(err){
                        res.json({ok:0})
                    }else{
                        if(item.cj == job){
                            res.json({ok:2})
                        }else{
                            db.updateOne({uid:uid,zid:zid},{$set:{cj:job}},null,function(err){
                                if(err){
                                    res.json({ok:0})
                                }else{
                                    res.json({ok:1})
                                }
                            })
                        }
                    }
                });
            }else{
                res.json({ok:3})
            }
        }
    })
});

club_router.route('/exitClub').post(function(req,res){
    var uid = req.body.uid;
    var zid = req.body.zid;
    var curCount = req.body.cc;
    var db = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
    db.findOne({uid:uid,zid:zid},{cj:1,cid:1},null,function(err,item){
        if(err){
            res.json({ok:0})
        }else{
            if(item.cj == 3){
                res.json({ok:0})
            }else{
                db.updateOne({uid:uid,zid:zid},{$set:{cid:"",cj:0,cpt:""}},null,function(err){
                    if(err){
                        res.json({ok:0})
                    }else{
                        var clubDB = db_proxy.mongo.collection('club'+Math.floor(zid/10));
                        clubDB.updateOne({_id:item.cid,zid:zid},{$set:{cc:curCount-1}},function(err,update){
                            if(err){
                                res.json({ok:0})
                            }else{
                                res.json({ok:1})
                            }
                        })
                    }
                })
            }
        }
    })
});

//进入副本更新角色数据
club_router.route('/modifyClubCopy').post(function(req,res){
    var uid = req.body.uid;
    var zid = req.body.zid;
    var copyIdx = Number(req.body.idx)-1;
    var db = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
    db.findOne({uid:uid,zid:zid},{cpt:1},null,function(err,item){
        if(err){
            res.json({ok:0})
        }else{
            var copyTimeArr = item.cpt;
            var target = copyTimeArr[copyIdx];
            if(target){
                if(target>=2){
                    res.json({ok:2})
                    return
                }
                //TODO 判断是否达到当天最大进入次数
                copyTimeArr[copyIdx] = Number(target)+1;
            }else{
                copyTimeArr[copyIdx] = 1;
            }
            for(var i = 0;i<copyTimeArr.length;i++){
                var copyTime = copyTimeArr[i]
                if (!copyTime){
                    copyTimeArr[i] = 0
                }
            }
            db.updateOne({uid:uid,zid:zid},{$set:{cpt:copyTimeArr}},null,function(err){
                if(err){
                    res.json({ok:0,d:copyTimeArr})
                }else{
                    res.json({ok:1,d:copyTimeArr})
                }
            })
        }
    })
});

club_router.route('/openCopy').post(function(req,res){
    var cid = new ob(req.body.cid);
    var zid = req.body.zid;
    var copyId = Number(req.body.idx) - 1;
    var db = db_proxy.mongo.collection('club'+Math.floor(zid/10));
    db.findOne({_id:cid,zid:zid},{cr:1},null,function(err,item){
        if(err){
            res.json({ok:0})
        }else{
            if(item && item.cr){
                var copyRecord = item.cr;
                var copyRecordArr = copyRecord.split("`");
                var status = copyRecordArr[copyId];
                //TODO 判断是否足够碎片
                if(status == 1){
                    res.json({ok:2})
                }else{
                    copyRecordArr[copyId] = "1";
                    copyRecord = "";
                    var len = copyRecordArr.length;
                    for(var i= 0;i<len;i++){
                        if(i==len-1){
                            copyRecord = copyRecord + copyRecordArr[i]
                        }else{
                            copyRecord = copyRecord + copyRecordArr[i] + "`"
                        }
                    }
                    db.updateOne({_id:cid,zid:zid},{$set:{cr:copyRecord}},null,function(err){
                        if(err){
                            res.json({ok:0})
                        }else{
                            res.json({ok:1})
                        }
                    })
                }
            }else
            {
                res.json({ok:0})
            }
        }
    })
})

club_router.route('/getCopy').get(function(req,res){
    var uid = req.query.uid;
    var zid = Number(req.query.zid);
    var clubDB = db_proxy.mongo.collection('club'+Math.floor(zid/10));var userDB = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
    userDB.findOne({uid:uid,zid:zid},{cid:1,cpt:1,cj:1},null,function(err,uItem){
        if(err){
            res.json({ok:0})
        }else{
            clubDB.findOne({_id:uItem.cid,zid:zid},null,null,function(err,cItem){
                if(err){
                    res.json({ok:0})
                }else{
                    res.json({ok:1,cr:cItem.cr,cp:cItem.cp,cpt:uItem.cpt})
                }
            })
        }
    })
});

/*ok == 0 失败
 ok == 1 成功
 ok == 2 自己在温泉中
 ok == 3 自己的超过次数
 ok == 4 该玩家在温泉中
 ok == 5 该玩家超过次数*/
club_router.route('/visitHotSpring').post(function(req,res){
    var uid = req.body.uid;
    var zid = Number(req.body.zid);
    var fs = req.body.f;
    var time = req.body.t;
    var userDB = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
    userDB.findOne({uid:uid,zid:zid},{hs:1,hst:1,cid:1,nn:1},null,function(err,uItem){
        if(err){
            res.json({ok:0})
        }else{
            if(uItem.hs != "" && (Math.floor(new Date().getTime() / 1000) - uItem.hsd)>4*3600){
                res.json({ok:2})
            }else if(uItem.hst >= 3){ //TODO 限制的次数会在静态数据中获取，
                res.json({ok:3})
            }else{
                var success = {};
                var result = new Array(); //存储失败的结果集
                var updateHst = new Array();//存储更新温泉次数的数据集
                var fns = new Array(); //存放公会成员的名字与uid数据
                var uids = "";//存储邀请的成员的uid字符串
                success.hsd = Math.floor(new Date().getTime() / 1000)
                success.hst = uItem.hst + 1
                //在没有邀请好友的情况下
                if(fs.length == 0){
                    success.hs = uid;
                    userDB.updateOne({uid:uid,zid:zid},
                        {
                            $set:success
                        },null,function(err,rc){
                            if(err){
                                res.json({ok:0})
                            }else{
                                // time/4 分四个阶段发送奖励
                                fns.push({uid: uid, name: uItem.nn});
                                var timer = setInterval(function() {
                                        emailFunc.visitHotSpring(uid, zid, fns)},
                                    time / gv.HOT_SPRING_STAGE_TIME
                                )
                                gv.hotSpringTimer.push({u:uid,t:timer,l:0});
                                success.hsd = time
                                res.json({ok: rc.result.ok,d:success})
                            }
                        }
                    )
                }else{
                    for (var i = 0; i < fs.length; i++) {
                        fs[i] = {uid:fs[i]}
                    }
                    userDB.find({$or:fs,zid: zid}, {
                        uid:1,
                        hs: 1,
                        hst: 1,
                        cid: 1,
                        nn: 1
                    }).toArray(function (err, doc) {
                        if (err) {
                            res.json({ok: 0})
                        } else {
                            if (doc) {
                                doc.forEach(function(eItem) {
                                    if (eItem.hs != "") {
                                        result.push({ok: 4, u: uid})
                                    } else if (eItem.hst >= 3) {
                                        result.push({ok: 5, u: uid})
                                    } else if (eItem.cid.toString() != uItem.cid.toString()) { //防止该成员已经换了公会。
                                        result.push({ok: 6, u: uid})
                                    } else {
                                        updateHst.push({uid: eItem.uid, hst: eItem.hst, us: uid})
                                    }
                                    fns.push({uid: eItem.uid, name: eItem.nn})
                                    uids = uids + eItem.uid + "`";
                                })
                                updateHst.push({uid: uid, hst: uItem.hst, us: uids});
                                success.hs = uids;
                                if (result.length == 0) { //保证每个成员都可以泡温泉才进行更新
                                    var updateLimt = 0
                                    for (var j = 0; j < updateHst.length; j++) {
                                        userDB.updateOne({
                                            uid: updateHst[j].uid,
                                            zid: zid
                                        }, {
                                            $set: {
                                                hsd: Math.floor(new Date().getTime() / 1000),
                                                hs: updateHst[j].us,
                                                hst: updateHst[j].hst + 1
                                            }
                                        }, null, function (err, rc) {
                                            if (err) {
                                                res.json({ok: 0})
                                            } else {
                                                updateLimt++;
                                                if (updateLimt == updateHst.length) {
                                                    console.log(":_______DDDDDD__________")
                                                    //todo time/4 分四个阶段发送奖励
                                                    fns.push({uid: uid, name: uItem.nn});
                                                    var timer = setInterval(function(){
                                                        emailFunc.visitHotSpring(uid, zid, fns)},
                                                        time / gv.HOT_SPRING_STAGE_TIME
                                                    )
                                                    gv.hotSpringTimer.push({u:uid,t:timer,l:0})
                                                    success.hsd = time
                                                    res.json({ok: rc.result.ok,d:success})
                                                }
                                            }
                                        })
                                    }
                                } else {
                                    res.json({ok: 4, d: result})
                                }
                            } else {
                                res.json({ok: 0})
                            }
                        }
                    })
                }
            }
        }
    })
});

//获取邀请的成员
club_router.route('/getClubberVisitHotSpring').get(function(req,res){
    var uid = req.query.uid;
    var zid = Number(req.query.zid);
    var userDB = db_proxy.mongo.collection(schemeName+Math.floor(zid/10));
    userDB.findOne({uid:uid,zid:zid},{hst:1,hsd:1,hs:1},null,function(err,item_1){
        if(err){
            res.json({ok:0})
        }else{
            if(item_1.hs == "") {
                res.json({ok:2})
            }else{
                if (item_1.hs == uid) {
                    item_1.hsd = Math.floor(new Date().getTime()/1000)-item_1.hsd
                    res.json({ok: 1, d: item_1})
                } else if(item_1.hs.indexOf("`") >= 0){
                    item_1.hs = item_1.hs + "`" + uid
                    item_1.hsd = Math.floor(new Date().getTime()/1000)-item_1.hsd
                    res.json({ok: 1, d: item_1})
                }else{
                    userDB.findOne({uid: item_1.hs, zid: zid}, {hs: 1}, null, function (err, item_2) {
                        if (err) {
                            res.json({ok: 0})
                        } else {
                            var index = item_1.hs.indexOf("`")
                            if (index >= 0) {
                                item_1.hs = item_2.hs + "`" + item_1.hs
                                item_1.hsd = Math.floor(new Date().getTime()/1000)-item_1.hsd
                                res.json({ok: 1, d: item_1})
                            } else {
                                item_1.hs = item_1.hs + "`" + uid
                                item_1.hsd = Math.floor(new Date().getTime()/1000)-item_1.hsd
                                res.json({ok: 1, d: item_1})
                            }
                        }
                    })
                }
            }
        }
    })
});

//同步温泉的时间
club_router.route('/synchronizeHotSpring').get(function(req,res){
    res.json({d:Math.floor(new Date().getTime()/1000)})
});

club_router.route('/addClubLog').post(function(req,res){
    var log = req.body.l;
    var zid = req.body.zid;
    var cid = ob(req.body.cid);
    var nn = req.body.nn;
    var uid = req.body.uid;
    var clubDB = db_proxy.mongo.collection('clubLog'+Math.floor(zid/10));
    clubDB.count({cid:cid,zid:zid},function(err,count){
        if(err){
            res.json({ok:0})
        }else{
            clubDB.insertOne({cid:cid,zid:zid,l:log,idx:count+1,nn:nn,uid:uid},null,function(err,rc){
                if(err){
                    res.json({ok:0})
                }else{
                    res.json({ok:rc.result.ok})
                }
            })
        }
    })

});

club_router.route('/synchronizeClubChannel').get(function(req,res){
    var idx = Number(req.query.idx);
    var cid = ob(req.query.cid);
    var zid = Number(req.query.zid);
    var clubDB = db_proxy.mongo.collection('clubLog'+Math.floor(zid/10));
    clubDB.find({cid:cid,zid:zid,idx:{$gte:idx}},{l:1,nn:1,uid:1}).toArray(function(err,doc){
        if(err){
            res.json({ok:0})
        }else{
            res.json({ok:1,d:doc})
        }
    })
});

module.exports=club_router;