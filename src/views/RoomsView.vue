<script setup lang="ts">
import { ArrowLeft, Building2, Cpu } from '@lucide/vue'
import { useGatewayStore } from '@/stores/gateway'
import DeviceModal from '@/components/devices/DeviceModal.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'

const store = useGatewayStore()
</script>

<template>
  <template v-if="!store.selectedRoom">
    <div class="tabs">
      <button
        v-for="floor in store.floors"
        :key="floor"
        :class="{ active: store.selectedFloor === floor }"
        @click="store.selectedFloor = floor"
      >
        {{ floor }}
      </button>
    </div>
    <SectionHeading
      :title="`${store.selectedFloor} ${store.floorRooms[0]?.category} · 房间列表`"
      :icon="Building2"
      ><template #default
        ><b class="count-tag">{{ store.floorRooms.length }} 间客房</b></template
      ></SectionHeading
    >
    <section class="room-card-grid">
      <button
        v-for="room in store.floorRooms"
        :key="room.id"
        class="room-card"
        @click="store.openRoom(room)"
      >
        <div class="room-card-top">
          <div>
            <strong>{{ room.id }}</strong
            ><span>{{ room.category }}</span>
          </div>
          <b
            class="badge"
            :class="store.statusOf(store.devices.find((device) => device.id === room.devices[0]))"
            >{{
              store.statusText(
                store.statusOf(store.devices.find((device) => device.id === room.devices[0])),
              )
            }}</b
          >
        </div>
        <div class="room-card-stats">
          <span
            >设备 <b>{{ room.devices.length }}</b></span
          ><span
            >在线
            <b class="success-text">{{
              room.devices.filter((id) => store.devices.find((device) => device.id === id)?.online)
                .length
            }}</b></span
          ><span
            >离线
            <b class="danger-text">{{
              room.devices.filter((id) => !store.devices.find((device) => device.id === id)?.online)
                .length
            }}</b></span
          >
        </div>
      </button>
    </section>
  </template>
  <template v-else>
    <button class="back-button" @click="store.selectedRoom = null">
      <ArrowLeft :size="16" /> 返回 {{ store.selectedRoom.floor }}
    </button>
    <div class="breadcrumb">
      房间设备 / <b>{{ store.selectedRoom.floor }}</b> /
      <b>{{ store.selectedRoom.id }}（{{ store.selectedRoom.category }}）</b>
    </div>
    <SectionHeading :title="`${store.selectedRoom.id} 设备清单`" :icon="Cpu"
      ><template #default
        ><b class="count-tag"
          >{{ store.selectedRoomDevices.length }} 台设备 · 点击查看详情 / 控制 / OTA</b
        ></template
      ></SectionHeading
    >
    <section class="device-card-grid">
      <button
        v-for="device in store.selectedRoomDevices"
        :key="device.id"
        class="device-card"
        @click="store.openDevice(device)"
      >
        <div class="device-state">
          <i class="status-dot" :class="store.statusOf(device)"></i
          >{{ device.online ? '在线' : '离线' }}
        </div>
        <div class="device-card-head">
          <div class="device-icon">
            <component :is="store.deviceMeta[device.type].icon" :size="21" />
          </div>
          <div>
            <strong>{{ device.name }}</strong
            ><span>{{ store.deviceMeta[device.type].label }}</span>
          </div>
        </div>
        <div class="device-params">
          <div>
            <small>固件版本</small><b>{{ device.firmware }}</b>
          </div>
          <div><small>最近心跳</small><b>刚刚</b></div>
        </div>
      </button>
    </section>
    <DeviceModal />
  </template>
</template>
