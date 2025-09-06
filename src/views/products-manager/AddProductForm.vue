<template>
  <div class="container py-4">
    <h2 class="mb-4 fw-bold text-center" :style="{ color: '#000000' }">Thêm Sản Phẩm</h2>

    <div v-if="isDataLoaded" class="mb-4">
      <CForm @submit.prevent="submitProduct">
        <CRow class="mb-4 justify-content-center">
          <CCol md="6" class="text-center">
            <div class="mb-4">
              <CFormLabel for="tenSanPham" class="fw-bold"
                >Tên Sản Phẩm <span class="text-danger">*</span></CFormLabel
              >
              <CFormInput
                id="tenSanPham"
                v-model="product.tenSanPham"
                placeholder="Nhập tên sản phẩm"
                required
                class="custom-input text-center"
                :class="{ 'is-invalid': !isTenSanPhamValid }"
                @blur="validateTenSanPham"
              />
            </div>
          </CCol>
        </CRow>
        <CRow class="mb-4 justify-content-center">
          <CCol md="6" class="text-center">
            <div class="mb-4">
              <CFormLabel for="moTaSanPham" class="fw-bold">Mô Tả Sản Phẩm</CFormLabel>
              <CFormTextarea
                id="moTaSanPham"
                v-model="product.moTaSanPham"
                rows="5"
                placeholder="Mô tả chi tiết về sản phẩm"
                class="custom-input text-center"
              />
            </div>
          </CCol>
        </CRow>

        <CRow class="mb-4">
          <CCol md="6">
            <div class="mb-4">
              <CFormLabel for="thuongHieu" class="fw-bold"
                >Thương Hiệu <span class="text-danger">*</span></CFormLabel
              >
              <CFormSelect
                id="thuongHieu"
                v-model="product.thuongHieu"
                required
                class="custom-input"
                :class="{ 'is-invalid': !isThuongHieuValid }"
                @change="validateThuongHieu"
              >
                <option value="">Vui lòng chọn thương hiệu</option>
                <option
                  v-for="brand in thuongHieuList"
                  :key="brand.id"
                  :value="brand.id"
                >
                  {{ brand.tenThuongHieu }}
                </option>
              </CFormSelect>
              <div v-if="!isThuongHieuValid" class="invalid-feedback">
                Vui lòng chọn một thương hiệu hợp lệ.
              </div>
            </div>
          </CCol>
          <CCol md="6">
            <div class="mb-4">
              <CFormLabel for="danhMuc" class="fw-bold"
                >Thể Loại (Danh mục của giày) <span class="text-danger">*</span></CFormLabel
              >
              <CFormSelect
                id="danhMuc"
                v-model="product.danhMuc"
                required
                class="custom-input"
                :class="{ 'is-invalid': !isDanhMucValid }"
                @change="validateDanhMuc"
              >
                <option value="">Vui lòng chọn thể loại</option>
                <option
                  v-for="category in danhMucList"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.tenDanhMuc }}
                </option>
              </CFormSelect>
              <div v-if="!isDanhMucValid" class="invalid-feedback">
                Vui lòng chọn một thể loại hợp lệ.
              </div>
            </div>
          </CCol>
        </CRow>

        <CRow class="mb-4">
          <CCol md="6">
            <div class="mb-4">
              <CFormLabel for="chatLieu" class="fw-bold"
                >Chất Liệu <span class="text-danger">*</span></CFormLabel
              >
              <CFormSelect
                id="chatLieu"
                v-model="product.chatLieu"
                required
                class="custom-input"
                :class="{ 'is-invalid': !isChatLieuValid }"
                @change="validateChatLieu"
              >
                <option value="">Vui lòng chọn chất liệu</option>
                <option
                  v-for="material in chatLieuList"
                  :key="material.id"
                  :value="material.id"
                >
                  {{ material.tenChatLieu }}
                </option>
              </CFormSelect>
              <div v-if="!isChatLieuValid" class="invalid-feedback">
                Vui lòng chọn một chất liệu hợp lệ.
              </div>
            </div>
          </CCol>
          <CCol md="6">
            <div class="mb-4">
              <CFormLabel for="trangThai" class="fw-bold"
                >Trạng Thái <span class="text-danger">*</span></CFormLabel
              >
              <CFormSelect id="trangThai" v-model="product.idTrangThai" required class="custom-input">
                <option value="">Vui lòng chọn trạng thái</option>
                <option v-for="status in filteredStatusesList" :key="status.id" :value="status.id">
                  {{ status.tenTrangThai }}
                </option>
              </CFormSelect>
            </div>
          </CCol>
        </CRow>

        <hr class="my-4" />

        <h3 class="mb-4 fw-bold">Chọn Màu Sắc và Kích Cỡ</h3>
        <CRow class="mb-4 align-items-end">
          <CCol md="6">
            <div class="mb-4">
              <CFormLabel class="fw-bold">Màu Sắc</CFormLabel>
              <div class="d-flex align-items-center">
                <div
                  class="color-display-area border p-3 rounded me-3 d-flex flex-wrap"
                  style="min-height: 50px; min-width: 250px"
                >
                  <div
                    v-for="color in selectedColors"
                    :key="color.id"
                    :style="{
                      backgroundColor: color.hex,
                      width: '30px',
                      height: '30px',
                      borderRadius: '5px',
                      margin: '5px',
                      border: '1px solid #ccc',
                    }"
                    :title="color.name || color.hex"
                  ></div>
                </div>
                <CButton
                  :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                  @click="showColorModal = true"
                >
                  <CIcon icon="cil-plus" class="me-1" /> Chọn Màu Sắc
                </CButton>
              </div>
              <div v-if="!isSelectedColorsValid" class="text-warning mt-1">
                Vui lòng chọn ít nhất một màu sắc.
              </div>
            </div>
          </CCol>
          <CCol md="6">
            <div class="mb-4">
              <CFormLabel class="fw-bold">Kích Cỡ</CFormLabel>
              <div class="d-flex align-items-center">
                <div
                  class="size-display-area border p-3 rounded me-3 d-flex flex-wrap"
                  style="min-height: 50px; min-width: 250px; background-color: #f8f9fa"
                >
                  <CBadge
                    v-for="size in selectedSizes"
                    :key="size.id"
                    class="me-2 mb-2 p-2"
                    :style="{ backgroundColor: '#000000', color: '#FFFFFF' }"
                    >{{ size.value }}</CBadge
                  >
                </div>
                <CButton
                  :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                  @click="showSizeModal = true"
                >
                  <CIcon icon="cil-plus" class="me-1" /> Chọn Kích Cỡ
                </CButton>
              </div>
            </div>
          </CCol>
        </CRow>

        <hr class="my-4" />

        <h3 class="mb-4 fw-bold">Biến Thể Sản Phẩm</h3>
        <div
          v-if="productVariations.length === 0"
          class="alert alert-info p-3"
          style="border-left: 4px solid #000000; background-color: #f8f9fa"
        >
          Vui lòng chọn Màu Sắc và Kích Cỡ để tạo biến thể sản phẩm.
        </div>
        <div v-else class="table-responsive">
          <!-- Input chung cho Giá và Số lượng -->
          <CRow class="mb-3 align-items-end">
            <CCol md="4">
              <CFormLabel class="fw-bold">Giá bán chung:</CFormLabel>
              <CInputGroup>
                <CFormInput
                  type="number"
                  v-model.number="bulkPrice"
                  min="0"
                  step="0.01"
                  placeholder="Nhập giá chung"
                  class="custom-input"
                />
                <CButton
                  :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                  @click="applyBulkPrice"
                >
                  Áp dụng
                </CButton>
              </CInputGroup>
            </CCol>
            <CCol md="4">
              <CFormLabel class="fw-bold">Số lượng chung:</CFormLabel>
              <CInputGroup>
                <CFormInput
                  type="number"
                  v-model.number="bulkQuantity"
                  min="0"
                  placeholder="Nhập số lượng chung"
                  class="custom-input"
                />
                <CButton
                  :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                  @click="applyBulkQuantity"
                >
                  Áp dụng
                </CButton>
              </CInputGroup>
            </CCol>
            <CCol md="4">
              <CFormLabel class="fw-bold">Chọn màu để áp dụng:</CFormLabel>
              <CFormSelect v-model="bulkApplyColorId" class="custom-input">
                <option value="">Tất cả màu</option>
                <option v-for="color in selectedColors" :key="color.id" :value="color.id">
                  {{ color.name }}
                </option>
              </CFormSelect>
            </CCol>
          </CRow>

          <table class="table table-bordered table-striped custom-table">
            <thead>
              <tr>
                <th class="text-center">STT</th>
                <th class="text-center">Tên Sản Phẩm</th>
                <th class="text-center">Màu Sắc</th>
                <th class="text-center">Kích Cỡ</th>
                <th class="text-center">Số Lượng</th>
                <th class="text-center">Giá Bán</th>
                <th class="text-center">Ảnh</th>
                <th class="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(variation, index) in productVariations" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td>
                  {{ product.tenSanPham }} ({{ variation.colorDisplayName }} - {{ variation.size }})
                </td>
                <td class="text-center">
                  <div
                    :style="{
                      backgroundColor: variation.color,
                      width: '30px',
                      height: '30px',
                      borderRadius: '5px',
                      margin: 'auto',
                      border: '1px solid #ccc',
                    }"
                    :title="variation.colorDisplayName"
                  ></div>
                </td>
                <td class="text-center">{{ variation.size }}</td>
                <td>
                  <CFormInput
                    type="number"
                    v-model.number="variation.quantity"
                    min="0"
                    required
                    class="custom-input"
                    :class="{ 'is-invalid': !isQuantityValid(index) }"
                    @input="validateQuantity(index)"
                  />
                </td>
                <td>
                  <CFormInput
                    type="number"
                    v-model.number="variation.price"
                    min="0"
                    step="0.01"
                    required
                    class="custom-input"
                    :class="{ 'is-invalid': !isPriceValid(index) }"
                    @input="validatePrice(index)"
                  />
                </td>
                <td class="text-center">
                  <div class="image-preview-thumbnail-container d-flex flex-wrap gap-2">
                    <img
                      v-for="(img, imgIndex) in variation.images"
                      :key="imgIndex"
                      :src="img.url"
                      alt="Product Image"
                      class="img-thumbnail"
                      :class="{'border-success': img.laAnhDaiDien}"
                      style="width: 50px; height: 50px; object-fit: cover"
                      :title="img.laAnhDaiDien ? 'Ảnh đại diện' : ''"
                    />
                    <CIcon
                      v-if="variation.images.length === 0"
                      icon="cil-image"
                      size="xl"
                      class="text-secondary"
                    />
                  </div>
                  <CButton
                    :style="{
                      backgroundColor: '#000000',
                      borderColor: '#000000',
                      color: '#FFFFFF',
                    }"
                    size="sm"
                    class="mt-2"
                    @click="openImageUploadModal(index)"
                    >Upload Ảnh</CButton
                  >
                  <div v-if="!isImagesValid(index)" class="text-warning mt-1">
                    Vui lòng tải lên ít nhất một ảnh.
                  </div>
                </td>
                <td class="text-center">
                  <CButton
                    :style="{
                      backgroundColor: '#8B0000',
                      borderColor: '#8B0000',
                      color: '#FFFFFF',
                    }"
                    size="sm"
                    @click="removeVariation(index)"
                    >Xóa</CButton
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <CButton
            :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
            class="me-2"
            @click="cancelAdd"
            >Hủy</CButton
          >
          <CButton
            type="submit"
            :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
            :disabled="isSubmitting"
            >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-if="isSubmitting"> Đang thêm...</span>
            <span v-else>Thêm Sản Phẩm</span>
          </CButton>
        </div>
      </CForm>

      <CModal :visible="showColorModal" @close="closeColorModal" size="xl">
        <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
          <CModalTitle :style="{ color: '#FFFFFF' }">Chọn Màu Sắc</CModalTitle>
          <CButtonClose @click="closeColorModal" :style="{ color: '#FFFFFF' }" />
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md="12">
              <div class="mb-4">
                <CFormLabel class="fw-bold">Chọn màu sắc</CFormLabel>
                <div class="d-flex flex-column flex-md-row gap-4">
                  <div class="color-controls-left w-100 w-md-50 pe-3">
                    <div class="color-preview mb-3">
                      <div class="preview-box" :style="{ backgroundColor: currentColor.hex }"></div>
                    </div>
                    <div class="input-group mb-3">
                      <CFormInput
                        v-model="currentColor.hex"
                        @input="updateFromHex"
                        placeholder="HEX (e.g., #111B26)"
                        class="custom-input"
                      />
                      <CButton
                        :style="{
                          backgroundColor: '#000000',
                          borderColor: '#000000',
                          color: '#FFFFFF',
                        }"
                        @click="copyColor('hex')"
                      >
                        <CIcon icon="cil-copy" />
                      </CButton>
                    </div>
                    <div class="input-group mb-3">
                      <CFormSelect
                        v-model="selectedFormat"
                        @change="updateFormat"
                        class="custom-input me-2"
                        style="width: 100px"
                      >
                        <option value="rgb">RGB</option>
                        <option value="hsv">HSV</option>
                        <option value="hsl">HSL</option>
                        <option value="cmyk">CMYK</option>
                      </CFormSelect>
                      <CFormInput
                        v-model="formatValue"
                        @input="updateFromFormat"
                        :placeholder="getFormatPlaceholder()"
                        class="custom-input"
                      />
                      <CButton
                        :style="{
                          backgroundColor: '#000000',
                          borderColor: '#000000',
                          color: '#FFFFFF',
                        }"
                        @click="copyColor(selectedFormat)"
                      >
                        <CIcon icon="cil-copy" />
                      </CButton>
                    </div>
                    <div class="basic-colors mb-3">
                      <CFormLabel class="fw-bold">Màu sắc từ hệ thống</CFormLabel>
                      <div class="d-flex flex-wrap gap-2 justify-content-center">
                        <div
                          v-for="color in availableColors"
                          :key="color.id"
                          :style="{
                            backgroundColor: color.hex,
                            width: '30px',
                            height: '30px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                          }"
                          @click="selectSystemColor(color)"
                          class="cursor-pointer"
                          :title="color.name"
                        ></div>
                      </div>
                    </div>
                    <div v-if="colorHistory.length > 0" class="color-history mt-3">
                      <CFormLabel class="fw-bold">Lịch sử màu tùy chỉnh</CFormLabel>
                      <div
                        class="d-flex flex-wrap gap-2 justify-content-center bg-light p-2 rounded"
                      >
                        <div
                          v-for="(color) in colorHistory"
                          :key="color.id"
                          :style="{
                            backgroundColor: color.hex,
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '1px solid #ccc',
                          }"
                          @click="selectCustomColor(color)"
                          class="cursor-pointer position-relative"
                          :title="color.name"
                        >
                          <CButton
                            :style="{
                              backgroundColor: '#8B0000',
                              borderColor: '#8B0000',
                              color: '#FFFFFF',
                            }"
                            size="sm"
                            class="remove-history-btn"
                            @click.stop="deleteColor(color.id)"
                            >x</CButton
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="color-picker-right w-100 w-md-50 ps-3">
                    <div class="saturation-hue-container mb-3">
                      <div
                        class="saturation-area"
                        @mousedown="startDragging"
                        @mousemove="handleDrag"
                        @mouseup="stopDragging"
                        @mouseleave="stopDragging"
                        :style="{ '--hue': `${currentColor.hsv.h}deg` }"
                      >
                        <div class="saturation-white">
                          <div class="saturation-black"></div>
                          <div
                            class="saturation-pointer"
                            :style="{ left: saturationX + 'px', top: saturationY + 'px' }"
                          ></div>
                        </div>
                      </div>
                      <div class="hue-area">
                        <div
                          class="hue-slider"
                          @mousedown="startHueDragging"
                          @mousemove="handleHueDrag"
                          @mouseup="stopHueDragging"
                          @mouseleave="stopHueDragging"
                        >
                          <div class="hue-pointer" :style="{ top: hueY + 'px' }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CButton
                  :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                  @click="addCustomColor"
                  class="w-100 mt-3"
                  >Thêm Màu Tùy Chỉnh</CButton
                >
                <div class="selected-colors mt-3">
                  <CFormLabel class="fw-bold">Màu sắc đã chọn:</CFormLabel>
                  <div
                    class="d-flex flex-wrap border p-3 rounded"
                    style="min-height: 100px; background-color: #f8f9fa"
                  >
                    <div
                      v-for="(color, index) in selectedColors"
                      :key="color.id"
                      class="d-flex align-items-center me-3 mb-3 p-2 border rounded"
                    >
                      <div
                        :style="{
                          backgroundColor: color.hex,
                          width: '25px',
                          height: '25px',
                          borderRadius: '5px',
                          border: '1px solid #ccc',
                        }"
                        class="me-2"
                      ></div>
                      <span>{{ color.name }}</span>
                      <CButton
                        :style="{
                          backgroundColor: '#8B0000',
                          borderColor: '#8B0000',
                          color: '#FFFFFF',
                        }"
                        size="sm"
                        variant="ghost"
                        class="ms-2"
                        @click="removeSelectedColor(index)"
                        >x</CButton
                      >
                    </div>
                    <div v-if="selectedColors.length === 0" class="text-muted">
                      Chưa có màu nào được chọn.
                    </div>
                  </div>
                </div>
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton
            :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
            @click="closeColorModal"
            >Hủy</CButton
          >
          <CButton
            :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
            @click="confirmColors"
            >Xác nhận</CButton
          >
        </CModalFooter>
      </CModal>

      <CModal :visible="showSizeModal" @close="closeSizeModal" class="size-modal">
        <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
          <CModalTitle :style="{ color: '#FFFFFF' }">Chọn Kích Cỡ</CModalTitle>
          <CButtonClose @click="closeSizeModal" :style="{ color: '#FFFFFF' }" />
        </CModalHeader>
        <CModalBody>
          <div class="size-selection-container">
            <CFormLabel class="fw-bold mb-3">Chọn kích cỡ</CFormLabel>
            <div class="mb-3">
              <CButton
                :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                @click="selectAllSizes"
              >
                Chọn Tất Cả Kích Cỡ
              </CButton>
            </div>
            <div class="size-grid mb-3">
              <CButton
                v-for="size in availableSizes"
                :key="size.id"
                :color="selectedSizes.some((s) => s.id === size.id) ? 'primary' : 'secondary'"
                variant="outline"
                :style="{
                  backgroundColor: selectedSizes.some((s) => s.id === size.id)
                    ? '#000000'
                    : 'transparent',
                  color: selectedSizes.some((s) => s.id === size.id) ? '#FFFFFF' : '#000000',
                  borderColor: '#000000',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  padding: '0',
                  fontWeight: 'bold',
                  margin: '5px',
                  transition: 'all 0.3s ease',
                }"
                @click="toggleSize(size)"
              >
                {{ size.value }}
              </CButton>
            </div>
            <CInputGroup class="mb-3">
              <CFormInput
                v-model="newSizeInput"
                placeholder="Nhập kích cỡ đặc biệt (ví dụ: 44.2, 36.7)"
                class="custom-input"
                @keyup.enter="addCustomSize"
              />
              <CButton
                :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                @click="addCustomSize"
              >
                Thêm
              </CButton>
            </CInputGroup>
            <div v-if="selectedSizes.length > 0" class="selected-sizes-preview">
              <div
                v-for="size in selectedSizes"
                :key="size.id"
                class="d-flex align-items-center me-2 mb-2"
              >
                <CButton
                  :style="{
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    margin: '5px',
                    padding: '0',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                  }"
                  @click="removeSelectedSize(size.id)"
                >
                  {{ size.value }}
                </CButton>
