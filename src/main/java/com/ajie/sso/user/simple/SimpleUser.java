package com.ajie.sso.user.simple;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ajie.sso.user.Role;
import com.ajie.sso.user.User;
import com.ajie.sso.user.enums.SexEnum;
import com.ajie.sso.user.exception.UserException;
import com.ajie.utils.Toolkits;
import com.ajie.utils.common.StringUtil;

/**
 * @author niezhenjie
 */
public class SimpleUser extends AbstractUser {
	private static final Logger logger = LoggerFactory.getLogger(SimpleUser.class);
	/*
	 * MD5密码
	 */
	protected String password;

	/**
	 * 用户昵称
	 */
	protected String nickName;

	/**
	 * 简介
	 */
	protected String synopsis;

	/**
	 * 性别
	 */
	protected int sex;

	/**
	 * 手机号
	 */
	protected String phone;

	/**
	 * 保存进数据库的权限id集
	 */
	protected String roleIdStr;

	/** 头像路径 */
	protected String header;

	/**
	 * 标记
	 */
	protected int mark;

	public SimpleUser() {

	}

	/**
	 * 通过用户名，密码，邮箱构造一个用户，默认权限为登陆者
	 * 
	 * @param name
	 * @param email
	 * @param password
	 * @throws UserException
	 */
	public SimpleUser(String name, String email, String password) throws UserException {
		if (null == name) {
			throw new UserException("用户名不能为空");
		}
		if (null == email) {
			throw new UserException("邮箱不能为空");
		}
		if (null == password) {
			throw new UserException("密码不能为空");
		}
		this.name = name;
		this.email = email;
		this.password = Toolkits.md5Password(password);
		createTime = new Date();
		roleIdStr = String.valueOf(Role.ROLE_LOGINER);
		roles = Collections.emptyList();

	}

	public SimpleUser(int id, String name, String email, String password) throws UserException {
		if (0 >= id) {
			throw new UserException("id不合法" + id);
		}
		if (null == name) {
			throw new UserException("用户名不能为空");
		}
		if (null == email) {
			throw new UserException("邮箱不能为空");
		}
		if (null == password) {
			throw new UserException("密码不能为空");
		}
		this.id = id;
		this.name = name;
		this.email = email;
		this.password = Toolkits.md5Password(password);
		;
		createTime = new Date();
		roles = Collections.emptyList();
	}

	public SimpleUser(String name, String email, String password, String synopsis, int sex,
			String phone) throws UserException {
		this(name, email, password);
		this.synopsis = synopsis;
		this.sex = sex;
		this.phone = phone;
	}

	public SimpleUser(String name, String email, String password, List<Role> roles)
			throws UserException {
		this(name, email, password);
		this.roles = roles;
	}

	/**
	 * 设置密码（供内部调用）
	 * 
	 * @param password
	 */
	protected void setPassword(String MD5password) {
		this.password = MD5password;
	}

	@Override
	public void changePassword(String oldPassword, String newPassword) throws UserException {
		if (!vertifyPassword(oldPassword)) {
			throw new UserException("原密码错误");
		}
		setPassword(Toolkits.md5Password(newPassword));
	}

	@Override
	public String getNickName() {
		return nickName;
	}

	@Override
	public void setNickName(String nickName) {
		this.nickName = nickName;
	}

	@Override
	public String getSynopsis() {
		return synopsis;
	}

	@Override
	public void setSynopsis(String synopsis) {
		this.synopsis = synopsis;
	}

	@Override
	public SexEnum getSex() {
		return SexEnum.find(sex);
	}

	@Override
	public void setSex(SexEnum sex) {
		this.sex = sex.getId();
	}

	@Override
	public String getPhone() {
		return phone;
	}

	@Override
	public boolean setPhone(String vertifycode, String phone) {
		// TODO
		return false;
	}

	@Override
	public void updateLastActive() {
		lastActive = new Date();
	}

