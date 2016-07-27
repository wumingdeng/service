/**
 * Created by kael on 15/7/9.
 */

var db_proxy = require('./dbconnectorS');
var gv = require('./GlobalVar');
var exceptUrl = ['/api/login','/api/register','/api/bindTourNameThird','/api/bindTourName'];

function checkExcept(originalUrl){
    for(var idx = 0;idx < exceptUrl.length;idx++){
        if(exceptUrl[idx] === originalUrl){
            return true;
        }
    }
    return false;
}

function ipHandler(req,res,next){
    if(checkExcept(req.originalUrl) || req.method === 'GET'){
        next();
    }else{
        var uid = req.body.uid;
        var zid = req.body.zid;
        if(uid == null || zid == null){
            var key = uid + '_' + zid;
            var redis_client = db_proxy.redis;
            var m5 = req.body.m5 || '';
            //// use redis save global register user count
            redis_client.get(key, function(err,reply) {
                if(err){
                    res.json({ok:0});
                }else{
                    if(reply == null){
                        //redis_client.set(m5,key+'_'+new Date().getTime(),function(err){
                        //    next();
                        //});
                        // not login at all
                        res.json({err:gv.errorCode.WrongLoginInfo});
                    }else{
                        if(reply !== m5){
                            res.json({err:gv.errorCode.WrongLoginInfo});
                        }else{
                            next();
                        }
                    }
                }
            });
        }else{
            next();// register or other
        }
    }
}

module.exports = ipHandler;