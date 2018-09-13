package com.ajie.sso.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ajie.chilli.common.ResponseResult;
import com.ajie.chilli.utils.common.JsonUtil;
import com.ajie.chilli.utils.common.StringUtil;
import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.navigator.Menu;
import com.ajie.sso.navigator.NavigatorMgr;
import com.ajie.sso.user.User;
import com.ajie.sso.user.UserService;
import com.ajie.sso.user.exception.UserException;
import com.ajie.sso.vo.UserVo;
import com.ajie.web.RemoteUserService;
import com.ajie.web.utils.CookieUtils;
import com.alibaba.druid.support.json.JSONUtils;
import com.alibaba.fastjson.JSONObject;

/**
 * @author niezhenjie
 */
@Controller
public class UserController {
	public static final Logger logger = LoggerFactory.getLogger(UserController.class);
	@Resource
	private UserService userService;

	@Resource
	private NavigatorMgr navigator;

	private void setAjaxContentType(HttpServletResponse response) {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
	}

	/**
	 * 登录 aj或jsonp请求
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
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
			String ret = JsonUtil.toJSONString(result);
			// 是否为jsonp调用
			if (!StringUtil.isEmpty(callback)) {
				out.write(callback + "(" + ret + ")");
			} else {
				out.print(ret);
			}
		} catch (UserException e) {
			ResponseResult result = ResponseResult.newResult(ResponseResult.CODE_ERR,
					e.getMessage());
			String ret = JsonUtil.toJSONString(result);
			logger.error("登录失败 ", e.getMessage());
			if (!StringUtil.isEmpty(callback)) {
				out.write(callback + "(" + ret + ")");
			} else {
				out.print(ret);
			}
		}
	}

	/**
	 * 登录页面
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping("user/gotoLogin.do")
	String gotoLogin(HttpServletRequest request, HttpServletResponse response) {
		String op = request.getParameter("op");
		if ("login".equals(op)) {
			String name = request.getParameter("username");
			String password = request.getParameter("password");
			try {
				User user = userService.login(name, password);
				// 存放cookie
				CookieUtils.setCookie(request, response, User.USER_TOKEN, user.getToken(),
						UserService.COOKIE_EXPIRY);
				ResponseResult result = ResponseResult.newResult(ResponseResult.CODE_SUC,
						new UserVo(user));
				String ret = JsonUtil.toJSONString(result);
				// 是否为jsonp调用
			} catch (UserException e) {
				ResponseResult result = ResponseResult.newResult(ResponseResult.CODE_ERR,
						e.getMessage());
				String ret = JsonUtil.toJSONString(result);
				logger.error("登录失败 ", e.getMessage());
			}
			try {
				response.sendRedirect("http://www.localhost.com:8082");
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return "account/login";
	}

	/**
	 * 检测用户是否有权限访问给定的url
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	@RequestMapping("user/checkRoleForUrl.do")
	void checkRoleForUrl(HttpServletRequest request, HttpServletResponse response)
			throws IOException {
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
			out.print(JsonUtil.toJSONString(ret));
			out.flush();
			out.close();
		}

	}

	void getUserByToken(HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		setAjaxContentType(response);
		PrintWriter out = response.getWriter();
		String token = request.getParameter("token");
		User user = null;
		try {
			user = userService.getUserByToken(token);
		} catch (UserException e) {
			user = null;
		}
		ResponseResult ret = null;
		if (null == user) {
			ret = ResponseResult.newResult(ResponseResult.CODE_NORET, "");
		} else {
			ret = ResponseResult.newResult(ResponseResult.CODE_SUC, new UserVo(user));
		}
		out.print(JSONUtils.toJSONString(ret));

	}

	@RequestMapping
	void getUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
		setAjaxContentType(response);
		PrintWriter out = response.getWriter();
		// XmlUser5016237640858808320000378nufpoqdbsqvqslv11535795540430979
		String id = request.getParameter("id");
		User user = null;
		try {
			List<User> users = userService.getXmlUsers();
			if (users.size() > 0) {
				for (User u : users) {
					logger.info(u.getOuterId());
				}
			}
			user = userService.getUserById(id);
		} catch (UserException e) {
			logger.error("获取用户失败:", e);
		}
		JSONObject json = new JSONObject();
		if (null != user) {
			json.put("name", user.getName());
			json.put("email", user.getEmail());
		}
		out.print("<h1>" + json.toString() + "</h1>");
	}

	/**
	 * jsonp请求导航条
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	@RequestMapping("nav/navbar.do")
	void nav(HttpServletRequest request, HttpServletResponse response) throws IOException {
		setAjaxContentType(response);
		PrintWriter out = response.getWriter();
		String token = request.getParameter(RemoteUserService.USER_TOKEN);
		String callback = request.getParameter("callback");
		User user = null;
		try {
			user = userService.getUserById(token);
		} catch (UserException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		List<Menu> menus = navigator.getMenus(user);
		ResponseResult ret = ResponseResult.newResult(ResponseResult.CODE_SUC, menus);
		out.print(callback + "(" + JsonUtil.toJSONString(ret) + ")");
		out.flush();
		out.close();
	}

	/**
	 * jsonp注册
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
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
			out.print(callback + "(" + JsonUtil.toJSONString(ret) + ")");
		} catch (UserException e) {
			logger.error("用户注册失败", e);
			ret = ResponseResult.newResult(ResponseResult.CODE_ERR, e);
		}
	}

	/**
	 * sso系统注册页面
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	@RequestMapping("/account/register")
	String accountRegister(HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		return "account/register";
	}
}
