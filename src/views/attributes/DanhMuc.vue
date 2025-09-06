<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <CContainer>
      <CRow>
        <CCol>
          <h1 class="text-center text-2xl font-bold text-black mb-4">Quản Lý Danh Mục</h1>
        </CCol>
      </CRow>

      <CRow class="mb-4">
        <CCol class="flex flex-col gap-2">
          <CFormInput
            v-model="search"
            type="text"
            placeholder="🔍 Tìm danh mục theo tên hoặc mã..."
            class="mb-2 custom-input"
            @keyup.enter="searchDanhMuc"
          />
          <div class="flex gap-2">
            <CButton
              class="bg-black hover:bg-gray-800 text-white flex items-center gap-2 rounded-md"
              @click="searchDanhMuc"
            >
              <i class="fas fa-search"></i>
              Tìm kiếm
            </CButton>
            <CButton
              class="flex items-center gap-2 rounded-md"
              style="background-color: #8b0000; border-color: #8b0000; color: #ffffff"
              @click="openAddModal"
            >
              <i class="fas fa-plus-circle"></i>
              Thêm Mới
            </CButton>
          </div>
        </CCol>
      </CRow>

      <CCard class="shadow">
        <CCardHeader
          class="text-black font-semibold uppercase bg-gray-200 border-b border-gray-300 rounded-t-md"
        >
          Danh Sách Danh Mục
        </CCardHeader>
        <CCardBody>
          <CTable striped hover responsive class="custom-table">
            <CTableHead class="bg-black text-white">
              <CTableRow>
                <CTableHeaderCell scope="col" class="text-center">#</CTableHeaderCell>
                <CTableHeaderCell
                  scope="col"
                  @click="sortData('tenDanhMuc')"
                  class="cursor-pointer"
                >
                  Tên Danh Mục
                  <i
                    v-if="sortColumn === 'tenDanhMuc'"
                    :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"
                  ></i>
                  <i v-else class="fas fa-sort"></i>
                </CTableHeaderCell>
                <CTableHeaderCell
                  scope="col"
                  @click="sortData('maDanhMuc')"
                  class="cursor-pointer"
                >
                  Mã Danh Mục
                  <i
                    v-if="sortColumn === 'maDanhMuc'"
                    :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"
                  ></i>
                  <i v-else class="fas fa-sort"></i>
                </CTableHeaderCell>
                <CTableHeaderCell
                  scope="col"
                  @click="sortData('ngayTao')"
                  class="cursor-pointer"
                >
                  Ngày tạo
                  <i
                    v-if="sortColumn === 'ngayTao'"
                    :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"
                  ></i>
                  <i v-else class="fas fa-sort"></i>
                </CTableHeaderCell>
                <CTableHeaderCell
                  scope="col"
                  @click="sortData('soLuongSanPham')"
                  class="cursor-pointer"
                >
                  Số lượng
                  <i
                    v-if="sortColumn === 'soLuongSanPham'"
                    :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"
                  ></i>
                  <i v-else class="fas fa-sort"></i>
                </CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">Hành động</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(item, index) in paginatedItems" :key="item.id">
                <CTableDataCell class="font-semibold text-center">{{
                  (currentPage - 1) * itemsPerPage + index + 1
                }}</CTableDataCell>
                <CTableDataCell>{{ item.tenDanhMuc }}</CTableDataCell>
                <CTableDataCell>{{ item.maDanhMuc }}</CTableDataCell>
                <CTableDataCell class="text-gray-500">{{
                  formatDate(item.ngayTao)
                }}</CTableDataCell>
                <CTableDataCell class="text-gray-500">{{ item.soLuongSanPham }}</CTableDataCell>
                <CTableDataCell class="flex gap-2 justify-center">
                  <CButton
                    class="flex items-center gap-1 rounded-md"
                    style="background-color: #000000; border-color: #000000; color: #ffffff"
                    @click="openEditModal(item)"
                    size="sm"
                    title="Sửa"
                  >
                    <i class="fas fa-edit"></i>
                  </CButton>
                  <CButton
                    class="flex items-center gap-1 rounded-md"
                    style="background-color: #8b0000; border-color: #8b0000; color: #ffffff"
                    @click="deleteDanhMuc(item)"
                    size="sm"
                    title="Xóa"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </CButton>
                  <CButton
                    class="flex items-center gap-1 rounded-md"
                    style="background-color: #008000; border-color: #008000; color: #ffffff"
                    @click="viewProducts(item.id, item.tenDanhMuc)"
                    size="sm"
                    title="Xem sản phẩm"
                  >
                    <i class="fas fa-search-plus"></i>
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedItems.length === 0">
                <CTableDataCell colspan="6" class="text-center text-gray-500 italic">
                  Không tìm thấy danh mục nào.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <div class="flex justify-center mt-4">
        <CPagination align="center" aria-label="Page navigation">
          <CPaginationItem :disabled="currentPage === 1" @click="goToPage(currentPage - 1)"
            >Trước</CPaginationItem
          >
          <CPaginationItem
            v-for="page in totalPages"
            :key="page"
            :active="page === currentPage"
            @click="goToPage(page)"
          >
            {{ page }}
          </CPaginationItem>
          <CPaginationItem :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)"
            >Sau</CPaginationItem
          >
        </CPagination>
      </div>

      <CModal :visible="showModal" @close="closeModal">
        <CModalHeader class="bg-black text-white border-b border-gray-600 rounded-t-md">
          <CModalTitle class="text-white">{{
            isEditMode ? 'Cập Nhật Danh Mục' : 'Thêm Mới Danh Mục'
          }}</CModalTitle>
          <CCloseButton @click="closeModal" class="text-gray-400 hover:text-white" />
        </CModalHeader>
        <CModalBody class="bg-white text-gray-800">
          <CForm>
            <CFormInput
              v-model="newDanhMuc.tenDanhMuc"
              label="Tên Danh Mục"
              placeholder="Nhập tên danh mục"
              class="mb-3 custom-input"
            />
            <CFormInput
              v-model="newDanhMuc.maDanhMuc"
              label="Mã Danh Mục"
              placeholder="Nhập mã danh mục"
              class="mb-3 custom-input"
              :disabled="!isEditMode"
            />
          </CForm>
        </CModalBody>
        <CModalFooter class="bg-gray-200 border-t border-gray-300 rounded-b-md">
          <CButton color="secondary" class="rounded-md text-white" @click="closeModal">
            Hủy
          </CButton>
          <CButton color="danger" class="rounded-md text-white" @click="saveDanhMuc">
            {{ isEditMode ? 'Cập Nhật' : 'Lưu' }}
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal :visible="showConfirmModal" @close="closeConfirmModal">
        <CModalHeader class="bg-black text-white border-b border-gray-600 rounded-t-md">
          <CModalTitle class="text-white">Xác nhận xóa</CModalTitle>
          <CCloseButton @click="closeConfirmModal" class="text-gray-400 hover:text-white" />
        </CModalHeader>
        <CModalBody class="bg-white text-gray-800">
          Bạn có chắc chắn muốn xóa danh mục "<span class="font-semibold text-red-700">{{
            itemToDelete ? itemToDelete.tenDanhMuc : ''
          }}</span
          >" không?
        </CModalBody>
        <CModalFooter class="bg-gray-200 border-t border-gray-300 rounded-b-md">
          <CButton
            class="bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            @click="closeConfirmModal"
            >Hủy</CButton
          >
          <CButton class="bg-red-700 hover:bg-red-800 text-white rounded-md" @click="confirmDelete"
            >Xóa</CButton
          >
        </CModalFooter>
      </CModal>

      <CModal :visible="showProductDetailModal" @close="closeProductDetailModal" size="xl">
        <CModalHeader class="bg-black text-white border-b border-gray-600 rounded-t-md">
          <CModalTitle class="text-white"
            >Sản phẩm có danh mục: {{ selectedDanhMucName }}</CModalTitle
          >
          <CCloseButton @click="closeProductDetailModal" class="text-gray-400 hover:text-white" />
        </CModalHeader>
        <CModalBody class="bg-white text-gray-800">
          <div v-if="isLoadingProducts" class="flex justify-center items-center h-40">
            <CSpinner color="primary" />
          </div>
          <div v-else-if="products.length > 0">
            <CTable striped hover responsive class="custom-table">
              <CTableHead class="bg-black text-white">
                <CTableRow>
                  <CTableHeaderCell scope="col">Mã CTSP</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Tên Sản phẩm</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Thương hiệu</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Màu sắc</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Kích cỡ</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Chất liệu</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Số lượng tồn kho</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="product in products" :key="product.id">
                  <CTableDataCell>{{ product.maCtsp }}</CTableDataCell>
                  <CTableDataCell>{{ product.tenSanPham }}</CTableDataCell>
                  <CTableDataCell>{{ product.tenThuongHieu }}</CTableDataCell>
                  <CTableDataCell>{{ product.tenMauSac }}</CTableDataCell>
                  <CTableDataCell>{{ product.tenKichCo }}</CTableDataCell>
                  <CTableDataCell>{{ product.tenChatLieu }}</CTableDataCell>
                  <CTableDataCell>{{ product.soLuongTonKho }}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
          <div v-else>
            <p class="text-center text-gray-500 italic">
              Không có sản phẩm nào thuộc danh mục này.
            </p>
          </div>
        </CModalBody>
        <CModalFooter class="bg-gray-200 border-t border-gray-300 rounded-b-md">
          <CButton color="secondary" class="rounded-md" @click="closeProductDetailModal"
            >Đóng</CButton
          >
        </CModalFooter>
      </CModal>
    </CContainer>
  </div>
