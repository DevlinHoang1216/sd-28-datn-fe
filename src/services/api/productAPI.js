import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const productAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
productAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
productAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Product API functions
export const productService = {
  // Get paginated products with details (category, brand)
  getProductsWithDetailsPaged: (params = {}) => {
    const {
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDir = 'asc'
    } = params
    
    return productAPI.get('/san-pham', {
      params: {
        page,
        size,
        sortBy,
        sortDir
      }
    })
  },

  // Get product by ID
  getProductById: (id) => productAPI.get(`/san-pham/${id}`),

  // Update product
  updateProduct: (id, data) => productAPI.put(`/san-pham/${id}`, data),

  // Create product
  createProduct: (data) => productAPI.post('/san-pham', data),

  // Create product with variants
  createProductWithVariants: (data) => productAPI.post('/san-pham/with-variants', data),

  // Toggle product status (deleted field)
  toggleProductStatus: (id) => productAPI.put(`/san-pham/${id}/toggle-status`),

  // Product details API functions
  // Get paginated product details by product ID
  getProductDetailsPaged: (productId, params = {}) => {
    const {
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDir = 'asc',
      search = '',
      sizeId = '',
      colorId = '',
      status = '',
      minImportPrice = '',
      maxImportPrice = '',
      minSellingPrice = '',
      maxSellingPrice = ''
    } = params
    
    return productAPI.get(`/chi-tiet-san-pham/product/${productId}`, {
      params: {
        page,
        size,
        sortBy,
        sortDir,
        ...(search && { search }),
        ...(sizeId && { sizeId }),
        ...(colorId && { colorId }),
        ...(status && { status }),
        ...(minImportPrice && { minImportPrice }),
        ...(maxImportPrice && { maxImportPrice }),
        ...(minSellingPrice && { minSellingPrice }),
        ...(maxSellingPrice && { maxSellingPrice })
      }
    })
  },

  // Attribute APIs with full CRUD operations
  
  // Chat Lieu (Material) APIs
  getMaterialsPaged: (params = {}) => {
    const {
      keyword = '',
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDirection = 'desc'
    } = params
    
    return productAPI.get('/chat-lieu', {
      params: { keyword, page, size, sortBy, sortDirection }
    })
  },
  getAllMaterials: () => productAPI.get('/chat-lieu/all'),
  getMaterialById: (id) => productAPI.get(`/chat-lieu/${id}`),
  createMaterial: (data) => productAPI.post('/chat-lieu', data),
  updateMaterial: (id, data) => productAPI.put(`/chat-lieu/${id}`, data),
  toggleMaterialStatus: (id) => productAPI.put(`/chat-lieu/${id}/toggle-status`),
  checkMaterialNameExists: (name, excludeId = null) => {
    const params = { name }
    if (excludeId) params.excludeId = excludeId
    return productAPI.get('/chat-lieu/check-name-exists', { params })
  },

  // Danh Muc (Category) APIs
  getCategoriesPaged: (params = {}) => {
    const {
      keyword = '',
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDirection = 'desc'
    } = params
    
    return productAPI.get('/danh-muc', {
      params: { keyword, page, size, sortBy, sortDirection }
    })
  },
  getAllCategories: () => productAPI.get('/danh-muc/all'),
  getCategoryById: (id) => productAPI.get(`/danh-muc/${id}`),
  createCategory: (data) => productAPI.post('/danh-muc', data),
  updateCategory: (id, data) => productAPI.put(`/danh-muc/${id}`, data),
  toggleCategoryStatus: (id) => productAPI.put(`/danh-muc/${id}/toggle-status`),
  checkCategoryNameExists: (name, excludeId = null) => {
    const params = { name }
    if (excludeId) params.excludeId = excludeId
    return productAPI.get('/danh-muc/check-name-exists', { params })
  },

  // Kich Co (Size) APIs
  getSizesPaged: (params = {}) => {
    const {
      keyword = '',
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDirection = 'desc'
    } = params
    
    return productAPI.get('/kich-co', {
      params: { keyword, page, size, sortBy, sortDirection }
    })
  },
  getAllSizes: () => productAPI.get('/kich-co/all'),
  getSizeById: (id) => productAPI.get(`/kich-co/${id}`),
  createSize: (data) => productAPI.post('/kich-co', data),
  updateSize: (id, data) => productAPI.put(`/kich-co/${id}`, data),
  toggleSizeStatus: (id) => productAPI.put(`/kich-co/${id}/toggle-status`),
  checkSizeNameExists: (name, excludeId = null) => {
    const params = { name }
    if (excludeId) params.excludeId = excludeId
    return productAPI.get('/kich-co/check-name-exists', { params })
  },

  // Mau Sac (Color) APIs
  getColorsPaged: (params = {}) => {
    const {
      keyword = '',
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDirection = 'desc'
    } = params
    
    return productAPI.get('/mau-sac', {
      params: { keyword, page, size, sortBy, sortDirection }
    })
  },
  getAllColors: () => productAPI.get('/mau-sac/all'),
  getColorById: (id) => productAPI.get(`/mau-sac/${id}`),
  createColor: (data) => productAPI.post('/mau-sac', data),
  updateColor: (id, data) => productAPI.put(`/mau-sac/${id}`, data),
  toggleColorStatus: (id) => productAPI.put(`/mau-sac/${id}/toggle-status`),
  checkColorNameExists: (name, excludeId = null) => {
    const params = { name }
    if (excludeId) params.excludeId = excludeId
    return productAPI.get('/mau-sac/check-name-exists', { params })
  },
  checkColorNameAndHexExists: (name, hex, excludeId = null) => {
    const params = { name, hex }
    if (excludeId) params.excludeId = excludeId
    return productAPI.get('/mau-sac/check-name-and-hex-exists', { params })
  },

  // Thuong Hieu (Brand) APIs
  getBrandsPaged: (params = {}) => {
    const {
      keyword = '',
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDirection = 'desc'
    } = params
    
    return productAPI.get('/thuong-hieu', {
      params: { keyword, page, size, sortBy, sortDirection }
    })
  },
  getAllBrands: () => productAPI.get('/thuong-hieu/all'),
  getBrandById: (id) => productAPI.get(`/thuong-hieu/${id}`),
  createBrand: (data) => productAPI.post('/thuong-hieu', data),
  updateBrand: (id, data) => productAPI.put(`/thuong-hieu/${id}`, data),
  toggleBrandStatus: (id) => productAPI.put(`/thuong-hieu/${id}/toggle-status`),
  checkBrandNameExists: (name, excludeId = null) => {
    const params = { name }
    if (excludeId) params.excludeId = excludeId
    return productAPI.get('/thuong-hieu/check-name-exists', { params })
  },

  // De Giay (Shoe Sole) APIs
  getSolesPaged: (params = {}) => {
    const {
      keyword = '',
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDirection = 'desc'
    } = params
    
    return productAPI.get('/de-giay', {
      params: { keyword, page, size, sortBy, sortDirection }
    })
  },
  getAllSoles: () => productAPI.get('/de-giay/all'),
  getSoleById: (id) => productAPI.get(`/de-giay/${id}`),
  createSole: (data) => productAPI.post('/de-giay', data),
  updateSole: (id, data) => productAPI.put(`/de-giay/${id}`, data),
  toggleSoleStatus: (id) => productAPI.put(`/de-giay/${id}/toggle-status`),
  checkSoleNameExists: (name, excludeId = null) => {
    const params = { name }
    if (excludeId) params.excludeId = excludeId
    return productAPI.get('/de-giay/check-name-exists', { params })
  },

  // Image upload API (fallback to simple upload if Cloudinary fails)
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      // Try Cloudinary upload first
      const response = await productAPI.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.url
    } catch (error) {
      console.warn('Cloudinary upload failed, trying simple upload:', error)
      // Fallback to simple upload
      const response = await productAPI.post('/simple-upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.url
    }
  },

  // Add variants to existing product
  addVariantsToProduct: async (productId, variants) => {
    const response = await productAPI.post(`/san-pham/${productId}/variants`, variants)
    return response.data
  },

  // Chi Tiet San Pham (Product Details) APIs
  getAllProductDetails: (params = {}) => {
    const {
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDir = 'asc',
      search = '',
      sizeId = '',
      colorId = '',
      status = '',
      minImportPrice = '',
      maxImportPrice = '',
      minSellingPrice = '',
      maxSellingPrice = ''
    } = params
    
    return productAPI.get('/chi-tiet-san-pham', {
      params: {
        page,
        size,
        sortBy,
        sortDir,
        ...(search && { search }),
        ...(sizeId && { sizeId }),
        ...(colorId && { colorId }),
        ...(status && { status }),
        ...(minImportPrice && { minImportPrice }),
        ...(maxImportPrice && { maxImportPrice }),
        ...(minSellingPrice && { minSellingPrice }),
        ...(maxSellingPrice && { maxSellingPrice })
      }
    })
  },
  getChiTietSanPhamById: (id) => productAPI.get(`/chi-tiet-san-pham/${id}`),
  updateChiTietSanPham: (id, data) => productAPI.put(`/chi-tiet-san-pham/${id}`, data),
}

export default productService
