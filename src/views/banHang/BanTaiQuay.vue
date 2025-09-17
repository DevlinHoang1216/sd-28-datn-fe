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
            <span class="tab-id">{{ tab.ma }}</span>
            <span class="tab-items-count">{{ tab.items.length }} SP</span>
          </div>
          <div class="tab-total">{{ formatCurrency(calculateTabTotal(tab)) }}</div>
          <button 
            v-if="tabActive === tab.id"
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
              Giỏ Hàng {{ currentHoaDon?.ma || tabActive }}
            </h3>
            <div class="card-actions">
              <button class="action-btn primary" @click="showThemSanPhamModal = true">
                Thêm sản phẩm
              </button>
              <button class="action-btn secondary qr-scanner-btn" @click="openQRScanner">
                Quét QR
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
                        <div class="quantity-controls" :class="{ 'has-inline-modal': showInlineQuantityModal && selectedInlineItem?.id === item.id }">
                          <button @click="giamSoLuong(item)" class="qty-btn minus">
                            <iconify-icon icon="solar:minus-circle-bold"></iconify-icon>
                          </button>
                          <div 
                            class="qty-display"
                            @click="openInlineQuantityModal(item, $event)"
                            title="Click để nhập số lượng tùy chỉnh"
                          >
                            {{ item.soLuong }}
                          </div>
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

            <div class="customer-actions">
              <button class="customer-select-btn" @click="openCustomerModal">
                Chọn Khách Hàng
              </button>
              <button 
                v-if="khachHangHienTai.id && khachHangHienTai.id !== 1" 
                class="customer-remove-btn" 
                @click="xoaKhachHang"
                title="Xóa khách hàng (chuyển về khách lẻ)"
              >
                Xóa
              </button>
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
              <label class="form-label">Phiếu Giảm Giá</label>
              <div class="selected-voucher" v-if="selectedVoucher">
                <div class="voucher-info">
                  <span class="voucher-code">{{ selectedVoucher.ma }}</span>
                  <span class="voucher-name">{{ selectedVoucher.tenPhieuGiamGia }}</span>
                  <span class="voucher-discount">
                    {{ getVoucherDiscountText(selectedVoucher) }}
                  </span>
                </div>
                <button class="remove-voucher-btn" @click="removeVoucher">
                  <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
                </button>
              </div>
              <button v-else class="select-voucher-btn" @click="showVoucherModal = true">
                Chọn phiếu giảm giá
              </button>
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
              <div class="summary-line discount-line">
                <span>Giảm giá:</span>
                <strong class="discount-amount">- {{ formatCurrency(giamGia) }}</strong>
              </div>
              <div class="summary-line total-line">
                <span>Khách cần trả:</span>
                <strong class="total-amount" style="color: #059669; font-size: 1.3rem;">{{ formatCurrency(khachCanTra) }}</strong>
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

    <!-- Voucher Selection Modal -->
    <Teleport to="body">
      <div v-if="showVoucherModal" class="modal-overlay" @click="showVoucherModal = false">
        <div class="modal-container voucher-modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">
              <iconify-icon icon="solar:ticket-bold-duotone"></iconify-icon>
              Chọn Phiếu Giảm Giá
            </h3>
            <button class="modal-close" @click="showVoucherModal = false">
              <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
            </button>
          </div>
          <div class="modal-content">
            <div v-if="isLoadingVouchers" class="loading-state">
              <iconify-icon icon="solar:refresh-circle-bold-duotone" class="loading-icon"></iconify-icon>
              <p>Đang tải phiếu giảm giá...</p>
            </div>
            <div v-else-if="availableVouchers.length === 0" class="empty-vouchers">
              <iconify-icon icon="solar:ticket-sale-bold-duotone" class="empty-icon"></iconify-icon>
              <p>Không có phiếu giảm giá khả dụng</p>
            </div>
            <div v-else class="vouchers-list">
              <div 
                v-for="voucher in availableVouchers" 
                :key="voucher.id"
                class="voucher-item"
                :class="{ 
                  'selected': selectedVoucher?.id === voucher.id,
                  'disabled': !isVoucherApplicable(voucher)
                }"
                @click="selectVoucher(voucher)"
              >
                <div class="voucher-left">
                  <div class="voucher-header">
                    <span class="voucher-code">{{ voucher.ma }}</span>
                    <span v-if="voucher.riengTu" class="voucher-badge personal">Cá nhân</span>
                    <span v-else class="voucher-badge public">Công khai</span>
                  </div>
                  <div class="voucher-name">{{ voucher.tenPhieuGiamGia }}</div>
                  <div class="voucher-details">
                    <span class="voucher-discount">
                      {{ getVoucherDiscountText(voucher) }}
                    </span>
                    <span v-if="voucher.hoaDonToiThieu" class="voucher-condition">
                      Đơn tối thiểu: {{ formatCurrency(voucher.hoaDonToiThieu) }}
                    </span>
                  </div>
                  <div class="voucher-validity">
                    <iconify-icon icon="solar:calendar-bold"></iconify-icon>
                    HSD: {{ formatDate(voucher.ngayKetThuc) }}
                  </div>
                  <div v-if="voucher.moTa" class="voucher-description">{{ voucher.moTa }}</div>
                </div>
                <div class="voucher-right">
                  <button 
                    v-if="isVoucherApplicable(voucher)"
                    class="apply-btn"
                    :class="{ 'applied': selectedVoucher?.id === voucher.id }"
                  >
                    {{ selectedVoucher?.id === voucher.id ? 'Đã chọn' : 'Áp dụng' }}
                  </button>
                  <div v-else class="not-applicable">
                    <iconify-icon icon="solar:info-circle-bold"></iconify-icon>
                    <span>{{ getVoucherError(voucher) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
          <p>Bạn có chắc chắn muốn xóa hóa đơn <strong>{{ currentHoaDon?.ma || tabActive }}</strong> này không?</p>
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
              <button class="search-btn primary" @click="showQuickCreateForm = true">
                Thêm nhanh
              </button>
              <button class="search-btn secondary" @click="tuKhoaMaKH = ''; fetchTatCaKhachHang()">
                Làm mới
              </button>
            </div>
          </div>

          <!-- Quick Create Customer Form -->
          <div v-if="showQuickCreateForm" class="quick-create-form">
            <div class="form-header">
              <h4>Thêm khách hàng nhanh</h4>
              <button class="close-form-btn" @click="cancelQuickCreate">
                <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
              </button>
            </div>
            <div class="form-content">
              <div class="form-group">
                <label>Tên khách hàng *</label>
                <input 
                  type="text" 
                  v-model="quickCreateForm.ten" 
                  class="form-input"
                  placeholder="Nhập tên khách hàng"
                  @keyup.enter="submitQuickCreate"
                />
              </div>
              <div class="form-group">
                <label>Số điện thoại *</label>
                <input 
                  type="tel" 
                  v-model="quickCreateForm.soDienThoai" 
                  class="form-input"
                  placeholder="Nhập số điện thoại"
                  @keyup.enter="submitQuickCreate"
                />
              </div>
              <div class="form-actions">
                <button class="btn-cancel" @click="cancelQuickCreate">Hủy</button>
                <button class="btn-submit" @click="submitQuickCreate" :disabled="isCreatingCustomer">
                  <iconify-icon v-if="isCreatingCustomer" icon="solar:loading-bold" class="loading-icon"></iconify-icon>
                  {{ isCreatingCustomer ? 'Đang thêm...' : 'Thêm khách hàng' }}
                </button>
              </div>
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
                  <th>Chọn</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingKhachHang">
                  <td colspan="5" class="loading-message">
                    <iconify-icon icon="solar:loading-bold" class="loading-icon"></iconify-icon>
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
                <tr v-else-if="danhSachKhachHang.length === 0">
                  <td colspan="5" class="empty-message">Không tìm thấy khách hàng nào.</td>
                </tr>
                <tr v-else v-for="(kh, index) in danhSachKhachHang" :key="kh.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ kh.maKH }}</td>
                  <td>{{ kh.tenKH }}</td>
                  <td>{{ kh.soDT }}</td>
                  <td>
                    <button @click="chonKhachHang(kh)" class="select-btn">
                      <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
                    </button>
                  </td>
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
                  <th>Kích Cỡ</th>
                  <th>Màu Sắc</th>
                  <th>Giá Bán</th>
                  <th>Tồn Kho</th>
                  <th>Thêm</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingSanPham">
                  <td colspan="8" class="loading-message">
                    <iconify-icon icon="solar:loading-bold" class="loading-icon"></iconify-icon>
                    Đang tải sản phẩm...
                  </td>
                </tr>
                <tr v-else-if="sanPhamLoc.length === 0">
                  <td colspan="8" class="empty-message">Không tìm thấy sản phẩm nào.</td>
                </tr>
                <tr v-else v-for="(sp, index) in sanPhamLoc" :key="sp.id">
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
                  <td class="size">
                    <span class="size-badge">{{ sp.tenKichCo || 'N/A' }}</span>
                  </td>
                  <td class="color">
                    <div class="color-info">
                      <div 
                        class="color-swatch" 
                        :style="{ backgroundColor: sp.hexMauSac || '#ccc' }"
                        :title="sp.tenMauSac || 'N/A'"
                      ></div>
                      <span class="color-name">{{ sp.tenMauSac || 'N/A' }}</span>
                    </div>
                  </td>
                  <td class="price">
                    <div v-if="sp.giaGiamGia" class="price-container">
                      <div class="discount-info">
                        <span class="discounted-price">{{ formatCurrency(sp.giaGiamGia) }}</span>
                        <span class="original-price">{{ formatCurrency(sp.giaBan) }}</span>
                        <div v-if="sp.tenDotGiamGia" class="campaign-name">
                          <iconify-icon icon="solar:tag-bold-duotone"></iconify-icon>
                          {{ sp.tenDotGiamGia }}
                        </div>
                      </div>
                    </div>
                    <span v-else class="regular-price">{{ formatCurrency(sp.giaBan) }}</span>
                  </td>
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
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </Teleport>

    <!-- Payment Modal -->
    <Teleport to="body">
      <div v-if="showThanhToanModal" class="modal-overlay" @click="showThanhToanModal = false">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Thanh Toán</h3>
            <button class="modal-close" @click="showThanhToanModal = false">×</button>
          </div>
          
          <div class="modal-content">
            <!-- Tổng tiền -->
            <div class="payment-total-card">
              <div class="total-icon">
                <iconify-icon icon="solar:wallet-money-bold-duotone"></iconify-icon>
              </div>
              <div class="total-info">
                <span class="total-label">Tổng cần thanh toán</span>
                <div class="total-amount">{{ formatCurrency(khachCanTra) }}</div>
              </div>
            </div>

            <!-- Phương thức thanh toán -->
            <div class="payment-methods-section">
              <h4 class="section-title">
                <iconify-icon icon="solar:card-bold-duotone"></iconify-icon>
                Chọn phương thức thanh toán
              </h4>
              <div class="payment-methods-grid">
                <div 
                  class="payment-method-card"
                  :class="{ active: phuongThucThanhToan === 'Tiền mặt' }"
                  @click="chonPhuongThuc('Tiền mặt')"
                >
                  <div class="method-icon">
                    <iconify-icon icon="solar:wallet-money-bold"></iconify-icon>
                  </div>
                  <div class="method-content">
                    <h4>Tiền mặt</h4>
                    <p>Thanh toán trực tiếp</p>
                  </div>
                  <div class="method-check">
                    <iconify-icon icon="solar:check-circle-bold" v-if="phuongThucThanhToan === 'Tiền mặt'"></iconify-icon>
                  </div>
                </div>
                
                <div 
                  class="payment-method-card"
                  :class="{ active: phuongThucThanhToan === 'VnPay' }"
                  @click="chonPhuongThuc('VnPay')"
                >
                  <div class="method-icon vnpay">
                    <img src="@/assets/images/Icon-VNPAY-QR.webp" alt="VNPay" class="vnpay-logo" />
                  </div>
                  <div class="method-content">
                    <h4>VNPay</h4>
                    <p>Thanh toán online</p>
                  </div>
                  <div class="method-check">
                    <iconify-icon icon="solar:check-circle-bold" v-if="phuongThucThanhToan === 'VnPay'"></iconify-icon>
                  </div>
                </div>
                
                <div 
                  class="payment-method-card"
                  :class="{ active: phuongThucThanhToan === 'Cả 2' }"
                  @click="chonPhuongThuc('Cả 2')"
                >
                  <div class="method-icon combined">
                    <iconify-icon icon="solar:wallet-2-bold"></iconify-icon>
                  </div>
                  <div class="method-content">
                    <h4>Kết hợp</h4>
                    <p>Tiền mặt + VNPay</p>
                  </div>
                  <div class="method-check">
                    <iconify-icon icon="solar:check-circle-bold" v-if="phuongThucThanhToan === 'Cả 2'"></iconify-icon>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input tiền mặt -->
            <div v-if="phuongThucThanhToan === 'Tiền mặt'" class="payment-input-section">
              <div class="input-card">
                <div class="input-header">

                  <span>Tiền khách đưa</span>
                </div>
                <input 
                  type="text" 
                  v-model="khachThanhToanFormatted" 
                  class="payment-input"
                  placeholder="Nhập số tiền khách đưa"
                  @input="updateKhachThanhToan"
                  @blur="formatKhachThanhToanInput"
                />
                <div v-if="tienThua > 0" class="change-display">
                  <div class="change-icon">
                    <iconify-icon icon="solar:arrow-left-up-bold-duotone"></iconify-icon>
                  </div>
                  <div class="change-info">
                    <span class="change-label">Tiền thừa trả khách</span>
                    <div class="change-amount">{{ formatCurrency(tienThua) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input kết hợp -->
            <div v-if="phuongThucThanhToan === 'Cả 2'" class="combined-payment-section">
              <div class="combined-inputs">
                <div class="input-card">
                  <div class="input-header">
                    <iconify-icon icon="solar:wallet-money-bold-duotone"></iconify-icon>
                    <span>Tiền mặt</span>
                  </div>
                  <input 
                    type="text" 
                    v-model="tienMatFormatted" 
                    class="payment-input"
                    placeholder="Nhập số tiền mặt"
                    @input="updateTienMat"
                    @blur="formatTienMatInput"
                  />
                </div>
                
                <div class="plus-divider">
                  <iconify-icon icon="solar:add-circle-bold-duotone"></iconify-icon>
                </div>
                
                <div class="input-card">
                  <div class="input-header">
                    <iconify-icon icon="solar:smartphone-2-bold-duotone"></iconify-icon>
                    <span>VNPay</span>
                  </div>
                  <input 
                    type="text" 
                    :value="formatCurrency(tienVNPay)" 
                    class="payment-input readonly"
                    placeholder="Tự động tính"
                    readonly
                  />
                </div>
              </div>
              
              <div class="total-summary">
                <div class="summary-row">
                  <span>Tổng thanh toán:</span>
                  <strong>{{ formatCurrency((tienMat || 0) + (tienVNPay || 0)) }}</strong>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn secondary" @click="showThanhToanModal = false">Hủy</button>
            <button class="btn primary" @click="xacNhanThanhToan" :disabled="!isPaymentValid">
              Xác Nhận
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Quantity Modal -->
    <Teleport to="body">
      <div v-if="showQuantityModal" class="modal-overlay" @click="showQuantityModal = false">
        <div class="modal-container small" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Nhập Số Lượng</h3>
            <button class="modal-close" @click="showQuantityModal = false">×</button>
          </div>
          
          <div class="modal-content">
            <div class="quantity-modal-content">
              <div class="product-info-modal">
                <div class="product-image-small">
                  <img :src="selectedQuantityItem?.image" :alt="selectedQuantityItem?.tenSanPham" />
                </div>
                <div class="product-details-modal">
                  <h4>{{ selectedQuantityItem?.tenSanPham }}</h4>
                  <p>{{ selectedQuantityItem?.maSanPham }}</p>
                  <p class="stock-info">Có thể đặt tối đa: <strong>{{ selectedQuantityItem ? selectedQuantityItem.soLuongTonKho + selectedQuantityItem.soLuong : 0 }}</strong> sản phẩm</p>
                </div>
              </div>
              
              <div class="quantity-input-section">
                <label class="input-label">Số lượng mong muốn</label>
                <div class="quantity-input-group">
                  <button 
                    @click="decreaseModalQuantity" 
                    class="qty-modal-btn minus"
                    :disabled="modalQuantity <= 1"
                  >
                    <iconify-icon icon="solar:minus-circle-bold"></iconify-icon>
                  </button>
                  <input 
                    type="number" 
                    v-model.number="modalQuantity" 
                    class="qty-modal-input"
                    min="1" 
                    :max="selectedQuantityItem ? selectedQuantityItem.soLuongTonKho + selectedQuantityItem.soLuong : 0"
                    @input="validateModalQuantity"
                  />
                  <button 
                    @click="increaseModalQuantity" 
                    class="qty-modal-btn plus"
                    :disabled="modalQuantity >= (selectedQuantityItem ? selectedQuantityItem.soLuongTonKho + selectedQuantityItem.soLuong : 0)"
                  >
                    <iconify-icon icon="solar:add-circle-bold"></iconify-icon>
                  </button>
                </div>
                <div class="quantity-range-info">
                  <span>Từ 1 đến {{ selectedQuantityItem ? selectedQuantityItem.soLuongTonKho + selectedQuantityItem.soLuong : 0 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn secondary" @click="showQuantityModal = false">Hủy</button>
            <button class="btn primary" @click="confirmQuantityChange">Xác nhận</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Inline Quantity Modal -->
    <Teleport to="body">
      <div v-if="showInlineQuantityModal" class="inline-modal-overlay" @click="closeInlineQuantityModal">
        <div 
          class="inline-quantity-modal-teleport"
          :style="{ top: modalPosition.top + 'px', left: modalPosition.left + 'px' }"
          @click.stop
        >
          <div class="inline-modal-content">
            <div class="inline-modal-header">
              <span>Nhập số lượng</span>
              <button @click="closeInlineQuantityModal" class="inline-close-btn">×</button>
            </div>
            <div class="inline-input-group">
              <input 
                ref="inlineQuantityInput"
                type="number" 
                v-model.number="inlineQuantity" 
                class="inline-qty-input"
                min="1" 
                :max="selectedInlineItem ? selectedInlineItem.soLuongTonKho + selectedInlineItem.soLuong : 0"
                @keydown.enter="confirmInlineQuantity"
                @keydown.escape="closeInlineQuantityModal"
                @input="validateInlineQuantity(selectedInlineItem)"
              />
              <div class="inline-actions">
                <button @click="confirmInlineQuantity" class="inline-btn confirm">✓</button>
                <button @click="closeInlineQuantityModal" class="inline-btn cancel">✕</button>
              </div>
            </div>
            <div class="inline-range-info">
              Max: {{ selectedInlineItem ? selectedInlineItem.soLuongTonKho + selectedInlineItem.soLuong : 0 }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- QR Scanner Modal -->
    <Teleport to="body">
      <div v-if="showQRScannerModal" class="modal-overlay qr-scanner-overlay" @click="closeQRScanner">
        <div class="modal-container qr-scanner-modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">
              <iconify-icon icon="solar:qr-code-bold"></iconify-icon>
              Quét Mã QR Sản Phẩm
            </h3>
            <button class="modal-close" @click="closeQRScanner">
              <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
            </button>
          </div>
          <div class="modal-content">
            <div class="qr-scanner-container">
              <div v-if="!cameraStarted" class="scanner-placeholder">
                <iconify-icon icon="solar:camera-bold-duotone" class="camera-icon"></iconify-icon>
                <p>Nhấn "Bắt đầu quét" để mở camera</p>
                <button class="btn primary" @click="startCamera">
                  <iconify-icon icon="solar:camera-bold"></iconify-icon>
                  Bắt đầu quét
                </button>
              </div>
              <div v-else class="scanner-active">
                <video ref="videoElement" class="scanner-video" autoplay playsinline></video>
                <canvas ref="canvasElement" class="scanner-canvas" style="display: none;"></canvas>
                <div class="scanner-overlay">
                  <div class="scan-frame"></div>
                  <p class="scan-instruction">Đưa mã QR vào khung để quét</p>
                </div>
                <div class="scanner-controls">
                  <button class="btn secondary" @click="stopCamera">
                    <iconify-icon icon="solar:stop-bold"></iconify-icon>
                    Dừng quét
                  </button>
                  <button class="btn primary" @click="captureQR">
                    <iconify-icon icon="solar:camera-bold"></iconify-icon>
                    Chụp QR
                  </button>
                </div>
              </div>
              <div v-if="scanResult" class="scan-result">
                <div class="result-success">
                  <iconify-icon icon="solar:check-circle-bold" class="success-icon"></iconify-icon>
                  <p>Đã quét thành công!</p>
                  <p class="result-text">{{ scanResult }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Breadcrumb from '@/components/Breadcrumb.vue';
import productAPI from '@/services/api/productAPI';
import invoiceAPI from '@/services/api/invoiceAPI';
import cartAPI from '@/services/api/cartAPI';
import voucherAPI from '@/services/api/voucherAPI';
import jsQR from 'jsqr';

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
        handler: () => router.push('/hoa-don')
      },
      {
        label: 'Làm mới',
        type: 'default',
        handler: () => window.location.reload()
      }
    ]);

    const pageStats = ref([
      {
        value: '0',
        label: 'Số lượng hóa đơn chờ',
        icon: 'solar:bag-check-bold-duotone'
      },
      {
        value: '0',
        label: 'Số lượng chi tiết sản phẩm',
        icon: 'solar:box-bold-duotone'
      }
    ]);

    // State management
    const hoaDonTabs = ref([]);
    const tabActive = ref(null);
    const isLoadingInvoices = ref(false);
    
    // Modals
    const showXacNhanXoaModal = ref(false);
    const showModal = ref(false);
    const showThemSanPhamModal = ref(false);
    const showThanhToanModal = ref(false);
    const showQuantityModal = ref(false);
    const showQRScannerModal = ref(false);
    
    // QR Scanner state
    const cameraStarted = ref(false);
    const scanResult = ref('');
    const videoElement = ref(null);
    const canvasElement = ref(null);
    const qrScanner = ref(null);
    
    // Quantity modal state
    const selectedQuantityItem = ref(null);
    const modalQuantity = ref(1);
    
    // Inline quantity modal state
    const showInlineQuantityModal = ref(false);
    const selectedInlineItem = ref(null);
    const inlineQuantity = ref(1);
    const modalPosition = ref({ top: 0, left: 0 });
    
    // Quick create customer
    const showQuickCreateForm = ref(false);
    const isCreatingCustomer = ref(false);
    const quickCreateForm = ref({
      ten: '',
      soDienThoai: ''
    });

    // Search
    const tuKhoaMaKH = ref('');
    const tuKhoaSanPham = ref('');

    // Payment
    const phuongThucThanhToan = ref('Tiền mặt');
    const maGiamGia = ref('');
    const thongBaoGiamGia = ref('');
    const giamGia = ref(0);
    const khachThanhToan = ref(0);
    const tienMat = ref(0);
    const tienVNPay = ref(0);
    
    // Formatted currency inputs
    const khachThanhToanFormatted = ref('');
    const tienMatFormatted = ref('');
    
    // Voucher management
    const showVoucherModal = ref(false);
    const selectedVoucher = ref(null);
    const availableVouchers = ref([]);
    const isLoadingVouchers = ref(false);


    // Customer data - loaded from API
    const danhSachKhachHang = ref([]);
    const isLoadingKhachHang = ref(false);
    const khachHangPagination = ref({
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 10
    });

    // Product data - loaded from API
    const danhSachSanPham = ref([]);
    const isLoadingSanPham = ref(false);

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
      // Since we're now filtering on the server side, just return the data
      return danhSachSanPham.value;
    });

    const tongTien = computed(() => {
      if (!currentHoaDon.value) return 0;
      return currentHoaDon.value.items.reduce((sum, item) => sum + item.soLuong * item.giaBan, 0);
    });

    const khachCanTra = computed(() => {
      return Math.max(0, tongTien.value - giamGia.value);
    });
    const tienThua = computed(() => Math.max(0, khachThanhToan.value - khachCanTra.value));

    const tongSoLuong = computed(() => {
      if (!currentHoaDon.value) return 0;
      return currentHoaDon.value.items.reduce((sum, item) => sum + item.soLuong, 0);
    });

    const sanPhamKhacNhau = computed(() => {
      return currentHoaDon.value?.items.length || 0;
    });

    const isPaymentValid = computed(() => {
      if (!currentHoaDon.value || currentHoaDon.value.items.length === 0) return false;
      
      if (phuongThucThanhToan.value === 'Tiền mặt') {
        return khachThanhToan.value >= khachCanTra.value;
      }
      
      if (phuongThucThanhToan.value === 'Cả 2') {
        const totalPaid = (parseFloat(tienMat.value) || 0) + (parseFloat(tienVNPay.value) || 0);
        return totalPaid >= khachCanTra.value && tienMat.value > 0 && tienVNPay.value > 0;
      }
      
      return true; // For VNPAY, validation happens on backend
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

    // Load customer information for selected invoice
    const loadCustomerForInvoice = async (invoiceId) => {
      try {
        // Get invoice details to load customer info
        const response = await invoiceAPI.getInvoiceById(invoiceId);
        const invoice = response.data;
        
        if (invoice && invoice.khachHang) {
          // Update customer info in current tab
          const currentTab = hoaDonTabs.value.find(tab => tab.id === invoiceId);
          if (currentTab) {
            currentTab.khachHang = {
              id: invoice.khachHang.id,
              ten: invoice.tenKhachHang || invoice.khachHang.tenKH || 'Khách lẻ',
              soDienThoai: invoice.soDienThoaiKhachHang || invoice.khachHang.soDT || ''
            };
          }
        }
      } catch (error) {
        console.error('Error loading customer for invoice:', error);
        // Don't show error toast as this is background loading
      }
    };

    // Tab management
    const chonTab = async (id) => {
      tabActive.value = id;
      await loadCustomerForInvoice(id);
      await loadCartItems(id);
      await loadVoucherForInvoice(id);
      khachThanhToan.value = 0;
    };

    const themHoaDonMoi = async () => {
      // Kiểm tra giới hạn tối đa 5 hóa đơn chờ
      if (hoaDonTabs.value.length >= 5) {
        toast.error('Đã đạt giới hạn tối đa 5 hóa đơn chờ! Vui lòng hoàn thành hoặc xóa hóa đơn cũ trước khi tạo mới.');
        return;
      }

      try {
        // Create new pending invoice via API
        const response = await invoiceAPI.createInvoice();
        const newInvoice = response.data;

        // Add to local state
        const newTab = {
          id: newInvoice.id,
          ma: newInvoice.ma,
          items: [],
          khachHang: {
            id: 1, // Default guest customer ID
            ten: 'Khách lẻ',
            soDienThoai: ''
          },
          trangThai: newInvoice.trangThai,
          idPhieuGiamGia: null
        };
        
        hoaDonTabs.value.push(newTab);
        
        // Update pending invoice count in page stats
        pageStats.value[0].value = hoaDonTabs.value.length.toString();
        
        tabActive.value = newInvoice.id;
        toast.info(`Đã tạo hóa đơn mới: ${newInvoice.ma} (${hoaDonTabs.value.length}/5)`);
      } catch (error) {
        console.error('Error creating invoice:', error);
        toast.error('Có lỗi xảy ra khi tạo hóa đơn mới');
      }
    };

    const xoaHoaDon = async () => {
      try {
        const currentInvoice = hoaDonTabs.value.find(tab => tab.id === tabActive.value);
        if (!currentInvoice) return;

        // Delete pending invoice from backend
        await invoiceAPI.deleteInvoice(tabActive.value);
        
        // Remove from local state
        hoaDonTabs.value = hoaDonTabs.value.filter(tab => tab.id !== tabActive.value);
        
        // Update pending invoice count in page stats
        pageStats.value[0].value = hoaDonTabs.value.length.toString();
        
        toast.success(`Đã xóa hóa đơn ${currentInvoice.ma}`);

        if (hoaDonTabs.value.length > 0) {
          tabActive.value = hoaDonTabs.value[0].id;
        }
        // Do not auto-create new invoice - let user create manually
        showXacNhanXoaModal.value = false;
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Có lỗi xảy ra khi xóa hóa đơn');
      }
    };

    // Product management
    const themVaoGioHang = async (sp) => {
      if (sp.soLuongTonKho === 0) {
        toast.error(`Sản phẩm "${sp.tenSanPham}" đã hết hàng!`);
        return;
      }

      if (!currentHoaDon.value) {
        toast.error('Vui lòng chọn hoặc tạo hóa đơn trước khi thêm sản phẩm!');
        return;
      }

      try {
        // Add product to cart using cart API - use discounted price if available
        const cartItemData = {
          idChiTietSanPham: sp.id,
          soLuong: 1,
          gia: sp.giaGiamGia || sp.giaBan
        };
        
        await cartAPI.addProductToCart(currentHoaDon.value.id, cartItemData);
        
        // Reload cart to update UI
        await loadCartItems(currentHoaDon.value.id);
        
        toast.success(`Đã thêm "${sp.tenSanPham}" vào giỏ hàng`);
        showThemSanPhamModal.value = false;
      } catch (error) {
        console.error('Error adding product to cart:', error);
        toast.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
      }
    };

    const xoaSanPham = async (id) => {
      if (!currentHoaDon.value) return;
      
      try {
        const item = currentHoaDon.value.items.find(item => item.id === id);
        if (!item) return;
        
        // Remove item from cart using cart API
        await cartAPI.removeCartItem(currentHoaDon.value.id, item.cartItemId);
        
        // Reload cart to update UI
        await loadCartItems(currentHoaDon.value.id);
        
        toast.success(`Đã xóa sản phẩm khỏi giỏ hàng`);
      } catch (error) {
        console.error('Error removing product from cart:', error);
        toast.error('Có lỗi xảy ra khi xóa sản phẩm');
      }
    };

    const tangSoLuong = async (item) => {
      // Calculate max available: current stock + current cart quantity
      const maxAvailable = item.soLuongTonKho + item.soLuong;
      if (item.soLuong < maxAvailable) {
        try {
          // Update cart item quantity using cart API
          await cartAPI.updateCartItem(currentHoaDon.value.id, item.cartItemId, item.soLuong + 1);
          
          // Reload cart to update UI
          await loadCartItems(currentHoaDon.value.id);
        } catch (error) {
          console.error('Error updating product quantity:', error);
          toast.error('Có lỗi xảy ra khi cập nhật số lượng sản phẩm');
        }
      } else {
        toast.warning(`Sản phẩm "${item.tenSanPham}" chỉ có thể đặt tối đa ${maxAvailable} sản phẩm`);
      }
    };

    const giamSoLuong = async (item) => {
      if (item.soLuong > 1) {
        try {
          // Update cart item quantity using cart API
          await cartAPI.updateCartItem(currentHoaDon.value.id, item.cartItemId, item.soLuong - 1);
          
          // Reload cart to update UI
          await loadCartItems(currentHoaDon.value.id);
        } catch (error) {
          console.error('Error updating product quantity:', error);
          toast.error('Có lỗi xảy ra khi cập nhật số lượng sản phẩm');
        }
      }
    };

    // Prevent invalid input during typing
    const preventInvalidInput = (event, item) => {
      const key = event.key;
      const currentValue = event.target.value;
      const newValue = currentValue + key;
      
      // Allow navigation keys, backspace, delete, etc.
      if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
        return;
      }
      
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(key.toLowerCase())) {
        return;
      }
      
      // Only allow numeric input
      if (!/^\d$/.test(key)) {
        event.preventDefault();
        return;
      }
      
      // Check if the new value would exceed stock limit
      const futureValue = parseInt(newValue);
      if (!isNaN(futureValue) && futureValue > item.soLuongTonKho) {
        event.preventDefault();
        toast.warning(`Chỉ còn ${item.soLuongTonKho} sản phẩm trong kho`);
        return;
      }
      
      // Prevent leading zeros (except for single 0)
      if (currentValue === '0' && key !== '0') {
        event.target.value = '';
      }
    };

    // Open quantity modal
    const openQuantityModal = (item) => {
      selectedQuantityItem.value = item;
      modalQuantity.value = item.soLuong;
      showQuantityModal.value = true;
    };

    // Inline quantity modal methods
    const openInlineQuantityModal = (item, event) => {
      // Close any existing inline modal first
      closeInlineQuantityModal();
      
      // Calculate position based on clicked element
      const rect = event.target.getBoundingClientRect();
      modalPosition.value = {
        top: rect.top - 120, // Position above the clicked element
        left: rect.left + (rect.width / 2) // Center horizontally with transform: translateX(-50%)
      };
      
      selectedInlineItem.value = item;
      inlineQuantity.value = item.soLuong;
      
      // Set position first, then show modal to prevent jumping
      nextTick(() => {
        showInlineQuantityModal.value = true;
        
        // Focus input after modal appears
        nextTick(() => {
          const input = document.querySelector('.inline-qty-input');
          if (input) {
            input.focus();
            input.select();
          }
        });
      });
    };

    const closeInlineQuantityModal = () => {
      showInlineQuantityModal.value = false;
      selectedInlineItem.value = null;
      inlineQuantity.value = 1;
    };

    const validateInlineQuantity = (item) => {
      const maxAvailable = item.soLuongTonKho + item.soLuong;
      if (isNaN(inlineQuantity.value) || inlineQuantity.value < 1) {
        inlineQuantity.value = 1;
      } else if (inlineQuantity.value > maxAvailable) {
        inlineQuantity.value = maxAvailable;
      }
    };

    const confirmInlineQuantity = async () => {
      if (selectedInlineItem.value && inlineQuantity.value !== selectedInlineItem.value.soLuong) {
        try {
          await cartAPI.updateCartItem(currentHoaDon.value.id, selectedInlineItem.value.cartItemId, inlineQuantity.value);
          await loadCartItems(currentHoaDon.value.id);
          toast.success(`Đã cập nhật số lượng thành ${inlineQuantity.value}`);
        } catch (error) {
          console.error('Error updating product quantity:', error);
          toast.error('Có lỗi xảy ra khi cập nhật số lượng sản phẩm');
        }
      }
      closeInlineQuantityModal();
    };

    // Quantity modal methods
    const decreaseModalQuantity = () => {
      if (modalQuantity.value > 1) {
        modalQuantity.value--;
      }
    };

    const increaseModalQuantity = () => {
      // Calculate max available: current stock + current cart quantity
      const maxAvailable = selectedQuantityItem.value.soLuongTonKho + selectedQuantityItem.value.soLuong;
      if (modalQuantity.value < maxAvailable) {
        modalQuantity.value++;
      }
    };

    const validateModalQuantity = () => {
      if (isNaN(modalQuantity.value) || modalQuantity.value < 1) {
        modalQuantity.value = 1;
      } else {
        // Calculate max available: current stock + current cart quantity
        const maxAvailable = selectedQuantityItem.value.soLuongTonKho + selectedQuantityItem.value.soLuong;
        if (modalQuantity.value > maxAvailable) {
          modalQuantity.value = maxAvailable;
        }
      }
    };

    const confirmQuantityChange = async () => {
      if (selectedQuantityItem.value && modalQuantity.value !== selectedQuantityItem.value.soLuong) {
        try {
          await cartAPI.updateCartItem(currentHoaDon.value.id, selectedQuantityItem.value.cartItemId, modalQuantity.value);
          await loadCartItems(currentHoaDon.value.id);
          toast.success(`Đã cập nhật số lượng thành ${modalQuantity.value}`);
        } catch (error) {
          console.error('Error updating product quantity:', error);
          toast.error('Có lỗi xảy ra khi cập nhật số lượng sản phẩm');
        }
      }
      showQuantityModal.value = false;
    };

    // Validate quantity input to prevent entering more than available stock
    const validateQuantityInput = async (item) => {
      // Ensure quantity is a valid number
      if (isNaN(item.soLuong) || item.soLuong < 1) {
        item.soLuong = 1;
        toast.warning('Số lượng phải lớn hơn 0');
        return;
      }

      // Check if quantity exceeds original stock (soLuongTonKho is the original database stock)
      if (item.soLuong > item.soLuongTonKho) {
        item.soLuong = item.soLuongTonKho;
        toast.warning(`Sản phẩm "${item.tenSanPham}" chỉ có ${item.soLuongTonKho} trong kho`);
      }

      // Update cart with validated quantity
      try {
        await cartAPI.updateCartItem(currentHoaDon.value.id, item.cartItemId, item.soLuong);
        // Reload cart to update UI
        await loadCartItems(currentHoaDon.value.id);
      } catch (error) {
        console.error('Error updating product quantity:', error);
        toast.error('Có lỗi xảy ra khi cập nhật số lượng sản phẩm');
      }
    };

    // Customer management
    const openCustomerModal = async () => {
      showModal.value = true;
      await fetchTatCaKhachHang();
    };

    const chonKhachHang = async (khach) => {
      if (currentHoaDon.value) {
        try {
          // Update invoice with customer info
          const updateData = {
            khachHangId: khach.id,
            tenKhachHang: khach.tenKH,
            soDienThoaiKhachHang: khach.soDT,
            diaChiKhachHang: khach.diaChi || '',
            email: khach.email || ''
          };
          
          await invoiceAPI.updatePendingInvoiceCustomer(currentHoaDon.value.id, updateData);
          
          khachHangHienTai.value = {
            id: khach.id,
            ten: khach.tenKH,
            soDienThoai: khach.soDT
          };
          
          // Update local state
          currentHoaDon.value.khachHang = khachHangHienTai.value;
          
          toast.success(`Đã chọn khách hàng: ${khach.tenKH}`);
        } catch (error) {
          console.error('Error updating customer:', error);
          toast.error('Có lỗi xảy ra khi cập nhật thông tin khách hàng');
        }
      }
      showModal.value = false;
    };

    const fetchTatCaKhachHang = async () => {
      try {
        isLoadingKhachHang.value = true;
        const response = await productAPI.getActiveCustomersForSales({
          page: khachHangPagination.value.currentPage,
          size: khachHangPagination.value.size,
          sortBy: 'id',
          sortDir: 'desc'
        });

        // Transform the API response to match the expected format
        danhSachKhachHang.value = response.data.content.map(item => ({
          id: item.id,
          maKH: item.ma,
          tenKH: item.ten,
          soDT: item.soDienThoai,
          ngayT: item.createdAt
        }));

        // Update pagination info
        khachHangPagination.value = {
          currentPage: response.data.number,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
          size: response.data.size
        };

      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('Không thể tải danh sách khách hàng');
        danhSachKhachHang.value = [];
      } finally {
        isLoadingKhachHang.value = false;
      }
    };

    const timKhachHangTheoMa = async () => {
      if (!tuKhoaMaKH.value.trim()) {
        await fetchTatCaKhachHang();
        return;
      }
      
      try {
        isLoadingKhachHang.value = true;
        const response = await productAPI.getActiveCustomersForSales({
          page: 0,
          size: 50,
          sortBy: 'id',
          sortDir: 'desc',
          keyword: tuKhoaMaKH.value.trim()
        });

        // Transform the API response to match the expected format
        danhSachKhachHang.value = response.data.content.map(item => ({
          id: item.id,
          maKH: item.ma,
          tenKH: item.ten,
          soDT: item.soDienThoai,
          ngayT: item.createdAt
        }));
        
        if (danhSachKhachHang.value.length === 0) {
          toast.info('Không tìm thấy khách hàng nào phù hợp');
        } else {
          toast.success(`Tìm thấy ${danhSachKhachHang.value.length} khách hàng`);
        }
      } catch (error) {
        console.error('Error searching customers:', error);
        toast.error('Không thể tìm kiếm khách hàng');
        danhSachKhachHang.value = [];
      } finally {
        isLoadingKhachHang.value = false;
      }
    };

    // Remove customer and reset to default (ID=1)
    const xoaKhachHang = async () => {
      if (!currentHoaDon.value) {
        toast.error('Không tìm thấy hóa đơn để xóa khách hàng');
        return;
      }

      try {
        // Reset customer to default (ID=1) via API
        const updateData = {
          khachHangId: 1, // Default customer ID
          tenKhachHang: 'Khách lẻ',
          soDienThoaiKhachHang: '',
          diaChiKhachHang: '',
          email: ''
        };
        
        await invoiceAPI.updatePendingInvoiceCustomer(currentHoaDon.value.id, updateData);
        
        // Update local state
        khachHangHienTai.value = {
          id: 1,
          ten: 'Khách lẻ',
          soDienThoai: ''
        };
        
        currentHoaDon.value.khachHang = khachHangHienTai.value;
        
        // Handle voucher synchronization - remove personal vouchers
        if (selectedVoucher.value && selectedVoucher.value.riengTu) {
          // If current voucher is personal, remove it
          await removeVoucher();
          toast.info('Đã xóa phiếu giảm giá cá nhân do chuyển về khách lẻ');
        }
        
        // Reload vouchers to show only public vouchers
        await loadVouchers();
        
        toast.success('Đã chuyển về khách lẻ');
      } catch (error) {
        console.error('Error removing customer:', error);
        toast.error('Có lỗi xảy ra khi xóa khách hàng');
      }
    };

    // Quick create customer methods
    const cancelQuickCreate = () => {
      showQuickCreateForm.value = false;
      quickCreateForm.value = {
        ten: '',
        soDienThoai: ''
      };
    };

    const submitQuickCreate = async () => {
      if (!quickCreateForm.value.ten.trim() || !quickCreateForm.value.soDienThoai.trim()) {
        toast.warning('Vui lòng nhập đầy đủ tên và số điện thoại');
        return;
      }

      try {
        isCreatingCustomer.value = true;
        const response = await productAPI.quickCreateCustomer({
          ten: quickCreateForm.value.ten.trim(),
          soDienThoai: quickCreateForm.value.soDienThoai.trim()
        });

        toast.success('Tạo khách hàng thành công!');
        
        // Add the new customer to the list and select it
        const newCustomer = {
          id: response.data.id,
          maKH: response.data.ma,
          tenKH: response.data.ten,
          soDT: response.data.taiKhoan?.soDienThoai || quickCreateForm.value.soDienThoai,
          ngayT: response.data.createdAt
        };
        
        danhSachKhachHang.value.unshift(newCustomer);
        chonKhachHang(newCustomer);
        
        // Reset form and close
        cancelQuickCreate();
        
      } catch (error) {
        console.error('Error creating customer:', error);
        toast.error('Không thể tạo khách hàng. Vui lòng thử lại.');
      } finally {
        isCreatingCustomer.value = false;
      }
    };

    const fetchSanPham = async () => {
      try {
        isLoadingSanPham.value = true;
        
        // Use discount campaign prices API for sales counter
        const response = await productAPI.getActiveProductDetailsWithDiscountPrices();

        // Transform the API response to match the expected format
        danhSachSanPham.value = response.data.map(item => ({
          id: item.id,
          maSanPham: item.ma,
          tenSanPham: item.tenSanPham || 'N/A',
          giaBan: item.giaBan, // Original price
          giaGiamGia: item.giaGiamGia, // Discounted price if available
          tenDotGiamGia: item.tenDotGiamGia, // Discount campaign name
          soLuongTonKho: item.soLuongTonKho,
          tenKichCo: item.tenKichCo,
          tenMauSac: item.tenMauSac,
          hexMauSac: item.hexMauSac,
          tenThuongHieu: item.tenThuongHieu,
          tenDanhMuc: item.tenDanhMuc,
          tenChatLieu: item.tenChatLieu,
          tenDeGiay: item.tenDeGiay,
          image: item.urlAnhSanPham || '/public/sneakers/sneakers-1-alt1.jpg'
        }));

        // Filter by search keyword if provided
        if (tuKhoaSanPham.value.trim()) {
          const keyword = tuKhoaSanPham.value.trim().toLowerCase();
          danhSachSanPham.value = danhSachSanPham.value.filter(item => 
            item.tenSanPham.toLowerCase().includes(keyword) ||
            item.maSanPham.toLowerCase().includes(keyword)
          );
        }

        // Update product details count in page stats
        pageStats.value[1].value = danhSachSanPham.value.length.toString();

        if (tuKhoaSanPham.value.trim()) {
          toast.success(`Tìm thấy ${danhSachSanPham.value.length} sản phẩm với giá đã áp dụng khuyến mãi`);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Không thể tải danh sách sản phẩm');
        danhSachSanPham.value = [];
        // Set count to 0 on error
        pageStats.value[1].value = '0';
      } finally {
        isLoadingSanPham.value = false;
      }
    };

    // QR Scanner functions
    const startCamera = async () => {
      try {
        console.log('Starting camera...');
        
        // Set camera started first to render video element
        cameraStarted.value = true;
        scanResult.value = '';
        
        // Wait for next tick to ensure DOM is updated
        await nextTick();
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Use back camera if available
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        console.log('Camera stream obtained:', stream);
        
        if (videoElement.value) {
          videoElement.value.srcObject = stream;
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            videoElement.value.onloadedmetadata = () => {
              videoElement.value.play();
              resolve();
            };
          });
          
          console.log('Camera started successfully');
          
          // Start continuous scanning after a short delay
          setTimeout(() => {
            startContinuousScanning();
          }, 1000);
        } else {
          console.error('Video element still not found after DOM update');
          cameraStarted.value = false;
          toast.error('Không thể khởi tạo camera. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        cameraStarted.value = false;
        if (error.name === 'NotAllowedError') {
          toast.error('Vui lòng cho phép truy cập camera để sử dụng tính năng quét QR.');
        } else if (error.name === 'NotFoundError') {
          toast.error('Không tìm thấy camera trên thiết bị.');
        } else {
          toast.error('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
        }
      }
    };

    const stopCamera = () => {
      if (videoElement.value && videoElement.value.srcObject) {
        const tracks = videoElement.value.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.value.srcObject = null;
      }
      cameraStarted.value = false;
      scanResult.value = '';
      
      if (qrScanner.value) {
        clearInterval(qrScanner.value);
        qrScanner.value = null;
      }
    };

    const startContinuousScanning = () => {
      qrScanner.value = setInterval(() => {
        captureQR();
      }, 500); // Scan every 500ms
    };

    const captureQR = () => {
      if (!videoElement.value || !canvasElement.value || !cameraStarted.value) {
        console.log('captureQR: Missing elements or camera not started');
        return;
      }

      const video = videoElement.value;
      const canvas = canvasElement.value;
      
      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.log('Video not ready yet');
        return;
      }
      
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (canvas.width === 0 || canvas.height === 0) {
        console.log('Video dimensions not available yet');
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('QR Code detected:', code.data);
        scanResult.value = code.data;
        processQRResult(code.data);
        stopCamera();
      }
    };

    const processQRResult = async (qrData) => {
      try {
        // Extract product detail ID from QR code (format: just the ID number)
        const productDetailId = parseInt(qrData);
        if (isNaN(productDetailId) || productDetailId <= 0) {
          toast.error('Mã QR không hợp lệ. Vui lòng quét mã QR sản phẩm từ hệ thống.');
          return;
        }
        
        // Get product detail information from backend
        const response = await productAPI.getProductDetailById(productDetailId);
        const productDetail = response.data;

        if (!productDetail) {
          toast.error('Không tìm thấy sản phẩm với mã QR này.');
          return;
        }

        // Check if product is available
        if (productDetail.deleted || productDetail.soLuongTonKho <= 0) {
          toast.error('Sản phẩm này không còn bán hoặc đã hết hàng.');
          return;
        }

        // Add product to cart
        await addScannedProductToCart(productDetail);
        
        // Close QR scanner modal
        showQRScannerModal.value = false;
        
      } catch (error) {
        console.error('Error processing QR result:', error);
        toast.error('Có lỗi xảy ra khi xử lý mã QR. Vui lòng thử lại.');
      }
    };

    const addScannedProductToCart = async (productDetail) => {
      if (!currentHoaDon.value) {
        toast.error('Vui lòng tạo hóa đơn trước khi thêm sản phẩm.');
        return;
      }

      try {
        // Check if product already exists in cart
        const existingItem = currentHoaDon.value.items.find(item => item.id === productDetail.id);
        
        if (existingItem) {
          // If exists, increase quantity by 1
          const maxAvailable = existingItem.soLuongTonKho + existingItem.soLuong;
          if (existingItem.soLuong < maxAvailable) {
            await cartAPI.updateCartItem(currentHoaDon.value.id, existingItem.cartItemId, existingItem.soLuong + 1);
            existingItem.soLuong += 1;
            existingItem.soLuongTonKho -= 1;
            toast.success(`Đã tăng số lượng "${productDetail.idSanPham?.tenSanPham}" lên ${existingItem.soLuong}`);
          } else {
            toast.warning(`Sản phẩm "${productDetail.idSanPham?.tenSanPham}" đã đạt số lượng tối đa có thể thêm!`);
          }
        } else {
          // If not exists, add new item to cart
          const cartItem = {
            idChiTietSanPham: productDetail.id,
            soLuong: 1,
            gia: productDetail.giaBan
          };

          const response = await cartAPI.addProductToCart(currentHoaDon.value.id, cartItem);
          
          console.log('Cart API response:', response);
          
          // Add to local cart display
          const newItem = {
            id: productDetail.id,
            cartItemId: response?.id || response?.data?.id || Date.now(), // Fallback to timestamp if ID not available
            tenSanPham: productDetail.idSanPham?.tenSanPham || 'N/A',
            maSanPham: productDetail.ma || 'N/A',
            giaBan: productDetail.giaBan,
            soLuong: 1,
            soLuongTonKho: productDetail.soLuongTonKho - 1,
            image: productDetail.idAnhSanPham?.urlAnh || productDetail.idSanPham?.urlAnhDaiDien || '/default-product.jpg'
          };

          currentHoaDon.value.items.push(newItem);
          
          const productName = productDetail.idSanPham?.tenSanPham || 'Sản phẩm';
          const sizeName = productDetail.idKichCo?.tenKichCo || '';
          const colorName = productDetail.idMauSac?.tenMauSac || '';
          const variantInfo = sizeName && colorName ? ` (${sizeName} - ${colorName})` : '';
          
          toast.success(`Đã thêm "${productName}${variantInfo}" vào giỏ hàng`);
        }

        // Reload cart to ensure data consistency
        await loadCartItems(currentHoaDon.value.id);
        
      } catch (error) {
        console.error('Error adding scanned product to cart:', error);
        toast.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
      }
    };

    // QR Scanner modal functions
    const openQRScanner = () => {
      // Close other modals first to prevent conflicts
      showThemSanPhamModal.value = false;
      showThanhToanModal.value = false;
      showQuantityModal.value = false;
      showInlineQuantityModal.value = false;
      
      // Open QR scanner modal
      showQRScannerModal.value = true;
      scanResult.value = '';
    };

    const closeQRScanner = () => {
      stopCamera();
      showQRScannerModal.value = false;
      scanResult.value = '';
    };

    // Cleanup on component unmounts
    onUnmounted(() => {
      stopCamera();
    });

    // Voucher management
    const loadVouchers = async () => {
      try {
        isLoadingVouchers.value = true;
        let response;
        
        // Check if customer is guest customer (ID=1) or specific customer
        if (khachHangHienTai.value?.id && khachHangHienTai.value.id !== 1) {
          // Specific customer: get both public and personal vouchers
          response = await voucherAPI.getActiveVouchersForCustomer(khachHangHienTai.value.id);
        } else {
          // Guest customer (ID=1) or no customer: only get public vouchers
          response = await voucherAPI.getActivePublicVouchers();
        }
        
        availableVouchers.value = response.data || [];
      } catch (error) {
        console.error('Error loading vouchers:', error);
        toast.error('Không thể tải danh sách phiếu giảm giá');
        availableVouchers.value = [];
      } finally {
        isLoadingVouchers.value = false;
      }
    };
    
    const isVoucherApplicable = (voucher) => {
      if (!currentHoaDon.value || currentHoaDon.value.items.length === 0) {
        return false;
      }
      
      // Check minimum order value (nếu có)
      if (voucher.hoaDonToiThieu && tongTien.value < voucher.hoaDonToiThieu) {
        return false;
      }
      
      return true;
    };
    
    const getVoucherError = (voucher) => {
      if (!currentHoaDon.value || currentHoaDon.value.items.length === 0) {
        return 'Giỏ hàng trống';
      }
      
      if (voucher.hoaDonToiThieu && tongTien.value < voucher.hoaDonToiThieu) {
        return `Đơn tối thiểu ${formatCurrency(voucher.hoaDonToiThieu)}`;
      }
      
      return '';
    };

    const getVoucherDiscountText = (voucher) => {
      if (!currentHoaDon.value || currentHoaDon.value.items.length === 0) {
        // Nếu không có giỏ hàng, hiển thị thông tin cơ bản
        if (voucher.loaiPhieuGiamGia === 'PHAN_TRAM') {
          return `Giảm ${voucher.phanTramGiamGia}% (tối đa ${formatCurrency(voucher.soTienGiamToiDa)})`;
        } else {
          return `Giảm ${formatCurrency(voucher.soTienGiamToiDa)}`;
        }
      }

      // Tính toán số tiền thực tế được giảm
      let actualDiscount = 0;
      if (voucher.loaiPhieuGiamGia === 'PHAN_TRAM') {
        const percentDiscount = Math.floor(tongTien.value * voucher.phanTramGiamGia / 100);
        actualDiscount = Math.min(percentDiscount, voucher.soTienGiamToiDa || percentDiscount);
        return `Giảm ${voucher.phanTramGiamGia}% = ${formatCurrency(actualDiscount)}`;
      } else {
        actualDiscount = Math.min(voucher.soTienGiamToiDa || 0, tongTien.value);
        return `Giảm ${formatCurrency(actualDiscount)}`;
      }
    };
    
    const selectVoucher = async (voucher) => {
      if (!isVoucherApplicable(voucher)) {
        toast.warning(getVoucherError(voucher));
        return;
      }
      
      if (!currentHoaDon.value?.id) {
        toast.error('Không tìm thấy hóa đơn để áp dụng phiếu giảm giá');
        return;
      }
      
      try {
        // Apply voucher to invoice via API (automatically handles quantity management)
        await voucherAPI.applyVoucherToInvoice(voucher.id, currentHoaDon.value.id);
        
        selectedVoucher.value = voucher;
        
        // Update the invoice tab with voucher ID
        const currentTab = hoaDonTabs.value.find(tab => tab.id === currentHoaDon.value.id);
        if (currentTab) {
          currentTab.idPhieuGiamGia = voucher.id;
        }
        
        // Calculate discount
        if (voucher.loaiPhieuGiamGia === 'PHAN_TRAM') {
          const discountAmount = Math.floor(tongTien.value * voucher.phanTramGiamGia / 100);
          giamGia.value = Math.min(discountAmount, voucher.soTienGiamToiDa || discountAmount);
        } else {
          giamGia.value = Math.min(voucher.soTienGiamToiDa || 0, tongTien.value);
        }
        
        thongBaoGiamGia.value = `Đã áp dụng phiếu giảm giá ${voucher.ma} thành công!`;
        toast.success(`Đã áp dụng phiếu giảm giá ${voucher.ma}`);
        showVoucherModal.value = false;
        
        // Reload vouchers to update quantities
        await loadVouchers();
      } catch (error) {
        console.error('Error applying voucher:', error);
        toast.error(error.response?.data || 'Không thể áp dụng phiếu giảm giá');
      }
    };
    
    const removeVoucher = async () => {
      if (!currentHoaDon.value?.id) {
        toast.error('Không tìm thấy hóa đơn để xóa phiếu giảm giá');
        return;
      }
      
      if (!selectedVoucher.value) {
        toast.warning('Không có phiếu giảm giá nào để xóa');
        return;
      }
      
      try {
        // Remove voucher from invoice via API (automatically restores quantity)
        await voucherAPI.removeVoucherFromInvoice(currentHoaDon.value.id);
        
        // Update the invoice tab to remove voucher ID
        const currentTab = hoaDonTabs.value.find(tab => tab.id === currentHoaDon.value.id);
        if (currentTab) {
          currentTab.idPhieuGiamGia = null;
        }
        
        selectedVoucher.value = null;
        giamGia.value = 0;
        thongBaoGiamGia.value = '';
        toast.info('Đã hủy phiếu giảm giá');
        
        // Reload vouchers to update quantities
        await loadVouchers();
      } catch (error) {
        console.error('Error removing voucher:', error);
        toast.error(error.response?.data || 'Không thể xóa phiếu giảm giá');
      }
    };
    
    const apDungMaGiamGia = () => {
      // This function is kept for backward compatibility but now opens the voucher modal
      showVoucherModal.value = true;
      loadVouchers();
    };
    
    // Watch for voucher modal opening
    watch(showVoucherModal, (newVal) => {
      if (newVal) {
        loadVouchers();
      }
    });
    
    // Load voucher information for existing invoice
    const loadVoucherForInvoice = async (invoiceId) => {
      try {
        // Reset voucher state first
        selectedVoucher.value = null;
        giamGia.value = 0;
        thongBaoGiamGia.value = '';
        maGiamGia.value = '';
        
        // Find the invoice in our tabs
        const invoice = hoaDonTabs.value.find(tab => tab.id === invoiceId);
        if (!invoice || !invoice.idPhieuGiamGia) {
          return; // No voucher applied to this invoice
        }
        
        // Get voucher details from API
        const response = await voucherAPI.getVoucherDetail(invoice.idPhieuGiamGia);
        const voucher = response.data;
        
        if (voucher) {
          selectedVoucher.value = voucher;
          
          // Calculate discount based on current cart total
          const currentTotal = calculateTabTotal(invoice);
          if (voucher.loaiPhieuGiamGia === 'PHAN_TRAM') {
            const discountAmount = Math.floor(currentTotal * voucher.phanTramGiamGia / 100);
            giamGia.value = Math.min(discountAmount, voucher.soTienGiamToiDa || discountAmount);
          } else {
            giamGia.value = Math.min(voucher.soTienGiamToiDa || 0, currentTotal);
          }
          
          thongBaoGiamGia.value = `Đã áp dụng phiếu giảm giá ${voucher.ma}`;
        }
      } catch (error) {
        console.error('Error loading voucher for invoice:', error);
        // Don't show error toast as this is background loading
      }
    };

    // Watch for customer changes to reload vouchers
    watch(() => currentHoaDon.value?.khachHang?.id, () => {
      // Reset selected voucher when customer changes
      selectedVoucher.value = null;
      giamGia.value = 0;
      thongBaoGiamGia.value = '';
    });


    // Payment management
    const chonPhuongThuc = (phuongThuc) => {
      phuongThucThanhToan.value = phuongThuc;
      // Reset payment amounts when switching methods
      if (phuongThuc === 'Cả 2') {
        tienMat.value = 0;
        tienVNPay.value = khachCanTra.value;
      } else {
        tienMat.value = 0;
        tienVNPay.value = 0;
        khachThanhToan.value = phuongThuc === 'Tiền mặt' ? khachCanTra.value : 0;
      }
      toast.info(`Đã chọn phương thức thanh toán: ${phuongThuc.replace('_', ' ').toLowerCase()}`);
    };

    const updateVNPayAmount = () => {
      const cashAmount = parseFloat(tienMat.value) || 0;
      const remaining = khachCanTra.value - cashAmount;
      tienVNPay.value = remaining > 0 ? remaining : 0;
    };

    // Currency formatting methods
    const formatVNDInput = (value) => {
      if (!value) return '';
      // Remove all non-digit characters
      const numericValue = value.toString().replace(/\D/g, '');
      if (!numericValue) return '';
      
      // Format with thousands separators
      return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue));
    };

    const parseVNDInput = (formattedValue) => {
      if (!formattedValue) return 0;
      // Remove all non-digit characters and convert to number
      const numericValue = formattedValue.toString().replace(/\D/g, '');
      return parseInt(numericValue) || 0;
    };

    const updateKhachThanhToan = (event) => {
      const inputValue = event.target.value;
      const numericValue = parseVNDInput(inputValue);
      khachThanhToan.value = numericValue;
      
      // Format the display value immediately while typing
      khachThanhToanFormatted.value = formatVNDInput(numericValue);
    };

    const formatKhachThanhToanInput = () => {
      khachThanhToanFormatted.value = formatVNDInput(khachThanhToan.value);
    };

    const updateTienMat = (event) => {
      const inputValue = event.target.value;
      const numericValue = parseVNDInput(inputValue);
      tienMat.value = numericValue;
      
      // Update VNPay amount automatically
      const remaining = khachCanTra.value - numericValue;
      tienVNPay.value = remaining > 0 ? remaining : 0;
      
      // Format the display value immediately while typing
      tienMatFormatted.value = formatVNDInput(numericValue);
    };

    const formatTienMatInput = () => {
      tienMatFormatted.value = formatVNDInput(tienMat.value);
    };

    // Reset payment form to default values
    const resetPaymentForm = () => {
      phuongThucThanhToan.value = 'Tiền mặt';
      maGiamGia.value = '';
      thongBaoGiamGia.value = '';
      giamGia.value = 0;
      khachThanhToan.value = 0;
      tienMat.value = 0;
      tienVNPay.value = 0;
      khachThanhToanFormatted.value = '';
      tienMatFormatted.value = '';
    };

    const xacNhanThanhToan = async () => {
      if (!currentHoaDon.value || currentHoaDon.value.items.length === 0) {
        toast.warning('Giỏ hàng trống! Không thể thanh toán.');
        return;
      }

      // Validate payment amounts based on payment method
      if (phuongThucThanhToan.value === 'Tiền mặt') {
        if (khachThanhToan.value < khachCanTra.value) {
          toast.error('Số tiền mặt không đủ để thanh toán!');
          return;
        }
      } else if (phuongThucThanhToan.value === 'VnPay') {
        // For VNPay only payment, no validation needed - VNPay will handle the full amount
        // The amount will be set automatically in the payment request
      } else if (phuongThucThanhToan.value === 'Cả 2') {
        if ((tienMat.value + tienVNPay.value) < khachCanTra.value) {
          toast.error('Tổng số tiền thanh toán không đủ!');
          return;
        }
        if (tienMat.value <= 0 || tienVNPay.value <= 0) {
          toast.error('Cả tiền mặt và VNPay phải lớn hơn 0 khi thanh toán kết hợp!');
          return;
        }
      }

      try {
        // Prepare payment request data
        const paymentRequest = {
          hoaDonId: tabActive.value,
          nhanVienId: 1, // Default employee ID - should be from auth context
          phuongThucThanhToan: phuongThucThanhToan.value,
          tongTien: tongTien.value, // Send original total, not discounted amount
          tongTienSauGiam: khachCanTra.value, // Send discounted amount separately
          giamGia: giamGia.value, // Send discount amount
          tienMat: phuongThucThanhToan.value === 'VnPay' ? 0 : 
                   (phuongThucThanhToan.value === 'Tiền mặt' ? khachThanhToan.value : tienMat.value),
          tienChuyenKhoan: phuongThucThanhToan.value === 'Tiền mặt' ? 0 : 
                           (phuongThucThanhToan.value === 'VnPay' ? khachCanTra.value : tienVNPay.value),
          phiVanChuyen: 0,
          cartItems: currentHoaDon.value.items.map(item => ({
            idChiTietSanPham: item.id,
            soLuong: item.soLuong,
            gia: item.giaBan
          })),
          phieuGiamGiaId: selectedVoucher.value?.id || null,
          ghiChu: `Thanh toán tại quầy - ${phuongThucThanhToan.value}`
        };

        console.log('Processing payment:', paymentRequest);

        // Handle different payment methods
        if (phuongThucThanhToan.value === 'VnPay') {
          // VNPay only payment - redirect to VNPay
          await handleVNPayPayment(paymentRequest);
          return;
        } else if (phuongThucThanhToan.value === 'Cả 2') {
          // Combined payment - process cash first, then VNPay
          await handleCombinedPayment(paymentRequest);
          return;
        }

        // Cash only payment - use existing flow
        const response = await invoiceAPI.processPayment(paymentRequest);
        
        if (response.data.success) {
          const paymentResult = response.data;
          
          // Show success message with payment details
          let successMessage = `Thanh toán hóa đơn ${paymentResult.maHoaDon} thành công!`;
          if (phuongThucThanhToan.value === 'Tiền mặt' && paymentResult.tienThua > 0) {
            successMessage += ` Tiền thừa: ${formatCurrency(paymentResult.tienThua)}`;
          }
          
          toast.success(successMessage);
          
          // Remove current tab from pending invoices
          hoaDonTabs.value = hoaDonTabs.value.filter(tab => tab.id !== tabActive.value);
          
          // Switch to next available tab if any exist
          if (hoaDonTabs.value.length > 0) {
            tabActive.value = hoaDonTabs.value[0].id;
          } else {
            // No more pending invoices, clear active tab
            tabActive.value = null;
          }
          
          // Update page stats
          pageStats.value[0].value = hoaDonTabs.value.length.toString();
          
          // Close payment modal and reset form
          showThanhToanModal.value = false;
          resetPaymentForm();
          
          // Clear selected voucher
          selectedVoucher.value = null;
          
          // Navigate to invoice detail page
          router.push(`/hoa-don/chi-tiet/${paymentResult.hoaDonId}`);
          
        } else {
          toast.error(response.data.message || 'Có lỗi xảy ra khi thanh toán');
        }
        
      } catch (error) {
        console.error('Payment error:', error);
        
        let errorMessage = 'Có lỗi xảy ra khi xử lý thanh toán';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      }
    };

    // VNPay payment handlers
    const handleVNPayPayment = async (paymentRequest) => {
      try {
        const vnpayRequest = {
          invoiceId: paymentRequest.hoaDonId,
          amount: paymentRequest.tongTienSauGiam, // Use discounted amount for VNPay
          paymentMethod: 'VnPay'
        };

        const response = await invoiceAPI.createVNPayPayment(vnpayRequest);
        
        if (response.data.paymentUrl) {
          // Close payment modal before redirecting
          showThanhToanModal.value = false;
          
          // Show loading message
          toast.info('Đang chuyển hướng đến VNPay...');
          
          // Redirect to VNPay payment page
          window.location.href = response.data.paymentUrl;
        } else {
          toast.error('Không thể tạo liên kết thanh toán VNPay');
        }
      } catch (error) {
        console.error('VNPay payment error:', error);
        toast.error(error.response?.data || 'Lỗi khi tạo thanh toán VNPay');
      }
    };

    const handleCombinedPayment = async (paymentRequest) => {
      try {
        const combinedRequest = {
          invoiceId: paymentRequest.hoaDonId,
          cashAmount: paymentRequest.tienMat,
          vnpayAmount: paymentRequest.tienChuyenKhoan,
          paymentMethod: 'Cả 2'
        };

        const response = await invoiceAPI.processCombinedPayment(combinedRequest);
        
        if (response.data.paymentUrl) {
          // Close payment modal before redirecting
          showThanhToanModal.value = false;
          
          // Show loading message
          toast.info('Đã xử lý tiền mặt. Đang chuyển hướng đến VNPay cho phần còn lại...');
          
          // Redirect to VNPay for remaining amount
          window.location.href = response.data.paymentUrl;
        } else {
          toast.error('Không thể xử lý thanh toán kết hợp');
        }
      } catch (error) {
        console.error('Combined payment error:', error);
        toast.error(error.response?.data || 'Lỗi khi xử lý thanh toán kết hợp');
      }
    };

    // Handle VNPay return from URL parameters
    const handleVNPayReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const invoiceId = urlParams.get('invoiceId');

      if (paymentStatus === 'success' && invoiceId) {
        toast.success(`Thanh toán VNPay thành công cho hóa đơn ${invoiceId}!`);
        
        // Remove the invoice from pending invoices list
        hoaDonTabs.value = hoaDonTabs.value.filter(tab => tab.id !== parseInt(invoiceId));
        
        // Switch to next available tab if any exist
        if (hoaDonTabs.value.length > 0) {
          tabActive.value = hoaDonTabs.value[0].id;
        } else {
          // No more pending invoices, clear active tab
          tabActive.value = null;
        }
        
        // Update page stats
        pageStats.value[0].value = hoaDonTabs.value.length.toString();
        
        // Clear selected voucher
        selectedVoucher.value = null;
        
        // Reload both pending invoices and product list
        await Promise.all([
          loadPendingInvoices(),
          fetchSanPham()
        ]);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Navigate to invoice detail page
        router.push(`/hoa-don/chi-tiet/${invoiceId}`);
        
      } else if (paymentStatus === 'failed') {
        toast.error('Thanh toán VNPay thất bại!');
        // Reload pending invoices to refresh the list
        await loadPendingInvoices();
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'error') {
        toast.error('Có lỗi xảy ra trong quá trình thanh toán VNPay!');
        // Reload pending invoices to refresh the list
        await loadPendingInvoices();
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Load cart items for invoice
    const loadCartItems = async (hoaDonId) => {
      try {
        const cartResponse = await cartAPI.getCartByInvoiceId(hoaDonId);
        
        // Find the invoice tab and update its items
        const invoiceTab = hoaDonTabs.value.find(tab => tab.id === hoaDonId);
        if (invoiceTab && cartResponse.items) {
          // Map cart items to the format expected by the UI
          invoiceTab.items = cartResponse.items.map(item => ({
            id: item.idChiTietSanPham,
            cartItemId: item.id, // Store cart item ID for updates/deletes
            maSanPham: item.maSanPham,
            tenSanPham: item.tenSanPham,
            giaBan: item.gia,
            soLuong: item.soLuong,
            soLuongTonKho: item.soLuongTonKho,
            image: item.urlAnhSanPham || '/public/sneakers/sneakers-1-alt1.jpg',
            tenMauSac: item.tenMauSac,
            tenKichCo: item.tenKichCo
          }));
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
        // If cart doesn't exist yet, that's okay - it will be created when items are added
      }
    };

    // Load pending invoices (status = 0)
    const loadPendingInvoices = async () => {
      try {
        isLoadingInvoices.value = true;
        
        // Load pending invoices from API
        const response = await invoiceAPI.getPendingInvoices();
        const pendingInvoices = response.data;
        
        if (pendingInvoices && pendingInvoices.length > 0) {
          // Add pending invoices to tabs with customer information
          for (const invoice of pendingInvoices) {
            const customerInfo = {
              ten: 'Khách lẻ',
              soDienThoai: ''
            };
            
            // Load customer info if available
            if (invoice.idKhachHang) {
              customerInfo.id = invoice.idKhachHang.id;
              customerInfo.ten = invoice.tenKhachHang || invoice.idKhachHang.tenKH || 'Khách lẻ';
              customerInfo.soDienThoai = invoice.soDienThoaiKhachHang || invoice.idKhachHang.soDT || '';
            }
            
            hoaDonTabs.value.push({
              id: invoice.id,
              ma: invoice.ma,
              items: [], // Will be loaded below
              khachHang: customerInfo,
              trangThai: invoice.trangThai,
              idPhieuGiamGia: invoice.idPhieuGiamGia?.id || null
            });
          }
          
          // Load cart items for all pending invoices
          for (const tab of hoaDonTabs.value) {
            await loadCartItems(tab.id);
          }
          
          // Set first invoice as active and load its customer info and voucher
          if (hoaDonTabs.value.length > 0) {
            tabActive.value = hoaDonTabs.value[0].id;
            await loadCustomerForInvoice(hoaDonTabs.value[0].id);
            await loadVoucherForInvoice(hoaDonTabs.value[0].id);
          }
        }
        
        // Update page stats with actual count of pending invoices
        pageStats.value[0].value = pendingInvoices ? pendingInvoices.length.toString() : '0';
        
        // Do not auto-create invoice - let user create manually
      } catch (error) {
        console.error('Error loading pending invoices:', error);
        toast.error('Không thể tải danh sách hóa đơn chờ');
        // Set count to 0 on error
        pageStats.value[0].value = '0';
      } finally {
        isLoadingInvoices.value = false;
      }
    };

    // Initialize data on component mount
    onMounted(async () => {
      // Handle VNPay return first
      handleVNPayReturn();
      
      await Promise.all([
        loadPendingInvoices(),
        fetchSanPham()
      ]);
    });

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
      isLoadingSanPham,
      isLoadingKhachHang,
      khachHangPagination,
      
      // Payment
      phuongThucThanhToan,
      maGiamGia,
      thongBaoGiamGia,
      giamGia,
      khachThanhToan,
      tienMat,
      tienVNPay,
      tongTien,
      khachCanTra,
      tienThua,
      isPaymentValid,
      
      
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
      openCustomerModal,
      chonKhachHang,
      xoaKhachHang,
      
      // Voucher methods
      showVoucherModal,
      selectedVoucher,
      availableVouchers,
      isLoadingVouchers,
      loadVouchers,
      loadVoucherForInvoice,
      isVoucherApplicable,
      getVoucherError,
      getVoucherDiscountText,
      selectVoucher,
      removeVoucher,
      
      // Quick create customer
      showQuickCreateForm,
      isCreatingCustomer,
      quickCreateForm,
      cancelQuickCreate,
      submitQuickCreate,
      fetchTatCaKhachHang,
      timKhachHangTheoMa,
      fetchSanPham,
      apDungMaGiamGia,
      chonPhuongThuc,
      updateVNPayAmount,
      xacNhanThanhToan,
      
      // Currency formatting
      khachThanhToanFormatted,
      tienMatFormatted,
      updateKhachThanhToan,
      formatKhachThanhToanInput,
      updateTienMat,
      formatTienMatInput,
      
      // Quantity modal methods
      showQuantityModal,
      selectedQuantityItem,
      modalQuantity,
      openQuantityModal,
      decreaseModalQuantity,
      increaseModalQuantity,
      validateModalQuantity,
      confirmQuantityChange,
      
      // Inline quantity modal methods
      showInlineQuantityModal,
      selectedInlineItem,
      inlineQuantity,
      modalPosition,
      openInlineQuantityModal,
      closeInlineQuantityModal,
      validateInlineQuantity,
      confirmInlineQuantity,
      
      // QR Scanner methods
      showQRScannerModal,
      cameraStarted,
      scanResult,
      videoElement,
      canvasElement,
      qrScanner,
      openQRScanner,
      closeQRScanner,
      startCamera,
      stopCamera,
      captureQR,
      processQRResult,
      addScannedProductToCart
    };
  }
}
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.ban-tai-quay-container {
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
  gap: 5px;
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

/* Modal table containers with scrolling */
.modal-container .table-container {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.modal-container .table-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container .table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.modal-container .table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-container .table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
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

/* ===== CUSTOMER ACTIONS ===== */
.customer-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}

.customer-select-btn {
  flex: 1;
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

.customer-select-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.customer-remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.customer-remove-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.total-amount {
  color: #ffffff;
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

.price-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price {
  font-weight: 600;
  color: #059669;
}

.discounted-price {
  font-weight: 700;
  color: #dc2626;
  font-size: 1rem;
}

.original-price {
  font-size: 0.8rem;
  color: #6b7280;
  text-decoration: line-through;
  margin-left: 8px;
}

.discount-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.campaign-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #059669;
  font-weight: 500;
  background: #ecfdf5;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #a7f3d0;
}

.campaign-name iconify-icon {
  font-size: 0.875rem;
}

.regular-price {
  font-weight: 600;
  color: #1a202c;
  font-size: 1rem;
}

/* Size and Color Styling */
.size-badge {
  display: inline-block;
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #d1d5db;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.color-name {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.stock {
  font-weight: 600;
  color: #1a202c;
}

.stock.out-of-stock {
  color: #dc2626;
}

/* ===== VOUCHER STYLES ===== */
.select-voucher-btn {
  width: 100%;
  padding: 12px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
}

.select-voucher-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
}

.selected-voucher {
  background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
  border: 2px solid #007bff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.voucher-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.voucher-code {
  font-weight: 700;
  color: #007bff;
  font-size: 1.1rem;
}

.voucher-name {
  color: #4b5563;
  font-size: 0.9rem;
}

.voucher-discount {
  color: #059669;
  font-weight: 600;
  font-size: 0.95rem;
}

.remove-voucher-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
}

.remove-voucher-btn:hover {
  background: #fecaca;
  transform: scale(1.1);
}

/* Voucher Modal */
.voucher-modal {
  max-width: 900px;
  width: 90vw;
  max-height: 80vh;
}

.voucher-modal .modal-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.voucher-modal .modal-content::-webkit-scrollbar {
  width: 8px;
}

.voucher-modal .modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.voucher-modal .modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.voucher-modal .modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.vouchers-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voucher-item {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.voucher-item:hover:not(.disabled) {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.15);
}

.voucher-item.selected {
  border-color: #007bff;
  background: linear-gradient(135deg, #e6f3ff 0%, #f0f9ff 100%);
}

.voucher-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8fafc;
}

.voucher-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.voucher-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.voucher-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.voucher-badge.personal {
  background: #fef3c7;
  color: #92400e;
}

.voucher-badge.public {
  background: #dbeafe;
  color: #1e40af;
}

.voucher-details {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.voucher-condition {
  color: #6b7280;
  font-size: 0.9rem;
}

.voucher-validity {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 0.85rem;
}

.voucher-description {
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.4;
}

.voucher-right {
  display: flex;
  align-items: center;
}

.apply-btn {
  padding: 10px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.apply-btn.applied {
  background: #059669;
}

.not-applicable {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;
  font-size: 0.85rem;
}

.empty-vouchers {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-vouchers .empty-icon {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.loading-state {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.loading-state .loading-icon {
  font-size: 48px;
  color: #007bff;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

/* Quick Create Customer Form Styles */
.quick-create-form {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #007bff;
  color: white;
}

.form-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.close-form-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-form-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-form-btn iconify-icon {
  font-size: 1.2rem;
}

.form-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-submit {
  padding: 10px 20px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn.success {
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-btn.success:hover {
  background: #218838;
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

/* Loading animation */
.loading-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.loading-icon {
  animation: spin 1s linear infinite;
  margin-right: 8px;
  font-size: 18px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== PAYMENT MODAL STYLES ===== */
.payment-summary-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: #1a202c;
}

.summary-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-row.total {
  border-top: 2px solid #007bff;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 700;
  font-size: 1.1rem;
}

.summary-row .label {
  color: #64748b;
  font-weight: 500;
}

.summary-row .value {
  font-weight: 600;
  color: #1a202c;
}

.summary-row .value.discount {
  color: #059669;
}

.payment-methods-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.payment-method-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.payment-method-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.15);
}

.payment-method-card.active {
  border-color: #007bff;
  background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.25);
}

.method-icon {
  width: 48px;
  height: 48px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #007bff;
  flex-shrink: 0;
}

.payment-method-card.active .method-icon {
  background: #007bff;
  color: white;
}

.method-info {
  flex: 1;
}

.method-info h5 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.method-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.method-check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #007bff;
}

.payment-input-section {
  margin-bottom: 24px;
}

.payment-input-group {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input.large {
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: 600;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.payment-table {
  margin-top: 0;
}

.payment-table .amount {
  text-align: right;
  font-weight: 600;
}

.payment-table .amount.discount {
  color: #059669;
}

.payment-table .amount.paid {
  color: #007bff;
}

.payment-table .amount.change {
  color: #dc2626;
}

.payment-table .total-row {
  background: #f8fafc;
  border-top: 2px solid #007bff;
}

.payment-table .total-row td {
  padding: 16px 12px;
  font-size: 1.1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* Responsive Design for Payment Modal */
@media (max-width: 768px) {
  .payment-methods-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-method-card {
    padding: 16px;
  }
  
  .method-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .modal-container.large {
    max-width: 95vw;
    margin: 10px;
  }
  
  .modal-content {
    padding: 16px 20px;
  }
  
  .modal-header,
  .modal-footer {
    padding: 16px 20px;
  }
}

/* ===== PAYMENT MODAL STYLES ===== */
.payment-total-card {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.total-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  backdrop-filter: blur(10px);
}

.total-info {
  flex: 1;
}

.total-label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.total-amount {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.payment-methods-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.section-title iconify-icon {
  font-size: 20px;
  color: #3b82f6;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.payment-method-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.payment-method-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.payment-method-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.payment-method-card:hover::before {
  opacity: 1;
}

.payment-method-card.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

.method-icon {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6b7280;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.payment-method-card.active .method-icon {
  background: #3b82f6;
  color: white;
}

.method-icon.vnpay {
  background: white;
  border: 2px solid #e5e7eb;
  color: white;
}

.vnpay-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.method-info h5 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.method-info p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.method-check {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 20px;
  color: #10b981;
}

.payment-input-section {
  margin-bottom: 24px;
}

.input-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.input-card:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.input-header iconify-icon {
  font-size: 18px;
  color: #3b82f6;
}

.payment-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  background: transparent;
  padding: 8px 0;
}

.payment-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.payment-input.readonly {
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
}

.change-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  color: white;
}

.change-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.change-info {
  flex: 1;
}

.change-label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.change-amount {
  font-size: 20px;
  font-weight: 700;
}

/* Quantity Display Styles */
.qty-display {
  min-width: 50px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.qty-display:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.qty-display:active {
  transform: translateY(0);
}

/* Quantity Modal Styles */
.quantity-modal-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-info-modal {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.product-image-small {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details-modal {
  flex: 1;
}

.product-details-modal h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.product-details-modal p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.stock-info {
  color: #059669 !important;
  font-weight: 500 !important;
}

.quantity-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.quantity-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.qty-modal-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qty-modal-btn.minus {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.qty-modal-btn.plus {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.qty-modal-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.qty-modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.qty-modal-input {
  width: 80px;
  height: 44px;
  text-align: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  background: white;
  transition: border-color 0.2s ease;
}

.qty-modal-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quantity-range-info {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

/* Inline Quantity Modal Styles */
.inline-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.inline-quantity-modal-teleport {
  position: fixed;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 200px;
  transform: translateX(-50%);
  opacity: 0;
  animation: fadeInScale 0.15s ease forwards;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.inline-modal-content {
  padding: 16px;
}

.inline-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.inline-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inline-close-btn:hover {
  color: #ef4444;
}

.inline-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.inline-qty-input {
  flex: 1;
  height: 36px;
  text-align: center;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  background: white;
  transition: border-color 0.2s ease;
}

.inline-qty-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.inline-actions {
  display: flex;
  gap: 4px;
}

.inline-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.inline-btn.confirm {
  background: #10b981;
  color: white;
}

.inline-btn.confirm:hover {
  background: #059669;
  transform: translateY(-1px);
}

.inline-btn.cancel {
  background: #ef4444;
  color: white;
}

.inline-btn.cancel:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.inline-range-info {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  font-style: italic;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.combined-payment-section {
  margin-bottom: 24px;
}

.combined-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.combined-inputs .input-card {
  flex: 1;
  margin-bottom: 0;
}

.plus-divider {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6b7280;
  flex-shrink: 0;
}

.total-summary {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.summary-row {
  display: flex;
  justify-content: between;
  align-items: center;
  font-size: 16px;
}

.summary-row span {
  color: #64748b;
}

.summary-row strong {
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
}

/* Modal animations */
.modal-overlay {
  animation: fadeIn 0.3s ease;
}

.modal-container {
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .payment-methods-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .combined-inputs {
    flex-direction: column;
    gap: 12px;
  }
  
  .plus-divider {
    transform: rotate(90deg);
  }
  
  .total-amount {
    font-size: 24px;
  }
  
  .payment-total-card {
    padding: 20px;
  }
}

/* QR Scanner Styles */
.qr-scanner-btn {
  background: #007bff;
  color: white;
  margin-left: 8px;
  gap: 6px;
}

.qr-scanner-modal {
  max-width: 600px;
}

.qr-scanner-container {
  padding: 20px;
}

.scanner-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  text-align: center;
}

.camera-icon {
  font-size: 48px;
  color: #64748b;
  margin-bottom: 16px;
}

.scanner-placeholder p {
  color: #64748b;
  margin-bottom: 20px;
  font-size: 16px;
}

.scanner-active {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.scanner-video {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  width: 200px;
  height: 200px;
  border: 3px solid #3b82f6;
  border-radius: 12px;
  position: relative;
  background: transparent;
}

.scan-frame::before,
.scan-frame::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #10b981;
}

.scan-frame::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.scan-frame::after {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.scan-instruction {
  color: white;
  margin-top: 20px;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.scanner-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  pointer-events: auto;
}

.scanner-controls .btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.scan-result {
  margin-top: 20px;
  padding: 20px;
  background: #f0fdf4;
  border: 2px solid #10b981;
  border-radius: 12px;
}

.result-success {
  text-align: center;
}

.success-icon {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 12px;
}

.result-success p {
  margin: 8px 0;
  color: #065f46;
}

.result-text {
  font-family: monospace;
  background: #dcfce7;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  color: #166534;
}

@media (max-width: 768px) {
  .qr-scanner-modal {
    max-width: 95vw;
    margin: 20px;
  }
  
  .scanner-video {
    height: 300px;
  }
  
  .scan-frame {
    width: 150px;
    height: 150px;
  }
  
  .scanner-controls {
    flex-direction: column;
    width: 200px;
  }
}
</style>