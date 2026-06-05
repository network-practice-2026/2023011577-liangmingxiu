<template>
  <section class="knowledge-graph">
    <div class="graph-canvas">
      <VChart
        :option="graphOption"
        autoresize
        style="height: 480px; width: 100%;"
        @click="handleChartClick"
      />
    </div>

    <aside class="graph-detail">
      <p class="eyebrow">节点详情</p>
      <h2>{{ detailTitle }}</h2>
      <p>{{ detailText }}</p>
      <dl v-if="selectedNode?.point">
        <dt>分类</dt>
        <dd>{{ selectedNode.point.category }}</dd>
        <dt>摘要</dt>
        <dd>{{ selectedNode.point.summary }}</dd>
        <dt>说明</dt>
        <dd>{{ selectedNode.point.detail }}</dd>
      </dl>
    </aside>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  nodes: {
    type: Array,
    required: true
  },
  links: {
    type: Array,
    required: true
  },
  selectedNode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-node'])

const graphOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params) => {
      if (params.dataType === 'node' && params.data) {
        const d = params.data
        if (d._raw?.point) {
          return `<b>${d.name}</b><br/>${d._raw.point.summary || ''}`
        }
        if (d._raw?.type === 'layer') {
          return `<b>${d.name}</b><br/>${d._raw.functionText || 'TCP/IP 模型层次'}`
        }
        return `<b>${d.name}</b>`
      }
      return ''
    }
  },
  series: [{
    type: 'graph',
    layout: 'force',
    roam: true,
    draggable: true,
    animationDuration: 800,
    animationDurationUpdate: 400,
    categories: [
      { name: '根节点' },
      { name: '层次' },
      { name: '知识点' }
    ],
    data: props.nodes.map((n) => ({
      id: n.id,
      name: n.label,
      symbolSize: n.type === 'root' ? 56 : n.type === 'layer' ? 40 : 26,
      itemStyle: {
        color: n.color || '#135f92',
        borderColor: '#fff',
        borderWidth: 2,
        shadowBlur: 8,
        shadowColor: 'rgba(0,0,0,0.15)'
      },
      category: n.type === 'root' ? 0 : n.type === 'layer' ? 1 : 2,
      _raw: n
    })),
    links: props.links.map((l) => ({
      source: l.from,
      target: l.to
    })),
    force: {
      repulsion: 500,
      gravity: 0.12,
      edgeLength: [120, 280],
      layoutAnimation: true
    },
    label: {
      show: true,
      fontSize: 11,
      fontWeight: 'bold',
      color: '#333'
    },
    emphasis: {
      focus: 'adjacency',
      lineStyle: {
        width: 6,
        curveness: 0.2
      }
    },
    edgeSymbol: ['none', 'none'],
    lineStyle: {
      color: '#c0cdd8',
      curveness: 0.25,
      opacity: 0.7
    }
  }]
}))

function handleChartClick(params) {
  if (params.dataType === 'node' && params.data?._raw) {
    emit('select-node', params.data._raw)
  }
}

const detailTitle = computed(() => props.selectedNode?.label || '计算机网络')

const detailText = computed(() => {
  if (!props.selectedNode || props.selectedNode.type === 'root') {
    return '知识图谱以计算机网络为根节点，向下展开 TCP/IP 五层模型和各层知识点。点击节点可查看详情，拖拽节点可重新布局。'
  }
  if (props.selectedNode.type === 'layer') {
    return '该节点表示 TCP/IP 五层模型中的一个层次，点击相关知识点可查看详细说明。'
  }
  return props.selectedNode.point?.detail || ''
})
</script>
