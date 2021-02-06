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
请求行中的信息通过传入的url来实现。请求头的信息，通过在send中实现，如下所示：
```js
send(){
    // send方法是需要把request header中的内容发送出去。
    //   debugger
    let rows = [];
    rows.push(`${this.method} ${this.url} HTTP/1.1`);
    rows.push(...Object.keys(this.headers).map((key) => {
        return `${key}: ${this.headers[key]}`;
    }));
    let request = rows.join("\r\n")+"\r\n\r\n";
    console.log("request:",request);
    this.socket.write(request);
}
```
我们最终请求其实就是把这一段大的字符串发送到后台服务器。