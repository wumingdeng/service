/**
 * Created by kael on 15/7/1.
 */
//var crypto = require('crypto');
var xxtea = require('./xxtea');
var secretKey = '8567b3775db070c8';// md5 16 for heisenberge
function deEncrypt(req,res,next){
    //var cipher = crypto.createCipher('aes-128-ecb',secretKey);
    //res.body.m = cipher.update('test','utf-8','hex')+cipher.final('hex');
    //next();
    var after = xxtea.enc(JSON.stringify(res.body),secretKey);
    var b = new Buffer(after,'binary');
    res.body = {};
    res.body.m = b.toString('base64');
    next();
}

module.exports = deEncrypt;