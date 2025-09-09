<template>
  <div class="quan-ly-danh-muc-container">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Quản Lý Danh Mục"
      page-description="Hệ thống quản lý danh mục sản phẩm cho Shop Giày"
      page-icon="solar:folder-2-bold-duotone"
      :page-stats="pageStats"
      :actions="breadcrumbActions"
    />

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <iconify-icon icon="solar:filter-bold-duotone"></iconify-icon>
          Bộ Lọc Danh Mục
        </h3>
        <button class="reset-filter-btn" @click="resetFilters">
          <iconify-icon icon="solar:refresh-bold-duotone"></iconify-icon>
          Đặt lại bộ lọc
        </button>
      </div>
      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Tìm kiếm</label>
            <input 
              type="text" 
              v-model="filters.search" 
              class="filter-input"
              placeholder="Tìm theo tên hoặc mã danh mục..."
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <select v-model="filters.status" class="filter-select">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang sử dụng</option>
              <option value="inactive">Ngừng sử dụng</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Sắp xếp theo</label>
            <select v-model="filters.sortBy" class="filter-select">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="code_asc">Mã A-Z</option>
              <option value="code_desc">Mã Z-A</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Categories Table -->
      <div class="categories-section">
        <div class="section-header">
          <h3 class="section-title">
            <iconify-icon icon="solar:folder-2-bold-duotone"></iconify-icon>
            Danh Sách Danh Mục ({{ filteredCategories.length }})
          </h3>
        </div>

        <!-- Data Table -->
        <DataTable
          :data="filteredCategories"
          :columns="tableColumns"
          item-label="danh mục"
          empty-message="Không tìm thấy danh mục nào."
          key-field="id"
        >
          <template #stt="{ rowIndex }">
            {{ rowIndex }}
          </template>
          <template #code="{ item }">
            <span class="category-code">{{ item.code }}</span>
          </template>
          <template #name="{ item }">
            <div class="table-category-info">
              <span class="table-category-name">{{ item.name }}</span>
            </div>
          </template>
          <template #description="{ item }">
            <span class="description">{{ item.description }}</span>
          </template>
          <template #productCount="{ item }">
            <span class="product-count">{{ item.productCount }}</span>
          </template>
          <template #status="{ item }">
            <span class="status-badge" :class="item.status">
              {{ getStatusLabel(item.status) }}
            </span>
          </template>
          <template #createdAt="{ item }">
            <span class="date">{{ formatDate(item.createdAt) }}</span>
          </template>
          <template #actions="{ item }">
            <div class="actions">
              <button @click="editCategory(item)" class="action-btn edit" title="Chỉnh sửa">
                <iconify-icon icon="solar:pen-bold"></iconify-icon>
              </button>
              <button @click="deleteCategory(item)" class="action-btn delete" title="Xóa">
                <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showAddCategoryModal || showEditCategoryModal" class="modal-overlay" @click="closeCategoryForm">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:folder-2-bold-duotone"></iconify-icon>
            {{ showAddCategoryModal ? 'Thêm Danh Mục Mới' : 'Chỉnh Sửa Danh Mục' }}
          </h3>
          <button class="modal-close" @click="closeCategoryForm">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <form @submit.prevent="saveCategory" class="category-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Tên danh mục</label>
                <input 
                  type="text" 
                  v-model="categoryForm.name" 
                  class="form-input"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label required">Mã danh mục</label>
                <input 
                  type="text" 
                  v-model="categoryForm.code" 
                  class="form-input"
                  placeholder="Nhập mã danh mục"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select v-model="categoryForm.status" class="form-input">
                  <option value="active">Đang sử dụng</option>
                  <option value="inactive">Ngừng sử dụng</option>
                </select>
              </div>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Mô tả danh mục</label>
              <textarea 
                v-model="categoryForm.description" 
                class="form-textarea"
                placeholder="Nhập mô tả danh mục"
                rows="4"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn secondary" @click="closeCategoryForm">Hủy</button>
          <button type="button" class="btn primary" @click="saveCategory">
            <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
            {{ showAddCategoryModal ? 'Thêm danh mục' : 'Cập nhật' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-container small" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Xác nhận xóa danh mục</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <p>Bạn có chắc chắn muốn xóa danh mục <strong>{{ categoryToDelete?.name }}</strong> không?</p>
          <p class="warning-text">Hành động này không thể hoàn tác!</p>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showDeleteModal = false">Hủy bỏ</button>
          <button class="btn danger" @click="confirmDelete">
            <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';

export default {
  name: 'DanhMuc',
  components: {
    Breadcrumb,
    DataTable
  },
  setup() {
    const router = useRouter();
    const toast = useToast();

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Quản lý', path: '/quan-ly' },
      { label: 'Thuộc tính', path: '/attributes' },
      { label: 'Danh mục', path: '/attributes/danh-muc' }
    ]);

    const breadcrumbActions = ref([
      {
        label: 'Thêm danh mục',
        icon: 'solar:add-circle-bold-duotone',
        type: 'primary',
        handler: () => showAddCategoryModal.value = true
      },
      {
        label: 'Xuất Excel',
        icon: 'solar:file-download-bold-duotone',
        type: 'default',
        handler: () => exportToExcel()
      }
    ]);

    const pageStats = computed(() => [
      {
        value: categories.value.length.toString(),
        label: 'Tổng danh mục',
        icon: 'solar:folder-2-bold-duotone'
      },
      {
        value: categories.value.filter(c => c.status === 'active').length.toString(),
        label: 'Đang sử dụng',
        icon: 'solar:check-circle-bold-duotone'
      },
      {
        value: categories.value.filter(c => c.status === 'inactive').length.toString(),
        label: 'Ngừng sử dụng',
        icon: 'solar:close-circle-bold-duotone'
      },
      {
        value: Math.round((categories.value.filter(c => c.status === 'active').length / categories.value.length) * 100) + '%',
        label: 'Tỷ lệ sử dụng',
        icon: 'solar:chart-square-bold-duotone'
      }
    ]);

    // Table columns definition
    const tableColumns = ref([
      { key: 'stt', label: 'STT' },
      { key: 'code', label: 'Mã danh mục' },
      { key: 'name', label: 'Tên danh mục' },
      { key: 'description', label: 'Mô tả' },
      { key: 'productCount', label: 'Số lượng sản phẩm' },
      { key: 'status', label: 'Trạng thái' },
      { key: 'createdAt', label: 'Ngày tạo' },
      { key: 'actions', label: 'Thao tác' }
    ]);

    // Modals
    const showAddCategoryModal = ref(false);
    const showEditCategoryModal = ref(false);
    const showDeleteModal = ref(false);

    // Selected items
    const categoryToDelete = ref(null);

    // Filters
    const filters = ref({
      search: '',
      status: '',
      sortBy: 'newest'
    });

    // Form data
    const categoryForm = ref({
      name: '',
      code: '',
      status: 'active',
      description: ''
    });

    // Sample data - Fake categories data
    const categories = ref([
      {
        id: 1,
        code: 'DM001',
        name: 'Giày thể thao',
        description: 'Giày dành cho các hoạt động thể thao và tập luyện',
        productCount: 45,
        status: 'active',
        createdAt: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        code: 'DM002',
        name: 'Giày công sở',
        description: 'Giày trang trọng phù hợp cho môi trường công sở',
        productCount: 32,
        status: 'active',
        createdAt: '2024-01-14T11:15:00'
      },
      {
        id: 3,
        code: 'DM003',
        name: 'Giày cao gót',
        description: 'Giày cao gót thời trang cho phái nữ',
        productCount: 28,
        status: 'active',
        createdAt: '2024-01-13T09:20:00'
      },
      {
        id: 4,
        code: 'DM004',
        name: 'Giày sandal',
        description: 'Giày sandal thoáng mát cho mùa hè',
        productCount: 22,
        status: 'active',
        createdAt: '2024-01-12T14:45:00'
      },
      {
        id: 5,
        code: 'DM005',
        name: 'Giày boot',
        description: 'Giày boot phong cách và bảo vệ tốt',
        productCount: 18,
        status: 'active',
        createdAt: '2024-01-11T16:30:00'
      },
      {
        id: 6,
        code: 'DM006',
        name: 'Giày lười',
        description: 'Giày lười tiện lợi và thoải mái',
        productCount: 15,
        status: 'active',
        createdAt: '2024-01-10T08:15:00'
      },
      {
        id: 7,
        code: 'DM007',
        name: 'Giày chạy bộ',
        description: 'Giày chuyên dụng cho chạy bộ và marathon',
        productCount: 0,
        status: 'inactive',
        createdAt: '2024-01-09T14:20:00'
      },
      {
        id: 8,
        code: 'DM008',
        name: 'Giày bóng đá',
        description: 'Giày chuyên dụng cho bóng đá',
        productCount: 12,
        status: 'active',
        createdAt: '2024-01-08T12:45:00'
      },
      {
        id: 9,
        code: 'DM009',
        name: 'Giày tennis',
        description: 'Giày chuyên dụng cho tennis',
        productCount: 8,
        status: 'active',
        createdAt: '2024-01-07T16:30:00'
      },
      {
        id: 10,
        code: 'DM010',
        name: 'Giày bóng rổ',
        description: 'Giày chuyên dụng cho bóng rổ',
        productCount: 6,
        status: 'active',
        createdAt: '2024-01-06T10:15:00'
      },
      {
        id: 11,
        code: 'DM011',
        name: 'Giày trẻ em',
        description: 'Giày dành cho trẻ em các độ tuổi',
        productCount: 14,
        status: 'active',
        createdAt: '2024-01-05T13:25:00'
      },
      {
        id: 12,
        code: 'DM012',
        name: 'Giày vintage',
        description: 'Giày phong cách cổ điển vintage',
        productCount: 0,
        status: 'inactive',
        createdAt: '2024-01-04T09:40:00'
      }
    ]);

    // Computed properties
    const filteredCategories = computed(() => {
      let result = [...categories.value];

      // Search filter
      if (filters.value.search.trim()) {
        const search = filters.value.search.toLowerCase();
        result = result.filter(category => 
          category.name.toLowerCase().includes(search) ||
          category.code.toLowerCase().includes(search) ||
          category.description.toLowerCase().includes(search)
        );
      }

      // Status filter
      if (filters.value.status) {
        result = result.filter(category => category.status === filters.value.status);
      }

      // Sorting
      switch (filters.value.sortBy) {
        case 'oldest':
          result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'name_asc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'code_asc':
          result.sort((a, b) => a.code.localeCompare(b.code));
          break;
        case 'code_desc':
          result.sort((a, b) => b.code.localeCompare(a.code));
          break;
        case 'newest':
        default:
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }

      return result;
    });



    // Methods
    const resetFilters = () => {
      filters.value = {
        search: '',
        status: '',
        sortBy: 'newest'
      };
      toast.info('Đã đặt lại bộ lọc');
    };

    const openAddCategoryModal = () => {
      categoryForm.value = {
        name: '',
        code: '',
        status: 'active',
        description: ''
      };
      showAddCategoryModal.value = true;
    };

    const getStatusLabel = (status) => {
      switch (status) {
        case 'active':
          return 'Đang sử dụng';
        case 'inactive':
          return 'Ngừng sử dụng';
        default:
          return 'Không xác định';
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    const generateCategoryCode = () => {
      const codes = categories.value.map(c => {
        const num = parseInt(c.code.replace('DM', ''));
        return isNaN(num) ? 0 : num;
      });
      const nextId = codes.length > 0 ? Math.max(...codes) + 1 : 1;
      return `DM${String(nextId).padStart(3, '0')}`;
    };

    const editCategory = (category) => {
      categoryForm.value = {
        id: category.id,
        name: category.name,
        code: category.code,
        status: category.status,
        description: category.description
      };
      showEditCategoryModal.value = true;
    };

    const deleteCategory = (category) => {
      categoryToDelete.value = category;
      showDeleteModal.value = true;
    };

    const saveCategory = async () => {
      try {
        if (showAddCategoryModal.value) {
          // Add new category
          const newCategory = {
            id: Date.now(),
            code: categoryForm.value.code || generateCategoryCode(),
            name: categoryForm.value.name,
            description: categoryForm.value.description,
            productCount: 0,
            status: categoryForm.value.status,
            createdAt: new Date().toISOString()
          };
          categories.value.unshift(newCategory);
          toast.success('Thêm danh mục mới thành công!');
        } else {
          // Edit existing category
          const index = categories.value.findIndex(c => c.id === categoryForm.value.id);
          if (index !== -1) {
            categories.value[index] = {
              ...categories.value[index],
              name: categoryForm.value.name,
              description: categoryForm.value.description,
              status: categoryForm.value.status
            };
            toast.success('Cập nhật danh mục thành công!');
          }
        }
        closeCategoryForm();
      } catch (error) {
        toast.error('Lỗi khi lưu danh mục. Vui lòng thử lại.');
        console.error('Error saving category:', error);
      }
    };

    const confirmDelete = () => {
      if (categoryToDelete.value) {
        const index = categories.value.findIndex(c => c.id === categoryToDelete.value.id);
        if (index !== -1) {
          categories.value.splice(index, 1);
          toast.success(`Đã xóa danh mục "${categoryToDelete.value.name}" thành công!`);
        }
        showDeleteModal.value = false;
        categoryToDelete.value = null;
      }
    };

    const closeCategoryForm = () => {
      showAddCategoryModal.value = false;
      showEditCategoryModal.value = false;
      categoryForm.value = {
        name: '',
        code: '',
        status: 'active',
        description: ''
      };
    };


    const exportToExcel = () => {
      toast.info('Tính năng xuất Excel đang được phát triển');
    };

    return {
      // Data
      breadcrumbItems,
      breadcrumbActions,
      pageStats,
      tableColumns,
      showAddCategoryModal,
      showEditCategoryModal,
      showDeleteModal,
      categoryToDelete,
      filters,
      categoryForm,
      categories,
      
      // Computed
      filteredCategories,
      
      // Methods
      resetFilters,
      openAddCategoryModal,
      getStatusLabel,
      formatDate,
      editCategory,
      deleteCategory,
      saveCategory,
      confirmDelete,
      closeCategoryForm,
      exportToExcel
    };
  }
};
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.quan-ly-danh-muc-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== FILTER SECTION ===== */
.filter-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.reset-filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.reset-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(107, 114, 128, 0.3);
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.filter-input,
.filter-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.categories-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

/* ===== TABLE STYLES (for custom content within DataTable) ===== */
.table-category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.table-category-name {
  font-weight: 600;
  color: #1a202c;
  font-size: 0.95rem;
}

.category-code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.description {
  color: #64748b;
  font-size: 0.9rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-count {
  font-weight: 600;
  color: #059669;
}

.date {
  color: #64748b;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fef3c7;
  color: #92400e;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.action-btn.edit {
  background: #dcfce7;
  color: #166534;
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn:hover {
  transform: scale(1.1);
}


/* ===== MODAL STYLES ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-container.small {
  width: 400px;
}

.modal-container.large {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #374151;
}

.modal-content {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

/* ===== CATEGORY FORM ===== */
.category-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc2626;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-width: 120px;
}

.btn.primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

.btn.danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.btn.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* ===== WARNING TEXT ===== */
.warning-text {
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 8px;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .quan-ly-danh-muc-container {
    padding: 12px;
  }
  
  .filter-section,
  .categories-section {
    padding: 16px;
    border-radius: 12px;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-container.large {
    width: 95vw;
    margin: 10px;
  }
  
}
</style>