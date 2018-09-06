package com.ajie.sso.user;

import java.util.List;

import com.ajie.chilli.support.service.ServiceExt;
import com.ajie.sso.navigator.Menu;

/**
 * 辅助User模块的服务类，接口方法不对外开放
 * 
 * @author niezhenjie
 */
public interface UserServiceExt extends ServiceExt {
	/**
	 * 获取所有的权限
	 * 
	 * @return
	 */
	List<Role> getRoles();

	/**
	 * 获取用户的验证码（一般是从redis中获取邮件或手机验证码）
	 * 
	 * @param user
	 * @return
	 */
	String getVertifycode(User user);

	/**
	 * 根据给定的uri或url，获取对应的菜单
	 * 
	 * @param uri
	 * @return
	 */
	Menu getMenuByUri(String uri);
}
