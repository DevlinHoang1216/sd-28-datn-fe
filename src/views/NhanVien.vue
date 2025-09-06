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

// --- State Management ---
const toast = useToast()
const employeeList = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 5
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const viewingEmployee = ref({})
const editingEmployee = ref({})
const filterStatus = ref('Tất cả')
const searchId = ref('')

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

// --- Computed Properties ---
const isFirstPage = computed(() => currentPage.value === 0);
const isLastPage = computed(() => currentPage.value >= totalPages.value - 1);
const hasData = computed(() => employeeList.value.length > 0)

// --- Validation Functions ---
const validateEmployee = (employee) => {
  const requiredFields = [
    { field: employee.tenNhanVien, label: 'Tên nhân viên' },
    { field: employee.ngaySinh, label: 'Ngày sinh' },
    { field: employee.soDienThoai, label: 'Số điện thoại' },
    { field: employee.cccd, label: 'CCCD' },
    { field: employee.diaChiSoNhaTenDuong, label: 'Số nhà, tên đường' },
    { field: employee.diaChiPhuongXa, label: 'Phường/Xã' },
    { field: employee.diaChiQuanHuyen, label: 'Quận/Huyện' },
    { field: employee.diaChiTinhThanh, label: 'Tỉnh/Thành phố' },
    { field: employee.ngayTao, label: 'Ngày tạo' },
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

// --- API Functions ---
const fetchEmployees = async (page = 0) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/nhan-vien/phan-trang?pageNo=${page}&pageSize=${pageSize}`);
    console.log('API /phan-trang response:', res.data);
    employeeList.value = res.data.content || [];
    currentPage.value = res.data.number || 0;
    totalPages.value = res.data.totalPages || 0;
    console.log('totalPages:', totalPages.value, 'currentPage:', currentPage.value, 'employeeList:', employeeList.value);
    toast.success('Tải danh sách nhân viên thành công.');
  } catch (err) {
    console.error('Lỗi khi tải danh sách nhân viên:', err.response?.data || err);
    employeeList.value = [];
    currentPage.value = 0;
    totalPages.value = 0;
    toast.error('Lỗi khi tải danh sách nhân viên.');
  }
};


const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    console.log('Chuyển đến trang:', page, 'totalPages:', totalPages.value);
    fetchEmployees(page);
  } else {
    console.log('Trang không hợp lệ:', page, 'totalPages:', totalPages.value);
  }
};

const searchEmployeeById = async () => {
  const ma = searchId.value.trim()
  if (!ma) {
    fetchEmployees(0)
    toast.info('Hiển thị tất cả nhân viên.')
    return
  }
  try {
    const res = await axios.get(`http://localhost:8080/api/nhan-vien/search/${ma}`)
    employeeList.value = Array.isArray(res.data) ? res.data : [res.data]
    currentPage.value = 0
    totalPages.value = 1
    toast.success(`Tìm thấy ${employeeList.value.length} nhân viên.`)
  } catch (err) {
    console.error('Không tìm thấy nhân viên:', err.response?.data || err)
    employeeList.value = []
    totalPages.value = 0
    toast.error('Không tìm thấy nhân viên với mã này.')
  }
}

const addEmployee = async () => {
  const now = new Date().toISOString()
  const payload = { ...newEmployee.value, ngayTao: now, ngayCapNhat: now }
  if (!validateEmployee(payload)) return
  try {
    if (!payload.chucVuID) delete payload.chucVuID
    if (!payload.taiKhoanID) delete payload.taiKhoanID
    await axios.post('http://localhost:8080/api/nhan-vien/add', payload)
    showAddModal.value = false
    await fetchEmployees(currentPage.value)
    toast.success('Thêm nhân viên thành công!')
    resetNewEmployeeForm()
  } catch (err) {
    console.error('Lỗi khi thêm nhân viên:', err.response?.data || err)
    toast.error('Lỗi khi thêm nhân viên.')
  }
}

const updateEmployee = async () => {
  const payload = { ...editingEmployee.value }
  payload.ngayCapNhat = new Date().toISOString()
  if (!validateEmployee(payload)) return
  try {
    if (!payload.chucVuID) delete payload.chucVuID
    if (!payload.taiKhoanID) delete payload.taiKhoanID
    await axios.put(`http://localhost:8080/api/nhan-vien/update/${payload.id}`, payload)
    showEditModal.value = false
    await fetchEmployees(currentPage.value)
    toast.success('Cập nhật nhân viên thành công!')
  } catch (err) {
    console.error('Lỗi khi cập nhật nhân viên:', err.response?.data || err)
    toast.error('Lỗi khi cập nhật nhân viên.')
  }
}

