/*
 * raceRandom.js
 * Copyright (C) 2022 gurashi <gurashi.for@gmail.com>
 */

 // ========== * ==========

 // ヘルプを表示する関数
 exports.helpSend = function (message){
   message.channel.send(
               {embed: {
                   title : "うますてっ！ - ヘルプ",
                   description: "\n**「うますてっ！」**は, ステータス・脚質に関連する7つの数値を入力することで\n`当該ウマ娘のラストスパート距離`と`最大スパート距離`の差分を表示してくれるBOTです.\n実際のウマ娘たちのレースより条件が甘めであることを踏まえたうえで、**参考値としてご活用ください**.\n\n",
                   color : "#ffb005",
                   fields : [
                       {
                           name : ":one: **入力方法**",
                           value : "7種類の数値`(ステータス5種類 + 脚質 + レースの種類)`をチャットに入力する必要があります.\n__各数字の間にはスペース(またはカンマ)を入れてください__.\n``` ums! [(1)スピード値] [(2)スタミナ値] [(3)パワー値] [(4)根性値] [(5)賢さ値] [(6)脚質] [(7)レースの種類] ```\n``[(1)～(5)各ステータス]`` → ウマ娘のステータスを*1～9999*の間で入力\n``[(6)脚質]`` → __大逃げ__：`0` /__逃げ__：`1` / __先行__：`2` / __差し__：`3` / __追込__：`4`\n``[(7)レースの種類]`` → __短距離__：`1` / __マイル__：`2` / __中距離__：`3` / __長距離__：`4` / __ダート__：`5`\n\n**入力例(1)**\n```スピード：1200\nスタミナ：800\nパワー：1000\n根性：350\n賢さ：400\n脚質：先行\nレースの種類：中距離```\nのとき\n```ums! 1200 800 1000 350 400 2 3```\n**入力例(2)**\n```スピード：1\nスタミナ：20\nパワー：300\n根性：4000\n賢さ：9999\n脚質：追込\nレースの種類：ダート```\nのとき\n```ums! 1 20 300 4000 9999 4 5```\n"
                       },
                       {
                           name : ":two: **出力表の見方**",
                           value : "`【回復スキル数】`：__レース中盤までに発動した(白/金)回復スキルの数__. 白回復スキルが負の数になっているものは持久力デバフ確認用.\n`【ラスパ位置差分】`：__レース終盤の開始地点__と__ウマ娘がスパートをかけ始めた位置__の差. 斜線されている数値はスパート位置がゴール後になってしまっている場合.\n\n【ラスパ位置差分】が大きければ大きいほど, 持久力が足りていないことになります.\n\n**出力例(1) - <入力例(1)の出力より>**\n```2200 [m]\n【回復スキル数】|【ラスパ位置差分】\n(白-2/金0) +326.05[m]\n(白-1/金0) +241.12[m]\n(白0/金0) +156.2[m]\n(白1/金0) +71.27[m]\n\(白2/金0) +0[m]\n(白0/金1) +0[m]\n--- 以降, 省略 ---```\n入力例(1)のステータスのとき,\n__レース中盤までに回復スキルが発動しなかった場合__, レース終盤に入ってもスパートをかけられず, *156.2*[m]遅れてスパートをかけ始める.\n__レース中盤までに白回復スキルが2個発動した場合__, レース終盤になった時からスパートをかけ始められる.\n"
                       },
                       {
                           name : ":three: **レース設定**",
                           value : "```・やる気：普通\n・各種適正：A\n・バ場：良\n・かかり：無し\n・上り坂や下り坂：無し\n・賢さによる速度補正：上限値と下限値から求められる平均を採用\n・ポジションキープ補正：未考慮\n・レース場ごとのボーナス：未考慮\n・スキル系：未考慮```\n"
                       },
                       {
                           name : ":four: **コマンドの接頭辞**",
                           value : "コマンドの冒頭は``ums!``or``Ums!``で反応します.\n\n"
                       },
                       {
                           name : ":five: **おまけ機能(1) - ウマ娘のプロフィール**",
                           value : "```ums!p (ウマ娘フルネーム)```\nと入力すると, 当該ウマ娘のプロフィールが表示されます."
                       },
                       {
                           name : ":six: **おまけ機能(2) - レースガチャ**",
                           value : "```ums!r```\nと入力すると, チーム競技場で使われているレース場をひとつランダムに抽選してくれます.\n```ums!r [レース種類]```\nのように数値を1種類追加入力すると,\n__短距離__：`1` / __マイル__：`2` / __中距離__：`3` / __長距離__：`4` / __ダート__：`5`に基づいた種類内で抽選が行われます.```ums!r [(1)レース種類] [(2)表示数]```\nのように数値を2種類追加入力すると,\n__短距離__：`1` / __マイル__：`2` / __中距離__：`3` / __長距離__：`4` / __ダート__：`5`に基づいた種類内で[(2)表示数]の数だけ抽選が行われます.(__最大表示数は10__)\n```ums!r 0```\nと入力すると,\n5種類のレースからそれぞれ1つずつ抽選が行われます.\n\nなお, この抽選は**一様乱数**を用いているため,\n**__チーム競技場のレース場抽選率と同一であるかは保証できません__**."
                       }
                   ]
               }}
   )
       .catch(console.error);
   return;
 }

 // ========== * ==========

 // レース場ガチャの処理関数
 exports.raceRandom = function (message, Rstr){

       const fs = require('fs');
       const raceData = JSON.parse(fs.readFileSync('./umaData/umaRace.json', 'utf8')); //jsonファイルを開く

       let raceMinMax = [[100,116],[200,216],[300,320],[400,411],[500,510]];
       let raceStr = ["短距離", "マイル", "中距離", "長距離", "ダート"];

       if(Rstr[1] != null){

           // 配列冒頭が"0" => レース種類ごとに5回ガチャ起動

           if(Rstr[1] == 0){

               const raceFiveEmbed = new MessageEmbed()
                   .setTitle("うますてっ！ - レース場ガチャ")
                   .setColor("#ff6bba");

               // レース種類ごとに5回ガチャしてEmbedに格納していく
               for(var i=0; i<raceMinMax.length ; i++){

                   var tempFive = getRandomIntInclusive(raceMinMax[i][0], raceMinMax[i][1]);
                   var raceObjFive = raceData.List.find((v) => v.idinRace == tempFive);

                   raceFiveEmbed.addFields(
                       {
                           name : "**抽選結果(" + raceStr[i] + ")**",
                           value : "```バ場：" + raceObjFive.バ場 + "\n距離：" + raceObjFive.種類 + "\n開催地：" + raceObjFive.レース場 + "\n方向：" + raceObjFive.方向 + "\n内外：" + raceObjFive.内外 + "\n距離：" + raceObjFive.距離 + "[m] (" + raceObjFive.根幹 + "距離)\n上り坂：" + raceObjFive.上り坂 + "\n下り坂：" + raceObjFive.下り坂 + "```"
                       }
                   );
               }

               // 5回抽出したraceFiveEmbedを返信処理
               message.reply( raceFiveEmbed )
                   .then(console.log("リプライ送信: " + "raceFiveEmbed"))
                   .catch(console.error);

               return;
           }

           // 配列冒頭が"1-5" => レース種類ごとにn回ガチャ起動

           const idNumMin = Number(Rstr[1]) * 100;

           // Rstr[1]が1～5の整数意外で入力された場合のエラー処理
           if(idNumMin < 100 || idNumMin > 500){

               let errstr = '入力内容が正しくありません.\nレースの種類は1～5の整数で入力してください.'

               message.reply( errEmbed(errstr) )
                   .then(console.log("リプライ送信: " + errEmbed(errstr) ))
                   .catch(console.error);

               return;
           }

           // レース種類の最大ID値を配列から取得
           let idNumMax = raceMinMax[Number(Rstr[1]-1)][1];

           // 回数が指定されていない場合は1回だけ出力して終了
           if(Rstr[2] == null){

               var temp = getRandomIntInclusive(idNumMin, idNumMax);
               var raceObj = raceData.List.find((v) => v.idinRace == temp);

               message.channel.send(
                   {embed: {
                       title : "うますてっ！ - レース場ガチャ",
                       color : "#ff6bba",
                       fields : [
                           {
                               name : "**抽選結果**",
                               value : "```バ場：" + raceObj.バ場 + "\n距離：" + raceObj.種類 + "\n開催地：" + raceObj.レース場 + "\n方向：" + raceObj.方向 + "\n内外：" + raceObj.内外 + "\n距離：" + raceObj.距離 + "[m] (" + raceObj.根幹 + "距離)\n上り坂：" + raceObj.上り坂 + "\n下り坂：" + raceObj.下り坂 + "```"
                           }
                       ]
                   }}
               )
                   .then(console.log(temp))
                   .catch(console.error);
               return;

           } else {

               // 1つのレース種類のガチャを2回以上出力する場合の処理

               // 出力🅆数が1未満または11回以上に設定されている場合はエラー返信
               if(Rstr[2] < 1 || Rstr[2] > 10){

                   let errstr = 'レース場ガチャの連続表示は1～10個までです.'

                   message.reply( errEmbed(errstr) )
                       .then(console.log(errstr))
                       .catch(console.error);

                   return;
               }

               // 配列arrにレース場のIDを格納してく(あとでシャッフルするため)
               let arr = [];
               for(var i=idNumMin ; i<idNumMax+1; i++){
                   arr.push(i);
               }

               var a = arr.length;

               // Fisher-Yates shuffle
               while (a) {
                   var j = Math.floor( Math.random() * a );
                   var l = arr[--a];
                   arr[a] = arr[j];
                   arr[j] = l;
               }

               const raceinRaceEmbed = new MessageEmbed()
                   .setTitle("うますてっ！ - レース場ガチャ(" + raceStr[Rstr[1]-1] + ")")
                   .setColor("#ff6bba");

               for(var i=0; i<Rstr[2] ; i++){

                   var tempinRace = arr[0];
                   arr.shift();
                   var raceObjinRace = raceData.List.find((v) => v.idinRace == tempinRace);

                   raceinRaceEmbed.addFields(
                       {
                           name : "**抽選結果(" + (i+1) + ")**",
                           value : "```バ場：" + raceObjinRace.バ場 + "\n距離：" + raceObjinRace.種類 + "\n開催地：" + raceObjinRace.レース場 + "\n方向：" + raceObjinRace.方向 + "\n内外：" + raceObjinRace.内外 + "\n距離：" + raceObjinRace.距離 + "[m] (" + raceObjinRace.根幹 + "距離)\n上り坂：" + raceObjinRace.上り坂 + "\n下り坂：" + raceObjinRace.下り坂 + "```"
                       }
                   );
               }

               message.reply( raceinRaceEmbed )
                   .then(console.log("リプライ送信: " + "raceinRaceEmbed"))
                   .catch(console.error);

               return;
           }

       } else {

           // 配列がnull => 全レースからランダムに1つ抽出

           var temp = getRandomIntInclusive(0, 77);
           var raceObj = raceData.List.find((v) => v.idinAll == temp); // jsonファイルから1つレース場を抽出してraceObjに格納

           // raceObjがnull => 見つからなかった場合のエラー処理
           if(raceObj == null){

               let errstr = '該当するレースデータが存在しません.'

               message.reply( errEmbed(errstr) )
                   .then(console.log(temp))
                   .catch(console.error);

               return;
           }

           // raceObjをembedして返信
           message.channel.send(
                   {embed: {
                       title : "うますてっ！ - レース場ガチャ",
                       color : "#ff6bba",
                       fields : [
                           {
                               name : "**抽選結果**",
                               value : "```バ場：" + raceObj.バ場 + "\n距離：" + raceObj.種類 + "\n開催地：" + raceObj.レース場 + "\n方向：" + raceObj.方向 + "\n内外：" + raceObj.内外 + "\n距離：" + raceObj.距離 + "[m] (" + raceObj.根幹 + "距離)\n上り坂：" + raceObj.上り坂 + "\n下り坂：" + raceObj.下り坂 + "```"
                           }
                       ]
                   }}
           )
               .then(console.log(temp))
               .catch(console.error);
           return;

           // ---------- * when Rstr[1] == null ↑ * ----------
       }

       if(raceObj == null){

           let errstr = '該当するレースデータが存在しません. 入力方法が正しいか確認してください.'

           message.reply( errEmbed(errstr) )
                   .then(console.log(temp))
                   .catch(console.error);

           return;
       }
 }

 // ========== * ==========

 // ウマ娘プロフィール表示機能
