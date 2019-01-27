package com.ajie.sso.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ajie.chilli.common.ResponseResult;
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

	@RequestMapping("/gotologin")
	public String gotologin(HttpServletRequest request, HttpServletResponse response) {
		String ref = request.getParameter("ref");
		request.setAttribute("ref", ref);
		return "login";
	}

	@ResponseBody
	@RequestMapping("/register")
	public ResponseResult register(HttpServletRequest request, HttpServletResponse response) {
		String name = request.getParameter("name");
		String password = request.getParameter("password");
		// 请求类型，远程还是本系统
		String reqType = request.getParameter("reqType");
		ResponseResult result = null;
		try {
			TbUser user = userService.register(name, password, request, response);
			if ("remote".equals(reqType)) {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, user.getToken(), user);
			} else {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, new UserVo(user));
			}

		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, e.getMessage());
		}
		return result;
	}

	@ResponseBody
	@RequestMapping("/login")
	public ResponseResult login(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");
		String password = request.getParameter("password");
		ResponseResult result = null;
		// 请求类型，远程还是本系统
		String reqType = request.getParameter("reqType");
		try {
			TbUser user = userService.login(key, password, request, response);
			if ("remote".equals(reqType)) {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, user.getToken(), user);
			} else {
				result = ResponseResult.newResult(ResponseResult.CODE_SUC, new UserVo(user));
			}
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, e.getMessage());
		}
		return result;
	}

	/**
	 * 测试使用request获取用户
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping
	public void getuser(HttpServletRequest request, HttpServletResponse response) {
		TbUser user = userService.getUser(request);
		TbUser user2 = remoteUserService.getUser(request);
		System.out.println(user.getId());
		System.out.println(user2.getId());
	}

	@ResponseBody
	@RequestMapping("/user/{id}")
	public ResponseResult getuserbyid(@PathVariable("id") Integer id, HttpServletRequest request,
			HttpServletResponse response) {
		ResponseResult result = null;
		// 请求类型，远程还是本系统
		String reqType = request.getParameter("reqType");
		TbUser user = userService.getUserById(id);
		if (null == user) {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, "用户不存在");
		} else if ("remote".equals(reqType)) {
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, user.getToken(), user);
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
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, user.getToken(), user);
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

	/*********** 以下为测试远程 ***************/

	@ResponseBody
	@RequestMapping("/remoteloginbytoken")
	public ResponseResult remoteloginbytoken(HttpServletRequest request,
			HttpServletResponse response) {
		String token = request.getParameter(UserService.REQUEST_TOKEN_KEY);
		ResponseResult result = null;
		try {
			TbUser user = remoteUserService.getUserByToken(token);
			result = ResponseResult.newResult(ResponseResult.CODE_SUC, user.getToken(), user);
		} catch (UserException e) {
			result = ResponseResult.newResult(ResponseResult.CODE_ERR, e.getMessage());
		}
		return result;
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
