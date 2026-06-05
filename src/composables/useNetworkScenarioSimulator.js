import { computed, ref } from 'vue'

const nodes = [
  { id: 'h1', label: 'H1', subLabel: '192.168.1.10', x: 80, y: 235, type: 'host' },
  { id: 'h2', label: 'H2', subLabel: '192.168.1.20', x: 235, y: 95, type: 'host' },
  { id: 'dns', label: '本地域名服务器', subLabel: '192.168.1.53', x: 235, y: 355, type: 'server' },
  { id: 's', label: '交换机 S', subLabel: '以太网交换机', x: 395, y: 235, type: 'switch' },
  { id: 'r', label: '路由器 R', subLabel: '192.168.1.1', x: 565, y: 235, type: 'router' },
  { id: 'internet', label: 'Internet', subLabel: '公网', x: 725, y: 150, type: 'cloud' },
  { id: 'web', label: 'Web 服务器', subLabel: '203.0.113.80', x: 725, y: 330, type: 'server' }
]

const links = [
  ['h1', 's'],
  ['h2', 's'],
  ['dns', 's'],
  ['s', 'r'],
  ['r', 'internet'],
  ['internet', 'web']
]

const switchTable = {
  empty: [],
  h1: [{ port: 'F0/1', mac: 'H1-MAC', device: 'H1' }],
  h1Dns: [
    { port: 'F0/1', mac: 'H1-MAC', device: 'H1' },
    { port: 'F0/3', mac: 'DNS-MAC', device: 'DNS' }
  ],
  h1DnsR: [
    { port: 'F0/1', mac: 'H1-MAC', device: 'H1' },
    { port: 'F0/3', mac: 'DNS-MAC', device: 'DNS' },
    { port: 'F0/4', mac: 'R-MAC', device: 'R' }
  ]
}

const arpTable = {
  empty: [],
  dnsPending: [{ ip: '192.168.1.53', mac: '等待应答', device: '本地域名服务器' }],
  dnsReady: [{ ip: '192.168.1.53', mac: 'DNS-MAC', device: '本地域名服务器' }],
  gatewayPending: [
    { ip: '192.168.1.53', mac: 'DNS-MAC', device: '本地域名服务器' },
    { ip: '192.168.1.1', mac: '等待应答', device: '默认网关 R' }
  ],
  gatewayReady: [
    { ip: '192.168.1.53', mac: 'DNS-MAC', device: '本地域名服务器' },
    { ip: '192.168.1.1', mac: 'R-MAC', device: '默认网关 R' }
  ]
}

