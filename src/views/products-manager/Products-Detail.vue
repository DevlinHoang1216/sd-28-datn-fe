<template>
  <div class="container py-4">
    <h2 class="mb-4 fw-bold" :style="{ color: '#000000' }">Quan Ly Chi Tiet San Pham</h2>

    <CInputGroup class="mb-3">
      <CFormInput
        v-model="searchQuery"
        placeholder="Nhap vao ten san pham muon tim..."
        @keyup.enter="searchProducts"
        class="custom-input"
      />
      <CButton
        :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
        @click="searchProducts"
      >
        Tim kiem
      </CButton>
    </CInputGroup>

    <div class="row mb-3">
      <div class="col-md-4 col-sm-6 col-12 mb-2">
        <CFormSelect v-model="filterProduct" @change="filterAndSortProducts">
          <option value="">Tat ca san pham</option>
          <option v-for="product in productsList" :key="product.id" :value="product.id">
            {{ product.tenSanPham }}
          </option>
        </CFormSelect>
      </div>
      <div class="col-md-4 col-sm-6 col-12 mb-2">
        <CFormSelect v-model="filterBrand" @change="filterAndSortProducts">
          <option value="">Tat ca hang</option>
          <option v-for="brand in brandsList" :key="brand.id" :value="brand.id">
            {{ brand.tenThuongHieu }}
          </option>
        </CFormSelect>
      </div>
      <div class="col-md-4 col-sm-6 col-12 mb-2">
        <CFormSelect v-model="filterType" @change="filterAndSortProducts">
          <option value="">Tat ca loai giay</option>
          <option v-for="category in categoriesList" :key="category.id" :value="category.id">
            {{ category.tenDanhMuc }}
          </option>
        </CFormSelect>
      </div>
      <div class="col-md-4 col-sm-6 col-12 mb-2">
        <CFormSelect v-model="filterColor" @change="filterAndSortProducts">
          <option value="">Tat ca mau sac</option>
          <option v-for="color in colorsList" :key="color.id" :value="color.id">
            {{ color.tenMauSac }}
          </option>
        </CFormSelect>
      </div>
      <div class="col-md-4 col-sm-6 col-12 mb-2">
        <CFormSelect v-model="filterMaterial" @change="filterAndSortProducts">
          <option value="">Tat ca chat lieu</option>
          <option v-for="material in materialsList" :key="material.id" :value="material.id">
            {{ material.tenChatLieu }}
          </option>
        </CFormSelect>
      </div>
      <div class="col-md-4 col-sm-6 col-12 mb-2">
        <CFormSelect v-model="filterSize" @change="filterAndSortProducts">
          <option value="">Tat ca kich co</option>
          <option v-for="size in sizesList" :key="size.id" :value="size.id">
            {{ size.tenKichCo }}
          </option>
        </CFormSelect>
      </div>
      <div class="col-md-4 col-sm-6 col-12 mb-2">
        <CFormSelect v-model="sortOrder" @change="filterAndSortProducts">
          <option value="">Sap xep</option>
          <option value="price-asc">Gia Thap den Cao</option>
          <option value="price-desc">Gia Cao den Thap</option>
          <option value="name-asc">Ten A-Z</option>
          <option value="name-desc">Ten Z-A</option>
        </CFormSelect>
      </div>
    </div>

    <div class="mb-3 d-flex gap-2 flex-wrap">
      <CButton
        :style="{ backgroundColor: '#006400', borderColor: '#006400', color: '#FFFFFF' }"
        @click="exportToExcel"
      >
        <CIcon :icon="icons.cilDataTransferDown" class="me-1" /> Xuat file Excel
      </CButton>
      <!-- <CButton
        :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
        class="me-2"
        @click="openAddProductDetailModal"
      >
        + Them chi tiet san pham
      </CButton> -->
      <CButton
        :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
        @click="refreshList"
      >
        <CIcon :icon="icons.cilLoop" class="me-1" /> Lam moi
      </CButton>
    </div>

    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th class="text-center">STT</th>
            <th>Ten san pham</th>
            <th class="text-center">Anh</th>
            <th>Hang</th>
            <th>Loai giay</th>
            <th>Mau sac</th>
            <th>Chat lieu</th>
            <th>Kich co</th>
            <th class="text-end">So luong</th>
            <th class="text-end">Gia</th>
            <th class="text-center status-cell">Trang thai</th>
            <th class="text-center">Thao tac</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(product, index) in paginatedProducts" :key="product.id">
            <td class="text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
            <td>{{ product.name }}</td>
            <td class="text-center">
              <img
                :src="getImageUrl(product.image)"
                alt="product image"
                width="50"
                class="rounded"
                onerror="this.onerror=null; this.src='https://placehold.co/50x50/FF0000/FFFFFF?text=Error';"
              />
            </td>
            <td>{{ product.brand }}</td>
            <td>{{ product.type }}</td>
            <td>{{ product.color }}</td>
            <td>{{ product.material }}</td>
            <td>{{ product.size }}</td>
            <td class="text-end">{{ Math.round(product.quantity) }}</td>
            <td class="text-end">{{ formatCurrency(product.price) }}</td>
            <td class="text-center status-cell">
              <span
                :style="{
                  backgroundColor:
                    product.quantity === 0
                      ? '#FFA500' // Cam cho 'Het hang'
                      : product.status === 'dang_kinh_doanh'
                      ? '#000000' // Den cho 'Dang ban'
                      : '#8B0000', // Do sam cho 'Ngung ban'
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem'
                }"
              >
                {{ getDisplayStatusText(product) }}
              </span>
            </td>
            <td class="text-center action-cell">
              <label class="switch" :class="{ disabled: product.quantity === 0 }">
                <input
                  type="checkbox"
                  :checked="product.active && product.quantity > 0"
                  :disabled="product.quantity === 0"
                  @change="toggleStatus(product.id, $event)"
                />
                <span class="slider round"></span>
              </label>
              <CButton
                :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                variant="outline"
                size="sm"
                class="ms-2"
                @click="openEditProductDetailModal(product)"
              >
                <CIcon :icon="icons.cilPencil" />
              </CButton>
              <CButton
                :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                variant="outline"
                size="sm"
                class="ms-2"
                @click="openImageManagementModal(product)"
              >
                <CIcon :icon="icons.cilImage" /> Quản lý ảnh
              </CButton>
              <CButton
                :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
                variant="outline"
                size="sm"
                class="ms-2"
                @click="deleteProductDetail(product.id)"
              >
                <CIcon :icon="icons.cilTrash" />
              </CButton>
            </td>
          </tr>
          <tr v-if="paginatedProducts.length === 0">
            <td colspan="12" class="text-center">Khong co chi tiet san pham nao de hien thi.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <CPagination align="center" class="mt-3">
      <CPaginationItem :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        Truoc
      </CPaginationItem>
      <CPaginationItem
        v-for="page in totalPages"
        :key="page"
        :active="page === currentPage"
        @click="changePage(page)"
      >
        {{ page }}
      </CPaginationItem>
      <CPaginationItem
        :disabled="currentPage === totalPages || totalPages === 0"
        @click="changePage(currentPage + 1)"
      >
        Sau
      </CPaginationItem>
    </CPagination>

    <!-- Modal Them chi tiet san pham moi -->
    <CModal :visible="showAddProductDetailModal" @close="closeAddProductDetailModal">
      <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
        <CModalTitle :style="{ color: '#FFFFFF' }">Them chi tiet san pham moi</CModalTitle>
        <CButtonClose @click="closeAddProductDetailModal" :style="{ color: '#FFFFFF' }" />
      </CModalHeader>
      <CModalBody>
        <CFormInput
          v-model="newProductDetail.parentProductId"
          label="ID San pham goc"
          class="mb-3 custom-input"
          @blur="loadParentProductInfo"
          placeholder="Nhap ID san pham da tao"
        />
        <CFormInput
          v-model="newProductDetail.name"
          label="Ten san pham"
          class="mb-3 custom-input"
          disabled
        />
        <CFormInput
          v-model="newProductDetail.image"
          label="URL anh san pham"
          class="mb-3 custom-input"
          disabled
        />

        <CFormSelect v-model="newProductDetail.brand" label="Hang" class="mb-3 custom-input">
          <option value="">Chon hang</option>
          <option v-for="brand in brandsList" :key="brand.id" :value="Number(brand.id)">
            {{ brand.tenThuongHieu }}
          </option>
        </CFormSelect>
        <CFormSelect v-model="newProductDetail.type" label="Loai giay" class="mb-3 custom-input">
          <option value="">Chon loai giay</option>
          <option
            v-for="category in categoriesList"
            :key="category.id"
            :value="Number(category.id)"
          >
            {{ category.tenDanhMuc }}
          </option>
        </CFormSelect>
        <CFormSelect v-model="newProductDetail.color" label="Mau sac" class="mb-3 custom-input">
          <option value="">Chon mau sac</option>
          <option v-for="color in colorsList" :key="color.id" :value="Number(color.id)">
            {{ color.tenMauSac }}
          </option>
        </CFormSelect>
        <CFormSelect
          v-model="newProductDetail.material"
          label="Chat lieu"
          class="mb-3 custom-input"
        >
          <option value="">Chon chat lieu</option>
          <option v-for="material in materialsList" :key="material.id" :value="Number(material.id)">
            {{ material.tenChatLieu }}
          </option>
        </CFormSelect>
        <CFormSelect v-model="newProductDetail.size" label="Kich co" class="mb-3 custom-input">
          <option value="">Chon kich co</option>
          <option v-for="size in sizesList" :key="size.id" :value="Number(size.id)">
            {{ size.tenKichCo }}
          </option>
        </CFormSelect>

        <CFormInput
          type="number"
          v-model="newProductDetail.quantity"
          label="So luong"
          class="mb-3 custom-input"
        />
        <CFormInput
          type="number"
          v-model="newProductDetail.price"
          label="Gia"
          class="mb-3 custom-input"
        />
        <CFormSelect
          v-model="editingProductDetail.statusId"
          label="Trang thai"
          class="mb-3 custom-input"
        >
          <option value="">Chon trang thai</option>
          <option
            v-for="status in filteredStatusesList"
            :key="status.id"
            :value="Number(status.id)"
          >
            {{ getDisplayStatusName(status.tenTrangThai) }}
          </option>
        </CFormSelect>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          @click="closeAddProductDetailModal"
          :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
          >Huy</CButton
        >
        <CButton
          color="primary"
          @click="addNewProductDetail"
          :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
          >Them chi tiet</CButton
        >
      </CModalFooter>
    </CModal>

    <!-- Modal Sua chi tiet san pham -->
    <CModal :visible="showEditProductDetailModal" @close="showEditProductDetailModal = false">
      <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
        <CModalTitle :style="{ color: '#FFFFFF' }">Sua chi tiet san pham</CModalTitle>
        <CButtonClose @click="showEditProductDetailModal = false" :style="{ color: '#FFFFFF' }" />
      </CModalHeader>
      <CModalBody>
        <p>
          Nhap thong tin muon sua (Hang, Loai giay, Mau sac, Chat lieu, Kich co, Gia, So luong,
          Trang thai).
        </p>
        <CFormInput
          v-model="editingProductDetail.name"
          label="Ten san pham"
          class="mb-3 custom-input"
          disabled
        />
        <CFormInput
          v-model="editingProductDetail.image"
          label="URL anh san pham"
          class="mb-3 custom-input"
          disabled
        />

        <CFormSelect v-model="editingProductDetail.brand" label="Hang" class="mb-3 custom-input">
          <option value="">Chon hang</option>
          <option v-for="brand in brandsList" :key="brand.id" :value="Number(brand.id)">
            {{ brand.tenThuongHieu }}
          </option>
        </CFormSelect>
        <CFormSelect
          v-model="editingProductDetail.type"
          label="Loai giay"
          class="mb-3 custom-input"
        >
          <option value="">Chon loai giay</option>
          <option
            v-for="category in categoriesList"
            :key="category.id"
            :value="Number(category.id)"
          >
            {{ category.tenDanhMuc }}
          </option>
        </CFormSelect>
        <CFormSelect v-model="editingProductDetail.color" label="Mau sac" class="mb-3 custom-input">
          <option value="">Chon mau sac</option>
          <option v-for="color in colorsList" :key="color.id" :value="Number(color.id)">
            {{ color.tenMauSac }}
          </option>
        </CFormSelect>
        <CFormSelect
          v-model="editingProductDetail.material"
          label="Chat lieu"
          class="mb-3 custom-input"
        >
          <option value="">Chon chat lieu</option>
          <option v-for="material in materialsList" :key="material.id" :value="Number(material.id)">
            {{ material.tenChatLieu }}
          </option>
        </CFormSelect>
        <CFormSelect v-model="editingProductDetail.size" label="Kich co" class="mb-3 custom-input">
          <option value="">Chon kich co</option>
          <option v-for="size in sizesList" :key="size.id" :value="Number(size.id)">
            {{ size.tenKichCo }}
          </option>
        </CFormSelect>

        <CFormInput
          type="number"
          v-model="editingProductDetail.quantity"
          label="So luong"
          class="mb-3 custom-input"
        />
        <CFormInput
          type="number"
          v-model="editingProductDetail.price"
          label="Gia"
          class="mb-3 custom-input"
        />
        <CFormTextarea
          v-model="editingProductDetail.moTaChiTiet"
          label="Mo ta chi tiet"
          class="mb-3 custom-input"
        ></CFormTextarea>
        <CFormInput
          v-model="editingProductDetail.maCtsp"
          label="Ma chi tiet san pham"
          class="mb-3 custom-input"
        />
        <CFormSelect
          v-model="editingProductDetail.statusId"
          label="Trang thai"
          class="mb-3 custom-input"
        >
          <option value="">Chon trang thai</option>
          <option
            v-for="status in filteredStatusesList"
            :key="status.id"
            :value="Number(status.id)"
          >
            {{ getDisplayStatusName(status.tenTrangThai) }}
          </option>
        </CFormSelect>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          @click="showEditProductDetailModal = false"
          :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
          >Huy</CButton
        >
        <CButton
          color="primary"
          @click="saveEditedProductDetail"
          :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
          >Xac nhan</CButton
        >
      </CModalFooter>
    </CModal>

    <!-- NEW: Modal Quan Ly Anh San Pham Chi Tiet -->
    <CModal :visible="showImageManagementModal" @close="closeImageManagementModal" size="xl">
      <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
        <CModalTitle :style="{ color: '#FFFFFF' }">Quan Ly Anh Cho Chi Tiet San Pham</CModalTitle>
        <CButtonClose @click="closeImageManagementModal" :style="{ color: '#FFFFFF' }" />
      </CModalHeader>
      <CModalBody>
        <CRow class="mb-3">
          <CCol md="6">
            <div class="mb-3">
              <CFormLabel class="fw-bold">Tai anh tu may tinh (Keo tha hoac chon file)</CFormLabel>
              <input
                type="file"
                ref="imageFileInput"
                multiple
                accept=".jpg,.png,.jpeg"
                @change="handleImageFileUpload"
                class="form-control custom-input"
              />
            </div>
          </CCol>
          <CCol md="6">
            <div class="mb-3">
              <CFormLabel class="fw-bold">Hoac them anh tu URL</CFormLabel>
              <CInputGroup>
                <CFormInput
                  v-model="newImageUrlInput"
                  placeholder="Nhap URL anh (vi du: https://example.com/image.jpg)"
                  class="custom-input"
                  @keyup.enter="addImageUrlToModal"
                />
                <CButton
                  :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                  @click="addImageUrlToModal"
                >
                  Them
                </CButton>
              </CInputGroup>
            </div>
          </CCol>
        </CRow>
        <div class="image-upload-preview border p-3 rounded mb-3" style="min-height: 200px">
          <h5 class="mb-3">Anh da tai len:</h5>
          <div v-if="imagesListForModal.length === 0" class="text-muted">
            Chua co anh nao duoc tai len.
          </div>
          <div class="d-flex flex-wrap">
            <div
              v-for="image in imagesListForModal"
              :key="image.id"
              class="image-item me-3 mb-3 border rounded p-2"
              :class="{
                'image-selected': image.selected,
                'image-representative': image.laAnhDaiDien
              }"
              @click="toggleImageSelectionInModal(image.id)"
              @mouseover="image.hover = true"
              @mouseleave="image.hover = false"
              style="
                width: 120px;
                height: 120px;
                position: relative;
                cursor: pointer;
                overflow: hidden;
              "
            >
              <img
                :src="getImageUrl(image.url)"
                alt="Uploaded Image"
                class="img-thumbnail"
                style="width: 100%; height: 100%; object-fit: cover"
              />

              <!-- Dimming overlay on hover or selected -->
              <div
                class="image-dimming-overlay"
                :class="{ active: image.selected || image.hover }"
              ></div>

              <!-- Checkmark icon (always visible if selected, positioned on top) -->
              <div v-if="image.selected" class="image-checkmark-icon">
                <CIcon :icon="icons.cilCheckCircle" size="xl" class="text-success" />
              </div>

              <!-- Representative Radio Button (optional, based on user preference) -->
              <div class="image-radio-group">
                <div class="image-radio-item">
                  <input
                    type="radio"
                    :id="'radio-rep-' + image.id"
                    :name="'representative-image-for-' + currentProductDetailIdForImages"
                    :value="image.id"
                    v-model="selectedRepresentativeImageId"
                    @click.stop="toggleRepresentativeImage(image.id)"
                  />
                  <label :for="'radio-rep-' + image.id" class="ms-1">Dai dien</label>
                </div>
              </div>

              <!-- Actions (delete button) only visible on hover -->
              <div class="image-actions-overlay" :class="{ active: image.hover }">
                <CButton
                  :style="{
                    backgroundColor: 'rgba(139, 0, 0, 0.7)',
                    borderColor: 'rgba(139, 0, 0, 0.7)',
                    color: '#FFFFFF'
                  }"
                  size="sm"
                  @click.stop="deleteImageFromModal(image.id)"
                >
                  <CIcon :icon="icons.cilX" /> Xoa
                </CButton>
              </div>
            </div>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton
          :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
          @click="closeImageManagementModal"
        >
          Huy
        </CButton>
        <CButton
          :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
          @click="saveImagesForProductDetail"
          :disabled="uploadingImages"
        >
          <span
            v-if="uploadingImages"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-if="uploadingImages"> Dang luu...</span>
          <span v-else>Luu Anh</span>
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script>
import { CIcon } from '@coreui/icons-vue'
import * as icon from '@coreui/icons'
import * as XLSX from 'xlsx'
import { useToast } from 'vue-toastification'
import axios from 'axios' // Import axios

