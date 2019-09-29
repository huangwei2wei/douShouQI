// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var WinBase = require("./win/WinBase");
cc.Class({
    extends: WinBase,

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
        txtOk: cc.Label,
        txtCancel: cc.Label,
        btnOk: cc.Button,
        btnCancel: cc.Button,
        txtMsg: cc.Label,
        txtTips: cc.Label,
    },

    setMessage: function (msg) {
        this.txtMsg.string = msg;
    },

    setOk: function (callback, tips, countDown) {
        // this.txtOk.string = msg
        this.btnOk.node.on("click", function () {
            callback.call();
            this.closeSelf();
        }, this);

        if (countDown != null) {
            this.countDown1 = countDown;
            this.txtTips.string = tips + "(" + this.countDown1 + "s)";
            this.schedule(function () {
                if (this.countDown1 == 0) {
                    callback.call();
                    this.closeSelf();
                } else {
                    this.countDown1 = this.countDown1 - 1;
                    this.txtTips.string = tips + "(" + this.countDown1 + "s)";
                }
            }, 1);
        }
    },

    setCancel: function (callback, tips, countDown) {
        // this.txtCancel.string = msg
        this.btnCancel.node.on("click", function () {
            callback.call();
            this.closeSelf();
        }, this);

        if (countDown != null) {
            this.countDown2 = countDown;
            this.txtTips.string = tips + "(" + this.countDown2 + "s)";
            this.schedule(function () {
                if (this.countDown2 == 0) {
                    callback.call();
                    this.closeSelf();
                } else {
                    this.countDown2 = this.countDown2 - 1;
                    this.txtTips.string = tips + "(" + this.countDown2 + "s)";
                }
            }, 1);
        }
    }

    // update (dt) {},
});