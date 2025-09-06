<template>
  <div class="ban-tai-quay-wrapper">
    <h4 class="page-title">Bán Hàng Tại Quầy <i class="cil-cash"></i></h4>

    <CRow class="g-4">
      <CCol lg="7">
        <div class="d-flex flex-wrap gap-2 mb-4 align-items-center bill-tabs-section">
          <label class="form-label mb-0 me-2 text-muted fw-semibold">Hóa đơn:</label>
          <template v-for="tab in hoaDonTabs" :key="tab.id">
            <CButton
              class="tab-button d-flex align-items-center gap-2"
              :class="{ 'tab-active': tabActive === tab.id }"
              @click="chonTab(tab.id)"
            >
              <span>{{ tab.id }}</span>
              <span class="badge ms-1" :class="tabActive === tab.id ? 'bg-white text-primary' : 'bg-primary-dark'">{{ tab.items.length }}</span>
              <CButton
                v-if="tabActive === tab.id && hoaDonTabs.length > 1"
                color="danger"
                size="sm"
                class="btn-close-tab p-0"
                @click.stop="showXacNhanXoaModal = true"
                title="Xóa hóa đơn hiện tại"
              >
                <CIcon name="cil-x" />
              </CButton>
            </CButton>
          </template>
          <CButton color="success" class="add-tab-button" @click="themHoaDonMoi" title="Thêm hóa đơn mới">
            <CIcon name="cil-plus" />
          </CButton>
        </div>

        <CCard class="shadow-sm mb-4 card-custom">
          <CCardBody>
            <h5 class="card-section-title">Giỏ hàng (<span class="text-primary">{{ tabActive }}</span>) <i class="cil-shopping-cart"></i></h5>
            <div v-if="!currentHoaDon || currentHoaDon.items.length === 0" class="empty-cart-state text-center py-5">
              <CIcon name="cil-cart" size="custom-size" style="width: 50px; height: 50px; color: #6c757d;" class="mb-3"/>
              <p class="text-muted">Chưa có sản phẩm nào trong giỏ hàng. <br> Hãy thêm sản phẩm ngay!</p>
              <CButton color="primary" @click="showThemSanPhamModal = true">
                <CIcon name="cil-plus" class="me-1"/> Thêm sản phẩm
              </CButton>
            </div>
            <div v-else class="table-responsive styled-scrollbar">
              <CTable hover striped class="product-table">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell style="width: 40px;">STT</CTableHeaderCell>
                    <CTableHeaderCell>Sản phẩm</CTableHeaderCell>
                    <CTableHeaderCell style="width: 120px;">Giá</CTableHeaderCell>
                    <CTableHeaderCell style="width: 100px;">Số lượng</CTableHeaderCell>
                    <CTableHeaderCell style="width: 140px;">Thành tiền</CTableHeaderCell>
                    <CTableHeaderCell style="width: 60px;">Xóa</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="(item, index) in currentHoaDon.items" :key="item.id">
                    <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                    <CTableDataCell>
                      <div class="product-info-cell">
                        <strong class="text-dark">{{ item.tenSanPham }}</strong>
                        <small class="text-muted d-block">Mã: {{ item.maSanPham }}</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell class="text-nowrap text-success fw-bold">{{ item.giaBan.toLocaleString() }} đ</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput type="number" v-model.number="item.soLuong" min="1" class="text-center quantity-input" />
                    </CTableDataCell>
                    <CTableDataCell class="text-nowrap fw-bold text-primary">{{ (item.giaBan * item.soLuong).toLocaleString() }} đ</CTableDataCell>
                    <CTableDataCell class="text-center">
                      <CButton color="danger" size="sm" @click="xoaSanPham(item.id)" title="Xóa sản phẩm">
                        <CIcon name="cil-trash" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>

        <div class="d-flex justify-content-end mb-4">
          <CButton color="info" @click="showThemSanPhamModal = true">
            <CIcon name="cil-search" class="me-1"/> Tìm & Thêm sản phẩm
          </CButton>
        </div>
      </CCol>

      <CCol lg="5">
        <CCard class="shadow-sm mb-4 card-custom">
          <CCardBody>
            <h5 class="card-section-title">Thông tin khách hàng <i class="cil-user"></i></h5>
            <div class="mb-3">
              <CFormLabel>Tên khách hàng:</CFormLabel>
              <CFormInput v-model="khachHangHienTai.ten" placeholder="Nhập họ và tên" />
            </div>
            <div class="mb-3">
              <CFormLabel>Số điện thoại:</CFormLabel>
              <CFormInput v-model="khachHangHienTai.soDienThoai" placeholder="Nhập số điện thoại" />
            </div>
            <CButton color="dark" variant="outline" class="w-100 btn-select-customer" @click="showModal = true">
              <CIcon name="cil-address-book" class="me-1"/> Chọn khách hàng có sẵn
            </CButton>
          </CCardBody>
        </CCard>

        <CCard class="shadow-sm card-custom">
          <CCardBody>
            <h5 class="card-section-title">Tổng kết đơn hàng <i class="cil-clipboard"></i></h5>

            <div class="input-group mb-3 promo-code-input-group">
              <CFormInput v-model="maGiamGia" placeholder="Mã giảm giá" />
              <CButton color="warning" @click="apDungMaGiamGia">
                <CIcon name="cil-tags" class="me-1"/> Áp dụng
              </CButton>
            </div>
            <div v-if="thongBaoGiamGia" :class="thongBaoGiamGia.includes('thành công') ? 'text-success' : 'text-danger'" class="mb-3 text-small promo-message">
              {{ thongBaoGiamGia }}
            </div>

            <hr class="my-3 divider" />

            <div class="summary-row">
              <span>Tổng tiền hàng:</span>
              <strong>{{ tongTien.toLocaleString() }} đ</strong>
            </div>
            <div class="summary-row">
              <span>Giảm giá:</span>
              <strong class="text-success">- {{ giamGia.toLocaleString() }} đ</strong>
            </div>

            <div class="summary-row total-amount mt-3">
              <span>Khách cần trả:</span>
              <strong class="text-danger">{{ khachCanTra.toLocaleString() }} đ</strong>
            </div>

            <div class="d-grid mt-4">
              <CButton color="primary" size="lg" class="btn-checkout" @click="showThanhToanModal = true">
                <CIcon name="cil-check-circle" class="me-2"/> TIẾN HÀNH THANH TOÁN
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CModal :visible="showXacNhanXoaModal" @close="showXacNhanXoaModal = false" backdrop="static" size="sm">
      <CModalHeader>
        <CModalTitle>Xác nhận xóa hóa đơn</CModalTitle>
      </CModalHeader>
      <CModalBody>
        Bạn có chắc chắn muốn xóa hóa đơn <strong class="text-danger">{{ tabActive }}</strong> này không?
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showXacNhanXoaModal = false">
          Hủy bỏ
        </CButton>
        <CButton color="danger" @click="xoaHoaDon">
          Xác nhận xóa
        </CButton>
      </CModalFooter>
    </CModal>
    
    <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg" class="custom-modal">
      <CModalHeader class="modal-header-custom">
        <CModalTitle>Chọn Khách Hàng <i class="cil-user-plus"></i></CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div class="d-flex mb-3 align-items-center modal-search-bar">
          <CFormInput
            type="text"
            v-model="tuKhoaMaKH"
            placeholder="Tìm theo mã, tên, email, số điện thoại..."
            class="me-2 search-input"
            @keyup.enter="timKhachHangTheoMa"
          />
          <CButton color="primary" @click="timKhachHangTheoMa">
            <CIcon name="cil-search" class="me-1"/> Tìm
          </CButton>
          <CButton color="secondary" class="ms-2" @click="tuKhoaSanPham = ''; fetchSanPham();">
            <CIcon name="cil-sync" /> Làm mới
          </CButton>
        </div>
        <div class="modal-table-container styled-scrollbar">
          <CTable bordered hover responsive class="modal-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style="width: 50px;">STT</CTableHeaderCell>
                <CTableHeaderCell>Mã KH</CTableHeaderCell>
                <CTableHeaderCell>Tên KH</CTableHeaderCell>
                <CTableHeaderCell>SĐT</CTableHeaderCell>
                <CTableHeaderCell>Ngày Tạo</CTableHeaderCell>
                <CTableHeaderCell style="width: 80px;">Chọn</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(kh, index) in danhSachKhachHang" :key="kh.id">
                <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                <CTableDataCell>{{ kh.maKH }}</CTableDataCell>
                <CTableDataCell>{{ kh.tenKH }}</CTableDataCell>
                <CTableDataCell>{{ kh.soDT }}</CTableDataCell>
                <CTableDataCell>{{ formatDate(kh.ngayT) }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButton @click="chonKhachHang(kh)" color="info" size="sm" title="Chọn khách hàng này">
                    <CIcon name="cil-check"/>
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="danhSachKhachHang.length === 0">
                <CTableDataCell colspan="6" class="text-center text-muted py-3">Không tìm thấy khách hàng nào.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showModal = false">
          <CIcon name="cil-x" class="me-1"/> Đóng
        </CButton>
      </CModalFooter>
    </CModal>

    <CModal :visible="showThemSanPhamModal" @close="showThemSanPhamModal = false" backdrop="static" size="lg" class="custom-modal">
      <CModalHeader class="modal-header-custom">
        <CModalTitle>Thêm Sản Phẩm vào Giỏ <i class="cil-basket"></i></CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div class="d-flex mb-3 align-items-center modal-search-bar">
          <CFormInput
            v-model="tuKhoaSanPham"
            type="text"
            placeholder="Tìm theo tên hoặc mã sản phẩm..."
            class="me-2 search-input"
            @keyup.enter="fetchSanPham"
          />
          <CButton color="primary" @click="fetchSanPham">
            <CIcon name="cil-search" class="me-1"/> Tìm
          </CButton>
          <CButton color="secondary" class="ms-2" @click="tuKhoaSanPham = ''; fetchSanPham();">
            <CIcon name="cil-sync" class="me-1"/> Làm mới
          </CButton>
        </div>
        <div class="modal-table-container styled-scrollbar">
          <CTable bordered hover responsive class="modal-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style="width: 40px;">STT</CTableHeaderCell>
                <CTableHeaderCell>Mã SP</CTableHeaderCell>
                <CTableHeaderCell>Tên SP</CTableHeaderCell>
                <CTableHeaderCell style="width: 120px;">Giá bán</CTableHeaderCell>
                <CTableHeaderCell style="width: 90px;">Tồn kho</CTableHeaderCell>
                <CTableHeaderCell style="width: 70px;">Thêm</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(sp, index) in sanPhamLoc" :key="sp.id">
                <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                <CTableDataCell>{{ sp.maSanPham }}</CTableDataCell>
                <CTableDataCell>{{ sp.tenSanPham }}</CTableDataCell>
                <CTableDataCell class="text-success fw-bold">{{ sp.giaBan?.toLocaleString() }} đ</CTableDataCell>
                <CTableDataCell :class="{'text-danger fw-bold': sp.soLuongTonKho === 0}">{{ sp.soLuongTonKho }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButton 
                    :color="sp.soLuongTonKho > 0 ? 'success' : 'secondary'" 
                    size="sm" 
                    @click="themVaoGioHang(sp)" 
                    :title="sp.soLuongTonKho > 0 ? 'Thêm vào giỏ hàng' : 'Sản phẩm đã hết hàng'"
                  >
                    <CIcon name="cil-plus"/>
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="sanPhamLoc.length === 0">
                <CTableDataCell colspan="6" class="text-center text-muted py-3">Không tìm thấy sản phẩm nào.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showThemSanPhamModal = false">
          <CIcon name="cil-x" class="me-1"/> Đóng
        </CButton>
      </CModalFooter>
    </CModal>

    <CModal :visible="showThanhToanModal" @close="showThanhToanModal = false" backdrop="static" size="md" class="custom-modal">
      <CModalHeader class="modal-header-custom">
        <CModalTitle>Thanh Toán Hóa Đơn <span class="text-primary">{{ tabActive }}</span> <i class="cil-wallet"></i></CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div class="summary-line mb-3 border-bottom pb-2">
          <span class="text-muted fs-6">Tổng tiền khách cần trả:</span>
          <span class="display-6 text-danger fw-bold">{{ khachCanTra.toLocaleString() }} đ</span>
        </div>

        <div class="mb-3">
          <CFormLabel><CIcon name="cil-money" class="me-1"/> Số tiền khách đưa:</CFormLabel>
          <CFormInput type="number" v-model="khachThanhToan" placeholder="Nhập số tiền khách thanh toán" />
        </div>

        <div class="mb-4">
          <CFormLabel><CIcon name="cil-credit-card" class="me-1"/> Phương thức thanh toán:</CFormLabel>
          <div class="d-flex gap-2 payment-method-buttons">
            <CButton
              :color="phuongThucThanhToan === 'TIEN_MAT' ? 'primary' : 'light'"
              @click="chonPhuongThuc('TIEN_MAT')"
              class="flex-grow-1"
            >
              <CIcon name="cil-cash" class="me-1"/> Tiền mặt
            </CButton>
            <CButton
              :color="phuongThucThanhToan === 'CHUYEN_KHOAN' ? 'primary' : 'light'"
              @click="chonPhuongThuc('CHUYEN_KHOAN')"
              class="flex-grow-1"
            >
              <CIcon name="cil-bank" class="me-1"/> Chuyển khoản
            </CButton>
            <CButton
              :color="phuongThucThanhToan === 'VNPAY' ? 'primary' : 'light'"
              @click="chonPhuongThuc('VNPAY')"
              class="flex-grow-1"
            >
              <CIcon name="cil-mobile" class="me-1"/> Ví VNPAY
            </CButton>
          </div>
        </div>

        <hr class="my-3 divider" />

        <div class="summary-line mb-2">
          <span class="text-muted">Khách đã thanh toán:</span>
          <span class="fs-5 text-primary fw-bold">{{ khachThanhToan.toLocaleString() }} đ</span>
        </div>
        <div class="summary-line mb-4">
          <span class="text-muted">Tiền thừa trả khách:</span>
          <span class="fs-5 text-success fw-bold">{{ tienThua.toLocaleString() }} đ</span>
        </div>
      </CModalBody>
      <CModalFooter class="modal-footer-custom">
        <CButton color="secondary" @click="showThanhToanModal = false">
          <CIcon name="cil-x" class="me-1"/> Hủy
        </CButton>
        <CButton color="primary" @click="xacNhanThanhToan">
          <CIcon name="cil-check" class="me-1"/> Xác Nhận Thanh Toán
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { createInvoice } from '@/services/api';
import emitter from '@/eventBus';
import {
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormLabel,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/vue';
import CIcon from '@coreui/icons-vue';

// --- Khởi tạo Router và Toast ---
const router = useRouter();
const toast = useToast();

// --- Dữ liệu và State quản lý UI ---
const danhSachKhachHang = ref([]);
const showModal = ref(false);
const tuKhoaMaKH = ref('');

const danhSachSanPham = ref([]);
const showThemSanPhamModal = ref(false);
const tuKhoaSanPham = ref('');

const showThanhToanModal = ref(false);
const phuongThucThanhToan = ref('TIEN_MAT');

const maGiamGia = ref('');
const thongBaoGiamGia = ref('');

const hoaDonTabs = ref([{ id: 'HD000001', items: [], khachHang: { ten: '', soDienThoai: '' } }]);
const tabActive = ref('HD000001');
const showXacNhanXoaModal = ref(false);

// Dữ liệu khách hàng và thông tin hóa đơn cho tab hiện tại
const currentHoaDon = computed(() => {
  return hoaDonTabs.value.find(tab => tab.id === tabActive.value);
});

const khachHangHienTai = computed({
  get: () => currentHoaDon.value?.khachHang || { ten: '', soDienThoai: '' },
  set: (val) => {
    if (currentHoaDon.value) {
      currentHoaDon.value.khachHang = val;
    }
  }
});

// Tổng tiền, giảm giá, khách thanh toán
const tongTien = computed(() => {
  if (!currentHoaDon.value) return 0;
  return currentHoaDon.value.items.reduce((sum, item) => sum + item.soLuong * item.giaBan, 0);
});

const giamGia = ref(0);
const khachThanhToan = ref(0);

const khachCanTra = computed(() => Math.max(0, tongTien.value - giamGia.value));
const tienThua = computed(() => Math.max(0, khachThanhToan.value - khachCanTra.value));

// --- Computed Properties & Watchers ---
const sanPhamLoc = computed(() => {
  if (!tuKhoaSanPham.value.trim()) return danhSachSanPham.value;
  const keyword = tuKhoaSanPham.value.toLowerCase();
  return danhSachSanPham.value.filter(sp =>
    sp.tenSanPham?.toLowerCase().includes(keyword) ||
    sp.maSanPham?.toLowerCase().includes(keyword)
  );
});

watch(showModal, async (newVal) => {
  if (newVal) {
    await fetchTatCaKhachHang();
    tuKhoaMaKH.value = '';
  }
});

watch(showThemSanPhamModal, async (val) => {
  if (val) {
    await fetchSanPham();
    tuKhoaSanPham.value = '';
  }
});

// Reset các giá trị khi chuyển tab
watch(tabActive, () => {
  giamGia.value = 0;
  khachThanhToan.value = 0;
  maGiamGia.value = '';
  thongBaoGiamGia.value = '';
});

// --- Hàm xử lý Logic ---
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

const maGiamGiaCoSan = [
  { ma: 'SALE50', loai: 'TIEN_MAT', giaTri: 50000 },
  { ma: 'VIP10', loai: 'PHAN_TRAM', phanTram: 10 },
  { ma: 'VIP20', loai: 'PHAN_TRAM', phanTram: 20 },
];

const apDungMaGiamGia = () => {
  if (!currentHoaDon.value || currentHoaDon.value.items.length === 0) {
    giamGia.value = 0;
    thongBaoGiamGia.value = 'Giỏ hàng trống! Vui lòng thêm sản phẩm.';
    toast.warning('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi áp dụng mã giảm giá.');
    return;
  }

  const ma = maGiamGia.value.trim().toUpperCase();
  const giam = maGiamGiaCoSan.find(m => m.ma === ma);

  if (!giam) {
    giamGia.value = 0;
    thongBaoGiamGia.value = 'Mã giảm giá không hợp lệ!';
    toast.error('Mã giảm giá không hợp lệ!');
    return;
  }

  if (giam.loai === 'TIEN_MAT') {
    giamGia.value = giam.giaTri;
  } else if (giam.loai === 'PHAN_TRAM') {
    giamGia.value = Math.floor(tongTien.value * giam.phanTram / 100);
  }

  thongBaoGiamGia.value = `Đã áp dụng mã ${giam.ma} thành công!`;
  toast.success(`Đã áp dụng mã ${giam.ma} thành công!`);
};

const fetchSanPham = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/s-p/hien-thi');
    danhSachSanPham.value = response.data;
    toast.success('Tải danh sách sản phẩm thành công!');
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm:', error);
    toast.error('Lỗi khi tải danh sách sản phẩm.');
  }
};

const fetchTatCaKhachHang = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/ctspkhang/hien-thi');
    danhSachKhachHang.value = response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API khách hàng:', error);
    toast.error('Lỗi khi tải danh sách khách hàng.');
  }
};

