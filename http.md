# http的实现

## 请求数据的处理
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

## 响应数据的处理
当socket建立连接以后，它会监听data中的数据，也就是响应的数据。响应数据包括两个部分：
响应首部和响应主体，两者之间通过一个空行(CR+CF)隔开。我们要做的就是从这部分数据中，获取到我们想要的
数据，比如status,responseHeader等，然后赋值到xhr对象的这些属性身上。


```js
const socket = this.socket = net.createConnection({
    hostname,
    port
},() => {
    // 连接成功之后可以监听服务器的数据 
    socket.on("data",(data) => {
    data = data.toString();
    console.log("data",data);
    // 响应头部和响应主体之间通过空行隔开。
    let [response,bodyRows] = data.split("\r\n\r\n");
    // 响应头部由响应行和响应头组成。
    let [statusLine,...headerRows] = response.split("\r\n");   // 第一个是状态行，第二个是响应头各种首部部分。
    let [,status,statusText] = statusLine.split(" ");
    this.status = status;
    this.statusText = statusText;
    this.reaponseHeaders = headerRows.reduce((memo,row) => {
        let [key,value] = row.split(": ");
        memo[key] = value;
        return memo;
    },{});
    console.log("responseHeaders:",this.reaponseHeaders);

    // 处理响应体： 响应体由三部分组成：响应长度，响应内容，和响应结束标志
    let [,body,] = bodyRows.split("\r\n");
    this.response = this.responseText = body;
    // 处理完毕就可以调用onload了。
    this.onload && this.onload();
    })
});

```

