/**
 * Created by kael on 15/6/17.
 */
var express=require('express');
//var schemeName = 'UserStatics';
//var db_proxy = require('../utils/dbconnectorS');
//var gf = require('../utils/GlobalFunc');

var statistics_router=express.Router();

statistics_router.route('/statistics').post(function(req,res){
    //gf.statisticsCount(req,db_proxy,res);
    var obj = {ok:1};
    //obj.m = cipher.update('test','utf-8','hex')+cipher.final('hex');
    res.json(obj);
    /*
              |---->文化人类学
              |---->体质人类学
    人类学---->|
              |---->史学前
              |---->民族志
    */
});

module.exports = statistics_router;