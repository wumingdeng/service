/**
 * Created by kael on 15/6/2.
 */
var express=require('express');
var schemeName = 'UserDetail';
var gv = require('../utils/GlobalVar');
var gf = require('../utils/GlobalFunc');
var db_proxy = require('../utils/dbconnectorS');
var singleton = require('../utils/singleton');
var sc = require('../utils/staticConfigs');
var ts = require('../utils/cronTasks');
var uds_router=express.Router();

// update a record of
uds_router.route('/markEvidenceTime').post(function(req,res){
    var _zid = req.body.zid;
    var _uid = req.body.uid;
    var _eid = req.body.eid;
    var _cid = req.body.cid;
    if(_zid == null || _uid == null || _eid == null || _cid == null){
        res.json({err:gv.errorCode.ParamWrong});
    }else{
        var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
        // mark one evidence start time
        var _lem  = new Date().getTime();
        //var key = 'ts.i'+_eid;
        var key = 'ts.c'+_cid+'.i'+_eid;
        //var sub_key = 'i'+_eid;
        var updateObj={};
        updateObj[key]=_lem;
        //updateObj[key][sub_key]=_lem;
        db.updateOne({zid:_zid,uid:_uid},{$set:updateObj},null,function(err){
            if(err){
                res.json({ok:0});
            }else{
                var cost = gf.getEvidenceCostTime(_eid);
                res.json({ok:1,total:cost*60000});
            }
        });
    }
});

uds_router.route('/markEvidenceTimeOverNow').post(function(req,res){
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _eid = req.body.eid;
    var _cid = req.body.cid;

    if(_zid == null || _uid == null || _eid == null || _cid == null){
        res.json({err:gv.errorCode.ParamWrong});
    }else{
        var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
        db.findOne({uid:_uid,zid:_zid},{ts:1,_id:0,m:1},null,function(err,doc){
            if(err){
                res.json({ok:0});
            }else{
                if(doc === null){
                    res.json({err:gv.errorCode.UnExistedEvidence});
                }else{
                    var ckey = 'c'+_cid;
                    if(doc.ts[ckey] == null){
                        res.json({err:gv.errorCode.UnExistedEvidence});
                    }else{
                        if(doc.ts[ckey]['i'+_eid] === null){
                            res.json({err:gv.errorCode.UnExistedEvidence});
                        }else{
                            var costGem;
                            var itmObj = singleton.getStaticData().items[_eid];
                            if(itmObj){
                                costGem = itmObj.costGem;
                            }else{
                                costGem = gv.globalDefine.DefaultEvidenceCostGem;
                            }

                            if(doc.m - costGem <0){
                                res.json({err:gv.errorCode.NoEnoughGemCompleteEvidence});
                            }else{
                                var updateObj={};
                                var key = 'ts.c'+_cid+'.i'+_eid;
                                updateObj[key]='';
                                db.updateOne({uid:_uid,zid:_zid},{$unset:updateObj,$set:{m:doc.m-costGem}},null,function(err){
                                    // if ok,finish one task trace or other?
                                    res.json({ok:1,leftGem:doc.m-costGem});
                                });
                            }
                        }
                    }
                }
            }
        });
    }
});

uds_router.route('/markEvidenceTimeOver').post(function(req,res){
    // ok with count down and should update task either
    //var _uid = req.body.uid;
    //var _zid = req.body.zid;
    //var _eid = req.body.eid;
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _eid = req.body.eid;
    var _cid = req.body.cid;

    if(_zid == null || _uid == null || _eid == null || _cid == null){
        res.json({err:gv.errorCode.ParamWrong});
    }else{
        //var key = 'ts.i'+_eid;
        var key = 'ts.c'+_cid+'.i'+_eid;
        var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
        db.findOne({uid:_uid,zid:_zid},{ts:1,_id:0},null,function(err,doc){
            if(err){
                res.json({ok:0});
            }else{
                if(doc === null){
                    res.json({err:gv.errorCode.UnExistedEvidence});
                }else{
                    if(doc.ts['c'+_cid]['i'+_eid] === null){
                        res.json({err:gv.errorCode.UnExistedEvidence});
                    }else{
                        var ts = doc.ts['c'+_cid]['i'+_eid];
                        var costTime = gf.getEvidenceCostTime(_eid);
                        var current = new Date().getTime();
                        var updateObj={};
                        updateObj[key]='';
                        if(ts == null){
                            res.json({err:gv.errorCode.EvidenceNotReady});
                        }else{
                            if(ts+costTime*60*1000 <= current){
                                db.updateOne({uid:_uid,zid:_zid},{$unset:updateObj},null,function(err){
                                    // if ok,finish one task trace or other?
                                    res.json({ok:1});
                                });
                            }else{
                                res.json({err:gv.errorCode.EvidenceNotReady,left:ts+costTime*60*1000-current});
                            }
                        }
                    }
                }
            }
        });
    }
});

