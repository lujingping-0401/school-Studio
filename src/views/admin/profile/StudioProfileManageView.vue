<template>
  <div class="page">
    <CommonCard shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <div class="page-title">工作室简介</div>
          <div class="page-actions">
            <el-button type="primary" plain :icon="Edit" @click="openOverwrite"
              >编辑简介</el-button
            >
            <el-button
              plain
              :icon="Refresh"
              :loading="loading"
              :disabled="loading"
              @click="fetchList"
              >刷新</el-button
            >
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <div v-if="currentProfile" class="profile-detail">
          <div class="profile-header">
            <el-image
              v-if="currentProfile.coverUrl"
              :src="currentProfile.coverUrl"
              fit="cover"
              class="profile-cover"
              :preview-src-list="[currentProfile.coverUrl]"
            />
            <div class="profile-info">
              <h2>{{ currentProfile.title }}</h2>
              <div class="meta">
                <span class="time"
                  >更新时间:
                  {{ formatDateTime(currentProfile.updatedAt) }}</span
                >
              </div>
            </div>
          </div>

          <el-divider content-position="left">简介内容</el-divider>

          <div
            class="profile-content ql-snow"
            v-html="currentProfile.contentHtml"
          ></div>
        </div>

        <el-empty v-else description="暂无简介数据" />
      </div>
    </CommonCard>

    <el-dialog
      v-model="dialogVisible"
      title="编辑当前简介"
      width="960px"
      destroy-on-close
      align-center
      top="5vh"
    >
      <div style="max-height: 70vh; overflow-y: auto; padding-right: 10px">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item label="封面URL" prop="coverUrl">
            <div class="cover-uploader">
              <el-upload
                :http-request="customUploadCover"
                :show-file-list="false"
                accept="image/*"
              >
                <el-button type="primary" plain :icon="Upload"
                  >上传图片</el-button
                >
              </el-upload>
              <el-progress
                v-if="coverProgressVisible"
                :percentage="coverProgress"
                style="max-width: 200px"
              />
              <div class="cover-preview" v-if="form.coverUrl">
                <el-image
                  :src="form.coverUrl"
                  fit="cover"
                  style="width: 120px; height: 68px; border-radius: 6px"
                />
                <el-button text type="danger" @click="form.coverUrl = ''"
                  >移除</el-button
                >
              </div>
            </div>
          </el-form-item>
          <el-form-item label="启用" prop="enableStatus">
            <el-switch v-model="enableSwitch" />
          </el-form-item>
          <el-form-item label="内容" prop="contentHtml">
            <div style="border: 1px solid #ccc; width: 100%">
              <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                style="height: 500px; overflow-y: hidden"
                v-model="form.contentHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button plain :icon="Close" @click="dialogVisible = false"
          >取消</el-button
        >
        <el-button
          type="primary"
          plain
          :icon="Check"
          :loading="saving"
          @click="submit"
          >提交</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
} from "vue";
import { ElMessage } from "element-plus";
import { Check, Close, Edit, Refresh, Upload } from "@element-plus/icons-vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css";
import {
  getAdminStudioProfiles,
  overwriteAdminCurrentStudioProfile,
  uploadAdminImage,
} from "@/api/admin";
import { formatDateTime } from "@/utils/format";

const loading = ref(false);
const saving = ref(false);
const currentProfile = ref(null);

const dialogVisible = ref(false);
const formRef = ref(null);
const form = reactive({
  title: "",
  coverUrl: "",
  contentHtml: "",
  enableStatus: 1,
});

// Cover Upload
const coverProgressVisible = ref(false);
const coverProgress = ref(0);

async function customUploadCover(options) {
  const file = options.file;
  coverProgressVisible.value = true;
  coverProgress.value = 0;
  try {
    const res = await uploadAdminImage(file, (p) => (coverProgress.value = p));
    const url = res.data?.data?.url;
    if (url) {
      form.coverUrl = url;
      ElMessage.success("封面上传成功");
    } else {
      ElMessage.error("上传失败：未返回URL");
    }
  } catch (e) {
    ElMessage.error("上传出错");
  } finally {
    coverProgressVisible.value = false;
  }
}

// Editor
const editorRef = shallowRef();
const mode = "default";
const toolbarConfig = {
  excludeKeys: ["group-video"], // Remove upload video menu
};
const editorConfig = {
  placeholder: "请输入内容...",
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        try {
          const res = await uploadAdminImage(file);
          const url = res.data?.data?.url;
          if (url) {
            insertFn(url, "image", url);
          } else {
            ElMessage.error("图片上传失败");
          }
        } catch (e) {
          console.error(e);
          ElMessage.error("图片上传出错");
        }
      },
    },
  },
};

const handleCreated = (editor) => {
  editorRef.value = editor;
};

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const enableSwitch = computed({
  get() {
    return form.enableStatus === 1;
  },
  set(v) {
    form.enableStatus = v ? 1 : 0;
  },
});

const rules = {
  title: [{ required: true, message: "请填写标题", trigger: "blur" }],
  contentHtml: [{ required: true, message: "请填写内容", trigger: "blur" }],
};

async function fetchList() {
  loading.value = true;
  try {
    const res = await getAdminStudioProfiles();
    const data = res.data?.data;
    // data 是数组，取第一个作为当前简介
    if (Array.isArray(data) && data.length > 0) {
      currentProfile.value = data[0];
    } else {
      currentProfile.value = null;
    }
  } finally {
    loading.value = false;
  }
}

function openOverwrite() {
  if (currentProfile.value) {
    form.title = currentProfile.value.title || "";
    form.coverUrl = currentProfile.value.coverUrl || "";
    form.contentHtml = currentProfile.value.contentHtml || "";
    form.enableStatus = currentProfile.value.enableStatus ?? 1;
  } else {
    form.title = "";
    form.coverUrl = "";
    form.contentHtml = "";
    form.enableStatus = 1;
  }
  dialogVisible.value = true;
}

async function submit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      await overwriteAdminCurrentStudioProfile({
        title: form.title,
        coverUrl: form.coverUrl,
        contentHtml: form.contentHtml,
        enableStatus: form.enableStatus,
      });
      ElMessage.success("已提交");
      dialogVisible.value = false;
      await fetchList();
    } finally {
      saving.value = false;
    }
  });
}

onMounted(fetchList);
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
.profile-detail {
  padding: 0 20px;
}
.profile-header {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.profile-cover {
  width: 240px;
  height: 135px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  flex-shrink: 0;
}
.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.profile-info h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #303133;
}
.meta {
  display: flex;
  align-items: center;
  gap: 16px;
}
.time {
  color: #909399;
  font-size: 13px;
}
.profile-content {
  line-height: 1.6;
  color: #606266;
  min-height: 200px;
}
/* WangEditor content style adjust */
.profile-content :deep(img) {
  max-width: 100%;
}
.cover-uploader {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cover-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
