/**
 * Service for formatting data display in invoice management
 */

// Format date for display
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
  } catch (e) {
    console.error('Error formatting date:', date, e);
    return 'Invalid Date';
  }
};

// Format currency for display
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value || 0);
};

// Get status text by ID
export const getStatusText = (statusId) => {
  const statusMap = {
    6: 'Chờ xác nhận',
    7: 'Chờ xử lý',
    8: 'Chờ vận chuyển',
    9: 'Đang vận chuyển',
    21: 'Đã hoàn thành',
    22: 'Đã hủy',
  };
  return statusMap[statusId] || 'Không xác định';
};

// Get status color classes
export const getStatusColor = (statusId) => {
  const colorMap = {
    6: 'text-orange-600 bg-orange-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    7: 'text-amber-600 bg-amber-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    8: 'text-cyan-600 bg-cyan-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    9: 'text-green-600 bg-green-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    21: 'text-lime-700 bg-lime-200 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    22: 'text-red-700 bg-red-200 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
  };
  return colorMap[statusId] || 'text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase';
};
