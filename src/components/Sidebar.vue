<template>
  <aside :class="['sidebar', { 'active': isSidebarActive, 'sidebar-hidden': !isSidebarActive }]" aria-label="Main navigation">
    <div class="sidebar-logo">
      <img src="/src/assets/images/Pho-Step_logo.png" alt="Logo Pho Tiep" class="img-fluid" style="max-width: 150px;">
    </div>
    <div class="sidebar-menu-header">MENU CHÍNH</div>
    <div v-for="item in menuItems" :key="item.path || item.label" class="sidebar-menu-item-wrapper">
      <router-link
        v-if="!item.children"
        :to="item.path"
        class="sidebar-menu-item"
        :class="{ 'active': isActive(item) }"
        :aria-current="isActive(item) ? 'page' : null"
        @click="handleMenuClick"
      >
        <iconify-icon :icon="item.icon" class="me-2" aria-hidden="true"></iconify-icon>
        {{ item.label }}
      </router-link>
      <div v-else>
        <a
          href="#"
          class="sidebar-menu-item"
          :class="{ 'active': isActive(item) }"
          @click.prevent="toggleSubMenu(item)"
          :aria-expanded="item.expanded ? 'true' : 'false'"
          :aria-controls="`submenu-${item.label.replace(/\s/g, '-')}`"
        >
          <iconify-icon :icon="item.icon" class="me-2" aria-hidden="true"></iconify-icon>
          {{ item.label }}
          <iconify-icon
            :icon="item.expanded ? 'solar:alt-arrow-up-outline' : 'solar:alt-arrow-down-outline'"
            class="ms-auto"
            aria-hidden="true"
          ></iconify-icon>
        </a>
        <div v-if="item.children" :class="['sidebar-submenu', { 'sidebar-submenu-expanded': item.expanded }]" :id="`submenu-${item.label.replace(/\s/g, '-')}`">
          <router-link
            v-for="subItem in item.children"
            :key="subItem.path"
            :to="subItem.path"
            class="sidebar-menu-item sidebar-submenu-item"
            :class="{ 'active': $route.path === subItem.path }"
            :aria-current="$route.path === subItem.path ? 'page' : null"
            @click="handleMenuClick"
          >
            <iconify-icon v-if="subItem.icon" :icon="subItem.icon" class="me-2" aria-hidden="true"></iconify-icon>
            {{ subItem.label }}
          </router-link>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  props: {
    isSidebarActive: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['toggle-sidebar'],
  data() {
    return {
      menuItems: [
        { path: '/dashboard', label: 'Thống kê', icon: 'solar:home-smile-outline' },
        { path: '/dot-giam-gia', label: 'Đợt Giảm Giá', icon: 'solar:sale-outline' },
        { path: '/ban-tai-quay', label: 'Bán Tại Quầy', icon: 'solar:shop-outline' },
        {
          path: '/quan-ly-san-pham',
          label: 'Quản Lý Sản Phẩm',
          icon: 'solar:box-minimalistic-outline',
        },
        // Thêm mục 'Thuộc tính' với các mục con và icon cho từng mục con
        {
          label: 'Thuộc tính',
          icon: 'solar:tag-outline', // Icon cho mục thuộc tính chính
          expanded: true, // Đặt thành true để mở rộng mặc định
          children: [
            { path: '/thuoc-tinh/hang', label: 'Hãng', icon: 'mdi:factory' }, // Đã thay đổi icon cho Hãng
            { path: '/thuoc-tinh/mau-sac', label: 'Màu sắc', icon: 'solar:palette-outline' },
            { path: '/thuoc-tinh/kich-co', label: 'Kích cỡ', icon: 'solar:ruler-outline' },
            { path: '/thuoc-tinh/chat-lieu', label: 'Chất liệu', icon: 'mdi:tshirt-crew-outline' }, // Đã thay đổi icon cho Chất liệu
            { path: '/thuoc-tinh/danh-muc', label: 'Danh mục', icon: 'solar:folder-outline' },
          ],
        },
        { path: '/hoa-don', label: 'Hóa Đơn', icon: 'solar:document-outline' },
        { path: '/phieu-giam-gia', label: 'Phiếu Giảm Giá', icon: 'solar:tag-horizontal-outline' },
        { path: '/nhan-vien', label: 'Nhân Viên', icon: 'solar:users-group-rounded-outline' },
        { path: '/khach-hang', label: 'Khách Hàng', icon: 'solar:user-outline' },
      ],
    };
  },
  methods: {
    isActive(item) {
      // Kiểm tra nếu route hiện tại khớp với path của item hoặc bất kỳ path con nào
      return (
        this.$route.path === item.path ||
        (item.children && item.children.some(child => this.$route.path === child.path))
      );
    },
    handleMenuClick() {
      // Đóng sidebar trên mobile khi click vào menu
      if (window.innerWidth <= 768 && this.isSidebarActive) {
        this.$emit('toggle-sidebar');
      }
    },
    toggleSubMenu(item) {
      // Đảo ngược trạng thái mở rộng của submenu
      item.expanded = !item.expanded;
    },
  },
  watch: {
    // Đóng tất cả các submenu khi route thay đổi
    '$route.path': {
      handler() {
        // Chỉ đóng submenu nếu nó không phải là submenu của mục hiện tại đang active
        this.menuItems.forEach(item => {
          if (item.children) {
            const isCurrentPathInSubmenu = item.children.some(child => this.$route.path.startsWith(child.path));
            if (item.expanded && !isCurrentPathInSubmenu) {
              item.expanded = false;
            }
          }
        });
      },
      immediate: true, // Chạy ngay khi component được tạo
    },
  },
};
</script>

