package com.ajie.sso.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ajie.chilli.utils.common.JsonUtil;
import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.navigator.NavigatorMgr;
import com.ajie.sso.user.User;
import com.ajie.sso.user.UserService;
import com.ajie.sso.user.exception.UserException;

/**
 * @author niezhenjie
 */

@Controller
public class TestController {


	@Resource
	private UserService userService;
	
	@Resource
	private NavigatorMgr navigator;

	@RequestMapping(value = "/user/{id}/user.do", produces = "application/json;charset=UTF-8")
	@ResponseBody
	public TbUser getUser(@PathVariable String id, ModelMap model) {
		User user;
		try {
			user = userService.getUserById(id);
			TbUser tbUser = new TbUser();
			tbUser.setName(user.getName());
			tbUser.setEmail(user.getEmail());
			return tbUser;
		} catch (UserException e) {
			e.printStackTrace();
		}
		return null;
	}

	@RequestMapping(value = "/user/user.do", produces = "application/json;charset=UTF-8")
	public void user(HttpServletRequest request, HttpServletResponse response) throws IOException {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
		PrintWriter out = response.getWriter();
		User user;
		try {
			user = userService
					.getUserById("OuterId7225261377271919911196324acevfjmrgmtcorx31536220799784627");
			TbUser tbUser = new TbUser();
			tbUser.setName(user.getName());
			tbUser.setEmail(user.getEmail());
			out.write(JsonUtil.toJSONString(tbUser));
		} catch (UserException e) {
			e.printStackTrace();
		}
	}

	@RequestMapping(value = "/user/testJson.do", produces = "application/json;charset=UTF-8")
	public void testJson(HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
		PrintWriter out = response.getWriter();
		navigator.test();
		Monkey monkey = new Monkey("King", 12);
		Monkey father = new Monkey("SuperKing", 20);
		monkey.setFather(father);
		Monkey f1 = new Monkey("f1", 10);
		Monkey f2 = new Monkey("f3", 13);
		Monkey f3 = new Monkey("f3", 9);
		List<Monkey> friends = new ArrayList<Monkey>();
		friends.add(f1);
		friends.add(f2);
		friends.add(f3);
		monkey.setFriends(friends);
		System.out.println(JsonUtil.toJSONString(monkey));
		out.print(JsonUtil.toJSONString(monkey));

	}

	@RequestMapping("/user/users")
	public String getUSers(ModelMap model) {
		List<User> users = userService.getXmlUsers();
		model.addAttribute("users", users);
		return "user";
	}

}

class Monkey {
	public Monkey() {

	}

	public Monkey(String name, int age) {
		this.name = name;
		this.age = age;
	}

	String name;
	int age;
	Monkey father;
	List<Monkey> friends;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getAge() {
		return age;
	}

	public void setAge(int age) {
		this.age = age;
	}

	public Monkey getFather() {
		return father;
	}

	public void setFather(Monkey father) {
		this.father = father;
	}

	public List<Monkey> getFriends() {
		return friends;
	}

	public void setFriends(List<Monkey> friends) {
		this.friends = friends;
	}
}