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
        </div>
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <select v-model="filters.status" class="filter-select">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Còn hàng</option>
              <option value="low_stock">Sắp hết hàng</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Sắp xếp theo</label>
            <select v-model="filters.sortBy" class="filter-select">
              <option value="id">Mặc định</option>
              <option value="ngayTao">Ngày tạo</option>
              <option value="giaBan">Giá bán</option>
              <option value="soLuongTonKho">Tồn kho</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Thứ tự</label>
            <select v-model="filters.sortDir" class="filter-select">
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Giá nhập từ</label>
            <input type="text" v-model="displayMinImportPrice" @input="updateMinImportPrice" class="filter-input"
              placeholder="VD: 100,000 VND" />
          </div>
          <div class="filter-group">
            <label class="filter-label">Giá nhập đến</label>
            <input type="text" v-model="displayMaxImportPrice" @input="updateMaxImportPrice" class="filter-input"
              placeholder="VD: 500,000 VND" />
          </div>
          <div class="filter-group">
            <label class="filter-label">Giá bán từ</label>
            <input type="text" v-model="displayMinSellingPrice" @input="updateMinSellingPrice" class="filter-input"
              placeholder="VD: 150,000 VND" />
          </div>
          <div class="filter-group">
            <label class="filter-label">Giá bán đến</label>
            <input type="text" v-model="displayMaxSellingPrice" @input="updateMaxSellingPrice" class="filter-input"
              placeholder="VD: 800,000 VND" />
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
          :server-side="true"
          :total-items="totalElements"
          :current-page="currentPage + 1"
          :items-per-page="pageSize"
          @update:current-page="handlePageChange"
          @update:items-per-page="handlePageSizeChange"
          item-label="chi tiết sản phẩm"
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
              <img 
                :src="item.idAnhSanPham?.urlAnh || item.idSanPham?.urlAnhDaiDien || '/default-product.jpg'" 
                :alt="item.idSanPham?.tenSanPham || 'Product'"
                @error="handleImageError"
                class="product-variant-image"
              />
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


          <!-- Import Price Column -->
          <template #importPrice="{ item }">
            <span class="import-price">{{ formatCurrency(item.giaNhap) }}</span>
          </template>

          <!-- Price Column -->
          <template #price="{ item }">
            <span class="price">{{ formatCurrency(item.giaBan) }}</span>
          </template>

          <!-- Stock Column -->
          <template #stock="{ item }">
            <span class="stock" :class="getStockClass(item.soLuongTonKho)">{{ item.soLuongTonKho || 0 }}</span>
          </template>

          <!-- Import Date Column -->
          <template #importDate="{ item }">
            <span class="import-date">{{ formatDate(item.ngayNhap) }}</span>
          </template>

          <!-- Status Column -->
          <template #status="{ item }">
            <span class="status-badge" :class="getStatusClass(item)">
              {{ getStatusLabel(item) }}
            </span>
          </template>

          <!-- Actions Column -->
          <template #actions="{ item }">
            <div class="actions">
              <button @click="editVariant(item)" class="action-btn edit" :disabled="item.deleted" :title="item.deleted ? 'Không thể sửa sản phẩm ngừng bán' : 'Chỉnh sửa'">
                <iconify-icon icon="solar:pen-bold"></iconify-icon>
              </button>
              <button @click="downloadQRCode(item)" class="action-btn qr" :disabled="item.deleted" :title="item.deleted ? 'Không thể tải QR cho sản phẩm ngừng bán' : 'Tải mã QR sản phẩm'">
                <iconify-icon icon="solar:qr-code-bold"></iconify-icon>
              </button>
            </div>
          </template>
        </DataTable>
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
            </div>
            <div class="form-row">
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
import QRCode from 'qrcode';

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

    const breadcrumbActions = computed(() => {
      // Check if any selected items are stopped-selling (deleted)
      const hasStoppedSellingItems = selectedItems.value.some(itemId => {
        const item = productDetails.value.find(detail => detail.id === itemId);
        return item && item.deleted === true;
      });

      return [
        {
          label: 'Danh sách sản phẩm',
          type: 'default',
          handler: () => router.push('/san-pham')
        },
        {
          label: 'Tải mã QR',
          type: 'default',
          handler: downloadBulkQRCodes,
          disabled: selectedItems.value.length === 0 || hasStoppedSellingItems,
          title: hasStoppedSellingItems ? 'Không thể tải QR cho sản phẩm ngừng bán' : 
                 selectedItems.value.length === 0 ? 'Vui lòng chọn sản phẩm' : ''
        },
        {
          label: 'Xuất Excel',
          type: 'default', 
          handler: exportToExcel,
          disabled: selectedItems.value.length === 0 || hasStoppedSellingItems,
          title: hasStoppedSellingItems ? 'Không thể xuất Excel cho sản phẩm ngừng bán' : 
                 selectedItems.value.length === 0 ? 'Vui lòng chọn sản phẩm' : ''
        }
      ];
    });

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

    // Filters 
    const filters = ref({
      search: '',
      size: '',
      color: '',
      status: '',
      sortBy: 'id',
      sortDir: 'asc',
      minImportPrice: '',
      maxImportPrice: '',
      minSellingPrice: '',
      maxSellingPrice: ''
    });

    // Form data
    const productDetailForm = ref({
      productId: '',
      sizeId: '',
      colorId: '',
      price: '',
      stock: '',
      status: 'active',
      image: ''
    });

    // Data from API
    const baseProducts = ref([]);
    const sizes = ref([]);
    const colors = ref([]);

    // Product details data from API
    const productDetails = ref([]);

    // Display values for formatted price inputs
    const displayMinImportPrice = ref('');
    const displayMaxImportPrice = ref('');
    const displayMinSellingPrice = ref('');
    const displayMaxSellingPrice = ref('');

    // Table columns configuration - Updated to focus on variant-specific attributes
    const columns = ref([
      { key: 'checkbox', label: '', class: 'text-center', width: '50px' },
      { key: 'stt', label: 'STT', class: 'text-center' },
      { key: 'image', label: 'Hình ảnh', class: 'text-center' },
      { key: 'productInfo', label: 'Thông tin sản phẩm' },
      { key: 'variantAttributes', label: 'Thuộc tính biến thể' },
      { key: 'importPrice', label: 'Giá nhập', class: 'text-right' },
      { key: 'price', label: 'Giá bán', class: 'text-right' },
      { key: 'stock', label: 'Tồn kho', class: 'text-center' },
      { key: 'importDate', label: 'Ngày nhập', class: 'text-center' },
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



      // Status filter
      if (filters.value.status) {
        if (filters.value.status === 'out_of_stock') {
          result = result.filter(item => (item.soLuongTonKho || 0) === 0);
        } else if (filters.value.status === 'active') {
          result = result.filter(item => !item.deleted && (item.soLuongTonKho || 0) > 0);
        } else if (filters.value.status === 'inactive') {
          result = result.filter(item => item.deleted === true);
        }
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
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
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



    const getStatusLabel = (item) => {
      // First check if product is deleted (ngừng bán)
      if (item.deleted === true) {
        return 'Ngừng bán';
      }
      
      // If not deleted, check stock level
      const stock = item.soLuongTonKho || 0;
      if (stock === 0) return 'Hết hàng';
      if (stock <= 5) return 'Sắp hết hàng';
      return 'Còn hàng';
    };

    const getStatusClass = (item) => {
      // First check if product is deleted (ngừng bán)
      if (item.deleted === true) {
        return 'stopped-selling';
      }
      
      // If not deleted, check stock level
      const stock = item.soLuongTonKho || 0;
      if (stock === 0) return 'out-of-stock';
      if (stock <= 5) return 'low-stock';
      return 'in-stock';
    };

    const getStockClass = (stock) => {
      if (stock === 0) return 'out-of-stock';
      if (stock <= 5) return 'low-stock';
      return 'in-stock';
    };

    const handleImageError = (event) => {
      event.target.src = '/default-product.jpg';
    };

    // Currency formatting functions
    const formatCurrencyInput = (value) => {
      if (!value) return '';
      // Remove all non-digit characters
      const numericValue = value.toString().replace(/\D/g, '');
      if (!numericValue) return '';
      
      // Format with thousand separators and add VND
      const formatted = new Intl.NumberFormat('vi-VN').format(parseInt(numericValue));
      return `${formatted} VND`;
    };

    const parseCurrencyInput = (value) => {
      if (!value) return '';
      // Remove all non-digit characters and return as number
      const numericValue = value.toString().replace(/\D/g, '');
      return numericValue ? parseInt(numericValue) : '';
    };

    // Price input handlers
    const updateMinImportPrice = (event) => {
      const rawValue = event.target.value;
      const numericValue = parseCurrencyInput(rawValue);
      filters.value.minImportPrice = numericValue;
      displayMinImportPrice.value = formatCurrencyInput(numericValue);
    };

    const updateMaxImportPrice = (event) => {
      const rawValue = event.target.value;
      const numericValue = parseCurrencyInput(rawValue);
      filters.value.maxImportPrice = numericValue;
      displayMaxImportPrice.value = formatCurrencyInput(numericValue);
    };

    const updateMinSellingPrice = (event) => {
      const rawValue = event.target.value;
      const numericValue = parseCurrencyInput(rawValue);
      filters.value.minSellingPrice = numericValue;
      displayMinSellingPrice.value = formatCurrencyInput(numericValue);
    };

    const updateMaxSellingPrice = (event) => {
      const rawValue = event.target.value;
      const numericValue = parseCurrencyInput(rawValue);
      filters.value.maxSellingPrice = numericValue;
      displayMaxSellingPrice.value = formatCurrencyInput(numericValue);
    };

    // CRUD methods
    const resetFilters = () => {
      filters.value = {
        search: '',
        size: '',
        color: '',
        status: '',
        sortBy: 'id',
        sortDir: 'asc',
        minImportPrice: '',
        maxImportPrice: '',
        minSellingPrice: '',
        maxSellingPrice: ''
      };
      // Reset display values
      displayMinImportPrice.value = '';
      displayMaxImportPrice.value = '';
      displayMinSellingPrice.value = '';
      displayMaxSellingPrice.value = '';
      // Reset to first page and reload data
      currentPage.value = 0;
      loadProductDetails(0, pageSize.value);
      toast.info('Đã đặt lại bộ lọc');
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
      // Navigate to the edit page for this product detail
      router.push(`/san-pham/chi-tiet/sua/${variant.id}`);
    };

    const downloadQRCode = async (variant) => {
      try {
        // Create QR code content using product detail ID as main identifier
        const qrContent = `${variant.id}`;
        
        // Generate QR code as data URL using the qrcode library
        const qrDataUrl = await QRCode.toDataURL(qrContent, {
          width: 400,
          height: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        
        // Convert data URL to blob
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        
        // Create download link with blob URL
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `QR_ChiTietSanPham_${variant.id}.png`;
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 100);
        
        const productName = variant.idSanPham?.tenSanPham || 'Sản phẩm';
        const sizeName = variant.idKichCo?.tenKichCo || '';
        const colorName = variant.idMauSac?.tenMauSac || '';
        const variantInfo = `${productName} - ${sizeName} - ${colorName}`;
        
        toast.success(`Đã tải mã QR cho chi tiết sản phẩm ID: ${variant.id} (${variantInfo})`);
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast.error('Không thể tạo mã QR. Vui lòng thử lại.');
      }
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
        error.value = null;
        
        // Get productId from route params or use a default
        const currentProductId = route.params.id || productId.value;
        
        // Build filter parameters
        const filterParams = {
          page,
          size,
          sortBy: filters.value.sortBy || 'id',
          sortDir: filters.value.sortDir || 'asc',
          search: filters.value.search.trim().replace(/\s+/g, ' '),
          sizeId: filters.value.size || '',
          colorId: filters.value.color || '',
          status: filters.value.status || '',
          minImportPrice: filters.value.minImportPrice || '',
          maxImportPrice: filters.value.maxImportPrice || '',
          minSellingPrice: filters.value.minSellingPrice || '',
          maxSellingPrice: filters.value.maxSellingPrice || ''
        };
        
        if (!currentProductId) {
          // If no product ID, load all product details with pagination and filters
          const response = await productService.getAllProductDetails(filterParams);
          
          if (response.data) {
            productDetails.value = response.data.content || [];
            totalElements.value = response.data.totalElements || 0;
            totalPages.value = response.data.totalPages || 0;
            currentPage.value = response.data.number || 0;
          }
        } else {
          // Load product details by product ID with pagination and filters
          const response = await productService.getProductDetailsPaged(currentProductId, filterParams);
          
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
        productDetails.value = [];
      } finally {
        loading.value = false;
      }
    };

    const loadBaseProducts = async () => {
      try {
        const response = await productService.getProductsWithDetailsPaged({
          page: 0,
          size: 1000, // Get all products
          sortBy: 'tenSanPham',
          sortDir: 'asc'
        });
        baseProducts.value = (response.data.content || []).map(product => ({
          id: product.id,
          name: product.tenSanPham || product.name,
          code: product.ma || product.code
        }));
      } catch (err) {
        console.error('Error loading base products:', err);
        toast.error('Không thể tải danh sách sản phẩm');
      }
    };

    const loadAttributes = async () => {
      try {
        const [sizesRes, colorsRes] = await Promise.all([
          productService.getAllSizes(),
          productService.getAllColors()
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
    
    // Pagination methods for DataTable integration
    const handlePageChange = async (newPage) => {
      // DataTable uses 1-based indexing, backend uses 0-based
      currentPage.value = newPage - 1;
      await loadProductDetails(currentPage.value, pageSize.value);
    };

    const handlePageSizeChange = async (newPageSize) => {
      pageSize.value = newPageSize;
      currentPage.value = 0; // Reset to first page when page size changes
      await loadProductDetails(0, newPageSize);
    };

    // Watch for filter changes to reload data
    watch(
      () => [filters.value.search, filters.value.size, filters.value.color, filters.value.status, 
             filters.value.sortBy, filters.value.sortDir, filters.value.minImportPrice, 
             filters.value.maxImportPrice, filters.value.minSellingPrice, filters.value.maxSellingPrice],
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
      productDetails,
      columns,
      
      // Display values for price inputs
      displayMinImportPrice,
      displayMaxImportPrice,
      displayMinSellingPrice,
      displayMaxSellingPrice,
      
      // Computed
      filteredProductDetails,
      
      // Methods
      formatCurrency,
      formatDate,
      getSizeName,
      getColorName,
      getColorCode,
      getStatusLabel,
      getStatusClass,
      getStockClass,
      resetFilters,
      
      // Price formatting methods
      formatCurrencyInput,
      parseCurrencyInput,
      updateMinImportPrice,
      updateMaxImportPrice,
      updateMinSellingPrice,
      updateMaxSellingPrice,
      
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
      handleImageError,
      updateSelectAllState,
      downloadSelectedQRCodes,
      exportSelectedToExcel,
      
      // API methods
      loadProductDetails,
      loadBaseProducts,
      loadAttributes,
      loadAllData,
      
      // Pagination methods
      handlePageChange,
      handlePageSizeChange,
      
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
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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

.product-variant-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.table-product-image img {
  width: 60px;
  height: 60px;
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

.import-price {
  font-weight: 600;
  color: #059669;
  font-size: 16px;
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

.status-badge.stopped-selling {
  background: #fef3c7;
  color: #92400e;
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

.action-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6 !important;
  color: #9ca3af !important;
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

/* Button Styles */

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