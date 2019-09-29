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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        this.lastTx = -1;
        this.lastTy = -1;
    },

    doAI: function (jsGame, callback) {
        this.jsGame = jsGame;
        var jsAnimalList = jsGame.getAnimalList();

        var selfJSAnimalMap = []; //ai的棋子
        var enemyJSAnimalMap = [];
        var allJSAnimalMap = [];
        var allCloseAnimalList = [];
        for (var index = 0; index < jsAnimalList.length; index++) {
            var jsAnimal = jsAnimalList[index];
            if (jsAnimal.isSelf() == false) {
                selfJSAnimalMap[jsAnimal.type] = jsAnimal;
            } else {
                enemyJSAnimalMap[jsAnimal.type] = jsAnimal;
            }
            allJSAnimalMap[jsAnimal.id] = jsAnimal;
            if (jsAnimal.isOpen() == false) {
                allCloseAnimalList.push(jsAnimal);
            }
        }

        //认输？
        // var canEatAll = false;
        // for (var index = 0; index < enemyJSAnimalList.length; index++) {
        //     var enemyJSAnimal = enemyJSAnimalList[index];

        //     for (var index1 = 0; index1 < selfJSAnimalList.length; index1++) {
        //         var selfJSAnimal = selfJSAnimalList[index1];

        //     }
        // }

        //老鼠吃象？
        var mouse = selfJSAnimalMap[0];
        if (mouse != null && mouse.isOpen()) {
            var eatAnimal = this.canEatAround(mouse, enemyJSAnimalMap, false);
            if (eatAnimal != null) {
                mouse.eat(eatAnimal, function (ret) {
                    if (ret == -1) {
                        jsGame.removeAnimalById(mouse.id);
                    } else if (ret == 0) {
                        jsGame.removeAnimalById(mouse.id);
                        jsGame.removeAnimalById(eatAnimal.id);
                    } else if (ret == 1) {
                        jsGame.removeAnimalById(eatAnimal.id);
                    }
                    callback();
                });
                return;
            }
        }

        for (var type = 7; type > 0; type--) {
            var tempAniaml = selfJSAnimalMap[type];
            if (tempAniaml != null && tempAniaml.isOpen()) {
                var eatAnimal = this.canEatAround(tempAniaml, enemyJSAnimalMap, type > 4, true);
                // console.log("eat", type, eatAnimal);
                if (eatAnimal != null) {
                    tempAniaml.aiEat(eatAnimal, function (ret) {
                        if (ret == -1) {
                            jsGame.removeAnimalById(tempAniaml.id);
                        } else if (ret == 0) {
                            jsGame.removeAnimalById(tempAniaml.id);
                            jsGame.removeAnimalById(eatAnimal.id);
                        } else if (ret == 1) {
                            jsGame.removeAnimalById(eatAnimal.id);
                        }
                        callback();
                    });
                    return;
                }
            }
        }

        /*****************判断是否可以翻拍 */
        // for (var type = 7; type > 0; type--) {
        //     if (tempAniaml != null && tempAniaml.isOpen()) {

        //     }
        // }

        // 随意翻开一个？
        if (allCloseAnimalList.length > 0) {
            var temp = allCloseAnimalList[Math.floor(Math.random() * allCloseAnimalList.length)];
            temp.showOpen(function () {
                callback();
            });
            return;
        }

        //最大的随意走动？
        for (var type = 7; type >= 0; type--) {
            var jsAnimal = selfJSAnimalMap[type];
            if (jsAnimal != null && jsAnimal.isOpen()) {
                var tX = jsAnimal.tX + 1;
                var tY = jsAnimal.tY;
                if (tX <= 3) {
                    var temp = this.jsGame.getAnimal(tX, tY);
                    if (temp == null && this.lastTx != tX && this.lastTy != tY) {
                        this.lastTx = tX;
                        this.lastTy = tY;
                        jsAnimal.aiMove(tX, tY, callback);
                        return;
                    }
                }

                tX = jsAnimal.tX - 1;
                tY = jsAnimal.tY;
                if (tX >= 0) {
                    temp = this.jsGame.getAnimal(tX, tY);
                    if (temp == null && this.lastTx != tX && this.lastTy != tY) {
                        this.lastTx = tX;
                        this.lastTy = tY;
                        jsAnimal.aiMove(tX, tY, callback);
                        return;
                    }
                }

                tX = jsAnimal.tX;
                tY = jsAnimal.tY + 1;
                if (tY <= 3) {
                    temp = this.jsGame.getAnimal(tX, tY);
                    if (temp == null && this.lastTx != tX && this.lastTy != tY) {
                        this.lastTx = tX;
                        this.lastTy = tY;
                        jsAnimal.aiMove(tX, tY, callback);
                        return;
                    }
                }

                tX = jsAnimal.tX;
                tY = jsAnimal.tY - 1;
                if (tY >= 0) {
                    temp = this.jsGame.getAnimal(tX, tY);
                    if (temp == null && this.lastTx != tX && this.lastTy != tY) {
                        this.lastTx = tX;
                        this.lastTy = tY;
                        jsAnimal.aiMove(tX, tY, callback);
                        return;
                    }
                }
            }
        }

    },

    openAround: function (jsAnimal, enemyMap) {

        var aroundJSAnimalList = this.getAround(jsAnimal.tX, jsAnimal.tY, enemyMap, false);
        if (aroundJSAnimalList.length > 0) {
            return aroundJSAnimalList[Math.floor(Math.random() * aroundJSAnimalList.length)];
        }
        return null;
    },

    canEatAround: function (jsAnimal, enemyMap, checkSafe) {
        var aroundJSAnimalList = this.getAround(jsAnimal.tX, jsAnimal.tY, enemyMap, true);
        // console.warn("canEatAround", jsAnimal, checkSafe, aroundJSAnimalList);
        aroundJSAnimalList.sort(function (a, b) {
            return b.type - a.type;
        });
        for (var index = 0; index < aroundJSAnimalList.length; index++) {
            var temp = aroundJSAnimalList[index];

            if (jsAnimal.canEat(temp) && jsAnimal.compare(temp) >= 0) {
                if (checkSafe) {
                    delete enemyMap[temp.type];
                    var safe = this.isSafe(jsAnimal, enemyMap);
                    enemyMap[temp.type] = temp;
                    if (safe) {
                        return temp;
                    }
                } else {
                    return temp;
                }
            }
        }

        return null;
    },

    isSafe: function (jsAnimal, enemyMap) {
        var aroundJSAnimalList = this.getAround(jsAnimal.tX, jsAnimal.tY, enemyMap, true);
        for (var index = 0; index < aroundJSAnimalList.length; index++) {
            var temp = aroundJSAnimalList[index];
            if (temp.isOpen() && temp.compare(jsAnimal) >= 0) {
                return false;
            }
        }
        return true;
    },

    getAround: function (tX, tY, jsAnimalMap, open) {
        var aroundJSAnimal = [];
        for (var key in jsAnimalMap) {
            var tempAnimal = jsAnimalMap[key];
            if ((Math.abs(tX - tempAnimal.tX) + Math.abs(tY - tempAnimal.tY)) == 1 &&
                tempAnimal.isOpen() == open) {
                aroundJSAnimal.push(tempAnimal);
            }
        }
        return aroundJSAnimal;
        // var temp = this.jsGame.getAnimal(jsAnimal.tX + 1, jsAnimal.tY);
        // if (temp != null && temp.pos != jsAnimal.pos) {
        //     aroundJSAnimal.push(temp);
        // }

        // temp = this.jsGame.getAnimal(jsAnimal.tX - 1, jsAnimal.tY);
        // if (temp != null && temp.pos != jsAnimal.pos) {
        //     aroundJSAnimal.push(temp);
        // }

        // temp = this.jsGame.getAnimal(jsAnimal.tX, jsAnimal.tY + 1);
        // if (temp != null && temp.pos != jsAnimal.pos) {
        //     aroundJSAnimal.push(temp);
        // }

        // temp = this.jsGame.getAnimal(jsAnimal.tX, jsAnimal.tY - 1);
        // if (temp != null && temp.pos != jsAnimal.pos) {
        //     aroundJSAnimal.push(temp);
        // }
    }
});