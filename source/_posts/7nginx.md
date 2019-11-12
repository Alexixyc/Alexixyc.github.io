---
title: Nginx 👀
tags:
  - study notes
date: 2019-10-10 14:38:28
updated: 2019-11-3 20:45:31
categories: study notes #文章分类
---
<img src="./nginx.png" width="600px">
由于在近期工作中，前端微服务项目需要自己写一些静态资源访问的相关Nginx配置，而作为前端开发人员，对Nginx这块技术一直缺乏比较系统的了解，所以在这里抽空整理了一些Nginx相关的基本知识。
<!-- more -->
---

## Nginx基本概念
Nginx 是一款轻量级、高性能、跨平台的Web服务器。
- 更快：在正常情况下，单次请求会得到更快的响应；在高峰期（如有数以万计的并发请求），`Nginx`可以比其他Web服务器更快地响应请求。
- 高扩展性：设计极具扩展性，它完全是由多个不同功能、不同层次、不同类型且耦合度极低的模块组成。
- 高可靠性：`Nginx`的高可靠性来自于其核心框架代码的优秀设计、模块设计的简单性。
- 低内存消耗：10000个非活跃的`HTTP` `Keep-Alive`连接在`Nginx`中仅消耗2.5MB的内存。
- 高并发：单机支持10万以上的并发连接。
- 热部署：`master`管理进程与`worker`工作进程的分离设计，使得`Nginx`能够提供热部署功能，即可以在7×24小时不间断服务的前提下，升级`Nginx`的可执行文件。


Nginx常用功能：**HTTP反向代理服务器**、**负载均衡服务器**。

## 反向代理

### 正向代理 ( ForwordProxy )

正向代理是一个位于客户端和目标服务器之间的代理服务器，客户端向代理服务器发送一个请求，并且**指定目标服务器**，然后代理服务器向目标服务器转交并将获得的数据返回给客户端，正向代理需要客户端进行一些特殊的设置。

<img src="./zxdl.jpg" width="350px">

> - 正向代理需要客户端**主动设置代理服务器**ip或者域名进行访问，由设置的服务器ip或者域名去获取内容并返回；
> - 正向代理是**代理客户端**，为客户端收发请求。使真实客户端对服务器不可见；
> - 翻墙（VPN）

### 反向代理 ( ReverseProxy )

反向代理是代理服务端，对于客户端来说，反向代理的过程是一个黑盒。客户端发送请求到代理服务器，代理服务器来决定具体请求哪个目标服务器，并将请求转交给客户端，客户端并不会感知到反向代理后面的服务，甚至可以将反向代理服务器当做真正的目标服务器，不需要客户端做任何的设置。

<img src="./fxdl.jpg" width="350px">

> - 反向代理不需要客户端做任何设置，直接访问真实的ip或域名，服务器内部会决定最终访问哪台真实的服务器机器；
> - 反向代理是**代理服务器端**，为服务器收发请求，使真实服务器对客户端不可见；
> - 保护和隐藏原始资源服务器 / 负载均衡 / 缓存静态内容 / 外网发布 / (webpack-devServer proxy)

## 负载均衡

负载均衡 ( Load Balancing ) 是高可用架构的一个关键组件，主要用来提高性能和可用性，通过负载均衡将流量分发到多个服务器，同时多服务器能够消除这部分的单点故障。

<img src="./load_balancer.jpg" width="400px">

但负载均衡器本身就是一个单点故障隐患，其中一个解决方案就是双机热备。

<img src="./hot_standby.gif" width="400px">

## Master-Worker模式

<img src="./master_worker.jpg" width="400px">

Nginx启动后，会有一个`master`进程和多个相互独立的`worker`进程。
- 其中，master进程负责读取并验证配置文件`nginx.conf`、管理`worker`进程、接收来自外界的信号，向各`worker`进程发送信号（每个进程都有可能来处理这个连接）、监控`worker`进程的运行状态，当`worker`进程退出后(异常情况下)，会自动启动新的`worker`进程。
- 而每一个`worker`进程负责维护一个线程（避免线程切换）、处理连接和请求。`worker`进程的个数由配置文件决定，一般会设置成机器`cpu`核数，有利于进程切换（因为更多的worker 数，只会导致进程相互竞争 cpu，从而带来不必要的上下文切换）。


