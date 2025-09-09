<template>
  <div class="example-container">
    <!-- Example 1: Fullscreen Loading -->
    <div class="example-section">
      <h3>1. Fullscreen Loading (Toàn màn hình)</h3>
      <button @click="showFullscreenLoading" class="demo-btn">
        Hiển thị Loading toàn màn hình
      </button>
      <Loading 
        :show="isFullscreenLoading" 
        text="Đang tải dữ liệu..." 
        subtext="Vui lòng đợi trong giây lát"
        :fullscreen="true"
      />
    </div>

    <!-- Example 2: Inline Loading -->
    <div class="example-section">
      <h3>2. Inline Loading (Trong container)</h3>
      <button @click="showInlineLoading" class="demo-btn">
        Hiển thị Loading inline
      </button>
      <div class="content-container" style="position: relative; height: 200px; background: #f8f9fa; border-radius: 8px;">
        <p v-if="!isInlineLoading" style="padding: 20px;">Nội dung sẽ được tải ở đây...</p>
        <Loading 
          :show="isInlineLoading" 
          text="Đang tải..." 
          :fullscreen="false"
          size="small"
        />
      </div>
    </div>

    <!-- Example 3: Different Sizes -->
    <div class="example-section">
      <h3>3. Các kích thước khác nhau</h3>
      <div class="size-examples">
        <div class="size-demo">
          <h4>Small</h4>
          <Loading :show="true" size="small" text="Small" :fullscreen="false" />
        </div>
        <div class="size-demo">
          <h4>Medium</h4>
          <Loading :show="true" size="medium" text="Medium" :fullscreen="false" />
        </div>
        <div class="size-demo">
          <h4>Large</h4>
          <Loading :show="true" size="large" text="Large" :fullscreen="false" />
        </div>
      </div>
    </div>

    <!-- Example 4: API Call Integration -->
    <div class="example-section">
      <h3>4. Tích hợp với API Call</h3>
      <button @click="simulateApiCall" class="demo-btn" :disabled="isApiLoading">
        {{ isApiLoading ? 'Đang tải...' : 'Gọi API Demo' }}
      </button>
      <div v-if="apiData" class="api-result">
        <p>Dữ liệu đã tải: {{ apiData }}</p>
      </div>
      <Loading 
        :show="isApiLoading" 
        text="Đang tải dữ liệu từ server..." 
        subtext="Đang xử lý yêu cầu của bạn"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Loading from './Loading.vue'

const isFullscreenLoading = ref(false)
const isInlineLoading = ref(false)
const isApiLoading = ref(false)
const apiData = ref(null)

const showFullscreenLoading = () => {
  isFullscreenLoading.value = true
  setTimeout(() => {
    isFullscreenLoading.value = false
  }, 3000)
}

const showInlineLoading = () => {
  isInlineLoading.value = true
  setTimeout(() => {
    isInlineLoading.value = false
  }, 2000)
}

const simulateApiCall = async () => {
  isApiLoading.value = true
  apiData.value = null
  
  // Simulate API call
  setTimeout(() => {
    apiData.value = 'Dữ liệu mẫu từ API'
    isApiLoading.value = false
  }, 2500)
}
</script>

<style lang="scss" scoped>
.example-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;

  h3 {
    margin-top: 0;
    color: #1e293b;
    font-size: 18px;
    font-weight: 600;
  }
}

.demo-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.content-container {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-examples {
  display: flex;
  gap: 30px;
  margin-top: 15px;

  .size-demo {
    text-align: center;
    padding: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8f9fa;
    position: relative;
    min-height: 120px;
    flex: 1;

    h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #64748b;
    }
  }
}

.api-result {
  margin-top: 15px;
  padding: 15px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
}

// Dark theme
.dark .example-section {
  background: #1e293b;
  border-color: #334155;

  h3 {
    color: #f1f5f9;
  }
}

.dark .size-demo {
  background: #334155;
  border-color: #475569;

  h4 {
    color: #cbd5e1;
  }
}

.dark .api-result {
  background: #064e3b;
  border-color: #065f46;
  color: #a7f3d0;
}
</style>
