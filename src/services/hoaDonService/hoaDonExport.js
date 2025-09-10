import { formatDate, formatCurrency, getStatusText } from './hoaDonFormatters.js';

/**
 * Service for exporting invoice data and generating reports
 */

// Print invoice as PDF
export const printInvoicePDF = (invoice) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  const orderTypeText = invoice.loaiDon === 'online' ? 'Online' : 'Trực tiếp';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hóa đơn ${invoice.maHoaDon}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        .label { font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #e74c3c; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <p>Mã hóa đơn: <span class="label">${invoice.maHoaDon}</span></p>
        <p>Ngày tạo: <span class="label">${formatDate(invoice.ngayTao)}</span></p>
      </div>
      
      <div class="info">
        <h3>Thông tin khách hàng</h3>
        <p>Tên: <span class="label">${invoice.khachHang?.tenKhachHang || 'Khách lẻ'}</span></p>
        <p>Số điện thoại: <span class="label">${invoice.khachHang?.soDienThoai || 'N/A'}</span></p>
        <p>Loại đơn: <span class="label">${orderTypeText}</span></p>
      </div>
      
      <div class="info">
        <h3>Thông tin thanh toán</h3>
        <p>Phí vận chuyển: <span class="label">${formatCurrency(invoice.phiVanChuyen)}</span></p>
        <p class="total">Tổng tiền: ${formatCurrency(invoice.tongTienThanhToan)}</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
};

// Download QR code for invoice
export const downloadQRCode = (invoice) => {
  // Create QR code data
  const qrData = {
    maHoaDon: invoice.maHoaDon,
    khachHang: invoice.khachHang?.tenKhachHang || 'Khách lẻ',
    tongTien: invoice.tongTienThanhToan,
    ngayTao: invoice.ngayTao
  };
  
  // Create QR code content
  const qrContent = `Hóa đơn: ${qrData.maHoaDon}\nKhách hàng: ${qrData.khachHang}\nTổng tiền: ${formatCurrency(qrData.tongTien)}\nNgày: ${formatDate(qrData.ngayTao)}`;
  
  // Create a simple QR code URL (using a free QR code API)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;
  
  // Create download link
  const link = document.createElement('a');
  link.href = qrUrl;
  link.download = `QR_${invoice.maHoaDon}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export invoices to Excel/CSV
export const exportToExcel = (filteredInvoices) => {
  // Create Excel data from filtered invoices
  const excelData = filteredInvoices.map((invoice, index) => ({
    'STT': index + 1,
    'Mã Hóa Đơn': invoice.maHoaDon,
    'Khách Hàng': invoice.khachHang?.tenKhachHang || 'Khách lẻ',
    'Số Điện Thoại': invoice.khachHang?.soDienThoai || 'N/A',
    'Loại Đơn': invoice.loaiDon === 'online' ? 'Online' : 'Trực tiếp',
    'Phí Vận Chuyển': invoice.phiVanChuyen,
    'Ngày Tạo': formatDate(invoice.ngayTao),
    'Tổng Tiền': invoice.tongTienThanhToan,
    'Trạng Thái': getStatusText(invoice.trangThai?.id)
  }));
  
  // Convert to CSV format
  const headers = Object.keys(excelData[0]).join(',');
  const csvContent = [headers, ...excelData.map(row => Object.values(row).join(','))].join('\n');
  
  // Create and download file
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Danh_sach_hoa_don_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('Exported invoices to Excel');
};

// Scan QR invoice (placeholder)
export const scanQRInvoice = () => {
  // Open QR scanner modal or navigate to QR scanner page
  alert('Chức năng quét QR hóa đơn sẽ được phát triển trong phiên bản tiếp theo');
  console.log('QR Scanner opened');
};
