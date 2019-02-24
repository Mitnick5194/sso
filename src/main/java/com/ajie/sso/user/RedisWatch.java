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

/**
 * 登录信息过期
 *
 * @author niezhenjie
 *
 */
public class RedisWatch {
	private static final Logger logger = LoggerFactory.getLogger(RedisWatch.class);
	private RedisClient redisClient;
	/** 键是key，值是创建时间 */
	private Map<String, Date> map;
	/** 过期时间，单位为秒 */
	private long expire;

	public RedisWatch(RedisClient redisClient, long expire) {
		this.redisClient = redisClient;
		map = new HashMap<String, Date>();
		this.expire = expire;
	}

	public void register(String key) {
		if (null == key) {
			return;
		}
		map.put(key, new Date());
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
	 * 更新存活时间
	 * 
	 * @param key
	 */
	public void update(String key) {
		if (map.isEmpty()) {
			return;
		}
		Date date = map.get(key);
		if (null == date) {
			return;
		}
		date = new Date();
	}

	public void work() {
		if (map.isEmpty()) {
			return;
		}
		Iterator<Map.Entry<String, Date>> it = map.entrySet().iterator();
		while (it.hasNext()) {
			Entry<String, Date> entry = it.next();
			String key = entry.getKey();
			Date createDate = entry.getValue();
			Date now = new Date();
			if (createDate.getTime() + expire * 1000 < now.getTime()) {
				// 过期了
				try {
					redisClient.hdel(UserService.REDIS_PREFIX, key);
					synchronized (map) {
						it.remove();// 删除
					}
					if (logger.isTraceEnabled()) {
						logger.info("定时任务【" + Thread.currentThread().getName() + "】清除redis登录信息【"
								+ key + "】");
					}
				} catch (RedisException e) {
					logger.error("定时清除redis登录信息失败", e);
				}
			}
		}

	}
}
