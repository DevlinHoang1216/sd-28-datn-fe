<template>
  <div class="coupon-add-container">
    <!-- Breadcrumb -->
    <Breadcrumb
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Thêm Phiếu Giảm Giá Mới"
      page-description="Tạo phiếu giảm giá mới cho hệ thống bán hàng"
      page-icon="solar:ticket-bold-duotone"
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
            <!-- Coupon Code -->
            <div class="form-group">
              <label class="form-label">Mã phiếu giảm giá</label>
              <div class="input-group">
                <input
                  v-model="coupon.ma"
                  type="text"
                  class="form-input"
                  placeholder="Nhập mã phiếu giảm giá"
                />
                <button class="action-btn secondary" @click="generateCode">
                  <iconify-icon icon="solar:refresh-bold-duotone"></iconify-icon>
                  Tự sinh
                </button>
              </div>
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
                v-model="coupon.loaiPhieuGiamGia"
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
                v-model.number="coupon.phanTramGiamGia"
                type="number"
                class="form-input"
                placeholder="Nhập giá trị giảm"
              />
            </div>

            <!-- Maximum Discount (for Percentage) -->
            <div class="form-group" v-if="coupon.loaiPhieuGiamGia === 'PHAN_TRAM'">
              <label class="form-label">Số tiền giảm tối đa</label>
              <input
                v-model.number="coupon.soTienGiamToiDa"
                type="number"
                class="form-input"
                placeholder="Nhập số tiền giảm tối đa"
              />
            </div>

            <!-- Minimum Invoice Amount -->
            <div class="form-group">
              <label class="form-label">Hóa đơn tối thiểu</label>
              <input
                v-model.number="coupon.hoaDonToiThieu"
                type="number"
                class="form-input"
                placeholder="Nhập giá trị hóa đơn tối thiểu"
              />
            </div>

            <!-- Usage Quantity -->
            <div class="form-group">
              <label class="form-label">Số lượng sử dụng</label>
              <input
                v-model.number="coupon.soLuongDung"
                type="number"
                class="form-input"
                placeholder="Nhập số lượng sử dụng"
              />
            </div>

            <!-- Start Date -->
            <div class="form-group">
              <label class="form-label">Ngày bắt đầu</label>
              <input
                v-model="coupon.ngayBatDau"
                type="datetime-local"
                class="form-input"
              />
            </div>

            <!-- End Date -->
            <div class="form-group">
              <label class="form-label">Ngày kết thúc</label>
              <input
                v-model="coupon.ngayKetThuc"
                type="datetime-local"
                class="form-input"
              />
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label">Mô tả</label>
              <textarea
                v-model="coupon.moTa"
                class="form-input"
                placeholder="Nhập mô tả phiếu giảm giá"
                rows="4"
              ></textarea>
            </div>

            <!-- Private Coupon Checkbox -->
            <div class="form-group">
              <label class="form-label">Riêng tư</label>
              <div class="checkbox-group">
                <input
                  type="checkbox"
                  v-model="coupon.riengTu"
                  id="private-coupon"
                  @change="handlePrivateCouponChange"
                />
                <label for="private-coupon" class="checkbox-label">
                  Áp dụng cho khách hàng cụ thể
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <button class="submit-btn primary" @click="submitForm">
              Thêm Phiếu Giảm Giá
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel - Customer Tables -->
      <div class="right-panel">
        <!-- Customer Selection Table -->
        <div class="card shadow-sm">
          <div class="card-content" :class="{ 'disabled-overlay': !coupon.riengTu }">
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
                    v-model="selectedCustomers"
                    :value="item.id"
                    :disabled="!coupon.riengTu"
                    class="customer-checkbox"
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
          </div>
        </div>

        <!-- Selected Customers Table -->
        <div class="card shadow-sm" v-if="selectedCustomers.length > 0">
          <div class="card-content">
            <h3 class="section-title">
              <iconify-icon icon="solar:check-circle-bold-duotone"></iconify-icon>
              Khách hàng đã chọn ({{ selectedCustomers.length }})
            </h3>
            <DataTable
              :data="selectedCustomersData"
              :columns="selectedCustomerColumns"
              item-label="khách hàng đã chọn"
              empty-message="Không có khách hàng nào được chọn."
              key-field="id"
            >
              <template #checkbox="{ item }">
                <div class="text-center">
                  <input
                    type="checkbox"
                    v-model="selectedCustomers"
                    :value="item.id"
                    class="customer-checkbox"
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
import { useRouter } from 'vue-router';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';


