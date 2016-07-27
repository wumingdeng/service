/**
 * Created by kael on 15/6/17.
 */
var gf = require('../utils/GlobalFunc');
var db_proxy = require('../utils/dbconnectorS');
function countBehavior(req,res,next){
    // statistics staff
    // 认为这是一次成功的统计,失败则客户端请求一次统计数据接口
    gf.statisticsSave(req,db_proxy,null);
    next();
}

module.exports = countBehavior;