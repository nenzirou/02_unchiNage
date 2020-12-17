enchant();

window.onload = function () {
	var game = new Game(400, 500);
	game.fps = 30;
	var url = "http://nenzirou.html.xdomain.jp/ShootingUnchi/index.html";
	url = encodeURI(url);
	//プリロード
	var ASSETS = {
		'click': 'click.wav',
		'pon': 'pon.wav',
		'kansei': 'kansei.wav',
		'oji': 'oji.png',
		'unchi': 'unchi.png',
		'land': 'haikei.png',
		'bar': 'bar.png',
		'yes': 'yes.png',
		'retry': 'Retry.png',
		'tweet': 'Tweet.png',
	};
	game.preload(ASSETS);

	var evaluation = [
		"よかったね",
		"楽しかったね",
		"がんばったね",
		"うれしいね",
		"すてきだね",
		"すごいね",
		"うんちだね",
		"たのしいね",
		"うまいね",
		"たのしいよね",
		"きれいだね",
		"ケツだね",
		"なかなかだね",
		"時間の無駄だね",
	];

	//オブジェクトが従うクラス
	var Obj = Class.create(Sprite, {
		initialize: function (width, height, x, y, scene, img) {
			Sprite.call(this, width, height);
			this.x = x;
			this.y = y;
			this.image = game.assets[img];
			scene.addChild(this);
		},
		move: function (dx, dy) {
			this.x += dx;
			this.y += dy;
		},
	});

	//地面背景
	var Land = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 1200, 500, x, y, scene, 'land');
		}
	});

	//おじさん
	var Oji = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 20, 40, x, y, scene, 'oji');
			this.scale(4, 4);
			this.frame = [0, 2, 1, 2];
		}
	})

	//うんち
	var Unchi = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 50, 42, x, y, scene, 'unchi');
			this.opacity = 0;
		}
	})

	//読み込み終わり
	/////////////////////////////////////////////////


	game.onload = function () {					//ロードが終わった後にこの関数が呼び出されるので、この関数内にゲームのプログラムを書こう

		/////////////////////////////////////////////////
		//グローバル変数 定義
		var point = 0;	//ポイント
		var state = 0;	//現在のゲーム状態
		var eCnt = 0;
		var ojiX = 30;
		var ojiY = 400;
		var array = [];
		var kibari = 0;
		var rotation = 0;
		var scale = 0;
		//グローバル変数終わり
		/////////////////////////////////////////////////
		var S_MAIN = new Scene();					//シーン作成
		game.pushScene(S_MAIN);  					//S_MAINシーンオブジェクトを画面に設置
		S_MAIN.backgroundColor = "blue"; 			//S_MAINシーンの背景は黒くした

		//背景
		var land = [];
		for (var i = 0; i < 3; i++) {
			land[i] = new Land(0, 0, S_MAIN);
		}

		//おじさん
		var oji = new Oji(ojiX, ojiY, S_MAIN);

		//うんち
		var unchi = new Unchi(ojiX, ojiY, S_MAIN);

		//バー
		var bar = new Sprite(30, 400);
		bar.h = 0;
		bar.speed = 5;
		bar.moveTo(350, 20);
		bar.image = game.assets['bar'];
		S_MAIN.addChild(bar);
		var barInside = new Sprite(20, 390);
		var barSurface = new Surface(20, 390);
		barSurface.context.fillStyle = 'red';
		barSurface.context.fillRect(0, 0, 20, 390);
		barInside.moveTo(355, 25);
		barInside.image = barSurface;
		S_MAIN.addChild(barInside);

		// 決定ボタン
		var yes = new Sprite(120, 60);
		yes.moveTo(270, 430);
		yes.image = game.assets['yes'];
		S_MAIN.addChild(yes);
		yes.ontouchend = function () {
			if (1 <= state && state <= 5 || state == 8) state++;
			game.assets['click'].clone().play();	//クリックの音を鳴らす。
		};

		//気張り、回転表示テキスト
		var C_Text = new Label(); 					//テキストはLabelクラス
		C_Text.font = "30px Meiryo";				//フォントはメイリオ 20px
		C_Text.color = 'rgba(255,255,255,1)';		//色　RGB+透明度　今回は白
		C_Text.width = 400;							//横幅指定　今回画面サイズ400pxなので、width:400pxだと折り返して二行目表示してくれる
		C_Text.moveTo(0, 0);						//移動位置指定
		S_MAIN.addChild(C_Text);					//S_MAINシーンにこの画像を埋め込む
		C_Text.text = "飛距離　　：" + point + "m" + "<br>気張り具合：" + kibari + "<br>回転力　　：" + rotation + "<br>大きさ　　：" + scale;

		///////////////////////////////////////////////////
		//メインループ　ここに主要な処理をまとめて書こう
		game.onenterframe = function () {
			C_Text.text = "飛距離　　：" + point + "m" + "<br>気張り具合：" + kibari + "<br>回転力　　：" + rotation + "<br>大きさ　　：" + scale;
			if (state == 0) { // 変数リセット
				state = 1;
				point = 0;
				eCnt = 0;
				kibari = 0;
				rotation = 0;
				scale = 0;
				bar.h = 390;
				barSurface.clear();
				oji.rotation = 180;
				unchi.speed = 0;
				unchi.opacity = 0;
				array = [1, 1];
				//座標リセット
				oji.moveTo(ojiX, ojiY);
				unchi.moveTo(ojiX, ojiY);
				land[1].moveTo(0, 0);
				land[2].moveTo(1200, 0);
			} else if (state == 1) {//能力値決定
				kibari = Math.floor(Math.random() * 100);
			} else if (state == 2) {
				rotation = Math.floor(Math.random() * 100);
			} else if (state == 3) {
				scale = Math.floor(Math.random() * 100);
				unchi.scaleX = scale / 20 + 0.01;
				unchi.scaleY = scale / 20 + 0.01;
			} else if (state == 4) {//角度決定
				if (oji.rotation >= 270) array[0] = -1;
				else if (oji.rotation <= 180) array[0] = 1;
				oji.rotation += 10 * array[0];
				unchi.rotation = oji.rotation;
			} else if (state == 5) {//大きさ決定
				if (bar.h <= 0) {
					array[1] = 1;
				} else if (bar.h >= 390) {
					bar.speed = 5;
					array[1] = -1;
				}
				bar.speed += 6;
				bar.h += bar.speed * array[1];
				if (bar.h <= 0) bar.h = 0;
				barSurface.clear();
				barSurface.context.fillRect(0, bar.h, 20, 390);
			} else if (state == 6) {
				unchi.speed = Math.floor(kibari * (100 / (bar.h / 4 + 1))) + 1;
				unchi.tl.moveTo(180, 250, 5);
				unchi.tl.delay(rotation + 1);
				unchi.tl.moveTo(180, 400, 5);
				unchi.opacity = 1;
				game.assets['pon'].clone().play();
				state = 7;
			} else if (state == 7) {
				var dx = (Math.sin(((oji.rotation - 180) * Math.PI) / 180) * unchi.speed) / 10 + 1;
				console.log(dx);
				unchi.rotation += rotation;
				point += Math.floor(dx * 100 + Math.random() * 10);
				for (var i = 1; i < 3; i++) {
					land[i].move(-dx, 0);
					if (land[i].x <= -1200) land[i].x = 1000;
				}
				oji.move(-dx * 10, 0);
				if (unchi.y >= 400) {
					state = 8;
					game.assets['kansei'].clone().play();
				}
			} else if (state == 8) {
				eCnt++;
				if (eCnt > 60) state = 9;
			} else if (state == 9) {
				game.popScene();					//S_MAINシーンを外す
				game.pushScene(S_END);				//S_ENDシーンを読み込ませる
				S_GameOverText.text = "飛距離：" + point + "m<br><br>";	//テキストに文字表示
				S_GameOverText.text += evaluation[Math.floor(Math.random() * evaluation.length - 0.001)];
				state = 10;
			}
		};

		////////////////////////////////////////////////////////////////

		//結果画面
		S_END = new Scene();
		S_END.backgroundColor = "blue";

		//GAMEOVER
		var S_GameOverText = new Label(); 					//テキストはLabelクラス
		S_GameOverText.font = "40px Meiryo";				//フォントはメイリオ 20px 変えたかったらググってくれ
		S_GameOverText.color = 'rgba(255,255,255,1)';		//色　RGB+透明度　今回は白
		S_GameOverText.width = 400;							//横幅指定　今回画面サイズ400pxなので、width:400pxだと折り返して二行目表示してくれる
		S_GameOverText.moveTo(0, 30);						//移動位置指定
		S_END.addChild(S_GameOverText);						//S_ENDシーンにこの画像を埋め込む

		//リトライボタン
		var S_Retry = new Sprite(120, 60);				//画像サイズをここに書く。使う予定の画像サイズはプロパティで見ておくこと
		S_Retry.moveTo(50, 300);						//リトライボタンの位置
		S_Retry.image = game.assets['retry'];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
		S_END.addChild(S_Retry);						//S_ENDにこのリトライボタン画像を貼り付ける

		S_Retry.ontouchend = function () {				//S_Retryボタンをタッチした（タッチして離した）時にこの中の内容を実行する
			game.popScene();							//S_ENDシーンを外す
			game.pushScene(S_MAIN);						//S_MAINシーンを入れる
			state = 0;
		};

		//ツイートボタン
		var S_Tweet = new Sprite(120, 60);				//画像サイズをここに書く。使う予定の画像サイズはプロパティで見ておくこと
		S_Tweet.moveTo(230, 300);						//リトライボタンの位置
		S_Tweet.image = game.assets['tweet'];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
		S_END.addChild(S_Tweet);						//S_ENDにこのリトライボタン画像を貼り付ける

		S_Tweet.ontouchend = function () {				//S_Tweetボタンをタッチした（タッチして離した）時にこの中の内容を実行する
			window.open("http://twitter.com/intent/tweet?text=おじさんは" + point + "mう●ちを飛ばした。&url=" + url);
		};
	};

	game.start();
};