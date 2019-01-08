package com.ajie.sso.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ajie.chilli.utils.common.JsonUtils;
import com.ajie.dao.pojo.TbUser;
import com.ajie.dao.redis.JedisException;
import com.ajie.dao.redis.RedisClient;
import com.ajie.sso.navigator.NavigatorMgr;
import com.ajie.sso.user.User;
import com.ajie.sso.user.UserService;
import com.ajie.sso.user.exception.UserException;
import com.ajie.sso.user.simple.XmlUser;

/**
 * 测试用的 不用管
 * 
 * @author niezhenjie
 */
@SuppressWarnings("unused")
@Controller
public class TestController {

	@Resource
	private UserService userService;

	@Resource
	private NavigatorMgr navigator;

	@Resource
	private RedisClient redisClient;

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
			out.write(JsonUtils.toJSONString(tbUser));
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
		monkey.friends = friends;
		String ret = JsonUtils.toJSONString(monkey);
		Monkey mk = JsonUtils.toBean(ret, Monkey.class);
		out.print(ret);

	}

	@RequestMapping("/user/users")
	public String getUSers(ModelMap model) {
		XmlUser user = null;
		try {
			user = (XmlUser) userService
					.getUserById("OuterId7225261377271919911196324acevfjmrgmtcorx31536220799784627");
			String ret = JsonUtils.toJSONString(user);
			XmlUser u = JsonUtils.toBean(ret, XmlUser.class);
			System.out.println(ret);
		} catch (UserException e1) {
			e1.printStackTrace();
		}
		redisClient.set("testK", "testV");
		try {
			redisClient.set("testK2", user);
			redisClient.hset("h1", "f1", "hash1");
			redisClient.hset("h1", "f2", user);

			// 取
			String s = redisClient.get("testK");
			XmlUser u = redisClient.getAsBean("testK2", XmlUser.class);
			String s2 = redisClient.hget("h1", "f1");
			XmlUser u2 = redisClient.hgetAsBean("h1", "f2", XmlUser.class);

			System.out.println("s = " + s);
			System.out.println("u1=" + u.toString());
			System.out.println("s2 = " + s2);
			System.out.println("u2 = " + u2.toString());

		} catch (JedisException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		List<User> users = userService.getXmlUsers();
		model.addAttribute("users", users);
		return "user";
	}

	public static void main(String[] args) {
		TbUser user = new TbUser();
		/*user.setName("ajie");
		user.setPassword("123");
		user.setNickname("asdfasdf");
		user.setCreatetime(new Date());
		user.setLastactive(new Date());
		String str = JsonUtils.toJSONString(user);
		System.out.println(str);
		TbUser tbu = JsonUtils.toBean(str, TbUser.class);
		System.out.println(tbu.getName());
		System.out.println(tbu.getCreatetime());*/
		String ret = JsonUtils.toJSONString(user);
		System.out.println(ret);
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