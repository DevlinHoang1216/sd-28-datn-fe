import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import Toast from 'vue-toastification';
import router  from './router.js';
import CoreUI from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import * as icons from '@coreui/icons' // Đã sửa lỗi cú pháp ở đây
import { Icon } from '@iconify/vue'; // Import component Icon từ Iconify
import App from './App.vue';
import '@coreui/coreui/dist/css/coreui.min.css'; // CoreUI CSS
// CSS
import './assets/main.scss'; // Đảm bảo file tồn tại
import 'bootstrap/dist/css/bootstrap.min.css'; // Hoặc dùng CDN
import './assets/style.css';
import 'vue-toastification/dist/index.css';




const pinia = createPinia();
const app = createApp(App);
app.use(CoreUI)
// Đăng ký CoreUI Icons
app.provide('icons', icons); // Cung cấp icons toàn cục qua provide/inject
app.component('CIcon', CIcon); // Đăng ký component CIcon

// Kiểm tra trước khi mount
if (!document.getElementById('app')) {
  console.error('Không tìm thấy phần tử #app trong index.html');
}

app.use(pinia);
app.use(router);
app.use(autoAnimatePlugin);
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  toastDefaults: {
    success: { timeout: 3000, playSound: false },
    error: { timeout: 5000, playSound: false },
    warning: { timeout: 4000, playSound: false },
  },
});

// Đăng ký component IconifyIcon toàn cục
// Điều này cho phép bạn sử dụng <iconify-icon> ở bất cứ đâu trong ứng dụng
app.component('iconify-icon', Icon);
app.mount('#app');
