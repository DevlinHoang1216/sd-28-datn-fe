import { getAllHoaDon, updateHoaDon, deleteHoaDon } from '@/services/api/APIHoaDon/HoaDonAPI.js';

/**
 * Service for CRUD operations on invoices
 */

// Bidirectional status mapping
const STATUS_MAPPING = {
  // Number to String mapping
  numberToString: {
    0: 'Hóa đơn chờ',
    1: 'Chờ xác nhận',
    2: 'Chờ xử lý',
    3: 'Chờ vận chuyển',
    4: 'Đang vận chuyển',
    5: 'Đã hoàn thành',
    6: 'Đã hủy'
  },
  // String to Number mapping
  stringToNumber: {
    'Hóa đơn chờ': 0,
    'Chờ xác nhận': 1,
    'Chờ xử lý': 2,
    'Chờ vận chuyển': 3,
    'Đang vận chuyển': 4,
    'Đã hoàn thành': 5,
    'Đã hủy': 6
  }
};

// Helper functions for status mapping
export const getStatusNameById = (statusId) => {
  return STATUS_MAPPING.numberToString[statusId] || 'Không xác định';
};

export const getStatusIdByName = (statusName) => {
  return STATUS_MAPPING.stringToNumber[statusName] ?? null;
};

export const getAllStatusOptions = () => {
  return Object.entries(STATUS_MAPPING.numberToString).map(([id, name]) => ({
    id: parseInt(id),
    name: name
  }));
};

// Map backend DTO to frontend format
const mapBackendToFrontend = (backendInvoice) => {
  return {
    id: backendInvoice.id,
    maHoaDon: backendInvoice.ma,
    nhanVien: {
      id: backendInvoice.idNhanVien,
      maNhanVien: backendInvoice.maNhanVien
    },
    khachHang: {
      tenKhachHang: backendInvoice.tenKhachHang || 'Khách lẻ',
      soDienThoai: backendInvoice.soDienThoaiKhachHang || 'N/A'
    },
    trangThai: {
      id: backendInvoice.trangThai,
      name: getStatusNameById(backendInvoice.trangThai)
    },
    tongTienThanhToan: backendInvoice.tongTienSauGiam || 0,
    ngayTao: backendInvoice.ngayTao,
    loaiDon: backendInvoice.loaiDon || 'Tại quầy',
    phiVanChuyen: backendInvoice.phiVanChuyen || 0,
    idNhanVien: backendInvoice.idNhanVien,
    deleted: backendInvoice.deleted
  };
};


// Fetch all invoices from API
export const fetchAllInvoices = async (route, toast, filters = {}) => {
  console.log('Bắt đầu tải hóa đơn từ API...');

  try {
    // Prepare API parameters
    const params = {
      page: filters.page || 0,
      size: filters.size || 10,
      sortBy: filters.sortBy || 'id',
      sortDir: filters.sortDir || 'DESC'
    };

    // Add optional filters if they exist
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.minAmount) params.minAmount = filters.minAmount;
    if (filters.maxAmount) params.maxAmount = filters.maxAmount;
    if (filters.trangThai) params.trangThai = filters.trangThai;
    if (filters.loaiDon) params.loaiDon = filters.loaiDon;

    // Convert dates to timestamps if they exist
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      params.startDate = startDate.getTime();
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      params.endDate = endDate.getTime();
    }

    console.log('API Parameters:', params);

    // Call the API
    const response = await getAllHoaDon(params);

    // Handle paginated response
    const rawInvoices = response.content || response || [];
    const totalElements = response.totalElements || rawInvoices.length;
    const totalPages = response.totalPages || 1;

    // Map backend DTO to frontend format
    const invoices = rawInvoices.map(mapBackendToFrontend);

    if (invoices.length === 0) {
      toast.info('Không có hóa đơn nào trong hệ thống.', { timeout: 4000 });
    } else {
      toast.success(`Đã tải ${invoices.length} hóa đơn thành công!`, { timeout: 3000 });
    }

    console.log('Kết thúc tải hóa đơn từ API:', { invoices, totalElements, totalPages });
    return {
      invoices,
      totalElements,
      totalPages,
      error: null
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu hóa đơn từ API:', error);

    const errorMessage = `Lỗi khi tải dữ liệu từ API: ${error.message}`;
    toast.error(errorMessage, { timeout: 5000 });

    return {
      invoices: [],
      totalElements: 0,
      totalPages: 0,
      error: errorMessage
    };
  }
};

// Update invoice
export const updateInvoice = async (invoiceData, toast, emitter) => {
  try {
    const updatedStatusId = parseInt(invoiceData.trangThai.id);
    await updateHoaDon(invoiceData.id, {
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
    await deleteHoaDon(invoiceId);
    toast.success('Xóa hóa đơn thành công!');
    return { success: true, error: null };
  } catch (error) {
    console.error('Lỗi khi xóa hóa đơn:', error.response ? error.response.data : error.message);
    const errorMessage = `Lỗi khi xóa hóa đơn: ${error.response?.data?.message || error.message}`;
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};
