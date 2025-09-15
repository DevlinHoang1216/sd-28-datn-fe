import axios from 'axios';

// Authentication Service
class AuthService {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('user_info') || 'null');
    this.isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
    this.baseURL = 'http://localhost:8080/api/auth';
  }

  async login(credentials) {
    try {
      const response = await axios.post(`${this.baseURL}/login`, {
        tenDangNhap: credentials.username,
        matKhau: credentials.password,
        rememberMe: credentials.rememberMe
      });

      if (response.data.success) {
        // Map backend response to frontend format
        const userInfo = {
          id: response.data.id,
          ma: response.data.ma,
          username: response.data.tenDangNhap,
          email: response.data.email,
          soDienThoai: response.data.soDienThoai,
          tenQuyen: response.data.tenQuyen,
          capQuyenHan: response.data.capQuyenHan,
          loginTime: new Date().toISOString()
        };

        // Store user info and login status
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        localStorage.setItem('is_logged_in', 'true');
        
        if (credentials.rememberMe) {
          localStorage.setItem('remember_me', 'true');
        }

        this.user = userInfo;
        this.isLoggedIn = true;

        return { user: userInfo };
      } else {
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Lỗi kết nối đến server');
      }
    }
  }

  async logout() {
    try {
      // Call backend logout API with user ID if available
      const userId = this.user?.id;
      if (userId) {
        await axios.post(`${this.baseURL}/logout?userId=${userId}`);
      } else {
        await axios.post(`${this.baseURL}/logout`);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }

    // Clear local storage
    localStorage.removeItem('user_info');
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('remember_me');
    
    this.user = null;
    this.isLoggedIn = false;
  }

  // Utility methods
  isAuthenticated() {
    return this.isLoggedIn && !!this.user;
  }

  getUser() {
    return this.user;
  }

  hasRole(role) {
    return this.user?.role === role;
  }

  // Simple session check - no token expiration needed
  isSessionValid() {
    return this.isAuthenticated();
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;

// Export individual methods for convenience
export const {
  login,
  logout,
  isAuthenticated,
  getUser,
  hasRole,
  isSessionValid
} = authService;
