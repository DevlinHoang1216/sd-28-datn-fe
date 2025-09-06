<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-850 p-6 font-sans antialiased text-gray-800 dark:text-gray-100">

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
    </div>

    <div v-if="errorMessage && !isLoading" class="bg-red-100 dark:bg-red-800 p-4 mb-8 rounded-xl shadow-md animate__animated animate__fadeIn">
      <p class="text-red-700 dark:text-red-200 font-medium text-lg text-center">{{ errorMessage }}</p>
    </div>

    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 animate__animated animate__fadeIn">
        <h4 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
          <iconify-icon icon="solar:filter-linear" class="text-4xl mr-4 text-blue-600" />
          Bộ Lọc Dữ Liệu & Báo Cáo
        </h4>
        <form @submit.prevent="filterData" class="filter-group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Từ ngày</label>
            <input v-model="filters.fromDate" @change="showFilterReminder" type="date" class="w-full border border-gray-300 rounded-lg p-3 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition duration-200 shadow-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đến ngày</label>
            <input v-model="filters.toDate" @change="showFilterReminder" type="date" class="w-full border border-gray-300 rounded-lg p-3 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition duration-200 shadow-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Danh mục</label>
            <select v-model="filters.category" @change="showFilterReminder" class="w-full border border-gray-300 rounded-lg p-3 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition duration-200 shadow-sm">
              <option value="all">Tất cả danh mục</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </div>
          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button type="submit" class="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105">
              <iconify-icon icon="solar:magnifer-linear" class="inline-block mr-2 text-xl" /> Lọc Dữ Liệu
            </button>
            <button type="button" @click="exportExcel" class="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105" :disabled="isLoading || !hasData">
              <iconify-icon icon="solar:file-check-line-duotone" class="inline-block mr-2 text-xl" /> Xuất Excel
            </button>
          </div>
        </form>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 mb-8" v-if="hasData">
        <div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 animate__animated animate__fadeInUp">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-lg font-semibold mb-2 opacity-90">Tổng Doanh Thu</h5>
              <p class="text-2xl font-bold">{{ formatCurrency(overviewCards[0]?.amount) }}</p>
            </div>
            <iconify-icon icon="solar:money-bag-linear" class="text-5xl opacity-70" />
          </div>
        </div>

        <div class="bg-gradient-to-br from-lime-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 animate__animated animate__fadeInUp" style="animation-delay: 0.1s;">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-lg font-semibold mb-2 opacity-90">Doanh Thu Hôm Nay</h5>
              <p class="text-2xl font-bold">{{ formatCurrency(dailyRevenue) }}</p>
            </div>
            <iconify-icon icon="solar:calendar-bold" class="text-5xl opacity-70" />
          </div>
        </div>

        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 animate__animated animate__fadeInUp" style="animation-delay: 0.2s;">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-lg font-semibold mb-2 opacity-90">Doanh Thu Tuần Này</h5>
              <p class="text-2xl font-bold">{{ formatCurrency(weeklyRevenue) }}</p>
            </div>
            <iconify-icon icon="solar:calendar-add-bold" class="text-5xl opacity-70" />
          </div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 animate__animated animate__fadeInUp" style="animation-delay: 0.3s;">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-lg font-semibold mb-2 opacity-90">Doanh Thu Tháng Này</h5>
              <p class="text-2xl font-bold">{{ formatCurrency(monthlyRevenue) }}</p>
            </div>
            <iconify-icon icon="solar:calendar-check-bold" class="text-5xl opacity-70" />
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 animate__animated animate__fadeInUp" style="animation-delay: 0.4s;">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Số Đơn Hàng</h5>
              <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ overviewCards[1]?.amount }}</p>
            </div>
            <iconify-icon icon="solar:cart-linear" class="text-5xl text-blue-500 dark:text-blue-300" />
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 animate__animated animate__fadeInUp" style="animation-delay: 0.5s;">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Khách Hàng Mới</h5>
              <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ overviewCards[2]?.amount }}</p>
            </div>
            <iconify-icon icon="solar:user-plus-linear" class="text-5xl text-blue-500 dark:text-blue-300" />
          </div>
        </div>
      </div>
      <div v-if="!hasData && !isLoading" class="no-data bg-white dark:bg-gray-800 rounded-xl shadow-md animate__animated animate__fadeInUp p-8 flex flex-col items-center justify-center">
        <iconify-icon icon="solar:cloud-cross-linear" class="no-data-icon text-gray-400 dark:text-gray-500 text-6xl mb-4" />
        <p class="text-gray-600 dark:text-gray-300 text-xl font-medium">Không có dữ liệu để hiển thị cho khoảng thời gian đã chọn.</p>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Vui lòng điều chỉnh bộ lọc và thử lại.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" v-if="hasData">
        <div class="bg-white dark:bg-gray-800 lg:col-span-2 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <div class="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
              <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                <iconify-icon icon="solar:graph-up-linear" class="text-3xl mr-3 text-blue-600" />
                Xu Hướng Doanh Thu
              </h4>
              <div class="tooltip relative group">
                <iconify-icon icon="solar:info-circle-linear" class="text-2xl text-gray-500 dark:text-gray-400 cursor-help" />
                <span class="tooltip-text absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Doanh thu theo ngày trong khoảng thời gian chọn</span>
              </div>
            </div>
            <div class="chart-container" style="height: 380px">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
        </div>
        <div class="kpi-card bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-6 animate__animated animate__fadeInUp flex flex-col justify-between">
          <div>
            <h4 class="text-2xl font-bold mb-4 flex items-center border-b pb-4 border-blue-400">
              <iconify-icon icon="solar:medal-star-linear" class="text-3xl mr-3" />
              Chỉ Số KPI
            </h4>
            <ul class="space-y-4 text-lg">
              <li><span class="font-semibold">Tỷ lệ chuyển đổi:</span> <span class="text-yellow-200">{{ formatPercent(kpiStats.conversionRate) }}</span></li>
              <li><span class="font-semibold">Tỷ lệ hoàn thành:</span> <span class="text-yellow-200">{{ formatPercent(kpiStats.completionRate) }}</span></li>
              <li><span class="font-semibold">Doanh thu trung bình/đơn:</span> <span class="text-yellow-200">{{ formatCurrency(kpiStats.avgOrderValue) }}</span></li>
              <li><span class="font-semibold">Tỷ lệ hủy đơn:</span> <span class="text-yellow-200">{{ formatPercent(kpiStats.cancellationRate) }}</span></li>
              <li><span class="font-semibold">Giá trị trọn đời KH (CLV):</span> <span class="text-yellow-200">{{ formatCurrency(kpiStats.customerLifetimeValue) }}</span></li>
            </ul>
          </div>
          <div class="mt-6 text-sm text-blue-200">
            <p>Các chỉ số được cập nhật theo thời gian thực.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" v-if="hasData">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
              <iconify-icon icon="solar:inbox-in-linear" class="text-3xl mr-3 text-indigo-600" />
              Thống Kê Tồn Kho
            </h4>
            <div v-if="inventoryStats.totalProducts || inventoryStats.totalStock" class="space-y-4 text-gray-700 dark:text-gray-200 text-lg">
              <div><span class="font-bold">Tổng số sản phẩm:</span> <span class="text-blue-600 dark:text-blue-400">{{ inventoryStats.totalProducts || 'N/A' }}</span></div>
              <div><span class="font-bold">Tổng số lượng tồn kho:</span> <span class="text-blue-600 dark:text-blue-400">{{ inventoryStats.totalStock || 'N/A' }}</span></div>
              <div><span class="font-bold">Số sản phẩm hết hàng:</span> <span class="text-blue-600 dark:text-blue-400">{{ kpiStats.outOfStockProducts || 'N/A' }}</span></div>
            </div>
            <div v-else class="no-data flex flex-col items-center justify-center h-40">
              <iconify-icon icon="solar:cloud-cross-linear" class="no-data-icon text-gray-400 dark:text-gray-500 text-5xl mb-2" />
              <p class="text-gray-600 dark:text-gray-300 mt-2 text-lg">Không có dữ liệu thống kê tồn kho</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
              <iconify-icon icon="solar:calendar-line-duotone" class="text-3xl mr-3 text-orange-600" />
              Doanh Thu Theo Thứ
            </h4>
            <div class="chart-container h-64">
              <canvas id="revenueByWeekDayChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" v-if="hasData">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
              <iconify-icon icon="solar:cart-check-linear" class="text-3xl mr-3 text-pink-600" />
              Trạng Thái Đơn Hàng
            </h4>
            <div class="chart-container h-64">
              <canvas id="orderStatusChart"></canvas>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
              <iconify-icon icon="solar:clock-circle-linear" class="text-3xl mr-3 text-orange-600" />
              Doanh Thu Theo Giờ
            </h4>
            <div class="chart-container h-64">
              <canvas id="revenueByHourChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" v-if="hasData">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
              <iconify-icon icon="solar:fire-linear" class="text-3xl mr-3 text-yellow-600" />
              Sản Phẩm Bán Chạy
            </h4>
            <div class="overflow-x-auto">
              <table class="table w-full text-gray-700 dark:text-gray-200">
                <thead>
                  <tr class="bg-gray-100 dark:bg-gray-700">
                    <th class="text-left p-4 rounded-tl-lg">Sản phẩm</th>
                    <th class="text-center p-4">Số lượng bán</th>
                    <th class="text-right p-4 rounded-tr-lg">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in topSellingProducts" :key="product.productName" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="p-4">{{ product.productName }}</td>
                    <td class="p-4 text-center">{{ product.quantity }}</td>
                    <td class="p-4 text-right">{{ formatCurrency(product.revenue) }}</td>
                  </tr>
                  <tr v-if="!topSellingProducts.length">
                    <td colspan="3" class="text-center text-gray-500 dark:text-gray-400 p-4 py-8">
                      <iconify-icon icon="solar:cloud-cross-linear" class="no-data-icon text-gray-400 dark:text-gray-500 text-5xl mb-2" />
                      <p class="text-lg">Không có dữ liệu sản phẩm bán chạy</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
              <iconify-icon icon="solar:users-group-rounded-linear" class="text-3xl mr-3 text-indigo-600" />
              Khách hàng thân thiết
            </h4>
            <div class="overflow-x-auto">
              <table class="table w-full text-gray-700 dark:text-gray-200">
                <thead>
                  <tr class="bg-gray-100 dark:bg-gray-700">
                    <th class="text-left p-4 rounded-tl-lg">Tên khách hàng</th>
                    <th class="text-center p-4">Số lượng đơn</th>
                    <th class="text-right p-4 rounded-tr-lg">Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="customer in topCustomers" :key="customer.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="p-4">{{ customer.name }}</td>
                    <td class="p-4 text-center">{{ customer.orderCount }}</td>
                    <td class="p-4 text-right">{{ formatCurrency(customer.totalSpent) }}</td>
                  </tr>
                  <tr v-if="!topCustomers.length">
                    <td colspan="3" class="text-center text-gray-500 dark:text-gray-400 p-4 py-8">
                      <iconify-icon icon="solar:cloud-cross-linear" class="no-data-icon text-gray-400 dark:text-gray-500 text-5xl mb-2" />
                      <p class="text-lg">Không có dữ liệu khách hàng</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" v-if="hasData">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
              <iconify-icon icon="solar:pie-chart-3-linear" class="text-3xl mr-3 text-green-600" />
              Doanh Thu Theo Danh Mục
            </h4>
            <div class="chart-container h-64">
              <canvas id="revenueByCategoryChart"></canvas>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate__animated animate__fadeInUp">
          <div class="p-8">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
              <iconify-icon icon="solar:ranking-linear" class="text-3xl mr-3 text-blue-600" />
              Phân Loại Doanh Thu
            </h4>
            <div class="overflow-x-auto">
              <table class="table w-full text-gray-700 dark:text-gray-200">
                <thead>
                  <tr class="bg-gray-100 dark:bg-gray-700">
                    <th class="text-left p-4 rounded-tl-lg">Phân loại</th>
                    <th class="text-right p-4 rounded-tr-lg">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="p-4">Doanh thu trực tuyến</td>
                    <td class="p-4 text-right">{{ formatCurrency(categoryRevenueData.find(item => item.category === 'Online')?.revenue || 0) }}</td>
                  </tr>
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="p-4">Doanh thu tại cửa hàng</td>
                    <td class="p-4 text-right">{{ formatCurrency(categoryRevenueData.find(item => item.category === 'In-store')?.revenue || 0) }}</td>
                  </tr>
                  <tr v-if="!categoryRevenueData.length">
                    <td colspan="2" class="text-center text-gray-500 dark:text-gray-400 p-4 py-8">
                      <iconify-icon icon="solar:cloud-cross-linear" class="no-data-icon text-gray-400 dark:text-gray-500 text-5xl mb-2" />
                      <p class="text-lg">Không có dữ liệu phân loại doanh thu</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

     <div class="bg-white dark:bg-gray-800 mb-8 rounded-xl shadow-lg animate__animated animate__fadeInUp" v-if="hasData">
  <div class="p-8">
    <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
      <iconify-icon icon="solar:box-minimalistic-linear" class="text-3xl mr-3 text-red-600" />
      Sản Phẩm Tồn Kho Thấp
    </h4>
    <div class="overflow-x-auto">
      <table class="table w-full text-gray-700 dark:text-gray-200">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-700">
            <th class="text-left p-4 rounded-tl-lg">STT</th>
            <th class="text-left p-4">Sản phẩm</th>
            <th class="text-center p-4">Tồn kho</th>
            <th class="text-center p-4">Màu sắc</th>
            <th class="text-center p-4">Kích cỡ</th>
            <th class="text-center p-4">Chất liệu</th>
            <th class="text-center p-4 rounded-tr-lg">Mã CTSP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(product, index) in lowStockProducts" :key="product.product" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="p-4 font-medium text-center">{{ index + 1 }}</td>
            <td class="p-4">{{ product.product }}</td>
            <td class="p-4 text-center text-red-500 font-semibold">{{ product.stock }}</td>
            <td class="p-4 text-center">{{ product.color }}</td>
            <td class="p-4 text-center">{{ product.size }}</td>
            <td class="p-4 text-center">{{ product.material }}</td>
            <td class="p-4 text-center">{{ product.ctspCode }}</td>
          </tr>
          <tr v-if="!lowStockProducts.length">
            <td colspan="7" class="text-center text-gray-500 dark:text-gray-400 p-4 py-8">
              <iconify-icon icon="solar:cloud-cross-linear" class="no-data-icon text-gray-400 dark:text-gray-500 text-5xl mb-2" />
              <p class="text-lg">Không có dữ liệu sản phẩm tồn kho thấp</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

      <div class="bg-white dark:bg-gray-800 mb-8 rounded-xl shadow-lg animate__animated animate__fadeInUp" v-if="hasData">
        <div class="p-8">
          <h4 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center border-b pb-4 border-gray-200 dark:border-gray-700">
            <iconify-icon icon="solar:clipboard-text-linear" class="text-3xl mr-3 text-blue-600" />
            Danh Sách Hóa Đơn
          </h4>
          <div class="overflow-x-auto">
            <table class="table w-full text-gray-700 dark:text-gray-200">
              <thead>
                <tr class="bg-gray-100 dark:bg-gray-700">
                  <th class="text-left p-4 rounded-tl-lg">STT</th>
                  <th class="text-left p-4">Mã Hóa Đơn</th>
                  <th class="text-left p-4">Khách Hàng</th>
                  <th class="text-center p-4">Ngày Tạo</th>
                  <th class="text-right p-4">Tổng Tiền</th>
                  <th class="text-center p-4">Trạng Thái</th>
                  <th class="text-center p-4 rounded-tr-lg">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(invoice, index) in paginatedInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td class="p-4 font-medium text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td class="p-4 font-mono text-sm">{{ invoice.maHoaDon }}</td>
                  <td class="p-4 font-medium">{{ invoice.khachHang?.tenKhachHang || 'Khách lẻ' }}</td>
                  <td class="p-4 text-center text-sm">{{ formatDate(invoice.ngayTao) }}</td>
                  <td class="p-4 text-right font-semibold text-green-600 dark:text-green-400">{{ formatCurrency(invoice.tongTienThanhToan) }}</td>
                  <td class="p-4 text-center">
                    <span :class="getStatusColor(invoice.trangThai?.id)" class="px-3 py-1 rounded-full text-xs font-semibold">
                      {{ getStatusText(invoice.trangThai?.id) }}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <router-link :to="{ name: 'InvoiceDetail', params: { id: invoice.id } }" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition duration-200 font-medium">
                      <iconify-icon icon="solar:eye-linear" class="text-2xl" />
                    </router-link>
                  </td>
                </tr>
                <tr v-if="!paginatedInvoices.length">
                  <td colspan="7" class="text-center text-gray-500 dark:text-gray-400 p-4 py-8">
                      <iconify-icon icon="solar:cloud-cross-linear" class="no-data-icon text-gray-400 dark:text-gray-500 text-5xl mb-2" />
                      <p class="text-lg">Không có dữ liệu hóa đơn</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-6">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Trước
            </button>
            <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="{ 'bg-blue-600 text-white': currentPage === page, 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200': currentPage !== page }" class="px-4 py-2 rounded-lg hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <footer class="bg-white dark:bg-gray-800 p-6 mt-12 rounded-xl shadow-lg text-center">
      <p class="text-gray-700 dark:text-gray-300 text-sm font-medium">
        Shop Giày © {{ new Date().getFullYear() }}. Phát triển bởi <a href="https://teamdatn.vn" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">Team DATN</a>.
      </p>
      <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">
        Liên hệ: <a href="mailto:support@shopgiay.vn" class="text-blue-600 dark:text-blue-400 hover:underline">support@shopgiay.vn</a> | Hotline: 0903-123-456
      </p>
      <div class="mt-4 flex justify-center space-x-6">
        <a href="#" class="text-blue-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-500 transition-colors duration-200">
          <iconify-icon icon="fab fa-facebook-f" class="text-xl" />
        </a>
        <a href="#" class="text-blue-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-500 transition-colors duration-200">
          <iconify-icon icon="fab fa-instagram" class="text-xl" />
        </a>
        <a href="#" class="text-blue-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-500 transition-colors duration-200">
          <iconify-icon icon="fab fa-linkedin-in" class="text-xl" />
        </a>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { useToast } from 'vue-toastification';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import mitt from 'mitt';

