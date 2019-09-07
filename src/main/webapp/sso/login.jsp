<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width,  initial-scale=1.0, user-scalable=0, minimum-scale=1.0,  maximum-scale=1.0" />
<title>登录</title>
 <link href="${pageContext.request.contextPath }/css/global.css" rel="stylesheet" type="text/css">
 <link href="${pageContext.request.contextPath }/common/common.css" rel="stylesheet" type="text/css">
 
<style type="text/css">
	input[type=text]{border:none}
	.hidden{display: none};
	.hiddenforce{display: none !important;}
	*{font-size: 14px;}
	body{padding: 20px;}
	 input,textarea,select,a:focus {outline: none;}
	 .flex{display: flex;}
	 .mobile-login-dv{overflow: hidden;max-width: 400px;}
	.key-dv,.passwd-dv,.vertify-dv{padding: 0 10px; margin:20px 0; height: 45px;line-height: 45px;border: 1px solid #eee;border-radius: 3px;}
	.key-dv>input,.passwd-dv>input{border: none}
	.login-btn{padding: 10px 5px;background: #337ab7;border-radius: 5px;text-align: center;font-size: 18px; color: #fff;margin-top:25px;cursor: pointer;}
	.form-group{display: flex;width: 200%;transition:all .2s ease;height: 70vh}
	.form-group input{width:98%;height: 80%;}
	.form-group>div{width: 100%;}
	.navBar{width:100%;display: flex;position: relative;}
	.navBar>.select-item{width: 50%;padding: 10px 30px;font-size: 16px;text-align:center;cursor: pointer;}
	.navBar>div:nth-child(2){}
	/* .navBar>.active{border-bottom:2px solid #337ab7;} */
	.select-bar{position: absolute;width: 50%;height: 2px;background: #337ab7;left: 0;bottom: 0;}
	.exsit-name{color: red;font-size: 12px;}
	.vertify-dv{display: flex;border: none !important;padding-left: 0;}
	.vertify-input-dv{display: inline-block;width: calc(40% - 2px);width: -webkit-calc(40% - 2px); height: 45px;border: 1px solid #eee;}
	.vertify-dv input{width:90%;height: 98%;padding: 0 5px;}
	.vertify-image{width: 60%;text-align: right;height: 98%;    background: url(/sso/images/peding.gif)no-repeat;background-size: 80px 40px;background-position: right;}
	.vertify-image>img{border : 1px solid #888;height: 40px;width: 80px}
	/* pc端 */
	.pc-login-dv{padding: 30px;width: 90%;margin: 0 auto;display: none}
	.left-picture{display: none;width: 40%;padding: 0 40px;}
	.left-picture>img{width:100%;}
	.pc-form-group{padding: 0 40px;border:1px solid #eee;}
	.wrap{width: 450px;overflow: hidden}
	/* 判断屏幕大小 */
	/* 移动端或pad */
	@media screen and (min-width: 768px) {.left-picture{display: inline-block;}}
</style>

</head>
	<body>
		<input id="iRef" type="hidden" value="${ref }" />
		<div class="flex">
			<div class="left-picture">
				<img alt="图片加载失败" src="${ pageContext.request.contextPath }/images/logo.jpg">
			</div>
			<div class="login-dv">
				<div  class="mobile-login-dv">
					<div class="navBar" id="iNvaBar">
						<div data-type="login" class="select-item">账号登录</div>
						<div class="select-item">快速注册</div>
						<div class="select-bar" id="iSelectBar"></div>
					</div>
					<div id="iForms" class="form-group ">
						<div class="login-form form" id="iLoginForm">
							<div class="key-dv"><input type="text" name="key" placeholder="用户名/手机号/邮箱"/></div>
							<div class="passwd-dv"><input class="enter" data-type="login" type="password" name="password" placeholder="密码"/></div>
							<div class="login-btn submitBtn">登录</div>
						</div>
						<div class="register-form form" id="iRegisterForm">
							<div class="key-dv"><input type="text" name="key"  onblur="verify(this)" placeholder="请输入用户名"/></div>
							<div class="exsit-name hidden">*用户名已存在</div>
							<div class="passwd-dv"><input type="password" name="password" placeholder="密码"/></div>
							<div class="passwd-dv"><input type="password" name="confirmPasswd" placeholder="确认密码"/></div>
							<div class="vertify-dv">
								<div class="vertify-input-dv">
									<input type="text" name="vertifyCode" class="enter" data-type="register" placeholder="验证码"/>
								</div>
								<div class="vertify-image"><img class="verifyImg" src=""/></div>
							</div>
							<div data-type="register" class="login-btn submitBtn">注册</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</body>
	
	<script src="${ pageContext.request.contextPath }/js/jquery-1.9.1.js"></script>
	<script type="text/javascript" src="${ pageContext.request.contextPath }/common/common.js"></script>
	<script src="${ pageContext.request.contextPath }/plugin/Slider.js?t=2019"></script>
	<script src="${ pageContext.request.contextPath }/sso/js/login.js"></script>
	<script type="text/javascript">
		var ref = $("#iRef").val();
		
	</script>
	
</html>