<template>
  <div class="them-chat-lieu-container">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Thêm Chất Liệu Mới"
      page-description="Thêm chất liệu mới cho sản phẩm"
      page-icon="solar:layers-bold-duotone"
    />

    <!-- Form Section -->
    <div class="form-section">
      <div class="form-header">
        <h3 class="form-title">
          <iconify-icon icon="solar:layers-bold-duotone"></iconify-icon>
          {{ isEdit ? 'Chỉnh Sửa Chất Liệu' : 'Thêm Chất Liệu Mới' }}
        </h3>
      </div>

      <form @submit.prevent="saveMaterial" class="material-form">
        <div class="form-group">
          <label class="form-label required">Tên chất liệu</label>
          <input 
            type="text" 
            v-model="materialForm.name" 
            class="form-input"
            placeholder="Nhập tên chất liệu"
            required
          />
        </div>

        <div class="form-actions">
          <button type="button" class="btn secondary" @click="goBack">
            Quay lại
          </button>
          <button type="submit" class="btn primary" :disabled="loading">
            {{ isEdit ? 'Cập nhật' : 'Thêm chất liệu' }}
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
  name: 'ThemChatLieu',
  components: {
    Breadcrumb
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();

    const isEdit = ref(false);
    const loading = ref(false);
    const materialId = ref(null);

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Quản lý', path: '/quan-ly' },
      { label: 'Thuộc tính', path: '/attributes' },
      { label: 'Chất liệu', path: '/thuoc-tinh/chat-lieu' },
      { label: 'Thêm mới', path: '/thuoc-tinh/chat-lieu/them' }
    ]);

    // Form data
    const materialForm = ref({
      name: ''
    });

    // Methods
    const loadMaterial = async (id) => {
      try {
        loading.value = true;
        const response = await productService.getMaterialById(id);
        const material = response.data;
        
        materialForm.value = {
          name: material.tenChatLieu
        };
        
        // Update breadcrumb for edit mode
        breadcrumbItems.value[3] = { label: 'Chỉnh sửa', path: `/thuoc-tinh/chat-lieu/sua/${id}` };
      } catch (error) {
        toast.error('Lỗi khi tải thông tin chất liệu');
        console.error('Error loading material:', error);
        goBack();
      } finally {
        loading.value = false;
      }
    };

    const saveMaterial = async () => {
      try {
        loading.value = true;
        
        // Validate name is not empty
        if (!materialForm.value.name.trim()) {
          toast.error('Tên chất liệu không được để trống');
          return;
        }
        
        // Check for duplicate name
        try {
          const checkResponse = await productService.checkMaterialNameExists(
            materialForm.value.name.trim(),
            isEdit.value ? materialId.value : null
          );
          
          if (checkResponse.data.exists) {
            toast.error('Tên chất liệu đã tồn tại');
            return;
          }
        } catch (checkError) {
          console.error('Error checking duplicate name:', checkError);
          // Continue with save if check fails
        }
        
        const materialData = {
          tenChatLieu: materialForm.value.name.trim()
        };

        if (isEdit.value) {
          await productService.updateMaterial(materialId.value, materialData);
          toast.success('Cập nhật chất liệu thành công!');
        } else {
          await productService.createMaterial(materialData);
          toast.success('Thêm chất liệu mới thành công!');
        }
        
        goBack();
      } catch (error) {
        toast.error('Lỗi khi lưu chất liệu: ' + (error.response?.data || error.message));
        console.error('Error saving material:', error);
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.push('/thuoc-tinh/chat-lieu');
    };

    // Check if this is edit mode
    onMounted(() => {
      if (route.params.id) {
        isEdit.value = true;
        materialId.value = route.params.id;
        loadMaterial(route.params.id);
      }
    });

    return {
      breadcrumbItems,
      materialForm,
      isEdit,
      loading,
      saveMaterial,
      goBack
    };
  }
};
</script>

<style scoped>
.them-chat-lieu-container {
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

.material-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  .them-chat-lieu-container {
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
