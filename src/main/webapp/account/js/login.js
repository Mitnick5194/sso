$("#iLogin").on("click" , function(){
		var username = $("#iUsername").val();
		var password = $("#iPassoword").val();
		var jsonp = document.createElement("script");
   		jsonp.type = "text/javascript";
   		jsonp.src="http://127.0.0.1:8081/user/login.do?callback=showUser&username="+escape(username)+"&password="+escape(password); 
   		document.getElementsByTagName("head")[0].appendChild(jsonp); 
})

function showUser(obj){
	console.log(obj);
	if(obj.code == 200){
		location.href="http://www.localhost.com:8082";
	}
	var userInfo = $("#iUserInfo");
	$("<div/>").appendTo(userInfo).html(obj.name);
}

/*$("#iLogin").on("click" , function(){
	var username = $("#iUsername").val();
	var password = $("#iPassoword").val();
	location.href = "http://www.localhost.com:8081/user/gotoLogin.do?op=login&username="+username+"&password="+password
})*/