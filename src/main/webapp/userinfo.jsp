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
<style type="text/css">
html{font-size:14px;}
body{margin:0;padding:0}
.header{background: url('./images/background.jpg') no-repeat;background-size: 100%; width: 100%;height: 180px;}
.header-info{position: absolute;top: 0;left: 0;width: 100%;height: 300px;height: 180px;}
.header-img{width: 100%;text-align: center;margin-top: 20px;}
.header-info>.user-name{font-size: 16px;margin-top: 5px;}
.header-img>img{display: inline-block; width: 80px;height: 80px;border-radius: 50%}
.header-info{width: 100%; text-align: center;color:#fff;}
.blog-info{padding: 5px 0;}
.setting{top: 0;right: 0;width: 40px;height: 40px;position: absolute;background: url('./images/set.jpg') no-repeat;background-size: 85%; }
.main{margin-top: 20px;width: 100%;overflow: hidden;}
.nav{display: flex;}
.nav>div{width: 100%;text-align: center;position: relative;padding: 5px 0;}
.nav .active:after{content: '';position: absolute;width: 50%;height: 2px;background: #337ab7;bottom: 1px;left:25%;}
.nav div+div{border-left: 1px solid #bbb;}
.article{display: flex;width: 300%;padding: 10px;white-space: nowrap;transition: all .15s ease}
.article>div{width: 100%;padding: 10px;}
.blog{width: 100%; height: 300px;display: flex;align-items:center; justify-content: center;font-size: 18px;}
.align-c{text-align: center;}
.no-data{font-size: 16px; color: #888;}
.user-setting-page{padding: 0 5px }
.op-nav{padding: 10px 15px;border-bottom: 1px solid #888;text-align: center;}
.op-nav>div{width: 50%; font-size: 18px;}
.op-nav div:nth-child(2){color: #337ab7;border-left:1px solid #888;}
.setting-item{padding: 15px; border-bottom: 1px solid #eee;align-items: center;}
.setting-item>img{width: 30px;height: 30px;border-radius: 50%;}
.setting-item div:nth-child(1){width: 100%;flex: 1}
.arrow_right{background: url('${pageContext.request.contextPath }/${serverId }/images/arrow_right.jpg') no-repeat center right;}
.arrow_right{background-size: 25px;}
.setting-item-right{margin-right: 15px;}
</style>
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
					<div data-idx="2">专栏</div>
				</div>
				<div id="iArticle" class="article">
					<div class="blog">
						站点尚未开通，敬请期待...
				<!-- <script type="text/temp" id="iBlogTemp">
						<section data-id="[id]" class="content-dv item">
	           				<h2 class="content-dv-title" title="">
	            				<span>[title]</span>
	            			</h2>
	            			<div class="summary">[content]</div>
		 				 <div class="list-user-bar">
		  					<section class="sec-left sec">
		  					<div ><img class="user-header" src="[userHeader]" /></div>
		  					<div class="inteval">[user]</div>
		  					<div  class="inteval">[createDate]</div>
		  				<div  class="color-gre labels">
		  					[labels]
		  					</div>
		  			</section>
		  			<section class="sec-right sec">
		  				<div  class="inteval"><span class="color-gre">[readNum] </span>阅读</div>
		  				<div><span class="color-gre">[commentNum] </span>评价</div>
		  			</section>
		 		 </div>
			</section>
	</script> -->	
					</div>
					<div class="sort">
						<div class="align-c no-data">没有任何分类</div>
					</div>
					<div  class="column "><div class="align-c no-data">没有任何专类</div></div>
				</div>
			</div>
		</div>
		
		
	<!-- 用户信息设置弹窗 -->
	<div id="iUserSetting" class="user-setting-page">
		<section class="flex op-nav">
			<div class="cancel">取消</div>
			<div class="submit">保存</div>
		</section>
		<section class="flex setting-item arrow_right">
			<div>头像</div>
			<img class="setting-item-right" alt="" src="http://www.ajie18.top/images/logo.jpg">
		</section>
		<section class="flex setting-item arrow_right">
			<div>昵称</div>
			<div class="setting-item-right" >无</div>
		</section>
		<section  class="flex setting-item arrow_right">
			<div>性别</div>
			<div class="setting-item-right" >保密</div>
		</section>
		<section class="flex setting-item arrow_right">
			<div>地址</div>
			<div class="setting-item-right" >不详</div>
		</section>
		<section class="flex setting-item arrow_right">
			<div>简介</div>
			<div class="setting-item-right" >无</div>
		</section>
		<section class="flex setting-item arrow_right">
			<div>修改密码</div>
		</section>
	</div>
	
	<script src="http://www.ajie18.top/js/jquery-1.9.1.js"></script>
	
	<script>
	var id = "${id}";
		(function(){
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
				$("#iArticle").css("transform","translateX(-"+dis+"%)")
			}
			
		})()
	</script>
	<script type="text/javascript" src="${ pageContext.request.contextPath }/${serverId }/common/common.js"></script>
	<script src="js/userinfo.js"></script>
</html>