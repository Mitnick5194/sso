package com.ajie.sso.role;

import java.util.ArrayList;
import java.util.List;

import org.dom4j.Document;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ajie.chilli.utils.Toolkits;
import com.ajie.chilli.utils.common.JsonUtils;
import com.ajie.chilli.utils.common.StringUtils;
import com.ajie.chilli.utils.common.URLUtil;
import com.ajie.dao.pojo.TbUser;

/**
 *
 *
 * @author niezhenjie
 *
 */
public class RoleUtils {
	private static final Logger logger = LoggerFactory.getLogger(RoleUtils.class);

	/**
	 * 加载权限表
	 * 
	 * @param doc
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Role> loadRoles(Document doc) {
		Element root = doc.getRootElement();
		List<Element> roleElments = root.elements("role");
		boolean haserr = false;
		List<Role> roles = new ArrayList<Role>(roleElments.size());
		for (Element roleElement : roleElments) {
			// 权限id
			String hexid = roleElement.attributeValue("id");
			int id = 0;
			try {
				id = Toolkits.hex2deci(hexid);
			} catch (Exception e) {
				logger.error("权限id格式错误，应为0x开头十六进制形式，跳过该权限：" + hexid);
				haserr = true;
				continue;
			}
			// 权限名
			String name = roleElement.attributeValue("name");
			// 权限描述
			String desc = roleElement.attributeValue("desc");
			Role r = Role.valueOf(name, id);
			r.setDesc(desc);
			roles.add(r);
			// 解析url连接
			Element urlsElement = roleElement.element("urls");
			List<Element> urlElements = urlsElement.elements("url");
			List<String> urls = new ArrayList<String>(urlElements.size());
			for (Element urlElement : urlElements) {
				String url = urlElement.attributeValue("value");
				if (StringUtils.isEmpty(url)) {
					url = urlElement.getTextTrim();
				}
				if (StringUtils.isEmpty(url))
					continue;
				urls.add(url);
			}
			r.setUrls(urls);
		}
		if (haserr)
			logger.error("加载权限表有错误，错误项已被忽略加载");
		return roles;
	}

	/**
	 * user是否有权限访问url
	 * 
	 * @param user
	 * @param url
	 * @return
	 */
	public static boolean checkRole(TbUser user, String url) {
		if (null == user)
			return false;
		String roleids = user.getRoleids();
		List<Role> list = JsonUtils.toList(roleids, Role.class);
		for (Role role : list) {
			List<String> urls = role.getUrls();
			if (URLUtil.matchs(urls, url)) {
				return true;
			}
		}
		return false;
	}
}
