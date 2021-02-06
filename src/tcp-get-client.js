
/* 
通过tcp传输层协议中的net来实现浏览器的XMLHttpRequest。代替浏览器发送请求。
*/

const net = require("net");   // tcp传输层协议
const _url = require("url");

const ReadyState = {
    "UNSENT": 0,               //  代理被创建，但尚未调用 open() 方法
    "OPENED": 1,               //  open() 方法已经被调用。
    "HEADERS_RECEIVED": 2,     //  send() 方法已经被调用，并且头部和状态已经可获得。
    "LOADING": 3,              //  下载中； responseText 属性已经包含部分数据。
    "DONE":4,                  // 下载操作已完成。
}


class XMLHttpRequest{
    constructor(){
        this.readyState = ReadyState.UNSENT;   // 默认是初始化的，未调用open方法。
        this.onReadyStateChange && this.onReadyStateChange();
        this.headers = {
            "Connection":"keep-alive"
        };   // 请求头，用于设置。
    }
    open(method,url){
        this.method = method || "GET";
        this.url = url;
        // http:127.0.0.1:8080/get?id=1    
        // hostname: 127.0.0.1
        // port:8080
        // path:/get
        let { hostname,port,path} = _url.parse(url);
        this.hostname = hostname;
        this.port = port;
        this.path = path;
        this.headers["Host"] =`${hostname}:${port}`;
        // 通过传输层的net模块发起请求，请求成功之后执行回调。
        const socket = this.socket = net.createConnection({
            hostname,
            port
        },() => {
          // 连接成功之后可以监听服务器的数据 
          socket.on("data",(data) => {
            data = data.toString();
            console.log("data",data);
            let [response,bodyRows] = data.split("\r\n\r\n");
            // 处理响应
            let [statusLine,...headerRows] = response.split("\r\n");   // 第一个是状态行，第二个是响应头部分。
            let [,status,statusText] = statusLine.split(" ");
            this.status = status;
            this.statusText = statusText;
            this.reaponseHeaders = headerRows.reduce((memo,row) => {
             let [key,value] = row.split(": ");
             memo[key] = value;
             return memo;
            },{});
            // console.log("responseHeaders:",this.reaponseHeaders);
            // send() 方法已经被调用，并且头部和状态已经可获得。已经能够获取到响应头和响应状态。
            this.readyState = ReadyState.HEADERS_RECEIVED;
            this.onReadyStateChange && this.onReadyStateChange();



            // 处理响应体： 响应体由三部分组成：响应长度，响应内容，和响应结束标志
            let [, body, ] = bodyRows.split("\r\n");
            // 下载中； responseText 属性已经包含部分数据。已经能够获取到响应体。
            this.readyState = ReadyState.LOADING;
            this.onReadyStateChange && this.onReadyStateChange();
            this.response = this.responseText = body;
            // 下载操作已完成。
            this.readyState = ReadyState.DONE;
            this.onReadyStateChange && this.onReadyStateChange();
            // 处理完毕就可以调用onload了。
            this.onload && this.onload();
          })
        });
        
        // open方法被调用，readyState状态被改变。
        this.readyState = ReadyState.OPENED;
        this.onReadyStateChange && this.onReadyStateChange();
    }
    setRequestHeader(header,value){
      this.headers[header] = value;
    }
    send(){
      // send方法是需要把request header中的内容发送出去。
      let rows = [];
      rows.push(`${this.method} ${this.url} HTTP/1.1`);
      rows.push(...Object.keys(this.headers).map((key) => {
          return `${key}: ${this.headers[key]}`;
      }));
      let request = rows.join("\r\n")+"\r\n\r\n";
    //   console.log("request:",request);
      this.socket.write(request);
    }
    // 获取所有的response header值
    getAllResponseHeaders(){
        let result = "";
        for(let key in this.reaponseHeaders){
            result += `${key}:${this.reaponseHeaders[key]}`; 
        };
        return result;
    }
    // 获取reaponse header的某一个值
    getResponseHeader(key){
        return this.reaponseHeaders[key]
    }
    // onReadyStateChange(){
    //   console.log("查看readyState111:", this.readyState);
    // }
}


/* *
    Request
        GET / get ? id = 1 & name = 2 HTTP / 1.1
        Host: 127.0 .0 .1: 8080
        Connection: keep - alive
        Pragma: no - cache
        Cache - Control: no - cache
        name: hi
        age: 11
        User - Agent: Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 88.0 .4324 .146 Safari / 537.36
*/

/* 

Response 
HTTP / 1.1 200 OK
Content - Type: text / plain
Date: Sat, 06 Feb 2021 03: 20: 43 GMT
Connection: keep - alive
Content - Length: 0

5   // 长度
hello
0   // 结束
注意： 这里5上面有两次换行，这是一个分隔标志，上面是响应头，下面是响应体。
*/





let xhr = new XMLHttpRequest();
xhr.open("GET", "http://127.0.0.1:8080/get?id=1&name=2");
xhr.onReadyStateChange = () => {
    console.log("onReadyStateChange11111", xhr.readyState)
};

xhr.responseType = "text";
xhr.setRequestHeader("name", "hi");
xhr.setRequestHeader("age", 11);
xhr.onload = function () {
    // console.log("status", xhr.status);
    // console.log("statusText", xhr.statusText);
    // console.log("response-header", xhr.getAllResponseHeaders());
    // console.log("response-body", xhr.response);
}

xhr.send();