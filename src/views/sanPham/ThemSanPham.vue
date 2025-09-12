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

    <!-- Form Section -->
    <div class="form-section">
      <div class="form-header">
        <h3 class="form-title">
          Thêm Sản Phẩm Mới
        </h3>
      </div>

      <form @submit.prevent="saveProduct" class="product-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">Tên sản phẩm</label>
            <input 
              type="text" 
              v-model="productForm.name" 
              class="form-input"
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label required">Mã sản phẩm</label>
            <input 
              type="text" 
              v-model="productForm.code" 
              class="form-input"
              placeholder="Nhập mã sản phẩm"
              required
            />
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
          <textarea 
            v-model="productForm.description" 
            class="form-textarea"
            placeholder="Nhập mô tả sản phẩm"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group full-width">
          <label class="form-label">Hình ảnh đại diện</label>
          <div class="image-upload-container">
            <div class="current-image" v-if="productForm.imageUrl">
              <img :src="productForm.imageUrl" alt="Preview image" class="preview-image" />
              <p class="image-label">Ảnh đã chọn</p>
            </div>
            <div class="upload-section">
              <input 
                type="file" 
                ref="imageInput"
                @change="handleImageUpload"
                accept="image/*"
                class="file-input"
                id="image-upload"
              />
              <label for="image-upload" class="file-upload-label">
                <iconify-icon icon="solar:cloud-upload-bold"></iconify-icon>
                {{ productForm.imageUrl ? 'Thay đổi ảnh' : 'Chọn ảnh' }}
              </label>
              <div v-if="imageUploading" class="upload-progress">
                <div class="loading-spinner"></div>
                <span>Đang tải ảnh lên...</span>
              </div>
            </div>
          </div>
        </div>


        <div class="form-actions">
          <button type="button" class="btn secondary" @click="goBack">
            Quay lại
          </button>
          <button type="submit" class="btn primary" :disabled="loading">
            Thêm sản phẩm
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { productService } from '@/services/api/productAPI.js';
import { countryService } from '@/services/countryService.js';

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
      description: '',
      country: '',
      imageUrl: '',
      status: 'active'
    });

    // Data from API
    const categories = ref([]);
    const brands = ref([]);
    const countries = ref([]);

    // Methods
    const loadAttributes = async () => {
      try {
        const [categoriesRes, brandsRes, countriesData] = await Promise.all([
          productService.getAllCategories(),
          productService.getAllBrands(),
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
          ma: productForm.value.code,
          moTaSanPham: productForm.value.description,
          quocGiaSanXuat: productForm.value.country,
          idDanhMuc: productForm.value.categoryId ? Number(productForm.value.categoryId) : null,
          idThuongHieu: productForm.value.brandId ? Number(productForm.value.brandId) : null,
          urlAnhDaiDien: productForm.value.imageUrl,
          trangThai: productForm.value.status
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
.them-san-pham-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
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
.image-upload-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.current-image {
  text-align: center;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.image-label {
  margin-top: 8px;
  font-size: 14px;
  color: #64748b;
}

.upload-section {
  flex: 1;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #007bff;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.file-upload-label:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
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

/* Button Styles */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
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
  .them-san-pham-container {
    padding: 16px;
  }
  
  .form-section {
    padding: 24px 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
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
