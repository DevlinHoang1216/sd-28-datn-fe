import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

/**
 * Get detailed invoice information by ID
 * @param {number} id - Invoice ID
 * @returns {Promise} API response with detailed invoice data
 */
export const getHoaDonDetail = async (id) => {
    try {
        const response = await api.get(`/hoa-don/${id}/detail`);
        return response.data;
    } catch (error) {
        console.error('Error fetching invoice detail:', error);
        throw error;
    }
};

/**
 * Map backend response to frontend format for detailed invoice
 * @param {Object} backendData - Backend HoaDonDetailResponse
 * @returns {Object} Mapped frontend data
 */
export const mapHoaDonDetailToFrontend = (backendData) => {
    if (!backendData) return null;

    return {
        // Basic invoice info
        id: backendData.id,
        maHoaDon: backendData.maHoaDon,
        loaiDon: backendData.loaiDon,
        trangThai: {
            id: backendData.trangThai,
            ten: getStatusName(backendData.trangThai)
        },

        // Discount info
        maGiamGia: backendData.maGiamGia,
        tienGiam: backendData.tienGiam,
        phanTramGiam: backendData.phanTramGiam,

        // Dates
        ngayTao: backendData.ngayTao,
        ngayThanhToan: backendData.ngayThanhToan,

        // Customer info
        khachHang: {
            tenKhachHang: backendData.tenKhachHang,
            soDienThoai: backendData.soDienThoaiKhachHang,
            diaChi: backendData.diaChiKhachHang,
            email: backendData.email
        },

        // Notes and amounts
        ghiChu: backendData.ghiChu,
        tienSanPham: backendData.tienSanPham,
        tongTien: backendData.tongTien,
        tongTienThanhToan: backendData.tongTienSauGiam, // Map to frontend field name
        phiVanChuyen: backendData.phiVanChuyen,

        // Employee info
        nhanVien: {
            maNhanVien: backendData.maNhanVien,
            tenNhanVien: backendData.tenNhanVien
        },

        // Payment info
        thanhToanInfos: backendData.thanhToanInfos || [],

        // Product details
        sanPhamChiTietInfos: backendData.sanPhamChiTietInfos || [],

        // Invoice history
        lichSuHoaDonInfos: backendData.lichSuHoaDonInfos || []
    };
};

/**
 * Update invoice status
 * @param {number} id - Invoice ID
 * @param {number} trangThai - New status (0-6)
 * @param {number} idNhanVien - Employee ID (optional)
 * @param {string} ghiChu - Note for the status update (optional)
 * @returns {Promise} API response with updated invoice data
 */
export const updateHoaDonStatus = async (id, trangThai, idNhanVien = null, ghiChu = null) => {
    try {
        const params = new URLSearchParams();
        params.append('trangThai', trangThai.toString());
        if (idNhanVien) {
            params.append('idNhanVien', idNhanVien.toString());
        }
        if (ghiChu && ghiChu.trim()) {
            params.append('ghiChu', ghiChu.trim());
        }

        const response = await api.put(`/hoa-don/${id}/update-status?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error updating invoice status:', error);
        throw error;
    }
};

/**
 * Get status name by ID (consistent with memory mapping)
 * @param {number} statusId - Status ID
 * @returns {string} Status name
 */
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

export default {
    getHoaDonDetail,
    mapHoaDonDetailToFrontend,
    updateHoaDonStatus
};