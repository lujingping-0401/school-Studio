<template>
  <el-container class="admin-layout">
    <el-header class="admin-header">
      <div class="admin-header__left">
        <div class="admin-brand" @click="goDefault">
          <span class="admin-brand__title">创新工作室管理系统</span>
        </div>
      </div>

      <div class="admin-header__right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="admin-user">
            <el-icon class="admin-user__icon"><User /></el-icon>
            <span class="admin-user__label">管理员</span>
            <el-icon class="admin-user__caret"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="admin-body">
      <el-aside class="admin-aside" :width="asideWidth">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          router
          class="admin-menu"
        >
          <el-menu-item index="/admin/banner">
            <el-icon><Picture /></el-icon>
            <span>轮播图</span>
          </el-menu-item>

          <el-menu-item index="/admin/profile">
            <el-icon><Document /></el-icon>
            <span>工作室简介</span>
          </el-menu-item>

          <el-menu-item index="/admin/news">
            <el-icon><Notification /></el-icon>
            <span>工作动态</span>
          </el-menu-item>

          <el-menu-item index="/admin/account">
            <el-icon><User /></el-icon>
            <span>账号系统</span>
          </el-menu-item>

          <el-menu-item index="/admin/topics">
            <el-icon><Collection /></el-icon>
            <span>产教融合主题</span>
          </el-menu-item>

          <el-menu-item index="/admin/articles">
            <el-icon><Reading /></el-icon>
            <span>产教融合文章</span>
          </el-menu-item>

          <el-menu-item index="/admin/chat">
            <el-icon><ChatDotRound /></el-icon>
            <span>在线咨询</span>
          </el-menu-item>

          <el-menu-item index="/admin/upload">
            <el-icon><Upload /></el-icon>
            <span>图片上传</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  ArrowDown,
  ChatDotRound,
  Collection,
  Document,
  Notification,
  Picture,
  Reading,
  Upload,
  User,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapsed = ref(false)

function syncCollapse() {
  isCollapsed.value = window.innerWidth <= 960
}

onMounted(() => {
  syncCollapse()
  window.addEventListener('resize', syncCollapse)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncCollapse)
})

const asideWidth = computed(() => (isCollapsed.value ? '64px' : '220px'))
const activeMenu = computed(() => route.path)

function goDefault() {
  router.push('/admin/banner')
}

function handleCommand(cmd) {
  if (cmd === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
}

.admin-brand {
  cursor: pointer;
  user-select: none;
}

.admin-brand__title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2d3d;
  letter-spacing: 0.2px;
}

.admin-user {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #303133;
  cursor: pointer;
}

.admin-user__icon {
  font-size: 16px;
}

.admin-user__caret {
  font-size: 12px;
  opacity: 0.7;
}

.admin-body {
  min-height: calc(100vh - 56px);
}

.admin-aside {
  background: #ffffff;
  border-right: 1px solid #ebeef5;
  transition: width 0.2s ease;
}

.admin-menu {
  border-right: none;
  height: 100%;
}

.admin-main {
  padding: 16px;
}
</style>