<div class="relative group">
  <span
    v-if="size.isCustom" 
    class="flex items-center gap-x-1 bg-gray-200 text-gray-800 rounded-full pl-3 pr-1 py-1 text-sm"
  >
    <span>{{ size.value }}</span>

    <CButton 
      class="p-0.5 rounded-full bg-primary-red text-white hover:bg-red-700 transition-colors"
      @click="deleteSize(size.id)"
      aria-label="Xóa kích cỡ tùy chỉnh"
      :style="{
        backgroundColor: '#B91C1C'
      }"
    >
      <iconify-icon icon="ic:baseline-close" class="text-xs"></iconify-icon>
    </CButton>
  </span>
  <span
    v-else
    class="p-2 border rounded-full text-gray-800 text-sm"
  >
    {{ size.value }}
  </span>
</div>
              </div>
            </div>
            <div v-else class="text-muted">Chưa chọn kích cỡ nào.</div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
            @click="closeSizeModal"
          >
            Hủy
          </CButton>
          <CButton
            :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
            @click="confirmSizes"
          >
            Xác nhận
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal :visible="showImageUploadModal" @close="closeImageUploadModal" size="lg">
        <CModalHeader :style="{ backgroundColor: '#000000', color: '#FFFFFF' }">
          <CModalTitle :style="{ color: '#FFFFFF' }">Tải Ảnh Lên và Chọn Ảnh</CModalTitle>
          <CButtonClose @click="closeImageUploadModal" :style="{ color: '#FFFFFF' }" />
        </CModalHeader>
        <CModalBody>
          <CRow class="mb-3">
            <CCol md="6">
              <div class="mb-3">
                <CFormLabel class="fw-bold">Tải ảnh từ máy tính (Kéo thả hoặc chọn file)</CFormLabel>
                <input
                  type="file"
                  ref="fileInput"
                  multiple
                  accept=".jpg,.png,.jpeg"
                  @change="handleFileUpload"
                  class="form-control custom-input"
                />
              </div>
            </CCol>
            <CCol md="6">
              <div class="mb-3">
                <CFormLabel class="fw-bold">Hoặc thêm ảnh từ URL</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    v-model="newImageUrl"
                    placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.jpg)"
                    class="custom-input"
                    @keyup.enter="addImageUrl"
                  />
                  <CButton
                    :style="{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }"
                    @click="addImageUrl"
                    >Thêm</CButton
                  >
                </CInputGroup>
              </div>
            </CCol>
          </CRow>
          <div class="image-upload-preview border p-3 rounded mb-3" style="min-height: 200px">
            <h5 class="mb-3">Ảnh đã tải lên:</h5>
            <div v-if="allImagesList.length === 0" class="text-muted">
              Chưa có ảnh nào được tải lên.
            </div>
            <div class="d-flex flex-wrap">
              <div
                v-for="image in allImagesList"
                :key="image.id"
                class="image-item me-3 mb-3 border rounded p-2"
                :class="{ 'image-selected': image.selected, 'image-representative': image.laAnhDaiDien }"
                @click="toggleImageSelection(image.id)"
                @mouseover="image.hover = true"
                @mouseleave="image.hover = false"
                style="width: 120px; height: 120px; position: relative; cursor: pointer; overflow: hidden;"
              >
                <img
                  :src="image.url"
                  alt="Uploaded Image"
                  class="img-thumbnail"
                  style="width: 100%; height: 100%; object-fit: cover"
                />

                <!-- Dimming overlay on hover or selected -->
                <div class="image-dimming-overlay" :class="{'active': image.selected || image.hover}"></div>

                <!-- Checkbox input (visually hidden, but functionally present) -->
                <input type="checkbox" :checked="image.selected" class="image-hidden-checkbox" />

                <!-- Checkmark icon (always visible if selected, positioned on top) -->
                <div v-if="image.selected" class="image-checkmark-icon">
                  <CIcon icon="cil-check-circle" size="xl" class="text-success" />
                </div>

                <!-- Representative Radio Button for Variation -->
                <div class="image-radio-group">
                    <div class="image-radio-item">
                        <input
                            type="radio"
                            :id="'radio-variation-' + image.id"
                            :name="'representative-variation-' + currentVariationIndex"
                            :value="image.id"
                            v-model="selectedImageForVariationId"
                            @click.stop="markAsRepresentative(image.id)"
                        />
                        <label :for="'radio-variation-' + image.id" class="ms-1">Đại diện</label>
                    </div>
                    <!-- Main Product Image Radio Button -->
                    <div class="image-radio-item">
                        <input
                            type="radio"
                            :id="'radio-main-' + image.id"
                            name="representative-main-product"
                            :value="image.url"
                            v-model="selectedProductMainImageUrl"
                            @click.stop="selectProductMainImage(image.url)"
                        />
                        <label :for="'radio-main-' + image.id" class="ms-1">Ảnh chính</label>
                    </div>
                </div>


                <!-- Actions (delete button) only visible on hover -->
                <div class="image-actions-overlay" :class="{'active': image.hover}">
                  <CButton
                    :style="{
                      backgroundColor: 'rgba(139, 0, 0, 0.7)',
                      borderColor: 'rgba(139, 0, 0, 0.7)',
                      color: '#FFFFFF',
                    }"
                    size="sm"
                    @click.stop="deleteImage(image.id)"
                  >
                    <CIcon icon="cil-x" /> Xóa
                  </CButton>
                </div>
              </div>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            :style="{ backgroundColor: '#D3D3D3', borderColor: '#D3D3D3', color: '#000000' }"
            @click="closeImageUploadModal"
            >Hủy</CButton
          >
          <CButton
            :style="{ backgroundColor: '#8B0000', borderColor: '#8B0000', color: '#FFFFFF' }"
            @click="confirmImages"
            :disabled="uploadingImages"
          >
            <span v-if="uploadingImages" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-if="uploadingImages"> Đang tải lên...</span>
            <span v-else>Xác nhận Ảnh</span>
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
    <div v-else class="text-center">Đang tải dữ liệu...</div>
  </div>
