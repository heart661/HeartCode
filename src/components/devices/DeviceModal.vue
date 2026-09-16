<script setup lang="ts">
import { CircleAlert, Check, Upload, X } from '@lucide/vue'
import { computed } from 'vue'
import { useGatewayStore } from '@/stores/gateway'
import type { Device } from '@/types/gateway'

const store = useGatewayStore()
const tabs = [
  ['status', '实时状态'],
  ['control', '控制下发'],
  ['log', '运行日志'],
  ['ota', 'OTA 升级'],
] as const

function close() {
  store.selectedDevice = null
}

type ControlSpec = {
  key: string
  label: string
  kind: 'switch' | 'range' | 'number' | 'select' | 'action'
  min?: number
  max?: number
  unit?: string
  options?: string[]
}

const controlMap: Record<Device['type'], ControlSpec[]> = {
  light: [
    { key: 'power', label: '电源开关', kind: 'switch' },
    { key: 'brightness', label: '亮度调节', kind: 'range', min: 0, max: 100, unit: '%' },
    { key: 'colorTemp', label: '色温', kind: 'range', min: 2700, max: 6500, unit: 'K' },
  ],
  ac: [
    { key: 'power', label: '电源开关', kind: 'switch' },
    { key: 'mode', label: '运行模式', kind: 'select', options: ['制冷', '制热', '送风', '除湿'] },
    { key: 'temperature', label: '目标温度', kind: 'number', unit: '°C' },
    { key: 'fan', label: '风速', kind: 'select', options: ['自动', '低速', '中速', '高速'] },
  ],
  curtain: [
    { key: 'open', label: '开启比例', kind: 'range', min: 0, max: 100, unit: '%' },
  ],
  lock: [
    { key: 'locked', label: '门锁状态', kind: 'switch' },
    { key: 'remoteUnlock', label: '远程开锁', kind: 'action' },
  ],
}

const specs = computed(() =>
  store.selectedDevice ? controlMap[store.selectedDevice.type] : [],
)

function update(key: string, value: string | number | boolean) {
  if (!store.selectedDevice) return
  store.setDeviceParam(store.selectedDevice, key, value)
}

function displayValue(value: string | number | boolean | undefined, spec: ControlSpec) {
  if (typeof value === 'boolean') return value ? '开启' : '关闭'
  return `${value ?? '--'}${spec.unit ?? ''}`
}
</script>

<template>
  <div v-if="store.selectedDevice" class="modal-backdrop" @click.self="close">
    <section class="device-modal">
      <header class="modal-header">
        <div class="device-icon large">
          <component :is="store.deviceMeta[store.selectedDevice.type].icon" :size="24" />
        </div>
        <div>
          <h2>{{ store.selectedDevice.room }} · {{ store.selectedDevice.name }}</h2>
          <p>
            {{ store.deviceMeta[store.selectedDevice.type].label }} · ID
            {{ store.selectedDevice.id }} · {{ store.selectedDevice.online ? '在线' : '离线' }} ·
            固件 {{ store.selectedDevice.firmware }}
          </p>
        </div>
        <button class="icon-button" title="关闭" @click="close"><X :size="20" /></button>
      </header>
      <nav class="modal-tabs">
        <button
          v-for="tab in tabs"
          :key="tab[0]"
          :class="{ active: store.deviceTab === tab[0] }"
          @click="store.deviceTab = tab[0]"
        >
          {{ tab[1] }}
        </button>
      </nav>
      <div class="modal-body">
        <template v-if="store.deviceTab === 'status'">
          <div class="param-grid">
            <div>
              <small>连接状态</small
              ><b :class="store.selectedDevice.online ? 'success-text' : 'danger-text'">{{
                store.selectedDevice.online ? '在线' : '离线'
              }}</b>
            </div>
            <div>
              <small>设备健康</small
              ><b
                :class="
                  store.statusOf(store.selectedDevice) === 'ok' ? 'success-text' : 'warning-text'
                "
                >{{ store.statusText(store.statusOf(store.selectedDevice)) }}</b
              >
            </div>
            <div><small>最近心跳</small><b>刚刚</b></div>
              <div v-for="spec in specs" :key="spec.key">
              <small>{{ spec.label }}</small
              ><b>{{ displayValue(store.selectedDevice.params[spec.key], spec) }}</b>
            </div>
          </div>
        </template>
        <template v-else-if="store.deviceTab === 'control'">
          <div class="control-list">
            <div v-for="spec in specs" :key="spec.key" class="control-row">
              <span>{{ spec.label }}</span>
              <template v-if="spec.kind === 'switch'">
                <button
                  class="switch"
                  :class="{ on: store.selectedDevice.params[spec.key] }"
                  :aria-label="`切换${spec.label}`"
                  @click="update(spec.key, !store.selectedDevice.params[spec.key])"
                >
                  <i></i>
                </button>
                <b>{{ store.selectedDevice.params[spec.key] ? '开启' : '关闭' }}</b>
              </template>
              <template v-else-if="spec.kind === 'range'">
                <input
                  :value="store.selectedDevice.params[spec.key]"
                  type="range"
                  :min="spec.min"
                  :max="spec.max"
                  @change="update(spec.key, Number(($event.target as HTMLInputElement).value))"
                />
                <b>{{ displayValue(store.selectedDevice.params[spec.key], spec) }}</b>
              </template>
              <template v-else-if="spec.kind === 'number'">
                <input
                  :value="store.selectedDevice.params[spec.key]"
                  class="number-input"
                  type="number"
                  @change="update(spec.key, Number(($event.target as HTMLInputElement).value))"
                />
                <b>{{ spec.unit }}</b>
              </template>
              <template v-else-if="spec.kind === 'select'">
                <select
                  :value="store.selectedDevice.params[spec.key]"
                  @change="update(spec.key, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="option in spec.options" :key="option">{{ option }}</option>
                </select>
              </template>
              <template v-else>
                <button class="primary-button" @click="store.notify(`${store.selectedDevice.name} 已执行远程开锁`)">
                  <CircleAlert :size="14" /> 执行
                </button>
              </template>
            </div>
          </div>
          <p class="modal-hint">操作将通过网关下发至客房设备，并写入运行日志。</p>
        </template>
        <template v-else-if="store.deviceTab === 'log'">
          <div class="log-console">
            <div v-for="log in store.selectedDevice.logs" :key="`${log.time}-${log.message}`">
              <time>{{ log.time }}</time
              ><b :class="log.level">{{ log.level }}</b
              ><span>{{ log.message }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="ota-modal-card">
            <div class="ota-version">
              当前固件 <b>{{ store.selectedDevice.firmware }}</b
              ><span>最新稳定版 v2.4.1</span>
            </div>
            <div v-if="store.selectedDevice.upgrading" class="progress-wrap">
              <i :style="{ width: `${store.selectedDevice.progress}%` }"></i
              ><small>升级中… {{ store.selectedDevice.progress }}%</small>
            </div>
            <button
              class="primary-button"
              :disabled="
                !store.selectedDevice.online ||
                store.selectedDevice.upgrading ||
                store.selectedDevice.firmware === 'v2.4.1'
              "
              @click="store.startUpgrade(store.selectedDevice)"
            >
              <Upload :size="16" />
              {{ store.selectedDevice.upgrading ? '升级进行中…' : '开始固件升级' }}
            </button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
