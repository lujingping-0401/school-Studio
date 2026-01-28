import request from "@/utils/request";

/**
 * 获取用户列表
 * @param {Object} params { page, size, username, role, enableStatus }
 */
export function getAdminSysUsers(params) {
  return request({
    url: "/admin/sys-user",
    method: "get",
    params,
  });
}

/**
 * 创建用户
 * @param {Object} data { username, password, phone, role, studioId }
 */
export function createAdminSysUser(data) {
  return request({
    url: "/admin/sys-user",
    method: "post",
    data,
  });
}

/**
 * 重置用户密码
 * @param {Object} data { userId, password }
 */
export function resetAdminSysUserPassword(data) {
  return request({
    url: "/admin/sys-user/reset-password",
    method: "post",
    data,
  });
}

/**
 * 禁用用户
 * @param {string|number} id
 */
export function disableAdminSysUser(id) {
  return request({
    url: `/admin/sys-user/${id}/disable`,
    method: "post",
  });
}

/**
 * 更新用户信息
 * @param {string|number} id
 * @param {Object} data { phone, role, enableStatus, studioId }
 */
export function updateAdminSysUser(id, data) {
  return request({
    url: `/admin/sys-user/${id}`,
    method: "put",
    data,
  });
}

/**
 * 删除用户
 * @param {string|number} id
 */
export function deleteAdminSysUser(id) {
  return request({
    url: `/admin/sys-user/${id}`,
    method: "delete",
  });
}
