<template>
  <div class="container-fluid py-5">
    <h1 class="fs-4 fw-bold text-primary mb-5 text-center">Chỉnh Sửa Đợt Giảm Giá</h1>

    <div class="card shadow-sm border-0 p-4">
      <div class="loading-spinner" v-if="loading"></div>
      <div :class="{ 'loading-overlay': loading }">
        <CForm @submit.prevent="saveChanges">
          <!-- Mã đợt giảm giá -->
          <div class="mb-4">
            <CFormLabel for="maDotGiamGia" class="fw-semibold">Mã Đợt Giảm Giá</CFormLabel>
            <CFormInput id="maDotGiamGia" v-model="campaign.maDotGiamGia" disabled class="custom-input" />
          </div>

          <!-- Tên đợt giảm giá -->
          <div class="mb-4">
            <CFormLabel for="tenDotGiamGia" class="fw-semibold">Tên Đợt Giảm Giá</CFormLabel>
            <CFormInput id="tenDotGiamGia" v-model="campaign.tenDotGiamGia" required class="custom-input" />
          </div>

          <!-- Giá trị giảm -->
          <div class="mb-4">
            <CFormLabel for="giaTri" class="fw-semibold">Giá Trị (%)</CFormLabel>
            <CFormInput id="giaTri" v-model.number="campaign.giaTri" type="number" required class="custom-input" min="0" max="100" />
          </div>

          <!-- Thời gian bắt đầu -->
          <div class="mb-4">
            <CFormLabel for="thoiGianBatDau" class="fw-semibold">Thời Gian Bắt Đầu</CFormLabel>
            <CFormInput id="thoiGianBatDau" v-model="campaign.thoiGianBatDau" type="datetime-local" required class="custom-input" />
          </div>

          <!-- Thời gian kết thúc -->
          <div class="mb-4">
            <CFormLabel for="thoiGianKetThuc" class="fw-semibold">Thời Gian Kết Thúc</CFormLabel>
            <CFormInput id="thoiGianKetThuc" v-model="campaign.thoiGianKetThuc" type="datetime-local" required class="custom-input" />
          </div>

          <!-- Trạng thái -->
          <div class="mb-4">
            <CFormLabel for="trangThai" class="fw-semibold">Trạng Thái</CFormLabel>
            <CFormSelect id="trangThai" v-model="campaign.trangThai" required class="custom-select">
              <option value="Đang diễn ra">Đang diễn ra</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </CFormSelect>
          </div>

          <!-- Nút hành động -->
          <div class="d-flex justify-content-end gap-2">
            <CButton type="submit" class="btn-primary">Lưu Thay Đổi</CButton>
            <CButton class="btn-outline-secondary" @click="cancelEdit">Hủy</CButton>
          </div>
        </CForm>
      </div>
    </div>
  </div>
</template>

<script>
import { CForm, CFormInput, CFormLabel, CFormSelect, CButton } from '@coreui/vue';
import { inject, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'CouponEditForm',
  components: {
    CForm,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CButton,
  },
  setup() {
    const toast = inject('$toast');
    const route = useRoute();
    const router = useRouter();

    const campaign = ref({
      maDotGiamGia: null,
      tenDotGiamGia: '',
      giaTri: 0,
      thoiGianBatDau: '',
      thoiGianKetThuc: '',
      trangThai: '',
    });
    const loading = ref(true);
    const campaignId = route.params.id;

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

    const formatDateForBackend = (dateTimeString) => {
      if (!dateTimeString) return null;
      const date = new Date(dateTimeString);
      return date.toISOString();
    };

    const fetchCampaignDetails = async () => {
      loading.value = true;
      try {
        const response = await axios.get(`/api/dot-giam-gia/${campaignId}`);
        const data = response.data;
        campaign.value = {
          ...data,
          thoiGianBatDau: formatDateForInput(data.thoiGianBatDau),
          thoiGianKetThuc: formatDateForInput(data.thoiGianKetThuc),
        };
      } catch (error) {
        console.error('Lỗi khi tải chi tiết đợt giảm giá:', error);
        if (toast) {
          toast.error(`Không thể tải chi tiết đợt giảm giá: ${error.message || 'Lỗi không xác định'}`);
        }
        router.push({ name: 'DotGiamGia' });
      } finally {
        loading.value = false;
      }
    };

    const validateForm = () => {
      if (!campaign.value.tenDotGiamGia.trim()) {
        toast.error('Tên đợt giảm giá không được để trống!');
        return false;
      }
      if (!campaign.value.giaTri || campaign.value.giaTri < 0 || campaign.value.giaTri > 100) {
        toast.error('Giá trị giảm phải từ 0 đến 100 (%)!');
        return false;
      }
      if (!campaign.value.thoiGianBatDau || !campaign.value.thoiGianKetThuc) {
        toast.error('Ngày bắt đầu và ngày kết thúc không được để trống!');
        return false;
      }
      if (new Date(campaign.value.thoiGianKetThuc) <= new Date(campaign.value.thoiGianBatDau)) {
        toast.error('Ngày kết thúc phải sau ngày bắt đầu!');
        return false;
      }
      if (!campaign.value.trangThai) {
        toast.error('Vui lòng chọn trạng thái!');
        return false;
      }
      return true;
    };

    const saveChanges = async () => {
      if (!validateForm()) return;
      loading.value = true;
      try {
        const payload = {
          ...campaign.value,
          thoiGianBatDau: formatDateForBackend(campaign.value.thoiGianBatDau),
          thoiGianKetThuc: formatDateForBackend(campaign.value.thoiGianKetThuc),
        };
        const response = await axios.put(`/api/dot-giam-gia/${campaign.value.maDotGiamGia}`, payload);
        if (response.status === 200) {
          if (toast) {
            toast.success('Cập nhật đợt giảm giá thành công!');
          }
          router.push({ name: 'DotGiamGia' });
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật đợt giảm giá:', error);
        if (toast) {
          toast.error(`Không thể cập nhật đợt giảm giá: ${error.message || 'Lỗi không xác định'}`);
        }
      } finally {
        loading.value = false;
      }
    };

    const cancelEdit = () => {
      router.push({ name: 'DotGiamGia' });
    };

    onMounted(() => {
      if (campaignId) {
        fetchCampaignDetails();
      } else {
        if (toast) {
          toast.error('Không tìm thấy ID đợt giảm giá để chỉnh sửa.');
        }
        router.push({ name: 'DotGiamGia' });
      }
    });

    return {
      campaign,
      loading,
      saveChanges,
      cancelEdit,
    };
  },
};
</script>

<style scoped>
.container-fluid {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f5f7fb;
  min-height: 100vh;
}

.card {
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: none;
  background-color: #ffffff;
}

.text-primary {
  color: #0052cc !important;
}

.form-label {
  font-weight: 600;
  color: #374151;
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
  border-color: #0052cc;
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
  outline: none;
}

.btn-primary {
  background-color: #0052cc;
  border-color: #0052cc;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #003d99;
  border-color: #003d99;
}

.btn-outline-secondary {
  border-color: #d1d5db;
  color: #374151;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.loading-overlay {
  opacity: 0.5;
  pointer-events: none;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0052cc;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
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

  .btn-primary,
  .btn-outline-secondary {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>