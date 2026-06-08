<template>
  <section class="knowledge-graph">
    <div class="graph-canvas">
      <VChart
        :option="graphOption"
        autoresize
        style="height: 520px; width: 100%;"
        @click="handleChartClick"
      />
    </div>

    <aside class="graph-detail">
      <p class="eyebrow">节点详情</p>
      <h2>{{ detailTitle }}</h2>
      <p>{{ detailText }}</p>
      <dl v-if="selectedNode?.type === 'point' && selectedNode.point">
        <dt>所属层</dt>
        <dd>{{ layerName(selectedNode.layerId) }}</dd>
        <dt>分类</dt>
        <dd>{{ selectedNode.point.category }}</dd>
        <dt>摘要</dt>
        <dd>{{ selectedNode.point.summary }}</dd>
        <dt>说明</dt>
        <dd>{{ selectedNode.point.detail }}</dd>
      </dl>
      <dl v-else-if="selectedNode?.type === 'layer'">
        <dt>主要功能</dt>
        <dd>{{ selectedNode.functionText || '' }}</dd>
        <dt>常见协议</dt>
        <dd>{{ (selectedNode.protocols || []).join(' · ') }}</dd>
        <dt>数据单位</dt>
        <dd>{{ selectedNode.dataUnit || '' }}</dd>
      </dl>
    </aside>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  nodes: { type: Array, required: true },
  links: { type: Array, required: true },
  selectedNode: { type: Object, default: null }
})

const emit = defineEmits(['select-node'])

// ── compute tree positions ──────────────────────────────────────────
function computeLayout(nodes, links) {
  const root = nodes.find(n => n.type === 'root')
  const layers = nodes.filter(n => n.type === 'layer')
  const points = nodes.filter(n => n.type === 'point')

  const CW = 900  // canvas logical width
  const ROOT_Y = 50
  const LAYER_Y = 180
  const POINT_Y_START = 310
  const POINT_Y_GAP = 72

  const result = []

  // root at top center
  if (root) result.push({ ...root, x: CW / 2, y: ROOT_Y })

  // layers evenly spaced
  const colW = CW / layers.length
  layers.forEach((l, i) => {
    result.push({ ...l, x: colW * i + colW / 2, y: LAYER_Y })
  })

  // points under their parent layer
  const pointsByLayer = {}
  for (const p of points) {
    if (!pointsByLayer[p.layerId]) pointsByLayer[p.layerId] = []
    pointsByLayer[p.layerId].push(p)
  }
  layers.forEach((l, i) => {
    const cx = colW * i + colW / 2
    const lp = pointsByLayer[l.id] || []
    lp.forEach((p, j) => {
      result.push({ ...p, x: cx - 40 + (j % 3) * 40, y: POINT_Y_START + Math.floor(j / 3) * POINT_Y_GAP })
    })
  })

  return result
}

