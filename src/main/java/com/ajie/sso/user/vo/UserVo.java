package com.ajie.sso.user.vo;

import java.util.Date;

import com.ajie.dao.pojo.TbUser;

/**
 * TbUser封装,因TbUser向外提供了密码，所以封装一个，vo不向外提供密码并添加一些辅助方法
 *
 * @author niezhenjie
 *
 */
public class UserVo {

	private Integer id;

	private String name;

	private String nickname;

	private String synopsis;

	private String sex;

	private String phone;

	private String email;

	private Date createtime;

	private Date lastactive;

	private String roleids;

	private String header;

	private Integer mark;

	/** 不对外提供get */
	private TbUser user;

	public UserVo(TbUser user) {
		this.id = user.getId();
		this.name = user.getName();
		this.nickname = user.getNickname();
		this.synopsis = user.getSynopsis();
		this.sex = user.getSex();
		this.phone = user.getPhone();
		this.email = user.getEmail();
		this.createtime = user.getLastactive();
		this.lastactive = user.getLastactive();
		this.roleids = user.getRoleids();
		this.header = user.getHeader();
		this.mark = user.getMark();
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public String getSynopsis() {
		return synopsis;
	}

	public void setSynopsis(String synopsis) {
		this.synopsis = synopsis;
	}

	public String getSex() {
		return sex;
	}

	public void setSex(String sex) {
		this.sex = sex;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getToken() {
		return user.getToken();
	}

	public void setToken(String token) {
		user.setToken(token);
	}

	public Date getCreatetime() {
		return createtime;
	}

	public void setCreatetime(Date createtime) {
		this.createtime = createtime;
	}

	public Date getLastactive() {
		return lastactive;
	}

	public void setLastactive(Date lastactive) {
		this.lastactive = lastactive;
	}

	public String getRoleids() {
		return roleids;
	}

	public void setRoleids(String roleids) {
		this.roleids = roleids;
	}

	public String getHeader() {
		return header;
	}

	public void setHeader(String header) {
		this.header = header;
	}

	public Integer getMark() {
		return mark;
	}

	public void setMark(Integer mark) {
		this.mark = mark;
	}

	public TbUser toUser() {
		TbUser user = new TbUser();
		user.setName(name);
		user.setId(id);
		user.setEmail(email);
		user.setHeader(header);
		user.setLastactive(lastactive);
		user.setCreatetime(createtime);
		user.setMark(mark);
		user.setNickname(nickname);
		user.setPhone(phone);
		user.setRoleids(roleids);
		user.setSex(sex);
		user.setSynopsis(synopsis);
		return user;
	}

}
