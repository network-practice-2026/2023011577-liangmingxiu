<template>
  <section class="knowledge-overview">
    <article class="overview-intro">
      <h3>TCP/IP 五层模型</h3>
      <p>
        TCP/IP 模型是计算机网络的核心体系结构，将网络通信划分为五个层次。
        每一层为上一层提供服务，同时使用下一层提供的服务。
        数据从应用层向下逐层封装，经过物理介质传输后，在对端逐层解封装，最终交付给目标应用。
      </p>
    </article>

    <div class="layer-cards">
      <article
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="layer-card"
        :style="{ borderTopColor: cardColor(index) }"
      >
        <header class="card-header">
          <span class="card-index" :style="{ background: cardColor(index) }">{{ index + 1 }}</span>
          <h4>{{ layer.name }}</h4>
          <span class="card-count">{{ (layer.points || []).length }} 个知识点</span>
        </header>
        <dl>
          <dt>主要功能</dt>
          <dd>{{ layer.functionText }}</dd>
          <dt>常见协议或技术</dt>
          <dd>{{ (layer.protocols || []).join(' · ') }}</dd>
          <dt>相关设备</dt>
          <dd>{{ (layer.devices || []).join(' · ') }}</dd>
          <dt>数据单位</dt>
          <dd>{{ layer.dataUnit }}</dd>
        </dl>
      </article>
    </div>

    <article class="overview-encap">
      <h3>数据封装流程</h3>
      <div class="encap-flow">
        <template v-for="(layer, index) in layers" :key="layer.id">
          <div class="encap-step" :style="{ borderColor: cardColor(index) }">
            <span class="encap-label" :style="{ background: cardColor(index) }">{{ layer.name }}</span>
            <span class="encap-unit">{{ layer.dataUnit }}</span>
          </div>
          <span v-if="index < layers.length - 1" class="encap-arrow">▼</span>
        </template>
      </div>
      <p class="encap-hint">
        发送方：应用层报文 → 逐层添加头部（及尾部） → 物理层比特流传输<br/>
        接收方：物理层比特流 → 逐层剥离头部（及尾部） → 应用层报文
      </p>
    </article>
  </section>
</template>

<script setup>
defineProps({
  layers: {
    type: Array,
    required: true
  }
})

function cardColor(index) {
  return ['#2f80ed', '#27ae60', '#f2994a', '#9b51e0', '#eb5757'][index % 5]
}
</script>
