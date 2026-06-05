<template>
  <section class="state-display scenario-display" aria-label="综合场景步骤详情">
    <!-- Protocol distribution donut -->
    <div v-if="steps.length > 0" class="chart-section">
      <VChart :option="protocolPieOption" autoresize style="height: 200px" />
    </div>

    <!-- Switch MAC table growth -->
    <div v-if="steps.length > 0" class="chart-section">
      <VChart :option="switchGrowthOption" autoresize style="height: 200px" />
    </div>

    <Transition name="fade" mode="out-in">
      <div :key="currentStep.name" class="step-detail scenario-detail">
        <p class="eyebrow">当前步骤</p>
        <h2>{{ stepNumber }}. {{ currentStep.name }}</h2>
        <p class="description">{{ currentStep.purpose }}</p>

        <div class="scenario-facts">
          <article v-for="item in factItems" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <div class="packet-card">
          <span>当前帧或报文</span>
          <strong>{{ currentStep.frame }}</strong>
        </div>

        <div class="switch-action">
          <p class="eyebrow">交换机 S 的处理行为</p>
          <p>{{ currentStep.switchAction }}</p>
        </div>

        <p v-if="currentStep.result" class="result">{{ currentStep.result }}</p>
      </div>
    </Transition>

    <div class="table-grid">
      <article class="data-table">
        <h3>交换机 S 交换表变化</h3>
        <table>
          <thead>
            <tr>
              <th>端口</th>
              <th>MAC 地址</th>
              <th>设备</th>
            </tr>
          </thead>
          <TransitionGroup name="row" tag="tbody">
            <tr v-if="!currentStep.switchTable.length" key="switch-empty">
              <td colspan="3">空表</td>
            </tr>
            <tr
              v-for="row in currentStep.switchTable"
              :key="`${row.port}-${row.mac}`"
            >
              <td>{{ row.port }}</td>
              <td>{{ row.mac }}</td>
              <td>{{ row.device }}</td>
            </tr>
          </TransitionGroup>
        </table>
      </article>

      <article class="data-table">
        <h3>H1 的 ARP 表变化</h3>
        <table>
          <thead>
            <tr>
              <th>IP 地址</th>
              <th>MAC 地址</th>
              <th>说明</th>
            </tr>
          </thead>
          <TransitionGroup name="row" tag="tbody">
            <tr v-if="!currentStep.arpTable.length" key="arp-empty">
              <td colspan="3">空表</td>
            </tr>
            <tr
              v-for="row in currentStep.arpTable"
              :key="`${row.ip}-${row.mac}`"
            >
              <td>{{ row.ip }}</td>
              <td>{{ row.mac }}</td>
              <td>{{ row.device }}</td>
            </tr>
          </TransitionGroup>
        </table>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentStep: {
    type: Object,
    required: true
  },
  stepNumber: {
    type: Number,
    required: true
  },
  steps: {
    type: Array,
    default: () => []
  }
})

// ---- Protocol distribution pie ----
const protocolPieOption = computed(() => {
  const counts = {}
  props.steps.forEach((s) => {
    const protocol = s.protocol || '未知'
    counts[protocol] = (counts[protocol] || 0) + 1
  })
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 步 ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '48%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%'
      },
      emphasis: {
        label: { fontSize: 15, fontWeight: 'bold' },
        scaleSize: 8
      },
      data
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      top: '40%',
      style: {
        text: '协议分布',
        textAlign: 'center',
        fill: '#435363',
        fontSize: 14,
        fontWeight: 'bold'
      }
    }]
  }
})

// ---- Switch MAC table growth ----
const switchGrowthOption = computed(() => {
  const xData = props.steps.map((_, i) => `第${i + 1}步`)
  const switchData = props.steps.map((s) => (s.switchTable || []).length)
  const arpData = props.steps.map((s) => (s.arpTable || []).length)

  return {
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: '0%',
      textStyle: { fontSize: 11, color: '#66788a' }
    },
    grid: { left: '3%', right: '6%', bottom: '12%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      name: '条目数',
      nameTextStyle: { fontSize: 11, color: '#66788a' }
    },
    series: [
      {
        name: '交换机 MAC 表',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        step: 'middle',
        areaStyle: { opacity: 0.08 },
        lineStyle: { width: 2 },
        itemStyle: { color: '#135f92' },
        data: switchData
      },
      {
        name: 'H1 ARP 表',
        type: 'line',
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        areaStyle: { opacity: 0.05 },
        lineStyle: { width: 2 },
        itemStyle: { color: '#27ae60' },
        data: arpData
      }
    ]
  }
})

// ---- Existing logic ----
const factItems = computed(() => [
  { label: '通信起点和终点', value: props.currentStep.endpoint },
  { label: '使用协议', value: props.currentStep.protocol },
  { label: '广播 / 单播', value: props.currentStep.castType },
  { label: '源 MAC 地址', value: props.currentStep.srcMac },
  { label: '目的 MAC 地址', value: props.currentStep.dstMac },
  { label: '源 IP 地址', value: props.currentStep.srcIp },
  { label: '目的 IP 地址', value: props.currentStep.dstIp },
  { label: '拓扑传输路径', value: props.currentStep.path.join(' -> ') }
])
</script>
