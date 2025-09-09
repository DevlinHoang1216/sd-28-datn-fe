<template>
  <div class="data-table-container">
    <!-- Table View -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :class="column.class">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedData" :key="getItemKey(item, index)">
            <td v-for="column in columns" :key="column.key" :class="column.class">
              <slot 
                :name="column.key" 
                :item="item" 
                :index="index"
                :rowIndex="(currentPage - 1) * itemsPerPage + index + 1"
              >
                {{ getColumnValue(item, column.key) }}
              </slot>
            </td>
          </tr>
          <tr v-if="filteredData.length === 0">
            <td :colspan="columns.length" class="empty-message">
              {{ emptyMessage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="filteredData.length > 0" class="pagination-container">
      <div class="pagination-info-left">
        <span class="pagination-summary">
          Hiển thị {{ startItem }} - {{ endItem }} của {{ filteredData.length }} {{ itemLabel }}
        </span>
        <div class="page-size-selector">
          <label>Hiển thị:</label>
          <select v-model="itemsPerPage" @change="currentPage = 1" class="page-size-select">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <span>{{ itemLabel }}/trang</span>
        </div>
      </div>
      
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="pagination-btn" 
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          title="Trang đầu"
        >
          <iconify-icon icon="solar:double-alt-arrow-left-bold"></iconify-icon>
        </button>
        <button 
          class="pagination-btn" 
          @click="currentPage--"
          :disabled="currentPage === 1"
          title="Trang trước"
        >
          <iconify-icon icon="solar:alt-arrow-left-bold"></iconify-icon>
        </button>
        
        <!-- Page Numbers -->
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-number-btn"
            :class="{ active: page === currentPage, ellipsis: page === '...' }"
            @click="page !== '...' && (currentPage = page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-btn" 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          title="Trang sau"
        >
          <iconify-icon icon="solar:alt-arrow-right-bold"></iconify-icon>
        </button>
        <button 
          class="pagination-btn" 
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          title="Trang cuối"
        >
          <iconify-icon icon="solar:double-alt-arrow-right-bold"></iconify-icon>
        </button>
      </div>
      
      <div class="pagination-info-right">
        <span class="pagination-current">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        <div class="goto-page">
          <label>Đi tới:</label>
          <input 
            type="number" 
            v-model.number="gotoPage" 
            @keyup.enter="goToPage"
            :min="1" 
            :max="totalPages"
            class="goto-input"
            placeholder="Trang"
          />
          <button @click="goToPage" class="goto-btn" :disabled="!isValidGotoPage">
            <iconify-icon icon="solar:arrow-right-bold"></iconify-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'DataTable',
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    itemLabel: {
      type: String,
      default: 'mục'
    },
    emptyMessage: {
      type: String,
      default: 'Không tìm thấy dữ liệu nào.'
    },
    keyField: {
      type: String,
      default: 'id'
    }
  },
  emits: ['update:currentPage', 'update:itemsPerPage'],
  setup(props, { emit }) {
    // Pagination state
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const gotoPage = ref('');

    // Computed properties
    const filteredData = computed(() => props.data);

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredData.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredData.value.length / itemsPerPage.value);
    });

    const startItem = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1;
    });

    const endItem = computed(() => {
      const end = currentPage.value * itemsPerPage.value;
      return end > filteredData.value.length ? filteredData.value.length : end;
    });

    const visiblePages = computed(() => {
      const pages = [];
      const total = totalPages.value;
      const current = currentPage.value;
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    });

    const isValidGotoPage = computed(() => {
      return gotoPage.value >= 1 && gotoPage.value <= totalPages.value;
    });

    // Watch for data changes and reset to first page
    watch(() => props.data, () => {
      currentPage.value = 1;
    });

    // Watch for pagination changes and emit to parent
    watch(currentPage, (newValue) => {
      emit('update:currentPage', newValue);
    });

    watch(itemsPerPage, (newValue) => {
      emit('update:itemsPerPage', newValue);
    });

    // Methods
    const getItemKey = (item, index) => {
      return item[props.keyField] || index;
    };

    const getColumnValue = (item, key) => {
      return item[key] || '';
    };

    const goToPage = () => {
      if (isValidGotoPage.value) {
        currentPage.value = gotoPage.value;
        gotoPage.value = '';
      }
    };

    return {
      currentPage,
      itemsPerPage,
      gotoPage,
      filteredData,
      paginatedData,
      totalPages,
      startItem,
      endItem,
      visiblePages,
      isValidGotoPage,
      getItemKey,
      getColumnValue,
      goToPage
    };
  }
};
</script>

<style scoped>
/* ===== TABLE STYLES ===== */
.data-table-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

/* ===== PAGINATION STYLES ===== */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  gap: 20px;
  flex-wrap: wrap;
}

.pagination-info-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.pagination-summary {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.page-size-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 16px;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #007bff;
  color: #007bff;
  background: #f0f8ff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 8px;
}

.page-number-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0 8px;
}

.page-number-btn:hover:not(:disabled):not(.ellipsis) {
  border-color: #007bff;
  color: #007bff;
  background: #f0f8ff;
}

.page-number-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.page-number-btn.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
  color: #9ca3af;
}

.pagination-info-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
  min-width: 200px;
}

.pagination-current {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.goto-page {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.goto-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  background: white;
}

.goto-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.goto-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.goto-btn:hover:not(:disabled) {
  border-color: #007bff;
  color: #007bff;
  background: #f0f8ff;
}

.goto-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== EMPTY STATE ===== */
.empty-message {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 40px 20px;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  
  .pagination-info-left,
  .pagination-info-right {
    min-width: auto;
    width: 100%;
    align-items: center;
    text-align: center;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 8px;
    font-size: 0.85rem;
  }
}
</style>
