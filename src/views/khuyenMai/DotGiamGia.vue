```vue
<template>
  <div class="dot-giam-gia-container">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Quản Lý Đợt Giảm Giá"
      page-description="Quản lý các chương trình giảm giá theo đợt"
      page-icon="solar:discount-bold-duotone"
      :page-stats="pageStats"
      :actions="breadcrumbActions"
    />

    <!-- Main Card -->
    <div class="main-card">
      <div class="card-header">
        <h3 class="card-title">
          <iconify-icon icon="solar:discount-bold-duotone"></iconify-icon>
          Danh Sách Đợt Giảm Giá
        </h3>
        <div class="card-actions">
          <RouterLink to="them-dot-giam-gia" class="action-btn primary">
            <iconify-icon icon="solar:add-circle-bold-duotone"></iconify-icon>
            Thêm Đợt Giảm Giá
          </RouterLink>
        </div>
      </div>

      <div class="card-content">
        <!-- Filter Section -->
        <div class="filter-section">
          <div class="filters-and-search">
            <div class="filter-item">
              <label class="form-label">Tìm kiếm</label>
              <input 
                v-model="searchQuery" 
                placeholder="Nhập tên hoặc mã đợt..." 
                @keyup.enter="filterAndSearchCampaigns" 
                class="form-input"
              />
            </div>
            <div class="filter-item">
              <label class="form-label">Trạng thái</label>
              <select v-model="filterStatus" class="form-input">
                <option value="">Tất cả</option>
                <option value="Đang diễn ra">Đang diễn ra</option>
                <option value="Đã kết thúc">Đã kết thúc</option>
              </select>
            </div>
            <div class="filter-item search-buttons">
              <button class="search-btn primary" @click="filterAndSearchCampaigns">
                <iconify-icon icon="solar:magnifer-bold"></iconify-icon>
                Tìm kiếm
              </button>
              <button class="search-btn secondary" @click="refreshList">
                <iconify-icon icon="solar:refresh-bold"></iconify-icon>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="table-container" :class="{ 'loading-overlay': loadingTable }">
          <div class="loading-spinner" v-if="loadingTable"></div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 60px;">STT</th>
                <th>Mã đợt giảm giá</th>
                <th>Tên đợt giảm giá</th>
                <th style="width: 100px;">Giá trị</th>
                <th style="width: 140px;">Thời gian bắt đầu</th>
                <th style="width: 140px;">Thời gian kết thúc</th>
                <th style="width: 120px;">Trạng thái</th>
                <th style="width: 120px;">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedCampaigns.length === 0">
                <td colspan="8" class="empty-message">Không có đợt giảm giá nào để hiển thị.</td>
              </tr>
              <tr v-for="(campaign, index) in paginatedCampaigns" :key="campaign.maDotGiamGia">
                <td class="text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
                <td>{{ campaign.maDotGiamGia }}</td>
                <td>{{ campaign.tenDotGiamGia }}</td>
                <td class="text-end">{{ campaign.giaTri }}%</td>
                <td>{{ formatDate(campaign.thoiGianBatDau) }}</td>
                <td>{{ formatDate(campaign.thoiGianKetThuc) }}</td>
                <td>
                  <span :class="mapTrangThaiClass(campaign.trangThai)">
                    {{ campaign.trangThai }}
                  </span>
                </td>
                <td class="action-cell">
                  <button class="action-btn small primary" @click="editCampaign(campaign)" title="Chỉnh sửa">
                    <iconify-icon icon="solar:pencil-bold"></iconify-icon>
                  </button>
                  <button class="action-btn small danger" @click="deleteCampaign(campaign)" title="Xóa">
                    <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
          >
            Trước
          </button>
          <button 
            v-for="page in totalPages" 
            :key="page" 
            class="page-btn" 
            :class="{ active: page === currentPage }" 
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from "vue-router";       // để điều hướng
import { useToast } from "vue-toastification"; // để hiển thị toast
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumb.vue';

export default {
  name: 'DotGiamGia',
  components: {
    Breadcrumb,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Khuyến mãi', path: '/khuyen-mai' },
      { label: 'Đợt giảm giá', path: '/dot-giam-gia' }
    ]);

    const breadcrumbActions = ref([
      {
        label: 'Làm mới',
        icon: 'solar:refresh-bold-duotone',
        type: 'default',
        handler: () => window.location.reload()
      }
    ]);

    const pageStats = ref([
      {
        value: '0',
        label: 'Đợt đang diễn ra',
        icon: 'solar:discount-bold-duotone'
      },
      {
        value: '0',
        label: 'Đợt đã kết thúc',
        icon: 'solar:clock-circle-bold-duotone'
      }
    ]);

    return {
      toast,
      router,
      breadcrumbItems,
      breadcrumbActions,
      pageStats
    };
  },
  data() {
    return {
      searchQuery: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10,
      originalCampaigns: [],
      campaigns: [],
      loadingTable: false,
      trangThaiTypes: [
        { value: 'Đang diễn ra', text: 'Đang diễn ra' },
        { value: 'Đã kết thúc', text: 'Đã kết thúc' },
      ],
      pollingInterval: null,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.campaigns.length / this.pageSize) || 1;
    },
    paginatedCampaigns() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.campaigns.slice(start, start + this.pageSize);
    },
  },
  mounted() {
    this.loadCampaigns();
    this.startPolling();
    this.updatePageStats();
  },
  unmounted() {
    this.stopPolling();
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
      this.filterAndSearchCampaigns();
    },
    filterStatus() {
      this.currentPage = 1;
      this.filterAndSearchCampaigns();
    },
    campaigns() {
      this.updatePageStats();
    }
  },
  methods: {
    async loadCampaigns() {
      this.loadingTable = true;
      try {
        const response = await axios.get('/api/dot-giam-gia');
        this.originalCampaigns = response.data;
        this.filterAndSearchCampaigns();
      } catch (error) {
        console.error('Lỗi khi tải đợt giảm giá:', error);
        this.toast.error(`Không thể tải đợt giảm giá: ${error.message || 'Lỗi không xác định'}`);
        this.originalCampaigns = [];
        this.campaigns = [];
      } finally {
        this.loadingTable = false;
      }
    },
    filterAndSearchCampaigns() {
      let filtered = [...this.originalCampaigns];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(campaign =>
          (campaign.tenDotGiamGia?.toLowerCase().includes(query) || 
           campaign.maDotGiamGia?.toLowerCase().includes(query))
        );
      }

      if (this.filterStatus) {
        filtered = filtered.filter(campaign => campaign.trangThai === this.filterStatus);
      }

      this.campaigns = filtered;
      this.currentPage = 1;
    },
    refreshList() {
      this.searchQuery = '';
      this.filterStatus = '';
      this.loadCampaigns();
      this.toast.info('Đã làm mới danh sách đợt giảm giá.');
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    editCampaign(campaign) {
      this.toast.info(`Bạn đã chọn sửa đợt giảm giá: ${campaign.tenDotGiamGia}`);
      this.router.push({ name: 'EditDotGiamGia', params: { id: campaign.maDotGiamGia } });
    },
    async deleteCampaign(campaign) {
      if (!confirm(`Bạn có chắc muốn xóa đợt giảm giá "${campaign.tenDotGiamGia}" không?`)) return;
      this.loadingTable = true;
      try {
        await axios.delete(`/api/dot-giam-gia/${campaign.maDotGiamGia}`);
        this.toast.success(`Đã xóa đợt giảm giá: ${campaign.tenDotGiamGia}`);
        await this.loadCampaigns();
      } catch (error) {
        console.error('Lỗi khi xóa đợt giảm giá:', error);
        this.toast.error(`Không thể xóa đợt giảm giá: ${error.message || 'Lỗi không xác định'}`);
      } finally {
        this.loadingTable = false;
      }
    },
    mapTrangThaiClass(value) {
      if (value === 'Đang diễn ra') return 'badge bg-success';
      if (value === 'Đã kết thúc') return 'badge bg-danger';
      return 'badge bg-secondary';
    },
    formatDate(dateString) {
      if (!dateString) return '---';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.loadCampaigns();
      }, 300000);
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
    },
    updatePageStats() {
      const ongoing = this.campaigns.filter(c => c.trangThai === 'Đang diễn ra').length;
      const expired = this.campaigns.filter(c => c.trangThai === 'Đã kết thúc').length;
      this.pageStats[0].value = ongoing.toString();
      this.pageStats[1].value = expired.toString();
    }
  }
}
</script>

<style scoped>
/* General Styles */
.dot-giam-gia-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Card */
.main-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 24px 28px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.card-content {
  padding: 24px 28px 28px;
}

/* Filter Section */
.filter-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.filters-and-search {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Buttons */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.action-btn.primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.action-btn.danger {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
}

.action-btn.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.action-btn.small {
  padding: 8px;
  font-size: 0.85rem;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-btn.primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.search-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.search-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.search-btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  position: relative;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.data-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

.empty-message {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 40px 20px;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bg-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.bg-danger {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
}

.bg-secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Loading Spinner */
.loading-overlay {
  opacity: 0.6;
  pointer-events: none;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #007bff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f0f9ff;
  transform: translateY(-1px);
}

.page-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filters-and-search {
    grid-template-columns: 1fr;
  }

  .search-buttons {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .dot-giam-gia-container {
    padding: 16px;
  }

  .main-card {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .form-input {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .action-btn,
  .search-btn {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .data-table th,
  .data-table td {
    padding: 8px 6px;
    font-size: 0.85rem;
  }

  .action-cell .action-btn {
    padding: 6px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .data-table {
    min-width: 800px;
  }
}
</style>
```