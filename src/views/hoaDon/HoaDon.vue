<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { getInvoices, updateInvoice as apiUpdateInvoice, deleteInvoice as apiDeleteInvoice } from '@/services/api';
import mitt from 'mitt';
import Breadcrumb from '@/components/Breadcrumb.vue';
import DataTable from '@/components/DataTable.vue';

const emitter = mitt();
const toast = useToast();
const route = useRoute();

const errorMessage = ref('');
const allInvoices = ref([]);
const totalRevenue = ref(0);
const currentPage = ref(0);
const pageSize = ref(10);

const filters = ref({
  search: '',
  trangThaiId: '',
  loaiDon: '',
  startDate: '',
  endDate: '',
  minPrice: '',
  maxPrice: '',
  sortBy: ''
});

const tempFilters = ref({
  search: '',
  trangThaiId: '',
  loaiDon: '',
  startDate: '',
  endDate: '',
  minPrice: '',
  maxPrice: '',
  sortBy: ''
});

const activeTab = ref('all');
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editInvoiceData = ref({});
const deleteInvoiceId = ref(null);
const isUpdating = ref(false);
const isDeleting = ref(false);
const highlightedInvoice = ref(null);

const tabs = ref([
  { id: 'all', label: 'Tất cả' },
  { id: 'cho_xac_nhan', label: 'Chờ xác nhận', statusId: 6 },
  { id: 'pending', label: 'Chờ xử lý', statusId: 7 },
  { id: 'cho_van_chuyen', label: 'Chờ vận chuyển', statusId: 8 },
  { id: 'dang_van_chuyen', label: 'Đang vận chuyển', statusId: 9 },
  { id: 'completed', label: 'Đã hoàn thành', statusId: 21 },
  { id: 'canceled', label: 'Đã hủy', statusId: 22 },
]);

// Tính tổng doanh thu từ danh sách hóa đơn có trạng thái "Đã hoàn thành"
const calculateTotalRevenue = () => {
  totalRevenue.value = allInvoices.value
    .filter((invoice) => invoice.trangThai?.id === 21)
    .reduce((sum, invoice) => sum + (invoice.tongTienThanhToan || 0), 0);
};

const printInvoicePDF = (invoice) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  const orderTypeText = invoice.loaiDon === 'online' ? 'Online' : 'Trực tiếp';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hóa đơn ${invoice.maHoaDon}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        .label { font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #e74c3c; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <p>Mã hóa đơn: <span class="label">${invoice.maHoaDon}</span></p>
        <p>Ngày tạo: <span class="label">${formatDate(invoice.ngayTao)}</span></p>
      </div>
      
      <div class="info">
        <h3>Thông tin khách hàng</h3>
        <p>Tên: <span class="label">${invoice.khachHang?.tenKhachHang || 'Khách lẻ'}</span></p>
        <p>Số điện thoại: <span class="label">${invoice.khachHang?.soDienThoai || 'N/A'}</span></p>
        <p>Loại đơn: <span class="label">${orderTypeText}</span></p>
      </div>
      
      <div class="info">
        <h3>Thông tin thanh toán</h3>
        <p>Phí vận chuyển: <span class="label">${formatCurrency(invoice.phiVanChuyen)}</span></p>
        <p class="total">Tổng tiền: ${formatCurrency(invoice.tongTienThanhToan)}</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
};

