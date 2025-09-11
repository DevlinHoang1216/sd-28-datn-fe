/**
 * Configuration for HoaDonChiTiet functionality
 */

// Order status definitions (updated to match backend mapping)
export const orderStatuses = {
  direct: [
    { id: 5, name: 'Đã hoàn thành', color: 'text-green-600 bg-green-100', icon: 'solar:check-circle-bold' }
  ],
  online: [
    { id: 0, name: 'Hóa đơn chờ', color: 'text-gray-600 bg-gray-100', icon: 'solar:clock-circle-bold' },
    { id: 1, name: 'Chờ xác nhận', color: 'text-orange-600 bg-orange-100', icon: 'solar:clock-circle-bold' },
    { id: 2, name: 'Chờ xử lý', color: 'text-yellow-600 bg-yellow-100', icon: 'solar:settings-bold' },
    { id: 3, name: 'Chờ vận chuyển', color: 'text-blue-600 bg-blue-100', icon: 'solar:box-bold' },
    { id: 4, name: 'Đang vận chuyển', color: 'text-purple-600 bg-purple-100', icon: 'solar:delivery-bold' },
    { id: 5, name: 'Đã hoàn thành', color: 'text-green-600 bg-green-100', icon: 'solar:check-circle-bold' },
    { id: 6, name: 'Đã hủy', color: 'text-red-600 bg-red-100', icon: 'solar:close-circle-bold' }
  ]
};

// Sample product data for fallback
export const sampleProducts = [
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

// Breadcrumb configuration
export const breadcrumbItems = [
  { label: 'Quản lý bán hàng', path: '/dashboard' },
  { label: 'Hóa đơn', path: '/hoa-don' },
  { label: 'Chi tiết hóa đơn' }
];
