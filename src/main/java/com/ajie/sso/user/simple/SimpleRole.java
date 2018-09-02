package com.ajie.sso.user.simple;

import java.util.Collections;
import java.util.List;

import com.ajie.sso.navigator.Menu;
import com.ajie.sso.user.Role;

/**
 * 基础权限对象 通过配置文件加载一个角色包含一个或多个的菜单
 * 
 * 
 * @author niezhenjie
 */
public class SimpleRole implements Role {

	/** 唯一id */
	protected int id;

	/** 权限名 */
	protected String name;

	/**
	 * 描述
	 */
	protected String desc;

	/** 与权限对应的菜单 */
	protected List<Menu> menus;

	public SimpleRole() {
	}

	public SimpleRole(int id, String name) {
		this.id = id;
		this.name = name;
		menus = Collections.emptyList();
	}

	public SimpleRole(int id, String name, String desc) {
		this.id = id;
		this.name = name;
		this.desc = desc;
		menus = Collections.emptyList();
	}

	public SimpleRole(int id, String name, List<Menu> menus) {
		this(id, name);
		this.menus = menus;
	}

	public int getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	@Override
	public List<Menu> getMenus() {
		return menus;
	}

	@Override
	public String getDesc() {
		return desc;
	}

	@Override
	public void setMenus(List<Menu> menus) {
		this.menus = menus;
	}
}