const timKhachHangTheoMa = async () => {
  if (!tuKhoaMaKH.value.trim()) {
    await fetchTatCaKhachHang();
    return;
  }
  try {
    const response = await axios.get(`http://localhost:8080/api/ctspkhang/search/${tuKhoaMaKH.value.trim()}`);
    danhSachKhachHang.value = response.data;
    if (danhSachKhachHang.value.length === 0) {
      toast.info('Không tìm thấy khách hàng nào phù hợp.');
    } else {
      toast.success(`Tìm thấy ${danhSachKhachHang.value.length} khách hàng.`);
    }
  } catch (error) {
    console.error('Lỗi tìm khách hàng:', error);
    danhSachKhachHang.value = [];
    toast.error('Đã xảy ra lỗi khi tìm kiếm khách hàng.');
  }
};

const themVaoGioHang = (sp) => {
  // Thay đổi ở đây: Giữ lại logic kiểm tra tồn kho nhưng không vô hiệu hóa nút
  if (sp.soLuongTonKho === 0) {
    toast.error(`Sản phẩm "${sp.tenSanPham}" đã hết hàng!`);
    return;
  }

  if (!currentHoaDon.value) return;

  const sanPhamTonTai = currentHoaDon.value.items.find(item => item.id === sp.id);
  if (sanPhamTonTai) {
    // Kiểm tra để không thêm vượt quá số lượng tồn kho
    if (sanPhamTonTai.soLuong < sp.soLuongTonKho) {
      sanPhamTonTai.soLuong += 1;
      toast.info(`Tăng số lượng sản phẩm "${sp.tenSanPham}" lên 1. Tổng: ${sanPhamTonTai.soLuong}`);
    } else {
      toast.warning(`Sản phẩm "${sp.tenSanPham}" chỉ còn ${sp.soLuongTonKho} trong kho.`);
    }
  } else {
    currentHoaDon.value.items.push({
      id: sp.id,
      maSanPham: sp.maSanPham,
      tenSanPham: sp.tenSanPham,
      giaBan: sp.giaBan,
      soLuong: 1,
      soLuongTonKho: sp.soLuongTonKho, // Lấy tồn kho hiện tại để kiểm tra sau
    });
    toast.success(`Đã thêm "${sp.tenSanPham}" vào giỏ hàng.`);
  }
  showThemSanPhamModal.value = false;
};

