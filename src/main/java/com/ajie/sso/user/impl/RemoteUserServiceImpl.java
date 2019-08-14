package com.ajie.sso.user.impl;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ajie.chilli.common.ResponseResult;
import com.ajie.chilli.common.enums.SexEnum;
import com.ajie.chilli.http.HttpInvoke;
import com.ajie.chilli.http.Parameter;
import com.ajie.chilli.http.exception.InvokeException;
import com.ajie.chilli.utils.HttpClientUtil;
import com.ajie.chilli.utils.common.JsonUtils;
import com.ajie.dao.pojo.TbUser;
import com.ajie.sso.role.Role;
import com.ajie.sso.user.UserService;
import com.ajie.sso.user.exception.UserException;
import com.alibaba.fastjson.JSONObject;

/**
 * 用户模块远程接口实现，对应的方法调用要与sso系统的控制器方法一致
 *
 * @author niezhenjie
 *
 */

public class RemoteUserServiceImpl implements UserService {

	private static final Logger logger = LoggerFactory
			.getLogger(RemoteUserServiceImpl.class);

	/** 单点登录系统链接 */
	private String ssohost;

	public HttpInvoke httpInvoke;

	/**
	 * 本系统redis客户端服务
	 */
	/*
	 * @Resource protected RedisClient redisClient;
	 */

	public RemoteUserServiceImpl(String ssohost) {
		this.ssohost = ssohost;
	}

	public void setHttpInvoke(List<String> urls) {
		httpInvoke = HttpInvoke.getInstance(urls);
	}

	@Override
	public TbUser register(String name, String passwd,
			HttpServletRequest request, HttpServletResponse response)
			throws UserException {
		try {
			ResponseResult result = httpInvoke.invoke("register",
					Parameter.valueOf("name", name),
					Parameter.valueOf("password", passwd));
			return result.getData(TbUser.class);
		} catch (InvokeException e2) {
			throw new UserException("注册失败", e2);
		}
	}

	@Override
	public TbUser update(TbUser tbUser) throws UserException {
		String url = genUrl("update");
		Map<String, String> params = new HashMap<String, String>();
		params.put("user", JsonUtils.toJSONString(tbUser));
		Map<String, String> header = remoteHeader();
		ResponseResult res = null;
		String result = "";
		try {
			result = HttpClientUtil.doGet(url, params, header);
			res = getResponse(result);
		} catch (IOException e) {
			// 重试
			try {
				result = HttpClientUtil.doGet(url, params, header);
				res = getResponse(result);
			} catch (IOException e1) {
				logger.error("更新用户失败" + e1);
			}
		}
		assertResponse(res);
		return (TbUser) res.getData();

	}

	// 更新应该都在sso系统里完成吧
	@Override
	public TbUser updatePart(TbUser tbUser) throws UserException {
		throw new UnsupportedOperationException();
	}

	@Override
	public void modifyPassword(TbUser user, String oldpd, String newpw,
			TbUser operator, HttpServletRequest request,
			HttpServletResponse response) throws UserException {
		throw new UnsupportedOperationException();
	}

	@Override
	public TbUser login(String key, String password,
			HttpServletRequest request, HttpServletResponse response)
			throws UserException {
		String url = genUrl("login");
		Map<String, String> params = new HashMap<String, String>();
		params.put("key", key);
		params.put("password", password);
		Map<String, String> header = remoteHeader();
		ResponseResult res = null;
		String result = "";
		try {
			result = HttpClientUtil.doGet(url, params, header);
			res = getResponse(result);
		} catch (IOException e) {
			// 重试
			try {
				result = HttpClientUtil.doGet(url, params, header);
				res = getResponse(result);
			} catch (IOException e1) {
				logger.error("登录失败" + e1);
			}
		}
		assertResponse(res);
		return JsonUtils.toBean((JSONObject) res.getData(), TbUser.class);
	}

	@Override
	public TbUser getUserByToken(String token) throws UserException {
		try {

			ResponseResult result = httpInvoke.invoke("getuserbytoken",
					HttpInvoke.TYPE_GET, remoteHeader(),
					Parameter.valueOf(UserService.REQUEST_TOKEN_KEY, token));
			return result.getData(TbUser.class);
		} catch (InvokeException e) {
			logger.error("通过token获取用户失败", e);
		}
		return null;
	}

	@Override
	public TbUser getUser(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (null == cookies)
			return null;
		String key = null;
		Cookie ck = null;
		for (Cookie cookie : cookies) {
			String name = cookie.getName();
			if (UserService.COOKIE_KEY.equals(name)) {
				key = cookie.getValue();
				ck = cookie;
				break;
			}
		}
		if (null == key)
			return null;// 登录token都没有，不用找了
		// 注释理由，不存在本地，存在本地不好全局控制（如修改密码和缓存过期）
		/*
		 * TbUser user = null; // 先从本系统缓存里取 if (null != redisClient) { try {
		 * user = redisClient.hgetAsBean(REDIS_PREFIX, key, TbUser.class);
		 * redisClient.expire(key, REDIS_EXPIRE); } catch (RedisException e) {
		 * // 重试 try { user = redisClient.hgetAsBean(REDIS_PREFIX, key,
		 * TbUser.class); redisClient.expire(key, REDIS_EXPIRE); } catch
		 * (RedisException e1) { logger.info("重试仍失败", e1); } } if (null != user)
		 * return user;// 找到了 }
		 */
		// 本地缓存没有，到远程sso系统里找吧
		try {
			TbUser user = getUserByToken(key);
			if (null == user) {
				// 有key但是没有值，可能缓存到期了，被清除了，将request的缓存也过期吧
				if (null == user) {
					// key不为空，但是信息为空，删除request的缓存信息吧
					ck.setMaxAge(0);
				}
			}
			return user;
		} catch (UserException e) {
			logger.error("", e);
		}
		return null;
	}

