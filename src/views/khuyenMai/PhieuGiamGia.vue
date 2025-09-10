```vue
<template>
  <div class="phieu-giam-gia-container">
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" :show-page-info="true" page-title="Quản Lý Phiếu Giảm Giá"
      page-description="Quản lý các chương trình khuyến mãi và phiếu giảm giá" page-icon="solar:ticket-bold-duotone"
      :page-stats="pageStats" :actions="breadcrumbActions" />

    <!-- Main Card -->
    <div class="main-card">
      <div class="card-header">
        <h3 class="card-title">
          <iconify-icon icon="solar:ticket-bold-duotone"></iconify-icon>
          Danh Sách Phiếu Giảm Giá
        </h3>
        <div class="card-actions">
          <button class="action-btn primary" @click="createCoupon">
            <iconify-icon icon="solar:add-circle-bold-duotone"></iconify-icon>
            Thêm Phiếu Giảm Giá
          </button>
        </div>
      </div>

      <div class="card-content">
        <!-- Filter Section -->
        <div class="filter-section">
          <div class="filters-and-search">
            <div class="filter-item">
              <label class="form-label">Tìm kiếm</label>
              <input v-model="searchQuery" placeholder="Nhập tên hoặc mã phiếu..." @keyup.enter="filterAndSearchCoupons"
                class="form-input" />
            </div>
            <div class="filter-item">
              <label class="form-label">Loại phiếu</label>
              <select v-model="filterCouponType" class="form-input">
                <option value="">Tất cả</option>
                <option v-for="type in couponTypes" :key="type.value" :value="type.value">
                  {{ type.text }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label class="form-label">Loại giảm giá</label>
              <select v-model="filterDiscountType" class="form-input">
                <option value="">Tất cả</option>
                <option v-for="type in discountTypes" :key="type.value" :value="type.value">
                  {{ type.text }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label class="form-label">Ngày bắt đầu</label>
              <input type="datetime-local" v-model="filterStartDate" class="form-input" />
            </div>
            <div class="filter-item">
              <label class="form-label">Ngày kết thúc</label>
              <input type="datetime-local" v-model="filterEndDate" class="form-input" />
            </div>
            <div class="filter-item search-buttons">
              <button class="search-btn primary" @click="filterAndSearchCoupons">
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
                <th>Mã phiếu</th>
                <th>Tên phiếu</th>
                <th>Loại phiếu</th>
                <th>Loại giảm giá</th>
                <th style="width: 120px;">Giá trị giảm</th>
                <th style="width: 140px;">Hóa đơn tối thiểu</th>
                <th style="width: 120px;">Giảm tối đa</th>
                <th style="width: 140px;">Ngày bắt đầu</th>
                <th style="width: 140px;">Ngày kết thúc</th>
                <th style="width: 120px;">Trạng thái</th>
                <th style="width: 120px;">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="coupons.length === 0">
                <td colspan="12" class="empty-message">Không có phiếu giảm giá nào để hiển thị.</td>
              </tr>
              <tr v-for="(coupon, index) in coupons" :key="coupon.id">
                <td class="text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
                <td>{{ coupon.maPhieuGiamGia }}</td>
                <td>{{ coupon.tenPhieuGiamGia }}</td>
                <td>
                  <span :class="mapLoaiApDungClass(coupon.loaiApDung)">
                    {{ mapLoaiApDungText(coupon.loaiApDung) }}
                  </span>
                </td>
                <td>{{ mapLoaiGiamGiaText(coupon.loaiGiamGia) }}</td>
                <td class="text-end">{{ formatCurrency(coupon.giaTriGiam, coupon.loaiGiamGia) }}</td>
                <td class="text-end">{{ formatCurrency(coupon.hoaDonToiThieu, 'SO_TIEN') }}</td>
                <td class="text-end">{{ formatCurrency(coupon.soTienGiamToiDa, 'SO_TIEN') }}</td>
                <td>{{ formatDate(coupon.ngayBatDau) }}</td>
                <td>{{ formatDate(coupon.ngayKetThuc) }}</td>
                <td>
                  <span :class="mapTrangThaiClass(coupon.tenTrangThai)">
                    {{ mapTrangThaiText(coupon.tenTrangThai) }}
                  </span>
                </td>
                <td class="action-cell">
                  <button class="action-btn small primary" @click="openEditCouponModal(coupon)" title="Chỉnh sửa">
                    <iconify-icon icon="mdi:circle-edit-outline"></iconify-icon>
                  </button>
                  <button class="action-btn small danger" @click="deleteCoupon(coupon.id)" title="Xóa">
                    <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
                  </button>
                  <button class="action-btn small info" @click="viewCouponDetails(coupon.id)" title="Xem chi tiết">
                    <iconify-icon icon="solar:eye-bold"></iconify-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            Trước
          </button>
          <button v-for="page in safeTotalPages" :key="page" class="page-btn" :class="{ active: page === currentPage }"
            @click="changePage(page)">
            {{ page }}
          </button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
            Sau
          </button>
        </div>
      </div>
    </div>

    <!-- View Details Modal -->
    <div v-if="showViewDetailsModal" class="modal-overlay" @click="showViewDetailsModal = false">
      <div class="modal-container medium" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:ticket-bold-duotone"></iconify-icon>
            Chi Tiết Phiếu Giảm Giá
          </h3>
          <button class="modal-close" @click="showViewDetailsModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <div v-if="viewingCoupon" class="coupon-details">
            <div class="row">
              <div class="col-md-6">
                <p><strong>Mã phiếu:</strong> {{ viewingCoupon.maPhieuGiamGia }}</p>
                <p><strong>Tên phiếu:</strong> {{ viewingCoupon.tenPhieuGiamGia }}</p>
                <p><strong>Loại phiếu:</strong> {{ mapLoaiApDungText(viewingCoupon.loaiApDung) }}</p>
                <p><strong>Loại giảm giá:</strong> {{ mapLoaiGiamGiaText(viewingCoupon.loaiGiamGia) }}</p>
                <p><strong>Giá trị giảm:</strong> {{ formatCurrency(viewingCoupon.giaTriGiam, viewingCoupon.loaiGiamGia)
                }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Giá trị đơn hàng tối thiểu:</strong> {{ formatCurrency(viewingCoupon.hoaDonToiThieu,
                  'SO_TIEN') }}</p>
                <p><strong>Giá trị giảm tối đa:</strong> {{ formatCurrency(viewingCoupon.soTienGiamToiDa, 'SO_TIEN') }}
                </p>
                <p><strong>Ngày bắt đầu:</strong> {{ formatDate(viewingCoupon.ngayBatDau) }}</p>
                <p><strong>Ngày kết thúc:</strong> {{ formatDate(viewingCoupon.ngayKetThuc) }}</p>
                <p>
                  <strong>Trạng thái:</strong>
                  <span :class="mapTrangThaiClass(viewingCoupon.tenTrangThai)">
                    {{ mapTrangThaiText(viewingCoupon.tenTrangThai) }}
                  </span>
                </p>
              </div>
            </div>
            <div
              v-if="viewingCoupon.loaiApDung === 'KH_CU_THE' && viewingCoupon.customerIds && viewingCoupon.customerIds.length > 0">
              <h6 class="mt-4 fw-bold">Khách hàng áp dụng:</h6>
              <ul class="list-unstyled">
                <li v-for="custId in viewingCoupon.customerIds" :key="custId">
                  {{ getCustomerNameById(custId) }} (ID: {{ custId }})
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showViewDetailsModal = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Edit Coupon Modal -->
    <EditCouponModal :visible="showEditModal" :couponData="selectedCoupon" @close="showEditModal = false"
      @updated="handleCouponUpdated" />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from "vue-router";       // để điều hướng
import { useToast } from "vue-toastification"; // để hiển thị toast
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumb.vue';
import EditCouponModal from '../phieugiamgia/EditCouponModal.vue';

export default {
  name: 'PhieuGiamGia',
  components: {
    Breadcrumb,
    EditCouponModal,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Khuyến mãi', path: '/khuyen-mai' },
      { label: 'Phiếu giảm giá', path: '/phieu-giam-gia' }
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
        label: 'Phiếu đang diễn ra',
        icon: 'solar:ticket-bold-duotone'
      },
      {
        value: '0',
        label: 'Phiếu đã hết hạn',
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
      filterCouponType: '',
      filterDiscountType: '',
      filterStartDate: '',
      filterEndDate: '',
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      coupons: [],
      allCoupons: [],
      showEditModal: false,
      selectedCoupon: null,
      showViewDetailsModal: false,
      viewingCoupon: null,
      allCustomers: [],
      loadingTable: false,
      couponTypes: [
        { value: 'TOAN_BO', text: 'Công khai' },
        { value: 'KH_CU_THE', text: 'Khách hàng cụ thể' }
      ],
      discountTypes: [
        { value: 'PHAN_TRAM', text: 'Phần trăm' },
        { value: 'SO_TIEN_CO_DINH', text: 'Số tiền cố định' }
      ],
      trangThaiTypes: [
        { value: 'CHUA_DIEN_RA', text: 'Chưa diễn ra' },
        { value: 'DANG_DIEN_RA', text: 'Đang diễn ra' },
        { value: 'DA_KET_THUC', text: 'Đã kết thúc' }
      ],
      pollingInterval: null,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize);
    },
    safeTotalPages() {
      return Math.max(1, this.totalPages || 1);
    },
  },
  mounted() {
    this.loadAllCustomers();
    this.loadAllCoupons();
    this.startPolling();
    this.updatePageStats();
  },
  unmounted() {
    this.stopPolling();
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
      this.filterAndSearchCoupons();
    },
    filterCouponType() {
      this.currentPage = 1;
      this.filterAndSearchCoupons();
    },
    filterDiscountType() {
      this.currentPage = 1;
      this.filterAndSearchCoupons();
    },
    filterStartDate() {
      this.currentPage = 1;
      this.filterAndSearchCoupons();
    },
    filterEndDate() {
      this.currentPage = 1;
      this.filterAndSearchCoupons();
    },
    allCoupons() {
      this.updatePageStats();
    }
  },
  methods: {
    mapLoaiApDungText(value) {
      const type = this.couponTypes.find((t) => t.value === value);
      return type ? type.text : value;
    },
    mapLoaiApDungClass(value) {
      if (value === 'TOAN_BO') return 'badge bg-primary';
      if (value === 'KH_CU_THE') return 'badge bg-info';
      return 'badge bg-secondary';
    },
    mapLoaiGiamGiaText(value) {
      const type = this.discountTypes.find((t) => t.value === value);
      return type ? type.text : value;
    },
    mapTrangThaiText(value) {
      const type = this.trangThaiTypes.find((t) => t.value === value);
      return type ? type.text : value;
    },
    mapTrangThaiClass(value) {
      if (value === 'DANG_DIEN_RA') return 'badge bg-success';
      if (value === 'CHUA_DIEN_RA') return 'badge bg-secondary';
      if (value === 'DA_KET_THUC') return 'badge bg-danger';
      return 'badge bg-secondary';
    },
    async loadAllCoupons() {
      this.loadingTable = true;
      try {
        const response = await axios.get('http://localhost:8080/api/phieu-giam-gia', {
          params: { page: 0, size: 1000, sort: 'ngayTao,desc' },
        });
        // Adjust based on API response structure
        const rawCoupons = response.data.content || response.data; // Handle both cases
        this.allCoupons = rawCoupons.map(coupon => ({
          id: coupon.id,
          maPhieuGiamGia: coupon.ma,
          tenPhieuGiamGia: coupon.tenPhieuGiamGia,
          loaiApDung: coupon.riengTu ? 'KH_CU_THE' : 'TOAN_BO', // Map 'riengTu' to 'loaiApDung'
          loaiGiamGia: coupon.loaiPhieuGiamGia === 'PHANTRAM' ? 'PHAN_TRAM' : 'SO_TIEN_CO_DINH',
          giaTriGiam: coupon.phanTramGiamGia || coupon.soTienGiamGia, // Adjust based on discount type
          hoaDonToiThieu: coupon.hoaDonToiThieu,
          soTienGiamToiDa: coupon.soTienGiamToiDa,
          ngayBatDau: coupon.ngayBatDau,
          ngayKetThuc: coupon.ngayKetThuc,
          tenTrangThai: coupon.trangThai ? 'DANG_DIEN_RA' : 'DA_KET_THUC', // Map boolean to string
          customerIds: coupon.customerIds || [], // Default to empty array if not provided
        }));
        this.filterAndSearchCoupons();
      } catch (error) {
        console.error('Lỗi khi tải phiếu giảm giá:', error);
        this.toast.error(`Không thể tải phiếu giảm giá: ${error.response?.data?.message || error.message}`);
        this.allCoupons = [];
        this.coupons = [];
        this.totalItems = 0;
      } finally {
        this.loadingTable = false;
      }
    },
    filterAndSearchCoupons() {
      let filtered = [...this.allCoupons];
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.tenPhieuGiamGia?.toLowerCase().includes(q) ||
            c.maPhieuGiamGia?.toLowerCase().includes(q)
        );
      }
      if (this.filterCouponType) {
        filtered = filtered.filter((c) => c.loaiApDung === this.filterCouponType);
      }
      if (this.filterDiscountType) {
        filtered = filtered.filter((c) => c.loaiGiamGia === this.filterDiscountType);
      }
      if (this.filterStartDate) {
        const start = new Date(this.filterStartDate);
        filtered = filtered.filter((c) => new Date(c.ngayBatDau) >= start);
      }
      if (this.filterEndDate) {
        const end = new Date(this.filterEndDate);
        filtered = filtered.filter((c) => new Date(c.ngayKetThuc) <= end);
      }
      this.totalItems = filtered.length;
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.coupons = filtered.slice(startIndex, endIndex);
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.filterAndSearchCoupons();
      }
    },
    refreshList() {
      this.searchQuery = '';
      this.filterCouponType = '';
      this.filterDiscountType = '';
      this.filterStartDate = '';
      this.filterEndDate = '';
      this.currentPage = 1;
      this.filterAndSearchCoupons();
    },
    async loadAllCustomers() {
      try {
        const response = await axios.get('http://localhost:8080/api/khach-hang');
        this.allCustomers = response.data;
      } catch (error) {
        console.error('Lỗi khi tải danh sách khách hàng:', error);
        this.toast.error('Không thể tải danh sách khách hàng');
      }
    },
    getCustomerNameById(customerId) {
      const customer = this.allCustomers.find((c) => c.id === customerId);
      return customer ? customer.tenKhachHang : 'Không tìm thấy';
    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.loadAllCoupons();
      }, 300000);
    },
    stopPolling() {
      clearInterval(this.pollingInterval);
    },
    createCoupon() {
      this.router.push({ name: 'ThemPhieuGiamGia' });
    },
    openEditCouponModal(coupon) {
      this.selectedCoupon = coupon;
      this.showEditModal = true;
    },
    handleCouponUpdated() {
      this.showEditModal = false;
      this.selectedCoupon = null;
      this.loadAllCoupons();
    },
    async viewCouponDetails(couponId) {
      if (!couponId) {
        this.toast.error('Không thể tải chi tiết phiếu: ID không hợp lệ');
        return;
      }
      this.loadingTable = true;
      try {
        const response = await axios.get(`http://localhost:8080/api/phieu-giam-gia/${couponId}`);
        this.viewingCoupon = response.data;
        this.showViewDetailsModal = true;
      } catch (error) {
        console.error('Lỗi khi tải chi tiết phiếu:', error);
        this.toast.error(`Không thể tải chi tiết phiếu: ${error.response?.data?.message || error.message}`);
      } finally {
        this.loadingTable = false;
      }
    },
    async deleteCoupon(couponId) {
      if (!confirm('Bạn có chắc chắn muốn xóa phiếu giảm giá này không?')) return;
      this.loadingTable = true;
      try {
        await axios.delete(`http://localhost:8080/api/phieu-giam-gia/${couponId}`);
        this.toast.success('Xóa phiếu giảm giá thành công!');
        await this.loadAllCoupons();
      } catch (error) {
        console.error('Lỗi khi xóa phiếu:', error);
        this.toast.error(`Không thể xóa phiếu: ${error.response?.data?.message || error.message}`);
      } finally {
        this.loadingTable = false;
      }
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
    formatCurrency(value, type) {
      if (value === null || value === undefined) {
        if (type === 'SO_TIEN_CO_DINH') return 'Không giới hạn';
        return '---';
      }
      if (type === 'PHAN_TRAM') return `${value}%`;
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
    updatePageStats() {
      const ongoing = this.allCoupons.filter(c => c.tenTrangThai === 'DANG_DIEN_RA').length;
      const expired = this.allCoupons.filter(c => c.tenTrangThai === 'DA_KET_THUC').length;
      this.pageStats[0].value = ongoing.toString();
      this.pageStats[1].value = expired.toString();
    }
  }
}
</script>

