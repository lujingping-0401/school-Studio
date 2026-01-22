<template>
  <div class="page chat-page">
    <CommonCard
      shadow="never"
      class="page-card chat-wrapper"
      body-style="padding: 0; height: 100%; display: flex; overflow: hidden;"
    >
      <!-- 左侧：会话列表 -->
      <div class="session-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title">消息中心</div>
          <div class="sidebar-tabs">
            <div
              v-for="tab in tabs"
              :key="tab.value"
              class="tab-item"
              :class="{ active: currentTab === tab.value }"
              @click="handleTabChange(tab.value)"
            >
              {{ tab.label }}
            </div>
          </div>
        </div>

        <div class="session-list" v-loading="loadingSessions">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="session-item"
            :class="{ active: currentSession?.id === session.id }"
            @click="selectSession(session)"
          >
            <el-badge
              :value="session.unreadCount"
              :hidden="!session.unreadCount || session.unreadCount === 0"
              class="badge-item"
            >
              <el-avatar
                :size="48"
                :src="session.wechatAvatar || defaultAvatar"
              />
            </el-badge>
            <div class="session-info">
              <div class="session-top">
                <span class="user-name">{{
                  session.wechatNickname || "匿名用户"
                }}</span>
                <span class="time">{{
                  formatTime(session.lastMessageSentAt, "YYYY-MM-DD HH:mm")
                }}</span>
              </div>
              <div class="session-bottom">
                <span class="last-msg">{{
                  session.lastMessageContent || "[新会话]"
                }}</span>
                <el-tag
                  size="small"
                  :type="getStatusType(session.status)"
                  effect="plain"
                >
                  {{ getStatusText(session.status) }}
                </el-tag>
              </div>
            </div>
          </div>
          <el-empty v-if="sessions.length === 0" description="暂无会话" />
        </div>
      </div>

      <!-- 右侧：聊天窗口 -->
      <div class="chat-container">
        <template v-if="currentSession">
          <div class="chat-header">
            <div class="header-user">
              <el-avatar
                :size="40"
                :src="currentSession.wechatAvatar || defaultAvatar"
              />
              <div class="user-meta">
                <div class="name">
                  {{ currentSession.wechatNickname || "未知用户" }}
                </div>
              </div>
            </div>
            <div class="header-actions">
              <el-button
                v-if="currentSession.status !== 2"
                type="danger"
                plain
                size="small"
                :icon="CircleClose"
                @click="handleCloseSession"
                >结束会话</el-button
              >
            </div>
          </div>

          <div class="message-list" ref="messageListRef" @scroll="handleScroll">
            <div v-if="hasMoreMessages" class="load-more">
              <el-button
                text
                size="small"
                :loading="loadingMessages"
                @click="fetchMessages(true)"
              >
                加载历史消息
              </el-button>
            </div>

            <template v-for="(msg, index) in messages" :key="msg.id">
              <!-- 对话中间中心显示：每一小时分割一次 -->
              <div v-if="shouldShowDivider(msg, index)" class="message-divider">
                {{ formatTime(msg.sentAt, "YYYY-MM-DD HH:mm:ss") }}
              </div>

              <div
                class="message-wrapper"
                :class="{ 'is-me': msg.senderRole === 'ADMIN' }"
              >
                <el-avatar
                  class="msg-avatar"
                  :size="36"
                  :src="
                    msg.senderRole === 'ADMIN'
                      ? adminAvatar
                      : currentSession.wechatAvatar || defaultAvatar
                  "
                />
                <div class="msg-content-box">
                  <div class="msg-bubble">
                    <template v-if="msg.msgType === 'TEXT'">
                      {{ msg.content }}
                    </template>
                    <template v-else-if="msg.msgType === 'IMAGE'">
                      <el-image
                        :src="msg.content"
                        :preview-src-list="[msg.content]"
                        fit="cover"
                        class="msg-image"
                      />
                    </template>
                  </div>
                  <!-- 气泡下方显示时间 时分秒 + 已读未读 -->
                  <div class="msg-footer">
                    <span class="msg-time">{{
                      formatTime(msg.sentAt, "HH:mm:ss")
                    }}</span>
                    <span
                      v-if="msg.senderRole === 'ADMIN'"
                      class="read-status"
                      :class="{ 'is-read': msg.readStatus === 1 }"
                    >
                      {{ msg.readStatus === 1 ? "已读" : "未读" }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="chat-input" v-if="currentSession.status !== 2">
            <div class="input-tools">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                @change="handleImageUpload"
              >
                <el-button :icon="Picture" circle plain />
              </el-upload>
            </div>
            <div class="input-area">
              <el-input
                v-model="inputText"
                type="textarea"
                :rows="3"
                resize="none"
                placeholder="请输入回复内容..."
                @keyup.enter.exact.prevent="handleSend"
              />
              <div class="input-footer">
                <span class="hint">Enter 发送</span>
                <el-button
                  type="primary"
                  :disabled="!inputText.trim()"
                  @click="handleSend"
                  >发送</el-button
                >
              </div>
            </div>
          </div>
          <div class="session-closed-notice" v-else>该会话已结束</div>
        </template>
        <template v-else>
          <div class="empty-chat">
            <div class="chat-placeholder">
              <el-icon :size="80"><ChatDotRound /></el-icon>
              <p>请选择左侧会话开始交流</p>
            </div>
          </div>
        </template>
      </div>
    </CommonCard>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Picture, CircleClose, ChatDotRound } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";
