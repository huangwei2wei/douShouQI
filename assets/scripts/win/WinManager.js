// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.getWinManager = function (options) {
    return cc.Canvas.instance.getComponent("WinManager")
};

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

    onLoad() {
        console.log("WinManager")
        this.winBaseList = []
    },

    start() {

    },

    // update (dt) {},

    openWin: function (name, params) {
        if (typeof name == "string") {
            var self = this;
            cc.loader.loadRes("win/" + name, function (err, prefab) {
                return self._openWin(prefab, params)
            });
        } else {
            return this._openWin(name, params)
        }
    },

    _openWin: function (prefab, params) {
        var newNode = cc.instantiate(prefab);
        var winBase = newNode.getComponent("WinBase")
        winBase.setWinManager(this)
        this.node.addChild(newNode);
        winBase._onWinEnter(params)
        this.winBaseList.push(winBase)
        this.updateWinState()

        return newNode
    },

    closeWin: function (winBase) {
        winBase._onClose()
        winBase.node.parent = null
    },

    updateWinState: function () {

    },
});