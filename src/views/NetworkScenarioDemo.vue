<template>
  <main class="protocol-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">任务 2</p>
        <h1>综合网络场景模拟</h1>
      </div>
      <span class="domain-chip">H1 访问 www.abc.com：t0 -> t1</span>
    </header>

    <section class="workspace scenario-workspace">
      <div class="simulation-area">
        <div class="section-title">
          <div>
            <p class="eyebrow">当前通信</p>
            <h2>{{ currentStep.protocol }} / {{ currentStep.castType }}</h2>
          </div>
          <span class="domain-chip">{{ currentStep.endpoint }}</span>
        </div>

        <ScenarioTopology
          :scenario="scenario"
          :current-step="currentStep"
          :animation-tick="animationTick"
        />

        <ControlPanel
          mode="scenario"
          mode-label="步骤"
          :current-step-index="currentStepIndex"
          :total-steps="steps.length"
          :is-playing="isPlaying"
          :is-last-step="isLastStep"
          @start="start"
          @next="nextStep"
          @reset="reset"
        />
      </div>

      <ScenarioStepDisplay
        :current-step="currentStep"
        :step-number="currentStepIndex + 1"
        :steps="steps"
      />
    </section>
  </main>
</template>

<script setup>
import ControlPanel from '../components/ControlPanel.vue'
import ScenarioStepDisplay from '../components/ScenarioStepDisplay.vue'
import ScenarioTopology from '../components/ScenarioTopology.vue'
import { useNetworkScenarioSimulator } from '../composables/useNetworkScenarioSimulator'

const {
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
} = useNetworkScenarioSimulator()
</script>
