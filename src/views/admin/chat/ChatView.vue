<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="page-header">
          <div class="page-title">在线咨询与实时聊天</div>
        </div>
      </template>

      <el-alert
        title="当前仓库未提供 WebSocket 地址与会话/消息接口文档。已预留页面入口。"
        type="warning"
        show-icon
      />

      <el-divider />

      <el-text type="info">待补充：会话列表、消息记录、WebSocket 实时通信、管理员回复。</el-text>
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
</style>
