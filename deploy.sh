# /bin/bash
NAME=sso
UPLOAD_NAME=sso

BASE_PATH=/var/www/$NAME
TOMCAT_HOME=/home/ajie/tomcat
USER_DIR=/var/www/$NAME/$UPLOAD_NAME
TOMCAT_USER_DIR=$TOMCAT_HOME/webapps/$NAME
TOMCAT_WEBAPPS=$TOMCAT_HOME/webapps

#判断有没有上传文件
if [ ! -d $USER_DIR ] ; then
	echo $USER_DIR not exit
	exit 1
fi

#删除旧的备份
if [ -d $BASE_PATH/${NAME}.old ];then
	rm -rf $BASE_PATH/${NAME}.old
	echo deletting ${NAME}.old...
fi

#关闭tomcat
$TOMCAT_HOME/bin/shutdown.sh
echo -e "shutdown tomcat . \c"
sleep 1 #等待3秒，等tomcat关闭
echo -e ".\c" 
sleep 1
echo -e "."

#将原来的项目打包备份，作版本异常回滚使用
if [ -d  $TOMCAT_USER_DIR ];then
	mv  $TOMCAT_USER_DIR $BASE_PATH/${NAME}.old
	echo "moving $TOMCAT_USER_DIR to $BASE_PATH/${NAME}.old"

	
fi

#将配置文件复制到项目中 如果项目中的配置有改变 那么需要手动在/var/www/项目名/properties/下面找到对应的配置进行修改
# 进入配置文件夹
cd $BASE_PATH/properties
echo '路径切换至'
pwd
#for file in `ls $BASE_PATH/properties`
for file in `ls`
do
    if test -d $file;then
	     # 文件夹
		 cp -rf $file $USER_DIR/WEB-INF/classes/
	else
		cp -f $file $USER_DIR/WEB-INF/classes/
	fi
	echo "coping $file to $USER_DIR/WEB-INF/classes"
done

#将上传的项目重命名
#将项目移到tomcat下的webapps
mv $BASE_PATH/$UPLOAD_NAME $TOMCAT_WEBAPPS/$NAME
echo "moving $BASE_PATH/$NAME to  $TOMCAT_WEBAPPS/"

#重启tomcat
$TOMCAT_HOME/bin/startup.sh
echo "done"
