<template>
  <div class="app">
    <component :is="currentLayout">
      <router-view />
    </component>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Layouts
import AuthLayout from './layouts/AuthLayout.vue'
import AdminLayout from './layouts/AdminLayout.vue'

// Route tracking
const route = useRoute()

// Dynamic layout selection
const currentLayout = computed(() => {
  // Sử dụng AuthLayout cho trang đăng nhập
  if (route.path === '/login') {
    return AuthLayout
  }
  // Sử dụng AdminLayout cho tất cả các trang khác
  return AdminLayout
})
</script>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
}
</style>
