var MS = MS || {};

var STATE_PLAYING = 0;
var STATE_GAMEOVER = 1;
var STATE_CLEAR = 2;
var STATE_PAUSE = 3;

var MINE_MODE = 0;
var FLAG_MODE = 1;

var CLOSE = 0;
var OPEN = 1;
var FLAG = 2;

var GameLayer = cc.Layer.extend({
    _panels: [],
    _bombs: [],
    _panel_size: cc.p(42, 42),
    _panels_width: 5,
    _panels_height: 5,
    _bomb_num: 5,
    _state: null,
    _mode: null,
    _dialog: null,
    _yes_no: null,
    _is_set_bomb: false,
    _open_count: null,
    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        this.initPanel();

        this.addChild(new cc.LayerColor(cc.color(255,255,0,255), cc.winSize.width, cc.winSize.height),0);

        this._state = STATE_PLAYING;
        this._mode = MINE_MODE;
        this._is_set_bomb = false;
        this._open_count = this._panels_width * this._panels_height;

        this.addChild(this.v_control());

        if ('mouse' in cc.sys.capabilities){
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseUp: function(event){
                    if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
                        event.getCurrentTarget().point(event);
                    }else if(event.getButton() == cc.EventMouse.BUTTON_RIGHT){
                        event.getCurrentTarget().point(event, true);
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
                }
            }, this);
        }

        return true;
    },
    point: function(event, is_force_flag){
        if(typeof is_force_flag === 'undefined') is_force_flag = false;
        if(this._state != STATE_PLAYING)
            return;
        var row = Math.floor(event.getLocationX() / this._panel_size.x);
        var line = Math.floor((cc.winSize.height  - event.getLocationY()) / this._panel_size.y);
        if(row < 0 || row >= this._panels_width || 
            line < 0 || line >= this._panels_height)
            return;
        if(this._mode == MINE_MODE && !is_force_flag)
            this.openPanel(row, line);
        else
            this.putFlag(row, line);
    },
    initPanel: function () {
        this._panels = this.default_panel(this._panels_width, this._panels_height);

        var j = 0;
        for(var line of this._panels){
            var i = 0;
            for(var p of line){
                var panel = new cc.Sprite(res.panel_png, cc.rect(0, 0, 42, 42));
                panel.attr({
                    anchorX: 0,
                    anchorY: 1,
                    x: this._panel_size.x * i,
                    y: cc.winSize.height - (this._panel_size.y * j)
                });
                this.addChild(panel, 10, 1);
                i += 1;
            }
            j += 1;
        }
    },
    randBomb: function (bomb_num, first_panel) {
        var bombs = []
        for (var i=0; i < bomb_num; i++){
            if(bombs.length == this._panels_width * this._panels_height - 1)
                break
            var bp = Math.floor(Math.random() * (this._panels_width * this._panels_height));
            if(bombs.indexOf(bp) >= 0 || bp == first_panel){
                i--;
                continue;
            }
            bombs.push(bp);
        }
        return bombs;
    },
    default_panel: function (row_num, line_num) {
        var def_panel = [];
        for(var i=0; i<line_num; i++){
            def_panel.push(this.default_line(row_num));
        }
        return def_panel;
    },
    default_line: function (row_num) {
        var def_line = [];
        for(var i=0; i<row_num; i++)
            def_line.push([0,CLOSE]);
        return def_line;
    },
    setBomb: function () {
        for(var b of this._bombs){
            var line = Math.floor(b / this._panels_width);
            var row = b % this._panels_width;
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
    },
    openPanel: function (row, line) {
        if(!this._is_set_bomb){
            this._bombs = this.randBomb(this._bomb_num, line * this._panels_width + row);
            this.setBomb();
            this._is_set_bomb = true;
        }
        
        var p = this._panels[line][row];
        if(p[1] == OPEN || p[1] == FLAG)
            return;
        p[1] = OPEN;

        if(p[0] != -1){
            var panel = new cc.Sprite(res.panel_png, cc.rect(42 * (p[0] % 3), 42 * (Math.floor(p[0] / 3) + 1), 42, 42));
        }else{
            var panel = new cc.Sprite(res.panel_png, cc.rect(84, 0, 42, 42));
        }
        panel.attr({
            anchorX: 0,
            anchorY: 1,
            x: this._panel_size.x * row,
            y: cc.winSize.height - (this._panel_size.y * line)
        });
        this.addChild(panel, 10, 1);

        if(p[0] == -1){
            this._state = STATE_GAMEOVER;
            MS.CLEAR = false;
            this.onGameOver();
        }else{
            this._open_count--;
            this.clearCheck();
        }
    },
    putFlag: function (row, line) {
        if(!this._is_set_bomb)
            return;

        var p = this._panels[line][row];
        if(p[1] == CLOSE){
            p[1] = FLAG;
            var panel = new cc.Sprite(res.panel_png, cc.rect(42, 0, 42, 42));
            panel.attr({
                anchorX: 0,
                anchorY: 1,
                x: this._panel_size.x * row,
                y: cc.winSize.height - (this._panel_size.y * line)
            });
        }else if(p[1] == FLAG){
            p[1] = CLOSE;
            var panel = new cc.Sprite(res.panel_png, cc.rect(0, 0, 42, 42));
            panel.attr({
                anchorX: 0,
                anchorY: 1,
                x: this._panel_size.x * row,
                y: cc.winSize.height - (this._panel_size.y * line)
            });
        }else{
            return;
        }
        this.addChild(panel, 10, 1);
    },
    onModeChange:function(){
        if(this._mode == MINE_MODE)
            this._mode = FLAG_MODE;
        else
            this._mode = MINE_MODE;
    },
    clearCheck:function(){
        if(this._open_count - this._bomb_num == 0){
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
        this._dialog = this.v_dialog_bg();
        this.addChild(this._dialog, 1, 1);

        this._yes_no = this.v_dialog_yes_no()
        this.addChild(this._yes_no, 1, 2);
    },
    closeDialog:function () {
        this.removeChild(this._yes_no);
        this.removeChild(this._dialog);
        this._state = STATE_PLAYING;
    },
    onBackTop:function () {
        cc.LoaderScene.preload(g_main_menu, function () {
            cc.director.runScene(new MainMenuScene());
        }, this);
    },
    v_control:function () {
        var control = new cc.Menu(this.v_mode(), this.v_pause());
        control.setPosition(100,100);
        control.alignItemsHorizontally();
        return control;
    },
    v_mode:function () {
        var mode_toggle = new cc.MenuItemToggle(
            this.v_mode_mine(),
            this.v_mode_flag());
        mode_toggle.setCallback(this.onModeChange, this);
        return mode_toggle
    },
    v_mode_mine:function () {
        var mineNormal = new cc.Sprite(res.panel_png, cc.rect(0, 168, 42, 42));
        var mineSelected = new cc.Sprite(res.panel_png, cc.rect(42, 168, 42, 42));
        var mineDisabled = new cc.Sprite(res.panel_png, cc.rect(0, 168, 42, 42));

        return new cc.MenuItemSprite(mineNormal,mineSelected,mineDisabled, null,this);
    },
    v_mode_flag:function () {
        var flagNormal = new cc.Sprite(res.panel_png, cc.rect(42, 168, 42, 42));
        var flagSelected = new cc.Sprite(res.panel_png, cc.rect(0, 168, 42, 42));
        var flagDisabled = new cc.Sprite(res.panel_png, cc.rect(0, 168, 42, 42));

        return new cc.MenuItemSprite(flagNormal,flagSelected,flagDisabled, null,this);
    },
    v_pause:function () {
        var pauseNormal = new cc.Sprite(res.panel_png, cc.rect(84, 168, 42, 42));
        var pauseSelected = new cc.Sprite(res.panel_png, cc.rect(84, 168, 42, 42));
        var pauseDisabled = new cc.Sprite(res.panel_png, cc.rect(84, 168, 42, 42));

         return new cc.MenuItemSprite(pauseNormal,pauseSelected, pauseDisabled, this.openDialog,this);
    },
    v_dialog_bg:function () {
        dialog = new cc.Sprite(res.dialog_png);
        dialog.attr({
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2,
            scale: 1.5
        });
        return dialog;
    },
    v_dialog_yes_no:function () {
        var yes_no = new cc.Menu(this.v_dialog_yes(), this.v_dialog_no());
        yes_no.alignItemsVerticallyWithPadding(10);
        yes_no.x = cc.winSize.width / 2;
        yes_no.y = cc.winSize.height / 2 - 20;
        return yes_no;
    },
    v_dialog_yes:function () {
        var yesNormal = new cc.Sprite(res.yes_no_png, cc.rect(0, 0, 65, 20));
        var yesSelected = new cc.Sprite(res.yes_no_png, cc.rect(0, 20, 65, 20));
        var yesDisabled = new cc.Sprite(res.yes_no_png, cc.rect(0, 40, 65, 20));

        var yes = new cc.MenuItemSprite(yesNormal, yesSelected, yesDisabled, this.onBackTop, this);
        yes.scale = 1.5;
        return yes;
    },
    v_dialog_no:function () {
        var noNormal = new cc.Sprite(res.yes_no_png, cc.rect(65, 0, 65, 20));
        var noSelected = new cc.Sprite(res.yes_no_png, cc.rect(65, 20, 65, 20));
        var noDisabled = new cc.Sprite(res.yes_no_png, cc.rect(65, 40, 65, 20));


        var no = new cc.MenuItemSprite(noNormal, noSelected, noDisabled, this.closeDialog, this);
        no.scale = 1.5;
        return no;
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

