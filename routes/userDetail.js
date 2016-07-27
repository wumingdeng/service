/**
 * Created by kael on 15/6/2.
 */
var express=require('express');
var schemeName = 'UserDetail';
var ssName = 'UserStatistics';
var gv = require('../utils/GlobalVar');
var db_proxy = require('../utils/dbconnectorS');
var userdetail_router=express.Router();

userdetail_router.route('/userDetail').post(function(req,res){
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
    // create a role data
    // other data would make when create
    // last energy modify time
    var _lem  = new Date().getTime();
    db.findOne({uid:_uid,zid:_zid},{_id:1},null,function(err,item){
        if(err){
            res.json({ok:1});
        }
        if(item == null){
            if(req.body.nn == null){
                res.json({err:gv.errorCode.ParamWrong});
            }else{
                db.findOne({zid:_zid,nn:req.body.nn},{_id:1},function(err2,item2){
                    if(err2){
                        res.json({ok:0});
                    }else{
                        if(item2 == null){
                            db.save({nn:req.body.nn,g:req.body.g,
                                uid:req.body.uid,zid:req.body.zid,
                                eng:150,teng:150,lem:_lem,cem:_lem,// lem:最后修改体力的时间戳,cem:创建的时间戳
                                nd:1,m:1000,c:0,p:'1_0',s:1,cs:'1`0',
                                hid:1,cid:"",cpt:[],hst:3,hs:"",hsd:0,lv:1,t:10,
                                task:{},ci:{},ts:{},sk:{},
                                pet:{cp:1,cd:0,id:{"1":{lv:1,exp:0,data:{}}}}},{},function(err){
                                if(err){
                                    res.json({ok:0});
                                }else{
                                    res.json({eng:150,teng:150});
                                }
                            });
                        }else{
                            res.json({err:gv.errorCode.RoleNameExist});
                        }
                    }
                });
            }
            //// statistics staff
            //var collection = db_proxy.mongo.collection(ssName);
            //collection.save({uid:req.body.uid,zid:req.body.zid},null,null);
        }else{
            res.json({err:gv.errorCode.RoleExistInZone});
        }
    });
});

// get all saved document
// param all in body,:id now use for identify ,use /userDetail/1 for it or /userDetail/024455ceda1321eeffa
userdetail_router.route('/userDetail/:id').get(function(req,res){
    // :id way
    //var par = req.params.id.split('_')
    //var _uid = par[0];
    //var _zid = Number(par[1]);

    // url params
    var _uid = req.query.uid;
    var _zid = Number(req.query.zid);
    var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
    db.findOne({uid:_uid,zid:_zid},{_id:0,uid:0,zid:0,cem:0},null,function(err,doc){
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
}).delete(function(req,res){
    // behaviour no define
    // delete the role
    //var _uid = req.body.uid;
    //var _zid = req.body.zid;
    var _uid = req.query.uid;
    var _zid = Number(req.query.zid);
    var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
    db.removeOne({uid:_uid,zid:_zid},null,function(err){
        if(err){
            res.json({ok:0});
        }else{
            res.json({ok:1});
        }
    });
});

userdetail_router.route('/userDetailUpdate').post(function(req,res){
    var _zid = req.body.zid;
    var _uid = req.body.uid;
    var db = db_proxy.mongo.collection(schemeName+Math.floor(_zid/10));
    db.updateOne({zid:_zid,uid:_uid},{$set:req.body.setting},null,function(err){
        if(err){
            res.json({ok:0});
        }else{
            // new val will be send backres.json({ok:1,nval:req.body.setting});
            res.json({ok:1,nval:req.body.setting});
        }
    });
});

module.exports=userdetail_router;