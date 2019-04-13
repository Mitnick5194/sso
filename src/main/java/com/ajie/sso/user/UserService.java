package com.ajie.sso.user;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ajie.chilli.common.KVpair;
import com.ajie.chilli.common.enums.SexEnum;
import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.role.Role;
import com.ajie.sso.user.exception.UserException;

/**
 * 用户系统服务
 *
 * @author niezhenjie
 *
 */
public interface UserService {

	/** redis map key */
	public final static String REDIS_PREFIX = "USER";

	/** cookie key */
	public final static String COOKIE_KEY = "onn-sss";

	/** 请求中token参数的key */
	public final static String REQUEST_TOKEN_KEY = "onnssskey";

	/** cookie(redis登录记录过期时间，cookie不设过期时间，不然不好控制刷新cookie)过期时间,单位秒 */
	public final static int COOKIE_EXPIRE = 30 * 60;

	/** 远程系统间调用识别的键，区别于前端调用，系统间调用可以传输用户的所有信息，前端调用需要过滤敏感信息 */
	public final static String REMOTE_SERVER_INVOKE_KEY = "RSIK";
	/** 远程系统间调用的识别值，区别于前端调用，系统间调用可以传输用户的所有信息，前端调用需要过滤敏感信息 */
	public final static String REMOTE_SERVER_INVOKE_TOKEN = "RSIT";

	/** 登陆类型 -- 用户名登录 */
	public final static KVpair LOGIN_TYPE_USERNAME = KVpair.valueOf("用户名", 1);
	/** 登录类型 -- 电子邮箱登录 */
	public final static KVpair LOGIN_TYPE_MAIL = KVpair.valueOf("电子邮箱", 2);
	/** 登录类型 -- 手机号码登录 */
	public final static KVpair LOGIN_TYPE_PHONE = KVpair.valueOf("手机号", 3);

	/** 状态 -- 正常 */
	public final static KVpair STATE_NORMAL = KVpair.valueOf("正常", 1 << 0);
	/** 状态 -- 已停用 */
	public final static KVpair STATE_STOP = KVpair.valueOf("停用", 1 << 1);
	/** 状态 --禁止登录 */
	public final static KVpair STATE_BANLOGIN = KVpair.valueOf("禁止登录", 1 << 2);

	/** 登录状态 -- 在线 */
	public final static KVpair LOGIN_STATE_ONLINE = KVpair.valueOf("在线", 1 << 3);
	/** 登录状态 -- 离线 */
	public final static KVpair LOGIN_STATE_OUTLINE = KVpair.valueOf("离线", 1 << 4);

	/**
	 * 注册
	 * 
	 * @param tbUser
	 * @return
	 */
	TbUser register(String name, String passwd, HttpServletRequest request,
			HttpServletResponse response) throws UserException;

	/**
	 * 更新用户
	 * 
	 * @param tbUser
	 * @return
	 * @throws UserException
	 */
	TbUser update(TbUser tbUser) throws UserException;

	/**
	 * 登录
	 * 
	 * @param key
	 * @param password
	 * @return
	 */
	TbUser login(String key, String password, HttpServletRequest request,
			HttpServletResponse response) throws UserException;

	/**
	 * 登出
	 * 
	 * @param key
	 * @param password
	 * @return
	 */
	void logout(HttpServletRequest request, HttpServletResponse response);

	/**
	 * 使用token登录
	 * 
	 * @param token
	 * @return
	 * @throws UserException
	 */
	TbUser getUserByToken(String token) throws UserException;

	/**
	 * 根据请求获取用户
	 * 
	 * @param request
	 * @return
	 */
	TbUser getUser(HttpServletRequest request);

	/**
	 * 根据id获取用户
	 * 
	 * @param id
	 * @return
	 */
	TbUser getUserById(int id);

	/***
	 * 根据用户名获取用户
	 * 
	 * @param name
	 * @return
	 */
	TbUser getUserByName(String name);

	/**
	 * 根据电子邮箱获取用户
	 * 
	 * @param email
	 * @return
	 */
	TbUser getUserByEmail(String email);

	/**
	 * 根据手机号获取用户
	 * 
	 * @param phone
	 * @return
	 */
	TbUser getUserByPhone(String phone);

	/**
	 * 搜索用户
	 * 
	 * @param state
	 *            登录名的类型 {@link UserService.STATE_XXX or
	 *            UserService.LOGIN_STATE_XXX} 状态
	 * @param registerDate
	 *            注册 日期
	 * @param sex
	 *            性别
	 * @return
	 */
	List<TbUser> searchUsers(int state, Date registerDate, SexEnum sex);

	/**
	 * 获取权限表
	 * 
	 * @return
	 */
	public List<Role> getRoles();

	/**
	 * 检测user是否有权限访问url
	 * 
	 * @param url
	 * @return
	 */
	public boolean checkRole(TbUser user, String url);
}
