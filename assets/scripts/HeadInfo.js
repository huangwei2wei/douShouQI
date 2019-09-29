// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var EmojiReceiver = require("../common/emoji/EmojiReceiver");
var Microphone = require("../common/microphone/Microphone");
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
        spHead1: cc.Sprite,
        spHead2: cc.Sprite,
        spGender1: cc.Sprite,
        spGender2: cc.Sprite,

        genderSpriteFrames: [cc.SpriteFrame],
        jsEmojiReceiver1: EmojiReceiver,
        jsEmojiReceiver2: EmojiReceiver,

        jsMicrophone1: {
            default: null,
            type: Microphone,
            tooltip: "Microphone1",
        },
        jsMicrophone2: {
            default: null,
            type: Microphone,
            tooltip: "Microphone2",
        },
    },

    // LIFE-CYCLE CALLBACKS:

    setHead: function (spHead, imgUrl) {
        var self = this;
        cc.loader.load({
            url: imgUrl,
            type: 'jpg'
        }, function (err, tex) {
            if (!tex) {
                console.error('load img null,' + imgUrl);
            } else {
                console.log('load img ok,' + imgUrl);
                var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
                // console.log(self.spHead)
                spHead.spriteFrame = spriteFrame;
            }

        });
    },

    setGender: function (spGender, sex) {
        // 0未知， 1男 2女
        if (sex == 1) {
            spGender.spriteFrame = this.genderSpriteFrames[0];
        } else {
            spGender.spriteFrame = this.genderSpriteFrames[1];
        }
    },

    onLoad: function () {
        if (gData.self_info.pos == 1) {
            this.setGender(this.spGender1, gData.self_info.sex);
            this.setHead(this.spHead1, gData.self_info.icon);

            this.setHead(this.spHead2, gData.enemy_info.icon);
            this.setGender(this.spGender2, gData.enemy_info.sex);

            this.jsEmojiReceiver1.init(gData.self_info.member_id);
            this.jsEmojiReceiver2.init(gData.enemy_info.member_id);

            this.jsMicrophone1.setMemberId(gData.self_info.member_id);
            this.jsMicrophone2.setMemberId(gData.enemy_info.member_id);
        } else {
            this.setHead(this.spHead1, gData.enemy_info.icon);
            this.setGender(this.spGender1, gData.enemy_info.sex);

            this.setHead(this.spHead2, gData.self_info.icon);
            this.setGender(this.spGender2, gData.self_info.sex);

            this.jsEmojiReceiver2.init(gData.self_info.member_id);
            this.jsEmojiReceiver1.init(gData.enemy_info.member_id);

            this.jsMicrophone2.setMemberId(gData.self_info.member_id);
            this.jsMicrophone1.setMemberId(gData.enemy_info.member_id);
        }
    },
});