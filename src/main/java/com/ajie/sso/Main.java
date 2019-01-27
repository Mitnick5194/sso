package com.ajie.sso;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import com.ajie.chilli.utils.WindowCmd;

/**
 * 执行jar包安装脚本
 *
 * @author niezhenjie
 *
 */
public class Main {

	public static void main(String[] args) {
		// sso-user模块打包
		String cmd = "mvn install:install-file -Dfile=D:\\myworkspace\\sso\\target\\user\\sso-user.jar -DgroupId=com.ajie -DartifactId=sso-user -Dversion=1.0.20 -Dpackaging=jar";
		try {
			String ret = WindowCmd.execCmd(cmd);
			//System.out.println(ret);
		} catch (IOException e) {
			e.printStackTrace();
		}

	}
}
