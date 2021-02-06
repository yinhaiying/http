# http的实现

## 请求报文
发送请求时，我们需要构造一个请求报文，也就是如下所示的字符串：
```js
GET /get?id =1&name=2 HTTP/1.1     // 请求行
Host: 127.0.0.1: 8080
Connection: keep - alive
Pragma: no-cache
Cache-Control: no-cache
name: hi
age: 11                            // 以及请求头组成的各种首部字段
```
请求行中的信息