<script setup lang="ts">
import { Search } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useGatewayStore } from '@/stores/gateway'

const store = useGatewayStore()
const floor = ref('全部楼层')
const level = ref('全部级别')
const search = ref('')
// TODO(API): 日志量增大后改为调用日志分页接口，将 floor、level、search、页码和每页条数作为查询参数；
// 目前是把所有设备日志加载到浏览器后再筛选。
const logs = computed(() =>
  store.allLogs.filter(
    (log) =>
      (floor.value === '全部楼层' || log.floor === floor.value) &&
      (level.value === '全部级别' || log.level === level.value) &&
      (!search.value || log.message.includes(search.value) || log.room.includes(search.value)),
  ),
)
</script>

<template>
  <div class="toolbar">
    <label
      >楼层
      <select v-model="floor">
        <option>全部楼层</option>
        <option v-for="item in store.floors" :key="item">{{ item }}</option>
      </select></label
    ><label
      >级别
      <select v-model="level">
        <option>全部级别</option>
        <option>INFO</option>
        <option>WARN</option>
        <option>ERROR</option>
      </select></label
    >
    <div class="search-box">
      <Search :size="15" /><input v-model="search" placeholder="搜索日志描述" />
    </div>
    <b class="count-tag">共 {{ logs.length }} 条</b>
  </div>
  <div class="panel table-panel">
    <table>
      <thead>
        <tr>
          <th>时间</th>
          <th>房间</th>
          <th>设备</th>
          <th>级别</th>
          <th>描述</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log, index) in logs" :key="`${log.room}-${log.time}-${index}`">
          <td class="mono">{{ log.time }}</td>
          <td>{{ log.room }}</td>
          <td>{{ log.device }}</td>
          <td>
            <b class="level" :class="log.level">{{ log.level }}</b>
          </td>
          <td>{{ log.message }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
