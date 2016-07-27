/**
 * Created by kael on 15/6/2.
 */
// 创建脚本
var db = connect( 'kael' );

// 3.0+
// 2.4 use addUserInstead
db.createUser({
    user: "kael",
    pwd: "2932615qian",
    roles: [
        { role: "readWrite", db: "kael" }
    ]}
);

db.createCollection('User');
db.User.ensureIndex({un:1,pwd:1});

// every ten zone in one collection
for(var i=0;i<10;i++){
    var collectionName = 'UserDetail'+i;

    db.createCollection(collectionName);
    //db.createCollection('UserRelation');
    db[collectionName].ensureIndex({uid:1,zid:1});
}
db.createCollection('UserStatistics');
db.UserStatistics.ensureIndex({uid:1,zid:1});
db.createCollection('msgList');
db.msgList.ensureIndex({uid:1});
// id是索引
db.createCollection('group');
// 程序启动时读入的模板数据,不需要设置索引
db.createCollection('prizeConfig');
db.createCollection('signDailyConfig');
db.createCollection('activityConfig');
db.createCollection('taskConfig');

//
// test data generation
//db.activityConfig.insert({name:'每日活动',content:'活动内容',rule:{21:{p:0.5},22:{p:1.35}},type:2,start:'20:00',end:'23:00'});
//db.activityConfig.insert({name:'周期活动',content:'活动内容',rule:{21:{p:0.4},12:{cnt:3,prize:{1001:1,1003:2,1004:3}}},type:1,start:'2015-12-1 0:00',end:'2015-12-25 23:59'});

//var year = 2015;
//for(var i=1;i<13;i++){// month
//    var obj = {};
//    // prize 1-rmb 2-coin 3-energy 1000-3000 item-id 4000-4200 sceneid 4300-5000 taskid
//    obj = {d:[],seq:[{days:3,prize:{1:100,2:300}},
//        {days:7,prize:{1:100,1001:3}},
//        {days:10,prize:{1:100,3:30}}]};
//    var date = new Date(year,i,0).getDate();
//    for(var j = 1;j<date;j++){
//        var val1 = {begin:0,end:12,prize:{1:11,3:1}};
//        var val2 = {begin:12,end:18,prize:{1:12,3:2}};
//        var val3 = {begin:18,end:24,prize:{1:13,3:3}};
//        var day = [];
//        day.push(val1,val2,val3);
//        obj.d.push(day);
//    }
//    db.signDailyConfig.insert(obj);
//}

//db.prizeConfig.insert({d:{1001:1,// rmb
//   1002:2,// coin
//   1003:3,// energy
//   1004:4,// scene
//   1005:5 // item
//   }});


//db.taskConfig.insert({1001:{p1:1000086,p2:0,ntid:'1003'},
//    1002:{p1:0,p2:0,ntid:'1003'},
//    1003:{p1:3000030,p2:0,ntid:'1004'},
//    1004:{p1:4001003,p2:0,ntid:'1005'},
//    1005:{p1:3000010,p2:0,ntid:'1006'},
//    1006:{p1:4001005,p2:0,ntid:'1007'},
//    1007:{p1:0,p2:0,ntid:'1009'},
//    1008:{p1:0,p2:0,ntid:'1016'},
//    1009:{p1:0,p2:0,ntid:'1010'},
//    1010:{p1:0,p2:0,ntid:'1012'},
//    1011:{p1:4001008,p2:0,ntid:'1016'},
//    1012:{p1:4001006,p2:0,ntid:'1011`1008'},
//    1013:{p1:0,p2:0,ntid:'1014`1015'},
//    1014:{p1:4001008,p2:0,ntid:'1016'},
//    1015:{p1:0,p2:0,ntid:'1016'},
//    1016:{p1:0,p2:0,ntid:'1017'},
//    1017:{p1:0,p2:0,ntid:'1018'},
//    1018:{p1:0,p2:0,ntid:''},
//});