export default {
  components: {
    CIcon
  },
  setup() {
    const toast = useToast() // Inject toast vao setup
    return { toast } // Tra ve toast de co the su dung trong data và methods
  },
  data() {
    return {
      icons: { ...icon }, // Spread all icons from @coreui/icons
      searchQuery: '',
      filterProduct: '',
      filterBrand: '',
      filterType: '',
      filterColor: '',
      filterMaterial: '',
      filterSize: '',
      sortOrder: '',
      currentPage: 1,
      pageSize: 10,
      pageSizes: [5, 10, 25, 50], // Tuy chon kich thuoc trang
      originalProducts: [], // Day la noi luu tru tat ca cac chi tiet san pham (bien the)
      products: [], // Mang nay se chua du lieu da loc va sap xep de hien thi
      showEditProductDetailModal: false,
      editingProductDetail: {},
      showAddProductDetailModal: false,
      newProductDetail: {
        parentProductId: null, // ID cua san pham goc
        id: null, // ID cua bien the nay (se duoc tao tu dong)
        image: '', // Anh san pham goc (tu dong dien)
        name: '', // Ten san pham goc (tu dong dien)
        brand: '',
        type: '',
        color: '',
        material: '',
        size: '',
        quantity: 0,
        price: 0,
        statusId: null // Mac dinh la null, se chon tu dropdown
      },
      // Danh sach du lieu cho cac combobox
      productsList: [], // Danh sach san pham chinh
      categoriesList: [], // Danh muc
      brandsList: [], // Thuong hieu
      materialsList: [], // Chat lieu
      colorsList: [], // Mau sac
      sizesList: [], // Kich co
      statusesList: [], // NEW: Danh sach trang thai
      filteredStatusesList: [],
      baseUrl: 'http://localhost:8080', // Base URL cho API

      // NEW: Data cho Modal Quan Ly Anh
      showImageManagementModal: false,
      currentProductDetailIdForImages: null, // ID của chi tiết sản phẩm đang được quản lý ảnh
      imagesListForModal: [], // Danh sách ảnh hiển thị trong modal (bao gồm ảnh cũ và ảnh mới tải lên/thêm URL)
      newImageUrlInput: '', // Input cho URL ảnh mới
      originalImagesOfCurrentProductDetail: [], // Để so sánh khi lưu và xác định ảnh cần xóa
      selectedRepresentativeImageId: null, // ID của ảnh được chọn làm đại diện trong modal
      uploadingImages: false // Cờ để quản lý trạng thái tải lên ảnh
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.products.length / this.pageSize)
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.products.slice(start, start + this.pageSize)
    },
    filteredStatusesList() {
      // Return only statuses with IDs 3, 4, 5
      return this.statusesList.filter((status) => [3, 4, 5].includes(status.id))
    }
  },
  created() {
    this.loadInitialData() // Tai du lieu combobox va du lieu bang ban dau
  },
  methods: {
    // Hàm mới để xử lý URL ảnh
    getImageUrl(url) {
      // Bước 1: Đảm bảo 'url' là một chuỗi. Nếu không phải, gán nó thành chuỗi rỗng.
      const finalUrl = typeof url === 'string' ? url : ''

      // Bước 2: Kiểm tra xem 'finalUrl' có phải là URL tuyệt đối (http/https) hoặc Base64 không.
      if (
        finalUrl.startsWith('http://') ||
        finalUrl.startsWith('https://') ||
        finalUrl.startsWith('data:image/')
      ) {
        return finalUrl // Trả về URL tuyệt đối hoặc Base64 nguyên bản
      }
      // Bước 3: Nếu không phải, giả định đó là đường dẫn tương đối và thêm baseUrl vào.
      // Đảm bảo không có dấu // thừa nếu baseUrl đã có / ở cuối và finalUrl bắt đầu bằng /
      return this.baseUrl + (finalUrl.startsWith('/') ? finalUrl : '/' + finalUrl)
    },
    formatCurrency(value) {
      if (value == null) return ''
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    },
    onPageSizeChange() {
      this.currentPage = 1 // Reset ve trang dau tien khi thay doi kich thuoc trang
      this.filterAndSortProducts() // Ap dung lai bo loc va sap xep voi kich thuoc trang moi
    },
    openAddProductDetailModal() {
      this.resetNewProductDetail()
      this.showAddProductDetailModal = true
    },
    async loadInitialData() {
      try {
        // Tai du lieu cho cac combobox
        const [
          productsRes,
          categoriesRes,
          brandsRes,
          materialsRes,
          colorsRes,
          sizesRes,
          statusesRes
        ] = await Promise.all([
          axios.get(`${this.baseUrl}/api/san-phams`), // Lay danh sach san pham de dien combobox "Ten san pham"
          axios.get(`${this.baseUrl}/api/danh-mucs`),
          axios.get(`${this.baseUrl}/api/thuongHieus`),
          axios.get(`${this.baseUrl}/api/chatLieus`),
          axios.get(`${this.baseUrl}/api/mauSacs`),
          axios.get(`${this.baseUrl}/api/kichCos`),
          axios.get(`${this.baseUrl}/api/trangThais`) // NEW: Tai danh sach trang thai
        ])

        this.productsList = productsRes.data.content
        this.categoriesList = categoriesRes.data
        this.brandsList = brandsRes.data
        this.materialsList = materialsRes.data
        this.colorsList = colorsRes.data
        this.sizesList = sizesRes.data
        this.statusesList = statusesRes.data // NEW: Gan danh sach trang thai

        // Tai du lieu cho bang chi tiet san pham
        await this.loadProducts()
        this.toast.success('Da tai du lieu ban dau thanh cong!')
      } catch (error) {
        console.error('Loi khi tai du lieu ban dau:', error)
        this.toast.error('Khong the tai du lieu ban dau. Vui long thu lai.')
      }
    },
    async loadProducts() {
      try {
        const response = await axios.get(`${this.baseUrl}/api/chi-tiet-san-phams`)
        this.originalProducts = response.data.map((detail) => {
          console.log('Detail object from backend (Products-Detail.vue loadProducts):', detail)

          let imageUrl = 'https://placehold.co/50x50/cccccc/000000?text=No+Image' // Default fallback
          if (detail.images && Array.isArray(detail.images) && detail.images.length > 0) {
            const representative = detail.images.find((img) => img.laAnhDaiDien)
            if (representative && representative.urlAnh) {
              imageUrl = representative.urlAnh // Sử dụng URL gốc, sẽ được xử lý bởi getImageUrl
            } else if (detail.images[0] && detail.images[0].urlAnh) {
              imageUrl = detail.images[0].urlAnh // Sử dụng URL gốc, sẽ được xử lý bởi getImageUrl
            }
          }
          console.log(`Product Detail ID: ${detail.id}, Image URL: ${imageUrl}`)

          return {
            id: detail.id,
            productId: detail.sanPham,
            image: imageUrl,
            name: detail.tenSanPham,
            brand: detail.tenThuongHieu,
            brandId: detail.thuongHieu,
            type: detail.tenDanhMuc,
            typeId: detail.danhMuc,
            color: detail.tenMauSac,
            colorId: detail.mauSac,
            material: detail.tenChatLieu,
            materialId: detail.chatLieu,
            size: detail.tenKichCo,
            sizeId: detail.kichCo,
            quantity: detail.soLuongTonKho,
            price: detail.giaBan,
            status: detail.tenTrangThaiRieng,
            statusId: detail.idTrangThaiRieng,
            active: detail.tenTrangThaiRieng === 'dang_kinh_doanh',
            moTaChiTiet: detail.moTaChiTiet,
            maCtsp: detail.maCtsp,
            images: detail.images
              ? detail.images.map((img) => ({
                  id: img.id,
                  url: img.urlAnh, // Sử dụng URL gốc, sẽ được xử lý bởi getImageUrl
                  laAnhDaiDien: img.laAnhDaiDien,
                  isNew: false,
                  file: null,
                  selected: true,
                  hover: false
                }))
              : []
          }
        })
        this.products = [...this.originalProducts]
        this.toast.success('Đã tải danh sách chi tiết sản phẩm thành công!')
      } catch (error) {
        console.error('Lỗi khi tải danh sách chi tiet san pham:', error)
        this.toast.error('Không thể tải danh sách chi tiết sản phẩm. Vui lòng thử lại.')
      }
    },
    // Cap nhat phuong thuc searchProducts de goi filterAndSortProducts
    searchProducts() {
      this.filterAndSortProducts() // Goi phuong thuc loc va sap xep chinh
    },
    async filterAndSortProducts() {
      try {
        const params = {
          sanPhamId: this.filterProduct || null,
          thuongHieuId: this.filterBrand || null,
          danhMucId: this.filterType || null,
          chatLieuId: this.filterMaterial || null,
          mauSacId: this.filterColor || null,
          kichCoId: this.filterSize || null,
          keyword: this.searchQuery || null
        }

        // Loai bo cac tham so null de khong gui chung trong request URL
        Object.keys(params).forEach((key) => params[key] === null && delete params[key])

        const response = await axios.get(`${this.baseUrl}/api/chi-tiet-san-phams/filter`, {
          params
        })

        this.originalProducts = response.data.map((detail) => {
          console.log(
            'Detail object from backend (Products-Detail.vue filterAndSortProducts):',
            detail
          ) // Log the full detail object

          let imageUrl = 'https://placehold.co/50x50/cccccc/000000?text=No+Image' // Default fallback

          // Prioritize image from the 'images' array if available and marked as representative
          if (detail.images && Array.isArray(detail.images) && detail.images.length > 0) {
            const representative = detail.images.find((img) => img.laAnhDaiDien)
            if (
              representative &&
              representative.urlAnh &&
              typeof representative.urlAnh === 'string' &&
              representative.urlAnh.trim() !== ''
            ) {
              imageUrl = representative.urlAnh // Sử dụng URL gốc, sẽ được xử lý bởi getImageUrl
            } else if (
              detail.images[0] &&
              detail.images[0].urlAnh &&
              typeof detail.images[0].urlAnh === 'string' &&
              detail.images[0].urlAnh.trim() !== ''
            ) {
              imageUrl = detail.images[0].urlAnh // Sử dụng URL gốc, sẽ được xử lý bởi getImageUrl
            }
          }
          console.log(`Filtered Product Detail ID: ${detail.id}, Image URL: ${imageUrl}`) // Log image URL for each detail

          return {
            id: detail.id,
            productId: detail.sanPham,
            image: imageUrl, // Use the determined image URL
            name: detail.tenSanPham,
            brand: detail.tenThuongHieu,
            brandId: detail.thuongHieu, // Store ID
            type: detail.tenDanhMuc,
            typeId: detail.danhMuc, // Store ID
            color: detail.tenMauSac,
            colorId: detail.mauSac, // Store ID
            material: detail.tenChatLieu,
            materialId: detail.chatLieu, // Store ID
            size: detail.tenKichCo,
            sizeId: detail.kichCo, // Store ID
            quantity: detail.soLuongTonKho,
            price: detail.giaBan,
            status: detail.tenTrangThaiRieng, // Use tenTrangThaiRieng for display
            statusId: detail.idTrangThaiRieng, // Store ID for editing
            active: detail.tenTrangThaiRieng === 'dang_kinh_doanh', // For toggle switch logic
            moTaChiTiet: detail.moTaChiTiet, // Map moTaChiTiet
            maCtsp: detail.maCtsp, // Map maCtsp
            images: detail.images
              ? detail.images.map((img) => ({
                  // NEW: Map images for product detail
                  id: img.id,
                  url: img.urlAnh, // Sử dụng URL gốc, sẽ được xử lý bởi getImageUrl
                  laAnhDaiDien: img.laAnhDaiDien,
                  isNew: false,
                  file: null,
                  selected: true,
                  hover: false
                }))
              : []
          }
        })

        let filtered = [...this.originalProducts]

        // Apply sorting (loc da duoc backend xu ly, chi can sap xep)
        if (this.sortOrder) {
          filtered.sort((a, b) => {
            if (this.sortOrder === 'price-asc') {
              return a.price - b.price
            } else if (this.sortOrder === 'price-desc') {
              return b.price - a.price
            } else if (this.sortOrder === 'name-asc') {
              return a.name.localeCompare(b.name)
            } else if (this.sortOrder === 'name-desc') {
              return b.name.localeCompare(a.name)
            }
            return 0
          })
        }

        this.products = filtered
        this.currentPage = 1
        this.toast.info(`Da loc va sap xep, tim thay ${this.products.length} san pham.`)
      } catch (error) {
        console.error(
          'Loi khi loc va sap xep san pham:',
          error.response ? error.response.data : error.message
        )
        this.toast.error('Khong the loc va sap xep san pham. Vui long thu lai.')
      }
    },
    async loadParentProductInfo() {
      const parentProductId = this.newProductDetail.parentProductId
      if (!parentProductId) {
        this.newProductDetail.name = ''
        this.newProductDetail.image = ''
        return
      }

      try {
        const response = await axios.get(`${this.baseUrl}/api/san-phams/${parentProductId}`)
        const parentProduct = response.data
        this.newProductDetail.name = parentProduct.tenSanPham
        // Sử dụng getImageUrl để xử lý URL ảnh sản phẩm gốc
        this.newProductDetail.image = parentProduct.urlAnhDaiDien
          ? this.getImageUrl(parentProduct.urlAnhDaiDien)
          : 'https://placehold.co/50x50/cccccc/000000?text=No+Image'
        this.toast.success('Da tai thong tin san pham goc!')
      } catch (error) {
        console.error('Loi khi tai thong tin san pham goc:', error)
        this.newProductDetail.name = ''
        this.newProductDetail.image = ''
        this.toast.error('Khong tim thay san pham goc voi ID nay. Vui long kiem tra lai.')
      }
    },
    async addNewProductDetail() {
      if (!this.newProductDetail.parentProductId) {
        this.toast.error('Vui long nhap ID san pham goc.')
        return
      }
      if (!this.newProductDetail.name) {
        this.toast.error('ID san pham goc khong hop le hoac chua duoc tai thong tin.')
        return
      }
      if (this.newProductDetail.quantity < 0 || this.newProductDetail.price < 0) {
        this.toast.error('So luong va gia phai lon hon hoac bang 0.')
        return
      }
      if (
        !this.newProductDetail.brand ||
        !this.newProductDetail.type ||
        !this.newProductDetail.color ||
        !this.newProductDetail.material ||
        !this.newProductDetail.size ||
        !this.newProductDetail.statusId
      ) {
        // NEW: Validate statusId
        this.toast.error(
          'Vui long chon day du thong tin chi tiet (Hang, Loai giay, Mau sac, Chat lieu, Kich co, Trang thai).'
        )
        return
      }

      try {
        const newDetailData = {
          soLuongTonKho: parseInt(this.newProductDetail.quantity, 10),
          moTaChiTiet: '', // Add this field to the form if needed
          giaNhap: parseFloat(this.newProductDetail.price), // Assuming giaNhap = giaBan if no separate field
          giaBan: parseFloat(this.newProductDetail.price),
          maCtsp: `CTSP_${Date.now()}`, // Generate a unique code
          ngayNhap: new Date().toISOString().slice(0, 19), // ISO 8601 format
          idTrangThaiRieng: this.newProductDetail.statusId, // NEW: Send status ID
          chatLieu: this.newProductDetail.material, // Use ID
          mauSac: this.newProductDetail.color, // Use ID
          kichCo: this.newProductDetail.size, // Use ID
          sanPham: this.newProductDetail.parentProductId // Parent product ID
        }

        await axios.post(`${this.baseUrl}/api/chi-tiet-san-phams`, newDetailData)
        this.toast.success('Them chi tiet san pham thanh cong!')
        this.closeAddProductDetailModal()
        this.refreshList() // Reload the list to show the new item
      } catch (error) {
        console.error(
          'Loi khi them chi tiet san pham:',
          error.response ? error.response.data : error.message
        )
        this.toast.error('Khong the them chi tiet san pham. Vui long thu lai.')
      }
    },
    closeAddProductDetailModal() {
      this.showAddProductDetailModal = false
      this.resetNewProductDetail()
    },
    resetNewProductDetail() {
      this.newProductDetail = {
        parentProductId: null,
        id: null,
        image: '',
        name: '',
        brand: '',
        type: '',
        color: '',
        material: '',
        size: '',
        quantity: 0,
        price: 0,
        statusId: null // Reset to null
      }
    },
    async toggleStatus(id, event) {
      const product = this.products.find((p) => p.id === id)
      if (!product) {
        this.toast.error('Không tìm thấy chi tiết sản phẩm.')
        event.target.checked = !event.target.checked // Revert toggle
        return
      }

      // Logic quan trọng: Nếu số lượng = 0, chỉ cập nhật trạng thái thành 'Hết hàng'
      if (product.quantity === 0) {
        // Gửi yêu cầu cập nhật lên backend để đặt trạng thái là 'het_hang' (ID 5)
        try {
          await axios.put(`${this.baseUrl}/api/chi-tiet-san-phams/${id}/update-status`, {
            idTrangThaiRieng: 5 // ID của trạng thái 'Hết hàng'
          })
          product.statusId = 5
          product.status = 'het_hang'
          product.active = false // Luôn đặt active về false khi hết hàng
          this.toast.warning('Sản phẩm hết hàng, trạng thái đã được chuyển sang "Hết hàng".')
        } catch (error) {
          console.error('Lỗi khi cập nhật trạng thái:', error)
          this.toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.')
        }
        event.target.checked = false // Đảm bảo nút gạt luôn về false
        return
      }

      // Logic cho trường hợp số lượng > 0
      const newActiveState = event.target.checked
      try {
        await axios.put(`${this.baseUrl}/api/chi-tiet-san-phams/${id}/toggle-status`, {
          active: newActiveState
        })
        product.active = newActiveState
        product.statusId = newActiveState ? 3 : 4 // 'Đang bán' (3) hoặc 'Ngừng bán' (4)
        product.status = newActiveState ? 'dang_kinh_doanh' : 'ngung_kinh_doanh'
        this.toast.success(
          `Trạng thái chi tiết sản phẩm ${
            product.name
          } đã được cập nhật thành ${this.getDisplayStatusText(product)}.`
        )
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error)
        this.toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.')
        event.target.checked = !newActiveState // Revert the toggle if API call fails
      }
    },
    openEditProductDetailModal(product) {
      console.log('DEBUG: Product object passed to openEditProductDetailModal:', product)
      console.log('DEBUG: product.brandId:', product.brandId)
      console.log('DEBUG: product.typeId:', product.typeId)
      console.log('DEBUG: brandsList:', this.brandsList)
      console.log('DEBUG: categoriesList:', this.categoriesList)

      let statusId = product.statusId
      let activeStatus = product.active // Giữ trạng thái active ban đầu
      // Nếu số lượng = 0, trạng thái phải là 'Hết hàng'
      if (product.quantity === 0) {
        statusId = 5
        activeStatus = false // Bắt buộc active = false khi hết hàng
      } else if (product.active) {
        statusId = 3 // 'dang_kinh_doanh'
      } else {
        statusId = 4 // 'ngung_kinh_doanh'
      }

      this.editingProductDetail = {
        ...product,
        brand: product.brandId,
        type: product.typeId,
        color: product.colorId,
        material: product.materialId,
        size: product.sizeId,
        statusId: statusId,
        active: activeStatus, // Sử dụng trạng thái active đã được cập nhật
        moTaChiTiet: product.moTaChiTiet,
        maCtsp: product.maCtsp, // Map maCtsp
        quantity: Number(product.quantity),
        price: Number(product.price)
      }
      this.showEditProductDetailModal = true
    },
    async saveEditedProductDetail() {
      if (this.editingProductDetail.quantity < 0 || this.editingProductDetail.price < 0) {
        this.toast.error('So luong va gia phai lon hon hoac bang 0.')
        return
      }
      if (
        !this.editingProductDetail.brand ||
        !this.editingProductDetail.type ||
        !this.editingProductDetail.color ||
        !this.editingProductDetail.material ||
        !this.editingProductDetail.size ||
        !this.editingProductDetail.statusId
      ) {
        this.toast.error(
          'Vui long chon day du thong tin chi tiet (Hang, Loai giay, Mau sac, Chat lieu, Kich co, Trang thai).'
        )
        return
      }

      // Logic mới: Cập nhật statusId dựa trên số lượng trước khi gửi lên backend
      let newStatusId = Number(this.editingProductDetail.statusId)
      if (Number(this.editingProductDetail.quantity) === 0) {
        newStatusId = 5 // ID của trạng thái 'Hết hàng'
      } else if (newStatusId === 5 && Number(this.editingProductDetail.quantity) > 0) {
        // Nếu trước đó là hết hàng nhưng bây giờ có hàng lại, mặc định chuyển về 'Đang bán'
        newStatusId = 3 // 'Đang bán'
      }
      try {
        const updatedDetailData = {
          soLuongTonKho: parseInt(this.editingProductDetail.quantity, 10),
          moTaChiTiet: this.editingProductDetail.moTaChiTiet || '',
          giaNhap: parseFloat(this.editingProductDetail.price), // Assuming giaNhap = giaBan if no separate field
          giaBan: parseFloat(this.editingProductDetail.price),
         idTrangThaiRieng: newStatusId, // Sử dụng newStatusId đã được cập nhật
          chatLieu: Number(this.editingProductDetail.material),
          mauSac: Number(this.editingProductDetail.color),
          kichCo: Number(this.editingProductDetail.size),
          sanPham: Number(this.editingProductDetail.productId),
          maCtsp: this.editingProductDetail.maCtsp,
        }

        console.log('DEBUG: editingProductDetail.id before PUT:', this.editingProductDetail.id)
        console.log('DEBUG: updatedDetailData before PUT:', updatedDetailData)

        await axios.put(
          `${this.baseUrl}/api/chi-tiet-san-phams/${this.editingProductDetail.id}`,
          updatedDetailData
        )
        this.toast.success('Cap nhat chi tiet san pham thanh cong!')
        this.showEditProductDetailModal = false
        this.refreshList() // Reload data to reflect changes
      } catch (error) {
        console.error('Loi khi cap nhat chi tiet san pham:', error)
        this.toast.error('Khong the cap nhat chi tiet san pham. Vui long thu lai.')
      }
    },
    async deleteProductDetail(id) {
      // Replace confirm with a custom modal if needed, as alert/confirm are blocked in iframe
      if (
        confirm(`Ban co chac muon chuyen chi tiet san pham nay sang trang thai "Ngung ban" khong?`)
      ) {
        // Hiển thị 'Ngung ban'
        try {
          // Assuming backend soft deletes by changing status to 'ngung_kinh_doanh'
          await axios.delete(`${this.baseUrl}/api/chi-tiet-san-phams/${id}`)
          this.toast.warning('Chi tiet san pham da duoc chuyen sang trang thai "Ngung ban".') // Hiển thị 'Ngung ban'
          this.refreshList() // Reload data to reflect changes
        } catch (error) {
          console.error(
            'Loi khi chuyen trang thai chi tiet san pham:',
            error.response ? error.response.data : error.message
          )
          this.toast.error('Khong the chuyen trang thai chi tiet san pham. Vui long thu lai.')
        }
      }
    },
    refreshList() {
      this.searchQuery = ''
      this.filterProduct = ''
      this.filterBrand = ''
      this.filterType = ''
      this.filterColor = ''
      this.filterMaterial = ''
      this.filterSize = ''
      this.sortOrder = ''
      this.currentPage = 1
      this.loadProducts() // Tai lai du lieu goc
      this.toast.info('Danh sach chi tiet san pham da duoc lam moi.')
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    getDisplayStatusText(product) {
      // Ưu tiên hiển thị "Hết hàng" nếu số lượng là 0
      if (product.quantity === 0) {
        return 'Het hang'
      }

      // Dựa vào trạng thái từ backend nếu số lượng > 0
      switch (product.status) {
        case 'dang_kinh_doanh':
          return 'Dang ban'
        case 'ngung_kinh_doanh':
          return 'Ngung ban'
        case 'het_hang':
          return 'Het hang'
        default:
          return product.status || 'Khong ro' // Fallback
      }
    },
    getDisplayStatusName(backendStatusName) {
      // Helper to display Vietnamese names for backend status strings
      switch (backendStatusName) {
        case 'dang_kinh_doanh':
          return 'Đang bán'
        case 'het_hang':
          return 'Hết hàng'
        case 'ngung_kinh_doanh':
          return 'Ngừng bán'
        default:
          return backendStatusName
      }
    },
    exportToExcel() {
      const data = this.products.map((product) => ({
        'Ten san pham': product.name,
        Hang: product.brand,
        'Loai giay': product.type,
        'Mau sac': product.color,
        'Chat lieu': product.material,
        'Kich co': product.size,
        'So luong': product.quantity,
        Gia: product.price,
        'Trang thai': this.getDisplayStatusText(product) // Use the helper function for display text
      }))

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ChiTietSanPham')
      XLSX.writeFile(workbook, 'ChiTietSanPham.xlsx')
      this.toast.success('Xuat file Excel thanh cong!')
    },

    // NEW: Image Management Modal Methods
    async openImageManagementModal(productDetail) {
      this.showImageManagementModal = true
      this.currentProductDetailIdForImages = productDetail.id
      this.newImageUrlInput = '' // Clear URL input

      // Fetch images related to this product detail from backend
      try {
        const response = await axios.get(
          `${this.baseUrl}/api/anhSanPhams/by-chi-tiet-san-pham/${productDetail.id}`
        )
        this.imagesListForModal = response.data.map((img) => ({
          id: img.id,
          url: img.urlAnh, // Sử dụng URL gốc, sẽ được xử lý bởi getImageUrl
          laAnhDaiDien: img.laAnhDaiDien,
          isNew: false, // Mark as existing image from DB
          file: null,
          selected: true, // Assume all existing images are "selected" for display
          hover: false,
          originalLaAnhDaiDien: img.laAnhDaiDien // Store original representative status
        }))

        this.originalImagesOfCurrentProductDetail = JSON.parse(
          JSON.stringify(this.imagesListForModal)
        ) // Deep copy for comparison

        // Set the initially selected representative image ID
        const representative = this.imagesListForModal.find((img) => img.laAnhDaiDien)
        this.selectedRepresentativeImageId = representative ? representative.id : null

        this.toast.success('Da tai anh cho chi tiet san pham.')
      } catch (error) {
        console.error(
          'Loi khi tai anh cho chi tiet san pham:',
          error.response ? error.response.data : error.message
        )
        this.toast.error('Khong the tai anh cho chi tiet san pham. Vui long thu lai.')
        this.imagesListForModal = [] // Clear if error
        this.originalImagesOfCurrentProductDetail = []
        this.selectedRepresentativeImageId = null
      }

      // Clear file input
      this.$nextTick(() => {
        if (this.$refs.imageFileInput) {
          this.$refs.imageFileInput.value = ''
        }
      })
    },

    closeImageManagementModal() {
      this.showImageManagementModal = false
      this.currentProductDetailIdForImages = null
      this.imagesListForModal = []
      this.newImageUrlInput = ''
      this.originalImagesOfCurrentProductDetail = []
      this.selectedRepresentativeImageId = null
    },

    handleImageFileUpload(event) {
      const files = event.target.files
      if (files.length === 0) return

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage = {
            id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9), // Temporary ID for frontend
            url: e.target.result, // Data URL for preview
            file: file, // Store the actual file object for backend upload
            laAnhDaiDien: false, // Default to not representative
            isNew: true, // Mark as new image to be uploaded
            selected: true, // Auto-select uploaded images
            hover: false
          }
          this.imagesListForModal.push(newImage)
        }
        reader.readAsDataURL(file)
      }
      this.toast.success(`Da tai len ${files.length} anh de xem truoc.`)
    },

    addImageUrlToModal() {
      if (!this.newImageUrlInput) {
        this.toast.error('Vui long nhap URL anh.')
        return
      }
      //Basic URL validation
      // if (!/^https?:\/\/.+\.(jpg|png|gif|jpeg)$/i.test(this.newImageUrlInput)) {
      //   this.toast.error('URL anh khong hop le. Chi chap nhan .jpg, .png, .gif, .jpeg.')
      //   return
      // }
      if (this.imagesListForModal.some((img) => img.url === this.newImageUrlInput)) {
        this.toast.warning('Anh nay da ton tai trong danh sach.')
        return
      }

      const newImage = {
        id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9), // Temporary ID for frontend
        url: this.newImageUrlInput, // Actual URL
        file: null, // No file object for URL images
        laAnhDaiDien: false, // Default to not representative
        isNew: true, // Mark as new image to be registered by URL
        selected: true,
        hover: false
      }
      this.imagesListForModal.push(newImage)
      this.newImageUrlInput = ''
      this.toast.success('Da them anh tu URL.')
    },

    deleteImageFromModal(imageId) {
      if (confirm('Ban co chac chan muon xoa anh nay?')) {
        this.imagesListForModal = this.imagesListForModal.filter((img) => img.id !== imageId)
        // If the deleted image was the representative, clear the representative selection
        if (this.selectedRepresentativeImageId === imageId) {
          this.selectedRepresentativeImageId = null
        }
        this.toast.success('Da xoa anh khoi danh sach.')
      }
    },

    toggleImageSelectionInModal(imageId) {
      const image = this.imagesListForModal.find((img) => img.id === imageId)
      if (image) {
        image.selected = !image.selected
        // If unselected, and it was representative, clear representative selection
        if (!image.selected && this.selectedRepresentativeImageId === imageId) {
          this.selectedRepresentativeImageId = null
        }
      }
    },

    toggleRepresentativeImage(imageId) {
      // Find the image that was clicked
      const clickedImage = this.imagesListForModal.find((img) => img.id === imageId)

      if (!clickedImage) return

      // If the clicked image is already the representative, unselect it.
      // Otherwise, make it the representative.
      if (clickedImage.laAnhDaiDien) {
        clickedImage.laAnhDaiDien = false
        this.selectedRepresentativeImageId = null
        this.toast.info('Đã bỏ đặt ảnh đại diện cho chi tiết sản phẩm.')

        // Sau khi bỏ chọn ảnh đại diện, kiểm tra xem còn ảnh nào khác không
        // Nếu còn, và không có ảnh nào là đại diện, chọn ảnh đầu tiên làm đại diện mới
        const remainingImages = this.imagesListForModal.filter((img) => img.id !== imageId)
        const currentRepresentative = remainingImages.find((img) => img.laAnhDaiDien)

        if (remainingImages.length > 0 && !currentRepresentative) {
          const firstRemaining = remainingImages[0]
          firstRemaining.laAnhDaiDien = true
          this.selectedRepresentativeImageId = firstRemaining.id
          this.toast.info('Tự động đặt ảnh đầu tiên còn lại làm ảnh đại diện.')
        }
      } else {
        // Unset all other images as representative
        this.imagesListForModal.forEach((img) => {
          img.laAnhDaiDien = false
        })
        // Set the clicked image as representative
        clickedImage.laAnhDaiDien = true
        this.selectedRepresentativeImageId = imageId
        this.toast.info('Đã đặt ảnh đại diện cho chi tiết sản phẩm.')
      }
    },

    async saveImagesForProductDetail() {
      this.uploadingImages = true
      try {
        const currentDetailId = this.currentProductDetailIdForImages
        if (!currentDetailId) {
          this.toast.error('Khong co ID chi tiet san pham de luu anh.')
          return
        }

        const promises = []

        // 1. Delete removed images
        const imagesToDelete = this.originalImagesOfCurrentProductDetail.filter(
          (originalImg) =>
            !this.imagesListForModal.some((currentImg) => currentImg.id === originalImg.id)
        )
        for (const imgToDelete of imagesToDelete) {
          // Only delete if it's an existing image (has a backend ID)
          if (!imgToDelete.isNew) {
            promises.push(axios.delete(`${this.baseUrl}/api/anhSanPhams/${imgToDelete.id}`))
          }
        }

        // 2. Process images to upload/add URL/update
        for (const image of this.imagesListForModal) {
          // Chuẩn bị URL để gửi về backend (loại bỏ baseUrl nếu có)
          const urlForBackend = image.url.startsWith(this.baseUrl)
            ? image.url.substring(this.baseUrl.length)
            : image.url

          if (image.isNew) {
            // New image (file upload or URL)
            if (image.file) {
              // Upload file
              const formData = new FormData()
              formData.append('file', image.file)
              const anhSanPhamDtoJson = JSON.stringify({
                chiTietSpId: currentDetailId,
                laAnhDaiDien: image.laAnhDaiDien
              })
              formData.append('data', anhSanPhamDtoJson)
              promises.push(
                axios.post(`${this.baseUrl}/api/anhSanPhams/upload`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                })
              )
            } else if (image.url) {
              // Add from URL
              const anhSanPhamDto = {
                chiTietSpId: currentDetailId,
                urlAnh: urlForBackend, // Sử dụng URL đã xử lý
                laAnhDaiDien: image.laAnhDaiDien
              }
              promises.push(
                axios.post(`${this.baseUrl}/api/anhSanPhams/add-url`, anhSanPhamDto, {
                  headers: { 'Content-Type': 'application/json' }
                })
              )
            }
          } else {
            // Existing image - check if 'laAnhDaiDien' status changed
            const originalImage = this.originalImagesOfCurrentProductDetail.find(
              (origImg) => origImg.id === image.id
            )
            // So sánh trạng thái laAnhDaiDien và URL (để phát hiện nếu URL được chỉnh sửa thủ công)
            if (
              originalImage &&
              (originalImage.laAnhDaiDien !== image.laAnhDaiDien || originalImage.url !== image.url)
            ) {
              const anhSanPhamDto = {
                chiTietSpId: currentDetailId,
                urlAnh: urlForBackend, // Sử dụng URL đã xử lý
                laAnhDaiDien: image.laAnhDaiDien
              }
              promises.push(
                axios.put(`${this.baseUrl}/api/anhSanPhams/${image.id}`, anhSanPhamDto, {
                  headers: { 'Content-Type': 'application/json' }
                })
              )
            }
          }
        }

        await Promise.all(promises)
        this.toast.success('Da luu tat ca anh thanh cong!')
        this.closeImageManagementModal()
        this.refreshList() // Reload main product list to show updated images
      } catch (error) {
        console.error('Loi khi luu anh:', error.response ? error.response.data : error.message)
        this.toast.error('Khong the luu anh. Vui long thu lai.')
      } finally {
        this.uploadingImages = false
      }
    }
  }
}
</script>

