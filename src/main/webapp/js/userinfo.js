(function(){
	var userinfo = $("#iUserInfo");
	var userSetting = $("#iUserSetting");
	var userSettingWin = userSetting.getSlideWindow({title: "我的"});
	var userData = null;
	 var editDv = $("#iEdit");
	var edit =editDv.getWindow();
	getuser(id,function(data){
		userData = data;
		userinfo.find(".userName").html(data.nickname || data.name);
		userinfo.find(".userHeader").attr("src",data.header);
	})
	function getuser(id,callback){
		$.ajax({
			type: "post",
			url: "getuserbyid.do",
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
	/*loadblogs(function(data){
		var blogs = data ||[];
		var sb = handleBlogTemp(blogs);
		$("#iBlogs").html(sb.join(""));
		getBlogCount();
	});*/
	
	function handleBlogTemp(blogs){
		var sb = [];
		for(let i=0;i<blogs.length;i++){
			var blog = blogs[i];
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
		var url = getBlogHost("myblogs.do");
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
			fail: function(e) {
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
		var items = $("#iArticle").find(".blogs");
		for(let i = 0;i<items.length;i++){
			if(i == idx){
				items.eq(i).css("height","unset")
			}else{
				items.eq(i).css("height","0");
			}
		}
		handleTogglePage(idx);
	}
	
	var cacheDrafts;// 草稿箱博客
	/**
	 * 切换导航条动作完成后加载数据
	 * 
	 * @param idx
	 */
	function handleTogglePage(idx){
		if(idx == 0){
			return;
		}
		if(idx == 1){
			// 加载分类 TODO
		}
		if(idx == 2){
			if(cacheDrafts){
				return;
			}
			// 草稿箱
			loadblogs("draft",function(data){
				var blogs = data ||[];
				cacheDrafts = blogs;
				var sb = handleBlogTemp(blogs);
				$("#iDraft").html(sb.join(""));
			})
		}
	}
	
	$("#iBlogs").on("click" , ".item" , function(){
		var id = $(this).attr("data-id");
		location.href = "blog.do?id="+id;
	})
	
	var settingLoad = false;//是否已经打开过，打开过就没有必要再设置信息了
	$("#iSettingBtn").on("click",function(){
		console.log(userData);
		if(settingLoad){
			userSettingWin.show();
		}
		if(!userData){
			userSettingWin.show();
			return;
		}
		var header = userData.header;
		var name = userData.name;
		var nickname = userData.nickname;
		var phone = userData.phone;
		var email = userData.email;
		var sex = userData.sex;
		var address = userData.address;
		var synopsis = userData.synopsis;
		if(header){
			userSetting.find(".userHeader").attr("src",header);
		}
		if(name){
			userSetting.find(".name").html(name);
		}
		if(nickname){
			userSetting.find(".nickname").html(nickname);
		}
		if(sex){
			userSetting.find(".sex").html(sex);
		}
		if(address){
			userSetting.find(".address").html(address);
		}
		if(synopsis){
			userSetting.find(".synopsis").html(synopsis);
		}
		if(phone){
			userSetting.find(".phone").html(phone);
		}
		if(email){
			userSetting.find(".email").html(email);
		}
		settingLoad = true;
		userSettingWin.show();
	})
	
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
		var value = userData[obj.type];
		var input = editDv.find("input[name=content]");
		input.val(value); 
		edit.show(function(){
			//要在show之后
			input.focus();
		});
	}
	
	var cacheSexEnum = null;//枚举性别
	var sexTemp = "<label><input type='radio' name='sex' checked='[checked]' value=[id] />[value]</label>";
	function fnEditSex(obj){
		if(!cacheSexEnum){
			var loading = $.showloading("正在加载");
			$.ajax({
				type: 'post',
				url: 'getsexenum.do',
				success: function(data) {
					console.log(data);
					if(data.code != 200){
						$.showToast(data.msg);
						return;
					}
					var sb = [];
					var _data = data.data;
					for(let i=0;i<_data.length;i++){
						var _sex = _data[i];
						if(_sex.value == "男"){
							_sex.checked = "checked";
						}else{
							_sex.checked = "false";
						}
						sb.push(sexTemp.temp(_sex));
					}
					editSex.find(".radio-filed").html(sb.join(""));
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
		$.showloading("正在修改");
		submitUpdate(obj,function(){
			$.showToast("修改成功！",function(){
				edit.hide(function(){
					if(value){
						node.find(".setting-item-right").html(value)
					}else{
						if(node.attr("data-type" == "sex")){
							node.find(".setting-item-right").html("保密");
						}else{
							node.find(".setting-item-right").html("未填写");
						}
					}
					editDv.find("input[name=content]").val("");
				})
			})
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
		$.showloading("正在修改");
		submitUpdate(obj,function(){
			$.showToast("修改成功！",function(){
				updatePasswdWin.hide(function(){
					window.reload();//刷新页面，重新登录
				})
			})
		})
	})
	
	function submitUpdate(data,callback){
		$.ajax({
			type: 'post',
			url: 'updateuser.do',
			data:obj,
			success: function(data) {
				if(data.code != 200){
					$.showToast(data.msg);
					return;
				}
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
			url: "logout.do",
			success: function(data){
				if(data.code != 200){
					$.showToast(data.msg);
					return;
				}
				location.href = getBlogHost("index");
			}
		})
	})
	
	function getBlogHost(biz){
		var host = location.host;
		var url;
		if(host.indexOf("localhost") > -1 ||host.indexOf("127.0") > -1 || host.indexOf("10.8") > -1){
			url = "http://localhost:8080/blog/"+biz+".do";
		}else if(serverId == 'xff'){
			url = "http://www.ajie18.top/ajie/blog/"+biz+".do";
		}
		else{
			url = "http://www.ajie18.top/blog/"+biz+".do";
		}
		return url;
	}
	
})()
