<template>
  <div class="ban-tai-quay-container">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Bán Hàng Tại Quầy"
      page-description="Hệ thống bán hàng trực tiếp cho Shop Giày"
      page-icon="solar:shop-bold-duotone"
      :page-stats="pageStats"
      :actions="breadcrumbActions"
    />

    <!-- Invoice Tabs Section -->
    <div class="invoice-tabs-section">
      <div class="tabs-header">
        <h3 class="tabs-title">
          <iconify-icon icon="solar:document-text-bold-duotone"></iconify-icon>
          Hóa Đơn Đang Xử Lý
        </h3>
        <button class="add-invoice-btn" @click="themHoaDonMoi">
          Tạo Hóa Đơn Mới
        </button>
      </div>
      <div class="invoice-tabs">
        <div 
          v-for="tab in hoaDonTabs" 
          :key="tab.id"
          class="invoice-tab"
          :class="{ active: tabActive === tab.id }"
          @click="chonTab(tab.id)"
        >
          <div class="tab-info">
            <span class="tab-id">{{ tab.id }}</span>
            <span class="tab-items-count">{{ tab.items.length }} SP</span>
          </div>
          <div class="tab-total">{{ formatCurrency(calculateTabTotal(tab)) }}</div>
          <button 
            v-if="hoaDonTabs.length > 1 && tabActive === tab.id"
            class="tab-close-btn"
            @click.stop="showXacNhanXoaModal = true"
          >
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Panel - Cart & Products -->
      <div class="left-panel">
        <!-- Cart Section -->
        <div class="cart-card">
          <div class="card-header">
            <h3 class="card-title">
              <iconify-icon icon="solar:cart-large-2-bold-duotone"></iconify-icon>
              Giỏ Hàng {{ tabActive }}
            </h3>
            <div class="card-actions">
              <button class="action-btn primary" @click="showThemSanPhamModal = true">
                Thêm sản phẩm
              </button>
            </div>
          </div>

          <div class="card-content">
            <div v-if="!currentHoaDon || currentHoaDon.items.length === 0" class="empty-state">
              <iconify-icon icon="solar:cart-large-2-bold-duotone" class="empty-icon"></iconify-icon>
              <h4>Giỏ hàng trống</h4>
              <p>Hãy thêm sản phẩm vào giỏ hàng để bắt đầu tạo hóa đơn</p>
            </div>

            <div v-else class="cart-items">
              <div class="table-container">
                <table class="cart-table">
                  <thead>
                    <tr>
                      <th style="width: 50px;">STT</th>
                      <th>Sản Phẩm</th>
                      <th style="width: 120px;">Đơn Giá</th>
                      <th style="width: 100px;">SL</th>
                      <th style="width: 130px;">Thành Tiền</th>
                      <th style="width: 60px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in currentHoaDon.items" :key="item.id" class="cart-item">
                      <td class="item-stt">{{ index + 1 }}</td>
                      <td class="item-info">
                        <div class="product-info">
                          <div class="product-image">
                            <img :src="item.image" :alt="item.tenSanPham" />
                          </div>
                          <div class="product-details">
                            <span class="product-name">{{ item.tenSanPham }}</span>
                            <span class="product-code">{{ item.maSanPham }}</span>
                          </div>
                        </div>
                      </td>
                      <td class="item-price">{{ formatCurrency(item.giaBan) }}</td>
                      <td class="item-quantity">
                        <div class="quantity-controls">
                          <button @click="giamSoLuong(item)" class="qty-btn minus">
                            <iconify-icon icon="solar:minus-circle-bold"></iconify-icon>
                          </button>
                          <input 
                            type="number" 
                            v-model.number="item.soLuong" 
                            min="1" 
                            :max="item.soLuongTonKho"
                            class="qty-input"
                          />
                          <button @click="tangSoLuong(item)" class="qty-btn plus">
                            <iconify-icon icon="solar:add-circle-bold"></iconify-icon>
                          </button>
                        </div>
                      </td>
                      <td class="item-total">{{ formatCurrency(item.giaBan * item.soLuong) }}</td>
                      <td class="item-actions">
                        <button @click="xoaSanPham(item.id)" class="remove-btn" title="Xóa sản phẩm">
                          <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-item">
            <iconify-icon icon="solar:bag-check-bold-duotone" class="stat-icon"></iconify-icon>
            <div class="stat-info">
              <span class="stat-value">{{ tongSoLuong }}</span>
              <span class="stat-label">Tổng SL</span>
            </div>
          </div>
          <div class="stat-item">
            <iconify-icon icon="solar:box-bold-duotone" class="stat-icon"></iconify-icon>
            <div class="stat-info">
              <span class="stat-value">{{ sanPhamKhacNhau }}</span>
              <span class="stat-label">Loại SP</span>
            </div>
          </div>
          <div class="stat-item">
            <iconify-icon icon="solar:wallet-money-bold-duotone" class="stat-icon"></iconify-icon>
            <div class="stat-info">
              <span class="stat-value">{{ formatCurrency(tongTien) }}</span>
              <span class="stat-label">Tổng Tiền</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Customer & Payment -->
      <div class="right-panel">
        <!-- Customer Info -->
        <div class="customer-card">
          <div class="card-header">
            <h3 class="card-title">
              <iconify-icon icon="solar:user-bold-duotone"></iconify-icon>
              Thông Tin Khách Hàng
            </h3>
          </div>
          <div class="card-content">
            <!-- Delivery Toggle -->
            <div class="delivery-toggle-section">
              <div class="toggle-container">
                <label class="toggle-label">
                  Giao hàng
                </label>
                <div class="toggle-switch" @click="toggleDelivery">
                  <input type="checkbox" v-model="isDelivery" class="toggle-input" />
                  <span class="toggle-slider" :class="{ active: isDelivery }"></span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Tên Khách Hàng</label>
              <input 
                type="text" 
                v-model="khachHangHienTai.ten" 
                class="form-input"
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Số Điện Thoại</label>
              <input 
                type="text" 
                v-model="khachHangHienTai.soDienThoai" 
                class="form-input"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <button class="customer-select-btn" @click="showModal = true">
              Chọn Khách Hàng
            </button>

            <!-- Delivery Information (shown when delivery is enabled) -->
            <div v-if="isDelivery" class="delivery-info-section">
              <div class="delivery-header">
                <h4 class="delivery-title">
                  <iconify-icon icon="solar:map-point-bold-duotone"></iconify-icon>
                  Thông Tin Giao Hàng
                </h4>
              </div>
              
              <div class="address-selection">
                <div class="address-tabs">
                  <button 
                    class="address-tab" 
                    :class="{ active: addressMode === 'select' }"
                    @click="addressMode = 'select'"
                  >
                    Chọn địa chỉ có sẵn
                  </button>
                  <button 
                    class="address-tab" 
                    :class="{ active: addressMode === 'input' }"
                    @click="addressMode = 'input'"
                  >
                    Nhập địa chỉ mới
                  </button>
                </div>

                <!-- Select existing address -->
                <div v-if="addressMode === 'select'" class="address-select-section">
                  <div class="form-group">
                    <label class="form-label">Địa chỉ khách hàng</label>
                    <select v-model="selectedAddress" class="form-select">
                      <option value="">-- Chọn địa chỉ --</option>
                      <option 
                        v-for="address in customerAddresses" 
                        :key="address.id" 
                        :value="address"
                      >
                        {{ address.label }} - {{ address.fullAddress }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Input new address -->
                <div v-if="addressMode === 'input'" class="address-input-section">
                  <div class="form-group">
                    <label class="form-label">Địa chỉ cụ thể</label>
                    <input 
                      type="text" 
                      v-model="deliveryInfo.diaChi" 
                      class="form-input"
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Phường/Xã</label>
                      <input 
                        type="text" 
                        v-model="deliveryInfo.phuongXa" 
                        class="form-input"
                        placeholder="Phường/Xã"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Quận/Huyện</label>
                      <input 
                        type="text" 
                        v-model="deliveryInfo.quanHuyen" 
                        class="form-input"
                        placeholder="Quận/Huyện"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tỉnh/Thành phố</label>
                    <input 
                      type="text" 
                      v-model="deliveryInfo.tinhThanh" 
                      class="form-input"
                      placeholder="Tỉnh/Thành phố"
                    />
                  </div>
                </div>

                <!-- Delivery notes -->
                <div class="form-group">
                  <label class="form-label">Ghi chú giao hàng</label>
                  <textarea 
                    v-model="deliveryInfo.ghiChu" 
                    class="form-textarea"
                    placeholder="Ghi chú cho shipper (tầng, cổng, thời gian giao...)"
                    rows="3"
                  ></textarea>
                </div>

                <!-- Delivery fee info -->
                <div class="delivery-fee-info">
                  <div class="fee-item">
                    <span class="fee-label">Phí giao hàng:</span>
                    <span class="fee-value">{{ formatCurrency(phiGiaoHang) }}</span>
                  </div>
                  <div class="fee-item">
                    <span class="fee-label">Thời gian giao:</span>
                    <span class="fee-value">30-60 phút</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="payment-card">
          <div class="card-header">
            <h3 class="card-title">
              <iconify-icon icon="solar:bill-list-bold-duotone"></iconify-icon>
              Tổng Kết Thanh Toán
            </h3>
          </div>
          <div class="card-content">
            <!-- Discount Code -->
            <div class="discount-section">
              <label class="form-label">Mã Giảm Giá</label>
              <div class="discount-input-group">
                <input 
                  type="text" 
                  v-model="maGiamGia" 
                  class="form-input"
                  placeholder="Nhập mã giảm giá"
                />
                <button class="discount-btn" @click="apDungMaGiamGia">
                  Áp Dụng
                </button>
              </div>
              <div v-if="thongBaoGiamGia" class="discount-message" :class="thongBaoGiamGia.includes('thành công') ? 'success' : 'error'">
                {{ thongBaoGiamGia }}
              </div>
            </div>

            <!-- Payment Summary -->
            <div class="payment-summary">
              <div class="summary-line">
                <span>Tổng tiền hàng:</span>
                <strong>{{ formatCurrency(tongTien) }}</strong>
              </div>
              <div v-if="isDelivery" class="summary-line delivery-line">
                <span>Phí giao hàng:</span>
                <strong class="delivery-amount">+ {{ formatCurrency(phiGiaoHang) }}</strong>
              </div>
              <div class="summary-line discount-line">
                <span>Giảm giá:</span>
                <strong class="discount-amount">- {{ formatCurrency(giamGia) }}</strong>
              </div>
              <div class="summary-line total-line">
                <span>Khách cần trả:</span>
                <strong class="total-amount">{{ formatCurrency(khachCanTra) }}</strong>
              </div>
            </div>

            <!-- Payment Action -->
            <button 
              class="payment-btn" 
              @click="showThanhToanModal = true"
              :disabled="!currentHoaDon || currentHoaDon.items.length === 0"
            >
              Tiến Hành Thanh Toán
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showXacNhanXoaModal" class="modal-overlay" @click="showXacNhanXoaModal = false">
        <div class="modal-container small" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Xác nhận xóa hóa đơn</h3>
          <button class="modal-close" @click="showXacNhanXoaModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <p>Bạn có chắc chắn muốn xóa hóa đơn <strong>{{ tabActive }}</strong> này không?</p>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showXacNhanXoaModal = false">Hủy bỏ</button>
          <button class="btn danger" @click="xoaHoaDon">Xác nhận xóa</button>
        </div>
        </div>
      </div>
    </Teleport>

    <!-- Customer Select Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-container large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:users-group-rounded-bold-duotone"></iconify-icon>
            Chọn Khách Hàng
          </h3>
          <button class="modal-close" @click="showModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <div class="search-section">
            <div class="search-input-group">
              <input 
                type="text" 
                v-model="tuKhoaMaKH" 
                class="search-input"
                placeholder="Tìm theo mã, tên, email, số điện thoại..."
                @keyup.enter="timKhachHangTheoMa"
              />
              <button class="search-btn primary" @click="timKhachHangTheoMa">
                Tìm
              </button>
              <button class="search-btn secondary" @click="tuKhoaMaKH = ''; fetchTatCaKhachHang()">
                Làm mới
              </button>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã KH</th>
                  <th>Tên KH</th>
                  <th>SĐT</th>
                  <th>Ngày Tạo</th>
                  <th>Chọn</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(kh, index) in danhSachKhachHang" :key="kh.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ kh.maKH }}</td>
                  <td>{{ kh.tenKH }}</td>
                  <td>{{ kh.soDT }}</td>
                  <td>{{ formatDate(kh.ngayT) }}</td>
                  <td>
                    <button @click="chonKhachHang(kh)" class="select-btn">
                      <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
                    </button>
                  </td>
                </tr>
                <tr v-if="danhSachKhachHang.length === 0">
                  <td colspan="6" class="empty-message">Không tìm thấy khách hàng nào.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </Teleport>

    <!-- Product Select Modal -->
    <Teleport to="body">
      <div v-if="showThemSanPhamModal" class="modal-overlay" @click="showThemSanPhamModal = false">
        <div class="modal-container large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
            Thêm Sản Phẩm
          </h3>
          <button class="modal-close" @click="showThemSanPhamModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <div class="search-section">
            <div class="search-input-group">
              <input 
                type="text" 
                v-model="tuKhoaSanPham" 
                class="search-input"
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                @keyup.enter="fetchSanPham"
              />
              <button class="search-btn primary" @click="fetchSanPham">
                Tìm
              </button>
              <button class="search-btn secondary" @click="tuKhoaSanPham = ''; fetchSanPham()">
                Làm mới
              </button>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã SP</th>
                  <th>Tên SP</th>
                  <th>Giá Bán</th>
                  <th>Tồn Kho</th>
                  <th>Thêm</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sp, index) in sanPhamLoc" :key="sp.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ sp.maSanPham }}</td>
                  <td>
                    <div class="product-info">
                      <div class="product-image">
                        <img :src="sp.image" :alt="sp.tenSanPham" />
                      </div>
                      <span class="product-name">{{ sp.tenSanPham }}</span>
                    </div>
                  </td>
                  <td class="price">{{ formatCurrency(sp.giaBan) }}</td>
                  <td class="stock" :class="{ 'out-of-stock': sp.soLuongTonKho === 0 }">{{ sp.soLuongTonKho }}</td>
                  <td>
                    <button 
                      @click="themVaoGioHang(sp)" 
                      class="add-btn"
                      :disabled="sp.soLuongTonKho === 0"
                      :title="sp.soLuongTonKho > 0 ? 'Thêm vào giỏ hàng' : 'Sản phẩm đã hết hàng'"
                    >
                      <iconify-icon icon="solar:add-circle-bold"></iconify-icon>
                    </button>
                  </td>
                </tr>
                <tr v-if="sanPhamLoc.length === 0">
                  <td colspan="6" class="empty-message">Không tìm thấy sản phẩm nào.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </Teleport>

    <!-- Payment Modal -->
    <div v-if="showThanhToanModal" class="modal-overlay" @click="showThanhToanModal = false">
      <div class="modal-container medium" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <iconify-icon icon="solar:wallet-bold-duotone"></iconify-icon>
            Thanh Toán Hóa Đơn {{ tabActive }}
          </h3>
          <button class="modal-close" @click="showThanhToanModal = false">
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>
        <div class="modal-content">
          <div class="payment-info">
            <div class="payment-total">
              <span class="label">Tổng tiền khách cần trả:</span>
              <span class="amount">{{ formatCurrency(khachCanTra) }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Số tiền khách đưa:</label>
              <input 
                type="number" 
                v-model="khachThanhToan" 
                class="form-input"
                placeholder="Nhập số tiền khách thanh toán"
              />
            </div>

            <div class="payment-methods">
              <label class="form-label">Phương thức thanh toán:</label>
              <div class="method-buttons">
                <button 
                  class="method-btn"
                  :class="{ active: phuongThucThanhToan === 'TIEN_MAT' }"
                  @click="chonPhuongThuc('TIEN_MAT')"
                >
                  <iconify-icon icon="solar:wallet-money-bold-duotone"></iconify-icon>
                  Tiền mặt
                </button>
                <button 
                  class="method-btn"
                  :class="{ active: phuongThucThanhToan === 'CHUYEN_KHOAN' }"
                  @click="chonPhuongThuc('CHUYEN_KHOAN')"
                >
                  <iconify-icon icon="solar:card-transfer-bold-duotone"></iconify-icon>
                  Chuyển khoản
                </button>
                <button 
                  class="method-btn"
                  :class="{ active: phuongThucThanhToan === 'VNPAY' }"
                  @click="chonPhuongThuc('VNPAY')"
                >
                  <iconify-icon icon="solar:smartphone-2-bold-duotone"></iconify-icon>
                  VNPay
                </button>
              </div>
            </div>

            <div class="payment-calculation">
              <div class="calc-line">
                <span>Khách đã thanh toán:</span>
                <span class="paid">{{ formatCurrency(khachThanhToan) }}</span>
              </div>
              <div class="calc-line">
                <span>Tiền thừa trả khách:</span>
                <span class="change">{{ formatCurrency(tienThua) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showThanhToanModal = false">Hủy</button>
          <button class="btn primary" @click="xacNhanThanhToan">
            <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
            Xác Nhận Thanh Toán
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import Breadcrumb from '@/components/Breadcrumb.vue';

export default {
  name: 'BanTaiQuayModern',
  components: {
    Breadcrumb
  },
  setup() {
    const router = useRouter();
    const toast = useToast();

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Bán hàng', path: '/ban-hang' },
      { label: 'Tại quầy', path: '/ban-tai-quay' }
    ]);

    const breadcrumbActions = ref([
      {
        label: 'Lịch sử bán hàng',
        type: 'default',
        handler: () => router.push('/lich-su-ban-hang')
      },
      {
        label: 'Làm mới',
        type: 'default',
        handler: () => window.location.reload()
      }
    ]);

    const pageStats = ref([
      {
        value: '15',
        label: 'Đơn hàng hôm nay',
        icon: 'solar:bag-check-bold-duotone'
      },
      {
        value: '2.85 triệu VND',
        label: 'Doanh thu hôm nay',
        icon: 'solar:wallet-money-bold-duotone'
      },
      {
        value: '45',
        label: 'Khách đã phục vụ',
        icon: 'solar:users-group-rounded-bold-duotone'
      }
    ]);

    // State management
    const hoaDonTabs = ref([{ 
      id: 'HD000001', 
      items: [], 
      khachHang: { ten: 'Khách lẻ', soDienThoai: '' } 
    }]);
    const tabActive = ref('HD000001');
    
    // Modals
    const showXacNhanXoaModal = ref(false);
    const showModal = ref(false);
    const showThemSanPhamModal = ref(false);
    const showThanhToanModal = ref(false);

    // Search
    const tuKhoaMaKH = ref('');
    const tuKhoaSanPham = ref('');

    // Payment
    const phuongThucThanhToan = ref('TIEN_MAT');
    const maGiamGia = ref('');
    const thongBaoGiamGia = ref('');
    const giamGia = ref(0);
    const khachThanhToan = ref(0);

    // Delivery
    const isDelivery = ref(false);
    const addressMode = ref('select');
    const selectedAddress = ref('');
    const phiGiaoHang = ref(30000); // Default delivery fee
    const deliveryInfo = ref({
      diaChi: '',
      phuongXa: '',
      quanHuyen: '',
      tinhThanh: '',
      ghiChu: ''
    });

    // Sample customer addresses
    const customerAddresses = ref([
      {
        id: 1,
        label: 'Nhà riêng',
        fullAddress: '123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM'
      },
      {
        id: 2,
        label: 'Công ty',
        fullAddress: '456 Lê Văn Sỹ, Phường 12, Quận 3, TP.HCM'
      },
      {
        id: 3,
        label: 'Nhà bạn bè',
        fullAddress: '789 Trần Hưng Đạo, Phường 1, Quận 1, TP.HCM'
      }
    ]);

    // Fake data
    const danhSachKhachHang = ref([
      {
        id: 1,
        maKH: 'KH001',
        tenKH: 'Nguyễn Văn An',
        soDT: '0912345678',
        ngayT: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        maKH: 'KH002',
        tenKH: 'Trần Thị Bình',
        soDT: '0987654321',
        ngayT: '2024-01-14T11:15:00'
      },
      {
        id: 3,
        maKH: 'KH003',
        tenKH: 'Lê Hoài Nam',
        soDT: '0934567890',
        ngayT: '2024-01-13T09:20:00'
      },
      {
        id: 4,
        maKH: 'KH004',
        tenKH: 'Phạm Thu Hương',
        soDT: '0976543210',
        ngayT: '2024-01-12T14:45:00'
      },
      {
        id: 5,
        maKH: 'KH005',
        tenKH: 'Võ Minh Tuấn',
        soDT: '0965432109',
        ngayT: '2024-01-11T16:30:00'
      }
    ]);

    const danhSachSanPham = ref([
      {
        id: 1,
        maSanPham: 'SP001',
        tenSanPham: 'Nike Air Max 270',
        giaBan: 2890000,
        soLuongTonKho: 15,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 2,
        maSanPham: 'SP002',
        tenSanPham: 'Adidas Ultraboost 22',
        giaBan: 3200000,
        soLuongTonKho: 8,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 3,
        maSanPham: 'SP003',
        tenSanPham: 'Converse Chuck Taylor',
        giaBan: 1590000,
        soLuongTonKho: 22,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 4,
        maSanPham: 'SP004',
        tenSanPham: 'Vans Old Skool',
        giaBan: 1890000,
        soLuongTonKho: 0,
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 5,
        maSanPham: 'SP005',
        tenSanPham: 'New Balance 990v5',
        giaBan: 4200000,
        soLuongTonKho: 5,
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 6,
        maSanPham: 'SP006',
        tenSanPham: 'Puma RS-X3',
        giaBan: 2650000,
        soLuongTonKho: 12,
        image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=100&h=100&fit=crop&crop=center'
      }
    ]);

    // Computed properties
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

    const sanPhamLoc = computed(() => {
      if (!tuKhoaSanPham.value.trim()) return danhSachSanPham.value;
      const keyword = tuKhoaSanPham.value.toLowerCase();
      return danhSachSanPham.value.filter(sp =>
        sp.tenSanPham?.toLowerCase().includes(keyword) ||
        sp.maSanPham?.toLowerCase().includes(keyword)
      );
    });

    const tongTien = computed(() => {
      if (!currentHoaDon.value) return 0;
      return currentHoaDon.value.items.reduce((sum, item) => sum + item.soLuong * item.giaBan, 0);
    });

    const khachCanTra = computed(() => {
      const subtotal = tongTien.value + (isDelivery.value ? phiGiaoHang.value : 0);
      return Math.max(0, subtotal - giamGia.value);
    });
    const tienThua = computed(() => Math.max(0, khachThanhToan.value - khachCanTra.value));

    const tongSoLuong = computed(() => {
      if (!currentHoaDon.value) return 0;
      return currentHoaDon.value.items.reduce((sum, item) => sum + item.soLuong, 0);
    });

    const sanPhamKhacNhau = computed(() => {
      return currentHoaDon.value?.items.length || 0;
    });

    // Available discount codes
    const maGiamGiaCoSan = [
      { ma: 'SALE50', loai: 'TIEN_MAT', giaTri: 50000 },
      { ma: 'VIP10', loai: 'PHAN_TRAM', phanTram: 10 },
      { ma: 'VIP20', loai: 'PHAN_TRAM', phanTram: 20 },
      { ma: 'NEWCUSTOMER', loai: 'TIEN_MAT', giaTri: 100000 },
    ];

    // Utility functions
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(value || 0);
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN');
    };

    const calculateTabTotal = (tab) => {
      return tab.items.reduce((sum, item) => sum + item.soLuong * item.giaBan, 0);
    };

    // Tab management
    const chonTab = (id) => {
      tabActive.value = id;
      // Reset payment info when switching tabs
      giamGia.value = 0;
      khachThanhToan.value = 0;
      maGiamGia.value = '';
      thongBaoGiamGia.value = '';
    };

    const themHoaDonMoi = () => {
      // Kiểm tra giới hạn tối đa 5 hóa đơn chờ
      if (hoaDonTabs.value.length >= 5) {
        toast.error('Đã đạt giới hạn tối đa 5 hóa đơn chờ! Vui lòng hoàn thành hoặc xóa hóa đơn cũ trước khi tạo mới.');
        return;
      }

      const newIdNum = hoaDonTabs.value.length + 1;
      const newId = `HD${String(newIdNum).padStart(6, '0')}`;
      hoaDonTabs.value.push({ 
        id: newId, 
        items: [], 
        khachHang: { ten: 'Khách lẻ', soDienThoai: '' } 
      });
      tabActive.value = newId;
      toast.info(`Đã tạo hóa đơn mới: ${newId} (${hoaDonTabs.value.length}/5)`);
    };

    const xoaHoaDon = () => {
      hoaDonTabs.value = hoaDonTabs.value.filter(tab => tab.id !== tabActive.value);
      toast.success(`Đã xóa hóa đơn ${tabActive.value}`);

      if (hoaDonTabs.value.length === 0) {
        themHoaDonMoi();
      } else {
        tabActive.value = hoaDonTabs.value[0].id;
      }
      showXacNhanXoaModal.value = false;
    };

    // Product management
    const themVaoGioHang = (sp) => {
      if (sp.soLuongTonKho === 0) {
        toast.error(`Sản phẩm "${sp.tenSanPham}" đã hết hàng!`);
        return;
      }

      if (!currentHoaDon.value) return;

      const sanPhamTonTai = currentHoaDon.value.items.find(item => item.id === sp.id);
      if (sanPhamTonTai) {
        if (sanPhamTonTai.soLuong < sp.soLuongTonKho) {
          sanPhamTonTai.soLuong += 1;
          toast.info(`Tăng số lượng sản phẩm "${sp.tenSanPham}" lên ${sanPhamTonTai.soLuong}`);
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
          soLuongTonKho: sp.soLuongTonKho,
          image: sp.image
        });
        toast.success(`Đã thêm "${sp.tenSanPham}" vào giỏ hàng`);
      }
      showThemSanPhamModal.value = false;
    };

    const xoaSanPham = (id) => {
      if (!currentHoaDon.value) return;
      const tenSP = currentHoaDon.value.items.find(item => item.id === id)?.tenSanPham;
      currentHoaDon.value.items = currentHoaDon.value.items.filter(item => item.id !== id);
      toast.success(`Đã xóa "${tenSP}" khỏi giỏ hàng`);
    };

    const tangSoLuong = (item) => {
      if (item.soLuong < item.soLuongTonKho) {
        item.soLuong += 1;
      } else {
        toast.warning(`Sản phẩm "${item.tenSanPham}" chỉ còn ${item.soLuongTonKho} trong kho`);
      }
    };

    const giamSoLuong = (item) => {
      if (item.soLuong > 1) {
        item.soLuong -= 1;
      }
    };

    // Customer management
    const chonKhachHang = (khach) => {
      if (currentHoaDon.value) {
        khachHangHienTai.value = {
          ten: khach.tenKH,
          soDienThoai: khach.soDT
        };
        toast.success(`Đã chọn khách hàng: ${khach.tenKH}`);
      }
      showModal.value = false;
    };

    const fetchTatCaKhachHang = () => {
      // In real app, this would be an API call
      // For now, we just use the fake data
    };

    const timKhachHangTheoMa = () => {
      if (!tuKhoaMaKH.value.trim()) {
        return;
      }
      // In real app, this would be an API call
      const keyword = tuKhoaMaKH.value.toLowerCase();
      const filtered = danhSachKhachHang.value.filter(kh =>
        kh.maKH.toLowerCase().includes(keyword) ||
        kh.tenKH.toLowerCase().includes(keyword) ||
        kh.soDT.includes(keyword)
      );
      
      if (filtered.length === 0) {
        toast.info('Không tìm thấy khách hàng nào phù hợp');
      } else {
        toast.success(`Tìm thấy ${filtered.length} khách hàng`);
      }
    };

    const fetchSanPham = () => {
      // In real app, this would be an API call
      // For now, we just use the fake data
    };

    // Discount management
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

    // Delivery management
    const toggleDelivery = () => {
      isDelivery.value = !isDelivery.value;
      if (isDelivery.value) {
        toast.info('Đã bật chế độ giao hàng');
      } else {
        toast.info('Đã tắt chế độ giao hàng');
        // Reset delivery info when disabled
        selectedAddress.value = '';
        deliveryInfo.value = {
          diaChi: '',
          phuongXa: '',
          quanHuyen: '',
          tinhThanh: '',
          ghiChu: ''
        };
      }
    };

    // Payment management
    const chonPhuongThuc = (phuongThuc) => {
      phuongThucThanhToan.value = phuongThuc;
      toast.info(`Đã chọn phương thức thanh toán: ${phuongThuc.replace('_', ' ').toLowerCase()}`);
    };

    const xacNhanThanhToan = () => {
      if (!currentHoaDon.value || currentHoaDon.value.items.length === 0) {
        toast.warning('Giỏ hàng trống! Không thể thanh toán.');
        return;
      }

      if (khachThanhToan.value < khachCanTra.value) {
        toast.error('Số tiền khách đưa không đủ!');
        return;
      }

      // Validate delivery information if delivery is enabled
      if (isDelivery.value) {
        const hasAddress = selectedAddress.value || 
          (deliveryInfo.value.diaChi && deliveryInfo.value.phuongXa && 
           deliveryInfo.value.quanHuyen && deliveryInfo.value.tinhThanh);
        
        if (!hasAddress) {
          toast.error('Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng!');
          return;
        }
      }

      const hoaDonInfo = {
        id: tabActive.value,
        khachHang: khachHangHienTai.value,
        tongTienHang: tongTien.value,
        phiGiaoHang: isDelivery.value ? phiGiaoHang.value : 0,
        giamGia: giamGia.value,
        khachCanTra: khachCanTra.value,
        khachThanhToan: khachThanhToan.value,
        tienThua: tienThua.value,
        phuongThucThanhToan: phuongThucThanhToan.value,
        isDelivery: isDelivery.value,
        deliveryInfo: isDelivery.value ? {
          addressMode: addressMode.value,
          selectedAddress: selectedAddress.value,
          customAddress: deliveryInfo.value,
          ghiChu: deliveryInfo.value.ghiChu
        } : null,
        items: currentHoaDon.value.items
      };

      // In real app, this would save to database
      console.log('Saving invoice:', hoaDonInfo);
      
      toast.success(`Thanh toán hóa đơn ${tabActive.value} thành công!`);
      
      // Remove current tab and create new one if needed
      hoaDonTabs.value = hoaDonTabs.value.filter(tab => tab.id !== tabActive.value);
      if (hoaDonTabs.value.length === 0) {
        themHoaDonMoi();
      } else {
        tabActive.value = hoaDonTabs.value[0].id;
      }
      showThanhToanModal.value = false;
    };

    // Watchers
    watch(showModal, (newVal) => {
      if (newVal) {
        fetchTatCaKhachHang();
        tuKhoaMaKH.value = '';
      }
    });

    watch(showThemSanPhamModal, (val) => {
      if (val) {
        fetchSanPham();
        tuKhoaSanPham.value = '';
      }
    });

    watch(tabActive, () => {
      giamGia.value = 0;
      khachThanhToan.value = 0;
      maGiamGia.value = '';
      thongBaoGiamGia.value = '';
    });

    return {
      // Breadcrumb
      breadcrumbItems,
      breadcrumbActions,
      pageStats,
      
      // State
      hoaDonTabs,
      tabActive,
      currentHoaDon,
      khachHangHienTai,
      
      // Modals
      showXacNhanXoaModal,
      showModal,
      showThemSanPhamModal,
      showThanhToanModal,
      
      // Search
      tuKhoaMaKH,
      tuKhoaSanPham,
      
      // Data
      danhSachKhachHang,
      danhSachSanPham,
      sanPhamLoc,
      
      // Payment
      phuongThucThanhToan,
      maGiamGia,
      thongBaoGiamGia,
      giamGia,
      khachThanhToan,
      tongTien,
      khachCanTra,
      tienThua,
      
      // Delivery
      isDelivery,
      addressMode,
      selectedAddress,
      phiGiaoHang,
      deliveryInfo,
      customerAddresses,
      toggleDelivery,
      
      // Stats
      tongSoLuong,
      sanPhamKhacNhau,
      
      // Methods
      formatCurrency,
      formatDate,
      calculateTabTotal,
      chonTab,
      themHoaDonMoi,
      xoaHoaDon,
      themVaoGioHang,
      xoaSanPham,
      tangSoLuong,
      giamSoLuong,
      chonKhachHang,
      fetchTatCaKhachHang,
      timKhachHangTheoMa,
      fetchSanPham,
      apDungMaGiamGia,
      chonPhuongThuc,
      xacNhanThanhToan
    };
  }
}
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.ban-tai-quay-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== INVOICE TABS SECTION ===== */
.invoice-tabs-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.tabs-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.add-invoice-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.add-invoice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

