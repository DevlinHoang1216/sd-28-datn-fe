<template>
  <div class="customer-edit-container">
    <!-- Breadcrumb -->
    <Breadcrumb
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Chỉnh Sửa Khách Hàng"
      page-description="Cập nhật thông tin khách hàng trong hệ thống"
      page-icon="solar:settings-bold-duotone"
      :page-stats="pageStats"
      :actions="breadcrumbActions"
    />

    <!-- Main Content -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- Customer Form -->
        <div class="form-panel">
          <div class="card">
            <div class="loading-spinner" v-if="loading"></div>
            <div class="card-content" :class="{ 'loading-overlay': loading }">
              <form @submit.prevent="submitForm">
                <!-- Personal Information Section -->
                <div class="form-section">
                  <div class="section-header">
                    <h3 class="section-title">
                      <Icon icon="solar:user-id-bold-duotone" class="section-icon" />
                      Thông tin cá nhân
                    </h3>
                    <p class="section-description">Cập nhật thông tin cơ bản của khách hàng</p>
                  </div>

                  <div class="form-grid personal-info">
                    <!-- Tên khách hàng -->
                    <div class="form-group col-span-2">
                      <label class="form-label">
                        <Icon icon="solar:user-bold-duotone" class="label-icon" />
                        Tên khách hàng <span class="required">*</span>
                      </label>
                      <input
                        v-model="customer.tenKhachHang"
                        type="text"
                        class="form-input"
                        placeholder="Nhập họ và tên đầy đủ"
                        required
                      />
                    </div>

                    <!-- Ngày sinh -->
                    <div class="form-group">
                      <label class="form-label">
                        <Icon icon="solar:calendar-bold-duotone" class="label-icon" />
                        Ngày sinh <span class="required">*</span>
                      </label>
                      <input
                        v-model="customer.ngaySinh"
                        type="date"
                        class="form-input"
                        required
                      />
                    </div>

                    <!-- Giới tính -->
                    <div class="form-group">
                      <label class="form-label">
                        <Icon icon="solar:user-speak-bold-duotone" class="label-icon" />
                        Giới tính
                      </label>
                      <select v-model="customer.gioiTinh" class="form-input">
                        <option :value="true">Nam</option>
                        <option :value="false">Nữ</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Contact Information Section -->
                <div class="form-section">
                  <div class="section-header">
                    <h3 class="section-title">
                      <Icon icon="solar:phone-bold-duotone" class="section-icon" />
                      Thông tin liên hệ & Trạng thái
                    </h3>
                    <p class="section-description">Thông tin liên lạc và trạng thái hoạt động của khách hàng</p>
                  </div>

                  <div class="form-grid contact-info">
                    <!-- Số điện thoại -->
                    <div class="form-group">
                      <label class="form-label">
                        <Icon icon="solar:phone-calling-bold-duotone" class="label-icon" />
                        Số điện thoại <span class="required">*</span>
                      </label>
                      <input
                        v-model="customer.soDienThoai"
                        type="text"
                        class="form-input"
                        placeholder="0123456789"
                        required
                      />
                    </div>

                    <!-- Trạng thái -->
                    <div class="form-group">
                      <label class="form-label">
                        <Icon icon="solar:shield-check-bold-duotone" class="label-icon" />
                        Trạng thái
                      </label>
                      <select v-model="customer.trangThai" class="form-input">
                        <option :value="true">Hoạt động</option>
                        <option :value="false">Không hoạt động</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Address Section -->
                <div class="form-section address-section">
                  <div class="section-header">
                    <h3 class="section-title">
                      <Icon icon="solar:map-point-bold-duotone" class="section-icon" />
                      Địa chỉ thường trú
                    </h3>
                    <p class="section-description">Địa chỉ nơi khách hàng đang sinh sống</p>
                  </div>
                  
                  <div class="form-grid address-grid">
                    <!-- Số nhà, tên đường -->
                    <div class="form-group col-span-full">
                      <label class="form-label">
                        <Icon icon="solar:home-bold-duotone" class="label-icon" />
                        Số nhà, tên đường <span class="required">*</span>
                      </label>
                      <input
                        v-model="customer.diaChiSoNhaTenDuong"
                        type="text"
                        class="form-input"
                        placeholder="Ví dụ: 123 Nguyễn Văn Linh"
                        required
                      />
                    </div>

                    <!-- Phường/Xã -->
                    <div class="form-group">
                      <label class="form-label">
                        <Icon icon="solar:buildings-bold-duotone" class="label-icon" />
                        Phường/Xã <span class="required">*</span>
                      </label>
                      <input
                        v-model="customer.diaChiPhuongXa"
                        type="text"
                        class="form-input"
                        placeholder="Phường ABC"
                        required
                      />
                    </div>

                    <!-- Quận/Huyện -->
                    <div class="form-group">
                      <label class="form-label">
                        <Icon icon="solar:city-bold-duotone" class="label-icon" />
                        Quận/Huyện <span class="required">*</span>
                      </label>
                      <input
                        v-model="customer.diaChiQuanHuyen"
                        type="text"
                        class="form-input"
                        placeholder="Quận XYZ"
                        required
                      />
                    </div>

                    <!-- Tỉnh/Thành phố -->
                    <div class="form-group">
                      <label class="form-label">
                        <Icon icon="solar:global-bold-duotone" class="label-icon" />
                        Tỉnh/Thành phố <span class="required">*</span>
                      </label>
                      <input
                        v-model="customer.diaChiTinhThanh"
                        type="text"
                        class="form-input"
                        placeholder="Hà Nội"
                        required
                      />
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-section">
                  <div class="action-buttons">
                    <button
                      type="button"
                      class="btn-secondary"
                      @click="goBack"
                      :disabled="loading"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      class="btn-primary"
                      :disabled="loading"
                    >
                      <Icon v-if="loading" icon="solar:loading-bold" class="animate-spin btn-icon" />
                      Cập nhật khách hàng
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

