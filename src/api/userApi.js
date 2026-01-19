import request from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params,
  })
}

// 添加用户
export function saveUser(data) {
  return request({
    url: '/user/save',
    method: 'post',
    data,
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete',
  })
}
