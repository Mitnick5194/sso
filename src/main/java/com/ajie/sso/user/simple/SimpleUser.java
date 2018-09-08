package com.ajie.sso.user.simple;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ajie.chilli.utils.Toolkits;
import com.ajie.chilli.utils.common.StringUtil;
import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.user.Role;
import com.ajie.sso.user.User;
import com.ajie.sso.user.UserServiceExt;
import com.ajie.sso.user.enums.SexEnum;
import com.ajie.sso.user.exception.UserException;

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

	public SimpleUser(UserServiceExt service) {
		super(service);
	}

	public SimpleUser(UserServiceExt service, TbUser pojo) {
		super(service);
		this.id = pojo.getId();
		this.name = pojo.getName();
		this.email = pojo.getName();
		this.createTime = pojo.getCreatetime();
		this.password = pojo.getPassword();
		this.header = pojo.getHeader();
		this.lastActive = pojo.getLastactive();
		this.mark = pojo.getMark();
		this.nickName = pojo.getNickname();
		this.phone = pojo.getPassword();
		this.roleIdStr = pojo.getRoleids();
		this.sex = Integer.valueOf(pojo.getSex());
		this.synopsis = pojo.getSynopsis();
	}

	/**
	 * 通过用户名，密码，邮箱构造一个用户，默认权限为登陆者
	 * 
	 * @param name
	 * @param email
	 * @param password
	 * @throws UserException
	 */
	public SimpleUser(UserServiceExt service, String name, String email, String password)
			throws UserException {
		super(service);
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

	public SimpleUser(UserServiceExt service, int id, String name, String email, String password)
			throws UserException {
		super(service);
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

	public SimpleUser(UserServiceExt service, String name, String email, String password,
			String synopsis, int sex, String phone) throws UserException {
		this(service, name, email, password);
		this.synopsis = synopsis;
		this.sex = sex;
		this.phone = phone;
	}

	public SimpleUser(UserServiceExt service, String name, String email, String password,
			List<Role> roles) throws UserException {
		this(service, name, email, password);
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
	public boolean setPhone(String vertifycode, String newphone) throws UserException {
		if (StringUtil.isEmpty(vertifycode)) {
			throw new UserException("验证码不能为空");
		}
		if (StringUtil.isEmpty(newphone)) {
			throw new UserException("手机号码不能为空");
		}
		if (StringUtil.eq(phone, newphone)) {
			throw new UserException("新手机号码不能和原来的一样");
		}
		String vcode = getService().getVertifycode(this);
		if (StringUtil.isEmpty(vcode)) {
			throw new UserException("验证码无效，请从新获取");
		}
		if (!StringUtil.eq(vertifycode, vcode)) {
			throw new UserException("验证码错误");
		}
		phone = newphone;
		return true;
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
		// 保存roleId是以字符串格式保存，所以需要切割
		List<Integer> roleIds = splitRoleIds();
		synchronized (roles) {
			List<Role> roleTable = getService().getRoles();
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

	@Override
	public TbUser toPojo() {
		TbUser tbUser = new TbUser();
		tbUser.setId(this.id);
		tbUser.setName(this.name);
		tbUser.setPassword(this.password);
		tbUser.setNickname(this.nickName);
		tbUser.setSynopsis(this.synopsis);
		tbUser.setSex(String.valueOf(this.sex));
		tbUser.setPhone(this.phone);
		tbUser.setEmail(this.email);
		tbUser.setCreatetime(this.createTime);
		tbUser.setLastactive(this.lastActive);
		tbUser.setRoleids(this.roleIdStr);
		tbUser.setHeader(this.header);
		tbUser.setMark(this.mark);
		return tbUser;
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
