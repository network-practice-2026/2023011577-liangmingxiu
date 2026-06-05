import { createRouter, createWebHistory } from 'vue-router'
import KnowledgeSystem from '../views/KnowledgeSystem.vue'
import NetworkScenarioDemo from '../views/NetworkScenarioDemo.vue'
import ProtocolDemo from '../views/ProtocolDemo.vue'

const routes = [
  {
    path: '/',
    redirect: '/protocol-demo'
  },
  {
    path: '/protocol-demo',
    name: 'ProtocolDemo',
    component: ProtocolDemo
  },
  {
    path: '/network-scenario-demo',
    name: 'NetworkScenarioDemo',
    component: NetworkScenarioDemo
  },
  {
    path: '/knowledge-system',
    name: 'KnowledgeSystem',
    component: KnowledgeSystem
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