const steps = [
  {
    name: 'H1 查询本地域名服务器的 MAC 地址',
    endpoint: 'H1 -> 局域网广播',
    protocol: 'ARP',
    castType: '广播',
    srcMac: 'H1-MAC',
    dstMac: 'FF-FF-FF-FF-FF-FF',
    srcIp: '192.168.1.10',
    dstIp: '192.168.1.53',
    path: ['h1', 's', 'h2', 'dns', 'r'],
    switchAction: '交换机 S 收到 H1 发出的广播帧，学习源 MAC=H1-MAC 位于 F0/1，并向除入端口外的其他端口泛洪。',
    purpose: 'H1 准备向本地域名服务器发送 DNS 查询，但当前 ARP 表为空，需要先获得 DNS 服务器的 MAC 地址。',
    frame: 'ARP Request: Who has 192.168.1.53? Tell 192.168.1.10',
    switchTable: switchTable.h1,
    arpTable: arpTable.dnsPending
  },
  {
    name: '本地域名服务器返回 ARP 应答',
    endpoint: '本地域名服务器 -> H1',
    protocol: 'ARP',
    castType: '单播',
    srcMac: 'DNS-MAC',
    dstMac: 'H1-MAC',
    srcIp: '192.168.1.53',
    dstIp: '192.168.1.10',
    path: ['dns', 's', 'h1'],
    switchAction: '交换机 S 学习 DNS-MAC 位于 F0/3，查表后将应答帧定向转发到 H1 所在端口 F0/1。',
    purpose: 'DNS 服务器告知 H1 自己的 MAC 地址，使 H1 能够封装发往 DNS 服务器的单播帧。',
    frame: 'ARP Reply: 192.168.1.53 is DNS-MAC',
    switchTable: switchTable.h1Dns,
    arpTable: arpTable.dnsReady
  },
  {
    name: 'H1 向本地域名服务器发送 DNS 查询',
    endpoint: 'H1 -> 本地域名服务器',
    protocol: 'DNS',
    castType: '单播',
    srcMac: 'H1-MAC',
    dstMac: 'DNS-MAC',
    srcIp: '192.168.1.10',
    dstIp: '192.168.1.53',
    path: ['h1', 's', 'dns'],
    switchAction: '交换机 S 根据目的 MAC=DNS-MAC 查询交换表，将 DNS 查询帧定向转发到 F0/3。',
    purpose: 'H1 查询 www.abc.com 对应的 Web 服务器 IP 地址。',
    frame: 'DNS Query: www.abc.com A ?',
    switchTable: switchTable.h1Dns,
    arpTable: arpTable.dnsReady
  },
  {
    name: '本地域名服务器返回 DNS 解析结果',
    endpoint: '本地域名服务器 -> H1',
    protocol: 'DNS',
    castType: '单播',
    srcMac: 'DNS-MAC',
    dstMac: 'H1-MAC',
    srcIp: '192.168.1.53',
    dstIp: '192.168.1.10',
    path: ['dns', 's', 'h1'],
    switchAction: '交换机 S 根据目的 MAC=H1-MAC 查询交换表，将 DNS 响应帧定向转发到 F0/1。',
    purpose: 'H1 获得 www.abc.com 的 IP 地址，为后续访问 Web 服务器做准备。',
    frame: 'DNS Response: www.abc.com -> 203.0.113.80',
    switchTable: switchTable.h1Dns,
    arpTable: arpTable.dnsReady
  },
  {
    name: 'H1 查询默认网关 R 的 MAC 地址',
    endpoint: 'H1 -> 局域网广播',
    protocol: 'ARP',
    castType: '广播',
    srcMac: 'H1-MAC',
    dstMac: 'FF-FF-FF-FF-FF-FF',
    srcIp: '192.168.1.10',
    dstIp: '192.168.1.1',
    path: ['h1', 's', 'h2', 'dns', 'r'],
    switchAction: '交换机 S 收到广播帧后继续泛洪，已有的 H1 与 DNS 表项保持不变。',
    purpose: 'Web 服务器位于 Internet 中，不在 H1 所属网段，H1 必须把报文交给默认网关 R。',
    frame: 'ARP Request: Who has 192.168.1.1? Tell 192.168.1.10',
    switchTable: switchTable.h1Dns,
    arpTable: arpTable.gatewayPending
  },
  {
    name: '路由器 R 返回 ARP 应答',
    endpoint: '路由器 R -> H1',
    protocol: 'ARP',
    castType: '单播',
    srcMac: 'R-MAC',
    dstMac: 'H1-MAC',
    srcIp: '192.168.1.1',
    dstIp: '192.168.1.10',
    path: ['r', 's', 'h1'],
    switchAction: '交换机 S 学习 R-MAC 位于 F0/4，并根据 H1-MAC 将 ARP Reply 定向转发到 F0/1。',
    purpose: 'H1 获得默认网关的 MAC 地址，之后可以将发往 Internet 的 IP 数据报封装进目的 MAC 为 R-MAC 的以太网帧。',
    frame: 'ARP Reply: 192.168.1.1 is R-MAC',
    switchTable: switchTable.h1DnsR,
    arpTable: arpTable.gatewayReady
  },
  {
    name: 'H1 与 Web 服务器完成 TCP 建连准备',
    endpoint: 'H1 -> Web 服务器',
    protocol: 'TCP',
    castType: '单播',
    srcMac: 'H1-MAC',
    dstMac: 'R-MAC',
    srcIp: '192.168.1.10',
    dstIp: '203.0.113.80',
    path: ['h1', 's', 'r', 'internet', 'web'],
    switchAction: '交换机 S 看到目的 MAC=R-MAC，查表后把帧转发给路由器 R；路由器再将 IP 数据报转发到 Internet。',
    purpose: '浏览器访问 HTTP 服务前需要建立到 Web 服务器的 TCP 连接。此阶段表示连接已准备完成，可发送 HTTP 请求。',
    frame: 'TCP Segment: SYN / SYN-ACK / ACK',
    switchTable: switchTable.h1DnsR,
    arpTable: arpTable.gatewayReady
  },
  {
    name: 't1：交换机 S 第一次收到封装 HTTP 请求的以太网帧',
    endpoint: 'H1 -> 路由器 R -> Internet Web 服务器',
    protocol: 'HTTP over TCP/IP',
    castType: '单播',
    srcMac: 'H1-MAC',
    dstMac: 'R-MAC',
    srcIp: '192.168.1.10',
    dstIp: '203.0.113.80',
    path: ['h1', 's', 'r', 'internet', 'web'],
    switchAction: '交换机 S 第一次收到封装 HTTP 请求报文的以太网帧，依据目的 MAC=R-MAC 查询交换表，并将该帧从 F0/4 转发给路由器 R。',
    purpose: 'H1 正式发出浏览器访问 www.abc.com 的 HTTP 请求，题目要求的 t0 到 t1 过程到此结束。',
    frame: 'Ethernet Frame carrying IP/TCP/HTTP: GET / HTTP/1.1 Host: www.abc.com',
    switchTable: switchTable.h1DnsR,
    arpTable: arpTable.gatewayReady,
    result: '最终结论：从 t0 到 t1，H1 先通过 ARP 获得 DNS 服务器 MAC，完成 DNS 解析；再通过 ARP 获得默认网关 MAC；随后将发往 Web 服务器的 HTTP 请求封装为目的 MAC=R-MAC 的以太网帧。t1 时刻，交换机 S 第一次收到该封装 HTTP 请求的以太网帧。'
  }
]

export function useNetworkScenarioSimulator() {
  const currentStepIndex = ref(0)
  const isPlaying = ref(false)
  const animationTick = ref(0)
  let timer = null

  const currentStep = computed(() => steps[currentStepIndex.value])
  const isLastStep = computed(() => currentStepIndex.value >= steps.length - 1)
  const scenario = { nodes, links }

  function stop() {
    isPlaying.value = false
    if (timer) {
      window.clearInterval(timer)
      timer = null
    }
  }

  function triggerAnimation() {
    animationTick.value += 1
  }

  function nextStep() {
    if (isLastStep.value) {
      stop()
      return
    }
    currentStepIndex.value += 1
    triggerAnimation()
  }

  function reset() {
    stop()
    currentStepIndex.value = 0
    triggerAnimation()
  }

  function start() {
    stop()
    if (isLastStep.value) return
    isPlaying.value = true
    triggerAnimation()
    timer = window.setInterval(() => {
      if (isLastStep.value) {
        stop()
        return
      }
      nextStep()
    }, 1900)
  }

  return {
    scenario,
    steps,
    currentStepIndex,
    currentStep,
    isLastStep,
    isPlaying,
    animationTick,
    start,
    nextStep,
    reset
  }
}
