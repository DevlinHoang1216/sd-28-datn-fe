<template>
  <footer class="bg-white text-gray-700 py-12 shadow-md">
    <div class="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
      <div class="flex flex-col items-center md:items-start">
        <div class="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.0"
            width="60"
            height="60"
            viewBox="0 0 2000.000000 2000.000000"
            preserveAspectRatio="xMidYMid meet"
            class="text-gray-800" >
            <g
              transform="translate(0.000000,2000.000000) scale(0.100000,-0.100000)"
              fill="currentColor"
              stroke="none"
            >
              <path
                d="M1932 15207 l-62 -63 0 -6405 0 -6405 63 -62 63 -62 6435 0 6435 0 62 63 62 63 0 6405 0 6405 -63 62 -63 62 -6435 0 -6435 0 -62 -63z m12558 -6467 l0 -6030 -6060 0 -6060 0 0 6030 0 6030 6060 0 6060 0 0 -6030z"
              />
              <path
                d="M8079 6543 l-797 -3 -7 -406 c-4 -223 -5 -407 -2 -410 2 -3 440 2 972 11 532 9 970 14 972 11 2 -2 -437 -430 -976 -950 l-981 -947 0 -359 0 -360 1599 0 1599 0 6 198 c3 108 9 281 12 385 6 178 5 187 -12 187 -139 0 -1999 41 -2001 44 -3 2 443 435 989 963 l993 959 3 342 2 342 -787 -2 c-434 -2 -1146 -4 -1584 -5z"
              />
              <path
                d="M4308 6515 c-5 -11 -345 -767 -757 -1680 -412 -913 -748 -1661 -747 -1662 7 -8 791 -52 797 -46 4 5 75 158 159 341 l153 332 887 0 887 0 153 -332 c84 -183 155 -336 159 -341 6 -6 790 38 797 46 1 1 -339 758 -756 1682 l-758 1680 -482 0 c-474 0 -483 0 -492 -20z m764 -1378 c147 -320 270 -590 274 -599 6 -17 -24 -18 -546 -18 -522 0 -552 1 -546 18 16 44 542 1182 546 1182 3 0 125 -262 272 -583z"
              />
            </g>
          </svg>
        </div>
        <p class="text-gray-600 text-center md:text-left text-sm mt-4">Nền tảng quản lý bán hàng hiệu quả được phát triển bởi PhoStep Team. Tối ưu hóa quy trình kinh doanh của bạn một cách dễ dàng.</p>
      </div>

      <div class="md:col-span-2 lg:col-span-1">
        <h3 class="text-gray-800 text-xl font-semibold mb-4 text-center md:text-left">Liên kết nhanh</h3>
        <ul class="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
          <li><a href="#" class="hover:text-primary-600 transition-colors duration-300">Trang chủ</a></li>
          <li><a href="#" class="hover:text-primary-600 transition-colors duration-300">Về chúng tôi</a></li>
          <li><a href="#" class="hover:text-primary-600 transition-colors duration-300">Dịch vụ</a></li>
          <li><a href="#" class="hover:text-primary-600 transition-colors duration-300">Liên hệ</a></li>
        </ul>
      </div>

      <div class="lg:col-span-1">
        <h3 class="text-gray-800 text-xl font-semibold mb-4 text-center md:text-left">Thông tin liên hệ</h3>
        <div class="flex flex-col items-center md:items-start space-y-2 text-center md:text-left">
          <p class="flex items-center">
            <iconify-icon icon="solar:map-linear" class="mr-2 text-xl text-primary-500"></iconify-icon>
            <span class="text-sm">268 Lý Thường Kiệt, Q.10, TP.HCM</span>
          </p>
          <p class="flex items-center">
            <iconify-icon icon="solar:phone-linear" class="mr-2 text-xl text-primary-500"></iconify-icon>
            <span class="text-sm">+84 123 456 789</span>
          </p>
          <p class="flex items-center">
            <iconify-icon icon="solar:letter-linear" class="mr-2 text-xl text-primary-500"></iconify-icon>
            <span class="text-sm">contact@phostep.com</span>
          </p>
        </div>
      </div>

      <div class="lg:col-span-1">
        <h3 class="text-gray-800 text-xl font-semibold mb-4 text-center md:text-left">Theo dõi chúng tôi</h3>
        <div class="flex justify-center md:justify-start space-x-4">
          <a href="#" class="text-gray-500 hover:text-primary-600 transition-colors duration-300">
            <iconify-icon icon="ri:facebook-fill" class="text-3xl"></iconify-icon>
          </a>
          <a href="#" class="text-gray-500 hover:text-primary-600 transition-colors duration-300">
            <iconify-icon icon="ri:instagram-line" class="text-3xl"></iconify-icon>
          </a>
          <a href="#" class="text-gray-500 hover:text-primary-600 transition-colors duration-300">
            <iconify-icon icon="ri:twitter-x-line" class="text-3xl"></iconify-icon>
          </a>
          <a href="#" class="text-gray-500 hover:text-primary-600 transition-colors duration-300">
            <iconify-icon icon="ri:linkedin-fill" class="text-3xl"></iconify-icon>
          </a>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500 text-sm">
      <p>&copy; 2024 PhoStep Team. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script setup>
// Không cần script setup nào ở đây
</script>

<style scoped>
/* Không cần style scoped riêng nếu bạn chỉ dùng Tailwind CSS */
</style>