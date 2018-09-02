package com.ajie.sso.navigator.simple;

import java.util.List;

import com.ajie.sso.navigator.Menu;

/**
 * @author niezhenjie
 */
public class BaseMenu implements Menu {

	/** 唯一id */
	protected int id;

	/** 显示名字 */
	protected String name;

	/** 菜单所有的uri */
	protected List<String> uris;

	/** 菜单index */
	protected String index;

	/** 菜单所属的父菜单 */
	protected Menu parent;

	/** 菜单包含的子菜单 */
	protected List<Menu> childs;

	int state;

	public BaseMenu(int id, String name, String index, List<String> uris) {
		this.id = id;
		this.name = name;
		this.index = index;
		this.uris = uris;
	}

	@Override
	public int getId() {

		return id;
	}

	public String getName() {
		return name;
	}

	public List<String> getUris() {
		return uris;
	}

	public Menu getParent() {
		return parent;
	}

	public List<Menu> getChilds() {
		return childs;
	}

	public boolean isParent() {
		return null == parent;
	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("{id: ").append(id);
		sb.append(" , name: ").append(name);
		sb.append(", index: ").append(index);
		sb.append(" , parent: ").append(parent.toString());
		sb.append(" , childs: ").append(childs.toString());
		sb.append(" , state: ").append(state);
		sb.append("}");
		return sb.toString();
	}

	@Override
	public String getIndex() {
		return this.index;
	}

}
