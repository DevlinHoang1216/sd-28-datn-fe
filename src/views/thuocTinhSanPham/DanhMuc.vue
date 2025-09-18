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
            <iconify-icon icon="solar:folder-bold-duotone"></iconify-icon>
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
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="item.status === 'active'"
                  @change="toggleCategoryStatus(item)"
                  class="sr-only peer"
                />
                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showAddCategoryModal || showEditCategoryModal" class="modal-overlay" @click="closeCategoryForm">
      <div class="modal-container" @click.stop">
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:folder-bold-duotone"></iconify-icon>
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
                  <option value="inactive">Ngưng sử dụng</option>
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
import { productService } from '@/services/api/productAPI.js';

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
        type: 'primary',
        handler: () => router.push('/thuoc-tinh/danh-muc/them')
      },
      {
        label: 'Xuất Excel',
        type: 'default',
        handler: () => exportToExcel()
      }
    ]);

    // API data
    const categories = ref([]);
    const loading = ref(false);
    const pagination = ref({
      page: 0,
      size: 9999,
      totalElements: 0,
      totalPages: 0
    });

    const pageStats = computed(() => {
      const activeCount = filteredCategories.value.filter(c => c.status === 'active').length;
      const totalCount = filteredCategories.value.length;
      const usageRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
      
      return [
        {
          value: pagination.value.totalElements.toString(),
          label: 'Tổng danh mục',
          icon: 'solar:folder-2-bold-duotone'
        },
        {
          value: activeCount.toString(),
          label: 'Đang sử dụng',
          icon: 'solar:check-circle-bold-duotone'
        },
        {
          value: filteredCategories.value.filter(c => c.status === 'inactive').length.toString(),
          label: 'Ngừng sử dụng',
          icon: 'solar:close-circle-bold-duotone'
        },
        {
          value: usageRate + '%',
          label: 'Tỷ lệ sử dụng',
          icon: 'solar:chart-square-bold-duotone'
        }
      ];
    });

    // Table columns definition
    const tableColumns = ref([
      { key: 'stt', label: 'STT' },
      { key: 'code', label: 'Mã danh mục' },
      { key: 'name', label: 'Tên danh mục' },
      { key: 'status', label: 'Trạng thái' },
      { key: 'createdAt', label: 'Ngày tạo' },
      { key: 'actions', label: 'Hành động' }
    ]);

    // Modals
    const showAddCategoryModal = ref(false);
    const showEditCategoryModal = ref(false);
    const showDeleteModal = ref(false);

    // Selected items
    const categoryToDelete = ref(null);

    // Form data
    const categoryForm = ref({
      name: '',
      code: '',
      status: 'active',
      description: ''
    });

    // Filters
    const filters = ref({
      search: '',
      status: '',
      sortBy: 'newest'
    });

    // Computed properties
    const filteredCategories = computed(() => {
      return categories.value.map((item, index) => ({
        ...item,
        code: item.maDanhMuc,
        name: item.tenDanhMuc,
        description: item.description || '',
        status: item.deleted ? 'inactive' : 'active',
        createdAt: item.ngayTao
      }));
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
      router.push(`/thuoc-tinh/danh-muc/sua/${category.id}`);
    };

    const toggleCategoryStatus = async (category) => {
      try {
        loading.value = true;
        await productService.toggleCategoryStatus(category.id);
        
        const statusText = category.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
        toast.success(`Đã ${statusText} danh mục "${category.name}" thành công!`);
        await loadCategories();
      } catch (error) {
        toast.error('Lỗi khi cập nhật trạng thái danh mục: ' + (error.response?.data || error.message));
        console.error('Error toggling category status:', error);
      } finally {
        loading.value = false;
      }
    };

    const deleteCategory = (category) => {
      categoryToDelete.value = category;
      showDeleteModal.value = true;
    };


    const saveCategory = async () => {
      try {
        loading.value = true;
        const categoryData = {
          tenDanhMuc: categoryForm.value.name,
          maDanhMuc: categoryForm.value.code || generateCategoryCode(),
          description: categoryForm.value.description
        };

        if (showAddCategoryModal.value) {
          // Add new category
          await productService.createCategory(categoryData);
          toast.success('Thêm danh mục mới thành công!');
        } else {
          // Edit existing category
          await productService.updateCategory(categoryForm.value.id, categoryData);
          toast.success('Cập nhật danh mục thành công!');
        }
        
        closeCategoryForm();
        await loadCategories();
      } catch (error) {
        console.error('Error saving category:', error);
        toast.error('Lỗi khi lưu danh mục. Vui lòng thử lại.');
      } finally {
        loading.value = false;
      }
    };

    const confirmDelete = async () => {
      if (categoryToDelete.value) {
        try {
          loading.value = true;
          await productService.deleteCategory(categoryToDelete.value.id);
          toast.success(`Đã xóa danh mục "${categoryToDelete.value.name}" thành công!`);
          await loadCategories();
        } catch (error) {
          toast.error('Lỗi khi xóa danh mục: ' + (error.response?.data || error.message));
          console.error('Error deleting category:', error);
        } finally {
          loading.value = false;
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



    // API Methods
    const loadCategories = async () => {
      try {
        loading.value = true;
        const params = {
          keyword: filters.value.search.trim().replace(/\s+/g, ' '),
          page: pagination.value.page,
          size: pagination.value.size,
          sortBy: getSortBy(),
          sortDirection: getSortDirection()
        };
        const response = await productService.getCategoriesPaged(params);
        categories.value = response.data.content;
        pagination.value = {
          page: response.data.number,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages
        };
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu danh mục');
        console.error('Error loading categories:', error);
      } finally {
        loading.value = false;
      }
    };

    const getSortBy = () => {
      switch (filters.value.sortBy) {
        case 'name_asc':
        case 'name_desc':
          return 'tenDanhMuc';
        case 'code_asc':
        case 'code_desc':
          return 'maDanhMuc';
        case 'oldest':
        case 'newest':
        default:
          return 'id';
      }
    };

    const getSortDirection = () => {
      return filters.value.sortBy.includes('asc') || filters.value.sortBy === 'oldest' ? 'asc' : 'desc';
    };

    const exportToExcel = () => {
      toast.info('Tính năng xuất Excel đang được phát triển');
    };

    // Watchers
    watch(() => filters.value.search, () => {
      pagination.value.page = 0;
      loadCategories();
    }, { debounce: 500 });

    watch(() => filters.value.sortBy, () => {
      pagination.value.page = 0;
      loadCategories();
    });

    // Load data on component mount
    onMounted(() => {
      loadCategories();
    });

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
      categoryForm,
      filters,
      categories,
      
      // Computed
      filteredCategories,
      
      // State
      loading,
      pagination,
      
      // Methods
      resetFilters,
      getStatusLabel,
      formatDate,
      editCategory,
      toggleCategoryStatus,
      deleteCategory,
      saveCategory,
      confirmDelete,
      closeCategoryForm,
      exportToExcel,
      loadCategories
    };
  }
};
</script>

<style scoped>
/* ===== CONTAINER ===== */
.quan-ly-danh-muc-container {
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
  gap: 24px;
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
  padding: 10px 16px;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.modal-container.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #ef4444;
  transform: scale(1.1);
}

.modal-content {
  padding: 28px;
  max-height: 60vh;
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
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* ===== BUTTON STYLES ===== */
.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn.secondary:hover {
  background: #e2e8f0;
  color: #475569;
}

.btn.danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.btn.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
}

/* ===== ANIMATIONS ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .quan-ly-danh-muc-container {
    padding: 16px;
  }
  
  .filter-section,
  .categories-section {
    padding: 20px;
  }
  
  .filter-content {
    grid-template-columns: 1fr;
  }
  
  .filter-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-container {
    width: 95%;
    margin: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 20px;
  }
}
</style>