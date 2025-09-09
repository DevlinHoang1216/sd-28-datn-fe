<template>
  <div class="container-fluid py-5">
    <h1 class="fs-4 fw-bold text-primary mb-5 text-center">Thêm Phiếu Giảm Giá Mới</h1>

    <div class="card shadow-sm border-0 p-4">
      <div class="loading-spinner" v-if="loading"></div>
      <div :class="{ 'loading-overlay': loading }">
        <!-- Mã phiếu -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Mã phiếu giảm giá</label>
          <div class="d-flex align-items-center gap-3">
            <CFormInput v-model="coupon.maPhieuGiamGia" type="text" class="custom-input" />
            <CButton class="btn-outline-secondary" @click="generateCode">Tự sinh</CButton>
          </div>
        </div>

        <!-- Tên phiếu -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Tên phiếu giảm giá</label>
          <CFormInput v-model="coupon.tenPhieuGiamGia" type="text" class="custom-input" />
        </div>

        <!-- Loại giảm giá -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Loại giảm giá</label>
          <CFormSelect v-model="coupon.loaiGiamGia" class="custom-select" @change="handleLoaiGiamGiaChange">
            <option disabled value="">-- Chọn --</option>
            <option value="PHAN_TRAM">Phần trăm</option>
            <option value="SO_TIEN_CO_DINH">Số tiền cố định</option>
          </CFormSelect>
        </div>

        <!-- Giá trị giảm -->
        <div class="mb-4">
          <label class="form-label fw-semibold">{{ labelGiaTriGiam }}</label>
          <CFormInput v-model.number="coupon.giaTriGiam" type="number" class="custom-input" />
        </div>

        <!-- Số tiền giảm tối đa -->
        <div class="mb-4" v-if="coupon.loaiGiamGia === 'PHAN_TRAM'">
          <label class="form-label fw-semibold">Số tiền giảm tối đa</label>
          <CFormInput v-model.number="coupon.soTienGiamToiDa" type="number" class="custom-input" />
        </div>

        <!-- Hóa đơn tối thiểu -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Hóa đơn tối thiểu</label>
          <CFormInput v-model.number="coupon.hoaDonToiThieu" type="number" class="custom-input" />
        </div>

        <!-- Ngày bắt đầu -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Ngày bắt đầu</label>
          <CFormInput v-model="coupon.ngayBatDau" type="datetime-local" class="custom-input" />
        </div>

        <!-- Ngày kết thúc -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Ngày kết thúc</label>
          <CFormInput v-model="coupon.ngayKetThuc" type="datetime-local" class="custom-input" />
        </div>

        <!-- Loại áp dụng -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Loại áp dụng</label>
          <CFormSelect
            v-model="coupon.loaiApDung"
            class="custom-select"
            @change="handleLoaiApDungChange($event)"
          >
            <option disabled value="">-- Chọn --</option>
            <option value="TOAN_BO">Toàn bộ</option>
            <option value="KH_CU_THE">Khách hàng cụ thể</option>
          </CFormSelect>
        </div>

        <!-- Bảng khách hàng -->
        <div v-if="showCustomerTable" class="mb-4">
          <h5 class="fw-semibold mb-3">Chọn khách hàng áp dụng</h5>
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th class="text-center">Chọn</th>
                  <th class="text-center">Tên khách hàng</th>
                  <th class="text-center">Email</th>
                  <th class="text-center">SĐT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="customers.length === 0">
                  <td colspan="4" class="text-center py-4">Không có khách hàng nào để hiển thị.</td>
                </tr>
                <tr v-for="kh in customers" :key="kh.id">
                  <td class="text-center">
                    <input type="checkbox" v-model="selectedCustomers" :value="kh.id" />
                  </td>
                  <td class="text-center">{{ kh.tenKhachHang }}</td>
                  <td class="text-center">{{ kh.email }}</td>
                  <td class="text-center">{{ kh.soDienThoai }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Nút submit -->
        <CButton class="btn-primary w-100" @click="submitForm">Thêm Phiếu Giảm Giá</CButton>
      </div>
    </div>
  </div>
</template>

<script>
import { CFormInput, CFormSelect, CButton } from '@coreui/vue';
import axios from 'axios';
import { inject } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'CouponAdditionForm',
  components: {
    CFormInput,
    CFormSelect,
    CButton,
  },
  setup() {
    const toast = inject('$toast');
    const router = useRouter();
    return { toast, router };
  },
  data() {
    return {
      coupon: {
        maPhieuGiamGia: '',
        tenPhieuGiamGia: '',
        giaTriGiam: null,
        hoaDonToiThieu: null,
        soTienGiamToiDa: null,
        ngayBatDau: '',
        ngayKetThuc: '',
        loaiGiamGia: '',
        loaiApDung: '',
      },
      customers: [],
      selectedCustomers: [],
      showCustomerTable: false,
      loading: false,
    };
  },
  watch: {
    'coupon.loaiApDung': {
      immediate: true,
      async handler(newVal) {
        if (newVal === 'KH_CU_THE') {
          this.showCustomerTable = true;
          await this.fetchCustomers();
        } else {
          this.showCustomerTable = false;
          this.selectedCustomers = [];
        }
      }
    }
  },
  computed: {
    labelGiaTriGiam() {
      return this.coupon.loaiGiamGia === 'SO_TIEN_CO_DINH' ? 'Giá trị giảm (VND)' : 'Giá trị giảm (%)';
    },
  },
  methods: {
    // Hàm hiển thị thông báo an toàn
    showToast(type, message) {
      if (this.toast && typeof this.toast[type] === 'function') {
        this.toast[type](message);
      } else {
        // Fallback khi toast không có sẵn
        console.log(`[${type.toUpperCase()}]: ${message}`);
        if (type === 'error') {
          alert(`Lỗi: ${message}`);
        } else if (type === 'success') {
          alert(`Thành công: ${message}`);
        }
      }
    },

    generateCode() {
      this.coupon.maPhieuGiamGia = 'PGG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    },

    handleLoaiGiamGiaChange() {
      if (this.coupon.loaiGiamGia === 'SO_TIEN_CO_DINH') {
        this.coupon.soTienGiamToiDa = null;
      }
    },

    async handleLoaiApDungChange() {
      if (this.coupon.loaiApDung === 'KH_CU_THE') {
        this.showCustomerTable = true;
        await this.fetchCustomers();
      } else {
        this.showCustomerTable = false;
        this.selectedCustomers = [];
      }
    },

    async fetchCustomers() {
      this.loading = true;
      try {
        const res = await axios.get('/api/khach-hang');
        this.customers = Array.isArray(res.data) ? res.data : res.data.content || [];
      } catch (err) {
        console.error('Lỗi tải khách hàng:', err);
        this.showToast('error', `Không thể tải danh sách khách hàng: ${err.message || 'Lỗi không xác định'}`);
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      if (!this.coupon.maPhieuGiamGia.trim()) {
        this.showToast('error', 'Mã phiếu giảm giá không được để trống!');
        return false;
      }
      if (!this.coupon.tenPhieuGiamGia.trim()) {
        this.showToast('error', 'Tên phiếu giảm giá không được để trống!');
        return false;
      }
      if (!this.coupon.loaiGiamGia) {
        this.showToast('error', 'Vui lòng chọn loại giảm giá!');
        return false;
      }
      if (this.coupon.loaiGiamGia === 'PHAN_TRAM') {
        if (!this.coupon.giaTriGiam || this.coupon.giaTriGiam <= 0 || this.coupon.giaTriGiam > 100) {
          this.showToast('error', 'Giá trị giảm phải từ 1 đến 100 (%)!');
          return false;
        }
        if (!this.coupon.soTienGiamToiDa || this.coupon.soTienGiamToiDa <= 0) {
          this.showToast('error', 'Số tiền giảm tối đa phải lớn hơn 0!');
          return false;
        }
      }
      if (this.coupon.loaiGiamGia === 'SO_TIEN_CO_DINH') {
        if (!this.coupon.giaTriGiam || this.coupon.giaTriGiam <= 0) {
          this.showToast('error', 'Giá trị giảm (VND) phải lớn hơn 0!');
          return false;
        }
      }
      if (this.coupon.hoaDonToiThieu !== null && this.coupon.hoaDonToiThieu < 0) {
        this.showToast('error', 'Hóa đơn tối thiểu không được nhỏ hơn 0!');
        return false;
      }
      if (!this.coupon.ngayBatDau || !this.coupon.ngayKetThuc) {
        this.showToast('error', 'Vui lòng chọn ngày bắt đầu và ngày kết thúc!');
        return false;
      }
      if (this.coupon.ngayBatDau >= this.coupon.ngayKetThuc) {
        this.showToast('error', 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        return false;
      }
      return true;
    },

    async submitForm() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      try {
        const formatDateTime = (dt) => (dt ? dt + ':00' : null);
        const dataToSend = {
          ...this.coupon,
          ngayBatDau: formatDateTime(this.coupon.ngayBatDau),
          ngayKetThuc: formatDateTime(this.coupon.ngayKetThuc),
          customerIds: this.selectedCustomers,
        };
        
        const res = await axios.post('/api/phieu-giam-gia/create', dataToSend);
        if (res.status === 201) {
          this.showToast('success', 'Thêm phiếu giảm giá thành công!');
          this.router.push({ name: 'PhieuGiamGia' });
        }
      } catch (err) {
        let errorMessage = 'Đã xảy ra lỗi khi thêm phiếu giảm giá.';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        this.showToast('error', errorMessage);
        console.error('Lỗi thêm phiếu:', err.response || err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.container-fluid {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f5f7fb;
  min-height: 100vh;
}

.card {
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: none;
  background-color: #ffffff;
}

.text-primary {
  color: #0052cc !important;
}

.form-label {
  font-weight: 600;
  color: #374151;
}

.custom-input,
.custom-select {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.custom-input:focus,
.custom-select:focus {
  border-color: #0052cc;
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
  outline: none;
}

.btn-primary {
  background-color: #0052cc;
  border-color: #0052cc;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #003d99;
  border-color: #003d99;
}

.btn-outline-secondary {
  border-color: #d1d5db;
  color: #374151;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.table-container {
  position: relative;
  overflow-x: auto;
  border-radius: 8px;
  background-color: #ffffff;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.custom-table th,
.custom-table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.custom-table th {
  background-color: #0052cc;
  color: #ffffff;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}

.custom-table tbody tr:hover {
  background-color: #f9fafb;
}

.custom-table tbody tr:last-child td {
  border-bottom: none;
}

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
  border-top: 4px solid #0052cc;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@media (max-width: 768px) {
  .container-fluid {
    padding: 1rem;
  }

  .card {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .custom-input,
  .custom-select {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .btn-primary,
  .btn-outline-secondary {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .custom-table th,
  .custom-table td {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}
</style>