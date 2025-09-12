<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import * as XLSX from 'xlsx'
import Breadcrumb from '@/components/Breadcrumb.vue'
import DataTable from '@/components/DataTable.vue'

// --- State Management ---
const toast = useToast()
const router = useRouter()
const allEmployees = ref([])
const currentPage = ref(0)
const pageSize = ref(10)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const viewingEmployee = ref({})
const editingEmployee = ref({})
const isUpdating = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')

const filters = ref({
  search: '',
  trangThai: '',
  gioiTinh: '',
  sortBy: ''
})

const tempFilters = ref({
  search: '',
  trangThai: '',
  gioiTinh: '',
  sortBy: ''
})

const activeTab = ref('all')
const highlightedEmployee = ref(null)

const newEmployee = ref({
  chucVuID: null,
  taiKhoanID: null,
  tenNhanVien: '',
  ngaySinh: '',
  gioiTinh: true,
  soDienThoai: '',
  cccd: '',
  diaChiSoNhaTenDuong: '',
  diaChiPhuongXa: '',
  diaChiQuanHuyen: '',
  diaChiTinhThanh: '',
  ngayTao: '',
  ngayCapNhat: '',
  trangThai: true
})

// Tabs configuration
const tabs = ref([
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Hoạt động', status: true },
  { id: 'inactive', label: 'Không hoạt động', status: false }
])

