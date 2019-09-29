// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
// var gData = require("./model/initData")
// var conf = require("./config/initConf")
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        txt_loading: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        var GameApp = require("../common/GameApp");
        window.gameApp = new GameApp();
        // gameApp.useDebug("animal-9FECD817-80F7-46D8-9394-3B89E180B1F3");

        var DataManager = require("./DataManager");
        window.gData = new DataManager();
        this.loading_text = document.getElementById('loading_text');
        if (this.loading_text == null) {
            this.txt_loading.node.active = true;
        }

        var url = gData.getUrl();
        var socket = require("./network/socket");
        cc.network = {};
        cc.network.socket = new socket();

        onfire.onmsg("connected", this.onConnect, this);
        onfire.onmsg("onerror", this.onError, this);
        onfire.onmsg("onclose", this.onClose, this);
        onfire.onmsg("sc_login", this.on_sc_login, this);
        onfire.onmsg("sc_game_start", this.on_sc_game_start, this);
        onfire.onmsg("sc_match_timeout", this.on_sc_match_timeout, this);

        this.showMessage("初始化资源...");
        var self = this;
        cc.director.preloadScene("scene/game", function () {
            self.showMessage("连接游戏服...");
            cc.network.socket.connect(url);
        });

        cc.loader.loadResDir("texture/", function (err, assets) {
            console.log("assets:", assets);
        });

    },

    onDisable: function () {
        onfire.un("connected");
        onfire.un("onerror");
        onfire.un("onclose");
    },

    onConnect: function () {

        var splash = document.getElementById('splash');
        splash.style.display = 'none';

        var gameID = gData.getUrlParam("gameID", 10019);
        var openKey = gData.getUrlParam("openKey", gData.getUrlParam("openkey", "" + Math.ceil(Math.random() * 100000)));
        var matchID = gData.getUrlParam("matchID", Math.ceil(Math.random() * 100000));
        var has_enemy = gData.getUrlParam("has_enemy", false);

        var msg = {
            openKey: openKey,
            matchID: matchID,
            gameID: gameID,
            has_enemy: has_enemy,
        };
        cc.network.socket.send("cs_login", msg);

        this.showMessage("连接成功，正在登陆...");
    },

    onError: function () {
        this.showMessage("网络错误，请重试...");
        gameApp.callGameOver("socket_error");
    },

    onClose: function () {
        this.showMessage("网络断开，稍后重试...");
        gameApp.callGameOver("socket_error");
    },

    on_sc_login: function (msg) {
        this.showMessage("等待对手进入...");

        if (msg.result != 0) {
            this.showMessage("登陆失败...");
            gameApp.callGameOver("login_error");
        }
    },

    on_sc_game_start: function (msg) {

        cc.director.loadScene("scene/game", function () {
            gameApp.callGameStart();
        });
    },

    on_sc_match_timeout: function (msg) {
        //有玩家未进入游戏
        this.showMessage("匹配超时...");
        gameApp.callGameOver(msg.result_id);
    },

    showMessage: function (msg) {
        if (this.loading_text != null) {
            this.loading_text.innerHTML = msg;
        }
        this.txt_loading.string = msg;
    },
});