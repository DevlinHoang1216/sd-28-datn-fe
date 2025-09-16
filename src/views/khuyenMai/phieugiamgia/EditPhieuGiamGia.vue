<template>
  <div class="coupon-edit-container">
    <!-- Breadcrumb -->
    <Breadcrumb
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Sửa Phiếu Giảm Giá"
      page-description="Chỉnh sửa thông tin phiếu giảm giá trong hệ thống"
      page-icon="solar:pen-bold-duotone"
      :page-stats="pageStats"
      :actions="breadcrumbActions"
    />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Panel - Coupon Form -->
      <div class="left-panel">
        <div class="card shadow-sm">
          <div class="loading-spinner" v-if="loading"></div>
          <div class="card-content" :class="{ 'loading-overlay': loading }">
            <!-- Coupon Code (Read-only) -->
            <div class="form-group">
              <label class="form-label">Mã phiếu giảm giá</label>
              <input
                v-model="coupon.maPhieuGiamGia"
                type="text"
                class="form-input"
                placeholder="Mã được tự động tạo"
                readonly
                disabled
              />
            </div>

            <!-- Coupon Name -->
            <div class="form-group">
              <label class="form-label">Tên phiếu giảm giá</label>
              <input
                v-model="coupon.tenPhieuGiamGia"
                type="text"
                class="form-input"
                placeholder="Nhập tên phiếu giảm giá"
              />
            </div>

            <!-- Discount Type -->
            <div class="form-group">
              <label class="form-label">Loại giảm giá</label>
              <select
                v-model="coupon.loaiGiamGia"
                class="form-input"
                @change="handleLoaiGiamGiaChange"
              >
                <option disabled value="">-- Chọn --</option>
                <option value="PHAN_TRAM">Phần trăm</option>
                <option value="SO_TIEN_CO_DINH">Số tiền cố định</option>
              </select>
            </div>

            <!-- Discount Value -->
            <div class="form-group">
              <label class="form-label">{{ labelGiaTriGiam }}</label>
              <input
                v-if="coupon.loaiGiamGia === 'PHAN_TRAM'"
                v-model.number="coupon.giaTriGiam"
                type="number"
                class="form-input"
                placeholder="Nhập giá trị giảm (%)"
                min="1"
                max="100"
              />
              <input
                v-else
                v-model="formattedGiaTriGiam"
                type="text"
                class="form-input"
                placeholder="Nhập giá trị giảm (VND)"
                @input="onGiaTriGiamInput"
                @blur="formatGiaTriGiam"
              />
            </div>

            <!-- Maximum Discount (for both Percentage and Fixed Amount) -->
            <div class="form-group" v-if="coupon.loaiGiamGia === 'PHAN_TRAM' || coupon.loaiGiamGia === 'SO_TIEN_CO_DINH'">
              <label class="form-label">Số tiền giảm tối đa</label>
              <input
                v-model="formattedSoTienGiamToiDa"
                type="text"
                class="form-input"
                placeholder="Nhập số tiền giảm tối đa (VND)"
                @input="onSoTienGiamToiDaInput"
                @blur="formatSoTienGiamToiDa"
              />
            </div>

            <!-- Minimum Invoice Amount -->
            <div class="form-group">
              <label class="form-label">Hóa đơn tối thiểu</label>
              <input
                v-model="formattedHoaDonToiThieu"
                type="text"
                class="form-input"
                placeholder="Nhập giá trị hóa đơn tối thiểu (VND)"
                @input="onHoaDonToiThieuInput"
                @blur="formatHoaDonToiThieu"
              />
            </div>

            <!-- Start Date -->
            <div class="form-group">
              <label class="form-label">Ngày bắt đầu</label>
              <input
                v-model="coupon.ngayBatDau"
                type="date"
                class="form-input"
              />
            </div>

            <!-- End Date -->
            <div class="form-group">
              <label class="form-label">Ngày kết thúc</label>
              <input
                v-model="coupon.ngayKetThuc"
                type="date"
                class="form-input"
              />
            </div>

            <!-- Private Coupon Checkbox -->
            <div class="form-group">
              <label class="form-label">Riêng tư</label>
              <div class="checkbox-group">
                <input
                  type="checkbox"
                  v-model="coupon.isPrivate"
                  id="private-coupon"
                  @change="handlePrivateCouponChange"
                />
                <label for="private-coupon" class="checkbox-label">
                  Áp dụng cho khách hàng cụ thể
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="button-group">
              <button class="submit-btn secondary" @click="cancelEdit">
                Hủy bỏ
              </button>
              <button class="submit-btn primary" @click="submitForm">
                Cập nhật Phiếu Giảm Giá
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Customer Management -->
      <div class="right-panel">
        <div class="card shadow-sm">
          <div class="card-content" :class="{ 'disabled-overlay': !coupon.isPrivate }">
            <h3 class="section-title">
              <iconify-icon icon="solar:users-group-rounded-bold-duotone"></iconify-icon>
              Chọn khách hàng áp dụng
            </h3>
            <DataTable
              :data="customers"
              :columns="customerColumns"
              item-label="khách hàng"
              empty-message="Không có khách hàng nào để hiển thị."
              key-field="id"
            >
              <template #checkbox="{ item }">
                <div class="text-center">
                  <input
                    type="checkbox"
                    :checked="selectedCustomers.includes(item.id)"
                    :disabled="!coupon.isPrivate"
                    class="customer-checkbox"
                    @change="toggleCustomer(item.id, $event)"
                  />
                </div>
              </template>
              <template #ten="{ item }">
                {{ item.ten || 'N/A' }}
              </template>
              <template #email="{ item }">
                {{ item.taiKhoan?.email || 'N/A' }}
              </template>
              <template #soDienThoai="{ item }">
                {{ item.taiKhoan?.soDienThoai || 'N/A' }}
              </template>
            </DataTable>

            <!-- Selected Customers Table -->
            <div class="selected-customers-table mt-4" v-if="coupon.isPrivate && selectedCustomers.length > 0">
              <h4 class="section-subtitle">
                <iconify-icon icon="solar:user-check-bold-duotone"></iconify-icon>
                Khách hàng đã chọn ({{ selectedCustomers.length }})
              </h4>
              <DataTable
                :data="selectedCustomersData"
                :columns="selectedCustomerColumns"
                item-label="khách hàng đã chọn"
                empty-message="Không có khách hàng nào được chọn."
                key-field="id"
              >
                <template #ten="{ item }">
                  {{ item.ten || 'N/A' }}
                </template>
                <template #email="{ item }">
                  {{ item.taiKhoan?.email || 'N/A' }}
                </template>
                <template #soDienThoai="{ item }">
                  {{ item.taiKhoan?.soDienThoai || 'N/A' }}
                </template>
              </DataTable>
            </div>
            <p v-else-if="coupon.isPrivate" class="text-gray-500 text-sm">
              Chưa có khách hàng nào được chọn.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useRouter, useRoute } from 'vue-router';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';

