<template>
  <section class="topology-panel scenario-topology" aria-label="综合网络场景拓扑图">
    <svg viewBox="0 0 805 460" role="img">
      <line
        v-for="link in linkLines"
        :key="link.key"
        :x1="link.from.x"
        :y1="link.from.y"
        :x2="link.to.x"
        :y2="link.to.y"
        class="topology-link"
        :class="{ active: isActiveLink(link.from.id, link.to.id) }"
      />

      <g
        v-for="node in scenario.nodes"
        :key="node.id"
        class="topology-node"
        :class="[node.type, { active: activeNodeIds.includes(node.id) }]"
        :transform="`translate(${node.x}, ${node.y})`"
      >
        <ellipse v-if="node.type === 'cloud'" cx="0" cy="0" rx="62" ry="38" />
        <rect v-else-if="node.type === 'switch'" x="-58" y="-32" width="116" height="64" rx="8" />
        <rect v-else-if="node.type === 'router'" x="-52" y="-36" width="104" height="72" rx="16" />
        <rect v-else-if="node.type === 'server'" x="-58" y="-38" width="116" height="76" rx="8" />
        <circle v-else r="42" />
        <text class="node-title" text-anchor="middle" y="-4">{{ node.label }}</text>
        <text class="node-subtitle" text-anchor="middle" y="18">{{ node.subLabel }}</text>
      </g>

      <motion.g
        v-if="packetPoint"
        :key="animationKey"
        class="packet scenario-packet"
        :initial="packetInitial"
        :animate="packetAnimate"
        :transition="packetTransition"
      >
        <circle r="12" />
        <text y="-20" text-anchor="middle">{{ currentStep.protocol }}</text>
      </motion.g>
    </svg>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'

const props = defineProps({
  scenario: {
    type: Object,
    required: true
  },
  currentStep: {
    type: Object,
    required: true
  },
  animationTick: {
    type: Number,
    required: true
  }
})

const nodeMap = computed(() =>
  Object.fromEntries(props.scenario.nodes.map((node) => [node.id, node]))
)

const activeNodeIds = computed(() => props.currentStep.path)

const linkLines = computed(() =>
  props.scenario.links.map(([fromId, toId]) => ({
    key: `${fromId}-${toId}`,
    from: nodeMap.value[fromId],
    to: nodeMap.value[toId]
  }))
)

const linkSet = computed(
  () => new Set(props.scenario.links.map(([fromId, toId]) => getLinkKey(fromId, toId)))
)

const normalizedPath = computed(() => {
  const path = props.currentStep.path
  if (path.length <= 1) return path

  const route = [path[0]]
  for (let index = 1; index < path.length; index += 1) {
    const previousId = route[route.length - 1]
    const nextId = path[index]

    if (hasLink(previousId, nextId)) {
      route.push(nextId)
      continue
    }

    const bridgeId = findBridgeNode(previousId, nextId)
    if (bridgeId) {
      route.push(bridgeId, nextId)
    } else {
      route.push(nextId)
    }
  }
  return route
})

const packetPoint = computed(() => {
  const path = normalizedPath.value
  return nodeMap.value[path[path.length - 1]]
})

const animationKey = computed(() => `${props.animationTick}-${props.currentStep.name}`)

const packetPoints = computed(() =>
  normalizedPath.value.map((nodeId) => nodeMap.value[nodeId]).filter(Boolean)
)

const packetInitial = computed(() => {
  const firstPoint = packetPoints.value[0] ?? { x: 0, y: 0 }
  return {
    x: firstPoint.x,
    y: firstPoint.y,
    opacity: 0,
    scale: 0.82
  }
})

const packetAnimate = computed(() => {
  const points = packetPoints.value
  if (points.length === 0) return packetInitial.value
  return {
    x: points.map((point) => point.x),
    y: points.map((point) => point.y),
    opacity: points.map((_, index) => (index === 0 ? 0 : 1)),
    scale: points.map((_, index) => {
      if (index === 0) return 0.82
      if (index === 1) return 1.12
      return 1
    })
  }
})

const packetTransition = computed(() => ({
  duration: packetDuration.value,
  ease: 'easeInOut',
  times: packetKeyframeTimes.value
}))

const packetKeyframeTimes = computed(() => {
  const points = normalizedPath.value.map((nodeId) => nodeMap.value[nodeId]).filter(Boolean)
  if (points.length <= 1) return [0, 1]

  const distances = points.map((point, index) => {
    if (index === 0) return 0
    const previous = points[index - 1]
    return Math.hypot(point.x - previous.x, point.y - previous.y)
  })
  const totalDistance = distances.reduce((total, distance) => total + distance, 0)
  if (totalDistance === 0) return points.map((_, index) => index / (points.length - 1))

  let passedDistance = 0
  return distances.map((distance, index) => {
    if (index === 0) return 0
    passedDistance += distance
    return passedDistance / totalDistance
  })
})

const packetDuration = computed(() => {
  const distance = getPathDistance(normalizedPath.value)
  const seconds = Math.min(Math.max(distance / 560, 0.9), 1.75)
  return Number(seconds.toFixed(2))
})

function isActiveLink(fromId, toId) {
  const path = normalizedPath.value
  for (let index = 0; index < path.length - 1; index += 1) {
    const current = path[index]
    const next = path[index + 1]
    if ((current === fromId && next === toId) || (current === toId && next === fromId)) {
      return true
    }
  }
  return false
}

function getLinkKey(fromId, toId) {
  return [fromId, toId].sort().join('__')
}

function hasLink(fromId, toId) {
  return linkSet.value.has(getLinkKey(fromId, toId))
}

function findBridgeNode(fromId, toId) {
  return props.scenario.nodes.find((node) => hasLink(fromId, node.id) && hasLink(node.id, toId))?.id
}

function getPathDistance(path) {
  return path.reduce((total, nodeId, index) => {
    if (index === 0) return total
    const previous = nodeMap.value[path[index - 1]]
    const current = nodeMap.value[nodeId]
    if (!previous || !current) return total
    return total + Math.hypot(current.x - previous.x, current.y - previous.y)
  }, 0)
}
</script>
