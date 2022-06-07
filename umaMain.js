/*
 * raceRandom.js
 * Copyright (C) 2022 gurashi <gurashi.for@gmail.com>
 */

const http = require('http');
const querystring = require('querystring');
const discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const puppeteer = require('puppeteer');
const client = new discord.Client();
const prefix = process.env.prefix; //接頭辞を設定
var plugins_function = require('./umaPlugins.js') //外部関数の読み込み

http.createServer(function(req, res){
  if (req.method == 'POST'){
    var data = "";
    req.on('data', function(chunk){
      data += chunk;
    });
    req.on('end', function(){
      if(!data){
        res.end("No post data");
        return;
      }
      var dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if(dataObject.type == "wake"){
        console.log("Woke up in post");
        res.end();
        return;
      }
      res.end();
    });
  }
  else if (req.method == 'GET'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

client.on('ready', message =>{
  console.log('Bot準備完了～');
  client.user.setActivity(prefix + "help", { type: process.env.acttype });
});

client.on('guildDelete', guild => {
    console.log(`Bot exits from  ${guild.name}.`)
})

// ===== *** =====

// 心臓部, メッセージを受けるとココから処理開始
client.on('message', message =>{

  // 自分で自分に帰してしまう無限ループ回避記述
  if (message.author.id == client.user.id || message.author.bot){
    return;
  }

  // 上記条件を抜けたなら返信しまーす！
  if( message.content.startsWith(prefix) || message.content.startsWith(prefix.charAt(0).toUpperCase() + prefix.slice(1)) ){
    sendReply(message, message.content);
    return;
  }

});

if(process.env.DISCORD_BOT_TOKEN == undefined){
 console.log('DISCORD_BOT_TOKENが設定されていません。');
 process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );

// UMSBotの返信処理関数
function sendReply(message, text){

  // "ums!"分の冒頭文字を削除し, statustempに格納
  let statustemp = text.slice(prefix.length);

  // 冒頭が空白文字ならそれも削除
  while(!statustemp.indexOf(' ')){
    statustemp  = statustemp .slice(1);
  }

  // カンマと空白で文字を区切って配列に格納
  let statusstr = statustemp.split(/,|\s/);

  // ---------- * ----------

  // 配列冒頭が"help"ならヘルプ関数を呼び出し返信
  if(statusstr[0] == "help" || statusstr[0] == "h"){
    plugins_function.helpSend(message);
    return;
  }

  // ---------- * ----------

  // 配列冒頭が"race"ならレース場ガチャ機能を呼び出し返信
  if(statusstr[0] == "race" || statusstr[0] == "r"){
    plugins_function.raceRandom(message, statusstr);
    return;
  }

  // ---------- * ----------

  // 配列冒頭が"profile"ならウマ娘プロフィール表示機能を追加
  if(statusstr[0] == "profile" || statusstr[0] == "p"){
    plugins_function.umaProfiler(message, statusstr);
    return;
  }

  // ---------- * ----------

  if(statusstr[0] == "net" || statusstr[0] == "n"){
    plugins_function.netkeibaProfiler(message, statusstr);
    return;
  }

  // ---------- * ----------

  // === ここから下が"うますてっ！"のメイン機能

  let speed = Number(statusstr[0]);          // スピード
  let stamina = Number(statusstr[1]);        // スタミナ
  let power = Number(statusstr[2]);          // パワー
  let konjou = Number(statusstr[3]);         // 根性
  let int = Number(statusstr[4]);            // 賢さ
  const strategy = Number(statusstr[5]);     // 脚質
  const distance = Number(statusstr[6]);     // レース距離


  if(statusstr.length > 7){

    let errstr = '入力内容が正しくありません.'

    message.reply( errEmbed(errstr) )
         .then(console.log("リプライ送信: " + errEmbed(errstr) ))
         .catch(console.error);

    return;
  }

  if((statusstr[0] < 1 || statusstr[0] >= 10000) || (statusstr[1] < 1 || statusstr[1] > 9999) || (statusstr[2] < 1 || statusstr[2] > 9999) || (statusstr[3] < 1 || statusstr[3] > 9999) || (statusstr[4] < 1 || statusstr[4] > 9999)
                                               || (　strategy < 0 ||  strategy > 4 || !(Number.isSafeInteger(strategy)) ) || (　distance < 1 ||  distance > 5 || !(Number.isSafeInteger(distance)) )){

    let errstr = "入力された数値に誤りがあります.\n各ステータスは1～9999, 作戦は1～4の整数, 距離は1～5の整数で入力してください.\n" + "入力方法は***" + prefix + "help***で呼び出せます."
       message.reply(errEmbed(errstr))
         .then(console.log("リプライ送信: " + errEmbed(errstr)))
         .catch(console.error);
    return;
  }

  var strategystr;
  switch(strategy){
        case 0:
          strategystr = "大逃げ";
          break;
        case 1:
          strategystr = "逃げ";
          break;
        case 2:
          strategystr = "先行";
          break;
        case 3:
          strategystr = "差し";
          break;
        case 4:
          strategystr = "追込";
  }

  var diststr;
  switch(distance){
        case 1:
          diststr = "短距離";
          break;
        case 2:
          diststr = "マイル";
          break;
        case 3:
          diststr = "中距離";
          break;
        case 4:
          diststr = "長距離";
          break;
        case 5:
          diststr = "ダート";
  }

  const yaruki = 1;

  const courseCoe = 1;

  const babaCoeOnSpeed = 0;

  const babaCoeOnPower = 0;

  const runningstyleAV = 1;  // 脚質適性

  const babaAV = 1; // バ場適正

  const distAV = 1; // 距離適性

  const babaJoutaiKeisuu = 1;

  const speedCoe = speedCoeCal(speed, yaruki, courseCoe, babaCoeOnSpeed, 0);
  const staminaCoe = staminaCoeCal(stamina, yaruki, 0);
  const powerCoe = powerCoeCal(power, yaruki, babaCoeOnPower, 0);
  const konjouCoe = konjouCoeCal(konjou, yaruki, 0);
  const intCoe = intCoeCal(int, yaruki, runningstyleAV, 0);

  var distList
  switch(distance){
        case 1:
          distList = [1000, 1200, 1400];
          break;
        case 2:
          distList = [1500, 1600, 1800];
          break;
        case 3:
          distList = [2000, 2200, 2300, 2400];
          break;
        case 4:
          distList = [2500, 2600, 3000, 3200, 3400, 3600];
          break;
        case 5:
          distList = [1600, 1700, 1800]
  }

  const healList = [[-2,0,0],[-1,0,0],[0,0,0],[1,0,0],[2,0,0],[0,1,0],[1,1,0],[2,1,0],[0,2,0],[1,2,0],[2,2,0],[0,3,0]];

  var dLast = new Array(distList.length);

  let v_s_f = 3.0;
  let tv_f = 0;
  let acc_f = 0;
  let t_f = 0;
  let d_f = 0;
  let rh_f = 0;

  let v_s = new Array(4); // Initial velocity per phase
  let tv = new Array(4); // Target v
  let acc = new Array(4); // acce

  let t = [];
  for (var i = 0; i < 4 ; i++) {
	t[i] = [,];	//0～1
  }

  let d = [];
  for (var i = 0; i < 4 ; i++) {
	d[i] = [,];	//0～1
  }

  let rh = [];
  for (var i = 0; i < 4 ; i++) {
	rh[i] = [,];	//0～1
  }

  let runLastDistCand = [];
  for (var i = 0; i < distList.length ; i++) {
	runLastDistCand[i] = [,,,,,,,,];	//0～8
  }

  let rhSUM = 0;

  for(let i=0; i < distList.length; i++){
    for(let k=0; k < healList.length; k++){

      // ---------- * ----------

      // HPCal
      let HP = HPCal(strategy, staminaCoe, distList[i]);
      let HPwithHeal = HPwithHealCal(HPCal(strategy, staminaCoe, distList[i]), healList[k][0], healList[k][1], healList[k][2]);

      // first
      tv_f = baseRateCal(distList[i]) * 0.85;
      acc_f = 24.0 + accRate00Cal(strategy, powerCoe, babaAV, distAV);
      t_f = (tv_f - v_s_f) / acc_f ;
      d_f = t_f * (v_s_f + tv_f) / 2;
      rh_f = 20 * babaJoutaiKeisuu * t_f ;

      // phase0 [0][0]
      v_s[0] = baseRateCal(distList[i]) * 0.85 ;
      tv[0] = targetBaseRate00Cal(strategy, distList[i], speedCoe, intCoe, distAV);
      acc[0] = accRate00Cal(strategy, powerCoe, babaAV, distAV) ;
      t[0][0] = Math.min((tv[0] - v_s[0])/acc[0], Math.sqrt(v_s[0] ** 2 + 2 * acc[0] * (distList[i] / 6 - d_f)) - v_s[0]) ;
      d[0][0]  = (v_s[0] + acc[0] * t[0][0] / 2) * t[0][0] ;
      rh[0][0] = 20 * babaJoutaiKeisuu * ( ((acc[0] * t[0][0] + v_s[0] - baseRateCal(distList[i]) + 12) ** 3 - (v_s[0] - baseRateCal(distList[i]) + 12) ** 3) / (3 * acc[0] * 144) ) ;

      // phase0 [0][1]
      d[0][1] = Math.max(distList[i] / 6 - (d_f + d[0][0]), 0);
      t[0][1] = d[0][1] / tv[0] ;
      rh[0][1] = 20 * babaJoutaiKeisuu * t[0][1] * (tv[0] - baseRateCal(distList[i]) + 12) ** 2 / 144 ;

      // phase1 [1][0]
      v_s[1] = v_s[0] + acc[0] * t[0][0];
      tv[1] = targetBaseRate01Cal(strategy, distList[i], speedCoe, intCoe, distAV);
      if(v_s[1] <= tv[1]){
            acc[1] = accRate01Cal(strategy, powerCoe, babaAV, distAV);
      } else {
            acc[1] = -0.80;
      }
      t[1][0] = (tv[1] - v_s[1]) / acc[1];
      d[1][0] = t[1][0] * (tv[1] + v_s[1]) / 2;
      rh[1][0] = 20 * babaJoutaiKeisuu * ((tv[1] - baseRateCal(distList[i]) + 12) ** 3 - (v_s[1] - baseRateCal(distList[i]) + 12) ** 3) / (3 * acc[1] * 144);

      // phase1 [1][1]
      d[1][1] = distList[i] / 2 - d[1][0];
      t[1][1] = d[1][1] / tv[1];
      rh[1][1] = 20 * babaJoutaiKeisuu * t[1][1] * (tv[1] - baseRateCal(distList[i]) + 12) ** 2 / 144;

      // phase2 [2][0]
      tv[2] = targetBaseRate02Cal(strategy, distList[i], speedCoe, intCoe, distAV, konjouCoe);

      // phase2 [2][1]


      // phase3 [3][0]
      tv[3] = targetBaseRate03Cal(strategy, distList[i], speedCoe, intCoe, distAV, konjouCoe);

      // phase3 [3][1]

      // ---------- * ----------

      rhSUM = rh_f + rh[0][0] + rh[0][1] + rh[1][0] + rh[1][1];

      let p_a = distList[i] / 3 - 60;
      let p_b = (tv[2] - baseRateCal(distList[i]) + 12) ** 2 / (tv[2] * 144);
      let p_c = (tv[3] - baseRateCal(distList[i]) + 12) ** 2 / (tv[3] * 144);

      runLastDistCand[i][k] = (HPwithHeal - rhSUM - p_a * 20 * babaJoutaiKeisuu * syuubanHpSyouhiCoe(konjouCoe) * p_b) / (20 * babaJoutaiKeisuu * syuubanHpSyouhiCoe(konjouCoe) * (p_c - p_b)) + 60;

      if(healList[k][0] == 0 && healList[k][1] == 0){
        dLast[i] = dLast[i] + "     **(白" + healList[k][0] + "/金" + healList[k][1] + ")**                " + dLastComp(distList[i], runLastDistCand[i][k]) + "\n";
      } else {
        dLast[i] = dLast[i] + "     (白" + healList[k][0] + "/金" + healList[k][1] + ")                " + dLastComp(distList[i], runLastDistCand[i][k])  + "\n";
      }

      /*
      if(k == healList.length - 1 && i != distList.length - 1){
        dLast[i] = dLast[i] + "                             ----------" + "\n";
      }
      */
    }
    dLast[i] = dLast[i].substr(9);
  }

  var replytext = [
    "\n",
    "`スピード：`" + speed + "\n",
    "`スタミナ：`" + stamina + "\n",
    "`パワー：`" + power + "\n",
    "`根性：`" + konjou + "\n",
    "`賢さ：`" + int + "\n",
    "`作戦：`" + strategystr + "\n",
    "`距離：`" + diststr + "\n",
    "--------------------\n",
    // "`スキル発動率：`" + skillPrbCal(int, yaruki) + "%\n",
    // "`掛かり確率：`" + kakariPrbCal(intCoe) + "%\n"
    // "`初期HP：`" + HPCal(strategy, staminaCoe, courseDistanceNum) + "\n",
    // "`回復スキル込みHP：`" + HPwithHealCal(HPCal(strategy, staminaCoe, courseDistanceNum), 1, 1, 0) + "\n",
    // "`賢さ速度補正上限：`" + (Math.floor(1000 * intRandomSpeedMaxCal(intCoe)) / 1000) + "%\n",
    // "`賢さ速度補正下限：`" + ((Math.floor(1000 * intRandomSpeedMaxCal(intCoe)) / 1000) - 0.65 ) + "%\n",
    // "`終盤HP消費係数：`" + Math.floor(1000 * syuubanHpSyouhiCoe(konjouCoe)) / 1000 + "%\n",
    // "`基準速度：`" + baseRateCal(courseDistanceNum) + "\n",
    // "`終盤以降の基準目標速度平均：`" + targetBaseRate02Cal(strategy, courseDistanceNum, staminaCoe, intCoe, distAV) + "\n",
    // "`序盤加速度：`" + accRate00Cal(strategy, powerCoe, babaCoeOnPower, distAV) + "\n",
    //   ---------- * ----------
    //"`（phase[f]）開始速度：`" + v_s_f +"[m/s]\n",
    //"`（phase[f]）目標速度：`" + tv_f +"[m/s]\n",
    //"`（phase[f]）加速度：`" + acc_f +"[m/s^2]\n",
    //"`（phase[f]）時間：`" + t_f +"[s]\n",
    //"`（phase[f]）走行距離：`" + d_f +"[m]\n",
    //"`（phase[f]）持久力消費量：`" + rh_f +"\n",
    //"`（phase[0][0]）開始速度：`" + v_s[0] +"[m/s]\n",
    //"`（phase[0][0]）目標速度：`" + tv[0] +"[m/s]\n",
    //"`（phase[0][0]）加速度：`" + acc[0] +"[m/s^2]\n",
    //"`（phase[0][0]）時間：`" + t[0][0] +"[s]\n",
    //"`（phase[0][0]）走行距離：`" + d[0][0] +"[m]\n",
    //"`（phase[0][0]）持久力消費量：`" + rh[0][0] +"\n",
    //"`（phase[0][1]）時間：`" + t[0][1] +"[s]\n",
    //"`（phase[0][1]）走行距離：`" + d[0][1] +"[m]\n",
    //"`（phase[0][1]）持久力消費量：`" + rh[0][1] +"\n",
    //"`（phase[1][0]）開始速度：`" + v_s[1] +"[m/s]\n",
    //"`（phase[1][0]）目標速度：`" + tv[1] +"[m/s]\n",
    //"`（phase[1][0]）加速度：`" + acc[1] +"[m/s^2]\n",
    //"`（phase[1][0]）時間：`" + t[1][0] +"[s]\n",
    //"`（phase[1][0]）走行距離：`" + d[1][0] +"[m]\n",
    //"`（phase[1][0]）持久力消費量：`" + rh[1][0] +"\n",
    //"`（phase[1][1]）時間：`" + t[1][1] +"[s]\n",
    //"`（phase[1][1]）走行距離：`" + d[1][1] +"[m]\n",
    //"`（phase[1][1]）持久力消費量：`" + rh[1][1] +"\n",
    //"`（phase[2][1]）目標速度：`" + tv[2] +"[m/s]\n",
    //"`（phase[3][1]）目標速度：`" + tv[3] +"[m/s]\n"
    //"`ラスパまでに消費する体力：`" + rhSUM +"\n",
    //"`ヒールリスト：`" + healList +"\n",
  ].join("");

  /*
  message.channel.send(replytext) // option : message.channel.send(replytext, { split: true })
    .then(console.log("リプライ送信: " + replytext))
    .catch(console.error);
  */

  message.channel.send( umaEmbedGen(replytext, skillPrbCal(int, yaruki), kakariPrbCal(intCoe), konjouAccFrame(konjouCoe), distList, dLast) )
          .then(console.log("リプライ送信: " + replytext))
          .catch(console.error);
}


function umaEmbedGen(rT, skillPrb, kakariPrb, konjouAF, dList, dLast){
    const umaOutputEmbed = new MessageEmbed()
        .setTitle("うますてっ！ - 計算結果")
        .setDescription(rT)
        .setColor("#2ced76")
        .addFields(
            {
                name : "**ステータス**",
                value : "`スキル発動率 : `" + skillPrb.toFixed(2) + "[%]\n`かかり率 : `" + kakariPrb.toFixed(2) + "[%]\n"
            }
        );

    for(var i=0; i < dList.length ; i++){
        umaOutputEmbed.addFields(
            {
                name : "**" + dList[i] + " [m]**",
                value : "`【回復スキル数】|【ラスパ位置差分】`\n" + dLast[i]
            }
        )
    }

    return umaOutputEmbed;

}

// エラー吐いた時の返信
function errEmbed(errStrings){
    return {embed : {
        title : "うますてっ！ - ERROR",
        color : "#ff0000",
        description : errStrings
    }}
}

// 補正スピード値計算
function speedCoeCal(speed, yaruki, courseCoe, babaCoeOnSpeed, pskillCoe){
    return speed * yaruki * courseCoe + babaCoeOnSpeed + pskillCoe;
}

// 補正スタミナ値計算
function staminaCoeCal(stamina, yaruki, pskillCoe){
    return stamina * yaruki + pskillCoe;
}

// 補正パワー値計算
function powerCoeCal(power, yaruki, babaCoeOnPower, pskillCoe){
    return power * yaruki + babaCoeOnPower + pskillCoe;
}

// 補正根性値計算
function konjouCoeCal(konjou, yaruki, pskillCoe){
    return konjou * yaruki + pskillCoe;
}
// 補正賢さ計算
function intCoeCal(int, yaruki, rs, pskillCoe){
    return int * yaruki * rs + pskillCoe;
}

// スキル発動率計算関数
function skillPrbCal(int, yaruki){
  return Math.floor(1000 * Math.max(100 - 9000/(int * yaruki), 20)) / 1000;
}

// かかり率計算関数
function kakariPrbCal(intCoe){
  return Math.min(Math.floor(1000 * ((6.5 / Math.log10(0.1 * intCoe + 1)) ** 2)) / 1000, 100.00);
}

function konjouAccFrame(kC){
    return Math.floor(Math.sqrt(200 * kC) * 0.001 * 1000) / 1000;
}

function HPCal(strategy, sC, cDn){
    switch(strategy){
        case 0:
          return 0.8 * 0.860 * sC + cDn;
        case 1:
          return 0.8 * 0.950 * sC + cDn;
        case 2:
          return 0.8 * 0.890 * sC + cDn;
        case 3:
          return 0.8 * 1.000 * sC + cDn;
        case 4:
          return 0.8 * 0.995 * sC + cDn;
    }
}

function HPwithHealCal(hp, whitenum, goldnum, platinum){
    return hp + hp * 0.015 * whitenum + hp * 0.055 * goldnum + hp * 0.0583 * platinum ;
}

function intRandomSpeedMaxCal(iC){
    return (iC / 5500) * Math.log10(iC * 0.1) ;
}

function baseRateCal(cDn){
    return 20.0 - (cDn - 2000) / 1000 ;
}

function syuubanHpSyouhiCoe(kC){
    return 1 + (200 / Math.sqrt(600 * kC));
}

function targetBaseRate00Cal(strategy, cDn, sC, iC, dAV){
    switch(strategy){
        case 0:
          return baseRateCal(cDn) * 1.063 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
        case 1:
          return baseRateCal(cDn) * 1.000 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
        case 2:
          return baseRateCal(cDn) * 0.978 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
        case 3:
          return baseRateCal(cDn) * 0.938 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
        case 4:
          return baseRateCal(cDn) * 0.931 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
    }
}

function targetBaseRate01Cal(strategy, cDn, sC, iC, dAV){
    switch(strategy){
        case 0:
          return baseRateCal(cDn) * 0.962 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
        case 1:
          return baseRateCal(cDn) * 0.980 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
        case 2:
          return baseRateCal(cDn) * 0.991 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
        case 3:
          return baseRateCal(cDn) * 0.998 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
        case 4:
          return baseRateCal(cDn) * 1.000 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01;
    }
}

function targetBaseRate02Cal(strategy, cDn, sC, iC, dAV, kC){
    switch(strategy){
        case 0:
          return baseRateCal(cDn) * 0.950 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01 + Math.sqrt(500.0 * sC) * dAV * 0.002;
        case 1:
          return baseRateCal(cDn) * 0.962 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01 + Math.sqrt(500.0 * sC) * dAV * 0.002;
        case 2:
          return baseRateCal(cDn) * 0.975 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01 + Math.sqrt(500.0 * sC) * dAV * 0.002;
        case 3:
          return baseRateCal(cDn) * 0.994 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01 + Math.sqrt(500.0 * sC) * dAV * 0.002;
        case 4:
          return baseRateCal(cDn) * 1.000 + baseRateCal(cDn) * (intRandomSpeedMaxCal(iC) - 0.325) * 0.01 + Math.sqrt(500.0 * sC) * dAV * 0.002;
    }
}

/*
function targetBaseRate03Cal(strategy, cDn, sC, iC, dAV){
    return (targetBaseRate02Cal(strategy, cDn, sC, iC, dAV) + 0.01 * baseRateCal(cDn)) * 1.05 + Math.sqrt(500.0 * sC) * dAV * 0.002;
}
*/

// LastSpurtTargetSpeed
function targetBaseRate03Cal(strategy, cDn, sC, iC, dAV, kC){
    switch(strategy){
        case 0:
          return ( baseRateCal(cDn) * (0.950 + 0.01) + Math.sqrt( 500.0 * sC ) * dAV * 0.002 ) * 1.05 + Math.sqrt(500.0 * sC) * dAV * 0.002 + (450 * kC) ** 0.597 * 0.0001;
        case 1:
          return ( baseRateCal(cDn) * (0.962 + 0.01) + Math.sqrt( 500.0 * sC ) * dAV * 0.002 ) * 1.05 + Math.sqrt(500.0 * sC) * dAV * 0.002 + (450 * kC) ** 0.597 * 0.0001;
        case 2:
          return ( baseRateCal(cDn) * (0.975 + 0.01) + Math.sqrt( 500.0 * sC ) * dAV * 0.002 ) * 1.05 + Math.sqrt(500.0 * sC) * dAV * 0.002 + (450 * kC) ** 0.597 * 0.0001;
        case 3:
          return ( baseRateCal(cDn) * (0.994 + 0.01) + Math.sqrt( 500.0 * sC ) * dAV * 0.002 ) * 1.05 + Math.sqrt(500.0 * sC) * dAV * 0.002 + (450 * kC) ** 0.597 * 0.0001;
        case 4:
          return ( baseRateCal(cDn) * (1.000 + 0.01) + Math.sqrt( 500.0 * sC ) * dAV * 0.002 ) * 1.05 + Math.sqrt(500.0 * sC) * dAV * 0.002 + (450 * kC) ** 0.597 * 0.0001;
    }
}

function accRate00Cal(strategy, pC, bAV, dAV){
    switch(strategy){
        case 0:
          return 0.0006 * Math.sqrt(500.0 * pC) * 1.170 * bAV * dAV;
        case 1:
          return 0.0006 * Math.sqrt(500.0 * pC) * 1.000 * bAV * dAV;
        case 2:
          return 0.0006 * Math.sqrt(500.0 * pC) * 0.985 * bAV * dAV;
        case 3:
          return 0.0006 * Math.sqrt(500.0 * pC) * 0.975 * bAV * dAV;
        case 4:
          return 0.0006 * Math.sqrt(500.0 * pC) * 0.945 * bAV * dAV;
    }
}

function accRate01Cal(strategy, pC, bAV, dAV){
    switch(strategy){
        case 0:
          return 0.0006 * Math.sqrt(500.0 * pC) * 0.940 * bAV * dAV;
        case 1:
          return 0.0006 * Math.sqrt(500.0 * pC) * 1.000 * bAV * dAV;
        case 2:
          return 0.0006 * Math.sqrt(500.0 * pC) * 1.000 * bAV * dAV;
        case 3:
          return 0.0006 * Math.sqrt(500.0 * pC) * 1.000 * bAV * dAV;
        case 4:
          return 0.0006 * Math.sqrt(500.0 * pC) * 1.000 * bAV * dAV;
    }
}

function accRate02Cal(strategy, pC, bAV, dAV){
    switch(strategy){
        case 0:
          return 0.0006 * Math.sqrt(500.0 * pC) * 0.956 * bAV * dAV;
        case 1:
          return 0.0006 * Math.sqrt(500.0 * pC) * 0.996 * bAV * dAV;
        case 2:
          return 0.0006 * Math.sqrt(500.0 * pC) * 0.996 * bAV * dAV;
        case 3:
          return 0.0006 * Math.sqrt(500.0 * pC) * 1.000 * bAV * dAV;
        case 4:
          return 0.0006 * Math.sqrt(500.0 * pC) * 0.997 * bAV * dAV;
    }
}

// min以上max以下の値をランダムに返す関数
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

//
function dLastComp(dist, lLD){
    let d_min = Math.min(dist/3, lLD);
    if(d_min < 0){
        return "~~+" + Math.floor((dist/3 - d_min) * 100) / 100 + "[m]~~" ;
    }else{
        return "+" + Math.floor((dist/3 - d_min) * 100) / 100 + "[m]";
    }
}
