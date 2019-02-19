package com.ajie.sso.user.impl;

import java.io.IOException;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dom4j.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ajie.chilli.cache.redis.RedisClient;
import com.ajie.chilli.cache.redis.RedisException;
import com.ajie.chilli.common.enums.SexEnum;
import com.ajie.chilli.utils.Toolkits;
import com.ajie.chilli.utils.XmlHelper;
import com.ajie.chilli.utils.common.JsonUtils;
import com.ajie.chilli.utils.common.StringUtils;
import com.ajie.dao.mapper.TbUserMapper;
import com.ajie.dao.pojo.TbUser;
import com.ajie.dao.pojo.TbUserExample;
import com.ajie.dao.pojo.TbUserExample.Criteria;
import com.ajie.sso.role.Role;
import com.ajie.sso.role.RoleUtils;
import com.ajie.sso.user.UserService;
import com.ajie.sso.user.exception.UserException;
import com.ajie.web.utils.CookieUtils;

/**
 * 用户服务实现
 *
 * @author niezhenjie
 *
 */
@Service(value = "userService")
public class UserServiceImpl implements UserService {
	private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

	/**
	 * redis客户端服务
	 */
	@Resource
	protected RedisClient redisClient;

	/**
	 * 用户数据库映射
	 */
	@Resource
	protected TbUserMapper userMapper;

	/**
	 * 权限表
	 */
	protected List<Role> roles;

	/** 用户默认头像路径 */
	@Resource
	private String user_defalut_header;

	@Override
	public TbUser register(String name, String passwd, HttpServletRequest request,
			HttpServletResponse response) throws UserException {
		if (null == name)
			throw new UserException("注册失败，用户名为空");
		if (null == passwd)
			throw new UserException("注册失败，密码为空");
		// 密码加密
		String enc = Toolkits.md5Password(passwd);
		TbUser user = new TbUser(name, enc);
		user.setHeader(user_defalut_header);
		List<Role> roles = Collections.singletonList(Role._Nil);// TODO
		user.setRoleids(JsonUtils.toJSONString(roles));
		userMapper.insert(user);
		String key = Toolkits.genRandomStr(32);
		boolean issuc = false;
		try {
			issuc = putintoRedis(key, user);
		} catch (RedisException e) {
			try {
				issuc = putintoRedis(key, user);// 重试
			} catch (RedisException e1) {
				logger.warn("添加redis缓存失败", e1);
			}
		}
		if (issuc) {
			setCookie(request, response, key);
			user.setToken(key);
		}
		return user;
	}

	@Override
	public TbUser update(TbUser tbUser) throws UserException {
		if (null == tbUser)
			return tbUser;
		userMapper.updateByPrimaryKey(tbUser);
		return tbUser;
	}

	@Override
	public TbUser login(String key, String password, HttpServletRequest request,
			HttpServletResponse response) throws UserException {
		if (null == key)
			throw new UserException("用户名为空");
		if (null == password)
			throw new UserException("密码错误");
		TbUserExample ex = new TbUserExample();
		Criteria criteria = ex.createCriteria();
		criteria.andNameEqualTo(key);
		// ex.or(criteria);
		Criteria criteria2 = ex.createCriteria();
		ex.or(criteria2);
		criteria2.andEmailEqualTo(key);
		Criteria criteria3 = ex.createCriteria();
		criteria3.andPhoneEqualTo(key);
		ex.or(criteria3);
		List<TbUser> users = userMapper.selectByExample(ex);
		if (users.size() != 1)
			throw new UserException("登录失败，用户名或密码错误");
		TbUser user = users.get(0);
		password = Toolkits.md5Password(password);
		if (!user.contrastPassword(password)) {
			throw new UserException("密码错误");
		}
		String randkey = Toolkits.genRandomStr(32);
		boolean issuc = false;
		try {
			issuc = putintoRedis(randkey, user);
		} catch (RedisException e) {
			try {
				issuc = putintoRedis(randkey, user);// 重试
			} catch (RedisException e1) {
				logger.warn("添加redis缓存失败", e1);
			}
		}
		if (issuc) {
			setCookie(request, response, randkey);
			user.setToken(randkey);
		}
		logger.info("增加会话：" + user.toString());
		return user;
	}

