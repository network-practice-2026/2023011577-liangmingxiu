import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles.css'

// ECharts tree-shaking registration
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  PieChart,
  BarChart,
  LineChart,
  GaugeChart,
  GraphChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  GaugeChart,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const app = createApp(App)
app.component('VChart', VChart)
app.use(router)
app.mount('#app')
