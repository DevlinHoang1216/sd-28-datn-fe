<template>
  <div class="them-danh-muc-container">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Thêm Danh Mục Mới"
      page-description="Thêm danh mục mới cho sản phẩm"
      page-icon="solar:folder-2-bold-duotone"
    />

    <!-- Form Section -->
    <div class="form-section">
      <div class="form-header">
        <h3 class="form-title">
          {{ isEdit ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới' }}
        </h3>
      </div>

      <form @submit.prevent="saveCategory" class="category-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">Tên danh mục</label>
            <input 
              type="text" 
              v-model="categoryForm.name" 
              class="form-input"
              placeholder="Nhập tên danh mục"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn secondary" @click="goBack">
            Quay lại
          </button>
          <button type="submit" class="btn primary" :disabled="loading">
            {{ isEdit ? 'Cập nhật' : 'Thêm danh mục' }}
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
  name: 'ThemDanhMuc',
  components: {
    Breadcrumb
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();

    const isEdit = ref(false);
    const loading = ref(false);
    const categoryId = ref(null);

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Quản lý', path: '/quan-ly' },
      { label: 'Thuộc tính', path: '/attributes' },
      { label: 'Danh mục', path: '/thuoc-tinh/danh-muc' },
      { label: 'Thêm mới', path: '/thuoc-tinh/danh-muc/them' }
    ]);

    // Form data
    const categoryForm = ref({
      name: ''
    });

    // Methods
    const loadCategory = async (id) => {
      try {
        loading.value = true;
        const response = await productService.getCategoryById(id);
        const category = response.data;
        
        categoryForm.value = {
          name: category.tenDanhMuc
        };
        
        // Update breadcrumb for edit mode
        breadcrumbItems.value[3] = { label: 'Chỉnh sửa', path: `/thuoc-tinh/danh-muc/sua/${id}` };
      } catch (error) {
        toast.error('Lỗi khi tải thông tin danh mục');
        console.error('Error loading category:', error);
        goBack();
      } finally {
        loading.value = false;
      }
    };

    const saveCategory = async () => {
      try {
        loading.value = true;
        
        // Validate name is not empty
        if (!categoryForm.value.name.trim()) {
          toast.error('Tên danh mục không được để trống');
          return;
        }
        
        // Check for duplicate name
        try {
          const checkResponse = await productService.checkCategoryNameExists(
            categoryForm.value.name.trim(),
            isEdit.value ? categoryId.value : null
          );
          
          if (checkResponse.data.exists) {
            toast.error('Tên danh mục đã tồn tại');
            return;
          }
        } catch (checkError) {
          console.error('Error checking duplicate name:', checkError);
          // Continue with save if check fails
        }
        
        const categoryData = {
          tenDanhMuc: categoryForm.value.name.trim()
        };

        if (isEdit.value) {
          await productService.updateCategory(categoryId.value, categoryData);
          toast.success('Cập nhật danh mục thành công!');
        } else {
          await productService.createCategory(categoryData);
          toast.success('Thêm danh mục mới thành công!');
        }
        
        goBack();
      } catch (error) {
        toast.error('Lỗi khi lưu danh mục: ' + (error.response?.data || error.message));
        console.error('Error saving category:', error);
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.push('/thuoc-tinh/danh-muc');
    };

    // Check if this is edit mode
    onMounted(() => {
      if (route.params.id) {
        isEdit.value = true;
        categoryId.value = route.params.id;
        loadCategory(route.params.id);
      }
    });

    return {
      breadcrumbItems,
      categoryForm,
      isEdit,
      loading,
      saveCategory,
      goBack
    };
  }
};
</script>

<style scoped>
.them-danh-muc-container {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.form-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  max-width: 100%;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc2626;
}

.form-input,
.form-textarea {
  padding: 14px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
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
  min-height: 120px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-width: 140px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

.btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #d1d5db;
}

.btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .them-danh-muc-container {
    padding: 16px;
  }
  
  .form-section {
    padding: 20px;
    border-radius: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
