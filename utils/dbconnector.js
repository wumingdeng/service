/**
 * Created by kael on 15/5/28.
 */

module.exports = function(mongo,redis){
    var _mongo = mongo;
    var _redis = redis;
    this.getMongo = function(){
        return _mongo;
    }
    this.getRedis = function(){
        return _redis;
    }
    this.cleanup = function(){

    }
}