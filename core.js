//reQ core
; (function () {
    var _toString = function () { return Object.prototype.toString; }
    function isObject(obj) {
        return typeof obj === 'object';
    }
    function isNumber(str) {
        return _toString.call(str) === '[object Number]';
    }
    function isArray(arr) {
        if (isObject(arr)) {
            return _toString.call(arr) === '[object Array]';
        }
        return false;
    }
    var reQ = new function () {
        var self = this;
        this.__doid = 0;
        this.inherit = function (child, parent) {
            child.prototype = Object.create(parent.prototype);
            child.prototype.constructor = child;
            child.prototype._super = parent.prototype;
        }
        this.class = function (namepath, params) {
            var contrs = params.constructor;
            var _parent = params.extends;
            var ns, cls, name;
            cls = function () {
                _parent && _parent.apply(this, arguments);
                contrs && contrs.apply(this, arguments);
            }
            _parent && self.inherit(cls, _parent);
            for (var k in params) {
                if (k == 'constructor' || k == 'extends') continue;
                cls.prototype[k] = params[k];
            }
            if (namepath) {
                ns = namepath.split('.');
                name = ns[ns.length - 1];
                for (var i = 0, len = ns.length; i < len; i++) {
                    if (ns[i] !== name) {
                        ns[i] = self[ns[i]]
                        if (!ns[i]) {
                            ns[i] = {};
                        }
                    }
                }
                self[name] = cls;
                cls.prototype.class = namepath;
            }
            return cls;
        }
        var modules = [];
        this.install = function (name, module) {
            modules.push({ name: name, module: module });
        }
        this.getModules = function () {
            return modules;
        }
    }
    reQ.isObject = isObject;
    reQ.isNumber = isNumber;
    reQ.isArray = isArray;


    window.reQ = reQ;

    //reQ.extend
    const baseClone = (targets) => {
        let res = {};
        if (isArray(targets)) {
            res = [];
            for (var i = 0, len = targets.length; i < len; i++) {
                var item = targets[i];
                res.push(item);
            }
        } else if (isObject(targets)) {
            for (var i in targets) {
                if (targets.hasOwnProperty(i)) {
                    var item = targets[i];
                    res[i] = item;
                }
            }
        }
        return res;
    }
    const deepClone = (targets) => {
        let res = {};
        if (isArray(targets)) {
            res = [];
            for (var i = 0, len = targets.length; i < len; i++) {
                var item = targets[i];
                if (isObject(item)) {
                    res.push(deepClone(item))
                } else {
                    res.push(item);
                }
            }
        } else if (isObject(targets)) {
            for (var i in targets) {
                if (targets.hasOwnProperty(i)) {
                    var item = targets[i];
                    if (isObject(item)) {
                        res[i] = deepClone(item);
                    } else {
                        res[i] = item;
                    }
                }
            }
        }
        return res;
    }
    function deepExtend(target, source) {
        if (isArray(source)) {
            target = target || [];
            for (var i = 0, len = source.length; i < len; i++) {
                var item = source[i];
                if (typeof target[i] === 'undefined') {
                    if (isArray(item)) {
                        target[i] = [];
                    } else {
                        target[i] = {};
                    }
                }
                if (isObject(item)) {
                    deepExtend(target[i], source[i]);
                } else {
                    target[i] = source[i];
                }
            }
        }
        else if (isObject(source)) {
            target = target || {};
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    var item = source[i];
                    if (typeof target[i] === 'undefined') {
                        if (isArray(item)) {
                            target[i] = [];
                        } else {
                            target[i] = {};
                        }
                    }
                    if (isObject(item)) {
                        deepExtend(target[i], source[i]);
                    } else {
                        target[i] = source[i];
                    }
                }
            }
        }
    }
    function baseExtend(target, source) {
        if (isArray(source)) {
            target = target || [];
            for (var i = 0, len = source.length; i < len; i++) {
                var item = source[i];
                target[i] = item;
            }
        }
        else if (isObject(source)) {
            target = target || {};
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    var item = source[i];
                    target[i] = item;
                }
            }
        }
    }
    function _extend() {
        var caller = arguments.callee.caller;
        var args = [].slice.call(arguments);
        var firstArg = args[0], res = {};
        if (firstArg && firstArg === true) {
            for (var len = args.length - 1, i = len; i >= 1; i--) {
                var obj = args[i];
                if (isArray(obj)) {
                    res = [];
                    for (var j = 0, jlen = obj.length; j < jlen; j++) {
                        var jitem = obj[j];
                        deepExtend(res, obj);
                    }
                } else if (isObject(obj)) {
                    for (var j in obj) {
                        if (obj.hasOwnProperty(j)) {
                            var jitem = obj[j];
                            deepExtend(res, obj);
                        }
                    }
                }
            }
        } else {
            for (var len = args.length - 1, i = len; i >= 1; i--) {
                var obj = args[i];
                if (isArray(obj)) {
                    res = [];
                    for (var j = 0, jlen = obj.length; j < jlen; j++) {
                        var jitem = obj[j];
                        baseExtend(res, obj);
                    }
                } else if (isObject(obj)) {
                    for (var j in obj) {
                        if (obj.hasOwnProperty(j)) {
                            var jitem = obj[j];
                            baseExtend(res, obj);
                        }
                    }
                }
            }
        }
        return res;
    }
    reQ.extend = _extend;
    reQ.ext = baseExtend;

    //obSubscribe
    reQ.class('reQ.obSubscribe', {
        constructor: function () {
            this.listeners = [];
            //[listener,context,isOne]
        },
        on: function (type, listener, context) {
            if (!this.listeners[type]) this.listeners[type] = [];
            this.listeners[type].push([listener, context || this]);
        },
        off: function (type, listener, context) {
            var liss = this.listeners[type];
            var self = this;
            if (liss.length > 0) {
                this.listeners[type] = liss.filter(function (_listener) {
                    return ((context || self === _listener[1]) && ((listener && (_listener[0] == listener ? false : true))) || !listener);
                });
            }
        },
        emit: function () {
            var args = [].slice.apply(arguments);
            var type = args[0];
            var liss = this.listeners[type];
            var params = [];
            for (var j = 1, jlen = args.length; j < jlen; j++) {
                params.push(args[j]);
            }
            if (liss && liss.length > 0) {
                for (var i = 0, len = liss.length; i < len; i++) {
                    var listen = liss[i];
                    var listener = listen[0]
                    var context = listen[1];
                    if (context.events) {
                        if (!context.events.disabled) {
                            listener && listener.apply(context, params);
                        }
                    } else {
                        listener && listener.apply(context, params);
                    }
                }
            }
        },
        emit_called: function () {
            var args = [].slice.apply(arguments);
            var type = args[0];
            var liss = this.listeners[type];
            var params = [];
            for (var j = 1, jlen = args.length; j < jlen; j++) {
                params.push(args[j]);
            }
            if (liss && liss.length > 0) {
                for (var i = 0, len = liss.length; i < len; i++) {
                    var listen = liss[i];
                    var listener = listen[0]
                    var context = listen[1];
                    if (context.events) {
                        if (!context.events.disabled) {
                            listener && listener.call(context, params);
                            context.__called = true;
                        }
                    } else {
                        listener && listener.call(context, params);
                        context.__called = true;
                    }
                }
                this.listeners[type] = liss.filter(function (listener) {
                    return !listener[1].__called;
                });
            }

        },
        emit_pointer: function (type, input, e, xy, xys) {
            var args = [].slice.apply(arguments);
            var type = args[0];
            var liss = this.listeners[type];

            if (liss && liss.length > 0) {
                for (var i = 0, len = liss.length; i < len; i++) {
                    var listen = liss[i];
                    var listener = listen[0]
                    var context = listen[1];
                    if (context.hitTest(xy) && !context.events.disabled && context.getRendered()) {
                        listener && listener.call(context, input, e);
                        // context.__called = true;
                    }
                }
                this.listeners[type] = liss.filter(function (listener) {
                    return !listener[1].__called;
                });
            }

        }
    });

    function InputListener(data) {
        this.eventMap = {};
        reQ.ext(this, data);
    };
    InputListener.prototype = {
        /**
         * 保存事件。类型相同覆盖
         * @param  {String} type 事件名
         * @param  {Object} e 事件对象
         */
        setEvent: function (type, e) {
            this.eventMap[type] = e;
        },
        /**
         * 每帧调用
         */
        clear: function () {
            for (var k in this.eventMap) {
                this.eventMap[k] = null;
            }
            this.eventMap = {};
        },
        clearType: function (type) {
            for (var k in this.eventMap) {
                if (k == type) {
                    this.eventMap[k] = null;
                    delete this.eventMap[type];
                    break;
                }
            }

        },
        start: function (viewshow) {
            this.onInit(viewshow);
        },
        scan: function (viewshow) {
            this.onScan(viewshow);
        }
    };
    reQ.InputListener = InputListener;

    //Events
    function Events(displayobject) {
        this.disabled = false;
        this.obj = displayobject;
        this.onpointdown = function (cbk) {
            this.obj.object._pointerSubscribe.on('pointerdown', cbk, this.obj);
        }
        this.onpointmove = function (cbk) {
            this.obj.object._pointerSubscribe.on('pointermove', cbk, this.obj);
        }
        this.onpointup = function (cbk) {
            this.obj.object._pointerSubscribe.on('pointerup', cbk, this.obj);
        }
        this.onpointcancel = function (cbk) {
            this.obj.object._pointerSubscribe.on('pointercancel', cbk, this.obj);
        }


    }
    reQ.Events = Events;

    //reQ.Point
    reQ.class('reQ.Point', {
        constructor: function (x, y) {
            this.x = x;
            this.y = y;
        }
    });