<style scoped>
/* Các style hiện có */
.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #ffffff;
  color: #000000;
  transition: transform 0.3s ease;
  z-index: 1001;
  overflow-y: auto;
}
.dark .sidebar {
  background-color: #1f2937;
  color: #e5e7eb;
}
.sidebar-hidden {
  transform: translateX(-250px);
}
.sidebar.active {
  transform: translateX(0);
}
.sidebar-logo {
  padding: 20px;
  text-align: center;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.dark .sidebar-logo {
  background: #1f2937;
}
.sidebar-menu-header {
  color: #6b7280;
  font-weight: 600;
  padding: 10px 20px;
  text-transform: uppercase;
  font-size: 0.75rem;
}
.dark .sidebar-menu-header {
  color: #a0aec0;
}
.sidebar-menu-item-wrapper {
  margin-bottom: 5px;
}
.sidebar-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #000000;
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-size: 0.95rem;
}
.dark .sidebar-menu-item {
  color: #e5e7eb;
}
.sidebar-menu-item:hover {
  background-color: #f0f0f0;
  color: #2563eb;
}
.dark .sidebar-menu-item:hover {
  background-color: #374151;
  color: #60a5fa;
}
.sidebar-menu-item.active {
  background-color: #e6f0ff;
  color: #2563eb;
  font-weight: 600;
}
.dark .sidebar-menu-item.active {
  background-color: #374151;
  color: #60a5fa;
}
.sidebar-menu-item iconify-icon {
  font-size: 1.25rem;
  color: #6b7280;
}
.dark .sidebar-menu-item iconify-icon {
  color: #d1d5db;
}
.sidebar-menu-item:hover iconify-icon,
.sidebar-menu-item.active iconify-icon {
  color: #2563eb;
}
.dark .sidebar-menu-item:hover iconify-icon,
.dark .sidebar-menu-item.active iconify-icon {
  color: #60a5fa;
}
.sidebar-submenu {
  padding-left: 2rem;
  /* Thêm transition cho submenu để tạo hiệu ứng mượt mà khi mở/đóng */
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}
/* Khi submenu được mở */
.sidebar-submenu-expanded {
  max-height: 500px; /* Đặt một giá trị đủ lớn để chứa tất cả các mục con */
  transition: max-height 0.3s ease-in;
}
.sidebar-submenu-item {
  font-size: 0.9rem;
  padding: 8px 20px;
  display: flex; /* Đảm bảo icon và text nằm trên cùng một hàng */
  align-items: center; /* Căn chỉnh icon và text theo chiều dọc */
}
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    top: 60px;
    left: -100%;
    transition: left 0.3s ease;
  }
  .sidebar.active {
    left: 0;
  }
}
</style>
