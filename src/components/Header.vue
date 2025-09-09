<script setup>
import { useMainStore } from '../stores/MainStore.ts';
import { inject, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router'; // Đảm bảo đã import useRouter
import Loading from './Loading.vue';

const mainStore = useMainStore();
const { isDeviceMobile } = mainStore;
const emit = defineEmits(['openDrawer', 'toggle-sidebar', 'toggle-theme']);

const { formatCurrency } = inject('cartActions');


const currentDateTime = ref('');
let datetimeInterval = null;
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark');
const router = useRouter();

// --- Thêm ref để lưu thông tin người dùng và computed để kiểm tra trạng thái đăng nhập ---
const currentUser = ref(null); // Sẽ chứa { name: '...', email: '...' } hoặc null nếu chưa đăng nhập
const isRefreshing = ref(false); // Trạng thái loading khi làm mới dữ liệu

const isAuthenticated = computed(() => {
  return currentUser.value !== null;
});
// --- Kết thúc phần thêm mới ---

const updateDateTime = () => {
  currentDateTime.value = new Date().toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const refreshData = () => {
  // Close sidebar if it's open
  if (props.isSidebarActive) {
    emit('toggle-sidebar');
  }
  
  isRefreshing.value = true;
  // Simulate loading time before reload
  setTimeout(() => {
    window.location.reload();
  }, 1500);
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

// Add props to receive sidebar state
const props = defineProps({
  totalPrice: Number,
  cart: Array,
  isSidebarActive: Boolean, // Add this prop to track sidebar state
});
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
  <header class="modern-header">
    <div class="header-content">
      <div class="header-left">
        <button @click="emit('toggle-sidebar')" class="sidebar-toggle-btn">
          <div class="hamburger-menu" :class="{ 'active': props.isSidebarActive }">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      <div class="header-right">
        <div class="datetime-display hidden md:flex">
          <div class="datetime-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="datetime-text">{{ currentDateTime }}</span>
        </div>

        <div class="header-actions">
          <div class="user-menu-container">
            <button @click="navigateToAuth" class="user-menu-btn">
              <div class="user-avatar">
                <img src="/profile.svg" alt="User Avatar" />
              </div>
              <div class="user-info hidden md:block">
                <span class="user-name">{{ isAuthenticated ? currentUser.name : 'Guest' }}</span>
                <span class="user-status">{{ isAuthenticated ? 'Online' : 'Offline' }}</span>
              </div>
              <div class="dropdown-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
            
            <div class="user-dropdown" v-if="isAuthenticated || true">
              <div class="dropdown-header" v-if="isAuthenticated">
                <div class="user-avatar-large">
                  <img src="/profile.svg" alt="User Avatar" />
                </div>
                <div class="user-details">
                  <h4>{{ currentUser?.name || 'User' }}</h4> 
                  <p>{{ currentUser?.email || 'user@example.com' }}</p>
                </div>
              </div>
              
              <div class="dropdown-menu">
                <template v-if="isAuthenticated">
                  <router-link class="dropdown-item" to="/profile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Hồ sơ cá nhân
                  </router-link>
                  <router-link class="dropdown-item" to="/settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Cài đặt
                  </router-link>
                  <router-link class="dropdown-item" to="/orders">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <rect x="9" y="7" width="6" height="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Đơn hàng của tôi
                  </router-link>
                  <div class="dropdown-divider"></div>
                  <a @click.prevent="handleLogout" class="dropdown-item logout-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Đăng xuất
                  </a>
                </template>
                <template v-else>
                  <div class="dropdown-guest-header">
                    <div class="guest-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </div>
                    <div class="guest-info">
                      <h4>Khách</h4>
                      <p>Chưa đăng nhập</p>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <router-link class="dropdown-item" to="/auth">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="10,17 15,12 10,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Đăng nhập / Đăng ký
                  </router-link>
                  <router-link class="dropdown-item" to="/help">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Trợ giúp
                  </router-link>
                </template>
              </div>
            </div>
          </div>

          <button @click="toggleTheme" class="action-btn theme-toggle">
            <div class="btn-icon">
              <svg v-if="themeIcon === 'solar:sun-linear'" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </button>

          <button @click="refreshData" class="action-btn refresh-btn hidden md:flex">
            <div class="btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-width="2"/>
                <polyline points="1,20 1,14 7,14" stroke="currentColor" stroke-width="2"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </header>
  
  <!-- Loading component for refresh - moved outside header -->
  <Loading 
    :show="isRefreshing" 
    text="Đang làm mới dữ liệu..." 
    subtext="Trang sẽ được tải lại sau giây lát"
    :fullscreen="true"
  />
</template>

<style lang="scss" scoped>
.modern-header {
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 101;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 24px;
    max-width: 100%;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .sidebar-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 12px;
      background: rgba(0, 123, 255, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 123, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.2);
      }

      .hamburger-menu {
        width: 20px;
        height: 16px;
        position: relative;
        cursor: pointer;

        span {
          display: block;
          position: absolute;
          height: 2px;
          width: 100%;
          background: #007bff;
          border-radius: 2px;
          opacity: 1;
          left: 0;
          transform: rotate(0deg);
          transition: all 0.25s ease-in-out;

          &:nth-child(1) {
            top: 0px;
          }

          &:nth-child(2) {
            top: 7px;
          }

          &:nth-child(3) {
            top: 14px;
          }
        }

        &.active span {
          &:nth-child(1) {
            top: 7px;
            transform: rotate(135deg);
          }

          &:nth-child(2) {
            opacity: 0;
            left: -60px;
          }

          &:nth-child(3) {
            top: 7px;
            transform: rotate(-135deg);
          }
        }
      }
    }

    .brand-section {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .brand-title {
        font-size: 24px;
        font-weight: 700;
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
        line-height: 1;
      }

      .brand-subtitle {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .datetime-display {
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(15, 23, 42, 0.05);
      border-radius: 10px;
      border: 1px solid rgba(15, 23, 42, 0.1);

      .datetime-icon {
        color: #007bff;
        display: flex;
        align-items: center;
      }

      .datetime-text {
        font-size: 13px;
        font-weight: 500;
        color: #475569;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-menu-container {
        position: relative;

        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 1);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);

            .dropdown-arrow {
              transform: rotate(180deg);
            }
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #e2e8f0;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .user-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;

            .user-name {
              font-size: 14px;
              font-weight: 600;
              color: #1e293b;
              line-height: 1;
            }

            .user-status {
              font-size: 11px;
              color: #10b981;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          }

          .dropdown-arrow {
            color: #64748b;
            transition: transform 0.3s ease;
          }
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 280px;
          min-height: 120px;
          max-height: 400px;
          background: #ffffff;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(15, 23, 42, 0.15);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px) scale(0.95);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1001;
          overflow: hidden;

          .dropdown-header {
            padding: 20px;
            border-bottom: 1px solid rgba(15, 23, 42, 0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            background: #f8fafc;

            .user-avatar-large {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              overflow: hidden;
              border: 3px solid #e2e8f0;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }

            .user-details {
              h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
                line-height: 1.2;
              }

              p {
                margin: 4px 0 0 0;
                font-size: 13px;
                color: #64748b;
              }
            }
          }

          .dropdown-menu {
            padding: 8px;
            background: #ffffff;

            .dropdown-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 16px;
              border-radius: 10px;
              text-decoration: none;
              color: #374151;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.2s ease;
              cursor: pointer;

              &:hover {
                background: rgba(0, 123, 255, 0.1);
                color: #007bff;
                transform: translateX(4px);
              }

              &.logout-item:hover {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
              }

              svg {
                flex-shrink: 0;
                opacity: 0.7;
              }
            }

            .dropdown-divider {
              height: 1px;
              background: rgba(15, 23, 42, 0.15);
              margin: 8px 0;
            }
          }

          .dropdown-guest-header {
            padding: 20px;
            border-bottom: 1px solid rgba(15, 23, 42, 0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            background: #f8fafc;

            .guest-avatar {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: rgba(0, 123, 255, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #007bff;
            }

            .guest-info {
              h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
                line-height: 1.2;
              }

              p {
                margin: 4px 0 0 0;
                font-size: 13px;
                color: #64748b;
              }
            }
          }
        }

        &:hover .user-dropdown,
        .user-dropdown:hover {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }
        
        .user-dropdown:hover {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }
      }

      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(15, 23, 42, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .btn-icon {
          color: #64748b;
          display: flex;
          align-items: center;
          transition: color 0.3s ease;
        }

        &.theme-toggle:hover .btn-icon {
          color: #f59e0b;
        }

        &.refresh-btn:hover .btn-icon {
          color: #10b981;
        }
      }
    }
  }
}

// Dark theme styles
.dark .modern-header {
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-left {
    .sidebar-toggle-btn {
      background: rgba(0, 123, 255, 0.2);

      &:hover {
        background: rgba(0, 123, 255, 0.3);
      }
    }

    .brand-subtitle {
      color: #94a3b8;
    }
  }

  .header-right {
    .datetime-display {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .datetime-text {
        color: #cbd5e1;
      }
    }

    .user-menu-container {
      .user-menu-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-info {
          .user-name {
            color: #f1f5f9;
          }
        }

        .dropdown-arrow {
          color: #94a3b8;
        }
      }

      .user-dropdown {
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);

        .dropdown-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);

          .user-details {
            h4 {
              color: #f1f5f9;
            }

            p {
              color: #94a3b8;
            }
          }
        }

        .dropdown-menu {
          .dropdown-item {
            color: #cbd5e1;

            &:hover {
              background: rgba(0, 123, 255, 0.2);
              color: #66b3ff;
            }

            &.logout-item:hover {
              background: rgba(239, 68, 68, 0.2);
              color: #fca5a5;
            }
          }

          .dropdown-divider {
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .btn-icon {
        color: #94a3b8;
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .modern-header {
    .header-content {
      padding: 0 16px;
    }

    .header-left {
      gap: 12px;

      .brand-section {
        .brand-title {
          font-size: 20px;
        }
      }
    }

    .header-right {
      gap: 8px;

      .user-menu-container .user-dropdown {
        min-width: 260px;
        right: -20px;
      }
    }
  }

  .hidden.md\:flex,
  .hidden.md\:block {
    display: none !important;
  }
}
</style>