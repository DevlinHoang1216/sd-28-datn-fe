<template>
  <div class="quan-ly-san-pham-container">
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" :show-page-info="true" page-title="Quản Lý Sản Phẩm"
      page-description="Hệ thống quản lý sản phẩm toàn diện cho Shop Giày" page-icon="solar:box-bold-duotone"
      :page-stats="pageStats" :actions="breadcrumbActions" />

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <iconify-icon icon="solar:filter-bold-duotone"></iconify-icon>
          Bộ Lọc Sản Phẩm
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
              placeholder="Tìm theo tên hoặc mã sản phẩm..." />
          </div>
          <div class="filter-group">
            <label class="filter-label">Danh mục</label>
            <select v-model="filters.category" class="filter-select">
              <option value="">Tất cả danh mục</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
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
        </div>
        <div class="filter-row">
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
          <div class="filter-group">
            <label class="filter-label">Số lượng tồn</label>
            <select v-model="filters.stockLevel" class="filter-select">
              <option value="">Tất cả</option>
              <option value="high">Tồn kho cao (>50)</option>
              <option value="medium">Tồn kho trung bình (10-50)</option>
              <option value="low">Tồn kho thấp (1-10)</option>
              <option value="out">Hết hàng (0)</option>
            </select>
          </div>
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
      <!-- Products Grid -->
      <div class="products-section">
        <div class="section-header">
          <h3 class="section-title">
            <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
            Danh Sách Sản Phẩm ({{ filteredProducts.length }})
          </h3>
          <div class="section-actions">
            <div class="view-toggle">
              <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
                <iconify-icon icon="solar:widget-4-bold-duotone"></iconify-icon>
              </button>
              <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                <iconify-icon icon="solar:list-bold-duotone"></iconify-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="products-grid">
          <div v-for="product in paginatedProducts" :key="product.id" class="product-card"
            @click="selectProduct(product)">
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-overlay">
                <button class="action-btn edit" @click.stop="editProduct(product)">
                  <iconify-icon icon="solar:pen-bold"></iconify-icon>
                </button>
                <button class="action-btn delete" @click.stop="deleteProduct(product)">
                  <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
                </button>
              </div>
              <div class="product-status" :class="product.status">
                {{ getStatusLabel(product.status) }}
              </div>
            </div>
            <div class="product-info">
              <div class="product-code">{{ product.code }}</div>
              <h4 class="product-name">{{ product.name }}</h4>
              <div class="product-brand">{{ getBrandName(product.brandId) }}</div>
              <div class="product-price">{{ formatCurrency(product.price) }}</div>
              <div class="product-stock" :class="getStockClass(product.stock)">
                Tồn: {{ product.stock }}
              </div>
            </div>
          </div>

          <div v-if="filteredProducts.length === 0" class="empty-state">
            <iconify-icon icon="solar:box-bold-duotone" class="empty-icon"></iconify-icon>
            <h4>Không tìm thấy sản phẩm</h4>
            <p>Thử điều chỉnh bộ lọc hoặc thêm sản phẩm mới</p>
            <button class="empty-action-btn" @click="showAddProductModal = true">
              Thêm Sản Phẩm Đầu Tiên
            </button>
          </div>
        </div>

        <!-- List View -->
        <div v-if="viewMode === 'list'">
          <DataTable :data="filteredProducts" :columns="tableColumns" item-label="sản phẩm"
            empty-message="Không tìm thấy sản phẩm nào." key-field="id">
            <!-- STT Column -->
            <template #stt="{ rowIndex }">
              {{ rowIndex }}
            </template>

            <!-- Image Column -->
            <template #image="{ item }">
              <div class="table-product-image">
                <img :src="item.image" :alt="item.name" />
              </div>
            </template>

            <!-- Code Column -->
            <template #code="{ item }">
              <span class="product-code">{{ item.code }}</span>
            </template>

            <!-- Name Column -->
            <template #name="{ item }">
              <div class="table-product-info">
                <span class="table-product-name">{{ item.name }}</span>
                <span class="table-product-category">{{ getCategoryName(item.categoryId) }}</span>
              </div>
            </template>

            <!-- Brand Column -->
            <template #brand="{ item }">
              {{ getBrandName(item.brandId) }}
            </template>

            <!-- Price Column -->
            <template #price="{ item }">
              <span class="price">{{ formatCurrency(item.price) }}</span>
            </template>

            <!-- Stock Column -->
            <template #stock="{ item }">
              <span class="stock" :class="getStockClass(item.stock)">{{ item.stock }}</span>
            </template>

            <!-- Status Column -->
            <template #status="{ item }">
              <span class="status-badge" :class="item.status">
                {{ getStatusLabel(item.status) }}
              </span>
            </template>

            <!-- Actions Column -->
            <template #actions="{ item }">
              <div class="actions">
                <button @click="viewProduct(item)" class="action-btn view" title="Xem chi tiết">
                  <iconify-icon icon="solar:eye-bold"></iconify-icon>
                </button>
                <button @click="editProduct(item)" class="action-btn edit" title="Chỉnh sửa">
                  <iconify-icon icon="solar:pen-bold"></iconify-icon>
                </button>
                <button @click="deleteProduct(item)" class="action-btn delete" title="Xóa">
                  <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
                </button>
              </div>
            </template>
          </DataTable>
        </div>
        <!-- Grid Pagination Footer -->
        <div v-if="viewMode === 'grid' && filteredProducts.length > 0" class="pagination-footer">
          <div class="pagination-container">
            <div class="pagination-info-left">
              <span class="pagination-summary">
                Hiển thị {{ startItem }} - {{ endItem }} của {{ filteredProducts.length }} sản phẩm
              </span>
              <div class="page-size-selector">
                <label>Hiển thị:</label>
                <select v-model="itemsPerPage" @change="currentPage = 1" class="page-size-select">
                  <option :value="6">6</option>
                  <option :value="12">12</option>
                  <option :value="24">24</option>
                  <option :value="48">48</option>
                </select>
                <span>sản phẩm/trang</span>
              </div>
            </div>

            <div v-if="totalPages > 1" class="pagination">
              <button class="pagination-btn" @click="currentPage = 1" :disabled="currentPage === 1" title="Trang đầu">
                <iconify-icon icon="solar:double-alt-arrow-left-bold"></iconify-icon>
              </button>
              <button class="pagination-btn" @click="currentPage--" :disabled="currentPage === 1" title="Trang trước">
                <iconify-icon icon="solar:alt-arrow-left-bold"></iconify-icon>
              </button>

              <!-- Page Numbers -->
              <div class="page-numbers">
                <button v-for="page in visiblePages" :key="page" class="page-number-btn"
                  :class="{ active: page === currentPage, ellipsis: page === '...' }"
                  @click="page !== '...' && (currentPage = page)" :disabled="page === '...'">
                  {{ page }}
                </button>
              </div>

              <button class="pagination-btn" @click="currentPage++" :disabled="currentPage === totalPages"
                title="Trang sau">
                <iconify-icon icon="solar:alt-arrow-right-bold"></iconify-icon>
              </button>
              <button class="pagination-btn" @click="currentPage = totalPages" :disabled="currentPage === totalPages"
                title="Trang cuối">
                <iconify-icon icon="solar:double-alt-arrow-right-bold"></iconify-icon>
              </button>
            </div>

            <div class="pagination-info-right">
              <span class="pagination-current">
                Trang {{ currentPage }} / {{ totalPages }}
              </span>
              <div class="goto-page">
                <label>Đi tới:</label>
                <input type="number" v-model.number="gotoPage" @keyup.enter="goToPage" :min="1" :max="totalPages"
                  class="goto-input" placeholder="Trang" />
                <button @click="goToPage" class="goto-btn" :disabled="!isValidGotoPage">
                  <iconify-icon icon="solar:arrow-right-bold"></iconify-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-container large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
            Chi Tiết Sản Phẩm
          </h3>
          <button class="modal-close" @click="showDetailModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content" v-if="selectedProductDetail">
          <div class="product-detail">
            <div class="detail-left">
              <div class="detail-image">
                <img :src="selectedProductDetail.image" :alt="selectedProductDetail.name" />
              </div>
            </div>
            <div class="detail-right">
              <div class="detail-info">
                <div class="info-group">
                  <label>Mã sản phẩm:</label>
                  <span>{{ selectedProductDetail.code }}</span>
                </div>
                <div class="info-group">
                  <label>Tên sản phẩm:</label>
                  <span>{{ selectedProductDetail.name }}</span>
                </div>
                <div class="info-group">
                  <label>Danh mục:</label>
                  <span>{{ getCategoryName(selectedProductDetail.categoryId) }}</span>
                </div>
                <div class="info-group">
                  <label>Thương hiệu:</label>
                  <span>{{ getBrandName(selectedProductDetail.brandId) }}</span>
                </div>
                <div class="info-group">
                  <label>Giá bán:</label>
                  <span class="price-highlight">{{ formatCurrency(selectedProductDetail.price) }}</span>
                </div>
                <div class="info-group">
                  <label>Số lượng tồn kho:</label>
                  <span :class="getStockClass(selectedProductDetail.stock)">{{ selectedProductDetail.stock }}</span>
                </div>
                <div class="info-group">
                  <label>Trạng thái:</label>
                  <span class="status-badge" :class="selectedProductDetail.status">
                    {{ getStatusLabel(selectedProductDetail.status) }}
                  </span>
                </div>
                <div class="info-group">
                  <label>Ngày tạo:</label>
                  <span>{{ formatDate(selectedProductDetail.createdAt) }}</span>
                </div>
                <div class="info-group full-width">
                  <label>Mô tả:</label>
                  <p class="description">{{ selectedProductDetail.description || 'Chưa có mô tả' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showDetailModal = false">Đóng</button>
          <button class="btn primary" @click="editProduct(selectedProductDetail)">
            <iconify-icon icon="solar:pen-bold"></iconify-icon>
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showAddProductModal || showEditProductModal" class="modal-overlay" @click="closeProductForm">
      <div class="modal-container large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
            {{ showAddProductModal ? 'Thêm Sản Phẩm Mới' : 'Chỉnh Sửa Sản Phẩm' }}
          </h3>
          <button class="modal-close" @click="closeProductForm">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <form @submit.prevent="saveProduct" class="product-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Tên sản phẩm</label>
                <input type="text" v-model="productForm.name" class="form-input" placeholder="Nhập tên sản phẩm"
                  required />
              </div>
              <div class="form-group">
                <label class="form-label required">Mã sản phẩm</label>
                <input type="text" v-model="productForm.code" class="form-input" placeholder="Nhập mã sản phẩm"
                  required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Danh mục</label>
                <select v-model="productForm.categoryId" class="form-input" required>
                  <option value="">Chọn danh mục</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Thương hiệu</label>
                <select v-model="productForm.brandId" class="form-input" required>
                  <option value="">Chọn thương hiệu</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Giá bán</label>
                <input type="number" v-model="productForm.price" class="form-input" placeholder="Nhập giá bán" min="0"
                  required />
              </div>
              <div class="form-group">
                <label class="form-label required">Số lượng tồn kho</label>
                <input type="number" v-model="productForm.stock" class="form-input" placeholder="Nhập số lượng" min="0"
                  required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">URL hình ảnh</label>
                <input type="url" v-model="productForm.image" class="form-input" placeholder="Nhập URL hình ảnh" />
              </div>
              <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select v-model="productForm.status" class="form-input">
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Mô tả sản phẩm</label>
              <textarea v-model="productForm.description" class="form-textarea" placeholder="Nhập mô tả sản phẩm"
                rows="4"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn secondary" @click="closeProductForm">Hủy</button>
          <button type="button" class="btn primary" @click="saveProduct">
            <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
            {{ showAddProductModal ? 'Thêm sản phẩm' : 'Cập nhật' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-container small" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Xác nhận xóa sản phẩm</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{{ productToDelete?.name }}</strong> không?</p>
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
import { useRouter } from 'vue-router';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';

export default {
  name: 'QuanLySanPham',
  components: {
    Breadcrumb,
    DataTable
  },
  setup() {
    const router = useRouter();
    const toast = useToast();

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Quản lý', path: '/quan-ly' },
      { label: 'Sản phẩm', path: '/quan-ly-san-pham' }
    ]);

    const breadcrumbActions = ref([
      {
        label: 'Thêm sản phẩm',
        type: 'primary',
        handler: () => showAddProductModal.value = true
      },
      {
        label: 'Xuất Excel',
        type: 'default',
        handler: () => exportToExcel()
      }
    ]);

    const pageStats = ref([
      {
        value: '284',
        label: 'Tổng sản phẩm',
        icon: 'solar:box-bold-duotone'
      },
      {
        value: '45',
        label: 'Sản phẩm mới',
        icon: 'solar:add-circle-bold-duotone'
      },
      {
        value: '12',
        label: 'Sắp hết hàng',
        icon: 'solar:danger-bold-duotone'
      },
      {
        value: '98%',
        label: 'Tỷ lệ còn hàng',
        icon: 'solar:chart-square-bold-duotone'
      }
    ]);

    // State management
    const viewMode = ref('grid');
    const currentPage = ref(1);
    const itemsPerPage = ref(12);
    const gotoPage = ref('');

    // Modals
    const showDetailModal = ref(false);
    const showAddProductModal = ref(false);
    const showEditProductModal = ref(false);
    const showDeleteModal = ref(false);

    // Selected items
    const selectedProductDetail = ref(null);
    const productToDelete = ref(null);

    // Filters
    const filters = ref({
      search: '',
      category: '',
      brand: '',
      status: '',
      priceFrom: '',
      priceTo: '',
      stockLevel: '',
      sortBy: 'newest'
    });

    // Form data
    const productForm = ref({
      name: '',
      code: '',
      categoryId: '',
      brandId: '',
      price: '',
      stock: '',
      image: '',
      status: 'active',
      description: ''
    });

    // Sample data
    const categories = ref([
      { id: 1, name: 'Giày thể thao' },
      { id: 2, name: 'Giày công sở' },
      { id: 3, name: 'Giày boot' },
      { id: 4, name: 'Sandal' },
      { id: 5, name: 'Giày lười' }
    ]);

    const brands = ref([
      { id: 1, name: 'Nike' },
      { id: 2, name: 'Adidas' },
      { id: 3, name: 'Converse' },
      { id: 4, name: 'Vans' },
      { id: 5, name: 'New Balance' },
      { id: 6, name: 'Puma' }
    ]);

    // Table columns configuration
    const tableColumns = ref([
      { key: 'stt', label: 'STT', class: 'text-center' },
      { key: 'image', label: 'Hình ảnh', class: 'text-center' },
      { key: 'code', label: 'Mã SP' },
      { key: 'name', label: 'Tên sản phẩm' },
      { key: 'brand', label: 'Thương hiệu' },
      { key: 'price', label: 'Giá bán', class: 'text-right' },
      { key: 'stock', label: 'Tồn kho', class: 'text-center' },
      { key: 'status', label: 'Trạng thái', class: 'text-center' },
      { key: 'actions', label: 'Thao tác', class: 'text-center' }
    ]);

    const products = ref([
      {
        id: 1,
        code: 'SP001',
        name: 'Nike Air Max 270',
        categoryId: 1,
        brandId: 1,
        price: 2890000,
        stock: 15,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center',
        description: 'Giày thể thao Nike Air Max 270 với thiết kế hiện đại và đệm khí thoải mái.',
        createdAt: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        code: 'SP002',
        name: 'Adidas Ultraboost 22',
        categoryId: 1,
        brandId: 2,
        price: 3200000,
        stock: 8,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop&crop=center',
        description: 'Giày chạy bộ Adidas Ultraboost 22 với công nghệ Boost Energy Return.',
        createdAt: '2024-01-14T11:15:00'
      },
      {
        id: 3,
        code: 'SP003',
        name: 'Converse Chuck Taylor All Star',
        categoryId: 1,
        brandId: 3,
        price: 1590000,
        stock: 22,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
        description: 'Giày Converse Chuck Taylor All Star cổ điển, biểu tượng thời trang.',
        createdAt: '2024-01-13T09:20:00'
      },
      {
        id: 4,
        code: 'SP004',
        name: 'Vans Old Skool',
        categoryId: 1,
        brandId: 4,
        price: 1890000,
        stock: 0,
        status: 'out_of_stock',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop&crop=center',
        description: 'Giày Vans Old Skool với stripe màu trắng đặc trưng.',
        createdAt: '2024-01-12T14:45:00'
      },
      {
        id: 5,
        code: 'SP005',
        name: 'New Balance 990v5',
        categoryId: 1,
        brandId: 5,
        price: 4200000,
        stock: 5,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop&crop=center',
        description: 'New Balance 990v5 - Made in USA, chất lượng cao cấp.',
        createdAt: '2024-01-11T16:30:00'
      },
      {
        id: 6,
        code: 'SP006',
        name: 'Puma RS-X3',
        categoryId: 1,
        brandId: 6,
        price: 2650000,
        stock: 12,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&h=300&fit=crop&crop=center',
        description: 'Giày Puma RS-X3 với thiết kế chunky sneaker độc đáo.',
        createdAt: '2024-01-10T08:15:00'
      },
      {
        id: 7,
        code: 'SP007',
        name: 'Nike Air Force 1',
        categoryId: 1,
        brandId: 1,
        price: 2490000,
        stock: 25,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=300&h=300&fit=crop&crop=center',
        description: 'Nike Air Force 1 Low trắng cổ điển, không bao giờ lỗi thời.',
        createdAt: '2024-01-09T14:20:00'
      },
      {
        id: 8,
        code: 'SP008',
        name: 'Adidas Stan Smith',
        categoryId: 2,
        brandId: 2,
        price: 2190000,
        stock: 18,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center',
        description: 'Adidas Stan Smith - biểu tượng giày tennis cổ điển.',
        createdAt: '2024-01-08T12:45:00'
      },
      {
        id: 9,
        code: 'SP009',
        name: 'Converse Chuck 70',
        categoryId: 1,
        brandId: 3,
        price: 1890000,
        stock: 3,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1606894570864-3f2a1e0cbdbe?w=300&h=300&fit=crop&crop=center',
        description: 'Converse Chuck 70 cao cấp với chất liệu premium.',
        createdAt: '2024-01-07T16:30:00'
      },
      {
        id: 10,
        code: 'SP010',
        name: 'Vans Authentic',
        categoryId: 1,
        brandId: 4,
        price: 1590000,
        stock: 14,
        status: 'inactive',
        image: 'https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda?w=300&h=300&fit=crop&crop=center',
        description: 'Vans Authentic - thiết kế đơn giản, năng động.',
        createdAt: '2024-01-06T10:15:00'
      }
    ]);

    // Computed properties
    const filteredProducts = computed(() => {
      let result = [...products.value];

      // Search filter
      if (filters.value.search.trim()) {
        const search = filters.value.search.toLowerCase();
        result = result.filter(product =>
          product.name.toLowerCase().includes(search) ||
          product.code.toLowerCase().includes(search)
        );
      }

      // Category filter
      if (filters.value.category) {
        result = result.filter(product => product.categoryId === Number(filters.value.category));
      }

      // Brand filter
      if (filters.value.brand) {
        result = result.filter(product => product.brandId === Number(filters.value.brand));
      }

      // Status filter
      if (filters.value.status) {
        if (filters.value.status === 'out_of_stock') {
          result = result.filter(product => product.stock === 0);
        } else {
          result = result.filter(product => product.status === filters.value.status);
        }
      }

      // Price range filter
      if (filters.value.priceFrom) {
        result = result.filter(product => product.price >= Number(filters.value.priceFrom));
      }
      if (filters.value.priceTo) {
        result = result.filter(product => product.price <= Number(filters.value.priceTo));
      }

      // Stock level filter
      if (filters.value.stockLevel) {
        switch (filters.value.stockLevel) {
          case 'high':
            result = result.filter(product => product.stock > 50);
            break;
          case 'medium':
            result = result.filter(product => product.stock >= 10 && product.stock <= 50);
            break;
          case 'low':
            result = result.filter(product => product.stock >= 1 && product.stock < 10);
            break;
          case 'out':
            result = result.filter(product => product.stock === 0);
            break;
        }
      }

      // Sorting
      switch (filters.value.sortBy) {
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'name_asc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'stock_asc':
          result.sort((a, b) => a.stock - b.stock);
          break;
        case 'stock_desc':
          result.sort((a, b) => b.stock - a.stock);
          break;
      }

      return result;
    });

    // Grid view pagination (separate from DataTable)
    const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredProducts.value.slice(start, end);
    });

    const startItem = computed(() => {
      if (filteredProducts.value.length === 0) return 0;
      return (currentPage.value - 1) * itemsPerPage.value + 1;
    });

    const endItem = computed(() => {
      const end = currentPage.value * itemsPerPage.value;
      return Math.min(end, filteredProducts.value.length);
    });

    const visiblePages = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;
      const delta = 2;

      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const pages = [];
      pages.push(1);

      const rangeStart = Math.max(2, current - delta);
      const rangeEnd = Math.min(total - 1, current + delta);

      if (rangeStart > 2) {
        pages.push('...');
      }

      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }

      if (rangeEnd < total - 1) {
        pages.push('...');
      }

      if (total > 1) {
        pages.push(total);
      }

      return pages;
    });

    const isValidGotoPage = computed(() => {
      const page = Number(gotoPage.value);
      return page >= 1 && page <= totalPages.value && !isNaN(page);
    });


    // Utility functions
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(value || 0);
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN');
    };

    const getCategoryName = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId);
      return category ? category.name : 'Không xác định';
    };

    const getBrandName = (brandId) => {
      const brand = brands.value.find(b => b.id === brandId);
      return brand ? brand.name : 'Không xác định';
    };

    const getStatusLabel = (status) => {
      const statusMap = {
        active: 'Đang bán',
        inactive: 'Ngừng bán',
        out_of_stock: 'Hết hàng'
      };
      return statusMap[status] || status;
    };

    const getStockClass = (stock) => {
      if (stock === 0) return 'out-of-stock';
      if (stock < 10) return 'low-stock';
      return 'in-stock';
    };

    // Filter functions
    const resetFilters = () => {
      filters.value = {
        search: '',
        category: '',
        brand: '',
        status: '',
        priceFrom: '',
        priceTo: '',
        stockLevel: '',
        sortBy: 'newest'
      };
      currentPage.value = 1;
      toast.info('Đã đặt lại bộ lọc');
    };

    const applyFilters = () => {
      currentPage.value = 1;
      toast.success(`Tìm thấy ${filteredProducts.value.length} sản phẩm phù hợp`);
    };

    // Product management functions
    const selectProduct = (product) => {
      selectedProductDetail.value = product;
      showDetailModal.value = true;
    };

    const viewProduct = (product) => {
      selectedProductDetail.value = product;
      showDetailModal.value = true;
    };

    const editProduct = (product) => {
      productForm.value = {
        ...product,
        categoryId: String(product.categoryId),
        brandId: String(product.brandId),
        price: String(product.price),
        stock: String(product.stock)
      };
      showEditProductModal.value = true;
      showDetailModal.value = false;
    };

    const deleteProduct = (product) => {
      productToDelete.value = product;
      showDeleteModal.value = true;
    };

    const confirmDelete = () => {
      if (productToDelete.value) {
        const index = products.value.findIndex(p => p.id === productToDelete.value.id);
        if (index > -1) {
          products.value.splice(index, 1);
          toast.success(`Đã xóa sản phẩm "${productToDelete.value.name}"`);
        }
      }
      showDeleteModal.value = false;
      productToDelete.value = null;
    };

    const closeProductForm = () => {
      showAddProductModal.value = false;
      showEditProductModal.value = false;
      productForm.value = {
        name: '',
        code: '',
        categoryId: '',
        brandId: '',
        price: '',
        stock: '',
        image: '',
        status: 'active',
        description: ''
      };
    };

    const saveProduct = () => {
      if (!productForm.value.name || !productForm.value.code) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const productData = {
        ...productForm.value,
        categoryId: Number(productForm.value.categoryId),
        brandId: Number(productForm.value.brandId),
        price: Number(productForm.value.price),
        stock: Number(productForm.value.stock),
        createdAt: new Date().toISOString()
      };

      if (showAddProductModal.value) {
        // Add new product
        productData.id = Math.max(...products.value.map(p => p.id)) + 1;
        products.value.unshift(productData);
        toast.success(`Đã thêm sản phẩm "${productData.name}" thành công`);
      } else {
        // Update existing product
        const index = products.value.findIndex(p => p.id === productData.id);
        if (index > -1) {
          products.value[index] = { ...products.value[index], ...productData };
          toast.success(`Đã cập nhật sản phẩm "${productData.name}" thành công`);
        }
      }

      closeProductForm();
    };

    const exportToExcel = () => {
      // In real app, implement Excel export functionality
      toast.info('Tính năng xuất Excel đang được phát triển');
    };

    // Grid pagination methods
    const goToPage = () => {
      if (isValidGotoPage.value) {
        currentPage.value = Number(gotoPage.value);
        gotoPage.value = '';
        toast.success(`Đã chuyển đến trang ${currentPage.value}`);
      } else {
        toast.error(`Vui lòng nhập số trang hợp lệ (1-${totalPages.value})`);
      }
    };


    // Watch for filter changes
    watch([filters], () => {
      currentPage.value = 1;
    }, { deep: true });

    return {
      // Breadcrumb
      breadcrumbItems,
      breadcrumbActions,
      pageStats,

      // State
      viewMode,
      currentPage,
      itemsPerPage,
      gotoPage,

      // Modals
      showDetailModal,
      showAddProductModal,
      showEditProductModal,
      showDeleteModal,

      // Selected items
      selectedProductDetail,
      productToDelete,

      // Filters
      filters,

      // Form
      productForm,

      // Data
      categories,
      brands,
      products,
      filteredProducts,
      paginatedProducts,
      totalPages,
      startItem,
      endItem,
      visiblePages,
      isValidGotoPage,
      tableColumns,

      // Utility functions
      formatCurrency,
      formatDate,
      getCategoryName,
      getBrandName,
      getStatusLabel,
      getStockClass,

      // Filter functions
      resetFilters,
      applyFilters,

      // Pagination functions
      goToPage,


      // Product functions
      selectProduct,
      viewProduct,
      editProduct,

      // Other functions
      deleteProduct,
      confirmDelete,
      closeProductForm,
      saveProduct,
      exportToExcel
    };
  }
}
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.quan-ly-san-pham-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== FILTER SECTION ===== */
.filter-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
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
  gap: 20px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.filter-input,
