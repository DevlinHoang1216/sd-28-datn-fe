<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { Icon } from '@iconify/vue'
import * as XLSX from 'xlsx'
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb.vue'
import DataTable from '@/components/DataTable.vue'

// --- State Management ---
const toast = useToast()
const allCustomers = ref([])
const currentPage = ref(0)
const pageSize = ref(10)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const viewingCustomer = ref({})
const editingCustomer = ref({})
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
const highlightedCustomer = ref(null)

const newCustomer = ref({
  tenKhachHang: '',
  soDienThoai: '',
  gioiTinh: true,
  ngaySinh: '',
  ngayTao: '',
  ngayCapNhat: '',
  taiKhoanID: null,
  trangThai: true
})

// Tabs configuration
const tabs = ref([
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Hoạt động', status: true },
  { id: 'inactive', label: 'Không hoạt động', status: false }
])

// Generate fake customer data
const generateFakeCustomers = () => {
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Ngô', 'Lý']
  const middleNames = ['Văn', 'Thị', 'Minh', 'Hoàng', 'Công', 'Thanh', 'Quốc', 'Hữu', 'Đức', 'Xuân']
  const lastNames = ['An', 'Bình', 'Cường', 'Dung', 'Em', 'Phương', 'Quân', 'Hoa', 'Tùng', 'Mai', 'Linh', 'Nam', 'Hương', 'Tuấn', 'Lan']
  
  const fakeCustomers = []
  
  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const middleName = middleNames[Math.floor(Math.random() * middleNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${middleName} ${lastName}`
    
    const isActive = Math.random() > 0.2 // 80% active
    const gender = Math.random() > 0.5
    
    // Generate birth date (18-65 years old)
    const birthYear = new Date().getFullYear() - Math.floor(Math.random() * 47) - 18
    const birthMonth = Math.floor(Math.random() * 12) + 1
    const birthDay = Math.floor(Math.random() * 28) + 1
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
    
    // Generate creation date (last 2 years)
    const creationDate = new Date()
    creationDate.setDate(creationDate.getDate() - Math.floor(Math.random() * 730))
    
    fakeCustomers.push({
      id: i,
      maKhachHang: `KH${String(i).padStart(6, '0')}`,
      tenKhachHang: fullName,
      soDienThoai: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      gioiTinh: gender,
      ngaySinh: birthDate.toISOString().split('T')[0],
      ngayTao: creationDate.toISOString(),
      ngayCapNhat: creationDate.toISOString(),
      trangThai: isActive,
      taiKhoanID: null
    })
  }
  
  return fakeCustomers
}

// Computed Properties
const filteredCustomers = computed(() => {
  let result = allCustomers.value

  // Filter by active tab
  const activeTabObj = tabs.value.find(tab => tab.id === activeTab.value)
  if (activeTabObj?.status !== undefined) {
    result = result.filter(customer => customer.trangThai === activeTabObj.status)
  }

  // Apply other filters
  if (filters.value.search) {
    result = result.filter(customer =>
      customer.tenKhachHang?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      customer.maKhachHang?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      customer.soDienThoai?.includes(filters.value.search)
    )
  }

  if (filters.value.trangThai !== '') {
    result = result.filter(customer => customer.trangThai === (filters.value.trangThai === 'true'))
  }

  if (filters.value.gioiTinh !== '') {
    result = result.filter(customer => customer.gioiTinh === (filters.value.gioiTinh === 'true'))
  }

  // Apply sorting
  if (filters.value.sortBy) {
    result = [...result]
    if (filters.value.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao))
    } else if (filters.value.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.ngayTao) - new Date(b.ngayTao))
    } else if (filters.value.sortBy === 'name_asc') {
      result.sort((a, b) => a.tenKhachHang.localeCompare(b.tenKhachHang))
    } else if (filters.value.sortBy === 'name_desc') {
      result.sort((a, b) => b.tenKhachHang.localeCompare(a.tenKhachHang))
    }
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / pageSize.value) || 1)

const paginatedCustomers = computed(() => {
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  return filteredCustomers.value.slice(start, end)
})

// DataTable columns configuration
const tableColumns = ref([
  { key: 'stt', label: 'STT', class: 'text-center' },
  { key: 'maKhachHang', label: 'Mã KH', class: 'font-weight-bold' },
  { key: 'tenKhachHang', label: 'Tên Khách Hàng' },
  { key: 'soDienThoai', label: 'SĐT' },
  { key: 'gioiTinh', label: 'Giới Tính', class: 'text-center' },
  { key: 'ngaySinh', label: 'Ngày Sinh', class: 'text-center' },
  { key: 'ngayTao', label: 'Ngày Tạo', class: 'text-center' },
  { key: 'ngayCapNhat', label: 'Ngày Cập Nhật', class: 'text-center' },
  { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' },
  { key: 'actions', label: 'Hành Động', class: 'text-center' }
])

// Breadcrumb configuration
const breadcrumbItems = ref([
  { label: 'Quản lý khách hàng', path: '/dashboard' },
  { label: 'Khách hàng' }
])

const breadcrumbActions = ref([
  {
    label: 'Làm mới',
    type: 'default',
    handler: () => fetchAllCustomers()
  },
  {
    label: 'Xuất Excel',
    type: 'primary',
    handler: () => exportToExcel()
  },
  {
    label: 'Thêm khách hàng',
    type: 'primary',
    handler: () => openAddModal()
  }
])

const pageStats = computed(() => [
  {
    icon: 'solar:users-group-two-rounded-bold',
    value: allCustomers.value.length,
    label: 'Tổng khách hàng'
  },
  {
    icon: 'solar:check-circle-bold',
    value: allCustomers.value.filter(customer => customer.trangThai).length,
    label: 'Đang hoạt động'
  },
  {
    icon: 'solar:close-circle-bold',
    value: allCustomers.value.filter(customer => !customer.trangThai).length,
    label: 'Không hoạt động'
  }
])

// Functions
const fetchAllCustomers = async () => {
  console.log('Bắt đầu tải khách hàng...')
  errorMessage.value = ''
  
  try {
    // Use fake data instead of API
    const fakeData = generateFakeCustomers()
    allCustomers.value = fakeData

    if (allCustomers.value.length === 0) {
      toast.info('Không có khách hàng nào trong hệ thống.', { timeout: 4000 })
    } else {
      toast.success('Dữ liệu khách hàng đã được tải thành công!', { timeout: 3000 })
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu khách hàng:', error)
    errorMessage.value = `Lỗi khi tải dữ liệu khách hàng: ${error.message}`
    toast.error(errorMessage.value, { timeout: 5000 })
  } finally {
    if (currentPage.value >= totalPages.value) {
      currentPage.value = Math.max(0, totalPages.value - 1)
    }
    console.log('Kết thúc tải khách hàng:', allCustomers.value)
  }
}

const openAddModal = () => {
  resetNewCustomerForm()
  showAddModal.value = true
}

const openEditModal = (customer) => {
  editingCustomer.value = { ...customer }
  showEditModal.value = true
}

const openDetailModal = (customer) => {
  viewingCustomer.value = customer
  showDetailModal.value = true
}

const handleAddCustomer = async () => {
  if (!validateCustomer(newCustomer.value)) return
  
  isUpdating.value = true
  try {
    const now = new Date().toISOString()
    const newCust = {
      ...newCustomer.value,
      id: allCustomers.value.length + 1,
      maKhachHang: `KH${String(allCustomers.value.length + 1).padStart(6, '0')}`,
      ngayTao: now,
      ngayCapNhat: now
    }
    
    allCustomers.value.unshift(newCust)
    showAddModal.value = false
    toast.success('Thêm khách hàng thành công!')
    resetNewCustomerForm()
  } catch (error) {
    console.error('Lỗi khi thêm khách hàng:', error)
    toast.error('Lỗi khi thêm khách hàng.')
  } finally {
    isUpdating.value = false
  }
}

const handleUpdateCustomer = async () => {
  if (!validateCustomer(editingCustomer.value)) return
  
  isUpdating.value = true
  try {
    const index = allCustomers.value.findIndex(customer => customer.id === editingCustomer.value.id)
    if (index !== -1) {
      allCustomers.value[index] = {
        ...editingCustomer.value,
        ngayCapNhat: new Date().toISOString()
      }
    }
    
    showEditModal.value = false
    toast.success('Cập nhật khách hàng thành công!')
  } catch (error) {
    console.error('Lỗi khi cập nhật khách hàng:', error)
    toast.error('Lỗi khi cập nhật khách hàng.')
  } finally {
    isUpdating.value = false
  }
}

const toggleCustomerStatus = async (customer) => {
  isUpdating.value = true
  try {
    const index = allCustomers.value.findIndex(cust => cust.id === customer.id)
    if (index !== -1) {
      allCustomers.value[index] = {
        ...allCustomers.value[index],
        trangThai: !allCustomers.value[index].trangThai,
        ngayCapNhat: new Date().toISOString()
      }
    }
    
    const statusText = !customer.trangThai ? 'kích hoạt' : 'vô hiệu hóa'
    toast.success(`Đã ${statusText} khách hàng ${customer.tenKhachHang}!`)
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái khách hàng:', error)
    toast.error('Lỗi khi cập nhật trạng thái khách hàng.')
  } finally {
    isUpdating.value = false
  }
}

const validateCustomer = (customer) => {
  const requiredFields = [
    { field: customer.tenKhachHang, label: 'Tên khách hàng' },
    { field: customer.soDienThoai, label: 'Số điện thoại' },
    { field: customer.ngaySinh, label: 'Ngày sinh' }
  ]

  for (const item of requiredFields) {
    if (!item.field || String(item.field).trim() === '') {
      toast.error(`Vui lòng nhập ${item.label}.`)
      return false
    }
  }

  const nameRegex = /^[\p{L}\s]+$/u
  if (!nameRegex.test(customer.tenKhachHang.trim())) {
    toast.error('Tên khách hàng chỉ được chứa chữ cái và khoảng trắng.')
    return false
  }

  const phoneRegex = /^0\d{9}$/
  if (!phoneRegex.test(customer.soDienThoai)) {
    toast.error('Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.')
    return false
  }

  return true
}

const resetNewCustomerForm = () => {
  newCustomer.value = {
    tenKhachHang: '',
    soDienThoai: '',
    gioiTinh: true,
    ngaySinh: '',
    ngayTao: '',
    ngayCapNhat: '',
    taiKhoanID: null,
    trangThai: true
  }
}

const exportToExcel = () => {
  if (filteredCustomers.value.length === 0) {
    toast.info('Không có dữ liệu để xuất.')
    return
  }

  const dataToExport = filteredCustomers.value.map((customer, index) => ({
    'STT': index + 1,
    'Mã KH': customer.maKhachHang,
    'Tên Khách Hàng': customer.tenKhachHang,
    'Số Điện Thoại': customer.soDienThoai,
    'Giới Tính': customer.gioiTinh ? 'Nam' : 'Nữ',
    'Ngày Sinh': formatDate(customer.ngaySinh),
    'Ngày Tạo': formatDate(customer.ngayTao),
    'Ngày Cập Nhật': formatDate(customer.ngayCapNhat),
    'Trạng Thái': customer.trangThai ? 'Hoạt động' : 'Không hoạt động'
  }))

  const worksheet = XLSX.utils.json_to_sheet(dataToExport)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachKhachHang')
  XLSX.writeFile(workbook, `danh_sach_khach_hang_${new Date().toISOString().split('T')[0]}.xlsx`)
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
  if (!allCustomers.value.length) return 0
  if (tabId === 'all') return allCustomers.value.length
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab?.status === undefined) return 0
  return allCustomers.value.filter(customer => customer.trangThai === tab.status).length
}

const switchTab = (tabId) => {
  activeTab.value = tabId
  const tab = tabs.value.find(t => t.id === tabId)
  filters.value.trangThai = tab.status !== undefined ? String(tab.status) : ''
  currentPage.value = 0
  
  if (tabId === 'all') {
    toast.info('Đang hiển thị tất cả khách hàng.', { timeout: 2000 })
  } else {
    toast.info(`Đang hiển thị khách hàng trạng thái: ${tab.label}.`, { timeout: 2000 })
  }
}

const filterCustomers = () => {
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
  fetchAllCustomers()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4 md:p-6 font-roboto transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Quản lý Khách Hàng"
      page-description="Quản lý và theo dõi tất cả khách hàng trong hệ thống"
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
          Bộ Lọc Khách Hàng
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
              placeholder="Tìm kiếm mã KH, tên khách hàng, SĐT..."
              class="filter-input"
              @input="filterCustomers"
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
                  @change="filterCustomers"
                  class="radio-input"
                />
                <span class="radio-label">Tất cả</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.trangThai"
                  value="true"
                  @change="filterCustomers"
                  class="radio-input"
                />
                <span class="radio-label">Hoạt động</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="tempFilters.trangThai"
                  value="false"
                  @change="filterCustomers"
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
              @change="filterCustomers"
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
              @change="filterCustomers"
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

        <!-- Customer List Section -->
        <div class="customers-section">
          <div class="section-header">
            <h3 class="section-title">
              <Icon icon="solar:users-group-two-rounded-bold-duotone" class="text-xl" />
              Danh Sách Khách Hàng ({{ filteredCustomers.length }})
            </h3>
          </div>

          <!-- DataTable Component -->
          <DataTable
            :data="filteredCustomers"
            :columns="tableColumns"
            item-label="khách hàng"
            empty-message="Không có dữ liệu khách hàng nào được tìm thấy."
            key-field="id"
          >
            <!-- Custom column templates -->
            <template #stt="{ rowIndex }">
              {{ rowIndex }}
            </template>
            
            <template #maKhachHang="{ item }">
              <span class="font-bold text-gray-800 dark:text-gray-100">{{ item.maKhachHang }}</span>
            </template>
            
            <template #tenKhachHang="{ item }">
              {{ item.tenKhachHang }}
            </template>
            
            <template #soDienThoai="{ item }">
              {{ item.soDienThoai }}
            </template>
            
            <template #gioiTinh="{ item }">
              <span :class="item.gioiTinh ? 'inline-flex items-center text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full font-medium text-xs' : 'inline-flex items-center text-pink-700 bg-pink-100 px-2.5 py-1 rounded-full font-medium text-xs'">
                <Icon :icon="item.gioiTinh ? 'solar:men-bold' : 'solar:women-bold'" class="w-3 h-3 mr-1" />
                {{ item.gioiTinh ? 'Nam' : 'Nữ' }}
              </span>
            </template>
            
            <template #ngaySinh="{ item }">
              {{ formatDate(item.ngaySinh) }}
            </template>
            
            <template #ngayTao="{ item }">
              {{ formatDate(item.ngayTao) }}
            </template>
            
            <template #ngayCapNhat="{ item }">
              {{ formatDate(item.ngayCapNhat) }}
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
                  @click="openEditModal(item)"
                  class="action-btn edit"
                  title="Sửa"
                >
                  <Icon icon="solar:pen-bold" />
                </button>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="item.trangThai"
                    @change="toggleCustomerStatus(item)"
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

    <!-- Add Customer Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Icon icon="solar:user-plus-bold" class="text-2xl mr-2 text-green-600" />
          Thêm Khách Hàng Mới
        </h3>
        <form @submit.prevent="handleAddCustomer">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tên khách hàng <span class="text-red-500">*</span></label>
              <input
                v-model="newCustomer.tenKhachHang"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Số điện thoại <span class="text-red-500">*</span></label>
              <input
                v-model="newCustomer.soDienThoai"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                placeholder="0123456789"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Ngày sinh <span class="text-red-500">*</span></label>
              <input
                v-model="newCustomer.ngaySinh"
                type="date"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Giới tính</label>
              <select
                v-model="newCustomer.gioiTinh"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
              >
                <option :value="true">Nam</option>
                <option :value="false">Nữ</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Trạng thái</label>
              <select
                v-model="newCustomer.trangThai"
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

    <!-- Edit Customer Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Icon icon="solar:pen-bold" class="text-2xl mr-2 text-yellow-600" />
          Sửa Thông Tin Khách Hàng
        </h3>
        <form @submit.prevent="handleUpdateCustomer">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tên khách hàng <span class="text-red-500">*</span></label>
              <input
                v-model="editingCustomer.tenKhachHang"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Số điện thoại <span class="text-red-500">*</span></label>
              <input
                v-model="editingCustomer.soDienThoai"
                type="text"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Ngày sinh <span class="text-red-500">*</span></label>
              <input
                v-model="editingCustomer.ngaySinh"
                type="date"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Giới tính</label>
              <select
                v-model="editingCustomer.gioiTinh"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
              >
                <option :value="true">Nam</option>
                <option :value="false">Nữ</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Trạng thái</label>
              <select
                v-model="editingCustomer.trangThai"
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

    <!-- Detail Customer Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Icon icon="solar:eye-bold" class="text-2xl mr-2 text-blue-600" />
          Chi Tiết Khách Hàng
        </h3>
        <div v-if="viewingCustomer" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Mã khách hàng:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingCustomer.maKhachHang }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Tên khách hàng:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingCustomer.tenKhachHang }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingCustomer.soDienThoai }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ viewingCustomer.gioiTinh ? 'Nam' : 'Nữ' }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày sinh:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ formatDate(viewingCustomer.ngaySinh) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ formatDateTime(viewingCustomer.ngayTao) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày cập nhật:</span>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ formatDateTime(viewingCustomer.ngayCapNhat) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái:</span>
              <span :class="viewingCustomer.trangThai ? 'status-badge active' : 'status-badge inactive'">
                <Icon :icon="viewingCustomer.trangThai ? 'solar:check-circle-bold' : 'solar:close-circle-bold'" class="w-3 h-3 mr-1" />
                {{ viewingCustomer.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
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

.action-btn.view {
  background: #dbeafe;
  color: #1e40af;
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

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #86efac;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

@media (max-width: 640px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  .radio-group {
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>