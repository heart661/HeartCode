<script setup lang="ts">
import { Menu } from '@lucide/vue'
import { computed } from 'vue'
import { useGatewayStore } from '@/stores/gateway'

defineProps<{ mobileMenuOpen: boolean }>()
const emit = defineEmits<{ 'toggle-menu': [] }>()
const store = useGatewayStore()
const titles = {
  overview: ['态势概览', '酒店设备网关 · 全局运行态势'],
  rooms: ['房间设备', '分楼层 / 分房间查看设备状态与下发控制'],
  ota: ['OTA 升级中心', '批量或单设备固件升级管理'],
  logs: ['日志中心', '全量设备运行与通信日志'],
  settings: ['系统设置', '网关服务与访问配置'],
} as const
const title = computed(() => titles[store.currentView])
</script>

<template>
  <header class="topbar">
    <button class="icon-button menu-button" title="打开导航" @click="emit('toggle-menu')">
      <Menu :size="20" />
    </button>
    <div>
      <h1>{{ title[0] }}</h1>
      <p>{{ title[1] }}</p>
    </div>
    <div class="topbar-status">
      <div class="top-stat"><span>网关 IP:PORT</span><b>192.168.1.10:8080</b></div>
      <div class="top-stat">
        <span>在线率</span
        ><b>{{ Math.round((store.onlineDevices / store.devices.length) * 100) }}%</b>
      </div>
      <div class="online-pill"><i class="status-dot ok"></i> 网关在线</div>
    </div>
  </header>
</template>
