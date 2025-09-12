<template>
  <aside :class="['modern-sidebar', { 'sidebar-open': isSidebarActive, 'sidebar-closed': !isSidebarActive }]" aria-label="Main navigation">
    <div class="sidebar-backdrop" v-if="isSidebarActive" @click="$emit('toggle-sidebar')"></div>
    
    <div class="sidebar-content">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-wrapper">
            <img src="/src/assets/images/Pho-Step_logo.png" alt="PhoStep Logo" class="logo-image">
          </div>
        </div>
      </div>

      <div class="sidebar-navigation">
        <div class="nav-section">
          <div class="nav-section-header">
            <span class="section-title">ĐIỀU HƯỚNG CHÍNH</span>
            <div class="section-line"></div>
          </div>

          <nav class="nav-menu">
            <div v-for="item in menuItems" :key="item.path || item.label" class="menu-item-container">
              <router-link
                v-if="!item.children"
                :to="item.path"
                class="menu-item"
                :class="{ 'menu-item-active': isActive(item) }"
                @click="handleMenuClick"
              >
                <div class="menu-item-content">
                  <div class="menu-icon">
                    <iconify-icon :icon="item.icon"></iconify-icon>
                  </div>
                  <span class="menu-label">{{ item.label }}</span>
                </div>
                <div class="menu-item-indicator"></div>
              </router-link>

              <div v-else class="menu-group">
                <button
                  class="menu-item menu-group-toggle"
                  :class="{ 'menu-item-active': isActive(item), 'menu-group-expanded': item.expanded }"
                  @click="toggleSubMenu(item)"
                >
                  <div class="menu-item-content">
                    <div class="menu-icon">
                      <iconify-icon :icon="item.icon"></iconify-icon>
                    </div>
                    <span class="menu-label">{{ item.label }}</span>
                  </div>
                  <div class="menu-expand-icon">
                    <iconify-icon 
                      :icon="item.expanded ? 'solar:alt-arrow-up-outline' : 'solar:alt-arrow-down-outline'"
                      class="expand-arrow"
                    ></iconify-icon>
                  </div>
                </button>

                <div class="submenu-container" :class="{ 'submenu-expanded': item.expanded }">
                  <div class="submenu-content">
                    <router-link
                      v-for="subItem in item.children"
                      :key="subItem.path"
                      :to="subItem.path"
                      class="submenu-item"
                      :class="{ 'submenu-item-active': $route.path === subItem.path }"
                      @click="handleMenuClick"
                    >
                      <div class="submenu-item-content">
                        <div class="submenu-dot"></div>
                        <div class="submenu-icon" v-if="subItem.icon">
                          <iconify-icon :icon="subItem.icon"></iconify-icon>
                        </div>
                        <span class="submenu-label">{{ subItem.label }}</span>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="footer-content">
          <div class="user-profile">
            <div class="user-avatar">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="User Avatar" class="avatar-image">
              <div class="status-indicator"></div>
            </div>
            <div class="user-info">
              <div class="user-name">Admin User</div>
              <div class="user-role">Quản trị viên</div>
            </div>
            <div class="user-actions">
              <button class="action-btn" title="Cài đặt">
                <iconify-icon icon="solar:settings-outline"></iconify-icon>
              </button>
              <button class="action-btn logout-btn" title="Đăng xuất">
                <iconify-icon icon="solar:logout-2-outline"></iconify-icon>
              </button>
            </div>
          </div>
          <div class="version-info">
            <span class="version-text">PhoStep v2.0.1</span>
          </div>
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
        { path: '/thong-ke', label: 'Thống kê', icon: 'solar:home-smile-outline' },
        { path: '/ban-tai-quay', label: 'Bán Tại Quầy', icon: 'solar:shop-outline' },
        { path: '/hoa-don', label: 'Quản Lý Hóa Đơn', icon: 'solar:document-outline' },
        {
          path: '/san-pham',
          label: 'Quản Lý Sản Phẩm',
          icon: 'solar:box-minimalistic-outline',
        },
        // Thêm mục 'Thuộc tính' với các mục con và icon cho từng mục con
        {
          label: 'Quản Lý Thuộc Tính',
          icon: 'solar:tag-outline', // Icon cho mục thuộc tính chính
          expanded: true, // Đặt thành true để mở rộng mặc định
          children: [
            { path: '/thuoc-tinh/thuong-hieu', label: 'Thương Hiệu', icon: 'mdi:factory' }, // Đã thay đổi icon cho Thương Hiệu
            { path: '/thuoc-tinh/mau-sac', label: 'Màu Sắc', icon: 'solar:palette-outline' },
            { path: '/thuoc-tinh/kich-co', label: 'Kích Cỡ', icon: 'solar:ruler-outline' },
            { path: '/thuoc-tinh/chat-lieu', label: 'Chất Liệu', icon: 'mdi:tshirt-crew-outline' }, // Đã thay đổi icon cho Chất liệu
            { path: '/thuoc-tinh/danh-muc', label: 'Danh Mục', icon: 'solar:folder-outline' },
            { path: '/thuoc-tinh/de-giay', label: 'Đế Giày', icon: 'solar:layers-bold-duotone' },
          ],
        },
        { path: '/phieu-giam-gia', label: 'Quản Lý Phiếu Giảm Giá', icon: 'solar:tag-horizontal-outline' },
        { path: '/dot-giam-gia', label: 'Quản Lý Đợt Giảm Giá', icon: 'solar:sale-outline' },
        { path: '/nhan-vien', label: 'Quản Lý Nhân Viên', icon: 'solar:users-group-rounded-outline' },
        { path: '/khach-hang', label: 'Quản Lý Khách Hàng', icon: 'solar:user-outline' },
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

