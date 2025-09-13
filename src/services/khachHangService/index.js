import khachHangAPI from '@/services/api/APIKhachHang/KhachHangAPI'
import khachHangValidationAPI from '@/services/api/APIKhachHang/KhachHangValidationAPI'

const khachHangService = {
  // Transform backend data to frontend format
  mapBackendToFrontend: (backendData) => {
    if (!backendData) return null
    
    return {
      id: backendData.id,
      maKhachHang: backendData.ma || backendData.maKhachHang,
      tenKhachHang: backendData.ten || backendData.tenKhachHang,
      email: backendData.email || '',
      soDienThoai: backendData.soDienThoai,
      gioiTinh: backendData.gioiTinh,
      ngaySinh: backendData.ngaySinh,
      ngayTao: backendData.ngayTao || backendData.createdAt,
      ngayCapNhat: backendData.ngayCapNhat || backendData.updatedAt,
      trangThai: backendData.trangThai !== undefined ? backendData.trangThai : backendData.deleted,
      taiKhoanID: backendData.taiKhoanID,
      // Address information if available
      diaChi: backendData.diaChi || null
    }
  },

  // Transform frontend data to backend format for create
  mapFrontendToBackendCreate: (frontendData) => {
    if (!frontendData) return null
    
    // Convert date to ISO string for backend
    const ngaySinh = frontendData.ngaySinh ? new Date(frontendData.ngaySinh).toISOString() : null
    
    return {
      ten: frontendData.tenKhachHang,
      email: frontendData.email || '',
      soDienThoai: frontendData.soDienThoai,
      gioiTinh: frontendData.gioiTinh ? 1 : 0, // Convert boolean to Short (1/0)
      ngaySinh: ngaySinh,
      cccd: frontendData.cccd || null,
      matKhau: frontendData.matKhau || 'default123', // Default password for new customers
      // Address information
      thanhPho: frontendData.diaChiTinhThanh || '',
      quan: frontendData.diaChiQuanHuyen || '',
      phuong: frontendData.diaChiPhuongXa || '',
      diaChiCuThe: frontendData.diaChiSoNhaTenDuong || ''
    }
  },

  // Transform frontend data to backend format for update
  mapFrontendToBackendUpdate: (frontendData) => {
    if (!frontendData) return null
    
    // Convert date to ISO string for backend
    const ngaySinh = frontendData.ngaySinh ? new Date(frontendData.ngaySinh).toISOString() : null
    
    return {
      id: frontendData.id,
      ten: frontendData.tenKhachHang,
      email: frontendData.email || '',
      soDienThoai: frontendData.soDienThoai,
      gioiTinh: frontendData.gioiTinh ? 1 : 0, // Convert boolean to Short (1/0)
      ngaySinh: ngaySinh,
      cccd: frontendData.cccd || null,
      // Address information
      thanhPho: frontendData.diaChiTinhThanh || '',
      quan: frontendData.diaChiQuanHuyen || '',
      phuong: frontendData.diaChiPhuongXa || '',
      diaChiCuThe: frontendData.diaChiSoNhaTenDuong || '',
      // Status for soft delete
      deleted: !frontendData.trangThai
    }
  },

  // Get all customers with filtering and pagination
  getAllCustomers: async (filters = {}) => {
    try {
      const params = {
        page: filters.page || 0,
        size: filters.size || 10,
        keyword: filters.search || '',
        gioiTinh: filters.gioiTinh !== '' ? filters.gioiTinh : null,
        trangThai: filters.trangThai !== '' ? filters.trangThai : null,
        sortBy: filters.sortBy || 'id',
        sortDir: filters.sortDir || 'desc'
      }

      const response = await khachHangAPI.getAllKhachHang(params)
      
      // Transform backend data to frontend format
      if (response.content) {
        response.content = response.content.map(customer => 
          khachHangService.mapBackendToFrontend(customer)
        )
      }

      return response
    } catch (error) {
      console.error('Service error getting customers:', error)
      throw error
    }
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await khachHangAPI.getKhachHangById(id)
      return response.data
    } catch (error) {
      console.error('Service error getting customer by ID:', error)
      throw error
    }
  },

  // Create new customer
  createCustomer: async (customerData) => {
    try {
      const backendData = khachHangService.mapFrontendToBackendCreate(customerData)
      const response = await khachHangAPI.createKhachHang(backendData)
      return response
    } catch (error) {
      console.error('Service error creating customer:', error)
      throw error
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const backendData = khachHangService.mapFrontendToBackendUpdate(customerData)
      const response = await khachHangAPI.updateKhachHang(id, backendData)
      return response
    } catch (error) {
      console.error('Service error updating customer:', error)
      throw error
    }
  },

  // Delete customer (soft delete)
  deleteCustomer: async (id) => {
    try {
      const response = await khachHangAPI.deleteKhachHang(id)
      return response
    } catch (error) {
      console.error('Service error deleting customer:', error)
      throw error
    }
  },

  // Restore customer
  restoreCustomer: async (id) => {
    try {
      const response = await khachHangAPI.restoreKhachHang(id)
      return response
    } catch (error) {
      console.error('Service error restoring customer:', error)
      throw error
    }
  },

  // Validate customer data
  validateCustomerData: (customerData, isUpdate = false) => {
    const errors = []

    if (!customerData.tenKhachHang || customerData.tenKhachHang.trim() === '') {
      errors.push('Tên khách hàng là bắt buộc')
    }

    if (!customerData.ngaySinh) {
      errors.push('Ngày sinh là bắt buộc')
    }

    if (!customerData.soDienThoai || customerData.soDienThoai.trim() === '') {
      errors.push('Số điện thoại là bắt buộc')
    } else if (!/^0\d{9}$/.test(customerData.soDienThoai)) {
      errors.push('Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số')
    }

    // Validate email if provided
    if (customerData.email && customerData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerData.email.trim())) {
        errors.push('Email không hợp lệ')
      }
    }

    // Validate name contains only letters and spaces
    const nameRegex = /^[\p{L}\s]+$/u
    if (customerData.tenKhachHang && !nameRegex.test(customerData.tenKhachHang.trim())) {
      errors.push('Tên khách hàng chỉ được chứa chữ cái và khoảng trắng')
    }

    // Validate age (must be at least 16 years old)
    if (customerData.ngaySinh) {
      const birthDate = new Date(customerData.ngaySinh)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 16) {
        errors.push('Khách hàng phải từ 16 tuổi trở lên')
      }
    }

    return errors
  },

  // Format date for display
  formatDate: (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  },

  // Format gender for display
  formatGender: (gioiTinh) => {
    return gioiTinh === true ? 'Nam' : 'Nữ'
  },

  // Format status for display
  formatStatus: (trangThai) => {
    return trangThai ? 'Hoạt động' : 'Không hoạt động'
  }
}

export default khachHangService
