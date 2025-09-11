/**
 * Composable for HoaDonChiTiet functionality
 */

import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useHoaDonLogic } from '@/services/hoaDonService/hoaDonComposable.js';
import { 
  fetchInvoiceDetail, 
  updateOrderStatusAPI, 
  updateToStatusAPI 
} from './hoaDonChiTietCRUD.js';
import { 
  formatShortDate,
  getOrderStatuses,
  getProgressWidth,
  getStatusStepClass,
  getStatusDate,
  canUpdateToStatus,
  getAvailableStatuses,
  printInvoice
} from './hoaDonChiTietUI.js';
import { breadcrumbItems } from './hoaDonChiTietConfig.js';

export function useHoaDonChiTietLogic() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  // Use the existing HoaDon composable for detail functionality
  const {
    invoiceDetail,
    isLoadingDetail,
    detailError,
    loadInvoiceDetail,
    clearInvoiceDetail,
    formatDate,
    formatCurrency,
    getStatusText,
    getStatusColor
  } = useHoaDonLogic();

  // Local state
  const invoiceId = ref(route.params.id);
  const showStatusModal = ref(false);
  const newStatus = ref('');
  const statusNote = ref('');

  // Computed properties
  const availableStatuses = computed(() => getAvailableStatuses(invoiceDetail.value));

  // Methods
  const fetchInvoiceDetailData = async () => {
    try {
      await fetchInvoiceDetail(invoiceId.value, loadInvoiceDetail);
    } catch (error) {
      console.error('Error loading invoice detail:', error);
    }
  };

  const updateOrderStatus = async () => {
    if (!newStatus.value) {
      toast.error('Vui lòng chọn trạng thái mới!');
      return;
    }
    
    try {
      const result = await updateOrderStatusAPI(invoiceId.value, newStatus.value, statusNote.value);
      
      if (result.success) {
        // Update local state with new status
        if (invoiceDetail.value) {
          invoiceDetail.value.trangThai = {
            id: result.status.id,
            ten: result.status.name
          };
        }
        
        // Refresh invoice detail to get updated data
        await fetchInvoiceDetailData();
        
        showStatusModal.value = false;
        newStatus.value = '';
        statusNote.value = '';
        
        toast.success('Cập nhật trạng thái đơn hàng thành công!');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái!');
      console.error(error);
    }
  };

  const updateToStatus = async (status) => {
    try {
      const result = await updateToStatusAPI(invoiceId.value, status);
      
      if (result.success) {
        // Update local state with new status
        if (invoiceDetail.value) {
          invoiceDetail.value.trangThai = {
            id: result.status.id,
            ten: result.status.name
          };
        }
        
        // Refresh invoice detail to get updated data
        await fetchInvoiceDetailData();
        
        toast.success(result.message);
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái!');
      console.error(error);
    }
  };

  const goBack = () => {
    router.push({ name: 'HoaDon' });
  };

  // Breadcrumb actions
  const breadcrumbActions = ref([
    {
      label: 'Quay lại',
      type: 'default',
      handler: goBack
    },
    {
      label: 'In hóa đơn',
      type: 'primary',
      handler: printInvoice
    }
  ]);

  // UI helper functions
  const getOrderStatusesForInvoice = () => getOrderStatuses(invoiceDetail.value);
  const getProgressWidthForInvoice = () => getProgressWidth(invoiceDetail.value);
  const getStatusStepClassForInvoice = (status, index) => getStatusStepClass(status, index, invoiceDetail.value);
  const getStatusDateForInvoice = (status) => getStatusDate(status, invoiceDetail.value);
  const canUpdateToStatusForInvoice = (status) => canUpdateToStatus(status, invoiceDetail.value);

  return {
    // State
    invoiceDetail,
    isLoadingDetail,
    detailError,
    invoiceId,
    showStatusModal,
    newStatus,
    statusNote,
    
    // Computed
    availableStatuses,
    
    // Methods
    fetchInvoiceDetailData,
    updateOrderStatus,
    updateToStatus,
    goBack,
    
    // UI helpers
    formatDate,
    formatCurrency,
    formatShortDate,
    getStatusText,
    getStatusColor,
    getOrderStatusesForInvoice,
    getProgressWidthForInvoice,
    getStatusStepClassForInvoice,
    getStatusDateForInvoice,
    canUpdateToStatusForInvoice,
    printInvoice,
    
    // Configuration
    breadcrumbItems,
    breadcrumbActions
  };
}
