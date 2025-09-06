<script setup>
import { useMainStore } from '../stores/MainStore.ts';
import { inject, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router'; // Đảm bảo đã import useRouter

const mainStore = useMainStore();
const { isDeviceMobile } = mainStore;
const emit = defineEmits(['openDrawer', 'toggle-sidebar', 'toggle-theme']);

const { formatCurrency } = inject('cartActions');

defineProps({
  totalPrice: Number,
  cart: Array,
});

const currentDateTime = ref('');
let datetimeInterval = null;
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark');
const router = useRouter();

// --- Thêm ref để lưu thông tin người dùng và computed để kiểm tra trạng thái đăng nhập ---
const currentUser = ref(null); // Sẽ chứa { name: '...', email: '...' } hoặc null nếu chưa đăng nhập

const isAuthenticated = computed(() => {
  return currentUser.value !== null;
});
// --- Kết thúc phần thêm mới ---

const updateDateTime = () => {
  currentDateTime.value = new Date().toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const refreshData = () => {
  alert('Đang làm mới dữ liệu...'); // Thay bằng toast nếu cần
  setTimeout(() => window.location.reload(), 1500);
};

const themeIcon = computed(() => {
  return isDarkTheme.value ? 'solar:sun-linear' : 'solar:moon-linear';
});

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  emit('toggle-theme');
};

// Hàm điều hướng đến AuthForm (chỉ khi chưa đăng nhập)
const navigateToAuth = () => {
  if (!isAuthenticated.value) { // Chỉ chuyển hướng nếu chưa đăng nhập
    router.push('/auth');
  }
  // Nếu đã đăng nhập, click vào nút sẽ mở dropdown, không cần chuyển hướng
};

const navigateToFavorites = () => {
  router.push('/favorites');
};

// --- Thêm hàm xử lý đăng xuất ---
const handleLogout = () => {
  localStorage.removeItem('user'); // Xóa thông tin người dùng khỏi localStorage
  currentUser.value = null; // Cập nhật trạng thái người dùng
  router.push('/auth'); // Chuyển hướng về trang đăng nhập/đăng ký
};
// --- Kết thúc phần thêm mới ---

onMounted(() => {
  updateDateTime();
  datetimeInterval = setInterval(updateDateTime, 1000);
  if (isDarkTheme.value) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  // --- Tải thông tin người dùng khi component được mount ---
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser);
  }
  // --- Kết thúc phần thêm mới ---
});

onBeforeUnmount(() => {
  clearInterval(datetimeInterval);
});
</script>

<template>
  <header class="header px-4 py-3 flex justify-between items-center border-b border-slate-200">
    <div class="flex items-center gap-3">
      <button @click="emit('toggle-sidebar')" class="btn btn-link text-gray-500 hover:text-black">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div class="flex items-center gap-6">
      <span class="text-gray-500 text-sm hidden md:block">{{ currentDateTime }}</span>

      <div class="relative group">
        <button @click="navigateToAuth" class="flex items-center gap-2 text-gray-500 hover:text-black cursor-pointer">
          <img src="/profile.svg" alt="User Avatar" class="w-6 h-6 rounded-full" />
          <span class="hidden md:block">{{ isAuthenticated ? currentUser.name : 'Guest' }}</span>
        </button>
        <ul class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <template v-if="isAuthenticated">
            <li><span class="block px-4 py-2 text-gray-800 font-semibold">{{ currentUser.name }}</span></li>
            <li><span class="block px-4 py-2 text-gray-600 text-sm">{{ currentUser.email }}</span></li>
            <li class="border-t border-gray-200 my-1"></li>
            <li><router-link class="block px-4 py-2 text-gray-700 hover:bg-gray-100" to="/settings">Cài đặt</router-link></li>
            <li><a @click.prevent="handleLogout" class="block px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer">Đăng xuất</a></li>
          </template>
          <template v-else>
            <li><router-link class="block px-4 py-2 text-gray-700 hover:bg-gray-100" to="/auth">Đăng nhập / Đăng ký</router-link></li>
          </template>
        </ul>
      </div>

      <button @click="toggleTheme" class="btn btn-link text-gray-500 hover:text-black">
        <svg v-if="themeIcon === 'solar:sun-linear'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4.93 4.93L6.344 6.344" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17.657 17.657L19.071 19.071" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4.93 19.07L6.344 17.656" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17.657 6.343L19.071 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79C20.67 14.68 19.78 16.4 18.39 17.6C17.01 18.8 15.22 19.5 13.33 19.5C9.7 19.5 6.7 16.5 6.7 12.87C6.7 9.25 9.7 6.25 13.33 6.25C15.22 6.25 17.01 6.95 18.39 8.15C19.78 9.35 20.67 11.07 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button @click="refreshData" class="btn btn-link text-gray-500 hover:text-black hidden md:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12H17.75M3 12H6.25M12 21V17.75M12 3V6.25M17.657 17.657L19.071 19.071M4.929 4.929L6.343 6.343M19.071 4.929L17.657 6.343M6.343 17.657L4.929 19.071" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  background: #fff;
  top: 0;
  z-index: 2;
}

.dark .header {
  background: #1f2937;
  border-color: #4a5568;
}

/* Đảm bảo dropdown hiện lên khi hover */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
.group:hover .group-hover\:pointer-events-auto {
  pointer-events: auto;
}

@media screen and (max-width: 768px) {
  .header {
    padding-left: 15px;
    padding-right: 15px;
  }
  .hidden.md\:block {
    display: none !important;
  }
}
</style>