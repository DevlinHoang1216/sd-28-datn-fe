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
    0: 'Hóa đơn chờ',
    1: 'Chờ xác nhận',
    2: 'Chờ xử lý',
    3: 'Chờ vận chuyển',
    4: 'Đang vận chuyển',
    5: 'Đã hoàn thành',
    6: 'Đã hủy',
  };
  return statusMap[statusId] || 'Không xác định';
};

// Get status color classes
export const getStatusColor = (statusId) => {
  const colorMap = {
    0: 'text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    1: 'text-orange-600 bg-orange-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    2: 'text-amber-600 bg-amber-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    3: 'text-cyan-600 bg-cyan-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    4: 'text-blue-600 bg-blue-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    5: 'text-green-700 bg-green-200 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
    6: 'text-red-700 bg-red-200 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
  };
  return colorMap[statusId] || 'text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase';
};
