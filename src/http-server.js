

const http =require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { rawListeners } = require("process");



// 创建一个http服务器
const server = http.createServer((req,res) => {
  console.log("111",req.url)
  const {pathname} = url.parse(req.url);
  console.log(pathname)
  if (["/get.html"].includes(pathname)) {
    res.statusCode = 200;
    res.setHeader("Content-Type","text/html");
    res.setHeader("xxx","yyy");  // 设置响应头
    let content = fs.readFileSync(path.join(__dirname,"static","get.html"));
    res.write(content);  // 向客户端写入内容
    res.end();  // 结束这次响应。
  } else if (pathname === "/get") {
    console.log("req.header",req.headers);
    res.statusCode = 200;
    res.setHeader("Content-Type","text/plain");
    res.write("hello");
    res.end();
  }else{
      res.statusCode = 404;
      res.end();
  }
});


server.listen(8080);