import {
  getAdminChatSessions,
  getAdminChatMessages,
  sendAdminChatMessage,
  markAdminChatRead,
  closeAdminChatSession,
  uploadAdminImage,
} from "@/api/admin";
import { formatDate } from "@/utils/format";

const userStore = useUserStore();
const defaultAvatar =
  "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
const adminAvatar =
  "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png";

// --- 会话列表控制 ---
const currentTab = ref("");
const tabs = [
  { label: "全部", value: "" },
  { label: "待接待", value: "0" },
  { label: "交流中", value: "1" },
  { label: "已结束", value: "2" },
];
const sessions = ref([]);
const loadingSessions = ref(false);
const currentSession = ref(null);

const fetchSessions = async () => {
  loadingSessions.value = true;
  try {
    const res = await getAdminChatSessions({
      status: currentTab.value,
      page: 1,
      size: 50,
    });
    sessions.value = res.data?.data?.records || [];
  } catch (err) {
    console.error("获取会话失败", err);
  } finally {
    loadingSessions.value = false;
  }
};

const handleTabChange = (val) => {
  currentTab.value = val;
  fetchSessions();
};

const selectSession = async (session) => {
  if (currentSession.value?.id === session.id) return;
  currentSession.value = session;
  messages.value = [];
  msgPage.value = 1;
  hasMoreMessages.value = true;
  await fetchMessages();
  scrollToBottom();

  if (session.unreadCount > 0) {
    markAdminChatRead(session.id).then(() => {
      session.unreadCount = 0;
    });
  }
};

// --- 消息处理 ---
const messages = ref([]);
const loadingMessages = ref(false);
const msgPage = ref(1);
const hasMoreMessages = ref(true);
const inputText = ref("");
const messageListRef = ref(null);

const fetchMessages = async (isMore = false) => {
  if (!currentSession.value) return;
  if (isMore) msgPage.value++;

  loadingMessages.value = true;
  try {
    const res = await getAdminChatMessages(currentSession.value.id, {
      page: msgPage.value,
      size: 20,
    });
    const records = res.data?.data?.records || [];

    if (records.length < 20) {
      hasMoreMessages.value = false;
    }

    if (isMore) {
      // 保持滚动位置的技巧：获取旧的高度，加载后对比
      const oldHeight = messageListRef.value?.scrollHeight || 0;
      messages.value = [...records.reverse(), ...messages.value];
      nextTick(() => {
        const newHeight = messageListRef.value?.scrollHeight || 0;
        messageListRef.value.scrollTop = newHeight - oldHeight;
      });
    } else {
      messages.value = records.reverse();
    }
  } catch (err) {
    console.error("获取消息失败", err);
  } finally {
    loadingMessages.value = false;
  }
};

const handleSend = async () => {
  if (!inputText.value.trim() || !currentSession.value) return;

  const content = inputText.value;
  inputText.value = "";

  try {
    const res = await sendAdminChatMessage({
      sessionId: currentSession.value.id,
      msgType: "TEXT",
      content,
    });
    if (res.data?.code === 0 && res.data?.data) {
      handleIncomingMessage(res.data.data);
    }
    // 消息会通过 WebSocket 实时更新，不需要在这里手动 push
    // 但为了体验顺滑，也可以先 push 一个临时的，WebSocket 收到后再替换或去重
  } catch (err) {
    ElMessage.error("发送失败");
  }
};

