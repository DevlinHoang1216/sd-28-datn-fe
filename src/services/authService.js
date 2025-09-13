// Authentication Service
class AuthService {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('user_info') || 'null');
    this.isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
  }

  async login(credentials) {
    // Simple credential validation without backend API
    const validCredentials = [
      { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
      { username: 'nhanvien', password: '123456', name: 'Nhân viên', role: 'employee' },
      { username: 'manager', password: 'manager123', name: 'Quản lý', role: 'manager' }
    ];

    // Find matching credentials
    const user = validCredentials.find(
      cred => cred.username === credentials.username && cred.password === credentials.password
    );

    if (!user) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    // Store user info and login status
    const userInfo = {
      username: user.username,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('user_info', JSON.stringify(userInfo));
    localStorage.setItem('is_logged_in', 'true');
    
    if (credentials.rememberMe) {
      localStorage.setItem('remember_me', 'true');
    }

    this.user = userInfo;
    this.isLoggedIn = true;

    return { user: userInfo };
  }

  async logout() {
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