export default {
  name: 'CouponAdditionForm',
  components: {
    Breadcrumb,
    DataTable,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();

    const breadcrumbItems = ref([
      { label: 'Phiếu giảm giá', path: '/phieu-giam-gia' },
      { label: 'Thêm mới', path: '/phieu-giam-gia/them-moi' },
    ]);

    const breadcrumbActions = ref([
      {
        label: 'Danh sách phiếu',
        type: 'default',
        handler: () => router.push('/phieu-giam-gia'),
      },
      {
        label: 'Làm mới',
        type: 'default',
        handler: () => window.location.reload(),
      },
    ]);

    const pageStats = ref([
      {
        value: '0',
        label: 'Phiếu đang hoạt động',
        icon: 'solar:ticket-bold-duotone',
      },
      {
        value: '0',
        label: 'Lượt sử dụng hôm nay',
        icon: 'solar:cart-check-bold-duotone',
      },
    ]);

    return { toast, router, breadcrumbItems, breadcrumbActions, pageStats };
  },
  data() {
    return {
      coupon: {
        ma: '',
        tenPhieuGiamGia: '',
        loaiPhieuGiamGia: '',
        phanTramGiamGia: null,
        soTienGiamToiDa: null,
        hoaDonToiThieu: null,
        soLuongDung: null,
        ngayBatDau: '',
        ngayKetThuc: '',
        riengTu: false,
        moTa: '',
      },
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
        {
          key: 'checkbox',
          label: 'Bỏ chọn',
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
    };
  },
  computed: {
    labelGiaTriGiam() {
      return this.coupon.loaiPhieuGiamGia === 'SO_TIEN_CO_DINH'
        ? 'Giá trị giảm (VND)'
        : 'Giá trị giảm (%)';
    },
    selectedCustomersData() {
      return this.customers.filter(customer => this.selectedCustomers.includes(customer.id));
    },
  },
  mounted() {
    this.fetchCustomers();
  },
  methods: {
    generateCode() {
      this.coupon.ma = 'PGG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      this.toast.info('Đã tạo mã phiếu giảm giá mới!');
    },

    handleLoaiGiamGiaChange() {
      if (this.coupon.loaiPhieuGiamGia === 'SO_TIEN_CO_DINH') {
        this.coupon.soTienGiamToiDa = null;
      }
    },

    handlePrivateCouponChange() {
      if (!this.coupon.riengTu) {
        this.selectedCustomers = [];
      }
    },

    async fetchCustomers() {
      this.loading = true;
      try {
        const res = await axios.get('/api/khach-hang');
        this.customers = Array.isArray(res.data) ? res.data : res.data.content || [];
        this.toast.success(`Tải danh sách khách hàng thành công! (${this.customers.length} khách hàng)`);
      } catch (err) {
        console.error('Lỗi tải khách hàng:', err);
        this.toast.error(`Không thể tải danh sách khách hàng: ${err.message || 'Lỗi không xác định'}`);
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      if (!this.coupon.ma.trim()) {
        this.toast.error('Mã phiếu giảm giá không được để trống!');
        return false;
      }
      if (!this.coupon.tenPhieuGiamGia.trim()) {
        this.toast.error('Tên phiếu giảm giá không được để trống!');
        return false;
      }
      if (!this.coupon.loaiPhieuGiamGia) {
        this.toast.error('Vui lòng chọn loại giảm giá!');
        return false;
      }
      if (this.coupon.loaiPhieuGiamGia === 'PHAN_TRAM') {
        if (!this.coupon.phanTramGiamGia || this.coupon.phanTramGiamGia <= 0 || this.coupon.phanTramGiamGia > 100) {
          this.toast.error('Giá trị giảm phải từ 1 đến 100 (%)!');
          return false;
        }
        if (!this.coupon.soTienGiamToiDa || this.coupon.soTienGiamToiDa <= 0) {
          this.toast.error('Số tiền giảm tối đa phải lớn hơn 0!');
          return false;
        }
      }
      if (this.coupon.loaiPhieuGiamGia === 'SO_TIEN_CO_DINH') {
        if (!this.coupon.phanTramGiamGia || this.coupon.phanTramGiamGia <= 0) {
          this.toast.error('Giá trị giảm (VND) phải lớn hơn 0!');
          return false;
        }
      }
      if (this.coupon.hoaDonToiThieu !== null && this.coupon.hoaDonToiThieu < 0) {
        this.toast.error('Hóa đơn tối thiểu không được nhỏ hơn 0!');
        return false;
      }
      if (!this.coupon.soLuongDung || this.coupon.soLuongDung <= 0) {
        this.toast.error('Số lượng sử dụng phải lớn hơn 0!');
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
      if (this.coupon.riengTu && this.selectedCustomers.length === 0) {
        this.toast.error('Vui lòng chọn ít nhất một khách hàng khi phiếu giảm giá là riêng tư!');
        return false;
      }
      return true;
    },

    async submitForm() {
  if (!this.validateForm()) return;

  this.loading = true;
  try {
    const formatDateTime = (dt) => {
      if (!dt) return null;
      if (dt.endsWith('Z') || dt.match(/[+-]\d{2}:\d{2}$/)) return dt;
      return dt + ':00Z';
    };
    const dataToSend = {
      ma: this.coupon.ma,
      tenPhieuGiamGia: this.coupon.tenPhieuGiamGia,
      loaiPhieuGiamGia: this.coupon.loaiPhieuGiamGia,
      phanTramGiamGia: this.coupon.phanTramGiamGia,
      soTienGiamToiDa: this.coupon.loaiPhieuGiamGia === 'PHAN_TRAM' ? this.coupon.soTienGiamToiDa : null,
      hoaDonToiThieu: this.coupon.hoaDonToiThieu,
      soLuongDung: this.coupon.soLuongDung,
      ngayBatDau: formatDateTime(this.coupon.ngayBatDau),
      ngayKetThuc: formatDateTime(this.coupon.ngayKetThuc),
      riengTu: this.coupon.riengTu,
      moTa: this.coupon.moTa,
      khachHangIds: this.coupon.riengTu ? this.selectedCustomers : [],
    };

    console.log('Dữ liệu gửi đi:', dataToSend); // Gỡ lỗi: kiểm tra dữ liệu gửi
    const res = await axios.post('/api/phieu-giam-gia/add', dataToSend);
    console.log('Phản hồi API:', res); // Gỡ lỗi: kiểm tra phản hồi

    if (res.status === 200 || res.status === 201) { // Chấp nhận cả 200 và 201
      this.toast.success('Thêm phiếu giảm giá thành công!', {
        timeout: 3000,
        position: 'top-right',
      });
      setTimeout(() => {
        console.log('Bắt đầu chuyển hướng đến PhieuGiamGia'); // Gỡ lỗi
        this.router.push({ path: '/phieu-giam-gia' }).catch(err => {
          console.error('Lỗi chuyển hướng:', err);
          this.toast.error('Không thể chuyển hướng đến trang danh sách phiếu giảm giá.', {
            timeout: 5000,
            position: 'top-right',
          });
        });
      }, 1500);
    } else {
      this.toast.error(`Thêm phiếu thất bại, mã trạng thái: ${res.status}`, {
        timeout: 5000,
        position: 'top-right',
      });
    }
  } catch (err) {
    console.error('Lỗi khi thêm phiếu:', err.response || err); // Gỡ lỗi
    let errorMessage = 'Đã xảy ra lỗi khi thêm phiếu giảm giá.';
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    this.toast.error(errorMessage, {
      timeout: 5000,
      position: 'top-right',
    });
  } finally {
    this.loading = false;
  }
},
  },
};
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.coupon-add-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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

textarea.form-input {
  resize: vertical;
  min-height: 100px;
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

/* ===== SUBMIT BUTTON ===== */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 22px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
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
  .coupon-add-container {
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

  .section-title {
    font-size: 1.1rem;
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