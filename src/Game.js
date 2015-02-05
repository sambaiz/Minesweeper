STATE_PLAYING = 0;
STATE_GAMEOVER = 1;
STATE_CLEAR = 2;
STATE_PAUSE = 3;

MINE_MODE = 0;
FLAG_MODE = 1;

CLOSE = 0;
OPEN = 1;
FLAG = 2;

var MS = MS || {};

var GameLayer = cc.Layer.extend({
    _panels: [],
    _bombs: [],
    _miss_flags: [],
    _panel_size: cc.p(42, 42),
    _panels_width: 5,
    _panels_height: 5,
    _bomb_num: 5,
    _state: STATE_PLAYING,
    _mode: null,
    _dialog: null,
    _yes_no: null,
    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        this.initPanel()

        var winSize = cc.director.getWinSize();
        this.addChild(new cc.LayerColor(cc.color(255,255,0,255), winSize.width, winSize.height),0)

        this._state = STATE_PLAYING;
        this._mode = MINE_MODE;

        console.log(this);
        
        var panel = new cc.Sprite(res.panel_png, cc.rect(0, 168, 42, 42));
        var panel2 = new cc.Sprite(res.panel_png, cc.rect(42, 168, 42, 42));
        var panel3 = new cc.Sprite(res.panel_png, cc.rect(84, 168, 42, 42));
        var panel4 = new cc.Sprite(res.panel_png, cc.rect(0, 168, 42, 42));
        var panel5 = new cc.Sprite(res.panel_png, cc.rect(42, 168, 42, 42));
        var panel6 = new cc.Sprite(res.panel_png, cc.rect(84, 168, 42, 42));

        var menuItemSprite = new cc.MenuItemSprite(panel,panel2,panel3, null,this);
        var menuItemSprite2 = new cc.MenuItemSprite(panel5,panel4,panel6, null,this);
        
        var item2 = new cc.MenuItemToggle(
            menuItemSprite,
            menuItemSprite2);
        item2.setCallback(this.onModeChange, this);

        var panel7 = new cc.Sprite(res.panel_png, cc.rect(84, 168, 42, 42));
        var panel8 = new cc.Sprite(res.panel_png, cc.rect(84, 168, 42, 42));
        var panel9 = new cc.Sprite(res.panel_png, cc.rect(84, 168, 42, 42));

        var menuItemSprite3 = new cc.MenuItemSprite(panel7,panel8,panel9, this.openDialog,this);

        var menu = new cc.Menu(item2, menuItemSprite3);
        menu.setPosition(100,100);
        menu.alignItemsHorizontally()
        this.addChild(menu);

        if ('mouse' in cc.sys.capabilities){
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseUp: function(event){
                    if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
                        event.getCurrentTarget().point(event);
                    }else if(event.getButton() == cc.EventMouse.BUTTON_RIGHT){
                        if(event.getCurrentTarget()._state != STATE_PLAYING)
                            return;
                        event.getCurrentTarget().setFlag(event);
                    }
                }
            }, this);
        }

        if (cc.sys.capabilities.hasOwnProperty('keyboard'))
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased:function (key,event) {
                    if(key == cc.KEY["escape"]){ //Androidの戻るボタン
                        if(event.getCurrentTarget()._state == STATE_PLAYING){
                            event.getCurrentTarget().openDialog();
                        }else if(event.getCurrentTarget()._state == STATE_PAUSE){
                            event.getCurrentTarget().closeDialog();
                        }
                    }
                }
            }, this);

        if (cc.sys.capabilities.hasOwnProperty('touches')){
            cc.eventManager.addListener({
                prevTouchId: -1,
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchesEnded:function (touches, event) {
                    event.getCurrentTarget().point(touches[0]);

                    /*
                    if (this.prevTouchId != touch.getID())
                        this.prevTouchId = touch.getID();
                    else event.getCurrentTarget().processEvent(touches[0]);
                    */
                }
            }, this);
        }

        return true;
    },
    point: function(event){
        if(this._state != STATE_PLAYING)
            return;
        if(this._mode == MINE_MODE)
            this.openPanel(event);
        else
            this.setFlag(event);
    },
    initPanel: function () {
        var winSize = cc.winSize;
        this._bombs = []
        for (var i=0; i < this._bomb_num; i++){
            var bp = Math.floor(Math.random() * (this._panels_width * this._panels_height));
            if(this._bombs.indexOf(bp) >= 0){
                i--;
                continue;
            }
            this._bombs.push(bp);
        }
        console.log(this._bombs);
        this._panels = []
        var zero_line = []
        for(var i=0; i<this._panels_width; i++){
            zero_line.push([0, CLOSE]);
        }
        console.log(zero_line);
        for(var i=0; i<this._panels_height; i++){
            //this._panels.push($.extend(true,[],zero_line)); jquery入れるとAndroidで動かない?
            this._panels.push([[0,0],[0,0],[0,0],[0,0],[0,0]]);
        }
        console.log(this._panels);
        console.log("-----------");
        for(var b of this._bombs){
            var line = Math.floor(b / this._panels_width);
            var row = b % this._panels_width;
            console.log(line);
            console.log(row);
            console.log(this._panels[line][row])
            for(var i=-1; i <= 1; i++)
                for(var j=-1; j <= 1; j++)
                    if(line + i >= 0 &&
                        row + j >= 0 &&
                        line + i < this._panels.length &&
                        row + j < this._panels[line + i].length){
                            if(i==0 && j==0)
                                this._panels[line + i][row + j][0] = -1; //bomb
                            else
                                if(this._panels[line + i][row + j][0] != -1)
                                    this._panels[line + i][row + j][0] += 1;
                        }
                            
        }

        console.log(this._panels)

        var j = 0;
        for(var line of this._panels){
            var i = 0;
            for(var p of line){
                var panel = new cc.Sprite(res.panel_png, cc.rect(0, 0, 42, 42));
                panel.attr({
                    anchorX: 0,
                    anchorY: 1,
                    x: this._panel_size.x * i,
                    y: winSize.height - (this._panel_size.y * j)
                });
                this.addChild(panel, 10, 1);
                i += 1;
            }
            j += 1;
        }

    },

    openPanel: function (event) {
        var winSize = cc.winSize;
        var row = Math.floor(event.getLocationX() / 42);
        var line = Math.floor((winSize.height  - event.getLocationY()) / 42);
        if(row < 0 || row >= this._panels_width || 
            line < 0 || line >= this._panels_height)
            return;
        var p = this._panels[line][row];
        console.log(p)
        if(p[1] == OPEN)
            return;
        p[1] = OPEN;
        if(p[0] != -1)
            var panel = new cc.Sprite(res.panel_png, cc.rect(42 * (p[0] % 3), 42 * (Math.floor(p[0] / 3) + 1), 42, 42));
        else
            var panel = new cc.Sprite(res.panel_png, cc.rect(84, 0, 42, 42));
        panel.attr({
            anchorX: 0,
            anchorY: 1,
            x: this._panel_size.x * row,
            y: winSize.height - (this._panel_size.y * line)
        });
        this.addChild(panel, 10, 1);
        if(p[0] == -1){
            console.log("GAMEOVER!");
            this._state = STATE_GAMEOVER;
            MS.CLEAR = false;
            this.onGameOver();
        }

    },

    setFlag: function (event) {
        var winSize = cc.winSize;
        var row = Math.floor(event.getLocationX() / 42);
        var line = Math.floor((winSize.height  - event.getLocationY()) / 42);
        if(row < 0 || row >= this._panels_width || 
            line < 0 || line >= this._panels_height)
            return;
        var p = this._panels[line][row];
        if(p[1] == CLOSE){
            p[1] = FLAG;
            var panel = new cc.Sprite(res.panel_png, cc.rect(42, 0, 42, 42));
            panel.attr({
                anchorX: 0,
                anchorY: 1,
                x: this._panel_size.x * row,
                y: winSize.height - (this._panel_size.y * line)
            });
            if(this._bombs.indexOf(this._panels_width * line + row) >= 0)
                this._bombs.splice(this._bombs.indexOf(this._panels_width * line + row), 1);
            else
                this._miss_flags.push(this._panels_width * line + row);
        }else if(p[1] == FLAG){
            p[1] = CLOSE;
            var panel = new cc.Sprite(res.panel_png, cc.rect(0, 0, 42, 42));
            panel.attr({
                anchorX: 0,
                anchorY: 1,
                x: this._panel_size.x * row,
                y: winSize.height - (this._panel_size.y * line)
            });
            if(p[0] == -1)
                this._bombs.push(this._panels_width * line + row);
            else
                if(this._miss_flags.indexOf(this._panels_width * line + row) >= 0)
                    this._miss_flags.splice(this._miss_flags.indexOf(this._panels_width * line + row), 1);
        }else{
            return;
        }
        this.addChild(panel, 10, 1);
        this.clearCheck();
    },
    onModeChange:function(){
        if(this._mode == MINE_MODE)
            this._mode = FLAG_MODE;
        else
            this._mode = MINE_MODE;
    },
    clearCheck:function(){
        console.log("bombs:" + this._bombs + " miss_flags:" + this._miss_flags)
        if(this._bombs.length == 0 && this._miss_flags == 0){
            console.log("CLEAR!!");
            this._state = STATE_CLEAR;
            MS.CLEAR = true;
            this.onGameOver();
        }
    },
    onGameOver:function () {
        var scene = new cc.Scene();
        scene.addChild(new GameOver());
        cc.director.runScene(new cc.TransitionFade(1.2, scene));
    },
    openDialog:function () {
        if(this._state == STATE_PAUSE)
            return
        this._state = STATE_PAUSE;
        this._dialog = new cc.Sprite(res.dialog_png);
        this._dialog.attr({
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2,
            scale: 1.5
        });
        this.addChild(this._dialog, 1, 1);

        var yesNormal = new cc.Sprite(res.yes_no_png, cc.rect(0, 0, 65, 20));
        var yesSelected = new cc.Sprite(res.yes_no_png, cc.rect(0, 20, 65, 20));
        var yesDisabled = new cc.Sprite(res.yes_no_png, cc.rect(0, 40, 65, 20));

        var yes = new cc.MenuItemSprite(yesNormal, yesSelected, yesDisabled, this.backTitle, this);
        yes.scale = 1.5;

        var noNormal = new cc.Sprite(res.yes_no_png, cc.rect(65, 0, 65, 20));
        var noSelected = new cc.Sprite(res.yes_no_png, cc.rect(65, 20, 65, 20));
        var noDisabled = new cc.Sprite(res.yes_no_png, cc.rect(65, 40, 65, 20));

        var no = new cc.MenuItemSprite(noNormal, noSelected, noDisabled, this.closeDialog, this);
        no.scale = 1.5;

        this._yes_no = new cc.Menu(yes, no);
        this._yes_no.alignItemsVerticallyWithPadding(10);
        this.addChild(this._yes_no, 1, 2);
        this._yes_no.x = cc.winSize.width / 2;
        this._yes_no.y = cc.winSize.height / 2 - 20;
    },
    closeDialog:function () {
        this.removeChild(this._yes_no);
        this.removeChild(this._dialog);
        this._state = STATE_PLAYING;
    },
    backTitle:function () {
        cc.LoaderScene.preload(g_main_menu, function () {
            cc.director.runScene(new MainMenuScene());
        }, this);
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