// Generate fake employee data
const generateFakeEmployees = () => {
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Ngô', 'Lý']
  const middleNames = ['Văn', 'Thị', 'Minh', 'Hoàng', 'Công', 'Thanh', 'Quốc', 'Hữu', 'Đức', 'Xuân']
  const lastNames = ['An', 'Bình', 'Cường', 'Dung', 'Em', 'Phương', 'Quân', 'Hoa', 'Tùng', 'Mai', 'Linh', 'Nam', 'Hương', 'Tuấn', 'Lan']
  
  const addresses = [
    { soNha: '123 Nguyễn Văn Linh', phuongXa: 'Phường 1', quanHuyen: 'Quận 1', tinhThanh: 'TP Hồ Chí Minh' },
    { soNha: '456 Lê Lợi', phuongXa: 'Phường 2', quanHuyen: 'Quận 2', tinhThanh: 'TP Hồ Chí Minh' },
    { soNha: '789 Trần Hưng Đạo', phuongXa: 'Phường Ba Đình', quanHuyen: 'Quận Ba Đình', tinhThanh: 'Hà Nội' },
    { soNha: '321 Hoàng Diệu', phuongXa: 'Phường Hoàn Kiếm', quanHuyen: 'Quận Hoàn Kiếm', tinhThanh: 'Hà Nội' },
    { soNha: '654 Võ Thị Sáu', phuongXa: 'Phường 3', quanHuyen: 'Quận 3', tinhThanh: 'TP Hồ Chí Minh' }
  ]

  const fakeEmployees = []
  
  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const middleName = middleNames[Math.floor(Math.random() * middleNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${middleName} ${lastName}`
    
    const address = addresses[Math.floor(Math.random() * addresses.length)]
    const isActive = Math.random() > 0.2 // 80% active
    const gender = Math.random() > 0.5
    
    // Generate birth date (22-60 years old)
    const birthYear = new Date().getFullYear() - Math.floor(Math.random() * 38) - 22
    const birthMonth = Math.floor(Math.random() * 12) + 1
    const birthDay = Math.floor(Math.random() * 28) + 1
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
    
    // Generate creation date (last 2 years)
    const creationDate = new Date()
    creationDate.setDate(creationDate.getDate() - Math.floor(Math.random() * 730))
    
    fakeEmployees.push({
      id: i,
      maNhanVien: `NV${String(i).padStart(6, '0')}`,
      tenNhanVien: fullName,
      ngaySinh: birthDate.toISOString().split('T')[0],
      gioiTinh: gender,
      soDienThoai: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      cccd: Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
      diaChiSoNhaTenDuong: address.soNha,
      diaChiPhuongXa: address.phuongXa,
      diaChiQuanHuyen: address.quanHuyen,
      diaChiTinhThanh: address.tinhThanh,
      ngayTao: creationDate.toISOString(),
      ngayCapNhat: creationDate.toISOString(),
      trangThai: isActive,
      chucVu: Math.random() > 0.7 ? 'Quản lý' : 'Nhân viên',
      luong: Math.floor(Math.random() * 20000000) + 8000000 // 8M - 28M VND
    })
  }
  
  return fakeEmployees
}

// Computed Properties
const filteredEmployees = computed(() => {
  let result = allEmployees.value

  // Filter by active tab
  const activeTabObj = tabs.value.find(tab => tab.id === activeTab.value)
  if (activeTabObj?.status !== undefined) {
    result = result.filter(emp => emp.trangThai === activeTabObj.status)
  }

  // Apply other filters
  if (filters.value.search) {
    result = result.filter(emp =>
      emp.tenNhanVien?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      emp.maNhanVien?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      emp.soDienThoai?.includes(filters.value.search) ||
      emp.cccd?.includes(filters.value.search)
    )
  }

  if (filters.value.trangThai !== '') {
    result = result.filter(emp => emp.trangThai === (filters.value.trangThai === 'true'))
  }

  if (filters.value.gioiTinh !== '') {
    result = result.filter(emp => emp.gioiTinh === (filters.value.gioiTinh === 'true'))
  }

  // Apply sorting
  if (filters.value.sortBy) {
    result = [...result]
    if (filters.value.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao))
    } else if (filters.value.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.ngayTao) - new Date(b.ngayTao))
    } else if (filters.value.sortBy === 'name_asc') {
      result.sort((a, b) => a.tenNhanVien.localeCompare(b.tenNhanVien))
    } else if (filters.value.sortBy === 'name_desc') {
      result.sort((a, b) => b.tenNhanVien.localeCompare(a.tenNhanVien))
    }
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / pageSize.value) || 1)

const paginatedEmployees = computed(() => {
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  return filteredEmployees.value.slice(start, end)
})

// DataTable columns configuration
const tableColumns = ref([
  { key: 'stt', label: 'STT', class: 'text-center' },
  { key: 'maNhanVien', label: 'Mã NV', class: 'font-weight-bold' },
  { key: 'tenNhanVien', label: 'Tên Nhân Viên' },
  { key: 'ngaySinh', label: 'Ngày Sinh', class: 'text-center' },
  { key: 'gioiTinh', label: 'Giới Tính', class: 'text-center' },
  { key: 'soDienThoai', label: 'SĐT' },
  { key: 'cccd', label: 'CCCD' },
  { key: 'diaChi', label: 'Địa chỉ' },
  { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' },
  { key: 'actions', label: 'Hành Động', class: 'text-center' }
])

// Breadcrumb configuration
const breadcrumbItems = ref([
  { label: 'Quản lý nhân sự', path: '/dashboard' },
  { label: 'Nhân viên' }
])

const breadcrumbActions = ref([
  {
    label: 'Làm mới',
    type: 'default',
    handler: () => fetchAllEmployees()
  },
  {
    label: 'Xuất Excel',
    type: 'primary',
    handler: () => exportToExcel()
  },
  {
    label: 'Thêm nhân viên',
    type: 'primary',
    handler: () => navigateToAddEmployee()
  }
])

const pageStats = computed(() => [
  {
    icon: 'solar:users-group-two-rounded-bold',
    value: allEmployees.value.length,
    label: 'Tổng nhân viên'
  },
  {
    icon: 'solar:check-circle-bold',
    value: allEmployees.value.filter(emp => emp.trangThai).length,
    label: 'Đang hoạt động'
  },
  {
    icon: 'solar:close-circle-bold',
    value: allEmployees.value.filter(emp => !emp.trangThai).length,
    label: 'Không hoạt động'
  }
])

// Functions
const fetchAllEmployees = async () => {
  console.log('Bắt đầu tải nhân viên...')
  errorMessage.value = ''
  
  try {
    // Use fake data instead of API
    const fakeData = generateFakeEmployees()
    allEmployees.value = fakeData

    if (allEmployees.value.length === 0) {
      toast.info('Không có nhân viên nào trong hệ thống.', { timeout: 4000 })
    } else {
      toast.success('Dữ liệu nhân viên đã được tải thành công!', { timeout: 3000 })
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu nhân viên:', error)
    errorMessage.value = `Lỗi khi tải dữ liệu nhân viên: ${error.message}`
    toast.error(errorMessage.value, { timeout: 5000 })
  } finally {
    if (currentPage.value >= totalPages.value) {
      currentPage.value = Math.max(0, totalPages.value - 1)
    }
    console.log('Kết thúc tải nhân viên:', allEmployees.value)
  }
}

const navigateToAddEmployee = () => {
  router.push('/them-nhan-vien')
}

const editNhanVien = (employee) => {
  router.push(`/nhan-vien/edit/${employee.id}`)
}

const openAddModal = () => {
  resetNewEmployeeForm()
  showAddModal.value = true
}

const openEditModal = (employee) => {
  editingEmployee.value = { ...employee }
  showEditModal.value = true
}

const openDetailModal = (employee) => {
  viewingEmployee.value = employee
  showDetailModal.value = true
}

const handleAddEmployee = async () => {
  if (!validateEmployee(newEmployee.value)) return
  
  isUpdating.value = true
  try {
    const now = new Date().toISOString()
    const newEmp = {
      ...newEmployee.value,
      id: allEmployees.value.length + 1,
      maNhanVien: `NV${String(allEmployees.value.length + 1).padStart(6, '0')}`,
      ngayTao: now,
      ngayCapNhat: now
    }
    
    allEmployees.value.unshift(newEmp)
    showAddModal.value = false
    toast.success('Thêm nhân viên thành công!')
    resetNewEmployeeForm()
  } catch (error) {
    console.error('Lỗi khi thêm nhân viên:', error)
    toast.error('Lỗi khi thêm nhân viên.')
  } finally {
    isUpdating.value = false
  }
}

const handleUpdateEmployee = async () => {
  if (!validateEmployee(editingEmployee.value)) return
  
  isUpdating.value = true
  try {
    const index = allEmployees.value.findIndex(emp => emp.id === editingEmployee.value.id)
    if (index !== -1) {
      allEmployees.value[index] = {
        ...editingEmployee.value,
        ngayCapNhat: new Date().toISOString()
      }
    }
    
    showEditModal.value = false
    toast.success('Cập nhật nhân viên thành công!')
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên:', error)
    toast.error('Lỗi khi cập nhật nhân viên.')
  } finally {
    isUpdating.value = false
  }
}

const toggleEmployeeStatus = async (employee) => {
  isUpdating.value = true
  try {
    const index = allEmployees.value.findIndex(emp => emp.id === employee.id)
    if (index !== -1) {
      allEmployees.value[index] = {
        ...allEmployees.value[index],
        trangThai: !allEmployees.value[index].trangThai,
        ngayCapNhat: new Date().toISOString()
      }
    }
    
    const statusText = !employee.trangThai ? 'kích hoạt' : 'vô hiệu hóa'
    toast.success(`Đã ${statusText} nhân viên ${employee.tenNhanVien}!`)
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái nhân viên:', error)
    toast.error('Lỗi khi cập nhật trạng thái nhân viên.')
  } finally {
    isUpdating.value = false
  }
}

const validateEmployee = (employee) => {
  const requiredFields = [
    { field: employee.tenNhanVien, label: 'Tên nhân viên' },
    { field: employee.ngaySinh, label: 'Ngày sinh' },
    { field: employee.soDienThoai, label: 'Số điện thoại' },
    { field: employee.cccd, label: 'CCCD' },
    { field: employee.diaChiSoNhaTenDuong, label: 'Số nhà, tên đường' },
    { field: employee.diaChiPhuongXa, label: 'Phường/Xã' },
    { field: employee.diaChiQuanHuyen, label: 'Quận/Huyện' },
    { field: employee.diaChiTinhThanh, label: 'Tỉnh/Thành phố' }
  ]

  for (const item of requiredFields) {
    if (!item.field || String(item.field).trim() === '') {
      toast.error(`Vui lòng nhập ${item.label}.`)
      return false
    }
  }

  const nameRegex = /^[^\d]+$/
  if (!nameRegex.test(employee.tenNhanVien.trim())) {
    toast.error('Tên nhân viên không được chứa số.')
    return false
  }

  const phoneRegex = /^\d{10}$/
  if (!phoneRegex.test(employee.soDienThoai)) {
    toast.error('Số điện thoại phải gồm đúng 10 chữ số.')
    return false
  }

  const cccdRegex = /^\d{12}$/
  if (!cccdRegex.test(employee.cccd)) {
    toast.error('CCCD phải gồm đúng 12 chữ số.')
    return false
  }

  return true
}

const resetNewEmployeeForm = () => {
  newEmployee.value = {
    chucVuID: null,
    taiKhoanID: null,
    tenNhanVien: '',
    ngaySinh: '',
    gioiTinh: true,
    soDienThoai: '',
    cccd: '',
    diaChiSoNhaTenDuong: '',
    diaChiPhuongXa: '',
    diaChiQuanHuyen: '',
    diaChiTinhThanh: '',
    ngayTao: '',
    ngayCapNhat: '',
    trangThai: true
  }
}

const exportToExcel = () => {
  if (filteredEmployees.value.length === 0) {
    toast.info('Không có dữ liệu để xuất.')
    return
  }

  const dataToExport = filteredEmployees.value.map((emp, index) => ({
    'STT': index + 1,
    'Mã NV': emp.maNhanVien,
    'Tên Nhân Viên': emp.tenNhanVien,
    'Ngày Sinh': formatDate(emp.ngaySinh),
    'Giới Tính': emp.gioiTinh ? 'Nam' : 'Nữ',
    'SĐT': emp.soDienThoai,
    'CCCD': emp.cccd,
    'Địa chỉ': `${emp.diaChiSoNhaTenDuong}, ${emp.diaChiPhuongXa}, ${emp.diaChiQuanHuyen}, ${emp.diaChiTinhThanh}`,
    'Ngày Tạo': formatDate(emp.ngayTao),
    'Trạng Thái': emp.trangThai ? 'Hoạt động' : 'Không hoạt động'
  }))

  const worksheet = XLSX.utils.json_to_sheet(dataToExport)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachNhanVien')
  XLSX.writeFile(workbook, `danh_sach_nhan_vien_${new Date().toISOString().split('T')[0]}.xlsx`)
  toast.success('Xuất file Excel thành công!')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString('vi-VN')
  } catch (e) {
    return 'Invalid Date'
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return 'Invalid Date'
  }
}

const getTabCount = (tabId) => {
  if (!allEmployees.value.length) return 0
  if (tabId === 'all') return allEmployees.value.length
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab?.status === undefined) return 0
  return allEmployees.value.filter(emp => emp.trangThai === tab.status).length
}

const switchTab = (tabId) => {
  activeTab.value = tabId
  const tab = tabs.value.find(t => t.id === tabId)
  filters.value.trangThai = tab.status !== undefined ? String(tab.status) : ''
  currentPage.value = 0
  
  if (tabId === 'all') {
    toast.info('Đang hiển thị tất cả nhân viên.', { timeout: 2000 })
  } else {
    toast.info(`Đang hiển thị nhân viên trạng thái: ${tab.label}.`, { timeout: 2000 })
  }
}

const filterEmployees = () => {
  filters.value.search = tempFilters.value.search
  filters.value.trangThai = tempFilters.value.trangThai
  filters.value.gioiTinh = tempFilters.value.gioiTinh
  filters.value.sortBy = tempFilters.value.sortBy
  currentPage.value = 0
  
  toast.success('Đã áp dụng bộ lọc!', { timeout: 2000 })
}

const resetFilters = () => {
  filters.value = { search: '', trangThai: '', gioiTinh: '', sortBy: '' }
  tempFilters.value = { search: '', trangThai: '', gioiTinh: '', sortBy: '' }
  activeTab.value = 'all'
  currentPage.value = 0
  toast.info('Đã đặt lại tất cả bộ lọc!', { timeout: 2000 })
}

const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
  }
}

// Lifecycle Hook
onMounted(() => {
  fetchAllEmployees()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4 md:p-6 font-roboto transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Quản lý Nhân Viên"
      page-description="Quản lý và theo dõi tất cả nhân viên trong hệ thống"
      page-icon="solar:users-group-two-rounded-bold-duotone"
      :page-stats="pageStats"
    />

    <div v-if="errorMessage" class="card bg-red-50 dark:bg-red-950 p-4 mb-6 rounded-3xl shadow-lg animate__animated animate__fadeIn">
      <p class="text-red-600 dark:text-red-300 font-medium flex items-center">
        <Icon icon="solar:danger-triangle-bold-duotone" class="text-2xl mr-3" />
        {{ errorMessage }}
      </p>
    </div>

    <!-- Filter Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <div class="filter-header mb-4">
        <h3 class="filter-title">
          <Icon icon="solar:filter-bold-duotone" class="text-xl" />
          Bộ Lọc Nhân Viên
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
              placeholder="Tìm kiếm mã NV, tên nhân viên, SĐT..."
              class="filter-input"
              @input="filterEmployees"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.trangThai"
                  value=""
                  @change="filterEmployees"
                  class="radio-input"
                />
                <span class="radio-label">Tất cả</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.trangThai"
                  value="true"
                  @change="filterEmployees"
                  class="radio-input"
                />
                <span class="radio-label">Hoạt động</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.trangThai"
                  value="false"
                  @change="filterEmployees"
                  class="radio-input"
                />
                <span class="radio-label">Không hoạt động</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Second Row: Gender and Sort -->
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Giới tính</label>
            <select
              v-model="tempFilters.gioiTinh"
              class="filter-input"
              @change="filterEmployees"
            >
              <option value="">Tất cả giới tính</option>
              <option value="true">Nam</option>
              <option value="false">Nữ</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Sắp xếp theo</label>
            <select
              v-model="tempFilters.sortBy"
              class="filter-select"
              @change="filterEmployees"
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

        <!-- Employee List Section -->
        <div class="employees-section">
          <div class="section-header">
            <h3 class="section-title">
              <Icon icon="solar:users-group-two-rounded-bold-duotone" class="text-xl" />
              Danh Sách Nhân Viên ({{ filteredEmployees.length }})
            </h3>
          </div>

          <!-- DataTable Component -->
          <DataTable
            :data="filteredEmployees"
            :columns="tableColumns"
            item-label="nhân viên"
            empty-message="Không có dữ liệu nhân viên nào được tìm thấy."
            key-field="id"
          >
            <!-- Custom column templates -->
            <template #stt="{ rowIndex }">
              {{ rowIndex }}
            </template>
            
            <template #maNhanVien="{ item }">
              <span class="font-bold text-gray-800 dark:text-gray-100">{{ item.maNhanVien }}</span>
            </template>
            
            <template #tenNhanVien="{ item }">
              {{ item.tenNhanVien }}
            </template>
            
            <template #ngaySinh="{ item }">
              {{ formatDate(item.ngaySinh) }}
            </template>
            
            <template #gioiTinh="{ item }">
              <span :class="item.gioiTinh ? 'inline-flex items-center text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full font-medium text-xs' : 'inline-flex items-center text-pink-700 bg-pink-100 px-2.5 py-1 rounded-full font-medium text-xs'">
                <Icon :icon="item.gioiTinh ? 'solar:men-bold' : 'solar:women-bold'" class="w-3 h-3 mr-1" />
                {{ item.gioiTinh ? 'Nam' : 'Nữ' }}
              </span>
            </template>
            
            <template #soDienThoai="{ item }">
              {{ item.soDienThoai }}
            </template>
            
            <template #cccd="{ item }">
              {{ item.cccd }}
            </template>
            
            <template #diaChi="{ item }">
              {{ `${item.diaChiSoNhaTenDuong}, ${item.diaChiPhuongXa}, ${item.diaChiQuanHuyen}, ${item.diaChiTinhThanh}` }}
            </template>
            
            <template #trangThai="{ item }">
              <span :class="item.trangThai ? 'inline-flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium text-xs' : 'inline-flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-full font-medium text-xs'">
                <Icon :icon="item.trangThai ? 'solar:check-circle-bold' : 'solar:close-circle-bold'" class="w-3 h-3 mr-1" />
                {{ item.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
              </span>
            </template>
            
            <template #actions="{ item }">
              <div class="flex justify-center items-center gap-3">
                <button
                  @click="editNhanVien(item)"
                  class="action-btn edit"
                  title="Sửa"
                >
                  <Icon icon="solar:pen-bold" />
                </button>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="item.trangThai"
                    @change="toggleEmployeeStatus(item)"
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

    <!-- Add Employee Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Icon icon="solar:user-plus-bold" class="text-2xl mr-2 text-green-600" />
          Thêm Nhân Viên Mới
        </h3>
        <form @submit.prevent="handleAddEmployee">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tên nhân viên <span class="text-red-500">*</span></label>
              <input
                v-model="newEmployee.tenNhanVien"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Ngày sinh <span class="text-red-500">*</span></label>
              <input
                v-model="newEmployee.ngaySinh"
                type="date"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Giới tính</label>
              <select
                v-model="newEmployee.gioiTinh"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
              >
                <option :value="true">Nam</option>
                <option :value="false">Nữ</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Số điện thoại <span class="text-red-500">*</span></label>
              <input
                v-model="newEmployee.soDienThoai"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="0123456789"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">CCCD <span class="text-red-500">*</span></label>
              <input
                v-model="newEmployee.cccd"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="123456789012"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Số nhà, tên đường <span class="text-red-500">*</span></label>
              <input
                v-model="newEmployee.diaChiSoNhaTenDuong"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="123 Nguyễn Văn Linh"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Phường/Xã <span class="text-red-500">*</span></label>
              <input
                v-model="newEmployee.diaChiPhuongXa"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="Phường ABC"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quận/Huyện <span class="text-red-500">*</span></label>
              <input
                v-model="newEmployee.diaChiQuanHuyen"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="Quận XYZ"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tỉnh/Thành phố <span class="text-red-500">*</span></label>
              <input
                v-model="newEmployee.diaChiTinhThanh"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="Hà Nội"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Trạng thái</label>
              <select
                v-model="newEmployee.trangThai"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
              >
                <option :value="true">Hoạt động</option>
                <option :value="false">Không hoạt động</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              type="submit"
              :disabled="isUpdating"
              class="btn-primary px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition duration-300 shadow-lg hover:shadow-xl flex-1 flex items-center justify-center"
            >
              <Icon v-if="isUpdating" icon="solar:loading-bold" class="animate-spin mr-2" />
              Lưu
            </button>
            <button
              type="button"
              @click="showAddModal = false"
              :disabled="isUpdating"
              class="btn-secondary px-6 py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Employee Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Icon icon="solar:pen-bold" class="text-2xl mr-2 text-yellow-600" />
          Sửa Thông Tin Nhân Viên
        </h3>
        <form @submit.prevent="handleUpdateEmployee">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tên nhân viên <span class="text-red-500">*</span></label>
              <input
                v-model="editingEmployee.tenNhanVien"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Ngày sinh <span class="text-red-500">*</span></label>
              <input
                v-model="editingEmployee.ngaySinh"
                type="date"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Giới tính</label>
              <select
                v-model="editingEmployee.gioiTinh"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
              >
                <option :value="true">Nam</option>
                <option :value="false">Nữ</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Số điện thoại <span class="text-red-500">*</span></label>
              <input
                v-model="editingEmployee.soDienThoai"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">CCCD <span class="text-red-500">*</span></label>
              <input
                v-model="editingEmployee.cccd"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Số nhà, tên đường <span class="text-red-500">*</span></label>
              <input
                v-model="editingEmployee.diaChiSoNhaTenDuong"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Phường/Xã <span class="text-red-500">*</span></label>
              <input
                v-model="editingEmployee.diaChiPhuongXa"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quận/Huyện <span class="text-red-500">*</span></label>
              <input
                v-model="editingEmployee.diaChiQuanHuyen"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tỉnh/Thành phố <span class="text-red-500">*</span></label>
              <input
                v-model="editingEmployee.diaChiTinhThanh"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Trạng thái</label>
              <select
                v-model="editingEmployee.trangThai"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
              >
                <option :value="true">Hoạt động</option>
                <option :value="false">Không hoạt động</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              type="submit"
              :disabled="isUpdating"
              class="btn-primary px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition duration-300 shadow-lg hover:shadow-xl flex-1 flex items-center justify-center"
            >
              <Icon v-if="isUpdating" icon="solar:loading-bold" class="animate-spin mr-2" />
              Lưu thay đổi
            </button>
            <button
              type="button"
              @click="showEditModal = false"
              :disabled="isUpdating"
              class="btn-secondary px-6 py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Employee Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Icon icon="solar:eye-bold" class="text-2xl mr-2 text-blue-600" />
          Chi Tiết Nhân Viên
        </h3>
        <div v-if="viewingEmployee" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Mã nhân viên:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingEmployee.maNhanVien }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Tên nhân viên:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingEmployee.tenNhanVien }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày sinh:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ formatDate(viewingEmployee.ngaySinh) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingEmployee.gioiTinh ? 'Nam' : 'Nữ' }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingEmployee.soDienThoai }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">CCCD:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingEmployee.cccd }}</p>
            </div>
            <div class="md:col-span-2">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Địa chỉ:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">
                {{ `${viewingEmployee.diaChiSoNhaTenDuong}, ${viewingEmployee.diaChiPhuongXa}, ${viewingEmployee.diaChiQuanHuyen}, ${viewingEmployee.diaChiTinhThanh}` }}
              </p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ formatDateTime(viewingEmployee.ngayTao) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày cập nhật:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ formatDateTime(viewingEmployee.ngayCapNhat) }}</p>
            </div>
            <div class="md:col-span-2">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái:</span>
              <span :class="viewingEmployee.trangThai ? 'status-badge active' : 'status-badge inactive'">
                <Icon :icon="viewingEmployee.trangThai ? 'solar:check-circle-bold' : 'solar:close-circle-bold'" class="w-3 h-3 mr-1" />
                {{ viewingEmployee.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex justify-end mt-6">
          <button
            @click="showDetailModal = false"
            class="btn-secondary px-6 py-3 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition duration-300 shadow-lg hover:shadow-xl"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

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

.btn-secondary {
  background: #ef4444;
  color: white;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.45);
}

.btn-secondary:disabled {
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
  .table th,
  .table td {
    padding: 10px;
    font-size: 0.8rem;
  }
  .tabs {
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .tab {
    padding: 0.5rem 0.8rem;
    font-size: 0.75rem;
  }
  .pagination {
    flex-direction: column;
    align-items: center;
  }
  .pagination button {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Order Type Badge Styles */
.order-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.online-order {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.online-order:hover {
  background: #bfdbfe;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.offline-order {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #86efac;
}

.offline-order:hover {
  background: #bbf7d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}
</style>
