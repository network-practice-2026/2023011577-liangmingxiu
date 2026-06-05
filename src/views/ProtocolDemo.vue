<template>
  <main class="protocol-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">任务 1</p>
        <h1>单项协议原理可视化动态展示</h1>
      </div>
      <nav class="protocol-tabs" aria-label="协议选择">
        <button
          v-for="protocol in availableProtocols"
          :key="protocol.key"
          type="button"
          :class="{ active: protocol.key === activeProtocolKey }"
          @click="selectProtocol(protocol.key)"
        >
          {{ protocol.title }}
        </button>
      </nav>
    </header>

    <section class="workspace">
      <div class="simulation-area">
        <div class="section-title">
          <div>
            <p class="eyebrow">当前协议</p>
            <h2>{{ scenario.title }}</h2>
          </div>
          <span v-if="scenario.domain" class="domain-chip">{{ scenario.domain }}</span>
        </div>

        <TopologyCanvas
          :scenario="scenario"
          :current-step="currentStep"
          :animation-tick="animationTick"
        />

        <ControlPanel
          :current-step-index="currentStepIndex"
          :total-steps="scenario.steps.length"
          :is-playing="isPlaying"
          :is-last-step="isLastStep"
          @start="start"
          @next="nextStep"
          @reset="reset"
        />
      </div>

      <StateDisplay
        :current-step="currentStep"
        :scenario="scenario"
        :step-number="currentStepIndex + 1"
      />
    </section>
  </main>
</template>

<script setup>
import ControlPanel from '../components/ControlPanel.vue'
import StateDisplay from '../components/StateDisplay.vue'
import TopologyCanvas from '../components/TopologyCanvas.vue'
import { useProtocolSimulator } from '../composables/useProtocolSimulator'

const {
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
  reset
} = useProtocolSimulator('dns')
</script>