// ── ECharts option ───────────────────────────────────────────────────
const graphOption = computed(() => {
  const nodes = computeLayout(props.nodes, props.links)
  const isSelected = props.selectedNode?.id

  // category colors
  const catColors = {
    root: '#f5a623',
    layer: '#2f80ed',
    point: '#50c878'
  }
  const layerColors = [
    '#2f80ed', '#27ae60', '#f2994a', '#9b51e0', '#eb5757'
  ]

  function nodeColor(n) {
    if (n.type === 'root') return catColors.root
    if (n.type === 'layer') return n.color || catColors.layer
    return (n.color || catColors.point) + 'cc'
  }

  function nodeSize(n) {
    if (n.type === 'root') return 44
    if (n.type === 'layer') return 32
    return 20
  }

  function nodeLabel(n) {
    if (n.type === 'root') return n.label
    if (n.type === 'layer') return n.label
    return n.label.length > 6 ? n.label.slice(0, 6) + '…' : n.label
  }

  const data = nodes.map((n, idx) => ({
    id: n.id,
    name: n.label,
    symbolSize: nodeSize(n),
    x: n.x,
    y: n.y,
    itemStyle: {
      color: nodeColor(n),
      borderColor: isSelected === n.id ? '#fff' : 'rgba(255,255,255,0.7)',
      borderWidth: isSelected === n.id ? 3 : 1.5,
      shadowBlur: isSelected === n.id ? 18 : 6,
      shadowColor: isSelected === n.id ? nodeColor(n) : 'rgba(0,0,0,0.18)',
      shadowOffsetY: 2
    },
    label: {
      show: true,
      formatter: nodeLabel(n),
      fontSize: n.type === 'root' ? 14 : n.type === 'layer' ? 12 : 10,
      fontWeight: 'bold',
      color: n.type === 'root' ? '#5c3d0e' : n.type === 'layer' ? '#fff' : '#435363',
      position: n.type === 'point' ? 'right' : 'inside'
    },
    category: n.type === 'root' ? 0 : n.type === 'layer' ? 1 : 2,
    _raw: n
  }))

  const edges = props.links.map(l => ({
    source: l.from,
    target: l.to,
    lineStyle: {
      color: '#c8d6e5',
      opacity: 0.6,
      curveness: 0.2,
      width: 1.5
    }
  }))

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#e0e6ed',
      borderWidth: 1,
      padding: [14, 18],
      textStyle: { color: '#2c3e50', fontSize: 13 },
      extraCssText: 'border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,0.12); max-width: 300px;',
      formatter(params) {
        if (params.dataType === 'node' && params.data?._raw) {
          const n = params.data._raw
          if (n.type === 'root') {
            return `<b style="font-size:15px;">${n.label}</b><br/>
              <span style="color:#8899aa;">TCP/IP 五层模型知识体系</span>`
          }
          if (n.type === 'layer') {
            const proto = (n.protocols || []).join(' · ')
            return `<b style="font-size:15px;">${n.label}</b><br/>
              <span style="color:#607080;">${n.functionText || ''}</span><br/>
              <span style="color:#8899aa;">协议: ${proto || '-'}</span>
              <span style="color:#8899aa;"> | 数据单位: ${n.dataUnit || '-'}</span>`
          }
          if (n.point) {
            return `<b style="font-size:15px;">${n.point.title}</b><br/>
              <span style="color:#607080;">${n.point.summary || ''}</span><br/>
              <span style="color:#8899aa;">分类: ${n.point.category || '-'}</span>`
          }
        }
        return params.name
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      draggable: true,
      animation: true,
      animationDuration: 1000,
      animationEasingUpdate: 'cubicInOut',
      categories: [
        { name: '根节点', itemStyle: { color: catColors.root } },
        { name: '层次', itemStyle: { color: catColors.layer } },
        { name: '知识点', itemStyle: { color: catColors.point } }
      ],
      data,
      links: edges,
      force: {
        initLayout: 'circular',
        repulsion: 280,
        gravity: 0.08,
        edgeLength: [90, 220],
        layoutAnimation: true,
        friction: 0.6
      },
      label: {
        show: true,
        fontSize: 11,
        fontWeight: 'bold'
      },
      emphasis: {
        focus: 'adjacency',
        itemStyle: { borderWidth: 3, shadowBlur: 20 },
        lineStyle: { width: 3, opacity: 0.9 }
      },
      edgeSymbol: ['none', 'none'],
      lineStyle: {
        color: '#c8d6e5',
        curveness: 0.2,
        opacity: 0.55,
        width: 1.5
      }
    }]
  }
})

function handleChartClick(params) {
  if (params.dataType === 'node' && params.data?._raw) {
    emit('select-node', params.data._raw)
  }
}

// ── detail panel helpers ────────────────────────────────────────────
const detailTitle = computed(() => props.selectedNode?.label || '计算机网络')

const detailText = computed(() => {
  if (!props.selectedNode || props.selectedNode.type === 'root') {
    return '知识图谱以计算机网络为根节点，向下展开 TCP/IP 五层模型和各层知识点。点击节点查看详情，拖拽可重新布局，滚轮缩放。'
  }
  if (props.selectedNode.type === 'layer') {
    return props.selectedNode.functionText || 'TCP/IP 模型中的核心层次。'
  }
  return props.selectedNode.point?.detail || ''
})

function layerName(layerId) {
  const map = {
    application: '应用层', transport: '传输层', network: '网络层',
    datalink: '数据链路层', physical: '物理层'
  }
  return map[layerId] || layerId
}
</script>

<style scoped>
.graph-canvas {
  min-width: 0;
  overflow: hidden;
  border-radius: 10px;
}
</style>
