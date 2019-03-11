package com.ajie.sso.controller;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;

import javax.annotation.Resource;
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
import com.ajie.chilli.utils.Toolkits;
import com.ajie.chilli.utils.common.StringUtils;
import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.controller.vo.UserVo;
import com.ajie.sso.user.UserService;
import com.ajie.sso.user.exception.UserException;

/**
 * sso系统控制器
 * 
 * @author niezhenjie
 */
@Controller
public class UserController {
	public static final Logger logger = LoggerFactory.getLogger(UserController.class);
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
	 */
	@RequestMapping("/login")
	public String gotologin(HttpServletRequest request, HttpServletResponse response) {
		String ref = request.getParameter("ref");
		request.setAttribute("ref", ref);
		return "login";
	}

	/**
	 * 用户信息页
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping("/userinfo")
	public String userinfo(HttpServletRequest request, HttpServletResponse response) {
		String id = request.getParameter("id");
		request.setAttribute("id", id);
		return "userinfo";
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
	public Object register(HttpServletRequest request, HttpServletResponse response) {
		String name = request.getParameter("key");
		if (StringUtils.isSpecialChar(name)) {
			// 用户名包含特殊字符，不允许
			return ResponseResult.newResult(ResponseResult.CODE_ERR, "用户名不能包含特殊字符:" + name);
		}
		String password = request.getParameter("password");
		String vertify = request.getParameter("verifycode"); // 验证码
		String vertifyKey = request.getParameter("verifyKey"); // 验证码key
		String callback = request.getParameter("callback");

		ResponseResult result = null;
		if (null == vertify)
			return ResponseResult.newResult(ResponseResult.CODE_ERR, "验证码为空");
		String cacheVertify = redisClient.get(VerifyImage.CACHE_PREFIX + vertifyKey);
		if (!StringUtils.eq(vertify, cacheVertify))
			return ResponseResult.newResult(ResponseResult.CODE_ERR, "验证码错误");
		try {
			TbUser user = userService.register(name, password, request, response);
			if (isRemote(request)) {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, user.getToken(), user);
			} else {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, new UserVo(user));
			}
		} catch (UserException e) {
			logger.error("用户注册失败", e);
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, e.getMessage());
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
	public Object verifyusername(HttpServletRequest request, HttpServletResponse response) {
		String name = request.getParameter("name");
		String callback = request.getParameter("callback");// jsonp回调
		ResponseResult result = null;
		TbUser user = userService.getUserByName(name);
		if (null != user) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, "用户名已存在");
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
	@RequestMapping("/dologin")
	public Object dologin(HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		String key = request.getParameter("key");
		String password = request.getParameter("password");
		String callback = request.getParameter("callback");
		ResponseResult result = null;
		try {
			TbUser user = userService.login(key, password, request, response);
			if (isRemote(request)) {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, user.getToken(), user);
			} else {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, new UserVo(user));
			}
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, e.getMessage());
		}
		if (null == callback) {
			return result;
		}
		// 不知原因，使用MappingJacksonValue转换的结果不是jsonp格式，可能是fastjson的问题，以后再深究
		/*MappingJacksonValue jsonp = new MappingJacksonValue(obj);
		jsonp.setJsonpFunction("callback");
		String fun = jsonp.getJsonpFunction();
		System.out.println(fun);*/
		String jsonp = ResponseResult.toJsonp(result, "callback");
		PrintWriter out = response.getWriter();
		out.write(jsonp);
		return null;
		// return result;
	}

	/**
	 * 测试使用request获取用户
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getuser")
	public void getuser(HttpServletRequest request, HttpServletResponse response) {
		TbUser user = userService.getUser(request);
		TbUser user2 = remoteUserService.getUser(request);
		System.out.println(user.getId());
		System.out.println(user2.getId());
	}

	@ResponseBody
	@RequestMapping("/getuserbyid")
	public ResponseResult getuserbyid(HttpServletRequest request, HttpServletResponse response) {
		int id = Toolkits.toInt(request.getParameter("id"), 0);
		ResponseResult result = null;
		TbUser user = userService.getUserById(id);
		if (null == user) {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, "用户不存在");
		} else if (isRemote(request)) {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, null,/*user.getToken()*/
					user);
		} else {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, new UserVo(user));
		}
		return result;
	}

	@ResponseBody
	@RequestMapping("/remotelogin")
	public ResponseResult remotelogin(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");
		String password = request.getParameter("password");
		ResponseResult result = null;
		try {
			TbUser user = remoteUserService.login(key, password, request, response);
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, null/*user.getToken()*/,
					user);
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, e.getMessage());
		}
		return result;
	}

	@ResponseBody
	@RequestMapping("/loginbytoken")
	public ResponseResult loginbytoken(HttpServletRequest request, HttpServletResponse response) {
		String token = request.getParameter(UserService.REQUEST_TOKEN_KEY);
		ResponseResult result = null;
		try {
			TbUser user = userService.getUserByToken(token);
			if (null != user)
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, user.getToken(), user);
			else
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, null);
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, e.getMessage());
		}
		return result;
	}

	/**
	 * 获取或更新验证码的key
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	@RequestMapping("/getverifykey.do")
	void getverifykey(HttpServletRequest request, HttpServletResponse response) throws IOException {
		setAjaxContentType(response);
		PrintWriter writer = response.getWriter();
		String key = request.getParameter("key");
		if (null != key) {
			// 删除就的key
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
	@RequestMapping("/getvertifycode.do")
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

	private void setAjaxContentType(HttpServletResponse response) {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
	}

	/*********** 以下为测试远程 ***************/

	@ResponseBody
	@RequestMapping("/remoteloginbytoken")
	public ResponseResult remoteloginbytoken(HttpServletRequest request,
			HttpServletResponse response) {
		String token = request.getParameter(UserService.REQUEST_TOKEN_KEY);
		ResponseResult result = null;
		try {
			TbUser user = remoteUserService.getUserByToken(token);
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, null/*user.getToken()*/,
					user);
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, e.getMessage());
		}
		return result;
	}

	private boolean isRemote(HttpServletRequest request) {
		String header = request.getHeader(UserService.REMOTE_SERVER_INVOKE_KEY);
		if (StringUtils.eq(header, UserService.REMOTE_SERVER_INVOKE_TOKEN))
			return true;
		return false;
	}

	/*
		@Resource
		private NavigatorMgr navigator;

		private void setAjaxContentType(HttpServletResponse response) {
			response.setContentType("application/json;charset=UTF-8");
			response.setCharacterEncoding("utf-8");
		}

		*//**
	 * 登录 aj或jsonp请求
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	/*
	@RequestMapping("user/login.do")
	void login(HttpServletRequest request, HttpServletResponse response) throws IOException {
	String name = request.getParameter("username");
	String password = request.getParameter("password");
	String callback = request.getParameter("callback");
	setAjaxContentType(response);
	PrintWriter out = response.getWriter();
	try {
		User user = userService.login(name, password);
		// 存放cookie
		CookieUtils.setCookie(request, response, User.USER_TOKEN, user.getToken(),
				UserService.COOKIE_EXPIRY);
		ResponseResult result = ResponseResult.newResult(ResponseResult.CODE_SUC, new UserVo(
				user));
		String ret = JsonUtils.toJSONString(result);
		// 是否为jsonp调用
		if (!StringUtils.isEmpty(callback)) {
			out.write(callback + "(" + result + ")");
		} else {
			out.print(ret);
		}
	} catch (UserException e) {
		ResponseResult result = ResponseResult.newResult(ResponseResult.CODE_ERR,
				e.getMessage());
		String ret = JsonUtils.toJSONString(result);
		logger.error("登录失败 ", e.getMessage());
		if (!StringUtils.isEmpty(callback)) {
			out.write(callback + "(" + ret + ")");
		} else {
			out.print(ret);
		}
	}
	}

	*//**
	 * 登录页面
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	/*
	@RequestMapping("user/loginpage.do")
	String loginpage(HttpServletRequest request, HttpServletResponse response) {
	// 从哪个链接进来登录页面
	String redirect = request.getParameter("redirect");
	request.setAttribute("redirect", redirect);
	return "account/loginpage";
	}

	@RequestMapping("user/getuser.do")
	void getuser(HttpServletRequest request, HttpServletResponse response) throws IOException {
	setAjaxContentType(response);
	PrintWriter out = response.getWriter();
	String sid = request.getParameter("id");
	// 内部id，一般是httpclient直接调用时使用
	boolean inner = Boolean.valueOf(request.getParameter("inner"));
	ResponseResult ret = null;
	User user = null;
	if (inner) {
		try {
			int id = Integer.valueOf(sid);
			user = userService.getUserById(id);
		} catch (Exception e) {
			ret = ResponseResult.newResult(ResponseResult.CODE_ERR, e);
		}
	} else {
		try {
			user = userService.getUserById(sid);
		} catch (UserException e) {
			ret = ResponseResult.newResult(ResponseResult.CODE_ERR, e);
		}
	}
	if (null == ret) {
		if (null != user) {
			ret = ResponseResult.newResult(ResponseResult.CODE_SUC, user.toPojo());
		} else {
			ret = ResponseResult.newResult(ResponseResult.CODE_NORET, user);
		}
	}
	out.print(JsonUtils.toJSONString(ret));
	}

	*//**
	 * 检测用户是否有权限访问给定的url
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	/*
	@RequestMapping("user/checkrole.do")
	void checkrole(HttpServletRequest request, HttpServletResponse response) throws IOException {
	setAjaxContentType(response);
	PrintWriter out = response.getWriter();
	String userId = request.getParameter("id");
	String url = request.getParameter("url");
	ResponseResult ret = null;
	try {
		User user = userService.getUserById(userId);
		boolean hasRole = user.checkRoleForUrl(url);
		ret = ResponseResult.newResult(ResponseResult.CODE_SUC, hasRole);
	} catch (UserException e) {
		ret = ResponseResult.newResult(ResponseResult.CODE_ERR, e);
	} finally {
		out.print(JsonUtils.toJSONString(ret));
		out.flush();
		out.close();
	}

	}

	@RequestMapping("user/getuserbytoken.do")
	void getuserbytoken(HttpServletRequest request, HttpServletResponse response)
		throws IOException {
	setAjaxContentType(response);
	PrintWriter out = response.getWriter();
	String token = request.getParameter("token");
	TbUser user = null;
	try {
		user = userService.getUserByToken(token);
	} catch (UserException e) {
		user = null;
	}
	ResponseResult ret = null;
	if (null == user) {
		ret = ResponseResult.newResult(ResponseResult.CODE_NORET, "");
	} else {
		ret = ResponseResult.newResult(ResponseResult.CODE_SUC, user);
	}
	String str = JsonUtils.toJSONString(ret);
	out.print(str);

	}

	*//**
	 * jsonp请求导航条
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	/*
	@RequestMapping("nav/navbar.do")
	void navbar(HttpServletRequest request, HttpServletResponse response) throws IOException {
	setAjaxContentType(response);
	PrintWriter out = response.getWriter();
	String token = request.getParameter(RemoteUserService.USER_TOKEN);
	String callback = request.getParameter("callback");
	User user = null;
	try {
		user = userService.getUserById(token);
	} catch (UserException e) {
		//Ignore
	}
	List<Menu> menus = navigator.getMenus(user);
	ResponseResult ret = ResponseResult.newResult(ResponseResult.CODE_SUC, menus);
	out.print(callback + "(" + JsonUtils.toJSONString(ret) + ")");
	out.flush();
	out.close();
	}

	*//**
	 * jsonp注册
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	/*
	@RequestMapping("/user/register")
	void register(HttpServletRequest request, HttpServletResponse response) throws IOException {
	setAjaxContentType(response);
	PrintWriter out = response.getWriter();
	String callback = request.getParameter("callback");
	String username = request.getParameter("username");
	String password = request.getParameter("password");
	TbUser user = new TbUser();
	user.setName(username);
	user.setPassword(password);
	ResponseResult ret = null;
	try {
		User u = userService.register(user);
		ret = ResponseResult.newResult(ResponseResult.CODE_SUC, u);
		out.print(callback + "(" + JsonUtils.toJSONString(ret) + ")");
	} catch (UserException e) {
		logger.error("用户注册失败", e);
		ret = ResponseResult.newResult(ResponseResult.CODE_ERR, e);
	}
	}

	*//**
	 * sso系统注册页面
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	/*
	@RequestMapping("/account/register")
	String accountregister(HttpServletRequest request, HttpServletResponse response)
		throws IOException {
	return "account/register";
	}*/
}