.invoice-tabs {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.invoice-tab {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  position: relative;
}

.invoice-tab:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.15);
}

.invoice-tab.active {
  border-color: #007bff;
  background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.25);
}

.tab-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tab-id {
  font-weight: 700;
  color: #1a202c;
  font-size: 1.1rem;
}

.tab-items-count {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.invoice-tab.active .tab-items-count {
  background: #007bff;
}

.tab-total {
  font-weight: 700;
  color: #059669;
  font-size: 1.1rem;
  text-align: center;
}

.tab-close-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab-close-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* ===== LEFT PANEL ===== */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cart-card,
.customer-card,
.payment-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 24px 28px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.card-content {
  padding: 24px 28px 28px;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 4rem;
  color: #94a3b8;
  margin-bottom: 16px;
  display: block;
}

.empty-state h4 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
}

.empty-state p {
  color: #94a3b8;
  margin-bottom: 24px;
  font-size: 1rem;
}

.empty-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

/* ===== CART TABLE ===== */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
}

.cart-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.cart-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.cart-item:hover {
  background: #f8fafc;
}

.item-stt {
  text-align: center;
  font-weight: 600;
  color: #64748b;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-weight: 600;
  color: #1a202c;
  font-size: 0.9rem;
}

.product-code {
  font-size: 0.8rem;
  color: #64748b;
}

