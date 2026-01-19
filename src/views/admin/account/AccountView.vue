<template>
  <div class="page">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <div class="page-title">用户与登录系统</div>
        </div>
      </template>

      <el-alert
        title="当前项目仅接入了 /auth/login（管理端登录）。注册/角色/微信登录接口暂未在工作室文档中提供。"
        type="info"
        show-icon
      />

      <el-divider />

      <el-card shadow="never">
        <template #header>
          <div class="sub-title">占位：用户管理</div>
        </template>
        <el-text type="info">如你们有 Account 的 OpenAPI，我可以把这里补齐为完整的用户 CRUD + 角色管理。</el-text>
      </el-card>
    </el-card>
  </div>
</template>

<script setup></script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-weight: 700;
}
.sub-title {
  font-weight: 600;
}
</style>