## 常用配置

Nginx配置文件分为几个部分：
- 全局块：配置影响Nginx全局的指令。例如：运行nginx服务器的用户组，nginx进程运行文件存放地址，日志存放路径，配置文件引入，允许生成worker process进程数等。
- events块：配置影响nginx服务器或与用户的网络连接。有每个进程的最大连接数，选取哪种事件驱动模型处理连接请求，是否允许同时接受多个网路连接，开启多个网络连接序列化等。
- http块：可以嵌套多个server，配置代理，缓存，日志定义等绝大多数功能和第三方模块的配置。如文件引入，mime-type定义，日志自定义，是否使用sendfile传输文件，连接超时时间，单连接请求数等。
- server块：配置虚拟主机的相关参数，一个http中可以有多个server。
- location块：配置请求的路由，以及各种页面的处理情况。

```js
# 全局块
...              
# events块
events {         
   ...
}
# http块
http      
{
    # http全局块
    ...   
    # 虚拟主机server块
    server        
    { 
        # server全局块
        ...       
        # location块
        location [PATTERN]   
        {
            ...
        }
        location [PATTERN] 
        {
            ...
        }
    }
    server
    {
      ...
    }
    # http全局块
    ...     
}
```

### 虚拟主机与请求的分发(sever)
由于IP地址的数量有限，因此经常存在多个主机域名对应着同一个IP地址的情况，这时在`nginx.conf`中就可以按照`server_name`（对应用户请求中的主机域名）并通过`server`块来定义**虚拟主机**，每个`server`块就是一个**虚拟主机**，它只处理与之相对应的主机域名请求。这样，一台服务器上的Nginx就能以不同的方式处理访问不同主机域名的HTTP请求了。 

#### 监听端口
监听端口: 决定Nginx服务如何监听端口。
```js
server {
  listen 80; // 默认
}
```

#### 主机名称
主机名称，在开始处理一个HTTP请求时，Nginx会取出header头中的Host，与每个server中的server_name进行匹配，以此决定到底由哪一个server块来处理这个请求。
```js
server {
  server_name www.domain1.com;
}
```

#### URI路径匹配
`location`会尝试根据用户请求中的URI来和配置进行匹配，如果匹配到了对应的`location`块，就选择用`location{}`块中的配置来处理用户这次请求。
- `=` 表示匹配URI时，是完全匹配：
```js 
location = /feature {
  // 只有当请求是/feature时，才会匹配成功
}
```
- `~` 表示匹配URI时是字母大小写敏感的;
- `~*` 表示匹配URI时忽略字母大小写;
- `^~` 表示匹配URI时只需要其前半部分与uri参数匹配即可：
```js
location ^~ /images/ {
  // 所有images开头的都会匹配到，例如/images/activity
}
```
- 还可以使用正则匹配：
```js
location ~* \.(gif|jpg|png)$ {
  // 匹配以.gif/.jpg/.png结尾的请求
}
```
- 匹配所有请求：
```js
location / {
  // 可以匹配所有请求
  // 由于匹配是根据配置的顺序从上往下找的，所以`location / {}`一般写在最后
}
```

### 文件路径的定义

#### 资源根目录
- 以root方式设置资源路径（根目录）
```js
location /download/ {
  root /home/app/;
}
```
在上面的配置中，如果有一个请求的URI是`/download/main.html`，那么Web服务器将会返回服务器上`/home/app/download/main.html`文件的内容。

- 以alias方式设置资源路径（别名）
alias也是用来设置文件资源路径的，它与root的不同点主要在于如何解读紧跟location后面的uri参数，下面配置，请求URI是`/conf/nginx.conf`，但实际访问的文件是`usr/local/nginx/conf/nginx.conf`的内容
```js
location conf {
  alias usr/local/nginx/conf/;
}
// 用root的方法：
location conf {
  root usr/local/nginx/;
}
```

