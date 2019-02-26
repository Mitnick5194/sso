<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width,  initial-scale=1.0, user-scalable=0, minimum-scale=1.0,  maximum-scale=1.0" />
<title>登录</title>
<style type="text/css">
	.hidden{display: none};
	.hiddenforce{display: none !important;}
	*{font-size: 14px;}
	body{padding: 20px;}
	 input,textarea,select,a:focus {outline: none;}
	 .mobile-login-dv{overflow: hidden}
	.key-dv,.passwd-dv{padding: 0 10px; margin:20px 0; height: 45px;line-height: 45px;border: 1px solid #eee;border-radius: 3px;}
	.key-dv>input,.passwd-dv>input{border: none}
	.login-btn{padding: 10px 5px;background: #337ab7;border-radius: 5px;text-align: center;font-size: 18px; color: #fff;margin-top:25px;cursor: pointer;}
	.form-group{display: flex;width: 200%;transition:all .3s ease}
	.form-group input{width:98%;height: 80%;}
	.form-group>div{width: 100%;}
	.navBar{width:100%;display: flex;}
	.navBar>div{width: 50%;padding: 10px 30px;font-size: 16px;text-align:center;cursor: pointer;}
	.navBar>div:nth-child(2){}
	.navBar>.active{border-bottom:2px solid #337ab7;}
	.exsit-name{color: red;font-size: 12px;}
	/* pc端 */
	.pc-login-dv{padding: 30px;width: 90%;margin: 0 auto;display: none}
	.right-picture{display: inline-block;width: 40%;padding: 0 40px;}
	.right-picture>img{width:100%;}
	.pc-form-group{padding: 0 40px;border:1px solid #eee;}
	.wrap{width: 450px;overflow: hidden}
	/* 判断屏幕大小 */
	/* 移动端或pad */
	@media screen and (min-width: 768px) {.pc-login-dv{display: none} .mobile-login-dv{display:block}}
	@media screen and (min-width: 768px) {.pc-login-dv{display: flex} .mobile-login-dv{display:none} }
</style>
 <link href="${pageContext.request.contextPath }/${serviceId }/common/common.css" rel="stylesheet" type="text/css">
</head>
	<body>
		<input id="iRef" type="hidden" value="${ref }" />
		<!-- 移动端 -->
		<div  class="mobile-login-dv">
			<div class="navBar">
				<div data-type="login" class="active">账号登录</div>
				<div>快速注册</div>
			</div>
			<div id="iForms" class="form-group ">
				<div class="login-form" id="iLoginForm">
					<div class="key-dv"><input type="text" name="key" placeholder="用户名/手机号/邮箱"/></div>
					<div class="passwd-dv"><input type="password" name="password" placeholder="密码"/></div>
					<div id="iLoginBtn" class="login-btn submitBtn">登录</div>
				</div>
				<div class="register-form" id="iRegisterForm">
					<div class="key-dv"><input type="text" name="key"  onblur="verify(this)" placeholder="请输入用户名"/></div>
					<div class="exsit-name hidden">*用户名已存在</div>
					<div class="passwd-dv"><input type="password" name="password" placeholder="密码"/></div>
					<div class="passwd-dv"><input type="password" name="confirmPasswd" placeholder="确认密码"/></div>
					<div data-type="register" id="iLoginBtn" class="login-btn submitBtn">注册</div>
				</div>
			</div>
		</div>
		
		<!-- PC端 -->
		<div class="pc-login-dv">
			<div class="right-picture">
				<img alt="图片加载失败" src="${ pageContext.request.contextPath }/images/logo.jpg">
			</div>
			<div class="login-form  pc-form-group">
			
				<div class="wrap">
					<div class="navBar">
						<div data-type="login" class="active">账号登录</div>
						<div>快速注册</div>
					</div>
					<div id="iPcForms" class="form-group">
						<div class="login-form" id="iLoginForm">
							<div class="key-dv"><input type="text" name="key" placeholder="用户名/手机号/邮箱"/></div>
							<div class="passwd-dv"><input type="password" name="password" placeholder="密码"/></div>
							<div id="iLoginBtn" class="login-btn submitBtn">登录</div>
						</div>
						<div class="register-form" id="iPcRegisterForm">
							<div class="key-dv"><input type="text" name="key" onblur="verify(this)" placeholder="请输入用户名"/></div>
							<div class="exsit-name hidden">*用户名已存在</div>
							<div class="passwd-dv"><input type="password" name="password" placeholder="密码"/></div>
							<div class="passwd-dv"><input type="password" name="confirmPasswd" placeholder="确认密码"/></div>
							<div data-type="register"  class="login-btn submitBtn">注册</div>
						</div>
					</div>
				</div>
				
			</div>
		</div>
	</body>
	
	<script src="http://www.ajie18.top/js/jquery-1.9.1.js"></script>
	<script type="text/javascript" src="${ pageContext.request.contextPath }/${serviceId }/common/common.js"></script>
	<script src="${ pageContext.request.contextPath }/${serviceId }/js/login.js"></script>
	<script type="text/javascript">
		var ref = $("#iRef").val();
	</script>
	
</html>