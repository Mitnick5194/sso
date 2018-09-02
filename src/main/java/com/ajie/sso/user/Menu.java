package com.ajie.sso.user;

import java.util.List;

/**
 * 导航的单个菜单
 * 
 * @author niezhenjie
 */
public interface Menu {

	/** 正常显示状态 */
	public static final int STATE_NORMAL = 0x01;

	/** 隐藏状态 */
	public static final int STATE_SHIELD = 0x02;

	/**
	 * 菜单的唯一id
	 * 
	 * @return
	 */
	int getId();

	/**
	 * 菜单的显示名称
	 * 
	 * @return
	 */
	String getName();

	/**
	 * 菜单的url
	 * 
	 * @return
	 */
	List<String> getUris();

	/**
	 * 菜单的index
	 * 
	 * @return
	 */
	String getIndex();

	/**
	 * 菜单的父菜单
	 * 
	 * @return
	 */
	Menu getParent();

	/**
	 * 菜单是否为最顶级的父菜单
	 * 
	 * @return
	 */
	boolean isParent();

	/**
	 * 菜单的所有子菜单
	 * 
	 * @return
	 */
	List<Menu> getChilds();

}
