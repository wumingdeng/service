/**
 * Created by kael on 15/8/13.
 */
var express=require('express');
var schemeName = 'User';
var gv = require('../utils/GlobalVar');
var gf = require('../utils/GlobalFunc');
var db_proxy = require('../utils/dbconnectorS');
var tour_router=express.Router();

function genUserName(platformid,platformuuid){
    var usrname = '';
    if(platformid == 1){
        usrname = 'qq'+platformuuid;
    }else if(platformid == 2){// game center
        usrname = 'gc'+platformuuid;
    }
    return usrname;
}

tour_router.route('/requestTourName').get(function(req,res){
    res.json({err:gv.errorCode.NotRegisterNow});
    return ;
    var _udid = req.query.udid;
    if(_udid.length <= 0 ){
        res.json({err:gv.errorCode.ErrorUDID});
    }else{
        var current  = new Date().getTime();
        var info = gf.md5gen(_udid+current);
        var _un = 'u'+info;
        var _pwd = gf.md5gen(_un);
        var db = db_proxy.mongo.collection(schemeName);
        // make last tour account invalid
        //db.removeOne({udid:_udid,platform:gv.platformType.tour},null,function(err){)
        db.updateOne({udid:_udid,platform:gv.platformType.tours},{$set:{platform:gv.platformType.selfPlatform}},null,function(err){
            if(err){
                res.json({ok:0});
            }else{
                db.findOne({un:_un},{un:1},null,function(err,item){
                    if(err){
                        res.json({ok:0});
                    }else{
                        if(item == null){
                            // can reigster
                            db.save({un:_un,pwd:_pwd,token:'',platform:gv.platformType.tours, platformuuid:0,udid:_udid},{},function(err){
                                if(err){
                                    res.json({ok:0});
                                }else{
                                    res.json({un:_un});
                                }
                            });
                        }else{
                            res.json({un:_un});
                        }
                    }
                });
            }
        });
    }
});

tour_router.route('/bindTourNameThird').post(function(req,res){
    var _udid = req.body.udid || '';
    var _platformuuid = req.body.pu || '';
    var _platform = req.body.pt || gv.platformType.tours;
    if(_udid.length == 0 || _platformuuid.length == 0 || _platform >= gv.platformType.selfPlatform){
        res.json({ok:0});
    }else{
        var db = db_proxy.mongo.collection(schemeName);
        db.findOne({udid:_udid,platform:_platform,platformuuid:_platformuuid},{_id:0},null,function(err,item){
            if(err){
                res.json({ok:0});
            }else{
                var _un = genUserName(_platform,_platformuuid);
                if(item != null){
                    res.json({err:gv.errorCode.AlreadyBindedUsername,un:_un});
                }else {
                    var origin_puid = _platformuuid;
                    var _pwd = gf.md5gen(_un);
                    db.save({un:_un,pwd:_pwd,token:'',platform:_platform, platformuuid:origin_puid,udid:_udid},{},function(err){
                        if(err){
                            res.json({ok:0});
                        }else{
                            res.json({un:_un});
                        }
                    });
                }
            }
        });
    }
});

tour_router.route('/bindTourName').post(function(req,res){
    var _udid = req.body.udid || '';
    var _un = req.body.un || '';
    var _pwd = req.body.pwd || '';
    if(_udid.length == 0 || _un.length == 0 || _pwd.length == 0){
        res.json({ok:0});
    }else{
        var db = db_proxy.mongo.collection(schemeName);
        db.findOne({un:_un},{un:1},null,function(err,item){
            if(err){
                res.json({ok:0});
            }else{
                if(item == null){
                    db.findOne({udid:_udid,platform:gv.platformType.tours},{_id:0},null,function(err,item){
                        if(err){
                            res.json({ok:0});
                        }else{
                            if(item == null){
                                res.json({err:gv.errorCode.WrongTourAccount});
                            }else{
                                // other platform type
                                db.updateOne({udid:_udid,platform:gv.platformType.tours},{$set:{un:_un,pwd:_pwd,platform:gv.platformType.selfPlatform}},null,function(err){
                                    if(err){
                                        res.json({ok:0});
                                    }else{
                                        res.json({ok:1});
                                    }
                                });
                            }
                        }
                    });
                }else{
                    res.json({err:gv.errorCode.UserNameExist});
                }
            }
        });
    }
});

module.exports=tour_router;