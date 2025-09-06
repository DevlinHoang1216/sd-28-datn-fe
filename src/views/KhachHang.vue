<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import {
  CCard, CCardBody, CCol, CFormInput, CFormLabel, CFormSelect, CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CBadge
} from '@coreui/vue'

// --- Quản lý State ---
const toast = useToast()
const customerList = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 5
const showAddEditModal = ref(false)
const isEditMode = ref(false)
const showDetailModal = ref(false)
const selectedCustomerDetail = ref(null)
const searchMaKhachHang = ref('')
const form = ref({
  tenKhachHang: '',
  soDienThoai: '',
  gioiTinh: true,
  ngaySinh: '',
  ngayTao: '',
  ngayCapNhat: '',
  taiKhoanID: null,
})
const selectedKhachHangId = ref(null)

// --- Computed Properties ---
const hasData = computed(() => customerList.value && customerList.value.length > 0)
const isFirstPage = computed(() => currentPage.value === 0)
const isLastPage = computed(() => currentPage.value >= totalPages.value - 1)

// --- Validation Functions ---
const kiemTraKhachHang = (khachHang) => {
  const ten = khachHang.tenKhachHang?.trim()
  const sdt = khachHang.soDienThoai?.trim()
  const ngaySinh = khachHang.ngaySinh?.trim()

  if (!ten) {
    toast.error('Tên khách hàng không được để trống!')
    return false
  }

  const tenHopLe = /^[\p{L}\s]+$/u.test(ten)
  if (!tenHopLe) {
    toast.error('Tên khách hàng chỉ được chứa chữ cái và khoảng trắng!')
    return false
  }

  if (!sdt || !/^0\d{9}$/.test(sdt)) {
    toast.error('Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số!')
    return false
  }

  if (!ngaySinh) {
    toast.error('Ngày sinh không được để trống!')
    return false
  }

  return true
}

// --- API & Data Handling Functions ---
const loadData = async (page = 0) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/khach-hang/phan-trang?pageNo=${page}&pageSize=${pageSize}`)
    customerList.value = res.data.content || []
    currentPage.value = res.data.number || 0
    totalPages.value = res.data.totalPages || 0
    toast.success('Đã tải dữ liệu khách hàng thành công!')
  } catch (err) {
    console.error('Lỗi tải dữ liệu khách hàng:', err.response?.data || err)
    customerList.value = []
    currentPage.value = 0
    totalPages.value = 0
    toast.error('Không thể tải dữ liệu khách hàng.')
  }
}

const searchKhachHangTheoMa = async () => {
  const ma = searchMaKhachHang.value.trim()
  if (!ma) {
    await loadData(0)
    toast.info('Trống từ khóa tìm kiếm. Hiển thị tất cả khách hàng.')
    return
  }
  try {
    const res = await axios.get(`http://localhost:8080/api/khach-hang/search/${ma}`)
    customerList.value = Array.isArray(res.data) ? res.data : [res.data]
    currentPage.value = 0
    totalPages.value = 1
    toast.success(`Tìm thấy ${customerList.value.length} khách hàng.`)
  } catch (err) {
    console.error('Lỗi tìm kiếm khách hàng:', err.response?.data || err)
    customerList.value = []
    totalPages.value = 0
    toast.error('Không tìm thấy khách hàng nào phù hợp.')
  }
}

const handleSave = async () => {
  const now = new Date().toISOString()
  if (isEditMode.value) {
    form.value.ngayCapNhat = now
    if (!kiemTraKhachHang(form.value)) return
    try {
      await axios.put(`http://localhost:8080/api/khach-hang/update/${selectedKhachHangId.value}`, form.value)
      toast.success('Cập nhật khách hàng thành công!')
      showAddEditModal.value = false
      await loadData(currentPage.value)
    } catch (err) {
      console.error('Lỗi khi cập nhật khách hàng:', err.response?.data || err)
      toast.error('Cập nhật khách hàng thất bại.')
    }
  } else {
    form.value.ngayTao = now
    form.value.ngayCapNhat = now
    if (!kiemTraKhachHang(form.value)) return
    try {
      await axios.post('http://localhost:8080/api/khach-hang/add', form.value)
      toast.success('Thêm mới khách hàng thành công!')
      showAddEditModal.value = false
      await loadData(currentPage.value)
      resetForm()
    } catch (err) {
      console.error('Lỗi khi thêm mới khách hàng:', err.response?.data || err)
      toast.error('Thêm mới khách hàng thất bại.')
    }
  }
}

const handleDelete = async (maKhachHang) => {
  if (confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) {
    try {
      await axios.delete(`http://localhost:8080/api/khach-hang/delete/${maKhachHang}`)
      toast.success('Xóa khách hàng thành công!')
      await loadData(currentPage.value)
    } catch (err) {
      console.error('Lỗi khi xóa khách hàng:', err.response?.data || err)
      toast.error('Xóa khách hàng thất bại.')
    }
  }
}

