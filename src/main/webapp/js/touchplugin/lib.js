/**
 *  @autor :yangmiao
 *  @version:2.1
 *  
 *  消息和弹框控件插件依赖：同目录/css下的common.css的样式
 */
(function () {
    //节点
    var QNode;
    //本地储存
    var _storage = localStorage;
    //文档加成完成的准备函数
    var _readys = [];
    //微信浏览器环境完成的准备函数
    var WEIXINS = [];
    //监听hashchange的元素
    var HASHELEMS = [];
    //保存hash堆
    var HASHSTACK = [];
    //自定义回调对象
    var PLUGIN_CALLBACKS ={};
    //空串
    var EMPTY = "";
    //文档是否加载完成标记
    var _isReady;
    var DOC = document;
    //是否支持touch事件
    var touchAble = "ontouchend" in DOC;
    //判断tap的时间
    var tapInTime = 250;
    //弹框层的维护
    var MODAL_INDEX = 1e3;
    //代理字符串
    var userAgent = navigator.userAgent.toLowerCase();
    var DPR = window.devicePixelRatio;
    var UDF = undefined;
    //微信环境是否准备就绪
    var ISWEIXIN_READY;
    //绑定自身
    var BIND_SELF = "..";
    //未定义
    // 移动端常见的浏览器类型判断
    var BROWSER = {
        // ie10及以下版本的判断
        ie: !!DOC.all,
        android: userAgent.indexOf("android") > -1 || userAgent.indexOf("linux") > -1,
        iphone: userAgent.indexOf("iphone") > -1,
        mobile: userAgent.indexOf("mobile") > -1,
        ipad: userAgent.indexOf("ipad") > -1,
        //是否在微信浏览器环境中
        weixin: userAgent.indexOf("micromessenger") > -1
    };
    //没有定义宽度，查询样式时返回计算值
    var styleprops = ["height", "width"];
    //自身属性
    var seleprops = ["scrollTop"];
    //可序列化的表单类型
    var _ftypes = ["checkbox", "hidden", "email", "hidden", "number", "password", "radio", "tel", "text", "url", "textarea"];
    //问号
    var ASK = "?";
    //过滤特殊字符正则表达式
    var REG_SYMB = new RegExp("[`~!@＠%Y#$^&*()=|{}':;',\\[\\].<>/?~！#￥¥……&*（）&;—|{}【】‘；：”“'。，、？]");
    //清空格规则
    var MATCH_TRIM = /(^\s*)|(\s*$)/g;
    //获取字符实际长度规则
    var MATCH_REALLENGTH = /[^\x00-\xff]/gi;
    //日期处理参数
    var weekday = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    var weekday_short = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var dayname = ["今天", "明天", "后天"];
    var qqGeolocation;
    //addCss样式承载起
    var CSSOVERRIDE;
    //默认外部可以使用【$】代替Query，类似jQuery
    var $ = window.$ = window.Query = Query;
    //动画接口
    var animationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var myCounterDown = function (callback, framenum) {
        setTimeout(callback, 1e3 / framenum);
    };
    //剪切板
    var CLIPBOARD = {
        //设置剪贴板的内容
        set: function (text) {
            var result;
            if (isNormalType(text)) {
                var text = $.trim(text);
                var elem = $("<div/>", DOC.body).css({
                    "-webkit-user-select": "text",
                    "user-select": "text",
                    position: "absolute", top: "-100px"
                }).textes(text);
                try {
                    var selection = window.getSelection();
                    var range = DOC.createRange();
                    range.selectNode(elem);
                    selection.addRange(range);
                    result = DOC.execCommand("copy");
                    if (selection) {
                        selection.removeAllRanges();
                    }
                } catch (e) {
                }
                elem.remove();
            }
            return !!result;
        },
        //判断是否支持
        support: function () {
            return this.set(EMPTY);
        }
    };

    /*动画缓动函数【可以通过Query.extend为该对象扩展更多的动画缓动】*/
    $.Tween = {
        linear: function (t, b, c, d) {
            return c * t / d + b;
        },
        easeOut: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuint: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeOutBack: function (t, b, c, d) {
            if ((t /= d) < 1 / 2.75) {
                return c * 7.5625 * t * t + b;
            } else if (t < 2 / 2.75) {
                return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
            } else if (t < 2.5 / 2.75) {
                return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
            }
        }
    };
    /*给window、document和Qnode扩展bind和unbind的公用方法*/
    var bindObject = {
        bind: function (event, hander, flag) {
            return toggleEvents.call(this,event,hander,flag,true);
        },
        unbind: function (event, hander, flag) {
            return toggleEvents.call(this,event,hander,flag,false);
        }
    };
    /*NodeList,HTMLCollection,Array公用方法*/
    var QCollection = {
        foreach: fnForeach,
        /*
         * 获取元素集合||集合中指定索引的元素
         * idx :索引(支持负数（倒索引）)
         * 返回符合条件的元素，否则返回null
         */
        eq: function (idx) {
            var len = this.length;
            var idx = idx < 0 ? len + idx : idx;
            if (len > 0 && idx >= 0 && idx < len) {
                var ele = this[idx];
                return ele;
            }
            return null;
        },
        /*条件筛选*/
        filters: function (handler, onlyfirstone) {
            return $.filter(this,handler,onlyfirstone);
        },
        /*
         * 返回 第一个相同的元素在数组中的位置
         * o 元素
         */
        idxof: function (o) {
            for(var i=0;i<this.length;i++){
            	if(o===this[i]){
            		return i;
            	}
            }
            return -1;
        }
    };
    try {
        QNode = Node;
    } catch (e) {
        QNode = Element;
    }
    try {
        var test = "t_zcw_";
        _storage.setItem(test, test);
        _storage.removeItem(test);
    } catch (e) {
        _storage = {
            getItem: function (key) {
                return UDF;
            },
            setItem: emptyFn,
            removeItem: emptyFn,
            clear: emptyFn
        };
    }
    //空方法【仅供内部使用】
    function emptyFn() {
    }
    // 判断是否为集合或数组【可以通过Query.isArray调用】
    function isArray(obj) {
        var ts = Object.prototype.toString;
        return ts.call(obj) === "[object Array]" || ts.call(obj) === "[object NodeList]";
    }
    /*
     * 延迟函数【效果等于document.body.delay，可以通过Query.delay调用】
     *  duration   延迟时间
     *  hander   处理事件
     */
    function delay(duration, hander) {
        return DOC.body.delay.apply(null, arguments);
    }

    //修复前缀【仅供内部使用】
    function fixpre(name, pre) {
        return (pre || "client") + name.charAt(0).toUpperCase() + name.substring(1, name.length);
    }

    /*
     * 事件绑定【仅供内部使用】
     * event事件 string | array[string]
     * hander 绑定函数 function
     * flag 是否冒泡 boolean
     * isbind 是否绑定boolean
     */
    function toggleEvents(event, hander, flag, isbind) {
        // 绑定前先取消绑定
        var elem = this;
        var optype = (isbind?"add":"remove")+"EventListener";
        $.trim(event).split(",").foreach(function (i,v) {
            elem[optype]($.trim(v), hander, !!flag);
        });
        return elem;
    }

    /*
     * 查找该元素的上一个[下一个]兄弟元素【仅供内部使用】
     * elem 元素
     * proto 方法名
     * orproto 原生方法名
     * tagName 查找的标签名
     */
    function nextPrevious(elem, proto, orproto, tagName) {
        if (tagName) {
            while (elem = elem[proto]()) {
                if ($.isTag(elem, tagName)) {
                    return elem;
                }
            }
        }
        var o = elem[orproto];
        if (o && o.nodeType == 3) {
            return o[proto](tagName);
        }
        return o;
    }
    
    /*
     * 更改窗口标题
     */
    function changeWindowTitle(title){
    	if(title!=window.top.document.title){
    		window.top.document.title = title;
        }
    }

    //监听文档加载完成【内部使用】
    function bindReady() {
        $.hashchange(function (hash) {
            if (HASHELEMS.length > 0) {
                var node = HASHSTACK[0];
                HASHELEMS.foreach(function () {
                    if (node == this.elem && hash == this.elem.attr("hashbefore")) {
                    	var ret =true;
                    	if($.isFocus()){
                    		fnBlur();
                    		ret = !BROWSER.iphone;
                    	}
                    	if(ret){
                    		ret = this.handler.call(this.elem, hash);
                    	}
                        if (ret === false || isFn(ret)) {
                            $.hash(this.elem.attr("hashafter"));
                            changeWindowTitle(this.elem.attr("titleafter"));
                            if (isFn(ret)) {
                                ret();
                            }
                        } else {
                        	changeWindowTitle(this.elem.attr("titlebefore"));
                            HASHSTACK.shift();
                        }
                        return false;
                    }
                });
            }
        });
        DOC.bind("readystatechange", function (e) {
            if (_isReady || this.readyState == "complete") {
            	if( this.readyState == "complete"){
            		changeWindowTitle(DOC.title);
            	}
            	DOC.body.bind("touchstart",emptyFn);
                while (_readys.length > 0) {
                    _readys.shift()();
                }
                _isReady = true;
            }
        });
    }

    /*
     * 判断对象是否为指定类型【仅内部使用】
     * object 判断的对象
     * type 类型【多个时，使用“|”隔开，用的是“或”条件】
     */
    function isType(object, type) {
        var realtype = typeof object;
        return !!$.trim(type).split("|").filters(function(i,v){
        	return v==realtype;
        },true);
    }

    //为对象扩展属性和方法【核心方法，可以通过Query.extend为其他对象进行扩展】
    function extend() {
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && !isFn(target)) {
            target = {};
        }
        if (length == i) {
            target = this;
            --i;
        }
        for (; i < length; i++) if ((options = arguments[i]) != null) for (var name in options) {
            var src = target[name], copy = options[name];
            if (target === copy) {
                continue;
            }
            if (deep && copy && typeof copy === "object" && !copy.nodeType) {
                target[name] = extend(deep, src || (copy.length != null ? [] : {}), copy);
            } else if (copy !== UDF) {
                target[name] = copy;
            }
        }
        return target;
    }

    //禁用滚动
    function fnnoscroll(e) {
        e.preventDefault();
    }
    //居中消息对象
    function fnCenterView(view){
    	if(view.hasClass("loading") && view.find(".wool_msgview_msg").textes().length>0){
    		view.addClass("onmsg");
    	}else{
    		view.removeClass("onmsg");
    	}
    	var objh = view.offsetHeight/2;
    	var objw = view.offsetWidth/2;
    	view.css({
    		top : "-webkit-calc(45% - "+objh+"px)",
    		left : "-webkit-calc(50% - "+objw+"px)"
    	});
    	view.css({
    		top : "calc(45% - "+objh+"px)",
    		left : "calc(50% - "+objw+"px)"
    	});
    }
    /*
     * 触碰记录器
     * allowedmove:integer 指定值内滑动视为忽略滑动
     */
    function TouchRecorder(allowedmove){
        //在允许的值内不算移动
        var allowed = Math.abs(allowedmove || 5) * Math.ceil(DPR/2);
        var isvertical = null;
        var costTime =lastTimeStamp =  this.timeStamp = 0;
        var curMoveXs=[];
        var curMoveYs=[];
        //初始化
        this.init = function (e) {
            this.updateEvent(e);
            this.moveX = this.moveY = this.maxX = this.maxY = 0;
            var toucher = e.changedTouches;
            toucher = toucher?toucher[0]:e;
            this.pageX = toucher.pageX;
            this.pageY = toucher.pageY;
            lastTimeStamp =  this.timeStamp = e.timeStamp;
            //记录touch的时间
            isvertical = null;
            curMoveXs.length=0;
            curMoveYs.length=0;
        };
        //计算滑动的耗费时间
        //更新
        this.update = function (e) {
            this.updateEvent(e);
            var toucher = e.changedTouches;
            toucher = toucher?toucher[0]:e;
            var lastMoveX = this.moveX;
            var lastMoveY = this.moveY;
            //当前x轴移动的值
            this.moveX = toucher.pageX - this.pageX;
            //当前y轴移动的值
            this.moveY = toucher.pageY - this.pageY;
            //x轴移动过的最大值
            this.maxX = Math.max(this.maxX, Math.abs(this.moveX));
            //当前y轴移动过的最大值
            this.maxY = Math.max(this.maxY, Math.abs(this.moveY));
            if (null == isvertical) {
                isvertical = this.maxX < this.maxY;
            }
            if(e.timeStamp - lastTimeStamp>200){
            	//说明滑动过程中有暂停，清空记录
            	curMoveXs.length=0;
            	curMoveYs.length=0;
            }
            curMoveXs.unshift(this.moveX - lastMoveX);
            curMoveYs.unshift(this.moveY - lastMoveY);
            costTime = e.timeStamp - this.timeStamp;
            
            lastTimeStamp = e.timeStamp;
        };
        //当前横向一次滑动的距离集合
        this.getCurMoveXs=function(){
        	return curMoveXs;
        };
      //当前纵向一次滑动的距离集合
        this.getCurMoveYs=function(){
        	return curMoveYs;
        };
        //更新事件
        this.updateEvent = function (e) {
            this.event = e;
        };
        //判断是否移动了
        this.isMoved = function () {
            return Math.max(this.maxX, this.maxY) > allowed;
        };
        //是否移动了X轴
        this.isMovedX = function () {
            return Math.abs(this.moveX) > allowed;
        };
        //是否移动了Y轴
        this.isMovedY = function () {
            return Math.abs(this.moveY) > allowed;
        };
        //是否垂直运动
        this.isVertical = function () {
            return isvertical == true;
        };
        //是否Y轴移动最大
        this.isMaxMovedY = function () {
            return this.maxY > this.maxX;
        };
        //是否水平运动
        this.isHorizontal = function () {
            return !this.isVertical();
        };
        //是否x轴移动最大
        this.isMaxMovedX = function () {
            return !this.isMaxMovedY();
        };
        //是否向左运动
        this.isMoveLeft = function () {
            return this.isMovedX() && this.moveX < 0;
        };
        //是否向右边运动
        this.isMoveRight = function () {
            return this.isMovedX() && this.moveX > 0;
        };
        //是否向上运动
        this.isMoveTop = function () {
            return this.isMovedY() && this.moveY < 0;
        };
        //是否向下运动
        this.isMoveDown = function () {
            return this.isMovedY() && this.moveY > 0;
        };
        //是否移动中
        this.isMoving = function () {
            return this.event.type == "touchmove" || this.event.type == "mousemove";
        };
        //获取事件耗时
        this.getEventCostTime = function () {
            return costTime;
        };
    }
    
    /*
     * js动画
     * onchange 动画变量值更改监听
     * 返回 动画对象animation
     * 配置属性：
     * 动画时长 animation.duration：integer 毫秒数
     * 动画结束回调 animation.onend：function
     * 动画帧数配置 animation.framenum：integer，实际运算值为1000/ animation.framenum
     * 以：一个元素的高度在500毫秒内从0px到px的动画过程示例
     * 
     * var elem = $("#demo");
     * var startHeight = 0;
     * var endHeight = 100;
     * var animation = $.animate(function(){
     * 		var curheight = this.easeValue(startHeight,endHeight);
     * 		elem.css("height",curheight+"px");
     * });
     * animation.duration=500;
     * animation.execute();
     * 
     */
    function Animation(onchange) {
        var a = this;
        var starttime;
        //开始时间
        var t;
        //累计时间
        var state = 0;
        //暂停时间，累计时间
        var pausetime,pauseplus=0;
        //状态-未执行
        a.onend;
        //动画结束监听
        a.duration = 600;
        //动画循环通知
        a.onrecycle;
        //动画过度时间监听
        //a.framenum;//指定每秒的帧数，实际值为1000/a.framenum，设置定时器（例如各种倒计时）使用
        function ontick() {
            var animator = typeof a.framenum == "number" ? myCounterDown : animationFrame;
            animator(function () {
            	if(state==4){
            		return;
            	}
                t = $.timestamp() - starttime - pauseplus;
                var timedout = t >= a.duration;
                if (timedout) {
                    state = 2;
                    //完成
                    t = a.duration;
                }
                onchange.call(a);
                if (state == 1) {
                    ontick();
                } else {
                	if(a.isrecycle){
                		if(isFn(a.onrecycle)){
                			a.onrecycle.call(a);
                		}
                		a.reset().execute();
                	}else if (isFn(a.onend)) {
                        a.onend.call(a);
                    }
                }
            }, a.framenum);
        }

        //执行动画
        a.execute = function () {
            if (state == 0) {
                starttime = $.timestamp();
                state = 1;
                //动画中
                ontick();
            }
            return a;
        };
        //停止正在执行的动画
        a.stop = function () {
            if (state == 1) {
                state = 3;
            }
            return a;
        };
        a.reset=function(){
            t=state =pausetime=pauseplus=0;
            return a;
        };
        //暂停或运动
        a.toggle=function(){
        	if (a.isAnimation()) {
        		a.pause();
			} else if (a.isPause()) {
				a.resume();
			}
            return a;
        };
        //动画暂停
        a.pause=function(){
        	if( a.isAnimation()){
        		state=4;
        		pausetime= $.timestamp();
        	}
            return a;
        };
        //暂停后继续执行动画
        a.resume=function(){
        	if(a.isPause()){
        		pauseplus =pauseplus+$.timestamp()-pausetime;
        		state=1;
        		ontick();
        	}
            return a;
        };
        /*
         * 判断是否在执行动画
         * 动画中返回true，否则返回false
         */
        a.isAnimation = function () {
            return state == 1;
        };
        //判断动画是否暂停中，暂停中返回true，否则返回false
        a.isPause=function(){
        	return state==4;
        };
        //判断动画是否已取消，已取消返回true，否则返回false
        a.isCanceled=function(){
        	return state==3;
        };
        //判断动画是否已停止，已取消返回true，否则返回false
        a.isStop=function(){
        	return state==2 || state==3; 
        };
        //获取当前时刻的动画耗时，返回结果：毫秒数
        a.getCostTime = function () {
            return t;
        };
        /*
         * 获取当前动画时刻的缓动进度值
         * startvalue:integer动画初始值
         * destvalue:integer动画目标值
         * ease:function缓动函数 参考 $.Tween
         */
        a.easeValue = function (startvalue, destvalue, ease) {
            var ee = ease ? ease : $.Tween.easeOut;
            return ee(t, startvalue, destvalue - startvalue, a.duration);
        };
    }
    //消息控件
    function MessageView(plainObject) {
        var _this = this;
        var params = extend({
                delay: 1e3, //消息的显示时间
               // callback: null, //隐藏后的回调
                msg: EMPTY, //需要显示的内容
                //iswait: false, //是否需要显示等待图标
                //iscustomlength: false, //是否自定义长度
                duration: 300 //消息框显示的时间
            }, plainObject);
        
    	var delay = params.delay;
        if(params.iswait){
        	delay= 0;
        }else if(delay<0){
        	var length = params.msg.realLength()/2;
            delay = length > 10 ? length * 79 : 800;
        }
        //遮罩
       var shadow =  this.shadow = $("<div/>",DOC.body).addClass("wool_msgview_modal");	
      //控件
       var view = this.view = $("<div/>",DOC.body).addClass("wool_msgview info");
       var loadingview = $("<div/>",view).addClass("wool_msgview_loading");
       //外部获取消息内容控件
       this.msgView = $("<div/>",view).addClass("wool_msgview_msg");
        // 设置遮罩样式，并添加到页面
        if (!params.iswait) {
            view.addClass("nopointerEvents");
        }
        if(!params.iswait){
        	shadow.tap(function(){
        		if(!params.iswait && view.hasClass("_ourlinc_msgbody_show")){
        			params.callback=null;
        			view.removeQueue().dequeue();
        			_this.hide(1);
        		}
        	});
        }
        //是否已经关闭
        this.closed = false;
        //外部获取等待图片
        //禁止滚动
        [view, shadow].foreach(function(){
        	this.bind("touchstart", fnnoscroll);
        });
        function msgIcon(icon,msg,opt){
        	var pt = $.extend({
        		iscustomlength:false
        	},opt);
        	params.iscustomlength = pt.iscustomlength;
        	if(msg.realLength()>36 && !params.iscustomlength){
        		return _this.msg(msg);
        	}else{
        		return _this.msg(msg,true,false,"iconable "+icon);
        	}
        }
        this.msgsucc=function(msg,opt){
        	return msgIcon("success",msg,opt);
        };
        this.msgwarn=function(msg,opt){
        	return msgIcon("warn",msg,opt);
        };
        this.msgerror=function(msg,opt){
        	return msgIcon("error",msg,opt);
        };
        //设置【获取】消息文本,flag:是否不执行动画
        this.msg = function (msg, flag,loading,icon) {
        	msg =$.trim(msg);
        	  if (!flag || icon) {
        		  icon = icon||EMPTY;
                view.queue(function() {
                    view.removeClass("_ourlinc_msgbody_show").dequeue();
                }).delay(200).queue(function() {
                    _this.loading(!!loading,icon).msgView.html(msg);
                    view.dequeue();
                }).queue(function() {
                	view.css("left","0").addClass("_ourlinc_msgbody_show").dequeue();
                    fnCenterView(view);
                });
            } else {
            	_this.loading(!!loading,icon).msgView.html(msg);
                fnCenterView(view);
            }
            return this;
        };
        function setIcon(icon){
        	return _this.loading(false,icon);
        }
        //开【关】等待视图
        this.loading = function (toggle,showicon) {
        	if(toggle){
        		if(!loadingview.children.length){
        			for(var i=0;i<12;i++){
        				var spinner = $("<div/>",loadingview);
        				spinner.css({
        					"-webkit-transform":"rotate("+(i*30)+"deg) translate(0, -142%)",
        					"-webkit-animation-delay":(-1+0.0833*i)+"s",
        					"transform":"rotate("+(i*30)+"deg) translate(0, -142%)",
        					"animation-delay":(-1+0.0833*i)+"s"
        				});
        			}
        		}
        		view.addClass("loading").removeClass("info");
        	}else{
        		loadingview.empty();
        		view.removeClass("iconable loading warn success error").addClass(showicon||""+ "info");
        		 fnCenterView(view);
        	}
            return this;
        };
        //延迟关闭的时间
        this.delay = function (delaytime) {
            delaytime = delaytime || 0;
            if (delaytime > 0) {
            	view.delay(delaytime);
            }
            return this;
        };
        /*
         * 关闭消息框
         * delaytime，【可选值】"auto"||>0的毫秒值，不指定时默认"auto"
         * callback 隐藏后的回调
         */
        this.hide = function (delaytime, callback) {
        	view.queue(function(){
        		if (isFn(delaytime)) {
        			callback = delaytime;
        		}
        		if (!isType(delaytime,"number")) {
	           		 var msglength = $.trim(_this.msgView.textes()).length;
	           		 delaytime =msglength > 6 ? msglength * 150 : 800;
                }
        		view.delay(delaytime);
               view.queue(function () {
                   view.removeClass("_ourlinc_msgbody_show").dequeue();
               }).delay(200).queue(function () {
                   if (isFn(params.callback)) {
                       params.callback.call(params);
                   }
                   if (isFn(callback)) {
                       callback.call(params);
                   }
                   this.dequeue().remove();
                   shadow.remove();
                   _this.closed = true;
               });
               this.dequeue();
        	});
        };
        //显示消息（delay:延迟关闭时间，默认不延迟）
        this.show = function (delaytime) {
            this.delay(delaytime);
            if (!delaytime || delaytime == 0) {
                view.delay(10);
            }
            view.queue(function () {
                view.addClass("_ourlinc_msgbody_show").dequeue();
                fnCenterView(view);
            }).delay(10).queue(function () {
                this.dequeue();
                fnCenterView(view);
            });
            if (delay > 0) {
                view.queue(function () {
                    _this.hide(delay);
                    this.dequeue();
                });
            }
            return this;
        };
        //开始配置
        this.loading(params.iswait);
        _this.msgView.html($.trim(params.msg));
        fnCenterView(view);
        if(params.icontype && (params.msg.realLength()<=36 || params.iscustomlength)){
        	setIcon("iconable "+ params.icontype);
        }
    }

    /*
     * 图片内部居中处理
     * img :dom图片元
     * callback :function处理完成回调
     */
    function AutoDisplayImage(img, callback) {
        var parent = img.parent();
        var w = parent.offsetWidth;
        var h = parent.offsetHeight;
        var oldwidth = img.naturalWidth;
        var oldheight = img.naturalHeight;
        var zoomw = w / oldwidth;
        var zoomh = h / oldheight;
        var zoom = zoomw > zoomh ? zoomw : zoomh;
        var width = $.round2(oldwidth * zoom, 0);
        var height = $.round2(oldheight * zoom, 0);
        img.css({
            width: width + "px",
            height: height + "px",
            "margin-top": (h - height) / 2 + "px"
        });
        if (h < height) {
            img.css("margin-top", (h - height) / 2 + "px");
        } else {
            img.css("margin-left", (w - width) / 2 + "px");
        }
        if (callback) {
            callback();
        }
    }
    //为图片拓展自适应方法，该方法仅适用于图片的父元素的宽高固定的情况
    extend(HTMLImageElement.prototype, {
        autosize: function (onautosize) {
        	var _this = this;
            if (_this.complete) {
                AutoDisplayImage(_this, onautosize);
            }
            _this.onload = function () {
                AutoDisplayImage(_this, onautosize);
            };
            window.bind("resize",function(){
                AutoDisplayImage(_this, onautosize);
            });
        }
    });
    extend(HTMLFormElement.prototype, {
        /*
         * 序列化表单为url字串
         *  flag:是否编码表单的值
         */
        serialize: function (flag) {
            return $.url(this.serializeArray(), flag);
        },
        /*
         * 表单转object对象
         * 期望获取的控件应有相应的name值
         */
        serializeArray: function () {
            var o = {};
            this.query("input").foreach(function () {
                if (this.name && _ftypes.has(this.type)) {
                    o[this.name] = this.value;
                }
            });
            this.query("select").foreach(function () {
                if (this.name) {
                    o[this.name] = this.value;
                }
            });
            this.query("textarea").foreach(function () {
                if (this.name) {
                    o[this.name] = this.value.replaceAll("\n", " ");
                }
            });
            return o;
        }
    });
    /*
     * 让下拉框选中指定项（索引或指定的值）
     * 参数 为控制，返回当前选中项的下表，为数字时，选中指定的项，为字串时，选中值相等的第一项
     */
    HTMLSelectElement.prototype.sel = function (it) {
        var op = this.options;
        if (isType(it, "number")) {
            op[it < 0 || it > op.length ? 0 : it].selected = true;
            return this;
        } else if (isType(it, "string")) {
        	op.foreach(function(){
        		 if (this.value == it) {
        			 this.selected = true;
                     return false;
                 }
        	});
            return this;
        } else {
            return this.selectedIndex;
        }
    };
    //扩展Query的静态方法
    //给Query扩展属性和方法
    extend($, {
        //当前版本
        version: 2.1,
        //默认弹框上一层视图
        upPager:null,
        //浏览器的代理字符串
        agent: userAgent,
        //延迟对象
        delay: delay,
        //判断对象类型
        isType: isType,
        //保留小数
        round2: function (number, fractionDigits) {
            return Math.round(number * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);
        },
        //touch事件记录器（allowedmove：设置超过移动的距离视为移动了，使用前需要调用init方法）
        touchRecorder: function (allowedmove) {
        	return new TouchRecorder(allowedmove);
        },
        /*
         * 自定义动画
         * onchange:function 动画值更变化时的处理
         * 具体用户参考#Animation
         */
        animate: function(onchange){
        	return new Animation(onchange);
        },
        /*
    	 * 声明继承关系
    	 * parent:被继承这
    	 * child:继承者
    	 */
        declareExtend:function(parent,child){
    		if(!(child instanceof parent)){
    			// 创建一个没有实例方法的类
    			var Super = function(){};
    			Super.prototype = parent.prototype;
    			//将实例作为子类的原型
    			child.prototype = new Super();
    		}
    	},
        //动画对象
        Animation:Animation,
        //是否为数组
        isArray: isArray,
        //浏览器判断
        browser: BROWSER,
        //判断字串是否为空
        isempty: function (str) {
            return str == UDF || str == null || str.length == 0;
        },
        //是否支持touch事件
        touchAble: touchAble,
        //编码
        encode: function (str) {
            return encodeURIComponent($.trim(str));
        },
        //转码
        decode: function (str) {
            return decodeURIComponent($.trim(str));
        },
        //http请求
        request: Ajax,
        //消息控件
        msgView: MessageView,
        /*
         * 滚至顶部
         *  px ：像素
         * duration 是否过度
         * callback 过度回调
         * ease:缓动函数
         */
        gotoTop: function (px, duration, callback, ease) {
            if (duration) {
                var d = $.getScrollTop();
                var ani =$.animate(function () {
                    scrollTo(0, this.easeValue(d, px, ease));
                });
                ani.duration = duration;
                ani.onend = callback;
                ani.execute();
            } else {
                scrollTo(0, px);
            }
        },
        gotoTopFix: function (px) {
            var d = DOC.body.scrollTop;
            var page = Math.abs(px - d) / $.clientXY().y;
            var ani = $.animate(function () {
                scrollTo(0, this.easeValue(d, px, $.Tween.linear));
            });
            ani.duration = page * 60;
            ani.execute();
            return ani;
        },
        //浏览器的可见宽高
        clientXY: function () {
            var x = 0, y = 0, del = DOC.documentElement, dd = DOC.body, x = del.clientWidth || dd.clientWidth,
                y = del.clientHeight || dd.clientHeight;
            return {
                x: x,
                y: y
            };
        },
        //页面的实际宽高
        pageXY: function () {
            var dle = DOC.documentElement, db = DOC.body;
            var x = dle.scrollWidth > db.scrollWidth ? dle.scrollWidth : db.scrollWidth,
                y = dle.scrollHeight > db.scrollHeight ? dle.scrollHeight : db.scrollHeight;
            return {
                x: x,
                y: y
            };
        },
        /*
         * 以get的方式请求
         */
        get: function (url, param, done, fail, always) {
            return ajaxRequest("GET", url, param, UDF, done, fail, always);
        },
        /*
         * JSONP的请求方式对象(用法类似$.get())
         */
        getJSONP: function (url, callbackname, param, done, fail, always) {
            if (typeof callbackname == "object" && !param) {
                //使用默认的回调函数名
                param = callbackname;
                callbackname = UDF;
            }
            return ajaxRequest("JSONP", url, param, callbackname, done, fail, always);
        },
        /*
         * post的方式请求(自动解析返回的格式)
         * 用法：同Query.get()
         */
        post: function (url, param, done, fail, always) {
            return ajaxRequest("POST", url, param, UDF, done, fail, always);
        },
        postloading:function(opt,msgview){
        	return  new PostLoading(opt,msgview);
        },
        /*
         * 以json格式提交参数【非表单】，后端需要从流中读取提交的内容
         * url:请求路径
         * content:提交的内容
         */
        postjson: function (url, content, done, fail, always) {
            return ajaxRequest("POSTJSON", url, content, UDF, done, fail, always);
        },
        /*
         * 异步上传文件的请求(自动解析返回的格式)
         * param说明，需要上传的文件，key:value，value是上传的文件，则必须为文件域对象数组
         * 例如：{files:[input1,...inputn]}
         * 其余用法：同Query.get()
         */
        postfile: function (url, param, done, fail, always) {
            return ajaxRequest("POSTFILE", url, param, UDF, done, fail, always);
        },
        /*
         * 字串转JSON对象
         */
        parseJSON: function (text, def) {
            if (text && (text.startWith("{") && text.endWith("}") || text.startWith("[") && text.endWith("]"))) {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    return def || text;
                }
            }
            return def || text;
        },
        /*
         * 用于展示等待的状态
         * msg 展示的内容，可为空
         * delay 延迟后续的操作 ，默认300ms
         * 返回 msgView对象
         * 请求结束时可以调用
         * msgView的msg和hide方法
         */
        showloading: function (msg,delay) {
        	if(!isType(delay,"number")){
        		delay = 300;
        	}
        	return  new $.msgView({
                msg: msg,
                iswait: true
            }).show().delay(delay);
        },
        /*
         * 快捷显示一个消息框
         * 
         * 支持的构造
         * 
         * showmsg(msg);//自动消失
         * showmsg(msg,delay);//指定的时间内消失
         * showmsg(msg,callback);//自动消失，并回调
         * showmsg(msg,delay,callback);//指定时间内消失，并回调
         * 
         * opt 扩展属性
         * msg 展示的内容
         * delay 展示时间（毫秒）
         * callback 关闭时的回调（消失后的回调）
         */
        showmsgs: function (opt,msg, delay, callback) {
        	msg = new String(msg).toString();
            if (!isType(delay,"number")) {
            	callback = delay;
            	delay=-1;
            }
            var plainObject={
                msg: msg,
                delay: delay,
                callback: callback
            };
            return new $.msgView($.extend(plainObject,opt)).show();
        },
        /*
         * 显示表示完成的信息提示，超过36个字符时不展示图标
         */
        showsucc:function(msg, delay, callback){
        	$.showmsgs({icontype:"success"},msg, delay, callback);
        },
        /*
         * 显示表示警示的信息提示，超过36个字符时不展示图标
         */
        showwarn:function(msg, delay, callback){
        	$.showmsgs({icontype:"warn"},msg, delay, callback);
        },
        /*
         * 显示表示错误的信息提示，超过36个字符时不展示图标
         */
        showerror:function(msg, delay, callback){
        	$.showmsgs({icontype:"error"},msg, delay, callback);
        },
        /*
         * 无图标的信息提示
         */
        showmsg:function(msg, delay, callback){
        	$.showmsgs(null,msg, delay, callback);
        },
        //显示页面（弹框化的页面）
        showPage: function (option) {
            var opt = $.extend(true, {
                title: null,
                css: {
                    borderRadius: 0,
                    padding: 0
                },
                enableDestroy: false,
                enableMax: true,
                enabledPage: true,
                duration: 500
            }, option);
            return $.showModalExt(opt);
        },
        //显示弹框(可重复使用，可以更新内容，和按钮)【基于弹框】，实例保存在body的data下
        showModal: function (option) {
            return DOC.body.showModal(option);
        },
        //回调事件
        EVENTS:{
        	MODAL_AFTERHIDE:"modal_afterhide"//弹框隐藏
        },
        //添加监听，支持的事件类型参考$.EVENTS
        bindEvent: function(event,callback){
        	var callbacks = PLUGIN_CALLBACKS[event] = PLUGIN_CALLBACKS[event]||[];
        	callbacks.push(callback);
        },
        /*
         * 解除监听，支持的事件类型参考$.EVENTS
         * event 移除监听的事件
         * callback 移除指定事件的指定回调函数
         */
        unbindEvent: function(event,callback){
        	var cbs = PLUGIN_CALLBACKS;
        	if(event in cbs){
        		if(callback){
        			cbs[event].remove(callback);
        		}else{
        			delete cbs[event];
        		}
        	}
        },
        //获取回调事件，支持的事件类型参考$.EVENTS
        getEventCallbacks:function(event){
        	return PLUGIN_CALLBACKS[event]||[];
        },
        //队列显示弹框任务
        runModalTaskInQueue:function(event,handles){
        	var handles = handles||[];
        	handles.foreach(function(){
        		var handle = this;
        		var binder = function(){
        			$.unbindEvent(event,binder);
        			handle.apply(null, arguments);
        		};
        		$.bindEvent(event,binder);
        	});
        	if(handles.length>0){
        		$.getEventCallbacks(event)[0]();
        	}
        },
        //显示弹框
        showModalExt: function (option) {
            var type = typeof option;
            var opts = type == "string" || type == "object" && option.tagName ? {
                content: option
            } : option;
            var content, frame;
            var opt = $.extend(true, {
                title: "温馨提示",
                content: EMPTY,
                css: {
                    "padding-top": 0
                },
                enableDestroy: true,
                //默认自动销毁
                showOnInit: true,
                //默认自动打开
                enablePageback: true
            }, opts);
            if (opt.iscustom) {
                frame = opt.content;
            } else {
                frame = $("<div/>").addClass("_ourlinc_winbox_frame");
                if (opt.title) {
                    $("<div/>", frame).html(opt.title).addClass("_ourlinc_winbox_title");
                }
                content = $("<div/>", frame).addClass("_ourlinc_winbox_content");
                if (opt.content && typeof opt.content != "string" && opt.content.tagName) {
                	if(opt.iscustomModal){
                		frame.css("background-color","transparent");
                	}
                    if (opt.enableDestroy) {
                        opt.content = opt.content.clone(true).removeAttr("id").addClass("_DestroyAble");
                    }
                    opt.content.showView();
                } else {
                    content.addClass("usedefault");
                }
                content.appendNode(opt.content);
            }
            return $.windowPlugin(frame, opt, content);
        },
        /*
         * 返回当前时间的毫秒数
         */
        timestamp: function () {
            return Date.now();
        },
        /*
         * 文档加载完毕时执行指定的函数【可以多次调用】，添加的函数按顺序执行
         */
        ready: function (hander) {
            if (!isFn(hander)) {
                return;
            }
            if (_isReady) {
                hander.call(window);
            } else {
                _readys.push(hander);
            }
        },
        /*
         * 判断元素的tagName是否为指定的tagName
         * 例如：
         *        var body = $("body");
         *        $.isTag(body,"body");//return true;
         */
        isTag: function (elem, tagName) {
            if (!elem || !elem.tagName) {
                return false;
            }
            var tg = elem.tagName.toLowerCase();
            return !!$.trim(tagName).toLowerCase().split("|").filters(function(i,v){
            	return v==tg;
            },true);
        },
        /*
         * 判断对象类型
         * obj:js对象
         * type:类型【string】
         */
        isType:function(obj,type){
        	return isType(obj,type);
        },
        /*
         *   获取body到文档顶部的距离
         */
        getScrollTop: function () {
            var distance = 0;
            if (window.pageYOffset) {
                distance = window.pageYOffset;
            } else if (DOC.compatMode && DOC.compatMode != "BackCompat") {
                distance = DOC.documentElement.scrollTop;
            } else if (DOC.body) {
                distance = DOC.body.scrollTop;
            }
            return distance;
        },
        /*
         * 数组合并
         * 例如：$.merge(array1,...,arrayn);
         * 总是返回新的数组
         */
        merge: function () {
            var array = [];
            for (var i = 0; i < arguments.length; i++) {
                var elem = arguments[i];
                Array.prototype.push.apply(array, elem);
            }
            return array;
        },
        /*
         * Cookie操作
         */
        Cookie: {
            /*
             * 保存cookie
             * 例如：
             *        $.Cookie.set("key","value");//不指定过期时间
             *        $.Cookie.set("key","value",1000*60*60);//指定过期时间【毫秒】
             */
            set: function (key, value, expiresMillis, path) {
                var ck = key + "=" + escape(value);
                // 判断是否设置过期时间
                var date = new Date();
                if (expiresMillis) {
                    date.setTime(date.getTime() + expiresMillis);
                } else {
                    date.setFullYear(date.getFullYear() + 1);
                }
                ck = ck + ";expires=" + date.toGMTString() + ";path=" + (path || "");
                DOC.cookie = ck;
            },
            /*
             * 获取保存的cookie
             * 例如：$.Cookie.get("key");
             */
            get: function (key) {
                var array = DOC.cookie.split(";");
                for (var i = 0; i < array.length; i++) {
                    var arr = array[i].split("=");
                    if (arr[0].trim() == key) {
                        return unescape(arr[1]);
                    }
                }
                return EMPTY;
            },
            /*
             * 移除cookie
             * 例如：$.Cookie.remove("key","path=/");
             * key:键
             * path:路径【可选】
             */
            remove: function (key, path) {
                var date = new Date();
                date.setDate(date.getDate() - 1);
                DOC.cookie = key + "=;expires=" + date.toGMTString() + ";path=" + (path || "");
            },
            /*
             * 删除指定路径的的cookie
             * path:路径【可选，默认当前路径】
             */
            clear: function (path) {
                var date = new Date();
                date.setDate(date.getDate() - 1);
                var ex = date.toGMTString();
                var keys = DOC.cookie.match(/[^ =;]+(?=\=)/g);
                $.each(keys, function (key) {
                    var ck = key + "=;expires=" + ex;
                    if (path) {
                        ck += ";path=" + (path || "");
                    }
                    DOC.cookie = ck;
                });
            },
            //删除当前可访问的所有cookie
            clearAll:function(){
            	var path = location.pathname;
            	var idx = -1;
            	while((idx = path.lastIndexOf("/"))!=-1){
            		path = path.substring(0,idx+1);
            		this.clear(path);
            		path = path.substring(0,idx);
            		this.clear(path);
            	}
            }
        },
        /*
         * HTML5本地储存，用法同Cookie操作
         * 区别：
         * Cookie只能储存最多4k的内容，Storage：2M
         * 	Cookie可以在后台获取到，Storage不能
         */
        Storage: {
            get: function (key) {
                return _storage.getItem(key) || EMPTY;
            },
            /*
             * 可选构造
             * set(key,value)//单个保存
             * set(obj)//以键值对的形式多个保存
             */
            set: function (key, value) {
            	if(isType(key,"object")){
            		for(var k in key){
            			_storage.setItem(k, key[k]);
            		}
            	}else{
            		_storage.setItem(key, value);
            	}
            },
            /*
             * 获取json对象
             * key
             */
            getObj : function(key,def){
            	return $.parseJSON(this.get(key),def);
            },
            /*
             * 设置键值对
             * key 字串
             * value json对象
             */
            setObj: function(key,obj){
            	this.set(key,JSON.stringify(obj));
            },
            /*
             * key 移除指定的key的值，一次性移除多个，使用空格隔开
             */
            remove: function (key) {
            	var keys;
            	if(isArray(key)){
            		keys = key;
            	}else{
            		keys = $.trim(key).replace("/^\\s+$/g", " ").split(" ");
            	}
            	keys.foreach(function(i,val){
                	_storage.removeItem(val);
                });
            },
            clear: function () {
                _storage.clear();
            }
        },
        /*
         * 获取设备的当前地理位置信息
         * onsuccess 定位成功处理
         * onfail 定位失败处理
         */
        findLocation: function (onsuccess, onfail) {
            return new MyLocation(onsuccess, onfail);
        },
        /*
         * 编码表单参数
         * obj 参数对象，键值对的形式
         *
         * 例如：
         *        $.url({a:"a",b:"b"});
         * ==>
         *        a=a&b=b
         */
        url: function (obj) {
            var sb = new StringBuffer();
            for (var i in obj) {
                sb.append(i + "=" +$.encode(obj[i])+ "&");
            }
            sb = sb.toString();
            if (sb.length > 0) {
                return sb.substring(0, sb.length - 1);
            }
            return EMPTY;
        },
        /*
         * 反序列化url参数
         * 例如：
         *        $.reverseUrl("http://zuoche.com/index?a=a&b=b")
         *    ==>
         *        {a:"a",b:"b"};
         *        把参数键值对放置obj对象中返回
         *
         * */
        reverseUrl: function (url) {
            var u =  $.trim(url).split("#")[0], obj = {};
            if (u.contains(ASK) && (u = u.split(ASK)[1].split("&")) && u.length > 0) {
                $.each(u, function (val) {
                    var o = val.split("=");
                    obj[o[0]] = $.decode(o[1]);
                });
            }
            return obj;
        },
        //微信命名控件
        weixin:{},
        /*
         * 创建元素
         * tagName 标签名
         * parentNode 添加到指定的父节点【可选】
         * 返回当前元素
         */
        create: function (tagName, parentNode) {
            var elem = DOC.createElement(tagName);
            if (parentNode) {
                elem.appendTo(parentNode);
            }
            return elem;
        },
        /*
         * 日期转符合中文习惯的字串
         * datestr 日期字串 yyyy-MM-dd
         * adc 用于加减的天数，例如想获取 某日的前一天的日期可以使用-1
         * type 模式化类型，"long"或者"short"，默认"long"
         */
        getdatedesc: function (datestr, adc, type) {
            datestr = datestr.replaceAll("-", "/");
            var wkd = type == "short" ? weekday_short : weekday;
            var today = new Date();
            var dd = new Date(datestr);
            //选择的日期
//            if (today.getDate() == dd.getDate() && adc < 0) {
//                //如果是通过前一天按钮，传来的日期是今天
//                return null;
//            }
            dd.setDate(dd.getDate() + adc);
            //获取adc天后的日期
            var y = dd.getFullYear(), m = dd.getMonth() + 1, d = dd.getDate(), min = today.getHours();
            var diff = Math.round((dd - today) / (1e3 * 3600 * 24));
            //差值，用于判断今天明天后天
            diff = min > 11 ? diff + 1 : diff;
            var day;
            //星期几
            if (diff >= 0 && diff <= 2) {
                day = dayname[diff];
            } else {
                day = wkd[dd.getDay()];
            }
            return [y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d), day];
        },
        //剪切板
        clipboard: CLIPBOARD,
        /*
         * 动态创建css样式
         * */
        addCss:function(selector,rules){
    		if(!CSSOVERRIDE){
    			CSSOVERRIDE = $("<style/>",DOC.head).sheet;
    		}
    		if("addRule" in CSSOVERRIDE) {
    			CSSOVERRIDE.addRule(selector, rules);
    		}else if("insertRule" in CSSOVERRIDE){
    			 CSSOVERRIDE.insertRule(selector + "{" + rules + "}",CSSOVERRIDE.cssRules.length);
    		 }
//    		CSSOVERRIDE.addRule(classname,conent);
        },
        /*
         *颜色运算
         *hex 16禁止颜色值
         *delta 运算增量 整型值
         *opacity 透明度【可选】
         */
        calcColor:function(hex,delta,opacity){
        	var ndelat = delta;
        	if(isType(delta,"number")){
        		ndelat=[delta,delta,delta];
        	}
        	if(isArray(ndelat)){
            	var nhex = $.trim(hex).replace("#",EMPTY);
            	var rgb = [];
            	[[0,2],[2,4],[4,6]].foreach(function(i,v){
            		var vl = parseInt(nhex.substring(v[0],v[1]),16)+ndelat[i];
            		vl=vl>255?255:vl;
            		vl=vl<0?0:vl;
            		rgb.push(vl = vl?vl:0);
            	});
            	var useropacity = isType(opacity,"number") && opacity>=0 && opacity<=1;
            	return "rgb"+(useropacity?"a":EMPTY)+"("+rgb[0]+","+rgb[1]+","+rgb[2]+(useropacity?","+opacity:EMPTY)+")";
        	}
        	return hex;
        },
        /*
         * 查找元素
         * selector 选择器
         * onlyone true:仅有一个结果时返回第一个元素，其他返回元素集合
         * finder:查找器（元素）
         * 没有符合条件的时候返回null
         */
        query: function (selector, onlyone, finder) {
            var res = (finder || DOC).querySelectorAll(selector);
            if (res.length == 0) {
                return onlyone ? null : res;
            } else if (res.length == 1 && onlyone == true) {
                return res[0];
            }
            return res;
        },
        /*
         * 遍历数组
         * arr 数组，
         * fn 处理函数 【注：如果在处理函数中return false则退出循环，外部可以通过Query.each调用,在fn中return false，相当于break】
         */
        each: function (arr, fn) {
            if (isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    var res = fn.call(arr[i], arr[i], i);
                    if (res === false) {
                        break;
                    }
                }
            }
        },
        //失去焦点事件，仅在事件中生效
        blur: fnBlur,
        //是否处于输入框的焦点状态
        isFocus:function(){
        	return $.isTag(DOC.activeElement,"input|textarea");
        },
        /*
         * 过滤筛选数组
         * array 数组或者集合
         * fn 筛选函数，返回值为true则表示符合筛选条件的集合
         * onlyfirstone 是否只返找到的第一个元素而非集合【可选，默认false】
         */
        filter: function (array, fn, onlyfirstone) {
           array = array || [];
           var res=[];
            for (var i = 0; i < array.length; i++) {
            	var v = array[i];
                var ret = fn.call(v, i,v);
                if (true == ret) {
                    if (onlyfirstone) {
                        return array[i];
                    }
                    res.push(array[i]);
                }
            }
            return onlyfirstone?null:res;
        },
        /*新建一个窗口对象*/
        windowPlugin: function(container,options,scroller){
            return new WindowPlugin(container,options,scroller);
        },
        /*去左右空格*/
        trim: function (s) {
            if (null == s || UDF == s) {
                return EMPTY;
            }
            if(typeof s!="string"){
            	return s;
            }
            return s.trim();
        },
        /*
         * location.hash的get,set方法
         *	val:string 指定值时为location.hash赋值，不指定时返回当前的值
         * */
        hash: function (val) {
            if (val) {
                location.hash = val;
            } else {
                return (location.hash || EMPTY).replace("#", EMPTY);
            }
        },
        /*
         * location的hash值更改监听
         * callback：function
         */
        hashchange: function (callback) {
            if (isFn(callback)) {
                window.bind("hashchange", function (e) {
                    callback.call(e, $.hash());
                });
            }
        },
        //判断对象是否为function
        isFunction: isFn,
        //为object拓展属性
        extend: extend,
        //设置水平和垂直方向的位置
        setTransXY:setTranslateXY,
        //设置元素的位移动画时长
        setTranDuration:setTransitionDuration,
        //获取元素矩阵信息
        //获取按照abcded顺序返回数组值（可能是字串也可能为数字）
        getMatrix:function(elem){
			var css = elem.css("-webkit-transform");
			if(!css || css =="none"){
				return [1,0,0,1,0,0];
			}
			return css.replace(/[^-\d.,]/g,"").split(',');
        },
        //设置矩阵的值options的结构{a:a,b:b,c:c,d:d,e:e,f:f}
        setMatrix:function(elem,options){
    		var matrix = $.getMatrix(elem);
    		var values = $.extend({
    				a:matrix[0],
    				b:matrix[1],
    				c:matrix[2],
    				d:matrix[3],
    				e:matrix[4],
    				f:matrix[5]
    		},options);
    		var css = $.template("matrix({{a}},{{b}},{{c}},{{d}},{{e}},{{f}})",values);
    		elem.css("-webkit-transform",css);
        },
        //拓展元素
        QNode:QNode,
        //动画管理器
        cssAnimator: function (elem, cssshow, csshide, options) {
            var opt;
            if (typeof cssshow == "object") {
                opt = cssshow;
            } else {
                opt = {
                    show: cssshow,
                    hide: csshide
                };
                if (typeof options == "object"){
                	$.extend(opt,options);
                }
            }
            return new CssAnimator(elem, opt);
        },
        /*
         * 字串模板替换
         * str，替换的模板内容,例如:我的名字{{name}}，年龄{{age}}
         * data ,Object类型，例如：{"name":"毛毛","age":3}
         * */
        template: function (str, data) {
            var string = $.trim(str);
            return string.replace(/\{\{\w+\}\}?/g, function (matchs) {
                var returns = data[matchs.replace(/\{\{|\}\}/g, "")];
                return (returns + "") == "undefined" ? "" : returns;
            });
        },
      /*
       * 当前时间是否处夜间
       * nightrange 指定夜间时间范围【可选】，默认为 [[0, 480], [1200, 1440]]
       */
        isInNight:function(nightrange){
        	 var date = new Date();
             var DARKRANGES =nightrange ||  [[0, 480], [1200, 1440]];
             //夜间模式配置
             var mins = date.getHours() * 60 + date.getMinutes();
             return DARKRANGES.filters(function () {
                 return mins > this[0] && mins < this[1];
             }).length>0;
        }
    });
    /*给window扩展属性和方法*/
    extend(window, bindObject, {
        StringBuffer: StringBuffer
    });
    /*给document扩展属性和方法*/
    extend(DOC, bindObject);
    /*
     * 格式日期【Date的扩展函数】
     *
     * 把Date 转化为指定格式的String  月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     *    例如：
     *    (new Date()).Format("yyyy-MM-dd hh:mm:ss.S"); // 2015-04-028 08:09:04.423
     *    (new Date()).Format("yyyy-M-d h:m:s.S");// 2015-04-028 8:9:4.18
     *    fmt :格式
     *    fixzoneOffset ：修正为指定的时区分钟数，例如，东8区为 -8*60，则 date.format("HH:mm",-480)
     */
    Date.prototype.format = function (fmt,fixzoneOffset) {
    	var _this = this;
    	if(typeof fixzoneOffset =="number"){
    		var zone =this.getTimezoneOffset();
    		if(zone!=fixzoneOffset){
    			_this =new Date(this);
    			_this.setMinutes(this.getMinutes()+zone-fixzoneOffset);
    		}
    	}
        var o = {
            "M+": _this.getMonth() + 1,
            "d+": _this.getDate(),
            "h+": _this.getHours(),
            "H+": _this.getHours(),
            "m+": _this.getMinutes(),
            "s+": _this.getSeconds(),
            "q+": Math.floor((_this.getMonth() + 3) / 3),
            S: _this.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (_this.getFullYear() + EMPTY).substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr((EMPTY + o[k]).length));
            }
        }
        return fmt;
    };
    /*
     * 快捷入口
     */
    function Query(selector, finder, flag) {
        //ready的快捷入口
        if (isFn(selector)) {
            $.ready(selector);
            return $;
        }
        if (typeof selector == "string") {
            //create元素的快捷入口
            if (selector.startWith("<") && selector.endWith(">")) {
                return $.create(selector.substring(1, selector.length - 2), finder);
            }
            //元素搜索
            if (arguments.length == 1) {
                flag = true;
            } else if (typeof finder == "boolean") {
                flag = !finder;
                finder = null;
            } else if (typeof finder == "object" && finder.tagName) {
                //指定了查找器
                if (typeof flag == "boolean") {
                    flag = !finder;
                } else {
                    flag = true;
                }
            }
            return $.query(selector, flag, finder);
        }
    }

    /*
     * 失去焦点
     */
    function fnBlur() {
    	if($.isFocus()){
    		DOC.activeElement.blur();
    	}
    }

    /*
     * 遍历
     * callback 遍历函数
     * isreserve 是否反转遍历
     */
    function fnForeach(callback, isreserve) {
        if (isreserve === true) {
            for (var i = this.length - 1; i >= 0; i--) {
                if (callback.call(this[i], i, this[i]) === false) {
                    break;
                }
            }
        } else {
            for (var i = 0; i < this.length; i++) {
                if (callback.call(this[i], i, this[i]) === false) {
                    break;
                }
            }
        }
    }

    //判断是否为方法
    function isFn(f) {
        return typeof f == "function";
    }
    /*
	 * 设置动画过渡时间
	 * 
	 * @param view
	 *            动画元素
	 * @param duration
	 *            过渡时间
	 * @param timingfunc
	 *            缓动
	 * @returns
	 */
	function setTransitionDuration(view,duration,timingfunc){
		var val= $.round2(duration,0)+"ms";
		view.css({
			"transitionDuration":val,
			"webkitTransitionDuration":val
		});
		if(undefined !=timingfunc){
			view.css({
				"transitionTimingFunction":timingfunc,
				"webkitTransitionTimingFunction":timingfunc
			});
		}
	}
	
	/*
	 * 设置位移量
	 * view：dom 位移元素
	 * px：integer 横向位移量
	 * py：integer 纵向位移量
	 */
	function setTranslateXY(view,px,py){
		$.setMatrix(view,{e:px,f:py});
	}
	
	
    /*为数组【集合】扩展方法*/
    extend(Array.prototype, QCollection, {
        /*数组中是否包含指定元素*/
        has: function (o) {
            return this.idxof(o) != -1;
        },
        /*清空集合*/
        clear: function () {
            this.length = 0;
            return this;
        },
        /*
         * 在指定的位置插入元素
         * index:integer指定位置
         * item:object插入的元素
         * 
         *返回原数组|集合
         */
        insert: function (index, item) {
            this.splice(index, 0, item);
            return this;
        },
        /*
         * 根据下标删除数组元素
         * idx:integer 下标
         */
        removeByIndex: function (idx) {
            if (idx < 0 || idx >= this.length) {
                return this;
            }
            this.splice(idx, 1);
            return this;
        },
        /*
         * 删除数组元素
         *  o：object元素相
         */
        remove: function (o) {
            return this.removeByIndex(this.idxof(o));
        },
        //简单结构数组元素唯一处理
        unique: function () {
            var arr = $.merge(this, []);
            this.length = 0;
            var hash = {};
            for (var i = 0, elem; (elem = arr[i]) != null; i++) {
                if (!hash[elem]) {
                    this.push(elem);
                    hash[elem] = true;
                }
            }
            return this;
        },
        meger:function(){
        	var array = [];
            for (var i = 0; i < arguments.length; i++) {
                var elem = arguments[i];
                Array.prototype.push.apply(array, elem);
            }
        }
    });
    extend(HTMLCollection.prototype, QCollection);
    extend(NodeList.prototype, QCollection);
    /* 字符拼接类*/
    function StringBuffer() {
        var buffer = [];
        this.append = function (s) {
            buffer.push(s);
            return this;
        };
        this.clear = function () {
            buffer.length = 0;
            return this;
        };
        this.toString = function () {
            return buffer.join(EMPTY);
        };
    }

    /*为String对象扩展方法和属性*/
    extend(String.prototype, {
        /*替换全部字符*/
        replaceAll: function (reallyDo, replaceWith, ignoreCase) {
            if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
                return this.replace(new RegExp(reallyDo, ignoreCase ? "gi" : "g"), replaceWith);
            } else {
                return this.replace(reallyDo, replaceWith);
            }
        },
        /*字符串中是否包含特殊字符*/
        hasSymbol: function () {
            return this.replace(REG_SYMB, EMPTY) != this;
        },
        /*末尾匹配*/
        endWith: function (s) {
            return !$.isempty(s) && s.length <= this.length && this.substring(this.length - s.length) == s;
        },
        /*开始匹配*/
        startWith: function (s) {
            return !$.isempty(s) && s.length <= this.length && this.substr(0, s.length) == s;
        },
        /*字串是否包含指定字符*/
        contains: function (s) {
            return -1 != this.indexOf(s);
        },
        /*去两边的空格*/
        trim: function () {
            return this.replace(MATCH_TRIM, EMPTY);
        },
        /*获取字符串的实际长度（区分中英文）*/
        realLength: function () {
            var cArr = this.match(MATCH_REALLENGTH);
            return this.length + (cArr == null ? 0 : cArr.length);
        }
    });
    /*为DOM的节点prototype扩展方法*/
    extend(QNode.prototype, bindObject, {
        /*
         * 加载css
         * href:string路径，多个用数组[href,href]
         * callback :function回调
         */
        loadCSS: function (href, done,fail) {
            var urls = isArray(href) ? href : [$.trim(href)];
            for (var i = 0; i < urls.length; i++) {
                var url = $.trim(urls[i]);
                if (url) {
                    var attrs = {
                        rel: "stylesheet",
                        type: "text/css",
                        href: url
                    };
                    loadObject(this, "link", attrs, "href", url, done,fail);
                }
            }
            return this;
        },
        /*
         * 加载js【跨域或者跨协议请使用$.getJSONP】
         * src:【string】路径，多个用数组[src,src]
         * done :【fn】成功回调
         * fail :【fn】失败回调
         */
        loadJS: function (src, done,fail) {
            var urls = isArray(src) ? src : [$.trim(src)];
            for (var i = 0; i < urls.length; i++) {
                var url = $.trim(urls[i]);
                if (url) {
                    var attrs = {
                        type: "text/javascript",
                        src: url
                    };
                    loadObject(this, "script", attrs, "src", url, done,fail);
                }
            }
            return this;
        },
        /*轻拍事件*/
        tap: function (callback, options) {
            return this.onTap(null, callback, options);
        },
        /*长按事件，参考onLongTap*/
        longTap: function (callback, options) {
        	var opts = $.extend({
        		holdtime:1000//默认长按的时间1000毫秒
        	},options);
        	return this.onTap(null, callback, opts);
        },
        /*双击(按下指定毫秒内完成)事件*/
        doubleTap: function (callback) {
            return this.onTaps(null, callback);
        },
        /*多拍（按下的限定毫秒事件的完成，pc端的模拟最多支持双击）*/
        taps: function (callback, tapCount) {
            return this.onTaps(null, callback, tapCount);
        },
        /*
         * 长按事件（pc端的模拟事件会触发click，所以不建议直接使用click和longTap同时使用，建议使用tap代替click）
         * selector 委托选择器
         * handler 处理函数
         * selector 委托选择器
         */
        onLongTap:function(selector,handler,options){
        	var opts = $.extend({
        		holdtime:1000//默认长按的时间1000毫秒
        	},options);
        	return this.onTap(selector,handler,opts);
        },
        /*
         * 多按事件（移动端模拟多拍事件）
         * selector：string选择器
         * callback：事件监听函数
         * tapCount：integer申明拍击次数【不指定时默认为2】
         */
        onTaps: function (selector, callback, tapCount) {
            tapCount = tapCount || 2;
            var dataselector = selector || "this";
            var _this = this;
            this.data("eventtaps", dataselector);
            var mRecord = new $.touchRecorder(10);
            var executes = 0;
            //持续响应事件计数器
            var timestamp = 0;
            //记录时间
            this.on("touchstart,mousedown", selector, function (e) {
            	if(e.type=="mousedown" && (e.which!=1|| touchAble)){
                	return;
                }
                var _lasttime = timestamp;
                timestamp = e.timeStamp;
                if (executes > tapCount || timestamp - _lasttime > tapInTime) {
                    executes = 0;
                }
                if (executes == 0) {
                    mRecord.init(e);
                }
                executes++;
            }).on("touchend,mouseup", selector, function (e) {
            	if(e.type=="mouseup" && (e.which!=1|| touchAble)){
                	return;
                }
                mRecord.update(e);
                if (e.timeStamp - timestamp < tapInTime && executes == tapCount) {
                    if (!mRecord.isMoved()) {
                        fnnoscroll(e);
                        e.stopPropagation();
                        return fnFireTaps(_this, this, e, callback);
                    }
                }
            });
            return this;
        },
        /*
         * 委托tap事件（移动端模拟点击事件）
         * selector 选择器
         * tap 事件处理函数
         * options 其他参数选项
         */
        onTap: function (selector, tap, options) {
            if (!tap) {
                return this;
            }
            var ops = extend({
                intime: tapInTime,
                //tap时间限制
                //keepfocus: false,
                //是否释放后出发(针对长按事件)
                //是否焦点事件（默认处理，tap后，键盘会隐藏）
                touchstart: emptyFn,
                //触控开始的处理
                touchend: emptyFn
                //允许移动的距离
                //allowmove:5,
                //长按的时间
               // holdtime :0
            }, options);
            var dataselector = selector || "this";
            var _this = this;
            var longtapid;
            var recorder = $.touchRecorder(ops.allowmove);
            var eventelem;
            this.on("touchstart,mousedown", selector, function (e) {
            	if(e.type=="mousedown"  && (e.which!=1|| touchAble)){
                	return;
                }
            	eventelem = e.target;
            	var onelem=this;
                //清除tap的定时器
                recorder.init(e);
                if(_this.data("firedmark")){
                	_this.data("firedmark",0);//初始化长按标记
                }
                if(ops.holdtime){
                	//长按事件处理
                	longtapid = setTimeout(function(){
                		  if (!recorder.isMoved() && !_this.data("firedmark")) {
                			  _this.data("firedmark",3);//长按处理完成
                              fnnoscroll(e);
                              if (ops.keepfocus != true) {
                                  fnBlur();
                              }
                              return fnFireTap(dataselector, _this, onelem, e, ops.intime, tap);
                          }
                	},ops.holdtime);
                }
                return ops.touchstart.call(this, e);
            }).on("touchmove,mousemove", selector, function (e) {
            	if(e.type=="mousemove"  && (e.which!=1|| touchAble)){
                	return;
                }
                if (!recorder.isMoved()) {
                    recorder.update(e);
                }
            }).on("touchend,mouseup", selector, function (e) {
            	if(e.target!=eventelem){
            		return;
            	}
            	if(e.type=="mouseup" && (e.which!=1|| touchAble)){
                	return;
                }
                recorder.update(e);
                ops.touchend.call(this, e);
                //标记结束了
                if (!recorder.isMoved()) {
                	//长按时间不足不执行事件
                	if(ops.holdtime){
                		clearTimeout(longtapid);
                		return;
                	}
                    if(_this.data("firedmark")==3){
                    	//触发过长按事件，其他的不再处理
                    	return;
                    }
                    _this.data("firedmark",1);
                    fnnoscroll(e);
                    if (ops.keepfocus != true) {
                        fnBlur();
                    }
                    return fnFireTap(dataselector, _this, this, e, ops.intime, tap);
                }
            });
            return this;
        },
        /*
         * 滑动
         * callback：回调函数
         * preventstart：是否在阻止滑动的默认事件
         * 参数说明：
         *
         * 回调参数说明：
         * event：事件
         * touchRecorder：事件记录器
         *funciton callback(event,touchRecorder) {
         * preventstart 是否默认事件
         * */
        slide: function (callback, preventstart) {
            return TouchSlider.call(this, {
                callback: callback,
                preventstart: preventstart
            });
        },
        onSlide: TouchSlider,
        /*
         * 设置[获取]元素的样式
         *  className 样式名
         *  styleValue 样式值
         *  【注意】如果两个参数都为空则返回经过包装后的元素的的当前的样式
         *  如果cn为纯对象，则遍历对象属性，并且赋值
         */
        css: function (className, styleValue) {
            var rclass = typeof className;
            var rstyle = typeof styleValue;
            //同时多个属性赋值 例如：$.css({color:"red",zIndex:5});
            if (rclass == "object") {
                for (var p in className) {
                    if (seleprops.has(className)) {
                        this[p] = className[p];
                    } else {
                        this.style[p] = className[p];
                    }
                }
            } else if (rclass == "string" && rstyle == "undefined") {
                var style;
                //获取样式的值 例如：$.css("color");
                if (seleprops.has(className)) {
                    return this[className] + EMPTY;
                } else {
                    style = (this.currentStyle || window.getComputedStyle(this, null))[className];
                }
                if ("zIndex" != className && (!style || style == "auto")) {
                    if (styleprops.has(className)) {
                        return this[fixpre(className)] + "px";
                    } else if (className.contains("margin") && style == "auto") {
                        return 0 + "px";
                    }
                } else {
                    return style;
                }
            } else if (rclass == "string" && isType(styleValue, "string|number")) {
                //单个样式赋值 例如：$.css("color","red");
                if (seleprops.has(className)) {
                    this[className] = styleValue;
                } else {
                    this.style[className] = styleValue;
                }
            }
            return this;
        },
        /*获取元素距离文档顶部的距离*/
        distanceTop: function () {
            var offset = this.offsetTop;
            var p = this;
            while (p = p.offsetParent) {
                offset += p.distanceTop();
            }
            return offset;
        },
        /*获取元素距离文档右边的距离*/
        distanceLeft: function () {
            var offset = this.offsetLeft;
            var p = this;
            while (p = p.offsetParent) {
                offset += p.distanceLeft();
            }
            return offset;
        },
        /*获取元素距离文档顶部和右边的距离*/
        distance: function () {
            return {
                top: this.distanceTop(),
                left: this.distanceLeft()
            };
        },
        /*判断元素是否具有指定的样式名*/
        hasClass: function (cn) {
        	return this.classList.contains(cn);
        },
        /*给元素添加样式名*/
        addClass: function (cn) {
            var _this = this;
            var clazz = $.trim(cn).replace("/^\\s+$/g", " ").split(" ");
           for(var i=0;i<clazz.length;i++){
        	   if(clazz[i]){
        		   _this.classList.add(clazz[i]);
        	   }
           }
            return _this;
        },
        /*移除元素上指定的样式名*/
        removeClass: function (cn) {
            var _this = this;
            var clazz = $.trim(cn).replace("/^\\s+$/g", " ").split(" ");
            for(var i=0;i<clazz.length;i++){
            	if(clazz[i]){
            		_this.classList.remove(clazz[i]);
            	}
            }
            return _this;
        },
        /*添加或移除样式名*/
        toggleClass: function (cn) {
        	this.classList.toggle(cn);
            return this;
        },
        /*是否包含指定的元素*/
        has: function (elem) {
            return this.contains ? this.contains(elem) : !!(this.compareDocumentPosition(elem) & 16);
        },
        /*
         * 获取元素的文本 例如：$("#demo").textes();
         * 给元素的文本赋值 例如：$("#demo").textes("text");
         */
        textes: function (text) {
            var prop= "textContent";
            if (isNormalType(text)) {
            	this[prop] = text;
            	return this;
            } else {
            	return this[prop];
            }
        },
        /*
         * 查找该元素的上一个兄弟元素
         * tagName【可选】支持查到上一个指定tagName的元素
         */
        previous: function (tagName) {
            return nextPrevious(this, "previous", "previousSibling", tagName);
        },
        /*
         * 查找该元素的下一个兄弟元素
         * tagName【可选】支持查到下一个指定tagName的元素
         */
        next: function (tagName) {
            return nextPrevious(this, "next", "nextSibling", tagName);
        },
        /*
         * 【推荐使用document.querySelector或者document.querySelectorAll】
         *
         * 在元素下查找元素
         * flag：【true】如果结果是个数组，并且结果只有一个是是否返回数组而非第一个元素
         * 默认情况返回返回第一个元素
         */
        find: function (selector, flag) {
            if (UDF == flag) {
                flag = false;
            }
            return $.query(selector, !flag, this);
        },
        /*
         * selector 选择器
         * onlyone 是否值返回第一个结果
         */
        query: function (selector, onlyone) {
            return $.query(selector, onlyone, this);
        },
        /*
         * 获取表单元素的值 $("#input").val();
         * 给表单元素赋值 $("#input").val("text");
         */
        val: function (v) {
            if (isNormalType(v)) {
                this.value = v;
                return this;
            } else {
                return $.trim( this.value);
            }
        },
        /*获取元素的html内容*/
        html: function (html) {
            if (isNormalType(html)) {
                this.innerHTML = html;
                return this;
            } else {
                return $.trim(this.innerHTML);
            }
        },
        /*
         * 获取属性的值 例如：$("#demo").attr("id");
         * 给属性赋值
         *    例如：单个赋值：$("#demo").attr("id","id");
         *    例如：多个赋值 $("#demo").attr({id:"id",name:"name"});
         */
        attr: function (attr, value) {
            if (2 == arguments.length && isNormalType(attr) && isNormalType(value)) {
                this.setAttribute(attr, value);
            } else if (1 == arguments.length) {
                if (isType(attr, "object")) {
                    for (var p in attr) {
                        this.setAttribute(p, attr[p]);
                    }
                } else {
                    return $.trim(this.getAttribute(attr));
                }
            }
            return this;
        },
        /*
         * dom属性值转数值
         */
        attrNum:function(attr){
        	var val = this.attr(attr)||0;
        	return isNaN(val)?val:parseFloat(val);
        },
        //属性值设置
        isProp: function (attr) {
            var val = this.attr(attr);
            return val == "true" || val == "1";
        },
        /*
         * 移除元素的属性 同时移除多个用空格隔开
         * 例如：$("#demo").removeAttr("name");
         */
        removeAttr: function (attrs) {
            var _this = this;
            var _attrs = attrs.replace("/^\\s+$/g", " ").split(" ");
            for(var i=0;i<_attrs.length;i++){
            	_this.removeAttribute(_attrs[i]);
            }
            return this;
        },
        /*
         * 显示或隐藏元素【仅适用于样式display为block的元素】
         * 显示状态时隐藏，隐藏状态时显示
         */
        toggle: function (type) {
            return this.css("display", "block" == type || "none" == type ? type : this.isHidden() ? "block" : "none");
        },
        /*显示元素*/
        showView: function () {
            return this.toggle("block");
        },
        /*隐藏元素*/
        hideView: function () {
            return this.toggle("none");
        },
        /*判断元素是否隐藏*/
        isHidden: function () {
            return "none" === this.css("display");
        },
        /*判断元素是否显示*/
        isVisible: function () {
            return !this.isHidden();
        },
        /*删除当前元素*/
        remove: function () {
            this.parent().removeChild(this);
        },
        /*清空元素的子元素*/
        empty: function () {
            this.childNodes.foreach(function () {
                this.remove();
            }, true);
            return this;
        },
        /*
         * 该元素下指定仅指定的view赋予classname,常用于模拟的select控件
         * view:dom|index:integer 需要赋予样式的视【或者视图下表】
         * classname:string 样式名赋予的css样式名称
         * listmitselector 限定的子类选择器【不指定时，默认为所有的字迹】
         * 
         * 返回结果 view如果已经不存在指定的样式，返回true,否则返回false
         * */
        keepSingleClass:function(view,classname,listmitselector){
        	var views = $.trim(listmitselector)?this.query(listmitselector):this.children;
        	var elem =view;
        	if(isType(view,"number")){
        		elem = views[view];
        	}
        	if(!elem.hasClass(classname)){
        		views.foreach(function(){
        			this.removeClass(classname);
        		});
        		return !!elem.addClass(classname);
        	}
        	return false;
        },
        /*
         * DOM元素克隆
         * deep:boolean 是否深度克隆【深度克隆，会复制子节点的信息】
         * 例如：$("#demo").clone();
         *            $("#demo").clone(true);
         */
        clone: function (deep) {
            return this.cloneNode(deep);
        },
        /*
         * 把元素插入指定的节点下面
         * 例如：把新创建的元素添加到文档末尾
         *        var div = $("<div/>");
         *        div.appendTo(DOC.body);
         */
        appendTo: function (node) {
            node.appendNode(this);
            return this;
        },
        appendNode: function (node) {
            if (isNormalType(node)) {
                this.insertAdjacentHTML("beforeend", node);
            } else if(node && node.tagName){
                this.appendChild(node);
            }
            return this;
        },
        /*添加元素*/
        append: function (node) {
            return this.appendNode(node);
        },
        /*
         * 给元素绑定一个值（或者重设），需要指定一个key【string】，和一个value【任意类型】
         * 例如：
         *        $("#demo").data("key",value);
         * 获取元素绑定的值
         * 例如：
         *        $("#demo").data("key");
         */
        data: function () {
            var args = arguments, len = args.length;
            if (len == 1 && !this._datas_) {
                return;
            }
            if (len == 0) {
                return this._datas_;
            }
            var d = this._datas_ = this._datas_ || {};
            if (len == 1) {
                return d[args[0]];
            }
            if (len == 2) {
                d[args[0]] = args[1];
                return this;
            }
        },
        /*
         *
         * 延迟执行函数【队列函数】，在指定的时间【毫秒】之后执行某件事情
         * 【也可以不指定事件，则后续队列中的动作将延迟到指定的时间之后执行】
         * 例如：
         *        $("body").delay(1000,function(){
         * 				console.info("do something");
         * 		});
         *
         */
        delay: function (duration, hander) {
            var _this = this, timer, duration = duration || 300;
            // 过度时间
            if (typeof duration === "number") {
                if (isFn(hander)) {
                    if (duration > 0) {
                        setTimeout(hander, duration);
                    } else {
                        _this.dequeue();
                    }
                } else {
                    return this.queue(function () {
                        _this.delay(duration, function () {
                            _this.dequeue();
                        });
                    });
                }
            }
            return this;
        },
        /*
         * 获取元素的子类元素集合
         *  selector 指定选择器
         */
        childs: function (selector) {
            if (!selector) {
                return this.children;
            }
            var id = this.id || "_QueryId_"+$.timestamp(); 
            if(!this.id){
            	this.id = id;
            }
            return this.parent().query("#"+id+">"+selector);
        },
        /*
         * 获取元素父节元素
         * selector:指定简单级选择器，可以获取第一个符合条件的父辈元素
         */
        parent: function (selector) {
            if (!selector) {
                return this.parentNode;
            }
            var isclass = selector.startWith(".");
            var elem = this;
            if (isclass) {
                selector = selector.replace(".", EMPTY);
            }
            while (elem = elem.parentNode) {
                if (isclass && elem.hasClass(selector) || $.isTag(elem, selector)) {
                    return elem;
                }
            }
        },
        /*
         * 判断元素是否在可见区域
         * delta 偏移量
         * flag 0:纵向，1：横向，2,：纵向和横向
         */
        inScreen: function (delta,flag) {
        	if(this.offsetHeight<=0){
        		return false;
        	}
        	var rect = this.getBoundingClientRect();
        	var edt = DOC.documentElement;
        	var bdtop =rect.top;
        	var delh = edt.clientHeight+(delta||0);
        	var vertical =  bdtop+this.offsetHeight>=0 &&  bdtop<=delh;
        	if(!flag){
        		return vertical;
        	}
        	var bdlleft =rect.left;
        	var delw = edt.clientWidth+(delta||0);
        	var horizon =  bdlleft+this.offsetWidth>=0 &&  bdlleft<=delw;
        	if(flag===1){
        		 return horizon;
        	}
    		return vertical && horizon;
        },
        /*
         * 元素的线性队列
         * hander 把一个函数放入队列中去执行
         * 例如：
         *        $("body").queuey(function(){
         * 			//do something
         * 			this.dequeue();
         * 		});
         * 在方法执行完后，需要在内部调用this.dequeue()，否则后续的队列任务不会执行
         */
        queue: function (hander) {
            this._queue = this._queue || [];
            //当前的队列
            if (isFn(hander)) {
                this._queue.push(hander);
                return this.nextHander();
            } else if (typeof hander === "number" && hander >= 0 && hander < this._queue.length) {
                return this._queue[0];
            } else {
                return this._queue;
            }
        },
        /* 执行队列中下一个任务【一般供内部或者开发插件使用】*/
        nextHander: function () {
            var isExecute = !!this.isExecute;
            //是否有任务在处理
            if (!isExecute && this.queue().length > 0) {
                this.isExecute = true;
                this.queue().shift().call(this);
            }
            return this;
        },
        /*
         * 通知通知队列中的下一个任务执行【一般在队列的任务结束时调用】
         */
        dequeue: function () {
            this.isExecute = false;
            return this.nextHander();
        },
        /*清空队列*/
        removeQueue: function () {
            this.queue().clear();
            return this;
        },
        /*
         * 简单的事件委托
         * eventtype 事件类型
         * selector 选择器，【可忽略，此时，事件在该元素上总是有效】
         * handler 事件处理
         * isbubble :boolean 是否不再冒泡过程中执行
         *
         * */
        on: function (eventtype, selector, handler,isbubble) {
            if (isFn(selector)) {
                handler = selector;
                selector = null;
            }
            if (isFn(handler)) {
                var eventtypes = eventtype.split(",");
                if (!selector) {
                    selector = BIND_SELF;
                }
                if (!this._dispatchevent) {
                    this._dispatchevent = new DispatchEvent(this);
                }
                for (var k = 0; k < eventtypes.length; k++) {
                    var selectors = selector.split(",");
                    for (var i = 0; i < selectors.length; i++) {
                        var st = $.trim(selectors[i]);
                        if (st.length > 0) {
                            this._dispatchevent.add(eventtypes[k], st, handler,isbubble);
                        }
                    }
                }
            }
            return this;
        },
        /*
         * 注销委托的事件
         * eventtype 事件类型
         * selector 简单选择器
         * handler 事件处理【为空时，清除符合选择器的全部绑定函数】
         */
        off: function (eventtype, selector, handler) {
            if (isFn(selector) || !selector) {
                if (isFn(selector)) {
                    //忽略选择器
                    handler = selector;
                }
                selector = BIND_SELF;
            }
            var eventtypes = eventtype.split(",");
            if (this._dispatchevent) {
                if (eventtype && selector) {
                    for (var k = 0; k < eventtypes.length; k++) {
                        var selectors = selector.split(",");
                        for (var i = 0; i < selectors.length; i++) {
                            var st = $.trim(selectors[i]);
                            if (st.length > 0) {
                                this._dispatchevent.remove(eventtypes[k], st, handler);
                            }
                        }
                    }
                }
            }
            return this;
        },
        //当元素展示在可见范围的时间同时
        onInViewport: function (options) {
            var ops = extend({
                //符合条件时才通知处理，不指定条件时，默认返回true
                condition: function () {
                    return true;
                },
                //时间处理函数
                callback: emptyFn
            }, options);
            var _this = this;
            var timer;
            var handler = function () {
            	if(_this.isProp("data-unbindonInViewport")){
                    window.unbind("scroll", handler);
            		return;
            	}
                if (ops.condition() === true && _this.inScreen(ops.delta)) {
                	clearTimeout(timer);
                    timer = setTimeout(function () {
                        if (ops.condition() && _this.inScreen(ops.delta)) {
                            ops.callback();
                        }
                    },100 );
                }
            };
            window.bind("scroll", handler);
        },
        //页面前进
        pageforward: function (delay,pagetitle,hash) {
            var _t = this;
            var curtitle = DOC.title;
            var forwardtitle = pagetitle||curtitle;
            var now = new Date();
            var newhash = hash||($.timestamp() + "").split(EMPTY).reverse().join(EMPTY);
            _t.attr({
                hashbefore: $.hash(),
                hashafter: newhash,
                titlebefore: curtitle,
                titleafter: forwardtitle
            });
            var fn = function () {
                HASHSTACK.unshift(_t);
                $.hash(_t.attr("hashafter"));
                changeWindowTitle(_t.attr("titleafter"));
            };
            if (typeof delay == "number") {
                setTimeout(fn, delay);
            } else {
                fn();
            }
            return _t;
        },
        //监听页面后退
        onpageback: function (handler) {
            if (this.tagName && isFn(handler) && !HASHELEMS.has(this)) {
                HASHELEMS.push({
                    elem: this,
                    handler: handler
                });
            }
            return this;
        },
        //自定义弹框页面，底部弹出（不会在外层套dom元素）【基于弹框】
        customPageUp: function (option) {
            var opt = $.extend(true, {
                duration: 300,
                iscustom: true
            }, option);
            return this.getPageUp(opt);
        },
        //元素页页面化(底部弹出)【基于弹框】
        getPageUp: function (option) {
            var opt = $.extend(true, {
                animation: "slideup"
            }, option);
            return this.getPage(opt);
        },
        /*
         * 显示弹框(单例模式，可以更新标题，内容，和按钮，是否自动黑暗模式)【基于弹框】
         * 默认标题：温馨提示，title=""时，不显示标题
         * autoDarkMode默认为true
         * 不指定按钮是，默认展示现确定按钮
         * 在onEnter和onCancel中，如果指定了回调函数，需要在回调中使用this.hide()来关闭弹框
         * option为obj对象时，已option中的参数为准，当option为字串时，option的值作为content用来展示
         * 更多的参数配置详情#WindowPlugin对象的option配置
         */
        showModal: function (option) {
            var cnt = option || "";
            var op =isType(cnt,"string")? { content: cnt } : cnt;
            if(isType(op.content,"string")){
            	op.content = $.trim(op.content).replace(/(\r\n)|(\n)/g,"</br>");
            }
            op =  $.extend({
            	title: "温馨提示",
            	autoDarkMode:false,
            	defButton:"enter",//弹框默认按钮,可选值"enter"|"cancel"|"",为空时默认没有按钮，如果需要自定义按钮，设置为空即可
            	onShow:function(frame){
            		if(!frame.offsetHeight){
            			return;
            		}
            		//disabledAutowidth仅针对快速弹框模式
            		var conview;
    				if(!op.enableMax && !op.disabledAutowidth){
    					conview = frame.find("._ourlinc_window_content");
    					if(conview){
    						conview.removeClass("_winbox_minwidth");
    						if(frame.offsetHeight/frame.offsetWidth<1.2){
    							conview.addClass("_winbox_minwidth");
    						}
    					}
    				}
            		var view = frame.find("._ourlinc_winbox_content");
            		if(view){
            			var vheight = view.offsetHeight - parseInt(view.css("padding-top")) - parseInt(view.css("padding-bottom"));
            			var line = Math.round(vheight/parseInt(view.css("line-height")));
            			view.css("text-align",line>1?"justify":"center");
            			if(op.iscustomModal && conview){
            				var customview = view.children[0];
            				if(customview){
            					conview.css("max-width",customview.css("max-width"));
            				}
            			}
            		}
        			var tview = frame.find("._ourlinc_winbox_title");
    				if(tview){
            			tview[frame.offsetHeight>260?"addClass":"removeClass"]("line_bottom");
    				}
            	}
            },op);
            if(op.iscustomModal){
            	$.extend(op,{
            		title:"",
            		defButton:""
            	});
            }
            if(!op.iscustom&&op.enableMax){
            	op.css=op.css||{};
            	op.css["border-radius"]="0";
            	op.title=EMPTY;
            }
            var page = this.data("wool-showmodal");
            if (page) {
            	page.setAutoDarkMode(op.autoDarkMode);
                page.run(function (frame) {
                    var inframe = frame.find("._ourlinc_winbox_content");
                    if (inframe) {
                        inframe.empty();
                        if (op.content) {
                            inframe.appendNode(op.content);
                        }
                        var intitle = frame.find("._ourlinc_winbox_title");
                        if (op.title) {
                            if (!intitle) {
                                intitle = $("<div/>").addClass("_ourlinc_winbox_title");
                                inframe.parent().insertBefore(intitle, inframe);
                            }
                            intitle.empty().appendNode(op.title).removeClass("hidden");
                        }else if(intitle){
                        	intitle.addClass("hidden");
                        }
                        this.clearButtons();
                    }
                });
            } else {
                var opt = $.extend(true, {
                    enableDestroy: false
                }, op);
                page = $.showModalExt(opt);
                this.data("wool-showmodal", page);
            }
            if(op.defButton=="enter"){
            	page.onEnter();
            }else if(op.defButton=="cancel"){
            	page.onCancel();
            }else if(op.showOnInit){
            	page.show();
            }
            return page;
        },
        //元素页页面化(单利)【基于弹框】
        getPage: function (option) {
            var page = this.data("wool-pagemodal");
            if (!page) {
                var opt = $.extend(true, {
                    showOnInit: false,
                    content: this,
                    animation: "slideleft"
                }, option);
                page = $.showPage(opt);
                this.data("wool-pagemodal", page);
            }
            return page;
        }
    });
    //页面动画管理
    function CssAnimator(elem, options) {
        var _this = this;
        //默认参数
        var opt = $.extend({
            show: EMPTY,
            hide: EMPTY
            //,hash:"",//指定hash
            //,windowtitle:""//窗口标题，有调用onpageback的情况有效
            //,istrans//动画是否使用transition属性
            //,isresverback是否反正显示和隐藏模式
            //,toggleclass:""样式切换显示与隐藏的样式
        }, options);
        //过渡动画
        var bindName = "webkitAnimationEnd";
        var naiName = "webkitAnimationName";
        var mState = 0;
        var tmName = "webkitAnimationTimingFunction";
        var RUNS = [];//动画停止后的回调集合
        if (opt.istrans) {
            bindName = "webkitTransitionEnd";
            tmName = "webkitTransitionTimingFunction";
        }
        //延迟执行回调函数，建议动画过程中需要执行的函数动画结束后执行，以保证交互的流畅性
        function handleRuns() {
            while (RUNS.length > 0) {
                RUNS.pop().call(_this, elem);
            }
        }
        function toggle(isshow) {
            var inshow = _this.isshow();
            if (isshow && !inshow || !isshow && inshow) {
                mState = 1;
                if (isshow && opt.tmshow) {
                    elem.css(tmName, opt.tmshow);
                }
                if (!isshow) {
                    elem.css(tmName, opt.tmhide);
                }
                if (isshow && isFn(opt.onshow)) {
                    opt.onshow.call(_this, elem);
                }
                if (!isshow && isFn(opt.onhide)) {
                    opt.onhide.call(_this, elem);
                }
                if (opt.pageback && (!opt.isresverback && isshow || opt.isresverback && !isshow)) {
                    elem.pageforward(opt.delay || 0,opt.windowtitle,opt.hash);
                }
                if (isshow) {
                    if (opt.cantoggle) {
                    	if(opt.toggleclass){
                    		elem.removeClass(opt.toggleclass);
                    	}else{
                    		elem.showView();
                    	}
                    }
                }
                if (opt.istrans) {
                    if (isshow) {
                        elem.addClass(opt.show);
                    } else {
                        elem.removeClass(opt.show);
                    }
                } else {
                    elem.css(naiName, opt[isshow ? "show" : "hide"]);
                }
                if (isshow && isFn(opt.onshowed)) {
                    opt.onshowed.call(_this, elem);
                }
                if (!isshow) {
                    if (isFn(opt.onhided)) {
                        opt.onhided.call(_this, elem);
                    }
                    fnBlur();
                }
            }
            return _this;
        }
        //监听动画的结束
        elem.bind(bindName, function (e) {
            mState = 0;
            var name = this.css(naiName);
            var inclass = this.hasClass(opt.show);
            if (opt.istrans && inclass || opt.show == name) {
                if (opt.show == name) {
                    elem.css(naiName, EMPTY);
                }
                if (isFn(opt.aftershow)) {
                    opt.aftershow.call(_this, elem);
                }
                if (isFn(opt.temaftershow)) {
                    opt.temaftershow.call(_this, elem);
                    opt.temaftershow = null;
                }
            } else if (opt.istrans && !inclass || opt.hide == name) {
                if (opt.cantoggle) {
                	if(opt.toggleclass){
                		elem.addClass(opt.toggleclass);
                	}else{
                		elem.hideView();
                	}
                }
                if (isFn(opt.afterhide)) {
                    opt.afterhide.call(_this, elem);
                }
                if (isFn(opt.temafterhide)) {
                    opt.temafterhide.call(_this, elem);
                    opt.temafterhide = null;
                }
            }
            handleRuns();
            e.stopPropagation();
        });
        //清空回调
        this.clearcallbacks = function () {
            var dels = ["aftershow", "afterhide", "temaftershow", "temafterhide", "onshow", "onshowed", "onhided"];
            for (var i = 0; i < dels.length; i++) {
                var key = dels[i];
                if (opt[key]) {
                    delete opt[key];
                }
            }
            return _this;
        };
        this.aftershow = function (fn) {
            opt.aftershow = fn;
            return _this;
        };
        this.afterhide = function (fn) {
            opt.afterhide = fn;
            return _this;
        };
        this.onshow = function (fn) {
            opt.onshow = fn;
            return _this;
        };
        this.onshowed = function (fn) {
            opt.onshowed = fn;
            return _this;
        };
        this.onhide = function (fn) {
            opt.onhide = fn;
            return _this;
        };
        this.onhided = function (fn) {
            opt.onhided = fn;
            return _this;
        };
        this.toggle = function (fn) {
            return this.isshow() ? this.hide(fn) : this.show(fn);
        };
        this.setWindowTitle=function(title){
        	opt.windowtitle = title;
        };
        this.show = function (fn) {
            if (isFn(fn)) {
                opt.temaftershow = fn;
            }
            toggle(true);
            if (opt.isresverback && opt.pageback) {
                history.back();
            }
            return _this;
        };
        function hideview() {
            return toggle();
        }
        this.isshow = this.isShow = function () {
            if (opt.istrans) {
                return elem.hasClass(opt.show);
            }
            return elem.css(naiName) != opt.hide;
        };
        this.ispageback = function () {
            return isFn(opt.pageback);
        };
        this.onpageback = function (fn, delay) {
            opt.pageback = fn || emptyFn;
            opt.delay = delay;
            elem.onpageback(function (hash) {
                var ret = opt.pageback.call(this, elem, hash);
                if (ret !== false && !isFn(ret)) {
                    if (_this.isshow() && !opt.isresverback) {
                        toggle();
                    } else if (!_this.isshow() && opt.isresverback) {
                        toggle(true);
                    }
                }
                return ret;
            });
            return _this;
        };
        this.hide = function (fn) {
            if (_this.isshow()) {
                if (isFn(fn)) {
                    opt.temafterhide = fn;
                }
                toggle();
                if (!opt.isresverback && opt.pageback) {
                    history.back();
                }
            }
            return _this;
        };
        //配置自动显示隐藏元素
        this.autotoggle = function () {
            if (!opt.cantoggle) {
                opt.cantoggle = true;
                if(opt.toggleclass){
                	elem.addClass(opt.toggleclass);
                }else{
                	elem.hideView();
                }
                elem.css(naiName, opt.hide);
            }
            return _this;
        };
        this.isRunning = function () {
            return mState == 1;
        };
        /*
         * handle 执行一个函数，函数的this指向该动画管理器，回调函数中第一参数为动画的元素
         * */
        this.run = function (handle) {
            if (isFn(handle)) {
                if (_this.isRunning()) {
                    RUNS.unshift(handle);
                } else {
                    handle.call(_this, elem);
                }
            }
            return _this;
        };
        //清除回调
        this.clearRuns = function () {
            RUNS.clear();
            return _this;
        };
        /*
         * 设置动画的过渡时间 duration 毫秒
         */
        this.setDuration = function (duration) {
            elem.css(opt.istrans ? "webkitTransitionDuration" : "webkitAnimationDuration", duration + "ms");
            return _this;
        };
        return this;
    }

    /*
     * 滑动处理器
     * options见函数内的opt说明
     */
    function TouchSlider(options) {
        var opt = extend({
            callback: emptyFn,//移动监听回调
            onready: emptyFn//开始滑动监听
//            ,selector:null//监听的滑动的选择器
//            ,preventstart:false//是否阻止默认事件
//            ,isSimple : false//是否简单滑动模式
//            ,mindelta : 5//最低多少位移算作滑动
        }, options);
    	var iseventdown;
        var mRecord = $.touchRecorder(opt.mindelta);
        var mark = 0;
        this.on("touchstart,mousedown", opt.selector, function (e) {
        	if(e.type=="mousedown" &&  (e.which!=1|| touchAble)){
            	return;
            }
        	iseventdown=true;
            if (opt.preventstart) {
                fnnoscroll(e);
            }
            mark = 0;//重置滑动
            mRecord.init(e);
        }).on("touchmove,mousemove", opt.selector, function (e) {
        	if(!iseventdown){
        		return;
        	}
        	if(e.type=="mousemove" && (e.which!=1|| touchAble)){
            	return;
            }
            mRecord.update(e);
            if (mRecord.isMoved()) {
                if (!mark) {
                    mark = 1;//标记开始滑动了
                    opt.onready.call(this, e, mRecord);
                }
                if (opt.isSimple) {
                    var flag;
                    if (mark == 1) {
                        mark = 2;//标记禁止滑动
                        flag = opt.callback.call(this, e, mRecord);
                    }
                    return flag;
                } else {
                	return opt.callback.call(this, e, mRecord); 
                }
            }
        }).on("touchend,mouseup", opt.selector, function (e) {
        	iseventdown=false;
            if (opt.isSimple) {
                return;
            }
            if(e.type=="mouseup" && (e.which!=1|| touchAble)){
            	return;
            }
            mRecord.update(e);
            if (mRecord.isMoved()) {
                //监听滑动
                fnBlur();
                return opt.callback.call(this, e, mRecord);
            }
        });
        return this;
    }
    
 /*
 * 简单滑动器包装（支持横向和纵向的滑动）
 */
