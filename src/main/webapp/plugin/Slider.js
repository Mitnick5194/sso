
/**
 * 使用，调用者自己处理滚动：调用实例的move方法，方法传入回调retWrap.getRet实例，可以获取retWrap.getRet里的相关值
 * 在success回调用同样可以拿到上述的实例，拿到实例自己做业务处理，success只会在触摸完成时调用，
 * 可能不触发，详情查看触发条件，触发后需要在调用者把最新的滑动距离传入控件中保存，
 * 调用Slider.setOffset(offset)方法传入
 * 如果不触发success,则会触发recovery回调（两者互斥），同样有上述实例传入，因为位置复原，所以不用调用Slider.setOffse()方法
 * complete回调同样可以拿到上述的实例，在触摸完成后一定会触发
 * @since v1.0 
 *
 * 插件维护滚动：需要开启autoCtrl：true,并且传入pageCount，可通过fireDistX，minDistX，fireSpeed等属性控制触发条件
 * @since v2.0
 *
 * @param slider 滑动的元素
 * 
 * @param target 跟随滑动的元素（一般和slider一样，滑动和跟随滑动一般是同一个元素，但不能为空）
 * 
 * @param conf 配置
 *
 * @version 2.0
 * @author niezhenjie
 */

 (function(window,factory){
 	window.SliderFactory = {
 		createSlider: function(slider,target,conf){
 			return new factory(slider,target,conf);
 		}
 	};
 })(window,function(slider,target,conf){
	var config = {
		fireDistX: 50,//x轴滑动距离超过fireDistX才会触发成功
		minDistX:5,//x轴滑动距离不超过minDistX，则永远不会触发左右滑动，防止上下滑动时窗口抖动
		//fireSpeed: 0,//x轴滑动距离超过minDistX但不超过fireDistX时，只有速度达到fireSpeed才回触发成功TODO
		autoCtrl: false,//true 表示滑动逻辑由空间控制，true和pageCount同时存在
		pageCount: 0,//分成多少页
		idx:0,//当前正在第几页
		animateDuration:"0.3",//动画过渡时间
		animateType: "linear",//过渡效果
	}
	Object.assign(config,conf);
	if(config.autoCtrl && config.pageCount <1) {
		console.error("自动控制需要传入pageCount");
		return;
	}
	
	var callbacks = {};//回调集合

	var UTILS = {
		createPoi: (function(){
			return function(event){
				/**本次滑动时的滑动数据*/
				return (function(x,y,t){
					var _x = x;
					var _y = y;
					var _t = t;
					return {
						setX: function(x){
							_x = x;
						},
						getX: function(){
							return _x;
						},
						setY: function(y){
							_y = y;
						},
						getY: function(){
							return _y;
						},
						setT:function(t){
							_t = t;
						},
						getT:function(){
							return _t;
						},
						toString: function(){
							var sb = [];
							sb.push("{x:");
							sb.push(x);
							sb.push(",y:");
							sb.push(y);
							sb.push(",t:");
							sb.push(y);
							sb.push("}");
							var ret = sb.join("");
							sb = null;
							return ret;
						}
					}
				})(event.changedTouches[0].clientX,event.changedTouches[0].clientY,event.timeStamp);
			}
		})(),

		updatePoi:function(event,poi){
			if(!poi){
				this.createPoi(event);
				return poi;
			}
			poi.setX(event.changedTouches[0].clientX);
			poi.setY(event.changedTouches[0].clientY);
			poi.setT(event.timeStamp);
			return poi;
		},
		calCurrent:function() { //滑动时动态计算滑动的结果
			var s = sliderWrap.start;
			var c = sliderWrap.current;
			if(!s || !c){
				return;
			}
			var distX = c.getX() - s.getX();
			var distY = c.getY() - s.getY();
			var duration = c.getT() - s.getT();
			var ret = sliderWrap.ret;
			ret.update(distX,distY,duration);
		},
		cal:function() { //滑动完成后计算结果
			var s = sliderWrap.start;
			var e = sliderWrap.end;
			if(!s || !e){
				return;
			}
			var distX = e.getX() - s.getX();
			var distY = e.getY() - s.getY();
			var duration = e.getT() - s.getT();
			var ret = sliderWrap.ret;
			ret.update(distX,distY,duration);
		},
		clear: function() { //本次滑动完成后清楚滑动数据
			sliderWrap.start = null;
			sliderWrap.end = null;
			sliderWrap.move = null;
		},
		getPageInfo: (function(){
			var _pageInfo;
			return function(){
				if(_pageInfo){
					return _pageInfo;
				}
				_pageInfo = (function(){
					if(!config.autoCtrl){
						//并不是自动控制
						return null;
					}
					if(null == target){
						target = slider;
					}
					//滑动元素总宽度
					var width = target.clientWidth;
					//单页宽度
					var _pageWidth = width / config.pageCount;
					/**当前所在页从0开始，可负可正*/
					var _idx = 0;
					var _pageCount = config.pageCount;
					return {
						getPageWidth: function(){
							return _pageWidth;
						},
						getIdx: function(){
							return _idx;
						},
						getPageCount: function(){
							return _pageCount;
						},
						setIdx: function(idx){
							_idx = idx;
						},
						toString: (function(){
							var sb = [];
							sb.push("{pageWidth:");
							sb.push(_pageWidth);
							sb.push(",idx:");
							sb.push(_idx);
							sb.push(",pageCount:");
							sb.push(_pageCount);
							sb.push("}");
							var ret = sb.join("");
							sb = null;
							return ret;
						})()
					}
				})()
				return _pageInfo ;
			}
		})(),
		/**控制动画，在触摸时移除动画，触摸完成加上动画*/
		handletrans: function(toggle){
			if(!toggle){
				target.style.transition = "unset";
			}else{
				var sb = [];
				sb.push("transform ");
				sb.push(config.animateDuration);
				sb.push("s ")
				sb.push(config.animateType);
				target.style.transition = sb.join("");
				sb = null;
			}
		}
	}

	

	/**全局且单例*/
	var sliderWrap = {
		start:null,
		current:null,
		end:null,
		ret: (function(){
			/**全局且单例，保存在sliderWrap实例中*/
			return (function(){
				var _distX = 0;
				var _distY = 0;
				var _duration = 0;
				var _offsetX = 0;//上一次的滑动距离，本次滑动需要加上上一次的滑动距离
				var _offsetY = 0;//上一次的滑动距离，本次滑动需要加上上一次的滑动距离
				var _direction = 1;// 1右滑 -1左滑
				return {
					getRet: function(){
						return {
							distX: _distX,
							distY: _distY,
							absDistX: Math.abs(_distX),
							absDistY: Math.abs(_distY),
							duration: _duration,
							direction: _direction
						}
						
					},
					update: function(distX,distY,duration) {
						_distX = distX + _offsetX; //和上次的滑动距离相加
						_distY = distY + _offsetY;
						_duration = duration;
						_direction = distX > 0 ? 1 :-1
					},
					setOffsetX: function(offset){
						_offsetX = offset;
					},
					setOffsetY: function(offset){
						_offsetY = offset;
					},
					setDirection: function(direction){
						_direction = direction;
					},
					recovery: function(){
						//还原本次滑动
						_distX = _offsetX;
						_distY = _offsetY;
					},
					/**判断是否满足触发条件，conditions触发条件,type速度还是距离*/
					callSuccess: function(condition,type){
						var isCall = false;
						if(type == 'speed'){
							isCall = Math.abs(Math.abs(_distX) - Math.abs(_offsetX) / _duration) > condition;
						}else{
							isCall = Math.abs(Math.abs(_distX) - Math.abs(_offsetX)) > condition;
						}
						return isCall
					},
					isMove: (function(){
						var _isMove = false;
						/**type == clear，则清除数据，每次滑动结束时调用清除*/
						return function(dist,type) {
							if(type == "clear"){
								_isMove = false;
								return;
							}
							if(_isMove) {
								return _isMove;
							}
							var allowed = Math.abs(dist || 5) * Math.ceil(window.devicePixelRatio / 2)
							var distX = Math.abs(_distX - _offsetX);
							var distY = Math.abs(_distY - _offsetY);
							_isMove = Math.max(distX, distY) > allowed;
							return _isMove;
						}
					})(),
					/**是否为水平滑动，只会在isMove后调用,当dixtX > distY视为水平*/
					isHorizontal: (function(){
						/**1是垂直，-1是水平*/
						var _isHorizontal = null;
						/**type == clear，则清楚数据，每次滑动结束时调用清楚*/
						return function(type) {
							if(type == "clear"){
								_isHorizontal = null;
								return;
							}
							if(_isHorizontal){ //只会判断一次
								return  _isHorizontal == -1;
							}
							var distX = Math.abs(Math.abs(_distX) - Math.abs(_offsetX));
							var distY = Math.abs(Math.abs(_distY) - Math.abs(_offsetY));
							_isHorizontal = distX - distY > 0 ? -1 : 1;
							return _isHorizontal == -1;
						}
					})(),
				}

			})()
		})(),
		
	}
	slider.addEventListener("touchstart",function(e){
		handleTouchStart.call(this,e);
	},false)

	slider.addEventListener("touchmove",function(e){
		handleTouchMove.call(this,e);
	},false)

	slider.addEventListener("touchend",function(e){
		handleTouchEnd.call(this,e);
	},false)

	function handleTouchStart(event){
		var e = event || window.event;
		//e.preventDefault();//禁止页面随着滚动
		UTILS.handletrans(false);
		sliderWrap.start = UTILS.createPoi(e);
	}
	function handleTouchMove(event){
		var e = event || window.event;
		//e.preventDefault();//禁止页面随着滚动
		var current = sliderWrap.current
		if(!current){ //单例
			current = sliderWrap.current = UTILS.createPoi(e);
		}else{
			UTILS.updatePoi(e,current);
		}
		UTILS.calCurrent();
		notify("move",event);
	}
	function handleTouchEnd(event){
		UTILS.handletrans(true);
		var e = event || window.event;
		//e.preventDefault();//禁止页面随着滚动
		sliderWrap.end = UTILS.createPoi(e);
		UTILS.cal();
		var ret = sliderWrap.ret;
		//ret.setOffsetX(ret.getRet().distX);
		notify("end");
	}

	/**根据类型做响应的回调处理*/
	function notify(type,event) {
		if(!sliderWrap.ret){
			return;
		}
		var ret = sliderWrap.ret.getRet();
		var distX = ret.absDistX;
		var duration = ret.duration;
		var conf = config;
		var pageInfo = UTILS.getPageInfo();
		var idx = pageInfo.getIdx();
		var direction = ret.direction;
		if(type == "move") {
			/**当距离少于minDistX，不移动，不然上下移动会受影响*/
			var isMove = sliderWrap.ret.isMove(config.minDistX);
			if(!isMove) {
				return;
			}
			//判断是否为水平移动
			var isHorizontal = sliderWrap.ret.isHorizontal();
			if(isHorizontal) {
				//水平，禁止页面左右滑动
				event.preventDefault();
				event.stopPropagation();
				move();
			}
			return;
		}
		if(type == "end"){
			if(!sliderWrap.ret.isHorizontal()){
				//不是水平滑动
				fireComplete();
				fireRecovery();
				return;
			}
			if(config.customSuccessCondition !== undefined){
				var fn = config.customSuccessCondition;
				if((fn === true) || (typeof fn === 'function' && fn(sliderWrap.ret.getRet(),sliderWrap,UTILS.getPageInfo))){
					fireSuccess();
				}else {
					fireRecovery();
				}
			} else{
				//判断触发条件，到达最左或最右不触发翻页且还原
				if((direction == 1 && idx == 0) || (direction == -1 && Math.abs(idx) == Math.abs(pageInfo.getPageCount()-1))) {
					fireRecovery();
				} else if(!sliderWrap.ret.callSuccess(conf.minDistX,"dist")){
					//小于minDistX不触发滑动，还原数据
					fireRecovery();
				}else if(!sliderWrap.ret.callSuccess(conf.fireDistX,"dist")){
					//不满足速度和距离要求
					fireRecovery();
				}else {
					fireSuccess();
				}
			}	
			fireComplete();

		}
		
	}

	function move(){
		if(config.autoCtrl){
			var transformX = sliderWrap.ret.getRet().distX;
			target.style.transform = 'translateX('+transformX+'px)'
		}
		typeof callbacks["move"] === 'function' && callbacks["move"](sliderWrap.ret.getRet(),sliderWrap,UTILS.getPageInfo);
	}
	function fireRecovery() {
		var direction = sliderWrap.ret.getRet().direction
		var pageInfo = UTILS.getPageInfo();
		var idx = pageInfo.getIdx();
		//还原当前滑动产生的数据
		sliderWrap.ret.recovery();
		//还原页面的移动
		//if(!(direction == 1 && idx == 0) && !(direction == -1 && idx == pageInfo.getPageCount()-1)) {
			target.style.transform = 'translateX('+sliderWrap.ret.getRet().distX+'px)'
		//}
		typeof callbacks["recovery"] === 'function' && callbacks["recovery"](sliderWrap.ret.getRet(),sliderWrap,pageInfo);
	}
	function fireSuccess(){
		if(config.autoCtrl){
			var pageInfo = UTILS.getPageInfo();
			var idx = pageInfo.getIdx();
			var direction = sliderWrap.ret.getRet().direction
			/*if(direction == 1 && idx == 0) {
				return;
			}
			if(direction == -1 && idx == pageInfo.getPageCount()-1) {
				return;
			}*/
			var _idx = direction == -1 ? (idx - 1) : (idx +1);
			var transformX = _idx * pageInfo.getPageWidth();
			target.style.transform = 'translateX('+transformX+'px)'
			sliderWrap.ret.setOffsetX(transformX);
			pageInfo.setIdx(_idx);
		}
		typeof callbacks["success"] === 'function' && callbacks["success"](sliderWrap.ret.getRet(),sliderWrap,pageInfo);
	}
	function fireComplete(){
		typeof callbacks["complete"] === 'function' && callbacks["complete"](sliderWrap.ret.getRet(),sliderWrap,UTILS.getPageInfo);
		sliderWrap.ret.isHorizontal("clear");
		sliderWrap.ret.isMove(null,"clear");
		UTILS.clear();//清除滑动数据
	}

	/**配置*/
	this.config = function(param){
		  Object.assign(config, param);
		  return this;
	}

	/** 滑动触发的回调*/
	this.move = function(callback){
		callbacks["move"] = callback;
		return this;
	}

	/** 滑动不成功还原时触发的回调*/
	this.recovery = function(callback){
		callbacks["recovery"] = callback;
		return this;
	}

	/** 滑动结束的回调*/
	this.complete = function(callback){
		callbacks["complete"] = callback;
		return this;
	}
	/**传入offsetX，一般在用户控制滑动时需要使用*/
	this.setOffsetX = function(offset){
		var ret = sliderWrap.ret;
		ret.setOffsetX(offset);
		return this;
	}
	/**切换至第几页，注意正负值*/
	this.setPageIdx = function(idx,direction){
		//需要-1/+1，因为在success会根据方向做处理，所以还要指定方向
		UTILS.getPageInfo().setIdx(idx-direction);
		sliderWrap.ret.setDirection(direction || -1);
		fireSuccess();
		return this;
	}
	/** 成功触发的回调*/
	this.success = function(callback,newOffset){
		callbacks["success"] = callback;
		return this;
	}
	/**自定义出发成功条件*/
	this.customSuccessCondition = function(fn){
		config.customSuccessCondition = fn;
		return this;
	}

})
