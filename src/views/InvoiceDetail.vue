```html
<template>
  <div class="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-roboto">
    <div class="card mb-6 rounded-xl shadow-lg bg-white dark:bg-gray-800">
      <div class="p-6 sm:p-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <iconify-icon icon="solar:document-text-bold-duotone" class="text-3xl sm:text-4xl mr-3 text-blue-600" aria-hidden="true" />
          Chi tiết hóa đơn
        </h2>
        <div v-if="isLoading" class="text-center py-4 text-blue-500 flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mr-3"></div>
          Đang tải dữ liệu...
        </div>
        <div v-else-if="error" class="text-center py-4 text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
          <iconify-icon icon="solar:danger-bold-duotone" class="inline-block text-2xl mr-2" aria-hidden="true" />
          {{ error }}
        </div>
        <div v-else-if="!invoice" class="text-center py-4 text-gray-600 dark:text-gray-300">
          <iconify-icon icon="solar:cloud-cross-linear" class="inline-block text-4xl mb-2" aria-hidden="true" />
          Không có dữ liệu hóa đơn
        </div>
    <div v-else>
  <div class="flex flex-col sm:flex-row items-center justify-between mb-6">
    <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
      Hóa đơn <span class="text-blue-600 dark:text-blue-400">{{ invoice.maHoaDon || 'Không có dữ liệu' }}</span>
    </div>
    <div class="text-md sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
      Trạng thái: <span :class="getStatusColor(invoice?.trangThai?.id)">{{ getStatusText(invoice?.trangThai?.id) }}</span>
    </div>
  </div>

          <div class="relative mb-12 pt-10 pb-6">
            <div class="flex justify-between items-start progress-timeline">
              <div
                v-for="(step, index) in progressSteps"
                :key="step.id"
                class="flex-1 text-center progress-step"
                :class="{
                  'active': isStepCompleted(step.id),
                  'current': isCurrentStep(step.id),
                  'canceled': invoice.trangThai?.id === 22 && step.id === invoice.trangThai?.id
                }"
              >
                <div class="progress-icon-wrapper">
                  <iconify-icon
                    :icon="getStepIcon(step.id)"
                    class="progress-icon text-2xl"
                    aria-hidden="true"
                  ></iconify-icon>
                </div>
                <div class="text-sm mt-2 font-semibold text-gray-700 dark:text-gray-200">{{ step.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ getTimestampForStatus(step.id) ? formatDate(getTimestampForStatus(step.id)) : '' }}
                </div>
              </div>
            </div>
            <div class="absolute top-[48px] left-[5%] right-[5%] h-2 bg-gray-300 dark:bg-gray-700 rounded-full">
              <div
                class="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: progressLineWidth }"
              ></div>
            </div>
            <div
              v-if="invoice.trangThai?.id === 22"
              class="absolute top-[48px] left-[5%] right-[5%] h-2 bg-red-500 rounded-full transition-all duration-500 ease-in-out"
              :style="{ width: '100%' }"
            ></div>
          </div>

          <div class="mt-4 flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <select
              v-model="selectedStatus"
              class="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              aria-label="Chọn trạng thái mới"
              :class="{ 'border-red-500': !selectedStatus && formSubmitted }"
            >
              <option value="" disabled>Chọn trạng thái mới</option>
              <option v-for="status in statusOptions" :key="status.id" :value="status.id" :disabled="isStatusDisabled(status.id)">
                {{ status.text }}
              </option>
            </select>
            <p v-if="!selectedStatus && formSubmitted" class="text-red-500 text-xs mt-1">Vui lòng chọn trạng thái.</p>
            <button
              @click="showUpdateStatusModal"
              :disabled="!selectedStatus || isCurrentStatusSelected"
              class="w-full sm:w-auto btn-primary px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              aria-label="Cập nhật trạng thái hóa đơn"
            >
              Cập nhật trạng thái
            </button>
            <div v-if="lastUpdateTime" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Cập nhật lần cuối: {{ lastUpdateTime }}
            </div>
            <button
              v-if="canCancel"
              @click="showCancelOrderModal"
              class="w-full sm:w-auto btn-danger px-6 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition duration-300 shadow-md"
              aria-label="Hủy đơn hàng"
            >
              Hủy đơn
            </button>
            <button
              @click="showStatusHistoryModal = true"
              class="w-full sm:w-auto btn-secondary px-4 py-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition duration-300 shadow-md flex items-center"
              aria-label="Xem lịch sử cập nhật trạng thái"
            >
              <iconify-icon icon="solar:clock-circle-bold-duotone" class="mr-2" aria-hidden="true" />
              Xem lịch sử cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-6 rounded-xl shadow-lg bg-white dark:bg-gray-800" v-if="!isLoading && !error && invoice">
      <div class="p-6 sm:p-8">
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <iconify-icon icon="solar:clipboard-text-bold-duotone" class="text-3xl sm:text-4xl mr-3 text-orange-600" aria-hidden="true" />
          Thông tin đơn hàng
        </h3>
        <div class="overflow-x-auto">
          <table class="table w-full text-gray-700 dark:text-gray-200">
            <tbody>
              <tr>
                <td class="p-3 font-medium text-gray-800 dark:text-gray-100 w-1/3 sm:w-1/4">Mã hóa đơn</td>
                <td class="p-3 font-semibold">{{ invoice.maHoaDon || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="p-3 font-medium text-gray-800 dark:text-gray-100">Tên khách hàng</td>
                <td class="p-3">{{ invoice.khachHang?.tenKhachHang || 'Khách lẻ' }}</td>
              </tr>
              <tr>
                <td class="p-3 font-medium text-gray-800 dark:text-gray-100">Số điện thoại</td>
                <td class="p-3">{{ invoice.khachHang?.soDienThoai || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="p-3 font-medium text-gray-800 dark:text-gray-100">Mã vận đơn</td>
                <td class="p-3">{{ invoice.maVanDon || 'Chưa có' }}</td>
              </tr>
            </tbody>
          </table>
         <div class="mt-4">
    <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Chi tiết thanh toán</h4>
    <div class="flex flex-col space-y-2">
      <div class="flex justify-between">
        <span class="text-gray-700 dark:text-gray-300">Tổng tiền sản phẩm:</span>
        <span class="font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(totalProductPrice) }}</span>
      </div>
      <div v-if="invoice.phiVanChuyen > 0" class="flex justify-between">
        <span class="text-gray-700 dark:text-gray-300">+ Phí ship:</span>
        <span class="font-semibold text-green-600 dark:text-green-400">{{ formatCurrency(invoice.phiVanChuyen) }}</span>
      </div>
      <div v-if="invoice.tienVoucher > 0" class="flex justify-between">
        <span class="text-gray-700 dark:text-gray-300">- Voucher:</span>
        <span class="font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(invoice.tienVoucher) }}</span>
      </div>
      <div class="flex justify-between font-bold border-t pt-2">
        <span class="text-gray-900 dark:text-gray-100">Tổng tiền thanh toán:</span>
        <span class="text-blue-600 dark:text-blue-400">{{ formatCurrency(invoice.tongTienThanhToan) }}</span>
      </div>
    </div>
</div>
        </div>
        <div class="mt-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            @click="showOrderDetailsModal = true"
            class="btn-secondary px-4 py-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition duration-300 shadow-md flex items-center"
            aria-label="Xem chi tiết đơn hàng"
          >
            <iconify-icon icon="solar:info-circle-bold-duotone" class="mr-2" aria-hidden="true" />
            Xem chi tiết đơn hàng
          </button>
          <button
            @click="showProgressModal = true"
            class="btn-secondary px-4 py-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition duration-300 shadow-md flex items-center"
            aria-label="Xem tiến độ đơn hàng"
          >
            <iconify-icon icon="solar:clock-circle-bold-duotone" class="mr-2" aria-hidden="true" />
            Xem tiến độ đơn hàng
          </button>
        </div>
      </div>
    </div>

    <!-- Phần Lịch sử thanh toán -->
    <div class="card rounded-xl shadow-lg bg-white dark:bg-gray-800" v-if="!isLoading && !error && invoice">
      <div class="p-6 sm:p-8">
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <iconify-icon icon="solar:wallet-bold-duotone" class="text-3xl sm:text-4xl mr-3 text-emerald-600" aria-hidden="true" />
          Lịch sử thanh toán
        </h3>
        <div class="overflow-x-auto">
          <table class="table w-full min-w-[500px] text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th class="p-3 text-left">Ngày</th>
                <th class="p-3 text-left">Số tiền</th>
                <th class="p-3 text-left">Ghi chú/Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paymentHistory.length === 0">
                <td colspan="3" class="text-center py-4 text-gray-500 dark:text-gray-400">Chưa có lịch sử thanh toán</td>
              </tr>
              <tr v-for="(payment, index) in paymentHistory" :key="index" :class="{'bg-red-50 dark:bg-red-950': payment.soTien < 0}">
                <td class="p-3">{{ formatDate(payment.ngayThanhToan) }}</td>
                <td class="p-3 font-semibold" :class="{'text-red-500': payment.soTien < 0, 'text-green-500': payment.soTien > 0}">
                  {{ payment.soTien === 0 ? '-' : formatCurrency(payment.soTien) }}
                </td>
                <td class="p-3">{{ payment.ghiChu || payment.trangThai || '-' }}</td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-gray-800 dark:text-gray-100" colspan="1">Tổng tiền khách đã thanh toán (net):</td>
                <td class="p-3 font-bold text-blue-600 dark:text-blue-400" colspan="2">{{ formatCurrency(totalPaidAmountNet) }}</td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-gray-800 dark:text-gray-100" colspan="1">Tổng tiền đã hoàn:</td>
                <td class="p-3 font-bold text-red-600 dark:text-red-400" colspan="2">{{ formatCurrency(totalRefundedAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex flex-col items-end space-y-3">
          <button
            v-if="isPaymentConfirmed"
            @click="printInvoice"
            class="btn-print px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300 shadow-md flex items-center"
            aria-label="In hóa đơn"
          >
            <iconify-icon icon="solar:printer-bold-duotone" class="mr-2 text-lg" aria-hidden="true" /> In hóa đơn
          </button>
         <button v-if="!isFullyPaid && !hasReturnedProducts" @click="showAddPaymentModal = true" class="btn-primary px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300 shadow-md flex items-center"
            :disabled="invoice.trangThai?.id === 21 || invoice.trangThai?.id === 22 || invoice.trangThai?.id === 23"
            aria-label="Xác nhận thanh toán"
          >
            <iconify-icon icon="solar:check-circle-bold-duotone" class="mr-2" aria-hidden="true" /> Xác nhận thanh toán
          </button>
          <div v-else-if="isPaymentConfirmed" class="text-green-600 dark:text-green-400 font-semibold text-sm mt-2 flex items-center">
            <iconify-icon icon="solar:check-circle-bold" class="inline-block mr-1 text-lg" aria-hidden="true" /> Bạn đã xác nhận thanh toán này rồi.
          </div>
        </div>
      </div>
    </div>

    <!-- Phần Sản phẩm đã mua -->
    <div class="card rounded-xl shadow-lg bg-white dark:bg-gray-800" v-if="!isLoading && !error && invoice">
      <div class="p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <iconify-icon icon="solar:bag-bold-duotone" class="text-3xl sm:text-4xl mr-3 text-purple-600" aria-hidden="true" />
            Thông tin sản phẩm đã mua
          </h3>
          <button
            @click="showReturnAllProductsModal"
            class="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition duration-300 shadow-md mt-3 sm:mt-0"
            :disabled="!canReturn || invoice.trangThai?.id === 22 || invoice.trangThai?.id === 23"
            aria-label="Trả toàn bộ sản phẩm"
          >
            Trả hàng
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="table w-full min-w-[900px] text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th class="p-3 text-left">STT</th>
                <th class="p-3 text-left">Tên sản phẩm</th>
                <th class="p-3 text-left">Chất liệu</th>
                <th class="p-3 text-left">Size</th>
                <th class="p-3 text-left">Màu sắc</th>
                <th class="p-3 text-left">Số lượng</th>
                <th class="p-3 text-left">Đơn giá</th>
                <th class="p-3 text-left">Thành tiền</th>
                <th class="p-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="products.length === 0">
                <td colspan="9" class="text-center py-4 text-gray-500 dark:text-gray-400">Chưa có sản phẩm</td>
              </tr>
              <tr v-for="(product, index) in products" :key="product.uniqueId" :class="{ 'blinking-red-row': isBlinking }">
                <td class="p-3">{{ index + 1 }}</td>
                <td class="p-3">{{ product.tenSanPham || 'Chưa xác định' }}</td>
                <td class="p-3">{{ product.chatLieu || 'N/A' }}</td>
                <td class="p-3">{{ product.size || 'N/A' }}</td>
                <td class="p-3">{{ product.mauSac || 'N/A' }}</td>
                <td class="p-3">{{ product.soLuong || 0 }}</td>
                <td class="p-3">{{ formatCurrency(product.donGia) }}</td>
                <td class="p-3 font-semibold">{{ formatCurrency(product.thanhTien) }}</td>
                <td class="p-3">
                  <button
                    @click="showReturnSingleProductModal(product)"
                    class="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition duration-300"
                    :disabled="!canReturn || invoice.trangThai?.id === 22 || invoice.trangThai?.id === 23 || getRemainingQuantity(product) <= 0"
                    aria-label="Trả sản phẩm"
                  >
                    Trả hàng
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Phần Sản phẩm đã trả lại -->
    <div class="card rounded-xl shadow-lg mt-6 bg-white dark:bg-gray-800" v-if="returnedProducts.length > 0" :key="`returned-products-${isBlinking}`">
      <div class="p-6 sm:p-8">
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <iconify-icon icon="solar:refresh-circle-bold-duotone" class="text-3xl sm:text-4xl mr-3 text-red-600" aria-hidden="true" />
          Sản phẩm đã trả lại
        </h3>
        <div class="overflow-x-auto">
          <table class="table w-full min-w-[900px] text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th class="p-3 text-left">STT</th>
                <th class="p-3 text-left">Tên sản phẩm</th>
                <th class="p-3 text-left">Chất liệu</th>
                <th class="p-3 text-left">Size</th>
                <th class="p-3 text-left">Màu sắc</th>
                <th class="p-3 text-left">Số lượng trả</th>
                <th class="p-3 text-left">Đơn giá</th>
                <th class="p-3 text-left">Thành tiền hoàn</th>
                <th class="p-3 text-left">Lý do</th>
                <th class="p-3 text-left">Ngày trả</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in returnedProducts" :key="item.uniqueId" :class="{ 'blinking-red-row': isBlinking }" class="bg-red-50 dark:bg-red-950">
                <td class="p-3">{{ index + 1 }}</td>
                <td class="p-3">{{ item.tenSanPham || 'N/A' }}</td>
                <td class="p-3">{{ item.chatLieu || 'N/A' }}</td>
                <td class="p-3">{{ item.size || 'N/A' }}</td>
                <td class="p-3">{{ item.mauSac || 'N/A' }}</td>
                <td class="p-3">{{ item.returnQuantity || 0 }}</td>
                <td class="p-3">{{ formatCurrency(item.donGia) }}</td>
                <td class="p-3 font-semibold text-red-600">{{ formatCurrency(item.thanhTienHoan) }}</td>
                <td class="p-3">{{ item.reason || 'N/A' }}</td>
                <td class="p-3">{{ formatDate(item.returnDate) || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4 text-right">
            <strong class="text-lg text-gray-900 dark:text-gray-100">Tổng tiền hoàn trả: </strong>
            <span class="font-bold text-red-600 text-lg">{{ formatCurrency(totalReturnAmount) }}</span>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              v-if="canRefund"
              @click="openRefundModal"
              class="btn-primary px-6 py-2.5 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition duration-300 shadow-md flex items-center"
              aria-label="Xác nhận hoàn tiền"
            >
              <iconify-icon icon="solar:refresh-circle-bold-duotone" class="mr-2" aria-hidden="true" />
              Xác nhận hoàn tiền
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận cập nhật trạng thái -->
    <div v-if="showUpdateModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm m-4 animate__animated animate__zoomIn">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Xác nhận cập nhật trạng thái</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-6">Bạn có chắc chắn muốn cập nhật trạng thái hóa đơn này thành '<span class="font-semibold text-blue-600">{{ getStatusText(selectedStatus) }}</span>'?</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showUpdateModal = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors duration-200"
            aria-label="Hủy cập nhật trạng thái"
          >
            Hủy bỏ
          </button>
          <button
            @click="confirmUpdateStatus"
            class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200"
            aria-label="Xác nhận cập nhật trạng thái"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>

  <div v-if="showCancelModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm m-4 animate__animated animate__zoomIn">
    <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Xác nhận hủy đơn hàng</h3>
    <div class="mb-4">
      <label for="cancelReason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        <span class="text-red-500">*</span> Lý do hủy
      </label>
      <textarea
        id="cancelReason"
        v-model="cancelReason"
        rows="3"
        class="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        placeholder="Nhập lý do hủy đơn hàng..."
        required
        aria-describedby="cancelReasonError"
        :class="{ 'border-red-500': !cancelReason && formSubmitted }"
      ></textarea>
      <p v-if="!cancelReason && formSubmitted" class="text-red-500 text-xs mt-1" id="cancelReasonError">Vui lòng nhập lý do hủy.</p>
    </div>
    <div class="flex justify-end space-x-3">
      <button
        @click="closeCancelOrderModal"
        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors duration-200"
        aria-label="Hủy bỏ hủy đơn hàng"
      >
        Hủy bỏ
      </button>
      <button
        @click="confirmCancelOrder"
        class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors duration-200"
        aria-label="Xác nhận hủy đơn hàng"
      >
        Hủy đơn
      </button>
    </div>
  </div>
</div>

    <!-- Modal Xác nhận hoàn tiền -->
    <div v-if="showRefundModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md m-4 animate__animated animate__zoomIn">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Xác nhận Hoàn tiền</h3>
          <button @click="closeRefundModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Đóng modal hoàn tiền">
            <iconify-icon icon="ic:round-close" class="text-2xl" aria-hidden="true" />
          </button>
        </div>
        <div v-if="refundSuccessMessage" class="mb-4 text-green-500 bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
          <iconify-icon icon="solar:check-circle-bold-duotone" class="inline-block text-2xl mr-2" aria-hidden="true" />
          {{ refundSuccessMessage }}
        </div>
        <div v-else-if="refundErrorMessage" class="mb-4 text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
          <iconify-icon icon="solar:danger-bold-duotone" class="inline-block text-2xl mr-2" aria-hidden="true" />
          {{ refundErrorMessage }}
        </div>
        <div class="mb-4">
          <label for="refundAmountInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span class="text-red-500">*</span> Số tiền hoàn
          </label>
          <div class="relative rounded-md shadow-sm">
            <input
              type="number"
              id="refundAmountInput"
              v-model.number="refundAmount"
              class="block w-full pr-12 pl-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              placeholder="0"
              min="0"
              :max="maxRefundPossible"
              required
              aria-describedby="refundAmountError"
              :class="{ 'border-red-500': (refundAmount <= 0 || refundAmount > maxRefundPossible) && formSubmitted }"
              @input="validateRefundAmount"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm dark:text-gray-400">VND</span>
            </div>
          </div>
          <p v-if="refundAmount <= 0 && formSubmitted" class="text-red-500 text-xs mt-1" id="refundAmountError">Vui lòng nhập số tiền hoàn lớn hơn 0.</p>
          <p v-if="refundAmount > maxRefundPossible && formSubmitted" class="text-red-500 text-xs mt-1" id="refundAmountError">Số tiền hoàn không được vượt quá {{ formatCurrency(maxRefundPossible) }}.</p>
        </div>
        <div class="mb-4">
          <label for="refundNote" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span class="text-red-500">*</span> Ghi chú
          </label>
          <textarea
            id="refundNote"
            v-model="refundNote"
            rows="3"
            class="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            placeholder="Nhập ghi chú hoàn tiền..."
            required
            aria-describedby="refundNoteError"
            :class="{ 'border-red-500': !refundNote.trim() && formSubmitted }"
          ></textarea>
          <p v-if="!refundNote.trim() && formSubmitted" class="text-red-500 text-xs mt-1" id="refundNoteError">Vui lòng nhập ghi chú.</p>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="closeRefundModal"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors duration-200"
            aria-label="Hủy hoàn tiền"
          >
            Hủy
          </button>
          <button
            @click="confirmRefund"
            :disabled="!isValidRefund || isRefunding"
            class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Xác nhận hoàn tiền"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Trả hàng -->
    <div v-if="showReturnModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl m-4 animate__animated animate__zoomIn">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Xác nhận Trả hàng</h3>
          <button @click="cancelReturn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Đóng modal trả hàng">
            <iconify-icon icon="ic:round-close" class="text-2xl" aria-hidden="true" />
          </button>
        </div>
        <div v-if="errorMessage" class="mb-4 text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
          <iconify-icon icon="solar:danger-bold-duotone" class="inline-block text-2xl mr-2" aria-hidden="true" />
          {{ errorMessage }}
        </div>
        <div class="mb-4">
          <label for="returnReason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span class="text-red-500">*</span> Lý do trả hàng
          </label>
          <textarea
            id="returnReason"
            v-model="returnReason"
            rows="3"
            class="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            placeholder="Ví dụ: Sản phẩm bị lỗi, khách đổi ý,..."
            required
            aria-describedby="returnReasonError"
            :class="{ 'border-red-500': !returnReason && formSubmitted }"
          ></textarea>
          <p v-if="!returnReason && formSubmitted" class="text-red-500 text-xs mt-1" id="returnReasonError">Vui lòng nhập lý do trả hàng.</p>
        </div>
        <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Sản phẩm cần trả:</h4>
        <div class="overflow-x-auto max-h-[40vh] mb-4">
          <table class="table w-full min-w-[1000px] text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th class="p-3 text-left">Tên sản phẩm</th>
                <th class="p-3 text-left">Chất liệu</th>
                <th class="p-3 text-left">Size</th>
                <th class="p-3 text-left">Màu sắc</th>
                <th class="p-3 text-left">SL đã mua</th>
                <th class="p-3 text-left">SL còn lại</th>
                <th class="p-3 text-left">SL trả lại</th>
                <th class="p-3 text-left">Đơn giá</th>
                <th class="p-3 text-left">Thành tiền hoàn</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in productsToReturnInModal" :key="index">
                <td class="p-3">{{ item.tenSanPham }}</td>
                <td class="p-3">{{ item.chatLieu || 'N/A' }}</td>
                <td class="p-3">{{ item.size || 'N/A' }}</td>
                <td class="p-3">{{ item.mauSac || 'N/A' }}</td>
                <td class="p-3">{{ item.soLuongGoc }}</td>
                <td class="p-3">{{ item.soLuongConLai }}</td>
                <td class="p-3">
                  <input
                    type="number"
                    v-model.number="item.returnQuantity"
                    :max="item.soLuongConLai"
                    min="0"
                    class="w-20 border border-gray-300 rounded-md text-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    @input="validateReturnQuantity(item)"
                    aria-describedby="returnQuantityError"
                    :class="{ 'border-red-500': item.returnQuantityError && formSubmitted }"
                  />
                  <p v-if="item.returnQuantityError && formSubmitted" class="text-red-500 text-xs mt-1" :id="'returnQuantityError-' + index">{{ item.returnQuantityError }}</p>
                </td>
                <td class="p-3">{{ formatCurrency(item.donGia) }}</td>
                <td class="p-3 font-semibold">{{ formatCurrency(calculateSingleReturnAmount(item)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-between items-center mb-6 text-gray-700 dark:text-gray-300">
          <span>Tổng tiền hoàn trả dự kiến:</span>
          <span class="font-bold text-red-600 dark:text-red-400">{{ formatCurrency(calculateModalTotalReturnAmount) }}</span>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelReturn"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors duration-200"
            aria-label="Hủy trả hàng"
          >
            Hủy
          </button>
          <button
            @click="confirmReturn"
            :disabled="!isReturnFormValid"
            class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Xác nhận trả hàng"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết đơn hàng -->
    <div v-if="showOrderDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg m-4 animate__animated animate__zoomIn">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Chi tiết thông tin đơn hàng</h3>
          <button @click="showOrderDetailsModal = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Đóng modal chi tiết đơn hàng">
            <iconify-icon icon="ic:round-close" class="text-2xl" aria-hidden="true" />
          </button>
        </div>
        <div class="overflow-y-auto max-h-[70vh] pr-2">
          <table class="w-full text-gray-700 dark:text-gray-200 mb-4">
            <tbody>
              <tr>
                <td class="p-2 font-medium text-gray-800 dark:text-gray-100 w-1/3">Mã hóa đơn:</td>
                <td class="p-2">{{ invoice.maHoaDon || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="p-2 font-medium text-gray-800 dark:text-gray-100">Tên khách hàng:</td>
                <td class="p-2">{{ invoice.khachHang?.tenKhachHang || 'Khách lẻ' }}</td>
              </tr>
              <tr>
                <td class="p-2 font-medium text-gray-800 dark:text-gray-100">Số điện thoại:</td>
                <td class="p-2">{{ invoice.khachHang?.soDienThoai || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="p-2 font-medium text-gray-800 dark:text-gray-100">Địa chỉ:</td>
                <td class="p-2">{{ invoice.khachHang?.diaChi || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="p-2 font-medium text-gray-800 dark:text-gray-100">Ngày tạo:</td>
                <td class="p-2">{{ formatDate(invoice.ngayTao) }}</td>
              </tr>
              <tr>
                <td class="p-2 font-medium text-gray-800 dark:text-gray-100">Mã vận đơn:</td>
                <td class="p-2">{{ invoice.maVanDon || 'Chưa có' }}</td>
              </tr>
            </tbody>
          </table>
          <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Chi tiết thanh toán:</h4>
          <div class="flex flex-col space-y-2 mb-4">
            <div class="flex justify-between">
              <span class="text-gray-700 dark:text-gray-300">Tổng tiền sản phẩm:</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(totalProductPrice) }}</span>
            </div>
            <div v-if="invoice.phiShip > 0" class="flex justify-between">
              <span class="text-gray-700 dark:text-gray-300">+ Phí ship:</span>
              <span class="font-semibold text-green-600 dark:text-green-400">{{ formatCurrency(invoice.phiVanChuyen) }}</span>
            </div>
            <div v-if="invoice.voucher > 0" class="flex justify-between">
              <span class="text-gray-700 dark:text-gray-300">- Voucher:</span>
              <span class="font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(invoice.voucher) }}</span>
            </div>
            <div class="flex justify-between font-bold border-t pt-2">
              <span class="text-gray-900 dark:text-gray-100">Tổng tiền thanh toán:</span>
              <span class="text-blue-600 dark:text-blue-400">{{ formatCurrency(invoice.tongTienThanhToan) }}</span>
            </div>
          </div>
          <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Sản phẩm:</h4>
          <div class="overflow-x-auto mb-4">
            <table class="table w-full text-gray-700 dark:text-gray-200">
              <thead>
                <tr>
                  <th class="p-3 text-left">Sản phẩm</th>
                  <th class="p-3 text-left">Số lượng</th>
                  <th class="p-3 text-left">Đơn giá</th>
                  <th class="p-3 text-left">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="products.length === 0">
                  <td colspan="4" class="text-center py-2 text-gray-500 dark:text-gray-400">Không có sản phẩm</td>
                </tr>
                <tr v-for="product in products" :key="product.uniqueId">
                  <td class="p-2">{{ product.tenSanPham || 'N/A' }}</td>
                  <td class="p-2">{{ product.soLuong || 0 }}</td>
                  <td class="p-2">{{ formatCurrency(product.donGia) }}</td>
                  <td class="p-2">{{ formatCurrency(product.thanhTien) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Lịch sử thanh toán:</h4>
          <div class="overflow-x-auto">
            <table class="table w-full text-gray-700 dark:text-gray-200">
              <thead>
                <tr>
                  <th class="p-3 text-left">Ngày</th>
                  <th class="p-3 text-left">Số tiền</th>
                  <th class="p-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paymentHistory.length === 0">
                  <td colspan="3" class="text-center py-2 text-gray-500 dark:text-gray-400">Không có lịch sử thanh toán</td>
                </tr>
                <tr v-for="payment in paymentHistory" :key="payment.ngayThanhToan" :class="{'bg-red-50 dark:bg-red-950': payment.soTien < 0}">
                  <td class="p-2">{{ formatDate(payment.ngayThanhToan) }}</td>
                  <td class="p-2">{{ formatCurrency(payment.soTien) }}</td>
                  <td class="p-2">{{ payment.trangThai || payment.ghiChu || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="flex justify-end mt-6">
          <button
            @click="showOrderDetailsModal = false"
            class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200"
            aria-label="Đóng modal chi tiết đơn hàng"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tiến độ đơn hàng -->
    <div v-if="showProgressModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl m-4 animate__animated animate__zoomIn">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <iconify-icon icon="solar:clock-circle-bold-duotone" class="text-3xl mr-3 text-blue-600" aria-hidden="true" />
            Tiến độ đơn hàng
          </h3>
          <button @click="showProgressModal = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Đóng modal tiến độ đơn hàng">
            <iconify-icon icon="ic:round-close" class="text-3xl" aria-hidden="true" />
          </button>
        </div>
        <div class="overflow-y-auto max-h-[70vh] pr-2">
          <div class="space-y-4">
            <div v-for="(status, index) in invoice.statusHistory" :key="index" class="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
              <div class="flex-shrink-0 w-12 h-12 mt-1 mr-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <iconify-icon :icon="getStatusIcon(status.statusId)" class="text-2xl text-blue-600 dark:text-blue-300" aria-hidden="true" />
                </div>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ getStatusText(status.statusId) }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(status.timestamp) }}</span>
                </div>
                <div class="text-gray-600 dark:text-gray-300">{{ status.note || '-' }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">Người tạo: {{ status.createdBy || 'admin' }}</div>
              </div>
            </div>
            <div v-if="invoice.statusHistory && invoice.statusHistory.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">
              <iconify-icon icon="solar:info-circle-linear" class="text-4xl mb-2" aria-hidden="true" />
              Không có tiến độ
            </div>
          </div>
        </div>
        <div class="flex justify-end mt-6">
          <button
            @click="showProgressModal = false"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 flex items-center"
            aria-label="Đóng modal tiến độ đơn hàng"
          >
            <iconify-icon icon="solar:check-circle-bold-duotone" class="mr-2" aria-hidden="true" /> Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Lịch sử cập nhật trạng thái -->
    <div v-if="showStatusHistoryModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg m-4 animate__animated animate__zoomIn">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Lịch sử cập nhật trạng thái</h3>
          <button @click="showStatusHistoryModal = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Đóng modal lịch sử cập nhật trạng thái">
            <iconify-icon icon="ic:round-close" class="text-2xl" aria-hidden="true" />
          </button>
        </div>
        <div class="overflow-y-auto max-h-[70vh] pr-2">
          <table class="table w-full text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th class="p-3 text-left">Trạng thái</th>
                <th class="p-3 text-left">Thời gian</th>
                <th class="p-3 text-left">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="invoice.statusHistory && invoice.statusHistory.length === 0">
                <td colspan="3" class="text-center py-4 text-gray-500 dark:text-gray-400">Không có lịch sử cập nhật</td>
              </tr>
              <tr v-for="(status, index) in invoice.statusHistory" :key="index">
                <td class="p-3">{{ getStatusText(status.statusId) }}</td>
                <td class="p-3">{{ formatDate(status.timestamp) }}</td>
                <td class="p-3">{{ status.note || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-end mt-6">
          <button
            @click="showStatusHistoryModal = false"
            class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200"
            aria-label="Đóng modal lịch sử cập nhật trạng thái"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận thanh toán -->
    <div v-if="showAddPaymentModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md m-4 animate__animated animate__zoomIn">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Xác nhận thanh toán</h3>
          <button @click="showAddPaymentModal = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Đóng modal xác nhận thanh toán">
            <iconify-icon icon="ic:round-close" class="text-2xl" aria-hidden="true" />
          </button>
        </div>
        <div class="mb-4">
          <label for="paidAmountInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span class="text-red-500">*</span> Số tiền khách đưa
          </label>
          <div class="relative rounded-md shadow-sm">
<input
  type="number"
  id="paidAmountInput"
  v-model.number="paidAmountInput"
  @input="validatePaymentAmount"
  class="block w-full pr-12 pl-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
  placeholder="0"
  min="0"
  :max="maxPaymentPossible"
  required
  aria-describedby="paidAmountError"
  :class="{ 'border-red-500': (!paidAmountInput || paidAmountInput > maxPaymentPossible) && formSubmitted }"
/>
<p v-if="!paidAmountInput && formSubmitted" class="text-red-500 text-xs mt-1" id="paidAmountError">Vui lòng nhập số tiền.</p>
<p v-if="paidAmountInput > maxPaymentPossible && formSubmitted" class="text-red-500 text-xs mt-1" id="paidAmountError">Số tiền thanh toán không được vượt quá {{ formatCurrency(maxPaymentPossible) }}.</p>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm dark:text-gray-400">VND</span>
            </div>
          </div>
          <p v-if="!paidAmountInput && formSubmitted" class="text-red-500 text-xs mt-1" id="paidAmountError">Vui lòng nhập số tiền.</p>
        </div>
        <div class="mb-4">
          <label for="paymentNote" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span class="text-red-500">*</span> Ghi chú
          </label>
          <textarea
            id="paymentNote"
            v-model="paymentNote"
            rows="3"
            class="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            placeholder="Nhập ghi chú thanh toán..."
            required
            aria-describedby="paymentNoteError"
            :class="{ 'border-red-500': !paymentNote && formSubmitted }"
          ></textarea>
          <p v-if="!paymentNote && formSubmitted" class="text-red-500 text-xs mt-1" id="paymentNoteError">Vui lòng nhập ghi chú.</p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phương thức thanh toán</label>
          <div class="flex space-x-4">
            <label class="flex items-center cursor-pointer p-2 border border-gray-300 rounded-lg dark:border-gray-600" :class="{'bg-blue-50 dark:bg-blue-950 border-blue-500': paymentMethod === 'cash'}">
              <input type="radio" v-model="paymentMethod" value="cash" class="mr-2" required aria-describedby="paymentMethodError" />
              <iconify-icon icon="solar:wallet-bold-duotone" class="mr-1 text-blue-600" aria-hidden="true" /> Tiền mặt
            </label>
            <label class="flex items-center cursor-pointer p-2 border border-gray-300 rounded-lg dark:border-gray-600" :class="{'bg-blue-50 dark:bg-blue-950 border-blue-500': paymentMethod === 'transfer'}">
              <input type="radio" v-model="paymentMethod" value="transfer" class="mr-2" required aria-describedby="paymentMethodError" />
              <iconify-icon icon="solar:bank-bold-duotone" class="mr-1 text-blue-600" aria-hidden="true" /> Chuyển khoản
            </label>
          </div>
          <p v-if="!paymentMethod && formSubmitted" class="text-red-500 text-xs mt-1" id="paymentMethodError">Vui lòng chọn phương thức thanh toán.</p>
        </div>
        <div class="mb-4 text-gray-700 dark:text-gray-300">
          <p><strong>Số tiền cần thanh toán:</strong> <span class="font-bold text-blue-600">{{ formatCurrency(invoice.tongTienThanhToan || 0) }}</span></p>
          <p v-if="amountOwed > 0">
            <strong>Số tiền khách phải trả thêm:</strong> <span class="font-bold text-red-600">{{ formatCurrency(amountOwed) }}</span>
          </p>
          <p v-if="changeAmount > 0">
            <strong>Tiền thừa trả khách:</strong> <span class="font-bold text-green-600">{{ formatCurrency(changeAmount) }}</span>
          </p>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="showAddPaymentModal = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors duration-200"
            aria-label="Hủy xác nhận thanh toán"
          >
            Hủy
          </button>
          <button
            @click="confirmAddPayment"
            :disabled="!isValidPayment"
            class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Xác nhận thanh toán"
          >
            Xác nhận
          </button>
          <button
            v-if="showPrintButton"
            @click="printInvoice"
            class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 flex items-center"
            aria-label="In hóa đơn"
          >
            <iconify-icon icon="solar:printer-bold-duotone" class="mr-2 text-lg" aria-hidden="true" /> In hóa đơn
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```
<script>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';

