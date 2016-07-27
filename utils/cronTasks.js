/**
 * Created by kael on 15/11/30.
 */
var timerJobs = {};
var db_proxy = require('./dbconnectorS');
var later = require('later');
var sc = require('./staticConfigs');
var timer = null;
var gv = require('./GlobalVar');

function checkCrons(){
   for(var i = 0;i<sc.cfg.activityConfig.length;i++){
        var activity = sc.cfg.activityConfig[i];
        var date = new Date(Date.now());
        var startDate;
        var endDate;
        if(activity.type == 2){
            var today = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' ';
            startDate = today+activity.start;
            endDate = today+activity.end;
        }else{
            startDate = new Date(activity.start);
            endDate = new Date(activity.end);
        }
        if(date>=startDate && date <endDate){
            timerJobs[activity.name] = activity;
        }else{
            delete timerJobs[activity.name];
        }
    }
}

function onValueMod(val){
    for(var k in timerJobs){
        var rules = timerJobs[k].rule;
        for(var type in rules){
            if(type >= gv.activityRuleType.RULE_TYPE_ENERGY_COST){
                if(type == gv.activityRuleType.RULE_TYPE_ENERGY_COST && val.e){
                    val.e = val.e * rules[type];
                }
                if(type == gv.activityRuleType.RULE_TYPE_PRIZE_MUL && val.p){

                    val.p = val.p * rules[type];
                }
            }
        }
    }
}

function onBehaviorMake(behaviorId,currentCnt){
    var prize = {};
    for(var k in timerJobs){
        var rules = timerJobs[k].rule;
        if(rules[behaviorId]){
            if(currentCnt >= rules[behaviorId].cnt){
                prize = rules[behaviorId].prize;
                break;
            }
        }
    }
    return prize;
}

function arrangeCrons(){
    var shced3 = later.parse.recur().every(1).hour();//.minute();
    timer = later.setTimeout(function(){
        checkCrons();
    },shced3);
}

module.exports = {
    aCrons:arrangeCrons,
    cCrons:checkCrons,
    ruleApply:onValueMod,
    ruleBehavior:onBehaviorMake,
    tj:timerJobs
}
