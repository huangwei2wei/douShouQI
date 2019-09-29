 // Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var WinManager = require("./win/WinManager");
var EmojiSender = require("../common/emoji/EmojiSender");
cc.Class({
    extends: WinManager,

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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        WinManager.prototype.onLoad.call(this);
        this.openWin("dlgCountDown");
        onfire.onmsg("onerror", this.onError, this);
        onfire.onmsg("onclose", this.onClose, this);
        onfire.onmsg("sc_leave", this.on_sc_leave, this);
    },

    onError: function () {
        gameApp.callGameOver("socket_error");
    },

    onClose: function () {
        gameApp.callGameOver("socket_error");
    },

    on_sc_leave: function (data) {
        //对手离开？
        //发结束消息给服务器
        var msg = {
            game_state: 1,
            result: 1,
            self_score: 0,
            enemy_score: 0,
        };
        cc.network.socket.send("cs_game_result", msg);
        gData.endGame();
    },

    // update (dt) {},
});