// Mock data for fallback and development
const mockInvoice = {
  id: 79,
  maHoaDon: 'HD15030032',
  khachHang: { tenKhachHang: 'Nguyễn Văn A', soDienThoai: '0901234567', diaChi: 'Số 8, Xã Tân Quang, Huyện Văn Lâm, Tỉnh Hưng Yên' },
  maVanDon: 'CHƯA_CÓ',
  ngayTao: '2025-07-03T15:00:00Z',
  tongTienThanhToan: 2000000,
  voucher: 200000,
  phiShip: 30000,
  trangThai: { id: 21 },
  paymentHistory: [],
  products: [
    {
      productId: 'P001',
      tenSanPham: 'Giày MLB Chunky Wide New York',
      soLuong: 2,
      donGia: 1500000,
      thanhTien: 3000000,
      chatLieu: 'Da tổng hợp',
      size: '40',
      mauSac: 'Đen',
      uniqueId: Math.random().toString(36).substr(2, 9)
    },
    {
      productId: 'P002',
      tenSanPham: 'Áo phông Unisex Basic',
      soLuong: 3,
      donGia: 500000,
      thanhTien: 1500000,
      chatLieu: 'Cotton',
      size: 'M',
      mauSac: 'Trắng',
      uniqueId: Math.random().toString(36).substr(2, 9)
    },
  ],
  statusHistory: [
    { statusId: 1, timestamp: '2025-07-03T15:21:20Z', createdBy: 'admin', note: 'Đơn hàng được tạo' },
  ],
};

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export default {
  name: 'InvoiceDetail',
  components: {
    'iconify-icon': Icon
  },
  setup() {
    const route = useRoute();
    // Khởi tạo invoiceId với giá trị mặc định an toàn
    const invoiceId = ref(route.params.id || '');
    console.log('route.params.id:', route.params.id); // Debug giá trị route.params.id
    console.log('invoiceId.value:', invoiceId.value); // Debug giá trị invoiceId
    const paymentSuccessMessage = ref(''); // Khai báo
const newPaymentAmount = ref(0); // Đảm bảo đã khai báo như thế này
   
    const cancelReason = ref('');
    const toast = useToast();
   
    const isLoading = ref(false);
    const error = ref(null);
    const invoice = ref(null);
     const paymentHistory = ref([]); 
    const products = ref([]);
    const selectedStatus = ref('');
    const showUpdateModal = ref(false);
    const showCancelModal = ref(false);
    const showRefundModal = ref(false);
    const showOrderDetailsModal = ref(false);
    const showProgressModal = ref(false);
    const showStatusHistoryModal = ref(false);
    const refundAmount = ref(0);
    const refundNote = ref('');
    const showAddPaymentModal = ref(false);
    const paymentNote = ref('');
    const paymentMethod = ref('cash');
    
    const paidAmountInput = ref(0);
    const showReturnModal = ref(false);
    const productsToReturnInModal = ref([]);
    const returnReason = ref('');
    const returnedProducts = ref([]);
    const formSubmitted = ref(false);
    const isBlinking = ref(false);
    const showPrintButton = ref(false);
    const paymentErrorMessage = ref('');
const tongTienSanPham = ref(0);
 
   

   

      const getStatusClass = (status) => {
      switch (status) {
        case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      }
    };

    const getPaymentStatusClass = (status) => {
      switch (status) {
        case 'success': return 'text-green-600 dark:text-green-400';
        case 'failed': return 'text-red-600 dark:text-red-400';
        case 'pending': return 'text-yellow-600 dark:text-yellow-400';
        default: return 'text-gray-600 dark:text-gray-400';
      }
    };

        const openAddPaymentModal = () => {
      showAddPaymentModal.value = true;
      newPaymentAmount.value = remainingBalance.value > 0 ? remainingBalance.value : 0; // Đặt giá trị mặc định là số dư còn lại
      paymentNote.value = '';
      formSubmitted.value = false;
      paymentSuccessMessage.value = '';
      paymentErrorMessage.value = '';
    };

    const closeAddPaymentModal = () => {
      showAddPaymentModal.value = false;
      newPaymentAmount.value = 0;
      paymentNote.value = '';
      formSubmitted.value = false;
      paymentSuccessMessage.value = '';
      paymentErrorMessage.value = '';
    };

    
    // Computed properties
   const totalProductPrice = computed(() => {
  if (invoice.value?.isOnlineOrder) {
    // Đối với đơn hàng online, tính từ products nếu không có tongTienSanPham
    return products.value.reduce((sum, product) => sum + (product.thanhTien || 0), 0);
  }
  // Đối với đơn hàng local, sử dụng tongTienSanPham từ backend
  return invoice.value?.tongTienSanPham || 0;
});

   const totalPaidAmount = computed(() => {
  if (!invoice.value || !invoice.value.paymentHistory) return 0;
  return invoice.value.paymentHistory
    .filter(p => p.soTien > 0)
    .reduce((sum, p) => sum + p.soTien, 0);
});

      const totalRefundedAmount = computed(() => {
      // Tính tổng số tiền đã hoàn (chỉ các khoản âm, lấy giá trị tuyệt đối)
      return Math.abs(paymentHistory.value.reduce((sum, payment) => {
        return sum + (payment.soTien < 0 ? payment.soTien : 0);
      }, 0));
    });

      const totalPaidAmountNet = computed(() => {
      // Tính tổng số tiền đã thanh toán (chỉ các khoản dương)
      return paymentHistory.value.reduce((sum, payment) => {
        return sum + (payment.soTien > 0 ? payment.soTien : 0);
      }, 0);
    });

 const maxPaymentPossible = computed(() => {
  return (invoice.value?.tongTienThanhToan || 0) - totalPaidAmount.value;
});

    const maxRefundPossible = computed(() => {
      const max = Math.max(0, totalPaidAmountNet.value);
      console.log('maxRefundPossible:', { totalPaidAmountNet: totalPaidAmountNet.value, max });
      return max;
    });

    const amountToReturnCustomer = computed(() => {
      return Math.max(0, maxRefundPossible.value - refundAmount.value);
    });

    const isValidRefund = computed(() => {
      const valid = (
        refundAmount.value > 0 &&
        refundNote.value.trim() !== '' &&
        refundAmount.value <= maxRefundPossible.value
      );
      console.log('isValidRefund:', {
        refundAmount: refundAmount.value,
        refundNote: refundNote.value,
        maxRefundPossible: maxRefundPossible.value,
        valid
      });
      return valid;
    });

    const showRefundButton = computed(() => {
      const status = invoice.value?.trangThai?.id;
      return [21, 23].includes(status) && hasReturnedProducts.value && totalPaidAmountNet.value > 0;
    });

    const canRefund = computed(() => {
      const status = invoice.value?.trangThai?.id;
      const result = hasReturnedProducts.value && totalPaidAmountNet.value > 0 && [22, 23].includes(status);
      console.log('canRefund:', {
        hasReturnedProducts: hasReturnedProducts.value,
        totalPaidAmountNet: totalPaidAmountNet.value,
        status,
        invoiceExists: !!invoice.value,
        returnedProducts: returnedProducts.value,
        result
      });
      return result;
    });

    const amountOwed = computed(() => {
      return Math.max(
        0,
        (invoice.value?.tongTienThanhToan || 0) - (totalPaidAmountNet.value + paidAmountInput.value)
      );
    });

    const changeAmount = computed(() => {
      return Math.max(
        0,
        (totalPaidAmountNet.value + paidAmountInput.value) - (invoice.value?.tongTienThanhToan || 0)
      );
    });

const isValidPayment = computed(() => {
  const amount = parseFloat(paidAmountInput.value);
  return (
    !isNaN(amount) &&
    amount > 0 &&
    amount <= maxPaymentPossible.value && // Thêm kiểm tra này
    paymentMethod.value &&
    paymentNote.value.trim() !== ''
  );
});

    const isPaymentConfirmed = computed(() => {
      return invoice.value?.paymentHistory?.some(p => p.soTien > 0) || false;
    });



     const remainingBalance = computed(() => {
      // Tính toán số dư còn lại thực tế của hóa đơn
      // Đảm bảo invoice.tongTienThanhToan là tổng giá trị hóa đơn ban đầu
      if (!invoice.value) return 0;
      return invoice.value.tongTienThanhToan - totalPaidAmountNet.value + totalRefundedAmount.value;
    });

    const isValidAddPaymentForm = computed(() => {
        return newPaymentAmount.value > 0 && newPaymentAmount.value <= remainingBalance.value && paymentNote.value.trim();
    });


// Khai báo mokkyApi
const mokkyApi = axios.create({
  baseURL: '/api/mokky', // Sử dụng proxy đã cấu hình trong vite.config.js
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

    const calculatedTotal = computed(() => {
      if (!invoice.value || !invoice.value.products) return 0;
      const productsTotal = invoice.value.products.reduce((sum, p) => sum + p.thanhTien, 0);
      return productsTotal - (invoice.value.voucher || 0) + (invoice.value.phiShip || 0);
    });

    const totalReturnAmount = computed(() => {
      return returnedProducts.value.reduce((total, item) => total + item.thanhTienHoan, 0);
    });

    const hasReturnedProducts = computed(() => {
      return returnedProducts.value.length > 0;
    });

    const canReturn = computed(() => {
      console.log('Kiểm tra canReturn:', {
        trangThai: invoice.value?.trangThai?.id,
        isPaymentConfirmed: invoice.value?.paymentHistory.some(p => p.soTien > 0),
        isNotCancelled: invoice.value?.trangThai?.id !== 22,
        hasReturnableProducts: products.value.some(p => getRemainingQuantity(p) > 0),
        products: products.value
      });
      if (!invoice.value || !invoice.value.statusHistory) return false;
      const isPaymentConfirmed = invoice.value.paymentHistory.some(p => p.soTien > 0);
      const isCompleted = invoice.value.trangThai?.id === 21;
      const isNotCancelled = invoice.value.trangThai?.id !== 22;
      return isPaymentConfirmed && isCompleted && isNotCancelled && products.value.some(p => getRemainingQuantity(p) > 0);
    });

 const statusOptions = [
  { id: 1, text: 'Chờ xử lý' },
  { id: 6, text: 'Chờ xác nhận thanh toán' },
  { id: 7, text: 'Chờ giao' },
  { id: 9, text: 'Đang vận chuyển' },
  { id: 21, text: 'Hoàn thành' },
  { id: 22, text: 'Hủy' },
  { id: 23, text: 'Hoàn một phần' }
];

   const progressSteps = [
  { id: 1, name: 'Chờ xử lý', icon: 'solar:document-bold' },
  { id: 6, name: 'Chờ xác nhận thanh toán', icon: 'solar:money-bill-wave-bold' },
  { id: 7, name: 'Chờ giao', icon: 'solar:box-bold' },
  { id: 9, name: 'Đang vận chuyển', icon: 'solar:delivery-bold' },
  { id: 21, name: 'Hoàn thành', icon: 'solar:check-circle-bold' },
  { id: 22, name: 'Hủy', icon: 'solar:close-circle-bold' },
  { id: 23, name: 'Hoàn một phần', icon: 'solar:refresh-circle-bold' }
];

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    }; 

    const formatCurrency = (value) => {
      if (typeof value !== 'number') {
        value = parseFloat(value);
      }
      if (isNaN(value)) {
        return '0 VND';
      }
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getStatusText = (statusId) => {
      const statusMap = Object.fromEntries(statusOptions.map(s => [s.id, s.text]));
      return statusMap[statusId] || 'Không xác định';
    };

    

    const getStatusColor = (statusId) => {
      const colorMap = {
        1: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase',
        6: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase',
        7: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase',
        8: 'text-orange-600 bg-orange-100 dark:bg-orange-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase',
        9: 'text-green-600 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase',
        21: 'text-lime-700 bg-lime-200 dark:bg-lime-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase',
        22: 'text-red-700 bg-red-200 dark:bg-red-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase',
        23: 'text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase',
      };
      return colorMap[statusId] || 'text-gray-600 bg-gray-100 dark:bg-gray-700/40 px-3 py-1 rounded-full text-xs font-semibold uppercase';
    };

    const isStatusDisabled = computed(() => {
      return (statusId) => {
        const currentStatus = invoice.value?.trangThai?.id;
        if (!currentStatus) return true;
        if (statusId === currentStatus) return true;
        if ([21, 22, 23].includes(currentStatus)) return true;
        if (currentStatus === 1 && ![6, 22].includes(statusId)) return true;
        if (currentStatus === 6 && ![7, 22].includes(statusId)) return true;
        if (currentStatus === 7 && ![9, 22].includes(statusId)) return true;
        if (currentStatus === 9 && ![21, 23, 22].includes(statusId)) return true;
        return false;
      };
    });

    const isCurrentStatusSelected = computed(() => {
      return selectedStatus.value === String(invoice.value?.trangThai?.id || '');
    });

 const isStepCompleted = (stepId) => {
  if (!invoice.value || !invoice.value.statusHistory || !invoice.value.trangThai?.id) {
    console.log('isStepCompleted: Không có dữ liệu hóa đơn hoặc trạng thái', { invoice: invoice.value });
    return false;
  }

  const currentInvoiceStatusId = invoice.value.trangThai.id;
  console.log('isStepCompleted:', {
    stepId,
    currentStatusId: currentInvoiceStatusId,
    statusHistory: invoice.value.statusHistory
  });

  if (currentInvoiceStatusId === 22) {
    return stepId === 22;
  }

  const validSteps = [1, 6, 7, 9, 21];
  const currentStepIndex = validSteps.indexOf(currentInvoiceStatusId);
  const stepIndex = validSteps.indexOf(stepId);

  if (currentStepIndex === -1 || stepIndex === -1) {
    console.log('isStepCompleted: Trạng thái hoặc bước không hợp lệ', {
      currentStepIndex,
      stepIndex,
      validSteps
    });
    return false;
  }

  return stepIndex <= currentStepIndex;
};

    const isCurrentStep = (stepId) => {
      if (!invoice.value) return false;
      return invoice.value.trangThai?.id === stepId && invoice.value.trangThai?.id !== 22;
    };

    const getStepIcon = (stepId) => {
      const step = progressSteps.find(s => s.id === stepId);
      return step ? step.icon : 'solar:circle-outline';
    };

    const getStatusIcon = (statusId) => {
      const iconMap = {
        1: 'solar:document-bold',
        6: 'solar:money-bill-wave-bold',
        7: 'solar:box-bold',
        8: 'solar:truck-bolt-bold',
        9: 'solar:delivery-bold',
        21: 'solar:check-circle-bold',
        22: 'solar:close-circle-bold',
        23: 'solar:refresh-circle-bold',
      };
      return iconMap[statusId] || 'solar:info-circle-linear';
    };

 const progressLineWidth = computed(() => {
  if (!invoice.value || !invoice.value.trangThai?.id || !invoice.value.statusHistory) {
    console.log('progressLineWidth: Không có dữ liệu hóa đơn hoặc trạng thái', { invoice: invoice.value });
    return '0%';
  }

  const currentStatusId = invoice.value.trangThai.id;
  console.log('progressLineWidth:', {
    currentStatusId,
    statusHistory: invoice.value.statusHistory
  });

  if (currentStatusId === 22) {
    return '0%';
  }

  const validSteps = [1, 6, 7, 9, 21];
  const currentStepIndex = validSteps.indexOf(currentStatusId);

  if (currentStepIndex === -1) {
    console.log('progressLineWidth: Trạng thái không hợp lệ', { currentStatusId, validSteps });
    return '0%';
  }

  const totalSegments = validSteps.length - 1;
  const percentage = (currentStepIndex / totalSegments) * 100;
  console.log('progressLineWidth: Tính toán', { currentStepIndex, totalSegments, percentage });
  return `${percentage}%`;
});

    const getTimestampForStatus = (stepId) => {
      if (!invoice.value || !invoice.value.statusHistory) return null;
      const entry = invoice.value.statusHistory.find(s => s.statusId === stepId);
      return entry ? entry.timestamp : null;
    };

    const lastUpdateTime = computed(() => {
      if (!invoice.value || !invoice.value.statusHistory || invoice.value.statusHistory.length === 0) return null;
      const latestStatus = invoice.value.statusHistory.reduce((latest, current) =>
        new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current
      );
      return formatDate(latestStatus.timestamp);
    });

    const canCancel = computed(() => {
      const status = invoice.value?.trangThai?.id;
      return status && ![21, 22, 23].includes(status);
    });

    const getRemainingQuantity = (product) => {
      const returned = returnedProducts.value
        .filter(item => item.uniqueId === product.uniqueId)
        .reduce((sum, item) => sum + item.returnQuantity, 0);
      return Math.max(0, product.soLuong - returned);
    };

    const showReturnAllProductsModal = () => {
      formSubmitted.value = false;
      returnReason.value = '';
      productsToReturnInModal.value = products.value
        .filter(p => getRemainingQuantity(p) > 0)
        .map(p => ({
          ...p,
          soLuongGoc: p.soLuong,
          soLuongConLai: getRemainingQuantity(p),
          returnQuantity: getRemainingQuantity(p),
          returnQuantityError: '',
          chatLieu: p.chatLieu || 'N/A',
          size: p.size || 'N/A',
          mauSac: p.mauSac || 'N/A'
        }));
      if (productsToReturnInModal.value.length === 0) {
        toast.info("Tất cả sản phẩm đã được trả hoặc không có sản phẩm nào có thể trả lại.");
        return;
      }
      showReturnModal.value = true;
    };


    const isFullyPaid = computed(() => {
  if (!invoice.value) return false;
  return totalPaidAmountNet.value >= invoice.value.tongTienThanhToan;
});

    const showReturnSingleProductModal = (product) => {
      formSubmitted.value = false;
      returnReason.value = '';
      const remainingQuantity = getRemainingQuantity(product);
      productsToReturnInModal.value = [{
        ...product,
        soLuongGoc: product.soLuong,
        soLuongConLai: remainingQuantity,
        returnQuantity: remainingQuantity > 0 ? 1 : 0,
        returnQuantityError: '',
        chatLieu: product.chatLieu || 'N/A',
        size: product.size || 'N/A',
        mauSac: product.mauSac || 'N/A'
      }];
      if (remainingQuantity <= 0) {
        toast.info("Sản phẩm này đã được trả hết hoặc không thể trả lại.");
        return;
      }
      showReturnModal.value = true;
    };

    const validateReturnQuantity = (item) => {
      if (item.returnQuantity < 0) {
        item.returnQuantity = 0;
        item.returnQuantityError = 'Số lượng không hợp lệ.';
      } else if (item.returnQuantity > item.soLuongConLai) {
        item.returnQuantity = item.soLuongConLai;
        item.returnQuantityError = `Số lượng không được vượt quá ${item.soLuongConLai}.`;
      } else {
        item.returnQuantityError = '';
      }
    };

    const calculateSingleReturnAmount = (item) => {
      return (item.returnQuantity || 0) * item.donGia;
    };

    const calculateModalTotalReturnAmount = computed(() => {
      return productsToReturnInModal.value.reduce((total, item) => total + calculateSingleReturnAmount(item), 0);
    });

    const isReturnFormValid = computed(() => {
      console.log('Kiểm tra isReturnFormValid:', {
        returnReason: returnReason.value,
        productsToReturnInModal: productsToReturnInModal.value.map(item => ({
          productId: item.productId,
          returnQuantity: item.returnQuantity,
          returnQuantityError: item.returnQuantityError
        }))
      });
      if (!returnReason.value.trim()) return false;
      let anyProductSelected = false;
      for (const item of productsToReturnInModal.value) {
        validateReturnQuantity(item);
        if (item.returnQuantityError) return false;
        if (item.returnQuantity > 0) {
          anyProductSelected = true;
        }
      }
      return anyProductSelected;
    });

    const confirmReturn = async () => {
      formSubmitted.value = true;
      console.log('Bắt đầu confirmReturn, isReturnFormValid:', isReturnFormValid.value, {
        returnReason: returnReason.value,
        productsToReturnInModal: productsToReturnInModal.value.map(item => ({
          productId: item.productId,
          returnQuantity: item.returnQuantity,
          returnQuantityError: item.returnQuantityError
        }))
      });
      if (!isReturnFormValid.value) {
        toast.error('Vui lòng nhập lý do và số lượng trả lại hợp lệ cho ít nhất một sản phẩm.');
        return;
      }
      const invoiceId = route.params.id;
      console.log('invoiceId:', invoiceId);
      const returnedItemsBatch = [];
      let totalAmountRefunded = 0;
      for (const item of productsToReturnInModal.value) {
        if (item.returnQuantity > 0) {
          const refundAmountForItem = calculateSingleReturnAmount(item);
          returnedItemsBatch.push({
            id: item.id,
            returnQuantity: item.returnQuantity,
            tenSanPham: item.tenSanPham,
            donGia: item.donGia,
            thanhTienHoan: refundAmountForItem,
            reason: returnReason.value,
            returnDate: new Date().toISOString(),
            uniqueId: item.uniqueId,
            chatLieu: item.chatLieu || 'N/A',
            size: item.size || 'N/A',
            mauSac: item.mauSac || 'N/A'
          });
          totalAmountRefunded += refundAmountForItem;
          const originalProduct = products.value.find(p => p.uniqueId === item.uniqueId);
          if (originalProduct) {
            originalProduct.returnedQuantity = (originalProduct.returnedQuantity || 0) + item.returnQuantity;
            originalProduct.thanhTien = (originalProduct.soLuong - originalProduct.returnedQuantity) * originalProduct.donGia;
          }
        }
      }
      console.log('returnedItemsBatch:', returnedItemsBatch);
      if (returnedItemsBatch.length === 0) {
        toast.warning("Không có sản phẩm nào được chọn để trả lại.");
        return;
      }
      let updatedPhiShip = invoice.value.phiShip;
      const allProductsReturned = products.value.every(p => getRemainingQuantity(p) === 0);
      console.log('allProductsReturned:', allProductsReturned, 'updatedPhiShip:', updatedPhiShip);
      if (allProductsReturned) {
        updatedPhiShip = 0;
      }
      returnedProducts.value.push(...returnedItemsBatch);
      console.log('returnedProducts sau khi thêm:', returnedProducts.value);
      console.log('Trước khi set isBlinking:', isBlinking.value);
      isBlinking.value = true;
      console.log('Sau khi set isBlinking:', isBlinking.value);
      if (totalAmountRefunded > 0) {
        invoice.value.paymentHistory = invoice.value.paymentHistory || [];
        invoice.value.paymentHistory.push({
          ngayThanhToan: new Date().toISOString(),
          soTien: -totalAmountRefunded,
          trangThai: `Hoàn tiền trả hàng (${returnReason.value})`
        });
        paymentHistory.value = invoice.value.paymentHistory;
        console.log('paymentHistory:', paymentHistory.value);
      }
      const newStatusId = allProductsReturned ? 22 : 23;
      if (invoice.value.trangThai?.id !== newStatusId && invoice.value.trangThai?.id !== 22) {
        invoice.value.trangThai = { id: newStatusId };
        if (!invoice.value.statusHistory.some(s => s.statusId === newStatusId)) {
          invoice.value.statusHistory.push({
            statusId: newStatusId,
            timestamp: new Date().toISOString(),
            createdBy: 'admin',
            note: `Hoàn một phần đơn hàng với tổng tiền ${formatCurrency(totalAmountRefunded)}`
          });
          invoice.value.statusHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        console.log('newStatusId:', newStatusId, 'statusHistory:', invoice.value.statusHistory);
      }
      try {
        console.log('Dữ liệu gửi API:', {
          reason: returnReason.value,
          items: returnedItemsBatch.map(item => ({
            id: item.id,
            returnQuantity: item.returnQuantity
          }))
        });
        const response = await api.post(`/invoices/${invoiceId}/return-products`, {
          reason: returnReason.value,
          items: returnedItemsBatch.map(item => ({
            id: item.id,
            returnQuantity: item.returnQuantity
          }))
        });
        paymentHistory.value = invoice.value.paymentHistory;
        toast.success(`Đã xác nhận trả hàng thành công! Tổng tiền hoàn: ${formatCurrency(totalAmountRefunded)}`);
        showReturnModal.value = false;
        returnReason.value = '';
        productsToReturnInModal.value = [];
        formSubmitted.value = false;
        console.log('Trả hàng thành công, isBlinking:', isBlinking.value);
        await fetchInvoiceDetail(invoiceId);
      } catch (err) {
        console.error('Lỗi khi xác nhận trả hàng:', err.response ? err.response.data : err.message);
        toast.error(`Lỗi khi xác nhận trả hàng: ${err.response?.data?.message || err.message}`);
        isBlinking.value = false;
        console.log('Sau lỗi, isBlinking:', isBlinking.value);
        await fetchInvoiceDetail(invoiceId);
      }
    };

    const printInvoice = () => {
      console.log('Hàm printInvoice được gọi', {
        maHoaDon: invoice.value?.maHoaDon,
        ngayTao: invoice.value?.ngayTao,
        khachHang: invoice.value?.khachHang,
        products: invoice.value?.products,
        paymentHistory: invoice.value?.paymentHistory,
      });
      if (!invoice.value) {
        toast.error('Không có dữ liệu hóa đơn để in!');
        return;
      }
      try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          toast.error('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt chặn pop-up.');
          return;
        }
        const htmlContent = `
          <html>
            <head>
              <title>Hóa đơn ${invoice.value.maHoaDon || 'N/A'}</title>
              <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Roboto', Arial, sans-serif;
                  margin: 20px;
                  font-size: 14px;
                  color: #333;
                }
                .invoice-container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                }
                .invoice-header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .invoice-header h1 {
                  margin: 0;
                  font-size: 24px;
                  color: #1e40af;
                }
                .invoice-details, .payment-details, .product-table, .return-table {
                  margin-bottom: 20px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 10px;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f3f4f6;
                  font-weight: bold;
                }
                .total-row {
                  font-weight: bold;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  .invoice-container {
                    border: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                <div class="invoice-header">
                  <h1>HÓA ĐƠN BÁN HÀNG</h1>
                  <p>Mã hóa đơn: ${invoice.value.maHoaDon || 'N/A'}</p>
                  <p>Ngày tạo: ${formatDate(invoice.value.ngayTao)}</p>
                </div>
                <div class="invoice-details">
                  <h3>Thông tin khách hàng</h3>
                  <p><strong>Tên khách hàng:</strong> ${invoice.value.khachHang?.tenKhachHang || 'Khách lẻ'}</p>
                  <p><strong>Số điện thoại:</strong> ${invoice.value.khachHang?.soDienThoai || 'N/A'}</p>
                  <p><strong>Địa chỉ:</strong> ${invoice.value.khachHang?.diaChi || 'N/A'}</p>
                  <p><strong>Mã vận đơn:</strong> ${invoice.value.maVanDon || 'Chưa có'}</p>
                </div>
                <div class="product-table">
                  <h3>Sản phẩm đã mua</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>Chất liệu</th>
                        <th>Size</th>
                        <th>Màu sắc</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${products.value.length === 0
                        ? '<tr><td colspan="8">Không có sản phẩm</td></tr>'
                        : products.value.map((product, index) => `
                          <tr>
                            <td>${index + 1}</td>
                            <td>${product.tenSanPham || 'Chưa xác định'}</td>
                            <td>${product.chatLieu || 'N/A'}</td>
                            <td>${product.size || 'N/A'}</td>
                            <td>${product.mauSac || 'N/A'}</td>
                            <td>${product.soLuong || 0}</td>
                            <td>${formatCurrency(product.donGia)}</td>
                            <td>${formatCurrency(product.thanhTien)}</td>
                          </tr>
                        `).join('')}
                    </tbody>
                  </table>
                </div>
                <div class="payment-details">
                  <h3>Chi tiết thanh toán</h3>
                  <p><strong>Tổng tiền sản phẩm:</strong> ${formatCurrency(totalProductPrice.value)}</p>
                  ${invoice.value.phiShip > 0 ? `<p><strong>Phí ship:</strong> ${formatCurrency(invoice.value.phiVanChuyen)}</p>` : ''}
                  ${invoice.value.voucher > 0 ? `<p><strong>Voucher:</strong> ${formatCurrency(invoice.value.voucher)}</p>` : ''}
                  <p class="total-row"><strong>Tổng tiền thanh toán:</strong> ${formatCurrency(invoice.value.tongTienThanhToan)}</p>
                </div>
                ${returnedProducts.value.length > 0 ? `
                  <div class="return-table">
                    <h3>Sản phẩm đã trả lại</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Tên sản phẩm</th>
                          <th>Số lượng trả</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền hoàn</th>
                          <th>Lý do</th>
                          <th>Ngày trả</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${returnedProducts.value.map((item, index) => `
                          <tr>
                            <td>${index + 1}</td>
                            <td>${item.tenSanPham}</td>
                            <td>${item.returnQuantity}</td>
                            <td>${formatCurrency(item.donGia)}</td>
                            <td>${formatCurrency(item.thanhTienHoan)}</td>
                            <td>${item.reason}</td>
                            <td>${formatDate(item.returnDate)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    <p class="total-row"><strong>Tổng tiền hoàn trả:</strong> ${formatCurrency(totalReturnAmount.value)}</p>
                  </div>
                ` : ''}
                <div class="payment-history">
                  <h3>Lịch sử thanh toán</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Số tiền</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${paymentHistory.value.length === 0
                        ? '<tr><td colspan="3" style="text-align: center;">Chưa có lịch sử thanh toán</td></tr>'
                        : paymentHistory.value.map((payment, index) => `
                          <tr>
                            <td>${formatDate(payment.ngayThanhToan)}</td>
                            <td style="${payment.soTien < 0 ? 'color: red;' : 'color: green;'}">${formatCurrency(payment.soTien)}</td>
                            <td>${payment.trangThai || '-'}</td>
                          </tr>
                        `).join('')}
                    </tbody>
                  </table>
                  <p class="total-row"><strong>Tổng tiền đã thanh toán (net):</strong> ${formatCurrency(totalPaidAmountNet.value)}</p>
                  <p class="total-row"><strong>Tổng tiền đã hoàn:</strong> ${formatCurrency(totalRefundedAmount.value)}</p>
                </div>
                <div class="footer">
                  <p>Cảm ơn quý khách đã mua hàng!</p>
                  <p>Ngày in: ${formatDate(new Date())}</p>
                </div>
              </div>
            </body>
          </html>
        `;
        console.log('Nội dung HTML in:', htmlContent);
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          toast.success('Đã gửi yêu cầu in hóa đơn!');
        }, 500);
      } catch (err) {
        console.error('Lỗi khi in hóa đơn:', err);
        toast.error(`Lỗi khi in hóa đơn: ${err.message}`);
        if (printWindow) printWindow.close();
      }
    };

const confirmAddPayment = async () => {
      formSubmitted.value = true;
      paymentSuccessMessage.value = '';
      paymentErrorMessage.value = '';

      console.log('Before validation - paidAmountInput:', paidAmountInput.value, 'remainingBalance:', remainingBalance.value);

      if (!invoiceId.value) {
        paymentErrorMessage.value = 'Không tìm thấy ID hóa đơn. Vui lòng tải lại trang.';
        formSubmitted.value = false;
        toast.error(paymentErrorMessage.value);
        return;
      }

      if (!paidAmountInput.value || paidAmountInput.value <= 0 || isNaN(paidAmountInput.value)) {
        paymentErrorMessage.value = 'Vui lòng nhập số tiền thanh toán hợp lệ.';
        formSubmitted.value = false;
        toast.error(paymentErrorMessage.value);
        return;
      }

      if (remainingBalance.value <= 0) {
        paymentErrorMessage.value = 'Hóa đơn đã thanh toán đầy đủ.';
        formSubmitted.value = false;
        toast.error(paymentErrorMessage.value);
        return;
      }

      if (paidAmountInput.value > remainingBalance.value) {
        paymentErrorMessage.value = `Số tiền thanh toán vượt quá số tiền còn lại: ${formatCurrency(remainingBalance.value)}.`;
        formSubmitted.value = false;
        toast.error(paymentErrorMessage.value);
        return;
      }

      const payload = {
        soTienThanhToan: Number(paidAmountInput.value), // Chuẩn hóa thành số
        idPhuongThucThanhToan: paymentMethodId.value || 1,
        trangThaiThanhToan: 'thanh_cong',
        ghiChuThanhToan: paymentNote.value || '',
      };

      try {
        console.log('Gửi payload:', payload);
        console.log('invoiceId:', invoiceId.value);
        console.log('URL:', `http://localhost:3000/api/invoices/${invoiceId.value}/payment`);
        const response = await axios.post(`/api/invoices/${invoiceId.value}/payment`, payload);
        console.log('API response:', response.data);
        paymentSuccessMessage.value = 'Thêm thanh toán thành công!';
        await fetchInvoiceDetail(invoiceId.value);
        closeAddPaymentModal();
        toast.success('Thêm thanh toán thành công!');
      } catch (err) {
        console.error('Full error:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          paymentErrorMessage.value = err.response.data?.message || 'Lỗi server không xác định.';
        } else if (err.request) {
          console.error('No response received:', err.request);
          paymentErrorMessage.value = 'Không kết nối được đến server. Kiểm tra server tại http://localhost:3000.';
        } else {
          console.error('Error setup:', err.message);
          paymentErrorMessage.value = `Lỗi khi gửi yêu cầu: ${err.message}`;
        }
        toast.error(paymentErrorMessage.value);
      } finally {
        formSubmitted.value = false;
      }
    };


    

const validatePaymentAmount = () => {
  const amount = parseFloat(paidAmountInput.value);
  if (isNaN(amount) || amount <= 0) {
    paidAmountInput.value = 0;
    toast.warning('Số tiền thanh toán phải lớn hơn 0.');
  } else if (amount > maxPaymentPossible.value) {
    paidAmountInput.value = maxPaymentPossible.value;
    toast.warning(`Số tiền thanh toán không được vượt quá ${formatCurrency(maxPaymentPossible.value)}.`);
  }
};

const statusMap = {
  pending: 1,
  payment_pending_verification: 6,
  processing: 7,
  shipping: 9,
  completed: 21,
  canceled: 22,
  partially_refunded: 23,
  pending_vnpay_mock: 1,
  cod_success: 21,
  bank_transfer_success: 21,
  done: 21 // Thêm nếu server dùng "done" thay vì "completed"
};

const fetchInvoiceDetail = async (id) => {
      console.log('Đang tải hóa đơn với ID:', id);
      isLoading.value = true;
      error.value = null;

      try {
        let response;
        if (id.startsWith('ONLINE-')) {
          const mokkyId = id.replace('ONLINE-', '');
          console.log('Gọi API Mokky:', `https://a5687b208ca7ac57.mokky.dev/orders/${mokkyId}`);
          response = await mokkyApi.get(`/orders/${mokkyId}`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
              Authorization: `Bearer ${localStorage.getItem('mokky_token') || ''}`,
            },
            params: { t: Date.now() },
          });

          console.log('Phản hồi API Mokky:', {
            status: response.data.status,
            statusHistory: response.data.statusHistory,
            fullResponse: response.data,
          });

          if (response.data && response.data.id) {
            const mappedStatusHistory = (response.data.statusHistory || []).map(history => ({
              statusId: statusMap[history.status] || history.statusId || 1,
              status: history.status || Object.keys(statusMap).find(key => statusMap[key] === (history.statusId || 1)) || 'pending',
              timestamp: history.timestamp || new Date().toISOString(),
              createdBy: history.createdBy || 'system',
              note: history.note || `Cập nhật sang ${getStatusText(statusMap[history.status] || history.statusId || 1)}`,
            }));

            const currentStatusId = statusMap[response.data.status] || response.data.statusId || 1;
            if (!mappedStatusHistory.some(s => s.statusId === currentStatusId)) {
              mappedStatusHistory.push({
                statusId: currentStatusId,
                status: response.data.status || 'pending',
                timestamp: response.data.orderDate || response.data.createdAt || new Date().toISOString(),
                createdBy: 'system',
                note: `Đơn hàng được tạo với trạng thái ${getStatusText(currentStatusId)}`,
              });
            }

            const tongTienSanPhamCalc = (response.data.items || []).reduce(
              (sum, item) => sum + (item.quantity || 1) * (item.price || item.unitPrice || 0),
              0
            );

            invoice.value = {
              id: `ONLINE-${response.data.id}`,
              maHoaDon: response.data.orderNumber || `ONLINE-${response.data.id}`,
              khachHang: {
                tenKhachHang: response.data.customerInfo?.fullName || response.data.customerName || 'Khách lẻ',
                soDienThoai: response.data.customerInfo?.phoneNumber || response.data.customerPhone || 'N/A',
                diaChi: response.data.customerInfo?.address || response.data.customerAddress || '',
              },
              maVanDon: response.data.maVanDon || 'Chưa có',
              ngayTao: response.data.orderDate || response.data.createdAt || new Date().toISOString(),
              tongTienSanPham: tongTienSanPhamCalc,
              tongTienThanhToan: response.data.finalTotalPrice || response.data.totalPrice || response.data.totalAmount || 0,
              voucher: response.data.vatPrice || response.data.voucher || 0,
              phiShip: response.data.shippingFee || 0,
              trangThai: { id: currentStatusId },
              paymentHistory: response.data.paymentHistory || (response.data.paymentMethod
                ? [{
                    soTien: response.data.finalTotalPrice || response.data.totalPrice || response.data.totalAmount || 0,
                    ngayThanhToan: response.data.orderDate || response.data.createdAt || new Date().toISOString(),
                    ghiChu: response.data.paymentMethod === 'cod' ? 'Tiền mặt' : 'Online',
                  }]
                : []),
              products: (response.data.items || []).map(item => ({
                productId: item.productId || item.id || `P${Math.random().toString(36).substr(2, 9)}`,
                tenSanPham: item.title || item.productName || 'Chưa xác định',
                soLuong: item.quantity || 1,
                donGia: item.price || item.unitPrice || 0,
                thanhTien: (item.quantity || 1) * (item.price || item.unitPrice || 0),
                chatLieu: item.material || 'N/A',
                size: item.selectedSize || item.size || 'N/A',
                mauSac: item.color || 'N/A',
                imageUrl: item.imageUrl || '',
                uniqueId: item.uniqueId || Math.random().toString(36).substr(2, 9),
                returnedQuantity: item.returnedQuantity || 0,
              })),
              statusHistory: mappedStatusHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
              returnedProducts: (response.data.returnedProducts || []).map(r => ({
                ...r,
                uniqueId: r.uniqueId || Math.random().toString(36).substr(2, 9),
                chatLieu: r.chatLieu || r.material || 'N/A',
                size: r.size || r.selectedSize || 'N/A',
                mauSac: r.mauSac || r.color || 'N/A',
              })),
              isOnlineOrder: true,
            };

            console.log('Hóa đơn sau khi ánh xạ:', {
              maHoaDon: invoice.value.maHoaDon,
              tongTienSanPham: invoice.value.tongTienSanPham,
              tongTienThanhToan: invoice.value.tongTienThanhToan,
              paymentHistory: invoice.value.paymentHistory,
              statusHistory: invoice.value.statusHistory,
            });
          } else {
            throw new Error('Dữ liệu hóa đơn online không hợp lệ từ Mokky.');
          }
        } else {
          response = await axios.get(`/api/invoices/${id}`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
          });
          invoice.value = {
            ...response.data,
            tongTienSanPham: response.data.tongTienSanPham || 0,
            isOnlineOrder: false,
          };
          console.log('Dữ liệu hóa đơn local:', {
            id: invoice.value.id,
            maHoaDon: invoice.value.maHoaDon,
            tongTienSanPham: invoice.value.tongTienSanPham,
            tongTienThanhToan: invoice.value.tongTienThanhToan,
            paymentHistory: invoice.value.paymentHistory,
          });
        }

        tongTienSanPham.value = invoice.value.tongTienSanPham || 0;
        paymentHistory.value = invoice.value.paymentHistory || [];
        products.value = invoice.value.products || [];
        returnedProducts.value = invoice.value.returnedProducts || [];
        showPrintButton.value = paymentHistory.value.some(p => (p.soTien || p.soTienThanhToan || 0) > 0);

        // Tính remainingBalance
        const tongTienDaThanhToan = paymentHistory.value.reduce(
          (sum, payment) => {
            const soTien = payment.soTien || payment.soTienThanhToan || 0;
            console.log('Payment:', payment, 'SoTien:', soTien); // Debug paymentHistory
            return sum + soTien;
          },
          0
        );
        remainingBalance.value = (invoice.value.tongTienThanhToan || 0) - tongTienDaThanhToan;

        console.log('Tong tien san pham:', tongTienSanPham.value);
        console.log('Tong tien da thanh toan:', tongTienDaThanhToan);
        console.log('Remaining balance:', remainingBalance.value);

        toast.success(`Đã tải chi tiết hóa đơn ${invoice.value.maHoaDon} thành công!`);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết hóa đơn:', err.response ? err.response.data : err.message);
        error.value = `Không thể tải chi tiết hóa đơn. Vui lòng thử lại hoặc kiểm tra ID: ${id}`;
        if (err.response?.status === 404) {
          error.value = `Không tìm thấy hóa đơn với ID ${id}.`;
        } else if (err.response?.status === 403) {
          error.value = 'Yêu cầu bị từ chối do CORS hoặc xác thực không hợp lệ.';
        }
        toast.error(error.value);
        invoice.value = null;
        paymentHistory.value = [];
        products.value = [];
        returnedProducts.value = [];
        showPrintButton.value = false;
      } finally {
        isLoading.value = false;
      }
    };



  const confirmRefund = async () => {
  console.log('Bắt đầu confirmRefund:', {
    invoiceId: route.params.id,
    refundAmount: refundAmount.value,
    refundNote: refundNote.value,
    isValidRefund: isValidRefund.value
  });

  if (!isValidRefund.value) {
    toast.error('Vui lòng nhập số tiền hoàn và ghi chú hợp lệ!');
    return;
  }

  if (!invoice.value || !invoice.value.paymentHistory || !invoice.value.statusHistory) {
    toast.error('Dữ liệu hóa đơn không đầy đủ để thực hiện hoàn tiền.');
    return;
  }

  const invoiceId = route.params.id;
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    return;
  }

  try {
    const originalPaymentHistory = [...invoice.value.paymentHistory];
    const originalStatusHistory = [...invoice.value.statusHistory];
    const originalStatusId = invoice.value.trangThai?.id || 1;

    const newPaymentEntry = {
      ngayThanhToan: new Date().toISOString(),
      soTien: -refundAmount.value,
      trangThai: `Hoàn tiền (${refundNote.value})`
    };
    invoice.value.paymentHistory.push(newPaymentEntry);

    const newStatusId = invoice.value.trangThai?.id === 22 ? 22 : 23;
    if (invoice.value.trangThai?.id !== newStatusId) {
      invoice.value.trangThai = { id: newStatusId };
      if (!invoice.value.statusHistory.find(s => s.statusId === newStatusId)) {
        invoice.value.statusHistory.push({
          statusId: newStatusId,
          timestamp: new Date().toISOString(),
          createdBy: 'admin',
          note: `Hoàn tiền ${formatCurrency(refundAmount.value)}`
        });
        invoice.value.statusHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
    }

    let response;
    if (invoiceId.startsWith('ONLINE-')) {
      const mokkyId = invoiceId.replace('ONLINE-', '');
      response = await mokkyApi.patch(`/orders/${mokkyId}`, {
        paymentHistory: invoice.value.paymentHistory,
        status: newStatusId === 22 ? 'canceled' : 'partially_refunded',
        statusHistory: invoice.value.statusHistory
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mokky_token') || ''}`
        }
      });
    } else {
      response = await api.patch(`/invoices/${invoiceId}`, {
        refundAmount: refundAmount.value,
        refundNote: refundNote.value
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }

    if (response.status === 200 || response.status === 204) {
      toast.success(`Đã hoàn tiền ${formatCurrency(refundAmount.value)} thành công!`);
      showRefundModal.value = false;
      refundAmount.value = 0;
      refundNote.value = '';
      isBlinking.value = false;
      await fetchInvoiceDetail(invoiceId);
    } else {
      throw new Error(`Phản hồi API không thành công: ${response.status}`);
    }
  } catch (err) {
    console.error('Lỗi khi hoàn tiền:', err.response ? err.response.data : err.message);
    let errorMessage = err.response?.data?.message || err.message;
    if (err.response?.status === 401) {
      errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    } else if (err.response?.status === 403) {
      errorMessage = 'Không có quyền truy cập hoặc yêu cầu CORS không hợp lệ.';
    }
    toast.error(`Lỗi khi hoàn tiền: ${errorMessage}`);
    invoice.value.paymentHistory = originalPaymentHistory;
    invoice.value.statusHistory = originalStatusHistory;
    invoice.value.trangThai = { id: originalStatusId };
    isBlinking.value = false;
    await fetchInvoiceDetail(invoiceId);
  }
};

    const cancelReturn = () => {
      showReturnModal.value = false;
      returnReason.value = '';
      productsToReturnInModal.value = [];
      formSubmitted.value = false;
    };

const showUpdateStatusModal = () => {
  if (!invoice.value) {
    toast.error('Không có dữ liệu hóa đơn để cập nhật trạng thái!');
    return;
  }
  if (!selectedStatus.value) {
    toast.warning('Vui lòng chọn trạng thái mới để cập nhật!');
    return;
  }
  showUpdateModal.value = true;
};

const confirmUpdateStatus = async () => {
  if (!selectedStatus.value) {
    toast.error('Vui lòng chọn trạng thái mới!');
    showUpdateModal.value = false;
    return;
  }

  const invoiceId = route.params.id;
  const newStatusId = parseInt(selectedStatus.value);
  const oldStatusId = invoice.value?.trangThai?.id;

  if (!invoice.value || !invoice.value.trangThai) {
    toast.error('Không có dữ liệu hóa đơn để cập nhật.');
    showUpdateModal.value = false;
    return;
  }

  try {
    console.log('Cập nhật trạng thái:', { invoiceId, newStatusId, oldStatusId });

    // Chuẩn bị dữ liệu cập nhật
    const updatedInvoice = {
      ...invoice.value,
      trangThai: { id: newStatusId },
      statusHistory: [...(invoice.value.statusHistory || [])],
    };

    const timestamp = new Date().toISOString();
    const statusText = getStatusText(newStatusId);
    const existingStatusEntry = updatedInvoice.statusHistory.find(s => s.statusId === newStatusId);
    if (!existingStatusEntry) {
      updatedInvoice.statusHistory.push({
        statusId: newStatusId,
        timestamp,
        createdBy: 'admin',
        note: `Cập nhật sang ${statusText}`,
      });
    } else {
      existingStatusEntry.timestamp = timestamp;
      existingStatusEntry.note = `Cập nhật sang ${statusText}`;
    }

    updatedInvoice.statusHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let response;
    if (invoiceId.startsWith('ONLINE-')) {
      const mokkyId = invoiceId.replace('ONLINE-', '');
      const mokkyStatus = Object.keys(statusMap).find(key => statusMap[key] === newStatusId) || 'pending';
      console.log('Gửi yêu cầu PATCH tới Mokky:', {
        url: `https://a5687b208ca7ac57.mokky.dev/orders/${mokkyId}`,
        payload: {
          status: mokkyStatus,
          statusHistory: updatedInvoice.statusHistory.map(s => ({
            ...s,
            status: Object.keys(statusMap).find(key => statusMap[key] === s.statusId) || 'pending',
          })),
        },
      });

      response = await mokkyApi.patch(
        `/orders/${mokkyId}`,
        {
          status: mokkyStatus,
          statusHistory: updatedInvoice.statusHistory.map(s => ({
            ...s,
            status: Object.keys(statusMap).find(key => statusMap[key] === s.statusId) || 'pending',
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('mokky_token') || ''}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );

      console.log('Phản hồi từ Mokky PATCH:', response.data);
    } else {
      response = await api.patch(
        `/invoices/${invoiceId}/status`,
        {
          newStatusId,
          ghiChu: `Cập nhật sang ${statusText}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    if (response.status === 200 || response.status === 204) {
      invoice.value = { ...updatedInvoice };
      toast.success(`Cập nhật trạng thái thành công sang "${statusText}"!`);
      selectedStatus.value = '';
      showUpdateModal.value = false;
      await fetchInvoiceDetail(invoiceId);
    } else {
      throw new Error(`Phản hồi API không thành công: ${response.status}`);
    }
  } catch (err) {
    console.error('Lỗi khi cập nhật trạng thái:', err.response ? err.response.data : err.message);
    let errorMessage = err.response?.data?.message || err.message;
    if (err.response?.status === 401) {
      errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    } else if (err.response?.status === 403) {
      errorMessage = 'Không có quyền truy cập hoặc yêu cầu CORS không hợp lệ.';
    } else if (err.response?.status === 400) {
      errorMessage = 'Dữ liệu gửi không hợp lệ. Vui lòng kiểm tra lại.';
    }
    toast.error(`Lỗi khi cập nhật trạng thái: ${errorMessage}`);
    await fetchInvoiceDetail(invoiceId);
  }
};




    const showCancelOrderModal = () => {
      showCancelModal.value = true;
    };

    const confirmCancelOrder = async () => {
  formSubmitted.value = true; // Đánh dấu form đã được submit để hiển thị lỗi nếu cần
  if (!cancelReason.value || cancelReason.value.trim() === '') {
    toast.error('Vui lòng nhập lý do hủy đơn hàng.');
    return;
  }

  isLoading.value = true;
  const invoiceId = route.params.id;

  try {
    const oldStatusId = invoice.value?.trangThai?.id || 0;
    const updatedOrder = {
      trangThai: { id: 22 }, // Trạng thái hủy (theo statusOptions, id 22 là 'Hủy')
      statusHistory: [
        ...(invoice.value.statusHistory || []),
        {
          statusId: 22,
          timestamp: new Date().toISOString(),
          createdBy: 'admin',
          note: `Hủy đơn hàng: ${cancelReason.value}`
        }
      ]
    };

    let response;
    if (invoiceId.startsWith('ONLINE-')) {
      const mokkyId = invoiceId.replace('ONLINE-', '');
      response = await mokkyApi.patch(`/orders/${mokkyId}`, {
        status: 'canceled',
        statusHistory: updatedOrder.statusHistory.map(s => ({
          ...s,
          status: Object.keys(statusMap).find(key => statusMap[key] === s.statusId) || 'canceled'
        }))
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mokky_token') || ''}`
        }
      });
    } else {
      response = await api.patch(`/invoices/${invoiceId}/status`, {
        newStatusId: 22,
        ghiChu: `Hủy đơn hàng: ${cancelReason.value}`
      });
    }

    if (response.status === 200 || response.status === 204) {
      invoice.value.trangThai = { id: 22 };
      invoice.value.statusHistory = updatedOrder.statusHistory;
      toast.success('Đã hủy đơn hàng thành công!');
      closeCancelOrderModal();
      await fetchInvoiceDetail(invoiceId);
    }
  } catch (err) {
    console.error('Lỗi khi hủy đơn hàng:', err.response ? err.response.data : err.message);
    let errorMessage = err.response?.data?.message || err.message;
    if (err.response?.status === 403) {
      errorMessage = 'Yêu cầu bị từ chối do CORS hoặc cấu hình server.';
    } else if (err.response?.status === 401) {
      errorMessage = 'Không được phép truy cập endpoint này.';
    }
    toast.error(`Lỗi khi hủy đơn hàng: ${errorMessage}`);
    await fetchInvoiceDetail(invoiceId);
  } finally {
    isLoading.value = false;
  }
};

const closeCancelOrderModal = () => {
  showCancelModal.value = false;
  cancelReason.value = ''; // Reset lý do hủy
  formSubmitted.value = false;
};

    const openRefundModal = () => {
      console.log('openRefundModal called');
      showRefundModal.value = true;
      refundAmount.value = 0;
      refundNote.value = '';
      formSubmitted.value = false;
    };
onMounted(() => {
      console.log('onMounted called, fetching invoice with ID:', route.params.id);
      fetchInvoiceDetail(route.params.id);
    });

    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        console.log('ID tuyến đã thay đổi:', newId);
        fetchInvoiceDetail(newId);
      }
    });

    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        console.log('ID tuyến đã thay đổi:', newId);
        fetchInvoiceDetail(newId);
      }
    });

    watch(showAddPaymentModal, (newValue) => {
      if (newValue) {
        if (!paymentNote.value || paymentNote.value.trim() === '') {
          paymentNote.value = `Xác nhận thanh toán cho hóa đơn ${invoice.value?.maHoaDon || ''}`;
        }
        if (!paymentMethod.value) {
          paymentMethod.value = 'cash';
        }
        paidAmountInput.value = Math.max(0, (invoice.value?.tongTienThanhToan || 0) - totalPaidAmountNet.value);
        showPrintButton.value = false;
      }
    });

    return {
      invoiceId,
      canReturn,
      hasReturnedProducts,
      canRefund,
      isLoading,
      error,
      invoice,
      paymentHistory,
      products,
      progressSteps,
      isStepCompleted,
      isCurrentStep,
      progressLineWidth,
      getStepIcon,
      getTimestampForStatus,
      paymentSuccessMessage, // Trả về
  paymentErrorMessage,   // Trả về
  formSubmitted,  
      canCancel,
      selectedStatus,
      validatePaymentAmount,
      statusOptions,
      isStatusDisabled,
      isCurrentStatusSelected,
      tongTienSanPham,
      formatDate,
      formatCurrency,
      getStatusText,
      getStatusColor,
      showUpdateStatusModal,
      confirmUpdateStatus,
      showCancelOrderModal,
      confirmCancelOrder,
      showUpdateModal,
      showCancelModal,
      showRefundModal,
      openRefundModal,
      showOrderDetailsModal,
      showProgressModal,
      showStatusHistoryModal,
      refundAmount,
      refundNote,
      confirmRefund,
      totalPaidAmount,
      totalRefundedAmount,
      totalPaidAmountNet,
      maxPaymentPossible,
      maxRefundPossible,
      amountToReturnCustomer,
      isValidRefund,
      showRefundButton,
      lastUpdateTime,
      getStatusIcon,
      showAddPaymentModal,
      paymentNote,
      confirmAddPayment,
      isValidPayment,
      paymentMethod,
      paidAmountInput,
      amountOwed,
      changeAmount,
      isPaymentConfirmed,
      showReturnModal,
      productsToReturnInModal,
      returnReason,
      returnedProducts,
      showReturnAllProductsModal,
      showReturnSingleProductModal,
      validateReturnQuantity,
      calculateSingleReturnAmount,
      calculateModalTotalReturnAmount,
      isReturnFormValid,
      confirmReturn,
      cancelReturn,
      totalReturnAmount,
      getRemainingQuantity,
      formSubmitted,
      calculatedTotal,
      totalProductPrice,
      isBlinking,
      showPrintButton,
      printInvoice,
    };
  },
};
</script>










