/**
 * Created by czw on 15-12-2.
 */

var db_proxy = require('./dbconnectorS');
var gv = require('./GlobalVar');
var clubFun = require('./clubFunc')

module.exports = {
    awardType: {
        energy: 'energy',   //体力
        coin: 'coin',     //游戏币
        money: 'money',    //金币
        token: "token",   //令牌
        prop: {
            P1: 'p1',   //道具1
            P2: 'p2'    //道具2
        }
    },
    /*
     *   发系统奖励
     *   @uid 用户id
     *   @zid 分区id
     *   @award 奖励物品 (格式为{物品ID:数量})
     * */
    systemAward: function (uid, zid, award) {
        //把奖励放入邮件中
        var nowTime = new Date().getTime();
        var db = db_proxy.mongo.collection("email");
        //直接插入表中
        db.save({
            uid: uid,
            zid: zid,
            state: 0,
            fn: gv.adminName,
            time: nowTime,
            type: gv.emailType.SYSTEM_AWARD,
            msg: award
        }, function (err, doc) {
            if (err) {

            }
            else {

            }
        });
    },

    /*
     *   赠送体力
     *   @uid 赠送者id   //uid用来取昵称 或者直接传入昵称
     *   @zid 分区id
     *   @to  接受体力的id
     *   @num   赠送的体力值
     * */
    giveEnergy: function (uid, zid, to,fromName, num,giveSuccessCallBack,giveFailCallBack) {
        var nowTime = new Date().getTime();
        var db = db_proxy.mongo.collection("email");
        //直接插入表中
        db.save({
            uid: to,
            zid: zid,
            state: 0,   //0:未领取 1 已领取
            from: uid,
            fn:fromName,
            time: nowTime,
            type: gv.emailType.GIVE_ENERGY,
            msg: num
        }, function (err, r) {
            if (err) {
                giveFailCallBack()
                console.log("save error")
            }
            else {
                giveSuccessCallBack()
                console.log("save ok")
            }
        });

    },
    /*
     *   有人申请好友
     *   @uid 用户id
     *   @zid 分区id
     *   @to 要加的对象
     */
    applicationFriend: function (uid, zid, to,fromName,failCallBack,successCallBack) {
        var nowTime = new Date().getTime();
        var db = db_proxy.mongo.collection("email");
        db.findOne({type:gv.emailType.APPLICATION_FRIEND,uid:to,from:uid},{state:1},null,function(err,item){
            if(err){
                failCallBack({ok:0})
            }else{
                if(item && item.state != 2){
                    //已经存在记录
                    failCallBack({ok:2})
                }else{
                    //直接插入表中
                    db.save({
                        uid: to,
                        zid: zid,
                        state: 0,   //0:未操作 1 已同意 2 已拒绝
                        from: uid,
                        fn:fromName,
                        time: nowTime,
                        type: gv.emailType.APPLICATION_FRIEND,
                        msg: ""
                    }, function (err, doc) {
                        if (err) {
                            failCallBack({ok:0})
                        }
                        else {
                            successCallBack()
                        }
                    });
                }

            }
        })
    },
    /*
     *   有人申请加入工会
     *   @uid 用户id
     *   @zid 分区id
     *   @to 有权限处理申请的玩家
     */
    applicationUnion: function (uid, zid, to,fromName,failCallBack,successCallBack) {
        var nowTime = new Date().getTime();
        var db = db_proxy.mongo.collection("email");
        //直接插入表中
        db.save({
            uid: to,
            zid: zid,
            state: 0,   //0:未操作 1 已同意 2 已拒绝
            from: uid,
            fn:fromName,
            time: nowTime,
            type: gv.emailType.APPLICATION_UNION,
            msg: "您有一个工会申请 请注意查收"
        }, function (err, doc) {
            if (err) {
                failCallBack()
            }
            else {
                successCallBack()
            }
        });
    },
    /*
     *   系统通知
     *   @uid 用户id
     *   @zid 分区id
     *   @msg 通知内容
     */
    systemInform: function (uid, zid, msg) {
        var nowTime = new Date().getTime();
        var db = db_proxy.mongo.collection("email");
        //直接插入表中
        db.save({
            uid: uid,
            zid: zid,
            state: 0,   //0:未读 1 已读
            from: gv.adminName,
            time: nowTime,
            type: gv.emailType.SYSTEM_INFORM,
            msg: msg
        }, function (err, doc) {
            if (err) {

            }
            else {

            }
        });
    },
    /*
     *   用户之间的私聊
     *   @uid 用户id
     *   @zid 分区id
     *   @to  发给谁
     *   @msg 消息内容
     */
    personalMsg: function (uid, zid,to,msg) {

        var nowTime = new Date().getTime();
        var db = db_proxy.mongo.collection("email");
        db.save(
            {
                uid: to,
                zid: zid,
                from: uid,
                type: gv.emailType.PERSONAL_MSG,
                msg: msg,
                time:nowTime
            },

            function (err) {
                if (err) {

                } else {

                }
            }
        );
    },
    /*
     *   温泉的结算
     *   @uid 用户id
     *   @zid 分区id
     *   @fns 要加的对象
     */
    visitHotSpring: function (uid, zid,fns) {
        var nowTime = new Date().getTime();
        var insertObjArr = new Array()
        var db = db_proxy.mongo.collection("email");
        for(var i = 0;i<fns.length;i++){
            insertObjArr[i] = {uid:fns[i].uid,zid:zid,state:0,from:uid,fn:fns[i].name,type:gv.emailType.HOTSPRITNG_MSG,msg:"",time:nowTime}
        }
        db.insertMany(insertObjArr,function(err,reslut){
            if (err) {

            } else {
                clubFun.endHotSpring(uid,zid,fns)
            }
        })
    }
}