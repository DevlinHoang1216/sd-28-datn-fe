
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { Icon } from '@iconify/vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const invoiceId = ref(route.params.id);
const invoice = ref(null);
const loading = ref(true);
const statusHistory = ref([]);
const showStatusModal = ref(false);
const newStatus = ref('');
const statusNote = ref('');

// Order status definitions
const orderStatuses = {
  direct: [
    { id: 21, name: 'Đã hoàn thành', color: 'text-green-600 bg-green-100', icon: 'solar:check-circle-bold' }
  ],
  online: [
    { id: 6, name: 'Chờ xác nhận', color: 'text-orange-600 bg-orange-100', icon: 'solar:clock-circle-bold' },
    { id: 8, name: 'Chờ giao', color: 'text-blue-600 bg-blue-100', icon: 'solar:box-bold' },
    { id: 9, name: 'Đang giao', color: 'text-purple-600 bg-purple-100', icon: 'solar:delivery-bold' },
    { id: 21, name: 'Hoàn thành', color: 'text-green-600 bg-green-100', icon: 'solar:check-circle-bold' },
    { id: 22, name: 'Đã hủy', color: 'text-red-600 bg-red-100', icon: 'solar:close-circle-bold' }
  ]
};

// Sample product data
const sampleProducts = [
  {
    id: 1,
    tenSanPham: 'Nike Air Max 270',
    mauSac: 'Đen',
    kichCo: '42',
    soLuong: 1,
    donGia: 2500000,
    thanhTien: 2500000,
    hinhAnh: '/public/sneakers/sneakers-1.jpg'
  },
  {
    id: 2,
    tenSanPham: 'Adidas Ultraboost 22',
    mauSac: 'Trắng',
    kichCo: '41',
    soLuong: 2,
    donGia: 3200000,
    thanhTien: 6400000,
    hinhAnh: '/public/sneakers/sneakers-2.jpg'
  }
];

// Generate fake invoice data
const generateInvoiceData = (id) => {
  const isOnline = Math.random() > 0.5;
  const currentStatus = isOnline ? 
    orderStatuses.online[Math.floor(Math.random() * orderStatuses.online.length)] :
    orderStatuses.direct[0];

  return {
    id: parseInt(id),
    maHoaDon: `HD${String(id).padStart(6, '0')}`,
    loaiDon: isOnline ? 'online' : 'trực tiếp',
    trangThai: currentStatus,
    ngayTao: new Date().toISOString(),
    khachHang: {
      tenKhachHang: 'Nguyễn Văn An',
      soDienThoai: '0901234567',
      email: 'nguyenvanan@email.com',
      diaChi: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM'
    },
    sanPhams: sampleProducts,
    tongTienHang: 8900000,
    phiVanChuyen: isOnline ? 30000 : 0,
    giamGia: 100000,
    tongTienThanhToan: 8830000,
    phuongThucThanhToan: 'Tiền mặt',
    ghiChu: 'Giao hàng nhanh'
  };
};

