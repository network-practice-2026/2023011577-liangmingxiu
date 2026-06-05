<template>
  <section class="state-display" aria-label="协议状态展示">
    <Transition name="fade" mode="out-in">
      <div :key="currentStep.name" class="step-detail">
        <p class="eyebrow">当前步骤</p>
        <h2>{{ currentStep.name }}</h2>
        <p class="description">{{ currentStep.description }}</p>

        <div class="packet-card">
          <span>{{ currentStep.packet.type }}</span>
          <strong>{{ currentStep.packet.content }}</strong>
          <dl>
            <template v-for="item in packetFields" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </template>
          </dl>
        </div>

        <p v-if="currentStep.result" class="result">{{ currentStep.result }}</p>
      </div>
    </Transition>

    <!-- Table row count evolution chart -->
    <div v-if="tableSeries.length > 0" class="chart-section">
      <VChart :option="tableEvolutionOption" autoresize style="height: 200px" />
    </div>

    <div class="table-grid">
      <article v-for="table in renderedTables" :key="table.title" class="data-table">
        <h3>{{ table.title }}</h3>
        <table>
          <thead>
            <tr>
              <th v-for="column in table.columns" :key="column.key">{{ column.label }}</th>
            </tr>
          </thead>
          <TransitionGroup name="row" tag="tbody">
            <tr v-for="(row, rowIndex) in table.rows" :key="`${table.title}-${rowIndex}-${JSON.stringify(row)}`">
              <td v-for="column in table.columns" :key="column.key">{{ row[column.key] }}</td>
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
  scenario: {
    type: Object,
    default: null
  },
  stepNumber: {
    type: Number,
    default: 1
  }
})

const totalSteps = computed(() => props.scenario?.steps?.length || 0)

// ---- Gauge ----
const gaugeOption = computed(() => {
  const value = props.stepNumber
  const max = totalSteps.value
  const pct = max > 1 ? Math.round(((value - 1) / (max - 1)) * 100) : 0

  return {
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      center: ['50%', '60%'],
      radius: '85%',
      min: 1,
      max,
      splitNumber: max > 1 ? max - 1 : 1,
      axisLine: {
        show: true,
        lineStyle: {
          width: 18,
          color: [
            [pct / 100, '#135f92'],
            [1, '#e8eef4']
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '60%',
        width: 8,
        offsetCenter: [0, '-6%'],
        itemStyle: {
          color: '#f2994a'
        }
      },
      axisTick: { show: false },
      splitLine: {
        show: true,
        length: 14,
        lineStyle: { width: 3, color: '#135f92' }
      },
      axisLabel: {
        show: true,
        distance: 18,
        color: '#66788a',
        fontSize: 11
      },
      detail: {
        valueAnimation: true,
        formatter: '步骤 {value} / {total}',
        color: '#435363',
        fontSize: 16,
        fontWeight: 'bold',
        offsetCenter: [0, '30%']
      },
      data: [{ value, name: '当前进度' }]
    }]
  }
})

// ---- Table evolution line chart ----
const tableMetaKeys = {
  dnsCache: 'DNS 缓存',
  address: '地址信息',
  arp: 'ARP 缓存',
  mac: '交换机 MAC'
}

const tableSeries = computed(() => {
  const steps = props.scenario?.steps || []
  if (!steps.length) return []

  return Object.entries(tableMetaKeys)
    .filter(([key]) => steps.some((s) => s.tables?.[key]))
    .map(([key, name]) => ({
      name,
      key
    }))
})

const tableEvolutionOption = computed(() => {
  const steps = props.scenario?.steps || []
  const xData = steps.map((_, i) => `第${i + 1}步`)

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
    series: tableSeries.value.map((s, i) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      areaStyle: { opacity: 0.08 },
      lineStyle: { width: 2 },
      data: steps.map((step) => (step.tables?.[s.key] || []).length)
    }))
  }
})

// ---- Existing logic ----
const tableMeta = {
  dnsCache: {
    title: 'DNS 缓存表',
    columns: [
      { key: 'domain', label: '域名' },
      { key: 'ip', label: 'IP 地址' },
      { key: 'ttl', label: 'TTL' }
    ]
  },
  address: {
    title: '地址信息表',
    columns: [
      { key: 'device', label: '设备' },
      { key: 'mac', label: 'MAC' },
      { key: 'ip', label: 'IP' }
    ]
  },
  arp: {
    title: 'ARP 缓存表',
    columns: [
      { key: 'ip', label: 'IP 地址' },
      { key: 'mac', label: 'MAC 地址' },
      { key: 'interface', label: '接口' }
    ]
  },
  mac: {
    title: '交换机 MAC 地址表',
    columns: [
      { key: 'port', label: '端口' },
      { key: 'mac', label: 'MAC 地址' },
      { key: 'device', label: '设备' }
    ]
  }
}

const packetFields = computed(() => {
  const packet = props.currentStep.packet
  return [
    ['源 IP', packet.srcIp],
    ['目的 IP', packet.dstIp],
    ['源 MAC', packet.srcMac],
    ['目的 MAC', packet.dstMac]
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => ({ label, value }))
})

const renderedTables = computed(() =>
  Object.entries(props.currentStep.tables || {}).map(([key, rows]) => ({
    ...tableMeta[key],
    rows
  }))
)
</script>
