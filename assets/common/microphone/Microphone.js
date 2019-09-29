// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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
        openSpriteFrame: cc.SpriteFrame,
        closeSpriteFrame: cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        onfire.onmsg("msg_update_player_status", this.updateMicrophone, this);
        onfire.onmsg("msg_game_over", this.onGameOver, this);
    },

    getMicrophoneSprite: function () {
        if (this.spMicrophone == null) {
            this.spMicrophone = this.getComponent(cc.Sprite);
        }
        return this.spMicrophone;
    },

    onGameOver: function () {
        this.getMicrophoneSprite().enabled = false;
    },

    updateMicrophone: function (jsonObj) {
        var playerInfo = gameApp.getPlayerInfo(this.memberId);
        if (playerInfo != null) {
            if (playerInfo.microphoneOpen == 1) {
                this.getMicrophoneSprite().spriteFrame = this.openSpriteFrame;
            } else {
                this.getMicrophoneSprite().spriteFrame = this.closeSpriteFrame;
            }
        } else {
            console.log(this.memberId + ": playerInfo = null");
        }
    },

    setMemberId: function (memberId) {
        this.memberId = memberId;
        var playerInfo = gameApp.getPlayerInfo(this.memberId);
        if (playerInfo == null) {
            gameApp.callGetPlayerStatus();
        } else {
            this.updateMicrophone(playerInfo);
        }
    },
});