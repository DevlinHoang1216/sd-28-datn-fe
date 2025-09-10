/**
 * Service for filtering and sorting invoice data
 */

// Filter invoices based on various criteria
export const filterInvoices = (allInvoices, filters, activeTab, tabs) => {
  let result = allInvoices;

  const activeTabObj = tabs.find((tab) => tab.id === activeTab);
  if (activeTabObj?.statusId) {
    result = result.filter((invoice) => invoice.trangThai?.id === activeTabObj.statusId);
  } else if (filters.trangThaiId) {
    result = result.filter((invoice) => invoice.trangThai?.id === parseInt(filters.trangThaiId));
  }

  if (filters.search) {
    result = result.filter((invoice) =>
      invoice.maHoaDon?.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.khachHang?.tenKhachHang?.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.khachHang?.soDienThoai?.includes(filters.search)
    );
  }

  if (filters.loaiDon) {
    result = result.filter((invoice) => invoice.loaiDon === filters.loaiDon);
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate);
    result = result.filter((invoice) => new Date(invoice.ngayTao) >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    result = result.filter((invoice) => new Date(invoice.ngayTao) <= end);
  }

  if (filters.minPrice) {
    result = result.filter((invoice) => invoice.tongTienThanhToan >= parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    result = result.filter((invoice) => invoice.tongTienThanhToan <= parseFloat(filters.maxPrice));
  }

  if (filters.sortBy) {
    result = [...result];
    if (filters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
    } else if (filters.sortBy === 'most_expensive') {
      result.sort((a, b) => b.tongTienThanhToan - a.tongTienThanhToan);
    } else if (filters.sortBy === 'cheapest') {
      result.sort((a, b) => a.tongTienThanhToan - b.tongTienThanhToan);
    }
  }

  return result;
};

// Apply filters and show toast messages
export const applyFilters = (tempFilters, filters, toast, getStatusText, formatDate) => {
  filters.search = tempFilters.search;
  filters.trangThaiId = tempFilters.trangThaiId;
  filters.startDate = tempFilters.startDate;
  filters.endDate = tempFilters.endDate;
  filters.minPrice = tempFilters.minPrice;
  filters.maxPrice = tempFilters.maxPrice;
  filters.sortBy = tempFilters.sortBy;

  let message = 'Đã áp dụng bộ lọc: ';
  let filterApplied = false;

  if (filters.search) {
    message += `Mã hóa đơn, tên khách hàng hoặc SĐT: "${filters.search}". `;
    filterApplied = true;
  }
  if (filters.trangThaiId) {
    const statusText = getStatusText(parseInt(filters.trangThaiId));
    message += `Trạng thái: "${statusText}". `;
    filterApplied = true;
  }
  if (filters.startDate) {
    message += `Từ ngày: "${formatDate(filters.startDate)}". `;
    filterApplied = true;
  }
  if (filters.endDate) {
    message += `Đến ngày: "${formatDate(filters.endDate)}". `;
    filterApplied = true;
  }
  if (filters.sortBy) {
    const sortByText = {
      newest: 'Mới nhất',
      most_expensive: 'Đắt nhất',
      cheapest: 'Rẻ nhất',
    }[filters.sortBy];
    message += `Sắp xếp theo: "${sortByText}". `;
    filterApplied = true;
  }

  if (filterApplied) {
    toast.success(message, { timeout: 4000 });
  } else {
    toast.info('Không có bộ lọc nào được áp dụng.', { timeout: 2000 });
  }
};

// Reset all filters
export const resetFilters = (filters, tempFilters, toast) => {
  const defaultFilters = { 
    search: '', 
    trangThaiId: '', 
    loaiDon: '', 
    startDate: '', 
    endDate: '', 
    minPrice: '', 
    maxPrice: '', 
    sortBy: '' 
  };
  
  Object.assign(filters, defaultFilters);
  Object.assign(tempFilters, defaultFilters);
  
  toast.info('Đã đặt lại tất cả bộ lọc!', { timeout: 2000 });
};

// Get count for each tab
export const getTabCount = (tabId, allInvoices, tabs) => {
  if (!allInvoices.length) return 0;
  if (tabId === 'all') return allInvoices.length;
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab?.statusId) return 0;
  return allInvoices.filter((invoice) => invoice.trangThai?.id === tab.statusId).length;
};

// Switch active tab
export const switchTab = (tabId, tabs, filters, toast) => {
  const tab = tabs.find((t) => t.id === tabId);
  filters.trangThaiId = tab.statusId ? String(tab.statusId) : '';
  
  if (tabId === 'all') {
    toast.info('Đang hiển thị tất cả hóa đơn.', { timeout: 2000 });
  } else {
    toast.info(`Đang hiển thị hóa đơn trạng thái: ${tab.label}.`, { timeout: 2000 });
  }
};
