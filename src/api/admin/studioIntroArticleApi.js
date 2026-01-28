import request from "@/utils/request";

// List (GET /api/v1/admin/studio-intro-article?studioId={studioId})
export function getAdminStudioIntroArticleList(params) {
  return request({
    url: "/admin/studio-intro-article",
    method: "get",
    params,
  });
}

// Detail (GET /api/v1/admin/studio-intro-article/{id})
export function getAdminStudioIntroArticle(id) {
  return request({
    url: `/admin/studio-intro-article/${id}`,
    method: "get",
  });
}

// Create (POST /api/v1/admin/studio-intro-article?studioId={studioId})
export function createAdminStudioIntroArticle(data, studioId) {
  return request({
    url: "/admin/studio-intro-article",
    method: "post",
    params: { studioId },
    data,
  });
}

// Update (PUT /api/v1/admin/studio-intro-article/{id})
export function updateAdminStudioIntroArticle(id, data) {
  return request({
    url: `/admin/studio-intro-article/${id}`,
    method: "put",
    data,
  });
}

// Delete (DELETE /api/v1/admin/studio-intro-article/{id})
export function deleteAdminStudioIntroArticle(id) {
  return request({
    url: `/admin/studio-intro-article/${id}`,
    method: "delete",
  });
}

// Enable/Disable (POST /api/v1/admin/studio-intro-article/{id}/enable?enableStatus={0|1})
export function setAdminStudioIntroArticleEnableStatus(id, enableStatus) {
  return request({
    url: `/admin/studio-intro-article/${id}/enable`,
    method: "post",
    params: { enableStatus },
  });
}
