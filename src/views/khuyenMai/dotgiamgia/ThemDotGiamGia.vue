<template>
  <div class="min-h-screen flex flex-col font-roboto transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Thêm Đợt Giảm Giá"
      page-description="Tạo mới đợt giảm giá và chọn sản phẩm áp dụng"
      page-icon="solar:add-circle-bold-duotone"
    />

    <form @submit.prevent="addCampaign" class="space-y-6">
      <!-- Campaign Information -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <iconify-icon icon="solar:info-circle-bold-duotone" class="text-xl mr-2"></iconify-icon>
          Thông Tin Đợt Giảm Giá
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Mã tự động tạo, không hiển thị -->
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Đợt Giảm Giá *
            </label>
            <input
              v-model="newCampaign.tenDotGiamGia"
              type="text"
              required
              :class="[
                'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors',
                validationErrors.tenDotGiamGia ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="Nhập tên đợt giảm giá"
              @blur="validateTenDotGiamGia"
              @input="clearValidationError('tenDotGiamGia')"
            />
            <p v-if="validationErrors.tenDotGiamGia" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.tenDotGiamGia }}
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô Tả
            </label>
            <input
              v-model="newCampaign.moTa"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="Mô tả đợt giảm giá"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày Bắt Đầu *
            </label>
            <input
              v-model="newCampaign.thoiGianBatDau"
              type="date"
              required
              :class="[
                'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors',
                validationErrors.thoiGianBatDau ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              ]"
              @blur="validateThoiGianBatDau"
              @change="validateDateRange"
              @input="clearValidationError('thoiGianBatDau')"
            />
            <p v-if="validationErrors.thoiGianBatDau" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.thoiGianBatDau }}
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày Kết Thúc *
            </label>
            <input
              v-model="newCampaign.thoiGianKetThuc"
              type="date"
              required
              :class="[
                'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors',
                validationErrors.thoiGianKetThuc ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              ]"
              @blur="validateThoiGianKetThuc"
              @change="validateDateRange"
              @input="clearValidationError('thoiGianKetThuc')"
            />
            <p v-if="validationErrors.thoiGianKetThuc" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.thoiGianKetThuc }}
            </p>
            <p v-if="validationErrors.dateRange" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.dateRange }}
            </p>
          </div>
        </div>

        <!-- Discount Configuration -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Cấu Hình Giảm Giá</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                :class="[
                  'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors',
                  validationErrors.discountValue ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                ]"
                :placeholder="discountConfig.type === 'percentage' ? 'Nhập % giảm (1-100)' : 'Nhập số tiền giảm'"
                @blur="validateDiscountValue"
                @input="clearValidationError('discountValue')"
              />
              <p v-if="validationErrors.discountValue" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ validationErrors.discountValue }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số Tiền Giảm Tối Đa *
              </label>
              <input
                v-model="formattedSoTienGiamToiDa"
                type="text"
                required
                :class="[
                  'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors',
                  validationErrors.soTienGiamToiDa ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                ]"
                placeholder="Nhập số tiền giảm tối đa (VNĐ)"
                @input="handleSoTienGiamToiDaInput"
                @blur="validateSoTienGiamToiDa"
              />
              <p v-if="validationErrors.soTienGiamToiDa" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ validationErrors.soTienGiamToiDa }}
              </p>
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
            Chọn Sản Phẩm
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
              
              <template #trangThai="{ item }">
                <span :class="item.trangThai ? 'inline-flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium text-xs' : 'inline-flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-full font-medium text-xs'">
                  <iconify-icon :icon="item.trangThai ? 'solar:check-circle-bold' : 'solar:close-circle-bold'" class="w-3 h-3 mr-1"></iconify-icon>
                  {{ item.trangThai ? 'Hoạt động' : 'Ngừng bán' }}
                </span>
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
                
                <template #soLuong="{ item }">
                  <span class="text-center">{{ item.soLuong }}</span>
                </template>
                
                <template #trangThai="{ item }">
                  <span :class="item.trangThai ? 'inline-flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium text-xs' : 'inline-flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-full font-medium text-xs'">
                    <iconify-icon :icon="item.trangThai ? 'solar:check-circle-bold' : 'solar:close-circle-bold'" class="w-3 h-3 mr-1"></iconify-icon>
                    {{ item.trangThai ? 'Hoạt động' : 'Ngừng bán' }}
                  </span>
                </template>
              </DataTable>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="cancelAdd"
            class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="btn-primary"
          >
            Tạo Đợt Giảm Giá
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';
import axios from 'axios';

