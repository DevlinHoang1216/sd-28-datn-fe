/**
 * CRUD operations for HoaDonChiTiet
 */

import { orderStatuses, sampleProducts } from './hoaDonChiTietConfig.js';
import { updateHoaDonStatus } from '@/services/api/APIHoaDon/HoaDonChiTietAPI.js';

// Generate fake invoice data
export const generateInvoiceData = (id) => {
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

// Fetch invoice detail from API or generate fake data
export const fetchInvoiceDetail = async (invoiceId, loadInvoiceDetail) => {
  try {
    await loadInvoiceDetail(invoiceId);
  } catch (error) {
    console.error('Error loading invoice detail:', error);
    throw error;
  }
};

// Update order status via API
export const updateOrderStatusAPI = async (invoiceId, statusId, note = '') => {
  try {
    // Call the real API with note parameter
    const response = await updateHoaDonStatus(invoiceId, parseInt(statusId), null, note);
    
    return {
      success: true,
      status: {
        id: response.trangThai,
        name: getStatusName(response.trangThai)
      },
      message: 'Cập nhật trạng thái thành công',
      data: response
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update to specific status
export const updateToStatusAPI = async (invoiceId, statusValue) => {
  try {
    // Call the real API with status ID
    const statusId = typeof statusValue === 'object' ? statusValue.id : statusValue;
    const response = await updateHoaDonStatus(invoiceId, statusId);
    
    return {
      success: true,
      status: {
        id: response.trangThai,
        name: getStatusName(response.trangThai)
      },
      message: `Đã cập nhật trạng thái thành: ${getStatusName(response.trangThai)}`,
      data: response
    };
  } catch (error) {
    console.error('Error updating to status:', error);
    throw error;
  }
};

// Helper function to get status name
const getStatusName = (statusId) => {
  const statusMap = {
    0: 'Hóa đơn chờ',
    1: 'Chờ xác nhận',
    2: 'Chờ xử lý',
    3: 'Chờ vận chuyển',
    4: 'Đang vận chuyển',
    5: 'Đã hoàn thành',
    6: 'Đã hủy'
  };
  return statusMap[statusId] || 'Không xác định';
};