const handleImageUpload = async (file) => {
  if (!file || !currentSession.value) return;

  try {
    // 1. 使用已有上传接口获取图片 URL
    const res = await uploadAdminImage(file.raw);
    const imageUrl = res.data?.data?.url;
    if (!imageUrl) throw new Error("上传失败");

    // 2. 发送 IMAGE 类型的消息
    const msgRes = await sendAdminChatMessage({
      sessionId: currentSession.value.id,
      msgType: "IMAGE",
      content: imageUrl,
    });
    // 同步更新 UI
    if (msgRes.data?.code === 0 && msgRes.data?.data) {
      handleIncomingMessage(msgRes.data.data);
    }
  } catch (err) {
    console.error(err);
    ElMessage.error("图片发送失败");
  }
};

const handleCloseSession = async () => {
  try {
    await ElMessageBox.confirm("确定要结束本次会话吗？", "提示", {
      type: "warning",
    });
    await closeAdminChatSession(currentSession.value.id);
    ElMessage.success("会话已关闭");
    currentSession.value.status = 2;
    fetchSessions();
  } catch (err) {
    // cancel or error
  }
};

// --- WebSocket 逻辑 ---
const connected = ref(false);
let socket = null;

const initWebSocket = () => {
  const token = userStore.token;
  if (!token) return;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  // 前端通过 ws://<host>:<port>/api/v1/ws?token=<JWT> 认证
  const wsUrl = `${protocol}//${host}/ws?token=${token}`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    connected.value = true;
  };

  socket.onmessage = (event) => {
    try {
      const msgData = JSON.parse(event.data);
      handleIncomingMessage(msgData);
    } catch (e) {
      console.error("解析消息失败", e);
    }
  };

  socket.onclose = () => {
    connected.value = false;
    // 5秒后重连
    setTimeout(() => {
      initWebSocket();
    }, 5000);
  };

  socket.onerror = (err) => {
    console.error("WebSocket 错误", err);
  };
};

const handleIncomingMessage = (msg) => {
  // 1. 如果消息属于当前正在聊天的会话，推入消息列表
  if (currentSession.value && msg.sessionId === currentSession.value.id) {
    // 避免重复推送
    if (!messages.value.some((m) => m.id === msg.id)) {
      messages.value.push(msg);
      scrollToBottom();
      // 自动标为已读
      markAdminChatRead(msg.sessionId);
    }
  }

  // 2. 更新左侧会话列表（置顶、更新最新消息和未读数）
  const sessionIndex = sessions.value.findIndex((s) => s.id === msg.sessionId);
  if (sessionIndex > -1) {
    const session = sessions.value[sessionIndex];
    session.lastMessageContent =
      msg.msgType === "IMAGE" ? "[图片]" : msg.content;
    session.lastMessageSentAt = msg.sentAt;

    // 如果管理员回复，且会话原状态为待接待(0)，自动同步为交流中(1)
    if (msg.senderRole === "ADMIN" && session.status === 0) {
      session.status = 1;
      if (currentSession.value?.id === session.id) {
        currentSession.value.status = 1;
      }
    }

    if (
      currentSession.value?.id !== msg.sessionId &&
      msg.senderRole === "USER"
    ) {
      session.unreadCount = (session.unreadCount || 0) + 1;
    }
    // 将其移动到列表首位
    const [moved] = sessions.value.splice(sessionIndex, 1);
    sessions.value.unshift(moved);
  } else {
    // 如果不在列表中（比如是全新的会话），则重新拉取列表
    fetchSessions();
  }
};

// --- 辅助方法 ---
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

const handleScroll = (e) => {
  // 可以在这里处理自动加载更多，目前已有点击加载
};

const getStatusText = (status) => {
  const map = { 0: "待接待", 1: "交流中", 2: "已结束" };
  return map[status] || "未知";
};

const getStatusType = (status) => {
  const map = { 0: "warning", 1: "success", 2: "info" };
  return map[status] || "info";
};

const formatTime = (time, formatStr = "HH:mm") => {
  if (!time) return "";
  return formatDate(time, formatStr);
};