	@Override
	public String getLoginToken() {
		return loginToken;
	}

	public void genLoginToken() {

	}

	@Override
	public void lockUser() {
		setMark(User.STATE_LOCK);
	}

	@Override
	public void unLockUser() {
		setMark(-User.STATE_LOCK);
	}

	@Override
	public boolean isLockUser() {
		return isMark(User.STATE_LOCK);
	}

	@Override
	public boolean isRegisterVerification() {
		return isMark(User.STATE_UNIVERIFICATION);
	}

	@Override
	public void setRoles(List<Role> roles) {
		if (null == roles) {
			return;
		}
		if (roles.size() == 0) {
			return;
		}
		StringBuilder sb = new StringBuilder();
		for (Role r : roles) {
			sb.append(r.getId());
			sb.append(Role.ID_SPERATOR);
		}
		// 取出最后一个 ","
		String ret = sb.toString();
		ret = ret.substring(0, ret.length() - 1);
		this.roleIdStr = ret;
		this.roles = roles;
	}

	@Override
	public List<Role> getRoles() {
		if (roles != Collections.EMPTY_LIST) {
			return roles;
		}
		roles = new ArrayList<Role>();
		List<Integer> roleIds = splitRoleIds();
		synchronized (roles) {
			List<Role> roleTable = Role.roleTable;
			for (int roleId : roleIds) {
				for (Role role : roleTable) {
					if (roleId == role.getId()) {
						roles.add(role);
					}
				}
			}

		}
		return roles;
	}

	protected List<Integer> splitRoleIds() {
		if (StringUtil.isEmpty(roleIdStr)) {
			return Collections.emptyList();
		}
		String[] ids = roleIdStr.split(Role.ID_SPERATOR);
		List<Integer> list = new ArrayList<Integer>(ids.length);
		for (String sid : ids) {
			try {
				int id = Integer.valueOf(sid);
				list.add(id);
			} catch (NumberFormatException e) {
				logger.error("无效权限id：" + sid);
			}

		}
		return list;
	}

	@Override
	public void addRole(Role role) {
		if (null == role) {
			return;
		}
		getRoles().add(role);
		int roleId = role.getId();
		roleIdStr += Role.ID_SPERATOR + roleId;
	}

	@Override
	public boolean isAdmin() {
		return isMark(User.SU_ROLE);
	}

	@Override
	public void setAdmin(User operator) {

	}

	public int getMark() {
		return mark;
	}

	public void setMark(int mark) {
		if (mark == 0) {
			this.mark = 0;
		} else if (mark > 0) {
			this.mark |= mark;
		} else {
			mark = (-mark);
			this.mark &= ~(mark);
		}
	}

	public boolean isMark(int mark) {
		return mark == (mark & this.mark);
	}

	@Override
	public boolean checkRole(Role role) {
		if (null == role) {
			return false;
		}
		return checkRole(role.getId());
	}

	@Override
	public boolean checkRole(int roleId) {
		for (Role r : roles) {
			if (r.getId() == roleId) {
				return true;
			}
		}
		return false;
	}

	@Override
	public void setHeader(String header) {
		this.header = header;
	}

	@Override
	public String getHeader() {
		return header;
	}

	public boolean vertifyPassword(String password) throws UserException {
		if (StringUtil.isEmpty(password)) {
			throw new UserException("密码不能为空");
		}
		return Toolkits.md5Password(this.password).equals(Toolkits.md5Password(password));
	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("{id: ").append(id);
		sb.append(" , name: ").append(name);
		sb.append(" , email: ").append(email);
		sb.append(" , phone: ").append(phone);
		sb.append(" , nickName: ").append(nickName);
		sb.append(" , sex: ").append(getSex().name());
		sb.append(" , createTime: ").append(createTime);
		sb.append(" , lastActive: ").append(lastActive);
		sb.append(" , roles: ").append(roleIdStr);
		sb.append("}");
		return sb.toString();

	}

}