.filter-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* ===== PRICE FILTER STYLES ===== */
.price-filter-group {
  min-width: 280px;
}

.price-inputs {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.price-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-sub-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 2px;
}

.price-input-wrapper .filter-input {
  width: 100%;
}

.apply-filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.products-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.view-btn.active {
  background: white;
  color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-product-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.add-product-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

/* ===== PRODUCTS GRID ===== */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  border-color: #007bff;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 123, 255, 0.15);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: all 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-status {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.product-status.active {
  background: #dcfce7;
  color: #166534;
}

.product-status.inactive {
  background: #fef3c7;
  color: #92400e;
}

.product-status.out_of_stock {
  background: #fee2e2;
  color: #991b1b;
}

.product-info {
  padding: 20px;
}

.product-code {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 4px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 6px;
  line-height: 1.3;
}

.product-brand {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 8px;
}

.product-price {
  font-size: 1.15rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 6px;
}

.product-stock {
  font-size: 0.9rem;
  font-weight: 600;
}

.product-stock.in-stock {
  color: #166534;
}

.product-stock.low-stock {
  color: #d97706;
}

.product-stock.out-of-stock {
  color: #dc2626;
}


.table-product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.table-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.table-product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.table-product-name {
  font-weight: 600;
  color: #1a202c;
  font-size: 0.95rem;
}

