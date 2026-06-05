<template>
  <section class="knowledge-layer">
    <div class="knowledge-summary">
      <article>
        <span>主要功能</span>
        <strong>{{ layer.functionText }}</strong>
      </article>
      <article>
        <span>常见协议或技术</span>
        <strong>{{ layer.protocols.join(' / ') }}</strong>
      </article>
      <article>
        <span>相关设备</span>
        <strong>{{ layer.devices.join(' / ') }}</strong>
      </article>
      <article>
        <span>数据单位</span>
        <strong>{{ layer.dataUnit }}</strong>
      </article>
    </div>

    <div class="knowledge-toolbar">
      <input
        :value="keyword"
        type="search"
        placeholder="按标题、分类或描述模糊查询"
        @input="$emit('update:keyword', $event.target.value)"
      />
      <button type="button" class="primary" @click="$emit('create')">新增知识点</button>
    </div>

    <div class="data-table">
      <h3>知识点列表</h3>
      <table>
        <thead>
          <tr>
            <th>标题</th>
            <th>分类</th>
            <th>摘要</th>
            <th>操作</th>
          </tr>
        </thead>
        <TransitionGroup name="row" tag="tbody">
          <tr v-if="!points.length" key="empty">
            <td colspan="4">暂无匹配知识点</td>
          </tr>
          <tr v-for="point in points" :key="point.id">
            <td>{{ point.title }}</td>
            <td>{{ point.category }}</td>
            <td>{{ point.summary }}</td>
            <td class="table-actions">
              <button type="button" @click="$emit('edit', point)">编辑</button>
              <button type="button" @click="$emit('remove', point.id)">删除</button>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>

    <div class="pagination">
      <button type="button" :disabled="currentPage <= 1" @click="$emit('page-change', currentPage - 1)">
        上一页
      </button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button type="button" :disabled="currentPage >= totalPages" @click="$emit('page-change', currentPage + 1)">
        下一页
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  layer: {
    type: Object,
    required: true
  },
  points: {
    type: Array,
    required: true
  },
  keyword: {
    type: String,
    default: ''
  },
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

defineEmits(['update:keyword', 'create', 'edit', 'remove', 'page-change'])
</script>