const xoaSanPham = (id) => {
  if (!currentHoaDon.value) return;
  const tenSP = currentHoaDon.value.items.find(item => item.id === id)?.tenSanPham;
  currentHoaDon.value.items = currentHoaDon.value.items.filter(item => item.id !== id);
  toast.success(`Đã xóa "${tenSP}" khỏi giỏ hàng.`);
};

const chonKhachHang = (khach) => {
  if (currentHoaDon.value) {
    khachHangHienTai.value = {
      ten: khach.tenKH,
      soDienThoai: khach.soDT
    };
    toast.success(`Đã chọn khách hàng: ${khach.tenKH}.`);
  }
  showModal.value = false;
};

const chonPhuongThuc = (phuongThuc) => {
  phuongThucThanhToan.value = phuongThuc;
  toast.info(`Đã chọn phương thức thanh toán: ${phuongThuc}`);
};

const chonTab = (id) => {
  tabActive.value = id;
};

const themHoaDonMoi = () => {
  const newIdNum = hoaDonTabs.value.length + 1;
  const newId = `HD${String(newIdNum).padStart(6, '0')}`;
  hoaDonTabs.value.push({ id: newId, items: [], khachHang: { ten: '', soDienThoai: '' } });
  tabActive.value = newId;
  toast.info(`Đã tạo hóa đơn mới: ${newId}.`);
};

