(function(){
	var userinfo = $("#iUserInfo");
	getuser(id,function(data){
		userinfo.find(".userName").html(data.nickname || data.name);
		userinfo.find(".userHeader").attr("src",data.header);
		jsonpLoadBlogs();
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
	
	function jsonpLoadBlogs(){
		
	}
	
	// 模板
	String.prototype.temp = function(obj) {
		return this.replace(/\[\w+\]?/g, function(match) {
			var ret = obj[match.replace(/\[|\]/g, "")];
			return (ret + "") == "undefined" ? "" : ret;
		})
	}
	var tempstr = $("#iBlogTemp").html();
	
	function callback(data){
		data = data || {};
		userinfo.find(".blogNum").html(data.blognum);
		var blogs = data.data ||[];
		var sb = [];
		for(let i=0;i<blogs.length;i++){
			var blog = blogs[i];
			sb.push(tempstr.temp(blog));
		}
		$("#iBlogs").html(sb.join(""));
	}
	
	$("#iBlogs").on("click" , ".item" , function(){
		var id = $(this).attr("data-id");
		location.href = "blog.do?id="+id;
	})
})()