const shouldShowDivider = (msg, index) => {
  if (index === 0) return true;
  const prevMsg = messages.value[index - 1];
  // 每一小时分割一次
  const currTime = new Date(msg.sentAt).getTime();
  const prevTime = new Date(prevMsg.sentAt).getTime();
  return currTime - prevTime > 60 * 60 * 1000;
};

onMounted(() => {
  fetchSessions();
  initWebSocket();
});

onBeforeUnmount(() => {
  if (socket) {
    socket.close();
  }
});
</script>

<style scoped lang="scss">
.chat-page {
  padding: 0;
}

.chat-wrapper {
  border-radius: 12px;
  background: #fff;
}

.session-sidebar {
  width: 320px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background: #fbfbfb;

  .sidebar-header {
    padding: 20px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;

    .sidebar-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .sidebar-tabs {
      display: flex;
      gap: 12px;

      .tab-item {
        font-size: 13px;
        color: #909399;
        cursor: pointer;
        padding-bottom: 4px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;

        &.active {
          color: var(--el-color-primary);
          border-bottom-color: var(--el-color-primary);
          font-weight: 500;
        }
      }
    }
  }

  .session-list {
    flex: 1;
    overflow-y: auto;

    .session-item {
      padding: 16px 20px;
      display: flex;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 1px solid rgba(0, 0, 0, 0.02);

      &:hover {
        background: #f0f3fa;
      }

      &.active {
        background: #ecf5ff;
        border-right: 3px solid var(--el-color-primary);
      }

      .badge-item {
        flex-shrink: 0;
      }

      .session-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .session-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;

          .user-name {
            font-weight: 500;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .time {
            font-size: 12px;
            color: #c0c4cc;
          }
        }

        .session-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .last-msg {
            font-size: 13px;
            color: #909399;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 8px;
          }
        }
      }
    }
  }
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;

  .chat-header {
    height: 64px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;

    .header-user {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-meta {
        .name {
          font-weight: 600;
          color: #303133;
        }
        .status {
          font-size: 12px;
          color: #909399;
          display: flex;
          align-items: center;
          gap: 4px;

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #c0c4cc;
            &.online {
              background: #67c23a;
            }
          }
        }
      }
    }
  }

  .message-list {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background: #f5f7fa;

    .load-more {
      text-align: center;
      margin-bottom: 16px;
    }

    .message-wrapper {
      margin-bottom: 24px;
      display: flex;
      gap: 12px;

      .msg-avatar {
        flex-shrink: 0;
      }

      .msg-content-box {
        display: flex;
        flex-direction: column;
        max-width: 70%;

        .msg-bubble {
          padding: 10px 14px;
          background: #fff;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
          border-radius: 2px 12px 12px 12px;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-all;
          color: #303133;

          .msg-image {
            max-width: 240px;
            border-radius: 4px;
            cursor: pointer;
            display: block;
          }
        }

        .msg-footer {
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #c0c4cc;

          .read-status {
            &.is-read {
              color: #67c23a;
            }
          }
        }
      }

      &.is-me {
        flex-direction: row-reverse;

        .msg-content-box {
          align-items: flex-end;

          .msg-footer {
            flex-direction: row-reverse;
          }

          .msg-bubble {
            background: var(--el-color-primary);
            color: #ffffff;
            border-radius: 12px 2px 12px 12px;
            box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2);
          }
        }
      }
    }

    .message-divider {
      text-align: center;
      margin: 20px 0;
      font-size: 12px;
      color: #909399;
      background: rgba(0, 0, 0, 0.05);
      display: inline-block;
      padding: 2px 10px;
      border-radius: 4px;
      position: relative;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .chat-input {
    padding: 12px 24px 20px;
    border-top: 1px solid #f0f0f0;

    .input-tools {
      margin-bottom: 8px;
    }

    .input-area {
      position: relative;

      .input-footer {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 12px;

        .hint {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }
  }

  .session-closed-notice {
    padding: 20px;
    text-align: center;
    background: #fdf6ec;
    color: #e6a23c;
    font-size: 14px;
  }

  .empty-chat {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fbfd;

    .chat-placeholder {
      text-align: center;
      color: #c0c4cc;
      p {
        margin-top: 16px;
        font-size: 15px;
      }
    }
  }
}

// 适应小屏幕
@media (max-width: 992px) {
  .session-sidebar {
    width: 240px;
  }
}
</style>