- 访问首页
若访问站点的URI是/，这时一般是返回网站的首页，而这与root和alias都不同，这里用ngx_http_index_module模块提供的index配置实现。index后可以跟多个文件参数，Nginx将会按照顺序来尝试访问这些文件。
```js
location {
  root path;
  index index.html htmlindex.php /index.php;
}
```

- 根据HTTP返回码重定向页面
当对于某个请求返回错误码时，如果匹配上了error_page中设置的code，则重定向到新的URI中：
```js
error_page 404 404.html;
error_page 502 503 504 50x.html;
error_page 403 http://example.com/forbidden.html

location / {
  error_page 404 @fallback; // 返回404的请求会被反向代理到http://backend 上游服务器中
}
location @fallback {
  proxy_pass http://backend;
}
// @表示仅用于Nginx服务内部请求之间的重定向，带有@的location不直接处理用户请求。
```

- try_files
try_files后要跟若干路径，如path1 path2...，而且最后必须要有uri参数，意义如下：尝试按照顺序访问每一个path，如果可以有效地读取，就直接向用户返回这个path对应的文件结束请求，否则继续向下访问。如果所有的path都找不到有效的文件，就重定向到最后的参数uri上。因此，最后这个参数uri必须存在，而且它应该是可以有效重定向的。
```js
try_files main.html $uri $uri/index.html $uri.html @other;
location @other {
  proxy_pass http://backend;
}
```

### 负载均衡基本配置
- upstream块
upstream块定义了一个上游服务器的集群，便于反向代理中的proxy_pass使用，例如：
```js
upstream backend {
  server backend1.example.com;
  server backend2.example.com;
  server backend3.example.com;
}
server {
  location / {
    proxy_pass http://backend;
  }
}
```

- server块
server配置项指定了一台上游服务器的名字，这个名字可以是域名、IP地址端口、UNIX句柄等，在其后还可以跟一些参数。
```js
upstream backend {
  server backend1.example.com weight=5; // 向这台上游服务器转发的权重
  server 127.0.0.1:8080 max_fails=3 fail_timeout=30s; // 在fail_timeout时间段内，如果向当前的上游服务器转发失败次数超过max_fails次，则认为在当前的fail_timeout时间段内这台上游服务器不可用。
}
```

### 反向代理的基本配置
- proxy_pass
此配置项将当前请求反向代理到URL参数指定的服务器上，URL可以是主机名或IP地址加端口的形式：

- proxy_method
设置转发时的协议方法名

- proxy_hide_header
任意地指定哪些HTTP头部字段不能被转发

- proxy_pass_header
与proxy_hide_header功能相反，proxy_pass_header会将原来禁止转发的header设置为允许转发

- proxy_pass_request_body
作用为确定是否向上游服务器发送HTTP包体部分, on/off, 默认on

- proxy_pass_request_headers
是否转发HTTP头部, on/off, 默认on

- proxy_set_header
是Nginx设置请求头信息给上游服务器;(注意与add_header区分)

```js
proxy_pass http://localhost:8000/uri/;
proxy_method POST;
proxy_hide_header Cache-Control;
proxy_pass_header X-Accel-Redirect;
proxy_pass_request_body on;
proxy_pass_request_headers on;
```

### 添加响应头
- add_header 将自定义的头信息的添加到响应头，是设置给浏览器；
```js
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
```

## 收获
经过这段时间查阅相关文章和书籍，对Nginx有了更多的了解，对反向代理 && 负载均衡也有了一个更具象化的认知，对Nginx的一些常用的配置有了更进一步的了解。


> **参考文献:**
> *https://zhuanlan.zhihu.com/p/34943332*
> *https://www.jianshu.com/p/208c02c9dd1d*
> *https://zhuanlan.zhihu.com/p/24524057*
> *[《深入理解Nginx模块开发与架构解析第2版》](https://artislong.oss-cn-hangzhou.aliyuncs.com/files/%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3Nginx%E6%A8%A1%E5%9D%97%E5%BC%80%E5%8F%91%E4%B8%8E%E6%9E%B6%E6%9E%84%E8%A7%A3%E6%9E%90%E7%AC%AC2%E7%89%88.pdf)*