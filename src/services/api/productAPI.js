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

  // Product details API functions
  // Get paginated product details by product ID
  getProductDetailsPaged: (productId, params = {}) => {
    const {
      page = 0,
      size = 10,
      sortBy = 'id',
      sortDir = 'asc'
    } = params
    
    return productAPI.get(`/chi-tiet-san-pham/product/${productId}`, {
      params: {
        page,
        size,
        sortBy,
        sortDir
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
  deleteMaterial: (id) => productAPI.delete(`/chat-lieu/${id}`),

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
  deleteCategory: (id) => productAPI.delete(`/danh-muc/${id}`),

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
  deleteSize: (id) => productAPI.delete(`/kich-co/${id}`),

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
  deleteColor: (id) => productAPI.delete(`/mau-sac/${id}`),

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
  deleteBrand: (id) => productAPI.delete(`/thuong-hieu/${id}`),

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
  deleteSole: (id) => productAPI.delete(`/de-giay/${id}`),
}

export default productService
