<template>
  <div class="sua-san-pham-container">
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" :show-page-info="true" page-title="Chỉnh Sửa Sản Phẩm"
      page-description="Chỉnh sửa thông tin sản phẩm" page-icon="solar:widget-4-bold-duotone" />

    <!-- Form Section -->
    <div class="form-section">
      <div class="form-header">
        <h3 class="form-title">
          Chỉnh Sửa Sản Phẩm
        </h3>
      </div>

      <form @submit.prevent="saveProduct" class="product-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">Tên sản phẩm</label>
            <input type="text" v-model="productForm.name" class="form-input" placeholder="Nhập tên sản phẩm" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mã sản phẩm</label>
            <input type="text" v-model="productForm.code" class="form-input disabled-input" placeholder="Mã sản phẩm"
              readonly disabled />
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
            <label class="form-label required">Chất liệu</label>
            <select v-model="productForm.materialId" class="form-input" required>
              <option value="">Chọn chất liệu</option>
              <option v-for="material in materials" :key="material.id" :value="material.id">
                {{ material.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label required">Đế giày</label>
            <select v-model="productForm.soleId" class="form-input" required>
              <option value="">Chọn đế giày</option>
              <option v-for="sole in soles" :key="sole.id" :value="sole.id">
                {{ sole.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quốc gia sản xuất</label>
              <select v-model="productForm.country" class="form-input">
                <option value="">Chọn quốc gia sản xuất</option>
                <option v-for="country in countries" :key="country.code" :value="country.name">
                  {{ country.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Trạng thái</label>
              <select v-model="productForm.status" class="form-input">
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">Mô tả sản phẩm</label>
          <textarea v-model="productForm.description" class="form-textarea" placeholder="Nhập mô tả sản phẩm"
            rows="4"></textarea>
        </div>

        <div class="form-group full-width">
          <label class="form-label">Hình ảnh đại diện</label>
          <div class="image-upload-wrapper">
            <!-- Upload Area -->
            <div class="upload-area" :class="{ 'has-image': productForm.imageUrl, 'uploading': imageUploading }">
              <input 
                type="file" 
                ref="imageInput" 
                @change="handleImageUpload" 
                accept="image/*" 
                class="file-input"
                id="image-upload" 
              />
              
              <!-- Image Preview -->
              <div v-if="productForm.imageUrl && !imageUploading" class="image-preview">
                <img :src="productForm.imageUrl" alt="Product image" class="preview-img" />
                <div class="image-overlay">
                  <button type="button" class="change-image-btn" @click="$refs.imageInput.click()">
                    <iconify-icon icon="solar:camera-bold"></iconify-icon>
                    Thay đổi ảnh
                  </button>
                </div>
              </div>
              
              <!-- Upload Placeholder -->
              <label v-else-if="!imageUploading" for="image-upload" class="upload-placeholder">
                <div class="upload-icon">
                  <iconify-icon icon="solar:cloud-upload-bold-duotone"></iconify-icon>
                </div>
                <div class="upload-text">
                  <h4>Tải lên hình ảnh</h4>
                  <p>Kéo thả hoặc nhấp để chọn ảnh</p>
                  <span class="upload-hint">PNG, JPG, GIF tối đa 10MB</span>
                </div>
              </label>
              
              <!-- Upload Progress -->
              <div v-if="imageUploading" class="upload-loading">
                <div class="loading-animation">
                  <div class="loading-circle"></div>
                  <iconify-icon icon="solar:cloud-upload-bold-duotone"></iconify-icon>
                </div>
                <div class="loading-text">
                  <h4>Đang tải ảnh lên...</h4>
                  <p>Vui lòng đợi trong giây lát</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn secondary" @click="goBack">
            Quay lại
          </button>
          <button type="submit" class="btn primary" :disabled="loading">
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { productService } from '@/services/api/productAPI.js';
import { countryService } from '@/services/countryService.js';

export default {
  name: 'SuaSanPham',
  components: {
    Breadcrumb
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();

    const loading = ref(false);
    const productId = ref(null);
    const imageUploading = ref(false);
    const imageInput = ref(null);

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Quản lý', path: '/quan-ly' },
      { label: 'Sản phẩm', path: '/san-pham' },
      { label: 'Chỉnh sửa', path: `/san-pham/sua/${route.params.id}` }
    ]);

    // Form data
    const productForm = ref({
      name: '',
      code: '',
      categoryId: '',
      brandId: '',
      materialId: '',
      soleId: '',
      description: '',
      country: '',
      imageUrl: '',
      status: 'active'
    });

    // Data from API
    const categories = ref([]);
    const brands = ref([]);
    const materials = ref([]);
    const soles = ref([]);
    const countries = ref([]);

    // Methods
    const loadProduct = async (id) => {
      try {
        loading.value = true;
        const response = await productService.getProductById(id);
        const product = response.data;

        productForm.value = {
          name: product.tenSanPham || '',
          code: product.ma || '',
          categoryId: product.idDanhMuc?.id || '',
          brandId: product.idThuongHieu?.id || '',
          materialId: product.idChatLieu?.id || '',
          soleId: product.idDeGiay?.id || '',
          description: product.moTaSanPham || '',
          country: product.quocGiaSanXuat || '',
          imageUrl: product.idAnhSanPham?.urlAnh || '',
          status: product.trangThai || 'active'
        };
      } catch (error) {
        toast.error('Lỗi khi tải thông tin sản phẩm');
        console.error('Error loading product:', error);
        goBack();
      } finally {
        loading.value = false;
      }
    };

    const loadAttributes = async () => {
      try {
        const [categoriesRes, brandsRes, materialsRes, solesRes, countriesData] = await Promise.all([
          productService.getAllCategories(),
          productService.getAllBrands(),
          productService.getAllMaterials(),
          productService.getAllSoles(),
          countryService.getAllCountries()
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
        countries.value = countriesData;
      } catch (error) {
        toast.error('Lỗi khi tải danh sách thuộc tính');
        console.error('Error loading attributes:', error);
      }
    };

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

    const saveProduct = async () => {
      try {
        loading.value = true;

        const productData = {
          tenSanPham: productForm.value.name,
          // Remove ma field from update - code should not be updatable
          moTaSanPham: productForm.value.description,
          quocGiaSanXuat: productForm.value.country,
          idDanhMuc: productForm.value.categoryId ? Number(productForm.value.categoryId) : null,
          idThuongHieu: productForm.value.brandId ? Number(productForm.value.brandId) : null,
          idChatLieu: productForm.value.materialId ? Number(productForm.value.materialId) : null,
          idDeGiay: productForm.value.soleId ? Number(productForm.value.soleId) : null,
          urlAnhDaiDien: productForm.value.imageUrl,
          trangThai: productForm.value.status
        };

        await productService.updateProduct(productId.value, productData);
        toast.success('Cập nhật sản phẩm thành công!');

        goBack();
      } catch (error) {
        toast.error('Lỗi khi cập nhật sản phẩm');
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
      productId.value = route.params.id;

      if (!productId.value) {
        toast.error('ID sản phẩm không hợp lệ');
        goBack();
        return;
      }

      await loadAttributes();
      await loadProduct(productId.value);
    });

    return {
      loading,
      breadcrumbItems,
      productForm,
      categories,
      brands,
      materials,
      soles,
      countries,
      imageUploading,
      imageInput,
      handleImageUpload,
      saveProduct,
      goBack
    };
  }
};
</script>

<style scoped>
/* Container Styles */
.sua-san-pham-container {
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* Form Styles */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: span 2;
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

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f9fafb;
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
  min-height: 100px;
}

/* Image Upload Styles */
.image-upload-wrapper {
  width: 100%;
}

.upload-area {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  background: #f9fafb;
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-area.has-image {
  border: 2px solid #e2e8f0;
  background: white;
}

.upload-area.uploading {
  border-color: #007bff;
  background: #f0f8ff;
}

.file-input {
  display: none;
}

/* Image Preview */
.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.change-image-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #007bff;
  color: white;
}

.change-image-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

/* Upload Placeholder */
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.upload-area:hover .upload-icon {
  color: #007bff;
  transform: scale(1.1);
}

.upload-text h4 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.upload-text p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

/* Upload Loading */
.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  padding: 20px;
  text-align: center;
}

.loading-animation {
  position: relative;
  margin-bottom: 16px;
}

.loading-circle {
  width: 48px;
  height: 48px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.loading-animation iconify-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  color: #007bff;
}

.loading-text h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px 0;
}

.loading-text p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Button Styles */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sua-san-pham-container {
    padding: 16px;
  }

  .form-section {
    padding: 24px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Disabled Input Styles */
.disabled-input {
  background-color: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed !important;
  opacity: 0.8 !important;
}

@media (max-width: 768px) {
  .form-group.full-width {
    grid-column: span 1;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-title {
    font-size: 24px;
  }
}
</style>