<style scoped>
@import 'vue-toastification/dist/index.css';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;900&display=swap');
@import 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';

@keyframes blink-red {
  0%, 100% { background-color: transparent; }
  100% { background-color: rgba(255, 99, 71, 0.7); } /* Rất đậm */
}
.blinking-red-row {
  animation: blink-red 1s infinite alternate !important; /* Nhanh hơn, ưu tiên */
}

:deep(.blinking-red-row) {
  animation: blink-red 1s infinite alternate !important;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200;
}
.dark .card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.table {
  @apply w-full border-collapse text-gray-700 dark:text-gray-200;
}

.table th,
.table td {
  @apply p-3.5 text-left align-middle;
}

.table thead th {
  @apply bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-gray-100 font-bold text-sm uppercase;
}

.table tbody tr {
  @apply border-b border-gray-200 dark:border-gray-700 transition-colors duration-200;
}
.table tbody tr:last-child {
  @apply border-b-0;
}

.table tbody tr:hover {
  @apply bg-blue-50 dark:bg-gray-700/50;
}

/* Style cho các hàng voucher và phí ship trong bảng chính và modal */
.voucher-row td:last-child,
.modal-voucher-row td:last-child {
  @apply text-green-600 dark:text-green-400 font-semibold;
}

.shipping-fee-row td:last-child,
.modal-shipping-fee-row td:last-child {
  @apply text-orange-600 dark:text-orange-400 font-semibold;
}

