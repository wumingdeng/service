/**
 * Created by kael on 15/6/8.
 */

var later = require('later');
//var sched = later.parse.text('every 5 mins');
//var occurrents = later.schedule(sched).next(5);
//
//for(var i = 0;i< 5;i++){
//    console.log(occurrents[i]);
//}

var composite = [
    {h:[11],m:[45]},
    {h:[17],m:[30]}
];

var exception = [
    {M:[1]},
    {dw:[2,6,7]}
];

var sched2 = {
    schedules:composite,
    exceptions:exception
};

later.date.localTime();

console.log("now:"+new Date());

var occ2 = later.schedule(sched2).next(10);
for(var i = 0;i< occ2.length;i++){
    console.log(occ2[i]);
}

var shced3 = later.parse.recur().every(5).second();//.minute();
var t = later.setTimeout(function(){
    console.log(new Date()+' 23333');
},shced3);

// set interval will keep going until you stop it
var sched4 = later.parse.recur().every(3).second();
var t2 = later.setInterval(function(){
    console.log(Math.random(10));
},sched4);

// stop it
setTimeout(function(){
    t2.clear();
    console.log("okey");
},18*1000);

var pm2 = require('pm2');

pm2.connect(function() {
    pm2.start({
        script    : 'index.js',         // Script to be run
        exec_mode : 'cluster',        // Allow your app to be clustered
        instances : 4,                // Optional: Scale your app by 4
        max_memory_restart : '100M'   // Optional: Restart your app if it reaches 100Mo
    }, function(err, apps) {
        pm2.disconnect();
    });
});
