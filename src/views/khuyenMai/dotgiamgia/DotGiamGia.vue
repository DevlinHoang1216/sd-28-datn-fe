<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4 md:p-6 font-roboto transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Quản Lý Đợt Giảm Giá"
      page-description="Quản lý và theo dõi tất cả đợt giảm giá trong hệ thống"
      page-icon="solar:sale-bold-duotone"
      :page-stats="pageStats"
    />

    <!-- Filter Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <div class="filter-header mb-4">
        <h3 class="filter-title">
          <iconify-icon icon="solar:filter-bold-duotone" class="text-xl"></iconify-icon>
          Bộ Lọc Đợt Giảm Giá
        </h3>
        <button class="reset-filter-btn" @click="resetFilters">
          Đặt lại bộ lọc
        </button>
      </div>
      
      <div class="filter-content">
        <!-- First Row: Search and Status -->
        <div class="filter-row mb-4">
          <div class="filter-group">
            <label class="filter-label">Tìm kiếm</label>
            <input
              v-model="tempFilters.search"
              type="text"
              placeholder="Tìm kiếm mã đợt, tên đợt..."
              class="filter-input"
              @input="filterCampaigns"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.status"
                  value=""
                  @change="filterCampaigns"
                  class="radio-input"
                />
                <span class="radio-label">Tất cả</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.status"
                  value="DANG_DIEN_RA"
                  @change="filterCampaigns"
                  class="radio-input"
                />
                <span class="radio-label">Đang diễn ra</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.status"
                  value="DA_KET_THUC"
                  @change="filterCampaigns"
                  class="radio-input"
                />
                <span class="radio-label">Đã kết thúc</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Second Row: Date Range and Sort -->
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Ngày bắt đầu</label>
            <input
              v-model="tempFilters.startDate"
              type="datetime-local"
              class="filter-input"
              @change="filterCampaigns"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Ngày kết thúc</label>
            <input
              v-model="tempFilters.endDate"
              type="datetime-local"
              class="filter-input"
              @change="filterCampaigns"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Sắp xếp theo</label>
            <select
              v-model="tempFilters.sortBy"
              class="filter-select"
              @change="filterCampaigns"
            >
              <option value="">Sắp xếp mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div class="p-6">
        <!-- Campaign List Section -->
        <div class="campaigns-section">
          <div class="section-header">
            <h3 class="section-title">
              <iconify-icon icon="solar:sale-bold-duotone" class="text-xl"></iconify-icon>
              Danh Sách Đợt Giảm Giá ({{ filteredCampaigns.length }})
            </h3>
          </div>

          <!-- DataTable Component -->
          <DataTable
            :data="filteredCampaigns"
            :columns="tableColumns"
            item-label="đợt giảm giá"
            empty-message="Không có dữ liệu đợt giảm giá nào được tìm thấy."
            key-field="id"
          >
            <!-- Custom column templates -->
            <template #stt="{ rowIndex }">
              {{ rowIndex }}
            </template>
            
            <template #maDotGiamGia="{ item }">
              <span class="font-bold text-gray-800 dark:text-gray-100">{{ item.maDotGiamGia }}</span>
            </template>
            
            <template #tenDotGiamGia="{ item }">
              {{ item.tenDotGiamGia }}
            </template>
            
            <template #giaTri="{ item }">
              <span class="font-semibold text-right">{{ item.giaTri }}%</span>
            </template>
            
            <template #thoiGianBatDau="{ item }">
              {{ formatDate(item.thoiGianBatDau) }}
            </template>
            
            <template #thoiGianKetThuc="{ item }">
              {{ formatDate(item.thoiGianKetThuc) }}
            </template>
            
            <template #trangThai="{ item }">
              <span :class="mapTrangThaiClass(item.tenTrangThai)">
                <iconify-icon :icon="getTrangThaiIcon(item.tenTrangThai)" class="w-3 h-3 mr-1"></iconify-icon>
                {{ mapTrangThaiText(item.tenTrangThai) }}
              </span>
            </template>
            
            <template #actions="{ item }">
              <div class="flex justify-center items-center gap-3">
                <button
                  @click="openEditDotGiamGia(item)"
                  class="action-btn edit"
                  title="Sửa"
                >
                  <iconify-icon icon="solar:pen-bold"></iconify-icon>
                </button>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="item.tenTrangThai === 'DANG_DIEN_RA'"
                    @change="toggleCampaignStatus(item)"
                    class="sr-only peer"
                  />
                  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';

