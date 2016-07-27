/**
 * Created by kael on 15/6/10.
 */
var gv = require('./GlobalVar');
var singleton = require('../utils/singleton');
var ct = require('./cronTasks');
function getLeftTime(current,createEnergyModify){
    var ne  = gv.globalDefine.addForMin*60*1000 - (current - createEnergyModify) % (gv.globalDefine.addForMin*60*1000);
    return ne;
}

function addEnergyByTime(lastEnergyModify,createEnergyModify,currentEng,maxEng,obj,cost){
    var extraTime = (lastEnergyModify - createEnergyModify) % (gv.globalDefine.addForMin*60*1000);
    var current  = new Date().getTime();
    var elapsedTime = current - lastEnergyModify;
    cost = Math.floor((elapsedTime + extraTime) / (gv.globalDefine.addForMin*60*1000));
    if(cost != 0){
        if(cost+currentEng > maxEng){
            obj.eng = maxEng;
            obj.cem = current;
            obj.ne  = -1;
        }else{
            obj.eng = currentEng+cost;
            obj.ne  = getLeftTime(current,createEnergyModify);//gv.globalDefine.addForMin*60*1000 - (current - createEnergyModify) % (gv.globalDefine.addForMin*60*1000);
            obj.cem = createEnergyModify;
        }
        obj.lem = current;
    }else{
        obj.eng = currentEng;
        obj.lem = lastEnergyModify;
        obj.ne  = getLeftTime(current,createEnergyModify);//gv.globalDefine.addForMin*60*1000 - (current - createEnergyModify) % (gv.globalDefine.addForMin*60*1000);
        obj.cem = createEnergyModify;
    }
}

module.exports={
    getEvidenceCostTime:function(_eid){
        var itmObj = singleton.getStaticData().items[_eid];
        if(itmObj){
            return itmObj.costTime;
        }else{
            return gv.globalDefine.DefaultEvidenceTime;
        }
    },
    statisticsCount:function(req,db_proxy,res){
        //var wrong = false;
        if(req.body.sta){
            var _uid = req.body.uid;
            var _zid = req.body.zid;
            var db = db_proxy.mongo.collection('UserStatistics');
            db.updateOne({uid:_uid,zid:_zid},{$inc:req.body.sta},null,function(err){
                if(res){
                    if(err){
                        res.json({ok:0});
                    }else{
                        res.json({ok:1});
                    }
                }
            });
        }else{
            if(res){
                res.json({ok:0});
            }
        }
    },
    statisticsSave:function(req,db_proxy,res){
        if(req.body.sta){
            var _uid = req.body.uid;
            var _zid = req.body.zid;
            var db = db_proxy.mongo.collection('UserStatistics');
            var now = new Date().getTime();
            db.save({uid:_uid,zid:_zid,st:req.body.sta,date:now},null,function(err){
                if(res){
                    if(err){
                        res.json({ok:0});
                    }else{
                        res.json({ok:1});
                    }
                }
            });
        }else{
            if(res){
                res.json({ok:0});
            }
        }
    },
    md5gen:function(data) {
        var Buffer = require('buffer').Buffer;
        var buf = new Buffer(data);
        var str = buf.toString('binary');
        var crypto = require('crypto');
        return crypto.createHash('md5').update(str).digest('hex');
    },
    getClientIp:function(req) {
        var ip = req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || req.headers['x-forwarded-for'];
        //var port = req.connection._peername.port;
        return ip;//+':'+port;
    },
    modifyEng:function(lastEnergyModify,createEnergyModify,maxEng,currentEng,cost,costType){
        // lastEnergyModify 最后体力修改时间
        // createEnergyModify 最新时间计时开始点
        var obj = {};
        if(cost == 0){
            obj.err = gv.errorCode.ParamWrong;
        }
        if(cost < 0){
            // cost mod by activity
            var cc = {e:cost};
            ct.ruleApply(cc);
            cost = cc.e;
            // mod over
            // 扣体力
            if(currentEng + cost < 0){
                obj.err = gv.errorCode.EnergyNotEnough;
                obj.ne  = getLeftTime(new Date().getTime(),createEnergyModify);
            }else{
                if(currentEng >= maxEng){
                    // 满体力扣到可以计时增加体力,修改计时点,扣除后开始计时
                    if(currentEng + cost < maxEng){
                        obj.ne  = gv.globalDefine.addForMin*60*1000;
                        var current  = new Date().getTime();
                        obj.lem = current;
                        obj.cem = current;
                    }else{
                        obj.ne = -1;
                    }
                }else{
                    addEnergyByTime(lastEnergyModify,createEnergyModify,currentEng,maxEng,obj,cost);
                }
                obj.eng = currentEng+cost;
            }
        }else{
            // 按时间间隔加体力
            // cost值无效,具体增加由时间间隔计算
            if(costType == gv.globalDefine.costTypeAddByTime){
                if(currentEng >= maxEng){
                    obj.err = gv.errorCode.EnergyFull;
                }else{
                    addEnergyByTime(lastEnergyModify,createEnergyModify,currentEng,maxEng,obj,cost);
                }
            }else{
                // 道具或购买或奖励增加体力
                addEnergyByTime(lastEnergyModify,createEnergyModify,currentEng,maxEng,obj,cost);
                obj.eng = obj.eng+cost;
                if(obj.eng > maxEng){
                    var current  = new Date().getTime();
                    obj.lem = current;
                    obj.cem = current;
                    obj.ne  = -1;
                }
            }
        }
        // 总体时间计算,返回修正后的结构
        return obj;
    }

};