const fetchInvoiceDetail = async () => {
  loading.value = true;
  try {
    // Simulate API call with fake data
    await new Promise(resolve => setTimeout(resolve, 1000));
    invoice.value = generateInvoiceData(invoiceId.value);
    
    // Generate status history
    generateStatusHistory();
    
    toast.success('Tải thông tin hóa đơn thành công!');
  } catch (error) {
    toast.error('Lỗi khi tải thông tin hóa đơn!');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const generateStatusHistory = () => {
  const history = [];
  const now = new Date();
  
  if (invoice.value.loaiDon === 'online') {
    // Generate history based on current status
    const statuses = orderStatuses.online;
    const currentStatusIndex = statuses.findIndex(s => s.id === invoice.value.trangThai.id);
    
    for (let i = 0; i <= currentStatusIndex; i++) {
      const date = new Date(now.getTime() - (currentStatusIndex - i) * 24 * 60 * 60 * 1000);
      history.push({
        id: i + 1,
        trangThai: statuses[i],
        ngayCapNhat: date.toISOString(),
        nguoiCapNhat: 'Hệ thống',
        ghiChu: `Đơn hàng ${statuses[i].name.toLowerCase()}`
      });
    }
  } else {
    // Direct purchase - only completed status
    history.push({
      id: 1,
      trangThai: orderStatuses.direct[0],
      ngayCapNhat: invoice.value.ngayTao,
      nguoiCapNhat: 'Nhân viên bán hàng',
      ghiChu: 'Thanh toán trực tiếp tại quầy'
    });
  }
  
  statusHistory.value = history;
};

const availableStatuses = computed(() => {
  if (!invoice.value) return [];
  
  if (invoice.value.loaiDon === 'trực tiếp') {
    return []; // No status changes for direct purchases
  }
  
  const currentStatusId = invoice.value.trangThai.id;
  const statuses = orderStatuses.online;
  const currentIndex = statuses.findIndex(s => s.id === currentStatusId);
  
  // Return next possible statuses
  if (currentIndex < statuses.length - 1 && currentStatusId !== 22) {
    return statuses.slice(currentIndex + 1);
  }
  
  return [];
});

const updateOrderStatus = async () => {
  if (!newStatus.value) {
    toast.error('Vui lòng chọn trạng thái mới!');
    return;
  }
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedStatus = orderStatuses.online.find(s => s.id === parseInt(newStatus.value));
    invoice.value.trangThai = selectedStatus;
    
    // Add to history
    statusHistory.value.push({
      id: statusHistory.value.length + 1,
      trangThai: selectedStatus,
      ngayCapNhat: new Date().toISOString(),
      nguoiCapNhat: 'Admin',
      ghiChu: statusNote.value || `Cập nhật trạng thái: ${selectedStatus.name}`
    });
    
    showStatusModal.value = false;
    newStatus.value = '';
    statusNote.value = '';
    
    toast.success('Cập nhật trạng thái đơn hàng thành công!');
  } catch (error) {
    toast.error('Lỗi khi cập nhật trạng thái!');
    console.error(error);
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatShortDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
};

const getOrderStatuses = () => {
  if (!invoice.value) return [];
  return invoice.value.loaiDon === 'online' ? orderStatuses.online : orderStatuses.direct;
};

const getProgressWidth = () => {
  if (!invoice.value) return 0;
  const statuses = getOrderStatuses();
  const currentIndex = statuses.findIndex(s => s.id === invoice.value.trangThai.id);
  if (currentIndex === -1) return 0;
  return ((currentIndex + 1) / statuses.length) * 100;
};

const getStatusStepClass = (status, index) => {
  if (!invoice.value) return 'bg-gray-200 border-gray-300 text-gray-400';
  
  const currentIndex = getOrderStatuses().findIndex(s => s.id === invoice.value.trangThai.id);
  
  if (index <= currentIndex) {
    // Completed or current status
    if (status.id === 22) {
      // Cancelled status
      return 'bg-red-500 border-red-500 text-white';
    }
    return 'bg-blue-500 border-blue-500 text-white';
  } else {
    // Future status
    return 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-300';
  }
};

const getStatusDate = (status) => {
  const history = statusHistory.value.find(h => h.trangThai.id === status.id);
  return history ? history.ngayCapNhat : null;
};

const canUpdateToStatus = (status) => {
  if (!invoice.value || invoice.value.loaiDon === 'trực tiếp') return false;
  
  const currentIndex = getOrderStatuses().findIndex(s => s.id === invoice.value.trangThai.id);
  const statusIndex = getOrderStatuses().findIndex(s => s.id === status.id);
  
  // Can only update to the next status in sequence
  return statusIndex === currentIndex + 1 && invoice.value.trangThai.id !== 22 && invoice.value.trangThai.id !== 21;
};

const updateToStatus = async (status) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    invoice.value.trangThai = status;
    
    // Add to history
    statusHistory.value.push({
      id: statusHistory.value.length + 1,
      trangThai: status,
      ngayCapNhat: new Date().toISOString(),
      nguoiCapNhat: 'Admin',
      ghiChu: `Cập nhật trạng thái: ${status.name}`
    });
    
    toast.success(`Đã cập nhật trạng thái thành: ${status.name}`);
  } catch (error) {
    toast.error('Lỗi khi cập nhật trạng thái!');
    console.error(error);
  }
};

const printInvoice = () => {
  window.print();
};

const goBack = () => {
  router.push({ name: 'HoaDon' });
};

const breadcrumbItems = ref([
  { label: 'Quản lý bán hàng', path: '/dashboard' },
  { label: 'Hóa đơn', path: '/hoa-don' },
  { label: 'Chi tiết hóa đơn' }
]);

const breadcrumbActions = ref([
  {
    label: 'Quay lại',
    type: 'default',
    handler: goBack
  },
  {
    label: 'In hóa đơn',
    type: 'primary',
    handler: printInvoice
  }
]);

