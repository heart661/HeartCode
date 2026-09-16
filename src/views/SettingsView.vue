<script setup lang="ts">
import { Activity, Globe2, LockKeyhole, RefreshCw } from '@lucide/vue'
import { useGatewayStore } from '@/stores/gateway'
import SectionHeading from '@/components/common/SectionHeading.vue'

const store = useGatewayStore()
// TODO(API): service 和 security 均为写死展示数据，改为“网关信息/系统配置”接口返回值。
// 如果这些配置允许编辑，还应分别调用配置保存接口，并处理校验、加载态和失败提示。
const service = [
  ['监听地址', '本机网卡绑定 IP', '192.168.1.10'],
  ['Web 访问端口', '页面 IP:端口访问', ':8080'],
  ['网关版本', '当前运行版本', 'v2.4.1'],
  ['设备协议', '下行 / 上行通道', 'MQTT + Modbus-TCP'],
  ['运行时长', '自上次启动', '18d 06:42:10'],
  ['数据上报周期', '设备心跳 / 状态', '30s'],
]
const security = [
  ['登录认证', '售后运维账号', '已启用'],
  ['会话超时', '无操作自动登出', '30 min'],
  ['操作审计', '控制 / OTA 记录留痕', '开启'],
  ['日志保留', '本地循环存储', '90 天'],
  ['OTA 校验', '固件签名校验', '强制'],
]
</script>

<template>
  <section class="settings-grid">
    <div class="panel settings-panel">
      <SectionHeading title="网关服务" :icon="Globe2" />
      <div v-for="item in service" :key="item[0]" class="setting-row">
        <div>
          <b>{{ item[0] }}</b
          ><span>{{ item[1] }}</span>
        </div>
        <code>{{ item[2] }}</code>
      </div>
    </div>
    <div class="panel settings-panel">
      <SectionHeading title="访问与安全" :icon="LockKeyhole" />
      <div v-for="item in security" :key="item[0]" class="setting-row">
        <div>
          <b>{{ item[0] }}</b
          ><span>{{ item[1] }}</span>
        </div>
        <code>{{ item[2] }}</code>
      </div>
      <div class="setting-row">
        <div><b>维护操作</b><span>重启网关服务</span></div>
        <!-- TODO(API): 改为调用“重启网关服务”接口；这是高风险操作，建议增加二次确认并等待重启结果。 -->
        <button class="danger-button" @click="store.notify('演示模式：重启服务操作已禁用', 'err')">
          <RefreshCw :size="15" /> 重启服务
        </button>
      </div>
    </div>
  </section>
  <section class="panel">
    <SectionHeading title="接入统计" :icon="Activity" />
    <!-- TODO(API): 下方 5、28、4 为写死统计，改用概览/接入统计接口返回值。 -->
    <div class="stats-grid">
      <div><small>接入楼层</small><b>5</b></div>
      <div><small>房间总数</small><b>28</b></div>
      <div>
        <small>设备总数</small><b>{{ store.devices.length }}</b>
      </div>
      <div><small>设备类型</small><b>4</b></div>
    </div>
  </section>
</template>
