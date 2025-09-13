```vue
<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4 md:p-6 font-roboto transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Chỉnh Sửa Đợt Giảm Giá"
      page-description="Cập nhật thông tin đợt giảm giá và sản phẩm áp dụng"
      page-icon="solar:pen-bold-duotone"
    />

    <form @submit.prevent="saveChanges" class="space-y-6">
      <!-- Campaign Information -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <iconify-icon icon="solar:info-circle-bold-duotone" class="text-xl mr-2"></iconify-icon>
          Thông Tin Đợt Giảm Giá
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã Đợt Giảm Giá
            </label>
            <input
              v-model="campaign.ma"
              type="text"
              disabled
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Đợt Giảm Giá *
            </label>
            <input
              v-model="campaign.tenDotGiamGia"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="Nhập tên đợt giảm giá"
            />
          </div>

          <!-- ĐÃ XÓA MÔ TẢ -->
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thời Gian Bắt Đầu *
            </label>
            <input
              v-model="campaign.thoiGianBatDau"
              type="datetime-local"
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thời Gian Kết Thúc *
            </label>
            <input
              v-model="campaign.thoiGianKetThuc"
              type="datetime-local"
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>
        </div>

        <!-- Discount Configuration -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Cấu Hình Giảm Giá</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại Giảm Giá *
              </label>
              <select
                v-model="discountConfig.type"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Tiền mặt (VNĐ)</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giá Trị Giảm *
              </label>
              <input
                v-model.number="discountConfig.value"
                type="number"
                :min="discountConfig.type === 'percentage' ? 1 : 1000"
                :max="discountConfig.type === 'percentage' ? 100 : 10000000"
                :step="discountConfig.type === 'percentage' ? 1 : 1000"
                required
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                :placeholder="discountConfig.type === 'percentage' ? 'Nhập % giảm (1-100)' : 'Nhập số tiền giảm'"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số Tiền Giảm Tối Đa
              </label>
              <input
                v-model.number="discountConfig.soTienGiamToiDa"
                type="number"
                :min="0"
                :step="1000"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Nhập số tiền giảm tối đa (VNĐ)"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Áp Dụng Cho
              </label>
              <select
                v-model="discountConfig.applyTo"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="selected">Biến thể đã chọn</option>
                <option value="all">Tất cả biến thể</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Selection -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <iconify-icon icon="solar:box-bold-duotone" class="text-xl mr-2"></iconify-icon>
            Sản Phẩm Áp Dụng
          </h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Đã chọn: {{ selectedProducts.length }} sản phẩm | {{ selectedProductDetails.length }} biến thể
            </span>
            <button
              type="button"
              @click="clearAllSelections"
              class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingProducts" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Đang tải danh sách sản phẩm...</p>
        </div>
        
        <!-- Two Tables Side by Side -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Table: Main Products -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Danh Sách Sản Phẩm
                <span class="text-sm font-normal text-gray-500">({{ filteredProducts.length }} sản phẩm)</span>
              </h3>
            </div>

            <!-- Product Filters -->
            <div class="grid grid-cols-1 gap-3 mb-4">
              <div>
                <input
                  v-model="filters.productSearch"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  class="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white transition-colors"
                />
              </div>
              
              <div class="flex gap-2">
                <select
                  v-model="filters.productStatus"
                  class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white transition-colors"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
                
                <button
                  type="button"
                  @click="toggleAllProducts"
                  class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
                >
                  {{ allProductsSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
                </button>
              </div>
            </div>

            <!-- Products DataTable -->
            <DataTable
              :data="filteredProducts"
              :columns="productTableColumns"
              item-label="sản phẩm"
              empty-message="Không có sản phẩm nào được tìm thấy."
              key-field="id"
              :max-height="400"
            >
              <template #selection="{ item }">
                <input
                  type="checkbox"
                  :checked="isProductSelected(item.id)"
                  @change="toggleProductSelection(item)"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </template>
              
              <template #anhSanPham="{ item }">
                <img 
                  :src="item.anhSanPham" 
                  :alt="item.tenSanPham"
                  class="w-12 h-12 object-cover rounded-lg"
                  @error="$event.target.src = '/default-product.png'"
                />
              </template>
              
              <template #maSanPham="{ item }">
                <span class="font-bold text-gray-800 dark:text-gray-100">{{ item.maSanPham }}</span>
              </template>
              
              <template #tenSanPham="{ item }">
                <span class="font-medium">{{ item.tenSanPham }}</span>
              </template>
              
              <template #soLuongBienThe="{ item }">
                <span class="text-center">{{ item.chiTietSanPhams.length }}</span>
              </template>
              
              <template #giaThapNhat="{ item }">
                <span class="font-semibold text-right">{{ formatCurrency(item.giaThapNhat) }}</span>
              </template>
            </DataTable>

            <!-- Pagination Controls -->
            <div class="flex justify-between items-center mt-4">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Hiển thị {{ pagination.totalElements ? (pagination.page * pagination.size + 1) : 0 }} - 
                {{ Math.min((pagination.page + 1) * pagination.size, pagination.totalElements) }} 
                / {{ pagination.totalElements }} sản phẩm
              </div>
              <div class="flex gap-2">
                <button
                  :disabled="pagination.page === 0"
                  @click="changePage(pagination.page - 1)"
                  class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  v-for="page in Array.from({ length: pagination.totalPages }, (_, i) => i)"
                  :key="page"
                  @click="changePage(page)"
                  :class="['px-3 py-2 text-sm rounded-lg', pagination.page === page ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
                >
                  {{ page + 1 }}
                </button>
                <button
                  :disabled="pagination.page >= pagination.totalPages - 1"
                  @click="changePage(pagination.page + 1)"
                  class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>

          <!-- Right Table: Product Variants -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Biến Thể Sản Phẩm
                <span class="text-sm font-normal text-gray-500">({{ filteredVariants.length }} biến thể)</span>
              </h3>
            </div>

            <div v-if="selectedProducts.length === 0" class="text-center justify-center items-center d-flex row py-12 text-gray-500 dark:text-gray-400">
              <iconify-icon icon="solar:box-outline" class="text-4xl mb-2"></iconify-icon>
              <p>Chọn sản phẩm bên trái để xem biến thể</p>
            </div>

            <div v-else>
              <!-- Variant Filters -->
              <div class="grid grid-cols-1 gap-3 mb-4">
                <div>
                  <input
                    v-model="filters.variantSearch"
                    type="text"
                    placeholder="Tìm kiếm biến thể..."
                    class="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white transition-colors"
                  />
                </div>
                
                <div class="flex gap-2">
                  <select
                    v-model="filters.variantStatus"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white transition-colors"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng bán</option>
                  </select>
                  
                  <button
                    type="button"
                    @click="toggleAllVariants"
                    class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
                  >
                    {{ allFilteredVariantsSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
                  </button>
                </div>
              </div>

              <!-- Variants DataTable -->
              <DataTable
                :data="filteredVariants"
                :columns="variantTableColumns"
                item-label="biến thể"
                empty-message="Không có biến thể nào được tìm thấy."
                key-field="id"
                :max-height="400"
              >
                <template #selection="{ item }">
                  <input
                    type="checkbox"
                    :checked="isVariantSelected(item.id)"
                    @change="toggleVariantSelection(item)"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </template>
                
                <template #anhSanPham="{ item }">
                  <img 
                    :src="item.anhSanPham" 
                    :alt="item.tenSanPham"
                    class="w-12 h-12 object-cover rounded-lg"
                    @error="$event.target.src = '/default-product.png'"
                  />
                </template>
                
                <template #tenSanPham="{ item }">
                  <span class="font-medium">{{ item.tenSanPham }}</span>
                </template>
                
                <template #mauSac="{ item }">
                  <span class="text-gray-600 dark:text-gray-400">{{ item.mauSac }}</span>
                </template>
                
                <template #kichThuoc="{ item }">
                  <span class="text-gray-600 dark:text-gray-400">{{ item.kichThuoc }}</span>
                </template>
                
                <template #giaBan="{ item }">
                  <span class="font-semibold text-right">{{ formatCurrency(item.giaBan) }}</span>
                </template>
                
                <template #giaSauKhiGiam="{ item }">
                  <span class="font-semibold text-right text-green-600">{{ formatCurrency(item.giaSauKhiGiam) }}</span>
                </template>
                
                <template #soLuong="{ item }">
                  <span class="text-center">{{ item.soLuong }}</span>
                </template>
              </DataTable>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="cancelEdit"
            class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="btn-primary"
          >
            Cập Nhật Đợt Giảm Giá
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';
import axios from 'axios';

export default {
  name: 'EditDotGiamGia',
  components: {
    Breadcrumb,
    DataTable,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const campaignId = route.params.id;

    const API_BASE_URL = 'http://localhost:8080/api/san-pham';
    const API_CAMPAIGN_URL = 'http://localhost:8080/api/dot-giam-gia/detail';

    // Breadcrumb configuration
    const breadcrumbItems = ref([
      { label: 'Đợt giảm giá', path: '/dot-giam-gia' },
      { label: 'Chỉnh sửa', path: `/dot-giam-gia/edit/${campaignId}` },
    ]);

    const breadcrumbActions = ref([
      {
        label: 'Danh sách đợt giảm giá',
        type: 'default',
        handler: () => router.push('/dot-giam-gia'),
      },
      {
        label: 'Làm mới',
        type: 'default',
        handler: () => window.location.reload(),
      },
    ]);

    const campaign = ref({
      id: null,
      ma: '',
      tenDotGiamGia: '',
      thoiGianBatDau: '',
      thoiGianKetThuc: '',
      // trangThai: 'DANG_DIEN_RA', // XÓA DÒNG NÀY
    });

    const loadingProducts = ref(false);
    const selectedProducts = ref([]);
    const selectedProductDetails = ref([]);
    const filters = ref({
      productSearch: '',
      productStatus: '',
      variantSearch: '',
      variantStatus: '',
    });

    const discountConfig = ref({
      type: 'percentage',
      value: 10,
      soTienGiamToiDa: null,
      applyTo: 'selected',
    });

    const pagination = ref({
      page: 0,
      size: 10,
      sortBy: 'id',
      sortDir: 'asc',
      totalElements: 0,
      totalPages: 0,
    });

    const allProducts = ref([]);

    const productTableColumns = ref([
      { key: 'selection', label: '', class: 'text-center', width: '50px' },
      { key: 'anhSanPham', label: 'Ảnh', class: 'text-center', width: '80px' },
      { key: 'maSanPham', label: 'Mã SP', class: 'font-weight-bold' },
      { key: 'tenSanPham', label: 'Tên Sản Phẩm' },
      { key: 'soLuongBienThe', label: 'Biến Thể', class: 'text-center' },
      { key: 'giaThapNhat', label: 'Giá Từ', class: 'text-right' },
      // { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' }, // XÓA DÒNG NÀY
    ]);

    const variantTableColumns = ref([
      { key: 'selection', label: '', class: 'text-center', width: '50px' },
      { key: 'anhSanPham', label: 'Ảnh', class: 'text-center', width: '80px' },
      { key: 'tenSanPham', label: 'Sản Phẩm' },
      { key: 'mauSac', label: 'Màu Sắc' },
      { key: 'kichThuoc', label: 'Size' },
      { key: 'giaBan', label: 'Giá Bán', class: 'text-right' },
      { key: 'giaSauKhiGiam', label: 'Giá Sau Giảm', class: 'text-right' },
      { key: 'soLuong', label: 'SL', class: 'text-center' },
      // { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' }, // XÓA DÒNG NÀY
    ]);

    const formatDateForInput = (dateTimeString) => {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const mapProductData = (apiProduct) => {
      return {
        id: apiProduct.id,
        maSanPham: apiProduct.ma,
        tenSanPham: apiProduct.tenSanPham,
        anhSanPham: apiProduct.idAnhSanPham?.urlAnh || '/default-product.png',
        trangThai: !apiProduct.deleted,
        giaThapNhat: apiProduct.chiTietSanPhams?.length
          ? Math.min(
              ...apiProduct.chiTietSanPhams
                .filter((variant) => !variant.deleted)
                .map((variant) => variant.giaBan)
            )
          : 0,
        chiTietSanPhams: apiProduct.chiTietSanPhams
          .filter((variant) => !variant.deleted)
          .map((variant) => ({
            id: variant.id,
            tenSanPham: apiProduct.tenSanPham,
            anhSanPham: apiProduct.idAnhSanPham?.urlAnh || '/default-product.png',
            mauSac: variant.idMauSac?.tenMauSac || 'N/A',
            kichThuoc: variant.idKichCo?.tenKichCo || 'N/A',
            giaBan: variant.giaBan,
            giaSauKhiGiam: variant.giaSauKhiGiam || variant.giaBan,
            soLuong: variant.soLuongTonKho,
            trangThai: !variant.deleted,
          })),
      };
    };

    const mapCampaignVariantData = (variant) => ({
      id: variant.idSanPham,
      tenSanPham: variant.tenSanPham,
      maSanPham: variant.maSanPham,
      giaBan: variant.giaBanDau,
      giaSauKhiGiam: variant.giaSauKhiGiam,
      trangThai: true, // Assume active since it's part of the campaign
      anhSanPham: '/default-product.png', // Fallback, as API doesn't provide image
      mauSac: 'N/A', // API doesn't provide color/size, set as N/A
      kichThuoc: 'N/A',
      soLuong: 0, // API doesn't provide quantity, set as 0
    });

    const filteredProducts = computed(() => {
      return allProducts.value.filter((product) => {
        const matchesSearch =
          !filters.value.productSearch ||
          product.tenSanPham
            .toLowerCase()
            .includes(filters.value.productSearch.toLowerCase()) ||
          product.maSanPham
            .toLowerCase()
            .includes(filters.value.productSearch.toLowerCase());
        
        const matchesStatus =
          !filters.value.productStatus ||
          (filters.value.productStatus === 'active' && product.trangThai) ||
          (filters.value.productStatus === 'inactive' && !product.trangThai);
        
        return matchesSearch && matchesStatus;
      });
    });

    const availableVariants = computed(() => {
      const variants = [];
      selectedProducts.value.forEach((product) => {
        variants.push(...(product.chiTietSanPhams || []));
      });
      return variants;
    });

    const filteredVariants = computed(() => {
      return availableVariants.value.filter((variant) => {
        const matchesSearch =
          !filters.value.variantSearch ||
          variant.tenSanPham
            .toLowerCase()
            .includes(filters.value.variantSearch.toLowerCase()) ||
          variant.mauSac
            .toLowerCase()
            .includes(filters.value.variantSearch.toLowerCase()) ||
          variant.kichThuoc
            .toLowerCase()
            .includes(filters.value.variantSearch.toLowerCase());
        
        const matchesStatus =
          !filters.value.variantStatus ||
          (filters.value.variantStatus === 'active' && variant.trangThai) ||
          (filters.value.variantStatus === 'inactive' && !variant.trangThai);
        
        return matchesSearch && matchesStatus;
      });
    });

    const allProductsSelected = computed(() => {
      return (
        filteredProducts.value.length > 0 &&
        filteredProducts.value.every((product) => isProductSelected(product.id))
      );
    });

    const allVariantsSelected = computed(() => {
      return (
        availableVariants.value.length > 0 &&
        availableVariants.value.every((variant) => isVariantSelected(variant.id))
      );
    });

    const allFilteredVariantsSelected = computed(() => {
      return (
        filteredVariants.value.length > 0 &&
        filteredVariants.value.every((variant) => isVariantSelected(variant.id))
      );
    });

    const loadProducts = async () => {
      loadingProducts.value = true;
      try {
        const response = await axios.get(API_BASE_URL, {
          params: {
            page: pagination.value.page,
            size: pagination.value.size,
            sortBy: pagination.value.sortBy,
            sortDir: pagination.value.sortDir,
          },
        });

        allProducts.value = response.data.content.map(mapProductData);
        pagination.value.totalElements = response.data.totalElements || 0;
        pagination.value.totalPages = response.data.totalPages || 0;

        toast.success('Đã tải danh sách sản phẩm thành công!');
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        toast.error('Không thể tải danh sách sản phẩm');
      } finally {
        loadingProducts.value = false;
      }
    };

    const changePage = (newPage) => {
      pagination.value.page = newPage;
      loadProducts();
    };

    const fetchCampaignDetails = async () => {
      try {
        const response = await axios.get(`${API_CAMPAIGN_URL}/${campaignId}`);
        const data = response.data;

        campaign.value = {
          id: data.id,
          ma: data.ma,
          tenDotGiamGia: data.tenDotGiamGia,
          thoiGianBatDau: formatDateForInput(data.ngayBatDau),
          thoiGianKetThuc: formatDateForInput(data.ngayKetThuc),
          // trangThai: data.trangThai, // XÓA DÒNG NÀY
        };

        discountConfig.value = {
          type: data.loaiGiamGiaApDung === 'PHAN_TRAM' ? 'percentage' : 'fixed',
          value: data.giaTriGiamGia,
          soTienGiamToiDa: data.soTienGiamToiDa || null,
          applyTo: data.danhSachSanPham.length === availableVariants.value.length ? 'all' : 'selected',
        };

        // Pre-select variants from danhSachSanPham
        selectedProductDetails.value = data.danhSachSanPham.map(mapCampaignVariantData);

        // Pre-select products that contain selected variants
        selectedProducts.value = [];
        await loadProducts(); // Ensure products are loaded before mapping
        selectedProductDetails.value.forEach((variant) => {
          const product = allProducts.value.find((p) =>
            p.chiTietSanPhams.some((v) => v.id === variant.id)
          );
          if (product && !selectedProducts.value.some((p) => p.id === product.id)) {
            selectedProducts.value.push(product);
          }
        });

        toast.success('Đã tải thông tin đợt giảm giá thành công!');
      } catch (error) {
        console.error('Lỗi khi tải chi tiết đợt giảm giá:', error);
        toast.error(
          error.response?.data?.message ||
            'Không thể tải chi tiết đợt giảm giá. Vui lòng thử lại.'
        );
        router.push({ name: 'DotGiamGia' });
      }
    };

    const isProductSelected = (productId) => {
      return selectedProducts.value.some((p) => p.id === productId);
    };

    const isVariantSelected = (variantId) => {
      return selectedProductDetails.value.some((v) => v.id === variantId);
    };

    const toggleProductSelection = (product) => {
      const index = selectedProducts.value.findIndex((p) => p.id === product.id);
      if (index > -1) {
        selectedProducts.value.splice(index, 1);
        selectedProductDetails.value = selectedProductDetails.value.filter(
          (variant) =>
            !product.chiTietSanPhams.some((detail) => detail.id === variant.id)
        );
      } else {
        selectedProducts.value.push(product);
      }
    };

    const toggleVariantSelection = (variant) => {
      const index = selectedProductDetails.value.findIndex(
        (v) => v.id === variant.id
      );
      if (index > -1) {
        selectedProductDetails.value.splice(index, 1);
      } else {
        selectedProductDetails.value.push(variant);
      }
    };

    const toggleAllProducts = () => {
      if (allProductsSelected.value) {
        selectedProducts.value = [];
        selectedProductDetails.value = [];
      } else {
        selectedProducts.value = [...filteredProducts.value];
        selectedProductDetails.value = [];
      }
    };

    const toggleAllVariants = () => {
      if (allFilteredVariantsSelected.value) {
        const filteredVariantIds = filteredVariants.value.map((v) => v.id);
        selectedProductDetails.value = selectedProductDetails.value.filter(
          (variant) => !filteredVariantIds.includes(variant.id)
        );
      } else {
        const newVariants = filteredVariants.value.filter(
          (variant) => !isVariantSelected(variant.id)
        );
        selectedProductDetails.value = [
          ...selectedProductDetails.value,
          ...newVariants,
        ];
      }
    };

    const clearAllSelections = () => {
      selectedProducts.value = [];
      selectedProductDetails.value = [];
    };

    const saveChanges = async () => {
      try {
        if (
          discountConfig.value.applyTo === 'selected' &&
          selectedProductDetails.value.length === 0
        ) {
          toast.error(
            'Vui lòng chọn ít nhất một chi tiết sản phẩm để áp dụng giảm giá.'
          );
          return;
        }

        if (!discountConfig.value.value || discountConfig.value.value <= 0) {
          toast.error('Vui lòng nhập giá trị giảm giá hợp lệ.');
          return;
        }

        if (
          discountConfig.value.type === 'percentage' &&
          discountConfig.value.value > 100
        ) {
          toast.error(
            'Giá trị giảm giá theo phần trăm không được vượt quá 100%.'
          );
          return;
        }

        if (
          discountConfig.value.soTienGiamToiDa &&
          discountConfig.value.soTienGiamToiDa < 0
        ) {
          toast.error('Số tiền giảm tối đa không được nhỏ hơn 0.');
          return;
        }

        const targetVariants =
          discountConfig.value.applyTo === 'all'
            ? availableVariants.value
            : selectedProductDetails.value;

        const payload = {
          id: campaign.value.id,
          ma: campaign.value.ma,
          tenDotGiamGia: campaign.value.tenDotGiamGia,
          loaiGiamGiaApDung:
            discountConfig.value.type === 'percentage' ? 'PHAN_TRAM' : 'TIEN',
          giaTriGiamGia: discountConfig.value.value,
          soTienGiamToiDa: discountConfig.value.soTienGiamToiDa || null,
          ngayBatDau: campaign.value.thoiGianBatDau,
          ngayKetThuc: campaign.value.thoiGianKetThuc,
          // trangThai: campaign.value.trangThai, // XÓA DÒNG NÀY
          listSanPhamId: targetVariants.map((variant) => variant.id),
        };

        const response = await axios.put(`${API_CAMPAIGN_URL}/update`, payload);

        toast.success(
          `Đã cập nhật đợt giảm giá thành công! Áp dụng cho ${targetVariants.length} biến thể.`
        );
        router.push({ name: 'DotGiamGia' });
      } catch (error) {
        console.error('Lỗi khi cập nhật đợt giảm giá:', error);
        toast.error(
          error.response?.data?.message ||
            'Không thể cập nhật đợt giảm giá. Vui lòng thử lại.'
        );
      }
    };

    const cancelEdit = () => {
      router.push({ name: 'DotGiamGia' });
    };

    const formatCurrency = (value) => {
      if (value === null || value === undefined) return '---';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    onMounted(() => {
      if (campaignId) {
        fetchCampaignDetails();
      } else {
        toast.error('Không tìm thấy ID đợt giảm giá để chỉnh sửa.');
        router.push({ name: 'DotGiamGia' });
      }
    });

    return {
      campaign,
      loadingProducts,
      selectedProducts,
      selectedProductDetails,
      filters,
      discountConfig,
      allProducts,
      filteredProducts,
      availableVariants,
      filteredVariants,
      allProductsSelected,
      allVariantsSelected,
      allFilteredVariantsSelected,
      breadcrumbItems,
      breadcrumbActions,
      productTableColumns,
      variantTableColumns,
      isProductSelected,
      isVariantSelected,
      toggleProductSelection,
      toggleVariantSelection,
      toggleAllProducts,
      toggleAllVariants,
      clearAllSelections,
      saveChanges,
      cancelEdit,
      formatCurrency,
      pagination,
      changePage,
      isFormValid: computed(() => {
        return (
          campaign.value.tenDotGiamGia &&
          campaign.value.thoiGianBatDau &&
          campaign.value.thoiGianKetThuc &&
          (discountConfig.value.applyTo === 'all' ||
            selectedProductDetails.value.length > 0)
        );
      }),
    };
  },
};
</script>

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
  background: #007bff;
  color: white;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #0052cc;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.45);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.custom-input,
.custom-select {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.custom-input:focus,
.custom-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark .section-title {
  color: #e5e7eb;
}

.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  background-color: #ffffff;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dark .product-card {
  background-color: #374151;
  border-color: #4b5563;
}

.product-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.product-card.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.dark .product-card.selected {
  background-color: #1e3a8a;
  border-color: #3b82f6;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.product-details-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  cursor: pointer;
}

@media (max-width: 768px) {
  .container-fluid {
    padding: 1rem;
  }

  .card {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .custom-input,
  .custom-select {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .custom-table th,
  .custom-table td {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}
</style>