// Hàm mới để xóa hóa đơn
const xoaHoaDon = () => {
  hoaDonTabs.value = hoaDonTabs.value.filter(tab => tab.id !== tabActive.value);
  toast.success(`Đã xóa hóa đơn ${tabActive.value}.`);

  if (hoaDonTabs.value.length === 0) {
    themHoaDonMoi();
  } else {
    tabActive.value = hoaDonTabs.value[0].id;
  }
  showXacNhanXoaModal.value = false;
};

const xacNhanThanhToan = async () => {
  if (!currentHoaDon.value || currentHoaDon.value.items.length === 0) {
    toast.warning('Giỏ hàng trống! Không thể thanh toán.');
    return;
  }

  if (khachThanhToan.value < khachCanTra.value) {
    toast.error('Số tiền khách đưa không đủ!');
    return;
  }

  const hoaDonInfo = {
    id: tabActive.value,
    khachHang: khachHangHienTai.value,
    tongTienHang: tongTien.value,
    giamGia: giamGia.value,
    khachCanTra: khachCanTra.value,
    khachThanhToan: khachThanhToan.value,
    tienThua: tienThua.value,
    phuongThucThanhToan: phuongThucThanhToan.value,
    items: currentHoaDon.value.items
  };

  try {
    const response = await axios.post('http://localhost:8080/api/hoa-don/tao', hoaDonInfo);
    toast.success(`Thanh toán hóa đơn ${tabActive.value} thành công!`);
    
    emitter.emit('invoiceCreated');

    router.push({ name: 'HoaDon', query: { maHoaDon: tabActive.value } });

  } catch (error) {
    console.error('Lỗi khi lưu hóa đơn:', error);
    toast.error(`Lỗi khi lưu hóa đơn: ${error.response?.data?.message || error.message}`);
    return;
  }

  hoaDonTabs.value = hoaDonTabs.value.filter(tab => tab.id !== tabActive.value);
  if (hoaDonTabs.value.length === 0) {
    themHoaDonMoi();
  } else {
    tabActive.value = hoaDonTabs.value[0].id;
  }
  showThanhToanModal.value = false;
};
</script>