const downloadQRCode = (invoice) => {
  // Create QR code data
  const qrData = {
    maHoaDon: invoice.maHoaDon,
    khachHang: invoice.khachHang?.tenKhachHang || 'Khách lẻ',
    tongTien: invoice.tongTienThanhToan,
    ngayTao: invoice.ngayTao
  };
  
  // Create QR code content
  const qrContent = `Hóa đơn: ${qrData.maHoaDon}\nKhách hàng: ${qrData.khachHang}\nTổng tiền: ${formatCurrency(qrData.tongTien)}\nNgày: ${formatDate(qrData.ngayTao)}`;
  
  // Create a simple QR code URL (using a free QR code API)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;
  
  // Create download link
  const link = document.createElement('a');
  link.href = qrUrl;
  link.download = `QR_${invoice.maHoaDon}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToExcel = () => {
  // Create Excel data from filtered invoices
  const excelData = filteredInvoices.value.map((invoice, index) => ({
    'STT': index + 1,
    'Mã Hóa Đơn': invoice.maHoaDon,
    'Khách Hàng': invoice.khachHang?.tenKhachHang || 'Khách lẻ',
    'Số Điện Thoại': invoice.khachHang?.soDienThoai || 'N/A',
    'Loại Đơn': invoice.loaiDon === 'online' ? 'Online' : 'Trực tiếp',
    'Phí Vận Chuyển': invoice.phiVanChuyen,
    'Ngày Tạo': formatDate(invoice.ngayTao),
    'Tổng Tiền': invoice.tongTienThanhToan,
    'Trạng Thái': getStatusText(invoice.trangThai?.id)
  }));
  
  // Convert to CSV format
  const headers = Object.keys(excelData[0]).join(',');
  const csvContent = [headers, ...excelData.map(row => Object.values(row).join(','))].join('\n');
  
  // Create and download file
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Danh_sach_hoa_don_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('Exported invoices to Excel');
};

const scanQRInvoice = () => {
  // Open QR scanner modal or navigate to QR scanner page
  alert('Chức năng quét QR hóa đơn sẽ được phát triển trong phiên bản tiếp theo');
  console.log('QR Scanner opened');
};

const navigateToSalesCounter = () => {
  // Navigate to sales counter page
  router.push({ name: 'BanHangTaiQuay' });
};

// Computed để lọc hóa đơn
const filteredInvoices = computed(() => {
  let result = allInvoices.value;

  const activeTabObj = tabs.value.find((tab) => tab.id === activeTab.value);
  if (activeTabObj?.statusId) {
    result = result.filter((invoice) => invoice.trangThai?.id === activeTabObj.statusId);
  } else if (filters.value.trangThaiId) {
    result = result.filter((invoice) => invoice.trangThai?.id === parseInt(filters.value.trangThaiId));
  }

  if (filters.value.search) {
    result = result.filter((invoice) =>
      invoice.maHoaDon?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      invoice.khachHang?.tenKhachHang?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      invoice.khachHang?.soDienThoai?.includes(filters.value.search)
    );
  }

  if (filters.value.loaiDon) {
    result = result.filter((invoice) => invoice.loaiDon === filters.value.loaiDon);
  }

  if (filters.value.startDate) {
    const start = new Date(filters.value.startDate);
    result = result.filter((invoice) => new Date(invoice.ngayTao) >= start);
  }
  if (filters.value.endDate) {
    const end = new Date(filters.value.endDate);
    end.setHours(23, 59, 59, 999);
    result = result.filter((invoice) => new Date(invoice.ngayTao) <= end);
  }

  if (filters.value.minPrice) {
    result = result.filter((invoice) => invoice.tongTienThanhToan >= parseFloat(filters.value.minPrice));
  }
  if (filters.value.maxPrice) {
    result = result.filter((invoice) => invoice.tongTienThanhToan <= parseFloat(filters.value.maxPrice));
  }

  if (filters.value.sortBy) {
    result = [...result];
    if (filters.value.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
    } else if (filters.value.sortBy === 'most_expensive') {
      result.sort((a, b) => b.tongTienThanhToan - a.tongTienThanhToan);
    } else if (filters.value.sortBy === 'cheapest') {
      result.sort((a, b) => a.tongTienThanhToan - b.tongTienThanhToan);
    }
  }

  return result;
});

// DataTable columns configuration
const tableColumns = ref([
  { key: 'stt', label: 'STT', class: 'text-center' },
  { key: 'maHoaDon', label: 'Mã Hóa Đơn', class: 'font-weight-bold' },
  { key: 'khachHang', label: 'Khách Hàng' },
  { key: 'soDienThoai', label: 'Số Điện Thoại' },
  { key: 'loaiDon', label: 'Loại Đơn', class: 'text-center' },
  { key: 'phiVanChuyen', label: 'Phí Vận Chuyển', class: 'text-right' },
  { key: 'ngayTao', label: 'Ngày Tạo' },
  { key: 'tongTien', label: 'Tổng Tiền', class: 'text-right' },
  { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' },
  { key: 'actions', label: 'Hành Động', class: 'text-center' }
]);

// Breadcrumb configuration
const breadcrumbItems = ref([
  { label: 'Quản lý bán hàng', path: '/dashboard' },
  { label: 'Hóa đơn' }
]);

const breadcrumbActions = ref([
  {
    label: 'Làm mới',
    type: 'default',
    handler: () => fetchAllInvoices()
  },
  {
    label: 'Xuất Excel',
    type: 'primary',
    handler: () => exportToExcel()
  },
  {
    label: 'Quét QR hóa đơn',
    type: 'primary',
    handler: () => scanQRInvoice()
  },
  {
    label: 'Thêm hóa đơn',
    type: 'primary',
    handler: () => navigateToSalesCounter()
  }
]);

const pageStats = computed(() => [
  {
    icon: 'solar:bill-list-bold',
    value: allInvoices.value.length,
    label: 'Tổng hóa đơn'
  },
  {
    icon: 'solar:dollar-minimalistic-bold',
    value: formatCurrency(totalRevenue.value),
    label: 'Tổng doanh thu'
  },
  {
    icon: 'solar:check-circle-bold',
    value: allInvoices.value.filter(inv => inv.trangThai?.id === 21).length,
    label: 'Đã hoàn thành'
  }
]);

const paginatedInvoices = computed(() => {
  const start = currentPage.value * pageSize.value;
  const end = start + pageSize.value;
  return filteredInvoices.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / pageSize.value) || 1);

const displayedPages = computed(() => {
  const maxPagesToShow = 5;
  const total = totalPages.value;
  const current = currentPage.value + 1;
  let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(total, startPage + maxPagesToShow - 1);
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

// Enhanced fake data for testing
const generateFakeInvoices = () => {
  const statuses = [
    { id: 6, name: 'Chờ xác nhận' },
    { id: 7, name: 'Chờ xử lý' },
    { id: 8, name: 'Chờ vận chuyển' },
    { id: 9, name: 'Đang vận chuyển' },
    { id: 21, name: 'Đã hoàn thành' },
    { id: 22, name: 'Đã hủy' },
  ];

  const customers = [
    { tenKhachHang: 'Nguyễn Văn An', soDienThoai: '0901234567' },
    { tenKhachHang: 'Trần Thị Bình', soDienThoai: '0912345678' },
    { tenKhachHang: 'Lê Hoàng Cường', soDienThoai: '0923456789' },
    { tenKhachHang: 'Phạm Thị Dung', soDienThoai: '0934567890' },
    { tenKhachHang: 'Hoàng Văn Em', soDienThoai: '0945678901' },
    { tenKhachHang: 'Vũ Thị Phương', soDienThoai: '0956789012' },
    { tenKhachHang: 'Đặng Minh Quân', soDienThoai: '0967890123' },
    { tenKhachHang: 'Bùi Thị Hoa', soDienThoai: '0978901234' },
    { tenKhachHang: 'Ngô Văn Tùng', soDienThoai: '0989012345' },
    { tenKhachHang: 'Lý Thị Mai', soDienThoai: '0990123456' }
  ];

  const products = [
    'Nike Air Max 270', 'Adidas Ultraboost 22', 'Converse Chuck Taylor', 
    'Vans Old Skool', 'New Balance 990v5', 'Puma RS-X', 'Reebok Classic',
    'Jordan 1 Retro High', 'Asics Gel-Kayano', 'Skechers D\'Lites'
  ];

  const fakeInvoices = [];
  
  for (let i = 1; i <= 50; i++) {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const randomAmount = Math.floor(Math.random() * 3000000) + 200000; // 200k - 3.2M VND
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 60)); // Last 60 days
    
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    const orderType = Math.random() > 0.6 ? 'online' : 'trực tiếp';
    
    fakeInvoices.push({
      id: i,
      maHoaDon: `HD${String(i).padStart(6, '0')}`,
      khachHang: randomCustomer,
      trangThai: randomStatus,
      tongTienThanhToan: randomAmount,
      ngayTao: randomDate.toISOString(),
      loaiDon: orderType,
      phiVanChuyen: orderType === 'online' ? Math.floor(Math.random() * 50000) + 15000 : 0, // Online có phí ship, trực tiếp = 0
      sanPham: randomProduct,
      soLuong: Math.floor(Math.random() * 3) + 1,
      ghiChu: Math.random() > 0.5 ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn'
    });
  }

  return fakeInvoices;
};

const fetchAllInvoices = async () => {
  console.log('Bắt đầu tải hóa đơn...');
  errorMessage.value = '';
  
  try {
    // Use fake data instead of API
    const fakeData = generateFakeInvoices();
    allInvoices.value = fakeData;

    // Tính tổng doanh thu sau khi lấy danh sách hóa đơn
    calculateTotalRevenue();

    if (route.query.maHoaDon) {
      highlightedInvoice.value = route.query.maHoaDon;
      setTimeout(() => {
        const element = document.querySelector(`tr[data-ma-hoa-don="${highlightedInvoice.value}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight');
          setTimeout(() => element.classList.remove('highlight'), 3000);
        }
      }, 500);
    }

    if (allInvoices.value.length === 0) {
      toast.info('Không có hóa đơn nào trong hệ thống.', { timeout: 4000 });
    } else {
      toast.success('Dữ liệu hóa đơn đã được tải thành công!', { timeout: 3000 });
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu hóa đơn:', error);
    errorMessage.value = `Lỗi khi tải dữ liệu hóa đơn: ${error.message}`;
    toast.error(errorMessage.value, { timeout: 5000 });
  } finally {
    if (currentPage.value >= totalPages.value) {
      currentPage.value = Math.max(0, totalPages.value - 1);
    }
    console.log('Kết thúc tải hóa đơn:', allInvoices.value);
  }
};

