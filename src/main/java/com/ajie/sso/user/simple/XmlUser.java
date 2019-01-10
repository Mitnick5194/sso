package com.ajie.sso.user.simple;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.user.Role;
import com.ajie.sso.user.UserServiceExt;

/**
 * xml配置文件用户，比数据库储存的用户简单很多
 * 
 * @author ajie
 *
 */
public class XmlUser extends AbstractUser {

	/**
	 * 原始密码 无需加密
	 */
	protected String password;

	public XmlUser(UserServiceExt service, int id, String name, String password) {
		super(service);
		this.id = id;
		this.name = name;
		this.password = password;
		createTime = new Date();
		lastActive = new Date();
	}

	@Override
	public boolean vertifyPassword(String password) {
		if (null == password || password.length() < 1) {
			return false;
		}
		return password.equals(this.password);
	}

	@Override
	public List<Role> getRoles() {
		if (null == roles) {
			roles = new ArrayList<Role>();
		}
		return roles;
	}

	@Override
	public void setRoles(List<Role> roles) {
		this.roles = roles;

	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("{id: ").append(id);
		sb.append(" , name: ").append(name);
		sb.append(" , email: ").append(email);
		sb.append(" , createTime: ").append(createTime);
		sb.append(" , lastActive: ").append(lastActive);
		sb.append(", roles: ");
		for (Role r : roles) {
			sb.append(r.getId());
			sb.append(Role.ID_SPERATOR);
		}
		sb.append("}");
		return sb.toString();

	}

	@Override
	public TbUser toPojo() {
		TbUser tbUser = new TbUser();
		tbUser.setId(this.id);
		tbUser.setName(this.name);
		tbUser.setPassword(this.password);
		tbUser.setEmail(this.email);
		tbUser.setCreatetime(this.createTime);
		tbUser.setLastactive(this.lastActive);
		return tbUser;
	}

}
