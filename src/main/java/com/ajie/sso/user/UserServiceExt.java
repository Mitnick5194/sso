package com.ajie.sso.user;

import java.util.List;

import com.ajie.chilli.support.service.ServiceExt;

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
	
	String getVertifycode(User user);
}