const editInvoice = (invoice) => {
  editInvoiceData.value = {
    id: invoice.id,
    maHoaDon: invoice.maHoaDon,
    khachHang: {
      tenKhachHang: invoice.khachHang?.tenKhachHang || 'Khách lẻ',
      soDienThoai: invoice.khachHang?.soDienThoai || '',
    },
    trangThai: { id: invoice.trangThai?.id || 6 },
    tongTienThanhToan: invoice.tongTienThanhToan || 0,
  };
  showEditModal.value = true;
};

const handleUpdateInvoice = async () => {
  if (!editInvoiceData.value.maHoaDon) {
    toast.error('Mã hóa đơn không được để trống!');
    return;
  }
  if (!editInvoiceData.value.tongTienThanhToan) {
    toast.error('Tổng tiền thanh toán không hợp lệ!');
    return;
  }
  isUpdating.value = true;
  try {
    const updatedStatusId = parseInt(editInvoiceData.value.trangThai.id);
    await apiUpdateInvoice(editInvoiceData.value.id, {
      maHoaDon: editInvoiceData.value.maHoaDon,
      khachHang: {
        tenKhachHang: editInvoiceData.value.khachHang.tenKhachHang || 'Khách lẻ',
        soDienThoai: editInvoiceData.value.khachHang.soDienThoai || '',
      },
      trangThai: { id: updatedStatusId },
      tongTienThanhToan: editInvoiceData.value.tongTienThanhToan,
    });
    toast.success('Cập nhật hóa đơn thành công!');
    showEditModal.value = false;
    await fetchAllInvoices();

    if (updatedStatusId === 21) {
      emitter.emit('invoice-completed', editInvoiceData.value);
      console.log('Đã phát ra sự kiện invoice-completed với hóa đơn:', editInvoiceData.value);
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật hóa đơn:', error.response ? error.response.data : error.message);
    toast.error(`Lỗi khi cập nhật hóa đơn: ${error.response?.data?.message || error.message}`);
  } finally {
    isUpdating.value = false;
  }
};

const confirmDelete = (id) => {
  deleteInvoiceId.value = id;
  showDeleteModal.value = true;
};

const handleDeleteInvoice = async () => {
  isDeleting.value = true;
  try {
    await apiDeleteInvoice(deleteInvoiceId.value);
    toast.success('Xóa hóa đơn thành công!');
    showDeleteModal.value = false;
    deleteInvoiceId.value = null;
    await fetchAllInvoices();
  } catch (error) {
    console.error('Lỗi khi xóa hóa đơn:', error.response ? error.response.data : error.message);
    toast.error(`Lỗi khi xóa hóa hóa đơn: ${error.response?.data?.message || error.message}`);
  } finally {
    isDeleting.value = false;
  }
};

const getTabCount = (tabId) => {
  if (!allInvoices.value.length) return 0;
  if (tabId === 'all') return allInvoices.value.length;
  const tab = tabs.value.find((t) => t.id === tabId);
  if (!tab?.statusId) return 0;
  return allInvoices.value.filter((invoice) => invoice.trangThai?.id === tab.statusId).length;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
  } catch (e) {
    console.error('Error formatting date:', date, e);
    return 'Invalid Date';
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const getStatusText = (statusId) => {
  const statusMap = {
    6: 'Chờ xác nhận',
    7: 'Chờ xử lý',
    8: 'Chờ vận chuyển',
    9: 'Đang vận chuyển',
    21: 'Đã hoàn thành',
    22: 'Đã hủy',
  };
  return statusMap[statusId] || 'Không xác định';
};

const getStatusColor = (statusId) => {
  const colorMap = {
    6: 'text-orange-600 bg-orange-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    7: 'text-amber-600 bg-amber-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    8: 'text-cyan-600 bg-cyan-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    9: 'text-green-600 bg-green-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    21: 'text-lime-700 bg-lime-200 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    22: 'text-red-700 bg-red-200 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
  };
  return colorMap[statusId] || 'text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase';
};

const switchTab = (tabId) => {
  activeTab.value = tabId;
  const tab = tabs.value.find((t) => t.id === tabId);
  filters.value.trangThaiId = tab.statusId ? String(tab.statusId) : '';
  currentPage.value = 0;
  if (tabId === 'all') {
    toast.info('Đang hiển thị tất cả hóa đơn.', { timeout: 2000 });
  } else {
    toast.info(`Đang hiển thị hóa đơn trạng thái: ${tab.label}.`, { timeout: 2000 });
  }
};

const filterInvoices = () => {
  filters.value.search = tempFilters.value.search;
  filters.value.trangThaiId = tempFilters.value.trangThaiId;
  filters.value.startDate = tempFilters.value.startDate;
  filters.value.endDate = tempFilters.value.endDate;
  filters.value.minPrice = tempFilters.value.minPrice;
  filters.value.maxPrice = tempFilters.value.maxPrice;
  filters.value.sortBy = tempFilters.value.sortBy;

  currentPage.value = 0;
  let message = 'Đã áp dụng bộ lọc: ';
  let filterApplied = false;

  if (filters.value.search) {
    message += `Mã hóa đơn, tên khách hàng hoặc SĐT: "${filters.value.search}". `;
    filterApplied = true;
  }
  if (filters.value.trangThaiId) {
    const statusText = getStatusText(parseInt(filters.value.trangThaiId));
    message += `Trạng thái: "${statusText}". `;
    filterApplied = true;
  }
  if (filters.value.startDate) {
    message += `Từ ngày: "${formatDate(filters.value.startDate)}". `;
    filterApplied = true;
  }
  if (filters.value.endDate) {
    message += `Đến ngày: "${formatDate(filters.value.endDate)}". `;
    filterApplied = true;
  }
  if (filters.value.sortBy) {
    const sortByText = {
      newest: 'Mới nhất',
      most_expensive: 'Đắt nhất',
      cheapest: 'Rẻ nhất',
    }[filters.value.sortBy];
    message += `Sắp xếp theo: "${sortByText}". `;
    filterApplied = true;
  }

  if (filterApplied) {
    toast.success(message, { timeout: 4000 });
  } else {
    toast.info('Không có bộ lọc nào được áp dụng.', { timeout: 2000 });
  }
};

const resetFilters = () => {
  filters.value = { search: '', trangThaiId: '', loaiDon: '', startDate: '', endDate: '', minPrice: '', maxPrice: '', sortBy: '' };
  tempFilters.value = { search: '', trangThaiId: '', loaiDon: '', startDate: '', endDate: '', minPrice: '', maxPrice: '', sortBy: '' };
  activeTab.value = 'all';
  currentPage.value = 0;
  toast.info('Đã đặt lại tất cả bộ lọc!', { timeout: 2000 });
};


const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    toast.info(`Đang hiển thị trang ${page + 1} của danh sách hóa đơn.`, { timeout: 1500 });
  }
};


