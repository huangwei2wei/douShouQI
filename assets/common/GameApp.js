window.nativeJSBridge = function (options) {
    if (window.NativeObject && window.NativeObject.postMessage) {
        window.NativeObject.postMessage(options || {});
        console.info(options);
    } else {
        console.warn(options);
    }
};

var GameApp = cc.Class({

    ctor: function () {
        console.info("ctor GameApp");
        this.playerInfo = {};
        this.gameOver = false;
        onfire.on("connected", this.onConnect, this);
        onfire.on("onerror", this.onError, this);
        onfire.on("onclose", this.onClose, this);
    },

    onConnect: function () {
        this.startSendHeart();
    },

    startSendHeart: function () {
        var self = this;
        this.intervalId = setInterval(function () {
            cc.network.socket.send("cs_heart", {});
        }, 5000);
    },
    stopSendHeart: function () {
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    onError: function () {
        this.stopSendHeart();
        // this.callGameOver("socket_error")
    },

    onClose: function () {
        this.stopSendHeart();
        // this.callGameOver("socket_error")
    },


    useDebug: function (channel) {
        if (this.debug == null) {
            var Debug = require("./Debug");
            this.debug = new Debug();
            this.debug.init(channel);
        }
    },

    updatePlayerStatus: function (jsonObj) {
        console.info("updatePlayerStatus:" + JSON.stringify(jsonObj));
        // {
        //     "1111": {
        //         "microphoneOpen": 1,
        //     },
        //     "2222": {
        //         "microphoneOpen": 0,
        //     }
        // }
        for (var key in jsonObj) {
            // console.log("属性：" + key + ",值：" + jsonData[key]);
            this.playerInfo[key] = jsonObj[key];
            this.playerInfo[key].memberId = parseInt(key);
        }
        onfire.fire("msg_update_player_status", jsonObj);
    },

    getPlayerInfo: function (memberId) {
        return this.playerInfo[memberId];
    },

    onCloseGame: function () {
        console.info("onCloseGame");
        onfire.fire("msg_close_game", {});
    },
    //调用app接口获取数据，回调通知
    callGetPlayerStatus: function () {
        window.nativeJSBridge({
            name: "getPlayerStatus",
            params: {},
        });
    },

    //socket_error
    //login_error
    //close_game
    //sc_game_result 返回的result_id
    //sc_match_timeout 返回的result_id
    callGameOver: function (reason) {
        if (this.gameOver == true) {
            console.warn("callGameOver :" + reason);
            return;
        }
        this.gameOver = true;

        onfire.fire("msg_game_over", {});
        window.nativeJSBridge({
            name: "gameOver",
            params: {
                request_id: reason == null ? "null" : "" + reason
            },
        });
    },

    callGameStart: function () {
        window.nativeJSBridge({
            name: "gameStart",
            params: {},
        });
    }

});

module.exports = GameApp;