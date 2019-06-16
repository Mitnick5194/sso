package com.ajie.sso.controller.vo;

import java.util.Date;

import com.ajie.chilli.common.enums.SexEnum;
import com.ajie.dao.pojo.TbUser;

/**
 * TbUser封装
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

	private String header;

	/**
	 * 如果operator和user不是同一个用户或者不是管理员，则不赋值敏感信息
	 * 
	 * @param user
	 * @param operator
	 */
	public UserVo(TbUser user, TbUser operator) {
		this.id = user.getId();
		this.name = user.getName();
		this.nickname = user.getNickname();
		this.synopsis = user.getSynopsis();
		/** 坑爹的mysql，枚举类型是String */
		String sex = user.getSex();
		if (null == sex) {
			sex = "0";
		}
		this.sex = SexEnum.find(Integer.valueOf(sex)).getName();
		if (SexEnum.unknown.getName().equals(this.sex)) {
			this.sex = "保密";
		}
		if (null != operator && user.getId() == operator.getId()) {
			this.phone = user.getPhone();
			this.email = user.getEmail();
		}
		this.createtime = user.getLastactive();
		this.header = user.getHeader();
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

	public Date getCreatetime() {
		return createtime;
	}

	public void setCreatetime(Date createtime) {
		this.createtime = createtime;
	}

	public String getHeader() {
		return header;
	}

	public void setHeader(String header) {
		this.header = header;
	}

	public TbUser toUser() {
		TbUser user = new TbUser();
		user.setName(name);
		user.setId(id);
		user.setEmail(email);
		user.setHeader(header);
		user.setCreatetime(createtime);
		user.setNickname(nickname);
		user.setPhone(phone);
		user.setSex(sex);
		user.setSynopsis(synopsis);
		return user;
	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("{id:").append(id).append(",");
		sb.append("name:").append(name).append(",");
		sb.append("email:").append(email).append(",");
		sb.append("header:").append(header).append(",");
		sb.append("createtime:").append(createtime).append(",");
		sb.append("nickname:").append(nickname).append(",");
		sb.append("phone:").append(phone).append(",");
		sb.append("sex:").append(sex).append(",");
		sb.append("synopsis:").append(synopsis).append("}");
		return sb.toString();
	}

}
