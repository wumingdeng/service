/**
 * Created by kael on 15/6/4.
 */

//var crypto = require('crypto');
var xxtea = require('./xxtea');
var secretKey = '8567b3775db070c8';
//
//function decodeInner(str){
//    var str = req.body.query;
//    var s_for_decode_b64 = new Buffer(str,'base64');
//    var str_for_decode = s_for_decode_b64.toString('binary');
//    return JSON.parse(xxtea.dec(str_for_decode,secretKey));
//}
function deEncrypt(req,res,next){
    if(req.method === 'GET'){
        next();
    }else if(req.method == 'POST'){
        if(req.body.m != null){
            var str = req.body.m;
            //var cipher = crypto.createDecipher('aes-128-ecb',secretKey);
            // decrypt data/inputcoding/outputcoding
            // encrypt data/inputcoding/outputcoding('hex'.'base64'..)
            //try{
            //    req.body = JSON.parse(cipher.update(str,'hex','utf8') + cipher.final('utf8'));
            //}catch(exp){
            //    res.json({pw:1});
            //    return;
            //}
            try{
                // encode way : uft8 string -> xxtea encode as input_binary/output_default_binary -> encode as binary buffer -> base64 encoded buffer
                // decode way : base64 buffer decoded -> decode as binary buffer-> xxtea decode as input_binary/output_default_binary -> out put as utf8
                // api :new Buffer(str[, encoding]) create a buffer and set this buffer's encoding
                // api :Buffer.toString([encoding]) convert a buffer to encoding,defalut is all utf8
                var s_for_decode_b64 = new Buffer(str,'base64');
                var str_for_decode = s_for_decode_b64.toString('binary');
                var str_buffer = new Buffer(xxtea.dec(str_for_decode,secretKey),'binary');
                //req.body = JSON.parse(xxtea.dec(str_for_decode,secretKey));
                req.body = JSON.parse(str_buffer.toString('utf8'));
                next();
            }catch(exp){
                res.json({err:16});
            }
        }else{
            res.json({err:16});
        }
    }else{
        res.json({err:16});
    }
}

module.exports = deEncrypt;