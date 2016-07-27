/**
 * Created by kael on 15/11/30.
 */
var express=require('express');
var activity_router=express.Router();

activity_router.route('/getPlayCount').get(function(req,res){
    //var strXML = "<?xml version=\"1.0\"?>";
    //strXML+="<items>"
    //strXML+="<item qtyChance=\"12\"/>";
    //strXML+="</items>"
    var jsonObj = {res:0}
    res.header("Access-Control-Allow-Origin", "*")
    //res.send(strXML)
    res.send(jsonObj)
});

activity_router.route('/commitResult').get(function(req,res){
    var strXML = "<?xml version=\"1.0\"?>";
    strXML+="<SystemMsg>"
    strXML+="<code>1</code>";
    strXML+="<msg>成功</msg>";
    strXML+="</SystemMsg>"
    res.send(strXML)
});

activity_router.route('/startGame').get(function(req,res){
    var strXML = "<?xml version=\"1.0\"?>";
    strXML+="<SystemMsg>"
    strXML+="<code>1</code>";
    strXML+="<msg>122@3232</msg>";
    strXML+="<value>486</value>";
    strXML+="</SystemMsg>"
    res.send(strXML)
});

activity_router.route('/getScoreList').get(function(req,res){
    var strXML = "<?xml version=\"1.0\"?>";
    strXML+="<items>"
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'1\' puzzleScore=\"1000\" countTime=\"01-01 19:20\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'12\' puzzleScore=\"200\" countTime=\"01-01 17:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'223\' puzzleScore=\"434234\" countTime=\"01-01 10:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'4\' puzzleScore=\"23423\" countTime=\"02-02 19:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'15\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'25\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'325\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="<item userName=\"啊速度和电视看风景\" puzzleRank=\'5\' puzzleScore=\"23424\" countTime=\"01-03 9:30\"/>";
    strXML+="</items>"
    res.send(strXML)
});


activity_router.route('/getMyPrize').get(function(req,res){
    var strXML = "<?xml version=\"1.0\"?>";
    strXML+="<items>"
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'1\' puzzleScore=\"1000\" dumpDate=\"01-01 19:20\"/>";
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'12\' puzzleScore=\"200\" dumpDate=\"01-01 17:30\"/>";
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'223\' puzzleScore=\"434234\" dumpDate=\"01-01 10:30\"/>";
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'4\' puzzleScore=\"23423\" dumpDate=\"02-02 19:30\"/>";
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'15\' puzzleScore=\"23424\" dumpDate=\"01-03 9:30\"/>";
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'25\' puzzleScore=\"23424\" dumpDate=\"01-03 9:30\"/>";
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'325\' puzzleScore=\"23424\" dumpDate=\"01-03 9:30\"/>";
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'5\' puzzleScore=\"23424\" dumpDate=\"01-03 9:30\"/>";
    strXML+="<item giftName=\"啊速度和电视看风景\" totalNum=\'5\' puzzleScore=\"23424\" dumpDate=\"01-03 9:30\"/>";
    strXML+="</items>"
    res.send(strXML)
});

activity_router.route('/getMyScore').get(function(req,res){
    var strXML = "<?xml version=\"1.0\"?>";
    strXML+="<items>"
    strXML+="<item puzzleRank=\'10\' puzzleScore=\"1000\" countTime=\"03-01 19:20\"/>";
    strXML+="</items>"
    res.send(strXML)
});

activity_router.route('/download/*').get(function (req, res, next) {
    var f = req.params[0];
    //f = path.resolve(f);
    console.log('Download file: %s', f);
    res.download(f);
});

module.exports = activity_router;