</template>

<script type="module">
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CInputGroup,
  CBadge,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilPlus, cilImage, cilCopy, cilCheckCircle, cilX } from '@coreui/icons'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import colornames from 'colornames' // Import colornames for generating color names

export default {
  name: 'AddProductForm',
  components: {
    CButton,
    CForm,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CFormTextarea,
    CRow,
    CCol,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CInputGroup,
    CBadge,
    CIcon,
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      icons: { cilPlus, cilImage, cilCopy, cilCheckCircle, cilX },
      product: {
        tenSanPham: '',
        moTaSanPham: '',
        thuongHieu: '', // Giá trị mặc định rỗng để khớp option mặc định
        chatLieu: '',
        danhMuc: '',
        idTrangThai: null, // Thay đổi: Giờ đây lưu ID trạng thái
        selectedMauSacId: null, // Thêm trường này để lưu ID màu sắc được chọn cho sản phẩm
      },
      thuongHieuList: [],
      chatLieuList: [],
      danhMucList: [],
      statusesList: [], // NEW: Danh sách trạng thái từ API
      isDataLoaded: false,
      isSubmitting: false, // Thêm cờ để quản lý trạng thái submit

      // --- Dữ liệu cho Modal Màu Sắc ---
      showColorModal: false,
      currentColor: {
        hex: '#111B26',
        rgb: { r: 17, g: 27, b: 38 },
        hsv: { h: 210, s: 0.55, v: 0.15 },
        hsl: { h: 210, s: 0.39, l: 0.08 },
        cmyk: { c: 0.55, m: 0.29, y: 0, k: 0.85 },
      },
      saturationX: 165,
      saturationY: 165,
      hueY: 175,
      isDragging: false,
      isHueDragging: false,
      selectedColors: [], // Các màu sắc đã chọn cho sản phẩm
      availableColors: [], // Danh sách màu lấy từ API
      colorHistory: [], // Lịch sử màu tùy chỉnh đã thêm hoặc màu hệ thống đã chọn
      selectedFormat: 'rgb', // Thêm thuộc tính này
      formatValue: '', // Thêm thuộc tính này

      // --- Dữ liệu cho Modal Kích Cỡ ---
      showSizeModal: false,
      availableSizes: [], // Thay đổi: Khởi tạo rỗng, sẽ fetch từ API
      selectedSizes: [],
      newSizeInput: '',

      // --- Dữ liệu cho Modal Upload Ảnh ---
      showImageUploadModal: false,
      currentVariationIndex: null, // Index của biến thể đang được upload ảnh
      newImageUrl: '',
      allImagesList: [], // Danh sách tất cả các ảnh đã tải lên/thêm URL trong modal
      uploadedImagesCache: [], // Cache để lưu trữ ảnh đã tải lên trong phiên modal
      uploadingImages: false, // Thêm cờ để quản lý trạng thái tải lên
      selectedImageForVariationId: null, // ID của ảnh được chọn làm đại diện cho biến thể hiện tại
      selectedProductMainImageUrl: null, // URL ảnh đại diện cho sản phẩm chính

      // --- Validation Flags ---
      isTenSanPhamValid: true,
      isThuongHieuValid: true,
      isDanhMucValid: true,
      isChatLieuValid: true,
      isSelectedColorsValid: true,
      // isProductMainImageValid: true, // Không cần thiết ở đây nữa, sẽ kiểm tra trong submitProduct

      productVariations: [], // KHỞI TẠO LÀ DATA PROPERTY

      // --- Bulk Edit for Price and Quantity ---
      bulkPrice: 0,
      bulkQuantity: 0,
      bulkApplyColorId: '', // ID của màu sắc để áp dụng hàng loạt
    }
  },
  computed: {
    // Computed property to filter statuses for the main product dropdown
    filteredStatusesList() {
      // Only include statuses with IDs 3, 4, 5 as requested
      const allowedIds = [3, 4, 5];
      return this.statusesList.filter(status => allowedIds.includes(status.id));
    }
  },
  watch: {
    'product.tenSanPham': function () {
      this.validateTenSanPham()
    },
    'product.thuongHieu': function () {
      this.validateThuongHieu()
    },
    'product.danhMuc': function () {
      this.validateDanhMuc()
    },
    'product.chatLieu': function () {
      this.validateChatLieu()
    },
    selectedColors: {
      handler() {
        this.isSelectedColorsValid = this.selectedColors.length > 0
        this.generateProductVariations(); // GỌI PHƯƠNG THỨC MỚI
      },
      deep: true,
    },
    selectedSizes: {
      handler(newVal, oldVal) {
        console.log('selectedSizes changed from:', oldVal, 'to:', newVal);
        this.generateProductVariations(); // GỌI PHƯƠNG THỨC MỚI
      },
      deep: true,
    },
    // Không cần watch selectedProductMainImageUrl ở đây nữa
  },
  methods: {
      getImageUrl(url) {
    // Bước 1: Đảm bảo 'url' là một chuỗi. Nếu không phải, gán nó thành chuỗi rỗng.
    const finalUrl = typeof url === 'string' ? url : '';

    // Bước 2: Kiểm tra xem 'finalUrl' có phải là URL tuyệt đối (http/https) hoặc Base64 không.
    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://') || finalUrl.startsWith('data:image/')) {
        return finalUrl; // Trả về URL tuyệt đối hoặc Base64 nguyên bản
    }
    // Bước 3: Nếu không phải, giả định đó là đường dẫn tương đối và thêm baseUrl vào.
    return this.baseUrl + finalUrl;
},
    // PHƯƠNG THỨC MỚI ĐỂ TẠO VÀ QUẢN LÝ productVariations
    generateProductVariations() {
      const newVariations = [];
      const existingVariationsMap = new Map();

      // Tạo một map từ các biến thể hiện có để dễ dàng tìm kiếm và giữ lại dữ liệu
      this.productVariations.forEach(v => {
        existingVariationsMap.set(`${v.colorId}-${v.sizeId}`, v);
      });

      if (this.selectedColors.length > 0 && this.selectedSizes.length > 0) {
        this.selectedColors.forEach((color) => {
          this.selectedSizes.forEach((size) => {
            const key = `${color.id}-${size.id}`;
            let variation = existingVariationsMap.get(key);

            if (variation) {
              // Nếu biến thể đã tồn tại, sử dụng lại nó để giữ dữ liệu đã nhập
              newVariations.push(variation);
            } else {
              // Nếu là sự kết hợp mới, tạo một đối tượng biến thể mới
              newVariations.push({
                colorId: color.id,
                color: color.hex,
                colorDisplayName: color.name,
                maMauSac: color.maMauSac,
                sizeId: size.id,
                size: size.value,
                maKichCo: size.maKichCo,
                quantity: 0,
                price: 0,
                images: [], // Khởi tạo mảng ảnh rỗng cho biến thể mới
                chiTietSpId: null, // Sẽ được điền sau khi tạo chi tiết sản phẩm ở BE
              });
            }
          });
        });
      }
      // Cập nhật thuộc tính dữ liệu productVariations
      this.productVariations = newVariations;
    },

    // --- Initial Data Fetching ---
    async fetchInitialData() {
      try {
        await Promise.all([
          this.fetchThuongHieu(),
          this.fetchChatLieu(),
          this.fetchDanhMuc(),
          this.fetchAvailableColors(), // Fetch colors from Backend
          this.fetchAvailableSizes(), // Fetch sizes from Backend
          this.fetchStatuses(), // NEW: Fetch statuses from Backend
        ])
        this.isDataLoaded = true
        this.generateProductVariations(); // GỌI LẦN ĐẦU KHI DỮ LIỆU ĐƯỢC TẢI
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', error)
        this.toast.error('Không thể tải dữ liệu ban đầu. Vui lòng thử lại.')
      }
    },
    async fetchThuongHieu() {
      try {
        const response = await axios.get('http://localhost:8080/api/thuongHieus')
        this.thuongHieuList = response.data.map((item) => ({
          id: item.id,
          tenThuongHieu: item.tenThuongHieu,
          maThuongHieu: item.maThuongHieu,
        }))
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thương hiệu:', error)
        this.toast.error('Không thể tải danh sách thương hiệu.')
      }
    },
    async fetchChatLieu() {
      try {
        const response = await axios.get('http://localhost:8080/api/chatLieus')
        this.chatLieuList = response.data.map((item) => ({
          id: item.id,
          tenChatLieu: item.tenChatLieu,
          maChatLieu: item.maChatLieu,
        }))
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chất liệu:', error)
        this.toast.error('Không thể tải danh sách chất liệu.')
      }
    },
      async fetchDanhMuc() {
      try {
        const response = await axios.get('http://localhost:8080/api/danh-mucs')
        this.danhMucList = response.data.map((item) => ({
          id: item.id,
          maDanhMuc: item.maDanhMuc, // Đổi từ ma_danh_muc
          tenDanhMuc: item.tenDanhMuc, // Đổi từ ten_danh_muc
        }))
        console.log('danhMucList:', this.danhMucList) // Debug
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error)
        this.danhMucList = []
        this.toast.error('Không thể tải danh sách danh mục. Vui lòng thử lại.')
      }
    },
    async fetchStatuses() {
      try {
        const response = await axios.get('http://localhost:8080/api/trangThais');
        this.statusesList = response.data;
        // Set a default status for the main product, e.g., 'dang_kinh_doanh' (ID 3)
        const defaultStatus = this.statusesList.find(s => s.id === 3); // Assume ID 3 is 'dang_kinh_doanh'
        if (defaultStatus) {
            this.product.idTrangThai = defaultStatus.id;
        } else if (this.filteredStatusesList.length > 0) { // Fallback to first filtered status
            this.product.idTrangThai = this.filteredStatusesList[0].id;
        }
        console.log('statusesList:', this.statusesList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách trạng thái:', error);
        this.toast.error('Không thể tải danh sách trạng thái.');
      }
    },
 async loadAllInitialData() {
      try {
        await Promise.all([
          this.fetchThuongHieu(),
          this.fetchChatLieu(),
          this.fetchDanhMuc(),
          this.fetchAvailableColors(),
          this.fetchAvailableSizes(),
          this.fetchStatuses(), // NEW: Fetch statuses
        ])
        this.isDataLoaded = true
        this.toast.success('Dữ liệu ban đầu đã tải thành công!')
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', error)
        this.toast.error('Không thể tải dữ liệu cần thiết. Vui lòng thử lại.')
      }
    },
    // --- Color Modal Methods ---
    async fetchAvailableColors() {
      try {
        const response = await axios.get('http://localhost:8080/api/mauSacs')
        console.log('API Response (MauSac list):', response.data)

        // Map data from BE to Frontend structure
        this.availableColors = response.data.map((color) => ({
          id: color.id,
          hex: color.hex,
          name: color.tenMauSac || color.maMauSac, // Ưu tiên tên màu sắc, fallback mã màu sắc
          maMauSac: color.maMauSac,
        }))
        // Initialize colorHistory with colors from API for initial display
        this.colorHistory = [...this.availableColors]
        console.log('availableColors processed:', this.availableColors)

        if (this.availableColors.length === 0) {
          console.warn('Không có dữ liệu màu sắc từ API, sử dụng danh sách mặc định.')
          this.availableColors = [
            { id: -1, hex: '#FF0000', name: 'Đỏ', maMauSac: 'RED' },
            { id: -2, hex: '#00FF00', name: 'Xanh lục', maMauSac: 'GREEN' },
            { id: -3, hex: '#0000FF', name: 'Xanh lam', maMauSac: 'BLUE' },
            { id: -4, hex: '#FFFF00', name: 'Vàng', maMauSac: 'YELLOW' },
            { id: -5, hex: '#000000', name: 'Đen', maMauSac: 'BLACK' },
            { id: -6, hex: '#FFFFFF', name: 'Trắng', maMauSac: 'WHITE' },
          ]
          this.colorHistory = [...this.availableColors] // Also update history if fallback
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách màu sắc:', error)
        this.toast.error('Không thể tải danh sách màu sắc. Sử dụng màu mặc định.')
        // Fallback to default colors on error
        this.availableColors = [
          { id: -1, hex: '#FF0000', name: 'Đỏ', maMauSac: 'RED' },
          { id: -2, hex: '#00FF00', name: 'Xanh lục', maMauSac: 'GREEN' },
          { id: -3, hex: '#0000FF', name: 'Xanh lam', maMauSac: 'BLUE' },
          { id: -4, hex: '#FFFF00', name: 'Vàng', maMauSac: 'YELLOW' },
          { id: -5, hex: '#000000', name: 'Đen', maMauSac: 'BLACK' },
            { id: -6, hex: '#FFFFFF', name: 'Trắng', maMauSac: 'WHITE' },
          ]
          this.colorHistory = [...this.availableColors] // Also update history if fallback
        }
    },

    selectSystemColor(color) {
      if (!this.selectedColors.some((c) => c.id === color.id)) {
        this.selectedColors.push(color)
        this.toast.success(`Đã thêm màu "${color.name}" vào danh sách chọn.`)
      } else {
        this.toast.warning(`Màu "${color.name}" đã được chọn.`)
      }
    },

    selectCustomColor(color) {
      // Logic để chọn màu từ lịch sử hoặc màu tùy chỉnh đã tạo
      if (!this.selectedColors.some((c) => c.id === color.id)) {
        this.selectedColors.push(color)
        this.toast.success(`Đã thêm màu "${color.name}" vào danh sách chọn.`)
      } else {
        this.toast.warning(`Màu "${color.name}" đã được chọn.`)
      }
    },
    
// Phương thức tạo mã màu sắc mới - CẦN ĐƯỢC THAY ĐỔI
  generateMauSacCode() {
    // Lấy mã màu lớn nhất từ danh sách đã có
    const currentCodes = this.availableColors.map(color => {
      const code = color.maMauSac.replace('MS', '');
      return isNaN(parseInt(code)) ? 0 : parseInt(code);
    });

    const nextId = currentCodes.length > 0 ? Math.max(...currentCodes) + 1 : 1;
    
    // Tạo mã màu tuần tự, ví dụ: MS001, MS002, MS010...
    return `MS${String(nextId).padStart(3, '0')}`;
  },

    // Hàm sinh tên màu sắc đồng bộ với MauSac.vue
    generateMauSacName(hex) {
        const colorName = colornames(hex);
        return colorName || `Màu tùy chỉnh ${hex}`;
    },

  async addCustomColor() {
    const hex = this.currentColor.hex;
    if (!hex || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
      this.toast.error('Mã HEX không hợp lệ.');
      return;
    }

    // Tải danh sách màu sắc mới nhất trước khi kiểm tra và tạo mã
    await this.fetchAvailableColors();

    // Kiểm tra trùng lặp dựa trên HEX (để tránh thêm trùng màu)
    if (this.availableColors.some((c) => c.hex.toLowerCase() === hex.toLowerCase())) {
      this.toast.warning('Màu này đã tồn tại trong hệ thống.');
      const existingColor = this.availableColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
      if (existingColor && !this.selectedColors.some(c => c.id === existingColor.id)) {
        this.selectedColors.push(existingColor);
        this.toast.info(`Màu "${existingColor.name}" đã tồn tại và đã được chọn.`);
      }
      return;
    }

    try {
      const tenMauSac = this.generateMauSacName(hex);
      const maMauSac = this.generateMauSacCode(); // Gọi phương thức mới này

      // Gửi màu mới lên Backend
      const response = await axios.post('http://localhost:8080/api/mauSacs', {
        tenMauSac: tenMauSac,
        maMauSac: maMauSac,
        hex: hex,
      });
      const newColorFromApi = response.data;
      console.log('Màu mới thêm từ API:', newColorFromApi);

      const newColor = {
        id: newColorFromApi.id,
        hex: newColorFromApi.hex,
        name: newColorFromApi.tenMauSac,
        maMauSac: newColorFromApi.maMauSac,
      };

      this.colorHistory.unshift(newColor);
      this.availableColors.push(newColor); // Cập nhật ngay lập tức

      this.toast.success(`Đã thêm màu tùy chỉnh: ${newColor.name}`);

      if (!this.selectedColors.some(c => c.id === newColor.id)) {
        this.selectedColors.push(newColor);
      }

    } catch (error) {
      console.error('Lỗi khi thêm màu tùy chỉnh:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data && error.response.data.message) {
        this.toast.error(error.response.data.message);
      } else {
        this.toast.error('Không thể thêm màu tùy chỉnh. Vui lòng thử lại.');
      }
    }
  },

    async deleteColor(colorId) {
      if (!confirm('Bạn có chắc chắn muốn xóa màu này không?')) return;

      try {
          // Chỉ xóa màu nếu nó có ID hợp lệ từ DB (id > 0)
          if (colorId > 0) {
            await axios.delete(`http://localhost:8080/api/mauSacs/${colorId}`)
            this.toast.success('Đã xóa màu khỏi hệ thống.')
          } else {
            // Xử lý các trường hợp màu không có trong DB (ví dụ: màu fallback với ID âm)
            this.toast.info('Đây là màu mặc định hoặc màu không có trong DB, không thể xóa khỏi hệ thống.')
          }

          // Cập nhật lại availableColors và colorHistory (luôn làm ở frontend)
          this.availableColors = this.availableColors.filter((c) => c.id !== colorId)
          this.colorHistory = this.colorHistory.filter((c) => c.id !== colorId)
          this.selectedColors = this.selectedColors.filter((c) => c.id !== colorId) // Xóa nếu đang được chọn

        } catch (error) {
          console.error('Lỗi khi xóa màu:', error.response ? error.response.data : error.message)
          // Xử lý lỗi nếu Backend trả về thông báo rằng màu đang được sử dụng
          if (error.response && error.response.status === 409) {
              this.toast.error(error.response.data || 'Màu này đang được sử dụng và không thể xóa.');
          } else {
              this.toast.error('Không thể xóa màu. Vui lòng thử lại.');
          }
        }
    },

    removeSelectedColor(index) {
      this.selectedColors.splice(index, 1)
      this.toast.info('Đã xóa một màu khỏi danh sách chọn.')
    },

    closeColorModal() {
      this.showColorModal = false
    },
    confirmColors() {
      this.showColorModal = false
      this.isSelectedColorsValid = this.selectedColors.length > 0
    },

    // --- Color Picker Logic (unchanged, for completeness) ---
    hexToRgb(hex) {
      let r = 0,
        g = 0,
        b = 0
      // 3 digits
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16)
        g = parseInt(hex[2] + hex[2], 16)
        b = parseInt(hex[3] + hex[3], 16)
      }
      // 6 digits
      else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16)
        g = parseInt(hex.substring(3, 5), 16)
        b = parseInt(hex.substring(5, 7), 16)
      }
      return { r, g, b }
    },
    rgbToHsv(r, g, b) {
      r /= 255
      g /= 255
      b /= 255

      let max = Math.max(r, g, b),
        min = Math.min(r, g, b)
      let h,
        s,
        v = max

      let d = max - min
      s = max === 0 ? 0 : d / max

      if (max === min) {
        h = 0 // achromatic
      } else {
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }
      return { h: h * 360, s: s * 100, v: v * 100 }
    },
    hsvToRgb(h, s, v) {
      h /= 360
      s /= 100
      v /= 100

      let i = Math.floor(h * 6)
      let f = h * 6 - i
      let p = v * (1 - s)
      let q = v * (1 - f * s)
      let t = v * (1 - (1 - f) * s)

      let r, g, b
      switch (i % 6) {
        case 0:
          ;(r = v), (g = t), (b = p)
          break
        case 1:
          ;(r = q), (g = v), (b = p)
          break
        case 2:
          ;(r = p), (g = v), (b = t)
          break
        case 3:
          ;(r = p), (g = q), (b = v)
          break
        case 4:
          ;(r = t), (g = p), (b = v)
          break
        case 5:
          ;(r = v), (g = p), (b = q)
          break
      }

      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
    },
    rgbToHex(r, g, b) {
      const toHex = (c) => {
        const hex = Math.round(c).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
    },
    rgbToHsl(r, g, b) {
      r /= 255
      g /= 255
      b /= 255

      let max = Math.max(r, g, b),
        min = Math.min(r, g, b)
      let h, s, l
      l = (max + min) / 2

      if (max === min) {
        h = s = 0 // achromatic
      } else {
        let d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }
      return { h: h * 360, s: s * 100, l: l * 100 }
    },
    hslToRgb(h, s, l) {
      h /= 360
      s /= 100
      l /= 100

      let r, g, b
      if (s === 0) {
        r = g = b = l // achromatic
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1 / 6) return p + (q - p) * 6 * t
          if (t < 1 / 2) return q
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
          return p
        }
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s
        let p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
    },
    rgbToCmyk(r, g, b) {
      r /= 255
      g /= 255
      b /= 255

      let k = 1 - Math.max(r, g, b)
      let c = (1 - r - k) / (1 - k) || 0
      let m = (1 - g - k) / (1 - k) || 0
      let y = (1 - b - k) / (1 - k) || 0
      return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 }
    },
    cmykToRgb(c, m, y, k) {
      c /= 100
      m /= 100
      y /= 100
      k /= 100

      let r = 255 * (1 - c) * (1 - k)
      let g = 255 * (1 - m) * (1 - k)
      let b = 255 * (1 - y) * (1 - k)
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
    },
    updateCurrentColor(newHex) {
      this.currentColor.hex = newHex
      const rgb = this.hexToRgb(newHex)
      this.currentColor.rgb = rgb
      this.currentColor.hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b)
      this.currentColor.hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
      this.currentColor.cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
      this.updateHuePointer()
      this.updateSaturationPointer()
      this.updateFormatValue()
    },
    updateFromHex() {
      if (this.currentColor.hex.length === 7 && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.currentColor.hex)) {
        // Defensive check before calling updateCurrentColor
        if (typeof this.updateCurrentColor === 'function') {
          this.updateCurrentColor(this.currentColor.hex)
        } else {
          console.error('updateCurrentColor method is not available in updateFromHex.');
        }
      }
    },
    updateFormat() {
      this.updateFormatValue()
    },
    getFormatPlaceholder() {
      switch (this.selectedFormat) {
        case 'rgb':
          return 'R, G, B (e.g., 255, 255, 255)'
        case 'hsv':
          return 'H, S, V (e.g., 360, 100, 100)'
        case 'hsl':
          return 'H, S, L (e.g., 360, 100, 100)'
        case 'cmyk':
          return 'C, M, Y, K (e.g., 100, 100, 100, 100)'
        default:
          return ''
      }
    },
    updateFromFormat() {
      const values = this.formatValue.split(',').map(Number)
      let rgb = { r: 0, g: 0, b: 0 }
      if (this.selectedFormat === 'rgb' && values.length === 3 && values.every(v => !isNaN(v) && v >= 0 && v <= 255)) {
        rgb = { r: values[0], g: values[1], b: values[2] }
      } else if (this.selectedFormat === 'hsv' && values.length === 3 && values.every(v => !isNaN(v) && v >= 0)) {
        rgb = this.hsvToRgb(values[0], values[1], values[2])
      } else if (this.selectedFormat === 'hsl' && values.length === 3 && values.every(v => !isNaN(v) && v >= 0)) {
        rgb = this.hslToRgb(values[0], values[1], values[2])
      } else if (this.selectedFormat === 'cmyk' && values.length === 4 && values.every(v => !isNaN(v) && v >= 0 && v <= 100)) {
        rgb = this.cmykToRgb(values[0], values[1], values[2], values[3])
      } else {
        return // Invalid input
      }
      // Defensive check before calling updateCurrentColor
      if (typeof this.updateCurrentColor === 'function') {
        this.updateCurrentColor(this.rgbToHex(rgb.r, rgb.g, rgb.b))
      } else {
        console.error('updateCurrentColor method is not available in updateFromFormat.');
      }
    },
    copyColor(format) {
      let textToCopy = ''
      const color = this.currentColor
      if (!color) return
      switch (format) {
        case 'hex':
          textToCopy = color.hex
          break
        case 'rgb':
          textToCopy = `${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`
          break
        case 'hsv':
          textToCopy = `${Math.round(color.hsv.h)}, ${Math.round(color.hsv.s)}, ${Math.round(color.hsv.v)}`
          break
        case 'hsl':
          textToCopy = `${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}, ${Math.round(color.hsl.l)}`
          break
        case 'cmyk':
          textToCopy = `${Math.round(color.cmyk.c)}, ${Math.round(color.cmyk.m)}, ${Math.round(color.cmyk.y)}, ${Math.round(color.cmyk.k)}`
          break
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.toast.success(`Đã sao chép ${format.toUpperCase()}: ${textToCopy}`)
      }).catch(err => {
        console.error('Không thể sao chép:', err)
        this.toast.error('Không thể sao chép màu.')
      })
    },
    startDragging(event) {
      this.isDragging = true
      this.handleDrag(event)
    },
    handleDrag(event) {
      if (!this.isDragging) return
      const rect = event.currentTarget.getBoundingClientRect()
      let x = event.clientX - rect.left
      let y = event.clientY - rect.top
      x = Math.max(0, Math.min(x, rect.width))
      y = Math.max(0, Math.min(y, rect.height))
      this.saturationX = x
      this.saturationY = y

      const s = (x / rect.width) * 100
      const v = 100 - (y / rect.height) * 100
      const newRgb = this.hsvToRgb(this.currentColor.hsv.h, s, v)
      // Defensive check before calling updateCurrentColor
      if (typeof this.updateCurrentColor === 'function') {
        this.updateCurrentColor(this.rgbToHex(newRgb.r, newRgb.g, newRgb.b))
      } else {
        console.error('updateCurrentColor method is not available in handleDrag.');
      }
    },
    stopDragging() {
      this.isDragging = false
    },
    startHueDragging(event) {
      this.isHueDragging = true
      this.handleHueDrag(event)
    },
    handleHueDrag(event) {
      if (!this.isHueDragging) return
      const rect = event.currentTarget.getBoundingClientRect()
      let y = event.clientY - rect.top
      y = Math.max(0, Math.min(y, rect.height))
      this.hueY = y

      const h = (y / rect.height) * 360
      const newRgb = this.hsvToRgb(h, this.currentColor.hsv.s, this.currentColor.hsv.v)
      // Defensive check before calling updateCurrentColor
      if (typeof this.updateCurrentColor === 'function') {
        this.updateCurrentColor(this.rgbToHex(newRgb.r, newRgb.g, newRgb.b))
      } else {
        console.error('updateCurrentColor method is not available in handleHueDrag.');
      }
    },
    stopHueDragging() {
      this.isHueDragging = false
    },
    updateHuePointer() {
      const hueArea = this.$el.querySelector('.hue-area')
      if (hueArea) {
        const rect = hueArea.getBoundingClientRect()
        this.hueY = (this.currentColor.hsv.h / 360) * rect.height
      }
    },
    updateSaturationPointer() {
      const saturationArea = this.$el.querySelector('.saturation-area')
      if (saturationArea) {
        const rect = saturationArea.getBoundingClientRect()
        this.saturationX = (this.currentColor.hsv.s / 100) * rect.width
        this.saturationY = (1 - this.currentColor.hsv.v / 100) * rect.height
      }
    },

    // --- Size Modal Methods ---
    async fetchAvailableSizes() {
        try {
            const response = await axios.get('http://localhost:8080/api/kichCos');
            this.availableSizes = response.data.map((size) => ({
                id: size.id,
                value: size.tenKichCo, // Giá trị hiển thị
                maKichCo: size.maKichCo, // Mã kích cỡ từ BE
                isCustom: !['36', '37', '38', '39', '40', '41', '42', '43', '44'].includes(
                    size.tenKichCo,
                ),
            }));
            this.availableSizes.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
            console.log('Fetched availableSizes:', this.availableSizes);
        }
        catch (error) {
            console.error('Lỗi khi lấy danh sách kích cỡ:', error);
            this.toast.error('Không thể tải danh sách kích cỡ.');
        }
    },
        // Thêm phương thức để tạo mã kích cỡ tuần tự
    generateKichCoCode() {
      const nextId =
        this.availableSizes.length > 0
          ? Math.max(
              ...this.availableSizes.map((kc) =>
                parseInt(kc.maKichCo.replace('KC', '') || '0'), // Xử lý trường hợp mã không hợp lệ
              ),
            ) + 1
          : 1;
      return `KC${String(nextId).padStart(3, '0')}`;
    },
