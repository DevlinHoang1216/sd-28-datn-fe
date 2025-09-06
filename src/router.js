import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import HoaDon from './views/HoaDon.vue';
import PhieuGiamGia from './views/PhieuGiamGia.vue';
import DotGiamGia from './views/DotGiamGia.vue';
import BanTaiQuay from './views/BanTaiQuay.vue';
import QuanLySanPham from './views/QuanLySanPham.vue';
import NhanVien from './views/NhanVien.vue';
import KhachHang from './views/KhachHang.vue';
import InvoiceDetail from './views/InvoiceDetail.vue';

// Import các component mới cho các trang thuộc tính
import HangPage from './views/attributes/Hang.vue';
import MauSacPage from './views/attributes/MauSac.vue';
import KichCoPage from './views/attributes/KichCo.vue';
import ChatLieuPage from './views/attributes/ChatLieu.vue';
import DanhMucPage from './views/attributes/DanhMuc.vue';


const routes = [
  { path: '/', name: 'Home', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  {
    path: '/quan-ly-san-pham',
    name: 'QuanLySanPham',
    component: QuanLySanPham,
  },
  {
    path: '/quan-ly-san-pham/chi-tiet-san-pham', // Thêm tham số động ':id'
    name: 'San Pham Chi Tiet',
    component: () => import('@/views/products-manager/Products-Detail.vue'),
  },
  {
    path: '/quan-ly-san-pham/them-san-pham',
    name: 'Them San Pham',
    component: () => import('@/views/products-manager/AddProductForm.vue'),
  },
  { path: '/hoa-don', name: 'HoaDon', component: HoaDon },
  { path: '/hoa-don/detail/:id', name: 'InvoiceDetail', component: InvoiceDetail },
  { path: '/phieu-giam-gia', name: 'PhieuGiamGia', component: PhieuGiamGia },
  { path: '/dot-giam-gia', name: 'DotGiamGia', component: DotGiamGia },
  { path: '/ban-tai-quay', name: 'BanTaiQuay', component: BanTaiQuay },
  { path: '/nhan-vien', name: 'NhanVien', component: NhanVien },
  { path: '/khach-hang', name: 'KhachHang', component: KhachHang },

  // Thêm các route cho các trang thuộc tính
  { path: '/thuoc-tinh/hang', name: 'Hang', component: HangPage },
  { path: '/thuoc-tinh/mau-sac', name: 'MauSac', component: MauSacPage },
  { path: '/thuoc-tinh/kich-co', name: 'KichCo', component: KichCoPage },
  { path: '/thuoc-tinh/chat-lieu', name: 'ChatLieu', component: ChatLieuPage },
  { path: '/thuoc-tinh/danh-muc', name: 'DanhMuc', component: DanhMucPage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
