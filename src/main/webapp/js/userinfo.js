(function(){
	var userinfo = $("#iUserInfo");
	var userSetting = $("#iUserSetting");
	var userSettingWin = userSetting.getSlideWindow({title: "我的"});
	getuser(id,function(data){
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
	loadblogs(function(data){
		var blogs = data ||[];
		var sb = handleBlogTemp(blogs);
		$("#iBlogs").html(sb.join(""));
	});
	
	function handleBlogTemp(blogs){
		var sb = [];
		for(let i=0;i<blogs.length;i++){
			var blog = blogs[i];
			var labelsStr = blog.labels;
			if(labelsStr){
				var labels = labelsStr.split(",");
				//标签处理一下
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
	 * @param t 类型
	 * @param b 回调
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
		var url;
		//本机
		if(host.indexOf("localhost") > -1 ||host.indexOf("127.0") > -1 || host.indexOf("10.8") > -1){
			url = "http://localhost:8080/blog/myblogs.do";
		}else if(serverId == 'xff'){ //代理本机
			url = "http://www.ajie18.top/ajie/blog/myblogs.do";
		}
		else{
			url = "http://www.ajie18.top/blog/myblogs.do";
		}
		$.ajax({
			type: 'post',
			dataType: 'JSONP',
		    jsonpCallback: 'callback',//success后会进入这个函数，如果不声明，也不会报错，直接在success里处理也行
			data:{
				type: type
			},
			url: url,
			success: function(data) {
				console.log(data);
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
				//在文档加载时已经判断了是不是夜间模式，但是异步加载的节点比较慢，所以需要手动再判断一下是不是夜间
//				if($.isDarkMode()){
//					$.toggleDarkMode($.isDarkMode())
//				}
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
	* @param navEle 导航条元素
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
	
	var cacheDrafts;//草稿箱博客
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
			//加载分类 TODO
		}
		if(idx == 2){
			if(cacheDrafts){
				return;
			}
			//草稿箱
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
	
	$("#iSettingBtn").on("click",function(){
		userSettingWin.show();
	})
	
	/*userSetting.on("click",".cancel",function(){
		userSettingWin.hide();
	}).on("click",".submit",function(){
		userSettingWin.hide();
	})*/
})()