export default {
  name: 'EditPhieuGiamGia',
  components: {
    Breadcrumb,
    DataTable,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Phiếu giảm giá', path: '/phieu-giam-gia' },
      { label: 'Chỉnh sửa', path: `/phieu-giam-gia/edit/${route.params.id}` },
    ]);

    const breadcrumbActions = ref([
      {
        label: 'Danh sách phiếu',
        type: 'default',
        handler: () => router.push('/phieu-giam-gia'),
      },
      {
        label: 'Thêm mới',
        type: 'primary',
        handler: () => router.push('/phieu-giam-gia/them-moi'),
      },
    ]);

    const pageStats = ref([]);

    return { toast, router, route, breadcrumbItems, breadcrumbActions, pageStats };
  },
  data() {
    return {
      coupon: {
        id: null,
        maPhieuGiamGia: '',
        tenPhieuGiamGia: '',
        giaTriGiam: null,
        hoaDonToiThieu: null,
        soTienGiamToiDa: null,
        ngayBatDau: '',
        ngayKetThuc: '',
        loaiGiamGia: '',
        isPrivate: false,
      },
      // Formatted display values
      formattedGiaTriGiam: '',
      formattedSoTienGiamToiDa: '',
      formattedHoaDonToiThieu: '',
      customers: [],
      selectedCustomers: [],
      loading: false,
      customerColumns: [
        {
          key: 'checkbox',
          label: 'Chọn',
          class: 'text-center',
        },
        {
          key: 'ten',
          label: 'Tên khách hàng',
        },
        {
          key: 'email',
          label: 'Email',
        },
        {
          key: 'soDienThoai',
          label: 'SĐT',
        },
      ],
      selectedCustomerColumns: [
        { key: 'ten', label: 'Tên khách hàng' },
        { key: 'email', label: 'Email' },
        { key: 'soDienThoai', label: 'SĐT' },
      ],
    };
  },
  computed: {
    labelGiaTriGiam() {
      return this.coupon.loaiGiamGia === 'SO_TIEN_CO_DINH'
        ? 'Giá trị giảm (VND)'
        : 'Giá trị giảm (%)';
    },
    selectedCustomersData() {
      return this.customers.filter((customer) =>
        this.selectedCustomers.includes(customer.id)
      );
    },
  },
  async mounted() {
    await this.fetchCouponData();
    await this.fetchCustomers();
  },
  methods: {
    // Currency formatting methods
    formatCurrency(value) {
      if (!value) return '';
      const numValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) : value;
      if (isNaN(numValue)) return '';
      return new Intl.NumberFormat('vi-VN').format(numValue) + ' ₫';
    },

    parseCurrency(value) {
      if (!value) return null;
      const numValue = parseInt(value.replace(/[^0-9]/g, ''));
      return isNaN(numValue) ? null : numValue;
    },

    // Discount value formatting
    onGiaTriGiamInput(event) {
      const value = event.target.value.replace(/[^0-9]/g, '');
      this.coupon.giaTriGiam = value ? parseInt(value) : null;
      this.formattedGiaTriGiam = value ? new Intl.NumberFormat('vi-VN').format(parseInt(value)) + ' ₫' : '';
    },

    formatGiaTriGiam() {
      if (this.coupon.giaTriGiam) {
        this.formattedGiaTriGiam = this.formatCurrency(this.coupon.giaTriGiam);
      }
    },

    // Maximum discount formatting
    onSoTienGiamToiDaInput(event) {
      const value = event.target.value.replace(/[^0-9]/g, '');
      this.coupon.soTienGiamToiDa = value ? parseInt(value) : null;
      this.formattedSoTienGiamToiDa = value ? new Intl.NumberFormat('vi-VN').format(parseInt(value)) + ' ₫' : '';
    },

    formatSoTienGiamToiDa() {
      if (this.coupon.soTienGiamToiDa) {
        this.formattedSoTienGiamToiDa = this.formatCurrency(this.coupon.soTienGiamToiDa);
      }
    },

    // Minimum invoice formatting
    onHoaDonToiThieuInput(event) {
      const value = event.target.value.replace(/[^0-9]/g, '');
      this.coupon.hoaDonToiThieu = value ? parseInt(value) : null;
      this.formattedHoaDonToiThieu = value ? new Intl.NumberFormat('vi-VN').format(parseInt(value)) + ' ₫' : '';
    },

    formatHoaDonToiThieu() {
      if (this.coupon.hoaDonToiThieu) {
        this.formattedHoaDonToiThieu = this.formatCurrency(this.coupon.hoaDonToiThieu);
      }
    },

    async fetchCouponData() {
      this.loading = true;
      try {
        const couponId = this.route.params.id;
        const res = await axios.get(`/api/phieu-giam-gia/detail/${couponId}`);
        const data = res.data;
        
        this.coupon = {
          id: data.id,
          maPhieuGiamGia: data.ma,
          tenPhieuGiamGia: data.tenPhieuGiamGia,
          giaTriGiam: data.phanTramGiamGia || data.soTienGiamGia,
          hoaDonToiThieu: data.hoaDonToiThieu,
          soTienGiamToiDa: data.soTienGiamToiDa,
          ngayBatDau: this.formatDateForInput(data.ngayBatDau),
          ngayKetThuc: this.formatDateForInput(data.ngayKetThuc),
          loaiGiamGia: data.loaiPhieuGiamGia === 'PHANTRAM' ? 'PHAN_TRAM' : data.loaiPhieuGiamGia || 'SO_TIEN_CO_DINH',
          isPrivate: data.riengTu || false,
        };

        this.selectedCustomers = data.riengTu && data.customers
          ? data.customers.map(customer => customer.idKhachHang)
          : [];
        
        // Initialize formatted values
        this.initializeFormattedValues();
        
        this.toast.success('Tải thông tin phiếu giảm giá thành công!');
      } catch (err) {
        console.error('Lỗi tải phiếu giảm giá:', err);
        this.toast.error(`Không thể tải thông tin phiếu giảm giá: ${err.message || 'Lỗi không xác định'}`);
        this.router.push('/phieu-giam-gia');
      } finally {
        this.loading = false;
      }
      console.log('Selected Customers:', this.selectedCustomers);
      console.log('All Customers:', this.customers);
    },

    formatDateForInput(dateTime) {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      return date.toISOString().slice(0, 10);
    },

    initializeFormattedValues() {
      // Initialize formatted values after loading data
      if (this.coupon.loaiGiamGia === 'SO_TIEN_CO_DINH' && this.coupon.giaTriGiam) {
        this.formattedGiaTriGiam = this.formatCurrency(this.coupon.giaTriGiam);
      }
      if (this.coupon.soTienGiamToiDa) {
        this.formattedSoTienGiamToiDa = this.formatCurrency(this.coupon.soTienGiamToiDa);
      }
      if (this.coupon.hoaDonToiThieu) {
        this.formattedHoaDonToiThieu = this.formatCurrency(this.coupon.hoaDonToiThieu);
      }
    },

    handleLoaiGiamGiaChange() {
      // Reset formatted values when switching types
      if (this.coupon.loaiGiamGia === 'PHAN_TRAM') {
        this.formattedGiaTriGiam = '';
      } else {
        this.formattedGiaTriGiam = this.coupon.giaTriGiam ? this.formatCurrency(this.coupon.giaTriGiam) : '';
      }
    },

    handlePrivateCouponChange() {
      if (!this.coupon.isPrivate) {
        this.selectedCustomers = [];
      }
    },

    async fetchCustomers() {
      try {
        const res = await axios.get('/api/khach-hang');
        this.customers = Array.isArray(res.data) ? res.data : res.data.content || [];
      } catch (err) {
        console.error('Lỗi tải khách hàng:', err);
        this.toast.error(`Không thể tải danh sách khách hàng: ${err.message || 'Lỗi không xác định'}`);
      }
    },

    async toggleCustomer(khId, event) {
      if (!this.coupon.isPrivate) return;

      this.loading = true;
      try {
        const couponId = this.coupon.id;
        await axios.post(`/api/phieu-giam-gia/${couponId}/toggle-customer/${khId}`);
        if (event.target.checked) {
          if (!this.selectedCustomers.includes(khId)) {
            this.selectedCustomers = [...this.selectedCustomers, khId];
          }
        } else {
          this.selectedCustomers = this.selectedCustomers.filter(id => id !== khId);
        }
        this.toast.success('Cập nhật khách hàng thành công!');
      } catch (err) {
        console.error('Lỗi toggle khách hàng:', err);
        this.toast.error(`Không thể cập nhật khách hàng: ${err.response?.data || 'Lỗi không xác định'}`);
        // Rollback trạng thái bằng cách tải lại dữ liệu
        await this.fetchCouponData();
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      if (!this.coupon.tenPhieuGiamGia.trim()) {
        this.toast.error('Tên phiếu giảm giá không được để trống!');
        return false;
      }
      if (!this.coupon.loaiGiamGia) {
        this.toast.error('Vui lòng chọn loại giảm giá!');
        return false;
      }
      if (this.coupon.loaiGiamGia === 'PHAN_TRAM') {
        if (!this.coupon.giaTriGiam || this.coupon.giaTriGiam <= 0 || this.coupon.giaTriGiam > 100) {
          this.toast.error('Giá trị giảm phải từ 1 đến 100 (%)!');
          return false;
        }
        if (!this.coupon.soTienGiamToiDa || this.coupon.soTienGiamToiDa <= 0) {
          this.toast.error('Số tiền giảm tối đa phải lớn hơn 0!');
          return false;
        }
      }
      if (this.coupon.loaiGiamGia === 'SO_TIEN_CO_DINH') {
        if (!this.coupon.giaTriGiam || this.coupon.giaTriGiam <= 0) {
          this.toast.error('Giá trị giảm (VND) phải lớn hơn 0!');
          return false;
        }
        if (!this.coupon.soTienGiamToiDa || this.coupon.soTienGiamToiDa <= 0) {
          this.toast.error('Số tiền giảm tối đa phải lớn hơn 0!');
          return false;
        }
      }
      if (this.coupon.hoaDonToiThieu !== null && this.coupon.hoaDonToiThieu < 0) {
        this.toast.error('Hóa đơn tối thiểu không được nhỏ hơn 0!');
        return false;
      }
      if (!this.coupon.ngayBatDau || !this.coupon.ngayKetThuc) {
        this.toast.error('Vui lòng chọn ngày bắt đầu và ngày kết thúc!');
        return false;
      }
      if (this.coupon.ngayBatDau >= this.coupon.ngayKetThuc) {
        this.toast.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        return false;
      }
      if (this.coupon.isPrivate && this.selectedCustomers.length === 0) {
        this.toast.error('Vui lòng chọn ít nhất một khách hàng khi phiếu giảm giá là riêng tư!');
        return false;
      }
      return true;
    },

    async submitForm() {
      if (!this.validateForm()) return;

      this.loading = true;
      try {
        const isPhanTram = this.coupon.loaiGiamGia === 'PHAN_TRAM';
        const dataToSend = {
          tenPhieuGiamGia: this.coupon.tenPhieuGiamGia,
          loaiPhieuGiamGia: isPhanTram ? 'PHAN_TRAM' : 'SO_TIEN_CO_DINH',
          phanTramGiamGia: isPhanTram ? this.coupon.giaTriGiam : null,
          soTienGiamToiDa: this.coupon.soTienGiamToiDa,
          hoaDonToiThieu: this.coupon.hoaDonToiThieu,
          soLuongDung: this.coupon.soLuongDung || null,
          ngayBatDau: this.coupon.ngayBatDau,
          ngayKetThuc: this.coupon.ngayKetThuc,
          riengTu: this.coupon.isPrivate,
          moTa: this.coupon.moTa || "",
          khachHangIds: this.selectedCustomers,
        };
        // Nếu là số tiền cố định thì gửi giá trị giảm vào phanTramGiamGia (vì DTO không có soTienGiamGia)
        if (!isPhanTram) {
          dataToSend.phanTramGiamGia = this.coupon.giaTriGiam;
        }

        const res = await axios.put(`/api/phieu-giam-gia/update/${this.coupon.id}`, dataToSend);
        if (res.status === 200) {
          this.toast.success('Cập nhật phiếu giảm giá thành công!');
          this.router.push({ name: 'PhieuGiamGia' });
        }
      } catch (err) {
        let errorMessage = 'Đã xảy ra lỗi khi cập nhật phiếu giảm giá.';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        this.toast.error(errorMessage);
        console.error('Lỗi cập nhật phiếu:', err);
        console.error('Chi tiết lỗi:', err.response?.data);
        console.error('Dữ liệu gửi đi:', dataToSend);
      } finally {
        this.loading = false;
      }
    },

    cancelEdit() {
      this.router.push({ name: 'PhieuGiamGia' });
    },
  },
};
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.coupon-edit-container {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
}