const deleteEmployee = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
    try {
      await axios.delete(`http://localhost:8080/api/nhan-vien/delete/${id}`)
      await fetchEmployees(currentPage.value)
      toast.success('Xóa nhân viên thành công!')
    } catch (err) {
      console.error('Lỗi khi xóa:', err.response?.data || err)
      toast.error('Lỗi khi xóa nhân viên.')
    }
  }
}

const filterByStatus = async () => {
  try {
    let res;
    if (filterStatus.value === 'Tất cả') {
      await fetchEmployees(0);
      toast.success('Hiển thị tất cả nhân viên thành công.');
      return;
    } else {
      // Đảo ngược logic để khớp với dữ liệu hiện tại
      const status = filterStatus.value === 'Hoạt động' ? false : true;
      res = await axios.get(`http://localhost:8080/api/nhan-vien/loc-trang-thai?trangThai=${status}`);
    }

    const data = res.data.content || res.data;
    employeeList.value = Array.isArray(data) ? data : [data];
    currentPage.value = 0;
    totalPages.value = 1;
    toast.success(`Lọc thành công: ${filterStatus.value}`);
  } catch (err) {
    console.error('Lỗi khi lọc trạng thái:', err.response?.data || err);
    employeeList.value = [];
    currentPage.value = 0;
    totalPages.value = 0;
    toast.error('Lỗi khi lọc trạng thái.');
  }
};



// --- UI/Modal Handlers ---
const openEditModal = (employee) => {
  editingEmployee.value = { ...employee }
  // Format date to 'YYYY-MM-DD' for date input
  if (editingEmployee.value.ngaySinh) {
    editingEmployee.value.ngaySinh = editingEmployee.value.ngaySinh.split('T')[0]
  }
  showEditModal.value = true
}