.table-product-category {
  font-size: 0.8rem;
  color: #64748b;
}

.product-code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.price {
  font-weight: 600;
  color: #059669;
}

.stock {
  font-weight: 600;
}

.stock.in-stock {
  color: #166534;
}

.stock.low-stock {
  color: #d97706;
}

.stock.out-of-stock {
  color: #dc2626;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.out_of_stock {
  background: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 8px;
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
  color: #1d4ed8;
}

.action-btn.edit {
  background: #dcfce7;
  color: #166534;
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* ===== PAGINATION FOOTER ===== */
.pagination-footer {
  margin-top: 24px;
}

/* ===== PAGINATION STYLES ===== */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  gap: 20px;
  flex-wrap: wrap;
}

.pagination-info-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.pagination-summary {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.page-size-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 16px;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #007bff;
  color: #007bff;
  background: #f0f8ff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 8px;
}

.page-number-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0 8px;
}

.page-number-btn:hover:not(:disabled):not(.ellipsis) {
  border-color: #007bff;
  color: #007bff;
  background: #f0f8ff;
}

.page-number-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.page-number-btn.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
  color: #9ca3af;
}

.pagination-info-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
  min-width: 200px;
}

.pagination-current {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.goto-page {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.goto-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  background: white;
}

.goto-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.goto-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.goto-btn:hover:not(:disabled) {
  border-color: #007bff;
  color: #007bff;
  background: #f0f8ff;
}

.goto-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  grid-column: 1 / -1;
}