const handleEdit = (khachHang) => {
  selectedKhachHangId.value = khachHang.id
  form.value = {
    ...khachHang,
    ngaySinh: khachHang.ngaySinh?.split('T')[0],
    ngayTao: khachHang.ngayTao?.split('T')[0],
    ngayCapNhat: khachHang.ngayCapNhat?.split('T')[0],
  }
  isEditMode.value = true
  showAddEditModal.value = true
}

const xemChiTietKhachHang = async (id) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/khach-hang/detail/${id}`)
    selectedCustomerDetail.value = res.data
    showDetailModal.value = true
  } catch (err) {
    console.error('Lỗi khi xem chi tiết khách hàng:', err.response?.data || err)
    toast.error('Không thể tải chi tiết khách hàng.')
  }
}

// --- Helper Functions ---
const resetForm = () => {
  form.value = {
    tenKhachHang: '',
    soDienThoai: '',
    gioiTinh: true,
    ngaySinh: '',
    ngayTao: '',
    ngayCapNhat: '',
    taiKhoanID: null,
  }
  isEditMode.value = false
  selectedKhachHangId.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const exportExcel = () => {
  if (!hasData.value) {
    toast.info('Không có dữ liệu để xuất.')
    return
  }
  const dataToExport = customerList.value.map(kh => ({
    'Mã KH': kh.maKhachHang,
    'Tên Khách Hàng': kh.tenKhachHang,
    'Số Điện Thoại': kh.soDienThoai,
    'Giới Tính': kh.gioiTinh ? 'Nam' : 'Nữ',
    'Ngày Sinh': formatDate(kh.ngaySinh),
    'Ngày Tạo': formatDate(kh.ngayTao),
    'Ngày Cập Nhật': formatDate(kh.ngayCapNhat),
  }))

  const worksheet = XLSX.utils.json_to_sheet(dataToExport)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachKhachHang')
  XLSX.writeFile(workbook, 'danh_sach_khach_hang.xlsx')
  toast.success('Xuất file Excel thành công!')
}

// --- Pagination Functions ---
const goToNextPage = () => {
  if (!isLastPage.value) {
    loadData(currentPage.value + 1)
  }
}

const goToPrevPage = () => {
  if (!isFirstPage.value) {
    loadData(currentPage.value - 1)
  }
}

onMounted(() => {
  loadData(0)
})
</script>

<template>
  <div class="container-fluid py-4">
    <h2 class="mb-4 text-dark text-start fw-bold">Quản Lý Khách Hàng 🧑‍🤝‍🧑</h2>
    <CCard class="shadow-sm mb-4">
      <CCardBody>
        <CRow class="align-items-end g-3">
          <CCol md="4" lg="3">
            <CFormLabel class="fw-bold">Tìm theo mã khách hàng</CFormLabel>
            <CFormInput
              v-model="searchMaKhachHang"
              placeholder="Nhập mã khách hàng..."
              @keyup.enter="searchKhachHangTheoMa"
            />
          </CCol>
          <CCol md="8" lg="9" class="d-flex flex-wrap gap-2 justify-content-end">
            <CButton color="secondary" class="fw-bold" @click="() => { searchMaKhachHang = ''; loadData(0) }">Làm mới</CButton>
            <CButton color="success" class="fw-bold" @click="() => { resetForm(); showAddEditModal = true }">Thêm mới</CButton>
            <CButton color="danger" class="fw-bold" @click="exportExcel">Xuất Excel</CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <CModal :visible="showAddEditModal" @close="() => { showAddEditModal = false; resetForm() }" backdrop="static" size="lg">
      <CModalHeader :class="isEditMode ? 'bg-warning text-dark' : 'bg-success text-white'">
        <CModalTitle>{{ isEditMode ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới' }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow class="g-3">
          <CCol md="6">
            <CFormLabel>Tên khách hàng <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="form.tenKhachHang" placeholder="Nguyễn Văn A" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Số điện thoại <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="form.soDienThoai" placeholder="0123456789" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Ngày sinh <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="form.ngaySinh" type="date" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Giới tính</CFormLabel>
            <CFormSelect v-model="form.gioiTinh">
              <option :value="true">Nam</option>
              <option :value="false">Nữ</option>
            </CFormSelect>
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="() => { showAddEditModal = false; resetForm() }">Hủy</CButton>
        <CButton color="primary" @click="handleSave">{{ isEditMode ? 'Cập nhật' : 'Lưu' }}</CButton>
      </CModalFooter>
    </CModal>

    <CModal :visible="showDetailModal" @close="showDetailModal = false" backdrop="static" size="lg">
      <CModalHeader class="bg-info text-white">
        <CModalTitle>Chi Tiết Khách Hàng</CModalTitle>
      </CModalHeader>
      <CModalBody v-if="selectedCustomerDetail">
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Mã khách hàng:</CCol>
          <CCol sm="8">{{ selectedCustomerDetail.maKhachHang }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Tên khách hàng:</CCol>
          <CCol sm="8">{{ selectedCustomerDetail.tenKhachHang }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Số điện thoại:</CCol>
          <CCol sm="8">{{ selectedCustomerDetail.soDienThoai }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Giới tính:</CCol>
          <CCol sm="8">{{ selectedCustomerDetail.gioiTinh ? 'Nam' : 'Nữ' }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Ngày sinh:</CCol>
          <CCol sm="8">{{ formatDate(selectedCustomerDetail.ngaySinh) }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Ngày tạo:</CCol>
          <CCol sm="8">{{ formatDate(selectedCustomerDetail.ngayTao) }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Ngày cập nhật:</CCol>
          <CCol sm="8">{{ formatDate(selectedCustomerDetail.ngayCapNhat) }}</CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showDetailModal = false">Đóng</CButton>
      </CModalFooter>
    </CModal>

    <CCard class="shadow-sm">
      <CCardBody>
        <CTable striped hover responsive class="table-hover">
          <CTableHead class="bg-light">
            <CTableRow>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">STT</CTableHeaderCell>
              <CTableHeaderCell class="text-nowrap fw-bold fs-6">Mã KH</CTableHeaderCell>
              <CTableHeaderCell class="text-nowrap fw-bold fs-6">Tên Khách Hàng</CTableHeaderCell>
              <CTableHeaderCell class="text-nowrap fw-bold fs-6">SĐT</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Giới Tính</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Ngày Sinh</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Ngày Tạo</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Ngày Cập Nhật</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Hành động</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="!hasData">
              <CTableDataCell colspan="9" class="text-center text-danger">Không có dữ liệu khách hàng.</CTableDataCell>
            </CTableRow>
            <CTableRow v-for="(kh, index) in customerList" :key="kh.id">
              <CTableDataCell class="text-center">{{ (currentPage * pageSize) + index + 1 }}</CTableDataCell>
              <CTableDataCell>{{ kh.maKhachHang }}</CTableDataCell>
              <CTableDataCell>{{ kh.tenKhachHang }}</CTableDataCell>
              <CTableDataCell>{{ kh.soDienThoai }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ kh.gioiTinh ? 'Nam' : 'Nữ' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ formatDate(kh.ngaySinh) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ formatDate(kh.ngayTao) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ formatDate(kh.ngayCapNhat) }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <div class="d-flex justify-content-center gap-2">
                  <CButton size="sm" color="info" class="text-white" @click="xemChiTietKhachHang(kh.id)" title="Xem chi tiết">
                    👁️
                  </CButton>
                  <CButton size="sm" color="warning" @click="handleEdit(kh)" title="Sửa">
                    ✏️
                  </CButton>
                  <CButton size="sm" color="danger" @click="handleDelete(kh.maKhachHang)" title="Xóa">
                    🗑️
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>

        <div class="d-flex justify-content-center align-items-center mt-4">
          <CButton color="primary" @click="goToPrevPage" :disabled="isFirstPage" class="mx-2">
            <i class="fas fa-arrow-left"></i> Trang trước
          </CButton>
          <span v-if="totalPages > 0" class="fs-6 text-primary fw-bold mx-3">Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
          <span v-else class="fs-6 text-primary fw-bold mx-3">Không có dữ liệu</span>
          <CButton color="primary" @click="goToNextPage" :disabled="isLastPage" class="mx-2">
            Trang sau <i class="fas fa-arrow-right"></i>
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<style scoped>
.container-fluid {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
}

.shadow-sm {
  box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
}

.table-hover tbody tr:hover {
  background-color: #f5f5f5;
  transition: background-color 0.3s ease;
}

.c-table-header-cell {
  background-color: #f8f9fa;
  font-weight: bold;
  padding: 1rem;
  white-space: nowrap;
}

.c-table-data-cell {
  font-size: 1rem;
  font-weight: 500;
  padding: 1rem;
  vertical-align: middle;
}

.form-label {
  font-weight: bold;
  color: #333;
  font-size: 1rem;
}

.c-modal-header {
  border-bottom: 1px solid #dee2e6;
}

.c-modal-title {
  font-weight: bold;
  font-size: 1.5rem;
}

.c-button {
  transition: all 0.2s ease-in-out;
  font-weight: bold;
}

.c-button:hover {
  transform: translateY(-2px);
}

.text-nowrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>