/**
 * Created by kael on 15/5/28.
 */

var _mongo;
var _redis;

var self = module.exports = {
    mongo:_mongo,
    redis:_redis,
    cleanup:function(){
        if(_mongo){
            _mongo.close();
        }
    }
}