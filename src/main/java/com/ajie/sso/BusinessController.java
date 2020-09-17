package com.practice.controller;

import java.util.List;
import java.util.UUID;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ajie.chilli.cache.LruCache;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.practice.dao.pojo.Business;
import com.practice.dao.pojo.BusinessApply;
import com.practice.service.BusinessApplyService;
import com.practice.service.BusinessService;
import com.practice.utils.Toolkits;



@Controller
@RequestMapping("business")
public class BusinessController {
	@Resource
	BusinessApplyService businessApplyService;
	@Resource
	BusinessService businessService;
	
	LruCache<String, Business> cache = new LruCache<>(Business.class);
	@ResponseBody
	@RequestMapping("businessApply")
	public Object businessApply(HttpServletRequest request,
			HttpServletResponse response) {
		setAjaxContentType(response);
		String op = request.getParameter("op");
		JSONObject json = new JSONObject();
		if("getlist".equals(op)) {
			List<BusinessApply> list = businessApplyService.getBusinessApplys();
			JSONArray arrlist = new JSONArray();
			for(BusinessApply apply: list) {
				JSONObject obj = new JSONObject();
				obj.put("id", apply.getId());
				obj.put("bName", apply.getbName());
				obj.put("bAddress", apply.getbAddress());
				obj.put("bClassify", apply.getbClassify());
				obj.put("ownerName", apply.getOwnerName());
				obj.put("ownerPhone", apply.getOwnerPhone());
				obj.put("isallow", apply.getAllow() == 0 ? false: true);
				arrlist.add(obj);
			}
			json.put("isok", true);
			json.put("list", arrlist);
		} else if("createapply".equals(op)) {
			String bName = request.getParameter("bName");
			String bAddress = request.getParameter("bAddress");
			String ownerName = request.getParameter("ownerName");
			String ownerMobile = request.getParameter("ownerPhone");
			String bClassify = request.getParameter("bClassify");
			try {
				businessApplyService.applyBusiness(bName, bAddress, ownerName, ownerMobile, bClassify);
				json.put("isok", true);
				json.put("msg", "提交申请成功");
			} catch (Exception e) {
				json.put("isok", false);
				json.put("msg", "提交申请失败" + e.getMessage());
			}
		} else if("agree".equals(op)) {
			String applyId = request.getParameter("id");
			String bName = request.getParameter("bName");
			String bAddress = request.getParameter("bAddress");
			String ownerName = request.getParameter("ownerName");
			String ownerMobile = request.getParameter("ownerPhone");
			String bClassify = request.getParameter("bClassify");
			try {
				businessService.createBusiness(bName, bAddress, ownerName, ownerMobile, bClassify);
				businessApplyService.allowApply(Integer.valueOf(applyId),BusinessApply.agree);
				json.put("isok", true);
				json.put("msg", "已同意"+bName+"该商家申请");
			} catch (Exception e) {
				e.printStackTrace();
				json.put("isok", false);
				json.put("msg", "同意商家申请失败");
			}
		}
		return json;
	}
	
