/**
 * Created by czw on 16/2/4.
 */
var express = require('express');
var schemeName = 'UserDetail';
var gv = require('../utils/GlobalVar');
var gf = require('../utils/GlobalFunc');
var db_proxy = require('../utils/dbconnectorS');
var petConfig = require('../data/petConfig');

var pet_router = express.Router();

//喂养宠物
pet_router.route('/pet/feed').post(function (req, res) {
    var _uid = req.body.uid;
    var _zid = req.body.zid;
    var _pid = req.body.pid;  //宠物id
    var _pt = req.body.pt;  //喂养类型
    var spend = 0;  //喂养花费

    var db = db_proxy.mongo.collection(schemeName + Math.floor(_zid / 10));
    db.findOne(
        {uid: _uid, zid: _zid},
        {pet: 1, c: 1, m: 1 ,_id:0},
        null,
        function (err, item) {
            if (err) {
                res.json({ok: 0});
            } else {
                //判断喂养时间
                var nowTime = new Date().getTime();
                if (nowTime - item.pet.cd < gv.feedCD){
                    res.json({err:gv.errorCode.FeedPetBeforeCD});
                    return;
                }

                var kind;
                var num;
                var exp;
                if (_pt == gv.feedPetType.NORMAL) {
                    kind = gv.feedPetSpend.NORMAL.kind;
                    num = gv.feedPetSpend.NORMAL.num;
                    exp = gv.feedPetSpend.NORMAL.exp;
                } else if (_pt == gv.feedPetType.SUPER) {
                    kind = gv.feedPetSpend.SUPER.kind;
                    num = gv.feedPetSpend.SUPER.num;
                    exp = gv.feedPetSpend.SUPER.exp;
                } else if (_pt == gv.feedPetType.INCREDIBLE) {
                    kind = gv.feedPetSpend.INCREDIBLE.kind;
                    num = gv.feedPetSpend.INCREDIBLE.num;
                    exp = gv.feedPetSpend.INCREDIBLE.exp;
                }
                if (item[kind] < num) {
                    if (kind == "c") {
                        res.json({err: gv.errorCode.LackCoinToFeed});
                    } else if (kind == "m") {
                        res.json({err: gv.errorCode.LackMoneyToFeed});
                    }
                    return;
                }
                item[kind] = item[kind] - num;
                item.pet.id[_pid].exp += exp;
                //计算新等级
                var petData = petConfig.data[_pid];
                var expData = petData[petConfig.EXPERIENCE];
                var expArr = new Array();
                expArr = expData.split('`');

                //算出升级需要的总经验 和升级的进度
                var curLvExp = 0;   //当前等级需要经验
                var nextLvExp = 0;   //下一级需要经验
                var newLv = 0;  //新等级
                var newExp = item.pet.id[_pid].exp;

                if (newExp >= Number(expArr[expArr.length - 1])) {
                    //说明满级了
                    newLv = expArr.length
                    curLvExp = expArr[expArr.length - 1]
                } else {
                    for (var i in expArr) {
                        if (Number(expArr[Number(i)]) > newExp) {
                            newLv = Number(i);
                            curLvExp = Number(expArr[i - 1]);
                            nextLvExp = Number(expArr[i]);
                            break
                        }
                    }
                }

                item.pet.id[_pid].lv = newLv
                //记录喂养的时间
                item.pet.cd = nowTime;

                //增加经验 扣除消耗
                db.updateOne(
                    {uid: _uid, zid: _zid},
                    {$set: {c: item.c, m: item.m, pet:item.pet}},
                    null,
                    function (err, r) {
                        if (err) {
                            res.json({ok: 0});
                        } else {
                            res.json({ok:1,exp:item.pet.id[_pid].exp,lv:newLv,cExp:curLvExp,nExp:nextLvExp,c:item.c,m:item.m,cd:item.pet.cd});
                        }
                    }
                )
            }
        }
    );

})


module.exports = pet_router;