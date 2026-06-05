create database if not exists network_internship
  default character set utf8mb4
  collate utf8mb4_unicode_ci;

use network_internship;

drop table if exists application_layer_points;
drop table if exists transport_layer_points;
drop table if exists network_layer_points;
drop table if exists datalink_layer_points;
drop table if exists physical_layer_points;
drop table if exists tcpip_layers;

create table tcpip_layers (
  id varchar(32) primary key,
  name varchar(40) not null,
  function_text text not null,
  protocols varchar(255) not null,
  devices varchar(255) not null,
  data_unit varchar(80) not null,
  sort_order int not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table application_layer_points (
  id bigint primary key auto_increment,
  title varchar(80) not null,
  category varchar(40) not null,
  summary varchar(255) not null,
  detail text not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table transport_layer_points (
  id bigint primary key auto_increment,
  title varchar(80) not null,
  category varchar(40) not null,
  summary varchar(255) not null,
  detail text not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table network_layer_points (
  id bigint primary key auto_increment,
  title varchar(80) not null,
  category varchar(40) not null,
  summary varchar(255) not null,
  detail text not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table datalink_layer_points (
  id bigint primary key auto_increment,
  title varchar(80) not null,
  category varchar(40) not null,
  summary varchar(255) not null,
  detail text not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table physical_layer_points (
  id bigint primary key auto_increment,
  title varchar(80) not null,
  category varchar(40) not null,
  summary varchar(255) not null,
  detail text not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

insert into tcpip_layers
  (id, name, function_text, protocols, devices, data_unit, sort_order)
values
  ('application', '应用层', '为用户应用程序提供网络服务，定义应用进程之间交换报文的规则。', 'HTTP,DNS,FTP,SMTP', 'Web 服务器,DNS 服务器,FTP 服务器', '报文 Message', 1),
  ('transport', '传输层', '提供端到端进程通信、可靠传输、流量控制和拥塞控制等能力。', 'TCP,UDP', '主机端系统', '报文段 Segment / 用户数据报 Datagram', 2),
  ('network', '网络层', '负责逻辑寻址、路由选择和跨网络的数据包转发。', 'IP,ICMP,ARP', '路由器,三层交换机', '数据包 Packet', 3),
  ('datalink', '数据链路层', '在相邻节点之间传输帧，完成成帧、差错检测和 MAC 地址转发。', 'Ethernet,PPP,ARP', '交换机,网卡', '帧 Frame', 4),
  ('physical', '物理层', '负责比特流在传输介质上的编码、调制和传输。', '以太网物理规范,Wi-Fi 物理层', '集线器,中继器,双绞线,光纤', '比特 Bit', 5);

insert into application_layer_points
  (title, category, summary, detail)
values
  ('HTTP', '协议', '超文本传输协议，用于浏览器和 Web 服务器之间传输网页资源。', 'HTTP 基于请求-响应模型，常运行在 TCP 之上。典型字段包括 Method、URL、Host、Status Code 等。'),
  ('DNS', '协议', '域名系统，用于将域名解析为 IP 地址。', 'DNS 查询可以利用缓存、递归查询和迭代查询减少解析延迟，是 Web 访问前的重要步骤。'),
  ('FTP', '协议', '文件传输协议，用于客户端和服务器之间上传或下载文件。', 'FTP 通常包含控制连接和数据连接，控制连接负责命令交互，数据连接负责文件内容传输。');

insert into transport_layer_points
  (title, category, summary, detail)
values
  ('TCP', '协议', '面向连接的可靠传输协议。', 'TCP 通过三次握手建立连接，使用序号、确认、重传、滑动窗口和拥塞控制保证可靠传输。'),
  ('UDP', '协议', '无连接的轻量级传输协议。', 'UDP 不保证可靠性，但开销小、时延低，常用于 DNS、视频、语音和实时应用。'),
  ('端口号', '地址', '端口号用于标识主机上的应用进程。', '传输层通过源端口和目的端口实现进程到进程通信，例如 HTTP 常用 80 端口，HTTPS 常用 443 端口。');

insert into network_layer_points
  (title, category, summary, detail)
values
  ('IP 地址', '地址', '用于标识网络中的主机或接口。', 'IPv4 地址通常采用点分十进制表示，并结合子网掩码判断目标是否在同一网段。'),
  ('路由转发', '机制', '路由器根据目的 IP 查询路由表并选择下一跳。', '路由转发会逐跳进行，每经过一个路由器 IP 首部中的 TTL 通常减 1。'),
  ('ICMP', '协议', '网络层控制报文协议。', 'ICMP 常用于差错报告和网络诊断，例如 ping 命令使用 ICMP Echo Request 和 Echo Reply。');

insert into datalink_layer_points
  (title, category, summary, detail)
values
  ('MAC 地址', '地址', '网卡的硬件地址，用于局域网中的二层转发。', '交换机根据源 MAC 学习端口映射，根据目的 MAC 决定定向转发或泛洪。'),
  ('交换机转发', '机制', '交换机维护 MAC 地址表并转发以太网帧。', '目的 MAC 未知时交换机会泛洪；目的 MAC 已知时交换机会定向转发。'),
  ('以太网帧', '数据单位', '以太网在数据链路层传输的基本单位。', '以太网帧通常包含目的 MAC、源 MAC、类型字段、数据字段和 FCS 校验字段。');

insert into physical_layer_points
  (title, category, summary, detail)
values
  ('比特传输', '基础概念', '将 0 和 1 转换为电信号、光信号或无线电信号进行传输。', '物理层关注接口标准、传输速率、编码方式、传输介质和信号衰减等问题。'),
  ('传输介质', '设备/介质', '常见介质包括双绞线、同轴电缆、光纤和无线信道。', '不同介质在带宽、距离、抗干扰能力和成本方面存在差异。'),
  ('编码方式', '机制', '编码方式定义比特如何映射为物理信号。', '合理的线路编码可以帮助接收端同步时钟、降低误码率并提升传输可靠性。');
