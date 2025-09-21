<template>
  <div class="dashboard-container">
    <!-- Breadcrumb -->
    <Breadcrumb 
      :items="breadcrumbItems"
      :show-page-info="true"
      page-title="Dashboard Thống kê"
      page-description="Tổng quan hiệu suất kinh doanh của Shop Giày"
      page-icon="solar:chart-square-bold-duotone"
      :page-stats="pageStats"
      :actions="breadcrumbActions"
    />

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card revenue-card">
        <div class="card-icon">
          <iconify-icon icon="solar:wallet-money-bold-duotone"></iconify-icon>
        </div>
        <div class="card-content">
          <h3 class="card-value">{{ formatCurrency(stats.totalRevenue) }}</h3>
          <p class="card-label">Tổng Doanh Thu</p>
          <div class="card-trend positive">
            <iconify-icon icon="solar:arrow-up-bold"></iconify-icon>
            <span>+12.5%</span>
          </div>
        </div>
      </div>

      <div class="stat-card orders-card">
        <div class="card-icon">
          <iconify-icon icon="solar:bag-check-bold-duotone"></iconify-icon>
        </div>
        <div class="card-content">
          <h3 class="card-value">{{ stats.totalOrders.toLocaleString() }}</h3>
          <p class="card-label">Đơn Hàng</p>
          <div class="card-trend positive">
            <iconify-icon icon="solar:arrow-up-bold"></iconify-icon>
            <span>+8.3%</span>
          </div>
        </div>
      </div>

      <div class="stat-card customers-card">
        <div class="card-icon">
          <iconify-icon icon="solar:users-group-two-rounded-bold-duotone"></iconify-icon>
        </div>
        <div class="card-content">
          <h3 class="card-value">{{ stats.totalCustomers.toLocaleString() }}</h3>
          <p class="card-label">Khách Hàng</p>
          <div class="card-trend positive">
            <iconify-icon icon="solar:arrow-up-bold"></iconify-icon>
            <span>+15.2%</span>
          </div>
        </div>
      </div>

      <div class="stat-card products-card">
        <div class="card-icon">
          <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
        </div>
        <div class="card-content">
          <h3 class="card-value">{{ stats.totalProducts.toLocaleString() }}</h3>
          <p class="card-label">Sản Phẩm</p>
          <div class="card-trend neutral">
            <iconify-icon icon="solar:arrow-right-bold"></iconify-icon>
            <span>+2.1%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <!-- Revenue Chart -->
      <div class="chart-card large-chart">
        <div class="chart-header">
          <h3 class="chart-title">
            <iconify-icon icon="solar:chart-2-bold-duotone"></iconify-icon>
            Xu Hướng Doanh Thu
          </h3>
          <div class="chart-actions">
            <div class="chart-period-buttons">
              <button 
                class="chart-btn" 
                :class="{ active: revenuePeriod === 'daily' }"
                @click="changeRevenuePeriod('daily')"
              >
                Ngày
              </button>
              <button 
                class="chart-btn" 
                :class="{ active: revenuePeriod === 'weekly' }"
                @click="changeRevenuePeriod('weekly')"
              >
                Tuần
              </button>
              <button 
                class="chart-btn" 
                :class="{ active: revenuePeriod === 'monthly' }"
                @click="changeRevenuePeriod('monthly')"
              >
                Tháng
              </button>
              <button 
                class="chart-btn" 
                :class="{ active: revenuePeriod === 'yearly' }"
                @click="changeRevenuePeriod('yearly')"
              >
                Năm
              </button>
            </div>
            <div class="chart-type-buttons">
              <button 
                class="chart-type-btn" 
                :class="{ active: chartType === 'line' }"
                @click="changeChartType('line')"
                title="Biểu đồ đường"
              >
                <iconify-icon icon="solar:chart-2-bold-duotone"></iconify-icon>
              </button>
              <button 
                class="chart-type-btn" 
                :class="{ active: chartType === 'bar' }"
                @click="changeChartType('bar')"
                title="Biểu đồ cột"
              >
                <iconify-icon icon="solar:chart-square-bold-duotone"></iconify-icon>
              </button>
            </div>
          </div>
        </div>
        <div class="chart-container revenue-chart-container">
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>

      <!-- Category Performance -->
      <div class="chart-card category-chart-card">
        <div class="chart-header">
          <h3 class="chart-title">
            <iconify-icon icon="solar:pie-chart-2-bold-duotone"></iconify-icon>
            Hiệu Suất Danh Mục
          </h3>
        </div>
        <div class="chart-container category-chart-container">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Data Tables Section -->
    <div class="tables-section">
      <!-- Top Products -->
      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">
            <iconify-icon icon="solar:fire-bold-duotone"></iconify-icon>
            Sản Phẩm Bán Chạy
          </h3>
          <button class="view-all-btn" @click="navigateToProducts">Xem tất cả</button>
        </div>
        <DataTable 
          :data="topProducts" 
          :columns="productColumns"
          item-label="sản phẩm"
          empty-message="Không có sản phẩm nào."
        >
          <template #product="{ item }">
            <div class="product-info">
              <div class="product-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="product-details">
                <span class="product-name">{{ item.name }}</span>
                <span class="product-sku">{{ item.sku }}</span>
              </div>
            </div>
          </template>
          <template #category="{ item }">
            <span class="category-badge" :class="getCategoryClass(item.category)">
              {{ item.category }}
            </span>
          </template>
          <template #sold="{ item }">
            <span class="sold-count">{{ item.sold.toLocaleString() }}</span>
          </template>
          <template #revenue="{ item }">
            <span class="revenue-amount">{{ formatCurrency(item.revenue) }}</span>
          </template>
          <template #growth="{ item }">
            <div class="growth-indicator" :class="item.growth >= 0 ? 'positive' : 'negative'">
              <iconify-icon :icon="item.growth >= 0 ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'"></iconify-icon>
              <span>{{ Math.abs(item.growth) }}%</span>
            </div>
          </template>
        </DataTable>
      </div>

      <!-- Recent Orders -->
      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">
            <iconify-icon icon="solar:clipboard-list-bold-duotone"></iconify-icon>
            Đơn Hàng Gần Đây
          </h3>
          <button class="view-all-btn" @click="navigateToInvoices">Xem tất cả</button>
        </div>
        <DataTable 
          :data="recentOrders" 
          :columns="orderColumns"
          item-label="đơn hàng"
          empty-message="Không có đơn hàng nào."
        >
          <template #code="{ item }">
            <span class="order-code">{{ item.code }}</span>
          </template>
          <template #customer="{ item }">
            <div class="customer-info">
              <div class="customer-avatar">
                <img :src="item.customer.avatar" :alt="item.customer.name" />
              </div>
              <span class="customer-name">{{ item.customer.name }}</span>
            </div>
          </template>
          <template #productCount="{ item }">
            <span class="product-count">{{ item.productCount }} sản phẩm</span>
          </template>
          <template #total="{ item }">
            <span class="order-total">{{ formatCurrency(item.total) }}</span>
          </template>
          <template #createdAt="{ item }">
            <span class="order-date">{{ formatDate(item.createdAt) }}</span>
          </template>
        </DataTable>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import * as XLSX from 'xlsx'
