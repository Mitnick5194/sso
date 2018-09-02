package com.ajie.sso.user;

import java.util.ArrayList;
import java.util.List;

import com.ajie.sso.navigator.Menu;

/**
 * 
 * 角色，一个角色可以包含一些列菜单或单独设置某些uri 两者混合也可以
 * 
 * @author niezhenjie
 */
public interface Role {

	public static List<Role> roleTable = new ArrayList<Role>();

	/**
	 * 超级用户权限
	 */
	public static final int ROLE_SU = 0x1000;

	/**
	 * 管理员
	 */
	public static final int ROLE_ADMIN = 0x1001;

	/**
	 * 登陆者权限
	 */
	public static final int ROLE_LOGINER = 0x101;

	/**
	 * 登陆者权限
	 */
	public static final int ROLE_PASSAGER = 0x102;

	/**
	 * 保存到数据库时权限id的分隔符
	 */
	public static final String ID_SPERATOR = ",";

	/**
	 * 权限id
	 * 
	 * @return
	 */
	public int getId();

	/**
	 * 权限名
	 * 
	 * @return
	 */
	public String getName();

	public String getDesc();

	/**
	 * 获取权限对应的菜单
	 * 
	 * @return
	 */
	public List<Menu> getMenus();

	public void setMenus(List<Menu> menus);

}