.item-price {
  font-weight: 600;
  color: #059669;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.qty-btn:hover {
  background: #e2e8f0;
}

.qty-btn.minus:hover {
  background: #fee2e2;
  color: #dc2626;
}

.qty-btn.plus:hover {
  background: #dcfce7;
  color: #16a34a;
}

.qty-input {
  width: 50px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
}

.item-total {
  font-weight: 700;
  color: #1a202c;
}

.remove-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.remove-btn:hover {
  background: #fecaca;
  transform: scale(1.1);
}

/* ===== QUICK STATS ===== */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  color: #007bff;
  opacity: 0.8;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* ===== RIGHT PANEL ===== */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ===== FORM STYLES ===== */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.customer-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* ===== CUSTOMER SELECT BUTTON (CONTINUED) ===== */
.customer-select-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

/* ===== PAYMENT CARD ===== */
.discount-section {
  margin-bottom: 24px;
}

.discount-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.discount-input-group .form-input {
  flex: 1;
  margin-bottom: 0;
}

.discount-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.discount-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.discount-message {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.discount-message.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.discount-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* ===== PAYMENT SUMMARY ===== */
.payment-summary {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.95rem;
}

.summary-line:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

.discount-line {
  color: #dc2626;
}

.discount-amount {
  color: #dc2626 !important;
}

.delivery-line {
  color: #059669;
}

.delivery-amount {
  color: #059669 !important;
}

.total-line {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a202c;
  border-top: 2px solid #007bff !important;
  padding-top: 12px !important;
  margin-top: 8px;
}

.total-amount {
  color: #007bff !important;
  font-size: 1.25rem;
}

.payment-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

.payment-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ===== DELIVERY STYLES ===== */
.delivery-toggle-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.toggle-label iconify-icon {
  font-size: 1.2rem;
  color: #007bff;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-slider.active {
  background-color: #007bff;
}

.toggle-slider.active:before {
  transform: translateX(26px);
}

.delivery-info-section {
  margin-top: 20px;
  padding: 20px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #0ea5e9;
}

.delivery-header {
  margin-bottom: 16px;
}

.delivery-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0c4a6e;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.address-selection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.address-tab {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.address-tab:hover {
  border-color: #007bff;
  color: #007bff;
}

.address-tab.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.delivery-fee-info {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  margin-top: 16px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.fee-item:not(:last-child) {
  border-bottom: 1px solid #f1f5f9;
}

.fee-label {
  font-weight: 500;
  color: #64748b;
}

.fee-value {
  font-weight: 600;
  color: #1a202c;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .address-tabs {
    flex-direction: column;
  }
  
  .toggle-container {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}

/* ===== MODAL STYLES ===== */
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px;
  backdrop-filter: blur(4px) !important;
  z-index: 99999 !important;
}

.modal-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease;
}

.modal-container.small {
  max-width: 450px;
  width: 100%;
}

.modal-container.medium {
  max-width: 600px;
  width: 100%;
}

.modal-container.large {
  max-width: 900px;
  width: 100%;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #374151;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

/* ===== BUTTON STYLES ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

.btn.danger {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
}

.btn.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* ===== SEARCH SECTION ===== */
.search-section {
  margin-bottom: 20px;
}

.search-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-btn.primary {
  background: #007bff;
  color: white;
}

.search-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.search-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.search-btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

/* ===== DATA TABLE ===== */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.select-btn,
.add-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.select-btn {
  background: #dcfce7;
  color: #166534;
}

.select-btn:hover {
  background: #bbf7d0;
  transform: scale(1.1);
}

.add-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.add-btn:hover:not(:disabled) {
  background: #bfdbfe;
  transform: scale(1.1);
}

.add-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.empty-message {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 40px 20px;
}

/* ===== PRODUCT INFO IN TABLE ===== */
.data-table .product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-table .product-image {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.data-table .product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.data-table .product-name {
  font-weight: 600;
  color: #1a202c;
  font-size: 0.9rem;
}

.price {
  font-weight: 600;
  color: #059669;
}

.stock {
  font-weight: 600;
  color: #1a202c;
}

.stock.out-of-stock {
  color: #dc2626;
}

/* ===== PAYMENT MODAL SPECIFIC ===== */
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.payment-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f9ff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 2px solid #0ea5e9;
}

.payment-total .label {
  font-weight: 600;
  color: #0c4a6e;
}

.payment-total .amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0ea5e9;
}

.payment-methods {
  margin: 16px 0;
}

.method-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 120px;
}