<style scoped>
/* General Styles */
.phieu-giam-gia-container {
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

.action-btn.info {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}

.action-btn.info:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.action-btn.small {
  padding: 8px;
  font-size: 1.1rem;
  border-radius: 50%;
  background: #f8fafc;
  transition: box-shadow 0.2s, background 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #e2e8f0;
  position: relative;
}

.action-btn.small.primary {
  color: #007bff;
  background: linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%);
}

.action-btn.small.danger {
  color: #dc2626;
  background: linear-gradient(135deg, #fee2e2 0%, #f8fafc 100%);
}

.action-btn.small.info {
  color: #0ea5e9;
  background: linear-gradient(135deg, #bae6fd 0%, #f8fafc 100%);
}

.action-btn.small:hover {
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.08);
  transform: translateY(-2px) scale(1.08);
  z-index: 2;
}

.action-btn.small[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0.95;
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

.btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
}

.btn.secondary:hover {
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
  min-width: 1200px;
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

.bg-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.bg-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.bg-danger {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
}

.bg-info {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
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
  gap: 10px;
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

/* Modal Styles */
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
}

.modal-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease;
}

.modal-container.medium {
  max-width: 600px;
  width: 100%;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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
  width: 36px;
  height: 36px;
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
  overflow-y: auto;
  padding: 24px 28px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.coupon-details .row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.coupon-details .col-md-6 {
  flex: 1;
  min-width: 250px;
}

.coupon-details p {
  margin: 8px 0;
  font-size: 0.95rem;
}

.coupon-details p strong {
  color: #1a202c;
  font-weight: 600;
}

.coupon-details h6 {
  font-size: 1rem;
  color: #1a202c;
}

.coupon-details ul {
  margin-top: 8px;
  padding-left: 20px;
}

.coupon-details ul li {
  font-size: 0.95rem;
  color: #374151;
  margin-bottom: 4px;
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
  .phieu-giam-gia-container {
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
  .modal-container {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .coupon-details .col-md-6 {
    min-width: 100%;
  }
}
</style>