/* Style cho các giao dịch hoàn tiền trong lịch sử thanh toán */
.refunded-payment td:nth-child(2) {
  @apply text-red-600 dark:text-red-400 font-semibold;
}

/* Style cho phí ship được hoàn lại (khi tất cả sản phẩm được trả) */
.shipping-fee-refunded td:last-child {
  @apply text-gray-500 dark:text-gray-400 line-through;
}

.btn-primary {
  @apply bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:bg-blue-700 active:scale-95;
}

.btn-danger {
  @apply bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:bg-red-700 active:scale-95;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:bg-gray-300 active:scale-95 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600;
}

.btn-primary:disabled,
.btn-danger:disabled,
.btn-secondary:disabled {
  @apply opacity-50 cursor-not-allowed transform-none shadow-none;
}

.progress-timeline {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
  z-index: 10;
}

.progress-step {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 11;
}

.progress-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #757575;
  transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease, transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  border: 3px solid #ccc;
}

.dark .progress-icon-wrapper {
  background-color: #4b5563;
  color: #a0aec0;
  border-color: #6b7280;
}

.progress-icon {
  font-size: 1.8rem;
}

.progress-step.active .progress-icon-wrapper {
  background-color: #22c55e;
  color: white;
  border-color: #16a34a;
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4);
}

