package com.ajie.sso.user.enums;

/**
 * @author niezhenjie
 */
public enum SexEnum {

	male(1, "男"), female(2, "女"), unknown(0, "未知");

	protected int id;
	protected String name;

	SexEnum(int id, String name) {
		this.id = id;
		this.name = name;
	}

	public int getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public static SexEnum find(int id) {
		if (id == 1) {
			return male;
		}
		if (id == 2) {
			return female;
		} else {
			return unknown;
		}
	}

	public static SexEnum findByIdCart(String idcard) {
		if (null == idcard) {
			return unknown;
		}
		char c;
		if (idcard.length() == 18) {
			c = idcard.charAt(16);
		} else if (idcard.length() == 15) {
			c = idcard.charAt(14);
		} else {
			return unknown;
		}
		try {
			int i = Integer.valueOf(c);
			if (i % 2 == 0) {
				return female;
			}
			return male;
		} catch (Exception e) {
			return unknown;
		}
	}
}