	private JSONObject wrapResult(boolean isOk,String msg){
		JSONObject json = new JSONObject();
		json.put("isok", isOk);
		json.put("msg", msg);
	}
	@ResponseBody
	@RequestMapping("businesslist")
	public Object businesslist(HttpServletRequest request,
			HttpServletResponse response) {
		setAjaxContentType(response);
		String op = request.getParameter("op");
		JSONObject json = new JSONObject();
		List<Business> list = null;
		if("getlist".equals(op)) {
			list = businessService.getBusiness();
		} else if("getlistbyKeyword".equals(op)) {
			String keyword = request.getParameter("keyword");
			list = businessService.getBusinessBykeyword(keyword);
		}
		JSONArray arr = new JSONArray();
		for(Business b : list) {
			JSONObject obj = new JSONObject();
			obj.put("bId", b.getId());
			obj.put("bName", b.getbName());
			obj.put("bAddress", b.getbAddress());
			obj.put("bClassify", b.getbClassify());
			obj.put("userName", b.getUsername());
			obj.put("root", b.getRootId());
			arr.add(obj);
		}
		json.put("list", arr);
		json.put("isok", true);
		return json;
	}
	@ResponseBody
	@RequestMapping("business")
	public Object business(HttpServletRequest request,
			HttpServletResponse response) {
		setAjaxContentType(response);
		JSONObject json = new JSONObject();
		String id = request.getParameter("id");
		String op = request.getParameter("op");
		if("updateUser".equals(op)) {
			Business b = businessService.getBusinessById(Integer.valueOf(id));
			if(b == null) {
				json.put("isok",false);
				json.put("msg", "找不到商家");
				return json;
			}
			String username = b.getbName();
			String password = "123456";
			try {
				businessService.createRoot(Integer.valueOf(id), username, password);
				json.put("isok",true);
			} catch (NumberFormatException e) {
				e.printStackTrace();
				json.put("isok",false);
				json.put("msg", "转化ID格式出错");
			} catch (Exception e) {
				json.put("isok",false);
				json.put("msg", "为该商家创建用户权限出错"+ e.getMessage());
				e.printStackTrace();
			}
		} else if("updateRoot".equals(op)) {
			String rootId =  request.getParameter("rootId");
			try {
				businessService.updateRootId(Integer.valueOf(id),Integer.valueOf(rootId));
				Business b = businessService.getBusinessById(Integer.valueOf(id));
				json.put("rootName", b.getRootId() == 0 ? "普通权限" : "特殊权限");
				json.put("isok",true);
			} catch (NumberFormatException e) {
				json.put("isok",false);
				json.put("msg", "转化格式出错");
				e.printStackTrace();
			} catch (Exception e) {
				json.put("isok",false);
				json.put("msg", "为该商家修改权限出错"+ e.getMessage());
				e.printStackTrace();
			}
		}
		return json;
	}
	@ResponseBody
	@RequestMapping("login")
	public Object login(HttpServletRequest request,
			HttpServletResponse response) {
		setAjaxContentType(response);
		JSONObject json = new JSONObject();
		String bName = request.getParameter("bName");
		String bPass = request.getParameter("password");
		String bUser = request.getParameter("username");
		bPass = Toolkits.md5Password(bPass);
		try {
			List<Business> list = businessService.loginBusiness(bName, bUser, bPass);
			if(list.size() > 0) {
				String cookieKey = UUID.randomUUID().toString();
				putBusinessIntoCache(cookieKey, list.get(0));
				Cookie cookie = new Cookie("u_key", cookieKey);
				cookie.setMaxAge(30 * 60 * 1000);// 保存30分钟
				// 设置域名cookie
				String domain = getDomain(request);
				cookie.setDomain(domain);
				cookie.setPath("/"); // 使用根
				response.addCookie(cookie);
				json.put("isok", true);
				json.put("msg", "登录成功");
				
				return json;
			}
			json.put("isok", false);
			json.put("msg", "登录失败，账号或密码错误");
		} catch (Exception e) {
			json.put("isok", false);
			json.put("msg", "登录出错" + e.getMessage());
			e.printStackTrace();
		}
		return json;
	}
	private void putBusinessIntoCache(String key, Business b) {
		synchronized (cache) {
			cache.put(key, b);
		}
	}
	private static String getDomain(HttpServletRequest request) {
		String domainName = null;
		String serverName = request.getRequestURL().toString();
		if (serverName == null || serverName.equals("")) {
			domainName = "";
		} else {
			serverName = serverName.toLowerCase();
			// 去除http://或者https://
			if (serverName.startsWith("http")) {
				serverName = serverName.substring(7);
			} else {
				serverName = serverName.substring(8);
			}
			// xxx.xxx.xxx/uri
			final int end = serverName.indexOf("/");
			// 去除uri部分
			serverName = serverName.substring(0, end);
			final String[] domains = serverName.split("\\.");
			int len = domains.length;
			if (len > 3) {
				// www.xxx.com.cn 设置后三层为域名
				domainName = domains[len - 3] + "." + domains[len - 2] + "."
						+ domains[len - 1];
			} else if (len <= 3 && len > 1) {
				// xxx.com or xxx.cn
				domainName = domains[len - 2] + "." + domains[len - 1];
			} else {
				domainName = serverName;
			}
		}
		// 去端口
		int portIdx = -1;
		if (domainName != null && (portIdx = domainName.indexOf(":")) > 0) {
			domainName = domainName.substring(0, portIdx);
		}
		return domainName;
	}
	private void setAjaxContentType(HttpServletResponse response) {
		response.setContentType("application/json;charset=UTF-8");
		response.setCharacterEncoding("utf-8");
	}
}
