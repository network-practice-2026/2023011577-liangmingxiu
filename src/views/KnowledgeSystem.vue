<template>
  <main class="protocol-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">任务 3</p>
        <h1>计算机网络知识体系综合展示</h1>
      </div>
      <span class="domain-chip">TCP/IP 五层模型</span>
    </header>

    <section class="knowledge-shell">
      <nav class="knowledge-tabs" aria-label="知识体系标签页">
        <button type="button" :class="{ active: activeTab === 'overview' }" @click="selectTab('overview')">
          概览
        </button>
        <button
          v-for="layer in layers"
          :key="layer.id"
          type="button"
          :class="{ active: activeTab === layer.id }"
          @click="selectTab(layer.id)"
        >
          {{ layer.name }}
        </button>
        <button type="button" :class="{ active: activeTab === 'graph' }" @click="selectTab('graph')">
          知识图谱
        </button>
      </nav>

      <div v-if="loading" class="status-panel">正在加载知识体系数据...</div>

      <div v-else-if="error" class="status-panel error">{{ error }}</div>

      <template v-else>
        <KnowledgeOverview
          v-if="activeTab === 'overview'"
          :layers="layers"
        />

        <KnowledgeGraphView
          v-if="activeTab === 'graph'"
          :nodes="graphNodes"
          :links="graphLinks"
          :selected-node="selectedGraphNode"
          @select-node="selectGraphNode"
        />

        <template v-else-if="activeLayer">
          <div class="knowledge-content">
            <KnowledgeLayerPanel
              :layer="activeLayer"
              :points="pagedPoints"
              v-model:keyword="keyword"
              :current-page="currentPage"
              :total-pages="totalPages"
              @create="openCreateEditor"
              @edit="openEditEditor"
              @remove="removePoint"
              @page-change="setPage"
            />

            <aside class="editor-panel">
              <p class="eyebrow">{{ editingPoint?.id ? '编辑知识点' : '新增知识点' }}</p>
              <h2>{{ activeLayer.name }}知识维护</h2>
              <KnowledgePointEditor
                :model-value="editingPoint"
                @save="handleSave"
                @cancel="closeEditor"
              />
            </aside>
          </div>
        </template>
      </template>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import KnowledgeGraphView from '../components/KnowledgeGraphView.vue'
import KnowledgeLayerPanel from '../components/KnowledgeLayerPanel.vue'
import KnowledgeOverview from '../components/KnowledgeOverview.vue'
import KnowledgePointEditor from '../components/KnowledgePointEditor.vue'
import { useKnowledgeSystem } from '../composables/useKnowledgeSystem'

const editingPoint = ref(null)

const {
  layers,
  activeTab,
  activeLayer,
  keyword,
  currentPage,
  totalPages,
  pagedPoints,
  loading,
  error,
  graphNodes,
  graphLinks,
  selectedGraphNode,
  loadLayers,
  selectTab,
  setPage,
  savePoint,
  removePoint,
  selectGraphNode
} = useKnowledgeSystem()

onMounted(loadLayers)

function openCreateEditor() {
  editingPoint.value = null
}

function openEditEditor(point) {
  editingPoint.value = { ...point }
}

function closeEditor() {
  editingPoint.value = null
}

async function handleSave(point) {
  await savePoint(point)
  closeEditor()
}
</script>
