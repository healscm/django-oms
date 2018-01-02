/**
 * Created by Itimor on 2017/7/12.
 */

let CONFIG
const rest_url = 'oms.tb-gaming.local'
const ws_scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'

// if (process.env.NODE_ENV === 'development') {
if (process.env.NODE_ENV === 'production') {
  CONFIG = {
    apiUrl: '',
    super_group: 'OMS_Super_Admin',
    wsurl: ws_scheme + '://' + rest_url + '/ws'
  }
} else {
  CONFIG = {
    apiUrl: 'http://127.0.0.1:8000',
    super_group: 'admin',
    wsurl: ws_scheme + '://127.0.0.1:8000'
  }
}

/*
 接口API根地址
 */
const url = CONFIG.apiUrl

module.exports = {
  apiUrl: CONFIG.apiUrl,
  ws_url: CONFIG.wsurl,

  // 超级管理组
  super_group: CONFIG.super_group,

  // 数据分页限制
  LIMIT: 10,

  // 本地上传到服务器
  uploads: `${url}/api/upload/`,
  uploadurl: 'https://httpbin.org/post',

  // 登录
  login: `${url}/api/api-token-auth/`,
  // login: `${url}/api/api-auth/login/`,
  logout: `${url}/api/api-auth/logout/`,
  changePassword: `${url}/api/changepasswd/`,

  // 主机
  hosts: `${url}/api/hosts/`,
  hostgroups: `${url}/api/hostgroups/`,

  // 用户
  users: `${url}/api/users/`,
  groups: `${url}/api/groups/`,
  roles: `${url}/api/roles/`,

  // 工单
  worktickers: `${url}/api/worktickers/`,
  ticketcomments: `${url}/api/ticketcomments/`,
  ticketenclosures: `${url}/api/ticketenclosures/`,
  tickettypes: `${url}/api/tickettypes/`,

  // 第三支付工单
  platforms: `${url}/api/platforms/`,
  merchants: `${url}/api/merchants/`,
  threepayenclosures: `${url}/api/threepayenclosures/`,
  paychannels: `${url}/api/paychannels/`,
  paychannelnames: `${url}/api/paychannelnames/`,
  threepaycomments: `${url}/api/threepaycomments/`,

  // 权限
  usermenuperms: `${url}/api/usermenuperms/`,
  routerinfo: `${url}/api/routers/`,

  // 菜单
  firstmenus: `${url}/api/firstmenus/`,
  secondmenus: `${url}/api/secondmenus/`,
  menumetas: `${url}/api/menumetas/`,

  // cmdrun
  sendmail: `${url}/api/sendmail/`,
  sendmessage: `${url}/api/sendmessage/`,

  // 知识收集平台
  wikis: `${url}/api/wikis/`
}
