/**
 * Created by kael on 15/6/2.
 */
var express=require('express');
var schemeName = 'User';
var gv = require('../utils/GlobalVar');
var gf = require('../utils/GlobalFunc');
var db_proxy = require('../utils/dbconnectorS');
//var crypto = require('crypto');
var login_router=express.Router();

login_router.route('/login').post(function(req,res){
    var db = db_proxy.mongo.collection(schemeName);
    //console.log(req.body);
    //return;
    db.findOne({un:req.body.un,pwd:req.body.pwd},{_id:1},null,function(err,item){
            if(err){
            res.json({ok:0});
        }else{
            if(item == null){
                res.json({err:gv.errorCode.UserPasswordWrong});
            }else{
                // find user's record,login should have zoneid together
                var _uid = item._id.toString();
                var _zid = req.body.zid || 0;
                //console.log(_zid);
                var collection = db_proxy.mongo.collection(schemeName+'Detail'+Math.floor(_zid/10));
                collection.findOne({uid:_uid,zid:_zid},{_id:0,ci:0,ts:0},null,function(err,role){
                    if(err){
                        res.json({ok:0});
                    } else{
                        //// 登陆成功发送md5(uid_zid_time),记录到redis
                        //var key = _uid+'_'+_zid;
                        //var md5 = req.body.m5 || '';//gf.md5gen(key +'_'+new Date().getTime());
                        //db_proxy.redis.get(key, function(err,reply) {
                        //    if(err){
                        //        res.json({ok:0});
                        //    }else{
                        //        var lastmd5 = reply || '';
                        //        db_proxy.redis.set(key,md5,function(err){
                        //            if(err){
                        //                res.json({ok:0});
                        //            }else{
                                        if(role == null) {
                                            // this zone did not have role yet
                                            res.json({err:gv.errorCode.NoRoleInZone,uid:_uid,m5:""});
                                            //res.json({err:gv.errorCode.NoRoleInZone,uid:_uid,m5:lastmd5});
                                        }else {
                                            role.m5 = "";
                                            //role.m5 = lastmd5;
                                            // 计算最新的体力值
                                            var newMdl = gf.modifyEng(role.lem,role.cem,role.teng,role.eng,1,gv.globalDefine.costTypeAddByTime);
                                            if(newMdl.hasOwnProperty("err")){
                                                res.json(role);
                                            }else{
                                                // 更新最后体力更新时间
                                                console.log(newMdl.eng+'..'+newMdl.lem+'..'+newMdl.cem);
                                                collection.updateOne({uid:_uid,zid:_zid},{$set:{lem:newMdl.lem,eng:newMdl.eng,cem:newMdl.cem}},null,function(err){
                                                    if(err){
                                                        res.json({ok:0});
                                                    }else{
                                                        role.ne  = newMdl.ne;
                                                        role.eng = newMdl.eng;
                                                        res.json(role);
                                                    }
                                                });
                                            }
                                        }
                                    //}
                        //        });
                        //    }
                        //});
                    }
                });
            }
        }
    });
}).get(function(req,res){
    // 第三方登陆
    // 开启验证窗口,第三方回调到地址server/login,获得Code和state,再调用回去获取accesstoken,区分不同平台,这里逻辑要分类
    // 获取access token后,获取全局的平台ID等存入数据库创建新角色
});

module.exports=login_router;