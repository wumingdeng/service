/**
 * Created by kael on 15/11/25.
 */
var express=require('express');
var sc = require('../utils/staticConfigs');
var gv = require('../utils/GlobalVar');
var db_proxy = require('../utils/dbconnectorS');
var sign_router=express.Router();

// 发放奖励,数据库记录更改
function sendPrize(prize,db,_uid,_zid){
    var updateObject = {};
    var itemObject = {};
    var sceneObject = {};
    var taskObject = {};
    for(var key in prize){
        var id = parseInt(key);
        if(id == 1){
            updateObject['m']=prize[key];
        }else if(id == 2){
            updateObject['c']=prize[key];
        }else if(id == 3){
            updateObject['eng']=prize[key];
        }else if(id > 1000 && id < 3000){
            itemObject['itm'] = {};
            itemObject['itm'][id] = prize[key];
        }else if(id > 4000 && id < 4200){
            // todo
        }else if(id>4200 && id < 5000){

        }
    }
    db.updateOne({uid:_uid,zid:_zid},{$inc:updateObject,$push:itemObject},function(){});
}

// 签
sign_router.route('/sign').post(function(req,res){
    var _uid = req.body.uid;
    var _zid = Number(req.body.zid);
    var db = db_proxy.mongo.collection(gv.globalTableName.userDetail+Math.floor(_zid/10));
    db.findOne({uid:_uid,zid:_zid},{_id:0,sr:1},null,function(err,doc){
        if(err){
            res.json({ok:0});
        }else{
            if(doc == null){
                res.json({ok:0});
            }else{
                var today = new Date(Date.now());
                var today_idx=today.getDate()-1;
                var todaySign = doc.sr.d[today_idx];
                var canSignSlot = 0;
                var mon = today.getMonth();
                var sections = sc.cfg[gv.globalTableName.sdc][mon-1]['d'][today_idx];

                for(;canSignSlot<todaySign.length;canSignSlot++){
                    if(todaySign[canSignSlot] == 0){
                        break;
                    }
                }
                if(canSignSlot>=todaySign.length){
                    res.json({err:gv.errorCode.AlreadySigned});
                }else{
                    if(canSignSlot != 0){
                        var lastSign = todaySign[canSignSlot-1];
                        var dateLast = new Date(lastSign);
                        var idx = 0;
                        for(;idx<sections.length;idx++){
                            if(dateLast.getHours()>=sections[idx].begin && dateLast.getHours()<sections[idx].end){
                                break;
                            }
                        }
                        // 跟上一次签到是同一个时间段...
                        if(today.getHours()>=sections[idx].begin && today.getHours()<sections[idx].end){
                            canSignSlot = -1;
                        }
                    }
                    // can sign finally
                    if(canSignSlot!=-1){
                        todaySign[canSignSlot] = Date.now();
                        var pz = 0;
                        for(;pz<sections.length;pz++){
                            if(today.getHours()>=sections[pz].begin && today.getHours()<sections[pz].end){
                                break;
                            }
                        }
                        var prize =sections[pz].prize;

                        // 是否三次全签
                        var updateObj = {};
                        var seqS = doc.sr.s;
                        var seq = doc.sr.seq;
                        if(canSignSlot == todaySign.length-1){
                            var brokenSeq = false;
                            for(var jc = today_idx-1;jc>today_idx-doc.sr.s && jc >=0;jc--){
                                var oneday = doc.sr.d[jc];
                                var jb = 0;
                                for(;jb<oneday.length;jb++){
                                    if(oneday[jb]==0){
                                        break;
                                    }
                                }
                                if(jb<oneday.length){
                                    brokenSeq = true;
                                    break;
                                }
                            }
                            if(brokenSeq){
                                seq[doc.sr.s]=seq[doc.sr.s]+1;
                            }else{
                                seq[doc.sr.s] = 1;
                            }
                            // 是否还有连续签任务,-1为已经签完所有本月连续签
                            if(doc.sr.s != -1){
                                // 是否满足连续签条件
                                if(seq[doc.sr.s]>=doc.sr.s){
                                    // 切换下一级 && 发奖励
                                    var seqlsit = sc.cfg[gv.globalTableName.sdc][mon-1]['seq'];
                                    for(var sb=0;sb<seqlsit.length;sb++){
                                        if(seqlsit[sb].days == doc.sr.s){
                                            if(sb <= seqlist.length-1){
                                                seqS = seqlsit[sb+1].days;
                                                seq[seqlist[sb+1].days] = 1;
                                                break;
                                            }else{
                                                seqS = -1;// this month all done
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        updateObj["sr.d."+canSignSlot] = todaySign;
                        updateObj["sr.seq"] = seq;
                        updateObj["sr.s"] = seqS;

                        sendPrize(prize,db,_uid,_zid);
                        // 发放奖励,登记签到记录
                        db.updateOne({uid:_uid,zid:_zid},{$set:updateObj},function(){});
                        // 发数据给客户端
                        res.json({sign:prize,seq:seq,s:seqS,t:todaySign});
                    }else{
                        res.json({err:gv.errorCode.AlreadySigned});
                    }
                }
            }
        }
    });
});
// 查签状态
sign_router.route('/sign').get(function(req,res){
    var _uid = req.query.uid;
    var _zid = Number(req.query.zid);
    var db = db_proxy.mongo.collection(gv.globalTableName.userDetail+Math.floor(_zid/10));
    db.findOne({uid:_uid,zid:_zid},{_id:0,sr:1},null,function(err,doc){
        if(err){
            res.json({ok:0});
        }else{
            var today = new Date(Date.now());
            if(doc == null){
                res.json({ok:0});
            }else{
                if(doc.sr == null){
                    var initialDay = sc.cfg[gv.globalTableName.sdc][today.getMonth()-1].seq[0].days;
                    var srecord = {d:[],seq:{},s:initialDay};
                    srecord.seq[initialDay] = 0;
                    for(var i = 0;i<31;i++){
                        srecord.d.push([0,0,0]);
                    }
                    db.updateOne({uid:_uid,zid:_zid},{$set:{sr:srecord}},function(){});
                    res.json({t:[0,0,0],seq:srecord.seq,s:srecord.s});// 当前t,连续签进度seq
                }else{
                    var i=today.getDate()-1;
                    var target_obj = doc.sr.d[i];
                    var current_seq_trace = doc.sr.s;
                    if(doc.sr.seq[current_seq_trace] < current_seq_trace){
                        var seqDays = 0;
                        for(var idx = i-1;idx > (i - current_seq_trace) && idx>=0;idx--){
                            var vals = doc.sr.d[idx];
                            var notoday = false;
                            for(var j = 0;j<vals.length;j++){
                                if(vals[j]==0){
                                    notoday = true;
                                }
                            }
                            if(notoday){
                                var updateObj = {};
                                updateObj["sr.seq."+doc.s] = 0;
                                db.updateOne({uid:_uid,zid:_zid},{$set:updateObj},function(){});
                                doc.sr.seq[doc.s] = 0;
                                break;
                            }else{
                                seqDays++;
                            }
                        }
                    }
                    res.json({t:target_obj,seq:doc.sr.seq,s:doc.sr.s});
                }
            }
        }
    });
});
// 连续签领奖
sign_router.route('/signSeqAward').post(function(req,res){
    var _uid = req.body.uid;
    var _zid = Number(req.body.zid);
    var _day = Number(req.body.d);
    var db = db_proxy.mongo.collection(gv.globalTableName.userDetail+Math.floor(_zid/10));
    db.findOne({uid:_uid,zid:_zid},{_id:0,sr:1},null,function(err,doc){
        if(err){
            res.json({ok:0});
        }else{
            if(doc.sr.seq[_day]){
                if(_day<doc.sr.seq[_day]){
                    res.json({err:gv.errorCode.DailySignNotComplete});
                }else{
                    var today = new Date(Date.now());
                    var mon = today.getMonth();
                    var seqData = sc.cfg[gv.globalTableName.sdc][mon-1]['seq'];
                    var section;
                    for(var i = 0;i<seqData.length;i++){
                        if(seqData[i].days == _day){
                            section = seqData[i];
                            break;
                        }
                    }
                    var prize =section.prize;
                    // 删除不用的追踪数据
                    delete doc.sr.seq[doc.sr.seq.s];
                    var updateObj = {};
                    updateObj['sr.seq'] = doc.sr.seq;
                    db.updateOne({uid:_uid,zid:_zid},{$set:updateObj},function(){});
                    sendPrize(prize,db,_uid,_zid);
                    res.json({sign:prize});
                }
            }else{
                res.json({err:gv.errorCode.DailySignNotComplete});
            }
        }
    });
});

module.exports = sign_router;