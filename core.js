//reQ core
;(function(){
    var _toString = function(){return Object.prototype.toString;}
    function isObject(obj){
        return typeof obj==='object';
    }
    function isNumber(str){
        return _toString.call(str)==='[object Number]';
    }
    function isArray(arr){
        if(isObject(arr)){
            return _toString.call(arr) ==='[object Array]';
        }
        return false;
    }
    var reQ = new function(){
        var self = this;
        this.__doid = 0;
        this.inherit = function(child,parent){
            child.prototype = Object.create(parent.prototype);
            child.prototype.constructor = child;
            child.prototype._super = parent.prototype;
        }
        this.class = function(namepath,params){
            var contrs = params.constructor;
            var _parent = params.extends;
            var ns,cls,name;
            cls = function(){
                _parent && _parent.apply(this,arguments);
               contrs && contrs.apply(this,arguments);
            }
            _parent && self.inherit(cls,_parent);
            for(var k in params){
                if(k=='constructor' || k=='extends')continue;
                cls.prototype[k] = params[k];
            }
            if(namepath){
                ns = namepath.split('.');
                name = ns[ns.length-1];
                for(var i=0,len=ns.length;i<len;i++){
                    if(ns[i]!==name){
                        ns[i]=self[ns[i]]
                        if(!ns[i]){
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
        this.install = function(name,module){
            modules.push({name:name,module:module});
        }
        this.getModules = function(){
            return modules;
        }
    }
    reQ.isObject = isObject;
    reQ.isNumber = isNumber;
    reQ.isArray = isArray;
    
    
   window.reQ = reQ;
    
//reQ.extend
    const baseClone = (targets)=>{
        let res = {};
        if(isArray(targets)){
            res = [];
            for(var i=0,len=targets.length;i<len;i++){
                var item = targets[i];
                res.push(item);
            }
        }else if(isObject(targets)){
            for(var i in targets){
                if(targets.hasOwnProperty(i)){
                    var item = targets[i];
                    res[i] = item;
                }
            }
        }
        return res;
    }
    const deepClone = (targets)=>{
        let res = {};
        if(isArray(targets)){
            res = [];
            for(var i=0,len=targets.length;i<len;i++){
                var item = targets[i];
                if(isObject(item)){
                    res.push(deepClone(item))
                }else{
                    res.push(item);
                }
            }
        }else if(isObject(targets)){
            for(var i in targets){
                if(targets.hasOwnProperty(i)){
                    var item = targets[i];
                    if(isObject(item)){
                        res[i] = deepClone(item);
                    }else{
                       res[i] = item;
                    }
                }
            }
        }
        return res;
    }
    function deepExtend(target,source){
        if(isArray(source)){
            target = target || [];
            for(var i=0,len=source.length;i<len;i++){
                var item = source[i];
                if(typeof target[i]==='undefined'){
                    if(isArray(item)){
                        target[i] = [];
                    }else{
                        target[i] = {};
                    }
                }
                if(isObject(item)){
                    deepExtend(target[i],source[i]);
                }else{
                   target[i]=source[i];
                }
            }
        }
        else  if(isObject(source)){
            target = target || {};
            for(var i in source){
                if(source.hasOwnProperty(i)){
                    var item = source[i];
                    if(typeof target[i]==='undefined'){
                        if(isArray(item)){
                            target[i] = [];
                        }else{
                            target[i] = {};
                        }
                    }
                    if(isObject(item)){
                        deepExtend(target[i],source[i]);
                    }else{
                       target[i] = source[i];
                    }
                }
            }
        }
    }
    function baseExtend(target,source){
        if(isArray(source)){
            target = target || [];
            for(var i=0,len=source.length;i<len;i++){
                var item = source[i];
                target[i]=item;
            }
        }
        else if(isObject(source)){
            target = target || {};
            for(var i in source){
                if(source.hasOwnProperty(i)){
                    var item = source[i];
                    target[i] = item;
                }
            }
        }
    }
    function _extend(){
        var caller = arguments.callee.caller;
        var args = [].slice.call(arguments);
        var firstArg = args[0],res = {};
        if(firstArg && firstArg===true){
            for(var len=args.length-1,i=len;i>=1;i--){
                var obj = args[i];
                if(isArray(obj)){
                    res = [];
                    for(var j=0,jlen=obj.length;j<jlen;j++){
                        var jitem = obj[j];
                        deepExtend(res,obj);
                    } 
                }else if(isObject(obj)){
                  for(var j in obj){
                        if(obj.hasOwnProperty(j)){
                            var jitem = obj[j];
                            deepExtend(res,obj);
                        }
                    }   
                }
            }
        }else{
            for(var len=args.length-1,i=len;i>=1;i--){
                var obj = args[i];
                if(isArray(obj)){
                    res = [];
                    for(var j=0,jlen=obj.length;j<jlen;j++){
                        var jitem = obj[j];
                        baseExtend(res,obj);
                    } 
                }else if(isObject(obj)){
                  for(var j in obj){
                        if(obj.hasOwnProperty(j)){
                            var jitem = obj[j];
                            baseExtend(res,obj);
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
    reQ.class('reQ.obSubscribe',{
            constructor:function(){
                this.listeners = [];
                //[listener,context,isOne]
            },
            on:function(type,listener,context){
                if(!this.listeners[type])this.listeners[type]=[];
                this.listeners[type].push([listener,context||this]);
            },
            off:function(type,listener,context){
                var liss = this.listeners[type];
                var self = this;
                if(liss.length>0){
                    this.listeners[type] = liss.filter(function(_listener){
                        return ((context||self===_listener[1]) && ((listener&& (_listener[0]==listener?false:true)))||!listener);
                    });
                }
            },
            emit:function(){
                var args = [].slice.apply(arguments);
                var type = args[0];
                var liss = this.listeners[type];
                var params = [];
                for(var j=1,jlen=args.length;j<jlen;j++){
                    params.push(args[j]);
                }
                if(liss && liss.length>0){
                    for(var i=0,len=liss.length;i<len;i++){
                        var listen = liss[i];
                        var listener = listen[0]
                        var context = listen[1];
                        if(context.events){
                            if(!context.events.disabled){
                                listener && listener.apply(context,params);
                            }
                        }else{
                            listener && listener.apply(context,params);
                        }
                    }
                }
            },
            emit_called:function(){
                var args = [].slice.apply(arguments);
                var type = args[0];
                var liss = this.listeners[type];
                var params = [];
                for(var j=1,jlen=args.length;j<jlen;j++){
                    params.push(args[j]);
                }
                if(liss && liss.length>0){
                    for(var i=0,len=liss.length;i<len;i++){
                        var listen = liss[i];
                        var listener = listen[0]
                        var context = listen[1];
                        if(context.events){
                            if(!context.events.disabled){
                                listener && listener.call(context,params);
                                context.__called = true;
                            }
                        }else{
                            listener && listener.call(context,params);
                            context.__called = true;
                        }
                    }
                    this.listeners[type] = liss.filter(function(listener){
                        return !listener[1].__called;
                    });
                }
                
            },
            emit_pointer:function(type,input,e,xy,xys){
                var args = [].slice.apply(arguments);
                var type = args[0];
                var liss = this.listeners[type];
                
                if(liss && liss.length>0){
                    for(var i=0,len=liss.length;i<len;i++){
                        var listen = liss[i];
                        var listener = listen[0]
                        var context = listen[1];
                        if(context.hitTest(xy) && !context.events.disabled &&context.getRendered()){
                            listener && listener.call(context,input,e);
                           // context.__called = true;
                        }
                    }
                    this.listeners[type] = liss.filter(function(listener){
                        return !listener[1].__called;
                    });
                }
                
            }
    });
    
    function InputListener(data) {
        this.eventMap = {};
        reQ.ext(this,data);
    };
    InputListener.prototype = {
        setEvent:function(type,e){
            this.eventMap[type] = e;
        },
        clear:function(){
            for(var k in this.eventMap){
                this.eventMap[k] = null;
            }
            this.eventMap = {};
        },
        clearType:function(type){
            for(var k in this.eventMap){
                if(k==type){
                    this.eventMap[k] = null;
                    delete this.eventMap[type];
                    break;
                }
            }
            
        },
        start:function(viewshow){
            this.onInit(viewshow);
        },
        scan:function(viewshow){
            this.onScan(viewshow);
        }
    };
    reQ.InputListener = InputListener;

    //Events
    function Events(eventtarget){
        this.disabled = false;
        this.obj = eventtarget;
        this.onpointdown = function(cbk){
            this.obj.eventTarget._pointerSubscribe.on('pointerdown',cbk,this.obj);
        }
        this.onpointmove = function(cbk){
            this.obj.eventTarget._pointerSubscribe.on('pointermove',cbk,this.obj);
        }
        this.onpointup = function(cbk){
            this.obj.eventTarget._pointerSubscribe.on('pointerup',cbk,this.obj);
        }
        this.onpointcancel = function(cbk){
            this.obj.eventTarget._pointerSubscribe.on('pointercancel',cbk,this.obj);
        }
    }
    reQ.Events = Events;
    
//    reQ.requestAnimFrame 
//    reQ.cancelAnimFrame 
//    reQ.transitionEvent 
    var requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
    var cancelAnimFrame = (function(){
      return  window.cancelAnimationFrame        ||
              window.webkitCancelAnimationFrame ||
              window.mozCancelAnimationFrame    ||
              function( callback ){
                window.clearTimeout(callback);
              };
    })();
    var transitionEvent = (function(){
       var t,
       el = document.createElement('surface'),
       transitions = {
         'transition':'transitionend',
         'OTransition':'oTransitionEnd',
         'MozTransition':'transitionend',
         'WebkitTransition':'webkitTransitionEnd'
       }

       for(t in transitions){
           if( el.style[t] !== undefined ){
               return transitions[t];
           }
       }
   })();

    reQ.requestAnimFrame = requestAnimFrame;
    reQ.cancelAnimFrame = cancelAnimFrame;
    reQ.transitionEvent = transitionEvent;
})();