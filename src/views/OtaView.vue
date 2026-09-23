<script setup lang="ts">
import { Upload, Zap } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useGatewayStore } from '@/stores/gateway'
import SectionHeading from '@/components/common/SectionHeading.vue'

const store = useGatewayStore()
const firmwareVersions = ['v2.4.1', 'v2.4.0', 'v2.3.0']
const filter = ref('全部状态')
const targetVersion = ref(firmwareVersions[0])
const deviceTargets = ref<Record<string, string>>({})
const visibleDevices = computed(() =>
  store.devices.filter(
    (device) =>
      filter.value === '全部状态' ||
      (filter.value === '可升级' && device.online && device.firmware !== 'v2.4.1') ||
      (filter.value === '已最新' && device.firmware === 'v2.4.1') ||
      (filter.value === '离线' && !device.online),
  ),
)
const targetableDevices = computed(() =>
  store.devices.filter((device) => device.online && device.firmware !== targetVersion.value),
)

function targetFor(deviceId: string) {
  return deviceTargets.value[deviceId] ?? targetVersion.value
}

function upgradeDevice(device: (typeof store.devices)[number]) {
  store.startUpgrade(device, targetFor(device.id))
}
</script>

<template>
  <div class="toolbar">
    <label
      >筛选
      <select v-model="filter">
        <option>全部状态</option>
        <option>可升级</option>
        <option>已最新</option>
        <option>离线</option>
      </select></label
    ><label
      >目标版本
      <select v-model="targetVersion">
        <option v-for="version in firmwareVersions" :key="version">{{ version }}</option>
      </select></label
    ><b class="count-tag">可升级设备：{{ targetableDevices.length }} 台</b
    ><button class="primary-button push-right" @click="store.startAllUpgrades(targetVersion)">
      <Zap :size="16" /> 一键升级全部可升级设备
    </button>
  </div>
  <SectionHeading title="固件升级任务" :icon="Upload" />
  <section class="ota-list">
    <article v-for="device in visibleDevices" :key="device.id" class="ota-item">
      <div class="device-icon">
        <component :is="store.deviceMeta[device.type].icon" :size="20" />
      </div>
      <div class="ota-info">
        <strong>{{ device.room }} · {{ device.name }}</strong
        ><span
          >当前固件
          <b :class="{ 'warning-text': device.firmware !== 'v2.4.1' }">{{ device.firmware }}</b> ·
          最新 v2.4.1 · {{ device.online ? '在线' : '离线' }}</span
        >
        <div v-if="device.upgrading" class="progress-wrap">
          <i :style="{ width: `${device.progress}%` }"></i
          ><small>升级中… {{ device.progress }}% · 请勿断电</small>
        </div>
      </div>
      <label class="ota-target"
        >目标版本
        <select v-model="deviceTargets[device.id]" :disabled="device.upgrading">
          <option v-for="version in firmwareVersions" :key="version" :value="version">
            {{ version }}
          </option>
        </select>
      </label>
      <button
        class="primary-button"
        :disabled="!device.online || device.firmware === targetFor(device.id) || device.upgrading"
        @click="upgradeDevice(device)"
      >
        {{ device.upgrading ? '升级中…' : '开始升级' }}
      </button>
    </article>
  </section>
</template>
