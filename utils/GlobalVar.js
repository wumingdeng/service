/**
 * Created by kael on 15/5/28.
 */

module.exports = {
    errorCode: {
        UserNameExist: 1,
        UserPasswordWrong: 2,
        NoRoleInZone: 3,
        EnergyFull: 4,
        NoReadyAddEnergy: 5,
        EnergyNotEnough: 6,
        UnExistedEvidence: 7,
        EvidenceNotReady: 8,
        RoleExistInZone: 9,
        ParamWrong: 10,
        NoEnoughGemCompleteEvidence: 11,
        RoleNameExist: 12,
        UserNameFormatWrong: 13,
        PasswordFormatWrong: 14,
        CaseNotExist: 15,
        IllegalRequestParam: 16,
        NullRoleData: 17,
        WrongLoginInfo: 18,
        ErrorUDID: 19,
        AlreadyBindedUsername: 20,
        WrongTourAccount: 21,
        AlreadySigned: 22,
        DailySignNotComplete: 23,

        ReceiveSystemAwardAgain:40, //已经领取过系统奖励了
        ReceiveEnergyAgain:41,  //已经领取过体力了
        HaveNotEmail:42,     //没有要操作的邮件
        LackCoinToFeed:43,   //没有足够的资源喂养宠物
        LackMoneyToFeed:44, //没金币
        FeedPetBeforeCD:45  //还在喂养的CD时间中

    },
    platformType: {
        selfPlatform: 999,
        tours: 1000,
        gameCenter: 1
    },
    globalDefine: {
        addForMin: 5, // 多少时间增减一点体力
        costTypeAddByTime: 1,
        costTypeAddByMoney: 2,
        costTypeAddByGift: 3,
        DefaultEvidenceTime: 30,// min
        DefaultEvidenceCostGem: 5
    },
    globalTableName: {
        user: 'User',
        userDetail: 'UserDetail',
        userStatistics: 'UserStatistics',
        group: 'group',
        msgList: 'msgList',
        sdc: 'signDailyConfig',
        taskConfig: 'taskConfig'
    },

    activityRuleType: {
        RULE_TYPE_ENERGY_COST: 21,
        RULE_TYPE_PRIZE_MUL: 22,
        RULE_TYPE_COMPLETE_SCENE: 11,
        RULE_TYPE_SENDENG: 12,
        RULE_TYPE_PAY: 13    },
    currentActivitys: [],

    adminName: '系统管理员',
    EMAIL_EXPIRE_DATE:1,   //邮件的过期时间
    emailType: {
        SYSTEM_AWARD: 1,  //系统奖励
        GIVE_ENERGY: 2,   //好友赠送的体力
        APPLICATION_FRIEND: 3,    //有人申请好友
        APPLICATION_UNION: 4,    //有人申请加入工会
        SYSTEM_INFORM: 5,         //系统通知
        PERSONAL_MSG: 6,          //私聊
        HOTSPRITNG_MSG: 7          //温泉结算
    },

    HOT_SPRING_STAGE_TIME:4, //温泉分四次阶段领取奖励
    hotSpringTimer:[], //温泉的定时id

    feedPetType:{
        NORMAL:1,
        SUPER:2,
        INCREDIBLE:3
    },
    feedPetSpend:{
        NORMAL:{
            kind:"m",
            num:10,
            exp:10
        },
        SUPER:{
            kind:"c",
            num:20,
            exp:20
        },
        INCREDIBLE:{
            kind:"m",
            num:10,
            exp:100
        }
    },
    feedCD:3600000,    //喂养的时间间隔
    forumMaxNum: 10
};