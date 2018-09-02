package com.ajie.sso.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;

import com.ajie.sso.user.UserService;

/**
 * @author niezhenjie
 */

@Controller
public class HomeController {
	private static final Logger logger = LoggerFactory.getLogger(HomeController.class);

	@Resource
	UserService userService;

	public HomeController() {
		logger.info("dsafsadfasdf");
	}

	@SuppressWarnings("unused")
	private void setAjaxContentType(HttpServletResponse response) {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
	}
	
	


}
