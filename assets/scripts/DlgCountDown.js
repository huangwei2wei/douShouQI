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
        readyNodes: [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.showReady()
    },

    showReady: function () {
        // MusicManager.instance.playSfxAudio(2);
        let index = 0;
        var self = this;
        let fn = function () {
            if (index > 0 && index < 5) self.readyNodes[index - 1].active = false;
            if (index > 3) { //这里是3
                onfire.fire("msg_ready")
                self.closeSelf()
                return;
            }
            self.readyNodes[index].active = true;
            self.readyNodes[index].scale = 0.2;
            self.readyNodes[index].runAction(cc.sequence(cc.scaleTo(0.1, 1), cc.delayTime(0.8), cc.callFunc(() => {
                fn()
            })));
            index++;
        }
        fn();
    },

    start() {

    },

    // update (dt) {},
});