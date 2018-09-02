package com.ajie.sso.controller;

import java.io.IOException;
import java.io.PrintWriter;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

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
	UserService userService;

	private void setAjaxContentType(HttpServletResponse response) {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
	}

	@RequestMapping
	void getUser( HttpServletRequest request, HttpServletResponse response) throws IOException {
		setAjaxContentType(response);
		PrintWriter out = response.getWriter();
		//XmlUser5016237640858808320000378nufpoqdbsqvqslv11535795540430979
		String id = request.getParameter("id");
		User user = null;
		try {
			user = userService.getUserById(id);
		} catch (UserException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		JSONObject json= new JSONObject();
		if(null != user){
			json.put("name" , user.getName());
			json.put("email", user.getEmail());
		}
		out.print("<h1>"+json.toString()+"</h1>");
	}
	/*	@RequestMapping
	void nav(HttpServletRequest request, HttpServletResponse response) throws IOException {
		setAjaxContentType(response);
		PrintWriter out = response.getWriter();
		User user = userService.getXmlUsers(request);
		List<Menu> menus = navigatorService.getMenus(user);
		String callback = request.getParameter("callback");
		JSONArray arr = new JSONArray();
		for (Menu menu : menus) {
			JSONObject obj = new JSONObject();
			obj.put("id", menu.getId());
			obj.put("name", menu.getName());
			obj.put("url", menu.getUris().get(0));
			arr.put(obj);
		}
		// out.print(new JSONObject().put("nav", arr));
		out.write(callback + "(" + arr + ")");
		out.flush();
		out.close();
	}*/
}
