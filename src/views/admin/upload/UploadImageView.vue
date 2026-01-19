<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="page-header">
          <div class="page-title">图片上传</div>
        </div>
      </template>

      <el-upload
        :http-request="customUpload"
        :show-file-list="false"
        accept="image/*"
      >
        <el-button type="primary">选择图片</el-button>
      </el-upload>

      <el-divider />

      <el-progress v-if="progressVisible" :percentage="progress" />

      <div v-if="imageUrl" class="preview">
        <el-image :src="imageUrl" fit="contain" style="max-width: 520px" />
        <div class="url">
          <el-input v-model="imageUrl" readonly />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadAdminImage } from '@/api/admin'

const progressVisible = ref(false)
const progress = ref(0)
const imageUrl = ref('')

async function customUpload(options) {
  const file = options.file
  progressVisible.value = true
  progress.value = 0
  imageUrl.value = ''

  try {
    const res = await uploadAdminImage(file, (p) => {
      progress.value = p
    })

    const url = res.data?.data?.url
    if (url) {
      imageUrl.value = url
      ElMessage.success('上传成功')
      options.onSuccess(res)
    } else {
      ElMessage.error('上传失败：未返回url')
      options.onError(new Error('missing url'))
    }
  } catch (e) {
    options.onError(e)
  } finally {
    progressVisible.value = false
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-weight: 700;
}
.preview {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}
.url {
  max-width: 520px;
}
</style>
