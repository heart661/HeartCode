<script setup lang="ts">
defineProps<{ title: string; icon?: unknown; action?: string }>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="section-heading" :class="{ compact: !action }">
    <h2><component :is="icon" v-if="icon" :size="18" /> {{ title }}</h2>
    <span></span>
    <button v-if="action" class="text-button" @click="$emit('action')">{{ action }}</button>
    <slot />
  </div>
</template>