// Lắng nghe sự kiện invoice-completed để cập nhật tổng doanh thu
emitter.on('invoice-completed', (invoice) => {
  console.log('Nhận được sự kiện invoice-completed:', invoice);
  calculateTotalRevenue();
  toast.info('Tổng doanh thu đã được cập nhật!', { timeout: 3000 });
});

onMounted(() => {
  fetchAllInvoices();
});

// Theo dõi thay đổi danh sách hóa đơn để cập nhật tổng doanh thu
watch(allInvoices, () => {
  calculateTotalRevenue();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4 md:p-6 font-roboto transition-colors duration-300">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :actions="breadcrumbActions"
      :show-page-info="true"
      page-title="Quản lý Hóa đơn"
      page-description="Quản lý và theo dõi tất cả hóa đơn bán hàng trong hệ thống"
      page-icon="solar:bill-list-bold-duotone"
      :page-stats="pageStats"
    />

    <div v-if="errorMessage" class="card bg-red-50 dark:bg-red-950 p-4 mb-6 rounded-3xl shadow-lg animate__animated animate__fadeIn">
      <p class="text-red-600 dark:text-red-300 font-medium flex items-center">
        <Icon icon="solar:danger-triangle-bold-duotone" class="text-2xl mr-3" />
        {{ errorMessage }}
      </p>
    </div>

    <!-- Filter Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <div class="filter-header mb-4">
        <h3 class="filter-title">
          <Icon icon="solar:filter-bold-duotone" class="text-xl" />
          Bộ Lọc Hóa Đơn
        </h3>
        <button class="reset-filter-btn" @click="resetFilters">
          Đặt lại bộ lọc
        </button>
      </div>
      
      <div class="filter-content">
        <div class="filter-row mb-4">
          <div class="filter-group">
            <label class="filter-label">Tìm kiếm</label>
            <input
              v-model="tempFilters.search"
              type="text"
              placeholder="Tìm kiếm mã hóa đơn, tên khách hàng..."
              class="filter-input"
              @input="filterInvoices"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Giá từ</label>
            <input
              v-model="tempFilters.minPrice"
              type="number"
              placeholder="0"
              class="filter-input"
              @input="filterInvoices"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Giá đến</label>
            <input
              v-model="tempFilters.maxPrice"
              type="number"
              placeholder="10,000,000"
              class="filter-input"
              @input="filterInvoices"
            />
          </div>
        </div>
      
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <select
              v-model="tempFilters.trangThaiId"
              class="filter-input"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="6">Chờ xác nhận</option>
              <option value="7">Chờ xử lý</option>
              <option value="8">Chờ vận chuyển</option>
              <option value="9">Đang vận chuyển</option>
              <option value="21">Đã hoàn thành</option>
              <option value="22">Đã hủy</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Loại đơn</label>
            <select
              v-model="tempFilters.loaiDon"
              class="filter-input"
            >
              <option value="">Tất cả loại đơn</option>
              <option value="online">Online</option>
              <option value="trực tiếp">Trực tiếp</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Từ ngày</label>
            <input
              v-model="tempFilters.startDate"
              type="date"
              class="filter-input"
              @change="filterInvoices"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Đến ngày</label>
            <input
              v-model="tempFilters.endDate"
              type="date"
              class="filter-input"
              @change="filterInvoices"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Sắp xếp theo</label>
            <select
              v-model="tempFilters.sortBy"
              class="filter-select"
              @change="filterInvoices"
            >
              <option value="">Sắp xếp mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="most_expensive">Đắt nhất</option>
              <option value="cheapest">Rẻ nhất</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div class="p-6">
        <!-- Status Filter Tabs -->
        <div class="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2',
              activeTab === tab.id 
                ? 'bg-white dark:bg-gray-600 text-blue-800 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
            ]"
            @click="switchTab(tab.id)"
          >
            <span>{{ tab.label }}</span>
            <span class="bg-blue-200 dark:bg-blue-500 text-xs px-2 py-0.5 rounded-full">{{ getTabCount(tab.id) }}</span>
          </button>
        </div>

        <!-- Invoice List Section -->
        <div class="invoices-section">
          <div class="section-header">
            <h3 class="section-title">
              <Icon icon="solar:bill-list-bold-duotone" class="text-xl" />
              Danh Sách Hóa Đơn ({{ filteredInvoices.length }})
            </h3>
          </div>

          <!-- DataTable Component -->
          <DataTable
            :data="filteredInvoices"
            :columns="tableColumns"
            item-label="hóa đơn"
            empty-message="Không có dữ liệu hóa đơn nào được tìm thấy."
            key-field="id"
          >
            <!-- Custom column templates -->
            <template #stt="{ rowIndex }">
              {{ rowIndex }}
            </template>
            
            <template #maHoaDon="{ item }">
              <span class="font-bold text-gray-800 dark:text-gray-100">{{ item.maHoaDon }}</span>
            </template>
            
            <template #khachHang="{ item }">
              {{ item.khachHang?.tenKhachHang || 'Khách lẻ' }}
            </template>
            
            <template #soDienThoai="{ item }">
              {{ item.khachHang?.soDienThoai || 'N/A' }}
            </template>
            
            <template #loaiDon="{ item }">
              <span v-if="item.loaiDon === 'online'" class="order-type-badge online-order">
                <Icon icon="solar:global-bold-duotone" class="w-3 h-3 mr-1" />
                Online
              </span>
              <span v-else class="order-type-badge offline-order">
                <Icon icon="solar:shop-bold-duotone" class="w-3 h-3 mr-1" />
                Trực tiếp
              </span>
            </template>
            
            <template #phiVanChuyen="{ item }">
              <span class="font-medium text-gray-800 dark:text-gray-100">{{ formatCurrency(item.phiVanChuyen) }}</span>
            </template>
            
            <template #ngayTao="{ item }">
              {{ formatDate(item.ngayTao) }}
            </template>
            
            <template #tongTien="{ item }">
              <span class="font-bold text-gray-800 dark:text-gray-100">{{ formatCurrency(item.tongTienThanhToan) }}</span>
            </template>
            
            <template #trangThai="{ item }">
              <span :class="getStatusColor(item.trangThai?.id)">
                {{ getStatusText(item.trangThai?.id) }}
              </span>
            </template>
            
            <template #actions="{ item }">
              <div class="flex justify-center gap-2">
                <router-link
                  :to="{ name: 'HoaDonChiTiet', params: { id: item.id } }"
                  class="action-btn view"
                  title="Xem chi tiết"
                >
                  <Icon icon="solar:eye-bold" />
                </router-link>
                <button
                  @click="printInvoicePDF(item)"
                  class="action-btn print"
                  title="In hóa đơn PDF"
                >
                  <Icon icon="solar:printer-bold" />
                </button>
                <button
                  @click="downloadQRCode(item)"
                  class="action-btn qr"
                  title="Tải mã QR hóa đơn"
                >
                  <Icon icon="solar:qr-code-bold" />
                </button>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Icon icon="solar:pencil-bold" class="text-2xl mr-2 text-yellow-600" />
          Sửa Hóa Đơn
        </h3>
        <form @submit.prevent="handleUpdateInvoice">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Mã Hóa Đơn</label>
            <input
              v-model="editInvoiceData.maHoaDon"
              type="text"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tên Khách Hàng</label>
            <input
              v-model="editInvoiceData.khachHang.tenKhachHang"
              type="text"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Số Điện Thoại</label>
            <input
              v-model="editInvoiceData.khachHang.soDienThoai"
              type="text"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Trạng Thái</label>
            <select
              v-model="editInvoiceData.trangThai.id"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
            >
              <option value="6">Chờ xác nhận</option>
              <option value="7">Chờ xử lý</option>
              <option value="8">Chờ vận chuyển</option>
              <option value="9">Đang vận chuyển</option>
              <option value="21">Đã hoàn thành</option>
              <option value="22">Đã hủy</option>
            </select>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              type="submit"
              :disabled="isUpdating"
              class="btn-primary px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition duration-300 shadow-lg hover:shadow-xl flex-1 flex items-center justify-center"
            >
  Lưu
            </button>
            <button
              type="button"
              @click="showEditModal = false"
              :disabled="isUpdating"
              class="btn-secondary px-6 py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Icon icon="solar:trash-bin-bold" class="text-2xl mr-2 text-red-600" />
          Xác Nhận Xóa
        </h3>
        <p class="text-gray-700 dark:text-gray-200 mb-6">Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác.</p>
        <div class="flex gap-3">
          <button
            @click="handleDeleteInvoice"
            :disabled="isDeleting"
            class="btn-primary px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition duration-300 shadow-lg hover:shadow-xl flex-1 flex items-center justify-center"
          >
Xóa
          </button>
          <button
            type="button"
            @click="showDeleteModal = false"
            :disabled="isDeleting"
            class="btn-secondary px-6 py-3 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'vue-toastification/dist/index.css';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=block');

:root {
  --primary-blue: #3b82f6;
  --primary-blue-dark: #2563eb;
  --card-bg-light: #ffffff;
  --card-bg-dark: #1f2937;
  --text-color-light: #1f2937;
  --text-color-dark: #e5e7eb;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.card {
  border-radius: 24px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--card-bg-light);
}

