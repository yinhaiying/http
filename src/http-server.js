

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { rawListeners } = require("process");



// 创建一个http服务器
const server = http.createServer((req, res) => {
  console.log("111", req.url)
  const { pathname } = url.parse(req.url);
  console.log(pathname)
  if (["/get.html", "/post.html"].includes(pathname)) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.setHeader("xxx", "yyy");  // 设置响应头
    let content = fs.readFileSync(path.join(__dirname, "static", pathname.slice(1)));
    res.write(content);  // 向客户端写入内容
    res.end();  // 结束这次响应。
  } else if (pathname === "/get") {
    console.log("req.header", req.headers);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.write("hello");
    res.end();
  } 
  // else if (pathname === "/post") {
  //   // 客户端发送数据可能是一段一段地进行发送
  //   // tcp传输的时候，有可能会分包，因为发送的数据如果很大，可能会被切割成很多次进行发送
  //   // 以防止其中一段出错，导致整个发送失败。比如10M大小的数据，可能分成10次，每次发送1M。
  //   let buffers = [];
  //   req.on("data", (data) => {
  //     buffers.push(data)
  //   });

  //   req.on("end", () => {
  //     let body = Buffer.concat(buffers);
  //     res.statusCode = 200;
  //     res.setHeader("Content-Type", "text/plain");
  //     res.write(body);
  //     res.end();
  //   })


  // }
   else {
    res.statusCode = 404;
    res.end();
  }
});


server.listen(8080);