exports.umaProfiler = function (message, Ustr){

   // jsonファイルを開く, 中のデータをumaDataに格納
   const fs = require('fs');
   const umaData = JSON.parse(fs.readFileSync('./umaData/umaData.json', 'utf8'));

   // umaDataからウマ娘名を検索
   var umaObj = umaData.List.find((v) => v.名前 == Ustr[1]);
   if(umaObj != null){
       message.channel.send(
           {embed: {
               title : umaObj.名前,
               url : umaObj.URL,
               description: "***「" + umaObj.セリフ + "」***",
               color : umaObj.メインカラー,
               fields : [
                   {
                       name : "英語名",
                       value : umaObj.英語名
                   },
                   {
                       name : "紹介文",
                       value : umaObj.紹介文
                   },
                   {
                       name : "誕生日",
                       value : umaObj.誕生日
                   },
                   {
                       name : "身長",
                       value : umaObj.身長 + " [cm]"
                   },
                   {
                       name : "体重",
                       value : umaObj.体重
                   },
                   {
                       name : "スリーサイズ",
                       value : umaObj.スリーサイズ
                   },
                   {
                       name : "適性",
                       value : "`芝 : `" + umaObj.適性.芝 + "     `ダ : `" + umaObj.適性.ダ + "\n" +
                               "`短 : `" + umaObj.適性.短 + "     `マ : `" + umaObj.適性.マ + "     `中 : `" + umaObj.適性.中 + "     `長 : `" + umaObj.適性.長 + "\n" +
                               "`逃 : `" + umaObj.適性.逃 + "     `先 : `" + umaObj.適性.先 + "     `差 : `" + umaObj.適性.差 + "     `追 : `" + umaObj.適性.追 + "\n"
                   }
               ],
               thumbnail: {
                   url: umaObj.SNS画像
               }
           }}
       )
           .catch(console.error);
       return;
   }

   let errstr = '該当するウマ娘データが登録されていません.'

   message.reply( errEmbed(errstr) )
       .then(console.log("リプライ送信: " + errEmbed(errstr) ))
       .catch(console.error);

 return;

 }

 // ========== * ==========

 // netkeibaのサイトから馬の情報をスクレイピングしてくる
 function netkeibaProfiler(message, Nstr){
   return;
 }