	@Override
	public TbUser getUserByToken(String token) throws UserException {
		if (null == token)
			return null;
		TbUser user = null;
		try {
			user = getUserFromRedis(token);
		} catch (RedisException e) {
			logger.warn("无法从redis中加载TbUser,token=" + token, e);
		}
		return user;
	}

	@Override
	public TbUser getUser(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		String key = "";
		for (Cookie cookie : cookies) {
			String name = cookie.getName();
			if (UserService.COOKIE_KEY.equals(name)) {
				key = cookie.getValue();
			}
		}
		try {
			TbUser user = getUserFromRedis(key);
			return user;
		} catch (RedisException e) {
			return null;
		}
	}

	@Override
	public TbUser getUserById(int sid) {
		int id = 0;
		try {
			id = Integer.valueOf(sid);
		} catch (Exception e) {
			return null;
		}
		TbUser user = userMapper.selectByPrimaryKey(id);
		return user;
	}

	@Override
	public TbUser getUserByName(String name) {
		TbUserExample ex = new TbUserExample();
		Criteria criteria = ex.createCriteria();
		criteria.andNameEqualTo(name);
		List<TbUser> users = userMapper.selectByExample(ex);
		if (null == users || users.isEmpty() || users.size() > 1) {
			return null;
		}
		return users.get(0);
	}

	@Override
	public TbUser getUserByEmail(String email) {
		TbUserExample ex = new TbUserExample();
		Criteria criteria = ex.createCriteria();
		criteria.andEmailEqualTo(email);
		List<TbUser> users = userMapper.selectByExample(ex);
		if (null == users || users.isEmpty() || users.size() > 1) {
			return null;
		}
		return users.get(0);
	}

	@Override
	public TbUser getUserByPhone(String phone) {
		TbUserExample ex = new TbUserExample();
		Criteria criteria = ex.createCriteria();
		criteria.andPhoneEqualTo(phone);
		List<TbUser> users = userMapper.selectByExample(ex);
		if (null == users || users.isEmpty() || users.size() > 1) {
			return null;
		}
		return users.get(0);
	}

	@Override
	public List<TbUser> searchUsers(int state, Date registerDate, SexEnum sex) {
		// TODO Auto-generated method stub
		return null;
	}

	private boolean putintoRedis(String key, TbUser user) throws RedisException {
		boolean b = false;
		redisClient.hset(REDIS_PREFIX, key, user);
		b = true;
		return b;
	}

	private TbUser getUserFromRedis(String key) throws RedisException {
		TbUser user = redisClient.hgetAsBean(REDIS_PREFIX, key, TbUser.class);
		return user;
	}

	private void setCookie(HttpServletRequest request, HttpServletResponse response, String value) {
		CookieUtils.setCookie(request, response, COOKIE_KEY, value);
	}

	public void loadRoles() {

	}

	@Override
	public List<Role> getRoles() {
		return roles;
	}

	@Override
	public boolean checkRole(TbUser user, String url) {
		String roleids = user.getRoleids();
		List<Role> list = JsonUtils.toList(roleids, Role.class);
		for (Role role : list) {
			List<String> urls = role.getUrls();
			for (String ur : urls) {
				if (StringUtils.eq(ur, url)) {
					return true;
				}
			}
		}
		return false;
	}

	@Value("${role_file__path_name}")
	public void setRole(String filepath) throws IOException {
		if (null == filepath)
			return;
		loadRole(filepath);
	}

	public void loadRole(String path) throws IOException {
		Document doc = XmlHelper.parseDocument(path);
		long start = System.currentTimeMillis();
		List<Role> roles = RoleUtils.loadRoles(doc);
		this.roles = roles;
		long end = System.currentTimeMillis();
		logger.info("已从配置文件中初始化了用户数据 , 耗时 " + (end - start) + " ms");

	}

	public void setUserDefaultHeader(String header) {
		this.user_defalut_header = header;
	}
}
