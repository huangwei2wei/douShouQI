window.onfire = require("./onfire"); //处理事件的类库
onfire.onmsg = function (msg, func, context) {
    onfire.on(msg, function () {
        if (cc.isValid(context)) {
            func.apply(context, arguments)
        } else {
            console.warn(msg)
        }
    })
}
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    ctor: function () {
        console.log("ctor socket")
        this.url = "http://game.g22rd.cn:12597"; //默认先走http
        this.urlParams = this.urlParse();
        this.msgIndex = 1;
    },

    // use this for initialization
    onLoad: function () {
        this.ws = null;
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

    getUrlParam: function (key, defaultValue) {
        if (this.urlParams[key] != null) {
            return this.urlParams[key];
        }
        return defaultValue;
    },

    close: function () {
        console.info("close WebSocket");
        if (this.ws != null) {
            this.ws.close();
            this.ws = null;
        }
    },

    getServerNode: function (url, callback) {
        var request = cc.loader.getXMLHttpRequest();
        console.log("get " + url);
        request.open("GET", url, true);

        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status >= 200 && request.status <= 207) {
                    var httpStatus = request.statusText;
                    var response = request.responseText;
                    callback(true, request);
                } else {
                    callback(false, request);
                }
            }
        };
        request.send();
    },

    connect: function () {
        var url = this.getUrlParam("url", this.url);
        if (url.indexOf("http") == 0) {
            var matchID = this.getUrlParam("matchID", Math.ceil(Math.random() * 100000));
            console.info("url:", url);
            var self = this;
            var get_server_node = url + "/get_server_node?matchID=" + matchID;
            this.getServerNode(get_server_node, function (success, request) {
                if (success) {
                    var response = request.responseText;
                    var msgObj = JSON.parse(response);
                    console.log(response);
                    self.connectWebSocket(msgObj.game_url);
                } else {
                    gameApp.callGameOver("http_error");
                }
            });
        } else {
            this.connectWebSocket(url);
        }
    },

    connectWebSocket: function (url) {
        if (this.ws != null) {
            this.ws.close();
        }
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";
        var self = this;
        console.info("url:" + url);
        this.ws.onopen = function (event) {
            console.log("Send Text WS was opened.");
            self.msgIndex = 1;
            onfire.fire("connected");
        };
        this.ws.onmessage = function (event) {
            //FIXME:消息路由
            // console.log(event.data);
            var jsonObj;
            if (typeof (event.data) == 'string') {
                jsonObj = JSON.parse(event.data);
            } else {
                jsonObj = msgpack.decode(new Uint8Array(event.data))
            }
            if (jsonObj.msg_name == 'sc_sync') {
                console.log(jsonObj);
            } else {
                console.info(jsonObj);
            }
            gData.handleMessage(jsonObj.msg_name, jsonObj.msg_data);

        };
        this.ws.onerror = function (event) {
            console.error("Send Text fired an error");
            onfire.fire("onerror");
        };
        this.ws.onclose = function (event) {
            console.warn("WebSocket instance closed.");
            onfire.fire("onclose");
        };
    },

    send: function (id, msgObj) {
        // console.log("id:", id)
        // console.log("msgObj:", msgObj)
        msgObj.msg_name = id;
        msgObj.msg_index = this.msgIndex;
        this.msgIndex++;
        if (msgObj.msg_name == 'cs_sync') {
            console.log("send :" + id, msgObj);
        } else {
            console.info("send :" + id, msgObj);
        }
        this.sendObj(msgObj);
    },

    sendObj: function (jsonObj) {
        // this.sendString(JSON.stringify(jsonObj));
        this.sendString(msgpack.encode(jsonObj));
    },

    sendString: function (msg) {
        if (this.ws != null && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
        } else {
            console.warn("websocket not connected");
        }
    },
});