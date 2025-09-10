<template>
  <div class="quan-ly-chat-lieu-container">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Quản Lý Chất Liệu"
      page-description="Hệ thống quản lý chất liệu sản phẩm cho Shop Giày"
      page-icon="solar:layers-bold-duotone"
      :page-stats="pageStats"
      :actions="breadcrumbActions"
    />

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <iconify-icon icon="solar:filter-bold-duotone"></iconify-icon>
          Bộ Lọc Chất Liệu
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
              placeholder="Tìm theo tên hoặc mã chất liệu..."
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
      <!-- Materials Table -->
      <div class="materials-section">
        <div class="section-header">
          <h3 class="section-title">
            <iconify-icon icon="solar:layers-bold-duotone"></iconify-icon>
            Danh Sách Chất Liệu ({{ filteredMaterials.length }})
          </h3>
        </div>

        <!-- Data Table -->
        <DataTable
          :data="filteredMaterials"
          :columns="tableColumns"
          item-label="chất liệu"
          empty-message="Không tìm thấy chất liệu nào."
          key-field="id"
        >
          <template #stt="{ rowIndex }">
            {{ rowIndex }}
          </template>
          <template #code="{ item }">
            <span class="material-code">{{ item.code }}</span>
          </template>
          <template #name="{ item }">
            <div class="table-material-info">
              <span class="table-material-name">{{ item.name }}</span>
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
              <button @click="editMaterial(item)" class="action-btn edit" title="Chỉnh sửa">
                <iconify-icon icon="solar:pen-bold"></iconify-icon>
              </button>
              <button @click="deleteMaterial(item)" class="action-btn delete" title="Xóa">
                <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Add/Edit Material Modal -->
    <div v-if="showAddMaterialModal || showEditMaterialModal" class="modal-overlay" @click="closeMaterialForm">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:palette-2-bold-duotone"></iconify-icon>
            {{ showAddMaterialModal ? 'Thêm Chất Liệu Mới' : 'Chỉnh Sửa Chất Liệu' }}
          </h3>
          <button class="modal-close" @click="closeMaterialForm">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <form @submit.prevent="saveMaterial" class="material-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Tên chất liệu</label>
                <input 
                  type="text" 
                  v-model="materialForm.name" 
                  class="form-input"
                  placeholder="Nhập tên chất liệu"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label required">Mã chất liệu</label>
                <input 
                  type="text" 
                  v-model="materialForm.code" 
                  class="form-input"
                  placeholder="Nhập mã chất liệu"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select v-model="materialForm.status" class="form-input">
                  <option value="active">Đang sử dụng</option>
                  <option value="inactive">Ngừng sử dụng</option>
                </select>
              </div>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Mô tả chất liệu</label>
              <textarea 
                v-model="materialForm.description" 
                class="form-textarea"
                placeholder="Nhập mô tả chất liệu"
                rows="4"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn secondary" @click="closeMaterialForm">Hủy</button>
          <button type="button" class="btn primary" @click="saveMaterial">
            <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
            {{ showAddMaterialModal ? 'Thêm chất liệu' : 'Cập nhật' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-container small" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Xác nhận xóa chất liệu</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <p>Bạn có chắc chắn muốn xóa chất liệu <strong>{{ materialToDelete?.name }}</strong> không?</p>
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
  name: 'ChatLieu',
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
      { label: 'Chất liệu', path: '/attributes/chat-lieu' }
    ]);

    const breadcrumbActions = ref([
      {
        label: 'Thêm chất liệu',
        type: 'primary',
        handler: () => showAddMaterialModal.value = true
      },
      {
        label: 'Xuất Excel',
        type: 'default',
        handler: () => exportToExcel()
      }
    ]);

    const pageStats = computed(() => [
      {
        value: materials.value.length.toString(),
        label: 'Tổng chất liệu',
        icon: 'solar:palette-2-bold-duotone'
      },
      {
        value: materials.value.filter(m => m.status === 'active').length.toString(),
        label: 'Đang sử dụng',
        icon: 'solar:check-circle-bold-duotone'
      },
      {
        value: materials.value.filter(m => m.status === 'inactive').length.toString(),
        label: 'Ngừng sử dụng',
        icon: 'solar:close-circle-bold-duotone'
      },
      {
        value: Math.round((materials.value.filter(m => m.status === 'active').length / materials.value.length) * 100) + '%',
        label: 'Tỷ lệ sử dụng',
        icon: 'solar:chart-square-bold-duotone'
      }
    ]);

    // Table columns definition
    const tableColumns = ref([
      { key: 'stt', label: 'STT' },
      { key: 'code', label: 'Mã chất liệu' },
      { key: 'name', label: 'Tên chất liệu' },
      { key: 'description', label: 'Mô tả' },
      { key: 'productCount', label: 'Số lượng sản phẩm' },
      { key: 'status', label: 'Trạng thái' },
      { key: 'createdAt', label: 'Ngày tạo' },
      { key: 'actions', label: 'Thao tác' }
    ]);

    // Modals
    const showAddMaterialModal = ref(false);
    const showEditMaterialModal = ref(false);
    const showDeleteModal = ref(false);

    // Selected items
    const materialToDelete = ref(null);

    // Filters
    const filters = ref({
      search: '',
      status: '',
      sortBy: 'newest'
    });

    // Form data
    const materialForm = ref({
      name: '',
      code: '',
      status: 'active',
      description: ''
    });

    // Sample data - Fake materials data
    const materials = ref([
      {
        id: 1,
        code: 'CL001',
        name: 'Da thật',
        description: 'Chất liệu da thật cao cấp, mềm mại và bền đẹp',
        productCount: 45,
        status: 'active',
        createdAt: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        code: 'CL002',
        name: 'Da tổng hợp',
        description: 'Da tổng hợp chất lượng cao, giá thành hợp lý',
        productCount: 32,
        status: 'active',
        createdAt: '2024-01-14T11:15:00'
      },
      {
        id: 3,
        code: 'CL003',
        name: 'Canvas',
        description: 'Vải canvas bền chắc, thích hợp cho giày thể thao',
        productCount: 28,
        status: 'active',
        createdAt: '2024-01-13T09:20:00'
      },
      {
        id: 4,
        code: 'CL004',
        name: 'Mesh',
        description: 'Vải lưới thoáng khí, phù hợp cho giày chạy bộ',
        productCount: 22,
        status: 'active',
        createdAt: '2024-01-12T14:45:00'
      },
      {
        id: 5,
        code: 'CL005',
        name: 'Suede',
        description: 'Da lộn mềm mại, sang trọng',
        productCount: 18,
        status: 'active',
        createdAt: '2024-01-11T16:30:00'
      },
      {
        id: 6,
        code: 'CL006',
        name: 'Nylon',
        description: 'Vải nylon nhẹ và bền',
        productCount: 15,
        status: 'active',
        createdAt: '2024-01-10T08:15:00'
      },
      {
        id: 7,
        code: 'CL007',
        name: 'Rubber',
        description: 'Cao su tự nhiên cho đế giày',
        productCount: 0,
        status: 'inactive',
        createdAt: '2024-01-09T14:20:00'
      },
      {
        id: 8,
        code: 'CL008',
        name: 'Polyester',
        description: 'Sợi polyester chống thấm nước',
        productCount: 12,
        status: 'active',
        createdAt: '2024-01-08T12:45:00'
      },
      {
        id: 9,
        code: 'CL009',
        name: 'Cotton',
        description: 'Vải cotton tự nhiên, thoáng mát',
        productCount: 8,
        status: 'active',
        createdAt: '2024-01-07T16:30:00'
      },
      {
        id: 10,
        code: 'CL010',
        name: 'Microfiber',
        description: 'Sợi siêu mịn, dễ vệ sinh',
        productCount: 6,
        status: 'active',
        createdAt: '2024-01-06T10:15:00'
      },
      {
        id: 11,
        code: 'CL011',
        name: 'Knit',
        description: 'Vải dệt kim co giãn tốt',
        productCount: 14,
        status: 'active',
        createdAt: '2024-01-05T13:25:00'
      },
      {
        id: 12,
        code: 'CL012',
        name: 'Flyknit',
        description: 'Công nghệ dệt kim hiện đại của Nike',
        productCount: 0,
        status: 'inactive',
        createdAt: '2024-01-04T09:40:00'
      },
      {
        id: 13,
        code: 'CL013',
        name: 'Primeknit',
        description: 'Công nghệ dệt kim của Adidas',
        productCount: 10,
        status: 'active',
        createdAt: '2024-01-03T15:50:00'
      },
      {
        id: 14,
        code: 'CL014',
        name: 'Leather',
        description: 'Da thuộc truyền thống',
        productCount: 0,
        status: 'inactive',
        createdAt: '2024-01-02T11:30:00'
      },
      {
        id: 15,
        code: 'CL015',
        name: 'Synthetic',
        description: 'Chất liệu tổng hợp hiện đại',
        productCount: 20,
        status: 'active',
        createdAt: '2024-01-01T14:15:00'
      }
    ]);

    // Computed properties
    const filteredMaterials = computed(() => {
      let result = [...materials.value];

      // Search filter
      if (filters.value.search.trim()) {
        const search = filters.value.search.toLowerCase();
        result = result.filter(material => 
          material.name.toLowerCase().includes(search) ||
          material.code.toLowerCase().includes(search) ||
          material.description.toLowerCase().includes(search)
        );
      }

      // Status filter
      if (filters.value.status) {
        result = result.filter(material => material.status === filters.value.status);
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

    const generateMaterialCode = () => {
      const codes = materials.value.map(m => {
        const num = parseInt(m.code.replace('CL', ''));
        return isNaN(num) ? 0 : num;
      });
      const nextId = codes.length > 0 ? Math.max(...codes) + 1 : 1;
      return `CL${String(nextId).padStart(3, '0')}`;
    };

    const editMaterial = (material) => {
      materialForm.value = {
        id: material.id,
        name: material.name,
        code: material.code,
        status: material.status,
        description: material.description
      };
      showEditMaterialModal.value = true;
    };

    const deleteMaterial = (material) => {
      materialToDelete.value = material;
      showDeleteModal.value = true;
    };

    const saveMaterial = () => {
      try {
        if (showAddMaterialModal.value) {
          // Add new material
          const newMaterial = {
            id: Date.now(),
            code: materialForm.value.code || generateMaterialCode(),
            name: materialForm.value.name,
            description: materialForm.value.description,
            productCount: 0,
            status: materialForm.value.status,
            createdAt: new Date().toISOString()
          };
          materials.value.unshift(newMaterial);
          toast.success('Thêm chất liệu mới thành công!');
        } else {
          // Edit existing material
          const index = materials.value.findIndex(m => m.id === materialForm.value.id);
          if (index !== -1) {
            materials.value[index] = {
              ...materials.value[index],
              name: materialForm.value.name,
              description: materialForm.value.description,
              status: materialForm.value.status
            };
            toast.success('Cập nhật chất liệu thành công!');
          }
        }
        closeMaterialForm();
      } catch (error) {
        toast.error('Lỗi khi lưu chất liệu. Vui lòng thử lại.');
        console.error('Error saving material:', error);
      }
    };

    const confirmDelete = () => {
      if (materialToDelete.value) {
        const index = materials.value.findIndex(m => m.id === materialToDelete.value.id);
        if (index !== -1) {
          materials.value.splice(index, 1);
          toast.success(`Đã xóa chất liệu "${materialToDelete.value.name}" thành công!`);
        }
        showDeleteModal.value = false;
        materialToDelete.value = null;
      }
    };

    const closeMaterialForm = () => {
      showAddMaterialModal.value = false;
      showEditMaterialModal.value = false;
      materialForm.value = {
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
      showAddMaterialModal,
      showEditMaterialModal,
      showDeleteModal,
      materialToDelete,
      filters,
      materialForm,
      materials,
      
      // Computed
      filteredMaterials,
      
      // Methods
      resetFilters,
      getStatusLabel,
      formatDate,
      editMaterial,
      deleteMaterial,
      saveMaterial,
      confirmDelete,
      closeMaterialForm,
      exportToExcel
    };
  }
};
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.quan-ly-chat-lieu-container {
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

.materials-section {
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
.table-material-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.table-material-name {
  font-weight: 600;
  color: #1a202c;
  font-size: 0.95rem;
}

.material-code {
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


/* ===== EMPTY STATE ===== */
.empty-message {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 40px 20px;
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

/* ===== MATERIAL FORM ===== */
.material-form {
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
  .quan-ly-chat-lieu-container {
    padding: 12px;
  }
  
  .filter-section,
  .materials-section {
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