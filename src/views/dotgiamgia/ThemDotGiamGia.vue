<template>
  <div class="container-fluid py-5">
    <h1 class="fs-4 fw-bold text-primary mb-5">Thêm Đợt Giảm Giá Mới</h1>

    <div class="card shadow-sm border-0 p-4">
      <CForm @submit.prevent="addCampaign">
        <!-- Các trường thông tin đợt giảm giá -->
        <div class="mb-3">
          <CFormLabel for="tenDotGiamGia">Tên Đợt Giảm Giá</CFormLabel>
          <CFormInput id="tenDotGiamGia" v-model="newCampaign.tenDotGiamGia" required class="custom-input" />
        </div>

        <div class="mb-3">
          <CFormLabel for="giaTri">Giá Trị (%)</CFormLabel>
          <CFormInput id="giaTri" v-model.number="newCampaign.giaTri" type="number" required class="custom-input" />
        </div>

        <div class="mb-3">
          <CFormLabel for="thoiGianBatDau">Thời Gian Bắt Đầu</CFormLabel>
          <CFormInput id="thoiGianBatDau" v-model="newCampaign.thoiGianBatDau" type="datetime-local" required class="custom-input" />
        </div>

        <div class="mb-3">
          <CFormLabel for="thoiGianKetThuc">Thời Gian Kết Thúc</CFormLabel>
          <CFormInput id="thoiGianKetThuc" v-model="newCampaign.thoiGianKetThuc" type="datetime-local" required class="custom-input" />
        </div>

        <div class="mb-3">
          <CFormLabel for="trangThai">Trạng Thái</CFormLabel>
          <CFormSelect id="trangThai" v-model="newCampaign.trangThai" required class="custom-select">
            <option value="Đang diễn ra">Đang diễn ra</option>
            <option value="Đã kết thúc">Đã kết thúc</option>
          </CFormSelect>
        </div>

        <hr class="my-4">

        <!-- Phần hiển thị và chọn chi tiết sản phẩm -->
        <h3 class="mb-3 fw-bold">Chọn Chi Tiết Sản Phẩm Áp Dụng</h3>
        <div v-if="loadingProducts" class="text-center">
          <div class="loading-spinner"></div>
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
        <div v-else-if="productDetails.length === 0" class="alert alert-info text-center">
          Không có chi tiết sản phẩm nào để hiển thị.
        </div>
        <div v-else class="product-details-container table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th><input type="checkbox" @change="selectAllProducts" :checked="allProductsSelected"></th>
                <th>Mã CTSP</th>
                <th>Tên SP</th>
                <th>Giá Nhập</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in productDetails" :key="product.id">
                <td><input type="checkbox" v-model="selectedProductIds" :value="product.id"></td>
                <td>{{ product.maCtsp }}</td>
                <td>Sản phẩm {{ product.idSanPham }} (ID)</td>
                <td>{{ formatCurrency(product.giaNhap) }}</td>
                <td>{{ product.trangThaiSanPhamRieng }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <CButton type="submit" class="btn-primary">
            Thêm Đợt Giảm Giá
          </CButton>
          <CButton class="btn-outline-secondary" @click="cancelAdd">
            Hủy
          </CButton>
        </div>
      </CForm>
    </div>
  </div>
</template>

<script>
import { CForm, CFormInput, CFormLabel, CFormSelect, CButton } from '@coreui/vue';
import { inject, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'CouponAdditionForm',
  components: {
    CForm,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CButton,
  },
  setup() {
    const toast = inject('$toast');
    const router = useRouter();

    const newCampaign = ref({
      tenDotGiamGia: '',
      giaTri: null,
      thoiGianBatDau: '',
      thoiGianKetThuc: '',
      trangThai: 'Đang diễn ra',
    });

    const productDetails = ref([]);
    const loadingProducts = ref(true);
    const selectedProductIds = ref([]);

    const allProductsSelected = computed(() => {
      return productDetails.value.length > 0 && selectedProductIds.value.length === productDetails.value.length;
    });

    const selectAllProducts = (event) => {
      if (event.target.checked) {
        selectedProductIds.value = productDetails.value.map(p => p.id);
      } else {
        selectedProductIds.value = [];
      }
    };

    const fetchProductDetails = async () => {
      try {
        const response = await axios.get('/api/chi-tiet-san-pham');
        productDetails.value = response.data;
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error);
        if (toast) {
          toast.error(`Không thể tải danh sách chi tiết sản phẩm: ${error.message || 'Lỗi không xác định'}`);
        }
      } finally {
        loadingProducts.value = false;
      }
    };

    const addCampaign = async () => {
      try {
        if (selectedProductIds.value.length === 0) {
          if (toast) {
            toast.error('Vui lòng chọn ít nhất một chi tiết sản phẩm để áp dụng giảm giá.');
          }
          return;
        }

        const payload = {
          ...newCampaign.value,
          thoiGianBatDau: new Date(newCampaign.value.thoiGianBatDau).toISOString(),
          thoiGianKetThuc: new Date(newCampaign.value.thoiGianKetThuc).toISOString(),
          chiTietSanPhamsApDung: selectedProductIds.value,
        };

        const response = await axios.post('/api/dot-giam-gia', payload);
        if (toast) {
          toast.success('Đã thêm đợt giảm giá mới thành công!');
        }
        router.push({ name: 'DotGiamGia' });
      } catch (error) {
        console.error('Lỗi khi thêm đợt giảm giá:', error);
        if (toast) {
          toast.error(`Không thể thêm đợt giảm giá: ${error.response?.data?.message || error.message}`);
        }
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
      fetchProductDetails();
    });

    return {
      newCampaign,
      productDetails,
      loadingProducts,
      selectedProductIds,
      allProductsSelected,
      selectAllProducts,
      addCampaign,
      cancelAdd,
      formatCurrency,
    };
  },
};
</script>

<style scoped>
.container-fluid {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f5f7fb;
  min-height: 100vh;
  padding: 1rem;
}

.card {
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: none;
  background-color: #ffffff;
  padding: 2rem;
}

.text-primary {
  color: #0052cc !important;
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

.product-details-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.custom-table th,
.custom-table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.custom-table th {
  background-color: #0052cc;
  color: #ffffff;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
}

.custom-table tbody tr:hover {
  background-color: #f9fafb;
}

.custom-table tbody tr:last-child td {
  border-bottom: none;
}

.custom-table th:first-child,
.custom-table td:first-child {
  border-top-left-radius: 8px;
}
.custom-table th:last-child,
.custom-table td:last-child {
  border-top-right-radius: 8px;
}
.custom-table tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}
.custom-table tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

.alert-info {
  border-radius: 8px;
  background-color: #e0f2fe;
  color: #0284c7;
}

.loading-spinner {
  position: relative;
  margin: 1rem auto;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0052cc;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
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