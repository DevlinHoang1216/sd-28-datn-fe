<template>
  <div class="container py-4">
    <h2 class="mb-4 fw-bold" :style="{ color: '#000000' }">Quan Ly San Pham</h2>

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

    <div class="mb-3">
      <CSelect v-model="pageSize" class="me-2" style="width: 120px" @change="onPageSizeChange">
        <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
      </CSelect>
      <CButton
        :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
        class="me-2"
        @click="$router.push({ name: 'Them San Pham' })"
      >
        + Them san pham
      </CButton>

      <CButton
        :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
        class="me-2"
        @click="viewDetails"
      >
        Xem chi tiet san pham
      </CButton>

      <CButton
        :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
        @click="refreshList"
      >
        Lam moi
      </CButton>
    </div>

    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th class="text-center">STT</th>
            <th class="text-center">Anh</th>
            <th>Ten san pham</th>
            <th class="text-end">So luong</th>
            <th class="text-center status-cell">Trang thai</th>
            <th class="text-center">Thao tac</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(product, index) in paginatedProducts" :key="product.id">
            <td class="text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
            <td class="text-center">
              <img :src="product.image" alt="product image" width="50" class="rounded"
                   onerror="this.onerror=null; this.src='https://placehold.co/50x50/cccccc/000000?text=No+Image';" />
            </td>
            <td>{{ product.name }}</td>
            <td class="text-end">{{ Math.round(product.quantity) }}</td>
            <td class="text-center status-cell">
              <span
                :style="{
                  backgroundColor:
                    product.quantity === 0
                      ? '#FFA500' // Orange for 'Het hang'
                      : product.status === 'dang_kinh_doanh'
                      ? '#000000' // Black for 'Dang ban'
                      : '#8B0000', // Dark red for 'Ngung ban'
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                }"
              >
                {{
                  product.quantity === 0
                    ? 'Het hang'
                    : product.status === 'dang_kinh_doanh'
                    ? 'Dang ban'
                    : 'Ngung ban'
                }}
              </span>
            </td>
            <td class="text-center action-cell">
              <label class="switch" :class="{ disabled: product.quantity === 0 }">
                <input
                  type="checkbox"
                  :checked="product.status === 'dang_kinh_doanh'"
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
                @click="openEditProductModal(product)"
              >
                <CIcon :icon="icons.cilPencil" />
              </CButton>
              <CButton
                :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
                variant="outline"
                size="sm"
                class="ms-2"
                @click="deleteProduct(product.id)"
              >
                <CIcon :icon="icons.cilTrash" />
              </CButton>
              <!-- Nút xem chi tiết sản phẩm -->
              <CButton
                :style="{ backgroundColor: '#007BFF', borderColor: '#007BFF', color: '#FFFFFF' }"
                variant="outline"
                size="sm"
                class="ms-2"
                @click="openProductDetailModal(product)"
              >
                <CIcon :icon="icons.cilMagnifyingGlass" />
              </CButton>
            </td>
          </tr>
          <tr v-if="paginatedProducts.length === 0">
            <td colspan="6" class="text-center">Không có sản phẩm nào để hiển thị.</td>
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
    <!-- Modal Sua thong tin chung san pham -->
    <CModal :visible="showEditProductModal" @close="showEditProductModal = false">
      <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
        <CModalTitle :style="{ color: '#FFFFFF' }">Sua thong tin chung</CModalTitle>
        <CButtonClose @click="showEditProductModal = false" :style="{ color: '#FFFFFF' }" />
      </CModalHeader>
      <CModalBody>
        <p>Nhap thong tin muon sua.</p>
        <CFormInput
          v-model="editingProductName"
          label="Ten San Pham"
          placeholder="Ten san pham"
          required
          class="mb-3 custom-input"
        />
        <CFormInput
          v-model="editingProductCode"
          label="Ma San Pham"
          placeholder="Ma san pham"
          class="mb-3 custom-input"
        />
        <CFormTextarea
          v-model="editingProductDescription"
          label="Mo Ta San Pham"
          placeholder="Mo ta san pham"
          class="mb-3 custom-input"
        ></CFormTextarea>
        <CFormInput
          v-model="editingProductCountry"
          label="Quoc Gia San Xuat"
          placeholder="Quoc gia san xuat"
          class="mb-3 custom-input"
        />
        <CFormSelect v-model="editingProductCategoryId" label="Danh Muc" class="mb-3 custom-input">
            <option value="">Chon danh muc</option>
            <option v-for="category in categoriesList" :key="category.id" :value="category.id">{{ category.tenDanhMuc }}</option>
        </CFormSelect>
        <CFormSelect v-model="editingProductBrandId" label="Thuong Hieu" class="mb-3 custom-input">
            <option value="">Chon thuong hieu</option>
            <option v-for="brand in brandsList" :key="brand.id" :value="brand.id">{{ brand.tenThuongHieu }}</option>
        </CFormSelect>
        <CFormSelect v-model="editingProductStatusId" label="Trang Thai" class="mb-3 custom-input">
            <option value="">Chon trang thai</option>
            <!-- Chỉ hiển thị các trạng thái mong muốn (ID 3, 4, 5) -->
            <option v-for="status in filteredStatusesList" :key="status.id" :value="status.id">
              {{ getDisplayStatusName(status.tenTrangThai) }}
            </option>
        </CFormSelect>
        <CFormInput
          v-model="editingProductImage"
          label="URL Anh Dai Dien"
          placeholder="URL anh dai dien (vi du: https://example.com/image.jpg)"
          class="mb-3 custom-input"
        />
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          @click="showEditProductModal = false"
          :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
        >
          Huy
        </CButton>
        <CButton
          color="primary"
          @click="saveEditedProduct"
          :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
        >
          Xac nhan
        </CButton>
      </CModalFooter>
    </CModal>

    <!-- Modal hiển thị chi tiết sản phẩm (và có thể sửa chi tiết) -->
    <CModal :visible="showProductDetailModal" @close="closeProductDetailModal" size="xl">
      <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
        <CModalTitle :style="{ color: '#FFFFFF' }">Chi Tiet San Pham: {{ selectedProduct?.name }}</CModalTitle>
        <CButtonClose @click="closeProductDetailModal" :style="{ color: '#FFFFFF' }" />
      </CModalHeader>
      <CModalBody>
        <div v-if="selectedProduct">
          <CRow class="mb-3">
            <CCol md="4" class="text-center">
              <img :src="selectedProduct.image" alt="Product Image" class="img-fluid rounded" style="max-width: 150px;" />
            </CCol>
            <CCol md="8">
              <h5>{{ selectedProduct.name }}</h5>
              <p><strong>Mô tả:</strong> {{ selectedProduct.description || 'Không có mô tả' }}</p>
              <p><strong>Trạng thái:</strong>
                <span
                  :style="{
                    backgroundColor:
                      selectedProduct.quantity === 0
                        ? '#FFA500'
                        : selectedProduct.status === 'dang_kinh_doanh'
                        ? '#000000'
                        : '#8B0000',
                    color: '#FFFFFF',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '0.25rem',
                  }"
                >
                  {{ getDisplayStatusText(selectedProduct) }}
                </span>
              </p>
            </CCol>
          </CRow>
          <hr/>
          <h6>Các biến thể sản phẩm:</h6>
          <div v-if="selectedProductDetails.length > 0">
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Mã CT SP</th>
                  <th>Màu sắc</th>
                  <th>Kích cỡ</th>
                  <th>Số lượng</th>
                  <th>Giá bán</th>
                  <th>Trạng thái</th>
                  <th>Ảnh</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detail in selectedProductDetails" :key="detail.id">
                  <td>{{ detail.maCtsp }}</td>
                  <td>{{ detail.color }}</td>
                  <td>{{ detail.size }}</td>
                  <td>{{ detail.quantity }}</td>
                  <td>{{ formatCurrency(detail.price) }}</td>
                  <td>
                    <span
                      :style="{
                        backgroundColor:
                          detail.quantity === 0
                            ? '#FFA500'
                            : detail.status === 'dang_kinh_doanh'
                            ? '#000000'
                            : '#8B0000',
                        color: '#FFFFFF',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '0.25rem',
                      }"
                    >
                      {{ getDisplayStatusText(detail) }}
                    </span>
                  </td>
                  <td>
                    <img :src="detail.image" alt="Variation Image" width="40" class="rounded"
                         onerror="this.onerror=null; this.src='https://placehold.co/40x40/cccccc/000000?text=No+Image';" />
                  </td>
                  <td>
                    <CButton
                      :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                      variant="outline"
                      size="sm"
                      @click="openEditProductDetailModal(detail)"
                      class="me-1"
                    >
                      <CIcon :icon="icons.cilPencil" />
                    </CButton>
                    <CButton
                      :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                      variant="outline"
                      size="sm"
                      @click="openImageManagementModal(detail)"
                    >
                      <CIcon :icon="icons.cilImage" />
                    </CButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-info">
            Sản phẩm này chưa có biến thể nào.
          </div>
        </div>
        <div v-else class="text-center">Đang tải chi tiết sản phẩm...</div>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          @click="closeProductDetailModal"
          :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
        >
          Dong
        </CButton>
      </CModalFooter>
    </CModal>

    <!-- Modal Sua chi tiet san pham (cho cac bien the) -->
    <CModal :visible="showEditProductDetailModal" @close="closeEditProductDetailModal">
      <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
        <CModalTitle :style="{ color: '#FFFFFF' }">Sua chi tiet san pham</CModalTitle>
        <CButtonClose @click="closeEditProductDetailModal" :style="{ color: '#FFFFFF' }" />
      </CModalHeader>
      <CModalBody>
        <p>Nhap thong tin muon sua (Hang, Loai giay, Mau sac, Chat lieu, Kich co, Gia, So luong, Trang thai).</p>
        <CFormInput v-model="editingProductDetail.name" label="Ten san pham" class="mb-3 custom-input" disabled />
        <CFormInput v-model="editingProductDetail.maCtsp" label="Ma chi tiet san pham" class="mb-3 custom-input" />
        <CFormTextarea v-model="editingProductDetail.moTaChiTiet" label="Mo ta chi tiet" class="mb-3 custom-input"></CFormTextarea>
        
        <CFormSelect v-model="editingProductDetail.brandId" label="Hang" class="mb-3 custom-input">
            <option value="">Chon hang</option>
            <option v-for="brand in brandsList" :key="brand.id" :value="brand.id">{{ brand.tenThuongHieu }}</option>
        </CFormSelect>
        <CFormSelect v-model="editingProductDetail.typeId" label="Loai giay" class="mb-3 custom-input">
            <option value="">Chon loai giay</option>
            <option v-for="category in categoriesList" :key="category.id" :value="category.id">{{ category.tenDanhMuc }}</option>
        </CFormSelect>
        <CFormSelect v-model="editingProductDetail.colorId" label="Mau sac" class="mb-3 custom-input">
            <option value="">Chon mau sac</option>
            <option v-for="color in colorsList" :key="color.id" :value="color.id">{{ color.tenMauSac }}</option>
        </CFormSelect>
        <CFormSelect v-model="editingProductDetail.materialId" label="Chat lieu" class="mb-3 custom-input">
            <option value="">Chon chat lieu</option>
            <option v-for="material in materialsList" :key="material.id" :value="material.id">{{ material.tenChatLieu }}</option>
        </CFormSelect>
        <CFormSelect v-model="editingProductDetail.sizeId" label="Kich co" class="mb-3 custom-input">
            <option value="">Chon kich co</option>
            <option v-for="size in sizesList" :key="size.id" :value="size.id">{{ size.tenKichCo }}</option>
        </CFormSelect>

        <CFormInput type="number" v-model="editingProductDetail.quantity" label="So luong" class="mb-3 custom-input" />
        <CFormInput type="number" v-model="editingProductDetail.price" label="Gia" class="mb-3 custom-input" />
        <CFormSelect v-model="editingProductDetail.statusId" label="Trang thai" class="mb-3 custom-input">
            <option value="">Chon trang thai</option>
            <!-- Chỉ hiển thị các trạng thái mong muốn (ID 3, 4, 5) -->
            <option v-for="status in filteredStatusesList" :key="status.id" :value="status.id">
              {{ getDisplayStatusName(status.tenTrangThai) }}
            </option>
        </CFormSelect>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeEditProductDetailModal" :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }">Huy</CButton>
        <CButton color="primary" @click="saveEditedProductDetail" :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }">Xac nhan</CButton>
      </CModalFooter>
    </CModal>

    <!-- Modal Quan Ly Anh San Pham Chi Tiet -->
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
        <div class="image-upload-preview border p-3 rounded mb-3" style="min-height: 200px;">
          <h5 class="mb-3">Anh da tai len:</h5>
          <div v-if="imagesListForModal.length === 0" class="text-muted">
            Chua co anh nao duoc tai len.
          </div>
          <div class="d-flex flex-wrap">
            <div
              v-for="image in imagesListForModal"
              :key="image.id"
              class="image-item me-3 mb-3 border rounded p-2"
              :class="{ 'image-selected': image.selected, 'image-representative': image.laAnhDaiDien }"
              @click="toggleImageSelectionInModal(image.id)"
              @mouseover="image.hover = true"
              @mouseleave="image.hover = false"
              style="width: 120px; height: 120px; position: relative; cursor: pointer; overflow: hidden;"
            >
              <img
                :src="image.url"
                alt="Uploaded Image"
                class="img-thumbnail"
                style="width: 100%; height: 100%; object-fit: cover"
              />

              <!-- Dimming overlay on hover or selected -->
              <div class="image-dimming-overlay" :class="{'active': image.selected || image.hover}"></div>

              <!-- Checkmark icon (always visible if selected, positioned on top) -->
              <div v-if="image.selected" class="image-checkmark-icon">
                <CIcon :icon="icons.cilCheckCircle" size="xl" class="text-success" />
              </div>

              <!-- Representative Radio Button -->
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
              <div class="image-actions-overlay" :class="{'active': image.hover}">
                <CButton
                  :style="{
                    backgroundColor: 'rgba(139, 0, 0, 0.7)',
                    borderColor: 'rgba(139, 0, 0, 0.7)',
                    color: '#FFFFFF',
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
          <span v-if="uploadingImages" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
