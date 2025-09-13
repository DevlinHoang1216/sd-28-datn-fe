<template>
  <div class="sua-chi-tiet-san-pham-container">
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" :show-page-info="true" page-title="Chỉnh Sửa Chi Tiết Sản Phẩm"
      page-description="Chỉnh sửa thông tin chi tiết sản phẩm" page-icon="solar:widget-4-bold-duotone" />

    <!-- Form Section -->
    <div class="form-section">
      <div class="form-header">
        <h3 class="form-title">
          Chỉnh Sửa Chi Tiết Sản Phẩm
        </h3>
      </div>

      <form @submit.prevent="saveChiTietSanPham" class="product-detail-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Mã chi tiết sản phẩm</label>
            <input type="text" v-model="productDetailForm.code" class="form-input disabled-input" placeholder="Mã chi tiết sản phẩm"
              readonly disabled />
          </div>
          <div class="form-group">
            <label class="form-label">Tên sản phẩm</label>
            <input type="text" v-model="productDetailForm.productName" class="form-input disabled-input" placeholder="Tên sản phẩm"
              readonly disabled />
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
            <label class="form-label required">Số lượng tồn kho</label>
            <input type="number" v-model="productDetailForm.stockQuantity" class="form-input" 
              placeholder="Nhập số lượng tồn kho" min="0" required />
          </div>
          <div class="form-group">
            <label class="form-label required">Giá nhập</label>
            <input type="number" v-model="productDetailForm.importPrice" class="form-input" 
              placeholder="Nhập giá nhập" min="0" step="0.01" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">Giá bán</label>
            <input type="number" v-model="productDetailForm.sellPrice" class="form-input" 
              placeholder="Nhập giá bán" min="0" step="0.01" required />
          </div>
          <div class="form-group">
            <!-- Empty space for alignment -->
          </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">Mô tả chi tiết</label>
          <textarea v-model="productDetailForm.description" class="form-textarea" placeholder="Nhập mô tả chi tiết"
            rows="4"></textarea>
        </div>

        <div class="form-group full-width">
          <label class="form-label">Hình ảnh sản phẩm</label>
          <div class="image-upload-wrapper">
            <!-- Upload Area -->
            <div class="upload-area" :class="{ 'has-image': productDetailForm.imageUrl, 'uploading': imageUploading }">
              <input 
                type="file" 
                ref="imageInput" 
                @change="handleImageUpload" 
                accept="image/*" 
                class="file-input"
                id="image-upload" 
              />
              
              <!-- Image Preview -->
              <div v-if="productDetailForm.imageUrl && !imageUploading" class="image-preview">
                <img :src="productDetailForm.imageUrl" alt="Product detail image" class="preview-img" />
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

export default {
  name: 'SuaChiTietSanPham',
  components: {
    Breadcrumb
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();

    const loading = ref(false);
    const productDetailId = ref(null);
    const imageUploading = ref(false);
    const imageInput = ref(null);

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Quản lý', path: '/quan-ly' },
      { label: 'Sản phẩm', path: '/san-pham' },
      { label: 'Chi tiết sản phẩm', path: `/san-pham/${route.params.productId}/chi-tiet` },
      { label: 'Chỉnh sửa', path: `/san-pham/chi-tiet/sua/${route.params.id}` }
    ]);

    // Form data
    const productDetailForm = ref({
      code: '',
      productName: '',
      colorId: '',
      sizeId: '',
      stockQuantity: 0,
      importPrice: 0,
      sellPrice: 0,
      description: '',
      imageUrl: ''
    });

    // Store product ID for navigation
    const productId = ref(null);

    // Data from API
    const colors = ref([]);
    const sizes = ref([]);

    // Methods
    const loadProductDetail = async (id) => {
      try {
        loading.value = true;
        const response = await productService.getChiTietSanPhamById(id);
        const productDetail = response.data;

        productDetailForm.value = {
          code: productDetail.ma || '',
          productName: productDetail.idSanPham?.tenSanPham || '',
          colorId: productDetail.idMauSac?.id || '',
          sizeId: productDetail.idKichCo?.id || '',
          stockQuantity: productDetail.soLuongTonKho || 0,
          importPrice: productDetail.giaNhap || 0,
          sellPrice: productDetail.giaBan || 0,
          description: productDetail.moTaChiTiet || '',
          imageUrl: productDetail.idAnhSanPham?.urlAnh || ''
        };

        // Store the product ID for navigation
        productId.value = productDetail.idSanPham?.id;
      } catch (error) {
        toast.error('Lỗi khi tải thông tin chi tiết sản phẩm');
        console.error('Error loading product detail:', error);
        goBack();
      } finally {
        loading.value = false;
      }
    };

    const loadAttributes = async () => {
      try {
        const [colorsRes, sizesRes] = await Promise.all([
          productService.getAllColors(),
          productService.getAllSizes()
        ]);

        colors.value = (colorsRes.data || []).map(color => ({
          id: color.id,
          name: color.tenMauSac || color.name
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

    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        imageUploading.value = true;
        const imageUrl = await productService.uploadImage(file);
        productDetailForm.value.imageUrl = imageUrl;
        toast.success('Tải ảnh lên thành công!');
      } catch (error) {
        toast.error('Lỗi khi tải ảnh lên');
        console.error('Error uploading image:', error);
      } finally {
        imageUploading.value = false;
      }
    };

    const saveChiTietSanPham = async () => {
      try {
        loading.value = true;

        const productDetailData = {
          idMauSac: productDetailForm.value.colorId ? Number(productDetailForm.value.colorId) : null,
          idKichCo: productDetailForm.value.sizeId ? Number(productDetailForm.value.sizeId) : null,
          soLuongTonKho: productDetailForm.value.stockQuantity,
          giaNhap: productDetailForm.value.importPrice,
          giaBan: productDetailForm.value.sellPrice,
          moTaChiTiet: productDetailForm.value.description,
          urlAnhSanPham: productDetailForm.value.imageUrl
        };

        await productService.updateChiTietSanPham(productDetailId.value, productDetailData);
        toast.success('Cập nhật chi tiết sản phẩm thành công!');

        goBack();
      } catch (error) {
        toast.error('Lỗi khi cập nhật chi tiết sản phẩm');
        console.error('Error saving product detail:', error);
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      if (productId.value) {
        router.push(`/san-pham/chi-tiet/${productId.value}`);
      } else {
        router.push('/san-pham');
      }
    };

    // Initialize
    onMounted(async () => {
      productDetailId.value = route.params.id;

      if (!productDetailId.value) {
        toast.error('ID chi tiết sản phẩm không hợp lệ');
        goBack();
        return;
      }

      await loadAttributes();
      await loadProductDetail(productDetailId.value);
    });

    return {
      loading,
      breadcrumbItems,
      productDetailForm,
      colors,
      sizes,
      imageUploading,
      imageInput,
      handleImageUpload,
      saveChiTietSanPham,
      goBack
    };
  }
};
</script>

<style scoped>
/* Container Styles */
.sua-chi-tiet-san-pham-container {
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
.product-detail-form {
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
  .sua-chi-tiet-san-pham-container {
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