function applyPrize(key,incObj,amount){
    var mod = {p:amount};
    ts.ruleApply(mod);
    amount = mod.p;
    if(incObj[key]){
        incObj[key]+=amount;
    }else{
        incObj[key]=amount;
    }
}

function prizeSetup(key,tpzObj,incObj,setObj,ci,cid,taskid){
    var type = tpzObj[key]/1000000;
    var amount = tpzObj[key]%1000000;
    if(type == 1){
        applyPrize('c',incObj,amount);
    }else if(type == 3){
        applyPrize('eng',incObj,amount);
    }else if(type == 4){
        setObj['ci.c'+cid+'.cr']=ci['c'+cid].cr+'`'+amount+'_0_0_0_0';
    }
}

uds_router.route('/taskComplete').post(function(req,res){
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _tid = req.body.tid;
    var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
    db.findOne({uid:_uid,zid:_zid},{_id:0,ci:1},function(err,item){
        if(err){
            res.json({ok:0});
        }else{
            if(item == null){
                res.json({err:gv.errorCode.NullRoleData});
            }else{
                var key = "task.t"+_tid;
                var unsetObj={};
                unsetObj[key]='';
                var setObj = {};
                var caseObj = item.ci;
                var cid = Math.floor(_tid/1000);
                var caseDetail = caseObj["c"+cid];
                if(caseDetail == null){
                    res.json({err:gv.errorCode.CaseNotExist});
                }else{
                    var caseTask = caseDetail.ct || "";
                    var key_set = "ci.c"+cid+".ct";
                    setObj[key_set] = caseTask + ","+_tid;

                    // get the prize
                    //var tPz = sc.cfg[gv.globalTableName.taskConfig][0][_tid];
                    var incObj = {};
                    //if(tPz){
                    //    if(tPz.p1>0){
                    //        prizeSetup('p1',tpz,incObj,setObj,item.ci,cid);
                    //    }
                    //    if(tPz.p2>0){
                    //        prizeSetup('p2',tpz,incObj,setObj,item.ci,cid);
                    //    }
                    //}
                    // prize over
                    // setting next task logic
                    /*
                    setObj['ci.c'+cid+'.lid']=tpz.ntid;
                    setObj['ci.c'+cid+'.cat']=tpz.ntid+','+ci['c'+cid].cat;
                    */
                    if(Object.keys(incObj)<=0){
                        db.updateOne({uid:_uid,zid:_zid},{$unset:unsetObj,$set:setObj},null,function(err){
                            if(err){
                                res.json({ok:0});
                            }else{
                                res.json({ok:1,tid:_tid,set:setObj});
                            }
                        });
                    }else{
                        db.updateOne({uid:_uid,zid:_zid},{$unset:unsetObj,$set:setObj,$inc:incObj},null,function(err){
                            if(err){
                                res.json({ok:0});
                            }else{
                                res.json({ok:1,tid:_tid,inc:incObj,set:setObj});
                            }
                        });
                    }
                }
            }
        }
    });
});

uds_router.route('/caseRecord/:id').get(function(req,res){
    var _uid = req.query.uid;
    var _zid = Number(req.query.zid);
    var _cid = Number(req.query.cid);
    var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
    var queryFilter = {};
    var key = 'ci.c'+_cid;
    queryFilter[key] = 1;
    queryFilter._id = 0;
    // get case's all evidence lefttime
    var caseKey = 'ts.c'+_cid;
    queryFilter[caseKey] = 1;
    db.findOne({uid:_uid,zid:_zid},queryFilter,null,function(err,item){
        if(err){
            res.json({ok:0});
        }else{
            if(item == null){
                res.json({ok:0});
            }else{
                // compute the evidence left time if exist
                var current  = new Date().getTime();
                var obj = item.ts['c'+_cid];
                for(var k in obj){
                    var _eid = Number(k.substr(1));
                    var costTime = gf.getEvidenceCostTime(_eid);
                    var left = item.ts['c'+_cid][k] + costTime*60000 - current;
                    if(left < 0){
                        left = -1;
                    }
                    item.ts['c'+_cid][k] = left + '_' + costTime*60000;
                    //item.ts['c'+_cid][k+'tot'] = costTime*60000;
                }
                res.json(item);
            }
        }
    });
});

module.exports = uds_router;