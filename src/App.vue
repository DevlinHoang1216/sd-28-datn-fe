<template>
  <div class="app d-flex">
    <Sidebar v-if="showMainLayoutElements" :isSidebarActive="isSidebarActive" @toggle-sidebar="toggleSidebar" />

    <div :class="['main-content-wrapper', { 'full-width': !showMainLayoutElements || !isSidebarActive }]">
      <Header
        v-if="showMainLayoutElements"
        :total-price="totalPrice"
        :cart="cart"
        :is-sidebar-active="isSidebarActive"
        @toggle-sidebar="toggleSidebar"
        @toggle-theme="toggleTheme"
      />
      <div class="content-area">
        <router-view />
      </div>
      <Footer v-if="showMainLayoutElements" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// Components
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

// Route tracking
const route = useRoute()

// Layout control - hide main elements on auth page
const showMainLayoutElements = computed(() => {
  return route.path !== '/auth'
})

// UI state management
const isSidebarActive = ref(true)
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark')

const toggleSidebar = () => {
  isSidebarActive.value = !isSidebarActive.value
}

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  document.body.classList.toggle('dark', isDarkTheme.value)
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

onMounted(() => {
  if (isDarkTheme.value) {
    document.body.classList.add('dark')
  }
})

// Cart and favorites management
const cart = ref([])
const favorites = ref([])

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 VND'
  let formatted = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
  formatted = formatted.replace(/\./g, ' ')
  return `${formatted} VND`
}

const totalPrice = computed(() => {
  return cart.value.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0)
})

const addToCart = (item) => {
  const existingItemIndex = cart.value.findIndex(
    cartItem => cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
  )
  if (existingItemIndex > -1) {
    cart.value[existingItemIndex].quantity = (cart.value[existingItemIndex].quantity || 1) + 1
  } else {
    cart.value.push({ ...item, isAdded: true, quantity: 1 })
  }
}

const removeFromCart = (item) => {
  cart.value = cart.value.filter(
    cartItem => !(cartItem.id === item.id && cartItem.selectedSize === item.selectedSize)
  )
}

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const { data } = await axios.post('https://a5687b208ca7ac57.mokky.dev/favorites', item)
      favorites.value.push({ ...data, isFavorite: true })
      item.isFavorite = true
    } else {
      const favorite = favorites.value.find(fav => fav.parentId === item.id || fav.id === item.id)
      if (favorite) {
        await axios.delete(`https://a5687b208ca7ac57.mokky.dev/favorites/${favorite.id}`)
        favorites.value = favorites.value.filter(fav => fav.id !== favorite.id)
        item.isFavorite = false
      }
    }
  } catch (err) {
    console.error('Error with favorites:', err)
  }
}

const clearCart = () => {
  cart.value = []
  localStorage.removeItem('cart')
}

watch(
  cart,
  () => {
    localStorage.setItem('cart', JSON.stringify(cart.value))
  },
  { deep: true }
)

const loadCartFromLocalStorage = () => {
  const savedCart = localStorage.getItem('cart')
  if (savedCart) {
    cart.value = JSON.parse(savedCart)
    cart.value.forEach(item => {
      item.isAdded = true
    })
  }
}
loadCartFromLocalStorage()

provide('cartActions', {
  cart,
  favorites,
  addToCart,
  removeFromCart,
  addToFavorite,
  formatCurrency,
  clearCart,
  totalPrice
})

// Responsive handling
watch(route, () => {
  if (window.innerWidth <= 768 && isSidebarActive.value) {
    isSidebarActive.value = false
  }
})
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}
.main-content-wrapper {
  flex-grow: 1;
  padding-left: v-bind("showMainLayoutElements && isSidebarActive ? '280px' : '0'");
  width: 100vw;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.content-area {
  flex-grow: 1;
  padding: 20px;
  background-color: #ffffff;
  position: relative;
  z-index: 1;
}

.dark .content-area {
  background-color: #1f2937;
}

@media (max-width: 768px) {
  .main-content-wrapper {
    padding-left: 0 !important;
    width: 100vw !important;
  }
}
</style>
