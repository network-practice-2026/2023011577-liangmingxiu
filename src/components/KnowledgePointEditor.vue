<template>
  <form class="point-editor" @submit.prevent="submit">
    <div class="editor-grid">
      <label>
        <span>标题</span>
        <input v-model.trim="draft.title" required />
      </label>
      <label>
        <span>分类</span>
        <input v-model.trim="draft.category" required />
      </label>
    </div>
    <label>
      <span>摘要</span>
      <textarea v-model.trim="draft.summary" rows="2" required />
    </label>
    <label>
      <span>详情</span>
      <textarea v-model.trim="draft.detail" rows="4" required />
    </label>
    <div class="editor-actions">
      <button type="submit" class="primary">{{ draft.id ? '保存修改' : '新增知识点' }}</button>
      <button type="button" @click="$emit('cancel')">取消</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const emptyPoint = {
  id: '',
  title: '',
  category: '',
  summary: '',
  detail: ''
}

const draft = reactive({ ...emptyPoint })

watch(
  () => props.modelValue,
  (point) => {
    Object.assign(draft, emptyPoint, point || {})
  },
  { immediate: true }
)

function submit() {
  emit('save', { ...draft })
}
</script>
