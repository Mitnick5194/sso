<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>登录</title>
</head>
<body>
	<input type="hidden" id="iRef" value="${redirect }" />
	username: <input id="iUsername" type="text" name="username" /><br>
	password: <input type="password" id="iPassoword" name="password" /><br>
	<button id="iLogin">登录</button>
	<div id="iUserInfo"></div>
	
	<script type="text/javascript" src="/js/jquery-1.9.1.js"></script>
	<script type="text/javascript" src="/account/js/login.js"></script>
	</body>
</html>