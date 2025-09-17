<template>
  <div class="min-h-screen flex flex-col font-roboto transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Quản Lý Phiếu Giảm Giá"
      page-description="Quản lý và theo dõi tất cả phiếu giảm giá trong hệ thống"
      page-icon="solar:ticket-bold-duotone"
      :page-stats="pageStats"
    />

    <div v-if="errorMessage" class="card bg-red-50 dark:bg-red-950 p-4 mb-6 rounded-3xl shadow-lg animate__animated animate__fadeIn">
      <p class="text-red-600 dark:text-red-300 font-medium flex items-center">
        <iconify-icon icon="solar:danger-triangle-bold-duotone" class="text-2xl mr-3"></iconify-icon>
        {{ errorMessage }}
      </p>
    </div>

    <!-- Filter Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <div class="filter-header mb-4">
        <h3 class="filter-title">
          <iconify-icon icon="solar:filter-bold-duotone" class="text-xl"></iconify-icon>
          Bộ Lọc Phiếu Giảm Giá
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
              placeholder="Tìm kiếm mã phiếu, tên phiếu..."
              class="filter-input"
              @input="filterCoupons"
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
                  @change="filterCoupons"
                  class="radio-input"
                />
                <span class="radio-label">Tất cả</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.status"
                  value="DANG_DIEN_RA"
                  @change="filterCoupons"
                  class="radio-input"
                />
                <span class="radio-label">Đang diễn ra</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.status"
                  value="DA_KET_THUC"
                  @change="filterCoupons"
                  class="radio-input"
                />
                <span class="radio-label">Đã kết thúc</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Second Row: Coupon Type and Discount Type -->
        <div class="filter-row mb-4">
          <div class="filter-group">
            <label class="filter-label">Loại phiếu</label>
            <select
              v-model="tempFilters.couponType"
              class="filter-input"
              @change="filterCoupons"
            >
              <option value="">Tất cả loại phiếu</option>
              <option value="TOAN_BO">Công khai</option>
              <option value="KH_CU_THE">Khách hàng cụ thể</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Loại giảm giá</label>
            <select
              v-model="tempFilters.discountType"
              class="filter-input"
              @change="filterCoupons"
            >
              <option value="">Tất cả loại giảm giá</option>
              <option value="PHAN_TRAM">Phần trăm</option>
              <option value="SO_TIEN_CO_DINH">Số tiền cố định</option>
            </select>
          </div>
        </div>

        <!-- Third Row: Date Range and Sort -->
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Ngày bắt đầu</label>
            <input
              v-model="tempFilters.startDate"
              type="date"
              class="filter-input"
              @change="filterCoupons"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Ngày kết thúc</label>
            <input
              v-model="tempFilters.endDate"
              type="date"
              class="filter-input"
              @change="filterCoupons"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Sắp xếp theo</label>
            <select
              v-model="tempFilters.sortBy"
              class="filter-select"
              @change="filterCoupons"
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
        <!-- Coupon List Section -->
        <div class="coupons-section">
          <div class="section-header">
            <h3 class="section-title">
              <iconify-icon icon="solar:ticket-bold-duotone" class="text-xl"></iconify-icon>
              Danh Sách Phiếu Giảm Giá ({{ filteredCoupons.length }})
            </h3>
          </div>

          <!-- DataTable Component -->
          <DataTable
            :data="filteredCoupons"
            :columns="tableColumns"
            item-label="phiếu giảm giá"
            empty-message="Không có dữ liệu phiếu giảm giá nào được tìm thấy."
            key-field="id"
          >
            <!-- Custom column templates -->
            <template #stt="{ rowIndex }">
              {{ rowIndex }}
            </template>
            
            <template #maPhieuGiamGia="{ item }">
              <span class="font-bold text-gray-800 dark:text-gray-100">{{ item.maPhieuGiamGia }}</span>
            </template>
            
            <template #tenPhieuGiamGia="{ item }">
              {{ item.tenPhieuGiamGia }}
            </template>
            
            <template #loaiApDung="{ item }">
              <span :class="mapLoaiApDungClass(item.loaiApDung)">
                {{ mapLoaiApDungText(item.loaiApDung) }}
              </span>
            </template>
            
            <template #loaiGiamGia="{ item }">
              <span class="inline-flex items-center text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full font-medium text-xs">
                <iconify-icon :icon="item.loaiGiamGia === 'PHAN_TRAM' ? 'solar:percent-bold' : 'solar:dollar-minimalistic-bold'" class="w-3 h-3 mr-1"></iconify-icon>
                {{ mapLoaiGiamGiaText(item.loaiGiamGia) }}
              </span>
            </template>
            
            <template #giaTriGiam="{ item }">
              <span class="font-semibold text-right">{{ formatCurrency(item.giaTriGiam, item.loaiGiamGia) }}</span>
            </template>
            
            <template #hoaDonToiThieu="{ item }">
              <span class="font-semibold text-right">{{ formatCurrency(item.hoaDonToiThieu, 'SO_TIEN_CO_DINH') }}</span>
            </template>
            
            <template #soTienGiamToiDa="{ item }">
              <span class="font-semibold text-right">{{ formatCurrency(item.soTienGiamToiDa, 'SO_TIEN_CO_DINH') }}</span>
            </template>
            
            <template #soLuongDung="{ item }">
              <span class="font-semibold text-center">{{ item.soLuongDung || 0 }}</span>
            </template>
            
            <template #ngayBatDau="{ item }">
              {{ formatDate(item.ngayBatDau) }}
            </template>
            
            <template #ngayKetThuc="{ item }">
              {{ formatDate(item.ngayKetThuc) }}
            </template>
            
            <template #trangThai="{ item }">
              <span :class="getActualTrangThaiClass(item)">
                <iconify-icon :icon="getActualTrangThaiIcon(item)" class="w-3 h-3 mr-1"></iconify-icon>
                {{ getActualTrangThaiText(item) }}
              </span>
            </template>
            
            <template #actions="{ item }">
              <div class="flex justify-center items-center gap-3">
                <button
                  @click="editCoupon(item)"
                  class="action-btn edit"
                  title="Sửa"
                >
                  <iconify-icon icon="solar:pen-bold"></iconify-icon>
                </button>
                <label class="relative inline-flex items-center" :class="item.soLuongDung > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'">
                  <input
                    type="checkbox"
                    :checked="item.tenTrangThai === 'DANG_DIEN_RA' && item.soLuongDung > 0"
                    @change="toggleCouponStatus(item)"
                    :disabled="item.soLuongDung <= 0"
                    class="sr-only peer"
                  />
                  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
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
import khachHangAPI from '@/services/api/APIKhachHang/KhachHangAPI.js';
import authService from '@/services/authService.js';

