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

        var menu = new cc.Menu(playAgain);
        this.addChild(menu, 1, 2);
        menu.x = cc.winSize.width / 2;
        menu.y = cc.winSize.height / 2 - 80;

        return true;
    },
    onStartGame:function (pSender) {
        cc.LoaderScene.preload(g_game, function () {
            cc.director.runScene(new cc.TransitionFade(1.2, new GameScene()));
        }, this);
    }
});

GameOver.scene = function () {
    var scene = new cc.Scene();
    var layer = new GameOver();
    scene.addChild(layer);
    return scene;
};
