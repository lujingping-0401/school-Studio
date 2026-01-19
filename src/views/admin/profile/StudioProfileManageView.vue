<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="page-header">
          <div class="page-title">工作室简介</div>
          <div class="page-actions">
            <el-button type="primary" @click="openOverwrite">覆盖当前简介</el-button>
            <el-button @click="fetchList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
        <el-table-column prop="enableStatus" label="启用" width="120">
          <template #default="{ row }">
            <el-tag :type="row.enableStatus === 1 ? 'success' : 'info'">
              {{ row.enableStatus === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" show-overflow-tooltip />
      </el-table>

      <el-divider />
      <el-text type="info">简介内容（概况/师资/成果/荣誉等）建议用富文本 HTML 存储到 contentHtml。</el-text>
    </el-card>

    <el-dialog v-model="dialogVisible" title="覆盖当前简介" width="760px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="封面URL" prop="coverUrl">
          <el-input v-model="form.coverUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="启用" prop="enableStatus">
          <el-switch v-model="enableSwitch" />
        </el-form-item>
        <el-form-item label="内容HTML" prop="contentHtml">
          <el-input v-model="form.contentHtml" type="textarea" :rows="12" placeholder="<p>...</p>" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminStudioProfiles, overwriteAdminCurrentStudioProfile } from '@/api/admin'

const loading = ref(false)
const saving = ref(false)
const list = ref([])

const dialogVisible = ref(false)
const formRef = ref(null)
const form = reactive({
  title: '',
  coverUrl: '',
  contentHtml: '',
  enableStatus: 1,
})

const enableSwitch = computed({
  get() {
    return form.enableStatus === 1
  },
  set(v) {
    form.enableStatus = v ? 1 : 0
  },
})

const rules = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  contentHtml: [{ required: true, message: '请填写内容HTML', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getAdminStudioProfiles()
    list.value = Array.isArray(res.data?.data) ? res.data.data : []
  } finally {
    loading.value = false
  }
}

function openOverwrite() {
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await overwriteAdminCurrentStudioProfile({
        title: form.title,
        coverUrl: form.coverUrl,
        contentHtml: form.contentHtml,
        enableStatus: form.enableStatus,
      })
      ElMessage.success('已提交')
      dialogVisible.value = false
      await fetchList()
    } finally {
      saving.value = false
    }
  })
}

onMounted(fetchList)
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.page-title {
  font-weight: 700;
}
.page-actions {
  display: inline-flex;
  gap: 8px;
}
</style>
