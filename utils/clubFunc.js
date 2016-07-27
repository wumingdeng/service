/**
 * Created by wmd on 16-02-02.
 */

var db_proxy = require('./dbconnectorS');
var gv = require('./GlobalVar');

module.exports = {
    /*
     *   温泉结束
     *   @uid 用户id
     *   @zid 分区id
     *   @fns 对象的名字
     */
    endHotSpring:function (uid, zid, fns) {
        for(var idx=0;idx<gv.hotSpringTimer.length;idx++){
            var e = gv.hotSpringTimer[idx];
            if(e.u == uid){
                console.log(e.l)
                e.l = ++e.l;
                if(e.l==gv.HOT_SPRING_STAGE_TIME){
                    clearInterval(e.t)
                    gv.hotSpringTimer.splice(idx,1)

                    var db = db_proxy.mongo.collection("UserDetail"+Math.floor(zid/10));
                    var updateObjArr=new Array()
                    for(var i=0;i<fns.length;i++){
                        updateObjArr[i] = {uid:fns[i].uid}
                    }
                    db.updateMany({$or: updateObjArr,zid:zid},{$set:{hs:"",hsd:0}},null,function(err,res){
                        if(err){
                            console.log("holy shit")
                        }else{
                            console.log("hallelujah")
                        }
                    })
                }
            }
        }
    },
    /*
     * 加入公会
     *
     *
     *
     * @response ok == 2 已经加入其他公会
     * ok == 3 权限不够
     * */
    joinClub:function(cid,_uid,_zid,auidStr,_op,failCallBack,successCallBack){
        //TODO 加入工会
        var userDB = db_proxy.mongo.collection('UserDetail' + Math.floor(_zid / 10));
        userDB.findOne({cid: cid, uid: _uid,zid:_zid}, {cj: 1}, null, function (err, item) {
            if (err) {
                failCallBack({ok:0})
            } else {
                if (item.cj >= 3) {
                    var clubDB = db_proxy.mongo.collection('club' + Math.floor(_zid / 10));
                    clubDB.findOne({_id: cid,zid:_zid}, {ca: 1, cc: 1}, null, function (err, item) {
                        if (err) {
                            failCallBack({ok:0})
                        } else {
                            var ca = item.ca.replace("`" + auidStr, '');
                            //判断是否有在申请列表里
                            if (ca == item.ca) {
                                failCallBack({ok:0})
                            } else {
                                userDB.findOne({uid:auidStr,zid:_zid},{cid:1},null,function(err,item2){
                                    if(err){
                                        failCallBack({ok:0})
                                    }else {
                                        //判断是否已经加入其他公会
                                        if (item2.cid == "") {
                                            var clubUpdateData = {}
                                            if (_op == 2) {
                                                clubUpdateData = {ca: ca}
                                            } else {
                                                clubUpdateData = {ca: ca, cc: item.cc + 1}
                                            }
                                            clubDB.updateOne({_id: cid}, {$set: clubUpdateData}, null, function (err) {
                                                if (err) {
                                                    failCallBack({ok:0})
                                                } else {
                                                    if (_op == 1) {
                                                        userDB.updateOne({uid: auidStr}, {
                                                            $set: {
                                                                cid: cid,
                                                                cj: 1
                                                            }
                                                        }, null, function (err) {
                                                            if (err) {
                                                                failCallBack({ok:0})
                                                            } else {
                                                                successCallBack({ok: 1, op: _op})
                                                            }
                                                        })
                                                    } else {
                                                         successCallBack({ok: 1, op: _op})
                                                    }
                                                }
                                            })
                                        } else {
                                            //已经加入其他公会，把公会申请列表清理掉
                                            clubDB.updateOne({_id: cid}, {$set: {ca: ca}}, null, function (err) {
                                                if(err){
                                                    failCallBack({ok:0})
                                                }else{
                                                    failCallBack({ok:2})
                                                }
                                            })

                                        }
                                    }
                                })
                            }
                        }
                    })
                } else {
                    failCallBack({ok:3})
                }
            }
        })
    }
}