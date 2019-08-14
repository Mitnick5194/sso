package com.ajie.sso.user;

import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ajie.chilli.cache.redis.RedisClient;
import com.ajie.chilli.cache.redis.RedisException;
import com.ajie.chilli.support.Destroy;
import com.ajie.chilli.support.ShutdownHook;
import com.ajie.dao.pojo.TbUser;

/**
 * 维护用户redis key，代码控制过期时间，当服务器关闭时，删除所有的登录信息，但是需要规范关闭服务器才会执行关闭hook，系统单例
 *
 * @author niezhenjie
 *
 */
public class RedisUser implements Destroy {
	private static final Logger logger = LoggerFactory
			.getLogger(RedisUser.class);
	private RedisClient redisClient;
	/** 键是key，值是创建时间 */
	private Map<String, Date> map;
	/** 过期时间，单位为秒 */
	private long expire;

	protected final String HOOK_THREAD_NAME = "redis-hook";

	public RedisUser(RedisClient redisClient, long expire) {
		this.redisClient = redisClient;
		map = new HashMap<String, Date>();
		this.expire = expire;
		/*
		 * super.setName(HOOK_THREAD_NAME);
		 * Runtime.getRuntime().addShutdownHook(this);
		 */
		ShutdownHook.register(this);
	}

	public void register(String key) {
		if (null == key) {
			return;
		}
		synchronized (map) {
			map.put(key, new Date());
		}
	}

	/**
	 * 获取缓存用户，需要检查key的过期时间
	 * 
	 * @param key
	 * @return
	 */
	public TbUser getUser(String key) {
		if (map.isEmpty()) {
			return null;
		}
		Date date = map.get(key);
		if (isExpire(date)) {
			// 过期了
			return null;
		}
		try {
			TbUser user = redisClient.hgetAsBean(UserService.REDIS_PREFIX, key,
					TbUser.class);
			if (null != user)
				update(key);// 更新一下时间
			return user;
		} catch (RedisException e) {
			logger.warn("无法从redis缓存中获取TbUser,token=" + key, e);
		}
		return null;
	}

	/**
	 * 删除redis登录信息
	 * 
	 * @param key
	 */
	public void remove(String key) {
		if (null == key) {
			return;
		}
		if (map.isEmpty()) {
			return;
		}
		synchronized (map) {
			map.remove(key);
		}
		try {
			redisClient.hdel(UserService.REDIS_PREFIX, key);
		} catch (RedisException e) {
			logger.error("删除登录信息失败", e);
		}
	}

	/**
	 * 指定时间是否过期
	 * 
	 * @param date
	 * @return 过期返回true false表示未过期
	 */
	private boolean isExpire(Date date) {
		if(null == date){
			return true;
		}
		long now = System.currentTimeMillis();
		if (date.getTime() + (expire * 1000) > now)
			return false;
		return true;
	}

	/**
	 * 更新存活时间
	 * 
	 * @param key
	 */
	public void update(String key) {
		if (map.isEmpty()) {
			return;
		}
		/*Date date = map.get(key);
		if (null == date) {
			return;
		}*/
		synchronized (map) {
			map.put(key, new Date());
		}
	}

	public void work() {
		if (map.isEmpty()) {
			return;
		}
		synchronized (map) {
			Iterator<Map.Entry<String, Date>> it = map.entrySet().iterator();
			while (it.hasNext()) {
				Entry<String, Date> entry = it.next();
				String key = entry.getKey();
				Date createDate = entry.getValue();
				if (isExpire(createDate)) {
					// 过期了
					try {
						redisClient.hdel(UserService.REDIS_PREFIX, key);
						it.remove();// 删除
						if (logger.isTraceEnabled()) {
							logger.info("定时任务【"
									+ Thread.currentThread().getName()
									+ "】清除redis登录信息【" + key + "】");
						}
					} catch (RedisException e) {
						logger.error("定时清除redis登录信息失败", e);
					}
				}
			}
		}
	}

	/*
	 * @Override public void run() { super.run(); shutdownHook(); }
	 */

	/**
	 * 关闭服务器同步删除相关redis
	 */
	protected void shutdownHook() {
		try {
			redisClient.hdel(UserService.REDIS_PREFIX);
			logger.info("系统退出，登录信息已清除");
		} catch (RedisException e) {
			logger.error("服务器关闭hook线程删除redis用户登录信息失败", e);
		}
	}

	@Override
	public void destroy() {
		shutdownHook();
	}
}
