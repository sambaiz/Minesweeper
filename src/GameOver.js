var GameOver = cc.Layer.extend({
    ctor:function(){
        this._super();
        this.init();
    },
    init:function () {
        var logo = new cc.Sprite((MS.CLEAR)?res.clear_png:res.gameover_png);
        logo.attr({
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2,
            scale: 1.5
        });
        this.addChild(logo,10,1);

        var playAgainNormal = new cc.Sprite(res.retry_png, cc.rect(0, 0, 126, 33));
        var playAgainSelected = new cc.Sprite(res.retry_png, cc.rect(0, 33, 126, 33));
        var playAgainDisabled = new cc.Sprite(res.retry_png, cc.rect(0, 33 * 2, 126, 33));

        var playAgain = new cc.MenuItemSprite(playAgainNormal, playAgainSelected, playAgainDisabled, this.onStartGame, this);
        playAgain.scale = 1.5;

        var topNormal = new cc.Sprite(res.top_png, cc.rect(0, 0, 126, 33));
        var topSelected = new cc.Sprite(res.toop_png, cc.rect(0, 33, 126, 33));
        var topDisabled = new cc.Sprite(res.top_png, cc.rect(0, 33 * 2, 126, 33));

        var top = new cc.MenuItemSprite(topNormal, topSelected, topDisabled, this.onBackTop, this);
        top.scale = 1.5;

        var menu = new cc.Menu(playAgain, top);
        menu.alignItemsVerticallyWithPadding(10);
        this.addChild(menu, 1, 2);
        menu.x = cc.winSize.width / 2;
        menu.y = cc.winSize.height / 2 - 100;

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
    }
});

GameOver.scene = function () {
    var scene = new cc.Scene();
    var layer = new GameOver();
    scene.addChild(layer);
    return scene;
};