// Composables
const toast = useToast()
const router = useRouter()
const route = useRoute()

// State
const loading = ref(false)
const customerId = ref(route.params.id)

const customer = ref({
  id: null,
  taiKhoanID: null,
  tenKhachHang: '',
  ngaySinh: '',
  gioiTinh: true,
  soDienThoai: '',
  diaChiSoNhaTenDuong: '',
  diaChiPhuongXa: '',
  diaChiQuanHuyen: '',
  diaChiTinhThanh: '',
  trangThai: true
})

// Breadcrumb configuration
const breadcrumbItems = ref([
  { label: 'Quản lý khách hàng', path: '/dashboard' },
  { label: 'Khách hàng', path: '/khach-hang' },
  { label: 'Chỉnh sửa' }
])

const breadcrumbActions = ref([
  {
    label: 'Danh sách khách hàng',
    type: 'default',
    handler: () => router.push('/khach-hang')
  },
  {
    label: 'Làm mới',
    type: 'default',
    handler: () => loadCustomerData()
  }
])

const pageStats = ref([
  {
    icon: 'solar:settings-bold-duotone',
    value: 'Sửa',
    label: 'Khách hàng'
  },
  {
    icon: 'solar:refresh-bold-duotone',
    value: 'Cập nhật',
    label: 'Thông tin'
  }
])

// Load customer data
const loadCustomerData = async () => {
  if (!customerId.value) return
  
  loading.value = true
  try {
    // Here you would normally fetch customer data from API
    // For now, we'll simulate with mock data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock customer data
    const mockCustomer = {
      id: customerId.value,
      taiKhoanID: 1,
      tenKhachHang: 'Nguyễn Văn A',
      ngaySinh: '1990-01-15',
      gioiTinh: true,
      soDienThoai: '0123456789',
      diaChiSoNhaTenDuong: '123 Nguyễn Văn Linh',
      diaChiPhuongXa: 'Phường Tân Bình',
      diaChiQuanHuyen: 'Quận 1',
      diaChiTinhThanh: 'TP. Hồ Chí Minh',
      trangThai: true
    }
    
    customer.value = mockCustomer
    toast.success('Tải thông tin khách hàng thành công!')
  } catch (error) {
    console.error('Lỗi khi tải thông tin khách hàng:', error)
    toast.error('Lỗi khi tải thông tin khách hàng.')
  } finally {
    loading.value = false
  }
}

