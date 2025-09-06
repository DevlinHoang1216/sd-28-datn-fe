<template>
  <div class="app d-flex">
    <Sidebar v-if="showMainLayoutElements" :isSidebarActive="isSidebarActive" @toggle-sidebar="toggleSidebar" />

    <div :class="['main-content-wrapper', { 'full-width': !showMainLayoutElements || !isSidebarActive }]">
      <Header
        v-if="showMainLayoutElements"
        :total-price="totalPrice"
        :cart="cart"
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
import { ref, computed, watch, provide, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

// Import các Components
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

// Khởi tạo useRoute để theo dõi tuyến đường
const route = useRoute();

// --- Điều khiển hiển thị layout chính (Header, Sidebar, Footer) ---
// Một computed property duy nhất để kiểm soát tất cả các phần tử layout chính
const showMainLayoutElements = computed(() => {
  return route.path !== '/auth'; // Các phần tử này sẽ ẩn đi nếu đường dẫn hiện tại là '/auth'
});

// --- Sidebar và Theme ---
const isSidebarActive = ref(true);
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark');

const toggleSidebar = () => {
  isSidebarActive.value = !isSidebarActive.value;
};

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  document.body.classList.toggle('dark', isDarkTheme.value);
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
};

onMounted(() => {
  if (isDarkTheme.value) {
    document.body.classList.add('dark');
  }
});

// --- Quản lý Giỏ hàng và Đơn hàng ---
const cart = ref([]);
const favorites = ref([]);

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 VND';
  let formatted = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  formatted = formatted.replace(/\./g, ' ');
  return `${formatted} VND`;
};

const totalPrice = computed(() => {
  return cart.value.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
});

const addToCart = (item) => {
  const existingItemIndex = cart.value.findIndex(
    cartItem => cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
  );
  if (existingItemIndex > -1) {
    cart.value[existingItemIndex].quantity = (cart.value[existingItemIndex].quantity || 1) + 1;
  } else {
    cart.value.push({ ...item, isAdded: true, quantity: 1 });
  }
};

const removeFromCart = (item) => {
  cart.value = cart.value.filter(
    cartItem => !(cartItem.id === item.id && cartItem.selectedSize === item.selectedSize)
  );
};

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const { data } = await axios.post('https://a5687b208ca7ac57.mokky.dev/favorites', item);
      favorites.value.push({ ...data, isFavorite: true });
      item.isFavorite = true;
    } else {
      const favorite = favorites.value.find(fav => fav.parentId === item.id || fav.id === item.id);
      if (favorite) {
        await axios.delete(`https://a5687b208ca7ac57.mokky.dev/favorites/${favorite.id}`);
        favorites.value = favorites.value.filter(fav => fav.id !== favorite.id);
        item.isFavorite = false;
      }
    }
  } catch (err) {
    console.error('Error with favorites:', err);
  }
};

const clearCart = () => {
  cart.value = [];
  localStorage.removeItem('cart');
};

watch(
  cart,
  () => {
    localStorage.setItem('cart', JSON.stringify(cart.value));
  },
  { deep: true }
);

const loadCartFromLocalStorage = () => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart.value = JSON.parse(savedCart);
    cart.value.forEach(item => {
      item.isAdded = true;
    });
  }
};
loadCartFromLocalStorage();

provide('cartActions', {
  cart,
  favorites,
  addToCart,
  removeFromCart,
  addToFavorite,
  formatCurrency,
  clearCart,
  totalPrice,
});

// --- Xử lý Responsive ---
watch(route, () => {
  if (window.innerWidth <= 768 && isSidebarActive.value) {
    isSidebarActive.value = false;
  }
});
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}
.main-content-wrapper {
  flex-grow: 1;
  /* Nếu main layout elements không hiển thị, margin-left sẽ là 0 */
  margin-left: v-bind("showMainLayoutElements ? '250px' : '0'");
  margin-top: v-bind("showMainLayoutElements ? '60px' : '0'"); /* Chỉ có margin-top nếu Header hiển thị */
  max-width: v-bind("showMainLayoutElements ? 'calc(100vw - 250px)' : '100vw'");
  transition: margin-left 0.3s ease, max-width 0.3s ease, margin-top 0.3s ease;
}
/* Loại bỏ .full-width vì chúng ta dùng v-bind trực tiếp cho margin-left và max-width */
/* .main-content-wrapper.full-width {
  margin-left: 0;
  max-width: 100vw;
} */
.content-area {
  flex-grow: 1;
  padding: 20px;
  background-color: #ffffff;
}
.dark .content-area {
  background-color: #1f2937;
}
@media (max-width: 768px) {
  .main-content-wrapper {
    margin-left: 0 !important; /* Đảm bảo luôn bằng 0 trên mobile */
    max-width: 100vw !important; /* Đảm bảo luôn 100vw trên mobile */
  }
}
</style>