onMounted(() => {
  fetchInvoiceDetail();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Chi tiết Hóa đơn"
      :page-description="invoice ? `Hóa đơn ${invoice.maHoaDon}` : 'Đang tải...'"
      page-icon="solar:bill-list-bold-duotone"
    />

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Invoice Detail Content -->
    <div v-else-if="invoice" class="space-y-6">
      <!-- Invoice Header -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Hóa đơn {{ invoice.maHoaDon }}
            </h1>
            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>Ngày tạo: {{ formatDate(invoice.ngayTao) }}</span>
              <span class="flex items-center gap-1">
                <Icon :icon="invoice.loaiDon === 'online' ? 'solar:global-bold' : 'solar:shop-bold'" />
                {{ invoice.loaiDon === 'online' ? 'Đơn hàng Online' : 'Mua trực tiếp tại quầy' }}
              </span>
            </div>
          </div>
          
          <!-- Current Status -->
          <div class="flex items-center gap-3">
            <span :class="`px-4 py-2 rounded-full text-sm font-medium ${invoice.trangThai.color}`">
              <Icon :icon="invoice.trangThai.icon" class="inline mr-2" />
              {{ invoice.trangThai.name }}
            </span>
            
            <!-- Status Update Button (only for online orders) -->
            <button 
              v-if="invoice.loaiDon === 'online' && availableStatuses.length > 0"
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
          <!-- Progress Line -->
          <div class="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
          <div 
            class="absolute top-6 left-0 h-1 bg-blue-500 rounded-full transition-all duration-500"
            :style="`width: ${getProgressWidth()}%`"
          ></div>
          
          <!-- Status Steps -->
          <div class="relative flex justify-between">
            <div 
              v-for="(status, index) in getOrderStatuses()" 
              :key="status.id"
              class="flex flex-col items-center"
            >
              <!-- Status Icon -->
              <div 
                :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300',
                  getStatusStepClass(status, index)
                ]"
              >
                <Icon :icon="status.icon" class="text-lg" />
              </div>
              
              <!-- Status Info -->
              <div class="mt-3 text-center min-w-0 max-w-24">
                <div class="text-xs font-medium text-gray-900 dark:text-white mb-1">
                  {{ status.name }}
                </div>
                <div v-if="getStatusDate(status)" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatShortDate(getStatusDate(status)) }}
                </div>
              </div>
              
              <!-- Status Actions -->
              <div v-if="canUpdateToStatus(status)" class="mt-2">
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
            <div v-for="history in statusHistory" :key="history.id" class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div :class="`w-6 h-6 rounded-full flex items-center justify-center ${history.trangThai.color}`">
                <Icon :icon="history.trangThai.icon" class="text-xs" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ history.trangThai.name }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(history.ngayCapNhat) }}</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">{{ history.ghiChu }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Bởi: {{ history.nguoiCapNhat }}</p>
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
                <p class="text-blue-900 dark:text-white font-semibold">{{ invoice.khachHang.tenKhachHang }}</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Số điện thoại:</label>
                <p class="text-blue-900 dark:text-white font-semibold">{{ invoice.khachHang.soDienThoai }}</p>
              </div>
              <div v-if="invoice.khachHang.email">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Email:</label>
                <p class="text-blue-900 dark:text-white font-semibold">{{ invoice.khachHang.email }}</p>
              </div>
              <div v-if="invoice.khachHang.diaChi">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Địa chỉ:</label>
                <p class="text-blue-900 dark:text-white font-semibold">{{ invoice.khachHang.diaChi }}</p>
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
                  <tr v-for="product in invoice.sanPhams" :key="product.id" class="border-b border-gray-100 dark:border-gray-700">
                    <td class="py-4 px-2">
                      <div class="flex items-center gap-3">
                        <img :src="product.hinhAnh" :alt="product.tenSanPham" class="w-12 h-12 rounded-lg object-cover" />
                        <span class="font-medium text-gray-900 dark:text-white">{{ product.tenSanPham }}</span>
                      </div>
                    </td>
                    <td class="text-center py-4 px-2 text-gray-700 dark:text-gray-300">{{ product.mauSac }}</td>
                    <td class="text-center py-4 px-2 text-gray-700 dark:text-gray-300">{{ product.kichCo }}</td>
                    <td class="text-center py-4 px-2 text-gray-700 dark:text-gray-300">{{ product.soLuong }}</td>
                    <td class="text-right py-4 px-2 font-semibold text-blue-600 dark:text-blue-400">{{ formatCurrency(product.donGia) }}</td>
                    <td class="text-right py-4 px-2 font-bold text-green-600 dark:text-green-400">{{ formatCurrency(product.thanhTien) }}</td>
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
                  <span class="font-semibold text-gray-900 dark:text-white text-lg">{{ formatCurrency(invoice.tongTienHang) }}</span>
                </div>
                <div v-if="invoice.phiVanChuyen > 0" class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-300 font-medium">Phí vận chuyển:</span>
                  <span class="font-semibold text-gray-900 dark:text-white text-lg">{{ formatCurrency(invoice.phiVanChuyen) }}</span>
                </div>
                <div v-if="invoice.giamGia > 0" class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-300 font-medium">Giảm giá:</span>
                  <span class="font-semibold text-red-600 text-lg">-{{ formatCurrency(invoice.giamGia) }}</span>
                </div>
              </div>
              
              <div class="mt-6">
                <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <div class="flex justify-between text-xl font-bold">
                    <span class="text-gray-900 dark:text-white">Tổng thanh toán:</span>
                    <span class="text-blue-600 dark:text-blue-400">{{ formatCurrency(invoice.tongTienThanhToan) }}</span>
                  </div>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600 dark:text-gray-300 font-medium">Phương thức thanh toán:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ invoice.phuongThucThanhToan }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-300 font-medium">Ngày thanh toán:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ formatDate(invoice.ngayTao) }}</span>
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