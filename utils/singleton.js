/**
 * Created by kael on 15/5/28.
 */

// private
var pri_x = 1;
var pri_y = 2;
var gs = null;
var fs = require('fs');
function private_fun(){
    console.log('blabla');
}

var self = module.exports = {
    pub_x:'public',
    getPrivateX:function(){
        return pri_x;
    },
    getStaticData:function(){
        if(gs === null){
            // test here,maybe start with fs
            gs = {tasks:{},cases:{},items:{1001:{costTime:30/*30 min*/,costGem:5}}};
        }else{

        }
        return gs;
    },
    addFive: function addFive(num) {
        return pub_x + 5;
    }
};

// usage
//var singleton = require('simplesingleton');
//console.log(singleton.get_privateX());