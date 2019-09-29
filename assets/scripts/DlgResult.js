// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var WinBase = require("./win/WinBase")
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
        nodeWin: cc.Node,
        nodeLost: cc.Node,
        spHead: cc.Sprite,
        nodeLigth: cc.Node,
        nodeMiaoWin: cc.Node,
        nodeDraw: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.audioWin = this.getComponent(cc.AudioSource)
    },

    onWinEnter: function (sc_game_result) {
        var self = this
        var imgUrl = gData.self_info.icon //"https://alcdn.img.xiaoka.tv/20170915/536/a57/0/536a57ec03be6ec9ed656031e9aa3973.jpg@1e_1c_0o_0l_160h_160w_100q_1pr.jpg"
        cc.loader.load({
            url: gData.self_info.icon,
            type: 'jpg'
        }, function (err, tex) {
            if (!tex) {
                console.error('load img null,' + imgUrl);
            } else {
                console.log('load img ok,' + imgUrl);
            }
            var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
            // console.log(self.spHead)
            self.spHead.spriteFrame = spriteFrame;
        })

        var time = gData.getPlayTime() / 1000;

        if (sc_game_result.result == 0) {
            //平局
            this.nodeDraw.active = true
            // this.nodeMiaoWin.active = true
            this.time.setNumber(time, true)
        } else {

            if ((sc_game_result.result == 1 && sc_game_result.member_id == gData.self_info.member_id) ||
                (sc_game_result.result == 2 && sc_game_result.member_id == gData.enemy_info.member_id)) {
                //自己赢了,或者被人输了
                this.nodeWin.active = true
                this.nodeLigth.active = true
                // this.nodeMiaoWin.active = true

                var action = cc.repeatForever(cc.rotateBy(5, 360))
                this.nodeLigth.runAction(action)

                this.audioWin.play()
            } else {
                this.nodeLost.active = true
            }
        }
    },

    start() {

    },

    // update (dt) {},
});