<style scoped>
/* Giu nguyen style tu Products-Detail.vue va them/sua mot so chi tiet */
.container {
  padding: 1rem;
}

.table-container {
  overflow-x: auto;
  max-width: 100%;
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

.custom-table th.text-end,
.custom-table td.text-end {
  text-align: right;
  vertical-align: middle;
}

.custom-table td.status-cell {
  min-width: 120px;
  white-space: nowrap;
  overflow: visible;
  padding: 0.5rem;
  vertical-align: middle;
}

.custom-table td.action-cell {
  min-width: 200px;
  white-space: nowrap;
  overflow: visible;
  padding: 0.5rem;
  vertical-align: middle;
}

.custom-table tr:hover {
  background-color: #f8f9fa;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 0.5rem;
}

.switch.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #8b0000;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #000000;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.round {
  border-radius: 24px;
}

/* Custom input style */
.custom-input.form-control:focus {
  border-color: #ced4da !important; /* Mau xam */
  box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25) !important; /* Mau xam nhat */
}

/* Them CSS de CFormSelect chiem toan bo chieu rong cua cot */
.col-md-4 .form-select,
.col-sm-6 .form-select,
.col-12 .form-select {
  width: 100%;
}

.form-select {
  height: calc(1.5em + 0.75rem + 2px); /* Chieu cao mac dinh cua form-select trong Bootstrap */
}

