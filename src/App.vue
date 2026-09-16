<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, CircleAlert } from '@lucide/vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import DeviceModal from '@/components/devices/DeviceModal.vue'
import OverviewView from '@/views/OverviewView.vue'
import RoomsView from '@/views/RoomsView.vue'
import OtaView from '@/views/OtaView.vue'
import LogsView from '@/views/LogsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { useGatewayStore } from '@/stores/gateway'

const store = useGatewayStore()
const mobileMenuOpen = ref(false)
const viewComponent = computed(
  () =>
    ({
      overview: OverviewView,
      rooms: RoomsView,
      ota: OtaView,
      logs: LogsView,
      settings: SettingsView,
    })[store.currentView],
)
</script>

<template>
  <div class="app-shell">
    <AppSidebar :mobile-menu-open="mobileMenuOpen" @close-menu="mobileMenuOpen = false" />
    <section class="main-area">
      <AppTopbar
        :mobile-menu-open="mobileMenuOpen"
        @toggle-menu="mobileMenuOpen = !mobileMenuOpen"
      />
      <main class="content"><component :is="viewComponent" /></main>
    </section>
    <DeviceModal />
    <transition name="toast"
      ><div v-if="store.toastMessage" class="toast-message" :class="store.toastKind">
        <Check v-if="store.toastKind === 'ok'" :size="16" /><CircleAlert v-else :size="16" />{{
          store.toastMessage
        }}
      </div></transition
    >
  </div>
</template>
