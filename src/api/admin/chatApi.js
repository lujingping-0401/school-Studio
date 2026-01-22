import request from "@/utils/request";

/**
 * 管理端会话分页列表
 */
export function getAdminChatSessions(params) {
  return request({
    url: "/admin/chat-session",
    method: "get",
    params,
  });
}

/**
 * 管理端获取会话消息分页列表
 */
export function getAdminChatMessages(sessionId, params) {
  return request({
    url: `/admin/chat-session/${sessionId}/messages`,
    method: "get",
    params,
  });
}

/**
 * 管理端发送文本或图片消息
 * TEXT: { sessionId, msgType: 'TEXT', content: '...' }
 * IMAGE: { sessionId, msgType: 'IMAGE', content: '<url>' }
 */
export function sendAdminChatMessage(data) {
  return request({
    url: "/admin/chat-message",
    method: "post",
    data,
  });
}

/**
 * 管理端将该会话内“对方发送”的未读消息标为已读
 */
export function markAdminChatRead(sessionId) {
  return request({
    url: `/admin/chat-session/${sessionId}/read`,
    method: "post",
  });
}

/**
 * 管理端关闭会话
 */
export function closeAdminChatSession(sessionId) {
  return request({
    url: `/admin/chat-session/${sessionId}/close`,
    method: "post",
  });
}
