<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width,  initial-scale=1.0, user-scalable=0, minimum-scale=1.0,  maximum-scale=1.0" />
<title>用户详情</title>
 <link href="${pageContext.request.contextPath }/${serverId }/css/global.css" rel="stylesheet" type="text/css">
 <link href="${pageContext.request.contextPath }/${serverId }/common/common.css" rel="stylesheet" type="text/css">
 <link href="${ pageContext.request.contextPath }/${serverId}/plugin/suspend-btn.css" rel="stylesheet" type="text/css">
<style type="text/css">
html{font-size:14px;height: 100%;}
body{margin:0;padding:0;height: 100%}
.header{background: url('./images/background.jpg') no-repeat;background-size: 100%; width: 100%;height: 180px;}
.header-info{position: absolute;top: 0;left: 0;width: 100%;height: 300px;height: 180px;}
.header-img{width: 100%;text-align: center;margin-top: 20px;}
.header-info>.user-name{font-size: 16px;margin-top: 5px;}
.header-img>img{display: inline-block; width: 70px;height: 70px;border-radius: 50%}
.header-info{width: 100%; text-align: center;color:#fff;}
.blog-info{padding: 5px 0;}
.setting{top: 0;right: 0;width: 40px;height: 40px;position: absolute;background: url('./images/set.jpg') no-repeat;background-size: 85%; }
.main{margin-top: 20px;width: 100%;overflow: hidden;}
.nav{display: flex;}
.nav>div{width: 100%;text-align: center;position: relative;padding: 5px 0;}
.nav .active:after{content: '';position: absolute;width: 50%;height: 2px;background: #337ab7;bottom: 1px;left:25%;}
.nav div+div{border-left: 1px solid #bbb;}
.article{display: flex;width: 300%;padding: 10px;transition: all .15s ease}
.article>div{width: 100%;padding: 10px;}
.blog{width: 100%; height: 300px;display: flex;align-items:center; justify-content: center;font-size: 18px;}
.align-c{text-align: center;}
.no-data{font-size: 16px; color: #888;}
.user-setting-page{padding: 0 5px;display: none;}
.op-nav{padding: 10px 15px;border-bottom: 1px solid #888;text-align: center;}
.op-nav>div{width: 50%; font-size: 18px;}
.op-nav div:nth-child(2){color: #337ab7;border-left:1px solid #888;}
.setting-item{padding: 15px; border-bottom: 1px solid #eee;align-items: center;}
.setting-item>img{width: 30px;height: 30px;border-radius: 50%;}
.setting-item div:nth-child(1){width: 100%;flex: 1}
.arrow_right{background: url('${pageContext.request.contextPath }/${serverId }/images/arrow_right.jpg') no-repeat center right;}
.arrow_right{background-size: 25px;}
.setting-item-right{margin-right: 15px;}
/* 博客内容 */
.blogs>section{border-bottom: 1px solid #eee;padding: 20px 15px;background: #fff;}
.blogs>section.darkModeActive{border-bottom: 1px solid #000;}
.blogs .title{font-size: 22px;font-weight: bold;padding-bottom: 10px;cursor: pointer;}
.abstract-content{padding-bottom: 10px;}
.extract-list{display: flex;}
.extract-list>div{width: 50%;white-space: nowrap;align-items: center;}
.extract-list img{width: 25px;border-radius:50%;height: 25px;}
.list-left>div,.list-right>div{margin-left: 10px;}
.list-right{text-align: right;}
.list-right div:nth-child(1){width:100%;border-right: 1px solid #888;padding-right: 10px;}
.list-right>div{text-align: right;}
.log-frame{width: 85%;min-height: 200px;word-wrap:break-word}
.log-nav{padding: 10px;background: #337ab7;display: flex;white-space: nowrap;color: #fff;}
.log-nav div:nth-child(1){width: 100%}
.system-info{padding: 10px;border: 1px solid #eee;font-size:12px;}
.page-log{padding: 10px;}
.error-font{color: red;}
.col-green{color:green}
.col-red{color: red}
.logout-btn{width: calc(100% - 70px);width:-webkit-calc(100% - 70px) ; height: 40px;line-height: 40px;margin: 0 auto;text-align: center;border-radius: 5px;color:#fff;background: #337ab7;position: fixed;bottom: 10px;left: 35px;}
/**PC桌面*/
@media screen and (min-width: 1100px){
	/* 隐藏菜单 */
	.operating {display: none !important;}
}
</style>

<script type="text/javascript">
//startTime文档执行到这里的时间戳,endTime文档加载完毕的时间戳
var errMsg , errCount = 0,startTime = new Date().getTime(),endTime;
window.addEventListener("error" , function(e){
	/* console.log("监听到错误");
	console.log(e);
	alert(e.error +" \r\n  "+e.error.stack); */
	errMsg = e.error;
	if(e.error){
		errMsg += "<br>"+e.error.stack;
	}
	++errCount;
	pageLog();
})

</script>
</head>
	<body>
		<div class="container">
			<div class="header">
			</div>
			<div class="header-info" id="iUserInfo">
				<div class="header-img">
					<img alt="" src="" class="userHeader">
				</div>
				<div class="user-name userName"></div>
				<div class="blog-info">
					<span class="blogNum">原创 0 |</span>
					<span> 转载  0 |</span>
					<span>收藏 0 </span>
				</div>
				<div class="setting" id="iSettingBtn"></div>
			</div>
			
			<div class="main">
				<div class="nav" id="iNav">
					<div  data-idx="0" class="active">博文</div>
					<div  data-idx="1" >分类</div>
					<div data-idx="2">草稿箱</div>
				</div>
				<div id="iArticle" class="article">
					<div class="blogs" id="iBlogs">
					</div>
					<div class="blogs sort">
						<div class="align-c no-data">没有任何分类</div>
					</div>
					<div  class="blogs" id="iDraft">
					</div>
				</div>
			</div>
		</div>
		
		<!-- 表单，跳转到编辑草稿 -->
		<form class="hidden" id="iForm">
			<input name="id" />
		</form>
		
		<!-- 用户信息设置弹窗 -->
		<div id="iUserSetting" class="user-setting-page" >
			<section class="flex setting-item arrow_right">
				<div>头像</div>
				<img class="setting-item-right userHeader">
			</section>
			<section class="flex setting-item arrow_right">
				<div>用户名</div>
				<div class="setting-item-right name">无</div>
			</section>
			<section class="flex setting-item arrow_right userName">
				<div>昵称</div>
				<div class="setting-item-right nickName">无</div>
			</section>
			<section class="flex setting-item arrow_right">
				<div>性别</div>
				<div class="setting-item-right sex" >保密</div>
			</section>
			<section class="flex setting-item arrow_right">
				<div>地址</div>
				<div class="setting-item-right address">不详</div>
			</section>
			<section class="flex setting-item arrow_right">
				<div>简介</div>
				<div class="setting-item-right synopsis">无</div>
			</section>
			<section class="flex setting-item arrow_right">
				<div>修改密码</div>
			</section>
			
			<div class="logout-btn" id="iLogoutBtn">退出登录</div>
		</div>
	<div class="log-frame" id="iLogFrame">
		<div class="log-nav"><div>页面日志</div><div>info：0 warn：0 <span class="logErr error-font">error: 0</span></div></div>
		<div class="system-info"></div>
		<div class="page-log"></div>
	</div>
	
	<jsp:include page="/footer.jsp"></jsp:include>
	<script src="http://www.ajie18.top/js/jquery-1.9.1.js"></script>
	<script type="text/javascript" src="${ pageContext.request.contextPath }/${serverId}/common/common.js"></script>
	<script type="text/javascript">
		//日志弹窗
		var  logFrame = $("#iLogFrame").getWindow();
		logFrame.setCloser(false);
		logFrame.clickbackhide();
		//页面错误日志
		function pageLog(){
			var userAgent = navigator.userAgent;
			var frame =  $("#iLogFrame")
			var supportCss3 = $.supportcss3;
			var msg = "";
			var sb = [];
			sb.push("<div>系统：");
			sb.push(userAgent);
			if(supportCss3){
				sb.push(" <span style='color: green'>正常</span>");
			}else{
				sb.push(" <span class='col-green'>异常</span>");
				frame.find(".system-info").html("系统："+userAgent+" <span class='col-red'>异常</span>");
			}
			sb.push("</div>")
			sb.push("<div>");
			sb.push("是否支持微信js api调用：");
			if($.isBrowser("weixin")){
				sb.push("<span class='col-green'>是</span>")
			}else{
				sb.push("<span class='col-red'>否</span>")
			}
			sb.push("</div>");
			frame.find(".system-info").html(sb.join(""));
			sb = [];
			sb.push("<div>");
			sb.push("页面信息：");
			//var pageLog ="页面信息：";
			if(!errMsg) {
				sb.push("<span style='color: green'>正常</span>");
			} else {
				frame.find(".logErr").html("error："+ errCount);
				sb.push("<span style='color:red'>");
				sb.push(errMsg);
				sb.push("</span><br>");
			}
			sb.push("</div>");
			sb.push("<div>");
			sb.push("页面加载时间：");
			if(!endTime){
				endTime = startTime + 2000;
			}
			var interval = (endTime - startTime) / 1000;
			sb.push("<span class='interval'>");
			sb.push(interval);
			sb.push("</span>");
			sb.push("s");
			sb.push("</div>")
			sb.push("<div>")
			sb.push("加载速度：");
			if(interval < 2) {
				sb.push("<span class='col-green'>快</span>")
			} else if (interval <3) {
				sb.push("<span class='col-green'>较快</span>")
			} else if (interval <= 5) {
				sb.push("<span class='col-red'>慢</span>")
			} else if (interval > 5) {
				sb.push("<span class='col-red'>高延迟</span>")
			}
			sb.push("</div>");
			frame.find(".page-log").html(sb.join(""));
			logFrame.show();
		}
	</script>
	<script type="text/temp"  id="iBlogTemp">
		<section class='darkMode'  data-id='[id]' >
			<div class="title">[title]</div>
			<div class="abstract-content">[abstractContent]</div>
			<div class="extract-list">
				<div class="list-left flex">
					<img class='user' data-id='[userId]' data-type='userinfo'  src="[userHeader]">
					<div class='user' data-id='[userId]' data-type='userinfo'>[user]</div>
					<div>[createDate]</div>
				</div>
				<div class="list-right flex">
					<div>阅读 [readNum]</div>
					<div>评论 [commentNum]</div>
				</div>
			</div>
		</section>
	</script>
	<script>
		var id = "${id}";
		var serverId = "${serverId}";
	</script>
	<script type="text/javascript" src="${ pageContext.request.contextPath }/${serverId }/plugin/suspend-btn.js"></script>
	<script type="text/javascript" src="${ pageContext.request.contextPath }/${serverId }/global/suspend-btn-instance.js"></script>
	<script src="js/userinfo.js"></script>
</html>