async addCustomSize() {
    const newSizeValue = this.newSizeInput.trim();
    if (!newSizeValue) {
        this.toast.error('Vui lòng nhập kích cỡ.');
        return;
    }

    if (!/^\d+(\.\d{1})?$/.test(newSizeValue)) {
        this.toast.error(
            'Kích cỡ phải là số nguyên hoặc số thập phân với một chữ số sau dấu chấm (VD: 36, 36.7).',
        );
        return;
    }

    // Tải lại danh sách kích cỡ mới nhất trước khi kiểm tra và tạo mã
    await this.fetchAvailableSizes();
    
    const existingInAvailable = this.availableSizes.find((s) => s.value === newSizeValue);
    const existingInSelected = this.selectedSizes.find((s) => s.value === newSizeValue);

    if (existingInAvailable) {
        if (!existingInSelected) {
            this.selectedSizes = [...this.selectedSizes, existingInAvailable];
            this.selectedSizes.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
            this.toast.info('Kích cỡ này đã tồn tại và đã được chọn.');
        } else {
            this.toast.info('Kích cỡ này đã tồn tại và đã được chọn.');
        }
        this.newSizeInput = '';
        console.log('selectedSizes after existing size operation:', this.selectedSizes);
        return;
    }

    try {
        // Thay thế logic tạo mã ngẫu nhiên bằng phương thức tạo mã tuần tự
        const maKichCo = this.generateKichCoCode();

        const response = await axios.post('http://localhost:8080/api/kichCos', {
            tenKichCo: newSizeValue,
            maKichCo: maKichCo, // Sử dụng mã kích cỡ được tạo tự động và đúng định dạng
        });

        const newSize = {
            id: response.data,
            value: newSizeValue,
            maKichCo: maKichCo, // Lưu mã mới đã được tạo vào đối tượng
            isCustom: true,
        };

        this.availableSizes = [...this.availableSizes, newSize];
        this.availableSizes.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

        if (!this.selectedSizes.some(s => s.id === newSize.id)) {
            this.selectedSizes = [...this.selectedSizes, newSize];
            this.selectedSizes.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
        }

        this.newSizeInput = '';
        this.toast.success('Thêm kích cỡ tùy chỉnh thành công!');
        console.log('selectedSizes after adding custom size:', this.selectedSizes);
    } catch (error) {
        console.error('Lỗi khi thêm kích cỡ:', error);
        this.toast.error(
            error.response?.data?.message || 'Không thể thêm kích cỡ. Vui lòng thử lại.',
        );
    }
},
    async deleteSize(id) {
      if (!confirm('Bạn có chắc chắn muốn xóa kích cỡ này khỏi hệ thống?')) return;
      try {
        await axios.delete(`http://localhost:8080/api/kichCos/${id}`);
        this.availableSizes = this.availableSizes.filter((s) => s.id !== id);
        this.selectedSizes = this.selectedSizes.filter((s) => s.id !== id);
        this.toast.success('Xóa kích cỡ thành công!');
        console.log('selectedSizes after deleting size:', this.selectedSizes);
      } catch (error) {
        console.error('Lỗi khi xóa kích cỡ:', error);
        if (error.response && error.response.status === 409) {
            this.toast.error(error.response.data || 'Kích cỡ này đang được sử dụng và không thể xóa.');
        } else {
            this.toast.error(
              error.response?.data?.message || 'Không thể xóa kích cỡ. Vui lòng thử lại.',
            );
        }
      }
    },
    toggleSize(size) {
      console.log('Toggling size:', size);
      const index = this.selectedSizes.findIndex((s) => s.id === size.id);
      let newSelectedSizes;
      if (index === -1) {
        newSelectedSizes = [...this.selectedSizes, size];
        this.toast.info(`Đã chọn kích cỡ: ${size.value}`);
      } else {
        newSelectedSizes = this.selectedSizes.filter(s => s.id !== size.id);
        this.toast.info(`Đã bỏ chọn kích cỡ: ${size.value}`);
      }
      this.selectedSizes = newSelectedSizes.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
      console.log('selectedSizes after toggle:', this.selectedSizes);
    },
    selectAllSizes() {
      console.log('Selecting all sizes...');
      this.selectedSizes = [...this.availableSizes];
      this.selectedSizes.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
      this.toast.info('Đã chọn tất cả kích cỡ.');
      console.log('selectedSizes after select all:', this.selectedSizes);
    },
    removeSelectedSize(sizeIdToRemove) {
      console.log('Removing selected size with ID:', sizeIdToRemove);
      this.selectedSizes = this.selectedSizes.filter((s) => s.id !== sizeIdToRemove);
      this.toast.info('Đã xóa một kích cỡ khỏi danh sách chọn.');
      console.log('selectedSizes after removing selected size:', this.selectedSizes);
    },
    confirmSizes() {
      this.showSizeModal = false;
    },
    closeSizeModal() {
      this.showSizeModal = false;
    },
    // --- Image Upload Modal Methods ---
    openImageUploadModal(index) {
      this.currentVariationIndex = index;
      this.newImageUrl = ''; // Reset new image URL input

      // Set showImageUploadModal to true first to render the modal content
      this.showImageUploadModal = true;

      // Use $nextTick to ensure the DOM is updated before trying to access $refs.fileInput
      this.$nextTick(() => {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''; // Clear file input
        } else {
          console.warn('fileInput ref is not available yet.');
        }
      });

      this.selectedImageForVariationId = null; // Reset representative selection for variation

      // Lấy ảnh hiện tại của biến thể
      const currentVariationImages = this.productVariations[index].images;

      // Khởi tạo allImagesList từ các ảnh đã được gán cho biến thể
      const assignedImages = currentVariationImages.map(img => ({
        id: img.id,
        url: img.url,
        file: null, // Ảnh đã có URL không có file thô
        selected: true, // Mặc định chọn các ảnh đã gán
        hover: false,
        needsUpload: false, // Ảnh đã có URL không cần upload lại
        laAnhDaiDien: img.laAnhDaiDien || false, // Giữ trạng thái ảnh đại diện
      }));

      // Thêm các ảnh đã tải lên trong phiên hiện tại (chưa được gán vào biến thể nào)
      // Lọc bỏ những ảnh đã có trong assignedImages để tránh trùng lặp
      const cachedImages = this.uploadedImagesCache.filter(
        (cacheImg) => !assignedImages.some((assignedImg) => assignedImg.url === cacheImg.url)
      ).map(img => ({...img, selected: false})); // Mặc định không chọn ảnh từ cache

      this.allImagesList = [...assignedImages, ...cachedImages];

      // Đặt selectedImageForVariationId dựa trên ảnh đại diện hiện có
      const representativeImage = assignedImages.find(img => img.laAnhDaiDien);
      this.selectedImageForVariationId = representativeImage ? representativeImage.id : null;
    },
    closeImageUploadModal() {
      this.showImageUploadModal = false
      this.currentVariationIndex = null
      this.newImageUrl = ''
      // Không cần clear file input ở đây nữa vì nó sẽ được clear khi modal mở lại
      this.selectedImageForVariationId = null; // Reset representative selection
    },
    handleFileUpload(event) {
      const files = event.target.files
      if (files.length === 0) return

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage = {
            id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9), // Unique ID for frontend management
            url: e.target.result, // Data URL for preview
            file: file, // Store the actual file object for backend upload
            selected: true, // Auto-select uploaded images
            hover: false,
            needsUpload: true, // Mark as needing upload to backend
            laAnhDaiDien: false, // Mặc định không phải ảnh đại diện
          }
          // Thêm vào allImagesList và cache
          this.allImagesList.push(newImage)
          this.uploadedImagesCache.push(newImage);
        }
        reader.readAsDataURL(file)
      }
      this.toast.success(`Đã tải lên ${files.length} ảnh để xem trước.`)
    },
    addImageUrl() {
      if (!this.newImageUrl) {
        this.toast.error('Vui lòng nhập URL ảnh.')
        return
      }
      // // Basic URL validation
      // if (!/^https?:\/\/.+\.(jpg|png|gif|jpeg)$/i.test(this.newImageUrl)) { // Added .jpeg
      //   this.toast.error('URL ảnh không hợp lệ. Chỉ chấp nhận .jpg, .png, .gif, .jpeg.')
      //   return
      // }
      if (this.allImagesList.some((img) => img.url === this.newImageUrl)) {
        this.toast.warning('Ảnh này đã tồn tại trong danh sách.')
        return
      }

      const newImage = {
        id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9), // Temporary ID for frontend
        url: this.newImageUrl, // Actual URL
        file: null, // No file object for URL images
        selected: true,
        hover: false,
        needsUpload: false, // Mark as not needing upload
        laAnhDaiDien: false, // Mặc định không phải ảnh đại diện
      }
      this.allImagesList.push(newImage)
      this.newImageUrl = ''
      this.toast.success('Đã thêm ảnh từ URL.')
    },
    toggleImageSelection(imageId) {
      const image = this.allImagesList.find((img) => img.id === imageId)
      if (image) {
        image.selected = !image.selected;
        // Nếu bỏ chọn ảnh đại diện biến thể, reset selectedImageForVariationId
        if (this.selectedImageForVariationId === image.id && !image.selected) {
            this.selectedImageForVariationId = null;
            image.laAnhDaiDien = false; // Đảm bảo cờ cũng được reset
        }
        // Nếu bỏ chọn ảnh chính sản phẩm, reset selectedProductMainImageUrl
        if (this.selectedProductMainImageUrl === image.url && !image.selected) {
            this.selectedProductMainImageUrl = null;
        }
      }
    },
    markAsRepresentative(imageId) {
        // Đảm bảo ảnh đó được chọn trước khi đặt làm đại diện
        const imageToMark = this.allImagesList.find(img => img.id === imageId);
        if (imageToMark && !imageToMark.selected) {
            imageToMark.selected = true; // Tự động chọn nếu chưa được chọn
        }

        this.allImagesList.forEach(img => {
            img.laAnhDaiDien = (img.id === imageId);
        });
        this.selectedImageForVariationId = imageId; // Cập nhật v-model của radio
        this.toast.info('Đã đặt ảnh đại diện cho biến thể.');
    },
    selectProductMainImage(imageUrl) {
        // Đảm bảo ảnh đó được chọn trước khi đặt làm ảnh chính
        const imageToSelect = this.allImagesList.find(img => img.url === imageUrl);
        if (imageToSelect && !imageToSelect.selected) {
            imageToSelect.selected = true;
        }

        // Bỏ chọn các ảnh khác nếu có
        this.allImagesList.forEach(img => {
            if (img.url !== imageUrl) {
                img.selected = false;
            }
        });

        this.selectedProductMainImageUrl = imageUrl; // Gán URL ảnh chính
        this.toast.info('Đã chọn ảnh đại diện cho sản phẩm chính.');
    },
    deleteImage(imageId) {
      if (confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) {
        const deletedImage = this.allImagesList.find(img => img.id === imageId);

        this.allImagesList = this.allImagesList.filter((img) => img.id !== imageId)
        // Xóa khỏi cache cũng
        this.uploadedImagesCache = this.uploadedImagesCache.filter((img) => img.id !== imageId);

        // Nếu ảnh bị xóa là ảnh đại diện biến thể, reset selectedImageForVariationId
        if (this.selectedImageForVariationId === imageId) {
            this.selectedImageForVariationId = null;
        }
        // Nếu ảnh bị xóa là ảnh đại diện sản phẩm chính, reset selectedProductMainImageUrl
        if (deletedImage && this.selectedProductMainImageUrl === deletedImage.url) {
            this.selectedProductMainImageUrl = null;
        }
        this.toast.success('Đã xóa ảnh khỏi danh sách.')
      }
    },

    async uploadSingleImage(file, chiTietSpId, laAnhDaiDien) {
      const formData = new FormData();
      formData.append('file', file);

      const anhSanPhamDtoJson = JSON.stringify({
        chiTietSpId: chiTietSpId,
        laAnhDaiDien: laAnhDaiDien,
      });
      formData.append('data', anhSanPhamDtoJson);

      try {
        const response = await axios.post(
          'http://localhost:8080/api/anhSanPhams', // Đã sửa đường dẫn API
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        this.toast.success(`Tải ảnh "${file.name}" thành công!`);
        return response.data; // Trả về AnhSanPhamDTO đã được lưu với ID và URL thực tế
      } catch (err) {
        console.error(`Lỗi khi tải ảnh "${file.name}":`, err.response ? err.response.data : err.message);
        this.toast.error(`Lỗi tải ảnh "${file.name}": ${err.response?.data?.message || err.message}`);
        throw err; // Ném lỗi để submitProduct có thể bắt và xử lý
      }
    },

    // NEW: Function to register an image from a URL (no file upload)
    async registerImageUrl(imageUrl, chiTietSpId, laAnhDaiDien) {
        const anhSanPhamDto = {
            chiTietSpId: chiTietSpId,
            urlAnh: imageUrl,
            laAnhDaiDien: laAnhDaiDien,
        };
        try {
            const response = await axios.post(
                'http://localhost:8080/api/anhSanPhams/add-url', // New API endpoint
                anhSanPhamDto,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            this.toast.success(`Đăng ký ảnh URL "${imageUrl}" thành công!`);
            return response.data; // Trả về AnhSanPhamDTO đã được lưu
        } catch (err) {
            console.error(`Lỗi khi đăng ký ảnh URL "${imageUrl}":`, err.response ? err.response.data : err.message);
            this.toast.error(`Lỗi đăng ký ảnh URL "${imageUrl}": ${err.response?.data?.message || err.message}`);
            throw err;
        }
    },

    confirmImages() {
      // Lọc ra các ảnh được chọn từ allImagesList
      const selectedImagesForVariation = this.allImagesList.filter(img => img.selected);

      // Cập nhật lại trạng thái laAnhDaiDien dựa trên selectedImageForVariationId
      const finalImages = selectedImagesForVariation.map(img => ({
          ...img,
          laAnhDaiDien: (img.id === this.selectedImageForVariationId),
      }));

      // Lấy màu sắc của biến thể hiện tại
      const currentVariationColorId = this.productVariations[this.currentVariationIndex].colorId;

      // Đồng bộ ảnh cho tất cả các biến thể có cùng màu sắc
      this.productVariations.forEach(variation => {
          if (variation.colorId === currentVariationColorId) {
              // Gán cùng một mảng ảnh cho các biến thể cùng màu
              // Tạo bản sao sâu để tránh tham chiếu trực tiếp và cho phép thay đổi độc lập sau này nếu cần
              variation.images = JSON.parse(JSON.stringify(finalImages));
          }
      });

      this.toast.success('Đã xác nhận và đồng bộ ảnh cho các biến thể sản phẩm cùng màu.');
      this.closeImageUploadModal();
    },

    // --- Validation Methods ---
    validateTenSanPham() {
      this.isTenSanPhamValid = this.product.tenSanPham.trim().length > 0
    },
    validateThuongHieu() {
      this.isThuongHieuValid = this.product.thuongHieu !== '' // Kiểm tra giá trị đã chọn
    },
    validateDanhMuc() {
      this.isDanhMucValid = this.product.danhMuc !== '' // Kiểm tra giá trị đã chọn
    },
    validateChatLieu() {
      this.isChatLieuValid = this.product.chatLieu !== '' // Kiểm tra giá trị đã chọn
    },
    isQuantityValid(index) {
      const quantity = this.productVariations[index].quantity
      return quantity >= 0 && Number.isInteger(quantity)
    },
    validateQuantity(index) {
      // Re-evaluate validation on input
      this.isQuantityValid(index)
    },
    isPriceValid(index) {
      const price = this.productVariations[index].price
      return price >= 0
    },
    validatePrice(index) {
      // Re-evaluate validation on input
      this.isPriceValid(index)
    },
    isImagesValid(index) {
      // Kiểm tra xem biến thể có ảnh nào được chọn không
      return this.productVariations[index].images.length > 0;
    },

    // --- Product Variation Management ---
    findExistingVariation(color, size) {
      // Tìm biến thể hiện có để giữ lại số lượng và giá nếu đã nhập
      // Phương thức này giờ đây tìm kiếm trong data property productVariations
      return this.productVariations.find(
        (v) => v.colorId === color.id && v.sizeId === size.id,
      )
    },

    // --- Bulk Edit Methods ---
    applyBulkPrice() {
      if (this.bulkPrice < 0) {
        this.toast.error('Giá bán chung phải lớn hơn hoặc bằng 0.');
        return;
      }
      this.productVariations.forEach(variation => {
        if (this.bulkApplyColorId === '' || variation.colorId === this.bulkApplyColorId) {
          variation.price = this.bulkPrice;
        }
      });
      this.toast.success('Đã áp dụng giá bán chung.');
    },
    applyBulkQuantity() {
      if (this.bulkQuantity < 0 || !Number.isInteger(this.bulkQuantity)) {
        this.toast.error('Số lượng chung phải là số nguyên không âm.');
        return;
      }
      this.productVariations.forEach(variation => {
        if (this.bulkApplyColorId === '' || variation.colorId === this.bulkApplyColorId) {
          variation.quantity = this.bulkQuantity;
        }
      });
      this.toast.success('Đã áp dụng số lượng chung.');
    },

    // --- Form Submission ---
    async submitProduct() {
      this.validateTenSanPham()
      this.validateThuongHieu()
      this.validateDanhMuc()
      this.validateChatLieu()
      this.isSelectedColorsValid = this.selectedColors.length > 0

      // Validate all variations
      let allVariationsValid = true
      if (this.productVariations.length === 0) {
        allVariationsValid = false; // Không có biến thể nào được tạo
        this.toast.error('Vui lòng chọn màu sắc và kích cỡ để tạo biến thể sản phẩm.');
        return; // Dừng lại nếu không có biến thể
      }

      for (let i = 0; i < this.productVariations.length; i++) {
        if (
          !this.isQuantityValid(i) ||
          !this.isPriceValid(i) ||
          !this.isImagesValid(i)
        ) {
          allVariationsValid = false
          break
        }
      }

      // Thêm kiểm tra validation cho ảnh đại diện sản phẩm chính
      if (!this.selectedProductMainImageUrl) {
          this.toast.error('Vui lòng chọn ảnh đại diện cho sản phẩm chính trong modal ảnh.');
          return;
      }

      if (
        !this.isTenSanPhamValid ||
        !this.isThuongHieuValid ||
        !this.isDanhMucValid ||
        !this.isChatLieuValid ||
        !this.isSelectedColorsValid ||
        !allVariationsValid ||
        this.product.idTrangThai === null // NEW: Validate main product status
      ) {
        this.toast.error('Vui lòng điền đầy đủ và chính xác tất cả các trường và thông tin biến thể sản phẩm.')
        return
      }

      this.isSubmitting = true; // Bắt đầu trạng thái submit

      try {
        // Find the status ID for "dang_kinh_doanh" (ID 3) and "het_hang" (ID 5)
        const dangKinhDoanhStatus = this.statusesList.find(s => s.id === 3);
        const hetHangStatus = this.statusesList.find(s => s.id === 5);

        if (!dangKinhDoanhStatus || !hetHangStatus) {
            this.toast.error('Không tìm thấy ID trạng thái "Đang kinh doanh" (ID 3) hoặc "Hết hàng" (ID 5). Vui lòng kiểm tra dữ liệu trạng thái trong DB.');
            this.isSubmitting = false;
            return;
        }

        const productDetailsForBackend = this.productVariations.map((variation) => {
            // Tìm đối tượng màu đầy đủ từ availableColors để lấy maMauSac
            const fullColor = this.availableColors.find(c => c.id === variation.colorId);
            const fullSize = this.availableSizes.find(s => s.id === variation.sizeId); // Lấy full size object

            return {
              soLuongTonKho: variation.quantity,
              moTaChiTiet: "", // Có thể thêm trường này vào form nếu cần
              giaNhap: variation.price, // Giả định giá nhập = giá bán nếu không có trường riêng
              giaBan: variation.price,
              maCtsp: `CTSP_${fullColor.maMauSac}_${fullSize.maKichCo}_${Date.now()}`, // Tạo mã CTSP duy nhất
              ngayNhap: new Date().toISOString().slice(0, 19), // Format ISO 8601
              // NEW: Gửi ID trạng thái cho biến thể (ID 3 nếu có hàng, ID 5 nếu hết hàng)
              idTrangThaiRieng: variation.quantity > 0 ? dangKinhDoanhStatus.id : hetHangStatus.id,
              chatLieu: this.product.chatLieu, // ID của chất liệu
              mauSac: variation.colorId, // ID của màu sắc
              kichCo: variation.sizeId, // ID của kích cỡ
              // sanPham sẽ được Backend tự gán
              // images sẽ được tải lên riêng sau khi có chiTietSpId
            };
          });

        const productData = {
          tenSanPham: this.product.tenSanPham,
          maSanPham: `SP_${Date.now()}`, // Tự động tạo mã sản phẩm
          moTaSanPham: this.product.moTaSanPham,
          urlAnhDaiDien: this.selectedProductMainImageUrl, // GÁN ẢNH ĐẠI DIỆN SẢN PHẨM CHÍNH TẠY ĐÂY
          quocGiaSanXuat: "Việt Nam", // Có thể thêm trường này vào form
          idTrangThai: this.product.idTrangThai, // NEW: Gửi ID trạng thái cho sản phẩm chính (đã được lọc 3,4,5)
          idDanhMuc: this.product.danhMuc, // Corrected: Use idDanhMuc
          idThuongHieu: this.product.thuongHieu, // Corrected: Use idThuongHieu
          productDetails: productDetailsForBackend,
        }

        console.log('Dữ liệu sản phẩm gửi đi:', productData)

        // 1. Gửi dữ liệu sản phẩm chính và các chi tiết sản phẩm (không kèm ảnh)
        const productResponse = await axios.post('http://localhost:8080/api/san-phams', productData)
        this.toast.success('Thêm sản phẩm thành công! Đang tải lên ảnh...')
        console.log('Sản phẩm đã được thêm:', productResponse.data)

        // 2. Tải lên ảnh cho từng chi tiết sản phẩm
        if (productResponse.data && productResponse.data.productDetails) {
            for (const backendDetail of productResponse.data.productDetails) {
                // Tìm biến thể Frontend tương ứng dựa trên maMauSac và maKichCo
                const frontendVariation = this.productVariations.find(v =>
                    v.maMauSac === backendDetail.maMauSac && v.maKichCo === backendDetail.maKichCo
                );

                if (frontendVariation && backendDetail.id) {
                    const imagesToProcess = frontendVariation.images;
                    let processedImagesForCurrentVariation = [];

                    for (const image of imagesToProcess) {
                        try {
                            if (image.needsUpload && image.file) {
                                // Tải lên ảnh file thô
                                const uploadedAnhSanPham = await this.uploadSingleImage(
                                    image.file,
                                    backendDetail.id, // Sử dụng chiTietSpId thực tế từ Backend
                                    image.laAnhDaiDien
                                );
                                processedImagesForCurrentVariation.push({
                                    id: uploadedAnhSanPham.id,
                                    url: uploadedAnhSanPham.urlAnh,
                                    laAnhDaiDien: uploadedAnhSanPham.laAnhDaiDien,
                                });
                            } else if (!image.needsUpload && image.url && String(image.id).startsWith('temp_')) {
                                // Đăng ký ảnh từ URL (nếu là URL mới thêm từ FE)
                                const registeredAnhSanPham = await this.registerImageUrl(
                                    image.url,
                                    backendDetail.id,
                                    image.laAnhDaiDien
                                );
                                processedImagesForCurrentVariation.push({
                                    id: registeredAnhSanPham.id,
                                    url: registeredAnhSanPham.urlAnh,
                                    laAnhDaiDien: registeredAnhSanPham.laAnhDaiDien,
                                });
                            } else if (image.id && !String(image.id).startsWith('temp_')) {
                                // Nếu ảnh đã có ID từ BE (tức là đã được lưu trước đó)
                                // Chỉ cần đảm bảo nó được thêm vào danh sách processedImagesForCurrentVariation
                                processedImagesForCurrentVariation.push({
                                    id: image.id,
                                    url: image.url,
                                    laAnhDaiDien: image.laAnhDaiDien,
                                });
                            } else {
                                console.warn(`Ảnh với URL ${image.url} không được tải lên/liên kết vì không có file và không có ID từ BE.`);
                            }
                        } catch (uploadError) {
                            console.error('Lỗi khi tải/đăng ký ảnh cho biến thể:', uploadError);
                            this.toast.error(`Không thể tải/đăng ký ảnh cho biến thể ${frontendVariation.colorDisplayName} - ${frontendVariation.size}`);
                        }
                    }
                    // Cập nhật lại danh sách ảnh của biến thể Frontend sau khi tải lên
                    // Đảm bảo cập nhật trực tiếp vào đối tượng trong productVariations
                    const variationIndex = this.productVariations.findIndex(v => v.maMauSac === backendDetail.maMauSac && v.maKichCo === backendDetail.maKichCo);
                    if (variationIndex !== -1) {
                        this.productVariations[variationIndex].images = processedImagesForCurrentVariation;
                    }

                } else {
                    console.warn(`Không tìm thấy chiTietSpId hoặc biến thể Frontend cho backendDetail:`, backendDetail);
                }
            }
        }
        this.toast.success('Tất cả ảnh đã được tải lên thành công (hoặc bỏ qua các ảnh lỗi)!');
        this.resetForm() // Reset form sau khi tất cả đã thành công
      } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error.response ? error.response.data : error.message)
        let errorMessage = 'Lỗi khi thêm sản phẩm. Vui lòng kiểm tra lại thông tin.';
        if (error.response && error.response.data) {
            // Kiểm tra nếu có lỗi cụ thể từ Backend
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data; // Backend trả về chuỗi lỗi
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message; // Backend trả về đối tượng có trường message
            }
        }
        this.toast.error(errorMessage);
      } finally {
        this.isSubmitting = false; // Kết thúc trạng thái submit
      }
    },

    resetForm() {
      this.product = {
        tenSanPham: '',
        moTaSanPham: '',
        thuongHieu: '',
        chatLieu: '',
        danhMuc: '',
        idTrangThai: null, // Reset về null hoặc ID mặc định
        selectedMauSacId: null,
      }
      this.selectedColors = []
      this.selectedSizes = []
      this.generateProductVariations(); // Gọi lại để reset productVariations
      this.newSizeInput = ''
      this.newImageUrl = ''
      this.allImagesList = [] // Clear all loaded images
      this.uploadedImagesCache = []; // Clear the cache
      // $refs.fileInput.value = ''; // No need to clear here, it's done in openImageUploadModal
      this.selectedImageForVariationId = null; // Reset representative selection
      this.selectedProductMainImageUrl = null; // Reset ảnh đại diện sản phẩm chính
      this.isTenSanPhamValid = true
      this.isThuongHieuValid = true
      this.isDanhMucValid = true
      this.isChatLieuValid = true
      this.isSelectedColorsValid = true
      this.bulkPrice = 0; // Reset bulk price
      this.bulkQuantity = 0; // Reset bulk quantity
      this.bulkApplyColorId = ''; // Reset bulk apply color
      this.toast.info('Form đã được reset.')
    },

    removeVariation(index) {
      if (confirm('Bạn có chắc chắn muốn xóa biến thể sản phẩm này không?')) {
        // Xóa biến thể khỏi productVariations
        this.productVariations.splice(index, 1);
        this.toast.info('Đã xóa biến thể sản phẩm.');

        // Cập nhật lại selectedColors và selectedSizes nếu cần thiết
        // (Ví dụ: nếu xóa biến thể cuối cùng của một màu/kích cỡ, màu/kích cỡ đó có thể không còn được chọn)
        // Tuy nhiên, với logic hiện tại, việc xóa một biến thể không tự động bỏ chọn màu/kích cỡ
        // mà chỉ loại bỏ tổ hợp đó. Nếu muốn bỏ chọn màu/kích cỡ khi không còn biến thể nào sử dụng,
        // cần thêm logic phức tạp hơn ở đây.
      }
    },

    cancelAdd() {
      if (confirm('Bạn có chắc chắn muốn hủy bỏ việc thêm sản phẩm này không?')) {
        this.resetForm()
        // Có thể chuyển hướng người dùng về trang danh sách sản phẩm
        // this.$router.push('/products');
      }
    },
  },
  mounted() {
    this.fetchInitialData()
    // Khởi tạo màu sắc ban đầu cho color picker
    // Wrap in $nextTick to ensure DOM is ready and component instance is fully reactive
    this.$nextTick(() => {
      // Defensive check before calling updateCurrentColor
      if (typeof this.updateCurrentColor === 'function') {
        this.updateCurrentColor(this.currentColor.hex);
      } else {
        console.error('updateCurrentColor method is not available on this instance in mounted hook.');
      }
    });
  },
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.custom-input {
  border: 1px solid #ced4da;
  border-radius: 0.3rem;
  padding: 0.375rem 0.75rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.custom-input:focus {
  border-color: #8b0000;
  box-shadow: 0 0 0 0.25rem rgba(139, 0, 0, 0.25);
  outline: none;
}

.custom-input.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875em;
  margin-top: 0.25rem;
}

