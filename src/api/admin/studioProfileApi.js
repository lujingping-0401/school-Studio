import request from '@/utils/request'

export function getAdminStudioProfiles() {
  return request({
    url: '/admin/studio-profile',
    method: 'get',
  })
}

export function overwriteAdminCurrentStudioProfile(data) {
  return request({
    url: '/admin/studio-profile/current',
    method: 'put',
    data,
  })
}
