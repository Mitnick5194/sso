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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ajie.chilli.cache.redis.RedisClient;
import com.ajie.chilli.cache.redis.RedisException;
import com.ajie.chilli.common.MarkSupport;
import com.ajie.chilli.common.MarkVo;
import com.ajie.chilli.common.enums.SexEnum;
import com.ajie.chilli.support.TimingTask;
import com.ajie.chilli.support.Worker;
import com.ajie.chilli.thread.ThreadPool;
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
import com.ajie.sso.user.RedisUser;
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
public class UserServiceImpl implements UserService, Worker, MarkSupport {
	private static final Logger logger = LoggerFactory
			.getLogger(UserServiceImpl.class);

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

	@Resource(name = "defaultUserHeader")
	protected String defaultUserHeader;
	@Resource
	/** 线程池 */
	private ThreadPool threadPool;

	/**
	 * 权限表
	 */
	protected List<Role> roles;

	/** 定时删除 redis登录信息 */
	private RedisUser watch;

	@Autowired
	public UserServiceImpl(ThreadPool pool) {
		threadPool = pool;
		// 每小时清除一次
		TimingTask.createTimingTask(threadPool, "timing-del-login-info", this,
				"00:00", 60 * 60 * 1000);
	}

	@Override
	public TbUser register(String name, String passwd,
			HttpServletRequest request, HttpServletResponse response)
			throws UserException {
		if (null == name)
			throw new UserException("注册失败，用户名为空");
		if (null == passwd)
			throw new UserException("注册失败，密码为空");
		// 密码加密
		String enc = Toolkits.md5Password(passwd);
		TbUser user = new TbUser(name, enc);
		user.setHeader(defaultUserHeader);
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
	public TbUser updatePart(TbUser tbUser) throws UserException {
		if (null == tbUser)
			throw new UserException("找不到用户");
		if (tbUser.getId() == 0) {
			throw new UserException("找不到用户");
		}
		userMapper.updateByPrimaryKeySelective(tbUser);
		return tbUser;
	}

	@Override
	public void modifyPassword(TbUser user, String oldpd, String newpw,
			TbUser operator, HttpServletRequest request,
			HttpServletResponse response) throws UserException {
		if (null == user || user.getId() == 0)
			throw new UserException("找不到用户");
		if (StringUtils.isEmpty(oldpd))
			throw new UserException("原密码错误");
		if (StringUtils.isEmpty(newpw))
			throw new UserException("密码不允许为空");
		if (operator.getId() != user.getId() && !RoleUtils.isAdmin(operator))
			throw new UserException("无修改权限");
		// user一般为redis保存的登录用户，redis不保存密码，所以需要到数据库查询出来再更新，而且这样的数据更准确
		user = getUserById(user.getId());
		if (null == user) {
			// 难道被其他线程删除了，可能是管理员刚刚删除了吧
			throw new UserException("用户不存在");
		}
		if (!user.contrastPassword(Toolkits.md5Password(oldpd)))
			throw new UserException("原密码错误");
		TbUser u = new TbUser();
		u.setId(user.getId());
		u.setPassword(Toolkits.md5Password(newpw));
		updatePart(u);
		if (user.getId() != operator.getId())
			logger.info(operator + "修改了" + user + "密码");
		// 清除登录信息
		String token = getToken(request);
		/*
		 * if (null == token) return;
		 */// 应该不会发生这种是吧？控制器还能拿到token的user呢
		RedisUser redisUser = getRedisUser();
		redisUser.remove(token);
		CookieUtils.setCookie(request, response, COOKIE_KEY, token, 0);
	}

	@Override
	public TbUser login(String key, String password,
			HttpServletRequest request, HttpServletResponse response)
			throws UserException {
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
		MarkVo mark = getMarkVo(user.getMark());
		// 标志在线状态
		mark.setMark(LOGIN_STATE_ONLINE.getId());
		user.setMark(mark.getMark());
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
	public void logout(HttpServletRequest request, HttpServletResponse response) {
		Cookie[] cookies = request.getCookies();
		if (null == cookies) {
			// 已经退出了，或者客户端cookie过期了
			return;
		}
		String key = getToken(request);
		if (null == key) {
			// 已经退出了，或者客户端cookie过期了
			return;
		}
		CookieUtils.setCookie(request, response, COOKIE_KEY, key, 0);
		getRedisUser().remove(key);// 删除缓存数据
	}

	@Override
	public void logoutByToken(String token) {
		if (null == token) {
			return;
		}
		getRedisUser().remove(token);// 删除缓存数据
		TbUser user = null;
		try {
			user = getUserByToken(token);
		} catch (UserException e) {
			logger.warn("redis获取用户异常，token:" + token, e);
		}
		if (null == user) {
			return;
		}
		logger.info("注销登录：" + user.toString());
	}

	@Override
	public TbUser getUserByToken(String token) throws UserException {
		if (null == token)
			return null;
		return getUserFromRedis(token);
	}

	@Override
	public TbUser getUser(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (null == cookies) {
			return null;
		}
		String key = getToken(request);
		if (null == key) {
			return null;
		}
		TbUser user = getUserFromRedis(key);
		return user;
	}

	private String getToken(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (null == cookies) {
			return null;
		}
		for (Cookie cookie : cookies) {
			String name = cookie.getName();
			if (UserService.COOKIE_KEY.equals(name)) {
				return cookie.getValue();
			}
		}
		return null;
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
		getRedisUser().register(key);
		b = true;
		return b;
	}

	private TbUser getUserFromRedis(String key) {
		return getRedisUser().getUser(key);
	}

	/**
	 * 不用设置过期时间，使用redis缓存控制过期时间，因为如果使用cookie的过期时间，每次请求都要刷新cookie的过期时间，
	 * 则获取用户的接口需要调整为传入httpservletresponse，由于接口一开始没有这参数，所以不打算调整接口了，不过期吧
	 * 
	 * @param request
	 * @param response
	 * @param value
	 */
	private void setCookie(HttpServletRequest request,
			HttpServletResponse response, String value) {
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

	private RedisUser getRedisUser() {
		if (null == watch) {
			watch = new RedisUser(redisClient, COOKIE_EXPIRE);
		}
		return watch;
	}

	@Override
	public void work() {
		getRedisUser().work();
	}

	@Override
	public boolean lock(TbUser user) throws UserException {
		if (null == user || user.getId() == 0)
			throw new UserException("用户不存在");
		// 防止传入的user修改了其他的字段，这方法只会更新状态字段
		TbUser u = new TbUser();
		u.setId(user.getId());
		MarkVo mark = getMarkVo(user.getMark());
		mark.setMark(STATE_LOCK.getId());
		u.setMark(mark.getMark());
		updatePart(u);
		return true;
	}

	@Override
	public MarkVo getMarkVo(int mark) {
		return new MarkVo(mark);
	}
}
