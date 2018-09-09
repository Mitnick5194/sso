package com.ajie.sso.user;

import java.util.List;

import com.ajie.sso.user.exception.UserException;

/**
 * 用户模块服务接口
 * 
 * @author niezhenjie
 */
public interface UserService {

	/**
	 * 获取所有的用户，不包含配置用户
	 * 
	 * @return
	 */
	List<User> getUsers();

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
	 */
	boolean checkUserExit(String name);

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
	 * 通过token获取用户
	 * 
	 * @param token
	 * @return
	 */
	User getUserByToken(String token);

	/**
	 * 通过用户名查找用户
	 * 
	 * @param name
	 * @return
	 */
	User getUserByName(String name);

}
