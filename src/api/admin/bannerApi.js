import request from "@/utils/request";

export function getAdminStudioBanners() {
  return request({
    url: "/admin/studio-banner",
    method: "get",
  });
}

export function createAdminStudioBanner(data) {
  return request({
    url: "/admin/studio-banner",
    method: "post",
    data,
  });
}

export function updateAdminStudioBanner(id, data) {
  return request({
    url: `/admin/studio-banner/${id}`,
    method: "put",
    data,
  });
}

export function deleteAdminStudioBanner(id) {
  return request({
    url: `/admin/studio-banner/${id}`,
    method: "delete",
  });
}

export function setAdminStudioBannerEnableStatus(id, enableStatus) {
  return request({
    url: `/admin/studio-banner/${id}/enable`,
    method: "post",
    params: { enableStatus },
  });
}

export function reorderAdminStudioBanners(ids) {
  return request({
    url: "/admin/studio-banner/reorder",
    method: "post",
    data: { ids },
  });
}
