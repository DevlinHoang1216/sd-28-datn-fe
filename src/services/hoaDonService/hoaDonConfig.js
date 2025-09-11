/**
 * Service for configuration data and static definitions
 */

// Tab configuration
export const getTabsConfig = () => [
  { id: 'all', label: 'Tất cả' },
  { id: 'cho_xac_nhan', label: 'Chờ xác nhận', statusId: 1 },
  { id: 'pending', label: 'Chờ xử lý', statusId: 2 },
  { id: 'cho_van_chuyen', label: 'Chờ vận chuyển', statusId: 3 },
  { id: 'dang_van_chuyen', label: 'Đang vận chuyển', statusId: 4 },
  { id: 'completed', label: 'Đã hoàn thành', statusId: 5 },
  { id: 'canceled', label: 'Đã hủy', statusId: 6 },
];

// DataTable columns configuration
export const getTableColumns = () => [
  { key: 'stt', label: 'STT', class: 'text-center' },
  { key: 'maHoaDon', label: 'Mã Hóa Đơn', class: 'font-weight-bold' },
  { key: 'nhanVien', label: 'Nhân viên' },
  { key: 'khachHang', label: 'Khách Hàng' },
  { key: 'soDienThoai', label: 'Số Điện Thoại' },
  { key: 'loaiDon', label: 'Loại Đơn', class: 'text-center' },
  { key: 'phiVanChuyen', label: 'Phí Vận Chuyển', class: 'text-right' },
  { key: 'ngayTao', label: 'Ngày Tạo' },
  { key: 'tongTien', label: 'Tổng Tiền', class: 'text-right' },
  { key: 'trangThai', label: 'Trạng Thái', class: 'text-center' },
  { key: 'actions', label: 'Hành Động', class: 'text-center' }
];

// Breadcrumb configuration
export const getBreadcrumbItems = () => [
  { label: 'Quản lý bán hàng', path: '/dashboard' },
  { label: 'Hóa đơn' }
];

// Breadcrumb actions configuration
export const getBreadcrumbActions = (loadInvoices, exportToExcel, scanQRInvoice, navigateToSalesCounter, filteredInvoices) => [
  {
    label: 'Làm mới',
    type: 'default',
    handler: () => loadInvoices()
  },
  {
    label: 'Xuất Excel',
    type: 'primary',
    handler: () => exportToExcel(filteredInvoices.value)
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
];

// Default filter values
export const getDefaultFilters = () => ({
  search: '',
  trangThaiId: '',
  loaiDon: '',
  startDate: '',
  endDate: '',
  minPrice: '',
  maxPrice: '',
  sortBy: ''
});

// Page stats configuration
export const getPageStats = (allInvoices, totalRevenue, formatCurrency) => [
  {
    icon: 'solar:bill-list-bold',
    value: allInvoices.length,
    label: 'Tổng hóa đơn'
  },
  {
    icon: 'solar:dollar-minimalistic-bold',
    value: formatCurrency(totalRevenue),
    label: 'Tổng doanh thu'
  },
  {
    icon: 'solar:check-circle-bold',
    value: allInvoices.filter(inv => inv.trangThai?.id === 5).length,
    label: 'Đã hoàn thành'
  }
];
