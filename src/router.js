import { createRouter, createWebHashHistory } from 'vue-router'

// Main views
import ThongKe from './views/ThongKe.vue'
import HoaDon from './views/HoaDon.vue'
import PhieuGiamGia from './views/PhieuGiamGia.vue'
import DotGiamGia from './views/DotGiamGia.vue'
import BanTaiQuay from './views/BanTaiQuay.vue'
import SanPham from './views/SanPham.vue'
import NhanVien from './views/NhanVien.vue'
import KhachHang from './views/KhachHang.vue'
import HoaDonChiTiet from './views/HoaDonChiTiet.vue'

// Attribute management views
import HangPage from './views/attributes/Hang.vue'
import MauSacPage from './views/attributes/MauSac.vue'
import KichCoPage from './views/attributes/KichCo.vue'
import ChatLieuPage from './views/attributes/ChatLieu.vue'
import DanhMucPage from './views/attributes/DanhMuc.vue'


const routes = [
  // Main routes
  { path: '/', name: 'Home', redirect: '/thong-ke' },
  { path: '/thong-ke', name: 'ThongKe', component: ThongKe },
  
  // Product management routes
  {
    path: '/san-pham',
    name: 'SanPham',
    component: SanPham
  },
  {
    path: '/san-pham/chi-tiet-san-pham',
    name: 'SanPhamChiTiet',
    component: () => import('./views/products-manager/Products-Detail.vue')
  },
  {
    path: '/san-pham/them-san-pham',
    name: 'ThemSanPham',
    component: () => import('./views/products-manager/AddProductForm.vue')
  },

  // Invoice and order management
  { path: '/hoa-don', name: 'HoaDon', component: HoaDon },
  { path: '/hoa-don/chi-tiet/:id', name: 'HoaDonChiTiet', component: HoaDonChiTiet },
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
