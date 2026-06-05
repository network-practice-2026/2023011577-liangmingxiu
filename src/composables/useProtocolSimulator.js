import { computed, ref } from 'vue'

const protocolScenarios = {
  dns: {
    title: 'DNS 域名解析',
    domain: 'www.abc.com',
    nodes: [
      { id: 'client', label: '客户端', subLabel: '192.168.1.10', x: 90, y: 210, type: 'host' },
      { id: 'dns', label: 'DNS 服务器', subLabel: '192.168.1.53', x: 320, y: 90, type: 'server' },
      { id: 'root', label: '根/权威 DNS', subLabel: 'Internet', x: 570, y: 90, type: 'server' },
      { id: 'web', label: 'Web 服务器', subLabel: '93.184.216.34', x: 570, y: 300, type: 'server' }
    ],
    links: [
      ['client', 'dns'],
      ['dns', 'root'],
      ['root', 'web'],
      ['dns', 'web']
    ],
    steps: [
      {
        name: '初始状态',
        description: '客户端准备访问 www.abc.com，当前 DNS 缓存为空，等待用户发起请求。',
        path: [],
        packet: { type: '', content: '', srcIp: '', dstIp: '' },
        tables: {
          dnsCache: [],
          address: []
        }
      },
      {
        name: '输入域名并检查本地缓存',
        description: '用户在浏览器输入 www.abc.com，客户端先查询本地 DNS 缓存，没有命中后准备向本地域名服务器发起查询。',
        path: ['client'],
        packet: { type: 'DNS Cache Lookup', content: 'Q: www.abc.com ?', srcIp: '192.168.1.10', dstIp: 'Local Cache' },
        tables: {
          dnsCache: [{ domain: 'www.abc.com', ip: '未命中', ttl: '-' }],
          address: [{ device: '客户端', mac: 'AA-AA-AA-AA-AA-01', ip: '192.168.1.10' }]
        }
      },
      {
        name: '客户端发送 DNS 查询',
        description: '客户端向本地域名服务器发送 DNS 查询报文，请求解析目标域名对应的 IP 地址。',
        path: ['client', 'dns'],
        packet: { type: 'DNS Query', content: 'Q: www.abc.com ?', srcIp: '192.168.1.10', dstIp: '192.168.1.53' },
        tables: {
          dnsCache: [{ domain: 'www.abc.com', ip: '未命中', ttl: '-' }],
          address: [{ device: 'DNS 服务器', mac: 'BB-BB-BB-BB-BB-53', ip: '192.168.1.53' }]
        }
      },
      {
        name: 'DNS 服务器递归查询',
        description: '本地域名服务器缓存未命中，继续向上级 DNS 服务器查询，逐步获得 www.abc.com 的解析结果。',
        path: ['dns', 'root', 'web'],
        packet: { type: 'Recursive Query', content: 'Resolve www.abc.com', srcIp: '192.168.1.53', dstIp: 'Internet DNS' },
        tables: {
          dnsCache: [{ domain: 'www.abc.com', ip: '查询中', ttl: '-' }],
          address: [{ device: '权威 DNS', mac: 'Internet', ip: '上级 DNS' }]
        }
      },
      {
        name: '返回解析结果并写入缓存',
        description: 'DNS 服务器获得目标 IP 后向客户端返回响应，客户端将域名和 IP 的映射写入缓存，后续访问可直接命中。',
        path: ['dns', 'client'],
        packet: { type: 'DNS Response', content: 'www.abc.com -> 93.184.216.34', srcIp: '192.168.1.53', dstIp: '192.168.1.10' },
        tables: {
          dnsCache: [{ domain: 'www.abc.com', ip: '93.184.216.34', ttl: '300s' }],
          address: [{ device: 'Web 服务器', mac: 'CC-CC-CC-CC-CC-34', ip: '93.184.216.34' }]
        },
        result: 'DNS 解析完成，客户端获得 www.abc.com 的 IP 地址 93.184.216.34。'
      }
    ]
  },
  arp: {
    title: 'ARP 地址解析',
    nodes: [
      { id: 'source', label: '源主机 H1', subLabel: '192.168.1.10', x: 90, y: 220, type: 'host' },
      { id: 'switch', label: '交换机 S', subLabel: '二层转发', x: 330, y: 220, type: 'switch' },
      { id: 'target', label: '目标主机 H2', subLabel: '192.168.1.20', x: 570, y: 220, type: 'host' },
      { id: 'other', label: '其他主机', subLabel: '192.168.1.30', x: 330, y: 80, type: 'host' }
    ],
    links: [
      ['source', 'switch'],
      ['switch', 'target'],
      ['switch', 'other']
    ],
    steps: [
      {
        name: '初始状态',
        description: '源主机 H1 已知目标 IP 192.168.1.20，但 ARP 缓存表和交换机 MAC 表均为空。',
        path: [],
        packet: { type: '', content: '', srcMac: '', dstMac: '' },
        tables: {
          arp: [],
          mac: []
        }
      },
      {
        name: '准备发送数据但缺少目标 MAC',
        description: '源主机 H1 已知目标 IP 为 192.168.1.20，但 ARP 缓存表为空，无法直接封装以太网帧。',
        path: ['source'],
        packet: { type: 'ARP Cache Lookup', content: 'Who has 192.168.1.20?', srcMac: 'AA-AA-AA-AA-AA-01', dstMac: '未知' },
        tables: {
          arp: [{ ip: '192.168.1.20', mac: '未找到', interface: '-' }],
          mac: [{ port: 'F0/1', mac: '学习中', device: 'H1' }]
        }
      },
      {
        name: '发送 ARP Request 广播',
        description: 'H1 构造 ARP Request，以广播 MAC FF-FF-FF-FF-FF-FF 发送，询问谁拥有目标 IP。',
        path: ['source', 'switch', 'target', 'other'],
        packet: { type: 'ARP Request', content: 'Who has 192.168.1.20? Tell 192.168.1.10', srcMac: 'AA-AA-AA-AA-AA-01', dstMac: 'FF-FF-FF-FF-FF-FF' },
        tables: {
          arp: [{ ip: '192.168.1.20', mac: '等待应答', interface: '-' }],
          mac: [{ port: 'F0/1', mac: 'AA-AA-AA-AA-AA-01', device: 'H1' }]
        }
      },
      {
        name: '目标主机返回 ARP Reply',
        description: 'H2 发现请求的 IP 与自己一致，向 H1 单播返回自己的 MAC 地址。',
        path: ['target', 'switch', 'source'],
        packet: { type: 'ARP Reply', content: '192.168.1.20 is BB-BB-BB-BB-BB-02', srcMac: 'BB-BB-BB-BB-BB-02', dstMac: 'AA-AA-AA-AA-AA-01' },
        tables: {
          arp: [{ ip: '192.168.1.20', mac: 'BB-BB-BB-BB-BB-02', interface: 'eth0' }],
          mac: [
            { port: 'F0/1', mac: 'AA-AA-AA-AA-AA-01', device: 'H1' },
            { port: 'F0/2', mac: 'BB-BB-BB-BB-BB-02', device: 'H2' }
          ]
        }
      },
      {
        name: '写入 ARP 缓存并可发送数据帧',
        description: 'H1 将 IP 与 MAC 的映射写入 ARP 缓存，之后发往 H2 的数据帧可以直接单播。',
        path: ['source', 'switch', 'target'],
        packet: { type: 'Ethernet Frame', content: 'Data to 192.168.1.20', srcMac: 'AA-AA-AA-AA-AA-01', dstMac: 'BB-BB-BB-BB-BB-02' },
        tables: {
          arp: [{ ip: '192.168.1.20', mac: 'BB-BB-BB-BB-BB-02', interface: 'eth0' }],
          mac: [
            { port: 'F0/1', mac: 'AA-AA-AA-AA-AA-01', device: 'H1' },
            { port: 'F0/2', mac: 'BB-BB-BB-BB-BB-02', device: 'H2' }
          ]
        },
        result: 'ARP 解析完成，H1 已获得 H2 的 MAC 地址，后续通信改为单播转发。'
      }
    ]
  }
}

