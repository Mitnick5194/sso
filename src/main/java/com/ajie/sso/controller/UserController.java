package com.ajie.sso.controller;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.imaging.ImageFormats;
import org.apache.commons.imaging.ImageWriteException;
import org.apache.commons.imaging.Imaging;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ajie.chilli.cache.redis.RedisClient;
import com.ajie.chilli.cache.redis.RedisException;
import com.ajie.chilli.common.ResponseResult;
import com.ajie.chilli.common.VerifyImage;
import com.ajie.chilli.common.enums.SexEnum;
import com.ajie.chilli.utils.Toolkits;
import com.ajie.chilli.utils.common.StringUtils;
import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.controller.vo.UserVo;
import com.ajie.sso.user.UserService;
import com.ajie.sso.user.exception.UserException;
import com.ajie.web.XssDefenseRequest;
import com.ajie.web.utils.CookieUtils;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

/**
 * sso系统控制器
 * 
 * @author niezhenjie
 */
@Controller
public class UserController {
	public static final Logger logger = LoggerFactory
			.getLogger(UserController.class);
	@Resource
	private UserService userService;

	@Resource
	private UserService remoteUserService;

	@Resource
	private RedisClient redisClient;

	@Resource
	private String stopCommand;
	@Resource
	private String admin;

	/** 博客系统链接 */
	@Resource(name = "blogUrl")
	private String blogUrl;

	/** 内网映射博客系统链接 */
	@Resource(name = "mappingBlog")
	private String mappingBlog;

	private static String prefix = "sso/";

	/**
	 * 关闭服务器
	 * 
	 * @param request
	 */
	@RequestMapping("stop")
	public void stop(HttpServletRequest request, HttpServletResponse response) {
		String passwd = request.getParameter("passwd");
		if (null != passwd && stopCommand.equals(passwd)) {
			logger.info("无用户模式下操作关闭服务器");
			System.exit(0);// 在sso系统没有启动的情况下关闭
		}
		TbUser user = userService.getUser(request);
		if (null == user) {
			return;
		}
		if (!admin.equals(user.getName())) {
			return;
		}
		logger.info(user.getName() + "正在操作关闭服务器");
		System.exit(0);
	}

	/**
	 * 登录页
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws IOException
	 */
	@RequestMapping("/login")
	public String gotologin(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		TbUser user = userService.getUser(request);
		if (null != user) {
			// 已经登录过了，跳转到详情页或指定也
			String ref = request.getParameter("ref");
			if (null == ref) {
				response.sendRedirect("userinfo?id=" + user.getId());
			} else {
				response.sendRedirect(ref);
			}
			return null;
		}
		return prefix + "login";
	}

