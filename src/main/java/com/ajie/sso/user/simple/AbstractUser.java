package com.ajie.sso.user.simple;

import java.util.Date;
import java.util.List;

import com.ajie.pojo.TbUser;
import com.ajie.sso.user.Role;
import com.ajie.sso.user.User;
import com.ajie.sso.user.enums.SexEnum;
import com.ajie.sso.user.exception.UserException;
import com.ajie.support.AbstractOuterIdSupport;

/**
 * 用户抽象实现
 * 
 * @author ajie
 *
 */
public abstract class AbstractUser extends AbstractOuterIdSupport implements User {

	/**
	 * 唯一id
	 */
	protected int id;

	/**
	 * 外部ID
	 */
	protected String outerId;

	/**
	 * 用户名
	 */
	protected String name;

	/**
	 * 邮箱
	 */
	protected String email;

	/**
	 * 创建时间
	 */
	protected Date createTime;

	/**
	 * 最后活跃时间
	 */
	protected Date lastActive;

	/**
	 * 登录token
	 */
	protected String loginToken;

	/**
	 * 用户拥有的权限
	 */
	protected List<Role> roles;

	@Override
	public int getId() {

		return id;
	}

	protected String getRealId() {
		return String.valueOf(id);
	}

	@Override
	protected String getEntityOuterId() {
		return outerId;
	}

	@Override
	protected void setOuterId(String outerId) {
		this.outerId = outerId;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public String getNickName() {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getSynopsis() {
		throw new UnsupportedOperationException();
	}

	@Override
	public SexEnum getSex() {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getPhone() {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getEmail() {
		return email;
	}

	@Override
	public void setEmail(String email) {
		this.email = email;
	}

	@Override
	public Date getCreateTime() {
		return createTime;
	}

	@Override
	public Date getLastActive() {
		return lastActive;
	}

	@Override
	public String getLoginToken() {
		return loginToken;
	}

	@Override
	public void lockUser() {
		throw new UnsupportedOperationException();
	}

	@Override
	public void unLockUser() {
		throw new UnsupportedOperationException();
	}

	@Override
	public boolean isLockUser() {
		throw new UnsupportedOperationException();
	}

	@Override
	public boolean isRegisterVerification() {
		throw new UnsupportedOperationException();
	}

	@Override
	public synchronized void addRole(Role role) {
		if (null == role) {
			return;
		}
		List<Role> roles = getRoles();
		roles.add(role);
		setRoles(roles);
	}

	@Override
	public void removeRole(Role role) {
		if (null == role) {
			return;
		}
		List<Role> roles = getRoles();
		roles.remove(role);
	}

	@Override
	public void removeAllRole() {
		List<Role> r = getRoles();
		r.clear();
	}

	@Override
	public boolean isContainRole(int roleId) {
		List<Role> roles = getRoles();
		for (Role r : roles) {
			if (r.getId() == roleId) {
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean isContainRole(Role role) {
		if (null == role) {
			return false;
		}
		return isContainRole(role.getId());
	}

	@Override
	public boolean isAdmin() {
		List<Role> roles = getRoles();
		for (Role r : roles) {
			if (r.getId() == Role.ROLE_SU || r.getId() == Role.ROLE_ADMIN) {
				return true;
			}
		}
		return false;
	}

	@Override
	public void setName(String name) {
		this.name = name;
	}

	@Override
	public void setNickName(String nickName) {
		throw new UnsupportedOperationException();
	}

	@Override
	public void setSex(SexEnum sex) {
		throw new UnsupportedOperationException();

	}

	@Override
	public boolean setPhone(String identifycode, String phone) {
		throw new UnsupportedOperationException();
	}

	@Override
	public void setSynopsis(String synopsis) {
		throw new UnsupportedOperationException();

	}

	@Override
	public void setAdmin(User operator) {
		throw new UnsupportedOperationException();

	}

	@Override
	public void setHeader(String header) {
		throw new UnsupportedOperationException();

	}

	@Override
	public String getHeader() {
		throw new UnsupportedOperationException();
	}

	@Override
	public abstract boolean vertifyPassword(String password) throws UserException;

	@Override
	public void updateLastActive() {
		this.lastActive = new Date();

	}

	@Override
	public void changePassword(String oldPassword, String newPassword) throws UserException {
		throw new UnsupportedOperationException();
	}

	@Override
	public void logout() {
		// TODO Auto-generated method stub

	}

	@Override
	public Date getUpdateLastActive() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public User valueOf(TbUser tbUser) {
		// TODO Auto-generated method stub
		return null;
	}

}
