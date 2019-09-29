// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var animalNams = [
    'shu',
    'mao',
    'gou',
    'lang',
    'bao',
    'hu',
    'shi',
    "xiang",
];

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
        sp_name: cc.Sprite,
        btn_press: cc.Button,
        sp_mask: cc.Sprite,
        SmokingAni: cc.Animation
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        this.open = false;
        this.selected = false;
        this.pos = 1; //1 2 对应玩家pos  1红方 2蓝方
        this.type = 0; //0 1 2 3
        this.id = 0;
        this.tX = 0;
        this.tY = 0;
        this.id = 0;
    },

    init: function (id, tX, tY, type, pos, tileW, tileH) {
        this.id = id;
        this.type = type;
        this.pos = pos;
        this.tX = tX;
        this.tY = tY;
        this.tileW = tileW;
        this.tileH = tileH;
        this.sp_mask.spriteFrame = cc.loader.getRes("texture/aniaml/" + animalNams[type], cc.SpriteFrame);
        this.node.setPosition(this.tileToPos(tX, tY));
        if (pos == 1) {
            this.sp_name.spriteFrame = cc.loader.getRes("texture/word/hong" + animalNams[type], cc.SpriteFrame);

        } else {
            this.sp_name.spriteFrame = cc.loader.getRes("texture/word/lan" + animalNams[type], cc.SpriteFrame);
        }


    },

    isOpen: function () {
        return this.open;
    },

    tileToPos: function (tX, tY) {
        return cc.p(tX * this.tileW + this.tileW / 2, tY * this.tileH + this.tileH / 2);
    },

    isEnemy: function (jsAnimal) {
        return this.pos != jsAnimal.pos;
    },

    canEat: function (jsAnimal) {
        if (jsAnimal == null) {
            //不能吃空的
            return false;
        }
        if (jsAnimal.open == false) {
            //不能吃没打开的
            return false;
        }
        if (this.isEnemy(jsAnimal) == false) {
            //不能吃队友
            return false;
        }
        return true;
    },

    /**
     * -1:lost
     * 0:平局
     * 1:win
     */
    compare: function (jsAnimal) {
        if (this.type == jsAnimal.type) {
            return 0;
        }
        if (this.type == 0 && jsAnimal.type == 7) {
            return 1;
        }
        if (this.type == 7 && jsAnimal.type == 0) {
            return -1;
        }
        if (this.type > jsAnimal.type) {
            return 1;
        }
        return -1;
    },


    setSelected: function (value) {
        console.log("select", this.tX, this.tY);
        let posY = this.node.y;
        if (this.selected)
            posY -= 50;
        this.selected = value;
        if (value) {
            var seq = cc.spawn(cc.scaleTo(0.2, 1.1, 1.1), cc.moveTo(0.2, this.node.x, this.node.y + 50));
            seq.easing(cc.easeBounceInOut());

            this.node.runAction(seq);
            this.node.zIndex = 1000;
            musicManager.playSfxAudio(10);
        } else {
            musicManager.playSfxAudio(11);
            var seq = cc.spawn(cc.scaleTo(0.2, 1, 1), cc.moveTo(0.2, this.node.x, posY));
            seq.easing(cc.easeBounceInOut());
            this.node.runAction(seq);
            this.node.zIndex = 100;
        }
    },

    _moveAnimation: function (tX, tY, callback) {
        this.tX = tX;
        this.tY = tY;
        let targetPos = this.tileToPos(tX, tY);
        var seq = cc.sequence(cc.moveTo(0.1, targetPos.x, this.node.y), cc.spawn(cc.scaleTo(0.1, 1, 1), cc.moveTo(0.1, targetPos.x, targetPos.y)));
        this.node.runAction(seq);
        this.node.zIndex = 100;

        callback();
    },

    isSelf: function () {
        return this.pos == gData.self_info.pos;
    },

    showOpen: function (callback, sync) {
        this.open = true;
        musicManager.playSfxAudio(this.type);
        if (sync === true) {
            var data = {
                member_id: gData.self_info.member_id,
                id: this.id,
                msg: "open",
            };
            var msg = {
                data: JSON.stringify(data),
                score: 0
            };
            cc.network.socket.send("cs_sync", msg);
        }

        this.sp_mask.node.active = true;
        this.sp_name.node.parent.active = true;
        if (this.pos == 1) {
            this.node.getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("texture/red", cc.SpriteFrame);
        } else {
            this.node.getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("texture/blue", cc.SpriteFrame);
        }

        callback();
    },

    moveTo: function (tX, tY, callback, sync) {
        this._moveAnimation(tX, tY, function () {
            callback();
            musicManager.playSfxAudio(11); 
        });

        if (sync === true) {
            var data = {
                member_id: gData.self_info.member_id,
                id: this.id,
                tX: tX,
                tY: tY,
                msg: "moveTo",
            };
            var msg = {
                data: JSON.stringify(data),
                score: 0
            };
            cc.network.socket.send("cs_sync", msg);
        }

    },

    aiMove(tX, tY, callback, sync) {
        let self = this;
        if (!this.selected)
            this.setSelected(!this.selected);
        this.scheduleOnce(function () {
            self.moveTo(tX, tY, callback, sync);
        }, 0.3)
    },

    aiEat(jsAnimal, callback, sync) {
        let self = this;
        if (!this.selected)
            this.setSelected(!this.selected);
        this.scheduleOnce(function () {
            self.eat(jsAnimal, callback, sync);
        }, 0.3)
    },

    eat: function (jsAnimal, callback, sync) {
        
        this.SmokingAni.play('Smoke');
        if (sync === true) {
            var data = {
                member_id: gData.self_info.member_id,
                id: this.id,
                eatId: jsAnimal.id,
                msg: "eat",
            };
            var msg = {
                data: JSON.stringify(data),
                score: 0
            };
            cc.network.socket.send("cs_sync", msg);
        }

        var self = this;
        
        this._moveAnimation(jsAnimal.tX, jsAnimal.tY, function () {
            var ret = self.compare(jsAnimal);
            //各种表现和音效
            if (ret == -1) {
                musicManager.playSfxAudio(8); 
            } else if (ret == 0) {
                musicManager.playSfxAudio(9);
            } else if (ret == 1) {
                musicManager.playSfxAudio(8); 
            }

            callback(ret);
        });

    },

    // update (dt) {},
});