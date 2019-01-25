package com.ajie.sso.user.exception;

/**
 * 用户模块异常
 *
 * @author niezhenjie
 *
 */
public class UserException extends Exception {

	private static final long serialVersionUID = 1L;

	public UserException(Throwable e) {
		super(e);
	}

	public UserException(String msg) {
		super(msg);
	}

	public UserException(String msg, Throwable e) {
		super(msg, e);
	}

}