import Breadcrumb from '@/components/Breadcrumb.vue'
import DataTable from '@/components/DataTable.vue'
import statisticsAPI from '@/services/api/statisticsAPI.js'

Chart.register(...registerables)

export default {
  name: 'ShoeDashboard',
  components: {
    Breadcrumb,
    DataTable
  },
  setup() {
    const router = useRouter()
    const selectedTimeRange = ref('30')
    const revenuePeriod = ref('daily')
    const chartType = ref('line')
    const revenueChart = ref(null)
    const categoryChart = ref(null)
    let revenueChartInstance = null
    let categoryChartInstance = null

    // Breadcrumb data
    const breadcrumbItems = ref([
      { label: 'Thống kê', path: '/dashboard' }
    ])

    const breadcrumbActions = ref([
      {
        label: 'Xuất báo cáo',
        type: 'primary',
        handler: () => exportReport()
      },
      {
        label: 'Làm mới',
        type: 'default',
        handler: () => updateData()
      }
    ])

    const pageStats = ref([
      {
        value: '0 VNĐ',
        label: 'Doanh thu hôm nay',
        icon: 'solar:wallet-money-bold-duotone'
      },
      {
        value: '0',
        label: 'Đơn hàng mới',
        icon: 'solar:bag-check-bold-duotone'
      }
    ])

    // Column definitions
    const productColumns = ref([
      { key: 'product', label: 'Sản Phẩm', class: 'product-col' },
      { key: 'category', label: 'Danh Mục', class: 'category-col' },
      { key: 'sold', label: 'Đã Bán', class: 'sold-col' },
      { key: 'revenue', label: 'Doanh Thu', class: 'revenue-col' },
      { key: 'growth', label: 'Tăng Trưởng', class: 'growth-col' }
    ])

    const orderColumns = ref([
      { key: 'code', label: 'Mã Đơn', class: 'code-col' },
      { key: 'customer', label: 'Khách Hàng', class: 'customer-col' },
      { key: 'productCount', label: 'Sản Phẩm', class: 'product-count-col' },
      { key: 'total', label: 'Tổng Tiền', class: 'total-col' },
      { key: 'createdAt', label: 'Ngày Tạo', class: 'date-col' }
    ])

    // Real data from backend
    const stats = ref({
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0
    })

    const topProducts = ref([])
    const recentOrders = ref([])

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(value)
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }

    const getCategoryClass = (category) => {
      const classes = {
        'Sneaker': 'category-sneaker',
        'Chạy bộ': 'category-running',
        'Canvas': 'category-canvas',
        'Skateboard': 'category-skateboard',
        'Lifestyle': 'category-lifestyle'
      }
      return classes[category] || 'category-default'
    }

    const getStatusClass = (status) => {
      const classes = {
        'Đã giao': 'status-delivered',
        'Đang giao': 'status-shipping',
        'Chờ xử lý': 'status-pending',
        'Đã hủy': 'status-cancelled'
      }
      return classes[status] || 'status-default'
    }

    // Helper function để tính tuần chính xác với validation
    const getWeekNumber = (date) => {
      // Kiểm tra input hợp lệ
      if (!date || isNaN(date.getTime())) {
        return NaN
      }
      
      try {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        
        // Kiểm tra các giá trị có hợp lệ
        if (isNaN(d.getTime())) {
          return NaN
        }
        
        const dayNum = d.getUTCDay() || 7
        d.setUTCDate(d.getUTCDate() + 4 - dayNum)
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
        
        const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
        
        // Kiểm tra kết quả hợp lệ
        if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 53) {
          return NaN
        }
        
        return weekNumber
      } catch (error) {
        console.warn('Error calculating week number:', error)
        return NaN
      }
    }

    // Hàm parse ngày từ backend với nhiều định dạng khác nhau
    const parseBackendDate = (dateString) => {
      if (!dateString) return null
      
      // Nếu đã là định dạng chuẩn ISO (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        return new Date(dateString)
      }
      
      // Nếu là định dạng dd/mm/yyyy
      if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) {
        return new Date(dateString)
      }
      
      // Nếu là định dạng dd/mm (thiếu năm) - thêm năm hiện tại
      if (/^\d{1,2}\/\d{1,2}$/.test(dateString)) {
        const currentYear = new Date().getFullYear()
        const [day, month] = dateString.split('/')
        return new Date(`${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      }
      
      // Nếu là định dạng mm/dd (American format) - thêm năm hiện tại
      if (/^\d{1,2}\/\d{1,2}$/.test(dateString)) {
        const currentYear = new Date().getFullYear()
        const parts = dateString.split('/')
        // Thử cả hai cách: dd/mm và mm/dd
        const date1 = new Date(`${currentYear}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`)
        const date2 = new Date(`${currentYear}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`)
        
        // Chọn ngày hợp lệ
        if (!isNaN(date1.getTime())) return date1
        if (!isNaN(date2.getTime())) return date2
      }
      
      // Thử parse trực tiếp
      const directParse = new Date(dateString)
      if (!isNaN(directParse.getTime())) {
        return directParse
      }
      
      return null
    }

    // Sửa lại hàm formatChartLabel với logic chính xác và validation
    const formatChartLabel = (dateString, period) => {
      // Kiểm tra input hợp lệ
      if (!dateString) {
        return 'N/A'
      }
      
      const date = parseBackendDate(dateString)
      
      // Kiểm tra ngày hợp lệ
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString)
        // Nếu là định dạng dd/mm thì trả về luôn thay vì N/A
        if (/^\d{1,2}\/\d{1,2}$/.test(dateString)) {
          return dateString
        }
        return 'N/A'
      }
      
      const currentYear = new Date().getFullYear()
      
      switch (period) {
        case 'daily':
          const day = date.getDate()
          const month = date.getMonth() + 1
          
          // Kiểm tra giá trị hợp lệ
          if (isNaN(day) || isNaN(month)) {
            return dateString || 'N/A'
          }
          
          return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`
        
        case 'weekly':
          const weekNumber = getWeekNumber(date)
          const weekYear = date.getFullYear()
          
          if (isNaN(weekNumber) || isNaN(weekYear)) {
            return dateString || 'N/A'
          }
          
          return weekYear !== currentYear ? `Tuần ${weekNumber}/${weekYear}` : `Tuần ${weekNumber}`
        
        case 'monthly':
          const monthNames = [
            'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
            'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
          ]
          const monthIndex = date.getMonth()
          const yearMonth = date.getFullYear()
          
          if (isNaN(monthIndex) || isNaN(yearMonth) || monthIndex < 0 || monthIndex > 11) {
            return dateString || 'N/A'
          }
          
          // Nếu không phải năm hiện tại thì hiển thị cả năm
          if (yearMonth !== currentYear) {
            return `${monthNames[monthIndex]}/${yearMonth}`
          }
          return monthNames[monthIndex]
        
        case 'yearly':
          const fullYear = date.getFullYear()
          
          if (isNaN(fullYear)) {
            return dateString || 'N/A'
          }
          
          return `${fullYear}`
        
        default:
          return dateString || 'N/A'
      }
    }

    // Hàm format ngày cho export với validation
    const formatDateForExport = (date, period) => {
      if (!date) {
        return 'N/A'
      }
      
      const dateObj = parseBackendDate(date)
      
      // Kiểm tra ngày hợp lệ
      if (!dateObj || isNaN(dateObj.getTime())) {
        console.warn('Invalid date for export:', date)
        return date || 'N/A'
      }
      
      switch (period) {
        case 'daily':
          return dateObj.toLocaleDateString('vi-VN')
        case 'weekly':
          const weekNumber = getWeekNumber(dateObj)
          const exportYear = dateObj.getFullYear()
          
          if (isNaN(weekNumber) || isNaN(exportYear)) {
            return 'N/A'
          }
          
          return `Tuần ${weekNumber}/${exportYear}`
        case 'monthly':
          const month = dateObj.getMonth() + 1
          const yearMonth = dateObj.getFullYear()
          
          if (isNaN(month) || isNaN(yearMonth)) {
            return 'N/A'
          }
          
          return `${month.toString().padStart(2, '0')}/${yearMonth}`
        case 'yearly':
          const exportFullYear = dateObj.getFullYear()
          
          if (isNaN(exportFullYear)) {
            return 'N/A'
          }
          
          return exportFullYear.toString()
        default:
          return date || 'N/A'
      }
    }

    // Load dashboard data from backend
    const loadDashboardData = async () => {
      try {
        const response = await statisticsAPI.getDashboardStats()
        const data = response.data
        
        // Update main stats
        stats.value = {
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          totalCustomers: data.totalCustomers || 0,
          totalProducts: data.totalProducts || 0
        }
        
        // Update page stats for breadcrumb with real data
        pageStats.value = [
          {
            value: formatCurrency(data.todayRevenue || 0),
            label: 'Doanh thu hôm nay',
            icon: 'solar:wallet-money-bold-duotone'
          },
          {
            value: (data.todayOrders || 0).toLocaleString(),
            label: 'Đơn hàng mới',
            icon: 'solar:bag-check-bold-duotone'
          }
        ]
        
        // Update top products
        topProducts.value = (data.topProducts || []).map(product => ({
          id: product.productId,
          name: product.productName,
          sku: product.productCode,
          category: product.categoryName,
          sold: product.totalSold,
          revenue: product.totalRevenue,
          growth: product.growthPercentage,
          image: product.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center'
        }))
        
        // Update recent orders
        recentOrders.value = (data.recentOrders || []).map(order => ({
          id: order.orderId,
          code: order.orderCode,
          customer: {
            name: order.customerName,
            avatar: order.customerAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          },
          productCount: order.productCount,
          total: order.totalAmount,
          status: order.status,
          createdAt: new Date(order.createdAt)
        }))
        
        // Initialize charts with real data
        await initCharts(data)
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Initialize charts with empty data on error
        await initCharts()
      }
    }

    const initCharts = async (data = null) => {
      await nextTick()
      
      // Revenue Chart
      if (revenueChart.value) {
        const ctx = revenueChart.value.getContext('2d')
        
        if (revenueChartInstance) {
          revenueChartInstance.destroy()
        }
        
        const revenueData = data?.revenueData || []
        const labels = revenueData.map(item => formatChartLabel(item.date, revenuePeriod.value)) || ['1/1', '2/1', '3/1', '4/1', '5/1']
        const revenues = revenueData.map(item => item.revenue / 1000000) || [120, 150, 180, 220, 190] // Convert to millions
        
        revenueChartInstance = new Chart(ctx, {
          type: chartType.value,
          data: {
            labels: labels,
            datasets: [{
              label: 'Doanh thu (triệu VNĐ)',
              data: revenues,
              borderColor: '#007bff',
              backgroundColor: chartType.value === 'bar' ? '#007bff' : 'rgba(0, 123, 255, 0.1)',
              fill: chartType.value === 'line',
              tension: chartType.value === 'line' ? 0.4 : 0,
              pointBackgroundColor: '#007bff',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: chartType.value === 'line' ? 6 : 0,
              pointHoverRadius: chartType.value === 'line' ? 8 : 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0,0,0,0.1)'
                },
                ticks: {
                  callback: function(value) {
                    return value + 'M'
                  }
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
      }

      // Category Chart
      if (categoryChart.value) {
        const ctx2 = categoryChart.value.getContext('2d')
        
        if (categoryChartInstance) {
          categoryChartInstance.destroy()
        }
        
        const categoryData = data?.categoryData || []
        const categoryLabels = categoryData.map(item => item.categoryName) || ['Sneaker', 'Chạy bộ', 'Canvas', 'Skateboard', 'Lifestyle']
        const categoryPercentages = categoryData.map(item => item.percentage) || [35, 25, 20, 12, 8]
        
        categoryChartInstance = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: categoryLabels,
            datasets: [{
              data: categoryPercentages,
              backgroundColor: [
                '#007bff',
                '#28a745',
                '#ffc107',
                '#dc3545',
                '#6f42c1'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    size: 12
                  }
                }
              }
            }
          }
        })
      }
    }

    const updateData = () => {
      console.log('Updating data for range:', selectedTimeRange.value)
      loadDashboardData()
    }

    const changeRevenuePeriod = async (period) => {
      revenuePeriod.value = period
      await updateRevenueChart()
    }

    const changeChartType = async (type) => {
      chartType.value = type
      await updateRevenueChart()
    }

    // Sửa lại hàm updateRevenueChart với logic ngày tháng chính xác
    const updateRevenueChart = async () => {
      try {
        const endDate = new Date()
        const startDate = new Date()
        
        // Điều chỉnh khoảng thời gian dựa trên period
        switch (revenuePeriod.value) {
          case 'yearly':
            startDate.setFullYear(endDate.getFullYear() - 4) // 5 năm gần nhất (bao gồm năm hiện tại)
            startDate.setMonth(0, 1) // Đầu năm
            break
          case 'monthly':
            startDate.setMonth(endDate.getMonth() - 11) // 12 tháng gần nhất
            startDate.setDate(1) // Đầu tháng
            break
          case 'weekly':
            startDate.setDate(endDate.getDate() - 77) // 11 tuần trước + tuần hiện tại = 12 tuần
            // Đặt về đầu tuần (Thứ 2)
            const dayOfWeek = startDate.getDay()
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            startDate.setDate(startDate.getDate() - daysToMonday)
            break
          case 'daily':
          default:
            startDate.setDate(endDate.getDate() - parseInt(selectedTimeRange.value))
            break
        }
        
        const response = await statisticsAPI.getRevenueByPeriod(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          revenuePeriod.value
        )
        
        const revenueData = response.data || []
        
        if (revenueChartInstance) {
          revenueChartInstance.destroy()
        }
        
        // Tạo chart mới với type đã chọn
        const ctx = revenueChart.value.getContext('2d')
        const labels = revenueData.map(item => formatChartLabel(item.date, revenuePeriod.value))
        const revenues = revenueData.map(item => item.revenue / 1000000) // Chuyển đổi sang triệu
        
        const chartConfig = {
          type: chartType.value,
          data: {
            labels: labels,
            datasets: [{
              label: 'Doanh thu (triệu VNĐ)',
              data: revenues,
              borderColor: '#007bff',
              backgroundColor: chartType.value === 'bar' ? '#007bff' : 'rgba(0, 123, 255, 0.1)',
              fill: chartType.value === 'line',
              tension: chartType.value === 'line' ? 0.4 : 0,
              pointBackgroundColor: '#007bff',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: chartType.value === 'line' ? 6 : 0,
              pointHoverRadius: chartType.value === 'line' ? 8 : 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0,0,0,0.1)'
                },
                ticks: {
                  callback: function(value) {
                    return value + 'M'
                  }
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        }
        
        revenueChartInstance = new Chart(ctx, chartConfig)
        
      } catch (error) {
        console.error('Error updating revenue chart:', error)
      }
    }

    const navigateToProducts = () => {
      router.push('/san-pham')
    }

    const navigateToInvoices = () => {
      router.push('/hoa-don')
    }

    const exportReport = async () => {
      try {
        // Get current date for filename
        const currentDate = new Date()
        const dateStr = currentDate.toISOString().split('T')[0]
        const timeStr = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-')
        
        // Create workbook
        const workbook = XLSX.utils.book_new()
        
        // Sheet 1: Tổng quan thống kê
        const overviewData = [
          ['BÁO CÁO THỐNG KÊ PHOSTEP'],
          ['Ngày xuất:', `${currentDate.toLocaleDateString('vi-VN')} ${currentDate.toLocaleTimeString('vi-VN')}`],
          [''],
          ['TỔNG QUAN'],
          ['Chỉ số', 'Giá trị'],
          ['Tổng doanh thu', formatCurrency(stats.value.totalRevenue)],
          ['Tổng đơn hàng', stats.value.totalOrders.toLocaleString()],
          ['Tổng khách hàng', stats.value.totalCustomers.toLocaleString()],
          ['Tổng sản phẩm', stats.value.totalProducts.toLocaleString()]
        ]
        
        const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
        XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Tổng quan')
        
        // Sheet 2: Sản phẩm bán chạy
        const productData = [
          ['SẢN PHẨM BÁN CHẠY'],
          [''],
          ['Tên sản phẩm', 'Mã sản phẩm', 'Danh mục', 'Đã bán', 'Doanh thu', 'Tăng trưởng (%)']
        ]
        
        topProducts.value.forEach(product => {
          productData.push([
            product.name,
            product.sku,
            product.category,
            product.sold.toLocaleString(),
            formatCurrency(product.revenue),
            product.growth + '%'
          ])
        })
        
        const productSheet = XLSX.utils.aoa_to_sheet(productData)
        XLSX.utils.book_append_sheet(workbook, productSheet, 'Sản phẩm bán chạy')
        
        // Sheet 3: Đơn hàng gần đây
        const orderData = [
          ['ĐƠN HÀNG GẦN ĐÂY'],
          [''],
          ['Mã đơn', 'Khách hàng', 'Số sản phẩm', 'Tổng tiền', 'Ngày tạo']
        ]
        
        recentOrders.value.forEach(order => {
          orderData.push([
            order.code,
            order.customer.name,
            order.productCount + ' sản phẩm',
            formatCurrency(order.total),
            formatDate(order.createdAt)
          ])
        })
        
        const orderSheet = XLSX.utils.aoa_to_sheet(orderData)
        XLSX.utils.book_append_sheet(workbook, orderSheet, 'Đơn hàng gần đây')
        
        // Sheet 4: Dữ liệu doanh thu theo thời gian
        try {
          const revenueEndDate = new Date()
          const revenueStartDate = new Date()
          revenueStartDate.setDate(revenueEndDate.getDate() - parseInt(selectedTimeRange.value))
          switch (revenuePeriod.value) {
            case 'yearly':
              revenueStartDate.setFullYear(revenueEndDate.getFullYear() - 4)
              revenueStartDate.setMonth(0, 1)
              break
            case 'monthly':
              revenueStartDate.setMonth(revenueEndDate.getMonth() - 11)
              revenueStartDate.setDate(1)
              break
            case 'weekly':
              revenueStartDate.setDate(revenueEndDate.getDate() - 77)
              const dayOfWeek = revenueStartDate.getDay()
              const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
              revenueStartDate.setDate(revenueStartDate.getDate() - daysToMonday)
              break
            default:
              revenueStartDate.setDate(revenueEndDate.getDate() - parseInt(selectedTimeRange.value))
          }
          
          const response = await statisticsAPI.getRevenueByPeriod(
            revenueStartDate.toISOString().split('T')[0],
            revenueEndDate.toISOString().split('T')[0],
            revenuePeriod.value
          )
          
          const revenueData = response.data || []
          
          const revenueSheetData = [
            [`DOANH THU THEO ${revenuePeriod.value.toUpperCase()}`],
            [''],
            ['Thời gian', 'Doanh thu', 'Số đơn hàng']
          ]
          
          revenueData.forEach(item => {
            revenueSheetData.push([
              formatDateForExport(item.date, revenuePeriod.value),
              formatCurrency(item.revenue),
              (item.orderCount || 0).toLocaleString()
            ])
          })
          
          const revenueSheet = XLSX.utils.aoa_to_sheet(revenueSheetData)
          XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh thu theo thời gian')
        } catch (error) {
          console.error('Error fetching revenue data for export:', error)
        }
        
        // Export file
        const fileName = `BaoCao_ThongKe_PhoStep_${dateStr}_${timeStr}.xlsx`
        XLSX.writeFile(workbook, fileName)
        
        // Show success message (you can add toast notification here)
        console.log('Báo cáo đã được xuất thành công:', fileName)
        
      } catch (error) {
        console.error('Lỗi khi xuất báo cáo:', error)
        // Show error message (you can add toast notification here)
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      selectedTimeRange,
      revenuePeriod,
      chartType,
      stats,
      topProducts,
      recentOrders,
      productColumns,
      orderColumns,
      revenueChart,
      categoryChart,
      breadcrumbItems,
      breadcrumbActions,
      pageStats,
      formatCurrency,
      formatDate,
      getCategoryClass,
      getStatusClass,
      updateData,
      changeRevenuePeriod,
      changeChartType,
      navigateToProducts,
      navigateToInvoices,
      exportReport
    }
  }
}
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.dashboard-container {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== STATS GRID ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-color);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.revenue-card {
  --accent-color: #007bff;
}

.orders-card {
  --accent-color: #28a745;
}

.customers-card {
  --accent-color: #ffc107;
}

.products-card {
  --accent-color: #dc3545;
}


.card-icon {
  font-size: 3rem;
  color: var(--accent-color);
  opacity: 0.8;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: #1a202c;
}

.card-label {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.card-trend.positive {
  color: #059669;
}

.card-trend.negative {
  color: #dc2626;
}

.card-trend.neutral {
  color: #6b7280;
}

/* ===== CHARTS SECTION ===== */
.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  min-width: 0;
  flex-shrink: 0;
}

.chart-actions {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
  align-items: center;
}

.chart-period-buttons {
  display: flex;
  gap: 8px;
}

.chart-type-buttons {
  display: flex;
  gap: 4px;
  border-left: 1px solid #e2e8f0;
  padding-left: 16px;
}

.chart-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.chart-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.chart-btn:hover:not(.active) {
  background: #f8fafc;
}

.chart-type-btn {
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.chart-type-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.chart-type-btn:hover:not(.active) {
  background: #f8fafc;
}

.chart-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.revenue-chart-container {
  height: 350px;
}

.category-chart-container {
  height: 400px;
}

/* ===== TABLES SECTION - IMPROVED RESPONSIVE ===== */
.tables-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.table-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  flex: 1;
  min-width: 0;
}

.view-all-btn {
  color: #007bff;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: color 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.view-all-btn:hover {
  color: #0056b3;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.table-container::-webkit-scrollbar {
  height: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  table-layout: fixed;
}

.data-table th {
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  padding: 12px 16px;
  border-bottom: 2px solid #f1f5f9;
  background: #f8fafc;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  padding: 16px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tr:hover {
  background: #f8fafc;
}

/* Column specific widths */
.data-table th:nth-child(1),
.data-table td:nth-child(1) {
  width: 280px;
  min-width: 280px;
}

.data-table th:nth-child(2),
.data-table td:nth-child(2) {
  width: 120px;
  min-width: 120px;
}

.data-table th:nth-child(3),
.data-table td:nth-child(3) {
  width: 100px;
  min-width: 100px;
  text-align: center;
}

.data-table th:nth-child(4),
.data-table td:nth-child(4) {
  width: 140px;
  min-width: 140px;
  text-align: right;
}

.data-table th:nth-child(5),
.data-table td:nth-child(5) {
  width: 120px;
  min-width: 120px;
  text-align: center;
}

.data-table th:nth-child(6),
.data-table td:nth-child(6) {
  width: 140px;
  min-width: 140px;
  text-align: center;
}

/* ===== PRODUCT INFO STYLES ===== */
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 260px;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 10px;
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
  min-width: 0;
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #1a202c;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.product-sku {
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

/* ===== CUSTOMER INFO STYLES ===== */
.customer-info {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 260px;
}

.customer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.customer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.customer-name {
  font-weight: 500;
  color: #1a202c;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* ===== CATEGORY BADGES ===== */
.category-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-sneaker {
  background: #dbeafe;
  color: #1e40af;
}

.category-running {
  background: #dcfce7;
  color: #166534;
}

.category-canvas {
  background: #fef3c7;
  color: #92400e;
}

.category-skateboard {
  background: #fecaca;
  color: #991b1b;
}

.category-lifestyle {
  background: #e9d5ff;
  color: #7c2d12;
}

.category-default {
  background: #f1f5f9;
  color: #64748b;
}

/* ===== STATUS BADGES ===== */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-delivered {
  background: #dcfce7;
  color: #166534;
}

.status-shipping {
  background: #dbeafe;
  color: #1e40af;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-cancelled {
  background: #fecaca;
  color: #991b1b;
}

.status-default {
  background: #f1f5f9;
  color: #64748b;
}

/* ===== TABLE DATA STYLES ===== */
.sold-count,
.revenue-amount,
.order-total {
  font-weight: 600;
  white-space: nowrap;
}

.sold-count {
  color: #1a202c;
}

.revenue-amount,
.order-total {
  color: #059669;
}

.growth-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.growth-indicator.positive {
  color: #059669;
}

.growth-indicator.negative {
  color: #dc2626;
}

.order-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: #1a202c;
  font-size: 0.85rem;
  white-space: nowrap;
}

.product-count {
  color: #64748b;
  font-size: 0.9rem;
  white-space: nowrap;
}

.order-date {
  color: #64748b;
  font-size: 0.85rem;
  white-space: nowrap;
}


/* ===== DARK THEME ===== */
.dark .dashboard-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f1f5f9;
}

