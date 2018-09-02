package com.ajie.sso.navigator.exception;

/**
 * 导航异常类
 * 
 * @author niezhenjie
 */
public class NavigatorException extends Exception {

	private static final long serialVersionUID = 1L;

	public NavigatorException(String message) {
		super(message);
	}

	public NavigatorException(String message, Throwable e) {
		super(message, e);
	}

}