import axios from 'axios'
import { useToast } from 'vue-toastification';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CFormTextarea, // Import CFormTextarea
  CButton,
  CInputGroup,
  CPagination,
  CPaginationItem
} from '@coreui/vue'

export default {
  components: {
    CIcon,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CRow,
    CCol,
    CFormInput,
    CFormSelect,
    CFormTextarea, // Register CFormTextarea
    CButton,
    CInputGroup,
    CPagination,
    CPaginationItem
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      icons: { ...icon }, // Spread all icons from @coreui/icons
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      pageSizes: [], // Added common page sizes
      products: [],
      totalPages: 1,
      
      // For editing main product info
      showEditProductModal: false,
      editingProductId: null,
      editingProductName: '',
      editingProductImage: '',
      editingProductDescription: '', // For main product description
      editingProductCode: '', // For main product code
      editingProductCountry: '', // For main product country
      editingProductCategoryId: null, // For main product category
      editingProductBrandId: null, // For main product brand
      editingProductStatusId: null, // For main product status

      baseUrl: 'http://localhost:8080',
      
      // Data for Product Detail Modal
      showProductDetailModal: false,
      selectedProduct: null,
      selectedProductDetails: [],

      // Data for Edit Product Detail Modal (for variations)
      showEditProductDetailModal: false,
      editingProductDetail: {},
      brandsList: [],
      categoriesList: [],
      colorsList: [],
      materialsList: [],
      sizesList: [],
      statusesList: [], // All available statuses for dropdowns

      // Data for Image Management Modal
      showImageManagementModal: false,
      currentProductDetailIdForImages: null, // ID of the product detail being managed
      imagesListForModal: [], // List of images in the modal (old and new)
      newImageUrlInput: '', // Input for new image URL
      originalImagesOfCurrentProductDetail: [], // To compare when saving and determine images to delete
      selectedRepresentativeImageId: null, // ID of the image chosen as representative in the modal
      uploadingImages: false, // Flag to manage image upload state
    }
  },
  computed: {
    paginatedProducts() {
      // Return the deduplicated product list
      return this.products;
    },
    filteredStatusesList() {
      // Return only statuses with IDs 3, 4, 5
      return this.statusesList.filter(status => [3, 4, 5].includes(status.id));
    }
  },
  created() {
    this.loadInitialData(); // Load all necessary data on creation
  },
  methods: {
    // Helper function to determine the correct image URL
    getImageUrl(url) {
      if (!url) {
        return 'https://placehold.co/50x50/cccccc/000000?text=No+Image';
      }
      // If it's already an absolute URL (http/https), return as is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // If it's a Base64 string, return as is
      if (url.startsWith('data:image/')) {
        return url;
      }
      // Otherwise, assume it's a relative path and prepend baseUrl
      return this.baseUrl + url;
    },

    // Loads initial data for products and all dropdowns
    async loadInitialData() {
        try {
            const [
                productsRes,
                categoriesRes,
                brandsRes,
                materialsRes,
                colorsRes,
                sizesRes,
                statusesRes,
            ] = await Promise.all([
                axios.get(`${this.baseUrl}/api/san-phams`, { params: { page: 0, size: this.pageSize } }),
                axios.get(`${this.baseUrl}/api/danh-mucs`),
                axios.get(`${this.baseUrl}/api/thuongHieus`),
                axios.get(`${this.baseUrl}/api/chatLieus`),
                axios.get(`${this.baseUrl}/api/mauSacs`),
                axios.get(`${this.baseUrl}/api/kichCos`),
                axios.get(`${this.baseUrl}/api/trangThais`),
            ]);

            this.categoriesList = categoriesRes.data;
            this.brandsList = brandsRes.data;
            this.materialsList = materialsRes.data;
            this.colorsList = colorsRes.data;
            this.sizesList = sizesRes.data;
            this.statusesList = statusesRes.data; // All statuses are loaded here, then filtered by computed property

            this.processProductsResponse(productsRes.data);
            this.toast.success('Đã tải dữ liệu ban đầu thành công!');
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu ban đầu:', error);
            this.toast.error('Không thể tải dữ liệu ban đầu. Vui lòng thử lại.');
        }
    },

    // Processes the response from the product API to map and deduplicate
    processProductsResponse(data) {
        const { content, page: pageData } = data;
        if (!content || !Array.isArray(content)) {
            throw new Error('Dữ liệu từ API không hợp lệ');
        }

        let fetchedProducts = content.map((product) => {
            console.log(`[processProductsResponse] Product ID ${product.id}: urlAnhDaiDien='${product.urlAnhDaiDien}'`); // Debugging line
            return {
                id: product.id,
                image: this.getImageUrl(product.urlAnhDaiDien), // Use the new helper function
                name: product.tenSanPham,
                quantity: Math.round(product.soLuongTonKho),
                // Determine status based on quantity first, then backend status
                status: product.soLuongTonKho === 0 ? 'het_hang' : product.tenTrangThai,
                statusId: product.soLuongTonKho === 0 ? 5 : product.idTrangThai, // ID 5 for 'het_hang'
                description: product.moTaSanPham,
                code: product.maSanPham,
                country: product.quocGiaSanXuat,
                categoryId: product.idDanhMuc,
                brandId: product.idThuongHieu,
            };
        });

        const uniqueProductsMap = new Map();
        fetchedProducts.forEach(product => {
            const normalizedName = product.name.toLowerCase();
            if (!uniqueProductsMap.has(normalizedName)) {
                uniqueProductsMap.set(normalizedName, product);
            }
        });
        this.products = Array.from(uniqueProductsMap.values());
        this.totalPages = pageData.totalPages;

        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
            this.loadProducts(this.currentPage - 1);
        }
    },

    // Formats a number as Vietnamese currency
    formatCurrency(value) {
      if (value == null) return '';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    // Handles page size change event
    onPageSizeChange() {
      this.currentPage = 1
      this.loadProducts(0)
    },
    // Loads product data from the backend API
    async loadProducts(page = 0) {
      try {
        const response = await axios.get(`${this.baseUrl}/api/san-phams`, {
          params: { page, size: this.pageSize },
        })
        this.processProductsResponse(response.data);
      } catch (error) {
        this.products = []
        this.totalPages = 0
        this.toast.error(
          'Loi khi tai du lieu san pham ' + (error.response?.data?.message || error.message),
        )
        console.error(
          'Error loading products',
          error.response?.status,
          error.response?.data || error.message,
        )
      }
    },
    // Searches for products based on the search query
    async searchProducts() {
      try {
        const response = await axios.get(`${this.baseUrl}/api/san-phams/search`, {
          params: { page: 0, size: this.pageSize, keyword: this.searchQuery.trim() },
        })
        this.processProductsResponse(response.data);
        this.toast.info(`Da tim thay ${this.products.length} san pham phu hop.`)
      } catch (error) {
        this.products = []
        this.totalPages = 0
        this.toast.error(
          'Loi khi tim kiem san pham ' + (error.response?.data?.message || error.message),
        )
        console.error(
          'Error searching products',
          error.response?.status,
          error.response?.data || error.message,
        )
      }
    },
    // Toggles the status of a product between 'dang_kinh_doanh' and 'ngung_kinh_doanh'
    async toggleStatus(productId, event) {
      const isChecked = event.target.checked;
      let newStatusBackendName; // Use backend name for clarity
      const product = this.products.find((p) => p.id === productId);

      if (!product) {
        this.toast.error('Không tìm thấy sản phẩm để cập nhật trạng thái.');
        event.target.checked = !isChecked;
        return;
      }

      if (isChecked && product.quantity === 0) {
        this.toast.warn('Sản phẩm hết hàng không thể chuyển trạng thái kinh doanh.');
        event.target.checked = !isChecked;
        return;
      }

      if (isChecked) {
        newStatusBackendName = 'dang_kinh_doanh';
      } else {
        newStatusBackendName = 'ngung_kinh_doanh';
      }

      try {
        const statusObject = this.statusesList.find(s => s.tenTrangThai === newStatusBackendName);
        if (!statusObject) {
            this.toast.error('Trạng thái không hợp lệ. Vui lòng kiểm tra lại.');
            event.target.checked = !isChecked;
            return;
        }

        await axios.put(`${this.baseUrl}/api/san-phams/${productId}/status`, {
          trangThai: statusObject.tenTrangThai // Send the ID of the status
        });

        this.toast.success(
          `Sản phẩm ${product.name} đã được chuyển sang trạng thái ${
            this.getDisplayStatusName(newStatusBackendName)
          }.`
        );
        await this.loadProducts(this.currentPage - 1); // Reload to reflect changes
      } catch (error) {
        this.toast.error(
          'Lỗi khi cập nhật trạng thái sản phẩm: ' +
          (error.response?.data?.message || error.message)
        );
        console.error(
          'Error updating product status:',
          error.response?.status,
          error.response?.data || error.message,
        )
        event.target.checked = !isChecked;
      }
    },
    // Handles soft deletion of a product (sets its status to 'ngung_kinh_doanh')
    async deleteProduct(id) {
      if (confirm(`Bạn có chắc muốn xóa mềm sản phẩm này không?`)) {
        try {
          const response = await axios.delete(`${this.baseUrl}/api/san-phams/${id}`);
          if (response.status === 204) {
              this.loadProducts(this.currentPage - 1);
              this.toast.success(`Sản phẩm đã được chuyển sang trạng thái ngừng kinh doanh.`);
          }
        } catch (error) {
            let errorMessage = 'Không thể xóa sản phẩm do lỗi kết nối!';
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = error.response.data.message || 'Yêu cầu không hợp lệ';
                        if (error.response.data.details) {
                            errorMessage += ` ${error.response.data.details}`;
                        }
                        break;
                    case 404:
                        errorMessage = 'Lỗi: Sản phẩm không tồn tại.';
                        break;
                    case 500:
                        errorMessage = 'Lỗi server: Vui lòng thử lại sau.';
                        break;
                    default:
                        errorMessage = `Lỗi không xác định: ${error.response.status}`;
                }
            }
            this.toast.error(errorMessage);
            console.error('Lỗi xóa sản phẩm', error.response?.data || error.message);
        }
      }
    },
    // Opens the modal for editing main product info
    openEditProductModal(product) {
      this.editingProductId = product.id;
      this.editingProductName = product.name;
      this.editingProductImage = product.image; // Keep the full URL/Base64 for editing
      this.editingProductDescription = product.description;
      this.editingProductCode = product.code;
      this.editingProductCountry = product.country;
      this.editingProductCategoryId = product.categoryId;
      this.editingProductBrandId = product.brandId;
      this.editingProductStatusId = product.statusId;
      this.showEditProductModal = true;
    },
    // Saves the edited main product info