<style scoped>
/* Toàn bộ CSS từ phiên bản 3.0 giữ nguyên */
/* Chỉ đảm bảo rằng icon cil-plus đã được CoreUI Icons hỗ trợ */
/* Base Styles */
.ban-tai-quay-wrapper {
  padding: 30px;
  background-color: #f8f9fa; /* Light background */
  min-height: 100vh;
  font-family: 'Inter', sans-serif; /* Modern font */
  color: #343a40; /* Darker text for readability */
}

.page-title {
  color: #212529; /* Deep black for titles */
  font-weight: 700;
  margin-bottom: 30px;
  border-bottom: 1px solid #dee2e6; /* Lighter border */
  padding-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-title i {
  color: #007bff; /* Primary color icon */
}

/* Card Customization */
.card-custom {
  border-radius: 12px;
  border: none;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); /* Stronger shadow */
  transition: transform 0.2s ease;
}

.card-custom:hover {
  transform: translateY(-3px); /* Slight lift on hover */
}

.card-section-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0; /* Very light border */
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-section-title i {
  color: #6c757d; /* Muted icon color */
}

/* Tab Buttons */
.bill-tabs-section .form-label {
  font-size: 0.95em;
}

.tab-button {
  background-color: #e9f5ff; /* Lighter primary blue */
  color: #007bff;
  border: 1px solid #cceeff;
  border-radius: 8px;
  padding: 8px 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 130px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.tab-button:hover {
  background-color: #d1ecff;
  border-color: #a7d9ff;
  transform: translateY(-2px);
}

.tab-button.tab-active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
  transform: translateY(-2px);
}

