#通过安装可以任意指定名字
mvn install:install-file -Dfile=D:\myworkspace\sso\target\user\sso-user-1.0.10.jar -DgroupId=com.ajie -DartifactId=sso-user -Dversion=1.0.10 -Dpackaging=jar
 
 #复制源码
copy /Y D:\myworkspace\sso\target\user\sso-user-resource-1.0.10.jar D:\maven\repository\com\ajie\sso-user\1.0.10\sso-user-resource-1.0.10.jar
#因为sso-user不需要修改前缀（build包插件输出的jar包一定要带上项目名的作为前缀），所以执行将install完成的jar包输出到仓库路径即可不用执行上面的操作