.dark .stat-card,
.dark .chart-card,
.dark .table-card {
  background: #1e293b;
  border: 1px solid #334155;
}

.dark .card-value,
.dark .chart-title,
.dark .table-title,
.dark .product-name,
.dark .customer-name,
.dark .order-code,
.dark .sold-count {
  color: #f1f5f9;
}

.dark .card-label,
.dark .product-sku,
.dark .product-count,
.dark .order-date {
  color: #94a3b8;
}

.dark .data-table th {
  background: #334155;
  color: #94a3b8;
  border-bottom-color: #475569;
}

.dark .data-table td {
  border-bottom-color: #475569;
}

.dark .data-table tr:hover {
  background: #334155;
}

.dark .chart-btn {
  background: #334155;
  color: #cbd5e1;
  border-color: #475569;
}

.dark .chart-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.dark .chart-btn:hover:not(.active) {
  background: #475569;
}

.dark .table-container::-webkit-scrollbar-track {
  background: #334155;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* ===== RESPONSIVE DESIGN ===== */

/* Extra Large screens (1400px+) */
@media (min-width: 1400px) {
  .tables-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .charts-section {
    grid-template-columns: 2fr 1fr;
  }
}

/* Large screens (1200-1399px) */
@media (min-width: 1200px) and (max-width: 1399px) {
  .tables-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .charts-section {
    grid-template-columns: 2fr 1fr;
  }
  
  .data-table {
    min-width: 700px;
  }
  
  .data-table th:nth-child(1),
  .data-table td:nth-child(1) {
    width: 240px;
    min-width: 240px;
  }
  
  .product-info,
  .customer-info {
    max-width: 220px;
  }
}

/* Medium Large screens (992-1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .tables-section {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .category-chart-container {
    height: 350px;
  }
  
  .data-table {
    min-width: 750px;
  }
}

/* Medium screens (768-991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .table-card,
  .chart-card {
    padding: 24px;
  }
  
  .data-table {
    min-width: 700px;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 14px;
  }
  
  .data-table th:nth-child(1),
  .data-table td:nth-child(1) {
    width: 260px;
    min-width: 260px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .chart-actions {
    align-self: flex-end;
  }
}

/* Small Medium screens (640-767px) */
@media (min-width: 640px) and (max-width: 767px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .table-card,
  .chart-card {
    padding: 20px;
    margin: 0 -8px;
    border-radius: 16px;
  }
  
  .table-container {
    margin: 0 -20px;
    padding: 0 20px;
  }
  
  .data-table {
    min-width: 650px;
  }
  
  .data-table th,
  .data-table td {
    padding: 10px 12px;
  }
  
  .data-table th:nth-child(1),
  .data-table td:nth-child(1) {
    width: 240px;
    min-width: 240px;
  }
  
  .product-image {
    width: 40px;
    height: 40px;
  }
  
  .customer-avatar {
    width: 32px;
    height: 32px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  
  .revenue-chart-container,
  .category-chart-container {
    height: 300px;
  }
}

/* Small screens (480-639px) */
@media (min-width: 480px) and (max-width: 639px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .table-card,
  .chart-card {
    padding: 16px;
    margin: 0 -8px;
    border-radius: 12px;
  }
  
  .table-container {
    margin: 0 -16px;
    padding: 0 16px;
  }
  
  .data-table {
    min-width: 600px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 10px;
  }
  
  .data-table th {
    font-size: 0.8rem;
  }
  
  .data-table th:nth-child(1),
  .data-table td:nth-child(1) {
    width: 200px;
    min-width: 200px;
  }
  
  .data-table th:nth-child(2),
  .data-table td:nth-child(2) {
    width: 100px;
    min-width: 100px;
  }
  
  .data-table th:nth-child(3),
  .data-table td:nth-child(3) {
    width: 80px;
    min-width: 80px;
  }
  
  .data-table th:nth-child(4),
  .data-table td:nth-child(4) {
    width: 120px;
    min-width: 120px;
  }
  
  .data-table th:nth-child(5),
  .data-table td:nth-child(5) {
    width: 100px;
    min-width: 100px;
  }
  
  .product-info,
  .customer-info {
    max-width: 180px;
    gap: 8px;
  }
  
  .product-image {
    width: 36px;
    height: 36px;
  }
  
  .customer-avatar {
    width: 28px;
    height: 28px;
  }
  
  .product-name,
  .customer-name {
    font-size: 0.85rem;
    max-width: 120px;
  }
  
  .product-sku {
    font-size: 0.75rem;
    max-width: 120px;
  }
  
  .category-badge,
  .status-badge {
    padding: 4px 8px;
    font-size: 0.75rem;
    max-width: 80px;
  }
  
  .table-title,
  .chart-title {
    font-size: 1.1rem;
  }
  
  .view-all-btn {
    font-size: 0.85rem;
  }
  
  
  .stat-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .card-icon {
    font-size: 2.5rem;
  }
  
  .chart-actions {
    width: 100%;
    justify-content: center;
  }
  
  .chart-btn {
    flex: 1;
    text-align: center;
    min-width: 60px;
  }
}

/* Extra Small screens (320-479px) */
@media (max-width: 479px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .table-card,
  .chart-card {
    padding: 12px;
    margin: 0 -6px;
  }
  
  .table-container {
    margin: 0 -12px;
    padding: 0 12px;
  }
  
  .data-table {
    min-width: 550px;
  }
  
  .data-table th:nth-child(1),
  .data-table td:nth-child(1) {
    width: 180px;
    min-width: 180px;
  }
  
  .product-info,
  .customer-info {
    max-width: 160px;
  }
  
  .product-name,
  .customer-name {
    max-width: 100px;
  }
  
  .product-sku {
    max-width: 100px;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .view-all-btn {
    align-self: flex-end;
  }
  
  .quick-stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    font-size: 1.75rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .revenue-chart-container,
  .category-chart-container {
    height: 250px;
  }
}

/* Ultra Small screens (max-width: 360px) */
@media (max-width: 360px) {
  .dashboard-container {
    padding: 8px;
  }
  
  .stats-grid {
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .card-value {
    font-size: 1.25rem;
  }
  
  .chart-card,
  .table-card {
    padding: 10px;
  }
  
  .data-table {
    min-width: 500px;
  }
  
  .product-info,
  .customer-info {
    max-width: 140px;
    gap: 6px;
  }
  
  .product-image {
    width: 32px;
    height: 32px;
  }
  
  .customer-avatar {
    width: 24px;
    height: 24px;
  }
  
  .product-name,
  .customer-name {
    font-size: 0.8rem;
    max-width: 90px;
  }
  
  .revenue-chart-container,
  .category-chart-container {
    height: 200px;
  }
}
</style>