.tab-button .badge {
  background-color: #007bff;
  color: white;
  min-width: 20px;
  padding: 5px 8px;
  border-radius: 10px;
  font-size: 0.8em;
  font-weight: 600;
}

.tab-button.tab-active .badge {
  background-color: white !important;
  color: #007bff !important;
}

.bg-primary-dark {
    background-color: #0056b3 !important;
    color: white !important;
}

.add-tab-button {
  border-radius: 8px;
  padding: 8px 15px;
  min-width: unset;
  box-shadow: 0 2px 5px rgba(40, 167, 69, 0.2);
  transition: all 0.3s ease;
}
.add-tab-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

/* Empty Cart State */
.empty-cart-state img {
  width: 180px;
  opacity: 0.6;
  filter: grayscale(10%);
}

.empty-cart-state p {
  color: #777;
  font-size: 1.05em;
  margin-bottom: 25px;
}

/* Product Table in Cart */
.product-table th {
  background-color: #f2f4f6; /* Lighter header background */
  color: #555;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
}

.product-table td {
  vertical-align: middle;
  padding: 12px 10px; /* More padding */
}

.product-info-cell strong {
  font-weight: 600;
}

.product-info-cell small {
  font-size: 0.8em;
  color: #888;
}

.quantity-input {
    max-width: 80px;
    margin: 0 auto;
    border-radius: 6px;
    padding: 6px;
    font-size: 0.9em;
}

