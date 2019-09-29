var AI = require("./AI");
// var MusicManager = require("MusicManager");
cc.Class({
    extends: cc.Component,

    properties: {

        gameState: 'white',

        nodeTime: cc.Node,
        spTimeBg: cc.Sprite,
        nodeTimeMask: cc.Node,
        timeLeftFrame: cc.SpriteFrame,
        timeRightFrame: cc.SpriteFrame,
        txtTime: cc.Label,
        prefabAlert: cc.Prefab,
        prefabAnimal: cc.Prefab,
        jsAI: AI,
        node_camp: [cc.Node],
        // musicMgr: MusicManager
    },

    toIndex: function (x, y) {
        return y * 15 + x;
    },

    isMyRurn: function () {
        if (gData.isPlayWithAI()) {
            return this.gameState === 'black';
        } else {
            if (gData.self_info.pos == 1) {
                return this.gameState === 'white';
            } else {
                return this.gameState === 'black';
            }
        }
    },

    getMyColor: function () {
        if (gData.isPlayWithAI()) {
            return 'black';
        } else {
            if (gData.self_info.pos == 1) {
                return 'white';
            } else {
                return 'black';
            }
        }
    },

    // use this for initialization
    onLoad: function () {
        this.winColor = "nil";
        this.jsAnimalList = [];

        this.tileW = 171;
        this.tileH = 193;
        var self = this;
        window.musicManager = this.node.getComponent("MusicManager");

        function randomSort(arr, newArr) {
            // 如果原数组arr的length值等于1时，原数组只有一个值，其键值为0
            // 同时将这个值push到新数组newArr中
            if (arr.length == 1) {
                newArr.push(arr[0]);
                return newArr; // 相当于递归退出
            }
            // 在原数组length基础上取出一个随机数
            var random = Math.ceil(Math.seededRandom() * arr.length) - 1;
            // 将原数组中的随机一个值push到新数组newArr中
            newArr.push(arr[random]);
            // 对应删除原数组arr的对应数组项
            arr.splice(random, 1);
            return randomSort(arr, newArr);
        }

        var tempIndexs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        gData.shuffle(tempIndexs);

        var index = 0;
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                var nodeAnimal = cc.instantiate(this.prefabAnimal);
                this.node.addChild(nodeAnimal);
                var jsAnimal = nodeAnimal.getComponent('Animal');
                var tempIndex = tempIndexs[index];
                index += 1;
                if (tempIndex >= 8) {
                    //敌人
                    jsAnimal.init(index, x, y, tempIndex % 8, 2, this.tileW, this.tileH);
                } else {
                    //自己
                    jsAnimal.init(index, x, y, tempIndex % 8, 1, this.tileW, this.tileH);
                }

                this.jsAnimalList.push(jsAnimal);
            }
        }
        this.syncMsgList = [];

        this.node_camp[gData.self_info.pos - 1].active = true;

        onfire.onmsg("msg_ready", this.onStartGame, this);
        onfire.onmsg("sc_game_result", this.on_sc_game_result, this);
        onfire.onmsg("sc_sync", this.on_sc_sync, this);
    },

    getAnimal: function (tX, tY) {
        for (var index = 0; index < this.jsAnimalList.length; index++) {
            var jsAnimal = this.jsAnimalList[index];
            if (jsAnimal.tX == tX && jsAnimal.tY == tY) {
                return jsAnimal;
            }
        }
        return null;
    },

    getAnimalById: function (id) {
        for (var index = 0; index < this.jsAnimalList.length; index++) {
            var jsAnimal = this.jsAnimalList[index];
            if (jsAnimal.id == id) {
                return jsAnimal;
            }
        }
    },

    getAnimalList: function () {
        return this.jsAnimalList;
    },

    removeAnimalById: function (id) {
        for (var index = 0; index < this.jsAnimalList.length; index++) {
            var jsAnimal = this.jsAnimalList[index];
            if (jsAnimal.id == id) {
                this.jsAnimalList.splice(index, 1);
                jsAnimal.node.parent = null;
                return;
            }
        }
    },

    onStartGame: function () {
        gData.startGame();

        this.schedule(function () {
            if (this.syncMsgList.length > 0) {
                var msg = this.syncMsgList[0];
                this.syncMsgList.splice(0);
                this.use_sc_sync(msg);
            }
        }, 0);

        this.asking = false;
        this.currentAnimal = null;

        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (this.asking) {
                return;
            }
            if (this.isMyRurn()) {
                var touchPt = this.node.convertToNodeSpace(event.getLocation())
                var tX = Math.floor(touchPt.x / this.tileW);
                var tY = Math.floor(touchPt.y / this.tileH);

                if (tX > 4 || tY > 4 || tX < 0 || tY < 0) {
                    return;
                }

                var self = this;

                var jsAnimal = this.getAnimal(tX, tY);
                if (this.currentAnimal == null) {
                    if (jsAnimal != null) {
                        if (jsAnimal.isOpen() == false) {
                            this.currentAnimal = jsAnimal;
                            this.currentAnimal.showOpen(function () {
                                self.onMyTurnOver(-1, true);
                            }, true);
                        } else if (jsAnimal.isSelf()) {
                            this.currentAnimal = jsAnimal;
                            this.currentAnimal.setSelected(true);
                        }
                    }
                } else {
                    //相邻的位置？
                    if ((Math.abs(tX - this.currentAnimal.tX) + Math.abs(tY - this.currentAnimal.tY)) == 1) {
                        // console.warn("相邻的位置:", this.currentAnimal.tX, this.currentAnimal.tY, tX, tY, jsAnimal);
                        if (jsAnimal == null) {
                            //移动到这个位置
                            this.currentAnimal.moveTo(tX, tY, function () {
                                self.onMyTurnOver(-1, true);
                            }, true);

                            return;
                        } else if (this.currentAnimal.canEat(jsAnimal)) {
                            //可以吃掉？
                            this.currentAnimal.eat(jsAnimal, function (ret) {
                                // console.warn("eat:", ret);
                                if (ret == -1) {
                                    self.removeAnimalById(self.currentAnimal.id);
                                } else if (ret == 0) {
                                    self.removeAnimalById(self.currentAnimal.id);
                                    self.removeAnimalById(jsAnimal.id);
                                } else if (ret == 1) {
                                    self.removeAnimalById(jsAnimal.id);
                                }
                                self.onMyTurnOver(-1, true);
                            }, true);
                            return;
                        }
                    }
                    if (jsAnimal.id == this.currentAnimal.id) {
                        //如果选中的还是自己？
                        this.currentAnimal.setSelected(!this.currentAnimal.selected);
                    } else if (!jsAnimal.isEnemy(this.currentAnimal) && jsAnimal.isOpen() == true && jsAnimal.id != this.currentAnimal.id) {
                        //如果是队友？
                        // self.onMyTurnOver();
                        this.currentAnimal.setSelected(false);
                        this.currentAnimal = jsAnimal;
                        this.currentAnimal.setSelected(!this.currentAnimal.selected);
                    } else if (jsAnimal.isOpen() == false) {
                        //如果选择的位置没有打开？
                        self.onMyTurnOver();
                        this.currentAnimal = jsAnimal;
                        jsAnimal.showOpen(function () {
                            self.onMyTurnOver(-1, true);
                        }, true);
                    }
                }
            } else {
                //提示对方回合
                cc.getWinManager().openWin("tips", {
                    msg: "请等待对方操作"
                });
            }
        }, this);

        if (gData.isPlayWithAI()) {
            this.ai();
            this.onTurnTo('black');
        } else {
            this.onTurnTo('white');
        }


    },

    switchTurn: function () {
        if (this.gameState != 'white') {
            this.onTurnTo("white");
        } else {
            this.onTurnTo("black");
        }
    },

    onTurnTo: function (state, unClearCountDown) {
        this.gameState = state;
        console.log("onTurnTo:" + state);
        if (this.isMyRurn()) {
            this.onMyTrun(unClearCountDown);
        } else {
            this.onOtherTrun(unClearCountDown);
        }

        var scaleX = 1;
        var spriteFrame = null;
        if (this.isMyRurn()) {
            this.nodeTime.active = true;
            if (gData.self_info.pos == 1) {
                scaleX = 1;
            } else {
                scaleX = -1;
            }
            spriteFrame = this.timeLeftFrame;
        } else {
            this.nodeTime.active = true;
            if (gData.enemy_info.pos == 1) {
                scaleX = 1;
            } else {
                scaleX = -1;
            }
            spriteFrame = this.timeRightFrame;
        }

        if (scaleX > 0) {
            this.nodeTimeMask.x = 0;
        } else {
            this.nodeTimeMask.x = 16;
        }

        this.nodeTimeMask.stopActionByTag(0x1232);
        var action = cc.sequence([
            cc.fadeIn(0.05),
            cc.delayTime(0.3),
            cc.fadeOut(0.1)
        ]);
        action.setTag(0x1232);
        this.nodeTimeMask.runAction(action);
        this.nodeTimeMask.scaleX = scaleX;


        this.spTimeBg.node.stopActionByTag(0x1232);
        var action2 = cc.sequence([
            cc.scaleTo(0.3, this.spTimeBg.node.scaleX, 0),
            cc.callFunc(function () {
                this.spTimeBg.spriteFrame = spriteFrame;
                this.spTimeBg.node.scaleX = scaleX;
                if (scaleX > 0) {
                    this.spTimeBg.node.x = 0;
                } else {
                    this.spTimeBg.node.x = 16;
                }
            }, this),
            cc.scaleTo(0.3, scaleX, 1)
        ]);
        action2.setTag(0x1232);
        this.spTimeBg.node.runAction(action2);

        this.txtTime.node.stopActionByTag(0x1232);
        var action3 = cc.sequence([
            cc.scaleTo(0.3, 1, 0),
            cc.scaleTo(0.3, 1, 1)
        ]);
        action3.setTag(0x1232);
        this.txtTime.node.runAction(action3);

    },

    onMyTrun: function (unClearCountDown) {
        this.clearCountDown();
        console.log("onMyTrun")

        if (unClearCountDown != true) {
            this.time = 30;
        }
        this.txtTime.string = "你的回合" + this.time + "秒";
        this.schedule(this.onMyTurnCountDown, 0);
    },

    clearCountDown: function () {
        this.unschedule(this.onMyTurnCountDown);
        this.unschedule(this.onEnemyTurnCountDown);
        this.nodeTime.active = false;
        this.txtTime.getComponent(cc.AudioSource).stop();
    },

    onMyTurnCountDown: function (dt) {
        if (this.time >= 0) {
            this.time = this.time - dt;
            if (this.time <= 0) {
                this.clearCountDown();
                //超时算输
                this.sendGameOver(2);
            }
            var audioSource = this.txtTime.getComponent(cc.AudioSource);
            if (Math.floor(this.time) == 5 &&
                audioSource.isPlaying == false) {
                audioSource.play();
            }
            this.txtTime.string = "你的回合" + Math.floor(this.time) + "秒";
        }
    },

    onEnemyTurnCountDown: function (dt) {
        if (this.time >= 0) {
            this.time = this.time - dt;
            if (this.time <= 0) {
                this.clearCountDown();
                //超时算输
                this.sendGameOver(1);
            }
            var audioSource = this.txtTime.getComponent(cc.AudioSource);
            if (Math.floor(this.time) == 5 &&
                audioSource.isPlaying == false) {
                audioSource.play();
            }
            this.txtTime.string = "对方回合" + Math.floor(this.time) + "秒";
        }
    },

    onMyTurnOver: function (type = 0, endTurn = false) {
        if (this.currentAnimal != null) {
            if (type == 0) {
                this.currentAnimal.setSelected(false);
            }
            this.currentAnimal = null;
        }
        //结果检测
        this.judgeOver();
        if (this.gameState === "over" && gData.isGameEnd() == false) {
            this.clearCountDown();
            this.scheduleOnce(function () {
                this.sendGameOver(this.result);
            }, 1);
        }
        if (endTurn) {
            this.switchTurn();
        }
    },

    onOtherTrun: function (unClearCountDown) {
        this.clearCountDown();

        if (unClearCountDown != true) {
            this.time = 30;
        }
        this.txtTime.string = "对方回合" + this.time + "秒";
        this.schedule(this.onEnemyTurnCountDown, 0);

        if (gData.isPlayWithAI()) {
            this.scheduleOnce(function () {
                var callback = function () {
                    this.judgeOver();
                    if (this.gameState === "over" && gData.isGameEnd() == false) {
                        this.scheduleOnce(function () {
                            this.sendGameOver(this.result);
                        }, 1);
                    } else {
                        this.switchTurn();
                    }
                };
                this.jsAI.doAI(this, callback.bind(this));
            }, 3 + Math.random() * 3);

        }
    },

    sendGameOver: function (result) {
        var msg = {
            game_state: 2,
            self_score: 0,
            enemy_score: 0,
        };
        // if (win) {
        msg.result = result;
        if (result == 1) {
            msg.self_score = gData.getPlayTime();
        } else {
            msg.enemy_score = gData.getPlayTime();
        }
        // } else {
        // msg.result = 2
        // }
        cc.network.socket.send("cs_game_result", msg);
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL);

        gData.endGame();
    },

    ai() {

    },

    judgeOver() {
        var selfCount = 0;
        var enemyCount = 0;
        for (var index = 0; index < this.jsAnimalList.length; index++) {
            var jsAnimal = this.jsAnimalList[index];
            if (jsAnimal.isOpen() == false) {
                //还有没翻开的？
                return;
            }
            if (jsAnimal.isSelf()) {
                selfCount += 1;
            } else {
                enemyCount += 1;
            }
            if (selfCount > 0 && enemyCount > 0) {
                //双方还有棋
                return;
            }
        }

        this.gameState = "over";
        if (selfCount == 0 && enemyCount == 0) {
            this.result = 0;
        } else if (selfCount > 0) {
            //我赢
            this.result = 1;
        } else if (selfCount <= 0 && enemyCount > 0) {
            this.result = 2;
        }
    },

    on_sc_sync: function (data) {
        this.syncMsgList.push(data);
    },

    use_sc_sync: function (data) {
        if (data.member_id == gData.self_info.member_id) {
            return;
        }
        var self = this;
        var jsAnimal;
        var objData = JSON.parse(data.data);
        if (objData.msg == "open") {
            if (objData.member_id == gData.enemy_info.member_id) {
                jsAnimal = this.getAnimalById(objData.id);
                jsAnimal.showOpen(function () {
                    self.switchTurn();
                });
            }
        } else if (objData.msg == "moveTo") {
            if (objData.member_id == gData.enemy_info.member_id) {
                jsAnimal = this.getAnimalById(objData.id);
                jsAnimal.moveTo(objData.tX, objData.tY, function () {
                    self.switchTurn();
                });
            }
        } else if (objData.msg == "eat") {
            if (objData.member_id == gData.enemy_info.member_id) {
                jsAnimal = this.getAnimalById(objData.id);
                var temp = this.getAnimalById(objData.eatId);
                jsAnimal.eat(temp, function (ret) {
                    if (ret == -1) {
                        self.removeAnimalById(jsAnimal.id);
                    } else if (ret == 0) {
                        self.removeAnimalById(jsAnimal.id);
                        self.removeAnimalById(temp.id);
                    } else if (ret == 1) {
                        self.removeAnimalById(temp.id);
                    }
                    self.switchTurn();
                });
            }
        } else if (objData.msg == "draw") {
            //平局
            if (objData.subMsg == "ask") {
                this.onAskDraw(objData);
            } else if (objData.subMsg == "agree") {
                //游戏直接结束
                this.asking = false;
            } else if (objData.subMsg == "refuse") {
                this.asking = false;
                cc.getWinManager().openWin("tips", {
                    msg: "对方拒绝了你的求和请求"
                });
            }
        }
    },

    on_sc_game_result: function (data) {
        //游戏结束
        onfire.un("sc_sync");
        onfire.un("sc_leave");
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL);
        this.clearCountDown();
        gameApp.callGameOver(data.result_id);
    },


    onClickDraw: function () {
        if (this.asking) {
            return;
        }
        var data = {
            msg: "draw",
            subMsg: "ask",
            member_id: gData.self_info.member_id
        };
        var msg = {
            data: JSON.stringify(data),
            score: 0
        };
        cc.network.socket.send("cs_sync", msg);
        this.asking = true;
        var self = this;
        setTimeout(function () {
            self.asking = false;
            if (gData.enemy_info.is_robot) {
                cc.getWinManager().openWin("tips", {
                    msg: "对方拒绝了你的求和请求"
                });
            }
        }, 3000);



        cc.getWinManager().openWin("tips", {
            msg: "请等待对方确认"
        });
    },
    onClickSurrender: function () {
        this.sendGameOver(2);
    },

    onAskDraw: function (objData) {
        //请求和棋
        var nodeAlert = cc.getWinManager().openWin(this.prefabAlert);
        var jsAlert = nodeAlert.getComponent("Alert");
        jsAlert.setMessage("对方求和");
        var self = this;
        var ok = function () {
            console.log("ok");
            this.sendGameOver(0);
        }
        jsAlert.setOk(ok.bind(this));

        var cancel = function () {
            console.log("cancel");
            var data = {
                msg: "draw",
                subMsg: "refuse",
                member_id: objData.member_id
            };
            var msg = {
                data: JSON.stringify(data),
                score: 0
            };
            cc.network.socket.send("cs_sync", msg);
        };
        jsAlert.setCancel(cancel.bind(this), "自动拒绝", 3);
    },
});