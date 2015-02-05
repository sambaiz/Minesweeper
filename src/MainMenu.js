var MainMenuLayer = cc.Layer.extend({

    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        winSize = cc.winSize;
        
        var title = new cc.Sprite(res.title_png);
        title.attr({
            x: winSize.width / 2,
            y: winSize.height / 2,
            scale: 1.5
        });
        this.addChild(title, 10, 1);

        var startGameNormal = new cc.Sprite(res.start_button_png, cc.rect(0, 0, 126, 33));
        var startGameSelected = new cc.Sprite(res.start_button_png, cc.rect(0, 33, 126, 33));
        var startGameDisabled = new cc.Sprite(res.start_button_png, cc.rect(0, 33 * 2, 126, 33));

        var startGame = new cc.MenuItemSprite(startGameNormal, startGameSelected, startGameDisabled, this.onStartGame, this);
        startGame.scale = 1.5;

        var endGameNormal = new cc.Sprite(res.end_png, cc.rect(0, 0, 126, 33));
        var endGameSelected = new cc.Sprite(res.end_png, cc.rect(0, 33, 126, 33));
        var endGameDisabled = new cc.Sprite(res.end_png, cc.rect(0, 33 * 2, 126, 33));

        var endGame = new cc.MenuItemSprite(endGameNormal, endGameSelected, endGameDisabled, this.onEndGame, this);
        endGame.scale = 1.5;

        var menu = new cc.Menu(startGame, endGame);
        menu.alignItemsVerticallyWithPadding(10);
        this.addChild(menu, 1, 2);
        menu.x = winSize.width / 2;
        menu.y = winSize.height / 2 - 100;

        if (cc.sys.capabilities.hasOwnProperty('keyboard'))
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased:function (key,event) {
                    event.getCurrentTarget().onEndGame();
                }
            }, this);

        return true;
    },
    onStartGame:function (pSender) {
        cc.LoaderScene.preload(g_game, function () {
            cc.director.runScene(new cc.TransitionFade(1.2, new GameScene()));
        }, this);
    },
    onEndGame:function (pSender) {
        cc.director.end();
    }
});

var MainMenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainMenuLayer();
        this.addChild(layer);
    }
});