const openDetailModal = async (id) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/nhan-vien/detail/${id}`)
    viewingEmployee.value = res.data
    showDetailModal.value = true
  } catch (err) {
    console.error('Lỗi khi xem chi tiết:', err.response?.data || err)
    toast.error('Lỗi khi xem chi tiết.')
  }
}

const goToNextPage = () => {
  if (!isLastPage.value) {
    console.log('Chuyển sang trang:', currentPage.value + 1);
    fetchEmployees(currentPage.value + 1);
  } else {
    console.log('Đã ở trang cuối:', currentPage.value, 'totalPages:', totalPages.value);
  }
};

const goToPrevPage = () => {
  if (!isFirstPage.value) {
    console.log('Chuyển về trang:', currentPage.value - 1);
    fetchEmployees(currentPage.value - 1);
  }
};

// --- Helper Functions ---
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

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const exportExcel = () => {
  if (!hasData.value) {
    toast.info('Không có dữ liệu để xuất.');
    return;
  }
  const dataToExport = employeeList.value.map(nv => ({
    'Mã NV': nv.maNhanVien,
    'Tên Nhân Viên': nv.tenNhanVien,
    'Ngày Sinh': formatDate(nv.ngaySinh),
    'Giới Tính': nv.gioiTinh ? 'Nam' : 'Nữ',
    'SĐT': nv.soDienThoai,
    'CCCD': nv.cccd,
    'Địa chỉ': `${nv.diaChiSoNhaTenDuong} - ${nv.diaChiPhuongXa} - ${nv.diaChiQuanHuyen} - ${nv.diaChiTinhThanh}`,
    'Ngày Tạo': formatDate(nv.ngayTao),
    'Trạng Thái': nv.trangThai ? 'Hoạt động' : 'Không hoạt động'
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachNhanVien');
  XLSX.writeFile(workbook, 'danh_sach_nhan_vien.xlsx');
  toast.success('Xuất file Excel thành công!');
};

// --- Lifecycle Hook ---
onMounted(() => {
  fetchEmployees(0)
})
</script>

<template>
  <div class="container-fluid py-4">
    <h2 class="mb-4 text-dark text-start fw-bold">Quản Lý Nhân Viên 🧑‍💼</h2>
    <CCard class="shadow-sm mb-4">
      <CCardBody>
        <CRow class="align-items-end g-3">
          <CCol md="4" lg="3">
            <CFormLabel class="fw-bold">Tìm theo mã nhân viên</CFormLabel>
            <CFormInput
              v-model="searchId"
              placeholder="Nhập mã nhân viên..."
              @keyup.enter="searchEmployeeById"
            />
          </CCol>
          <CCol md="4" lg="2">
            <CFormLabel class="fw-bold">Trạng thái</CFormLabel>
            <CFormSelect v-model="filterStatus" @change="filterByStatus">
  <option value="Tất cả">Tất cả</option>
  <option value="Hoạt động">Hoạt động</option>
  <option value="Không hoạt động">Không hoạt động</option>
</CFormSelect>
          </CCol>
          <CCol md="4" lg="7" class="d-flex flex-wrap gap-2 justify-content-end">
            <CButton color="secondary" class="fw-bold" @click="fetchEmployees(0)">Làm mới</CButton>
            <CButton color="success" class="fw-bold" @click="showAddModal = true">Thêm mới</CButton>
            <CButton color="danger" class="fw-bold" @click="exportExcel">Xuất Excel</CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <CModal :visible="showAddModal" @close="showAddModal = false" backdrop="static" size="lg">
      <CModalHeader class="bg-success text-white">
        <CModalTitle>Thêm Nhân Viên Mới</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow class="g-3">
          <CCol md="6">
            <CFormLabel>Tên nhân viên <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="newEmployee.tenNhanVien" placeholder="Nguyễn Văn A" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Ngày sinh <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="newEmployee.ngaySinh" type="date" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Giới tính</CFormLabel>
            <CFormSelect v-model="newEmployee.gioiTinh">
              <option :value="true">Nam</option>
              <option :value="false">Nữ</option>
            </CFormSelect>
          </CCol>
          <CCol md="6">
            <CFormLabel>Số điện thoại <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="newEmployee.soDienThoai" placeholder="0123456789" />
          </CCol>
          <CCol md="6">
            <CFormLabel>CCCD <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="newEmployee.cccd" placeholder="123456789012" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Số nhà, tên đường <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="newEmployee.diaChiSoNhaTenDuong" placeholder="123 Nguyễn Văn Linh" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Phường/Xã <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="newEmployee.diaChiPhuongXa" placeholder="Phường ABC" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Quận/Huyện <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="newEmployee.diaChiQuanHuyen" placeholder="Quận XYZ" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Tỉnh/Thành phố <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="newEmployee.diaChiTinhThanh" placeholder="Hà Nội" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Trạng thái</CFormLabel>
            <CFormSelect v-model="newEmployee.trangThai">
              <option :value="true">Hoạt động</option>
              <option :value="false">Không hoạt động</option>
            </CFormSelect>
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showAddModal = false">Hủy</CButton>
        <CButton color="primary" @click="addEmployee">Lưu</CButton>
      </CModalFooter>
    </CModal>

    <CModal :visible="showEditModal" @close="showEditModal = false" backdrop="static" size="lg">
      <CModalHeader class="bg-warning text-dark">
        <CModalTitle>Sửa Thông Tin Nhân Viên</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow class="g-3">
          <CCol md="6">
            <CFormLabel>Tên nhân viên <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="editingEmployee.tenNhanVien" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Ngày sinh <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="editingEmployee.ngaySinh" type="date" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Giới tính</CFormLabel>
            <CFormSelect v-model="editingEmployee.gioiTinh">
              <option :value="true">Nam</option>
              <option :value="false">Nữ</option>
            </CFormSelect>
          </CCol>
          <CCol md="6">
            <CFormLabel>Số điện thoại <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="editingEmployee.soDienThoai" />
          </CCol>
          <CCol md="6">
            <CFormLabel>CCCD <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="editingEmployee.cccd" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Số nhà, tên đường <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="editingEmployee.diaChiSoNhaTenDuong" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Phường/Xã <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="editingEmployee.diaChiPhuongXa" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Quận/Huyện <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="editingEmployee.diaChiQuanHuyen" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Tỉnh/Thành phố <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="editingEmployee.diaChiTinhThanh" />
          </CCol>
          <CCol md="6">
            <CFormLabel>Trạng thái</CFormLabel>
            <CFormSelect v-model="editingEmployee.trangThai">
              <option :value="true">Hoạt động</option>
              <option :value="false">Không hoạt động</option>
            </CFormSelect>
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showEditModal = false">Hủy</CButton>
        <CButton color="primary" @click="updateEmployee">Lưu thay đổi</CButton>
      </CModalFooter>
    </CModal>

    <CModal :visible="showDetailModal" @close="showDetailModal = false" backdrop="static" size="lg">
      <CModalHeader class="bg-info text-white">
        <CModalTitle>Chi Tiết Nhân Viên</CModalTitle>
      </CModalHeader>
      <CModalBody v-if="viewingEmployee">
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Mã nhân viên:</CCol>
          <CCol sm="8">{{ viewingEmployee.maNhanVien }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Tên nhân viên:</CCol>
          <CCol sm="8">{{ viewingEmployee.tenNhanVien }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Ngày sinh:</CCol>
          <CCol sm="8">{{ formatDate(viewingEmployee.ngaySinh) }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Giới tính:</CCol>
          <CCol sm="8">{{ viewingEmployee.gioiTinh ? 'Nam' : 'Nữ' }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Số điện thoại:</CCol>
          <CCol sm="8">{{ viewingEmployee.soDienThoai }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">CCCD:</CCol>
          <CCol sm="8">{{ viewingEmployee.cccd }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Địa chỉ:</CCol>
          <CCol sm="8">{{ `${viewingEmployee.diaChiSoNhaTenDuong} - ${viewingEmployee.diaChiPhuongXa} - ${viewingEmployee.diaChiQuanHuyen} - ${viewingEmployee.diaChiTinhThanh}` }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Ngày tạo:</CCol>
          <CCol sm="8">{{ formatDateTime(viewingEmployee.ngayTao) }}</CCol>
        </CRow>
        <CRow class="mb-2">
          <CCol sm="4" class="fw-bold">Ngày cập nhật:</CCol>
          <CCol sm="8">{{ formatDateTime(viewingEmployee.ngayCapNhat) }}</CCol>
        </CRow>
     <CRow class="mb-2">
  <CCol sm="4" class="fw-bold">Trạng thái:</CCol>
  <CCol sm="8">
    <CBadge :color="viewingEmployee.trangThai ? 'success' : 'secondary'">
      {{ viewingEmployee.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
    </CBadge>
  </CCol>
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
              <CTableHeaderCell class="text-nowrap fw-bold fs-6">Tên Nhân Viên</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Ngày Sinh</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Giới Tính</CTableHeaderCell>
              <CTableHeaderCell class="text-nowrap fw-bold fs-6">SĐT</CTableHeaderCell>
              <CTableHeaderCell class="text-nowrap fw-bold fs-6">Mã NV</CTableHeaderCell>
              <CTableHeaderCell class="text-nowrap fw-bold fs-6">CCCD</CTableHeaderCell>
              <CTableHeaderCell class="text-nowrap fw-bold fs-6">Địa chỉ</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Trạng Thái</CTableHeaderCell>
              <CTableHeaderCell class="text-center text-nowrap fw-bold fs-6">Hành động</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
        <CTableBody>
  <CTableRow v-if="!hasData">
    <CTableDataCell colspan="10" class="text-center text-danger">Không có dữ liệu nhân viên.</CTableDataCell>
  </CTableRow>
  <CTableRow v-for="(employee, index) in employeeList" :key="employee.id">
    <CTableDataCell class="text-center">{{ (currentPage * pageSize) + index + 1 }}</CTableDataCell>
    <CTableDataCell>{{ employee.tenNhanVien }}</CTableDataCell>
    <CTableDataCell class="text-center">{{ formatDate(employee.ngaySinh) }}</CTableDataCell>
    <CTableDataCell class="text-center">{{ employee.gioiTinh ? 'Nam' : 'Nữ' }}</CTableDataCell>
    <CTableDataCell>{{ employee.soDienThoai }}</CTableDataCell>
    <CTableDataCell>{{ employee.maNhanVien }}</CTableDataCell>
    <CTableDataCell>{{ employee.cccd }}</CTableDataCell>
    <CTableDataCell class="text-nowrap">
      {{ `${employee.diaChiSoNhaTenDuong}, ${employee.diaChiPhuongXa}, ${employee.diaChiQuanHuyen}, ${employee.diaChiTinhThanh}` }}
    </CTableDataCell>
    <CTableDataCell class="text-center">
      <CBadge :color="employee.trangThai ? 'success' : 'secondary'">
        {{ employee.trangThai ? 'Hoạt động' : 'Không hoạt động' }}
      </CBadge>
    </CTableDataCell>
    <CTableDataCell class="text-center">
      <div class="d-flex justify-content-center gap-2">
        <CButton size="sm" color="info" class="text-white" @click="openDetailModal(employee.id)" title="Xem chi tiết">
          👁️
        </CButton>
        <CButton size="sm" color="warning" @click="openEditModal(employee)" title="Sửa">
          ✏️
        </CButton>
        <CButton size="sm" color="danger" @click="deleteEmployee(employee.maNhanVien)" title="Xóa">
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
  <CButton v-for="page in totalPages" :key="page" color="primary" variant="outline" class="mx-1" @click="goToPage(page - 1)" :disabled="currentPage === page - 1">
    {{ page }}
  </CButton>
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