.progress-step.current .progress-icon-wrapper {
  background-color: #3b82f6;
  color: white;
  border-color: #2563eb;
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.6);
  animation: pulse 1.5s infinite cubic-bezier(0.66, 0, 0, 1);
}

.dark .progress-step.current .progress-icon-wrapper {
  background-color: #60a5fa;
  border-color: #3b82f6;
  box-shadow: 0 4px 15px rgba(96, 165, 250, 0.6);
}

.progress-step.canceled .progress-icon-wrapper {
  background-color: #ef4444 !important;
  border-color: #dc2626 !important;
  color: white !important;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
}

.progress-step > div:nth-of-type(2) {
  margin-top: 10px;
  white-space: nowrap;
  font-weight: 600;
  color: #4a5568;
}
.dark .progress-step > div:nth-of-type(2) {
  color: #cbd5e0;
}

.progress-step > div:nth-of-type(3) {
  font-size: 0.75rem;
  color: #71717a;
  white-space: nowrap;
  min-height: 20px;
}
.dark .progress-step > div:nth-of-type(3) {
  color: #a0aec0;
}

@keyframes pulse {
  0% { transform: scale(1.1); box-shadow: 0 4px 15px rgba(59, 130, 246, 0.6); }
  70% { transform: scale(1); box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
  100% { transform: scale(1.1); box-shadow: 0 4px 15px rgba(59, 130, 246, 0.6); }
}

@media (max-width: 768px) {
  .progress-timeline {
    flex-wrap: wrap;
    justify-content: center;
    padding: 0 2%;
  }
  .progress-step {
    flex: 0 0 30%;
    margin-bottom: 20px;
  }
  .progress-icon-wrapper {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  .progress-step > div:nth-of-type(2) {
    font-size: 0.8rem;
  }
  .progress-step > div:nth-of-type(3) {
    font-size: 0.65rem;
  }
  .relative > .absolute.h-2 {
    display: none;
  }

  /* Điều chỉnh style cho voucher, phí ship và các bảng trong modal trên thiết bị nhỏ */
  .table .voucher-row td,
  .table .shipping-fee-row td,
  .modal-voucher-row td,
  .modal-shipping-fee-row td {
    @apply text-sm p-2;
  }

  /* Giảm padding cho các ô trong bảng lịch sử thanh toán và sản phẩm */
  .table th,
  .table td {
    @apply p-2;
  }
}
.btn-print {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center;
}
</style>