.color-display-area,
.size-display-area,
.image-upload-preview {
  border: 1px dashed #ccc !important;
  border-radius: 0.5rem !important;
  background-color: #f8f9fa;
  padding: 1rem;
}

.color-swatch {
  border: 1px solid #ccc;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-modal .modal-header {
  background-color: #000000;
  color: #ffffff;
}

.color-modal .modal-title,
.color-modal .btn-close {
  color: #ffffff;
}

.preview-box {
  width: 100%;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
}

.color-controls-left,
.color-picker-right {
  min-width: 300px;
}

.color-picker-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.saturation-hue-container {
  display: flex;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  gap: 10px;
}

.saturation-area {
  position: relative;
  flex-grow: 1;
  background-color: #f00; /* Default red hue */
  overflow: hidden;
  border-radius: 5px;
  cursor: crosshair;
  --hue: 0deg; /* Custom property for hue */
  background-image: linear-gradient(to right, #fff, var(--hue, red)),
    linear-gradient(to top, #000, transparent);
  background-blend-mode: multiply;
}

.saturation-white {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, #fff, transparent);
}

.saturation-black {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, #000, transparent);
}

.saturation-pointer {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1.5px #000;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.hue-area {
  position: relative;
  width: 30px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #ff0000,
    #ffff00,
    #00ff00,
    #00ffff,
    #0000ff,
    #ff00ff,
    #ff0000
  );
  border-radius: 5px;
  cursor: ns-resize;
}

.hue-slider {
  position: relative;
  width: 100%;
  height: 100%;
}

.hue-pointer {
  position: absolute;
  left: 0;
  right: 0;
  height: 8px;
  background: #fff;
  border: 1px solid #000;
  border-radius: 2px;
  transform: translateY(-50%);
  pointer-events: none;
}

.color-history .remove-history-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 0;
  font-size: 0.7em;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.color-history .cursor-pointer {
  position: relative;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th,
.custom-table td {
  padding: 8px;
  border: 1px solid #dee2e6;
  text-align: left;
  vertical-align: middle;
}

.custom-table th {
  background-color: #000000;
  color: #ffffff;
  font-weight: bold;
}

.custom-table tbody tr:nth-of-type(odd) {
  background-color: #f8f9fa;
}

.image-preview-thumbnail-container img {
  border: 1px solid #ddd;
}

.image-item {
  position: relative;
  overflow: hidden;
}

.image-item.image-selected {
  border: 2px solid #8b0000 !important; /* Highlight selected images */
}

.image-item.image-representative {
    box-shadow: 0 0 0 3px #28a745; /* Green border for representative image */
}

/* New and updated styles for image overlay and actions */
.image-dimming-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  pointer-events: none; /* Allow clicks to pass through to the parent .image-item */
}

.image-dimming-overlay.active {
  opacity: 1;
}

.image-hidden-checkbox {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  opacity: 0; /* Make it invisible */
  cursor: pointer;
  z-index: 10; /* Ensure it's on top for clicks */
}

.image-checkmark-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #28a745; /* Green checkmark */
  font-size: 1.5rem;
  z-index: 9; /* Below the hidden checkbox but above dimming */
}