.method-btn:hover {
  border-color: #007bff;
  background: #f0f9ff;
}

.method-btn.active {
  border-color: #007bff;
  background: #e6f3ff;
  color: #007bff;
}

.method-btn iconify-icon {
  font-size: 1.5rem;
}

.payment-calculation {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
}

.calc-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.95rem;
}

.calc-line:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

.paid {
  font-weight: 600;
  color: #059669;
}

.change {
  font-weight: 600;
  color: #dc2626;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .invoice-tabs {
    overflow-x: auto;
    padding-bottom: 8px;
  }
  
  .invoice-tabs::-webkit-scrollbar {
    height: 4px;
  }
  
  .invoice-tabs::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 2px;
  }
  
  .invoice-tabs::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ban-tai-quay-container {
    padding: 16px;
  }
  
  .tabs-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .add-invoice-btn {
    width: 100%;
  }
  
  .invoice-tab {
    min-width: 150px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-input-group,
  .discount-input-group {
    flex-direction: column;
  }
  
  .method-buttons {
    flex-direction: column;
  }
  
  .modal-container {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .table-container {
    font-size: 0.85rem;
  }
  
  .cart-table th,
  .cart-table td {
    padding: 8px 6px;
  }
}

@media (max-width: 480px) {
  .product-info {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .quantity-controls {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .qty-input {
    width: 40px;
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

</style>