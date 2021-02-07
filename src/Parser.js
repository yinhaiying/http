/* 
使用状态机来解析请求，获取到请求行，请求头，请求体。
状态机：就是状态的转移，一种状态转向另外一种状态。
类似于编译原理的方式实现编译post请求对流式数据的处理。
*/

const LF = 10;     // 换行   Line Feed
const CR = 13;     // 回车   Carriage Return
const SPACE = 32;  // 空格
const COLON = 58;  // 冒号

let INIT = 0;                // 未解析
let START = 1;               // 开始解析
let REQUEST_LINE = 2;         // 解析到请求行
let HEADER_FIELD_START = 3;   // 开始处理请求头,遇到请求头字段  比如HOST
let HEADER_FIELD = 4;         // 请求头字段处理结束
let HEADER_VALUE_START = 5;   // 遇到请求头字段的值开始，比如  127.0.0.1
let HEADER_VALUE = 6;         // 请求头字段的值处理结束
let BODY = 7;                 // 处理请求体 


/* 
为什么在实际实现中不能使用split来分割请求报文，因为数据的传输是流式的，是不连续的，而且可能很大。
比如来个1万行，要分割一万次这就太消耗内存了。因此，最好的办法就是一个字一个字处理。区分请求行，请求头字段，请求头字段的值以及请求体。
*/

class Parser {
  constructor(){
      this.state = INIT;
  }
  parse(buffer){
    let self = this;
    let requestLine = "";   // 请求行
    let headers = {};       // 请求头对象
    let body = "";
    let i = 0; 
    let char;  // 当前字符
    let headerField = "";   // 请求行字段
    let headerValue = "";   // 请求行字段的值
    let state = START;
    // 开始处理
    state = START;
    console.log('data:',buffer)
    for(i = 0;i < buffer.length;i++){
      char = buffer[i];
      switch(state){
        case START:
            state = REQUEST_LINE;
            self["requestLineMark"] = i;  // 记录一下请求行开始的索引
        case REQUEST_LINE:
            // POST /post HTTP/1.1
            if(char === CR){
                //只有碰到换行才表示请求行结束
                requestLine = buffer.toString("utf-8",self["requestLineMark"],i);
                console.log("requestLine:",requestLine);
                break;
            }else if(char === LF){
                // \n 说明进入请求头解析部分了
                state = HEADER_FIELD_START;
            };
            break;
        case HEADER_FIELD_START:
            //Host: 127.0.0.1   碰到冒号：表示请求头字段结束
            if(char === CR){
                console.log("这里什么时候会执行：",char)
              //如果是回车，说明后面应该是请求体。
              // 可能已经是请求体最后一个字段了，后面直接又是一个回车，也就是说进入请求体了。
              state = BODY;

              //\r\n
              //{name:"post请求"}
              self["bodyMark"] = i+2;  // 然后取值取到循环结束即可。
              break;
            }else{
                // 如果不是请求体，那么就开始请求头字段的解析
                state = HEADER_FIELD;
                self["headerFieldMark"] = i; // Host中H的索引
            }
            // 不要break，直接往下走
        case HEADER_FIELD:
            // 读取请求头字段
            if (char === COLON) {
            //Host: 127.0.0.1   碰到冒号：表示请求头字段结束
              headerField = buffer.toString("utf-8", self["headerFieldMark"], i);
              state = HEADER_VALUE_START;
            }
             break;
        case HEADER_VALUE_START:
            if(char === SPACE){
                break;
            }
            self["headerValueMark"] = i;
            state = HEADER_VALUE;
            break;
        case HEADER_VALUE:
            // 读取请求头字段的值 Host: 127.0.0.1:8080\r\n  
            if(char === CR){
                // 当读取到\r
                headerValue = buffer.toString("utf-8",self["headerValueMark"],i);
                headers[headerField] = headerValue;
                headerField = headerValue = "";
            }else if(char === LF){
                state = HEADER_FIELD_START;
            }
            break;
        default:
            break;
      }
    }

    let [method,url] = requestLine.split(" ");
    console.log("self.bodyMark:",self.bodyMark,i);
    body = buffer.toString("utf-8", self["bodyMark"]);
    console.log("body:",body)
    return {method,url,headers,body}
  }
}


/* 
POST /post HTTP/1.1\r\n
Host: 127.0.0.1\r\n
Connection: keep - alive
Pragma: no - cache
Cache - Control: no - cache
\r\n
{name:"post请求"}
*/


module.exports = Parser;