export default {
  name: 'DotGiamGia',
  components: {
    Breadcrumb,
    DataTable,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();

    // --- State Management ---
    const allCampaigns = ref([]);
    const currentPage = ref(0);
    const pageSize = ref(10);
    const loadingTable = ref(false);
    const errorMessage = ref('');

    const filters = ref({
      search: '',
      status: '',
      startDate: '',
      endDate: '',
      sortBy: ''
    });

    const tempFilters = ref({
      search: '',
      status: '',
      startDate: '',
      endDate: '',
      sortBy: ''
    });

    const pollingInterval = ref(null);

    // Breadcrumb configuration
    const breadcrumbItems = ref([
      { label: 'Khuyến mãi', path: '/khuyen-mai' },
      { label: 'Đợt giảm giá' }
    ]);

    const breadcrumbActions = ref([]);

    const pageStats = computed(() => [
      {
        icon: 'solar:sale-bold-duotone',
        value: allCampaigns.value.length,
        label: 'Tổng đợt giảm giá'
      },
      {
        icon: 'solar:check-circle-bold',
        value: allCampaigns.value.filter(c => c.tenTrangThai === 'DANG_DIEN_RA').length,
        label: 'Đợt đang diễn ra'
      },
      {
        icon: 'solar:close-circle-bold',
        value: allCampaigns.value.filter(c => c.tenTrangThai === 'DA_KET_THUC').length,
        label: 'Đợt đã hết hạn'
      }
    ]);

    // DataTable columns configuration
    const tableColumns = ref([
      { key: 'stt', label: 'STT', class: 'text-center' },
      { key: 'maDotGiamGia', label: 'Mã đợt', class: 'font-weight-bold' },
      { key: 'tenDotGiamGia', label: 'Tên đợt' },
      { key: 'giaTri', label: 'Giá trị (%)', class: 'text-right' },
      { key: 'thoiGianBatDau', label: 'Ngày bắt đầu', class: 'text-center' },
      { key: 'thoiGianKetThuc', label: 'Ngày kết thúc', class: 'text-center' },
      { key: 'trangThai', label: 'Trạng thái', class: 'text-center' },
      { key: 'actions', label: 'Hành động', class: 'text-center' }
    ]);

    const trangThaiTypes = [
      { value: 'CHUA_DIEN_RA', text: 'Chưa diễn ra' },
      { value: 'DANG_DIEN_RA', text: 'Đang diễn ra' },
      { value: 'DA_KET_THUC', text: 'Đã kết thúc' }
    ];

    // Methods
    const loadAllCampaigns = async () => {
      loadingTable.value = true;
      errorMessage.value = '';
      
      try {
        // Fake data for testing
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        const fakeCampaigns = [
          {
            id: 1,
            ma: 'DGG001',
            tenDotGiamGia: 'Khuyến mãi Black Friday 2024',
            giaTri: 30,
            thoiGianBatDau: '2024-11-20T00:00:00',
            thoiGianKetThuc: '2024-11-30T23:59:59',
            trangThai: true
          },
          {
            id: 2,
            ma: 'DGG002',
            tenDotGiamGia: 'Giảm giá cuối năm',
            giaTri: 25,
            thoiGianBatDau: '2024-12-15T00:00:00',
            thoiGianKetThuc: '2024-12-31T23:59:59',
            trangThai: true
          },
          {
            id: 3,
            ma: 'DGG003',
            tenDotGiamGia: 'Khuyến mãi Tết Nguyên Đán',
            giaTri: 40,
            thoiGianBatDau: '2025-01-20T00:00:00',
            thoiGianKetThuc: '2025-02-05T23:59:59',
            trangThai: false
          },
          {
            id: 4,
            ma: 'DGG004',
            tenDotGiamGia: 'Flash Sale 12.12',
            giaTri: 50,
            thoiGianBatDau: '2024-12-12T00:00:00',
            thoiGianKetThuc: '2024-12-12T23:59:59',
            trangThai: false
          },
          {
            id: 5,
            ma: 'DGG005',
            tenDotGiamGia: 'Khuyến mãi sinh nhật thương hiệu',
            giaTri: 35,
            thoiGianBatDau: '2024-10-01T00:00:00',
            thoiGianKetThuc: '2024-10-15T23:59:59',
            trangThai: false
          },
          {
            id: 6,
            ma: 'DGG006',
            tenDotGiamGia: 'Giảm giá mùa hè',
            giaTri: 20,
            thoiGianBatDau: '2024-06-01T00:00:00',
            thoiGianKetThuc: '2024-08-31T23:59:59',
            trangThai: false
          }
        ];
        
        allCampaigns.value = fakeCampaigns.map(campaign => ({
          id: campaign.id,
          maDotGiamGia: campaign.ma,
          tenDotGiamGia: campaign.tenDotGiamGia,
          giaTri: campaign.giaTri,
          thoiGianBatDau: campaign.thoiGianBatDau,
          thoiGianKetThuc: campaign.thoiGianKetThuc,
          tenTrangThai: campaign.trangThai ? 'DANG_DIEN_RA' : 'DA_KET_THUC',
        }));

        toast.success('Dữ liệu đợt giảm giá đã được tải thành công!', { timeout: 3000 });
        
      } catch (error) {
        console.error('Lỗi khi tải đợt giảm giá:', error);
        errorMessage.value = `Lỗi khi tải dữ liệu đợt giảm giá: ${error.message}`;
        toast.error(errorMessage.value, { timeout: 5000 });
        allCampaigns.value = [];
      } finally {
        loadingTable.value = false;
      }
    };

    const filterCampaigns = () => {
      filters.value.search = tempFilters.value.search;
      filters.value.status = tempFilters.value.status;
      filters.value.startDate = tempFilters.value.startDate;
      filters.value.endDate = tempFilters.value.endDate;
      filters.value.sortBy = tempFilters.value.sortBy;
      currentPage.value = 0;
      
      toast.success('Đã áp dụng bộ lọc!', { timeout: 2000 });
    };

    const resetFilters = () => {
      filters.value = { search: '', status: '', startDate: '', endDate: '', sortBy: '' };
      tempFilters.value = { search: '', status: '', startDate: '', endDate: '', sortBy: '' };
      currentPage.value = 0;
      toast.info('Đã đặt lại tất cả bộ lọc!', { timeout: 2000 });
    };

    const createCampaign = () => {
      router.push({ name: 'ThemDotGiamGia' });
    };

    const openEditDotGiamGia = (campaign) => {
      router.push({ name: 'EditDotGiamGia', params: { id: campaign.id } });
    };


    const toggleCampaignStatus = async (campaign) => {
      try {
        const index = allCampaigns.value.findIndex(c => c.id === campaign.id);
        if (index !== -1) {
          const newStatus = campaign.tenTrangThai === 'DANG_DIEN_RA' ? 'DA_KET_THUC' : 'DANG_DIEN_RA';
          allCampaigns.value[index] = {
            ...allCampaigns.value[index],
            tenTrangThai: newStatus,
            ngayCapNhat: new Date().toISOString()
          };
        }
        
        const statusText = campaign.tenTrangThai === 'DANG_DIEN_RA' ? 'vô hiệu hóa' : 'kích hoạt';
        toast.success(`Đã ${statusText} đợt giảm giá ${campaign.tenDotGiamGia}!`);
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đợt giảm giá:', error);
        toast.error(`Không thể cập nhật trạng thái: ${error.message}`);
      }
    };

    const mapTrangThaiText = (value) => {
      const type = trangThaiTypes.find((t) => t.value === value);
      return type ? type.text : value;
    };

    const mapTrangThaiClass = (value) => {
      if (value === 'DANG_DIEN_RA') return 'inline-flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium text-xs';
      if (value === 'CHUA_DIEN_RA') return 'inline-flex items-center text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full font-medium text-xs';
      if (value === 'DA_KET_THUC') return 'inline-flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-full font-medium text-xs';
      return 'inline-flex items-center text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full font-medium text-xs';
    };

    const getTrangThaiIcon = (value) => {
      if (value === 'DANG_DIEN_RA') return 'solar:check-circle-bold';
      if (value === 'CHUA_DIEN_RA') return 'solar:clock-circle-bold';
      if (value === 'DA_KET_THUC') return 'solar:close-circle-bold';
      return 'solar:question-circle-bold';
    };

    const formatDate = (dateString) => {
      if (!dateString) return '---';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (e) {
        return 'Invalid Date';
      }
    };

    const startPolling = () => {
      pollingInterval.value = setInterval(() => {
        loadAllCampaigns();
      }, 300000);
    };

    const stopPolling = () => {
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
      }
    };

    // Initialize breadcrumb actions
    onMounted(() => {
      breadcrumbActions.value = [
        {
          label: 'Làm mới',
          type: 'default',
          handler: () => loadAllCampaigns()
        },
        {
          label: 'Thêm đợt giảm giá',
          type: 'primary',
          handler: () => createCampaign()
        }
      ];
      
      loadAllCampaigns();
      startPolling();
    });

    onUnmounted(() => {
      stopPolling();
    });

    return {
      toast,
      router,
      allCampaigns,
      currentPage,
      pageSize,
      loadingTable,
      errorMessage,
      filters,
      tempFilters,
      pollingInterval,
      breadcrumbItems,
      breadcrumbActions,
      pageStats,
      tableColumns,
      trangThaiTypes,
      // Computed properties
      filteredCampaigns: computed(() => {
        let result = [...allCampaigns.value];

        // Apply search filter
        if (filters.value.search) {
          result = result.filter(campaign =>
            campaign.tenDotGiamGia?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
            campaign.maDotGiamGia?.toLowerCase().includes(filters.value.search.toLowerCase())
          );
        }

        // Apply status filter
        if (filters.value.status) {
          result = result.filter(campaign => campaign.tenTrangThai === filters.value.status);
        }

        // Apply date range filters
        if (filters.value.startDate) {
          const start = new Date(filters.value.startDate);
          result = result.filter(campaign => new Date(campaign.thoiGianBatDau) >= start);
        }

        if (filters.value.endDate) {
          const end = new Date(filters.value.endDate);
          result = result.filter(campaign => new Date(campaign.thoiGianKetThuc) <= end);
        }

        // Apply sorting
        if (filters.value.sortBy) {
          result = [...result];
          if (filters.value.sortBy === 'newest') {
            result.sort((a, b) => new Date(b.ngayTao || b.thoiGianBatDau) - new Date(a.ngayTao || a.thoiGianBatDau));
          } else if (filters.value.sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.ngayTao || a.thoiGianBatDau) - new Date(b.ngayTao || b.thoiGianBatDau));
          } else if (filters.value.sortBy === 'name_asc') {
            result.sort((a, b) => a.tenDotGiamGia.localeCompare(b.tenDotGiamGia));
          } else if (filters.value.sortBy === 'name_desc') {
            result.sort((a, b) => b.tenDotGiamGia.localeCompare(a.tenDotGiamGia));
          }
        }

        return result;
      }),
      totalPages: computed(() => {
        return Math.ceil(allCampaigns.value.length / pageSize.value) || 1;
      }),
      // Methods
      loadAllCampaigns,
      filterCampaigns,
      resetFilters,
      createCampaign,
      openEditDotGiamGia,
      toggleCampaignStatus,
      mapTrangThaiText,
      mapTrangThaiClass,
      getTrangThaiIcon,
      formatDate,
      startPolling,
      stopPolling
    };
  }
}
</script>

<style scoped>
@import 'vue-toastification/dist/index.css';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');

:root {
  --primary-blue: #3b82f6;
  --primary-blue-dark: #2563eb;
  --card-bg-light: #ffffff;
  --card-bg-dark: #1f2937;
  --text-color-light: #1f2937;
  --text-color-dark: #e5e7eb;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.card {
  border-radius: 24px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--card-bg-light);
}

.dark .card {
  background: var(--card-bg-dark);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

.btn-primary {
  background: #10b981;
  color: white;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.45);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Filter Section Styling */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
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
  background: #e2e8f0;
  color: #374151;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2937;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Radio Button Styles */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  transition: all 0.2s ease;
  min-width: fit-content;
  font-size: 0.875rem;
}

.radio-option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.radio-option:has(.radio-input:checked) {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1e40af;
}

.radio-input {
  margin: 0;
  margin-right: 0.5rem;
  accent-color: #3b82f6;
  cursor: pointer;
}

.radio-label {
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
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

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .section-header {
  border-bottom-color: #4b5563;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

@media (max-width: 640px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .radio-group {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>