(function(){
	//动画缓动-动量
	var TIMINGFNC_MOMENTUM = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
	//对齐方式
	var aliginobj = {
			left:0,center:1,right:2,top:0,bottom:2
	};
	//拖动阻力系数
	var dragforceobj={
			left:0,right:0,top:0,bottom:0
	};
	//滑动方向控制
	var directionobj={
			any:0,horizontal:1,vertical:2
	};
	//swpiper的默认状态
	var defparams={
			touchidx:0,
			touchidy:0,
			maxsize:0,
			lastmovedx:0,
			lastmovedy:0,
			maxmovex:0,
			maxmovey:0,
			movepx:0,
			movepy:0,
			maxwidth:0,
			maxhegiht:0
	};
	/*
	 * slider:dom 滑动元素
	 * options:object 参数
	 */
	function Swiper(slider,options){
		var swiper = this;
		//配置参数
		var opt = $.extend({
			direction:"horizontal",//滑动方向
			itemalign:"left",//针对中间元素对其方式，参考#aliginobj
			duration:400,// 动画的最长过渡时间
			dragforce:0.3,//阻力系数，指定数值时，统一所有方向的系统，自定义时指定obj，参考#dragforceobj
			dragforceRB:0.3,// 右|下阻力系数
			delta:20,// 滑动更改增量
			unionviewsparams:[],//关联滑动的元素集合:元素结构{fnDynamicView:null,view:view,slidetimes:slidetimes,onchange:onchange,onslideend:onslideend}
			//ondrag:null,//开始拖拽监听
			onchange:emptyFn,// 滑动项更改监听
			onslidestart:emptyFn,// 开始滑动项更改监听
			onslideend:emptyFn,// 滑动结束监听
			onberforemoving:emptyFn// 开始前的监听
			//disabledrag:false,//禁止drag
			//onmoving:null,// 滑动位移监听,
			//parentslider:null//父类滑动器
		},options);
		var bindParams = opt.unionviewsparams;
		//滑动方向
		var direction = directionobj[opt.direction];
		var touchidxname = direction == directionobj.vertical?"touchidy":"touchidx";
		var statedataname = "swiper_state";
		//缓动
		var timingfnc= TIMINGFNC_MOMENTUM;
		//配置阻力系统
		var force = opt.dragforce;
		if(isType(opt.dragforce,"number")){
			force = $.extend({},dragforceobj);
			for(var f in force){
				force[f] = opt.dragforce;
			}
		}else{
			force = $.extend(dragforceobj,force);
		}
		var alignType = aliginobj[opt.itemalign];
		var params =$.extend(true,{},defparams);
		var isEventon = !!opt.selector;//是否委托模式
		var eventView;
		var parentview = slider.parent();
		var sliderouter = opt.selector?parentview:slider;
		if(opt.selector){
			sliderouter =	parentview==DOC.body?slider:parentview;
		}
		function updateUnionview(obj){
			if(obj.fnDynamicView && eventView){
				obj.view = obj.fnDynamicView(eventView);
			}
		}
		if(!opt.disabledrag){
			//滑动处理
			sliderouter.onSlide({
				selector:opt.selector,
				onready:onready,
				callback:function(e,recorder){
					var isHorizontal = direction ===directionobj.horizontal && recorder.isHorizontal();
					var isVertical = direction===directionobj.vertical && recorder.isVertical();
					if(!isHorizontal && !isVertical){
						return;
					}
					if(moveCallback(opt.onberforemoving,this,e,recorder)){
						return;
					}
					e.preventDefault();
					if(isHorizontal){
						//横向滑动
						var moveX = recorder.moveX;
						params.movepx = params.lastmovedx + moveX;
						if(recorder.isMoving()){
							if(params.movepx>0){
								params.movepx=params.movepx * force.left;
							}else if(params.movepx<params.maxmovex){
								params.movepx =params.maxmovex +(params.movepx-params.maxmovex)*force.right;
							}
							setTranslateXY(eventView,params.movepx,params.movepy);
							bindParams.foreach(function(){
								updateUnionview(this);
								setTranslateXY(this.view,params.movepx*-this.slidetimes,0);
							});
						}else{
							var duration = opt.duration;
							var lastidx = params.touchidx;
							if(Math.abs(moveX)>opt.delta || recorder.getEventCostTime()<150){
								if(recorder.isMoveRight()){
									params.touchidx--
								}else{
									params.touchidx ++;
								}
								var itemwidth = this.scrollWidth/this.children.length;//平均宽度
								duration= $.round2((itemwidth - Math.abs(moveX)) / itemwidth *opt.duration,0);
							}
							slideTo(params.touchidx,lastidx,opt.duration,duration);
						}
					}else if(isVertical){
						//纵向滑动
						var moveY = recorder.moveY;
						params.movepy = params.lastmovedy + moveY;
						if(recorder.isMoving()){
							if(params.movepy>0){
								params.movepy=params.movepy * force.top;
							}else if(params.movepy<params.maxmovey){
								params.movepy =params.maxmovey +(params.movepy-params.maxmovey)*force.bottom;
							}
							setTranslateXY(eventView,params.movepx,params.movepy);
							bindParams.foreach(function(){
								updateUnionview(this);
								setTranslateXY(this.view,0,params.movepy*-this.slidetimes);
							});
						}else{
							var lastidx = params.touchidy;
							if(Math.abs(moveY)>opt.delta || recorder.getEventCostTime()<150){
								if(recorder.isMoveDown()){
									params.touchidy--
								}else{
									params.touchidy ++;
								}
							}
							var itemHeight = this.scrollHeight/this.children.length;//平均宽度
							duration= $.round2((itemHeight - Math.abs(moveY)) / itemHeight *opt.duration,0);
							slideTo(params.touchidy,lastidx,opt.duration);
						}
					}
					moveCallback(opt.onmoving,this,e,recorder);
					return true;
				}
			});
		}
		slider.on("webkitTransitionEnd",opt.selector,function(e){
			if(params.ischanged){
				params.ischanged=false;
				opt.onchange.call(eventView,swiper);
				bindParams.foreach(function(){
					updateUnionview(this);
					if(this.onchange){
						this.onchange.call(this.view,swiper);
					}
				});
			}
			if(opt.onslideend){
				opt.onslideend.call(this.view,swiper);
				bindParams.foreach(function(){
					updateUnionview(this);
					if(this.onslideend){
						this.onslideend.call(this.view,swiper);
					}
				});
			}
		});
		function getPmData(){
			var params =eventView.data(statedataname); 
			if(!params){
				params =$.extend(true,{},defparams);
				eventView.data(statedataname,params);
			}
			return params;
		}
		//拖动准备
		function onready(e, recorder){
			if(recorder){
				var isvertical = recorder.isVertical();
				if((direction ===directionobj.horizontal && isvertical) || (direction===directionobj.vertical && !isvertical)){
					return;
				}
			}
			
			if(this!=window){
				eventView = this;
			}
			if(opt.onslidestart){
				opt.onslidestart(eventView,swiper);
			}
			if(opt.parentslider){
				var pidx = opt.parentslider?opt.parentslider.getSelectedIndex():0;
				eventView = isEventon?sliderouter.query(opt.selector)[pidx]:slider;
			}else if(!eventView){
				eventView = isEventon?sliderouter.query(opt.selector)[0]:slider;
			}
			if(eventView){
				params =getPmData(); 
				var matrix = $.getMatrix(eventView);
				setTransitionDuration(eventView,0);
				bindParams.foreach(function(){
					updateUnionview(this);
					setTransitionDuration(this.view,0);
				});
				params.maxsize = eventView.children.length;
				if(direction==directionobj.horizontal){
					params.maxwidth = eventView.scrollWidth-eventView.lastElementChild.offsetWidth;
					var deltax =eventView.lastElementChild.offsetWidth-eventView.offsetWidth; 
					if(deltax<0){
						params.maxwidth = params.maxwidth+deltax;
					}
					params.maxmovex =  -eventView.scrollWidth+eventView.offsetWidth;
					params.lastmovedx = parseInt(matrix[4]);
				}else if(direction==directionobj.vertical){
					params.maxheight = eventView.scrollHeight-eventView.lastElementChild.offsetHeight;
					var deltay =eventView.lastElementChild.offsetHeight-eventView.offsetHeight; 
					if(deltay<0){
						params.maxheight = params.maxheight+deltay;
					}
					params.maxmovey =  -eventView.scrollHeight+eventView.offsetHeight;
					params.lastmovedy = parseInt(matrix[5]);
				}
				params.ischanged=false;
				if(isFn(opt.ondrag)){
                    opt.ondrag.call(eventView, e, recorder);
				}
			}
		}
		function moveCallback(callback,view,e,recorder){
			if(isFn(callback)){
				var data = recorder.data = recorder.data || {};
				data.isTop =params.movepy>=0;
				data.isBottom = params.movepy <=-params.maxheight;
				data.isLeft = params.movepx >=0;
				data.isRight = params.movepx <=-params.maxwidth;
				data.tranX = params.movepx;
				data.tranY = params.movepY;
				return callback.call(view,e,recorder);
			}
		}
		//滑动到指定的子元素
		function slideTo(index,lastidx,duration,deltaduraion,isforcechange){
			if(!eventView){
				return;
			}
			if(index<0){
				index=0;
			}else if(index>=params.maxsize){
				index=params.maxsize-1;
			}
			if(isforcechange){
				params.ischanged =isforcechange;
			}else{
				params.ischanged = index!=lastidx;
			}
			//计算动画时间
			if(params.ischanged && deltaduraion>0){
				duration = deltaduraion;
			}
			setTransitionDuration(eventView,duration,timingfnc);
			bindParams.foreach(function(){
				updateUnionview(this);
				setTransitionDuration(this.view,duration,timingfnc);
			});
			var curitem = eventView.children[index];
			if(direction==directionobj.horizontal){
				params.touchidx = index;
				params.movepx =  -curitem.offsetLeft;
				//计算对其方式
				if(alignType>0 && params.movepx<0 && index<params.maxsize-1){
					if(alignType==1){
						params.movepx = -curitem.offsetLeft+(eventView.offsetWidth-curitem.offsetWidth)/2;
					}else{
						params.movepx = -curitem.offsetLeft -curitem.offsetWidth+eventView.offsetWidth;
					}
				}else{
					if(params.movepx < params.maxmovex){
						params.movepx =params.maxmovex;
					}
				}
//				params.lastmovedx = params.movepx;
				setTranslateXY(eventView,params.movepx,params.movepy);
				bindParams.foreach(function(){
					updateUnionview(this);
					setTranslateXY(this.view,params.movepx*-this.slidetimes,0);
				});
			}else{
				params.touchidy = index;
				params.movepy =  -curitem.offsetTop;
				//计算对齐方式
				if(alignType>0 && params.movepy<0 && index<params.maxsize-1){
					if(alignType==1){
						params.movepy = -curitem.offsetTop+(eventView.offsetHeight-curitem.offsetHeight)/2;
					}else{
						params.movepy = -curitem.offsetTop -curitem.offsetHeight+eventView.offsetHeight;
					}
				}else{
					if(params.movepy < params.maxmovey){
						params.movepy =params.maxmovey;
					}
				}
				params.lastmovedy = params.movepy;
				setTranslateXY(eventView,params.movepx,params.movepy);
				bindParams.foreach(function(){
					updateUnionview(this);
					setTranslateXY(this.view,0,params.movepy*-this.slidetimes);
				});
			}
		}
		/*
		 * 滑动到指定的元素下标
		 * index:integer 位置下标
		 * isnotanimate:boolean 是否不展示动画
		 */
		this.slideToIndex=function(index,isnotanimate){
			var touchindex = params[touchidxname];
			if(touchindex!=index){
				onready();
				var duration = isnotanimate?10:opt.duration;
				slideTo(index,touchindex,duration,duration,!!opt.parentslider);
			}
		};
		
		//获取触发滑动的swiper当前选择的项
		this.getSelectedIndex=function(){
			return params[touchidxname];
		};
		//获取子项的个数
		this.getCount=function(){
			return params.maxsize;
		};
	}
	
	/**
	 * 滚动器要求的元素结构
	 *滑动器
	 *<div>
	 *		包裹器
	 *		<div>
	 *			内容
	 *		</div>
	 *</div> 
	 */
	function Scroller(element, options) {
		var opt = $.extend({
			direction:"vertical"//滑动方向
			//,selector:""//选择器
		},options);
		var maxduration = 600;
		var outlimited = 100;
		var dragforce=2;
		var slider,elem;
		var tranX,tranY;
		var direction = directionobj[opt.direction];
		var allowhorizontal=directionobj.vertical !=direction;
		var allowvertical= directionobj.horizontal != direction;
		//缓动
		var timingfnc = TIMINGFNC_MOMENTUM;
		function calcLastSpeed(moves){
			var maxlength = moves.length>3?3:moves.length;
			if(maxlength<2){
				return 0;
			}
			var max= moves[0];
			for(var i=1;i<maxlength;i++){
				if(Math.abs(moves[i])>Math.abs(max)){
					max = moves[i];
				}
			}
			return max;
		}
		element.onSlide({
			selector:opt.selector,
			onready:function(){
				slider = opt.selector?this:element.children[0];
				elem = opt.selector?this.parent():element;
				var matrix = $.getMatrix(slider);
				tranX = parseInt(matrix[4]);
				tranY = parseInt(matrix[5]);
				$.setTranDuration(slider,0);
				$.setTransXY(slider, tranX, tranY);
			},
			callback : function(e, mRecord) {
				var isHorizontal = allowhorizontal && mRecord.isHorizontal();
				var isVertical = allowvertical && mRecord.isVertical();
				if(!isHorizontal && !isVertical){
					return;
				}
				e.preventDefault();
				var delatX=tranX;
				var delatY=tranY;
				var maxheight =slider.clientHeight>=elem.clientHeight?elem.clientHeight-slider.scrollHeight:0;
				var maxwidth = slider.clientWidth>=elem.clientWidth?elem.clientWidth-slider.scrollWidth:0;
				if(allowhorizontal){
					//允许横向
					delatX+=mRecord.moveX;
					if(delatX>0){
						delatX =delatX/dragforce;
					}else if(delatX<elem.clientWidth-slider.scrollWidth){
						delatX =maxwidth+(delatX-(maxwidth))/dragforce;
					}
				}
				if(allowvertical){
					//允许纵向
					delatY+=mRecord.moveY;
					if(delatY>0){
						delatY = delatY/dragforce;
					}else if(delatY<maxheight){
						delatY = maxheight+(delatY-(maxheight))/dragforce;
					}
				}
				if(mRecord.isMoving()){
					$.setTransXY(slider, delatX, delatY);
				}else{
					var speedx = calcLastSpeed(mRecord.getCurMoveXs());
					var speedy = calcLastSpeed(mRecord.getCurMoveYs());
					var duration = maxduration;
					var isoutslide=false;
					if(allowhorizontal){
						//允许横向
						delatX+=mRecord.moveX;
						if(delatX>0){
							duration=0;
							delatX = 0;
							isoutslide=true;
						}else if(delatX<maxwidth){
							duration = 0;
							delatX =maxwidth;
							isoutslide=true;
						}
					}
					if(allowvertical){
						//允许纵向
						delatY+=mRecord.moveY;
						if(delatY>0){
							duration=0;
							delatY = 0;
							isoutslide=true;
						}else if(delatY<maxheight){
							duration = 0;
							delatY =maxheight;
							isoutslide=true;
						}
					}
					var ishasspeed = (Math.abs(speedx)>3 || Math.abs(speedy)>3);
					if(duration>0 && ishasspeed){
						if(allowhorizontal){
							//允许横向
							delatX+=speedx*15;
							if(delatX>outlimited){
								delatX=outlimited;
								isoutslide=true;
							}else if(delatX<maxwidth){
								delatX = maxwidth-outlimited;
								isoutslide=true;
							}
						}
						if(allowvertical){
							//允许纵向
							delatY+=speedy*15;
							if(delatY>outlimited){
								delatY=outlimited;
								isoutslide=true;
							}else if(delatY<maxheight){
								delatY = maxheight-outlimited;
								isoutslide=true;
							}
						}
						$.setTransXY(slider, delatX, delatY);
					}else{
						if(!isoutslide && !ishasspeed){
							return;
						}
						$.setTransXY(slider, delatX, delatY);
					}
					var md;
					if(isoutslide && (delatX!=0 || delatY!=0)){
						md =0;
					}else{
						md=Math.max(Math.abs(delatX),Math.abs(delatY));
					}
					md =Math.max(md,360);
					md = Math.min(md,1000);
					md = isoutslide?md/2:md;
					$.setTranDuration(slider, Math.min(md,1000),timingfnc);
				}
			}
		});
		
		function checkAnimation(){
			if(!elem || !slider){
				return;
			}
			var matrix = $.getMatrix(slider);
			var scaleX = parseInt(matrix[0]);
			var scaleY = parseInt(matrix[3]);
			var tranX = parseInt(matrix[4]);
			var tranY = parseInt(matrix[5]);
			var delatX = tranX;
			var delatY = tranY;
			var needanimation = false;
			if(allowvertical){
				var maxheight =slider.clientHeight>=elem.clientHeight?elem.clientHeight-slider.scrollHeight:0;
				if(tranY>0 && tranY!=-maxheight){
					delatY=0;
					needanimation=true;
				}else if(tranY<maxheight && tranY!=0){
					delatY =maxheight;
					needanimation=true;
				}
			}
			if(allowhorizontal){
				var maxwidth = slider.clientWidth>=elem.clientWidth?elem.clientWidth-slider.scrollWidth:0;
				if(tranX>0){
					delatX=0;
					needanimation=true;
				}else if(tranX<maxwidth && tranX!=0){
					delatX =maxwidth;
					needanimation=true;
				}
			}
			if(needanimation){
				$.setTranDuration(slider,maxduration,"cubic-bezier(0.175, 0.885, 0.32, 1.275)");
			}
			$.setTransXY(slider, delatX, delatY);
		}
		var aniname = "webkitTransitionEnd";
		if(opt.selector){
			//监听动画结束
			element.on(aniname,opt.selector,checkAnimation,true);
		}else if(element.children.length){
			element.children[0].bind(aniname,checkAnimation);
		}
	}
	
	// 扩展到元素属性
	$.extend(Node.prototype,{
		getSwiper:function(options){
			//每次返回新的实例
			return new Swiper(this,options);
		},
		getScroller:function(options){
			//每次返回新的实例
			return new Scroller(this, options);
		}
	});
})();


    /*
     * 加载css或js【队列，内部方法】
     * qElem:dom执行队列的dom元素
     * tagName:创建的元素标签名
     * atts:获取dom元素的方法
     * urlkey:元素的url属性名
     * urlvalue:元素的url属性值
     * done成功回调
     * fail失败回调
     */
    function loadObject(qElem, tagName, atts, urlkey, urlvalue, done,fail) {
        if ($(tagName + "[" + urlkey + "='" + urlvalue + "']")) {
            return;
        }
        var cb = done || emptyFn;
        qElem.queue(function () {
            var elem = $("<" + tagName + "/>", $.query("head")[0]).attr(atts);
            // 有回调函数
            elem.onload = function () {
                cb.call(qElem, elem, urlkey, urlvalue);
                qElem.dequeue();
            };
            elem.onerror = fail;
            return qElem;
        });
    }

    /*
     * 执行多击事件回调
     * parent:dom 委托dom元素
     * elem:dom 当前事件元素
     * e:系统事件
     * callback:function 事件回调函数
     */
    function fnFireTaps(parent, elem, e, callback) {
        setTimeout(function () {
            fnClearTapTimer(parent);
            callback.call(elem, e);
            fnBlur();
        }, 30);
        return true;
    }

    /*
     * 执行tap事件回调
     * bselector:string 委托的css选择器
     * pelem:dom 委托dom元素
     * elem:dom 当前事件元素
     * e:系统事件
     * intime:integer tap事件有效的时间限制上限
     * callback:function 事件回调函数
     */
    function fnFireTap(bselector, pelem, elem, e, intime, callback) {
        if (pelem.data("eventtaps") == bselector) {
            fnClearTapTimer(pelem);
            var timer = setTimeout(function () {
                callback.call(elem, e);
            }, intime);
            pelem.data("eventTapTimer", timer);
        } else {
            return callback.call(elem, e);
        }
    }

    /*
     * 清除tap延迟的tap事件回调
     * elem:dom元素
     */
    function fnClearTapTimer(elem) {
        //清除tap的定时器
        var taptimer = elem.data("eventTapTimer");
        if (taptimer) {
            clearTimeout(taptimer);
            elem.data("eventTapTimer", EMPTY);
        }
    }

    /*
     * 事件分发器
     *	binder:dom元素 绑定器
     */
    function DispatchEvent(binder) {
        var _bind = binder;
        var dispatcher = {};

        /*
         * 事件分发分发项构造
         * selector:string css选择器
         * handler:function 事件绑定函数
         */
        function DispatchItem(selector, handler) {
            this.selector = selector;
            this.handler = handler;
        }
        /*
         * 事件分发处理器
         * e:系统事件
         */
        function EventDispatchhandler(e) {
            var elem = e.target, elems;
            var elemarray = [];
            var isStopPropgration = false;
            do {
                if (isStopPropgration) {
                    break;
                }
                var events = dispatcher[e.type];
                for (var i = 0; i < events.length; i++) {
                    var ev = events[i];
                    elems = elemarray[i];
                    if (!elems) {
                        if (ev.selector == BIND_SELF) {
                            elems = [this];
                        } else {
                            elems = elemarray[i] = this.querySelectorAll(ev.selector);
                        }
                    }
                    if (-1 != elems.idxof(elem)) {
                        isStopPropgration = ev.handler.call(elem, e);
                    }
                    if (isStopPropgration) {
                        break;
                    }
                }
                if (elem == this) {
                    break;
                }
            } while (elem = elem.parent());
            if (isStopPropgration) {
                e.stopPropagation();
            }
        }

        /*
         * 添加绑定
         * eventtype:string 事件类型
         * selector:string css选择器
         * handler:function 事件绑定的函数
         * isbubble :boolean 是否不再冒泡过程中执行
         */
        this.add = function (eventtype, selector, handler,isbubble) {
            var nobind = false;
            if (!dispatcher[eventtype]) {
                dispatcher[eventtype] = [];
                nobind = true;
            }
            dispatcher[eventtype].push(new DispatchItem(selector, handler, handler));
            if (nobind) {
                binder.bind(eventtype, EventDispatchhandler,isbubble);
            }
        };
        /*
         * 删除绑定
         * eventtype:string 事件类型
         * selector:string css选择器
         * handler:function 事件绑定的函数
         * 
         */
        this.remove = function (eventtype, selector, handler) {
            var dispatchers = dispatcher[eventtype];
            if (dispatchers) {
                for (var i = dispatchers.length - 1; i >= 0; i--) {
                    var dp = dispatchers[i];
                    if (selector == dp.selector) {
                        if (!handler || handler == dp.handler) {
                            dispatchers.remove(dp);
                        }
                    }
                }
                if (dispatchers.length == 0) {
                    binder.unbind(eventtype, EventDispatchhandler);
                    delete dispatcher[eventtype];
                }
            }
        };
    }

    /*
     *
     * type 请求类型
     * url:请求路径
     * param/content:请求参数
     * callbackname 基于jsonp的回调回调函数名称
     *
     */
    function ajaxRequest(type, url, param, callbackname, done, fail, always) {
        var req = new Ajax({
            type: type,
            url: url,
            param: param,
            jsonp: callbackname
        });
        return req.done(done).fail(fail).always(always);
    }

    /*
     * 定位对象
     * 成功回调函数的指向this对象为定位到的信息：坐标信息均为火星坐标
     */
    function MyLocation(success, fail) {
        var onsuccess = success;
        var onfail = fail;
        var onalways;
        var cancel;
        var failmsg = "定位失败";
        var msgobj = {
            message: failmsg
        };
        //完成
        this.done = function (success) {
            onsuccess = success;
            return this;
        };
        //失败
        this.fail = function (fail) {
            onfail = fail;
            return this;
        };
        this.cancel = function () {
            cancel = true;
        };
        this.always = function (fn) {
            onalways = fn;
            return this;
        };
        //回调的返回的地理位置信息对象
        function GeogPoint(obj, longitude, latitude, accuracy, from) {
            this.toString = function () {
                return this.getDesc() + "," + this.accuracy;
            };
            this.getDesc = function () {
                return this.longitude + "," + this.latitude;
            };
            this.original = obj;
            this.longitude = longitude;
            this.latitude = latitude;
            this.accuracy = accuracy || -1;
            this.from = from;
            this.data = {
                city: obj.city || "",
                address: obj.addr || obj.city,
                point: this.getDesc()
            };
        }

        //腾讯定位组件定位成功
        function qqproviderdone(obj) {
            // 位置信息:经度，纬度，精度
            if (isFn(onsuccess)) {
                var point = new GeogPoint(obj, obj.lng, obj.lat, obj.accuracy, obj.from);
                onsuccess.call(point, point.toString());
            }
            if (isFn(onalways)) {
                onalways();
            }
        }

        //腾讯地图定位组件是否就绪
        function isQQProvierReady() {
            return window.qq && qq.maps && qq.maps.Geolocation;
        }

        //使用腾讯地图的api
        function getQQGegoApi() {
            if (!qqGeolocation) {
                qqGeolocation = new qq.maps.Geolocation();
            }
            if (qqGeolocation) {
                qqGeolocation.getLocation(function (obj) {
                    qqproviderdone(obj);
                }, function (e) {
                    if (isFn(onfail)) {
                        onfail.call(msgobj, msgobj.message);
                    }
                    if (isFn(onalways)) {
                        onalways();
                    }
                }, {
                    timeout: 10000,
                    failTipFlag: false
                });
            } else {
                if (isFn(onfail)) {
                    onfail.call(msgobj, msgobj.message);
                }
                if (isFn(onalways)) {
                    onalways();
                }
            }
        }

        //使用腾讯的定位服务
        function qqProvider() {
            if (isQQProvierReady()) {
                getQQGegoApi();
            } else {
                DOC.body.loadJS("https://apis.map.qq.com/tools/geolocation/min?key=BGQBZ-WPZKX-J2X4Y-Z7ZY3-HWH75-IMBCE&referer=wxH5", function () {
                    this.dequeue();
                    getQQGegoApi();
                });
            }
        }
        setTimeout(qqProvider, 10);
    }

    /*
     * 内部方法，判断是否为上传的文件
     * @param obj
     * @return
     */
    function fnIsUploadFile(obj) {
        return typeof obj == "object" && $.isTag(obj, "input") && obj.attr("type") == "file";
    }

    /*
     * ajax 请求
     *
     *done:functon 请求成功的监听
     *fail:function 请求失败的监听
     *complete[已废弃]||onFinish[废弃]||always[推荐使用] 请求完成的监听
     *
     * 返回 Ajax对象
     *
     */
    function Ajax(params) {
        var _this = this;
        //回调函数集合
        var callbacks = {
            done: [],
            fail: [],
            always: []
        };
        //是否请求结束
        var isComplete = false;
        //是否已取消
        var isAbort = false;
        //原始的xmlhttp请求对象
        var req;

        //默认参数合并请求参数
        var dfp = extend({
            //提交路径 String
            url: EMPTY,
            //请求参数 Object
            param: {},
            headers:Ajax.headers,
            //请求的方法
//            type:"GET",
            //是否异步请求//xmlHttp请求有效
            async: true,
            //针对jsonp的回调函数名称
            jsonp: "callback"
        }, params);
        this.addHeaders=function(headers){
        	dfp.headers==dfp.headers||{};
        	if(key in headers){
        		dfp.headers[key] = headers[key];
        	}
        	return _this;
        };
        //取消监听（但无法取消请求）
        this.abort = function () {
            if (!isComplete) {
                isAbort = isComplete = true;
                if (req) {
                    req.abort();
                }
            }
            return this;
        };

        //成功的处理（在函数中this，指向的是的XMLHttpRequest对象）
        this.done = this.onSuccess = function (handle) {
            if (isFn(handle)) {
                callbacks.done.push(handle);
            }
            return this;
        };

        //失败的处理（在函数中this，指向的是的XMLHttpRequest对象）
        this.fail = this.onFail = function (handle) {
            if (isFn(handle)) {
                callbacks.fail.push(handle);
            }
            return this;
        };

        //请求完成，即结束（在done和fail之后，在函数中this，指向的是的XMLHttpRequest对象）
        this.complete = this.onFinish = this.always = function (handle) {
            if (isFn(handle)) {
                callbacks.always.push(handle);
            }
            return this;
        };

        //请求是否已经结束
        this.isComplete = function () {
            return isComplete;
        };
        //是否已取消
        this.isAborted=function(){
        	return isAbort;
        };

        if (dfp.type == "JSONP") {
            setTimeout(function () {
                var url = dfp.url;
                var callname = "JSONP" + $.timestamp();
                dfp.param[dfp.jsonp] = callname;
                if (!url.endWith(ASK)) {
                    url += (url.contains(ASK) ? "&" : ASK);
                }
                url += $.url(dfp.param);
                window[callname] = function () {
                    var args = arguments;
                    delete window[callname];
                    if (!isAbort) {
                        callbacks.done.foreach(function () {
                            this.apply(null, args);
                        });
                        callbacks.always.foreach(function () {
                            this();
                        });
                    }
                };
                var elem = $("<script/>", $.query("head")[0]).attr("src", url);
                elem.bind("error", function () {
                    if (!isAbort) {
                        callbacks.fail.foreach(function () {
                            this.apply(null, arguments);
                        });
                        callbacks.always.foreach(function () {
                            this();
                        });
                    }
                });
            }, 20);
        } else {
            req = this.request = new XMLHttpRequest();
            //文件上传进度监听
            this.progress = function (handle) {
                req.upload.onprogress = handle;
                return this;
            };
            //事件柄
            req.onreadystatechange = function () {
                if (4 == this.readyState) {
                    if (this.status >= 200 && this.status < 400) {
                        var data = $.parseJSON(this.responseText || EMPTY);
                        callbacks.done.foreach(function () {
                            this.call(req, data,_this);
                        });
                    } else {
                        if (!isAbort) {
                            callbacks.fail.foreach(function () {
                                this.call(req, _this);
                            });
                        }
                    }
                    isComplete = true;
                    //标记请求结束
                    callbacks.always.foreach(function () {
                        this.call(req, _this);
                    });
                }
            };
            //处理文件上传的情况
            if (dfp.type == "POSTFILE") {
                setTimeout(function () {
                    var postparam = extend($.reverseUrl(url), dfp.param);
                    //定义传输的文件HTTP头信息
                    var idx = -1;
                    var url = dfp.url || EMPTY;
                    url = url.length > 1 && -1 != (idx = url.indexOf(ASK)) ? url.substring(0, idx) : url;
                    url = url ? url : ASK;
                    var fd = new FormData();
                    for (var key in postparam) {
                        var obj = params.param[key];
                        if (isArray(obj) && obj.length > 0 && fnIsUploadFile(obj[0])) {
                            $.each(obj, function () {
                                fd.append(key, this.files[0]);
                            });
                        } else {
                            fd.append(key, obj);
                        }
                    }
                    req.open("POST", url);
                    addHeaders(req);
                    req.send(fd);
                }, 20);
            } else {
                setTimeout(function () {
                    var url = dfp.url;
                    var content;//提交的内容
                    if (dfp.type == "GET") {
                        if (!url.endWith(ASK)) {
                            url += (url.contains(ASK) ? "&" : ASK);
                        }
                        url += $.url(dfp.param);
                        req.open(dfp.type, url, dfp.async);
                    } else if (dfp.type == "POST") {
                        content = $.url(extend(true, $.reverseUrl(url), dfp.param));
                        //定义传输的文件HTTP头信息
                        var idx = -1;
                        url = url.length > 1 && -1 != (idx = url.indexOf(ASK)) ? url.substring(0, idx) : url;
                        url = url ? url : ASK;
                        req.open(dfp.type, url, dfp.async);
                        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    } else if (dfp.type == "POSTJSON") {
                        content = dfp.param;
                        if (typeof content == "object") {
                            content = JSON.stringify(content);//支持obj对象或序列化文本
                        }
                        req.open("POST", url, dfp.async);
                        req.setRequestHeader("Content-Type", "application/json;charset=utf-8");
                    }
                    addHeaders(req);
                    req.send(content);
                }, 20);
            }
            //添加头部信息
            function addHeaders(req) {
                req.setRequestHeader("ajaxRequest", "true");
                req.setRequestHeader("Not-Accepts", "Accept-Encoding");
                if(dfp.headers){
                	for(var key in dfp.headers){
                		req.setRequestHeader(key, dfp.headers[key]);
                	}
                }
            }
        }
    }
    
    /**
     * 带loading的异步请求
     * @param opt
     * @param msgView
     */
    function PostLoading(option,msgView){
    	var opt = $.extend({
    		url:"?",
    		action:"提交",
    		msgcutsize:40,
    		isloading:true,
    		ignoresuccmsg:false,
    		hidedelay:"auto",//大于0的整数或者"auto"
    		callbackfirst:false//是否优先处理回调
    	},option);
    	var msgview;
    	if(opt.isloading || msgView){
    		if(msgView){
    			msgview = msgView;
    		}else{
    			msgview= $.showloading(opt.msgwait||(opt.action+"中"));
    		}
    	}
    	var req;
    	if(opt.ispostjson){
    		req = $.postjson(opt.url,opt.params);
    	}else{
    		req =$.post(opt.url,opt.params);
    	}
    	req.done(function(data){
    		if(data.isok){
    			if(opt.callbackfirst && opt.done){
    				opt.done(data);
    			}
    			if(msgview){
    				if(!opt.ignoresuccmsg){
    					msgview.msgsucc(data.msg||opt.msgdone||(opt.action+"成功"))
    				}
    				msgview.hide(opt.hidedelay,function(){
    					if(!opt.callbackfirst && opt.done){
    						opt.done(data);
    					}
    				});
    			}else{
    				if(!opt.callbackfirst && opt.done){
    					opt.done(data);
    				}
    			}
    		}else{
    			if(opt.callbackfirst && opt.fail){
    				opt.fail(data);
    			}
    			var warinmsg = data.msg||opt.msgfail||(opt.action+"失败");
    			if(opt.msgcutsize<warinmsg.length){
    				if(msgview){
    					msgview.hide(function(){
    						$.showModal(warinmsg).onEnter(function(){
    							this.hide();
    							if(!opt.callbackfirst && opt.fail){
    								opt.fail(data);
    							}
    						});
    					});
    				}else{
    					$.showModal(warinmsg).onEnter(function(){
    						this.hide();
    						if(!opt.callbackfirst && opt.fail){
    							opt.fail(data);
    						}
    					});
    				}
    			}else{
    				if(msgview){
    					msgview.msgwarn(warinmsg).hide(function(){
    						if(!opt.callbackfirst && opt.fail){
    							opt.fail(data);
    						}
    					});
    				}else{
    					$.showwarn(warinmsg,function(){
    						if(!opt.callbackfirst && opt.fail){
    							opt.fail(data);
    						}
    					});
    				}
    			}
    		}
    	}).fail(function(req){
    		if(opt.callbackfirst && opt.error){
    			opt.error(req);
    		}
    		if(msgview){
    			msgview.msgerror(opt.msgfail||(opt.action+"失败")).hide(function(){
    				if(!opt.callbackfirst && opt.error){
    					opt.error(req);
    				}
    			});
    		}else{
    			$.showerror(opt.msgfail||(opt.action+"失败"),function(){
    				if(!opt.callbackfirst && opt.error){
    					opt.error(req);
    				}
    			});
    		}
    	});
    	this.abort=function(){
    		req.abort();
    	};
    }
    
    //WindowPlugin过渡动画
    var AniType = {
        slideleft: {
            show: "modal_slide_left",
            hide: "modal_slide_right"
            //css:cssobj//支持给动画元素赋予css样式
        },
        slideup: {
            show: "modal_slide_up",
            hide: "modal_slide_down"
        },
        scale: {
            show: "_ourlinc_window_show",
            hide: "_ourlinc_window_hide"
        },
        stretch: {
            show: "_ourlinc_window_stretchshow",
            hide: "_ourlinc_window_stretchhide"
        }
    };
    /*
     * 快速构建弹框组件
     * @param container 容器【必选】
     * @param options 参数对象【可选参数】
     * @param scroller 滚动器
     * scroller 使用普通的div即可，指定后，
     * 该滚动器中的内容超过屏幕大小的时候，
     * 自动适配屏幕，允许scroller和container是相同的dom元素）,【可选参数】<br>
     *
     * 可选构造函数<br>
     * WindowPlugin(container,options,scroller)<br>
     * WindowPlugin(container,options)<br>
     * WindowPlugin(container,scroller)<br>
     * WindowPlugin(container)
     *
     * @return WindowPlugin 对象
     */
    function WindowPlugin(container, options, scroller) {
        if (!container) {
            return null;
        }
        var plugin = this;
        if (options && options.tagName) {
            scroller = options;
            options = null;
        }
        //参数处理
        var o = extend({
        	//调整弹框的样式
            css: {},
            //前一个页面视图【dom元素】，移动后和当前弹框产生联动动画
            upPager:$.upPager,
            //前一个页面视图的联动样式类（一般是动画先关属性值的设置）
            upPagerClass:"_ourlinc_upPager_ani",
            //是否允许点击遮罩取消弹框
            cancelable: true,
            //点击遮罩取消窗口回调
            cancelcallback: emptyFn,
            //按钮
            buttons: {},
            //距离顶部距离默认距离
            paddingwidth: 60,
            //高度配置增量，仅针对内建滚动器模式
            maxHeightDelta:0,
            //距离顶部距离的倍数，默认1倍,
            paddingscale: .3,
            //动画时间
            duration: 400,
            //切换显示隐藏的样式名
            toggleclass:"",
            //是否执行autotoggle
            //isnotoggle: false,
            //定位层设置
            //默认自动增加，如果指定
            //zIndex : undefined,
            //动画类型，可以使用内置动画AniType中类型名称，也可以指定自定义的动画：{show:anishow,hide:anihide}
            animation: "scale"
        	//是否不生成遮罩
            //isnomodal : false,
        	//是否添加默认确定按钮
            //,enableEnter : false
        	//是否开启返回关闭
            //,enablePageback : false
        	//弹框是否最大宽度化（默认最大340px）
            //,enableMax : false
        	//是否隐藏后销毁
            //,enableDestroy : false
        	//是否自动黑暗模式
            //,autoDarkMode : false
            //是否自定义模式，开始自定义模式，将不自动为外层的视图嵌套默认元素，也不自动提供自动滚动条的优化的处理
            //,iscustom: false
        	//是否开启黑暗模式
            //,enableDarkMode : false
        	//是否页面化
            //,enabledPage : false
            //是否自定义位置
            //自定义弹框的位置，不配置的时候默认居中
            //,position : {left/right/top/right:0}
        	//是否初始化后立即显示
            //,showOnInit : false
            //监听页面resize回调
            //,onResize : callback,
        	//,onShow : callback,
            //窗口标题（配合enablePageback为true使用效果最佳，自动管理窗口标题）
            //,windowtitle : null，有调用onpageback的情况有效
        }, options);
        var _callbacks={};
        if(o.upPager && o.upPagerClass !="upPagerClass_scale" && o.upPagerClass=="_ourlinc_upPager_ani" && o.animation!="slideleft" ){
        	o.upPagerClass="";
        }
        var cssnai = isType(o.animation,"object") && o.animation.show ? o.animation : AniType[o.animation];
        var plbutton;
        //按钮
        var timerbuttons;
        //配置按钮定时器
        var marknainame = "-webkit-animation-name";
        var modal, animatormodal;
        var frame;
        if (!o.isnomodal) {
            modal = $("<div/>").addClass("_ourlinc_modal").bind("touchstart", fnnoscroll);
            animatormodal = $.cssAnimator(modal, "_ourlinc_modal_ani_show", "_ourlinc_modal_ani_hide").autotoggle();
        }
        if(o.upPager){
        	o.upPager.addClass("_ourlinc_upPager");
        }
        if (o.iscustom) {
            frame = container.appendTo(DOC.body).addClass("_ourlinc_custompage");
        } else {
            frame = $("<div/>", DOC.body).addClass("_ourlinc_window");
        }
        var pluginset = [frame];//动画元素集合
        if (modal) {
            pluginset.push(modal);
        }
        //非自定义弹框最大化处理
        if (o.enableMax && !o.iscustom) {
            container.css("max-width", "inherit");
            frame.css({"padding":0,"border-radius":0});
            o.paddingwidth = 0;
        }
        //页面化开启
        if (o.enabledPage) {
            frame.addClass("pageabled");
        }
        //动画管理器
        if(cssnai.css){
        	frame.css(cssnai.css);
        }
        //动画器定义
        var animatorframe = $.cssAnimator(frame, cssnai.show, cssnai.hide,{
        	windowtitle:o.windowtitle,
        	hash:o.hash,
        	toggleclass:o.toggleclass
        }).onhide(function () {
            if (modal) {
                animatormodal.hide();
            }
            if(o.upPager){
            	o.upPager.removeClass(o.upPagerClass);
            }
        }).afterhide(function () {
            if (o.enableDestroy) {
                plugin.destroy();
            }
            $.getEventCallbacks($.EVENTS.MODAL_AFTERHIDE).foreach(function(){
            	this(frame,plugin);
            });
            notifyActionChange("hide");
        }).onshowed(function (elem) {
            showready();
            updateDarkMode();
            if (modal) {
                animatormodal.show();
            }
            notifyActionChange("show");
        });
        if(!o.isnotoggle){
        	animatorframe.autotoggle();
        }
        if (o.enablePageback) {
            animatorframe.onpageback(null, 5);
        }
        if (modal) {
            frame.parentNode.insertBefore(modal, frame);
        }
        if (!o.iscustom) {
            container.addClass("_ourlinc_window_content").appendTo(frame).showView().css(o.css);
        }
        if (o.enableDarkMode) {
        	container.addClass("darkmode");
        }
        function notifyActionChange(action){
        	var fn = _callbacks[action];
        	if(fn){
        		fn.call(plugin,frame);
        	}
        }
        this.bind=function(action,callback){
        	_callbacks[action]=callback;
        };
        /*
         * 设置过场动画时长
         * duration:integer
         */
        this.setDuration = function (duration) {
            o.duration = duration;
            pluginset.foreach(function () {
                this.css("webkitAnimationDuration", o.duration + "ms");
            });
            if(o.upPager){
            	o.upPager.css("webkitTransitionDuration", o.duration + "ms");
            }
            return plugin;
        };
        this.setDuration(o.duration);
        var bview = o.iscustom ? null : $("<div/>", container).addClass("_ourlinc_windowbuttons");
        //内部方法
        //适应屏幕的滚动器
        function adjustScrollerToScreen() {
            if (scroller) {
                var XY = $.clientXY();
                var otherH = container == scroller ? 0 : frame.offsetHeight - scroller.offsetHeight;
                //其余部分的高度
                var max = XY.y - otherH+(o.maxHeightDelta?o.maxHeightDelta:0);
                var maxscroll = max - o.paddingwidth * o.paddingscale;
                scroller.css("max-height", maxscroll + "px");
                if (o.enableMax) {
                    scroller.css("min-height", maxscroll + "px");
                }
                if (isFn(o.onResize)) {
                    o.onResize.call(plugin,frame);
                }
            }
        }

        //延迟设置按钮
        function delaysetbuttons() {
            clearTimeout(timerbuttons);
            if(o.buttons.enter && o.buttons.cancel){
            	handlerButtons();
            }else{
            	timerbuttons = setTimeout(handlerButtons,10);
            }
            return plugin;
        }

        //按钮样式和事件处理
        function handlerButtons() {
            if (o.buttons.enter) {
                o.buttons.enter = extend({
                    name: "确定",
                    handler: plugin.hide,
                    "class": EMPTY
                }, o.buttons.enter);
            }
            if (o.buttons.cancel) {
                o.buttons.cancel = extend({
                    name: "取消",
                    handler: plugin.hide,
                    "class": EMPTY
                }, o.buttons.cancel);
            }
            plbutton = o.buttons.enter || o.buttons.cancel;
            if (bview) {
                bview.empty();
                if (plbutton) {
                    if (o.buttons.enter && o.buttons.cancel) {
                        $("<button/>", bview).html(o.buttons.cancel.name).addClass("buttoncancel " + o.buttons.cancel["class"]);
                        $("<button/>", bview).html(o.buttons.enter.name).addClass("buttonenter " + o.buttons.enter["class"]);
                    } else {
                        $("<button/>", bview).html(plbutton.name).addClass("buttonone " + plbutton["class"]);
                    }
                }
                bview[bview.children.length?"removeClass":"addClass"]("forcehide");
            }
            showready();
            if (o.showOnInit) {
                plugin.show();
            }
        }
        function updateDarkMode() {
        	var cn = "darkmode";
            if (o.autoDarkMode) {
                if ($.isInNight()) {
                    container.addClass(cn);
                } else {
                    container.removeClass(cn);
                }
            }else if(!o.enableDarkMode){
                container.removeClass(cn);
            }
        }
        //显示前的的准备，更新弹框位置
        function showready() {
        	if(o.onShow){
        		o.onShow.call(plugin,frame);
        	}
            if (!o.iscustom) {
                adjustScrollerToScreen();
                frame.css("top","unset");
                if(o.position){
                	for(var dir in o.position){
                		frame.css(dir,  o.position[dir]);
                	}
                }else{
                	frame.css("top", ($.clientXY().y - frame.offsetHeight) / 2 + "px");
                }
            }
        }
        //弹出
        this.show = function (callback) {
            if (!plugin.isShow()) {
        		MODAL_INDEX++;
        		pluginset.foreach(function () {
        			this.css("zIndex", o.zIndex===undefined?MODAL_INDEX:o.zIndex);
        		});
                $(function () {
                    animatorframe.show(callback);
                    if(o.upPager){
                    	o.upPager.addClass(o.upPagerClass);
                    }
                });
            }
            return plugin;
        };
        //隐藏
        this.hide = function (callback) {
            if (plugin.isShow()) {
                animatorframe.hide(callback);
            }
            return plugin;
        };

        //执行方法，一般用于视图绑定处理
        this.run = function (handle) {
            if (isFn(handle)) {
                handle.call(plugin, frame);
            }
            return plugin;
        };
        //获取动画器
        this.getAnimator = function () {
            return animatorframe;
        };
        //是否显示中
        this.isShow = function () {
            return animatorframe.isshow();
        };
        //获取主体元素
        this.getFrame=function(){
        	return frame;
        };
        /*
         * 显示的时候隐藏，隐藏的时候显示
         * callback:function 【可选】动画结束的回调函数
         */
        this.toggle=function(callback){
        	return plugin.isShow()?plugin.hide(callback):plugin.show(callback);
        };
        /*
         * 设置是否自动黑暗模式
         * isAuto 布尔值
         */
        this.setAutoDarkMode=function(isAuto){
        	o.autoDarkMode=!!isAuto;
        };
        function getAfterHandler(handler){
        	return handler?function(){
    			var plugin = this;
    			plugin.hide(function(){
    				handler.call(plugin);
    			})}:handler;
        }
        /*
         * 确定按钮设置
         * handler:function 处理监听【可选，不指定时点击默认为关闭弹框，指定时，不关闭弹框】
         * name:string 按钮名称【可选】
         * classname:string【可选，如果样式没有生效，可以尝试加上!important，提高优先级】
         */
        this.onEnter = function (handler, name, classname) {
            o.buttons.enter = {
                handler: handler || UDF,
                name: name,
                "class": classname
            };
            return delaysetbuttons();
        };
       /*
        * 用法同onEnter:区别，总是在执行handler后关闭弹框
        */
        this.afterEnter=function(handler, name, classname){
        	return this.onEnter(getAfterHandler(handler), name, classname)
        };
        /*
         * 取消按钮监听
         * 参数用法参考#onEnter
         * handler:string点击后的回调【可选】
         * name:string 按钮名称【可选】
         * classname:string【可选，如果样式没有生效，可以尝试加上!important，提高优先级】
         * 
         */
        this.onCancel = function (handler, name, classname) {
            o.buttons.cancel = {
                handler: handler || UDF,
                name: name,
                "class": classname
            };
            return delaysetbuttons();
        };
        /*
         * 用法同onEnter:区别，总是在执行handler后关闭弹框
         */
         this.afterCancel=function(handler, name, classname){
         	return this.onCancel(getAfterHandler(handler), name, classname)
         };
        /*
         * 页面返回后后的监听处理
         * fn:function 为回调函数，在回调 中 return false阻止取消
         */
        this.onpageback = function (fn) {
            animatorframe.onpageback(function (elem) {
                return fn.call(plugin, elem);
            }, 5);
            return plugin;
        };
        //销毁对象弹框
        this.destroy = function () {
            window.unbind("resize", bindresize);
            frame.remove();
            if (modal) {
                modal.remove();
            }
        };
        //页面窗体更改处理
        function bindresize() {
            if (frame.isVisible()) {
                adjustScrollerToScreen();
                frame.css("top", ($.clientXY().y - frame.offsetHeight) / 2 + "px");
            }
        }
        //点击遮罩事件处理
        if (o.cancelable) {
            if (!o.iscustom) {
                frame.bind("click", function (e) {
                    if (e.target == frame) {
                        plugin.hide(o.cancelcallback);
                    }
                });
            }
            if (modal) {
                modal.tap(function () {
                    plugin.hide(o.cancelcallback);
                });
            }
        }
        this.clearButtons = function () {
            if (bview) {
                bview.empty();
            }
            o.buttons = {};
            return plugin;
        };
        if (!o.iscustom) {
            //自适应屏幕处理
            window.bind("resize", bindresize);
            //滑动处理
            if (scroller) {
                scroller.addClass("wt-scroll");
            }
            //自带按钮处理
            bview.onTap("button", function () {
                if (this.hasClass("buttonone")) {
                    plbutton.handler.call(plugin);
                } else if (this.hasClass("buttonenter")) {
                    o.buttons.enter.handler.call(plugin);
                } else if (this.hasClass("buttoncancel")) {
                    o.buttons.cancel.handler.call(plugin);
                }
                return true;
            });
            if (o.enableEnter) {
                plugin.onEnter();
            }
        }
        handlerButtons();
    }
  //是否普通类型
    function isNormalType(text){
    	return isType(text, "string|number|boolean");
    }
    function checkwxReady() {
        if (ISWEIXIN_READY) {
            while (WEIXINS.length > 0) {
                WEIXINS.shift()();
            }
        }
    }
    
	
    //为微信对象拓展属性和方法
    $.extend($.weixin,{
        /*
         * 添加微信环境准备好后要执行的函数
         * 可以多次调用，一次按顺序执行
         */
        ready: function (hander) {
            if (isFn(hander)) {
                WEIXINS.push(hander);
            }
            checkwxReady();
        }
    });
    
    //微信组件加载完成监听
    DOC.bind("WeixinJSBridgeReady",function(){
    	ISWEIXIN_READY = BROWSER.weixin=true;
    	checkwxReady();
    });
    //【初始化页面加载监听】
    bindReady();
    
    //禁用微信内置的字体调整
    $.weixin.ready(function(){
    	var lastupate = 0;
    	 function resetWeixinFont(e){
    		 if(e){
    			 var now = $.timestamp();
    			 if(now-lastupate<1e3){
    				 return;
    			 }
    			 lastupate = now;
    		 }
			 WeixinJSBridge.invoke("setFontSizeCallback",{fontSize: 2});
	    }
    	WeixinJSBridge.on("menu:setfont",resetWeixinFont);
    	resetWeixinFont();
    });
    Object.defineProperty(window,"$",{
    	get:function(){
    		return Query;
    	},
        set: function(value) {
        	console.warn("组件中的$禁止修改");
        }
    });
    $(function(){
    	if($.browser.iphone && DOC.body.scrollIntoViewIfNeeded){
    		DOC.body.on("blur","input,textarea",function(e){
    			setTimeout(function(){
    				DOC.activeElement.scrollIntoViewIfNeeded(true);
    			},30);
    		},true);
    	}
    });
})();