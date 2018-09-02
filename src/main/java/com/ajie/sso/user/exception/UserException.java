package com.ajie.sso.user.exception;

/**
 * @author niezhenjie
 */
public class UserException extends Exception {

	private static final long serialVersionUID = 1L;

	public UserException(String message) {
		super(message);
	}

	public UserException(String message, Throwable e) {
		super(message, e);
	}

}