export function useProtocolSimulator(initialProtocol = 'dns') {
  const activeProtocolKey = ref(initialProtocol)
  const currentStepIndex = ref(0)
  const isPlaying = ref(false)
  const animationTick = ref(0)
  let timer = null

  const availableProtocols = computed(() =>
    Object.entries(protocolScenarios).map(([key, scenario]) => ({
      key,
      title: scenario.title
    }))
  )

  const scenario = computed(() => protocolScenarios[activeProtocolKey.value])
  const steps = computed(() => scenario.value.steps)
  const currentStep = computed(() => steps.value[currentStepIndex.value])
  const isLastStep = computed(() => currentStepIndex.value >= steps.value.length - 1)

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
    isPlaying.value = true
    triggerAnimation()
    timer = window.setInterval(() => {
      if (isLastStep.value) {
        stop()
        return
      }
      nextStep()
    }, 1800)
  }

  function selectProtocol(protocolKey) {
    if (!protocolScenarios[protocolKey]) return
    activeProtocolKey.value = protocolKey
    reset()
  }

  function getPacketAnimationPath() {
    return currentStep.value.path
  }

  return {
    activeProtocolKey,
    availableProtocols,
    scenario,
    currentStepIndex,
    currentStep,
    isLastStep,
    isPlaying,
    animationTick,
    selectProtocol,
    start,
    nextStep,
    reset,
    getPacketAnimationPath
  }
}
