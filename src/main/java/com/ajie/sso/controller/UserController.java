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
import com.ajie.sso.user.Role;
import com.ajie.sso.user.User;
import com.ajie.sso.user.UserService;
import com.ajie.sso.user.exception.UserException;
import com.alibaba.fastjson.JSONObject;

/**
 * @author niezhenjie
 */
@Controller
public class UserController {
	public static final Logger logger = LoggerFactory.getLogger(UserController.class);
	@Resource
	private UserService userService;

	private void setAjaxContentType(HttpServletResponse response) {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
	}

	/**
	 * 登录 aj请求
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	@RequestMapping("user/login.do")
	void login(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String name = request.getParameter("id");
		String password = request.getParameter("password");
		String callback = request.getParameter("callback");
		setAjaxContentType(response);
		PrintWriter out = response.getWriter();
		try {
			User user = userService.login(name, password);
			ResponseResult result = ResponseResult.newResult(ResponseResult.CODE_SUC, user);
			// 是否为jsonp调用
			if (!StringUtil.isEmpty(callback)) {
				out.write(callback + "(" + result + ")");
			} else {
				out.print(result);
			}
		} catch (UserException e) {
			ResponseResult result = ResponseResult.newResult(ResponseResult.CODE_ERR,
					e.getMessage());
			logger.error("登录失败 ", e);
			if (!StringUtil.isEmpty(callback)) {
				out.write(callback + "(" + result + ")");
			} else {
				out.print(result);
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
		return "login";
	}

	/**
	 * 检测用户是否有权限访问给定的url
	 * 
	 * @param request
	 * @param response
	 */
	@RequestMapping("user/checkRoleForUrl.do")
	void checkRoleForUrl(HttpServletRequest request, HttpServletResponse response) {
		String userId = request.getParameter("id");
		String url = request.getParameter("url");
		try {
			User user = userService.getUserById(userId);
			List<Role> roles = user.getRoles();
		} catch (UserException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	void getUserByToken(HttpServletRequest request, HttpServletResponse response) {

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

}
