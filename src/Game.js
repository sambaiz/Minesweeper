var GameLayer = cc.Layer.extend({
    _panels: [],
    _panel_size: cc.p(42, 42),
    _panels_width: 5,
    _panels_height: 5,
    _bomb_num: 5,
    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        this.initPanel()

        if ('mouse' in cc.sys.capabilities){
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseUp: function(event){
                    if(event.getButton() == cc.EventMouse.BUTTON_LEFT)
                        console.log(String(event.getLocationX()) + ", " + String(event.getLocationY()));
                        event.getCurrentTarget().openPanel(event);
                        //event.getCurrentTarget().processEvent(event);
                }
            }, this);
        }

        if (cc.sys.capabilities.hasOwnProperty('touches')){
            cc.eventManager.addListener({
                prevTouchId: -1,
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchesEnded:function (touches, event) {
                    var touch = touches[0];
                    console.log(touch.getID());
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
    initPanel: function () {
        var winSize = cc.director.getWinSize();
        var bomb = []
        for (var i=0; i < this._bomb_num; i++){
            var bp = Math.floor(Math.random() * (this._panels_width * this._panels_height));
            if(bomb.indexOf(bp) >= 0)
                continue;
            bomb.push(bp);
        }
        console.log(bomb);
        this._panels = []
        var zero_line = []
        for(var i=0; i<this._panels_width; i++){
            zero_line.push(0);
        }
        console.log(zero_line);
        for(var i=0; i<this._panels_height; i++){
            this._panels.push([].concat(zero_line));
        }
        console.log(this._panels);
        console.log("-----------");
        for(var b of bomb){
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
                                this._panels[line + i][row + j] = -1;
                            else
                                if(this._panels[line + i][row + j] != -1)
                                    this._panels[line + i][row + j] += 1;
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
        var winSize = cc.director.getWinSize();
        var row = Math.floor(event.getLocationX() / 42);
        var line = Math.floor((winSize.height  - event.getLocationY()) / 42);
        if(row < 0 || row >= this._panels_width || 
            line < 0 || line >= this._panels_height)
            return;
        var p = this._panels[line][row];
        if(p != -1)
            var panel = new cc.Sprite(res.panel_png, cc.rect(42 * (p % 3), 42 * (Math.floor(p / 3) + 1), 42, 42));
        else
            var panel = new cc.Sprite(res.panel_png, cc.rect(84, 0, 42, 42));
        panel.attr({
            anchorX: 0,
            anchorY: 1,
            x: this._panel_size.x * row,
            y: winSize.height - (this._panel_size.y * line)
        });
        this.addChild(panel, 10, 1);
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

