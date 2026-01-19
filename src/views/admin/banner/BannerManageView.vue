<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="page-header">
          <div class="page-title">首页轮播图</div>
          <div class="page-actions">
            <el-button type="primary" @click="openCreate">新增轮播图</el-button>
            <el-button @click="fetchList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" row-key="id" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="140">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="row.imageUrl"
              fit="cover"
              style="width: 96px; height: 54px; border-radius: 6px"
              preview-teleported
              :preview-src-list="[row.imageUrl]"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="linkUrl" label="跳转链接" min-width="260" show-overflow-tooltip />
        <el-table-column prop="sortNo" label="排序" width="100" />
        <el-table-column prop="enableStatus" label="启用" width="110">
          <template #default="{ row }">
            <el-switch
              :model-value="row.enableStatus === 1"
              @change="(val) => toggleEnable(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" @click="moveUp(row)">上移</el-button>
            <el-button size="small" type="danger" @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-divider />
      <div class="hint">
        <el-text type="info">排序：这里提供“上移”快捷操作；如需拖拽排序，可在后续补充。</el-text>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="图片URL" prop="imageUrl">
          <el-input v-model="form.imageUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="跳转链接" prop="linkUrl">
          <el-input v-model="form.linkUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="排序" prop="sortNo">
          <el-input-number v-model="form.sortNo" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="启用" prop="enableStatus">
          <el-switch v-model="enableSwitch" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createAdminStudioBanner,
  deleteAdminStudioBanner,
  getAdminStudioBanners,
  reorderAdminStudioBanners,
  setAdminStudioBannerEnableStatus,
  updateAdminStudioBanner,
} from '@/api/admin'

const loading = ref(false)
const saving = ref(false)
const list = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('create')
const editingId = ref(null)

const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增轮播图' : '编辑轮播图'))

const formRef = ref(null)
const form = reactive({
  imageUrl: '',
  linkUrl: '',
  sortNo: 0,
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
  imageUrl: [{ required: true, message: '请填写图片URL', trigger: 'blur' }],
  linkUrl: [{ required: true, message: '请填写跳转链接', trigger: 'blur' }],
}

function resetForm() {
  form.imageUrl = ''
  form.linkUrl = ''
  form.sortNo = 0
  form.enableStatus = 1
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getAdminStudioBanners()
    list.value = Array.isArray(res.data?.data) ? res.data.data : []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  editingId.value = row.id
  form.imageUrl = row.imageUrl || ''
  form.linkUrl = row.linkUrl || ''
  form.sortNo = row.sortNo ?? 0
  form.enableStatus = row.enableStatus ?? 1
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (dialogMode.value === 'create') {
        await createAdminStudioBanner({
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl,
          sortNo: form.sortNo,
          enableStatus: form.enableStatus,
        })
        ElMessage.success('已新增')
      } else {
        await updateAdminStudioBanner(editingId.value, {
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl,
          sortNo: form.sortNo,
          enableStatus: form.enableStatus,
        })
        ElMessage.success('已保存')
      }
      dialogVisible.value = false
      await fetchList()
    } finally {
      saving.value = false
    }
  })
}

async function toggleEnable(row, val) {
  await setAdminStudioBannerEnableStatus(row.id, val ? 1 : 0)
  ElMessage.success('已更新启用状态')
  await fetchList()
}

async function removeRow(row) {
  await ElMessageBox.confirm('确认删除该轮播图？', '提示', { type: 'warning' })
  await deleteAdminStudioBanner(row.id)
  ElMessage.success('已删除')
  await fetchList()
}

async function moveUp(row) {
  const idx = list.value.findIndex((x) => x.id === row.id)
  if (idx <= 0) return

  const next = [...list.value]
  ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]

  await reorderAdminStudioBanners(next.map((x) => x.id))
  ElMessage.success('已调整排序')
  await fetchList()
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
.hint {
  display: flex;
  justify-content: flex-end;
}
</style>