</template>

<script>
import {
  CContainer,
  CRow,
  CCol,
  CFormInput,
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCloseButton,
  CForm,
  CFormLabel,
  CSpinner,
  CPagination,
  CPaginationItem
} from '@coreui/vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  name: 'DanhMuc',
  components: {
    CContainer,
    CRow,
    CCol,
    CFormInput,
    CButton,
    CCard,
    CCardHeader,
    CCardBody,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CCloseButton,
    CForm,
    CFormLabel,
    CSpinner,
    CPagination,
    CPaginationItem
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      search: '',
      showModal: false,
      isEditMode: false,
      editItem: null,
      newDanhMuc: {
        tenDanhMuc: '',
        maDanhMuc: ''
      },
      danhMucs: [],
      showConfirmModal: false,
      itemToDelete: null,
      showProductDetailModal: false,
      selectedDanhMucId: null,
      selectedDanhMucName: null,
      products: [],
      isLoadingProducts: false,
      sortColumn: '',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  computed: {
    filteredDanhMucs() {
      const keyword = this.search.toLowerCase().trim();
      if (!keyword) return this.danhMucs;
      return this.danhMucs.filter(
        (dm) =>
          dm.tenDanhMuc.toLowerCase().includes(keyword) || dm.maDanhMuc.toLowerCase().includes(keyword)
      );
    },
    sortedDanhMucs() {
      if (!this.sortColumn) {
        return this.filteredDanhMucs;
      }
      return [...this.filteredDanhMucs].sort((a, b) => {
        const aValue = a[this.sortColumn];
        const bValue = b[this.sortColumn];

        if (aValue < bValue) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedDanhMucs.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.sortedDanhMucs.length / this.itemsPerPage);
    }
  },
  watch: {
    sortedDanhMucs() {
      this.currentPage = 1;
    }
  },
  created() {
    this.fetchDanhMucs();
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async fetchDanhMucs() {
      try {
        const response = await axios.get('/api/danh-mucs');
        this.danhMucs = response.data;
        this.toast.success('Tải danh sách danh mục thành công!');
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.toast.error(error.response.data.message);
        } else {
          this.toast.error('Lỗi khi tải dữ liệu danh mục.');
        }
        console.error('Error fetching data:', error);
      }
    },
    async fetchProductsByDanhMucId(danhMucId) {
      this.isLoadingProducts = true;
      try {
        const response = await axios.get(
          `http://localhost:8080/api/chi-tiet-san-phams/by-danh-muc/${danhMucId}`
        );
        this.products = response.data;
        this.toast.success(`Đã tải danh sách sản phẩm của danh mục này.`);
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.toast.error(error.response.data.message);
        } else {
          this.toast.error('Lỗi khi lấy dữ liệu sản phẩm.');
        }
        console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
        this.products = [];
      } finally {
        this.isLoadingProducts = false;
      }
    },
    searchDanhMuc() {
      this.currentPage = 1;
      this.toast.info(`Đã tìm kiếm với từ khóa "${this.search}".`);
    },
    generateCode() {
      const nextId =
        this.danhMucs.length > 0
          ? Math.max(...this.danhMucs.map((dm) => parseInt(dm.maDanhMuc.replace('DM', '')))) + 1
          : 1;
      return `DM${String(nextId).padStart(3,'0')}`;
    },
    openAddModal() {
      this.isEditMode = false;
      this.editItem = null;
      this.newDanhMuc = {
        tenDanhMuc: '',
        maDanhMuc: this.generateCode()
      };
      this.showModal = true;
    },
    async saveDanhMuc() {
      try {
        if (this.isEditMode) {
          const payload = {
            tenDanhMuc: this.newDanhMuc.tenDanhMuc,
            maDanhMuc: this.newDanhMuc.maDanhMuc
          };
          await axios.put(`/api/danh-mucs/${this.editItem.id}`, payload);
          this.toast.success('Cập nhật danh mục thành công!');
        } else {
          await axios.post('/api/danh-mucs', this.newDanhMuc);
          this.toast.success('Thêm danh mục mới thành công!');
        }
        this.closeModal();
        this.fetchDanhMucs();
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.toast.error(error.response.data.message);
        } else {
          this.toast.error('Lỗi khi lưu danh mục. Vui lòng thử lại.');
        }
        console.error('Error saving data:', error);
      }
    },
    openEditModal(item) {
      this.isEditMode = true;
      this.editItem = item;
      this.newDanhMuc = { tenDanhMuc: item.tenDanhMuc, maDanhMuc: item.maDanhMuc };
      this.showModal = true;
    },
    deleteDanhMuc(item) {
      this.itemToDelete = item;
      this.showConfirmModal = true;
    },
    async confirmDelete() {
      if (this.itemToDelete) {
        try {
          await axios.delete(`/api/danh-mucs/${this.itemToDelete.id}`);
          this.toast.success(`Đã xóa danh mục "${this.itemToDelete.tenDanhMuc}" thành công!`);
          this.closeConfirmModal();
          this.fetchDanhMucs();
        } catch (error) {
          if (error.response && error.response.data && error.response.data.message) {
            this.toast.error(error.response.data.message);
          } else {
            this.toast.error('Lỗi khi xóa danh mục. Vui lòng thử lại.');
          }
          console.error('Error deleting data:', error);
        }
      }
    },
    closeModal() {
      this.showModal = false;
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
      this.itemToDelete = null;
    },
    viewProducts(danhMucId, tenDanhMuc) {
      this.selectedDanhMucId = danhMucId;
      this.selectedDanhMucName = tenDanhMuc;
      this.fetchProductsByDanhMucId(danhMucId);
      this.showProductDetailModal = true;
    },
    closeProductDetailModal() {
      this.showProductDetailModal = false;
      this.selectedDanhMucId = null;
      this.selectedDanhMucName = null;
      this.products = [];
    },
    sortData(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
      this.currentPage = 1;
    },
    goToPage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.custom-input.form-control:focus {
  border-color: #ced4da !important;
  box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25) !important;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.custom-table th,
.custom-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dee2e6;
  text-align: left;
}

.custom-table th {
  background-color: #000000;
  color: #ffffff;
  font-weight: bold;
}

.custom-table th.text-center,
.custom-table td.text-center {
  text-align: center;
}

.custom-table tr:hover {
  background-color: #f8f9fa;
}

.cursor-pointer {
  cursor: pointer;
  user-select: none;
}
</style>