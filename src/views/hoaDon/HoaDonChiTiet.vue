<script setup>
import { onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useHoaDonChiTietLogic } from '@/services/hoaDonChiTietService/hoaDonChiTietComposable.js';

// Use the composable for all HoaDonChiTiet functionality
const {
  // State
  invoiceDetail,
  isLoadingDetail,
  detailError,
  invoiceId,
  showStatusModal,
  newStatus,
  statusNote,
  
  // Computed
  availableStatuses,
  
  // Methods
  fetchInvoiceDetailData,
  updateOrderStatus,
  updateToStatus,
  goBack,
  
  // UI helpers
  formatDate,
  formatCurrency,
  formatShortDate,
  getStatusText,
  getStatusColor,
  getOrderStatusesForInvoice,
  getProgressWidthForInvoice,
  getStatusStepClassForInvoice,
  getStatusDateForInvoice,
  canUpdateToStatusForInvoice,
  printInvoice,
  
  // Configuration
  breadcrumbItems,
  breadcrumbActions
} = useHoaDonChiTietLogic();

onMounted(() => {
  fetchInvoiceDetailData();
});
</script>

<template>
  <div class="min-h-screen transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Chi tiết Hóa đơn"
      :page-description="invoiceDetail ? `Hóa đơn ${invoiceDetail.maHoaDon}` : 'Đang tải...'"
      page-icon="solar:bill-list-bold-duotone"
    />

    <!-- Loading State -->
    <div v-if="isLoadingDetail" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="detailError" class="bg-red-50 dark:bg-red-950 p-4 mb-6 rounded-3xl shadow-lg">
      <p class="text-red-600 dark:text-red-300 font-medium flex items-center">
        <Icon icon="solar:danger-triangle-bold-duotone" class="text-2xl mr-3" />
        {{ detailError }}
      </p>
    </div>

    <!-- Invoice Detail Content -->
    <div v-else-if="invoiceDetail" class="space-y-6">
      <!-- Invoice Header -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Hóa đơn {{ invoiceDetail.maHoaDon }}
            </h1>
            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>Ngày tạo: {{ formatDate(invoiceDetail.ngayTao) }}</span>
              <span class="flex items-center gap-1">
                <Icon :icon="invoiceDetail.loaiDon === 'Online' ? 'solar:global-bold' : 'solar:shop-bold'" />
                {{ invoiceDetail.loaiDon === 'Online' ? 'Đơn hàng Online' : 'Mua trực tiếp tại quầy' }}
              </span>
            </div>
          </div>
          
          <!-- Current Status -->
          <div class="flex items-center gap-3">
            <span :class="getStatusColor(invoiceDetail.trangThai.id)">
              {{ getStatusText(invoiceDetail.trangThai.id) }}
            </span>
            
            <!-- Print Invoice Button -->
            <button 
              @click="printInvoice"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              title="In hóa đơn PDF"
            >
              <Icon icon="solar:printer-bold" class="text-lg" />
              In hóa đơn
            </button>
            
            <!-- Status Update Button (only for online orders) -->
            <button 
              v-if="invoiceDetail.loaiDon === 'Online' && availableStatuses.length > 0"
              @click="showStatusModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Cập nhật trạng thái
            </button>
          </div>
        </div>
      </div>

      <!-- Order Status Timeline -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Icon icon="solar:history-bold-duotone" class="text-gray-600 dark:text-gray-400" />
          Trạng thái đơn hàng
        </h2>
        
        <!-- Timeline Progress -->
        <div class="relative">
          <!-- Progress Line (only for Online orders) -->
          <div v-if="invoiceDetail.loaiDon !== 'Tại quầy'" class="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
          <div 
            v-if="invoiceDetail.loaiDon !== 'Tại quầy'"
            class="absolute top-6 left-0 h-1 bg-blue-500 rounded-full transition-all duration-500"
            :style="`width: ${getProgressWidthForInvoice()}%`"
          ></div>
          
          <!-- Status Steps -->
          <div 
            :class="[
              'relative flex',
              invoiceDetail.loaiDon === 'Tại quầy' ? 'justify-center' : 'justify-between'
            ]"
          >
            <div 
              v-for="(status, index) in getOrderStatusesForInvoice()" 
              :key="status.id"
              class="flex flex-col items-center"
            >
              <!-- Status Icon -->
              <div 
                :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300',
                  getStatusStepClassForInvoice(status, index)
                ]"
              >
                <Icon :icon="status.icon" class="text-lg" />
              </div>
              
              <!-- Status Info -->
              <div class="mt-3 text-center min-w-0 max-w-24">
                <div class="text-xs font-medium text-gray-900 dark:text-white mb-1">
                  {{ status.name }}
                </div>
                <div v-if="getStatusDateForInvoice(status)" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatShortDate(getStatusDateForInvoice(status)) }}
                </div>
              </div>
              
              <!-- Status Actions -->
              <div v-if="canUpdateToStatusForInvoice(status)" class="mt-2">
                <button
                  @click="updateToStatus(status)"
                  class="px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Status History Details -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Chi tiết lịch sử</h3>
          <div class="max-h-64 overflow-y-auto space-y-3">
            <div v-for="history in invoiceDetail.lichSuHoaDonInfos" :key="history.ma" class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div :class="getStatusColor(history.trangThai)">
                <Icon icon="solar:history-bold" class="text-xs" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ history.hanhDong }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(history.thoiGian) }}</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Bởi: {{ history.tenNhanVien }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer Information -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Icon icon="solar:user-bold-duotone" class="text-gray-600 dark:text-gray-400" />
              Thông tin khách hàng
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Tên khách hàng:</label>
                <p class="text-blue-900 dark:text-white font-semibold">{{ invoiceDetail.khachHang.tenKhachHang || 'Khách lẻ' }}</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Số điện thoại:</label>
                <p class="text-blue-900 dark:text-white font-semibold">{{ invoiceDetail.khachHang.soDienThoai || 'N/A' }}</p>
              </div>
              <div v-if="invoiceDetail.khachHang.email">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Email:</label>
                <p class="text-blue-900 dark:text-white font-semibold">{{ invoiceDetail.khachHang.email }}</p>
              </div>
              <div v-if="invoiceDetail.khachHang.diaChi">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Địa chỉ:</label>
                <p class="text-blue-900 dark:text-white font-semibold">{{ invoiceDetail.khachHang.diaChi }}</p>
              </div>
            </div>
          </div>

          <!-- Product Information -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Icon icon="solar:box-bold-duotone" class="text-gray-600 dark:text-gray-400" />
              Thông tin sản phẩm
            </h2>
            <div class="overflow-x-auto max-h-96 overflow-y-auto">
              <table class="w-full">
                <thead class="sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-3 px-2 text-base font-bold text-gray-800 dark:text-gray-200">Sản phẩm</th>
                    <th class="text-center py-3 px-2 text-base font-bold text-gray-800 dark:text-gray-200">Màu sắc</th>
                    <th class="text-center py-3 px-2 text-base font-bold text-gray-800 dark:text-gray-200">Kích cỡ</th>
                    <th class="text-center py-3 px-2 text-base font-bold text-gray-800 dark:text-gray-200">SL</th>
                    <th class="text-right py-3 px-2 text-base font-bold text-gray-800 dark:text-gray-200">Đơn giá</th>
                    <th class="text-right py-3 px-2 text-base font-bold text-gray-800 dark:text-gray-200">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in invoiceDetail.sanPhamChiTietInfos" :key="product.hoaDonChiTietId" class="border-b border-gray-100 dark:border-gray-700">
                    <td class="py-4 px-2">
                      <div class="flex items-center gap-3">
                        <img :src="product.duongDan || '/public/sneakers/sneakers-1.jpg'" :alt="product.tenSanPham" class="w-12 h-12 rounded-lg object-cover" />
                        <span class="font-medium text-gray-900 dark:text-white">{{ product.tenSanPham }}</span>
                      </div>
                    </td>
                    <td class="text-center py-4 px-2 text-gray-700 dark:text-gray-300">{{ product.mauSac }}</td>
                    <td class="text-center py-4 px-2 text-gray-700 dark:text-gray-300">{{ product.kichCo }}</td>
                    <td class="text-center py-4 px-2 text-gray-700 dark:text-gray-300">{{ product.soLuong }}</td>
                    <td class="text-right py-4 px-2 font-semibold text-blue-600 dark:text-blue-400">{{ formatCurrency(product.giaBan) }}</td>
                    <td class="text-right py-4 px-2 font-bold text-green-600 dark:text-green-400">{{ formatCurrency(product.giaBan * product.soLuong) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Payment Summary -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-full flex flex-col">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Icon icon="solar:dollar-minimalistic-bold-duotone" class="text-gray-600 dark:text-gray-400" />
              Tổng kết thanh toán
            </h2>
            <div class="flex-1 flex flex-col justify-between">
              <div class="space-y-4">
                <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-300 font-medium">Tổng tiền hàng:</span>
                  <span class="font-semibold text-gray-900 dark:text-white text-lg">{{ formatCurrency(invoiceDetail.tienSanPham) }}</span>
                </div>
                <div v-if="invoiceDetail.phiVanChuyen > 0" class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-300 font-medium">Phí vận chuyển:</span>
                  <span class="font-semibold text-gray-900 dark:text-white text-lg">{{ formatCurrency(invoiceDetail.phiVanChuyen) }}</span>
                </div>
                <div v-if="invoiceDetail.tienGiam > 0" class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-300 font-medium">Giảm giá:</span>
                  <span class="font-semibold text-red-600 text-lg">-{{ formatCurrency(invoiceDetail.tienGiam) }}</span>
                </div>
              </div>
              
              <div class="mt-6">
                <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <div class="flex justify-between text-xl font-bold">
                    <span class="text-gray-900 dark:text-white">Tổng thanh toán:</span>
                    <span class="text-blue-600 dark:text-blue-400">{{ formatCurrency(invoiceDetail.tongTienThanhToan) }}</span>
                  </div>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div v-if="invoiceDetail.thanhToanInfos?.length > 0" class="space-y-2">
                    <div v-for="payment in invoiceDetail.thanhToanInfos" :key="payment.maHinhThucThanhToan" class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-300 font-medium">{{ payment.kieuThanhToan }}:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(payment.tienMat || payment.tienChuyenKhoan) }}</span>
                    </div>
                  </div>
                  <div class="flex justify-between text-sm mt-2">
                    <span class="text-gray-600 dark:text-gray-300 font-medium">Ngày thanh toán:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ formatDate(invoiceDetail.ngayThanhToan || invoiceDetail.ngayTao) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cập nhật trạng thái đơn hàng</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái mới</label>
            <select v-model="newStatus" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">Chọn trạng thái</option>
              <option v-for="status in availableStatuses" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ghi chú (tùy chọn)</label>
            <textarea 
              v-model="statusNote" 
              rows="3" 
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
            ></textarea>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            @click="showStatusModal = false" 
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button 
            @click="updateOrderStatus" 
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>