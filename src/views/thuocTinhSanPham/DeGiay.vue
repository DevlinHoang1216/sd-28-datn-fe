<template>
    <div class="quan-ly-de-giay-container">
      <!-- Breadcrumb -->
      <Breadcrumb 
        :items="breadcrumbItems"
        :show-page-info="true"
        page-title="Quản Lý Đế Giày"
        page-description="Hệ thống quản lý đế giày sản phẩm cho Shop Giày"
        page-icon="solar:layers-bold-duotone"
        :page-stats="pageStats"
        :actions="breadcrumbActions"
      />
  
      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-header">
          <h3 class="filter-title">
            <iconify-icon icon="solar:filter-bold-duotone"></iconify-icon>
            Bộ Lọc Đế Giày
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
                placeholder="Tìm theo tên hoặc mã đế giày..."
              />
            </div>
            <div class="filter-group">
              <label class="filter-label">Trạng thái</label>
              <select v-model="filters.status" class="filter-select">
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang sử dụng</option>
                <option value="inactive">Ngưng sử dụng</option>
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
        <!-- Shoe Soles Table -->
        <div class="soles-section">
          <div class="section-header">
            <h3 class="section-title">
              <iconify-icon icon="solar:layers-bold-duotone"></iconify-icon>
              Danh Sách Đế Giày ({{ filteredSoles.length }})
            </h3>
          </div>
  
          <!-- Data Table -->
          <DataTable
            :data="filteredSoles"
            :columns="tableColumns"
            item-label="đế giày"
            empty-message="Không tìm thấy đế giày nào."
            key-field="id"
          >
            <template #stt="{ rowIndex }">
              {{ rowIndex }}
            </template>
            <template #code="{ item }">
              <span class="sole-code">{{ item.code }}</span>
            </template>
            <template #name="{ item }">
              <div class="table-sole-info">
                <span class="table-sole-name">{{ item.name }}</span>
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
                <button @click="editSole(item)" class="action-btn edit" title="Chỉnh sửa">
                  <iconify-icon icon="solar:pen-bold"></iconify-icon>
                </button>
                <button @click="deleteSole(item)" class="action-btn delete" title="Xóa">
                  <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
                </button>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
  
      <!-- Add/Edit Sole Modal -->
      <div v-if="showAddSoleModal || showEditSoleModal" class="modal-overlay" @click="closeSoleForm">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">
              <iconify-icon icon="solar:layers-bold-duotone"></iconify-icon>
              {{ showAddSoleModal ? 'Thêm Đế Giày Mới' : 'Chỉnh Sửa Đế Giày' }}
            </h3>
            <button class="modal-close" @click="closeSoleForm">
              <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
            </button>
          </div>
          <div class="modal-content">
            <form @submit.prevent="saveSole" class="sole-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">Tên đế giày</label>
                  <input 
                    type="text" 
                    v-model="soleForm.name" 
                    class="form-input"
                    placeholder="Nhập tên đế giày"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label required">Mã đế giày</label>
                  <input 
                    type="text" 
                    v-model="soleForm.code" 
                    class="form-input"
                    placeholder="Nhập mã đế giày"
                    required
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Trạng thái</label>
                  <select v-model="soleForm.status" class="form-input">
                    <option value="active">Đang sử dụng</option>
                    <option value="inactive">Ngưng sử dụng</option>
                  </select>
                </div>
              </div>
              <div class="form-group full-width">
                <label class="form-label">Mô tả đế giày</label>
                <textarea 
                  v-model="soleForm.description" 
                  class="form-textarea"
                  placeholder="Nhập mô tả đế giày"
                  rows="4"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary" @click="closeSoleForm">Hủy</button>
            <button type="button" class="btn primary" @click="saveSole">
              <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
              {{ showAddSoleModal ? 'Thêm đế giày' : 'Cập nhật' }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-container small" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Xác nhận xóa đế giày</h3>
            <button class="modal-close" @click="showDeleteModal = false">
              <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
            </button>
          </div>
          <div class="modal-content">
            <p>Bạn có chắc chắn muốn xóa đế giày <strong>{{ soleToDelete?.name }}</strong> không?</p>
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
    name: 'DeGiay',
    components: {
      Breadcrumb,
      DataTable
    },
    setup() {
      const router = useRouter();
      const toast = useToast();
  
      // Modals
      const showAddSoleModal = ref(false);
      const showEditSoleModal = ref(false);
      const showDeleteModal = ref(false);
      const soleToDelete = ref(null);
  
      // Filters
      const filters = ref({
        search: '',
        status: '',
        sortBy: 'newest'
      });
  
      // Form data
      const soleForm = ref({
        name: '',
        code: '',
        status: 'active',
        description: ''
      });
  
      // Sample data
      const soles = ref([
        {
          id: 1,
          code: 'DG001',
          name: 'Đế Cao Su Trắng',
          description: 'Đế cao su trắng chống trượt, độ bền cao',
          productCount: 15,
          status: 'active',
          createdAt: '2024-01-15T10:30:00'
        },
        {
          id: 2,
          code: 'DG002',
          name: 'Đế EVA Đen',
          description: 'Đế EVA đen nhẹ, êm chân, phù hợp thể thao',
          productCount: 23,
          status: 'active',
          createdAt: '2024-01-14T11:15:00'
        },
        {
          id: 3,
          code: 'DG003',
          name: 'Đế PU Nâu',
          description: 'Đế PU màu nâu, thiết kế thanh lịch',
          productCount: 18,
          status: 'active',
          createdAt: '2024-01-13T09:20:00'
        },
        {
          id: 4,
          code: 'DG004',
          name: 'Đế Crepe',
          description: 'Đế crepe tự nhiên, mềm mại và thoải mái',
          productCount: 12,
          status: 'active',
          createdAt: '2024-01-12T14:45:00'
        },
        {
          id: 5,
          code: 'DG005',
          name: 'Đế Vibram',
          description: 'Đế Vibram chuyên dụng outdoor, chống mài mòn',
          productCount: 8,
          status: 'active',
          createdAt: '2024-01-11T16:20:00'
        },
        {
          id: 6,
          code: 'DG006',
          name: 'Đế Wedge',
          description: 'Đế wedge cho giày nữ, tăng chiều cao',
          productCount: 20,
          status: 'active',
          createdAt: '2024-01-10T08:30:00'
        },
        {
          id: 7,
          code: 'DG007',
          name: 'Đế Da Thật',
          description: 'Đế da thật cao cấp, phong cách cổ điển',
          productCount: 6,
          status: 'active',
          createdAt: '2024-01-09T12:15:00'
        },
        {
          id: 8,
          code: 'DG008',
          name: 'Đế Air Cushion',
          description: 'Đế có đệm khí, hỗ trợ giảm chấn tối ưu',
          productCount: 4,
          status: 'inactive',
          createdAt: '2024-01-08T15:45:00'
        }
      ]);
  
      // Breadcrumb data
      const breadcrumbItems = ref([
        { label: 'Quản lý', path: '/quan-ly' },
        { label: 'Thuộc tính', path: '/attributes' },
        { label: 'Đế giày', path: '/attributes/de-giay' }
      ]);
  
      const breadcrumbActions = ref([
        {
          label: 'Thêm đế giày',
          type: 'primary',
          handler: () => showAddSoleModal.value = true
        },
        {
          label: 'Xuất Excel',
          type: 'default',
          handler: () => exportToExcel()
        }
      ]);
  
      const pageStats = computed(() => [
        {
          value: soles.value.length.toString(),
          label: 'Tổng đế giày',
          icon: 'solar:layers-bold-duotone'
        },
        {
          value: soles.value.filter(s => s.status === 'active').length.toString(),
          label: 'Đang sử dụng',
          icon: 'solar:check-circle-bold-duotone'
        },
        {
          value: soles.value.filter(s => s.status === 'inactive').length.toString(),
          label: 'Ngưng sử dụng',
          icon: 'solar:close-circle-bold-duotone'
        },
        {
          value: Math.round((soles.value.filter(s => s.status === 'active').length / soles.value.length) * 100) + '%',
          label: 'Tỷ lệ sử dụng',
          icon: 'solar:chart-square-bold-duotone'
        }
      ]);
  
      // Table columns
      const tableColumns = ref([
        { key: 'stt', label: 'STT' },
        { key: 'code', label: 'Mã đế giày' },
        { key: 'name', label: 'Tên đế giày' },
        { key: 'description', label: 'Mô tả' },
        { key: 'productCount', label: 'Số lượng sản phẩm' },
        { key: 'status', label: 'Trạng thái' },
        { key: 'createdAt', label: 'Ngày tạo' },
        { key: 'actions', label: 'Thao tác' }
      ]);
  
      // Computed
      const filteredSoles = computed(() => {
        let result = [...soles.value];
  
        // Search filter
        if (filters.value.search.trim()) {
          const search = filters.value.search.toLowerCase();
          result = result.filter(sole => 
            sole.name.toLowerCase().includes(search) ||
            sole.code.toLowerCase().includes(search) ||
            sole.description.toLowerCase().includes(search)
          );
        }
  
        // Status filter
        if (filters.value.status) {
          result = result.filter(sole => sole.status === filters.value.status);
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
  
      const openAddSoleModal = () => {
        soleForm.value = {
          name: '',
          code: '',
          status: 'active',
          description: ''
        };
        showAddSoleModal.value = true;
      };
  
      const getStatusLabel = (status) => {
        switch (status) {
          case 'active':
            return 'Đang sử dụng';
          case 'inactive':
            return 'Ngưng sử dụng';
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
  
      const generateSoleCode = () => {
        const codes = soles.value.map(s => {
          const num = parseInt(s.code.replace('DG', ''));
          return isNaN(num) ? 0 : num;
        });
        const nextId = codes.length > 0 ? Math.max(...codes) + 1 : 1;
        return `DG${String(nextId).padStart(3, '0')}`;
      };
  
      const editSole = (sole) => {
        soleForm.value = { ...sole };
        showEditSoleModal.value = true;
      };
  
      const deleteSole = (sole) => {
        soleToDelete.value = sole;
        showDeleteModal.value = true;
      };
  
      const saveSole = async () => {
        try {
          if (showAddSoleModal.value) {
            // Add new sole
            const newSole = {
              id: Date.now(),
              code: soleForm.value.code || generateSoleCode(),
              name: soleForm.value.name,
              description: soleForm.value.description,
              productCount: 0,
              status: soleForm.value.status,
              createdAt: new Date().toISOString()
            };
            soles.value.unshift(newSole);
            toast.success('Thêm đế giày mới thành công!');
          } else {
            // Edit existing sole
            const index = soles.value.findIndex(s => s.id === soleForm.value.id);
            if (index !== -1) {
              soles.value[index] = {
                ...soles.value[index],
                name: soleForm.value.name,
                description: soleForm.value.description,
                status: soleForm.value.status
              };
              toast.success('Cập nhật đế giày thành công!');
            }
          }
          closeSoleForm();
        } catch (error) {
          toast.error('Lỗi khi lưu đế giày. Vui lòng thử lại.');
          console.error('Error saving sole:', error);
        }
      };
  
      const confirmDelete = () => {
        if (soleToDelete.value) {
          const index = soles.value.findIndex(s => s.id === soleToDelete.value.id);
          if (index !== -1) {
            soles.value.splice(index, 1);
            toast.success(`Đã xóa đế giày "${soleToDelete.value.name}" thành công!`);
          }
          showDeleteModal.value = false;
          soleToDelete.value = null;
        }
      };
  
      const closeSoleForm = () => {
        showAddSoleModal.value = false;
        showEditSoleModal.value = false;
        soleForm.value = {
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
        showAddSoleModal,
        showEditSoleModal,
        showDeleteModal,
        soleToDelete,
        filters,
        soleForm,
        soles,
        
        // Computed
        filteredSoles,
        
        // Methods
        resetFilters,
        openAddSoleModal,
        getStatusLabel,
        formatDate,
        editSole,
        deleteSole,
        saveSole,
        confirmDelete,
        closeSoleForm,
        exportToExcel
      };
    }
  };
  </script>
  
  <style scoped>
  /* ===== CONTAINER ===== */
  .quan-ly-de-giay-container {
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
  
  /* ===== MAIN CONTENT ===== */
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .soles-section {
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
  
  .table-sole-info {
    display: flex;
    flex-direction: column;
  }
  
  .table-sole-name {
    font-weight: 600;
    color: #1a202c;
    font-size: 0.95rem;
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
  
  .actions {
    display: flex;
    gap: 8px;
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
  
  .sole-code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  
  /* ===== ACTION BUTTONS ===== */
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
  
  .action-btn:hover {
    transform: scale(1.1);
  }
  
  .action-btn.edit {
    background: #dcfce7;
    color: #166534;
  }
  
  .action-btn.delete {
    background: #fee2e2;
    color: #dc2626;
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
  
  .sole-form {
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
  
  .warning-text {
    color: #dc2626;
    font-size: 0.9rem;
    font-weight: 500;
    margin-top: 8px;
  }
  
  /* ===== RESPONSIVE DESIGN ===== */
  @media (max-width: 768px) {
    .quan-ly-de-giay-container {
      padding: 12px;
    }
    
    .filter-section,
    .soles-section {
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
    
    .modal-header,
    .modal-content,
    .modal-footer {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
  
  @media (max-width: 480px) {
    .modal-overlay {
      padding: 10px;
    }
  
    .modal-title {
      font-size: 1.1rem;
    }
  
    .action-btn {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }
  }
</style>