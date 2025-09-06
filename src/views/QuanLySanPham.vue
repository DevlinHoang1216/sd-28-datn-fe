<!-- src/views/QuanLySanPham.vue -->
<template>
  <div class="quan-ly-san-pham-container">
    <div class="quan-ly-san-pham container mx-auto p-8 bg-gray-50 min-h-screen">
      <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
        <h1 class="text-3xl font-bold mb-8 text-left text-gray-800">Quản lý sản phẩm</h1>
        <CTabs v-model:activeKey="activeTab">
          <CTab title="Danh sách sản phẩm" event-key="list">
            <ProductList
              v-if="activeTab === 'list'"
              @show-add-form="activeTab = 'add'"
              @show-details="showDetails"
            />
          </CTab>
          <CTab title="Thêm sản phẩm" event-key="add">
            <AddProductForm
              v-if="activeTab === 'add'"
              @cancel="activeTab = 'list'"
              @product-added="activeTab = 'list'"
            />
          </CTab>
          <CTab title="Chi tiết sản phẩm" event-key="detail">
            <ProductsDetail
              v-if="activeTab === 'detail'"
              :product="selectedProduct"
              @back-to-list="activeTab = 'list'"
            />
          </CTab>
        </CTabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProductList from './products-manager/Products.vue';
import AddProductForm from './products-manager/AddProductForm.vue';
import ProductsDetail from './products-manager/Products-Detail.vue';

const activeTab = ref('list');
const selectedProduct = ref(null);

const showDetails = (product) => {
  selectedProduct.value = product;
  activeTab.value = 'detail';
};
</script>

<style scoped>
.quan-ly-san-pham {
  padding: 20px;
}
/* src/views/assets/products-manager.css */
.container {
  padding: 1rem;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}
.custom-table th,
.custom-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dee2e6;
}
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 0.5rem;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #8b0000;
  transition: 0.4s;
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #000000;
}
input:checked + .slider:before {
  transform: translateX(26px);
}
.round {
  border-radius: 24px;
}
.table-container {
  overflow-x: auto;
  max-width: 100%;
}
.custom-table th {
  background-color: #000000;
  color: #ffffff;
  font-weight: bold;
}
.custom-table th.text-center,
.custom-table td.text-center {
  text-align: center;
}
.custom-table th.text-end,
.custom-table td.text-end {
  text-align: right;
  vertical-align: middle;
}
.custom-table td.status-cell {
  min-width: 120px;
  white-space: nowrap;
  overflow: visible;
  padding: 0.5rem;
  vertical-align: middle;
}
.custom-table td.action-cell {
  min-width: 200px;
  white-space: nowrap;
  overflow: visible;
  padding: 0.5rem;
  vertical-align: middle;
}
.custom-table tr:hover {
  background-color: #f8f9fa;
}
.switch.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.custom-input.form-control:focus {
  border-color: #ced4da !important;
  box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25) !important;
}
@media (max-width: 768px) {
  .custom-table td.status-cell {
    min-width: 100px;
  }
  .custom-table td.action-cell {
    min-width: 180px;
  }
}
</style>