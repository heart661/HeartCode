import { AirVent, Lightbulb, LockKeyhole, Snowflake } from '@lucide/vue'
import type { Device, DeviceMeta, DeviceType, Room } from '@/types/gateway'

export const floors = ['3F', '5F', '8F', '10F', '12F']

export const deviceMeta: Record<DeviceType, DeviceMeta> = {
  light: { label: '智能灯具', icon: Lightbulb },
  ac: { label: '中央空调', icon: Snowflake },
  curtain: { label: '电动窗帘', icon: AirVent },
  lock: { label: '智能门锁', icon: LockKeyhole },
}

const roomGroups = [
  ['3F', '标准客房', ['301', '302', '303', '304', '305', '306', '307', '308']],
  ['5F', '商务客房', ['501', '502', '503', '504', '505', '506', '507', '508']],
  ['8F', '行政客房', ['801', '802', '803', '804', '805', '806']],
  ['10F', '豪华套房', ['1001', '1002', '1003', '1004']],
  ['12F', '总统套房', ['1201', '1202']],
] as const

export const rooms: Room[] = roomGroups.flatMap(([floor, category, ids]) =>
  ids.map((id) => ({
    id,
    floor,
    category,
    devices: [`${id}-light`, `${id}-ac`, `${id}-curtain`, `${id}-lock`],
  })),
)

export const createDevices = (): Device[] =>
  rooms.flatMap((room, roomIndex) =>
    room.devices.map((id, index) => {
      const type = ['light', 'ac', 'curtain', 'lock'][index] as DeviceType
      const online = (roomIndex + index) % 5 !== 0
      return {
        id,
        room: room.id,
        floor: room.floor,
        name:
          type === 'light' ? '主灯' : type === 'ac' ? '空调' : type === 'curtain' ? '窗帘' : '门锁',
        type,
        online,
        firmware: type === 'light' ? 'v2.3.0' : 'v2.4.0',
        upgrading: false,
        progress: 0,
        params:
          type === 'light'
            ? { power: online, brightness: 78, colorTemp: 4200 }
            : type === 'ac'
              ? { power: online, mode: '制冷', temperature: 24, fan: '自动' }
              : type === 'curtain'
                ? { open: 65 }
                : { locked: true },
        logs: [
          { time: '09-15 15:49:44', level: 'ERROR', message: '指令执行失败（校验错误）' },
          { time: '09-15 15:48:16', level: 'WARN', message: '信号强度偏低（RSSI < -75）' },
          { time: '09-15 15:47:17', level: 'INFO', message: '设备上线' },
        ],
      }
    }),
  )
