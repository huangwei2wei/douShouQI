var URL = "ws://125.88.153.216:12800/game";
var DataManager = cc.Class({

    ctor: function () {
        console.log("ctor DataManager");
        // this.sc_buyu_login = sc_buyu_login
        this.url = null;
        this.urlParams = this.urlParse();
        onfire.on("msg_close_game", this.on_msg_close_game, this);
    },

    urlParse: function () {
        var params = {};
        if (window.location == null) {
            return params;
        }
        var name, value;
        var str = window.location.href; //取得整个地址栏
        var num = str.indexOf("?");
        str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

        var arr = str.split("&"); //各个参数放到数组里
        for (var i = 0; i < arr.length; i++) {
            num = arr[i].indexOf("=");
            if (num > 0) {
                name = arr[i].substring(0, num);
                value = arr[i].substr(num + 1);
                params[name] = value;
            }
        }
        return params;
    },

    handleMessage: function (msg, data) {
        var on_func = this["on_" + msg];
        // console.log("on_" + msg, data)
        if (on_func != null) {
            on_func.call(this, data);
        }

        onfire.fire(msg, data);
    },

    getUrl: function () {
        return this.getUrlParam("url", URL);
    },

    getUrlParam: function (key, defaultValue) {
        if (this.urlParams[key] != null) {
            return this.urlParams[key];
        }
        return defaultValue;
    },

    on_sc_login: function (data) {
        this.self_info = data.self_info;
        this.enemy_info = data.enemy_info;
        this.enemyLeave = false;
        this.gameEnd = false;
    },

    on_sc_game_start: function (data) {
        this.gameStart = true;
        this.server_tick = data.server_tick;
        Math.seed = data.server_tick;
        Math.seededRandom = function (min, max) {
            max = max || 1;
            min = min || 0;
            Math.seed = (Math.seed * 9301 + 49297) % 233280;
            var rnd = Math.seed / 233280.0;
            return min + rnd * (max - min);
        };
    },

    on_sc_game_result: function (data) {
        this.gameEnd = true;
    },

    //手动点击退出
    on_msg_close_game: function () {
        if (this.gameStart == true) {
            //发结束消息给服务器
            var msg = {
                game_state: 1,
                result: 2,
                self_score: 0,
                enemy_score: 0,
            };
            cc.network.socket.send("cs_game_result", msg);
            gData.endGame();
        } else {
            gameApp.callGameOver("close_game");
        }
    },


    on_sc_leave: function (data) {
        this.enemyLeave = true;
    },

    isGameEnd: function () {
        return this.gameEnd;
    },

    endGame: function () {
        this.gameEnd = true;
        this.playTime = new Date().getTime() - this.startTime;
    },

    startGame: function () {
        this.startTime = new Date().getTime();
    },
    //获取游戏时间
    getPlayTime: function () {
        if (this.playTime == null) {
            return new Date().getTime() - this.startTime;
        }
        return this.playTime;
    },

    isPlayWithAI: function () {
        return this.enemy_info.is_robot;
    },

    shuffle: function (a) {
        var len = a.length;
        for (var i = 0; i < len - 1; i++) {
            var index = parseInt(Math.seededRandom() * (len - i));
            var temp = a[index];
            a[index] = a[len - i - 1];
            a[len - i - 1] = temp;
        }
    }
});

module.exports = DataManager;