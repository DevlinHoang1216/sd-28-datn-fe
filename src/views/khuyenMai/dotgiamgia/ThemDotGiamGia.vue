<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4 md:p-6 font-roboto transition-colors duration-300">
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
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Đợt Giảm Giá *
            </label>
            <input
              v-model="newCampaign.tenDotGiamGia"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="Nhập tên đợt giảm giá"
            />
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
              Thời Gian Bắt Đầu *
            </label>
            <input
              v-model="newCampaign.thoiGianBatDau"
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
              v-model="newCampaign.thoiGianKetThuc"
              type="datetime-local"
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
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
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                :placeholder="discountConfig.type === 'percentage' ? 'Nhập % giảm (1-100)' : 'Nhập số tiền giảm'"
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
                <option value="selected">Sản phẩm đã chọn</option>
                <option value="all">Tất cả sản phẩm</option>
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
              <!-- Custom column templates -->
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
          </div>

          <!-- Right Table: Product Variants -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Biến Thể Sản Phẩm
                <span class="text-sm font-normal text-gray-500">({{ filteredVariants.length }} biến thể)</span>
              </h3>
            </div>

            <div v-if="selectedProducts.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
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
                <!-- Custom column templates -->
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
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';

export default {
  name: 'ThemDotGiamGia',
  components: {
    Breadcrumb,
    DataTable,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();

    // Breadcrumb configuration
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

    const loadingProducts = ref(false);
    const selectedProducts = ref([]);
    const selectedProductDetails = ref([]);
    const filters = ref({
      productSearch: '',
      productStatus: '',
      variantSearch: '',
      variantStatus: ''
    });

    const discountConfig = ref({
      type: 'percentage',
      value: 10,
      applyTo: 'selected'
    });

    // Fake data for testing - grouped by products with variants
    const fakeProducts = [
      {
        id: 1,
        maSanPham: 'SP001',
        tenSanPham: 'Giày Nike Air Max 270',
        anhSanPham: '/sneakers/sneakers-1.jpg',
        trangThai: true,
        giaThapNhat: 2500000,
        chiTietSanPhams: [
          { id: 101, tenSanPham: 'Giày Nike Air Max 270', anhSanPham: '/sneakers/sneakers-1.jpg', mauSac: 'Đen', kichThuoc: '42', giaBan: 2500000, soLuong: 10, trangThai: true },
          { id: 102, tenSanPham: 'Giày Nike Air Max 270', anhSanPham: '/sneakers/sneakers-1-alt1.jpg', mauSac: 'Trắng', kichThuoc: '43', giaBan: 2600000, soLuong: 8, trangThai: true },
          { id: 103, tenSanPham: 'Giày Nike Air Max 270', anhSanPham: '/sneakers/sneakers-1-alt2.jpg', mauSac: 'Xanh', kichThuoc: '41', giaBan: 2550000, soLuong: 5, trangThai: true }
        ]
      },
      {
        id: 2,
        maSanPham: 'SP002',
        tenSanPham: 'Giày Adidas Ultraboost',
        anhSanPham: '/sneakers/sneakers-2.jpg',
        trangThai: true,
        giaThapNhat: 3200000,
        chiTietSanPhams: [
          { id: 201, tenSanPham: 'Giày Adidas Ultraboost', anhSanPham: '/sneakers/sneakers-2.jpg', mauSac: 'Xanh', kichThuoc: '41', giaBan: 3200000, soLuong: 12, trangThai: true },
          { id: 202, tenSanPham: 'Giày Adidas Ultraboost', anhSanPham: '/sneakers/sneakers-2-alt1.jpg', mauSac: 'Đỏ', kichThuoc: '42', giaBan: 3300000, soLuong: 6, trangThai: true },
          { id: 203, tenSanPham: 'Giày Adidas Ultraboost', anhSanPham: '/sneakers/sneakers-2-alt2.jpg', mauSac: 'Xanh', kichThuoc: '43', giaBan: 3400000, soLuong: 9, trangThai: true }
        ]
      },
      {
        id: 3,
        maSanPham: 'SP003',
        tenSanPham: 'Giày Converse Chuck Taylor',
        anhSanPham: '/sneakers/sneakers-3.jpg',
        trangThai: false,
        giaThapNhat: 1800000,
        chiTietSanPhams: [
          { id: 301, tenSanPham: 'Giày Converse Chuck Taylor', anhSanPham: '/sneakers/sneakers-3.jpg', mauSac: 'Đen', kichThuoc: '40', giaBan: 1800000, soLuong: 15, trangThai: false },
          { id: 302, tenSanPham: 'Giày Converse Chuck Taylor', anhSanPham: '/sneakers/sneakers-3-alt1.jpg', mauSac: 'Trắng', kichThuoc: '41', giaBan: 1900000, soLuong: 20, trangThai: false }
        ]
      },
      {
        id: 4,
        maSanPham: 'SP004',
        tenSanPham: 'Giày Vans Old Skool',
        anhSanPham: '/sneakers/sneakers-4.jpg',
        trangThai: true,
        giaThapNhat: 2200000,
        chiTietSanPhams: [
          { id: 401, tenSanPham: 'Giày Vans Old Skool', anhSanPham: '/sneakers/sneakers-4.jpg', mauSac: 'Đen/Trắng', kichThuoc: '40', giaBan: 2200000, soLuong: 18, trangThai: true },
          { id: 402, tenSanPham: 'Giày Vans Old Skool', anhSanPham: '/sneakers/sneakers-4-alt1.jpg', mauSac: 'Xanh Navy', kichThuoc: '42', giaBan: 2300000, soLuong: 11, trangThai: true }
        ]
      },
      {
        id: 5,
        maSanPham: 'SP005',
        tenSanPham: 'Giày Puma RS-X',
        anhSanPham: '/sneakers/sneakers-5.jpg',
        trangThai: true,
        giaThapNhat: 2800000,
        chiTietSanPhams: [
          { id: 501, tenSanPham: 'Giày Puma RS-X', anhSanPham: '/sneakers/sneakers-5.jpg', mauSac: 'Trắng/Xanh', kichThuoc: '41', giaBan: 2800000, soLuong: 14, trangThai: true },
          { id: 502, tenSanPham: 'Giày Puma RS-X', anhSanPham: '/sneakers/sneakers-5-alt1.jpg', mauSac: 'Đen/Đỏ', kichThuoc: '42', giaBan: 2900000, soLuong: 9, trangThai: true }
        ]
      }
    ];

    const allProducts = ref([]);

    // DataTable columns configuration
    const productTableColumns = ref([
      { key: 'selection', label: '', class: 'text-center', width: '50px' },
      { key: 'anhSanPham', label: 'Ảnh', class: 'text-center', width: '80px' },
      { key: 'maSanPham', label: 'Mã SP', class: 'font-weight-bold' },
      { key: 'tenSanPham', label: 'Tên Sản Phẩm' },
      { key: 'soLuongBienThe', label: 'Biến Thể', class: 'text-center' },
      { key: 'giaThapNhat', label: 'Giá Từ', class: 'text-right' },
      { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' }
    ]);

    const variantTableColumns = ref([
      { key: 'selection', label: '', class: 'text-center', width: '50px' },
      { key: 'anhSanPham', label: 'Ảnh', class: 'text-center', width: '80px' },
      { key: 'tenSanPham', label: 'Sản Phẩm' },
      { key: 'mauSac', label: 'Màu Sắc' },
      { key: 'kichThuoc', label: 'Size' },
      { key: 'giaBan', label: 'Giá Bán', class: 'text-right' },
      { key: 'soLuong', label: 'SL', class: 'text-center' },
      { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' }
    ]);

    const filteredProducts = computed(() => {
      return fakeProducts.filter(product => {
        const matchesSearch = !filters.value.productSearch || 
          product.tenSanPham.toLowerCase().includes(filters.value.productSearch.toLowerCase()) ||
          product.maSanPham.toLowerCase().includes(filters.value.productSearch.toLowerCase());
        
        const matchesStatus = !filters.value.productStatus || 
          (filters.value.productStatus === 'active' && product.trangThai) ||
          (filters.value.productStatus === 'inactive' && !product.trangThai);
        
        return matchesSearch && matchesStatus;
      });
    });

    const availableVariants = computed(() => {
      const variants = [];
      selectedProducts.value.forEach(product => {
        variants.push(...product.chiTietSanPhams);
      });
      return variants;
    });

    const filteredVariants = computed(() => {
      return availableVariants.value.filter(variant => {
        const matchesSearch = !filters.value.variantSearch || 
          variant.tenSanPham.toLowerCase().includes(filters.value.variantSearch.toLowerCase()) ||
          variant.mauSac.toLowerCase().includes(filters.value.variantSearch.toLowerCase()) ||
          variant.kichThuoc.toLowerCase().includes(filters.value.variantSearch.toLowerCase());
        
        const matchesStatus = !filters.value.variantStatus || 
          (filters.value.variantStatus === 'active' && variant.trangThai) ||
          (filters.value.variantStatus === 'inactive' && !variant.trangThai);
        
        return matchesSearch && matchesStatus;
      });
    });

    const allProductsSelected = computed(() => {
      return filteredProducts.value.length > 0 && 
             filteredProducts.value.every(product => isProductSelected(product.id));
    });

    const allVariantsSelected = computed(() => {
      return availableVariants.value.length > 0 && 
             availableVariants.value.every(variant => isVariantSelected(variant.id));
    });

    const allFilteredVariantsSelected = computed(() => {
      return filteredVariants.value.length > 0 && 
             filteredVariants.value.every(variant => isVariantSelected(variant.id));
    });

    const loadProducts = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        allProducts.value = fakeProducts;
        toast.success('Đã tải danh sách sản phẩm thành công!');
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        toast.error('Không thể tải danh sách sản phẩm');
      } finally {
        loadingProducts.value = false;
      }
    };

    const isProductSelected = (productId) => {
      return selectedProducts.value.some(p => p.id === productId);
    };

    const isVariantSelected = (variantId) => {
      return selectedProductDetails.value.some(v => v.id === variantId);
    };

    const toggleProductSelection = (product) => {
      const index = selectedProducts.value.findIndex(p => p.id === product.id);
      if (index > -1) {
        // Remove product and its variants
        selectedProducts.value.splice(index, 1);
        // Remove all variants of this product from selectedProductDetails
        selectedProductDetails.value = selectedProductDetails.value.filter(
          variant => !product.chiTietSanPhams.some(detail => detail.id === variant.id)
        );
      } else {
        // Add product
        selectedProducts.value.push(product);
      }
    };

    const toggleVariantSelection = (variant) => {
      const index = selectedProductDetails.value.findIndex(v => v.id === variant.id);
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
        // Deselect all filtered variants
        const filteredVariantIds = filteredVariants.value.map(v => v.id);
        selectedProductDetails.value = selectedProductDetails.value.filter(
          variant => !filteredVariantIds.includes(variant.id)
        );
      } else {
        // Select all filtered variants
        const newVariants = filteredVariants.value.filter(
          variant => !isVariantSelected(variant.id)
        );
        selectedProductDetails.value = [...selectedProductDetails.value, ...newVariants];
      }
    };

    const clearAllSelections = () => {
      selectedProducts.value = [];
      selectedProductDetails.value = [];
    };

    const addCampaign = async () => {
      try {
        if (discountConfig.value.applyTo === 'selected' && selectedProductDetails.value.length === 0) {
          toast.error('Vui lòng chọn ít nhất một chi tiết sản phẩm để áp dụng giảm giá.');
          return;
        }

        // Validate discount configuration
        if (!discountConfig.value.value || discountConfig.value.value <= 0) {
          toast.error('Vui lòng nhập giá trị giảm giá hợp lệ.');
          return;
        }

        if (discountConfig.value.type === 'percentage' && discountConfig.value.value > 100) {
          toast.error('Giá trị giảm giá theo phần trăm không được vượt quá 100%.');
          return;
        }

        const targetProducts = discountConfig.value.applyTo === 'all' 
          ? availableVariants.value 
          : selectedProductDetails.value;

        const payload = {
          ...newCampaign.value,
          loaiGiamGia: discountConfig.value.type,
          giaTriGiam: discountConfig.value.value,
          apDungCho: discountConfig.value.applyTo,
          chiTietSanPhams: targetProducts.map(detail => ({
            id: detail.id,
            tenSanPham: detail.tenSanPham,
            mauSac: detail.mauSac,
            kichThuoc: detail.kichThuoc,
            giaBan: detail.giaBan
          }))
        };

        console.log('Payload:', payload);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success(`Đã tạo đợt giảm giá mới thành công! Áp dụng cho ${targetProducts.length} chi tiết sản phẩm.`);
        router.push({ name: 'DotGiamGia' });
      } catch (error) {
        console.error('Lỗi khi tạo đợt giảm giá:', error);
        toast.error('Không thể tạo đợt giảm giá. Vui lòng thử lại.');
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
      isFormValid: computed(() => {
        return newCampaign.value.tenDotGiamGia && 
               newCampaign.value.thoiGianBatDau && 
               newCampaign.value.thoiGianKetThuc &&
               selectedProductDetails.value.length > 0;
      })
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