.dark .card {
  background: var(--card-bg-dark);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.card-body {
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(145deg, #f0f4f7, #ffffff);
}

.dark .card-body {
  background: linear-gradient(145deg, #2a3442, #1f2937);
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 18px 16px;
  text-align: left;
}

.table thead th {
  background: #e0f2f7;
  color: #212121;
  font-weight: 800;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
}

.dark .table thead th {
  background: #374151;
  color: #e5e7eb;
}

.table tbody tr {
  border-bottom: 1px dashed #e5e7eb;
  transition: background 0.3s ease;
}

.dark .table tbody tr {
  border-bottom: 1px dashed #4b5563;
}

.table tbody tr:last-child {
  border-bottom: none;
}

.table tbody tr:hover {
  background: rgba(59, 130, 246, 0.07);
}

.dark .table tbody tr:hover {
  background: #374151;
}

.btn-primary {
  background: #10b981;
  color: white;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.45);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-secondary {
  background: #ef4444;
  color: white;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.45);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: #6b7280;
  font-size: 1.4rem;
  font-weight: 500;
}

.dark .no-data {
  color: #9ca3af;
}

.pagination button {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  min-width: 40px;
  text-align: center;
}

.dark .pagination button {
  background: #374151;
  color: #d1d5db;
  border: 1px solid #4b5563;
}

.pagination button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .pagination button:hover:not(:disabled) {
  background: #4b5563;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.pagination button.bg-blue-600 {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.tab {
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

.tab:hover:not(.bg-gradient-to-r) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.tab.bg-gradient-to-r {
  box-shadow: 0 5px 18px rgba(59, 130, 246, 0.35);
}

@media (max-width: 1024px) {
  .filter-group {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .p-6 {
    padding: 1.25rem;
  }
  .md\:p-8 {
    padding: 1.5rem;
  }
  .table th,
  .table td {
    padding: 14px;
  }
}

/* Filter Section Styling */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.reset-filter-btn {
  padding: 10px 16px;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.reset-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(107, 114, 128, 0.3);
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2937;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .section-header {
  border-bottom-color: #4b5563;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.action-btn.view {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn.print {
  background: #dcfce7;
  color: #166534;
}

.action-btn.qr {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  .table th,
  .table td {
    padding: 10px;
    font-size: 0.8rem;
  }
  .tabs {
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .tab {
    padding: 0.5rem 0.8rem;
    font-size: 0.75rem;
  }
  .pagination {
    flex-direction: column;
    align-items: center;
  }
  .pagination button {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Order Type Badge Styles */
.order-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.online-order {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.online-order:hover {
  background: #bfdbfe;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.offline-order {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #86efac;
}

.offline-order:hover {
  background: #bbf7d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}
</style>
