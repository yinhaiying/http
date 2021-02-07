/* 
通过tcp来实现服务器处理POST请求。
*/


const net = require("net");
/** 
 * 
 * 创建一个tcp服务器，每当有客户端来连接了，就会为它创建一个socket，通过socket套接字来进行对话
 * 
 * 
 * */  
/* 
请求报文：请求时传递过来的内容。
GET / get?id=1&name=2 HTTP/1.1\r\n
Host: 127.0.0.1:8080\r\n
Connection: keep-alive\r\n
Pragma: no-cache\r\n
Cache-Control: no-cache\r\n
name: hi\r\n
age: 11\r\n
\r\n
 */
/* 

响应报文：
HTTP / 1.1 200 OK
Content-Type:text/plain
Date: Sat, 06 Feb 2021 03: 20: 43 GMT
Connection: keep-alive
Content-Length: 0
*/
const Parser = require("./Parser");
const server = net.createServer(socket => {
  socket.on("data",(data) => {
      console.log("这里执行了吗11111........",data)
      // 解析请求
      let parser = new Parser();
      let {method,url,headers,body} = parser.parse(data);
      console.log("method:",method);
      console.log("url:",url);
      console.log("headers:", headers);
      // 处理响应
      let rows = [];
      rows.push(`HTTP/1.1 200 OK`);
      rows.push(`Date: ${new Date().toGMTString() }`);
      rows.push(`Content-Type: application/json`);
      rows.push(`Transfer-Encoding: chunked`);
      rows.push(`Content-Length: ${Buffer.byteLength(body)}`);// 返回字符串的字节长度
      rows.push(`\r\n${Buffer.byteLength(body).toString(16)}\r\n${body}\r\n0`);
      let response = rows.join("\r\n");
      console.log("response.........");
      console.log(response);
      socket.end(response);  // 发送给客户端
  })
});

server.listen(8081);