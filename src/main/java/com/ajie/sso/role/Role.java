package com.ajie.sso.role;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 权限
 *
 * @author niezhenjie
 *
 */
public class Role {

	/** 权限名 */
	private String name;

	/** 权限id */
	private int id;

	/** 描述 */
	private String desc;

	/** 权限包含的url */
	private List<String> urls = Collections.emptyList();

	/** 返回空权限 */
	public static final Role _Nil = new Role() {
		public int getId() {
			return -1;
		};

		public String getName() {
			return "";
		};

		public java.util.List<String> getUrls() {
			return Collections.emptyList();
		};
	};

	public Role() {
		urls = new ArrayList<String>();
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getId() {
		return id;
	}

	public void setUrls(List<String> urls) {
		this.urls = urls;
	}

	public List<String> getUrls() {
		return urls;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}

	public String getDesc() {
		return desc;
	}

	public static Role valueOf(String name, int id) {
		Role role = new Role();
		role.setName(name);
		role.setId(id);
		return role;
	}
}
