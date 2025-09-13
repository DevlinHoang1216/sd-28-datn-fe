import { createRouter, createWebHistory } from 'vue-router'

// Main views
import ThongKe from './views/tongKet/ThongKe.vue'
import HoaDon from './views/hoaDon/HoaDon.vue'
import PhieuGiamGia from './views/khuyenMai/phieugiamgia/PhieuGiamGia.vue'
import DotGiamGia from './views/khuyenMai/dotgiamgia/DotGiamGia.vue'
import BanTaiQuay from './views/banHang/BanTaiQuay.vue'
import SanPham from './views/sanPham/SanPham.vue'
import ChiTietSanPham from './views/sanPham/ChiTietSanPham.vue'
import NhanVien from './views/taiKhoan/nhanvien/NhanVien.vue'
import KhachHang from './views/taiKhoan/khachhang/KhachHang.vue'
import HoaDonChiTiet from './views/hoaDon/HoaDonChiTiet.vue'

// Attribute management views
import ThuongHieuPage from './views/thuocTinhSanPham/ThuongHieu.vue'
import MauSacPage from './views/thuocTinhSanPham/MauSac.vue'
import KichCoPage from './views/thuocTinhSanPham/KichCo.vue'
import ChatLieuPage from './views/thuocTinhSanPham/ChatLieu.vue'
import DanhMucPage from './views/thuocTinhSanPham/DanhMuc.vue'
import DeGiayPage from './views/thuocTinhSanPham/DeGiay.vue'

import ThemPhieuGiamGia from './views/khuyenMai/phieugiamgia/ThemPhieuGiamGia.vue'
import EditPhieuGiamGia from './views/khuyenMai/phieugiamgia/EditPhieuGiamGia.vue'
import ThemDotGiamGia from './views/khuyenMai/dotgiamgia/ThemDotGiamGia.vue'
import EditDotGiamGia from './views/khuyenMai/dotgiamgia/EditDotGiamGia.vue'
import ThemNhanVien from './views/taiKhoan/nhanvien/ThemNhanVien.vue'
import EditNhanVien from './views/taiKhoan/nhanvien/EditNhanVien.vue'
import ThemKhachHang from './views/taiKhoan/khachhang/ThemKhachHang.vue'
import EditKhachHang from './views/taiKhoan/khachhang/EditKhachHang.vue'