export default {
  name: 'ThemDotGiamGia',
  components: {
    Breadcrumb,
    DataTable,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();

    const API_BASE_URL = 'http://localhost:8080/api/san-pham';
    const API_CAMPAIGN_URL = 'http://localhost:8080/api/dot-giam-gia/add';

    // Cấu hình breadcrumb
    const breadcrumbItems = ref([
      { label: 'Đợt giảm giá', path: '/dot-giam-gia' },
      { label: 'Thêm mới', path: '/dot-giam-gia/them-moi' },
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

    const newCampaign = ref({
      tenDotGiamGia: '',
      moTa: '',
      thoiGianBatDau: '',
      thoiGianKetThuc: '',
    });

    // Validation errors
    const validationErrors = ref({
      tenDotGiamGia: '',
      thoiGianBatDau: '',
      thoiGianKetThuc: '',
      discountValue: '',
      soTienGiamToiDa: '',
      dateRange: '',
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

    // Formatted display value for soTienGiamToiDa
    const formattedSoTienGiamToiDa = ref('');

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
      { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' },
    ]);

    const variantTableColumns = ref([
      { key: 'selection', label: '', class: 'text-center', width: '50px' },
      { key: 'anhSanPham', label: 'Ảnh', class: 'text-center', width: '80px' },
      { key: 'tenSanPham', label: 'Sản Phẩm' },
      { key: 'mauSac', label: 'Màu Sắc' },
      { key: 'kichThuoc', label: 'Size' },
      { key: 'giaBan', label: 'Giá Bán', class: 'text-right' },
      { key: 'soLuong', label: 'SL', class: 'text-center' },
      { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' },
    ]);

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
            soLuong: variant.soLuongTonKho,
            trangThai: !variant.deleted,
          })),
      };
    };

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

        allProducts.value = response.data.content
          .filter(product => !product.deleted)
          .map(mapProductData);
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

    const changeSort = (newSortBy, newSortDir) => {
      pagination.value.sortBy = newSortBy;
      pagination.value.sortDir = newSortDir;
      loadProducts();
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

    const addCampaign = async () => {
      try {
        // Validate all fields before submitting
        if (!validateAllFields()) {
          toast.error('Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc.');
          return;
        }

        if (
          discountConfig.value.applyTo === 'selected' &&
          selectedProductDetails.value.length === 0
        ) {
          toast.error(
            'Vui lòng chọn ít nhất một chi tiết sản phẩm để áp dụng giảm giá.'
          );
          return;
        }

        // Tạo mã tự động
        newCampaign.value.ma = `DOT${new Date().getFullYear()}-${Math.floor(
          Math.random() * 100
        )
          .toString()
          .padStart(2, '0')}`;

        const targetVariants =
          discountConfig.value.applyTo === 'all'
            ? availableVariants.value
            : selectedProductDetails.value;

        const payload = {
          ma: newCampaign.value.ma,
          tenDotGiamGia: newCampaign.value.tenDotGiamGia,
          loaiGiamGiaApDung:
            discountConfig.value.type === 'percentage' ? 'PHAN_TRAM' : 'TIEN',
          giaTriGiamGia: discountConfig.value.value,
          soTienGiamToiDa: discountConfig.value.soTienGiamToiDa || null,
          ngayBatDau: newCampaign.value.thoiGianBatDau,
          ngayKetThuc: newCampaign.value.thoiGianKetThuc,
          listSanPhamId: targetVariants.map((variant) => variant.id),
        };

        const response = await axios.post(API_CAMPAIGN_URL, payload);

        toast.success(
          `Đã tạo đợt giảm giá mới thành công! Áp dụng cho ${targetVariants.length} biến thể.`
        );
        router.push({ name: 'DotGiamGia' });
      } catch (error) {
        console.error('Lỗi khi tạo đợt giảm giá:', error);
        toast.error(
          error.response?.data?.message ||
            'Không thể tạo đợt giảm giá. Vui lòng thử lại.'
        );
      }
    };

    const cancelAdd = () => {
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

    // Validation functions
    const validateTenDotGiamGia = () => {
      if (!newCampaign.value.tenDotGiamGia || newCampaign.value.tenDotGiamGia.trim() === '') {
        validationErrors.value.tenDotGiamGia = 'Tên đợt giảm giá không được để trống.';
        return false;
      }
      if (newCampaign.value.tenDotGiamGia.trim().length < 3) {
        validationErrors.value.tenDotGiamGia = 'Tên đợt giảm giá phải có ít nhất 3 ký tự.';
        return false;
      }
      if (newCampaign.value.tenDotGiamGia.trim().length > 100) {
        validationErrors.value.tenDotGiamGia = 'Tên đợt giảm giá không được vượt quá 100 ký tự.';
        return false;
      }
      validationErrors.value.tenDotGiamGia = '';
      return true;
    };

    const validateThoiGianBatDau = () => {
      if (!newCampaign.value.thoiGianBatDau) {
        validationErrors.value.thoiGianBatDau = 'Ngày bắt đầu không được để trống.';
        return false;
      }
      
      const today = new Date();
      const startDate = new Date(newCampaign.value.thoiGianBatDau);
      
      // Reset time to compare only dates
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        validationErrors.value.thoiGianBatDau = 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại.';
        return false;
      }
      
      validationErrors.value.thoiGianBatDau = '';
      return true;
    };

    const validateThoiGianKetThuc = () => {
      if (!newCampaign.value.thoiGianKetThuc) {
        validationErrors.value.thoiGianKetThuc = 'Ngày kết thúc không được để trống.';
        return false;
      }
      validationErrors.value.thoiGianKetThuc = '';
      return true;
    };

    const validateDateRange = () => {
      if (newCampaign.value.thoiGianBatDau && newCampaign.value.thoiGianKetThuc) {
        const startDate = new Date(newCampaign.value.thoiGianBatDau);
        const endDate = new Date(newCampaign.value.thoiGianKetThuc);
        
        if (endDate <= startDate) {
          validationErrors.value.dateRange = 'Ngày kết thúc phải sau ngày bắt đầu.';
          return false;
        }
        
        // Check if the campaign duration is reasonable (not more than 1 year)
        const oneYear = 365 * 24 * 60 * 60 * 1000; // milliseconds in a year
        if (endDate - startDate > oneYear) {
          validationErrors.value.dateRange = 'Thời gian diễn ra đợt giảm giá không được vượt quá 1 năm.';
          return false;
        }
      }
      validationErrors.value.dateRange = '';
      return true;
    };

    const validateDiscountValue = () => {
      if (!discountConfig.value.value || discountConfig.value.value <= 0) {
        validationErrors.value.discountValue = 'Giá trị giảm giá phải lớn hơn 0.';
        return false;
      }
      
      if (discountConfig.value.type === 'percentage') {
        if (discountConfig.value.value > 100) {
          validationErrors.value.discountValue = 'Giá trị giảm giá theo phần trăm không được vượt quá 100%.';
          return false;
        }
        if (discountConfig.value.value < 1) {
          validationErrors.value.discountValue = 'Giá trị giảm giá theo phần trăm phải từ 1% trở lên.';
          return false;
        }
      } else {
        if (discountConfig.value.value < 1000) {
          validationErrors.value.discountValue = 'Giá trị giảm giá theo tiền mặt phải từ 1,000 VNĐ trở lên.';
          return false;
        }
        if (discountConfig.value.value > 10000000) {
          validationErrors.value.discountValue = 'Giá trị giảm giá theo tiền mặt không được vượt quá 10,000,000 VNĐ.';
          return false;
        }
      }
      
      validationErrors.value.discountValue = '';
      return true;
    };

    const clearValidationError = (field) => {
      validationErrors.value[field] = '';
    };

    const validateSoTienGiamToiDa = () => {
      if (!discountConfig.value.soTienGiamToiDa || discountConfig.value.soTienGiamToiDa <= 0) {
        validationErrors.value.soTienGiamToiDa = 'Số tiền giảm tối đa không được để trống và phải lớn hơn 0.';
        return false;
      }
      if (discountConfig.value.soTienGiamToiDa < 1000) {
        validationErrors.value.soTienGiamToiDa = 'Số tiền giảm tối đa phải từ 1,000 VNĐ trở lên.';
        return false;
      }
      if (discountConfig.value.soTienGiamToiDa > 100000000) {
        validationErrors.value.soTienGiamToiDa = 'Số tiền giảm tối đa không được vượt quá 100,000,000 VNĐ.';
        return false;
      }
      validationErrors.value.soTienGiamToiDa = '';
      return true;
    };

    const validateAllFields = () => {
      const isTenValid = validateTenDotGiamGia();
      const isStartDateValid = validateThoiGianBatDau();
      const isEndDateValid = validateThoiGianKetThuc();
      const isDateRangeValid = validateDateRange();
      const isDiscountValueValid = validateDiscountValue();
      const isSoTienGiamToiDaValid = validateSoTienGiamToiDa();
      
      return isTenValid && isStartDateValid && isEndDateValid && isDateRangeValid && isDiscountValueValid && isSoTienGiamToiDaValid;
    };

    // Currency formatting functions for soTienGiamToiDa
    const formatNumberToVND = (value) => {
      if (!value || value === 0) return '';
      return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
    };

    const parseVNDToNumber = (value) => {
      if (!value) return null;
      // Remove all non-digit characters except for the first decimal point
      const cleanValue = value.replace(/[^\d]/g, '');
      return cleanValue ? parseInt(cleanValue, 10) : null;
    };

    const handleSoTienGiamToiDaInput = (event) => {
      const inputValue = event.target.value;
      const numericValue = parseVNDToNumber(inputValue);
      
      // Clear validation error when user starts typing
      clearValidationError('soTienGiamToiDa');
      
      // Update the actual value
      discountConfig.value.soTienGiamToiDa = numericValue;
      
      // Format the display value
      if (numericValue && numericValue > 0) {
        formattedSoTienGiamToiDa.value = formatNumberToVND(numericValue);
      } else {
        formattedSoTienGiamToiDa.value = '';
      }
    };

    const formatSoTienGiamToiDa = () => {
      if (discountConfig.value.soTienGiamToiDa && discountConfig.value.soTienGiamToiDa > 0) {
        formattedSoTienGiamToiDa.value = formatNumberToVND(discountConfig.value.soTienGiamToiDa);
      }
    };

    onMounted(() => {
      loadProducts();
    });

    return {
      newCampaign,
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
      addCampaign,
      cancelAdd,
      formatCurrency,
      pagination,
      changePage,
      changeSort,
      isFormValid: computed(() => {
        return (
          newCampaign.value.tenDotGiamGia &&
          newCampaign.value.tenDotGiamGia.trim() !== '' &&
          newCampaign.value.thoiGianBatDau &&
          newCampaign.value.thoiGianKetThuc &&
          discountConfig.value.value &&
          discountConfig.value.value > 0 &&
          discountConfig.value.soTienGiamToiDa &&
          discountConfig.value.soTienGiamToiDa > 0 &&
          Object.values(validationErrors.value).every(error => error === '') &&
          (discountConfig.value.applyTo === 'all' || selectedProductDetails.value.length > 0)
        );
      }),
      validationErrors,
      validateTenDotGiamGia,
      validateThoiGianBatDau,
      validateThoiGianKetThuc,
      validateDateRange,
      validateDiscountValue,
      validateSoTienGiamToiDa,
      clearValidationError,
      validateAllFields,
      formattedSoTienGiamToiDa,
      handleSoTienGiamToiDaInput,
      formatSoTienGiamToiDa,
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
  animation: spin 1s linear infinite;
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