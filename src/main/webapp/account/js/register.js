
function showUser(obj){
	console.log(obj);
	var userInfo = $("#iUserInfo");
	$("<div/>").appendTo(userInfo).html(obj.name);
}

$("#iRegister").on("click" , function(){
		var username = $("#iUsername").val();
		var password = $("#iPassoword").val();
		var jsonp = document.createElement("script");
   		jsonp.type = "text/javascript";
   		jsonp.src="http://127.0.0.1:8081/user/register.do?callback=showUser&username="+escape(username)+"&password="+escape(password); 
   		document.getElementsByTagName("head")[0].appendChild(jsonp); 
})