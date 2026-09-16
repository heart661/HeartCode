import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createDevices, deviceMeta, floors, rooms } from '@/mock/gateway'
import type { Device, DeviceStatus, LogLevel, Room, ViewKey } from '@/types/gateway'

export const useGatewayStore = defineStore('gateway', () => {
  const devices = ref<Device[]>(createDevices())
  const currentView = ref<ViewKey>('overview')
  const selectedFloor = ref('3F')
  const selectedRoom = ref<Room | null>(null)
  const selectedDevice = ref<Device | null>(null)
  const deviceTab = ref<'status' | 'control' | 'log' | 'ota'>('status')
  const toastMessage = ref('')
  const toastKind = ref<'ok' | 'err'>('ok')
  let toastTimer: number | undefined

  const onlineDevices = computed(() => devices.value.filter((device) => device.online).length)
  const upgradeableDevices = computed(() =>
    devices.value.filter((device) => device.online && device.firmware !== 'v2.4.1'),
  )
  const floorRooms = computed(() => rooms.filter((room) => room.floor === selectedFloor.value))
  const selectedRoomDevices = computed(() =>
    selectedRoom.value
      ? devices.value.filter((device) => selectedRoom.value?.devices.includes(device.id))
      : [],
  )
  const allLogs = computed(() =>
    devices.value.flatMap((device) =>
      device.logs.map((log) => ({
        ...log,
        room: device.room,
        device: device.name,
        floor: device.floor,
      })),
    ),
  )

  function statusOf(device: Device | undefined): DeviceStatus {
    if (!device?.online) return 'err'
    if (device.logs.some((log) => log.level === 'ERROR')) return 'warn'
    return 'ok'
  }

  function statusText(status: DeviceStatus) {
    return status === 'ok' ? '正常' : status === 'warn' ? '注意' : '异常'
  }

  function notify(message: string, kind: 'ok' | 'err' = 'ok') {
    toastMessage.value = message
    toastKind.value = kind
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => (toastMessage.value = ''), 2600)
  }

  function navigate(view: ViewKey) {
    currentView.value = view
    selectedRoom.value = null
  }

  function openRoom(room: Room) {
    selectedRoom.value = room
    currentView.value = 'rooms'
  }

  function openDevice(device: Device) {
    selectedDevice.value = device
    deviceTab.value = 'status'
  }

  function addLog(device: Device, level: LogLevel, message: string) {
    device.logs.unshift({ time: '刚刚', level, message })
  }

  function setDeviceParam(device: Device, key: string, value: string | number | boolean) {
    device.params[key] = value
    addLog(device, 'INFO', `下发指令 → ${key}=${String(value)}，响应：成功`)
    notify(`${device.room} ${device.name} 参数已更新`)
  }

  function togglePower(device: Device) {
    device.params.power = !device.params.power
    addLog(device, 'INFO', `${device.name} ${device.params.power ? '开启' : '关闭'}，响应：成功`)
    notify(`${device.room} ${device.name} 已${device.params.power ? '开启' : '关闭'}`)
  }

  function startUpgrade(device: Device, targetVersion = 'v2.4.1') {
    if (!device.online || device.upgrading || device.firmware === targetVersion) return
    device.upgrading = true
    device.progress = 0
    addLog(device, 'INFO', `开始固件升级 → ${targetVersion}`)
    const timer = window.setInterval(() => {
      device.progress = Math.min(device.progress + 13, 100)
      if (device.progress >= 100) {
        window.clearInterval(timer)
        device.firmware = targetVersion
        device.upgrading = false
        notify(`${device.room} ${device.name} 已升级至 ${targetVersion}`)
      }
    }, 250)
  }

  function startAllUpgrades(targetVersion = 'v2.4.1') {
    const devicesToUpgrade = devices.value.filter(
      (device) => device.online && device.firmware !== targetVersion,
    )
    devicesToUpgrade.forEach((device, index) =>
      window.setTimeout(() => startUpgrade(device, targetVersion), index * 180),
    )
    notify(`已提交 ${devicesToUpgrade.length} 台设备升级至 ${targetVersion}`)
  }

  return {
    devices,
    floors,
    rooms,
    deviceMeta,
    currentView,
    selectedFloor,
    selectedRoom,
    selectedDevice,
    deviceTab,
    toastMessage,
    toastKind,
    onlineDevices,
    upgradeableDevices,
    floorRooms,
    selectedRoomDevices,
    allLogs,
    statusOf,
    statusText,
    notify,
    navigate,
    openRoom,
    openDevice,
    togglePower,
    setDeviceParam,
    startUpgrade,
    startAllUpgrades,
  }
})
