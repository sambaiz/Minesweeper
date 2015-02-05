var MainMenuLayer = cc.Layer.extend({

    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {

        this.addChild(this.v_title(), 10, 1);
        this.addChild(this.v_menu(), 1, 2);

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
    },
    v_title:function () {
        var title = new cc.Sprite(res.title_png);
        title.attr({
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2,
            scale: 1.5
        });
        return title;s
    },
    v_start_game:function () {
        var startGameNormal = new cc.Sprite(res.start_button_png, cc.rect(0, 0, 126, 33));
        var startGameSelected = new cc.Sprite(res.start_button_png, cc.rect(0, 33, 126, 33));
        var startGameDisabled = new cc.Sprite(res.start_button_png, cc.rect(0, 33 * 2, 126, 33));

        var startGame = new cc.MenuItemSprite(startGameNormal, startGameSelected, startGameDisabled, this.onStartGame, this);
        startGame.scale = 1.5;
        return startGame;
    },
    v_end_game:function () {
        var endGameNormal = new cc.Sprite(res.end_png, cc.rect(0, 0, 126, 33));
        var endGameSelected = new cc.Sprite(res.end_png, cc.rect(0, 33, 126, 33));
        var endGameDisabled = new cc.Sprite(res.end_png, cc.rect(0, 33 * 2, 126, 33));

        var endGame = new cc.MenuItemSprite(endGameNormal, endGameSelected, endGameDisabled, this.onEndGame, this);
        endGame.scale = 1.5;
        return endGame;
    },
    v_menu:function () {
        var menu = new cc.Menu(this.v_start_game(), this.v_end_game());
        menu.alignItemsVerticallyWithPadding(10);
        menu.x = cc.winSize.width / 2;
        menu.y = cc.winSize.height / 2 - 100;
        return menu;
    }

});

var MainMenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainMenuLayer();
        this.addChild(layer);
    }
});
