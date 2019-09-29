// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//说明
//挂在node上
//设置memberId
//emojiSpriteFrame数组

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
        emojiSpriteFrame: [cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        onfire.onmsg("sc_sync_other", this.on_sc_sync_other, this);
    },

    init: function (memberId) {
        this.memberId = memberId;
    },
    on_sc_sync_other: function (msg) {
        if (msg.member_id == this.memberId) {
            var jsonObj = JSON.parse(msg.data);
            var index = jsonObj.index;

            var node = new cc.Node();
            var sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = this.emojiSpriteFrame[index];

            var action1 = cc.moveBy(0.8, cc.p(cc.randomMinus1To1() * 80, -100));
            var action2 = cc.sequence(cc.delayTime(0.5), cc.fadeOut(0.3));

            node.runAction(action1);
            node.runAction(action2);

            node.parent = this.node;
        }
    },

    // update (dt) {},
});