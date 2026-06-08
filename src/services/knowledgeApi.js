const STORAGE_KEY = 'network-knowledge-store'

const defaultStore = {
  layers: [
    {
      id: 'application',
      name: '应用层',
      functionText: '为用户应用程序提供网络服务，定义应用进程之间交换报文的规则。',
      protocols: ['HTTP', 'DNS', 'FTP', 'SMTP'],
      devices: ['Web 服务器', 'DNS 服务器', 'FTP 服务器'],
      dataUnit: '报文 Message',
      points: [
        {
          id: 'app-http',
          title: 'HTTP',
          category: '协议',
          summary: '超文本传输协议，用于浏览器和 Web 服务器之间传输网页资源。',
          detail: 'HTTP 基于请求-响应模型，常运行在 TCP 之上。典型字段包括 Method、URL、Host、Status Code 等。'
        },
        {
          id: 'app-dns',
          title: 'DNS',
          category: '协议',
          summary: '域名系统，用于将域名解析为 IP 地址。',
          detail: 'DNS 查询可以利用缓存、递归查询和迭代查询减少解析延迟，是 Web 访问前的重要步骤。'
        }
      ]
    },
    {
      id: 'transport',
      name: '传输层',
      functionText: '提供端到端进程通信、可靠传输、流量控制和拥塞控制等能力。',
      protocols: ['TCP', 'UDP'],
      devices: ['主机端系统'],
      dataUnit: '报文段 Segment / 用户数据报 Datagram',
      points: [
        {
          id: 'trans-tcp',
          title: 'TCP',
          category: '协议',
          summary: '面向连接的可靠传输协议。',
          detail: 'TCP 通过三次握手建立连接，使用序号、确认、重传、滑动窗口和拥塞控制保证可靠传输。'
        },
        {
          id: 'trans-udp',
          title: 'UDP',
          category: '协议',
          summary: '无连接的轻量级传输协议。',
          detail: 'UDP 不保证可靠性，但开销小、时延低，常用于 DNS、视频、语音和实时应用。'
        }
      ]
    },
    {
      id: 'network',
      name: '网络层',
      functionText: '负责逻辑寻址、路由选择和跨网络的数据包转发。',
      protocols: ['IP', 'ICMP', 'ARP'],
      devices: ['路由器', '三层交换机'],
      dataUnit: '数据包 Packet',
      points: [
        {
          id: 'net-ip',
          title: 'IP 地址',
          category: '地址',
          summary: '用于标识网络中的主机或接口。',
          detail: 'IPv4 地址通常采用点分十进制表示，并结合子网掩码判断目标是否在同一网段。'
        },
        {
          id: 'net-router',
          title: '路由转发',
          category: '机制',
          summary: '路由器根据目的 IP 查询路由表并选择下一跳。',
          detail: '路由转发会逐跳进行，每经过一个路由器 IP 首部中的 TTL 通常减 1。'
        }
      ]
    },
    {
      id: 'datalink',
      name: '数据链路层',
      functionText: '在相邻节点之间传输帧，完成成帧、差错检测和 MAC 地址转发。',
      protocols: ['Ethernet', 'PPP', 'ARP'],
      devices: ['交换机', '网卡'],
      dataUnit: '帧 Frame',
      points: [
        {
          id: 'link-mac',
          title: 'MAC 地址',
          category: '地址',
          summary: '网卡的硬件地址，用于局域网中的二层转发。',
          detail: '交换机根据源 MAC 学习端口映射，根据目的 MAC 决定定向转发或泛洪。'
        },
        {
          id: 'link-switch',
          title: '交换机转发',
          category: '机制',
          summary: '交换机维护 MAC 地址表并转发以太网帧。',
          detail: '目的 MAC 未知时交换机会泛洪；目的 MAC 已知时交换机会定向转发。'
        }
      ]
    },
    {
      id: 'physical',
      name: '物理层',
      functionText: '负责比特流在传输介质上的编码、调制和传输。',
      protocols: ['以太网物理规范', 'Wi-Fi 物理层'],
      devices: ['集线器', '中继器', '双绞线', '光纤'],
      dataUnit: '比特 Bit',
      points: [
        {
          id: 'phy-bit',
          title: '比特传输',
          category: '基础概念',
          summary: '将 0 和 1 转换为电信号、光信号或无线电信号进行传输。',
          detail: '物理层关注接口标准、传输速率、编码方式、传输介质和信号衰减等问题。'
        },
        {
          id: 'phy-media',
          title: '传输介质',
          category: '设备/介质',
          summary: '常见介质包括双绞线、同轴电缆、光纤和无线信道。',
          detail: '不同介质在带宽、距离、抗干扰能力和成本方面存在差异。'
        }
      ]
    }
  ]
}

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function readLocalStore() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const initial = clone(defaultStore)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(raw)
}

function writeLocalStore(store) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

async function requestJson(endpoint, options) {
  const response = await fetch(endpoint, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchKnowledgeLayers() {
  return clone(readLocalStore().layers)
}

export async function createKnowledgePoint(layerId, point) {
  try {
    return await requestJson(`/api/knowledge/layers/${layerId}/points`, {
      method: 'POST',
      body: JSON.stringify(point)
    })
  } catch (error) {
    const store = readLocalStore()
    const layer = store.layers.find((item) => item.id === layerId)
    const created = { ...point, id: `${layerId}-${Date.now()}` }
    layer.points.unshift(created)
    writeLocalStore(store)
    return created
  }
}

export async function updateKnowledgePoint(layerId, point) {
  try {
    return await requestJson(`/api/knowledge/layers/${layerId}/points/${point.id}`, {
      method: 'PUT',
      body: JSON.stringify(point)
    })
  } catch (error) {
    const store = readLocalStore()
    const layer = store.layers.find((item) => item.id === layerId)
    const index = layer.points.findIndex((item) => item.id === point.id)
    if (index >= 0) {
      layer.points[index] = { ...point }
      writeLocalStore(store)
    }
    return point
  }
}

export async function deleteKnowledgePoint(layerId, pointId) {
  try {
    await requestJson(`/api/knowledge/layers/${layerId}/points/${pointId}`, {
      method: 'DELETE'
    })
  } catch (error) {
    const store = readLocalStore()
    const layer = store.layers.find((item) => item.id === layerId)
    layer.points = layer.points.filter((item) => item.id !== pointId)
    writeLocalStore(store)
  }
}
