<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html >
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>用户页面</title>
</head>
<body>

所有用户：
<c:forEach items="${users }" var="user">
	<div>id: ${user.id }</div>
	<div> name: ${user.name }</div>
	<div> email: ${user.email }</div>
	<div> outerId: ${user.outerId }</div>
</c:forEach>

<button id="iBtn">点我</button>

	用户页面
	<div>id: ${user.id }</div>
	<div> name: ${user.name }</div>
	<div> email: ${user.email }</div>
	</body>
	
	<script type="text/javascript" src="/js/jquery-1.9.1.js"></script>
	<script>
	$("#iBtn").on("click" , function(){
		$.ajax({
			url: 'user.do',
			success: function(data){
				console.log(data);
			}
		})
	})
	
		
	</script>
</html>