import { computed, ref } from 'vue'
import {
  createKnowledgePoint,
  deleteKnowledgePoint,
  fetchKnowledgeLayers,
  updateKnowledgePoint
} from '../services/knowledgeApi'

const pageSize = 5

export function useKnowledgeSystem() {
  const layers = ref([])
  const activeTab = ref('application')
  const keyword = ref('')
  const currentPage = ref(1)
  const loading = ref(false)
  const selectedGraphNode = ref(null)

  const activeLayer = computed(() => layers.value.find((layer) => layer.id === activeTab.value))

  const filteredPoints = computed(() => {
    const points = activeLayer.value?.points || []
    const query = keyword.value.trim().toLowerCase()
    if (!query) return points
    return points.filter((point) =>
      [point.title, point.category, point.summary, point.detail].some((value) =>
        String(value || '').toLowerCase().includes(query)
      )
    )
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredPoints.value.length / pageSize)))

  const pagedPoints = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredPoints.value.slice(start, start + pageSize)
  })

  const graphNodes = computed(() => {
    const root = { id: 'root', label: '计算机网络', type: 'root', x: 420, y: 42 }
    const layerNodes = layers.value.map((layer, index) => ({
      id: layer.id,
      label: layer.name,
      type: 'layer',
      layerId: layer.id,
      x: 110 + index * 155,
      y: 150,
      color: layerColor(index)
    }))
    const pointNodes = layers.value.flatMap((layer, layerIndex) =>
      layer.points.slice(0, 3).map((point, pointIndex) => ({
        id: point.id,
        label: point.title,
        type: 'point',
        layerId: layer.id,
        point,
        x: 80 + layerIndex * 155 + pointIndex * 34,
        y: 275 + pointIndex * 58,
        color: layerColor(layerIndex)
      }))
    )
    return [root, ...layerNodes, ...pointNodes]
  })

  const graphLinks = computed(() => {
    const layerLinks = layers.value.map((layer) => ({ from: 'root', to: layer.id }))
    const pointLinks = layers.value.flatMap((layer) =>
      layer.points.slice(0, 3).map((point) => ({ from: layer.id, to: point.id }))
    )
    return [...layerLinks, ...pointLinks]
  })

  async function loadLayers() {
    loading.value = true
    try {
      layers.value = await fetchKnowledgeLayers()
      activeTab.value = layers.value[0]?.id || 'application'
      selectedGraphNode.value = { id: 'root', label: '计算机网络', type: 'root' }
    } finally {
      loading.value = false
    }
  }

  function selectTab(tabId) {
    activeTab.value = tabId
    keyword.value = ''
    currentPage.value = 1
  }

  function setPage(page) {
    currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
  }

  async function savePoint(point) {
    if (point.id) {
      const updated = await updateKnowledgePoint(activeTab.value, point)
      replacePoint(activeTab.value, updated)
    } else {
      const created = await createKnowledgePoint(activeTab.value, point)
      const layer = layers.value.find((item) => item.id === activeTab.value)
      layer.points.unshift(created)
    }
  }

  async function removePoint(pointId) {
    await deleteKnowledgePoint(activeTab.value, pointId)
    const layer = layers.value.find((item) => item.id === activeTab.value)
    layer.points = layer.points.filter((point) => point.id !== pointId)
    setPage(currentPage.value)
  }

  function replacePoint(layerId, point) {
    const layer = layers.value.find((item) => item.id === layerId)
    const index = layer.points.findIndex((item) => item.id === point.id)
    if (index >= 0) {
      layer.points[index] = point
    }
  }

  function selectGraphNode(node) {
    selectedGraphNode.value = node
    if (node.layerId) {
      activeTab.value = node.layerId
    }
  }

  function layerColor(index) {
    return ['#2f80ed', '#27ae60', '#f2994a', '#9b51e0', '#eb5757'][index % 5]
  }

  return {
    layers,
    activeTab,
    activeLayer,
    keyword,
    currentPage,
    pageSize,
    totalPages,
    pagedPoints,
    filteredPoints,
    loading,
    graphNodes,
    graphLinks,
    selectedGraphNode,
    loadLayers,
    selectTab,
    setPage,
    savePoint,
    removePoint,
    selectGraphNode
  }
}
