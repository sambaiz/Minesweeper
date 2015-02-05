var GameOver = cc.Layer.extend({
    ctor:function(){
        this._super();
        this.init();
    },
    init:function () {

        this.addChild(this.v_result(), 10, 1);
        this.addChild(this.v_menu(), 1, 2);

        if (cc.sys.capabilities.hasOwnProperty('keyboard'))
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased:function (key,event) {
                    if(key == cc.KEY["escape"]){ //Androidの戻るボタン
                        cc.director.end();                   
                    }
                }
            }, this);

        return true;
    },
    onStartGame:function (pSender) {
        cc.LoaderScene.preload(g_game, function () {
            cc.director.runScene(new cc.TransitionFade(1.2, new GameScene()));
        }, this);
    },
    onBackTop:function (pSender) {
        cc.LoaderScene.preload(g_main_menu, function () {
            cc.director.runScene(new cc.TransitionFade(1.2, new MainMenuScene()));
        }, this);
    },
    v_result:function (pSender) {
        var result = new cc.Sprite((MS.CLEAR)?res.clear_png:res.gameover_png);
        result.attr({
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2,
            scale: 1.5
        });
        return result;
    },
    v_menu:function (pSender) {
        var menu = new cc.Menu(this.v_play_again(), this.v_back_top());
        menu.alignItemsVerticallyWithPadding(10);
        menu.x = cc.winSize.width / 2;
        menu.y = cc.winSize.height / 2 - 100;
        return menu;
    },
    v_play_again:function (pSender) {
        var playAgainNormal = new cc.Sprite(res.retry_png, cc.rect(0, 0, 126, 33));
        var playAgainSelected = new cc.Sprite(res.retry_png, cc.rect(0, 33, 126, 33));
        var playAgainDisabled = new cc.Sprite(res.retry_png, cc.rect(0, 33 * 2, 126, 33));

        var playAgain = new cc.MenuItemSprite(playAgainNormal, playAgainSelected, playAgainDisabled, this.onStartGame, this);
        playAgain.scale = 1.5;
        return playAgain;
    },
    v_back_top:function (pSender) {
        var topNormal = new cc.Sprite(res.top_png, cc.rect(0, 0, 126, 33));
        var topSelected = new cc.Sprite(res.toop_png, cc.rect(0, 33, 126, 33));
        var topDisabled = new cc.Sprite(res.top_png, cc.rect(0, 33 * 2, 126, 33));

        var top = new cc.MenuItemSprite(topNormal, topSelected, topDisabled, this.onBackTop, this);
        top.scale = 1.5;
        return top;
    }
});

GameOver.scene = function () {
    var scene = new cc.Scene();
    var layer = new GameOver();
    scene.addChild(layer);
    return scene;
};
