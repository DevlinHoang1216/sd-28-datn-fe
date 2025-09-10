import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';
import mitt from 'mitt';

import {
  fetchAllInvoices,
  updateInvoice,
  deleteInvoice,
  filterInvoices,
  applyFilters,
  resetFilters as resetFiltersService,
  getTabCount,
  switchTab as switchTabService,
  formatDate,
  formatCurrency,
  getStatusText,
  getStatusColor,
  printInvoicePDF,
  downloadQRCode,
  exportToExcel,
  scanQRInvoice,
  calculateTotalRevenue,
  calculatePagination,
  calculateDisplayedPages,
  changePage as changePageService,
  prepareEditInvoice,
  validateInvoiceData,
  handleInvoiceHighlight,
  navigateToSalesCounter as navigateToSalesCounterService,
  getTabsConfig,
  getTableColumns,
  getBreadcrumbItems,
  getBreadcrumbActions,
  getDefaultFilters,
  getPageStats
} from './hoaDonGetAll.js';

/**
 * Composable function that encapsulates all HoaDon logic
 */
export function useHoaDonLogic() {
  const emitter = mitt();
  const toast = useToast();
  const route = useRoute();
  const router = useRouter();

  // Reactive state
  const errorMessage = ref('');
  const allInvoices = ref([]);
  const totalRevenue = ref(0);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const filters = ref(getDefaultFilters());
  const tempFilters = ref(getDefaultFilters());
  const activeTab = ref('all');
  const showEditModal = ref(false);
  const showDeleteModal = ref(false);
  const editInvoiceData = ref({});
  const deleteInvoiceId = ref(null);
  const isUpdating = ref(false);
  const isDeleting = ref(false);
  const highlightedInvoice = ref(null);

  // Configuration
  const tabs = ref(getTabsConfig());
  const tableColumns = ref(getTableColumns());
  const breadcrumbItems = ref(getBreadcrumbItems());

  // Update total revenue using service function
  const updateTotalRevenue = () => {
    totalRevenue.value = calculateTotalRevenue(allInvoices.value);
  };

  // Navigation
  const navigateToSalesCounter = () => {
    navigateToSalesCounterService(router);
  };

  // Computed properties
  const filteredInvoices = computed(() => {
    return filterInvoices(allInvoices.value, filters.value, activeTab.value, tabs.value);
  });

  const breadcrumbActions = computed(() => 
    getBreadcrumbActions(loadInvoices, exportToExcel, scanQRInvoice, navigateToSalesCounter, filteredInvoices)
  );

  const pageStats = computed(() => 
    getPageStats(allInvoices.value, totalRevenue.value, formatCurrency)
  );

  const paginatedInvoices = computed(() => {
    const { paginatedInvoices } = calculatePagination(filteredInvoices.value, currentPage.value, pageSize.value);
    return paginatedInvoices;
  });

  const totalPages = computed(() => {
    const { totalPages } = calculatePagination(filteredInvoices.value, currentPage.value, pageSize.value);
    return totalPages;
  });

  const displayedPages = computed(() => {
    return calculateDisplayedPages(currentPage.value, totalPages.value);
  });

  // Load invoices
  const loadInvoices = async () => {
    errorMessage.value = '';
    
    try {
      const { invoices, error } = await fetchAllInvoices(route, toast);
      
      if (error) {
        errorMessage.value = error;
        return;
      }
      
      allInvoices.value = invoices;
      updateTotalRevenue();

      if (route.query.maHoaDon) {
        highlightedInvoice.value = route.query.maHoaDon;
        handleInvoiceHighlight(highlightedInvoice.value);
      }
    } finally {
      if (currentPage.value >= totalPages.value) {
        currentPage.value = Math.max(0, totalPages.value - 1);
      }
    }
  };

  // Edit invoice
  const editInvoice = (invoice) => {
    editInvoiceData.value = prepareEditInvoice(invoice);
    showEditModal.value = true;
  };

  const handleUpdateInvoice = async () => {
    if (!validateInvoiceData(editInvoiceData.value, toast)) {
      return;
    }
    
    isUpdating.value = true;
    try {
      const { success } = await updateInvoice(editInvoiceData.value, toast, emitter);
      if (success) {
        showEditModal.value = false;
        await loadInvoices();
      }
    } finally {
      isUpdating.value = false;
    }
  };

  // Delete invoice
  const confirmDelete = (id) => {
    deleteInvoiceId.value = id;
    showDeleteModal.value = true;
  };

  const handleDeleteInvoice = async () => {
    isDeleting.value = true;
    try {
      const { success } = await deleteInvoice(deleteInvoiceId.value, toast);
      if (success) {
        showDeleteModal.value = false;
        deleteInvoiceId.value = null;
        await loadInvoices();
      }
    } finally {
      isDeleting.value = false;
    }
  };

  // Tab and filter functions
  const getTabCountLocal = (tabId) => {
    return getTabCount(tabId, allInvoices.value, tabs.value);
  };

  const switchTabLocal = (tabId) => {
    activeTab.value = tabId;
    switchTabService(tabId, tabs.value, filters.value, toast);
    currentPage.value = 0;
  };

  const filterInvoicesLocal = () => {
    applyFilters(tempFilters.value, filters.value, toast, getStatusText, formatDate);
    currentPage.value = 0;
  };

  const resetFiltersLocal = () => {
    resetFiltersService(filters.value, tempFilters.value, toast);
    activeTab.value = 'all';
    currentPage.value = 0;
  };

  const changePageLocal = (page) => {
    const newPage = changePageService(page, totalPages.value, toast);
    if (newPage !== null) {
      currentPage.value = newPage;
    }
  };

  // Event listeners and lifecycle
  emitter.on('invoice-completed', (invoice) => {
    console.log('Nhận được sự kiện invoice-completed:', invoice);
    updateTotalRevenue();
    toast.info('Tổng doanh thu đã được cập nhật!', { timeout: 3000 });
  });

  onMounted(() => {
    loadInvoices();
  });

  watch(allInvoices, () => {
    updateTotalRevenue();
  });

  // Return all reactive state and functions
  return {
    // State
    errorMessage,
    allInvoices,
    totalRevenue,
    currentPage,
    pageSize,
    filters,
    tempFilters,
    activeTab,
    showEditModal,
    showDeleteModal,
    editInvoiceData,
    deleteInvoiceId,
    isUpdating,
    isDeleting,
    highlightedInvoice,
    
    // Configuration
    tabs,
    tableColumns,
    breadcrumbItems,
    breadcrumbActions,
    
    // Computed
    filteredInvoices,
    pageStats,
    paginatedInvoices,
    totalPages,
    displayedPages,
    
    // Functions
    loadInvoices,
    editInvoice,
    handleUpdateInvoice,
    confirmDelete,
    handleDeleteInvoice,
    getTabCountLocal,
    switchTabLocal,
    filterInvoicesLocal,
    resetFiltersLocal,
    changePageLocal,
    navigateToSalesCounter,
    
    // Service functions (re-exported for template use)
    formatDate,
    formatCurrency,
    getStatusText,
    getStatusColor,
    printInvoicePDF,
    downloadQRCode,
    exportToExcel,
    scanQRInvoice
  };
}
