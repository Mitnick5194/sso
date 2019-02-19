package com.ajie.sso;

import com.alibaba.fastjson.JSONArray;

/**
 * 执行jar包安装脚本
 *
 * @author niezhenjie
 *
 */
public class Main {

	public static void main(String[] args) {
		// sso-user模块打包
		/*String cmd = "mvn install:install-file -Dfile=D:\\myworkspace\\sso\\target\\user\\sso-user.jar -DgroupId=com.ajie -DartifactId=sso-user -Dversion=1.0.20 -Dpackaging=jar";
		try {
			String ret = WindowCmd.execCmd(cmd);
			//System.out.println(ret);
		} catch (IOException e) {
			e.printStackTrace();
		}*/

		String str = "[\"a\",\"vds\"]";
		JSONArray parseArray = JSONArray.parseArray(str);
		System.out.println(parseArray.size());

	}
}
