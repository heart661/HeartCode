<script setup lang="ts">
import { Activity, Bell, Building2, CircleAlert, Cpu, Gauge } from '@lucide/vue'
import { useGatewayStore } from '@/stores/gateway'
import SectionHeading from '@/components/common/SectionHeading.vue'

const store = useGatewayStore()
const onlineRate = () => Math.round((store.onlineDevices / store.devices.length) * 100)
</script>

<template>
  <section class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label"><Building2 :size="16" /> 接入楼层</div>
      <strong>5</strong><span>客房楼层全覆盖</span><Building2 class="kpi-watermark" :size="36" />
    </div>
    <div class="kpi-card">
      <div class="kpi-label"><Building2 :size="16" /> 房间总数</div>
      <strong>28</strong><span>标准 / 商务 / 行政 / 套房</span
      ><Building2 class="kpi-watermark" :size="36" />
    </div>
    <div class="kpi-card">
      <div class="kpi-label"><Cpu :size="16" /> 设备总数</div>
      <strong>{{ store.devices.length }}</strong
      ><span>4 类智能设备</span><Cpu class="kpi-watermark" :size="36" />
    </div>
    <div class="kpi-card">
      <div class="kpi-label"><Activity :size="16" /> 在线 / 离线</div>
      <strong class="success-text"
        >{{ store.onlineDevices }}
        <small>/ {{ store.devices.length - store.onlineDevices }}</small></strong
      ><span>在线率 {{ onlineRate() }}%</span><Gauge class="kpi-watermark" :size="36" />
    </div>
    <div class="kpi-card">
      <div class="kpi-label"><CircleAlert :size="16" /> 异常 / 注意</div>
      <strong class="danger-text"
        >{{ store.devices.filter((device) => !device.online).length }}
        <small
          >/ {{ store.devices.filter((device) => store.statusOf(device) === 'warn').length }}</small
        ></strong
      ><span>需要售后关注</span><Bell class="kpi-watermark" :size="36" />
    </div>
  </section>

  <SectionHeading
    title="楼层房间态势"
    :icon="Building2"
    action="点击房间进入设备视图"
    @action="store.navigate('rooms')"
  />
  <section class="floor-grid">
    <article v-for="floor in store.floors" :key="floor" class="panel floor-panel">
      <div class="panel-heading">
        <h3>{{ floor }} {{ store.rooms.find((room) => room.floor === floor)?.category }}</h3>
        <small
          >{{ store.rooms.filter((room) => room.floor === floor).length }} 间 · 在线
          {{ store.devices.filter((device) => device.floor === floor && device.online).length }}/{{
            store.devices.filter((device) => device.floor === floor).length
          }}</small
        >
      </div>
      <div class="room-status-grid">
        <button
          v-for="room in store.rooms.filter((room) => room.floor === floor)"
          :key="room.id"
          class="room-status-cell"
          :class="store.statusOf(store.devices.find((device) => device.id === room.devices[0]))"
          @click="store.openRoom(room)"
        >
          <b>{{ room.id }}</b
          ><i
            class="status-dot"
            :class="store.statusOf(store.devices.find((device) => device.id === room.devices[0]))"
          ></i>
        </button>
      </div>
    </article>
  </section>

  <section class="overview-lower">
    <div class="panel">
      <SectionHeading title="设备类型分布" :icon="Cpu" />
      <div class="distribution">
        <div v-for="(meta, type) in store.deviceMeta" :key="type" class="distribution-row">
          <span><component :is="meta.icon" :size="15" /> {{ meta.label }}</span>
          <div class="distribution-bar">
            <i
              :style="{
                width: `${(store.devices.filter((device) => device.type === type).length / store.devices.length) * 100}%`,
              }"
            ></i>
          </div>
          <b>{{ store.devices.filter((device) => device.type === type).length }}</b>
        </div>
      </div>
    </div>
    <div class="panel">
      <SectionHeading
        title="最新告警"
        :icon="Bell"
        action="查看全部"
        @action="store.navigate('logs')"
      />
      <div class="alert-list">
        <div
          v-for="log in store.allLogs.slice(0, 5)"
          :key="`${log.room}-${log.time}-${log.message}`"
          class="alert-row"
        >
          <b class="level" :class="log.level">{{ log.level }}</b
          ><time>{{ log.time }}</time
          ><span>{{ log.room }} · {{ log.message }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
