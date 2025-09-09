import { createRouter, createWebHashHistory } from 'vue-router'

// Main views
import Dashboard from './views/Dashboard.vue'
import HoaDon from './views/HoaDon.vue'
import PhieuGiamGia from './views/PhieuGiamGia.vue'
import DotGiamGia from './views/DotGiamGia.vue'
import BanTaiQuay from './views/BanTaiQuay.vue'
import QuanLySanPham from './views/QuanLySanPham.vue'
import NhanVien from './views/NhanVien.vue'
import KhachHang from './views/KhachHang.vue'
import InvoiceDetail from './views/InvoiceDetail.vue'

// Attribute management views
import HangPage from './views/attributes/Hang.vue'
import MauSacPage from './views/attributes/MauSac.vue'
import KichCoPage from './views/attributes/KichCo.vue'
import ChatLieuPage from './views/attributes/ChatLieu.vue'
import DanhMucPage from './views/attributes/DanhMuc.vue'


const routes = [
  // Main routes
  { path: '/', name: 'Home', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  
  // Product management routes
  {
    path: '/quan-ly-san-pham',
    name: 'QuanLySanPham',
    component: QuanLySanPham
  },
  {
    path: '/quan-ly-san-pham/chi-tiet-san-pham',
    name: 'SanPhamChiTiet',
    component: () => import('./views/products-manager/Products-Detail.vue')
  },
  {
    path: '/quan-ly-san-pham/them-san-pham',
    name: 'ThemSanPham',
    component: () => import('./views/products-manager/AddProductForm.vue')
  },

  // Invoice and order management
  { path: '/hoa-don', name: 'HoaDon', component: HoaDon },
  { path: '/hoa-don/detail/:id', name: 'InvoiceDetail', component: InvoiceDetail },
  { path: '/phieu-giam-gia', name: 'PhieuGiamGia', component: PhieuGiamGia },
  { path: '/dot-giam-gia', name: 'DotGiamGia', component: DotGiamGia },
  { path: '/ban-tai-quay', name: 'BanTaiQuay', component: BanTaiQuay },

  // User management
  { path: '/nhan-vien', name: 'NhanVien', component: NhanVien },
  { path: '/khach-hang', name: 'KhachHang', component: KhachHang },

  // Attribute management routes
  { path: '/thuoc-tinh/hang', name: 'Hang', component: HangPage },
  { path: '/thuoc-tinh/mau-sac', name: 'MauSac', component: MauSacPage },
  { path: '/thuoc-tinh/kich-co', name: 'KichCo', component: KichCoPage },
  { path: '/thuoc-tinh/chat-lieu', name: 'ChatLieu', component: ChatLieuPage },
  { path: '/thuoc-tinh/danh-muc', name: 'DanhMuc', component: DanhMucPage }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