const emitter = mitt();

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  name: 'Dashboard',
  components: {
    'iconify-icon': Icon,
  },
  setup() {
    const toast = useToast();
    const errorMessage = ref('');
    const isLoading = ref(false);

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const filters = ref({
      fromDate: thirtyDaysAgo.toISOString().slice(0, 10),
      toDate: today.toISOString().slice(0, 10),
      category: 'all',
    });

    const categories = ref([
      { id: 1, name: 'Giày Chạy bộ' },
      { id: 2, name: 'Giày Thể thao' },
      { id: 3, name: 'Giày Sneaker Thời trang' },
      { id: 4, name: 'Giày Bóng rổ' },
      { id: 5, name: 'Giày Trượt ván' },
      { id: 6, name: 'Phiên bản giới hạn' },
      { id: 7, name: 'Giày Cổ thấp' },
      { id: 8, name: 'Giày Không dây' },
    ]);

    const overviewCards = ref([]);
    const kpiStats = ref({ completionRate: 0, avgOrderValue: 0, cancellationRate: 0, customerLifetimeValue: 0, conversionRate: 0, outOfStockProducts: 0 });
    const topSellingProducts = ref([]);
    const lowStockProducts = ref([]);
    const topCustomers = ref([]); 
    const revenueData = ref([]);
    const orderStatusData = ref([]);
    const inventoryStats = ref({ totalProducts: 0, totalStock: 0 });
    const revenueByWeekDay = ref([]);
    const categoryRevenueData = ref([]);
    const revenueByHourData = ref([]);
    const invoices = ref([]);

    const dailyRevenue = ref(0);
    const weeklyRevenue = ref(0);
    const monthlyRevenue = ref(0);

    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const totalPages = computed(() => {
      return Math.ceil(invoices.value.length / itemsPerPage.value);
    });

    const paginatedInvoices = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return invoices.value.slice(start, end);
    });

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const hasRevenueChartData = computed(() => revenueData.value.length > 0 && revenueData.value.some(item => item.revenue > 0));
    const hasOrderStatusData = computed(() => orderStatusData.value.length > 0 && orderStatusData.value.some(item => item.count > 0));
    const hasRevenueByWeekDay = computed(() => revenueByWeekDay.value.length > 0 && revenueByWeekDay.value.some(item => item.revenue > 0));
    const hasCategoryRevenue = computed(() => categoryRevenueData.value.length > 0 && categoryRevenueData.value.some(item => item.revenue > 0));
    const hasRevenueByHour = computed(() => revenueByHourData.value.length > 0 && revenueByHourData.value.some(item => item.revenue > 0));

    const hasData = computed(() => {
      return (
        overviewCards.value.some(card => card.amount > 0) ||
        dailyRevenue.value > 0 ||
        weeklyRevenue.value > 0 ||
        monthlyRevenue.value > 0 ||
        topSellingProducts.value.length > 0 ||
        lowStockProducts.value.length > 0 ||
        topCustomers.value.length > 0 || 
        revenueData.value.length > 0 ||
        orderStatusData.value.length > 0 ||
        inventoryStats.value.totalProducts > 0 ||
        inventoryStats.value.totalStock > 0 ||
        revenueByWeekDay.value.length > 0 ||
        categoryRevenueData.value.length > 0 ||
        revenueByHourData.value.length > 0 ||
        invoices.value.length > 0
      );
    });

    const fetchDashboardData = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = 'Đang tải dữ liệu...';

        const params = {
          fromDate: filters.value.fromDate,
          toDate: filters.value.toDate,
        };

        const [dashboardResponse, invoicesResponse] = await Promise.all([
          api.get('/dashboard', { params: params }),
          api.get('/dashboard/invoices', { params: { ...params, statusId: 21 } }),
        ]);

        const dashboardData = dashboardResponse.data || {};
        const invoicesData = invoicesResponse.data || [];

        console.log("Dữ liệu dashboard nhận được:", dashboardData);
        console.log("Dữ liệu hóa đơn nhận được:", invoicesData);

        overviewCards.value = [
          { title: 'Tổng Doanh Thu', amount: dashboardData.totalRevenue || 0, icon: 'solar:wallet-linear' },
          { title: 'Số Đơn Hàng', amount: dashboardData.orderCount || 0, icon: 'solar:cart-check-linear' },
          { title: 'Khách Hàng Mới', amount: dashboardData.newCustomers || 0, icon: 'solar:add-user-linear' },
        ];

        dailyRevenue.value = dashboardData.totalRevenueToday || 0;
        weeklyRevenue.value = dashboardData.totalRevenueThisWeek || 0;
        monthlyRevenue.value = dashboardData.totalRevenueThisMonth || 0;

        kpiStats.value = {
          completionRate: dashboardData.kpiStats?.completionRate || 0,
          avgOrderValue: dashboardData.kpiStats?.avgOrderValue || 0,
          cancellationRate: dashboardData.kpiStats?.cancellationRate || 0,
          customerLifetimeValue: dashboardData.kpiStats?.customerLifetimeValue || 0, 
          conversionRate: dashboardData.kpiStats?.conversionRate || 0,
          outOfStockProducts: dashboardData.kpiStats?.outOfStockProducts || 0,
        };

        topSellingProducts.value = dashboardData.topSellingProducts || [];
        lowStockProducts.value = dashboardData.lowStockProducts || [];
        topCustomers.value = dashboardData.topCustomers || [];

        revenueData.value = (dashboardData.revenueData || []).map(item => ({
          date: item.date,
          revenue: item.revenue
        }));

        orderStatusData.value = (dashboardData.orderStatusData || []).map(item => ({
          status: getStatusText(item.statusId),
          count: item.count
        }));

        inventoryStats.value = {
          totalProducts: dashboardData.inventoryStats?.totalProducts || 0,
          totalStock: dashboardData.inventoryStats?.totalStock || 0,
        };

        revenueByWeekDay.value = (dashboardData.revenueByWeekDay || []).map(item => ({
          day: getDayName(item.day),
          revenue: item.revenue
        }));

        categoryRevenueData.value = (dashboardData.categoryRevenue || []).map(item => ({
          category: item.category,
          revenue: item.revenue
        }));

        revenueByHourData.value = (dashboardData.revenueByHour || []).map(item => ({
          hour: item.hour,
          revenue: item.revenue
        }));

        invoices.value = invoicesData;
        currentPage.value = 1;

        await nextTick();
        updateCharts();

        toast.success('Dữ liệu dashboard đã được tải thành công!');
        errorMessage.value = '';
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dashboard:', error.response ? error.response.data : error.message);
        errorMessage.value = error.response?.data?.error || 'Không thể tải dữ liệu, vui lòng kiểm tra kết nối hoặc thử lại sau!';
        toast.error(errorMessage.value);
        
        // Reset data to empty state on error
        overviewCards.value = [];
        kpiStats.value = { completionRate: 0, avgOrderValue: 0, cancellationRate: 0, customerLifetimeValue: 0, conversionRate: 0, outOfStockProducts: 0 };
        topSellingProducts.value = [];
        lowStockProducts.value = [];
        topCustomers.value = [];
        revenueData.value = [];
        orderStatusData.value = [];
        inventoryStats.value = { totalProducts: 0, totalStock: 0 };
        revenueByWeekDay.value = [];
        categoryRevenueData.value = [];
        revenueByHourData.value = [];
        invoices.value = [];
        dailyRevenue.value = 0;
        weeklyRevenue.value = 0;
        monthlyRevenue.value = 0;

        await nextTick();
        updateCharts();
      } finally {
        isLoading.value = false;
      }
    };

    const showFilterReminder = () => {
      toast.info('Nhấn nút "Lọc Dữ Liệu" để cập nhật báo cáo.', {
        position: "top-right",
        timeout: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
    };

    const filterData = async () => {
      await fetchDashboardData();
    };

    const exportExcel = async () => {
      if (!hasData.value) {
        toast.error('Không có dữ liệu để xuất báo cáo!');
        return;
      }
      try {
        const ws_data = [
          ['BÁO CÁO DASHBOARD - SHOP GIÀY'],
          ['Thời gian xuất: ' + new Date().toLocaleString('vi-VN')],
          [],
          ['Tổng Quan'],
          ['Tiêu đề', 'Số tiền'],
          ...overviewCards.value.map((item) => [item.title, item.amount]),
          ['Doanh Thu Hôm Nay', dailyRevenue.value],
          ['Doanh Thu Tuần Này', weeklyRevenue.value],
          ['Doanh Thu Tháng Này', monthlyRevenue.value],
          [],
          ['Thống Kê Tồn Kho'],
          ['Tổng số sản phẩm', inventoryStats.value.totalProducts || 'N/A'],
          ['Tổng số lượng tồn kho', inventoryStats.value.totalStock || 'N/A'],
          ['Số sản phẩm hết hàng', kpiStats.value.outOfStockProducts || 'N/A'],
          [],
          ['Sản Phẩm Bán Chạy'],
          ['Sản phẩm', 'Số lượng', 'Doanh thu'],
          ...topSellingProducts.value.map((item) => [item.productName, item.quantity, item.revenue]),
          [],
          ['Sản Phẩm Tồn Kho Thấp'],
          ['Sản phẩm', 'Tồn kho', 'Màu sắc', 'Kích cỡ'],
          ...lowStockProducts.value.map((item) => [item.product, item.stock, item.color, item.size]),
          [],
          ['Doanh Thu Theo Danh Mục'],
          ['Danh mục', 'Doanh thu'],
          ...categoryRevenueData.value.map((item) => [item.category, item.revenue]),
          [],
          ['Doanh Thu Theo Giờ'],
          ['Giờ', 'Doanh thu'],
          ...revenueByHourData.value.map((item) => [item.hour + 'h', item.revenue]),
          [],
          ['Chỉ Số KPI'],
          ['Tỷ lệ chuyển đổi', formatPercent(kpiStats.value.conversionRate)],
          ['Tỷ lệ hoàn thành', formatPercent(kpiStats.value.completionRate)],
          ['Doanh thu trung bình/đơn', formatCurrency(kpiStats.value.avgOrderValue)],
          ['Tỷ lệ hủy đơn', formatPercent(kpiStats.value.cancellationRate)],
          ['Giá trị trọn đời KH (CLV)', formatCurrency(kpiStats.value.customerLifetimeValue)],
          [],
          ['Trạng thái Đơn hàng'],
          ['Trạng thái', 'Số lượng'],
          ...orderStatusData.value.map((item) => [item.status, item.count]),
          [],
          ['Khách hàng thân thiết'],
          ['Tên khách hàng', 'Số lượng đơn', 'Tổng chi tiêu'],
          ...topCustomers.value.map((item) => [item.name, item.orderCount, item.totalSpent]),
          [],
          ['Danh Sách Hóa Đơn (Đã Hoàn Thành)'],
          ['Mã Hóa Đơn', 'Khách Hàng', 'Ngày Tạo', 'Tổng Tiền', 'Trạng Thái'],
          ...invoices.value.map((item) => [
            item.maHoaDon,
            item.khachHang?.tenKhachHang || 'Khách lẻ',
            formatDate(item.ngayTao),
            item.tongTienThanhToan,
            getStatusText(item.trangThai?.id),
          ]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        const colWidths = [
          { wch: 15 },
          { wch: 25 },
          { wch: 20 },
          { wch: 15 },
          { wch: 20 }
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Report');
        XLSX.writeFile(wb, `dashboard_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success('Báo cáo đã được xuất thành công!');
      } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        errorMessage.value = error.response?.data?.error || 'Xuất báo cáo thất bại, vui lòng kiểm tra lại!';
        toast.error(errorMessage.value);
      }
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value || 0);
    };

    const formatPercent = (value) => {
      return value ? `${value.toFixed(1)}%` : 'N/A';
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const getStatusText = (statusId) => {
      const statusMap = {
        6: 'Chờ xác nhận',
        7: 'Chờ xử lý',
        8: 'Chờ vận chuyển',
        9: 'Đang vận chuyển',
        21: 'Đã hoàn thành',
        22: 'Đã hủy',
        23: 'Hoàn 1 phần',
      };
      return statusMap[statusId] || 'Đã hoàn thành';
    };

    const getStatusColor = (statusId) => {
      const colorMap = {
        6: 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold',
        7: 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold',
        8: 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold',
        9: 'text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs font-semibold',
        21: 'text-green-700 bg-green-200 px-2 py-1 rounded-full text-xs font-semibold',
        22: 'text-red-700 bg-red-200 px-2 py-1 rounded-full text-xs font-semibold',
        23: 'text-purple-700 bg-purple-200 px-2 py-1 rounded-full text-xs font-semibold',
      };
      return colorMap[statusId] || 'text-green-700 bg-green-200 px-2 py-1 rounded-full text-xs font-semibold';
    };

    const getDayName = (dayNumber) => {
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      return days[dayNumber - 1] || 'Không xác định';
    };

    const charts = ref({});

    const renderChart = (canvasId, config, fallbackMessage) => {
      const ctx = document.getElementById(canvasId);
      if (!ctx) {
        console.warn(`Canvas element with ID '${canvasId}' not found.`);
        return null;
      }

      const chartInstance = charts.value[canvasId];
      if (chartInstance) {
        chartInstance.destroy();
      }

      const hasMeaningfulData = config?.data?.labels?.length > 0 && config.data.datasets.some(dataset => dataset.data.some(val => val !== 0 && val !== null && val !== undefined));
      
      const chartContainer = ctx.closest('.chart-container');
      let noDataElement = null;
      if (chartContainer) {
        noDataElement = chartContainer.querySelector('.no-data');
        if (!noDataElement) {
          noDataElement = document.createElement('div');
          noDataElement.className = 'no-data flex flex-col items-center justify-center h-full';
          noDataElement.innerHTML = `<iconify-icon icon="solar:cloud-cross-linear" class="no-data-icon text-gray-400 dark:text-gray-500 text-5xl mb-2" /><p class="text-gray-600 dark:text-gray-300 mt-2 text-lg"></p>`;
          chartContainer.appendChild(noDataElement);
        }
      }

      if (!hasMeaningfulData) {
        if (chartContainer) {
          ctx.style.display = 'none';
          if (noDataElement) {
            noDataElement.style.display = 'flex';
            noDataElement.querySelector('p').textContent = fallbackMessage;
          }
        }
        return null;
      } else {
        if (chartContainer) {
          ctx.style.display = 'block';
          if (noDataElement) {
            noDataElement.style.display = 'none';
          }
        }
      }

      charts.value[canvasId] = new Chart(ctx, config);
      return charts.value[canvasId];
    };

    const updateCharts = () => {
      const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 });

      renderChart('revenueChart', {
        type: 'line',
        data: {
          labels: revenueData.value.map((item) => item.date),
          datasets: [
            {
              label: 'Doanh thu',
              data: revenueData.value.map((item) => item.revenue),
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointBackgroundColor: '#2563eb',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#2563eb',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => currencyFormatter.format(value),
                color: '#4b5563',
              },
              grid: { color: '#e5e7eb' },
            },
            x: {
              ticks: { color: '#4b5563' },
              grid: { display: false },
            },
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#374151',
                font: { size: 14 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${currencyFormatter.format(context.raw)}`,
              },
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 10,
              displayColors: true,
            },
          },
        },
      }, 'Không có dữ liệu doanh thu theo ngày để hiển thị.');

      renderChart('orderStatusChart', {
        type: 'doughnut',
        data: {
          labels: orderStatusData.value.map((item) => item.status),
          datasets: [
            {
              label: 'Số lượng đơn',
              data: orderStatusData.value.map((item) => item.count),
              backgroundColor: ['#34d399', '#f97316', '#a855f7', '#10b981', '#ef4444', '#f59e0b', '#60a5fa'],
              borderColor: '#ffffff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#374151',
                font: { size: 12 },
                boxWidth: 20
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 10,
              displayColors: true,
            },
          },
        },
      }, 'Không có dữ liệu trạng thái đơn hàng để hiển thị.');

      renderChart('revenueByWeekDayChart', {
        type: 'bar',
        data: {
          labels: revenueByWeekDay.value.map((item) => item.day),
          datasets: [
            {
              label: 'Doanh thu',
              data: revenueByWeekDay.value.map((item) => item.revenue),
              backgroundColor: '#4ade80',
              borderColor: '#16a34a',
              borderWidth: 1,
              borderRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => currencyFormatter.format(value),
                color: '#4b5563',
              },
              grid: { color: '#e5e7eb' },
            },
            x: {
              ticks: { color: '#4b5563' },
              grid: { display: false },
            },
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#374151',
                font: { size: 14 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${currencyFormatter.format(context.raw)}`,
              },
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 10,
              displayColors: true,
            },
          },
        },
      }, 'Không có dữ liệu doanh thu theo thứ để hiển thị.');

      renderChart('revenueByCategoryChart', {
        type: 'pie',
        data: {
          labels: categoryRevenueData.value.map((item) => item.category),
          datasets: [
            {
              label: 'Doanh thu',
              data: categoryRevenueData.value.map((item) => item.revenue),
              backgroundColor: ['#10b981', '#3b82f6', '#f43f5e', '#f97316', '#a855f7', '#ef4444', '#6b7280', '#0ea5e9'],
              borderColor: '#ffffff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#374151',
                font: { size: 12 },
                boxWidth: 20
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${currencyFormatter.format(value)} (${percentage}%)`;
                },
              },
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 10,
              displayColors: true,
            },
          },
        },
      }, 'Không có dữ liệu doanh thu theo danh mục để hiển thị.');

      renderChart('revenueByHourChart', {
        type: 'bar',
        data: {
          labels: revenueByHourData.value.map((item) => `${item.hour}h`),
          datasets: [
            {
              label: 'Doanh thu',
              data: revenueByHourData.value.map((item) => item.revenue),
              backgroundColor: '#f97316',
              borderColor: '#ea580c',
              borderWidth: 1,
              borderRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => currencyFormatter.format(value),
                color: '#4b5563',
              },
              grid: { color: '#e5e7eb' },
            },
            x: {
              ticks: { color: '#4b5563' },
              grid: { display: false },
            },
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#374151',
                font: { size: 14 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${currencyFormatter.format(context.raw)}`,
              },
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 10,
              displayColors: true,
            },
          },
        },
      }, 'Không có dữ liệu doanh thu theo giờ để hiển thị.');
    };

    const initChatbot = () => {
      const script = document.createElement('script');
      script.src = 'https://app.tudongchat.com/js/chatbox.js';
      script.async = true;
      script.onload = () => {
        if (window.TuDongChat) {
          const tudong_chatbox = new window.TuDongChat('rKnd8_19n6Lvrg-lDWmTs');
          tudong_chatbox.initial();
        } else {
          console.error('TuDongChat script loaded but TuDongChat is undefined');
        }
      };
      script.onerror = () => {
        console.error('Failed to load TuDongChat script');
      };
      document.body.appendChild(script);
    };

    // Lắng nghe sự kiện invoice-completed để làm mới tổng doanh thu
    onMounted(() => {
      fetchDashboardData();
      initChatbot();
      emitter.on('invoice-completed', (invoice) => {
        console.log('Nhận được sự kiện invoice-completed:', invoice);
        fetchDashboardData();
        toast.info('Tổng doanh thu đã được cập nhật!', { timeout: 3000 });
      });
    });

    onUnmounted(() => {
      Object.values(charts.value).forEach((chart) => chart?.destroy());
      emitter.off('invoice-completed');
    });

    watch(
      filters,
      async () => {
        // Không tự động lọc khi thay đổi, chỉ hiển thị thông báo nhắc nhở
      },
      { deep: true }
    );

    return {
      errorMessage,
      isLoading,
      filters,
      categories,
      overviewCards,
      kpiStats,
      topSellingProducts,
      lowStockProducts,
      topCustomers, 
      revenueData,
      orderStatusData,
      inventoryStats,
      revenueByWeekDay,
      categoryRevenueData,
      revenueByHourData,
      invoices,
      paginatedInvoices,
      currentPage,
      itemsPerPage,
      totalPages,
      goToPage,
      prevPage,
      nextPage,
      filterData,
      exportExcel,
      formatCurrency,
      formatPercent,
      formatDate,
      getStatusText,
      getStatusColor,
      hasRevenueChartData,
      hasOrderStatusData,
      hasRevenueByWeekDay,
      hasCategoryRevenue,
      hasRevenueByHour,
      hasData,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      showFilterReminder,
    };
  },
};
</script>

<style scoped>
@import 'vue-toastification/dist/index.css';

.card {
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
  border: 1px solid rgba(229, 231, 235, 0.6);
}

.dark .card {
  background: #2D3748;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.7);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.dark .card:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.chart-container {
  position: relative;
  height: 380px;
  padding: 16px;
  background-color: #fcfcfc;
  border-radius: 10px;
}

.dark .chart-container {
  background-color: #374151;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dark .table {
  background: #374151;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.table th,
.table td {
  padding: 14px 18px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.dark .table th,
.dark .table td {
  border-bottom: 1px solid #5a6773;
}

.table thead th {
  background: #eef2ff;
  color: #3b82f6;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dark .table thead th {
  background: #4b5563;
  color: #93c5fd;
}

.table tbody tr {
  transition: background 0.2s ease;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background: #f4f7fc;
}

.dark .table tbody tr:hover {
  background: #4a5568;
}

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  background: #1e40af;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: #6b7280;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.2);
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(107, 114, 128, 0.3);
}

.btn-secondary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  color: #6b7280;
  font-size: 1.1rem;
  text-align: center;
}

.dark .no-data {
  color: #d1d5db;
}

.no-data-icon {
  font-size: 60px;
  color: #a0a0a0;
  margin-bottom: 16px;
}

.dark .no-data-icon {
  color: #888888;
}

.filter-group {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .filter-group {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.kpi-card {
  background: linear-gradient(135deg, #3b82f6, #0A53E0);
  color: white;
  border-radius: 16px;
  padding: 30px;
  transition: transform 0.3s ease;
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.3);
}

.kpi-card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
}

.kpi-card h4 {
  font-size: 1.75rem;
}

.kpi-card ul li {
  font-size: 1.15rem;
  margin-bottom: 8px;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 200px;
  background: #334155;
  color: white;
  text-align: center;
  border-radius: 8px;
  padding: 10px 12px;
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

@media (max-width: 1024px) {
  .chart-container {
    height: 320px;
  }
}

@media (max-width: 640px) {
  .chart-container {
    height: 250px;
  }

  .table th,
  .table td {
    padding: 10px;
    font-size: 0.8rem;
  }

  .filter-group {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .kpi-card {
    padding: 20px;
  }
}

.status-success {
  background-color: #d1fae5;
  color: #065f46;
}
.dark .status-success {
  background-color: #10b981;
  color: white;
}

.status-pending {
  background-color: #fffbeb;
  color: #92400e;
}
.dark .status-pending {
  background-color: #f59e0b;
  color: white;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}
.dark .status-cancelled {
  background-color: #ef4444;
  color: white;
}

.font-sans {
  font-family: 'Inter', sans-serif;
}
</style>