	@Override
	public TbUser getUserById(int id) {
		try {
			ResponseResult result = httpInvoke.invoke("getuserbyid",
					HttpInvoke.TYPE_GET, remoteHeader(),
					Parameter.valueOf("id", String.valueOf(id)));
			return result.getData(TbUser.class);
		} catch (InvokeException e) {
			logger.error("通过id获取用户失败,id:" + id, e);
		}
		return null;
	}

	@Override
	public TbUser getUserByName(String name) {
		try {
			ResponseResult result = httpInvoke.invoke("getuserbyname",
					HttpInvoke.TYPE_GET, remoteHeader(),
					Parameter.valueOf("name", String.valueOf(name)));
			return result.getData(TbUser.class);
		} catch (InvokeException e) {
			logger.error("通过name获取用户失败,name:" + name, e);
		}
		return null;
	}

	@Override
	public TbUser getUserByEmail(String email) {
		try {
			ResponseResult result = httpInvoke.invoke("getuserbyname",
					HttpInvoke.TYPE_GET, remoteHeader(),
					Parameter.valueOf("email", String.valueOf(email)));
			return result.getData(TbUser.class);
		} catch (InvokeException e) {
			logger.error("通过email获取用户失败,email:" + email, e);
		}
		return null;
	}

	@Override
	public TbUser getUserByPhone(String phone) {
		try {
			ResponseResult result = httpInvoke.invoke("getuserbyname",
					HttpInvoke.TYPE_GET, remoteHeader(),
					Parameter.valueOf("phone", String.valueOf(phone)));
			return result.getData(TbUser.class);
		} catch (InvokeException e) {
			logger.error("通过phone获取用户失败,phone:" + phone, e);
		}
		return null;
	}

	@Override
	public List<TbUser> searchUsers(int state, Date registerDate, SexEnum sex) {
		throw new UnsupportedOperationException();
	}

	/**
	 * 拼接远程链接
	 * 
	 * @param method
	 *            控制器方法名
	 * @return
	 */
	private String genUrl(String method) {
		if (!ssohost.startsWith("http")) {
			throw new IllegalArgumentException("sso系统链接错误" + ssohost);
		}
		if (!ssohost.endsWith("/")) {
			ssohost += "/";
		}
		return ssohost + method;
	}

	private ResponseResult getResponse(String result) {
		return JsonUtils.toBean(result, ResponseResult.class);
	}

	private void assertResponse(ResponseResult response) throws UserException {
		if (null == response)
			throw new UserException("请求结果为空，检查请求连接及网络");
		int code = response.getCode();
		if (ResponseResult.CODE_ERR == code)
			throw new UserException(response.getMsg());
	}

	/**
	 * 暂时不存在本地，存在本地不好全局控制（如修改密码和缓存过期）
	 * 
	 * @param key
	 * @param user
	 * @return
	 */
	/*
	 * private boolean putintoRedis(String key, TbUser user) { boolean b =
	 * false; try { redisClient.hset(REDIS_PREFIX, key, user); } catch
	 * (RedisException e) { logger.info("token置入redis失败" + key); } b = true;
	 * return b; }
	 */

	@Override
	public List<Role> getRoles() {
		throw new UnsupportedOperationException();
	}

	/**
	 * 
	 * @param user
	 * @param checkurl
	 * @return
	 * @Deprecated 使用RoleUtils.checkRole
	 */
	@Override
	@Deprecated
	public boolean checkRole(TbUser user, String checkurl) {
		throw new UnsupportedOperationException();
	}

	/**
	 * 远程请求识别参数，用于控制器识别是其他的系统间调用还是前端调用
	 * 
	 * @param params
	 */
	private Map<String, String> remoteHeader() {
		Map<String, String> map = new HashMap<String, String>(1);
		map.put(REMOTE_SERVER_INVOKE_HEADER_KEY, REMOTE_SERVER_INVOKE_HEADER_VALUE);
		return map;
	}

	@Override
	public void logout(HttpServletRequest request, HttpServletResponse response) {
		throw new UnsupportedOperationException();
	}

	@Override
	public void logoutByToken(String token) {
		try {
			httpInvoke.invoke("logout", HttpInvoke.TYPE_GET, remoteHeader(),
					Parameter.valueOf("token", String.valueOf(token)));
			TbUser user = getUserByToken(token);
			if (null != user) {
				logger.info("注销登录,user:" + user.toString());
			}
		} catch (InvokeException | UserException e) {
			logger.error("注销失败", e);
		}

	}

	@Override
	public boolean lock(TbUser user) throws UserException {
		throw new UnsupportedOperationException();
	}
}