// Validation function
const validateCustomer = (cust) => {
  const requiredFields = [
    { field: cust.tenKhachHang, label: 'Tên khách hàng' },
    { field: cust.ngaySinh, label: 'Ngày sinh' },
    { field: cust.soDienThoai, label: 'Số điện thoại' },
    { field: cust.diaChiSoNhaTenDuong, label: 'Số nhà, tên đường' },
    { field: cust.diaChiPhuongXa, label: 'Phường/Xã' },
    { field: cust.diaChiQuanHuyen, label: 'Quận/Huyện' },
    { field: cust.diaChiTinhThanh, label: 'Tỉnh/Thành phố' }
  ]

  for (const item of requiredFields) {
    if (!item.field || String(item.field).trim() === '') {
      toast.error(`Vui lòng nhập ${item.label}.`)
      return false
    }
  }

  const nameRegex = /^[\p{L}\s]+$/u
  if (!nameRegex.test(cust.tenKhachHang.trim())) {
    toast.error('Tên khách hàng chỉ được chứa chữ cái và khoảng trắng.')
    return false
  }

  const phoneRegex = /^0\d{9}$/
  if (!phoneRegex.test(cust.soDienThoai)) {
    toast.error('Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.')
    return false
  }

  return true
}

// Form submission
const submitForm = async () => {
  if (!validateCustomer(customer.value)) return

  loading.value = true
  try {
    const now = new Date().toISOString()
    const updatedCustomer = {
      ...customer.value,
      ngayCapNhat: now
    }

    // Here you would normally make an API call to update customer
    // For now, we'll simulate success
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Cập nhật khách hàng thành công!')
    router.push('/khach-hang')
  } catch (error) {
    console.error('Lỗi khi cập nhật khách hàng:', error)
    toast.error('Lỗi khi cập nhật khách hàng.')
  } finally {
    loading.value = false
  }
}

// Go back
const goBack = () => {
  router.push('/khach-hang')
}

// Load data on component mount
onMounted(() => {
  loadCustomerData()
})
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.customer-edit-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  width: 100%;
}

.content-wrapper {
  width: 100%;
}

.form-panel {
  width: 100%;
}

/* ===== CARD STYLES ===== */
.card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-content {
  padding: 40px;
}

/* ===== FORM SECTIONS ===== */
.form-section {
  margin-bottom: 40px;
  position: relative;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.section-header {
  margin-bottom: 28px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.section-description {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  padding-left: 36px;
}

/* ===== FORM GRID LAYOUTS ===== */
.form-grid {
  display: grid;
  gap: 32px;
}

.personal-info {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.contact-info {
  grid-template-columns: 1fr 1fr;
}

.address-grid {
  grid-template-columns: repeat(3, 1fr);
}

.col-span-2 {
  grid-column: span 2;
}

.col-span-full {
  grid-column: 1 / -1;
}

/* ===== FORM ELEMENTS ===== */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-icon {
  font-size: 1rem;
  color: #6b7280;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #fafbfc;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.form-input:hover:not(:focus) {
  border-color: #d1d5db;
  background: white;
}

/* ===== ADDRESS SECTION STYLING ===== */
.address-section {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 32px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  position: relative;
}

.address-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 20px 20px 0 0;
}

/* ===== ACTION SECTION ===== */
.action-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid #f1f5f9;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 160px;
  position: relative;
  overflow: hidden;
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  color: #374151;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ===== LOADING STYLES ===== */
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
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 48px;
  height: 48px;
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
  .content-wrapper {
    max-width: 800px;
  }
  
  .personal-info {
    grid-template-columns: 1fr 1fr;
  }
  
  .col-span-2 {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .customer-edit-container {
    padding: 16px;
  }

  .card-content {
    padding: 28px;
  }

  .personal-info,
  .contact-info {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .col-span-2,
  .col-span-full {
    grid-column: 1;
  }

  .action-buttons {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    min-width: unset;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .section-description {
    padding-left: 32px;
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 20px;
  }

  .form-section {
    margin-bottom: 32px;
  }

  .form-label {
    font-size: 0.9rem;
  }

  .form-input {
    padding: 12px 16px;
    font-size: 0.9rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .section-description {
    font-size: 0.85rem;
    padding-left: 28px;
  }

  .action-section {
    margin-top: 32px;
    padding-top: 24px;
  }
}
</style>