	/**
	 * 用户信息页
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping("/userinfo")
	public String userinfo(HttpServletRequest request,
			HttpServletResponse response) {
		TbUser user = userService.getUser(request);
		String id = request.getParameter("id");
		if (null == user) {
			request.setAttribute("isSelf", false);
		} else {
			request.setAttribute("isSelf",
					StringUtils.eq(id, String.valueOf(user.getId())));
		}
		request.setAttribute("id", id);
		return prefix + "userinfo";
	}

	/**
	 * 临时用的
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping("/index")
	public String index(HttpServletRequest request, HttpServletResponse response) {
		return "index";
	}

	/**
	 * 注册
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/register")
	public Object register(HttpServletRequest request,
			HttpServletResponse response) {
		String name = request.getParameter("key");
		if (StringUtils.isSpecialChar(name)) {
			// 用户名包含特殊字符，不允许
			return ResponseResult.newResult(ResponseResult.CODE_ERR,
					"用户名不能包含特殊字符:" + name);
		}
		String password = request.getParameter("password");
		String vertify = request.getParameter("verifycode"); // 验证码
		String vertifyKey = request.getParameter("verifyKey"); // 验证码key
		String callback = request.getParameter("callback");

		ResponseResult result = null;
		if (null == vertify)
			return ResponseResult.newResult(ResponseResult.CODE_ERR, "验证码为空");
		String cacheVertify = redisClient.get(VerifyImage.CACHE_PREFIX
				+ vertifyKey);
		if (!StringUtils.eq(vertify, cacheVertify))
			return ResponseResult.newResult(ResponseResult.CODE_ERR, "验证码错误");
		try {
			TbUser user = userService.register(name, password, request,
					response);
			if (isRemote(request)) {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC,
						user.getToken(), user);
			} else {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC,
						new UserVo(user, user));
			}
		} catch (UserException e) {
			logger.error("用户注册失败", e);
			result = ResponseResult.newResult(ResponseResult.CODE_ERR,
					e.getMessage());
		} catch (RuntimeException e) {
			logger.error("用户注册失败", e);
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, "注册失败");
		}
		if (null == callback) {
			return result;
		}
		MappingJacksonValue jsonp = new MappingJacksonValue(result);
		jsonp.setJsonpFunction(callback);
		return jsonp;
	}

	/**
	 * 校验用户名是否已使用
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/verifyusername")
	public Object verifyusername(HttpServletRequest request,
			HttpServletResponse response) {
		String name = request.getParameter("name");
		String callback = request.getParameter("callback");// jsonp回调
		ResponseResult result = null;
		TbUser user = userService.getUserByName(name);
		if (null != user) {
			result = ResponseResult
					.newResult(ResponseResult.CODE_ERR, "用户名已存在");
		} else {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, null);
		}
		if (null == callback) {
			return result;
		}
		MappingJacksonValue jsonp = new MappingJacksonValue(result);
		jsonp.setJsonpFunction(callback);
		return jsonp;
	}

	@ResponseBody
	@RequestMapping(value = "/dologin")
	public Object dologin(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String key = request.getParameter("key");
		String password = request.getParameter("password");
		String callback = request.getParameter("callback");
		ResponseResult result = null;
		try {
			TbUser user = userService.login(key, password, request, response);
			if (isRemote(request)) {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC,
						user.getToken(), user);
			} else {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC,
						new UserVo(user, user));
			}
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR,
					e.getMessage());
		}
		if (null == callback) {
			response.addHeader("Access-Control-Allow-Origin",
					"http://localhost:8080");
			response.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
			response.addHeader("Access-Control-Allow-Headers",
					"X-Custom-Header");
			return result;
		}
		// 不知原因，使用MappingJacksonValue转换的结果不是jsonp格式，可能是fastjson的问题，以后再深究
		/*
		 * MappingJacksonValue jsonp = new MappingJacksonValue(obj);
		 * jsonp.setJsonpFunction("callback"); String fun =
		 * jsonp.getJsonpFunction(); System.out.println(fun);
		 */
		String jsonp = ResponseResult.toJsonp(result, "callback");
		PrintWriter out = response.getWriter();
		out.write(jsonp);
		return null;
		// return result;
	}

	@ResponseBody
	@RequestMapping("/getuserbyid")
	public ResponseResult getuserbyid(HttpServletRequest request,
			HttpServletResponse response) {
		TbUser operator = userService.getUser(request);
		int id = Toolkits.toInt(request.getParameter("id"), 0);
		ResponseResult result = null;
		TbUser user = userService.getUserById(id);
		if (null == user) {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, "用户不存在");
		} else if (isRemote(request)) {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, null,/*
																			 * user.
																			 * getToken
																			 * (
																			 * )
																			 */
					user);
		} else {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC,
					new UserVo(user, operator));
		}
		return result;
	}

	@ResponseBody
	@RequestMapping("/getuserbytoken")
	public ResponseResult getuserbytoken(HttpServletRequest request,
			HttpServletResponse response) {
		String token = request.getParameter(UserService.REQUEST_TOKEN_KEY);
		ResponseResult result = null;
		try {
			TbUser user = userService.getUserByToken(token);
			if (null != user)
				result = ResponseResult.newResult(ResponseResult.CODE_SUC,
						user.getToken(), user);
			else
				result = ResponseResult
						.newResult(ResponseResult.CODE_SUC, null);
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR,
					e.getMessage());
		}
		return result;
	}

	/**
	 * 登出
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/logout")
	public ResponseResult logout(HttpServletRequest request,
			HttpServletResponse response) {
		String token = null;
		String header = request
				.getHeader(UserService.REMOTE_SERVER_INVOKE_HEADER_KEY);
		if (null == header) {
			// 本地退出
			Cookie[] cookies = request.getCookies();
			if (null == cookies) {
				ResponseResult.newResult(ResponseResult.CODE_SUC, "退出成功");
			}

			for (Cookie cookie : cookies) {
				String name = cookie.getName();
				if (UserService.COOKIE_KEY.equals(name)) {
					token = cookie.getValue();
				}
			}
		} else {
			token = request.getParameter("token");
		}
		userService.logoutByToken(token);
		CookieUtils.setCookie(request, response, UserService.COOKIE_KEY, token,
				0);
		return ResponseResult.newResult(ResponseResult.CODE_SUC, "退出成功");
	}

	/**
	 * 修改用户资料
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/updateuser")
	public ResponseResult updateuser(HttpServletRequest request,
			HttpServletResponse response) {
		TbUser user = userService.getUser(request);
		if (null == user) {
			return ResponseResult.newResult(ResponseResult.CODE_ERR,
					"会话过期，请重新登录");
		}
		request = XssDefenseRequest.toXssDefenseRequest(request);
		String type = request.getParameter("type");
		String value = request.getParameter("value");
		TbUser u = new TbUser();
		u.setId(user.getId());
		if ("nickname".equals(type)) {
			u.setNickname(value);
		} else if ("synopsis".equals(type)) {
			u.setSynopsis(value);
		} else if ("sex".equals(type)) {
			int sexId = Toolkits.toInt(value, 0);
			SexEnum sex = SexEnum.find(sexId);
			value = String.valueOf(sex.getId());
			u.setSex(value);
		} else if ("phone".equals(type)) {
			u.setPhone(value);
		} else if ("email".equals(type)) {
			u.setEmail(value);
		} else if ("header".equals(type)) {
			u.setHeader(value);
		} else if ("password".equals(type)) {
			String oldpw = value;
			String newpw = request.getParameter("password");
			try {
				userService.modifyPassword(user, oldpw, newpw, user, request,
						response);
				return ResponseResult
						.newResult(ResponseResult.CODE_SUC, "退出成功");
			} catch (UserException e) {
				return ResponseResult.newResult(ResponseResult.CODE_ERR,
						e.getMessage());
			}
		}
		try {
			userService.updatePart(u);
		} catch (UserException e) {
			logger.error("修改用户资料错误", e);
			return ResponseResult.newResult(ResponseResult.CODE_ERR,
					e.getMessage());
		}
		return ResponseResult.newResult(ResponseResult.CODE_SUC, "退出成功");
	}

	/**
	 * 获取性别枚举
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getsexenum")
	public ResponseResult getsexenum(HttpServletRequest request,
			HttpServletResponse response) {
		JSONArray arr = new JSONArray();
		JSONObject obj = new JSONObject();
		obj.put("id", SexEnum.male.getId());
		obj.put("value", SexEnum.male.getName());
		arr.add(obj);
		obj = new JSONObject();
		obj.put("id", SexEnum.female.getId());
		obj.put("value", SexEnum.female.getName());
		arr.add(obj);
		obj = new JSONObject();
		obj.put("id", SexEnum.unknown.getId());
		obj.put("value", "保密");
		arr.add(obj);
		return ResponseResult.newResult(ResponseResult.CODE_SUC, arr);
	}

	/**
	 * 获取或更新验证码的key
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	@RequestMapping("/getverifykey")
	void getverifykey(HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		setAjaxContentType(response);
		PrintWriter writer = response.getWriter();
		String key = request.getParameter("key");
		if (null != key) {
			// 删除旧的key
			try {
				redisClient.del(VerifyImage.CACHE_PREFIX + key);
			} catch (RedisException e) {
				logger.warn("无法删除验证码缓存", e);
			}
		}
		key = Toolkits.uniqueKeyLowerCase(16);
		String value = Toolkits.randomNum(4);
		try {
			redisClient.set(VerifyImage.CACHE_PREFIX + key, value);
			redisClient.expire(VerifyImage.CACHE_PREFIX + key, 180);// 三分钟
		} catch (RedisException e) {
			logger.error("无法缓存验证码", e);
			return;
		}
		writer.print("{\"key\":\"" + key + "\"}");
	}

	/**
	 * 验证码写到页面
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	@RequestMapping("/getvertifycode")
	void getvertifycode(HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		OutputStream out = response.getOutputStream();
		String key = request.getParameter("key");
		String val = redisClient.get(VerifyImage.CACHE_PREFIX + key);
		if (null == val) {
			return;
		}
		BufferedImage buffer = VerifyImage.getImage(val, 80, 45);
		try {
			Imaging.writeImage(buffer, out, ImageFormats.PNG, null);
		} catch (ImageWriteException e) {
			logger.error("生成无法写出页面", e);
		}
	}

	/**
	 * 获取博客系统的链接
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	@ResponseBody
	@RequestMapping("getblogurl")
	ResponseResult getblogurl(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		setAjaxContentType(response);
		String host = request.getHeader("host");
		String url = blogUrl;
		if (host.indexOf("j-") > -1) {
			// 走了代理映射
			url = mappingBlog;
		}
		return ResponseResult.success(url);
	}

	private void setAjaxContentType(HttpServletResponse response) {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
	}

	/*********** 以下为测试远程 ***************/

	@ResponseBody
	@RequestMapping("/remotelogin")
	public ResponseResult remotelogin(HttpServletRequest request,
			HttpServletResponse response) {
		String key = request.getParameter("key");
		String password = request.getParameter("password");
		ResponseResult result = null;
		try {
			TbUser user = remoteUserService.login(key, password, request,
					response);
			result = ResponseResult.newResult(ResponseResult.CODE_SUC,
					null/* user.getToken() */, user);
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR,
					e.getMessage());
		}
		return result;
	}

	@ResponseBody
	@RequestMapping("/remoteloginbytoken")
	public ResponseResult remoteloginbytoken(HttpServletRequest request,
			HttpServletResponse response) {
		String token = request.getParameter(UserService.REQUEST_TOKEN_KEY);
		ResponseResult result = null;
		try {
			TbUser user = remoteUserService.getUserByToken(token);
			result = ResponseResult.newResult(ResponseResult.CODE_SUC,
					null/* user.getToken() */, user);
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR,
					e.getMessage());
		}
		return result;
	}

	private boolean isRemote(HttpServletRequest request) {
		String header = request
				.getHeader(UserService.REMOTE_SERVER_INVOKE_HEADER_KEY);
		if (StringUtils.eq(header,
				UserService.REMOTE_SERVER_INVOKE_HEADER_VALUE))
			return true;
		return false;
	}
}
