(function(){
	var userinfo = $("#iUserInfo");
	var userSetting = $("#iUserSetting");
	var userSettingWin = userSetting.getSlideWindow({title: "我的"});
	 var editDv = $("#iEdit");
	var edit =editDv.getWindow();
	
	var slider = SliderFactory.createSlider(iArticle,iArticle,{
		autoCtrl: true,
		pageCount: 3,
		minDistX: 5
	}).success(function(ret,wrap,pageInfo){
		var idx = pageInfo.getIdx() || 0;
		$("#iNav").find(".navItem").removeClass("active");
		$("#iNav").find(".navItem").eq(Math.abs(idx)).addClass("active");
		handleTogglePage(Math.abs(idx));
	});
	
	/**缓存aj数据*/
	var cache = (function(){
		var obj = {};
		return {
			get: function(key){
				return obj[key];
			},
			set:function(key,value){
				obj[key] = value;
			}
		}
	})();
	
	var getBlogHost = (function(){
		var host = null;
		return function(biz){
			if(host){
				return host + biz;
			}
			$.ajax({
				url: 'getblogurl',
				async: false,//阻塞执行
				success: function(data){
					var url = data.msg;
					if(!url.endsWith("/")){
						url += "/";
					}
					host = url;
				}
			})
			return host + biz;
		}
	})();
	
	getuser(id,function(data){
		cache.set("user",data);
		userinfo.find(".userName").html(data.nickname || data.name);
		userinfo.find(".userHeader").attr("src",(data.header || "/sso/images/logo.jpg"));
		userinfo.find(".synopsis").html("简介："+(data.synopsis || "未填写"));
		var obj = {};
		$.extend(obj,data);
		obj.phone = "未公开";
		obj.email = "为公开";
		fillUserInfo(obj,$("#iTheInfo"));
	})
	function getuser(id,callback){
		$.ajax({
			type: "post",
			url: "getuserbyid",
			data:{
				id:id,
			},
			success: function(data){
				if(data.code == 200){
					typeof callback === 'function' && callback(data.data || {});
				}
			}
		})
	}
	// 模板
	String.prototype.temp = function(obj) {
		return this.replace(/\[\w+\]?/g, function(match) {
			var ret = obj[match.replace(/\[|\]/g, "")];
			return (ret + "") == "undefined" ? "" : ret;
		})
	}
	var tempstr = $("#iBlogTemp").html();
	loadblogs(function(data){
		var blogs = data ||[];
		var sb = handleBlogTemp(blogs);
		$("#iBlogs").html(sb.join(""));
		getBlogCount();
	});
	
	function handleBlogTemp(blogs){
		var sb = [];
		for(let i=0;i<blogs.length;i++){
			var blog = blogs[i];
			if(!blog.userHeader || !blog.userHeader.length){
				//头像为空，使用默认头像
				blog.userHeader = "/sso/images/default_user_header.jpg";
			}
			var labelsStr = blog.labels;
			if(labelsStr){
				var labels = labelsStr.split(",");
				// 标签处理一下
				var lab = [];
				for(let i=0;i<labels.length;i++){
					lab.push("<span class='label'>"+labels[i]+"</span>");
				}
				blog["labels"] = lab.join("");
			}
			sb.push(tempstr.temp(blog));
		}
		return sb;
	}
	
	/**
	 * 加载数据
	 * 
	 * @param t
	 *            类型
	 * @param b
	 *            回调
	 */
	function loadblogs(t,b) {
		var type,callback;
		if(typeof arguments[0] === "function"){
			callback = arguments[0];
		}else if(typeof arguments[0] === "string"){
			type = arguments[0];
			if(typeof arguments[1] === "function"){
				callback = arguments[1];
			}
		}
		var loading = $.showloading("加载中");
		var host = location.host;
		var url = getBlogHost("myblogs");
		$.ajax({
			type: 'post',
			dataType: 'JSONP',
		    jsonpCallback: 'callback',// success后会进入这个函数，如果不声明，也不会报错，直接在success里处理也行
			data:{
				type: type
			},
			url: url,
			success: function(data) {
				if(data.code != 200){
					$.showToast(data.msg);
					return;
				}
				typeof callback === "function" && callback(data.data || {});
			},
			error: function(e) {
				$.showToast(e)
			},
			complete: function(){
				loading.hide();
				// 在文档加载时已经判断了是不是夜间模式，但是异步加载的节点比较慢，所以需要手动再判断一下是不是夜间
// if($.isDarkMode()){
// $.toggleDarkMode($.isDarkMode())
// }
			}
			
		})
	}
	
	function getBlogCount(){
		var url = getBlogHost("getblogcount");
		$.ajax({
			type: 'post',
			dataType: 'JSONP',
		    jsonpCallback: 'callback',// success后会进入这个函数，如果不声明，也不会报错，直接在success里处理也行
			data:{
				id: id
			},
			url: url,
			success: function(data) {
				if(data.code != 200){
					$.showToast(data.msg);
					return;
				}
				userinfo.find(".blogNum").html("原创"+data.data+" |");
			},
			fail: function(e) {
			},
			complete: function(){
			}
			
		})
	}
	
	$("#iNav").on("click","div" , function(){
		var _this = $(this);
		if(_this.hasClass("active")){
			return;
		}
		_this.siblings(".active").removeClass("active");
		_this.addClass("active");
		togglePage(this);
	});
	
   /**
	 * 点击导航条，切换视图
	 * 
	 * @param navEle
	 *            导航条元素
	 */
	function togglePage(navEle){
		var nav = $(navEle);
		var idx = nav.attr("data-idx");
		var dis = idx * (100 / 3);
		$("#iArticle").css("transform","translateX(-"+dis+"%)");
		handleTogglePage(idx);
		slider.setPageIdx(-idx,-1);
	}
	
	/**
	 * 切换导航条动作完成后加载数据
	 * 
	 * @param idx
	 */
	function handleTogglePage(idx){
		var items = $("#iArticle").find(".blogs");
		for(let i = 0;i<items.length;i++){
			if(i == idx){
				items.eq(i).css("height","unset")
			}else{
				items.eq(i).css("height","0");
			}
		}
		if(idx == 0){
			return;
		}
		if(idx == 1){
			// 加载分类 TODO
		}
		if(idx == 2){
			if(cache.get("draff")){
				return;
			}
			// 草稿箱
			if(window.iDraft && !window.iTheInfo){
				loadblogs("draft",function(data){
					var blogs = data ||[];
					cache.set("draff",blogs);
					var sb = handleBlogTemp(blogs);
					$("#iDraft").html(sb.join(""));
				})
			}
			
		}
		
	}
	
	$("#iBlogs").on("click" , ".item" , function(){
		var id = $(this).attr("data-id");
		location.href = "blog?id="+id;
	})
	
	var settingLoad = false;//是否已经打开过，打开过就没有必要再设置信息了
	$("#iSettingBtn").on("click",function(){
		if(cache.get("setting")){
			userSettingWin.show();
			return;
		}
		fillUserInfo(cache.get("user"),userSetting)
		settingLoad = true;
		userSettingWin.show();
	})
	
	function fillUserInfo(obj,page){
		var header = obj.header;
		var name = obj.name;
		var nickname = obj.nickname;
		var phone = obj.phone;
		var email = obj.email;
		var sex = obj.sex;
		var address = obj.address;
		var synopsis = obj.synopsis;
		if(header){
			page.find(".userHeader").attr("src",header);
		}
		if(name){
			page.find(".name").html(name);
		}
		if(nickname){
			page.find(".nickname").html(nickname);
		}
		if(sex){
			page.find(".sex").html(sex);
		}
		if(address){
			page.find(".address").html(address);
		}
		if(synopsis){
			page.find(".synopsis").html(synopsis);
		}
		if(phone){
			page.find(".phone").html(phone);
		}
		if(email){
			page.find(".email").html(email);
		}
	}
	
	$("#iBlogs").on("click","section",function(){
		var id = $(this).attr("data-id");
		location.href = getBlogHost("blog")+"?id="+id;
	})
	
	$("#iDraft").on("click","section",function(){
		var id = $(this).attr("data-id");
		var form = $("#iForm");
		var url = getBlogHost("addblog");
		form.attr("action",url).attr("method","post");
		form.find("input").eq(0).val(id);
		form.submit();
	})
	
	var updatePasswd = $("#iUpdatePasswd");
	var updatePasswdWin = updatePasswd.getWindow();
	var editSex = $("#iEditSex");
	var editSexWin = editSex.getWindow();
	var obj = {};//提交更新数据
	//修改资料
	//点击的节点，在修改后更新页面内容
	var node = null;
	userSetting.on("click",".textEdit",function(){
		var _this = $(this);
		var type = _this.attr("data-type");
		if(!type){
			return;
		}
		node = _this;
		obj.type = type;
		if(type == "sex"){
			fnEditSex(obj);
		}else if(type == "updatePasswd"){
			fnUpdatePasswd(obj);
		}else{
			fnEditInfo(obj);
		}
		
	});
	
	function fnEditInfo(obj){
		var data = cache.get("user");
		var value = data[obj.type];
		var input = editDv.find("input[name=content]");
		input.val(value); 
		edit.show(function(){
			//要在show之后
			input.focus();
		});
	}
	
	var sexTemp = "<label><input type='radio' name='sex' [checked] value=[id] />[value]</label>";
	function fnEditSex(obj){
		if(!cache.get("sex")){
			var loading = $.showloading("正在加载");
			$.ajax({
				type: 'post',
				url: 'getsexenum',
				success: function(data) {
					if(data.code != 200){
						$.showToast(data.msg);
						return;
					}
					var sb = [];
					var _data = data.data;
					cache.set("sex",_data) ;
					var data = cache.get("user");
					for(let i=0;i<_data.length;i++){
						var _sex = _data[i];
						if(_sex.value == data.sex){
							_sex.checked = "checked";
						}
						sb.push(sexTemp.temp(_sex));
					}
					editSex.find(".radio-filed").html(sb.join(""));
					hasLoadSexEnum = true;
				},
				fail: function(e) {
				},
				complete: function(){
					loading.hide();
				}
			})
		}
		editSexWin.show();
	}
	
	function fnUpdatePasswd(){
		updatePasswdWin.show();
	}
	
	//编辑
	editDv.on("click",".deleteBtn",function(){
		var input = editDv.find("input[name=content]");
		input.val("");
		input.focus();
	}).on("click",".cancelBtn",function(){
		edit.hide(function(){
			var input = editDv.find("input[name=content]").val("");
		});
	}).on("click",".confirmBtn",function(){
		var value = editDv.find("input[name=content]").val();
		obj.value = value;
		var type = obj.type;
		if(type == "email"){
			if(!$.isMail(value)){
				$.showToast("邮箱格式错误");
				return;
			}
		}else if(type == "phone"){
			if(!$.isMobile(value)){
				$.showToast("手机号码格式错误");
				return;
			}
		}else if(type == "nickname"){
			if($.hasSymbol(value)){
				$.showToast("用户名不能包含特殊字符");
				return;
			}
		}
		submitUpdate(obj,function(){
			edit.hide();
		})
	})
	
	editSex.on("click",".cancelBtn",function(){
		editSexWin.hide();
	}).on("click",".confirmBtn",function(){
		var val = editSex.find("input[type=radio]:checked").val();
		obj.value = val;
		submitUpdate(obj,function(){
			editSexWin.hide();
		})
	})
	
	updatePasswd.on("click",".cancelBtn",function(){
		updatePasswd.find("input").val("");
		updatePasswdWin.hide();
	}).on("click",".confirmBtn",function(){
		var old = updatePasswd.find("input[name=oldPasswd]").val();
		var newPasswd = updatePasswd.find("input[name=newPasswd]").val();
		var confirm = updatePasswd.find("input[name=confirmPasswd]").val();
		if(!old){
			$.showToast("原密码错误");
			return;
		}
		if(!newPasswd){
			$.showToast("密码不能为空");
			return;
		}
		if(!confirm || confirm != newPasswd ){
			$.showToast("两次密码不一致");
			return;
		}
		obj.type = "password";
		obj.value = old;
		obj.password = newPasswd;
		submitUpdate(obj,function(){
			updatePasswdWin.hide(function(){
				location.reload();//刷新页面，重新登录
			})
		})
	})
	
	function submitUpdate(data,callback){
		$.showloading("正在修改");
		$.ajax({
			type: 'post',
			url: 'updateuser',
			data:obj,
			success: function(data) {
				if(data.code != 200){
					$.showToast(data.msg);
					return;
				}
				var value = obj.value;
				var type = obj.type;
				cache.get("user")[type] = value;
				if(value){
					if(node.attr("data-type") == "sex"){
						var _val = "";
						var sexs = cache.get("sex");
						for(let i=0;i<sexs.length;i++){
							var sex = sexs[i];
							if(sex.id == value){
								_val = sex.value;
								break;
							}
						}
						node.find(".setting-item-right").html(_val);
					}else{
						node.find(".setting-item-right").html(value)
					}
				}else{
					if(node.attr("data-type") == "sex"){
						node.find(".setting-item-right").html("保密");
					}else{
						node.find(".setting-item-right").html("未填写");
					}
				}
				$.showToast("修改成功");
				typeof callback === "function" && callback();
			},
			fail: function(e) {
			},
			complete: function(){
			}
		})
	}
	
	
	//退出登录
	$("#iLogoutBtn").on("click",function(){
		$.ajax({
			type: "post",
			url: "logout",
			success: function(data){
				if(data.code != 200){
					$.showToast(data.msg);
					return;
				}
				location.href = getBlogHost("index");
			}
		})
	})
	
})()