// data struct info
/*
 userDetail:{
 "_id" : ObjectId("56306947fd59e6437219e403"), // 索引ID
  "nn" : "Jshzb",// nick name 昵称
  "g" : null,// gender 性别
  "uid" : "5630691bfd59e6437219e401",// 关联账号ID
  "zid" : 1,// 区域ID
  "eng" : 246, // 当前体力
  "teng" : 150, // 体力上限
  "lem" : null, // 最后体力修改时间
  "cem" : null, // 最新时间计时开始点
  "nd" : { "n2" : true, "n3" : true, "n4" : true, "n5" : true, "n19" : true, "n6" : true, "n13"
  : true, "n22" : true, "n8" : true, "n23" : true, "n20" : true, "n9" : true, "n18" : true,
  "n12" : true, "n16" : true, "n10" : true, "n21" : true, "n1" : true },
  "m" : 695, // money 游戏货币
  "c" : 0,
  "p" : "1_0",// 进度
  "s" : 1,
  "cs" : "1`0",
  "t" : 26,
  "task" : { "t1017" : { "am1" : 1, "am2" : 0, "st" : 3 } },// 任务追踪
  "ci" : { "c1" : { "lid" : 1018,
  "cr" : "1001_5_6500_16500_3`1003_5_4000_11000_3`1005_5_4100_20700_3`1006_5_4933_14432_3`1008_5_2543_12844_3",// 案件记录
  "cst" : -3,
  "cat" : "1018,1017,1016,1008,1011,1012,1010,1009,1007,1006,1005,1004,1003,1001",
  "ct" : ",1001,1003,1004,1005,1006,1007,1009,1010,1012,1011,1008,1016,1017,1018", "ai" : "3" } }, // 案件信息 case info
  "ts" : { "c1" : {  } ,
  "sr" : {d:[[1,1,1],[1,0,1],...],s:3,seq:{3:3,5:1}}, // 签到记录 数组外为每日 数组元素N个为不同时间段,s:当前连续签到阶段stage，3天，5天，7天...
  // seq:当前已经签了几天,键值对3:3->3天连续签的已经签了3天,可以领奖励
  "gid" : 0,// 用户参加的公会ID
  "flst": [{id:xxx,nn:nickname,last_energy_send:141211,last_help_ts:13121}],// 用户好友列表
  "ars":{"aid":{"trace1":{"needbehavior":2,"cnt":1,"status:0},...},...},// 活动追踪记录表
  }

  // 统计数据
  UserStatistics:{}

  // 奖品配置
  prizeConfig:{
    d:{1001:"userDetail.m",
        1002:"userDetail.token",
        1003:"userDetail.energy",...}
  }

  // 签到记录配置
  signDailyConfig:{
      1:{d:[ [{begin:0:00,end:11:59,prize_id:1001,account:10000},// 每日数据,月份数:[日数组:[每日若干次]]
      {begin:12:00,end:17:59,prize_id:2001,account:10000},
      {begin:18:00,end:23:59,prize_id:3001,account:1}],[],... ],
      seq:[{days:3,prize_id:1001,account:100000},{days:7,...}] // 连续奖励
      },
      2:{...}
  }

  // 活动配置
  // 活动配置细项规则
  // 1-行为任务
  // 11-完成关卡次数
  // 12-送体力次数
  // 13-充值金额
  // 2-产入产出变化,p参数是比例
  // 21-体力消耗减半
  // 22-奖励
  activityConfig:{
    {_id:'xxx',name:'活动名',content:'活动内容',
    rule:[{21:{nouse}},{12:{cnt:3,prize:{1001:1,1003:2,1004:3}}}],
    type:'活动类别,周期性/循环性',start:'开始日期',end:'结束日期'},
  }

  // 任务奖励数据配置
  taskConfig:{
    {_id:x,pz1:1000086,pz2:0},...
  }

  // 场景奖励配置
  sceneConfig:{
    {_id:x,pz1:1000086,pz2:0},...
  }

  // 邮件记录
  msgList:{
    {_id:..,
    _player_id:56306947fd59e6437219e403,//用户玩家数据ID,
    zid:1,//分区ID
    d:[{from:system,txt_content:'',item_list:[{id:1001,count:3},{}...]},
       {from:friend_id,txt_content:'',item_list:...}]
    }...
  }

  // 公会
  group:{
    {_id:xxxx,
    name:123,// 公会名
    members:[id1,id2,id3...],// 成员ID
    leader:id,// 会长
    info:''// 介绍
    scene:{scene_id:10001:{status:1,progress:101,total_need:255,name:'环境1'},
        10002:{}}// 公会场景:场景ID:{开启状态:1/0,开启进度:,总需求:},
    }
  }
*
* */
//db.UserRelation