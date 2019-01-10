package com.ajie.sso.user;

import java.util.List;

import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.user.exception.UserException;

/**
 * 用户模块服务接口
 * 
 * @author niezhenjie
 */
public interface UserService {

	/**
	 * 用户信息保存到redis大键key
	 */
	public static final String USER_REDIS_COOKIE_KEY = "user";

	/**
	 * 用户token在redis中key的前缀，key由前缀+用户id组成
	 */
	public static final String USER_TOKEN_PRE = "user_token_id-";

	/**
	 * 登录cookie过期时间
	 */
	public static final int COOKIE_EXPIRY = 30 * 60;

	User register(TbUser user) throws UserException;

	/**
	 * 分页获取所有的用户，不包含配置用户
	 * 
	 * @return
	 */
	List<User> getUsers(int page);

	/**
	 * 获取所有的配置用户
	 * 
	 * @return
	 */
	List<User> getXmlUsers();

	/**
	 * 检验用户是否存在
	 * 
	 * @param name
	 *            用户名 || 邮箱||手机号
	 * @return
	 * @throws UserException
	 */
	boolean checkUserExit(String name) throws UserException;

	/**
	 * 登录
	 * 
	 * @param name
	 *            用户名 ||邮箱｜｜id
	 * @param password
	 *            密码
	 * @return 登录成功 返回登录的用户，失败 返回null
	 * @throws UserException
	 */
	User login(String name, String password) throws UserException;

	/**
	 * 通过外部id获取用户
	 * 
	 * @param outerId
	 * @return
	 * @throws UserException
	 */
	User getUserById(String outerId) throws UserException;

	/**
	 * 通过id获取用户
	 * 
	 * @param outerId
	 * @return
	 * @throws UserException
	 */
	User getUserById(int id) throws UserException;

	/**
	 * 通过token获取用户
	 * 
	 * @param token
	 * @return
	 * @throws UserException
	 */
	TbUser getUserByToken(String token) throws UserException;

	/**
	 * 通过用户名查找用户
	 * 
	 * @param name
	 * @return
	 * @throws UserException
	 */
	User getUserByName(String name) throws UserException;

}
