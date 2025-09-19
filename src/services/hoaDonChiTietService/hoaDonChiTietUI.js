/**
 * UI-related functions for HoaDonChiTiet
 */

import { orderStatuses } from './hoaDonChiTietConfig.js';

// Format date for short display
export const formatShortDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
};

// Get order statuses based on invoice type
export const getOrderStatuses = (invoiceDetail) => {
  if (!invoiceDetail) return [];
  
  if (invoiceDetail.loaiDon === 'Tại quầy') {
    return orderStatuses.direct;
  }
  
  // For Online orders, exclude "Đã hủy" status unless the current status is "Đã hủy"
  const onlineStatuses = orderStatuses.online;
  if (invoiceDetail.trangThai.id === 6) {
    // If current status is "Đã hủy", show all statuses including "Đã hủy"
    return onlineStatuses;
  } else {
    // Normal case: exclude "Đã hủy" status from timeline
    return onlineStatuses.filter(status => status.id !== 6);
  }
};

// Calculate progress width for timeline
export const getProgressWidth = (invoiceDetail) => {
  if (!invoiceDetail) return 0;
  const statuses = getOrderStatuses(invoiceDetail);
  const currentIndex = statuses.findIndex(s => s.id === invoiceDetail.trangThai.id);
  if (currentIndex === -1) return 0;
  return ((currentIndex + 1) / statuses.length) * 100;
};

// Get status step class for timeline
export const getStatusStepClass = (status, index, invoiceDetail) => {
  if (!invoiceDetail) return 'bg-gray-200 border-gray-300 text-gray-400';
  
  const currentIndex = getOrderStatuses(invoiceDetail).findIndex(s => s.id === invoiceDetail.trangThai.id);
  
  if (index <= currentIndex) {
    // Completed or current status
    if (status.id === 6) {
      // Cancelled status
      return 'bg-red-500 border-red-500 text-white';
    }
    return 'bg-blue-500 border-blue-500 text-white';
  } else {
    // Future status
    return 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-300';
  }
};

// Get status date from history
export const getStatusDate = (status, invoiceDetail) => {
  const history = invoiceDetail?.lichSuHoaDonInfos?.find(h => h.trangThai === status.id);
  return history ? history.thoiGian : null;
};

// Check if can update to specific status
export const canUpdateToStatus = (status, invoiceDetail) => {
  if (!invoiceDetail || invoiceDetail.loaiDon === 'Trực tiếp') return false;
  
  const currentIndex = getOrderStatuses(invoiceDetail).findIndex(s => s.id === invoiceDetail.trangThai.id);
  const statusIndex = getOrderStatuses(invoiceDetail).findIndex(s => s.id === status.id);
  
  // Can only update to the next status in sequence
  return statusIndex === currentIndex + 1 && invoiceDetail.trangThai.id !== 6 && invoiceDetail.trangThai.id !== 5;
};

// Get available statuses for modal
export const getAvailableStatuses = (invoiceDetail) => {
  if (!invoiceDetail) return [];
  
  if (invoiceDetail.loaiDon === 'Tại quầy') {
    return []; // No status changes for direct purchases
  }
  
  const currentStatusId = invoiceDetail.trangThai.id;
  const statuses = orderStatuses.online;
  
  // If already cancelled or completed, no further changes allowed
  if (currentStatusId === 6 || currentStatusId === 5) {
    return [];
  }
  
  // Return all previous statuses + current + "Đã hủy"
  const availableStatuses = [];
  
  // Add all previous statuses (can go back to any previous status)
  for (let i = 0; i < statuses.length; i++) {
    if (statuses[i].id < currentStatusId) {
      availableStatuses.push(statuses[i]);
    }
  }
  
  // Add forward statuses (can advance to next statuses)
  for (let i = 0; i < statuses.length; i++) {
    if (statuses[i].id > currentStatusId && statuses[i].id !== 6) {
      availableStatuses.push(statuses[i]);
    }
  }
  
  // Always add "Đã hủy" option (except if already cancelled or completed)
  const cancelStatus = statuses.find(s => s.id === 6);
  if (cancelStatus) {
    availableStatuses.push(cancelStatus);
  }
  
  // Sort by status ID for better UX
  return availableStatuses.sort((a, b) => a.id - b.id);
};

// Print invoice function - Download PDF from backend
export const printInvoice = async (invoiceDetail) => {
  if (!invoiceDetail) {
    console.error('No invoice detail provided for printing');
    return;
  }

  try {
    // Import API function dynamically
    const { downloadInvoicePDF } = await import('../api/APIHoaDon/HoaDonAPI.js');
    
    // Download PDF from backend using invoice ID
    const pdfBlob = await downloadInvoicePDF(invoiceDetail.id);
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HoaDon_${invoiceDetail.maHoaDon}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log(`PDF downloaded for invoice: ${invoiceDetail.maHoaDon} (ID: ${invoiceDetail.id})`);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    
    // Fallback to browser print if backend fails
    window.print();
  }
};