export default {
  name: 'PhieuGiamGia',
  components: {
    Breadcrumb,
    DataTable,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();

    // --- State Management ---
    const allCoupons = ref([]);
    const currentPage = ref(0);
    const pageSize = ref(10);
    const showEditModal = ref(false);
    const selectedCoupon = ref(null);
    const allCustomers = ref([]);
    const loadingTable = ref(false);
    const errorMessage = ref('');

    const filters = ref({
      search: '',
      couponType: '',
      discountType: '',
      status: '',
      startDate: '',
      endDate: '',
      sortBy: ''
    });

    const tempFilters = ref({
      search: '',
      couponType: '',
      discountType: '',
      status: '',
      startDate: '',
      endDate: '',
      sortBy: ''
    });

    const pollingInterval = ref(null);

    // Breadcrumb configuration
    const breadcrumbItems = ref([
      { label: 'Khuyến mãi', path: '/khuyen-mai' },
      { label: 'Phiếu giảm giá' }
    ]);

    const breadcrumbActions = ref([]);

    const pageStats = computed(() => [
      {
        icon: 'solar:ticket-bold-duotone',
        value: allCoupons.value.length,
        label: 'Tổng phiếu giảm giá'
      },
      {
        icon: 'solar:check-circle-bold',
        value: allCoupons.value.filter(c => c.tenTrangThai === 'DANG_DIEN_RA').length,
        label: 'Phiếu đang diễn ra'
      },
      {
        icon: 'solar:close-circle-bold',
        value: allCoupons.value.filter(c => c.tenTrangThai === 'DA_KET_THUC').length,
        label: 'Phiếu đã hết hạn'
      }
    ]);

    // DataTable columns configuration - conditionally include actions column
    const tableColumns = computed(() => {
      const columns = [
        { key: 'stt', label: 'STT', class: 'text-center' },
        { key: 'maPhieuGiamGia', label: 'Mã phiếu', class: 'font-weight-bold' },
        { key: 'tenPhieuGiamGia', label: 'Tên phiếu' },
        { key: 'loaiApDung', label: 'Loại phiếu', class: 'text-center' },
        { key: 'loaiGiamGia', label: 'Loại giảm giá', class: 'text-center' },
        { key: 'giaTriGiam', label: 'Giá trị giảm', class: 'text-right' },
        { key: 'hoaDonToiThieu', label: 'Hóa đơn tối thiểu', class: 'text-right' },
        { key: 'soTienGiamToiDa', label: 'Giảm tối đa', class: 'text-right' },
        { key: 'soLuongDung', label: 'Số lượng dùng', class: 'text-center' },
        { key: 'ngayBatDau', label: 'Ngày bắt đầu', class: 'text-center' },
        { key: 'ngayKetThuc', label: 'Ngày kết thúc', class: 'text-center' },
        { key: 'trangThai', label: 'Trạng thái', class: 'text-center' }
      ];
      
      // Only add actions column for admins
      if (authService.isAdmin()) {
        columns.push({ key: 'actions', label: 'Hành động', class: 'text-center' });
      }
      
      return columns;
    });

    // Type mappings
    const couponTypes = [
      { value: 'TOAN_BO', text: 'Công khai' },
      { value: 'KH_CU_THE', text: 'Khách hàng cụ thể' }
    ];

    const discountTypes = [
      { value: 'PHAN_TRAM', text: 'Phần trăm' },
      { value: 'SO_TIEN_CO_DINH', text: 'Số tiền cố định' }
    ];

    const trangThaiTypes = [
      { value: 'CHUA_DIEN_RA', text: 'Chưa diễn ra' },
      { value: 'DANG_DIEN_RA', text: 'Đang diễn ra' },
      { value: 'DA_KET_THUC', text: 'Đã kết thúc' }
    ];

    return {
      toast,
      router,
      allCoupons,
      currentPage,
      pageSize,
      showEditModal,
      selectedCoupon,
      allCustomers,
      loadingTable,
      errorMessage,
      filters,
      tempFilters,
      pollingInterval,
      breadcrumbItems,
      breadcrumbActions,
      pageStats,
      tableColumns,
      couponTypes,
      discountTypes,
      trangThaiTypes
    };
  },

  computed: {
    filteredCoupons() {
      let result = [...this.allCoupons];

      // Apply search filter
      if (this.filters.search) {
        result = result.filter(coupon =>
          coupon.tenPhieuGiamGia?.toLowerCase().includes(this.filters.search.toLowerCase()) ||
          coupon.maPhieuGiamGia?.toLowerCase().includes(this.filters.search.toLowerCase())
        );
      }

      // Apply coupon type filter
      if (this.filters.couponType) {
        result = result.filter(coupon => coupon.loaiApDung === this.filters.couponType);
      }

      // Apply discount type filter
      if (this.filters.discountType) {
        result = result.filter(coupon => coupon.loaiGiamGia === this.filters.discountType);
      }

      // Apply status filter
      if (this.filters.status) {
        result = result.filter(coupon => coupon.tenTrangThai === this.filters.status);
      }

      // Apply date range filters
      if (this.filters.startDate) {
        const start = new Date(this.filters.startDate);
        start.setHours(0, 0, 0, 0); // Set to start of day
        result = result.filter(coupon => {
          const couponDate = new Date(coupon.ngayBatDau);
          couponDate.setHours(0, 0, 0, 0); // Set to start of day
          return couponDate >= start;
        });
      }

      if (this.filters.endDate) {
        const end = new Date(this.filters.endDate);
        end.setHours(23, 59, 59, 999); // Set to end of day
        result = result.filter(coupon => {
          const couponDate = new Date(coupon.ngayKetThuc);
          return couponDate <= end;
        });
      }

      // Apply sorting
      if (this.filters.sortBy) {
        result = [...result];
        if (this.filters.sortBy === 'newest') {
          result.sort((a, b) => new Date(b.ngayTao || b.ngayBatDau) - new Date(a.ngayTao || a.ngayBatDau));
        } else if (this.filters.sortBy === 'oldest') {
          result.sort((a, b) => new Date(a.ngayTao || a.ngayBatDau) - new Date(b.ngayTao || b.ngayBatDau));
        } else if (this.filters.sortBy === 'name_asc') {
          result.sort((a, b) => a.tenPhieuGiamGia.localeCompare(b.tenPhieuGiamGia));
        } else if (this.filters.sortBy === 'name_desc') {
          result.sort((a, b) => b.tenPhieuGiamGia.localeCompare(a.tenPhieuGiamGia));
        }
      }

      return result;
    },

    totalPages() {
      return Math.ceil(this.filteredCoupons.length / this.pageSize) || 1;
    }
  },

  mounted() {
    // Initialize breadcrumb actions based on user role
    this.breadcrumbActions = [
      {
        label: 'Làm mới',
        type: 'default',
        handler: () => this.loadAllCoupons()
      }
    ];

    // Only show add button for admins
    if (this.isAdmin()) {
      this.breadcrumbActions.push({
        label: 'Thêm phiếu giảm giá',
        type: 'primary',
        handler: () => this.createCoupon()
      });
    }
    
    this.loadAllCustomers();
    this.loadAllCoupons();
    this.startPolling();
  },

  unmounted() {
    this.stopPolling();
  },

  methods: {
    isAdmin() {
      return authService.isAdmin();
    },

    async loadAllCoupons() {
      this.loadingTable = true;
      this.errorMessage = '';
      
      try {
        const response = await axios.get('http://localhost:8080/api/phieu-giam-gia', {
          params: { page: 0, size: 1000, sort: 'ngayTao,desc' },
        });
        
        console.log('Raw API response:', response.data); // Debug: Log the entire API response
        const rawCoupons = response.data.content || response.data;
        console.log('Raw coupons:', rawCoupons); // Debug: Log the coupons array

        this.allCoupons = rawCoupons.map(coupon => {
          console.log('Coupon loaiPhieuGiamGia:', coupon.loaiPhieuGiamGia); // Debug: Log the specific field
          // Map loaiPhieuGiamGia to frontend values, handling both PHAN_TRAM and PHANTRAM
          const loaiGiamGia = coupon.loaiPhieuGiamGia === 'PHAN_TRAM' || coupon.loaiPhieuGiamGia === 'PHANTRAM'
            ? 'PHAN_TRAM'
            : coupon.loaiPhieuGiamGia === 'SO_TIEN_CO_DINH'
              ? 'SO_TIEN_CO_DINH'
              : 'UNKNOWN'; // Fallback for unexpected values

          return {
            id: coupon.id,
            maPhieuGiamGia: coupon.ma,
            tenPhieuGiamGia: coupon.tenPhieuGiamGia,
            loaiApDung: coupon.riengTu ? 'KH_CU_THE' : 'TOAN_BO',
            loaiGiamGia: loaiGiamGia,
            giaTriGiam: coupon.phanTramGiamGia || coupon.soTienGiamGia,
            hoaDonToiThieu: coupon.hoaDonToiThieu,
            soTienGiamToiDa: coupon.soTienGiamToiDa,
            soLuongDung: coupon.soLuongDung || 0,
            ngayBatDau: coupon.ngayBatDau,
            ngayKetThuc: coupon.ngayKetThuc,
            tenTrangThai: coupon.trangThai ? 'DANG_DIEN_RA' : 'DA_KET_THUC',
            customerIds: coupon.customerIds || [],
          };
        });

        if (this.allCoupons.length === 0) {
          this.toast.info('Không có phiếu giảm giá nào trong hệ thống.', { timeout: 4000 });
        }
      } catch (error) {
        console.error('Lỗi khi tải phiếu giảm giá:', error);
        this.errorMessage = `Lỗi khi tải dữ liệu phiếu giảm giá: ${error.response?.data?.message || error.message}`;
        this.toast.error(this.errorMessage, { timeout: 5000 });
        this.allCoupons = [];
      } finally {
        this.loadingTable = false;
      }
    },

    async loadAllCustomers() {
      try {
        const response = await khachHangAPI.getAllActiveKhachHang();
        this.allCustomers = response;
      } catch (error) {
        console.error('Lỗi khi tải danh sách khách hàng:', error);
        this.toast.error('Không thể tải danh sách khách hàng');
      }
    },

    filterCoupons() {
      this.filters.search = this.tempFilters.search;
      this.filters.couponType = this.tempFilters.couponType;
      this.filters.discountType = this.tempFilters.discountType;
      this.filters.status = this.tempFilters.status;
      this.filters.startDate = this.tempFilters.startDate;
      this.filters.endDate = this.tempFilters.endDate;
      this.filters.sortBy = this.tempFilters.sortBy;
      this.currentPage = 0;
    },

    applyFilters() {
      this.filters.search = this.tempFilters.search;
      this.filters.couponType = this.tempFilters.couponType;
      this.filters.discountType = this.tempFilters.discountType;
      this.filters.status = this.tempFilters.status;
      this.filters.startDate = this.tempFilters.startDate;
      this.filters.endDate = this.tempFilters.endDate;
      this.filters.sortBy = this.tempFilters.sortBy;
      this.currentPage = 0;
      
      this.toast.success('Đã áp dụng bộ lọc!', { timeout: 2000 });
    },

    resetFilters() {
      this.filters = { search: '', couponType: '', discountType: '', status: '', startDate: '', endDate: '', sortBy: '' };
      this.tempFilters = { search: '', couponType: '', discountType: '', status: '', startDate: '', endDate: '', sortBy: '' };
      this.currentPage = 0;
      this.toast.info('Đã đặt lại tất cả bộ lọc!', { timeout: 2000 });
    },

    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.loadAllCoupons();
      }, 300000);
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
    },

    createCoupon() {
      this.router.push({ name: 'ThemPhieuGiamGia' });
    },

    editCoupon(coupon) {
      this.router.push({ name: 'EditPhieuGiamGia', params: { id: coupon.id } });
    },

    handleCouponUpdated() {
      this.showEditModal = false;
      this.selectedCoupon = null;
      this.loadAllCoupons();
    },

    async toggleCouponStatus(coupon) {
    try {
      // Gọi API để chuyển đổi trạng thái
      const response = await axios.put(`http://localhost:8080/api/phieu-giam-gia/delete/${coupon.id}`);
      
      // Cập nhật dữ liệu phiếu giảm giá cục bộ một cách phản ứng
      const index = this.allCoupons.findIndex(c => c.id === coupon.id);
      if (index !== -1) {
        this.allCoupons[index] = {
          ...this.allCoupons[index],
          tenTrangThai: response.data.trangThai ? 'DANG_DIEN_RA' : 'DA_KET_THUC',
          ngayCapNhat: new Date().toISOString()
        };
        // Buộc Vue làm mới mảng để đảm bảo tính phản ứng
        this.allCoupons = [...this.allCoupons];
      }
      
      // Hiển thị thông báo thành công
      const statusText = response.data.trangThai ? 'kích hoạt' : 'vô hiệu hóa';
      this.toast.success(`Đã ${statusText} phiếu giảm giá ${coupon.tenPhieuGiamGia}!`, { timeout: 3000 });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái phiếu giảm giá:', error);
      const errorMsg = error.response?.data || 'Không thể cập nhật trạng thái';
      this.toast.error(`Lỗi: ${errorMsg}`, { timeout: 5000 });
    }
  },

    // Mapping functions
    mapLoaiApDungText(value) {
      const type = this.couponTypes.find((t) => t.value === value);
      return type ? type.text : value;
    },

    mapLoaiApDungClass(value) {
      if (value === 'TOAN_BO') return 'inline-flex items-center text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full font-medium text-xs';
      if (value === 'KH_CU_THE') return 'inline-flex items-center text-cyan-700 bg-cyan-100 px-2.5 py-1 rounded-full font-medium text-xs';
      return 'inline-flex items-center text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full font-medium text-xs';
    },

    mapLoaiGiamGiaText(value) {
      if (value === 'UNKNOWN') return 'Không xác định';
      const type = this.discountTypes.find((t) => t.value === value);
      return type ? type.text : value;
    },

    mapTrangThaiText(value) {
      const type = this.trangThaiTypes.find((t) => t.value === value);
      return type ? type.text : value;
    },

    mapTrangThaiClass(value) {
      if (value === 'DANG_DIEN_RA') return 'inline-flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium text-xs';
      if (value === 'CHUA_DIEN_RA') return 'inline-flex items-center text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full font-medium text-xs';
      if (value === 'DA_KET_THUC') return 'inline-flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-full font-medium text-xs';
      return 'inline-flex items-center text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full font-medium text-xs';
    },

    getTrangThaiIcon(value) {
      if (value === 'DANG_DIEN_RA') return 'solar:check-circle-bold';
      if (value === 'CHUA_DIEN_RA') return 'solar:clock-circle-bold';
      if (value === 'DA_KET_THUC') return 'solar:close-circle-bold';
      return 'solar:question-circle-bold';
    },

    // Methods to handle actual status based on quantity
    getActualTrangThaiText(item) {
      // Nếu số lượng dùng = 0, luôn hiển thị "Đã kết thúc"
      if (item.soLuongDung <= 0) {
        return 'Đã kết thúc';
      }
      // Nếu còn số lượng, hiển thị trạng thái gốc
      return this.mapTrangThaiText(item.tenTrangThai);
    },

    getActualTrangThaiClass(item) {
      // Nếu số lượng dùng = 0, luôn hiển thị class "Đã kết thúc"
      if (item.soLuongDung <= 0) {
        return 'inline-flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-full font-medium text-xs';
      }
      // Nếu còn số lượng, hiển thị class gốc
      return this.mapTrangThaiClass(item.tenTrangThai);
    },

    getActualTrangThaiIcon(item) {
      // Nếu số lượng dùng = 0, luôn hiển thị icon "Đã kết thúc"
      if (item.soLuongDung <= 0) {
        return 'solar:close-circle-bold';
      }
      // Nếu còn số lượng, hiển thị icon gốc
      return this.getTrangThaiIcon(item.tenTrangThai);
    },

    formatDate(dateString) {
      if (!dateString) return '---';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      } catch (e) {
        return 'Invalid Date';
      }
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