// Attribute form pages
import ThemSuaChatLieu from './views/thuocTinhSanPham/themVaChinhSuaThuocTinh/ThemSuaChatLieu.vue'
import ThemSuaDanhMuc from './views/thuocTinhSanPham/themVaChinhSuaThuocTinh/ThemSuaDanhMuc.vue'
import ThemSuaMauSac from './views/thuocTinhSanPham/themVaChinhSuaThuocTinh/ThemSuaMauSac.vue'
import ThemSuaKichCo from './views/thuocTinhSanPham/themVaChinhSuaThuocTinh/ThemSuaKichCo.vue'
import ThemSuaThuongHieu from './views/thuocTinhSanPham/themVaChinhSuaThuocTinh/ThemSuaThuongHieu.vue'
import ThemSuaDeGiay from './views/thuocTinhSanPham/themVaChinhSuaThuocTinh/ThemSuaDeGiay.vue'
import ThemSanPham from '@/views/sanPham/ThemSanPham.vue';
import SuaSanPham from '@/views/sanPham/SuaSanPham.vue';
import SuaChiTietSanPham from '@/views/sanPham/SuaChiTietSanPham.vue';

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
    path: '/san-pham/chi-tiet/:id',
    name: 'ChiTietSanPham',
    component: ChiTietSanPham
  },
  {
    path: '/san-pham/them',
    name: 'ThemSanPham',
    component: ThemSanPham
  },
  {
    path: '/san-pham/sua/:id',
    name: 'SuaSanPham',
    component: SuaSanPham
  },
  {
    path: '/san-pham/chi-tiet/sua/:id',
    name: 'SuaChiTietSanPham',
    component: SuaChiTietSanPham
  },

  // Invoice and order management
  { path: '/hoa-don', name: 'HoaDon', component: HoaDon },
  { path: '/hoa-don/chi-tiet/:id', name: 'HoaDonChiTiet', component: HoaDonChiTiet },
  { path: '/phieu-giam-gia', name: 'PhieuGiamGia', component: PhieuGiamGia },
  { path: '/them-phieu-giam-gia', name: 'ThemPhieuGiamGia', component: ThemPhieuGiamGia },
  { path: '/phieu-giam-gia/edit/:id', name: 'EditPhieuGiamGia', component: EditPhieuGiamGia },
  { path: '/dot-giam-gia', name: 'DotGiamGia', component: DotGiamGia },
  { path: '/dot-giam-gia/edit/:id', name: 'EditDotGiamGia', component: EditDotGiamGia },
  { path: '/them-dot-giam-gia', name: 'ThemDotGiamGia', component: ThemDotGiamGia },
  { path: '/ban-tai-quay', name: 'BanTaiQuay', component: BanTaiQuay },

  // User management
  { path: '/nhan-vien', name: 'NhanVien', component: NhanVien },
  { path: '/them-nhan-vien', name: 'ThemNhanVien', component: ThemNhanVien },
  { path: '/nhan-vien/edit/:id', name: 'EditNhanVien', component: EditNhanVien },
  { path: '/khach-hang', name: 'KhachHang', component: KhachHang },
  { path: '/them-khach-hang', name: 'ThemKhachHang', component: ThemKhachHang },
  { path: '/khach-hang/edit/:id', name: 'EditKhachHang', component: EditKhachHang },

  // Attribute management routes
  { path: '/thuoc-tinh/thuong-hieu', name: 'ThuongHieu', component: ThuongHieuPage },
  { path: '/thuoc-tinh/thuong-hieu/them', name: 'ThemThuongHieu', component: ThemSuaThuongHieu },
  { path: '/thuoc-tinh/thuong-hieu/sua/:id', name: 'EditThuongHieu', component: ThemSuaThuongHieu },
  { path: '/thuoc-tinh/mau-sac', name: 'MauSac', component: MauSacPage },
  { path: '/thuoc-tinh/mau-sac/them', name: 'ThemMauSac', component: ThemSuaMauSac },
  { path: '/thuoc-tinh/mau-sac/sua/:id', name: 'EditMauSac', component: ThemSuaMauSac },
  { path: '/thuoc-tinh/kich-co', name: 'KichCo', component: KichCoPage },
  { path: '/thuoc-tinh/kich-co/them', name: 'ThemKichCo', component: ThemSuaKichCo },
  { path: '/thuoc-tinh/kich-co/sua/:id', name: 'EditKichCo', component: ThemSuaKichCo },
  { path: '/thuoc-tinh/chat-lieu', name: 'ChatLieu', component: ChatLieuPage },
  { path: '/thuoc-tinh/chat-lieu/them', name: 'ThemChatLieu', component: ThemSuaChatLieu },
  { path: '/thuoc-tinh/chat-lieu/sua/:id', name: 'EditChatLieu', component: ThemSuaChatLieu },
  { path: '/thuoc-tinh/danh-muc', name: 'DanhMuc', component: DanhMucPage },
  { path: '/thuoc-tinh/danh-muc/them', name: 'ThemDanhMuc', component: ThemSuaDanhMuc },
  { path: '/thuoc-tinh/danh-muc/sua/:id', name: 'EditDanhMuc', component: ThemSuaDanhMuc },
  { path: '/thuoc-tinh/de-giay', name: 'DeGiay', component: DeGiayPage },
  { path: '/thuoc-tinh/de-giay/them', name: 'ThemDeGiay', component: ThemSuaDeGiay },
  { path: '/thuoc-tinh/de-giay/sua/:id', name: 'EditDeGiay', component: ThemSuaDeGiay }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