/* Form Inputs and Buttons */
.form-label {
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
  font-size: 0.9em;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 10px 12px;
  font-size: 0.95em;
  transition: all 0.2s ease;
}
.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}

.btn {
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex; /* Allow icon next to text */
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.btn i {
    font-size: 1.1em;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}
.btn-primary:hover {
  background-color: #0069d9;
  border-color: #0062cc;
  box-shadow: 0 3px 8px rgba(0, 105, 217, 0.2);
}

.btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
}
.btn-info:hover {
  background-color: #138496;
  border-color: #117a8b;
  box-shadow: 0 3px 8px rgba(23, 162, 184, 0.2);
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #333;
}
.btn-warning:hover {
  background-color: #e0a800;
  border-color: #cc9900;
  box-shadow: 0 3px 8px rgba(255, 193, 7, 0.2);
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}
.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
  box-shadow: 0 3px 8px rgba(40, 167, 69, 0.2);
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}
.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
  box-shadow: 0 3px 8px rgba(108, 117, 125, 0.2);
}

.btn-dark.btn-outline {
    border-color: #343a40;
    color: #343a40;
}
.btn-dark.btn-outline:hover {
    background-color: #343a40;
    color: white;
}

.btn-checkout {
    font-size: 1.3em;
    padding: 15px 20px;
    font-weight: 600;
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
}
.btn-checkout:hover {
    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
    transform: translateY(-2px);
}

