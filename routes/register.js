/**
 * Created by kael on 15/5/28.
 */
var express=require('express');
var schemeName = 'User';
var gv = require('../utils/GlobalVar');
var db_proxy = require('../utils/dbconnectorS');
var register_router=express.Router();

register_router.route('/register').post(function(req,res){
    res.json({err:gv.errorCode.NotRegisterNow});
    return ;
    var db = db_proxy.mongo.collection(schemeName);
    if(req.body.un == null || req.body.pwd == null){
        res.json({ok:0});
    }else{
        var wrong = false;
        // check user name and password rules
        var matchUn = /^[a-zA-Z]{1}[0-9a-zA-Z_]{3,18}$/
        if(!matchUn.test(req.body.un)){
            wrong = true;
            res.json({err:gv.errorCode.UserNameFormatWrong});
        }
        var matchPwd = /[a-zA-Z0-9@#$%^&*~!`]{6,18}$/
        if(!matchPwd.test(req.body.pwd)){
            wrong = true;
            res.json({err:gv.errorCode.PasswordFormatWrong});
        }

        if(!wrong){
            // check exist user name
            db.findOne({un:req.body.un},{un:1,pwd:1},null,function(err,item){
                if(err){
                    res.json({ok:0});
                }else{
                    if(item == null){
                        // can reigster
                        db.save({un:req.body.un,pwd:req.body.pwd,token:'',platform:gv.platformType.selfPlatform, platformuuid:'',udid:''},{},function(err){
                            if(err){
                                res.json({ok:0});
                            }else{
                                //var redis_client = db_proxy.redis;
                                //// use redis save global register user count
                                //redis_client.incr("register_count");
                                //redis_client.get("register_count", function(err,reply) {
                                //
                                //});
                                res.json({ok:1});
                            }
                        });
                    }else{
                        res.json({err:gv.errorCode.UserNameExist});
                    }
                }
            });
        }
    }
});

module.exports=register_router;