//    reQ.requestAnimFrame 
//    reQ.cancelAnimFrame 
//    reQ.transitionEvent 
    var requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
    var cancelAnimFrame = (function () {
        return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            function (callback) {
                window.clearTimeout(callback);
            };
    })();
    var transitionEvent = (function () {
        var t,
            el = document.createElement('surface'),
            transitions = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            }

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    })();

    reQ.requestAnimFrame = requestAnimFrame;
    reQ.cancelAnimFrame = cancelAnimFrame;
    reQ.transitionEvent = transitionEvent;



    reQ.class('reQ.World', {
        constructor: World,
        extends: reQ.obSubscribe,
        start: function () {
            var self = this;
            // setInterval(function(){
            console.time('word')
            self.scenesManager.start();
            console.timeEnd('word')
            // },16.77);

        }
    })
    function World(w, h, context) {
        this.scenesManager = new reQ.ViewShow(w, h);
        this.ctx = this.scenesManager.ctx;
        this.canvas = this.scenesManager.canvas;
        this.scenesManager.renderTo(context);
        // this.add = new baseDisplayFactoryProxy(this);
        // this.objects = new baseDisplayFactory(this);
    }



    function baseDisplayFactory(world) {
        this.map = {};
        this.world = world;
    }
    baseDisplayFactory.prototype.register = function (alias, constructor) {
        this.map[alias] = constructor;
        this.world.add[alias] = function (data) {
            return this.createDisplay(alias, constructor);
        }
    }

    reQ.baseDisplayFactory = baseDisplayFactory;

    function baseDisplayFactoryProxy(world) {
        this.world = world;
        this.createDisplay = function (alias, data) {
            data.world = this.world;
            var instance = new this.world.objects.map[type](data);
            // instance.game = this.game;
            this.world.add(instance);
            return instance;
        }
    }


    reQ.baseDisplayFactoryProxy = baseDisplayFactoryProxy;



    var _poniterPrototype = {
        onInit: function (viewshow) {
            this.viewshow = viewshow;
            this.canvas = viewshow.getCanvas();
            this.startPoint = { x: 0, y: 0 };
            this.currentPoint = { x: 0, y: 0 };
            this.p_d = this.pointerdown.bind(this);
            this.p_m = this.pointermove.bind(this);
            this.p_u = this.pointerup.bind(this);


            this.t_s = this.pointertouchstart.bind(this);
            this.t_m = this.pointertouchmove.bind(this);
            this.t_e = this.pointertouchend.bind(this);
            this.t_c = this.pointertouchcancel.bind(this);

            this.bindMouse();
        }
        , bindMouse: function () {
            this.canvas.addEventListener('mousedown', this.p_d, true);
            this.canvas.addEventListener('mousemove', this.p_m, true);
            this.canvas.addEventListener('mouseup', this.p_u, true);

        }
        , bindTouch: function () {
            this.canvas.addEventListener('touchstart', this.t_s, true);
            this.canvas.addEventListener('touchmove', this.t_m, true);
            this.canvas.addEventListener('touchend', this.t_e, true);
            this.canvas.addEventListener('touchcancel', this.t_c, true);
        },

        onScan: function (viewshow) {
            var eventSignal = this.viewshow._pointerSubscribe;
            var input = this.viewshow.input.pointer;
            //console.log(input)
            var isDown = false,
                isUp = false,
                isMove = false,
                e = null;
            if (this.eventMap['down']) {
                isDown = true;
                e = this.eventMap['down'];

            }
            if (this.eventMap['up']) {
                isUp = true;
                e = this.eventMap['up'];
            }
            if (this.eventMap['move']) {
                isMove = true;
                e = this.eventMap['move'];

            }
            if (this.eventMap['tap']) {
                e = this.eventMap['tap'];
            }
            if (this.eventMap['dbltap']) {
                e = this.eventMap['dbltap'];
            }
            if (this.eventMap['enterstage']) {
                e = this.eventMap['enterstage'];
            }
            if (this.eventMap['leavestage']) {
                e = this.eventMap['leavestage'];
            }
            if (this.eventMap['cancel']) {
                e = this.eventMap['cancel'];
            }

            //            input.isDown = isDown;
            //            input.isUp = isUp;
            //            input.isMove = isMove;
            // input.isPressing = this.pressing || false;
            // input.duration = this.pressStartTime==0?0:Date.now() - this.pressStartTime;
            input.e = e;
            input.touches = [];
            input.position = input.position ? input.position : {};

            if (!e) return;
            input.position.x = e.clientX;
            input.position.y = e.clientY;
            if (this.eventMap['down']) {
                // console.log('down',input)
                input.startPoint = this.startPoint = input.position;
                eventSignal.emit_pointer('pointerdown', input, e, input.position, input.touches);
            }
            if (this.eventMap['move']) {
                // console.log('move',input)
                input.currentPoint = this.currentPoint = input.position;
                eventSignal.emit_pointer('pointermove', input, e, input.position, input.touches);
            }
            if (this.eventMap['up']) {
                // console.log('up',input)
                eventSignal.emit_pointer('pointerup', input, e, input.position, input.touches);
            }
        },
        setInput: function () {

        }
        , pointerdown: function (e) {
            this.setEvent('down', e);
            this.scan();
            // this.clear();
        }
        , pointermove: function (e) {
            this.setEvent('move', e);
            this.scan();
            // this.clear();
        }
        , pointerup: function (e) {
            this.setEvent('up', e);
            this.scan();
            //  this.clear();
        }
        , pointertouchstart: function () { }
        , pointertouchmove: function () { }
        , pointertouchend: function () { }
        , pointertouchcancel: function () { }
    }
    reQ.class('reQ.ViewShow', {
        constructor: ViewShow,
        extends: reQ.obSubscribe,
        init: function () {

            // this.bindEvent();
        },
        addScenes: function (scenes) {
            if (this.ctx) {
                scenes.ctx = this.ctx;
            }
            scenes.canvas = this.object;
            scenes.object = this;
            this.scenes.push(scenes);
        },
        getCanvas: function () {
            return this.ctx.canvas;
        },
        router: function () {

        },
        clearView: function () {
            this.ctx.clearRect(0, 0, this.object.width, this.object.height);
        },
        routerConfig: function (config) {

        },
        activeScenes: function (index) {
            //for(var i=0,len=this.scenes.length;i<len;i++){
            //    if(getActiveScenes==i)
            var scene = this.scenes[index];
            //}
            return scene;
        },
        start: function () {
            // console.time('world')
            var scene = this.activeScene = this.activeScenes(0);
            this.ctx.clearRect(0, 0, this.object.width, this.object.height);
            scene && scene._onRender && scene._onRender(this.ctx);
            this.pointerListener.clear();
            // console.timeEnd('world')
        },
        renderTo: function (context) {
            if (context) {
                context.appendChild(this.object);
            }
        }
    });

    function ViewShow(w, h) {
        this.object = document.createElement('canvas');
        this.object.width = w || 400;
        this.object.height = h || 300;
        this.ctx = this.object.getContext('2d');
        this.input = {
            pointer: {

            }
        }
        this.pointerListener = new reQ.InputListener(_poniterPrototype);
        this._pointerSubscribe = new reQ.obSubscribe();
        this.activeScene = null;
        this.scenes = [];
        this.router = [];
        this.init();
        this.pointerListener.start(this);
    }


    reQ.class('reQ.baseDisplay', {
        constructor: baseDisplay,
        extends: reQ.obSubscribe,
        setContext: function (ctx) {
            this.ctx = ctx;
        },
        installModules: function () {

        },
        getContext: function () {
            if (!this.ctx) new Error('ctx not found');
            return this.ctx;
        },
        toString: function (ctx) {
            return this.opid + ',' + this.x + ',' + this.y + ',' + this.w + ',' + this.h;
        },
        _add: function (children) {
            children.object = this.object;
            if (this.ctx) {
                children.ctx = this.ctx;
            }
            children.__parent = this;
            children.addHandler && children.addHandler(children, this);
        },
        add: function (children) {
            this._add(children);
            this.childrens.push(children);
        },
        getCanvas: function () {
            var _par = this, canvas = null;
            while (_par) {
                if (_par.canvas) {
                    canvas = _par.canvas;
                    break;
                }
                _par = _par.__parent
            }
            return canvas;
        },
        hitTest: function (point) {
            var test = false;
            if (this.x + this.w > point.x && this.x < point.x && this.y < point.y && this.y + this.h > point.y) {
                test = true;
            }
            return test;
        },
        _triggerEvent: function (obj, e, type) {
            this.triggerEvent && this.triggerEvent(obj, e, type);
            var len = this.childrens.length, i;
            for (i = 0; i < len; i++) {
                var displayer = this.childrens[i];
                displayer._triggerEvent && displayer._triggerEvent(obj, e, type);
            }
        },
        triggerEvent: function (obj, e, type) {

        },
        clone: function () {

        },
        _clear: function () {
            this.ctx.clearRect(this.x, this.y, this.w, this.h);
        },
        _sortChildrenByZ: function () {
            if (this.childrens.length > 0) {
                this.childrens.sort(function (a, b) {
                    return a.z - b.z;
                });
            }
        },
        _onRender: function (ctx) {
            this.ctx = ctx;
            this._sortChildrenByZ();
            this.willRender && this.willRender(ctx);
            if (this.isShow) {
                this.onRender(ctx);
                this.isRendered = true;

            }
            var len = this.childrens.length, i;
            for (i = 0; i < len; i++) {
                var displayer = this.childrens[i];
                displayer._onRender && displayer._onRender(ctx);
            }
            this.mountRendered && this.mountRendered(ctx);
        },
        _move: function (x, y) {
            if (this.isMove) {
                this.move(x, y);
            }
            var len = this.childrens.length, i;
            for (i = 0; i < len; i++) {
                var displayer = this.childrens[i];
                displayer.isRelaMove && displayer._move && displayer._move(x, y);
            }
        },
        addHandler: function () {
            this.onInit();
        },
        onInit: function () {
        },
        move: function (x, y) {
            x = x || 0; y = y || 0;
            this.x += x;
            this.y += y;
        },
        onRender: function (ctx) {
        },
        getRendered: function () {
            return this.isRendered;
        }
    });
    function baseDisplay() {
        this.__doid = reQ.__doid++;
        this.opid = 'opid_' + this.__doid;
        this.events = new reQ.Events(this);
        this.ctx = null;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
        this.h = 0;
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;
        this.opacity = 1;
        this.scale = 1;
        this.rotate = 0;
        this.zIndex = 100;
        this.__parent = null;
        this.childrens = [];
        this.isShow = true;
        this.isRendered = false;
        this.isMove = true;
        this.isRelaMove = true;//是否跟随父元素移动
    }


    var Scenes = reQ.class('', {
        constructor: function (ctx, canvas) {
            this.childrens = [];
            this.ctx = ctx;
            this.canvas = canvas;
        },
        extends: reQ.baseDisplay,
    });

    reQ.Scenes = Scenes;


    var Layer = reQ.class('', {
        constructor: function () {
            this.childrens = [];
        },
        extends: reQ.baseDisplay,
        add: function (sprite) {
            this._add(sprite);
            sprite.layerX = this.x;
            sprite.layerY = this.y;
            this.childrens.push(sprite);
        }
    });

    reQ.Layer = Layer;


    var Sprite = reQ.class('', {
        constructor: function () {
            this.layerX = 0;
            this.layerY = 0;
            this.childrens = [];
        },
        extends: reQ.baseDisplay,
        setPos: function () {

        }
    });

    reQ.Sprite = Sprite;
})();