.empty-icon {
  font-size: 4rem;
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-state h4 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
}

.empty-state p {
  color: #94a3b8;
  margin-bottom: 24px;
  font-size: 1rem;
}

.empty-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

.empty-message {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 40px 20px;
}

/* ===== MODAL STYLES ===== */
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
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-container.small {
  width: 400px;
}

.modal-container.large {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #374151;
}

.modal-content {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

/* ===== PRODUCT DETAIL MODAL ===== */
.product-detail {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
}

.detail-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-image {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-group {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: start;
}

.info-group.full-width {
  grid-template-columns: 1fr;
  gap: 8px;
}

.info-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.info-group span {
  color: #1a202c;
  font-size: 0.95rem;
}

.price-highlight {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #059669 !important;
}

.description {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

/* ===== PRODUCT FORM ===== */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc2626;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-width: 120px;
}

.btn.primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

.btn.danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.btn.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* ===== WARNING TEXT ===== */
.warning-text {
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 8px;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1200px) {
  .filter-row {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 992px) {
  .filter-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .price-inputs {
    flex-direction: column;
    gap: 12px;
  }
  
  .price-filter-group {
    min-width: auto;
  }

  .price-separator {
    display: none;
  }
}

@media (max-width: 768px) {
  .quan-ly-san-pham-container {
    padding: 12px;
  }

  .filter-section,
  .products-section {
    padding: 16px;
    border-radius: 12px;
  }

  .filter-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    text-align: center;
  }

  .filter-title {
    font-size: 1.1rem;
    justify-content: center;
  }

  .reset-filter-btn {
    align-self: center;
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .filter-content {
    gap: 16px;
  }

  .filter-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .filter-group {
    gap: 8px;
  }

  .filter-label {
    font-size: 0.85rem;
  }

  .filter-input,
  .filter-select {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .price-inputs {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .price-input-wrapper {
    width: 100%;
  }

  .price-input {
    width: 100%;
  }

  .price-sub-label {
    font-size: 0.75rem;
  }

  .price-separator {
    display: block;
    text-align: center;
    font-weight: 700;
    color: #94a3b8;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .section-title {
    font-size: 1.1rem;
    justify-content: center;
  }

  .section-actions {
    justify-content: center;
    gap: 12px;
  }

  .view-toggle {
    order: 1;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .product-detail {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .detail-image {
    height: 250px;
  }

  .info-group {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .modal-container.large {
    width: 95vw;
    margin: 10px;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 16px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .pagination-info-left,
  .pagination-info-right {
    min-width: auto;
    width: 100%;
    align-items: center;
    text-align: center;
  }

  .pagination {
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  .page-numbers {
    margin: 0 4px;
  }

  .goto-page {
    justify-content: center;
  }

  .btn {
    min-width: 100px;
    padding: 10px 16px;
  }

  .products-table th,
  .products-table td {
    padding: 12px 8px;
    font-size: 0.85rem;
  }

  .table-product-image {
    width: 40px;
    height: 40px;
  }
}

/* ===== LOADING STATES ===== */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* ===== ACCESSIBILITY ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles for better accessibility */
.filter-input:focus,
.filter-select:focus,
.form-input:focus,
.form-textarea:focus,
.btn:focus,
.action-btn:focus,
.pagination-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .product-card {
    border-width: 2px;
  }

  .btn {
    border: 2px solid currentColor;
  }

  .status-badge {
    border: 1px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode support (if needed in the future) */
@media (prefers-color-scheme: dark) {
  .quan-ly-san-pham-container {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    color: #f7fafc;
  }

  .filter-section,
  .products-section {
    background: #2d3748;
    color: #f7fafc;
  }

  .filter-input,
  .filter-select,
  .form-input,
  .form-textarea {
    background: #4a5568;
    border-color: #718096;
    color: #f7fafc;
  }

  .products-table th {
    background: #4a5568;
    color: #e2e8f0;
  }

  .products-table tbody tr:hover {
    background: #4a5568;
  }
}
</style>