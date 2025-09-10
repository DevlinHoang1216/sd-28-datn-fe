import { createRouter, createWebHistory } from 'vue-router'

// Main views
import ThongKe from './views/tongKet/ThongKe.vue'
import HoaDon from './views/hoaDon/HoaDon.vue'
import PhieuGiamGia from './views/khuyenMai/PhieuGiamGia.vue'
import DotGiamGia from './views/khuyenMai/DotGiamGia.vue'
import BanTaiQuay from './views/banHang/BanTaiQuay.vue'
import SanPham from './views/sanPham/SanPham.vue'
import NhanVien from './views/taiKhoan/NhanVien.vue'
import KhachHang from './views/taiKhoan/KhachHang.vue'
import HoaDonChiTiet from './views/hoaDon/HoaDonChiTiet.vue'

// Attribute management views
import HangPage from './views/thuocTinhSanPham/Hang.vue'
import MauSacPage from './views/thuocTinhSanPham/MauSac.vue'
import KichCoPage from './views/thuocTinhSanPham/KichCo.vue'
import ChatLieuPage from './views/thuocTinhSanPham/ChatLieu.vue'
import DanhMucPage from './views/thuocTinhSanPham/DanhMuc.vue'
import ThemPhieuGiamGia from './views/phieugiamgia/ThemPhieuGiamGia.vue'
import ThemDotGiamGia from './views/DotGiamGia/ThemDotGiamGia.vue'
import EditDotGiamGia from './views/DotGiamGia/EditDotGiamGia.vue'

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
  { path: '/them-phieu-giam-gia', name: 'ThemPhieuGiamGia', component: ThemPhieuGiamGia },
  { path: '/dot-giam-gia', name: 'DotGiamGia', component: DotGiamGia },
  { path: '/edit-dot-giam-gia', name: 'EditDotGiamGia', component: EditDotGiamGia },
  { path: '/them-dot-giam-gia', name: 'ThemDotGiamGia', component: ThemDotGiamGia },
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
  history: createWebHistory(),
  routes
})

export default router
