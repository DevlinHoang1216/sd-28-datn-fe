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
      <!-- Products List -->
      <div class="products-section">
        <div class="section-header">
          <h3 class="section-title">
            <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
            Danh Sách Sản Phẩm ({{ totalElements }})
          </h3>
        </div>

        <!-- List View -->
        <div>
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
          <DataTable v-else :data="filteredProducts" :columns="tableColumns" item-label="sản phẩm"
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
                <span class="table-product-category">{{ item.categoryName || getCategoryName(item.categoryId) }}</span>
              </div>
            </template>

            <!-- Category Column -->
            <template #category="{ item }">
              <span class="category-badge">{{ item.categoryName || getCategoryName(item.categoryId) }}</span>
            </template>

            <!-- Brand Column -->
            <template #brand="{ item }">
              <span class="brand-badge">{{ item.brandName || getBrandName(item.brandId) }}</span>
            </template>

            <!-- Country Column -->
            <template #country="{ item }">
              <span class="country-info">{{ item.country || 'Không xác định' }}</span>
            </template>

            <!-- Created Date Column -->
            <template #createdDate="{ item }">
              <span class="created-date">{{ formatDate(item.createdDate) }}</span>
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
                <button @click="viewProduct(item)" class="action-btn view" title="Xem chi tiết sản phẩm">
                  <iconify-icon icon="solar:eye-bold"></iconify-icon>
                </button>
                <button @click="editProduct(item)" class="action-btn edit" title="Chỉnh sửa">
                  <iconify-icon icon="solar:pen-bold"></iconify-icon>
                </button>
                <label class="toggle-switch" :title="item.status === 'active' ? 'Tạm ngưng bán' : 'Tiếp tục bán'">
                  <input
                    type="checkbox"
                    :checked="item.status === 'active'"
                    @change="toggleProductStatus(item)"
                    class="sr-only peer"
                  />
                  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </template>
          </DataTable>
          
          <!-- Pagination Controls -->
          <div v-if="!loading && totalPages > 1" class="pagination-container">
            <div class="pagination-info">
              <span>Hiển thị {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalElements) }} của {{ totalElements }} sản phẩm</span>
            </div>
            <div class="pagination-controls">
              <button 
                @click="goToPage(0)" 
                :disabled="currentPage === 0"
                class="pagination-btn"
                title="Trang đầu">
                <iconify-icon icon="solar:double-alt-arrow-left-bold"></iconify-icon>
              </button>
              <button 
                @click="goToPage(currentPage - 1)" 
                :disabled="currentPage === 0"
                class="pagination-btn"
                title="Trang trước">
                <iconify-icon icon="solar:alt-arrow-left-bold"></iconify-icon>
              </button>
              
              <div class="page-numbers">
                <button 
                  v-for="page in getVisiblePages()" 
                  :key="page"
                  @click="goToPage(page - 1)"
                  :class="['page-number', { active: page - 1 === currentPage }]">
                  {{ page }}
                </button>
              </div>
              
              <button 
                @click="goToPage(currentPage + 1)" 
                :disabled="currentPage >= totalPages - 1"
                class="pagination-btn"
                title="Trang sau">
                <iconify-icon icon="solar:alt-arrow-right-bold"></iconify-icon>
              </button>
              <button 
                @click="goToPage(totalPages - 1)" 
                :disabled="currentPage >= totalPages - 1"
                class="pagination-btn"
                title="Trang cuối">
                <iconify-icon icon="solar:double-alt-arrow-right-bold"></iconify-icon>
              </button>
            </div>
            <div class="page-size-selector">
              <label>Hiển thị:</label>
              <select v-model="pageSize" @change="changePageSize" class="page-size-select">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>/ trang</span>
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


    <!-- Product Details Modal -->
    <div v-if="showProductDetailsModal" class="modal-overlay" @click="closeProductDetailsModal">
      <div class="modal-container extra-large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
            Chi Tiết Biến Thể - {{ selectedProductForDetails?.name }}
          </h3>
          <button class="modal-close" @click="closeProductDetailsModal">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <div v-if="detailsLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Đang tải chi tiết sản phẩm...</p>
          </div>
          <div v-else>
            <div class="details-table-container">
              <table class="details-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Chất liệu</th>
                    <th>Màu sắc</th>
                    <th>Kích cỡ</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(detail, index) in productDetails" :key="detail.id">
                    <td>{{ (detailsCurrentPage * detailsPageSize) + index + 1 }}</td>
                    <td>{{ detail.material }}</td>
                    <td>{{ detail.color }}</td>
                    <td>{{ detail.size }}</td>
                    <td class="price">{{ formatCurrency(detail.price) }}</td>
                    <td class="stock" :class="getStockClass(detail.stock)">{{ detail.stock }}</td>
                    <td>
                      <span class="status-badge" :class="detail.status">
                        {{ getStatusLabel(detail.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Details Pagination -->
              <div v-if="detailsTotalPages > 1" class="pagination-container">
                <div class="pagination-info">
                  <span>Hiển thị {{ (detailsCurrentPage * detailsPageSize) + 1 }} - {{ Math.min((detailsCurrentPage + 1) * detailsPageSize, detailsTotalElements) }} của {{ detailsTotalElements }} biến thể</span>
                </div>
                <div class="pagination-controls">
                  <button @click="goToDetailsPage(0)" :disabled="detailsCurrentPage === 0" class="pagination-btn">
                    <iconify-icon icon="solar:double-alt-arrow-left-bold"></iconify-icon>
                  </button>
                  <button @click="goToDetailsPage(detailsCurrentPage - 1)" :disabled="detailsCurrentPage === 0" class="pagination-btn">
                    <iconify-icon icon="solar:alt-arrow-left-bold"></iconify-icon>
                  </button>
                  
                  <div class="page-numbers">
                    <button v-for="page in getDetailsVisiblePages()" :key="page" @click="goToDetailsPage(page - 1)" :class="['page-number', { active: page - 1 === detailsCurrentPage }]">
                      {{ page }}
                    </button>
                  </div>
                  
                  <button @click="goToDetailsPage(detailsCurrentPage + 1)" :disabled="detailsCurrentPage >= detailsTotalPages - 1" class="pagination-btn">
                    <iconify-icon icon="solar:alt-arrow-right-bold"></iconify-icon>
                  </button>
                  <button @click="goToDetailsPage(detailsTotalPages - 1)" :disabled="detailsCurrentPage >= detailsTotalPages - 1" class="pagination-btn">
                    <iconify-icon icon="solar:double-alt-arrow-right-bold"></iconify-icon>
                  </button>
                </div>
                <div class="page-size-selector">
                  <label>Hiển thị:</label>
                  <select v-model="detailsPageSize" @change="changeDetailsPageSize" class="page-size-select">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span>/ trang</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="closeProductDetailsModal">Đóng</button>
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
import { productService } from '@/services/api/productAPI.js';

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
        handler: () => router.push('/san-pham/them')
      },
      {
        label: 'Xuất Excel',
        type: 'default',
        handler: () => exportToExcel()
      }
    ]);

    const pageStats = computed(() => [
      {
        value: totalElements.value.toString(),
        label: 'Tổng sản phẩm',
        icon: 'solar:box-bold-duotone'
      },
      {
        value: products.value.filter(p => p.status === 'active').length.toString(),
        label: 'Đang bán',
        icon: 'solar:add-circle-bold-duotone'
      },
      {
        value: products.value.filter(p => p.status === 'inactive').length.toString(),
        label: 'Ngừng bán',
        icon: 'solar:danger-bold-duotone'
      },
      {
        value: currentPage.value + 1 + '/' + totalPages.value,
        label: 'Trang hiện tại',
        icon: 'solar:chart-square-bold-duotone'
      }
    ]);

    // State management
    const loading = ref(false);
    const products = ref([]);
    const totalElements = ref(0);
    const totalPages = ref(0);
    const currentPage = ref(0);
    const pageSize = ref(10);

    // Modals
    const showDetailModal = ref(false);
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

    // Table columns configuration - Updated to match API data
    const tableColumns = ref([
      { key: 'stt', label: 'STT', class: 'text-center' },
      { key: 'image', label: 'Hình ảnh', class: 'text-center' },
      { key: 'code', label: 'Mã SP' },
      { key: 'name', label: 'Tên sản phẩm' },
      { key: 'category', label: 'Danh mục' },
      { key: 'brand', label: 'Thương hiệu' },
      { key: 'country', label: 'Quốc gia SX' },
      { key: 'createdDate', label: 'Ngày tạo' },
      { key: 'status', label: 'Trạng thái', class: 'text-center' },
      { key: 'actions', label: 'Hành động', class: 'text-center' }
    ]);

    // API functions
    const fetchProducts = async () => {
      try {
        loading.value = true;
        const sortBy = getSortField();
        const sortDir = getSortDirection();
        
        const response = await productService.getProductsWithDetailsPaged({
          page: currentPage.value,
          size: pageSize.value,
          sortBy,
          sortDir
        });
        
        products.value = response.data.content.map(product => ({
          id: product.id,
          code: product.ma,
          name: product.tenSanPham,
          categoryId: product.idDanhMuc?.id,
          brandId: product.idThuongHieu?.id,
          categoryName: product.idDanhMuc?.tenDanhMuc,
          brandName: product.idThuongHieu?.tenThuongHieu,
          country: product.quocGiaSanXuat,
          status: product.deleted ? 'inactive' : 'active',
          image: product.idAnhSanPham?.urlAnh || 'https://via.placeholder.com/300x300?text=No+Image',
          description: product.moTaSanPham,
          createdAt: product.ngayTao,
          createdDate: product.ngayTao
        }));
        
        totalElements.value = response.data.totalElements;
        totalPages.value = response.data.totalPages;
        
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Lỗi khi tải danh sách sản phẩm');
        products.value = [];
      } finally {
        loading.value = false;
      }
    };

    const getSortField = () => {
      const sortMap = {
        'newest': 'ngayTao',
        'oldest': 'ngayTao',
        'name_asc': 'tenSanPham',
        'name_desc': 'tenSanPham',
        'price_asc': 'id', // Default to id since price not in main entity
        'price_desc': 'id',
        'stock_asc': 'id',
        'stock_desc': 'id'
      };
      return sortMap[filters.value.sortBy] || 'id';
    };

    const getSortDirection = () => {
      const dirMap = {
        'newest': 'desc',
        'oldest': 'asc',
        'name_asc': 'asc',
        'name_desc': 'desc',
        'price_asc': 'asc',
        'price_desc': 'desc',
        'stock_asc': 'asc',
        'stock_desc': 'desc'
      };
      return dirMap[filters.value.sortBy] || 'asc';
    };

    // Computed properties - Updated for API data
    const filteredProducts = computed(() => {
      let result = [...products.value];

      // Search filter
      if (filters.value.search.trim()) {
        const search = filters.value.search.trim().toLowerCase();
        result = result.filter(product =>
          product.name.toLowerCase().includes(search) ||
          product.code.toLowerCase().includes(search) ||
          (product.description && product.description.toLowerCase().includes(search))
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
        result = result.filter(product => product.status === filters.value.status);
      }

      // Note: Price and stock filters removed since not available in main product entity
      // These would need to be implemented with product details API

      return result;
    });




    // Utility functions
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    const getStockClass = (stock) => {
      if (stock === 0) return 'out-of-stock';
      if (stock < 10) return 'low-stock';
      return 'in-stock';
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
        inactive: 'Tạm ngưng bán',
        out_of_stock: 'Hết hàng'
      };
      return statusMap[status] || 'Không xác định';
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
      toast.info('Đã đặt lại bộ lọc');
    };

    const applyFilters = () => {
      toast.success(`Tìm thấy ${filteredProducts.value.length} sản phẩm phù hợp`);
    };

    // Product management functions
    const selectProduct = (product) => {
      selectedProductDetail.value = product;
      showDetailModal.value = true;
    };

    const viewProduct = (product) => {
      // Navigate to product detail management page
      router.push({ name: 'ChiTietSanPham', params: { id: product.id } });
    };

    // Product details state
    const showProductDetailsModal = ref(false);
    const selectedProductForDetails = ref(null);
    const productDetails = ref([]);
    const detailsLoading = ref(false);
    const detailsTotalElements = ref(0);
    const detailsTotalPages = ref(0);
    const detailsCurrentPage = ref(0);
    const detailsPageSize = ref(10);

    // Fetch product details
    const fetchProductDetails = async (productId) => {
      try {
        detailsLoading.value = true;
        const response = await productService.getProductDetailsWithDetailsPaged(productId, {
          page: detailsCurrentPage.value,
          size: detailsPageSize.value,
          sortBy: 'id',
          sortDir: 'asc'
        });
        
        productDetails.value = response.data.content.map(detail => ({
          id: detail.id,
          productId: detail.idSanPham?.id,
          productName: detail.idSanPham?.tenSanPham,
          material: detail.idChatLieu?.tenChatLieu || 'Không xác định',
          color: detail.idMauSac?.tenMauSac || 'Không xác định',
          size: detail.idKichCo?.tenKichCo || 'Không xác định',
          price: detail.giaBan || 0,
          stock: detail.soLuongTon || 0,
          status: detail.deleted ? 'inactive' : 'active',
          createdAt: detail.ngayTao
        }));
        
        detailsTotalElements.value = response.data.totalElements;
        detailsTotalPages.value = response.data.totalPages;
        
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Lỗi khi tải chi tiết sản phẩm');
        productDetails.value = [];
      } finally {
        detailsLoading.value = false;
      }
    };

    // Show product details modal
    const showProductDetails = (product) => {
      selectedProductForDetails.value = product;
      detailsCurrentPage.value = 0;
      showProductDetailsModal.value = true;
      fetchProductDetails(product.id);
    };

    // Close product details modal
    const closeProductDetailsModal = () => {
      showProductDetailsModal.value = false;
      selectedProductForDetails.value = null;
      productDetails.value = [];
      detailsCurrentPage.value = 0;
    };

    // Pagination for product details
    const goToDetailsPage = (page) => {
      if (page >= 0 && page < detailsTotalPages.value && page !== detailsCurrentPage.value) {
        detailsCurrentPage.value = page;
        fetchProductDetails(selectedProductForDetails.value.id);
      }
    };

    const changeDetailsPageSize = () => {
      detailsCurrentPage.value = 0;
      fetchProductDetails(selectedProductForDetails.value.id);
    };

    const getDetailsVisiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, detailsCurrentPage.value + 1 - Math.floor(maxVisible / 2));
      let end = Math.min(detailsTotalPages.value, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    const editProduct = (product) => {
      router.push(`/san-pham/sua/${product.id}`);
    };

    const deleteProduct = (product) => {
      productToDelete.value = product;
      showDeleteModal.value = true;
    };

    const toggleProductStatus = async (product) => {
  try {
    const index = products.value.findIndex(p => p.id === product.id)
    if (index !== -1) {
      const newStatus = product.status === 'active' ? 'inactive' : 'active'
      products.value[index] = {
        ...products.value[index],
        status: newStatus
      }
      
      const statusText = newStatus === 'active' ? 'tiếp tục bán' : 'tạm ngưng bán'
      toast.success(`Đã ${statusText} sản phẩm "${product.name}"!`)
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái sản phẩm:', error)
    toast.error('Lỗi khi cập nhật trạng thái sản phẩm.')
  }
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


    const exportToExcel = () => {
      // In real app, implement Excel export functionality
      toast.info('Tính năng xuất Excel đang được phát triển');
      // Add new code here
      const data = filteredProducts.value.map(product => ({
        'Mã sản phẩm': product.code,
        'Tên sản phẩm': product.name,
        'Danh mục': getCategoryName(product.categoryId),
        'Thương hiệu': getBrandName(product.brandId),
        'Giá bán': formatCurrency(product.price),
        'Số lượng tồn': product.stock,
        'Trạng thái': getStatusLabel(product.status)
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
      XLSX.writeFile(workbook, 'san-pham.xlsx');
      console.log('Export to Excel button clicked');
    };



    // Pagination functions
    const goToPage = (page) => {
      if (page >= 0 && page < totalPages.value && page !== currentPage.value) {
        currentPage.value = page;
        fetchProducts();
      }
    };

    const changePageSize = () => {
      currentPage.value = 0;
      fetchProducts();
    };

    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage.value + 1 - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages.value, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    // Watch for filter changes
    watch([filters], () => {
      currentPage.value = 0;
      fetchProducts();
    }, { deep: true });

    // Initialize data on component mount
    onMounted(() => {
      fetchProducts();
    });

    return {
      // Breadcrumb
      breadcrumbItems,
      breadcrumbActions,
      pageStats,

      // State
      loading,
      totalElements,
      totalPages,
      currentPage,
      pageSize,

      // Modals
      showDetailModal,
      showDeleteModal,

      // Selected items
      selectedProductDetail,
      productToDelete,

      // Filters
      filters,


      // Data
      categories,
      brands,
      products,
      filteredProducts,
      tableColumns,

      // API functions
      fetchProducts,

      // Pagination functions
      goToPage,
      changePageSize,
      getVisiblePages,

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



      // Product functions
      selectProduct,
      viewProduct,
      editProduct,

      // Other functions
      deleteProduct,
      confirmDelete,
      exportToExcel
    };
  }
}
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.quan-ly-san-pham-container {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== LOADING STYLES ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

.loading-container p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
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

/* ===== PAGINATION STYLES ===== */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
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
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
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

.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.page-number:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.page-number.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.page-size-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ===== TABLE COLUMN STYLES ===== */
.country-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.created-date {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.brand-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #f3e8ff;
  color: #7c3aed;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
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
  gap: 16px;
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

.toggle-switch {
  display: inline-block;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

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

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
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

  .form-row {
    grid-template-columns: 1fr;
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

/* ===== NEW COLUMN STYLES ===== */
.category-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0277bd;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.brand-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #f3e5f5;
  color: #7b1fa2;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.material-info {
  color: #424242;
  font-size: 0.9rem;
  font-style: italic;
}

.variant-count {
  display: inline-block;
  padding: 4px 8px;
  background: #fff3e0;
  color: #ef6c00;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
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