.image-radio-group {
    position: absolute;
    bottom: 5px;
    left: 5px;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 2px 5px;
    border-radius: 3px;
    display: flex;
    flex-direction: column; /* Stack radio buttons vertically */
    align-items: flex-start;
    font-size: 0.75rem;
    gap: 2px; /* Small gap between radio items */
}

.image-radio-item {
    display: flex;
    align-items: center;
}

.image-radio-item input[type="radio"] {
    margin-right: 3px;
    /* Adjust size if needed */
    width: 12px;
    height: 12px;
}
.image-radio-item label {
    margin-bottom: 0; /* Remove default margin for labels */
}


.image-actions-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  padding: 5px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  z-index: 8; /* Below checkmark but above dimming */
}

.image-actions-overlay.active {
  opacity: 1;
}


.size-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.size-grid .btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.selected-sizes-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 5.5px;
  background-color: #fcfcfc;
}

.selected-sizes-preview .btn {
  padding: 8px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.selected-sizes-preview .remove-custom-size-btn {
  position: absolute;
  top: -10px !important; /* Adjusted for better visibility */
  right: -10px !important; /* Adjusted for better visibility */
  width: 28px !important; /* Increased size */
  height: 28px !important; /* Increased size */
  border-radius: 50%;
  padding: 0;
  font-size: 1.0em !important; /* Increased font size for the 'x' */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Added subtle shadow */
  transition: all 0.2s ease;
}

.selected-sizes-preview .remove-custom-size-btn:hover {
  transform: scale(1.1);
  background-color: #b22222 !important; /* Darker red on hover */
}
</style>