/* Summary Rows */
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #e9ecef; /* Lighter dashed line */
  font-size: 1.05em;
  align-items: center;
}

.summary-row:last-of-type {
  border-bottom: none;
}

.summary-row strong {
    font-weight: 700;
}

.total-amount {
  font-size: 1.4em;
  padding-top: 15px;
  border-top: 2px solid #e0e0e0; /* Stronger separation */
  margin-top: 15px;
}
.total-amount span {
    font-weight: 600;
    color: #495057;
}

.promo-code-input-group .form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
.promo-code-input-group .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
.promo-message {
    font-weight: 500;
}

/* Custom Modal Styles */
.custom-modal .modal-content {
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  animation: fadeInModal 0.3s ease-out; /* Fade in animation */
}

@keyframes fadeInModal {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

.modal-header-custom {
  background-color: #f7f9fa; /* Very light blue-gray */
  border-bottom: 1px solid #e9ecef;
  padding: 18px 25px;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-custom .modal-title {
  color: #343a40;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-header-custom .modal-title i {
    color: #007bff;
    font-size: 1.2em;
}

.custom-modal .modal-body {
  padding: 25px;
}

.custom-modal .modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 18px 25px;
  justify-content: flex-end;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.modal-search-bar .search-input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
.modal-search-bar .btn {
    border-radius: 8px; /* Reset individual button radius */
}


.modal-table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.modal-table {
  margin-bottom: 0;
}

.modal-table thead th {
  position: sticky;
  top: 0;
  background-color: #f2f4f6;
  z-index: 1;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
}

.modal-table tbody tr:hover {
    background-color: #f0f8ff; /* Light blue on hover for table rows */
}

/* Payment Modal Specifics */
.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.summary-line:first-child {
  padding-top: 0;
}

.payment-method-buttons .btn {
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}
.payment-method-buttons .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.payment-method-buttons .btn.btn-light {
    background-color: #f2f4f6;
    border-color: #e0e0e0;
    color: #495057;
}
.payment-method-buttons .btn.btn-light:hover {
    background-color: #e9ecef;
    border-color: #dee2e6;
}

/* Custom Scrollbar */
.styled-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.styled-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.styled-scrollbar::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border-radius: 10px;
}

.styled-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
}
</style>