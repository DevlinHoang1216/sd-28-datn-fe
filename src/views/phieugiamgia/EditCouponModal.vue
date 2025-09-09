```vue
<template>
  <CModal v-model:visible="localVisible" alignment="center" size="lg" scrollable>
    <CModalHeader>
      <CModalTitle>
        <iconify-icon icon="solar:pencil-bold-duotone" class="me-2"></iconify-icon>
        Sửa Phiếu Giảm Giá
      </CModalTitle>
    </CModalHeader>

    <CModalBody>
      <div class="p-4">
        <form @submit.prevent="updateCoupon" class="coupon-form">
          <div class="form-grid">
            <!-- Coupon Code -->
            <div class="form-item">
              <label class="form-label">Mã phiếu giảm giá <span class="required">*</span></label>
              <input
                v-model="form.maPhieuGiamGia"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.maPhieuGiamGia }"
                placeholder="Nhập mã phiếu..."
                required
              />
              <div v-if="errors.maPhieuGiamGia" class="invalid-feedback">{{ errors.maPhieuGiamGia }}</div>
            </div>

            <!-- Coupon Name -->
            <div class="form-item">
              <label class="form-label">Tên phiếu giảm giá <span class="required">*</span></label>
              <input
                v-model="form.tenPhieuGiamGia"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.tenPhieuGiamGia }"
                placeholder="Nhập tên phiếu..."
                required
              />
              <div v-if="errors.tenPhieuGiamGia" class="invalid-feedback">{{ errors.tenPhieuGiamGia }}</div>
            </div>

            <!-- Discount Type -->
            <div class="form-item">
              <label class="form-label">Loại giảm giá <span class="required">*</span></label>
              <select
                v-model="form.loaiGiamGia"
                class="form-select"
                :class="{ 'is-invalid': errors.loaiGiamGia }"
                @change="handleLoaiGiamGiaChange"
              >
                <option disabled value="">-- Chọn --</option>
                <option value="PHAN_TRAM">Phần trăm</option>
                <option value="SO_TIEN_CO_DINH">Số tiền cố định</option>
              </select>
              <div v-if="errors.loaiGiamGia" class="invalid-feedback">{{ errors.loaiGiamGia }}</div>
            </div>

            <!-- Discount Value -->
            <div class="form-item">
              <label class="form-label">{{ labelGiaTriGiam }} <span class="required">*</span></label>
              <div class="input-group">
                <input
                  v-model.number="form.giaTriGiam"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.giaTriGiam }"
                  :min="form.loaiGiamGia === 'PHAN_TRAM' ? 1 : 0"
                  :step="form.loaiGiamGia === 'PHAN_TRAM' ? 1 : 1000"
                  placeholder="Nhập giá trị giảm..."
                  required
                />
                <span class="input-group-text">{{ form.loaiGiamGia === 'PHAN_TRAM' ? '%' : 'VND' }}</span>
              </div>
              <div v-if="errors.giaTriGiam" class="invalid-feedback">{{ errors.giaTriGiam }}</div>
            </div>

            <!-- Maximum Discount (for PHAN_TRAM) -->
            <div class="form-item" v-if="form.loaiGiamGia === 'PHAN_TRAM'">
              <label class="form-label">Số tiền giảm tối đa <span class="required">*</span></label>
              <div class="input-group">
                <input
                  v-model.number="form.soTienGiamToiDa"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.soTienGiamToiDa }"
                  min="0"
                  step="1000"
                  placeholder="Nhập số tiền tối đa..."
                />
                <span class="input-group-text">VND</span>
              </div>
              <div v-if="errors.soTienGiamToiDa" class="invalid-feedback">{{ errors.soTienGiamToiDa }}</div>
            </div>

            <!-- Minimum Order Value -->
            <div class="form-item">
              <label class="form-label">Hóa đơn tối thiểu <span class="required">*</span></label>
              <div class="input-group">
                <input
                  v-model.number="form.hoaDonToiThieu"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.hoaDonToiThieu }"
                  min="0"
                  step="1000"
                  placeholder="Nhập giá trị tối thiểu..."
                />
                <span class="input-group-text">VND</span>
              </div>
              <div v-if="errors.hoaDonToiThieu" class="invalid-feedback">{{ errors.hoaDonToiThieu }}</div>
            </div>

            <!-- Start Date -->
            <div class="form-item">
              <label class="form-label">Ngày bắt đầu <span class="required">*</span></label>
              <input
                v-model="form.ngayBatDau"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.ngayBatDau }"
                required
              />
              <div v-if="errors.ngayBatDau" class="invalid-feedback">{{ errors.ngayBatDau }}</div>
            </div>

            <!-- End Date -->
            <div class="form-item">
              <label class="form-label">Ngày kết thúc <span class="required">*</span></label>
              <input
                v-model="form.ngayKetThuc"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.ngayKetThuc }"
                required
              />
              <div v-if="errors.ngayKetThuc" class="invalid-feedback">{{ errors.ngayKetThuc }}</div>
            </div>

            <!-- Coupon Type -->
            <div class="form-item">
              <label class="form-label">Loại áp dụng <span class="required">*</span></label>
              <select
                v-model="form.loaiApDung"
                class="form-select"
                :class="{ 'is-invalid': errors.loaiApDung }"
                @change="handleLoaiApDungChange"
              >
                <option disabled value="">-- Chọn --</option>
                <option value="TOAN_BO">Công khai</option>
                <option value="KH_CU_THE">Khách hàng cụ thể</option>
              </select>
              <div v-if="errors.loaiApDung" class="invalid-feedback">{{ errors.loaiApDung }}</div>
            </div>

            <!-- Customer Selection Table -->
            <div v-if="showCustomerTable" class="form-item full-width">
              <label class="form-label">Chọn khách hàng áp dụng</label>
              <input
                v-model="customerSearch"
                type="text"
                class="form-control mb-3"
                placeholder="Tìm kiếm khách hàng..."
                @input="filterCustomers"
              />
              <div class="table-container">
                <table class="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th style="width: 60px;">Chọn</th>
                      <th>Tên khách hàng</th>
                      <th>Email</th>
                      <th>SĐT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="filteredCustomers.length === 0">
                      <td colspan="4" class="text-center">Không tìm thấy khách hàng</td>
                    </tr>
                    <tr v-for="kh in filteredCustomers" :key="kh.id">
                      <td class="text-center">
                        <input
                          type="checkbox"
                          v-model="selectedCustomers"
                          :value="kh.id"
                        />
                      </td>
                      <td>{{ kh.tenKhachHang }}</td>
                      <td>{{ kh.email || '---' }}</td>
                      <td>{{ kh.soDienThoai || '---' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="errors.selectedCustomers" class="invalid-feedback d-block">{{ errors.selectedCustomers }}</div>
              <small class="help-text">Chọn khách hàng để áp dụng phiếu giảm giá.</small>
            </div>
          </div>
        </form>
      </div>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="closeModal" :disabled="loading">Đóng</CButton>
      <CButton color="primary" @click="updateCoupon" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Cập nhật
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import axios from "axios";
import { ref, watch, computed } from "vue";
import { useToast } from "vue-toastification";

// Helper functions
function toLocalDateTime(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  return d.toISOString().slice(0, 19);
}

function toInputDateTime(dt) {
  if (!dt) return "";
  return dt.slice(0, 16);
}

export default {
  name: "EditCouponModal",
  props: {
    visible: { type: Boolean, required: true },
    couponData: { type: Object, default: () => ({}) },
  },
  emits: ["close", "updated"],
  setup(props, { emit }) {
    const toast = useToast();
    const localVisible = ref(props.visible);
    const form = ref({
      id: null,
      maPhieuGiamGia: "",
      tenPhieuGiamGia: "",
      giaTriGiam: null,
      hoaDonToiThieu: null,
      soTienGiamToiDa: null,
      ngayBatDau: "",
      ngayKetThuc: "",
      loaiGiamGia: "",
      loaiApDung: "",
    });
    const customers = ref([]);
    const filteredCustomers = ref([]);
    const selectedCustomers = ref([]);
    const customerSearch = ref("");
    const showCustomerTable = ref(false);
    const errors = ref({});
    const loading = ref(false);

    // Watch for prop changes
    watch(
      () => props.visible,
      (val) => {
        localVisible.value = val;
        if (val && props.couponData) {
          form.value = {
            ...props.couponData,
            ngayBatDau: toInputDateTime(props.couponData.ngayBatDau),
            ngayKetThuc: toInputDateTime(props.couponData.ngayKetThuc),
          };
          selectedCustomers.value = props.couponData.customerIds || [];
          showCustomerTable.value = form.value.loaiApDung === "KH_CU_THE";
          filterCustomers();
        }
      }
    );

    watch(localVisible, (val) => {
      if (!val) emit("close");
    });

    // Filter customers based on search
    const filterCustomers = () => {
      const query = customerSearch.value.toLowerCase();
      filteredCustomers.value = customers.value.filter(
        (c) =>
          c.tenKhachHang?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.soDienThoai?.toLowerCase().includes(query)
      );
    };

    return {
      localVisible,
      form,
      customers,
      filteredCustomers,
      selectedCustomers,
      customerSearch,
      showCustomerTable,
      errors,
      loading,
      filterCustomers,
    };
  },
  computed: {
    labelGiaTriGiam() {
      return this.form.loaiGiamGia === "SO_TIEN_CO_DINH"
        ? "Giá trị giảm (VND)"
        : "Giá trị giảm (%)";
    },
  },
  methods: {
    handleLoaiGiamGiaChange() {
      if (this.form.loaiGiamGia === "SO_TIEN_CO_DINH") {
        this.form.soTienGiamToiDa = null;
      }
      this.errors.loaiGiamGia = null;
      this.errors.giaTriGiam = null;
      this.errors.soTienGiamToiDa = null;
    },
    handleLoaiApDungChange() {
      this.errors.loaiApDung = null;
      this.errors.selectedCustomers = null;
      if (this.form.loaiApDung === "KH_CU_THE") {
        this.showCustomerTable = true;
        this.fetchCustomers();
      } else {
        this.showCustomerTable = false;
        this.selectedCustomers = [];
      }
    },
    async fetchCustomers() {
      try {
        const res = await axios.get("http://localhost:8080/api/khach-hang");
        this.customers = Array.isArray(res.data) ? res.data : res.data.content || [];
        this.filterCustomers();
      } catch (err) {
        console.error("Lỗi tải khách hàng:", err);
        this.toast.error("Không thể tải danh sách khách hàng");
      }
    },
    closeModal() {
      this.localVisible = false;
      this.errors = {};
    },
    async updateCoupon() {
      this.errors = {};
      let isValid = true;

      // Validate form
      if (!this.form.maPhieuGiamGia.trim()) {
        this.errors.maPhieuGiamGia = "Mã phiếu không được để trống";
        isValid = false;
      }
      if (!this.form.tenPhieuGiamGia.trim()) {
        this.errors.tenPhieuGiamGia = "Tên phiếu không được để trống";
        isValid = false;
      }
      if (!this.form.loaiGiamGia) {
        this.errors.loaiGiamGia = "Vui lòng chọn loại giảm giá";
        isValid = false;
      } else if (this.form.loaiGiamGia === "PHAN_TRAM") {
        if (this.form.giaTriGiam == null || this.form.giaTriGiam < 1 || this.form.giaTriGiam > 100) {
          this.errors.giaTriGiam = "Giá trị giảm phải trong khoảng 1% - 100%";
          isValid = false;
        }
        if (this.form.soTienGiamToiDa == null || this.form.soTienGiamToiDa <= 0) {
          this.errors.soTienGiamToiDa = "Số tiền giảm tối đa phải lớn hơn 0";
          isValid = false;
        }
      } else if (this.form.loaiGiamGia === "SO_TIEN_CO_DINH") {
        if (this.form.giaTriGiam == null || this.form.giaTriGiam <= 0) {
          this.errors.giaTriGiam = "Giá trị giảm (VND) phải lớn hơn 0";
          isValid = false;
        }
      }
      if (this.form.hoaDonToiThieu == null || this.form.hoaDonToiThieu <= 0) {
        this.errors.hoaDonToiThieu = "Hóa đơn tối thiểu phải lớn hơn 0";
        isValid = false;
      }
      if (!this.form.ngayBatDau) {
        this.errors.ngayBatDau = "Ngày bắt đầu không được để trống";
        isValid = false;
      }
      if (!this.form.ngayKetThuc) {
        this.errors.ngayKetThuc = "Ngày kết thúc không được để trống";
        isValid = false;
      }
      if (this.form.ngayBatDau && this.form.ngayKetThuc) {
        if (new Date(this.form.ngayKetThuc) <= new Date(this.form.ngayBatDau)) {
          this.errors.ngayKetThuc = "Ngày kết thúc phải sau ngày bắt đầu";
          isValid = false;
        }
      }
      if (!this.form.loaiApDung) {
        this.errors.loaiApDung = "Vui lòng chọn loại áp dụng";
        isValid = false;
      } else if (this.form.loaiApDung === "KH_CU_THE" && this.selectedCustomers.length === 0) {
        this.errors.selectedCustomers = "Vui lòng chọn ít nhất một khách hàng";
        isValid = false;
      }

      if (!isValid) {
        this.toast.error("Vui lòng kiểm tra lại thông tin");
        return;
      }

      this.loading = true;
      try {
        const dataToSend = {
          ma: this.form.maPhieuGiamGia,
          tenPhieuGiamGia: this.form.tenPhieuGiamGia,
          loaiPhieuGiamGia: this.form.loaiGiamGia === "PHAN_TRAM" ? "PHANTRAM" : "SOTIEN",
          phanTramGiamGia: this.form.loaiGiamGia === "PHAN_TRAM" ? this.form.giaTriGiam : null,
          soTienGiamGia: this.form.loaiGiamGia === "SO_TIEN_CO_DINH" ? this.form.giaTriGiam : null,
          soTienGiamToiDa: this.form.soTienGiamToiDa,
          hoaDonToiThieu: this.form.hoaDonToiThieu,
          ngayBatDau: toLocalDateTime(this.form.ngayBatDau),
          ngayKetThuc: toLocalDateTime(this.form.ngayKetThuc),
          riengTu: this.form.loaiApDung === "KH_CU_THE",
          customerIds: this.form.loaiApDung === "KH_CU_THE" ? this.selectedCustomers : [],
        };

        await axios.put(`http://localhost:8080/api/phieu-giam-gia/${this.form.id}`, dataToSend);
        this.toast.success("Cập nhật phiếu thành công!");
        this.$emit("updated");
        this.closeModal();
      } catch (err) {
        console.error("Lỗi cập nhật phiếu:", err);
        this.toast.error(`Không thể cập nhật phiếu: ${err.response?.data?.message || err.message}`);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchCustomers();
  },
};
</script>

<style scoped>
.coupon-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.form-label .required {
  color: #dc2626;
}

.form-control,
.form-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 4px;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group .form-control {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group-text {
  padding: 12px 16px;
  background: #f1f5f9;
  border: 1px solid #d1d5db;
  border-left: none;
  border-radius: 0 8px 8px 0;
  font-size: 0.95rem;
  color: #64748b;
}

.table-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.table {
  margin-bottom: 0;
}

.table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  padding: 12px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.table td {
  padding: 12px;
  vertical-align: middle;
}

.table tbody tr:hover {
  background: #f8fafc;
}

.text-center {
  text-align: center;
}

.help-text {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border {
  margin-right: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-item.full-width {
    grid-column: auto;
  }

  .table-container {
    max-height: 150px;
  }
}
</style>
```