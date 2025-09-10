import { getInvoices, updateInvoice as apiUpdateInvoice, deleteInvoice as apiDeleteInvoice } from '@/services/api';

/**
 * Service for CRUD operations on invoices
 */

// Generate fake invoices for testing
export const generateFakeInvoices = () => {
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

// Fetch all invoices
export const fetchAllInvoices = async (route, toast) => {
  console.log('Bắt đầu tải hóa đơn...');
  
  try {
    // Use fake data instead of API
    const fakeData = generateFakeInvoices();
    const invoices = fakeData;

    if (invoices.length === 0) {
      toast.info('Không có hóa đơn nào trong hệ thống.', { timeout: 4000 });
    } else {
      toast.success('Dữ liệu hóa đơn đã được tải thành công!', { timeout: 3000 });
    }

    console.log('Kết thúc tải hóa đơn:', invoices);
    return { invoices, error: null };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu hóa đơn:', error);
    const errorMessage = `Lỗi khi tải dữ liệu hóa đơn: ${error.message}`;
    toast.error(errorMessage, { timeout: 5000 });
    return { invoices: [], error: errorMessage };
  }
};

// Update invoice
export const updateInvoice = async (invoiceData, toast, emitter) => {
  try {
    const updatedStatusId = parseInt(invoiceData.trangThai.id);
    await apiUpdateInvoice(invoiceData.id, {
      maHoaDon: invoiceData.maHoaDon,
      khachHang: {
        tenKhachHang: invoiceData.khachHang.tenKhachHang || 'Khách lẻ',
        soDienThoai: invoiceData.khachHang.soDienThoai || '',
      },
      trangThai: { id: updatedStatusId },
      tongTienThanhToan: invoiceData.tongTienThanhToan,
    });
    
    toast.success('Cập nhật hóa đơn thành công!');

    if (updatedStatusId === 21) {
      emitter.emit('invoice-completed', invoiceData);
      console.log('Đã phát ra sự kiện invoice-completed với hóa đơn:', invoiceData);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Lỗi khi cập nhật hóa đơn:', error.response ? error.response.data : error.message);
    const errorMessage = `Lỗi khi cập nhật hóa đơn: ${error.response?.data?.message || error.message}`;
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Delete invoice
export const deleteInvoice = async (invoiceId, toast) => {
  try {
    await apiDeleteInvoice(invoiceId);
    toast.success('Xóa hóa đơn thành công!');
    return { success: true, error: null };
  } catch (error) {
    console.error('Lỗi khi xóa hóa đơn:', error.response ? error.response.data : error.message);
    const errorMessage = `Lỗi khi xóa hóa hóa đơn: ${error.response?.data?.message || error.message}`;
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};
