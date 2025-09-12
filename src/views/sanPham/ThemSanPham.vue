<template>
  <div class="them-san-pham-container">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Thêm Sản Phẩm Mới"
      page-description="Thêm sản phẩm mới vào hệ thống"
      page-icon="solar:widget-4-bold-duotone"
    />

    <!-- Main Content Layout -->
    <div class="main-content">
      <!-- Product Information Section -->
      <div class="product-info-section">
        <div class="panel-header">
          <h3 class="panel-title">
            <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
            Thông Tin Sản Phẩm
          </h3>
        </div>
        
        <form @submit.prevent="saveProduct" class="product-form">
          <!-- Tên Sản Phẩm -->
          <div class="form-group">
            <label class="form-label required">Tên Sản Phẩm</label>
            <div class="input-with-button">
              <input 
                type="text" 
                v-model="productForm.name" 
                class="form-input"
                placeholder="Chọn Sản Phẩm"
                required
              />
              <button type="button" class="select-btn">
                <iconify-icon icon="solar:alt-arrow-down-bold"></iconify-icon>
              </button>
            </div>
          </div>

          <!-- Attributes Grid - 2 per row -->
          <div class="attributes-grid">
            <!-- Thể Loại -->
            <div class="form-group">
              <label class="form-label required">Thể Loại</label>
              <div class="input-with-button">
                <select v-model="productForm.categoryId" class="form-input" required>
                  <option value="">Chọn Thể Loại</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Thương Hiệu -->
            <div class="form-group">
              <label class="form-label required">Thương Hiệu</label>
              <div class="input-with-button">
                <select v-model="productForm.brandId" class="form-input" required>
                  <option value="">Chọn Thương Hiệu</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Chất Liệu -->
            <div class="form-group">
              <label class="form-label required">Chất Liệu</label>
              <div class="input-with-button">
                <select v-model="productForm.materialId" class="form-input" required>
                  <option value="">Chọn Chất Liệu</option>
                  <option v-for="material in materials" :key="material.id" :value="material.id">
                    {{ material.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Cỡ Giày -->
            <div class="form-group">
              <label class="form-label required">Cỡ Giày</label>
              <div class="input-with-button">
                <select v-model="productForm.soleId" class="form-input" required>
                  <option value="">Chọn Cỡ Giày</option>
                  <option v-for="sole in soles" :key="sole.id" :value="sole.id">
                    {{ sole.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Mũi Giày -->
            <div class="form-group">
              <label class="form-label required">Mũi Giày</label>
              <div class="input-with-button">
                <select v-model="productForm.toeType" class="form-input" required>
                  <option value="">Chọn Mũi Giày</option>
                  <option value="pointed">Mũi nhọn</option>
                  <option value="round">Mũi tròn</option>
                  <option value="square">Mũi vuông</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Giới Thiệu Sản Phẩm -->
          <div class="form-group">
            <label class="form-label">Giới Thiệu Sản Phẩm <span class="optional">(Optional)</span></label>
            <div class="rich-text-editor">
              <div class="editor-toolbar">
                <select class="format-select">
                  <option>Normal</option>
                </select>
                <div class="toolbar-buttons">
                  <button type="button" class="toolbar-btn"><strong>B</strong></button>
                  <button type="button" class="toolbar-btn"><em>I</em></button>
                  <button type="button" class="toolbar-btn"><u>U</u></button>
                  <button type="button" class="toolbar-btn">🔗</button>
                  <button type="button" class="toolbar-btn">≡</button>
                  <button type="button" class="toolbar-btn">≣</button>
                  <button type="button" class="toolbar-btn">Aa</button>
                </div>
              </div>
              <textarea 
                v-model="productForm.description" 
                class="form-textarea"
                placeholder="Hãy viết nội dung giới thiệu thật hay nhé..."
                rows="6"
              ></textarea>
            </div>
          </div>

        </form>
      </div>

      <!-- Variants Section -->
      <div class="variants-section">
          <div class="panel-header">
            <h3 class="panel-title">
              <iconify-icon icon="solar:palette-bold-duotone"></iconify-icon>
              Phiên Bản Sản Phẩm
            </h3>
          </div>
          
          <div class="variants-content">
            <!-- Selection Grid -->
            <div class="selection-grid">
              <!-- Màu Sắc -->
              <div class="selection-group">
                <label class="selection-label">
                  <iconify-icon icon="solar:palette-2-bold"></iconify-icon>
                  Màu Sắc
                </label>
                <div class="selection-area">
                  <div class="selected-items" v-if="selectedColors.length > 0">
                    <div 
                      v-for="(color, index) in selectedColors" 
                      :key="index" 
                      class="selected-color-chip"
                    >
                      <div class="color-dot" :style="{ backgroundColor: color.hex }"></div>
                      <span>{{ color.name }}</span>
                      <button @click="removeColor(index)" class="remove-btn">
                        <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
                      </button>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    class="add-selection-btn"
                    @click="openColorModal"
                  >
                    <iconify-icon icon="solar:add-circle-bold"></iconify-icon>
                    {{ selectedColors.length > 0 ? 'Thêm màu khác' : 'Chọn màu sắc' }}
                  </button>
                </div>
              </div>

              <!-- Kích Cỡ -->
              <div class="selection-group">
                <label class="selection-label">
                  <iconify-icon icon="solar:ruler-bold"></iconify-icon>
                  Kích Cỡ
                </label>
                <div class="selection-area">
                  <div class="selected-items" v-if="selectedSizes.length > 0">
                    <div 
                      v-for="(size, index) in selectedSizes" 
                      :key="index" 
                      class="selected-size-chip"
                    >
                      <span>{{ size.name }}</span>
                      <button @click="removeSize(index)" class="remove-btn">
                        <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
                      </button>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    class="add-selection-btn"
                    @click="openSizeModal"
                  >
                    <iconify-icon icon="solar:add-circle-bold"></iconify-icon>
                    {{ selectedSizes.length > 0 ? 'Thêm size khác' : 'Chọn kích cỡ' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Ảnh Đại Diện -->
            <div class="main-image-section">
              <label class="selection-label">
                <iconify-icon icon="solar:camera-bold"></iconify-icon>
                Ảnh Đại Diện Sản Phẩm
              </label>
              <div class="main-image-upload">
                <div class="current-main-image-container" v-if="productForm.imageUrl">
                  <div class="current-main-image">
                    <img :src="productForm.imageUrl" alt="Preview image" class="main-preview-image" />
                    <div class="image-overlay">
                      <button @click="removeMainImage" class="overlay-btn remove">
                        <iconify-icon icon="solar:trash-bin-minimalistic-bold"></iconify-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="main-upload-area" v-else>
                  <input 
                    type="file" 
                    ref="imageInput"
                    @change="handleImageUpload"
                    accept="image/*"
                    class="file-input"
                    id="main-image-upload"
                  />
                  <label for="main-image-upload" class="main-upload-label">
                    <iconify-icon icon="solar:cloud-upload-bold"></iconify-icon>
                    <div class="upload-text">
                      <span class="upload-title">Tải ảnh đại diện</span>
                      <span class="upload-subtitle">PNG, JPG tối đa 5MB</span>
                    </div>
                  </label>
                </div>
                <div v-if="imageUploading" class="upload-progress">
                  <div class="progress-bar">
                    <div class="progress-fill"></div>
                  </div>
                  <span>Đang tải ảnh lên...</span>
                </div>
              </div>
            </div>

            <!-- Biến Thể Sản Phẩm -->
            <div class="variants-table-section" v-if="productVariants.length > 0">
              <div class="variants-header">
                <label class="selection-label">
                  <iconify-icon icon="solar:layers-bold"></iconify-icon>
                  Danh Sách Biến Thể ({{ productVariants.length }} biến thể)
                </label>
                
                <!-- Bulk Actions -->
                <div class="bulk-actions" v-if="selectedVariants.length > 0">
                    <div class="bulk-inputs">
                      <div class="bulk-input-group">
                        <label>Giá nhập chung</label>
                        <div class="bulk-input-controls">
                          <input 
                            type="text" 
                            :value="formatCurrency(bulkImportPrice)"
                            @input="handleBulkPriceInput($event, 'import')"
                            class="bulk-input"
                            placeholder="Nhập giá nhập... (VND)"
                          />
                          <button @click="applyBulkImportPrice" class="apply-btn">
                            <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
                          </button>
                        </div>
                      </div>
                      <div class="bulk-input-group">
                        <label>Giá bán chung</label>
                        <div class="bulk-input-controls">
                          <input 
                            type="text" 
                            :value="formatCurrency(bulkSalePrice)"
                            @input="handleBulkPriceInput($event, 'sale')"
                            class="bulk-input"
                            placeholder="Nhập giá bán... (VND)"
                          />
                          <button @click="applyBulkSalePrice" class="apply-btn">
                            <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
                          </button>
                        </div>
                      </div>
                      <div class="bulk-input-group">
                        <label>Số lượng chung</label>
                        <div class="bulk-input-controls">
                          <input 
                            type="number" 
                            v-model="bulkQuantity"
                            class="bulk-input"
                            placeholder="Nhập số lượng..."
                            min="0"
                          />
                          <button @click="applyBulkQuantity" class="apply-btn">
                            <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="bulk-actions-footer">
                      <div class="bulk-actions-info">
                        <iconify-icon icon="solar:info-circle-bold"></iconify-icon>
                        Đã chọn {{ selectedVariants.length }} biến thể
                      </div>
                      <button @click="deleteSelectedVariants" class="bulk-delete-btn">
                        Xóa đã chọn
                      </button>
                    </div>
                </div>
              </div>

              <div class="variants-table-container">
                <table class="variants-table">
                  <thead>
                    <tr>
                      <th class="checkbox-col">
                        <input 
                          type="checkbox" 
                          :checked="isAllSelected"
                          @change="toggleSelectAll"
                          class="select-checkbox"
                        />
                      </th>
                      <th class="image-col">Ảnh</th>
                      <th class="color-col">Màu Sắc</th>
                      <th class="size-col">Kích Cỡ</th>
                      <th class="price-col">Giá Nhập (₫)</th>
                      <th class="price-col">Giá Bán (₫)</th>
                      <th class="quantity-col">Số Lượng</th>
                      <th class="actions-col">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(variant, index) in productVariants" 
                      :key="`${variant.colorId}-${variant.sizeId}`"
                      class="variant-row"
                      :class="{ 'selected': selectedVariants.includes(index) }"
                    >
                      <!-- Checkbox -->
                      <td class="checkbox-cell">
                        <input 
                          type="checkbox" 
                          :checked="selectedVariants.includes(index)"
                          @change="toggleVariantSelection(index)"
                          class="select-checkbox"
                        />
                      </td>
                      
                      <!-- Image -->
                      <td class="image-cell">
                        <div class="table-image-container">
                          <div class="current-table-image" v-if="variant.imageUrl">
                            <img :src="variant.imageUrl" alt="Variant image" class="table-image-preview" />
                          </div>
                          <div class="table-upload-area" v-else>
                            <input 
                              type="file" 
                              :ref="`variantImageInput${index}`"
                              @change="(event) => handleVariantImageUpload(event, index)"
                              accept="image/*"
                              class="file-input"
                              :id="`table-variant-image-upload-${index}`"
                            />
                            <label :for="`table-variant-image-upload-${index}`" class="table-upload-label">
                              <iconify-icon icon="solar:camera-add-bold"></iconify-icon>
                            </label>
                          </div>
                        </div>
                      </td>
                      
                      <!-- Color -->
                      <td class="color-cell">
                        <div class="table-color-info">
                          <div class="table-color-dot" :style="{ backgroundColor: variant.colorHex }"></div>
                          <span>{{ variant.colorName }}</span>
                        </div>
                      </td>
                      
                      <!-- Size -->
                      <td class="size-cell">
                        <span class="size-badge">{{ variant.sizeName }}</span>
                      </td>
                      
                      <!-- Import Price -->
                      <td class="price-cell">
                        <input 
                          type="text" 
                          :value="formatCurrency(variant.importPrice)"
                          @input="handlePriceInput($event, index, 'importPrice')"
                          class="table-input"
                          placeholder="0 ₫"
                        />
                      </td>
                      
                      <!-- Sale Price -->
                      <td class="price-cell">
                        <input 
                          type="text" 
                          :value="formatCurrency(variant.salePrice)"
                          @input="handlePriceInput($event, index, 'salePrice')"
                          class="table-input"
                          placeholder="0 ₫"
                        />
                      </td>
                      
                      <!-- Quantity -->
                      <td class="quantity-cell">
                        <input 
                          type="number" 
                          v-model="variant.quantity"
                          class="table-input"
                          placeholder="0"
                          min="0"
                        />
                      </td>
                      
                      <!-- Actions -->
                      <td class="actions-cell">
                        <div class="action-buttons">
                          <button 
                            @click="editVariant(index)" 
                            class="action-btn edit-btn"
                            title="Sửa"
                          >
                            <iconify-icon icon="solar:pen-bold"></iconify-icon>
                          </button>
                          <button 
                            @click="removeVariantImage(index)" 
                            class="action-btn image-btn"
                            v-if="variant.imageUrl"
                            title="Xóa ảnh"
                          >
                            <iconify-icon icon="solar:gallery-remove-bold"></iconify-icon>
                          </button>
                          <button 
                            @click="deleteVariant(index)" 
                            class="action-btn delete-btn"
                            title="Xóa biến thể"
                          >
                            <iconify-icon icon="solar:trash-bin-minimalistic-bold"></iconify-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div v-else-if="selectedColors.length > 0 && selectedSizes.length > 0" class="no-variants-message">
              Biến thể sản phẩm sẽ được tạo tự động khi bạn chọn màu sắc và kích cỡ
            </div>
          </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn secondary" @click="goBack">
          Quay lại
        </button>
        <button type="submit" class="btn primary" :disabled="loading" @click="saveProduct">
          Lưu sản phẩm
        </button>
      </div>
    </div>

    <!-- Color Selection Modal -->
    <div v-if="showColorModal" class="modal-overlay" @click="closeColorModal">
      <div class="modal-content color-modal" @click.stop>
        <div class="modal-header">
          <h3>Chọn Màu Sắc</h3>
          <button @click="closeColorModal" class="close-modal">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-body">
          <!-- Search Bar -->
          <div class="search-section">
            <div class="search-input-container">
              <iconify-icon icon="solar:magnifer-bold" class="search-icon"></iconify-icon>
              <input 
                type="text" 
                v-model="colorSearchQuery"
                class="search-input"
                placeholder="Tìm kiếm màu sắc..."
              />
            </div>
          </div>
          
          <!-- Colors Table -->
          <div class="selection-table-container">
            <table class="selection-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input 
                      type="checkbox" 
                      :checked="isAllColorsSelected"
                      @change="toggleSelectAllColors"
                      class="select-checkbox"
                    />
                  </th>
                  <th class="preview-col">Màu</th>
                  <th class="name-col">Tên Màu</th>
                  <th class="code-col">Mã Màu</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="color in filteredColors" 
                  :key="color.id"
                  class="selection-row"
                  :class="{ 'selected': tempSelectedColors.includes(color.id) }"
                >
                  <td class="checkbox-cell">
                    <input 
                      type="checkbox" 
                      :checked="tempSelectedColors.includes(color.id)"
                      @change="toggleColorSelection(color.id)"
                      class="select-checkbox"
                    />
                  </td>
                  <td class="preview-cell">
                    <div class="color-preview-dot" :style="{ backgroundColor: color.hex }"></div>
                  </td>
                  <td class="name-cell">{{ color.name }}</td>
                  <td class="code-cell">{{ color.hex }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Selected Count -->
          <div class="selection-summary">
            Đã chọn: {{ tempSelectedColors.length }} màu sắc
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeColorModal" class="btn secondary">Hủy</button>
          <button @click="confirmColorSelection" class="btn primary">Xác nhận</button>
        </div>
      </div>
    </div>

    <!-- Size Selection Modal -->
    <div v-if="showSizeModal" class="modal-overlay" @click="closeSizeModal">
      <div class="modal-content size-modal" @click.stop>
        <div class="modal-header">
          <h3>Chọn Kích Cỡ</h3>
          <button @click="closeSizeModal" class="close-modal">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-body">
          <!-- Search Bar -->
          <div class="search-section">
            <div class="search-input-container">
              <iconify-icon icon="solar:magnifer-bold" class="search-icon"></iconify-icon>
              <input 
                type="text" 
                v-model="sizeSearchQuery"
                class="search-input"
                placeholder="Tìm kiếm kích cỡ..."
              />
            </div>
          </div>
          
          <!-- Sizes Table -->
          <div class="selection-table-container">
            <table class="selection-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input 
                      type="checkbox" 
                      :checked="isAllSizesSelected"
                      @change="toggleSelectAllSizes"
                      class="select-checkbox"
                    />
                  </th>
                  <th class="name-col">Tên Kích Cỡ</th>
                  <th class="code-col">Mã Kích Cỡ</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="size in filteredSizes" 
                  :key="size.id"
                  class="selection-row"
                  :class="{ 'selected': tempSelectedSizes.includes(size.id) }"
                >
                  <td class="checkbox-cell">
                    <input 
                      type="checkbox" 
                      :checked="tempSelectedSizes.includes(size.id)"
                      @change="toggleSizeSelection(size.id)"
                      class="select-checkbox"
                    />
                  </td>
                  <td class="name-cell">{{ size.name }}</td>
                  <td class="code-cell">{{ size.code || size.id }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Selected Count -->
          <div class="selection-summary">
            Đã chọn: {{ tempSelectedSizes.length }} kích cỡ
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeSizeModal" class="btn secondary">Hủy</button>
          <button @click="confirmSizeSelection" class="btn primary">Xác nhận</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmModal" class="modal-overlay" @click="closeDeleteConfirmModal">
      <div class="modal-content delete-confirm-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:danger-triangle-bold-duotone" class="warning-icon"></iconify-icon>
            Xác nhận xóa
          </h3>
          <button class="close-modal" @click="closeDeleteConfirmModal">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-message">{{ deleteConfirmData.message }}</p>
          <div class="warning-note">
            <iconify-icon icon="solar:info-circle-bold"></iconify-icon>
            Hành động này không thể hoàn tác.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="closeDeleteConfirmModal">Hủy bỏ</button>
          <button class="btn danger" @click="confirmDelete">
            <iconify-icon icon="solar:trash-bin-minimalistic-bold"></iconify-icon>
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { productService } from '@/services/api/productAPI.js';

export default {
  name: 'ThemSanPham',
  components: {
    Breadcrumb
  },
  setup() {
    const router = useRouter();
    const toast = useToast();

    const loading = ref(false);
    const imageUploading = ref(false);
    const imageInput = ref(null);

    // Modal states
    const showColorModal = ref(false);
    const showSizeModal = ref(false);
    const showDeleteConfirmModal = ref(false);
    const deleteConfirmData = ref({ type: '', index: null, message: '' });

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Quản lý', path: '/quan-ly' },
      { label: 'Sản phẩm', path: '/san-pham' },
      { label: 'Thêm mới', path: '/san-pham/them' }
    ]);

    // Form data
    const productForm = ref({
      name: '',
      code: '',
      categoryId: '',
      brandId: '',
      materialId: '',
      soleId: '',
      toeType: '',
      description: '',
      imageUrl: '',
      status: 'active'
    });

    // Variants data
    const selectedColors = ref([]);
    const selectedSizes = ref([]);
    const productVariants = ref([]);
    
    // Modal search and selection data
    const colorSearchQuery = ref('');
    const sizeSearchQuery = ref('');
    const tempSelectedColors = ref([]);
    const tempSelectedSizes = ref([]);
    
    // Bulk operations data
    const selectedVariants = ref([]);
    const bulkImportPrice = ref('');
    const bulkSalePrice = ref('');
    const bulkQuantity = ref('');

    // Data from API
    const categories = ref([]);
    const brands = ref([]);
    const materials = ref([]);
    const soles = ref([]);
    const colors = ref([]);
    const sizes = ref([]);

    // Currency formatting methods
    const formatCurrency = (value) => {
      if (!value || value === '') return '';
      const number = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) : value;
      if (isNaN(number)) return '';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(number);
    };

    const parseCurrency = (value) => {
      if (!value || value === '') return 0;
      const number = parseInt(value.replace(/[^\d]/g, ''));
      return isNaN(number) ? 0 : number;
    };

    const handlePriceInput = (event, variantIndex, field) => {
      const rawValue = event.target.value;
      const numericValue = parseCurrency(rawValue);
      productVariants.value[variantIndex][field] = numericValue;
      
      // Format the display value
      event.target.value = formatCurrency(numericValue);
    };

    const handleBulkPriceInput = (event, field) => {
      const rawValue = event.target.value;
      const numericValue = parseCurrency(rawValue);
      
      if (field === 'import') {
        bulkImportPrice.value = numericValue;
      } else if (field === 'sale') {
        bulkSalePrice.value = numericValue;
      }
      
      // Format the display value
      event.target.value = formatCurrency(numericValue);
    };

    // Methods
    const loadAttributes = async () => {
      try {
        const [categoriesRes, brandsRes, materialsRes, solesRes, colorsRes, sizesRes] = await Promise.all([
          productService.getAllCategories(),
          productService.getAllBrands(),
          productService.getAllMaterials(),
          productService.getAllSoles(),
          productService.getAllColors(),
          productService.getAllSizes()
        ]);

        categories.value = (categoriesRes.data || []).map(category => ({
          id: category.id,
          name: category.tenDanhMuc || category.name
        }));
        brands.value = (brandsRes.data || []).map(brand => ({
          id: brand.id,
          name: brand.tenThuongHieu || brand.name
        }));
        materials.value = (materialsRes.data || []).map(material => ({
          id: material.id,
          name: material.tenChatLieu || material.name
        }));
        soles.value = (solesRes.data || []).map(sole => ({
          id: sole.id,
          name: sole.tenDeGiay || sole.name
        }));
        colors.value = (colorsRes.data || []).map(color => ({
          id: color.id,
          name: color.tenMauSac || color.name,
          hex: color.hex || '#000000'
        }));
        sizes.value = (sizesRes.data || []).map(size => ({
          id: size.id,
          name: size.tenKichCo || size.name
        }));
      } catch (error) {
        toast.error('Lỗi khi tải danh sách thuộc tính');
        console.error('Error loading attributes:', error);
      }
    };

    // Computed properties for modal filtering
    const filteredColors = computed(() => {
      if (!colorSearchQuery.value) return colors.value;
      return colors.value.filter(color => 
        color.name.toLowerCase().includes(colorSearchQuery.value.toLowerCase()) ||
        color.hex.toLowerCase().includes(colorSearchQuery.value.toLowerCase())
      );
    });

    const filteredSizes = computed(() => {
      if (!sizeSearchQuery.value) return sizes.value;
      return sizes.value.filter(size => 
        size.name.toLowerCase().includes(sizeSearchQuery.value.toLowerCase())
      );
    });

    const isAllColorsSelected = computed(() => {
      return filteredColors.value.length > 0 && 
             filteredColors.value.every(color => tempSelectedColors.value.includes(color.id));
    });

    const isAllSizesSelected = computed(() => {
      return filteredSizes.value.length > 0 && 
             filteredSizes.value.every(size => tempSelectedSizes.value.includes(size.id));
    });

    // Variant generation
    const generateVariants = () => {
      const variants = [];
      selectedColors.value.forEach(color => {
        selectedSizes.value.forEach(size => {
          const existingVariant = productVariants.value.find(
            v => v.colorId === color.id && v.sizeId === size.id
          );
          
          if (existingVariant) {
            variants.push(existingVariant);
          } else {
            variants.push({
              colorId: color.id,
              colorName: color.name,
              colorHex: color.hex,
              sizeId: size.id,
              sizeName: size.name,
              imageUrl: '',
              importPrice: 0,
              salePrice: 0,
              quantity: 0
            });
          }
        });
      });
      productVariants.value = variants;
    };

    // Modal methods
    const openColorModal = () => {
      tempSelectedColors.value = selectedColors.value.map(c => c.id);
      colorSearchQuery.value = '';
      showColorModal.value = true;
    };

    const closeColorModal = () => {
      showColorModal.value = false;
      tempSelectedColors.value = [];
      colorSearchQuery.value = '';
    };

    const openSizeModal = () => {
      tempSelectedSizes.value = selectedSizes.value.map(s => s.id);
      sizeSearchQuery.value = '';
      showSizeModal.value = true;
    };

    const closeSizeModal = () => {
      showSizeModal.value = false;
      tempSelectedSizes.value = [];
      sizeSearchQuery.value = '';
    };

    // Selection methods
    const toggleColorSelection = (colorId) => {
      const index = tempSelectedColors.value.indexOf(colorId);
      if (index > -1) {
        tempSelectedColors.value.splice(index, 1);
      } else {
        tempSelectedColors.value.push(colorId);
      }
    };

    const toggleSizeSelection = (sizeId) => {
      const index = tempSelectedSizes.value.indexOf(sizeId);
      if (index > -1) {
        tempSelectedSizes.value.splice(index, 1);
      } else {
        tempSelectedSizes.value.push(sizeId);
      }
    };

    const toggleSelectAllColors = () => {
      if (isAllColorsSelected.value) {
        // Deselect all filtered colors
        filteredColors.value.forEach(color => {
          const index = tempSelectedColors.value.indexOf(color.id);
          if (index > -1) {
            tempSelectedColors.value.splice(index, 1);
          }
        });
      } else {
        // Select all filtered colors
        filteredColors.value.forEach(color => {
          if (!tempSelectedColors.value.includes(color.id)) {
            tempSelectedColors.value.push(color.id);
          }
        });
      }
    };

    const toggleSelectAllSizes = () => {
      if (isAllSizesSelected.value) {
        // Deselect all filtered sizes
        filteredSizes.value.forEach(size => {
          const index = tempSelectedSizes.value.indexOf(size.id);
          if (index > -1) {
            tempSelectedSizes.value.splice(index, 1);
          }
        });
      } else {
        // Select all filtered sizes
        filteredSizes.value.forEach(size => {
          if (!tempSelectedSizes.value.includes(size.id)) {
            tempSelectedSizes.value.push(size.id);
          }
        });
      }
    };

    const confirmColorSelection = () => {
      selectedColors.value = colors.value.filter(color => 
        tempSelectedColors.value.includes(color.id)
      );
      generateVariants();
      closeColorModal();
      toast.success(`Đã chọn ${selectedColors.value.length} màu sắc`);
    };

    const confirmSizeSelection = () => {
      selectedSizes.value = sizes.value.filter(size => 
        tempSelectedSizes.value.includes(size.id)
      );
      generateVariants();
      closeSizeModal();
      toast.success(`Đã chọn ${selectedSizes.value.length} kích cỡ`);
    };

    // Color methods
    const removeColor = (index) => {
      selectedColors.value.splice(index, 1);
      generateVariants();
    };

    // Size methods
    const removeSize = (index) => {
      selectedSizes.value.splice(index, 1);
      generateVariants();
    };

    // Image methods
    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        imageUploading.value = true;
        const imageUrl = await productService.uploadImage(file);
        productForm.value.imageUrl = imageUrl;
        toast.success('Tải ảnh lên thành công!');
      } catch (error) {
        toast.error('Lỗi khi tải ảnh lên');
        console.error('Error uploading image:', error);
      } finally {
        imageUploading.value = false;
      }
    };

    const removeMainImage = () => {
      productForm.value.imageUrl = '';
    };

    const handleVariantImageUpload = async (event, variantIndex) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const imageUrl = await productService.uploadImage(file);
        productVariants.value[variantIndex].imageUrl = imageUrl;
        toast.success('Tải ảnh biến thể thành công!');
      } catch (error) {
        toast.error('Lỗi khi tải ảnh lên');
        console.error('Error uploading variant image:', error);
      }
    };

    const removeVariantImage = (variantIndex) => {
      productVariants.value[variantIndex].imageUrl = '';
    };

    // Bulk operations computed
    const isAllSelected = computed(() => {
      return productVariants.value.length > 0 && selectedVariants.value.length === productVariants.value.length;
    });

    // Bulk operations methods
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedVariants.value = [];
      } else {
        selectedVariants.value = productVariants.value.map((_, index) => index);
      }
    };

    const toggleVariantSelection = (index) => {
      const selectedIndex = selectedVariants.value.indexOf(index);
      if (selectedIndex > -1) {
        selectedVariants.value.splice(selectedIndex, 1);
      } else {
        selectedVariants.value.push(index);
      }
    };

    const applyBulkImportPrice = () => {
      if (bulkImportPrice.value && selectedVariants.value.length > 0) {
        selectedVariants.value.forEach(index => {
          productVariants.value[index].importPrice = bulkImportPrice.value;
        });
        toast.success(`Đã áp dụng giá nhập cho ${selectedVariants.value.length} biến thể`);
        bulkImportPrice.value = '';
      }
    };

    const applyBulkSalePrice = () => {
      if (bulkSalePrice.value && selectedVariants.value.length > 0) {
        selectedVariants.value.forEach(index => {
          productVariants.value[index].salePrice = bulkSalePrice.value;
        });
        toast.success(`Đã áp dụng giá bán cho ${selectedVariants.value.length} biến thể`);
        bulkSalePrice.value = '';
      }
    };

    const applyBulkQuantity = () => {
      if (bulkQuantity.value && selectedVariants.value.length > 0) {
        selectedVariants.value.forEach(index => {
          productVariants.value[index].quantity = bulkQuantity.value;
        });
        toast.success(`Đã áp dụng số lượng cho ${selectedVariants.value.length} biến thể`);
        bulkQuantity.value = '';
      }
    };

    const deleteSelectedVariants = () => {
      if (selectedVariants.value.length === 0) return;
      
      deleteConfirmData.value = {
        type: 'bulk',
        index: null,
        message: `Bạn có chắc muốn xóa ${selectedVariants.value.length} biến thể đã chọn?`
      };
      showDeleteConfirmModal.value = true;
    };

    const editVariant = (index) => {
      // Focus on the first input field of the variant
      const firstInput = document.querySelector(`tr:nth-child(${index + 1}) .table-input`);
      if (firstInput) {
        firstInput.focus();
      }
    };

    const deleteVariant = (index) => {
      const variant = productVariants.value[index];
      deleteConfirmData.value = {
        type: 'single',
        index: index,
        message: `Bạn có chắc muốn xóa biến thể ${variant.colorName} - ${variant.sizeName}?`
      };
      showDeleteConfirmModal.value = true;
    };

    const confirmDelete = () => {
      if (deleteConfirmData.value.type === 'bulk') {
        // Sort indices in descending order to avoid index shifting issues
        const sortedIndices = selectedVariants.value.sort((a, b) => b - a);
        sortedIndices.forEach(index => {
          productVariants.value.splice(index, 1);
        });
        selectedVariants.value = [];
        toast.success('Đã xóa các biến thể đã chọn');
      } else if (deleteConfirmData.value.type === 'single') {
        const index = deleteConfirmData.value.index;
        productVariants.value.splice(index, 1);
        // Remove from selected if it was selected
        const selectedIndex = selectedVariants.value.indexOf(index);
        if (selectedIndex > -1) {
          selectedVariants.value.splice(selectedIndex, 1);
        }
        // Adjust other selected indices
        selectedVariants.value = selectedVariants.value.map(i => i > index ? i - 1 : i);
        toast.success('Đã xóa biến thể');
      }
      
      // Clean up unused colors and sizes
      cleanupUnusedSelections();
      closeDeleteConfirmModal();
    };

    const cleanupUnusedSelections = () => {
      // Get all unique color IDs and size IDs from remaining variants
      const usedColorIds = [...new Set(productVariants.value.map(v => v.colorId))];
      const usedSizeIds = [...new Set(productVariants.value.map(v => v.sizeId))];
      
      // Filter out unused colors
      const originalColorCount = selectedColors.value.length;
      selectedColors.value = selectedColors.value.filter(color => usedColorIds.includes(color.id));
      
      // Filter out unused sizes
      const originalSizeCount = selectedSizes.value.length;
      selectedSizes.value = selectedSizes.value.filter(size => usedSizeIds.includes(size.id));
      
      // Show notification if any colors or sizes were removed
      const removedColors = originalColorCount - selectedColors.value.length;
      const removedSizes = originalSizeCount - selectedSizes.value.length;
      
      if (removedColors > 0 || removedSizes > 0) {
        let message = 'Đã tự động xóa: ';
        const parts = [];
        if (removedColors > 0) parts.push(`${removedColors} màu sắc`);
        if (removedSizes > 0) parts.push(`${removedSizes} kích cỡ`);
        message += parts.join(' và ') + ' không còn sử dụng';
        toast.info(message);
      }
    };

    const closeDeleteConfirmModal = () => {
      showDeleteConfirmModal.value = false;
      deleteConfirmData.value = { type: '', index: null, message: '' };
    };

    const saveProduct = async () => {
      try {
        loading.value = true;
        
        const productData = {
          tenSanPham: productForm.value.name,
          moTaSanPham: productForm.value.description,
          idDanhMuc: productForm.value.categoryId ? Number(productForm.value.categoryId) : null,
          idThuongHieu: productForm.value.brandId ? Number(productForm.value.brandId) : null,
          idChatLieu: productForm.value.materialId ? Number(productForm.value.materialId) : null,
          idDeGiay: productForm.value.soleId ? Number(productForm.value.soleId) : null,
          urlAnhDaiDien: productForm.value.imageUrl,
          trangThai: productForm.value.status,
          variants: productVariants.value
        };

        await productService.createProduct(productData);
        toast.success('Thêm sản phẩm thành công!');
        
        goBack();
      } catch (error) {
        toast.error('Lỗi khi thêm sản phẩm');
        console.error('Error saving product:', error);
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.push('/san-pham');
    };

    // Initialize
    onMounted(async () => {
      await loadAttributes();
    });

    return {
      loading,
      breadcrumbItems,
      productForm,
      categories,
      brands,
      materials,
      soles,
      colors,
      sizes,
      imageUploading,
      imageInput,
      showColorModal,
      showSizeModal,
      selectedColors,
      selectedSizes,
      productVariants,
      selectedVariants,
      bulkImportPrice,
      bulkSalePrice,
      bulkQuantity,
      isAllSelected,
      // Modal data
      colorSearchQuery,
      sizeSearchQuery,
      tempSelectedColors,
      tempSelectedSizes,
      filteredColors,
      filteredSizes,
      isAllColorsSelected,
      isAllSizesSelected,
      showDeleteConfirmModal,
      deleteConfirmData,
      // Modal methods
      openColorModal,
      closeColorModal,
      openSizeModal,
      closeSizeModal,
      toggleColorSelection,
      toggleSizeSelection,
      toggleSelectAllColors,
      toggleSelectAllSizes,
      confirmColorSelection,
      confirmSizeSelection,
      confirmDelete,
      closeDeleteConfirmModal,
      // Currency formatting methods
      formatCurrency,
      parseCurrency,
      handlePriceInput,
      handleBulkPriceInput,
      // Original methods
      removeColor,
      removeSize,
      generateVariants,
      handleImageUpload,
      removeMainImage,
      handleVariantImageUpload,
      removeVariantImage,
      toggleSelectAll,
      toggleVariantSelection,
      applyBulkImportPrice,
      applyBulkSalePrice,
      applyBulkQuantity,
      deleteSelectedVariants,
      editVariant,
      deleteVariant,
      saveProduct,
      goBack
    };
  }
};
</script>

