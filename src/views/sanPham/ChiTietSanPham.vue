<template>
  <div class="chi-tiet-san-pham-container">
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" :show-page-info="true" :page-title="pageTitle"
      :page-description="pageDescription" page-icon="solar:widget-4-bold-duotone"
      :page-stats="pageStats" :actions="breadcrumbActions" />

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <iconify-icon icon="solar:filter-bold-duotone"></iconify-icon>
          Bộ Lọc Chi Tiết Sản Phẩm
        </h3>
        <button class="reset-filter-btn" @click="resetFilters">
          Đặt lại bộ lọc
        </button>
      </div>
      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Tìm kiếm</label>
            <input type="text" v-model="filters.search" class="filter-input"
              placeholder="Tìm theo tên, mã sản phẩm..." />
          </div>
          <div class="filter-group">
            <label class="filter-label">Kích cỡ</label>
            <select v-model="filters.size" class="filter-select">
              <option value="">Tất cả kích cỡ</option>
              <option v-for="size in sizes" :key="size.id" :value="size.id">
                {{ size.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Màu sắc</label>
            <select v-model="filters.color" class="filter-select">
              <option value="">Tất cả màu sắc</option>
              <option v-for="color in colors" :key="color.id" :value="color.id">
                {{ color.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Chất liệu</label>
            <select v-model="filters.material" class="filter-select">
              <option value="">Tất cả chất liệu</option>
              <option v-for="material in materials" :key="material.id" :value="material.id">
                {{ material.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Đế giày</label>
            <select v-model="filters.sole" class="filter-select">
              <option value="">Tất cả đế giày</option>
              <option v-for="sole in soles" :key="sole.id" :value="sole.id">
                {{ sole.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Thương hiệu</label>
            <select v-model="filters.brand" class="filter-select">
              <option value="">Tất cả thương hiệu</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <select v-model="filters.status" class="filter-select">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
          </div>
          <div class="filter-group price-filter-group">
            <label class="filter-label">Khoảng giá</label>
            <div class="price-inputs">
              <div class="price-input-wrapper">
                <label class="price-sub-label">Từ</label>
                <input type="number" v-model="filters.priceFrom" class="filter-input" placeholder="0" />
              </div>
              <div class="price-input-wrapper">
                <label class="price-sub-label">Đến</label>
                <input type="number" v-model="filters.priceTo" class="filter-input" placeholder="10,000,000" />
              </div>
            </div>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Sắp xếp theo</label>
            <select v-model="filters.sortBy" class="filter-select">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="stock_asc">Tồn kho tăng dần</option>
              <option value="stock_desc">Tồn kho giảm dần</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Product Details DataTable -->
      <div class="products-section">
        <div class="section-header">
          <h3 class="section-title">
            <iconify-icon icon="solar:widget-4-bold-duotone"></iconify-icon>
            Chi Tiết Sản Phẩm ({{ totalElements }})
          </h3>
        </div>

        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button @click="loadAllData" class="btn primary">Thử lại</button>
        </div>
        
        <DataTable
          v-else
          :data="productDetails"
          :columns="columns"
          :actions="['edit', 'delete']"
          @action="handleAction"
        >
          <!-- Checkbox Header -->
          <template #header-checkbox>
            <input 
              type="checkbox" 
              :checked="selectAll"
              @change="toggleSelectAll"
              class="checkbox-input"
              title="Chọn tất cả"
            />
          </template>

          <!-- Checkbox Column -->
          <template #checkbox="{ item }">
            <input 
              type="checkbox" 
              :checked="selectedItems.includes(item.id)"
              @change="toggleItemSelection(item.id)"
              class="checkbox-input"
            />
          </template>

          <!-- STT Column -->
          <template #stt="{ index }">
            <span class="stt">{{ index + 1 }}</span>
          </template>

          <!-- Image Column -->
          <template #image="{ item }">
            <div class="table-product-image">
              <img :src="item.idSanPham?.urlAnhDaiDien || '/default-product.jpg'" :alt="item.idSanPham?.tenSanPham || 'Product'" />
            </div>
          </template>

          <!-- Product Info Column -->
          <template #productInfo="{ item }">
            <div class="table-product-info">
              <span class="table-product-name">{{ item.idSanPham?.tenSanPham || 'N/A' }}</span>
              <span class="table-product-code">{{ item.ma || 'N/A' }}</span>
            </div>
          </template>

          <!-- Variant Attributes Column -->
          <template #variantAttributes="{ item }">
            <div class="variant-attributes-info">
              <div class="attribute-item">
                <span class="attr-label">Size:</span>
                <span class="attr-value size-badge">{{ item.idKichCo?.tenKichCo || 'N/A' }}</span>
              </div>
              <div class="attribute-item">
                <span class="attr-label">Màu:</span>
                <span class="color-badge" :style="{ backgroundColor: item.idMauSac?.hex || '#CCCCCC' }" :title="item.idMauSac?.tenMauSac || 'N/A'"></span>
              </div>
            </div>
          </template>

          <!-- Material & Sole Column - Only if different from common -->
          <template #materialSole="{ item }">
            <div class="material-sole-info">
              <div class="info-item" v-if="item.idChatLieu">
                <span class="info-label">Chất liệu:</span>
                <span class="info-value material-badge">{{ item.idChatLieu?.tenChatLieu || 'N/A' }}</span>
              </div>
              <div class="info-item" v-if="!item.idChatLieu">
                <span class="info-value common-indicator">Chưa có thông tin</span>
              </div>
            </div>
          </template>

          <!-- Price Column -->
          <template #price="{ item }">
            <span class="price">{{ formatCurrency(item.giaBan) }}</span>
          </template>

          <!-- Stock Column -->
          <template #stock="{ item }">
            <span class="stock" :class="getStockClass(item.soLuongTonKho)">{{ item.soLuongTonKho || 0 }}</span>
          </template>

          <!-- Status Column -->
          <template #status="{ item }">
            <span class="status-badge" :class="getStatusClass(item.soLuongTonKho)">
              {{ getStatusLabel(item.soLuongTonKho) }}
            </span>
          </template>

          <!-- Actions Column -->
          <template #actions="{ item }">
            <div class="actions">
              <button @click="editVariant(item)" class="action-btn edit" title="Chỉnh sửa">
                <iconify-icon icon="solar:pen-bold"></iconify-icon>
              </button>
              <button @click="downloadQRCode(item)" class="action-btn qr" title="Tải mã QR sản phẩm">
                <iconify-icon icon="solar:qr-code-bold"></iconify-icon>
              </button>
            </div>
          </template>
        </DataTable>
        
        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="pagination-container">
          <div class="pagination-info">
            <span>Hiển thị {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalElements) }} của {{ totalElements }} kết quả</span>
          </div>
          <div class="pagination-controls">
            <button @click="goToFirstPage" :disabled="currentPage === 0" class="pagination-btn">
              <iconify-icon icon="solar:double-alt-arrow-left-bold"></iconify-icon>
            </button>
            <button @click="prevPage" :disabled="currentPage === 0" class="pagination-btn">
              <iconify-icon icon="solar:alt-arrow-left-bold"></iconify-icon>
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in getVisiblePages()" 
                :key="page"
                @click="changePage(page)"
                :class="['page-btn', { active: page === currentPage }]"
              >
                {{ page + 1 }}
              </button>
            </div>
            
            <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="pagination-btn">
              <iconify-icon icon="solar:alt-arrow-right-bold"></iconify-icon>
            </button>
            <button @click="goToLastPage" :disabled="currentPage >= totalPages - 1" class="pagination-btn">
              <iconify-icon icon="solar:double-alt-arrow-right-bold"></iconify-icon>
            </button>
          </div>
          <div class="page-size-selector">
            <label>Hiển thị:</label>
            <select v-model="pageSize" @change="changePageSize(pageSize)" class="page-size-select">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <span>/ trang</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Detail Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeProductDetailForm">
      <div class="modal-container large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:widget-4-bold-duotone"></iconify-icon>
            {{ showAddModal ? 'Thêm Chi Tiết Sản Phẩm' : 'Chỉnh Sửa Chi Tiết Sản Phẩm' }}
          </h3>
          <button class="modal-close" @click="closeProductDetailForm">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <form @submit.prevent="saveProductDetail" class="product-detail-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Sản phẩm gốc</label>
                <select v-model="productDetailForm.productId" class="form-input" required>
                  <option value="">Chọn sản phẩm</option>
                  <option v-for="product in baseProducts" :key="product.id" :value="product.id">
                    {{ product.name }} ({{ product.code }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Kích cỡ</label>
                <select v-model="productDetailForm.sizeId" class="form-input" required>
                  <option value="">Chọn kích cỡ</option>
                  <option v-for="size in sizes" :key="size.id" :value="size.id">
                    {{ size.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Màu sắc</label>
                <select v-model="productDetailForm.colorId" class="form-input" required>
                  <option value="">Chọn màu sắc</option>
                  <option v-for="color in colors" :key="color.id" :value="color.id">
                    {{ color.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Chất liệu</label>
                <select v-model="productDetailForm.materialId" class="form-input" required>
                  <option value="">Chọn chất liệu</option>
                  <option v-for="material in materials" :key="material.id" :value="material.id">
                    {{ material.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Đế giày</label>
                <select v-model="productDetailForm.soleId" class="form-input" required>
                  <option value="">Chọn đế giày</option>
                  <option v-for="sole in soles" :key="sole.id" :value="sole.id">
                    {{ sole.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Giá bán</label>
                <input type="number" v-model="productDetailForm.price" class="form-input" 
                  placeholder="Nhập giá bán" min="0" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Số lượng tồn kho</label>
                <input type="number" v-model="productDetailForm.stock" class="form-input" 
                  placeholder="Nhập số lượng" min="0" required />
              </div>
              <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select v-model="productDetailForm.status" class="form-input">
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
            </div>
            <div class="form-group full-width">
              <label class="form-label">URL hình ảnh</label>
              <input type="url" v-model="productDetailForm.image" class="form-input" 
                placeholder="Nhập URL hình ảnh cho biến thể này" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn secondary" @click="closeProductDetailForm">Hủy</button>
          <button type="button" class="btn primary" @click="saveProductDetail">
            <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
            {{ showAddModal ? 'Thêm chi tiết' : 'Cập nhật' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-container small" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Xác nhận xóa chi tiết sản phẩm</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <p>Bạn có chắc chắn muốn xóa chi tiết sản phẩm này không?</p>
          <p class="warning-text">Hành động này không thể hoàn tác!</p>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showDeleteModal = false">Hủy bỏ</button>
          <button class="btn danger" @click="confirmDelete">
            <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter, useRoute } from 'vue-router';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';
import { productService } from '@/services/api/productAPI.js';

export default {
  name: 'ChiTietSanPham',
  components: {
    Breadcrumb,
    DataTable
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();

    // Page configuration
    const pageTitle = ref('Quản Lý Chi Tiết Sản Phẩm');
    const pageDescription = ref('Hệ thống quản lý chi tiết sản phẩm với các thuộc tính như kích cỡ, màu sắc, chất liệu');

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Quản lý', path: '/quan-ly' },
      { label: 'Sản phẩm', path: '/san-pham' },
      { label: 'Chi tiết sản phẩm', path: '/chi-tiet-san-pham' }
    ]);

    const exportToExcel = () => {
      if (selectedItems.value.length > 0) {
        exportSelectedToExcel();
      } else {
        toast.info('Vui lòng chọn sản phẩm để xuất Excel hoặc sử dụng chức năng xuất tất cả');
      }
    };

    const downloadBulkQRCodes = () => {
      downloadSelectedQRCodes();
    };

    const breadcrumbActions = ref([
      {
        label: 'Danh sách sản phẩm',
        type: 'default',
        handler: () => router.push('/san-pham')
      },
      {
        label: 'Tải mã QR',
        type: 'default',
        handler: downloadBulkQRCodes,
        disabled: computed(() => selectedItems.value.length === 0)
      },
      {
        label: 'Xuất Excel',
        type: 'default', 
        handler: exportToExcel,
        disabled: computed(() => selectedItems.value.length === 0)
      }
    ]);

    const pageStats = computed(() => [
      {
        value: totalElements.value.toString(),
        label: 'Tổng chi tiết',
        icon: 'solar:widget-4-bold-duotone'
      },
      {
        value: productDetails.value.filter(item => (item.soLuongTonKho || 0) > 5).length.toString(),
        label: 'Còn hàng',
        icon: 'solar:check-circle-bold-duotone'
      },
      {
        value: productDetails.value.filter(item => (item.soLuongTonKho || 0) <= 5 && (item.soLuongTonKho || 0) > 0).length.toString(),
        label: 'Sắp hết hàng',
        icon: 'solar:danger-bold-duotone'
      },
      {
        value: productDetails.value.filter(item => (item.soLuongTonKho || 0) === 0).length.toString(),
        label: 'Hết hàng',
        icon: 'solar:close-circle-bold-duotone'
      }
    ]);

    // State management
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const showDeleteModal = ref(false);
    const selectedProductDetail = ref(null);
    const productDetailToDelete = ref(null);
    const selectedItems = ref([]);
    const selectAll = ref(false);
    const loading = ref(false);
    const error = ref(null);
    
    // Pagination state
    const currentPage = ref(0);
    const pageSize = ref(10);
    const totalElements = ref(0);
    const totalPages = ref(0);
    
    // Product ID from route
    const productId = ref(null);

    // Filters - Updated for variant-specific filtering
    const filters = ref({
      search: '',
      size: '',
      color: '',
      material: '',
      sole: '',
      brand: '',
      status: '',
      priceFrom: '',
      priceTo: '',
      sortBy: 'newest'
    });

    // Form data
    const productDetailForm = ref({
      productId: '',
      sizeId: '',
      colorId: '',
      materialId: '',
      soleId: '',
      price: '',
      stock: '',
      status: 'active',
      image: ''
    });

    // Data from API
    const baseProducts = ref([]);
    const sizes = ref([]);
    const colors = ref([]);
    const materials = ref([]);
    const soles = ref([]);
    const brands = ref([]);
    const categories = ref([]);

    // Product details data from API
    const productDetails = ref([]);

    // Table columns configuration - Updated to focus on variant-specific attributes
    const columns = ref([
      { key: 'checkbox', label: '', class: 'text-center', width: '50px' },
      { key: 'stt', label: 'STT', class: 'text-center' },
      { key: 'image', label: 'Hình ảnh', class: 'text-center' },
      { key: 'productInfo', label: 'Thông tin sản phẩm' },
      { key: 'variantAttributes', label: 'Thuộc tính biến thể' },
      { key: 'materialSole', label: 'Chất liệu & Đế riêng' },
      { key: 'price', label: 'Giá bán', class: 'text-right' },
      { key: 'stock', label: 'Tồn kho', class: 'text-center' },
      { key: 'status', label: 'Trạng thái', class: 'text-center' },
      { key: 'actions', label: 'Hành động', class: 'text-center' }
    ]);

    // Computed properties
    const filteredProductDetails = computed(() => {
      let result = [...productDetails.value];

      // Search filter
      if (filters.value.search.trim()) {
        const search = filters.value.search.toLowerCase();
        result = result.filter(item =>
          (item.idSanPham?.tenSanPham || '').toLowerCase().includes(search) ||
          (item.ma || '').toLowerCase().includes(search)
        );
      }

      // Size filter
      if (filters.value.size) {
        result = result.filter(item => item.idKichCo?.id === Number(filters.value.size));
      }

      // Color filter
      if (filters.value.color) {
        result = result.filter(item => item.idMauSac?.id === Number(filters.value.color));
      }

      // Material filter
      if (filters.value.material) {
        result = result.filter(item => item.idChatLieu?.id === Number(filters.value.material));
      }

      // Brand filter
      if (filters.value.brand) {
        result = result.filter(item => item.idSanPham?.idThuongHieu?.id === Number(filters.value.brand));
      }

      // Status filter
      if (filters.value.status) {
        if (filters.value.status === 'out_of_stock') {
          result = result.filter(item => (item.soLuongTonKho || 0) === 0);
        } else {
          result = result.filter(item => item.trangThaiSanPhamRieng === filters.value.status);
        }
      }

      // Price range filter
      if (filters.value.priceFrom) {
        result = result.filter(item => (item.giaBan || 0) >= Number(filters.value.priceFrom));
      }
      if (filters.value.priceTo) {
        result = result.filter(item => (item.giaBan || 0) <= Number(filters.value.priceTo));
      }

      // Sorting
      switch (filters.value.sortBy) {
        case 'newest':
          result.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.ngayTao) - new Date(b.ngayTao));
          break;
        case 'name_asc':
          result.sort((a, b) => (a.idSanPham?.tenSanPham || '').localeCompare(b.idSanPham?.tenSanPham || ''));
          break;
        case 'name_desc':
          result.sort((a, b) => (b.idSanPham?.tenSanPham || '').localeCompare(a.idSanPham?.tenSanPham || ''));
          break;
        case 'price_asc':
          result.sort((a, b) => (a.giaBan || 0) - (b.giaBan || 0));
          break;
        case 'price_desc':
          result.sort((a, b) => (b.giaBan || 0) - (a.giaBan || 0));
          break;
        case 'stock_asc':
          result.sort((a, b) => (a.soLuongTonKho || 0) - (b.soLuongTonKho || 0));
          break;
        case 'stock_desc':
          result.sort((a, b) => (b.soLuongTonKho || 0) - (a.soLuongTonKho || 0));
          break;
      }

      return result;
    });

    // Helper methods
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getSizeName = (sizeId) => {
      const size = sizes.value.find(s => s.id === sizeId);
      return size ? size.name : 'N/A';
    };

    const getColorName = (colorId) => {
      const color = colors.value.find(c => c.id === colorId);
      return color ? color.name : 'N/A';
    };

    const getColorCode = (colorId) => {
      const color = colors.value.find(c => c.id === colorId);
      return color ? color.code : '#CCCCCC';
    };

    const getMaterialName = (materialId) => {
      const material = materials.value.find(m => m.id === materialId);
      return material ? material.name : 'N/A';
    };

    const getSoleName = (soleId) => {
      const sole = soles.value.find(s => s.id === soleId);
      return sole ? sole.name : 'N/A';
    };

    const getBrandName = (brandId) => {
      const brand = brands.value.find(b => b.id === brandId);
      return brand ? brand.name : 'N/A';
    };

    const getCategoryName = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId);
      return category ? category.name : 'N/A';
    };

    const getStatusLabel = (stock) => {
      if (stock === 0) return 'Hết hàng';
      if (stock <= 5) return 'Sắp hết hàng';
      return 'Còn hàng';
    };

    const getStatusClass = (stock) => {
      if (stock === 0) return 'out-of-stock';
      if (stock <= 5) return 'low-stock';
      return 'in-stock';
    };

    const getStockClass = (stock) => {
      if (stock === 0) return 'out-of-stock';
      if (stock <= 5) return 'low-stock';
      return 'in-stock';
    };

    // CRUD methods
    const resetFilters = () => {
      filters.value = {
        search: '',
        size: '',
        color: '',
        material: '',
        sole: '',
        brand: '',
        status: '',
        priceFrom: '',
        priceTo: '',
        sortBy: 'newest'
      };
    };

    const viewProductDetail = (item) => {
      selectedProductDetail.value = item;
      toast.info(`Xem chi tiết: ${item.productName} - Size ${getSizeName(item.sizeId)}`);
    };

    const addProductDetail = () => {
      selectedProductDetail.value = null;
      productDetailForm.value = {
        productId: '',
        sizeId: '',
        colorId: '',
        materialId: '',
        soleId: '',
        price: '',
        stock: '',
        status: 'active',
        image: ''
      };
      showAddModal.value = true;
    };

    const editProductDetail = (item) => {
      selectedProductDetail.value = item;
      Object.assign(productDetailForm.value, item);
      showEditModal.value = true;
    };

    const deleteProductDetail = (item) => {
      productDetailToDelete.value = item;
      showDeleteModal.value = true;
    };

    const editVariant = (variant) => {
      selectedProductDetail.value = { ...variant };
      Object.assign(productDetailForm.value, variant);
      showEditModal.value = true;
    };

    const downloadQRCode = (variant) => {
      // Create QR code data for product variant
      const qrData = {
        productName: variant.productName,
        variantInfo: `${getSizeName(variant.sizeId)} - ${getColorName(variant.colorId)}`,
        price: variant.price,
        stock: variant.stock,
        sku: `${variant.productCode}-${variant.id}`
      };
      
      // Create QR code content
      const qrContent = `Sản phẩm: ${qrData.productName}\nBiến thể: ${qrData.variantInfo}\nGiá: ${formatCurrency(qrData.price)}\nTồn kho: ${qrData.stock}\nMã SKU: ${qrData.sku}`;
      
      // Create a QR code URL using free QR code API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `QR_${qrData.sku}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Đã tải mã QR cho biến thể: ${getSizeName(variant.sizeId)} - ${getColorName(variant.colorId)}`);
    };

    // Selection functions
    const toggleItemSelection = (itemId) => {
      const index = selectedItems.value.indexOf(itemId);
      if (index > -1) {
        selectedItems.value.splice(index, 1);
      } else {
        selectedItems.value.push(itemId);
      }
      updateSelectAllState();
    };

    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedItems.value = [];
      } else {
        selectedItems.value = filteredProductDetails.value.map(item => item.id);
      }
      selectAll.value = !selectAll.value;
    };

    const updateSelectAllState = () => {
      const totalItems = filteredProductDetails.value.length;
      const selectedCount = selectedItems.value.length;
      selectAll.value = totalItems > 0 && selectedCount === totalItems;
    };

    // Bulk operations
    const downloadSelectedQRCodes = () => {
      if (selectedItems.value.length === 0) {
        toast.warning('Vui lòng chọn ít nhất một sản phẩm để tải mã QR');
        return;
      }

      const selectedProducts = productDetails.value.filter(item => selectedItems.value.includes(item.id));
      
      selectedProducts.forEach((variant, index) => {
        setTimeout(() => {
          downloadQRCode(variant);
        }, index * 500); // Delay each download by 500ms to avoid overwhelming the API
      });

      toast.success(`Đang tải ${selectedProducts.length} mã QR...`);
    };

    const exportSelectedToExcel = () => {
      if (selectedItems.value.length === 0) {
        toast.warning('Vui lòng chọn ít nhất một sản phẩm để xuất Excel');
        return;
      }

      const selectedProducts = productDetails.value.filter(item => selectedItems.value.includes(item.id));
      
      // Create Excel data from selected products
      const excelData = selectedProducts.map((item, index) => ({
        'STT': index + 1,
        'Tên sản phẩm': item.productName,
        'Kích cỡ': getSizeName(item.sizeId),
        'Màu sắc': getColorName(item.colorId),
        'Chất liệu': getMaterialName(item.materialId),
        'Đế giày': getSoleName(item.soleId),
        'Thương hiệu': getBrandName(item.brandId),
        'Danh mục': getCategoryName(item.categoryId),
        'Giá bán': item.price,
        'Tồn kho': item.stock,
        'Trạng thái': getStatusLabel(item.status),
        'Ngày tạo': formatDate(item.createdAt)
      }));
      
      // Convert to CSV format
      const headers = Object.keys(excelData[0]).join(',');
      const csvContent = [headers, ...excelData.map(row => Object.values(row).join(','))].join('\n');
      
      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Chi_tiet_san_pham_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Đã xuất ${selectedProducts.length} sản phẩm ra Excel`);
    };

    const closeProductDetailForm = () => {
      showAddModal.value = false;
      showEditModal.value = false;
      selectedProductDetail.value = null;
      productDetailForm.value = {
        productId: '',
        sizeId: '',
        colorId: '',
        materialId: '',
        soleId: '',
        price: '',
        stock: '',
        status: 'active',
        image: ''
      };
    };

    const saveProductDetail = async () => {
      try {
        loading.value = true;
        
        if (showAddModal.value) {
          // Add new product detail
          const productDetailData = {
            productId: Number(productDetailForm.value.productId),
            sizeId: Number(productDetailForm.value.sizeId),
            colorId: Number(productDetailForm.value.colorId),
            materialId: Number(productDetailForm.value.materialId) || null,
            soleId: Number(productDetailForm.value.soleId) || null,
            price: Number(productDetailForm.value.price),
            stock: Number(productDetailForm.value.stock),
            status: productDetailForm.value.status,
            image: productDetailForm.value.image
          };

          const response = await productService.createProductDetail(productDetailData);
          if (response.data) {
            await loadProductDetails(); // Reload data
            toast.success('Thêm chi tiết sản phẩm thành công!');
          }
        } else {
          // Update existing product detail
          const productDetailData = {
            productId: Number(productDetailForm.value.productId),
            sizeId: Number(productDetailForm.value.sizeId),
            colorId: Number(productDetailForm.value.colorId),
            materialId: Number(productDetailForm.value.materialId) || null,
            soleId: Number(productDetailForm.value.soleId) || null,
            price: Number(productDetailForm.value.price),
            stock: Number(productDetailForm.value.stock),
            status: productDetailForm.value.status,
            image: productDetailForm.value.image
          };

          const response = await productService.updateProductDetail(selectedProductDetail.value.id, productDetailData);
          if (response.data) {
            await loadProductDetails(); // Reload data
            toast.success('Cập nhật chi tiết sản phẩm thành công!');
          }
        }
        closeProductDetailForm();
      } catch (err) {
        console.error('Error saving product detail:', err);
        toast.error('Có lỗi xảy ra khi lưu chi tiết sản phẩm');
      } finally {
        loading.value = false;
      }
    };

    const confirmDelete = async () => {
      if (productDetailToDelete.value) {
        try {
          loading.value = true;
          await productService.deleteProductDetail(productDetailToDelete.value.id);
          const index = productDetails.value.findIndex(p => p.id === productDetailToDelete.value.id);
          if (index > -1) {
            productDetails.value.splice(index, 1);
            toast.success(`Đã xóa chi tiết sản phẩm: ${productDetailToDelete.value.productName}`);
          }
        } catch (err) {
          console.error('Error deleting product detail:', err);
          toast.error('Có lỗi xảy ra khi xóa chi tiết sản phẩm');
        } finally {
          loading.value = false;
        }
      }
      showDeleteModal.value = false;
      productDetailToDelete.value = null;
    };

    // Handle DataTable actions
    const handleAction = (action, item) => {
      switch (action) {
        case 'edit':
          editProductDetail(item);
          break;
        case 'delete':
          deleteProductDetail(item);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    };

    // API Loading Functions
    const loadProductDetails = async (page = 0, size = 10) => {
      try {
        loading.value = true;
        
        // Get productId from route params or use a default
        const currentProductId = route.params.id || productId.value;
        
        if (!currentProductId) {
          // If no product ID, load all product details with pagination
          const response = await productService.getAllProductDetails({
            page,
            size,
            sortBy: 'id',
            sortDir: 'asc'
          });
          
          if (response.data) {
            productDetails.value = response.data.content || [];
            totalElements.value = response.data.totalElements || 0;
            totalPages.value = response.data.totalPages || 0;
            currentPage.value = response.data.number || 0;
          }
        } else {
          // Load product details by product ID with pagination
          const response = await productService.getProductDetailsPaged(currentProductId, {
            page,
            size,
            sortBy: 'id',
            sortDir: 'asc'
          });
          
          if (response.data) {
            productDetails.value = response.data.content || [];
            totalElements.value = response.data.totalElements || 0;
            totalPages.value = response.data.totalPages || 0;
            currentPage.value = response.data.number || 0;
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        error.value = 'Không thể tải danh sách chi tiết sản phẩm';
        toast.error('Không thể tải danh sách chi tiết sản phẩm');
      } finally {
        loading.value = false;
      }
    };

    const loadBaseProducts = async () => {
      try {
        const response = await productService.getAllSimpleProducts();
        baseProducts.value = (response.data || []).map(product => ({
          id: product.id,
          name: product.tenSanPham || product.name,
          code: product.ma || product.code
        }));
      } catch (err) {
        console.error('Error loading base products:', err);
      }
    };

    const loadAttributes = async () => {
      try {
        const [sizesRes, colorsRes, materialsRes, solesRes, brandsRes, categoriesRes] = await Promise.all([
          productService.getAllSizes(),
          productService.getAllColors(),
          productService.getAllMaterials(),
          productService.getAllSoles(),
          productService.getAllBrands(),
          productService.getAllCategories()
        ]);

        sizes.value = (sizesRes.data || []).map(size => ({
          id: size.id,
          name: size.tenKichCo || size.name
        }));
        colors.value = (colorsRes.data || []).map(color => ({
          id: color.id,
          name: color.tenMauSac || color.name,
          hex: color.hex
        }));
        materials.value = (materialsRes.data || []).map(material => ({
          id: material.id,
          name: material.tenChatLieu || material.name
        }));
        soles.value = (solesRes.data || []).map(sole => ({
          id: sole.id,
          name: sole.tenDeGiay || sole.name
        }));
        brands.value = (brandsRes.data || []).map(brand => ({
          id: brand.id,
          name: brand.tenThuongHieu || brand.name
        }));
        categories.value = (categoriesRes.data || []).map(category => ({
          id: category.id,
          name: category.tenDanhMuc || category.name
        }));
      } catch (err) {
        console.error('Error loading attributes:', err);
        toast.error('Không thể tải danh sách thuộc tính sản phẩm');
      }
    };

    const loadAllData = async () => {
      // Get product ID from route if available
      if (route.params.id) {
        productId.value = route.params.id;
      }
      
      await Promise.all([
        loadProductDetails(currentPage.value, pageSize.value),
        loadBaseProducts(),
        loadAttributes()
      ]);
    };
    
    // Pagination methods
    const changePage = async (page) => {
      currentPage.value = page;
      await loadProductDetails(page, pageSize.value);
    };

    const changePageSize = async (newSize) => {
      pageSize.value = newSize;
      currentPage.value = 0; // Reset to first page
      await loadProductDetails(0, newSize);
    };

    const nextPage = async () => {
      if (currentPage.value < totalPages.value - 1) {
        await changePage(currentPage.value + 1);
      }
    };

    const prevPage = async () => {
      if (currentPage.value > 0) {
        await changePage(currentPage.value - 1);
      }
    };

    const goToFirstPage = async () => {
      await changePage(0);
    };

    const goToLastPage = async () => {
      await changePage(totalPages.value - 1);
    };

    const getVisiblePages = () => {
      const totalPagesToShow = 5;
      const half = Math.floor(totalPagesToShow / 2);
      let start = Math.max(0, currentPage.value - half);
      let end = Math.min(totalPages.value - 1, start + totalPagesToShow - 1);
      
      if (end - start + 1 < totalPagesToShow) {
        start = Math.max(0, end - totalPagesToShow + 1);
      }
      
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    // Watch for filter changes to reload data
    watch(
      () => [filters.value.search, filters.value.size, filters.value.color, filters.value.material, filters.value.sortBy],
      () => {
        currentPage.value = 0; // Reset to first page when filters change
        loadProductDetails(0, pageSize.value);
      },
      { deep: true }
    );

    // Initialize data on component mount
    onMounted(() => {
      loadAllData();
    });

    return {
      // Page data
      pageTitle,
      pageDescription,
      breadcrumbItems,
      breadcrumbActions,
      pageStats,
      
      // State
      showAddModal,
      showEditModal,
      showDeleteModal,
      selectedProductDetail,
      productDetailToDelete,
      selectedItems,
      selectAll,
      loading,
      error,
      
      // Form data
      filters,
      productDetailForm,
      
      // Data
      baseProducts,
      sizes,
      colors,
      materials,
      soles,
      brands,
      categories,
      productDetails,
      columns,
      
      // Computed
      filteredProductDetails,
      
      // Methods
      formatCurrency,
      formatDate,
      getSizeName,
      getColorName,
      getColorCode,
      getMaterialName,
      getSoleName,
      getBrandName,
      getCategoryName,
      getStatusLabel,
      getStatusClass,
      getStockClass,
      resetFilters,
      
      // CRUD Methods
      addProductDetail,
      editProductDetail,
      deleteProductDetail,
      editVariant,
      downloadQRCode,
      closeProductDetailForm,
      saveProductDetail,
      confirmDelete,
      exportToExcel,
      handleAction,
      
      // Selection methods
      toggleItemSelection,
      toggleSelectAll,
      updateSelectAllState,
      downloadSelectedQRCodes,
      exportSelectedToExcel,
      
      // API methods
      loadProductDetails,
      loadBaseProducts,
      loadAttributes,
      loadAllData,
      
      // Pagination methods
      changePage,
      changePageSize,
      nextPage,
      prevPage,
      goToFirstPage,
      goToLastPage,
      getVisiblePages,
      
      // Pagination state
      currentPage,
      pageSize,
      totalElements,
      totalPages
    };
  }
};
</script>

<style scoped>
/* Container Styles */
.chi-tiet-san-pham-container {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Loading and Error Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-message {
  color: #dc2626;
  font-size: 16px;
  margin-bottom: 16px;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
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
  gap: 16px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-input,
.filter-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.price-filter-group {
  grid-column: span 2;
}

.price-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.price-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.price-sub-label {
  font-size: 12px;
  color: #6b7280;
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.products-section {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Table Styles */
.table-product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
}

.table-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.table-product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-product-name {
  font-weight: 600;
  color: #1e293b;
}

.table-product-code {
  font-size: 12px;
  color: #64748b;
}

.attributes-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attr-label {
  font-size: 14px;
  color: #6b7280;
  min-width: 35px;
}

.attr-value {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

.color-badge {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.material-sole-info,
.brand-category-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-label {
  font-size: 14px;
  color: #6b7280;
  min-width: 60px;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

.price {
  font-weight: 600;
  color: #dc2626;
  font-size: 16px;
}

.stock {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
}

.stock.in-stock {
  background: #dcfce7;
  color: #166534;
}

.stock.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.stock.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.in-stock {
  background: #dcfce7;
  color: #166534;
}

.status-badge.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
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

.action-btn.qr {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Checkbox Styles */
.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
  transform: scale(1.2);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-container.large {
  width: 90%;
  max-width: 800px;
}

.modal-container.small {
  width: 90%;
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  color: #6b7280;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-content {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

/* Form Styles */
.product-detail-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-label.required::after {
  content: ' *';
  color: #dc2626;
}

.form-input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button Styles */
.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn.primary {
  background: #3b82f6;
  color: white;
}

.btn.primary:hover {
  background: #2563eb;
}

.btn.secondary {
  background: #64748b;
  color: white;
}

.btn.secondary:hover {
  background: #475569;
}

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
  margin: 0 8px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.page-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #374151;
}

.btn.danger {
  background: #dc2626;
  color: white;
}

.btn.danger:hover {
  background: #b91c1c;
}

.warning-text {
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
}

/* ===== NEW VARIANT-SPECIFIC STYLES ===== */
.variant-attributes-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attr-label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 40px;
}

.size-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.color-badge {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.material-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0277bd;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.sole-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #f3e5f5;
  color: #7b1fa2;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.common-indicator {
  display: inline-block;
  padding: 4px 8px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
  font-size: 0.85rem;
  font-style: italic;
}

.material-sole-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 80px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .price-filter-group {
    grid-column: span 1;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
  
  .modal-container.large {
    width: 95%;
    margin: 20px;
  }
}
</style>