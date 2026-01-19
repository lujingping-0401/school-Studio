<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="page-header">
          <div class="page-title">产教融合主题</div>
          <div class="page-actions">
            <el-button type="primary" @click="openCreate">新增主题</el-button>
            <el-button @click="fetchList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="240" show-overflow-tooltip />
        <el-table-column prop="sortNo" label="排序" width="110" />
        <el-table-column prop="enableStatus" label="启用" width="120">
          <template #default="{ row }">
            <el-switch
              :model-value="row.enableStatus === 1"
              @change="(val) => toggleEnable(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" @click="setSort(row)">排序</el-button>
            <el-button size="small" type="danger" @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
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
  createAdminIeTopic,
  deleteAdminIeTopic,
  getAdminIeTopics,
  reorderAdminIeTopic,
  setAdminIeTopicEnableStatus,
  updateAdminIeTopic,
} from '@/api/admin'

const loading = ref(false)
const saving = ref(false)
const list = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('create')
const editingId = ref(null)

const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增主题' : '编辑主题'))

const formRef = ref(null)
const form = reactive({ name: '', sortNo: 0, enableStatus: 1 })

const enableSwitch = computed({
  get() {
    return form.enableStatus === 1
  },
  set(v) {
    form.enableStatus = v ? 1 : 0
  },
})

const rules = {
  name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
}

function resetForm() {
  form.name = ''
  form.sortNo = 0
  form.enableStatus = 1
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getAdminIeTopics()
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
  form.name = row.name || ''
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
      const payload = { name: form.name, sortNo: form.sortNo, enableStatus: form.enableStatus }
      if (dialogMode.value === 'create') {
        await createAdminIeTopic(payload)
        ElMessage.success('已新增')
      } else {
        await updateAdminIeTopic(editingId.value, payload)
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
  await setAdminIeTopicEnableStatus(row.id, val ? 1 : 0)
  ElMessage.success('已更新启用状态')
  await fetchList()
}

async function setSort(row) {
  const { value } = await ElMessageBox.prompt('输入新的排序号(sortNo)', '排序', {
    inputValue: String(row.sortNo ?? 0),
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入非负整数',
  })
  await reorderAdminIeTopic(row.id, Number(value))
  ElMessage.success('已更新排序')
  await fetchList()
}

async function removeRow(row) {
  await ElMessageBox.confirm('确认删除该主题？', '提示', { type: 'warning' })
  await deleteAdminIeTopic(row.id)
  ElMessage.success('已删除')
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
</style>