<style scoped>
/* Container Styles */
.them-san-pham-container {
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* Main Content Layout */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 100%;
  margin: 0 auto;
}

/* Panel Styles */
.product-info-section,
.variants-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Attributes Grid - 2 per row */
.attributes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.panel-title iconify-icon {
  font-size: 24px;
  color: #007bff;
}

/* Form Styles */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.form-label.required::after {
  content: ' *';
  color: #dc2626;
}

.optional {
  font-weight: 400;
  color: #6b7280;
  font-size: 12px;
}

/* Input with Button Styles */
.input-with-button {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.input-with-button .form-input {
  padding-right: 48px;
}

.select-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.select-btn:hover {
  background: #f3f4f6;
  color: #007bff;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Rich Text Editor */
.rich-text-editor {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.format-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  background: white;
}

.toolbar-buttons {
  display: flex;
  gap: 4px;
}

.toolbar-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: #e5e7eb;
}

.rich-text-editor .form-textarea {
  border: none;
  border-radius: 0;
  background: white;
  margin: 0;
}

/* Variants Table Styles */
.variants-table {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 100px 120px 120px 120px 120px 100px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.header-cell {
  padding: 12px 8px;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
  text-align: center;
  border-right: 1px solid #e2e8f0;
}

.header-cell:last-child {
  border-right: none;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 100px 120px 120px 120px 120px 100px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f1f5f9;
  font-size: 12px;
}

.table-cell:last-child {
  border-right: none;
}

.image-cell {
  padding: 8px;
}

.variant-image-container {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-variant-image {
  width: 100%;
  height: 100%;
}

.variant-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.variant-upload-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.variant-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.variant-upload-label:hover {
  background: #f0f9ff;
  border-color: #007bff;
  color: #007bff;
}

.variant-color-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.variant-color-preview {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.variant-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.variant-input:focus {
  outline: none;
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.remove-variant-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-variant-btn:hover {
  background: #dc2626;
  color: white;
}

.no-variants-message {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 24px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* New Variants Styles */
.variants-content {
  padding: 0;
}

/* Selection Grid */
.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.selection-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selection-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.selection-label iconify-icon {
  font-size: 20px;
  color: #007bff;
}

.selection-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-color-chip,
.selected-size-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.selected-color-chip:hover,
.selected-size-chip:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #e2e8f0;
  flex-shrink: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.add-selection-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  color: #007bff;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.add-selection-btn:hover {
  background: #f0f9ff;
  border-color: #007bff;
  color: #0056b3;
}

/* Main Image Section */
.main-image-section {
  margin-bottom: 32px;
}

.main-image-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-main-image {
  position: relative;
  display: inline-block;
  border-radius: 12px;
  overflow: hidden;
}

.main-preview-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.current-main-image:hover .image-overlay,
.current-variant-image:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.overlay-btn.remove {
  color: #dc2626;
}

.overlay-btn:hover {
  background: white;
  transform: scale(1.1);
}

.main-upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-upload-label {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 400px;
}

.main-upload-label:hover {
  background: #f0f9ff;
  border-color: #007bff;
}

.main-upload-label iconify-icon {
  font-size: 32px;
  color: #007bff;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.upload-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #495057;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  border-radius: 2px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* Variants Table */
.variants-table-section {
  margin-top: 32px;
}

.variants-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.bulk-actions {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.bulk-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.bulk-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.bulk-input-group:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
}

.bulk-input-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.bulk-input-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.bulk-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.bulk-actions-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.bulk-actions-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.bulk-actions-info iconify-icon {
  color: #3b82f6;
}

.apply-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.apply-btn:hover {
  background: #059669;
}

.bulk-delete-btn {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 200px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.bulk-delete-btn:hover {
  background: #b91c1c;
}

/* Responsive Design for Bulk Actions */
@media (max-width: 1024px) {
  .bulk-inputs {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .bulk-actions {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .bulk-inputs {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .bulk-actions {
    padding: 12px;
    border-radius: 12px;
  }
  
  .bulk-input-group {
    padding: 12px;
  }
  
  .bulk-actions-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .bulk-delete-btn {
    max-width: none;
    width: 100%;
  }
  
  .bulk-actions-info {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .bulk-actions {
    margin: 0 -8px;
    border-radius: 8px;
  }
  
  .bulk-input-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .apply-btn {
    width: 100%;
    padding: 10px;
  }
  
  .bulk-input {
    width: 100%;
  }
}

.variants-table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  max-height: 600px;
  overflow-y: auto;
}

.variants-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.variants-table th,
.variants-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.variants-table th {
  background: #f8fafc;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
}

.checkbox-col { width: 50px; }
.image-col { width: 80px; }
.color-col { width: 120px; }
.size-col { width: 80px; }
.price-col { width: 120px; }
.quantity-col { width: 100px; }
.actions-col { width: 120px; }

.variant-row {
  transition: all 0.2s ease;
}

.variant-row:hover {
  background: #f8fafc;
}

.variant-row.selected {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.select-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.table-image-container {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
}

.current-table-image {
  width: 100%;
  height: 100%;
}

.table-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.table-upload-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.table-upload-label:hover {
  background: #f0f9ff;
  border-color: #007bff;
  color: #007bff;
}

.table-color-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
}

.table-color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #e2e8f0;
  flex-shrink: 0;
}

.size-badge {
  background: #f0f9ff;
  color: #007bff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.table-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.table-input:focus {
  outline: none;
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.edit-btn {
  color: #0ea5e9;
}

.edit-btn:hover {
  background: #e0f2fe;
  color: #0284c7;
}

.image-btn {
  color: #f59e0b;
}

.image-btn:hover {
  background: #fef3c7;
  color: #d97706;
}

.delete-btn {
  color: #dc2626;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
}

/* Image Upload Styles */
.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-image {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  width: 100%;
}

.file-upload-label:hover {
  background: #f0f9ff;
  border-color: #007bff;
  color: #007bff;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
  color: #495057;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.color-modal,
.size-modal {
  max-width: 800px;
  width: 95%;
  max-height: 85vh;
}

/* Main Image Container Fix */
.current-main-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.current-main-image {
  position: relative;
  display: inline-block;
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-modal {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-modal:hover {
  background: #f3f4f6;
  color: #dc2626;
}

/* Search Section */
.search-section {
  margin-bottom: 20px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #6b7280;
  font-size: 16px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
}

/* Selection Table */
.selection-table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.selection-table {
  width: 100%;
  border-collapse: collapse;
}

.selection-table th,
.selection-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.selection-table th {
  background: #f8fafc;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
}

.selection-table .checkbox-col { width: 50px; text-align: center; }
.selection-table .preview-col { width: 80px; text-align: center; }
.selection-table .name-col { width: auto; }
.selection-table .code-col { width: 120px; }

.selection-row {
  transition: all 0.2s ease;
  cursor: pointer;
}

.selection-row:hover {
  background: #f8fafc;
}

.selection-row.selected {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.checkbox-cell,
.preview-cell,
.name-cell,
.code-cell {
  padding: 12px 16px;
}

.checkbox-cell {
  text-align: center;
}

.preview-cell {
  text-align: center;
}

.color-preview-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #e2e8f0;
  margin: 0 auto;
}

.name-cell {
  font-weight: 500;
  color: #374151;
}

.code-cell {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #6b7280;
}

/* Selection Summary */
.selection-summary {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  margin-bottom: 16px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.modal-footer .btn {
  min-width: 100px;
}

/* Delete Confirmation Modal */
.delete-confirm-modal {
  max-width: 450px;
  width: 90%;
}

.delete-confirm-modal .modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
}

.warning-icon {
  color: #f59e0b;
  font-size: 20px;
}

.confirm-message {
  font-size: 16px;
  color: #374151;
  margin-bottom: 16px;
  line-height: 1.5;
}

.warning-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  font-size: 14px;
  color: #92400e;
}

.warning-note iconify-icon {
  color: #f59e0b;
  font-size: 16px;
  flex-shrink: 0;
}

.btn.danger {
  background: #dc2626;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn.danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding: 24px 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  min-width: 120px;
  justify-content: center;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover {
  background: #545b62;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3);
}

.btn.secondary:hover:not(.btn.danger) {
  background: #545b62;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Responsive Design */
@media (max-width: 968px) {
  .attributes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 60px 80px 100px 100px 100px 100px 80px;
  }
  
  .header-cell,
  .table-cell {
    font-size: 11px;
    padding: 8px 4px;
  }
  
  .variant-image-container {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 768px) {
  .them-san-pham-container {
    padding: 16px;
  }
  
  .product-info-section,
  .variants-section,
  .form-actions {
    padding: 20px;
  }
  
  .attributes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .panel-title {
    font-size: 18px;
  }
  
  .colors-grid,
  .sizes-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .variants-table {
    overflow-x: auto;
  }
  
  .table-header,
  .table-row {
    min-width: 600px;
  }
}
</style>
