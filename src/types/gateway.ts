import type { Component } from 'vue'

export type ViewKey = 'overview' | 'rooms' | 'ota' | 'logs' | 'settings'
export type DeviceType = 'light' | 'ac' | 'curtain' | 'lock'
export type DeviceStatus = 'ok' | 'warn' | 'err'
export type LogLevel = 'INFO' | 'WARN' | 'ERROR'

export interface DeviceLog {
  time: string
  level: LogLevel
  message: string
}

export interface Device {
  id: string
  room: string
  floor: string
  name: string
  type: DeviceType
  online: boolean
  firmware: string
  upgrading: boolean
  progress: number
  params: Record<string, string | number | boolean | undefined>
  logs: DeviceLog[]
}

export interface Room {
  id: string
  floor: string
  category: string
  devices: string[]
}

export interface DeviceMeta {
  label: string
  icon: Component
}
