import request from "@/utils/request";

export function getAdminStudioProfiles() {
  return request({
    url: "/admin/studio-profile",
    method: "get",
  });
}

export function overwriteAdminCurrentStudioProfile(data, studioId) {
  return request({
    url: "/admin/studio-profile",
    method: "put",
    params: { studioId },
    data,
  });
}