/* ===== LEFT PANEL ===== */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ===== RIGHT PANEL ===== */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ===== CARD STYLES ===== */
.card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-content {
  padding: 28px;
}

/* ===== FORM STYLES ===== */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.95rem;
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

.input-group {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

/* ===== CHECKBOX STYLES ===== */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  font-size: 0.95rem;
  color: #374151;
  cursor: pointer;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

input[type="checkbox"]:checked {
  background: #007bff;
  border-color: #007bff;
}

input[type="checkbox"]:disabled {
  background: #f1f5f9;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

/* ===== CUSTOMER TABLE SECTION ===== */
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

/* ===== CUSTOMER CHECKBOX STYLES ===== */
.customer-checkbox {
  width: 20px;
  height: 20px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.customer-checkbox:checked {
  background: #007bff;
  border-color: #007bff;
}

.customer-checkbox:disabled {
  background: #f1f5f9;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

/* ===== DISABLED OVERLAY ===== */
.disabled-overlay {
  opacity: 0.5;
  pointer-events: none;
}

/* ===== BUTTON GROUP ===== */
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* ===== SUBMIT BUTTON ===== */
.submit-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  padding: 14px 22px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn.primary {
  background: #007bff;
  color: white;
}

.submit-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

.submit-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.submit-btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

/* ===== LOADING STYLES ===== */
.loading-overlay {
  opacity: 0.5;
  pointer-events: none;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .right-panel {
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .coupon-edit-container {
    padding: 16px;
  }

  .card-content {
    padding: 20px;
  }

  .input-group {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .button-group {
    flex-direction: column;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .section-subtitle {
    font-size: 0.95rem;
  }

  .submit-btn {
    padding: 12px 16px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .form-label {
    font-size: 0.9rem;
  }

  .form-input {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .checkbox-label {
    font-size: 0.9rem;
  }
}
</style>