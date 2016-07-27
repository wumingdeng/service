/**
 * Created by kael on 15/6/2.
 */
var express=require('express');
var schemeName = 'UserDetail';
var gv = require('../utils/GlobalVar');
var gf = require('../utils/GlobalFunc');
var db_proxy = require('../utils/dbconnectorS');
var energy_router=express.Router();

// 体力操作,增/减少,不是时间性增加
energy_router.route('/energy').post(function(req,res){
    var _zid = req.body.zid;
    var _uid = req.body.uid;
    var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
    db.findOne({uid:_uid,zid:_zid},{eng:1,teng:1,lem:1,cem:1},null,function(err,doc){
        if(err){
            res.json({ok:0});
        }else{
            if(doc == null){
                res.json({ok:0});
            }else{
                var cost = req.body.cost;
                var costType = req.body.costType || 0;
                var newMdl = gf.modifyEng(doc.lem,doc.cem,doc.teng,doc.eng,cost,costType);

                if(newMdl.hasOwnProperty("err")){
                    res.json({err:newMdl.err,eng:doc.eng,left:newMdl.ne});
                }else{
                    db.updateOne({uid:_uid,zid:_zid},{$set:{eng:newMdl.eng,lem:newMdl.lem,cem:newMdl.cem}},null,function(err){
                        if(err){
                            res.json({ok:0});
                        }else{
                            // send current energy,last energy modify time back
                            res.json({ok:1,eng:newMdl.eng,left:newMdl.ne});
                        }
                    });
                }
            }
        }
    });
});

energy_router.route('/energyTime').post(function(req,res){
    var _zid = req.body.zid;
    var _uid = req.body.uid;
    var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
    db.findOne({uid:_uid,zid:_zid},{eng:1,teng:1,lem:1,cem:1},null,function(err,doc){
        if(err){
            res.json({ok:0});
        }else{
            if(doc == null){
                res.json({err:gv.errorCode.NullRoleData});
            }else{
                var newMdl = gf.modifyEng(doc.lem,doc.cem,doc.teng,doc.eng,1,gv.globalDefine.costTypeAddByTime);
                if(newMdl.hasOwnProperty("err")){
                    res.json({err:newMdl.err,eng:doc.eng});
                }else{
                    db.updateOne({uid:_uid,zid:_zid},{$set:{lem:newMdl.lem,eng:newMdl.eng,cem:newMdl.cem}},null,function(err){
                        if(err){
                            res.json({ok:0});
                        }else{
                            //send current energy,last energy modify time back
                            res.json({ok:1,eng:newMdl.eng,left:newMdl.ne});
                        }
                    });
                }
            }
        }
    });
});

module.exports = energy_router;