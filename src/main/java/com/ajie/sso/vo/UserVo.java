package com.ajie.sso.vo;

import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.user.User;

/**
 * 用户对象vo
 * 
 * @author niezhenjie
 */
public class UserVo {

	protected User user;

	protected TbUser tbUser;

	public UserVo(User user) {
		this.user = user;
	}

	public UserVo(TbUser tbUser) {
		this.tbUser = tbUser;
	}

	/**
	 * 外部id，如果使用TbUser构造，则不支持
	 * 
	 * @return
	 */
	public String getId() {
		if (null != user) {
			return user.getOuterId();
		}
		return null;
	}

	public String getName() {
		return null == user ? tbUser.getName() : user.getName();
	}

	public String getPhone() {
		return null == user ? tbUser.getPhone() : user.getPhone();
	}

	public String getNickName() {
		return null == user ? tbUser.getNickname() : user.getNickName();
	}

	public String getEmail() {
		return null == user ? tbUser.getEmail() : user.getEmail();
	}

	public String getSynopsis() {
		return null == user ? tbUser.getSynopsis() : user.getSynopsis();
	}

	public String getSex() {
		return null == user ? tbUser.getSex() : null == user.getSex() ? "未知" : user.getSex()
				.getName();
	}

	public String getHeaderImg() {
		return null == user ? tbUser.getHeader() : user.getHeader();
	}
}
