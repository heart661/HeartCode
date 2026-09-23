<script setup lang="ts">
import { BarChart3, Bell, Building2, FileText, Settings, ArrowUpCircle } from '@lucide/vue'
import { useGatewayStore } from '@/stores/gateway'
import type { ViewKey } from '@/types/gateway'

const store = useGatewayStore()
defineProps<{ mobileMenuOpen: boolean }>()
const emit = defineEmits<{ 'close-menu': [] }>()

function selectView(key: ViewKey) {
  store.navigate(key)
  emit('close-menu')
}
const items: { key: ViewKey; label: string; icon: typeof BarChart3 }[] = [
  { key: 'overview', label: '态势概览', icon: BarChart3 },
  { key: 'rooms', label: '房间设备', icon: Building2 },
  { key: 'ota', label: 'OTA 升级中心', icon: ArrowUpCircle },
  { key: 'logs', label: '日志中心', icon: FileText },
  { key: 'settings', label: '系统设置', icon: Settings },
]
</script>

<template>
  <aside class="sidebar" :class="{ open: mobileMenuOpen }">
    <div class="brand">
      <div>
        <img src="/public/LOGO透明.png" style="width:100px;height:100px;">
      </div>
      <div>
        <div class="brand-title">华腾智能</div>
        <div class="brand-subtitle">GATEWAY · OPS</div>
      </div>
    </div>
    <nav class="nav">
      <div class="nav-label">运维主菜单</div>
      <button
        v-for="item in items"
        :key="item.key"
        class="nav-item"
        :class="{ active: store.currentView === item.key }"
        @click="selectView(item.key)"
      >
        <component :is="item.icon" :size="18" /><span>{{ item.label }}</span>
      </button>
      <div class="nav-label connection-label">连接信息</div>
      <div class="connection-info">
        <span>访问地址</span><strong>http://192.168.1.10:8080</strong><span>网关版本 v2.4.1</span>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div>
        服务状态 <b><i class="status-dot ok"></i>运行中</b>
      </div>
      <div>已运行 18d 06:42</div>
      <div>协议 MQTT / Modbus-TCP</div>
    </div>
  </aside>
</template>