@media (max-width: 768px) {
  .custom-table td.status-cell {
    min-width: 100px;
  }
  .custom-table td.action-cell {
    min-width: 180px;
  }
}

/* NEW: Styles for Image Management Modal */
.image-upload-preview {
  border: 1px dashed #ccc !important;
  border-radius: 0.5rem !important;
  background-color: #f8f9fa;
  padding: 1rem;
}

.image-item {
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.image-item.image-selected {
  border: 2px solid #000000 !important; /* Highlight selected images */
}

.image-item.image-representative {
  box-shadow: 0 0 0 3px #28a745; /* Green border for representative image */
}

.image-dimming-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  pointer-events: none; /* Allow clicks to pass through to the parent .image-item */
}

.image-dimming-overlay.active {
  opacity: 1;
}

.image-checkmark-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #28a745; /* Green checkmark */
  font-size: 1.5rem;
  z-index: 9;
}

.image-radio-group {
  position: absolute;
  bottom: 5px;
  left: 5px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 5px;
  border-radius: 3px;
  display: flex;
  flex-direction: column; /* Stack radio buttons vertically */
  align-items: flex-start;
  font-size: 0.75rem;
  gap: 2px; /* Small gap between radio items */
}

.image-radio-item input[type='radio'] {
  margin-right: 3px;
  width: 12px;
  height: 12px;
}
.image-radio-item label {
  margin-bottom: 0; /* Remove default margin for labels */
}

.image-actions-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  padding: 5px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  z-index: 8;
}

.image-actions-overlay.active {
  opacity: 1;
}
</style>
