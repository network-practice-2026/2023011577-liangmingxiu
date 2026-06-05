<template>
  <section class="control-panel" :aria-label="`${modeLabel}控制`">
    <div class="step-counter">{{ modeLabel }} {{ currentStepIndex + 1 }} / {{ totalSteps }}</div>
    <div class="control-actions">
      <button type="button" class="primary" @click="$emit('start')" :disabled="isPlaying || isLastStep">
        开始
      </button>
      <button type="button" @click="$emit('next')" :disabled="isLastStep">
        下一步
      </button>
      <button type="button" @click="$emit('reset')">
        重置
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  currentStepIndex: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  isLastStep: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'protocol'
  },
  modeLabel: {
    type: String,
    default: '步骤'
  }
})

defineEmits(['start', 'next', 'reset'])
</script>
