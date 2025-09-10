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
            <button class="chart-btn active">Ngày</button>
            <button class="chart-btn">Tuần</button>
            <button class="chart-btn">Tháng</button>
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
          <button class="view-all-btn">Xem tất cả</button>
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
          <button class="view-all-btn">Xem tất cả</button>
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
          <template #status="{ item }">
            <span class="status-badge" :class="getStatusClass(item.status)">
              {{ item.status }}
            </span>
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
import Chart from 'chart.js/auto'
import Breadcrumb from '@/components/Breadcrumb.vue'
import DataTable from '@/components/DataTable.vue'

export default {
  name: 'ShoeDashboard',
  components: {
    Breadcrumb,
    DataTable
  },
  setup() {
    const selectedTimeRange = ref('30')
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
        value: '2.85 tỷ VNĐ',
        label: 'Doanh thu hôm nay',
        icon: 'solar:wallet-money-bold-duotone'
      },
      {
        value: '156',
        label: 'Đơn hàng mới',
        icon: 'solar:bag-check-bold-duotone'
      },
      {
        value: '1,234',
        label: 'Khách truy cập',
        icon: 'solar:users-group-two-rounded-bold-duotone'
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
      { key: 'status', label: 'Trạng Thái', class: 'status-col' },
      { key: 'createdAt', label: 'Ngày Tạo', class: 'date-col' }
    ])

    // Fake data
    const stats = ref({
      totalRevenue: 2850000000,
      totalOrders: 15420,
      totalCustomers: 8934,
      totalProducts: 256
    })

    const topProducts = ref([
      {
        id: 1,
        name: 'Nike Air Max 270',
        sku: 'NK-AM270-BW',
        category: 'Sneaker',
        sold: 1250,
        revenue: 185000000,
        growth: 15.2,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 2,
        name: 'Adidas Ultraboost 22',
        sku: 'AD-UB22-GR',
        category: 'Chạy bộ',
        sold: 980,
        revenue: 147000000,
        growth: 12.8,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 3,
        name: 'Converse Chuck Taylor',
        sku: 'CV-CT70-BK',
        category: 'Canvas',
        sold: 850,
        revenue: 95000000,
        growth: 8.5,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 4,
        name: 'Vans Old Skool',
        sku: 'VN-OS-WH',
        category: 'Skateboard',
        sold: 720,
        revenue: 86000000,
        growth: -2.3,
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=100&h=100&fit=crop&crop=center'
      },
      {
        id: 5,
        name: 'New Balance 990v5',
        sku: 'NB-990V5-GY',
        category: 'Lifestyle',
        sold: 645,
        revenue: 129000000,
        growth: 25.1,
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100&h=100&fit=crop&crop=center'
      }
    ])

    const recentOrders = ref([
      {
        id: 1,
        code: 'HD001234',
        customer: {
          name: 'Nguyễn Văn An',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        productCount: 2,
        total: 2850000,
        status: 'Đã giao',
        createdAt: new Date('2024-01-15T10:30:00')
      },
      {
        id: 2,
        code: 'HD001235',
        customer: {
          name: 'Trần Thị Bình',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c7c8?w=40&h=40&fit=crop&crop=face'
        },
        productCount: 1,
        total: 1590000,
        status: 'Đang giao',
        createdAt: new Date('2024-01-15T11:15:00')
      },
      {
        id: 3,
        code: 'HD001236',
        customer: {
          name: 'Lê Hoài Nam',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        },
        productCount: 3,
        total: 4200000,
        status: 'Chờ xử lý',
        createdAt: new Date('2024-01-15T12:00:00')
      },
      {
        id: 4,
        code: 'HD001237',
        customer: {
          name: 'Phạm Thu Hương',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
        },
        productCount: 1,
        total: 2100000,
        status: 'Đã hủy',
        createdAt: new Date('2024-01-15T14:20:00')
      },
      {
        id: 5,
        code: 'HD001238',
        customer: {
          name: 'Võ Minh Tuấn',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
        },
        productCount: 2,
        total: 3150000,
        status: 'Đã giao',
        createdAt: new Date('2024-01-15T15:45:00')
      }
    ])

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

    const initCharts = async () => {
      await nextTick()
      
      // Revenue Chart
      if (revenueChart.value) {
        const ctx = revenueChart.value.getContext('2d')
        
        if (revenueChartInstance) {
          revenueChartInstance.destroy()
        }
        
        revenueChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['1/1', '2/1', '3/1', '4/1', '5/1', '6/1', '7/1', '8/1', '9/1', '10/1', '11/1', '12/1', '13/1', '14/1', '15/1'],
            datasets: [{
              label: 'Doanh thu',
              data: [120, 150, 180, 220, 190, 240, 280, 260, 300, 320, 290, 350, 380, 360, 420],
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#007bff',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
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
        
        categoryChartInstance = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: ['Sneaker', 'Chạy bộ', 'Canvas', 'Skateboard', 'Lifestyle'],
            datasets: [{
              data: [35, 25, 20, 12, 8],
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
    }

    const exportReport = () => {
      console.log('Exporting report...')
    }

    onMounted(() => {
      initCharts()
    })

    return {
      selectedTimeRange,
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
      exportReport
    }
  }
}
</script>

<style scoped>
/* ===== GENERAL STYLES ===== */
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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
  gap: 8px;
  flex-shrink: 0;
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