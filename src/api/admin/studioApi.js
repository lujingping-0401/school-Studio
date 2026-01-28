import request from "@/utils/request";

/**
 * 获取所有工作室
 */
export function getAdminStudios() {
  return request({
    url: "/admin/studios",
    method: "get",
  });
}

/**
 * 创建工作室
 */
export function createAdminStudio(data) {
  return request({
    url: "/admin/studios",
    method: "post",
    data,
  });
}

/**
 * 更新工作室
 */
export function updateAdminStudio(id, data) {
  return request({
    url: `/admin/studios/${id}`,
    method: "put",
    data,
  });
}

/**
 * 删除工作室
 */
export function deleteAdminStudio(id) {
  return request({
    url: `/admin/studios/${id}`,
    method: "delete",
  });
}

/**
 * 启用/停用工作室
 * @param {string|number} id
 * @param {number} enableStatus 0 or 1
 */
export function toggleAdminStudioStatus(id, enableStatus) {
  return request({
    url: `/admin/studios/${id}/enable`,
    method: "post",
    params: {
      enableStatus,
    },
  });
}