<style lang="scss" scoped>
.modern-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  z-index: 100;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: -1;
  }

  .sidebar-content {
    height: 100%;
    width: 100%;
    background: linear-gradient(180deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(248, 250, 252, 0.95) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-right: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    border-bottom: 1px solid rgba(226, 232, 240, 0.5);
    background: rgba(255, 255, 255, 0.8);

    .logo-container {
      display: flex;
      align-items: center;
      gap: 16px;

      .logo-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .logo-image {
          width: 200px;
          height: 100px;
          object-fit: contain;
        }
      }

    }
  }

  .sidebar-navigation {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.3);
      border-radius: 2px;
    }

    .nav-section {
      padding: 0 20px;

      .nav-section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .section-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, 
            rgba(148, 163, 184, 0.3) 0%, 
            transparent 100%);
        }
      }

      .nav-menu {
        .menu-item-container {
          margin-bottom: 4px;

          .menu-item {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-radius: 12px;
            text-decoration: none;
            color: #475569;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            border: none;
            background: transparent;
            width: 100%;

            .menu-item-content {
              display: flex;
              align-items: center;
              gap: 12px;
              flex: 1;

              .menu-icon {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #64748b;
                font-size: 18px;
                transition: all 0.3s ease;
              }

              .menu-label {
                font-weight: 500;
                transition: all 0.3s ease;
              }
            }

            .menu-item-indicator {
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 0;
              background: linear-gradient(180deg, #007bff 0%, #0056b3 100%);
              border-radius: 0 2px 2px 0;
              transition: all 0.3s ease;
            }

            .menu-expand-icon {
              color: #94a3b8;
              font-size: 16px;
              transition: all 0.3s ease;

              .expand-arrow {
                transition: transform 0.3s ease;
              }
            }

            &:hover {
              background: rgba(0, 123, 255, 0.08);
              color: #007bff;
              transform: translateX(4px);

              .menu-icon {
                color: #007bff;
                transform: scale(1.1);
              }

              .menu-expand-icon {
                color: #007bff;
              }
            }

            &.menu-item-active {
              background: linear-gradient(135deg, 
                rgba(0, 123, 255, 0.15) 0%, 
                rgba(0, 86, 179, 0.1) 100%);
              color: #007bff;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);

              .menu-icon {
                color: #007bff;
                transform: scale(1.1);
              }

              .menu-item-indicator {
                height: 20px;
              }

              .menu-expand-icon {
                color: #007bff;
              }
            }

            &.menu-group-expanded {
              .expand-arrow {
                transform: rotate(180deg);
              }
            }
          }

          .menu-group {
            .submenu-container {
              max-height: 0;
              overflow: hidden;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              margin-top: 4px;

              .submenu-content {
                padding: 8px 0 8px 12px;
                border-left: 2px solid rgba(0, 123, 255, 0.1);
                margin-left: 16px;

                .submenu-item {
                  display: flex;
                  align-items: center;
                  padding: 10px 16px;
                  border-radius: 8px;
                  text-decoration: none;
                  color: #64748b;
                  font-size: 13px;
                  font-weight: 500;
                  transition: all 0.3s ease;
                  margin-bottom: 2px;

                  .submenu-item-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .submenu-dot {
                      width: 6px;
                      height: 6px;
                      border-radius: 50%;
                      background: #cbd5e1;
                      transition: all 0.3s ease;
                    }

                    .submenu-icon {
                      width: 16px;
                      height: 16px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 14px;
                      color: #94a3b8;
                      transition: all 0.3s ease;
                    }

                    .submenu-label {
                      transition: all 0.3s ease;
                    }
                  }

                  &:hover {
                    background: rgba(0, 123, 255, 0.06);
                    color: #007bff;
                    transform: translateX(4px);

                    .submenu-dot {
                      background: #007bff;
                      transform: scale(1.3);
                    }

                    .submenu-icon {
                      color: #007bff;
                    }
                  }

                  &.submenu-item-active {
                    background: rgba(0, 123, 255, 0.1);
                    color: #007bff;
                    font-weight: 600;

                    .submenu-dot {
                      background: #007bff;
                      transform: scale(1.3);
                      box-shadow: 0 0 8px rgba(0, 123, 255, 0.4);
                    }

                    .submenu-icon {
                      color: #007bff;
                    }
                  }
                }
              }

              &.submenu-expanded {
                max-height: 400px;
              }
            }
          }
        }
      }
    }
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid rgba(226, 232, 240, 0.5);
    background: rgba(248, 250, 252, 0.8);

    .footer-content {
      .user-profile {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 16px;
        border: 1px solid rgba(226, 232, 240, 0.6);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        margin-bottom: 12px;

        &:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .user-avatar {
          position: relative;
          flex-shrink: 0;

          .avatar-image {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            object-fit: cover;
            border: 2px solid rgba(0, 123, 255, 0.2);
            transition: all 0.3s ease;
          }

          .status-indicator {
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #10b981;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }

        .user-info {
          flex: 1;
          min-width: 0;

          .user-name {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .user-role {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .user-actions {
          display: flex;
          gap: 4px;

          .action-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(148, 163, 184, 0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #64748b;
            font-size: 16px;

            &:hover {
              background: rgba(0, 123, 255, 0.1);
              color: #007bff;
              transform: scale(1.05);
            }

            &.logout-btn:hover {
              background: rgba(239, 68, 68, 0.1);
              color: #ef4444;
            }
          }
        }
      }

      .version-info {
        text-align: center;
        padding: 8px 0;

        .version-text {
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }
  }

  // Closed state
  &.sidebar-closed {
    transform: translateX(-100%);

    @media (max-width: 768px) {
      .sidebar-backdrop {
        opacity: 0;
        visibility: hidden;
      }
    }
  }

  // Open state
  &.sidebar-open {
    transform: translateX(0);

    @media (max-width: 768px) {
      .sidebar-backdrop {
        opacity: 1;
        visibility: visible;
      }
    }
  }
}

// Dark theme styles
.dark .modern-sidebar {
  .sidebar-content {
    background: linear-gradient(180deg, 
      rgba(15, 23, 42, 0.95) 0%, 
      rgba(30, 41, 59, 0.95) 100%);
    border-right: 1px solid rgba(71, 85, 105, 0.5);
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .sidebar-header {
    background: rgba(15, 23, 42, 0.8);
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);

    .logo-container {
      .logo-wrapper {
        .logo-image {
          filter: brightness(0) invert(1);
        }
      }
    }
  }

  .sidebar-navigation {
    .nav-section {
      .nav-section-header {
        .section-title {
          color: #94a3b8;
        }

        .section-line {
          background: linear-gradient(90deg, 
            rgba(148, 163, 184, 0.2) 0%, 
            transparent 100%);
        }
      }

      .nav-menu {
        .menu-item-container {
          .menu-item {
            color: #cbd5e1;

            .menu-item-content {
              .menu-icon {
                color: #94a3b8;
              }
            }

            .menu-expand-icon {
              color: #64748b;
            }

            &:hover {
              background: rgba(0, 123, 255, 0.15);
              color: #66b3ff;

              .menu-icon {
                color: #66b3ff;
              }

              .menu-expand-icon {
                color: #66b3ff;
              }
            }

            &.menu-item-active {
              background: linear-gradient(135deg, 
                rgba(0, 123, 255, 0.2) 0%, 
                rgba(0, 86, 179, 0.15) 100%);
              color: #66b3ff;

              .menu-icon {
                color: #66b3ff;
              }

              .menu-expand-icon {
                color: #66b3ff;
              }
            }
          }

          .menu-group {
            .submenu-container {
              .submenu-content {
                border-left: 2px solid rgba(0, 123, 255, 0.2);

                .submenu-item {
                  color: #94a3b8;

                  .submenu-item-content {
                    .submenu-dot {
                      background: #64748b;
                    }

                    .submenu-icon {
                      color: #64748b;
                    }
                  }

                  &:hover {
                    background: rgba(0, 123, 255, 0.1);
                    color: #66b3ff;

                    .submenu-dot {
                      background: #66b3ff;
                    }

                    .submenu-icon {
                      color: #66b3ff;
                    }
                  }

                  &.submenu-item-active {
                    background: rgba(0, 123, 255, 0.15);
                    color: #66b3ff;

                    .submenu-dot {
                      background: #66b3ff;
                    }

                    .submenu-icon {
                      color: #66b3ff;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .sidebar-footer {
    background: rgba(15, 23, 42, 0.8);
    border-top: 1px solid rgba(71, 85, 105, 0.3);

    .footer-content {
      .user-profile {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(71, 85, 105, 0.4);

        &:hover {
          background: rgba(30, 41, 59, 0.9);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .user-avatar {
          .avatar-image {
            border: 2px solid rgba(102, 179, 255, 0.3);
          }

          .status-indicator {
            background: #10b981;
            border: 2px solid #1e293b;
          }
        }

        .user-info {
          .user-name {
            color: #f1f5f9;
          }

          .user-role {
            color: #94a3b8;
          }
        }

        .user-actions {
          .action-btn {
            background: rgba(71, 85, 105, 0.3);
            color: #94a3b8;

            &:hover {
              background: rgba(102, 179, 255, 0.2);
              color: #66b3ff;
            }

            &.logout-btn:hover {
              background: rgba(239, 68, 68, 0.2);
              color: #fca5a5;
            }
          }
        }
      }

      .version-info {
        .version-text {
          color: #64748b;
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .modern-sidebar {
    width: 100%;
    max-width: 320px;

    &.sidebar-closed {
      transform: translateX(-100%);
    }

    &.sidebar-open {
      transform: translateX(0);
    }
  }
}
</style>