async saveEditedProduct() {
  // --- Validation checks ---
  if (!this.editingProductName.trim()) {
    this.toast.error('Tên sản phẩm không được để trống!');
    return;
  }
  if (!this.editingProductCode.trim()) {
    this.toast.error('Mã sản phẩm không được để trống!');
    return;
  }
  // This check ensures all required IDs have a truthy value (not null, 0, or empty)
  if (!this.editingProductCategoryId || !this.editingProductBrandId || !this.editingProductStatusId) {
    this.toast.error('Vui lòng chọn đầy đủ Danh mục, Thương hiệu và Trạng thái!');
    return;
  }

  try {
    // Construct the product object with keys that match the backend API's expectations.
    const updatedProduct = {
      tenSanPham: this.editingProductName.trim(),
      maSanPham: this.editingProductCode.trim(),
      moTaSanPham: this.editingProductDescription.trim(),
      // Send the image URL directly as the backend expects it.
      urlAnhDaiDien: this.editingProductImage.trim(),
      quocGiaSanXuat: this.editingProductCountry.trim(),
      // Corrected keys to match Postman payload
      danhMucId: this.editingProductCategoryId,
      thuongHieuId: this.editingProductBrandId,
      trangThaiId: this.editingProductStatusId,
    };

    // Make the PUT request to update the product
    await axios.put(`${this.baseUrl}/api/san-phams/${this.editingProductId}`, updatedProduct);

    // --- Success handling ---
    this.showEditProductModal = false;
    this.toast.success('Cập nhật sản phẩm thành công!');
    this.refreshList(); // Reload the product list to show the updated data
  } catch (error) {
    // --- Error handling ---
    this.toast.error('Lỗi khi cập nhật sản phẩm: ' + (error.response?.data?.message || error.message));
    console.error(
      'Error updating product',
      error.response?.status,
      error.response?.data || error.message,
    );
  }
},

    // Navigates to the product detail page (if applicable, currently pushes to 'San Pham Chi Tiet')
    viewDetails() {
      this.$router.push({ name: 'San Pham Chi Tiet' })
    },
    // Refreshes the product list
    refreshList() {
      this.searchQuery = ''
      this.currentPage = 1
      this.loadProducts()
      this.toast.info('Danh sach san pham da duoc lam moi.')
    },
    // Changes the current page of the product list
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.loadProducts(page - 1)
      } else if (page < 1) {
        this.currentPage = 1
        this.loadProducts(0)
      } else if (page > this.totalPages) {
        this.currentPage = this.totalPages
        this.loadProducts(this.totalPages - 1)
      }
    },
    // Opens the product detail modal and fetches its details
    async openProductDetailModal(product) {
      this.selectedProduct = product;
      this.selectedProductDetails = []; // Reset product details
      this.showProductDetailModal = true;

      try {
        const response = await axios.get(`${this.baseUrl}/api/chi-tiet-san-phams/by-san-pham/${product.id}`);
        this.selectedProductDetails = response.data.map(detail => {
          let imageUrl = 'https://placehold.co/40x40/cccccc/000000?text=No+Image';
          if (detail.images && Array.isArray(detail.images) && detail.images.length > 0) {
            const representative = detail.images.find(img => img.laAnhDaiDien);
            if (representative && representative.urlAnh && typeof representative.urlAnh === 'string' && representative.urlAnh.trim() !== '') {
              imageUrl = this.getImageUrl(representative.urlAnh); // Use helper for detail image
            } else if (detail.images[0] && detail.images[0].urlAnh && typeof detail.images[0].urlAnh === 'string' && detail.images[0].urlAnh.trim() !== '') {
              imageUrl = this.getImageUrl(detail.images[0].urlAnh); // Use helper for detail image
            }
          }

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
            // Determine status based on quantity first, then backend status
            status: detail.soLuongTonKho === 0 ? 'het_hang' : detail.tenTrangThaiRieng,
            statusId: detail.soLuongTonKho === 0 ? 5 : detail.idTrangThaiRieng, // ID 5 for 'het_hang'
            moTaChiTiet: detail.moTaChiTiet,
            maCtsp: detail.maCtsp,
            images: detail.images ? detail.images.map(img => ({
                id: img.id,
                url: this.getImageUrl(img.urlAnh), // Use helper for image management modal
                laAnhDaiDien: img.laAnhDaiDien,
                isNew: false,
                file: null,
                selected: true,
                hover: false,
                originalLaAnhDaiDien: img.laAnhDaiDien,
            })) : [],
          };
        });
        this.toast.success(`Đã tải chi tiết cho sản phẩm ${product.name}.`);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error.response?.data || error.message);
        this.toast.error('Không thể tải chi tiết sản phẩm. Vui lòng thử lại.');
        this.selectedProductDetails = [];
      }
    },
    closeProductDetailModal() {
      this.showProductDetailModal = false;
      this.selectedProduct = null;
      this.selectedProductDetails = [];
    },
    // Helper to get Vietnamese status text
    getDisplayStatusText(item) {
      if (item.quantity === 0) {
        return 'Het hang';
      } else if (item.status === 'dang_kinh_doanh') {
        return 'Dang ban';
      } else if (item.status === 'ngung_kinh_doanh') {
        return 'Ngung ban';
      }
      return item.status; // Fallback
    },
    getDisplayStatusName(backendStatusName) {
      // Helper to display Vietnamese names for backend status strings
      switch (backendStatusName) {
        case 'dang_kinh_doanh': return 'Đang bán';
        case 'het_hang': return 'Hết hàng';
        case 'ngung_kinh_doanh': return 'Ngừng bán';
        default: return backendStatusName;
      }
    },

    // Opens the modal for editing product detail (for variations)
    openEditProductDetailModal(detail) {
      this.editingProductDetail = { ...detail };
      this.showEditProductDetailModal = true;
    },
    closeEditProductDetailModal() {
      this.showEditProductDetailModal = false;
      this.editingProductDetail = {};
    },
    // Saves the edited product detail (for variations)
    async saveEditedProductDetail() {
      if (this.editingProductDetail.quantity < 0 || this.editingProductDetail.price < 0) {
        this.toast.error('So luong va gia phai lon hon hoac bang 0.');
        return;
      }
      if (!this.editingProductDetail.brandId || !this.editingProductDetail.typeId ||
          !this.editingProductDetail.colorId || !this.editingProductDetail.materialId ||
          !this.editingProductDetail.sizeId) { // Removed statusId validation here as it's handled by quantity
        this.toast.error('Vui long chon day du thong tin chi tiet (Hang, Loai giay, Mau sac, Chat lieu, Kich co).');
        return;
      }

      try {
        let finalStatusId = this.editingProductDetail.statusId;
        // If quantity is 0, force status to 'het_hang' (ID 5)
        if (parseInt(this.editingProductDetail.quantity, 10) === 0) {
          finalStatusId = 5; // ID for 'het_hang'
        } else if (finalStatusId === 5) { // If quantity > 0 but status is 'het_hang', default to 'dang_kinh_doanh' (ID 3)
          finalStatusId = 3; // ID for 'dang_kinh_doanh'
        }

        const updatedDetailData = {
          soLuongTonKho: parseInt(this.editingProductDetail.quantity, 10),
          moTaChiTiet: this.editingProductDetail.moTaChiTiet || "",
          giaNhap: parseFloat(this.editingProductDetail.price),
          giaBan: parseFloat(this.editingProductDetail.price),
          idTrangThaiRieng: finalStatusId, // Use the determined final status ID
          chatLieu: Number(this.editingProductDetail.materialId),
          mauSac: Number(this.editingProductDetail.colorId),
          kichCo: Number(this.editingProductDetail.sizeId),
          sanPham: Number(this.editingProductDetail.productId),
          maCtsp: this.editingProductDetail.maCtsp
        };

        await axios.put(`${this.baseUrl}/api/chi-tiet-san-phams/${this.editingProductDetail.id}`, updatedDetailData);
        this.toast.success('Cap nhat chi tiet san pham thanh cong!');
        this.closeEditProductDetailModal();
        // Reload product details in the main detail modal if it's open
        if (this.selectedProduct && this.selectedProduct.id === this.editingProductDetail.productId) {
            await this.openProductDetailModal(this.selectedProduct);
        }
        this.loadProducts(); // Reload main product list to update total stock quantity
      } catch (error) {
        let errorMessage = 'Không thể cập nhật chi tiết sản phẩm. Vui lòng thử lại.';
        if (error.response) {
            console.error('Lỗi khi cập nhật chi tiết sản phẩm:', error.response.status, error.response.data);
            if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
                if (error.response.data.details) {
                    errorMessage += `: ${error.response.data.details}`;
                }
            } else {
                errorMessage = `Lỗi server: ${error.response.status}`;
            }
        } else {
            console.error('Lỗi mạng hoặc không có phản hồi:', error.message);
        }
        this.toast.error(errorMessage);
      }
    },

    // Image Management Modal Methods
    async openImageManagementModal(productDetail) {
      this.showImageManagementModal = true;
      this.currentProductDetailIdForImages = productDetail.id;
      this.newImageUrlInput = '';

      try {
        const response = await axios.get(`${this.baseUrl}/api/anhSanPhams/by-chi-tiet-san-pham/${productDetail.id}`);
        this.imagesListForModal = response.data.map(img => ({
          id: img.id,
          url: this.getImageUrl(img.urlAnh), // Use helper function here too
          laAnhDaiDien: img.laAnhDaiDien,
          isNew: false,
          file: null,
          selected: true,
          hover: false,
          originalLaAnhDaiDien: img.laAnhDaiDien,
        }));

        this.originalImagesOfCurrentProductDetail = JSON.parse(JSON.stringify(this.imagesListForModal));
        
        const representative = this.imagesListForModal.find(img => img.laAnhDaiDien);
        this.selectedRepresentativeImageId = representative ? representative.id : null;

        this.toast.success('Đã tải ảnh cho chi tiết sản phẩm.');
      } catch (error) {
        console.error('Lỗi khi tải ảnh cho chi tiết sản phẩm:', error.response ? error.response.data : error.message);
        this.toast.error('Không thể tải ảnh cho chi tiết sản phẩm. Vui lòng thử lại.');
        this.imagesListForModal = [];
        this.originalImagesOfCurrentProductDetail = [];
        this.selectedRepresentativeImageId = null;
      }

      this.$nextTick(() => {
        if (this.$refs.imageFileInput) {
          this.$refs.imageFileInput.value = '';
        }
      });
    },

    closeImageManagementModal() {
      this.showImageManagementModal = false;
      this.currentProductDetailIdForImages = null;
      this.imagesListForModal = [];
      this.newImageUrlInput = '';
      this.originalImagesOfCurrentProductDetail = [];
      this.selectedRepresentativeImageId = null;
    },

    handleImageFileUpload(event) {
      const files = event.target.files;
      if (files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            url: e.target.result, // Base64 string from FileReader
            file: file,
            laAnhDaiDien: false,
            isNew: true,
            selected: true,
            hover: false,
          };
          this.imagesListForModal.push(newImage);
        };
        reader.readAsDataURL(file);
      }
      this.toast.success(`Đã tải lên ${files.length} ảnh để xem trước.`);
    },

    addImageUrlToModal() {
      if (!this.newImageUrlInput) {
        this.toast.error('Vui lòng nhập URL ảnh.');
        return;
      }
      // // Basic URL validation
      // if (!/^https?:\/\/.+\.(jpg|png|gif|jpeg)$/i.test(this.newImageUrlInput)) {
      //   this.toast.error('URL ảnh không hợp lệ. Chỉ chấp nhận .jpg, .png, .gif, .jpeg.');
      //   return;
      // }
      if (this.imagesListForModal.some((img) => img.url === this.newImageUrlInput)) {
        this.toast.warning('Ảnh này đã tồn tại trong danh sách.');
        return;
      }

      const newImage = {
        id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        url: this.newImageUrlInput,
        file: null,
        laAnhDaiDien: false,
        isNew: true,
        selected: true,
        hover: false,
      };
      this.imagesListForModal.push(newImage);
      this.newImageUrlInput = '';
      this.toast.success('Đã thêm ảnh từ URL.');
    },

    deleteImageFromModal(imageId) {
      if (confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
        this.imagesListForModal = this.imagesListForModal.filter((img) => img.id !== imageId);
        if (this.selectedRepresentativeImageId === imageId) {
          this.selectedRepresentativeImageId = null;
        }
        this.toast.success('Đã xóa ảnh khỏi danh sách.');
      }
    },

    toggleImageSelectionInModal(imageId) {
      const image = this.imagesListForModal.find((img) => img.id === imageId);
      if (image) {
        image.selected = !image.selected;
        if (!image.selected && this.selectedRepresentativeImageId === imageId) {
          this.selectedRepresentativeImageId = null;
        }
      }
    },

    toggleRepresentativeImage(imageId) {
        const clickedImage = this.imagesListForModal.find(img => img.id === imageId);
        if (!clickedImage) return;

        if (clickedImage.laAnhDaiDien) {
            clickedImage.laAnhDaiDien = false;
            this.selectedRepresentativeImageId = null;
            this.toast.info('Đã bỏ đặt ảnh đại diện cho chi tiết sản phẩm.');
        } else {
            this.imagesListForModal.forEach(img => {
                img.laAnhDaiDien = false;
            });
            clickedImage.laAnhDaiDien = true;
            this.selectedRepresentativeImageId = imageId;
            this.toast.info('Đã đặt ảnh đại diện cho chi tiết sản phẩm.');
        }
    },

    async saveImagesForProductDetail() {
      this.uploadingImages = true;
      try {
        const currentDetailId = this.currentProductDetailIdForImages;
        if (!currentDetailId) {
          this.toast.error('Không có ID chi tiết sản phẩm để lưu ảnh.');
          return;
        }

        const promises = [];

        // 1. Delete removed images
        const imagesToDelete = this.originalImagesOfCurrentProductDetail.filter(
          (originalImg) => !this.imagesListForModal.some((currentImg) => currentImg.id === originalImg.id)
        );
        for (const imgToDelete of imagesToDelete) {
          if (!imgToDelete.isNew) { // Only delete if it's an existing image from DB
            promises.push(axios.delete(`${this.baseUrl}/api/anhSanPhams/${imgToDelete.id}`));
          }
        }

        // 2. Process images to upload/add URL/update
        for (const image of this.imagesListForModal) {
          if (image.isNew) {
            if (image.file) {
              const formData = new FormData();
              formData.append('file', image.file);
              const anhSanPhamDtoJson = JSON.stringify({
                chiTietSpId: currentDetailId,
                laAnhDaiDien: image.laAnhDaiDien,
              });
              formData.append('data', anhSanPhamDtoJson);
              promises.push(axios.post(`${this.baseUrl}/api/anhSanPhams/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              }));
            } else if (image.url) {
              // For URL images, ensure we send only the relative path if it's from our baseUrl,
              // or the full external URL if it's not.
              let urlForBackend = image.url;
              if (urlForBackend.startsWith(this.baseUrl) && !urlForBackend.startsWith('http://') && !urlForBackend.startsWith('https://')) {
                  urlForBackend = urlForBackend.replace(this.baseUrl, '');
              }
              const anhSanPhamDto = {
                chiTietSpId: currentDetailId,
                urlAnh: urlForBackend,
                laAnhDaiDien: image.laAnhDaiDien,
              };
              promises.push(axios.post(`${this.baseUrl}/api/anhSanPhams/add-url`, anhSanPhamDto, {
                headers: { 'Content-Type': 'application/json' },
              }));
            }
          } else {
            // Existing image - check if 'laAnhDaiDien' status changed
            const originalImage = this.originalImagesOfCurrentProductDetail.find(
                (origImg) => origImg.id === image.id
            );
            if (originalImage && originalImage.laAnhDaiDien !== image.laAnhDaiDien) {
                // For existing images, ensure we send only the relative path if it's from our baseUrl,
                // or the full external URL if it's not.
                let urlForBackend = image.url;
                if (urlForBackend.startsWith(this.baseUrl) && !urlForBackend.startsWith('http://') && !urlForBackend.startsWith('https://')) {
                    urlForBackend = urlForBackend.replace(this.baseUrl, '');
                }
                const anhSanPhamDto = {
                    chiTietSpId: currentDetailId,
                    urlAnh: urlForBackend,
                    laAnhDaiDien: image.laAnhDaiDien,
                };
                promises.push(axios.put(`${this.baseUrl}/api/anhSanPhams/${image.id}`, anhSanPhamDto, {
                    headers: { 'Content-Type': 'application/json' },
                }));
            }
          }
        }

        await Promise.all(promises);
        this.toast.success('Đã lưu tất cả ảnh thành công!');
        this.closeImageManagementModal();
        // Reload product details in the main detail modal if it's open
        if (this.selectedProduct && this.selectedProduct.id === this.currentProductDetailIdForImages) {
            await this.openProductDetailModal(this.selectedProduct);
        }
        this.loadProducts(); // Reload main product list to update main image if changed
      } catch (error) {
        console.error('Lỗi khi lưu ảnh:', error.response ? error.response.data : error.message);
        this.toast.error('Không thể lưu ảnh. Vui lòng thử lại.');
      } finally {
        this.uploadingImages = false;
      }
    },
  },
}
</script>

<style scoped>
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

.custom-input.form-control:focus {
  border-color: #ced4da !important;
  box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25) !important;
}

@media (max-width: 768px) {
  .custom-table td.status-cell {
    min-width: 100px;
  }
  .custom-table td.action-cell {
    min-width: 180px;
  }
}

/* Styles for Image Management Modal */
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
  border: 2px solid #000000 !important;
}

.image-item.image-representative {
    box-shadow: 0 0 0 3px #28a745;
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
  pointer-events: none;
}

.image-dimming-overlay.active {
  opacity: 1;
}

.image-checkmark-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #28a745;
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
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.75rem;
    gap: 2px;
}

.image-radio-item input[type="radio"] {
    margin-right: 3px;
    width: 12px;
    height: 12px;
}
.image-radio-item label {
    margin-bottom: 0;
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