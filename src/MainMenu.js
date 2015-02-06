MAX_SIZE = 15
MIN_SIZE = 4

var MainMenuLayer = cc.Layer.extend({
    _dialog: null,
    _lb_bomb_num: null,
    _lb_size: null,
    _size_up: null,
    _size_down: null,
    _bomb_up: null,
    _bomb_down: null,
    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        this._dialog = [];

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
        return title
    },
    v_start_game:function () {
        var startGameNormal = new cc.Sprite(res.start_button_png, cc.rect(0, 0, 126, 33));
        var startGameSelected = new cc.Sprite(res.start_button_png, cc.rect(0, 33, 126, 33));
        var startGameDisabled = new cc.Sprite(res.start_button_png, cc.rect(0, 33 * 2, 126, 33));

        var startGame = new cc.MenuItemSprite(startGameNormal, startGameSelected, startGameDisabled, this.open_settings, this);
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
    },
    open_settings:function () {
        if(this._dialog.length != 0)
            return;
        MS.SIZE = 5
        MS.BOMB_NUM = 5
        this.addChild(this.v_settings_bg(), 10, 1);
        this.addChild(this.v_size_up(cc.winSize.width / 2 + 70, cc.winSize.height / 2 + 20), 10, 2);
        this.addChild(this.v_size_down(cc.winSize.width / 2 - 10, cc.winSize.height / 2 + 20), 10, 2);
        this.addChild(this.v_bomb_up(cc.winSize.width / 2 + 70, cc.winSize.height / 2 - 15), 10, 2);
        this.addChild(this.v_bomb_down(cc.winSize.width / 2 - 10, cc.winSize.height / 2 - 15), 10, 2);
        this.addChild(this.v_decide(cc.winSize.width / 2, cc.winSize.height / 2 - 55), 10, 2);
        
        var mapsizea = new cc.LabelTTF("広さ", "Arial", 14);
        mapsizea.x = cc.winSize.width / 2 - 60;
        mapsizea.y = cc.winSize.height / 2 + 20;
        this.addChild(mapsizea, 10, 3);
        this._dialog.push(mapsizea);

        var bombnuma = new cc.LabelTTF("地雷個数", "Arial", 14);
        bombnuma.x = cc.winSize.width / 2 - 60;
        bombnuma.y = cc.winSize.height / 2 - 15;
        // add the label as a child to this layer
        this.addChild(bombnuma, 10, 3);
        this._dialog.push(bombnuma);

        this.addChild(this.v_bomb_num_value(), 10, 3);
        this.addChild(this.v_size_value(), 10, 3);
    },
    v_settings_bg:function () {
        settings = new cc.Sprite(res.settings_png);
        settings.attr({
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2,
            scale: 1.5
        });
        this._dialog.push(settings);
        return settings;
    },
    v_bomb_up:function (x, y) {
        var upNormal = new cc.Sprite(res.up_down_png, cc.rect(0, 0, 20, 20));
        var upSelected = new cc.Sprite(res.up_down_png, cc.rect(0, 20, 20, 20));
        var upDisabled = new cc.Sprite(res.up_down_png, cc.rect(0, 20 * 2, 20, 20));

        var up = new cc.MenuItemSprite(upNormal, upSelected, upDisabled, this.bombnum_up, this);
        up.scale = 1.5;
        var upm = new cc.Menu(up);
        upm.x = x;
        upm.y = y;
        this._dialog.push(upm);
        this._bomb_up = up;
        return upm;
    },
    v_bomb_down:function (x, y) {
        var downNormal = new cc.Sprite(res.up_down_png, cc.rect(20, 0, 20, 20));
        var downSelected = new cc.Sprite(res.up_down_png, cc.rect(20, 20, 20, 20));
        var downDisabled = new cc.Sprite(res.up_down_png, cc.rect(20, 20 * 2, 20, 20));

        var down = new cc.MenuItemSprite(downNormal, downSelected, downDisabled, this.bombnum_down, this);
        down.scale = 1.5;
        var downm = new cc.Menu(down);
        downm.x = x;
        downm.y = y;
        this._dialog.push(downm);
        this._bomb_down = down;
        return downm;
    },
    v_size_up:function (x, y) {
        var upNormal = new cc.Sprite(res.up_down_png, cc.rect(0, 0, 20, 20));
        var upSelected = new cc.Sprite(res.up_down_png, cc.rect(0, 20, 20, 20));
        var upDisabled = new cc.Sprite(res.up_down_png, cc.rect(0, 20 * 2, 20, 20));

        var up = new cc.MenuItemSprite(upNormal, upSelected, upDisabled, this.size_up, this);
        up.scale = 1.5;
        var upm = new cc.Menu(up);
        upm.x = x;
        upm.y = y;
        this._dialog.push(upm);
        this._size_up = up;
        return upm;
    },
    v_size_down:function (x, y) {
        var downNormal = new cc.Sprite(res.up_down_png, cc.rect(20, 0, 20, 20));
        var downSelected = new cc.Sprite(res.up_down_png, cc.rect(20, 20, 20, 20));
        var downDisabled = new cc.Sprite(res.up_down_png, cc.rect(20, 20 * 2, 20, 20));

        var down = new cc.MenuItemSprite(downNormal, downSelected, downDisabled, this.size_down, this);
        down.scale = 1.5;
        var downm = new cc.Menu(down);
        downm.x = x;
        downm.y = y;
        this._dialog.push(downm);
        this._size_down = down;
        return downm;
    },
    v_decide:function (x, y) {
        var decideNormal = new cc.Sprite(res.decide_png, cc.rect(0, 0, 65, 20));
        var decideSelected = new cc.Sprite(res.decide_png, cc.rect(0, 20, 65, 20));
        var decideDisabled = new cc.Sprite(res.decide_png, cc.rect(0, 20 * 2, 65, 20));

        var decide = new cc.MenuItemSprite(decideNormal, decideSelected, decideDisabled, this.onStartGame, this);
        decide.scale = 1.5;
        var decidem = new cc.Menu(decide);
        decidem.x = x;
        decidem.y = y;
        this._dialog.push(decidem);
        return decidem;
    },
    v_bomb_num_value:function () {
        var bombnum = new cc.LabelTTF(MS.BOMB_NUM, "Arial", 14);
        bombnum.x = cc.winSize.width / 2 + 30;
        bombnum.y = cc.winSize.height / 2 - 15;
        this._lb_bomb_num = bombnum;
        return bombnum;
    },
    v_size_value:function () {
        var size = new cc.LabelTTF(MS.SIZE, "Arial", 14);
        size.x = cc.winSize.width / 2 + 30;
        size.y = cc.winSize.height / 2 + 20;
        this._lb_size = size;
        return size;
    },
    closeSettings:function () {
        for(n in this._dialog){
            this.removeChild(n);
        }
        this.removeChild(this._lb_size);
        this.removeChild(this._lb_bomb_num);
        this._dialog = [];
    },
    bombnum_up:function () {
        MS.BOMB_NUM++;
        this.removeChild(this._lb_bomb_num);
        this.addChild(this.v_bomb_num_value(),10,3);
        this.button_check();
    },
    bombnum_down:function () {
        MS.BOMB_NUM--;
        this.removeChild(this._lb_bomb_num);
        this.addChild(this.v_bomb_num_value(),10,3);
        this.button_check();
    },
    size_up:function () {
        MS.SIZE++;
        this.removeChild(this._lb_size);
        this.addChild(this.v_size_value(),10,3);
        this.button_check();

    },
    size_down:function () {
        MS.SIZE--;
        this.removeChild(this._lb_size);
        this.addChild(this.v_size_value(),10,3);
        this.button_check();
    },
    button_check:function () {
        if(MS.BOMB_NUM >= MS.SIZE * 5 - 1)
            this._bomb_up.setEnabled(false);
        else
            this._bomb_up.setEnabled(true);

        if(MS.BOMB_NUM <= 1)
            this._bomb_down.setEnabled(false);
        else
            this._bomb_down.setEnabled(true);

        if(MS.SIZE >= MAX_SIZE)
            this._size_up.setEnabled(false);
        else
            this._size_up.setEnabled(true);

        if(MS.SIZE <= MIN_SIZE || MS.BOMB_NUM >= (MS.SIZE - 1) * 5 - 1)
            this._size_down.setEnabled(false);
        else
            this._size_down.setEnabled(true);
    }
});

var MainMenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainMenuLayer();
        this.addChild(layer);
    }
});
