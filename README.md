# 将前端部署到Amplify
1. 新建一台EC2或用上一部分的EC2，AMI：Amazon Linux2023，t2.large或以上机型。
2. vim ec2-dependencies.sh 把以下内容拷入：
```bash
#!/bin/bash
CURRENT_DIR=\$(cd \$(dirname \$0); pwd)
FILE_NAME=node-v20.9.0-linux-x64
wget https://nodejs.org/dist/v20.9.0/\${FILE_NAME}.tar.xz
tar -xvf \${FILE_NAME}.tar.xz
cd \${FILE_NAME}/bin
./node -v
sudo ln -s \${CURRENT_DIR}/\${FILE_NAME}/bin/node /usr/local/bin/node
sudo ln -s \${CURRENT_DIR}/\${FILE_NAME}/bin/npm /usr/local/bin/npm
echo 'Install Node Success'
sudo node -v
```
3. bash ./ec2-dependencies.sh 执行代码
4. 代码文件拷入，解压。
5. 配置环境变量（代码跟目录执行 vim .env)：REACT_APP_BACKEND_API_KEY,REACT_APP_BACKEND_URL,REACT_APP_USE_LOGIN , like
```bash
[ec2-user@ip-172-*-*-85 code-review-front]$ cat .env
REACT_APP_BACKEND_API_KEY=*****78gpMZCzu
REACT_APP_BACKEND_URL=﻿ https://******.execute-api.us-west-2.amazonaws.com/prod/﻿
REACT_APP_USE_LOGIN=True
```
6. 代码根目录执行
```bash
cd code-review-front
npm install && npm run build
cd build
zip -r build.zip .
```

# Amplify配置
1. 创建新应用
2. 上传build.zip (建议启用密码保护)
3. 访问地址：https://staging.*******amplifyapp.com

# UI features
The customer initiates a code review result query to Amplify (for example, http(s)://xxx.com/reviewList?project=a&branch=dev&commit_id=abc123).

Where ﻿ xxx.com﻿ is the domain name assigned after successful deployment of Amplify
- URL param project is the project name which you want to default search.
- URL param branch is the branch name which you want to default search.
- URL param commit_id is the commit Id which you want to default search.
The above three parameters are optional, you can fill in any one or two of them. If not filled in, it means that this condition will not be restricted and filtered.

# 访问入口
- 代码审查门户：https://xxx.amplifyapp.com/reviewList
- 示例URL：https://xxx.com/reviewList?project=aaa1754138/neomutt&branch=main&commit_id=ed2592e9aca4d5847613c88d7e44479eb95de3c2
- 文件审查页面：https://xxx.amplifyapp.com/reviewFiles

