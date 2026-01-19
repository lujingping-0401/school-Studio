<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="page-header">
          <div class="page-title">产教融合文章</div>
          <div class="page-actions">
            <el-button type="primary" @click="openCreate">新增文章</el-button>
            <el-button @click="fetchPage">刷新</el-button>
          </div>
        </div>
      </template>

      <div class="toolbar">
        <el-input v-model="filters.keyword" placeholder="关键词" clearable style="max-width: 260px" />
        <el-input v-model="filters.tags" placeholder="标签(逗号分隔)" clearable style="max-width: 260px" />
        <el-input v-model="filters.topicId" placeholder="主题ID" clearable style="max-width: 180px" />
        <el-button type="primary" @click="fetchPage">查询</el-button>
      </div>

      <el-table :data="records" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="topicId" label="主题" width="100" />
        <el-table-column prop="title" label="标题" min-width="260" show-overflow-tooltip />
        <el-table-column prop="tags" label="标签" min-width="160" show-overflow-tooltip />
        <el-table-column prop="publishStatus" label="发布" width="110">
          <template #default="{ row }">
            <el-tag :type="row.publishStatus === 1 ? 'success' : 'info'">
              {{ row.publishStatus === 1 ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览" width="100" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="success" @click="togglePublish(row)">
              {{ row.publishStatus === 1 ? '撤销发布' : '发布' }}
            </el-button>
            <el-button size="small" type="danger" @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :total="total"
          :current-page="page"
          :page-size="size"
          :page-sizes="[10, 20, 50]"
          @update:current-page="(p) => (page = p)"
          @update:page-size="(s) => (size = s)"
          @change="fetchPage"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="860px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="主题ID" prop="topicId">
          <el-input-number v-model="form.topicId" :min="1" :step="1" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="tag1,tag2" />
        </el-form-item>
        <el-form-item label="封面URL" prop="coverUrl">
          <el-input v-model="form.coverUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="内容HTML" prop="contentHtml">
          <el-input v-model="form.contentHtml" type="textarea" :rows="12" />
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
  createAdminIeArticle,
  deleteAdminIeArticle,
  getAdminIeArticlesPage,
  setAdminIeArticlePublishStatus,
  updateAdminIeArticle,
} from '@/api/admin'

const loading = ref(false)
const saving = ref(false)

const total = ref(0)
const records = ref([])

const page = ref(1)
const size = ref(10)
const filters = reactive({ keyword: '', tags: '', topicId: '' })

const dialogVisible = ref(false)
const dialogMode = ref('create')
const editingId = ref(null)

const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增文章' : '编辑文章'))

const formRef = ref(null)
const form = reactive({
  topicId: 1,
  title: '',
  tags: '',
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
  topicId: [{ required: true, message: '请填写主题ID', trigger: 'change' }],
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  contentHtml: [{ required: true, message: '请填写内容', trigger: 'blur' }],
}

function resetForm() {
  form.topicId = 1
  form.title = ''
  form.tags = ''
  form.coverUrl = ''
  form.contentHtml = ''
  form.enableStatus = 1
}

async function fetchPage() {
  loading.value = true
  try {
    const res = await getAdminIeArticlesPage({
      page: page.value,
      size: size.value,
      topicId: filters.topicId,
      keyword: filters.keyword,
      tags: filters.tags,
    })
    const data = res.data?.data || {}
    total.value = data.total || 0
    records.value = Array.isArray(data.records) ? data.records : []
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
  form.topicId = Number(row.topicId || 1)
  form.title = row.title || ''
  form.tags = row.tags || ''
  form.coverUrl = row.coverUrl || ''
  form.contentHtml = row.contentHtml || ''
  form.enableStatus = row.enableStatus ?? 1
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = {
        topicId: form.topicId,
        title: form.title,
        tags: form.tags,
        coverUrl: form.coverUrl,
        contentHtml: form.contentHtml,
        publishStatus: 0,
        enableStatus: form.enableStatus,
      }
      if (dialogMode.value === 'create') {
        await createAdminIeArticle(payload)
        ElMessage.success('已创建')
      } else {
        await updateAdminIeArticle(editingId.value, {
          ...payload,
          publishStatus: 1,
        })
        ElMessage.success('已保存')
      }
      dialogVisible.value = false
      await fetchPage()
    } finally {
      saving.value = false
    }
  })
}

async function togglePublish(row) {
  await setAdminIeArticlePublishStatus(row.id, row.publishStatus === 1 ? 0 : 1)
  ElMessage.success('已更新发布状态')
  await fetchPage()
}

async function removeRow(row) {
  await ElMessageBox.confirm('确认删除该文章？', '提示', { type: 'warning' })
  await deleteAdminIeArticle(row.id)
  ElMessage.success('已删除')
  await fetchPage()
}

onMounted(fetchPage)
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
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
