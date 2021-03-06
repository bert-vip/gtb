/*
 * @Author: bert
 * @Date: 2021-09-03 08:57:48
 * @LastEditTime: 2021-12-22 19:42:46
 * @LastEditors: bert
 * @Description: 新增及编辑
 * @FilePath: /guTengBao/src/utils/request.js
 * 我家门前有两棵树，一棵是枣树，另一棵也是枣树。
 */

import axios from 'axios'
import store from '@/store'
import storage from 'store'
import Qs from 'qs'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000, // 请求超时时间
  withCredentials: false
})

// 异常拦截处理器
const errorHandler = (error) => {
  console.log(error)
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  // if (token) {
  //   config.headers['Access-Token'] = token
  // }
    // console.log(config.url)
    if (config.url === '/project/add' || config.url === '/project/edit' || config.url === '/user/uploadFileImg' || config.url === '/project/getCover') {
  } else {
    config.data = Qs.stringify({ session_id: token, ...config.data })
    // config.data = Qs.stringify({ session_id: token, ...config.data, test: 1 })
  }
  return config
}, errorHandler)

// response interceptor
var flag = true
request.interceptors.response.use((response) => {
  if (response.data.code === 137) {
    if (flag) {
      flag = false
      store.dispatch('Logout').then(() => {
        setTimeout(() => {
          flag = true
          window.location.href = '/e/#/user/login'
          // window.location.reload()
          // this.$router.push({ path: '/' })
          // console.log(window)
        }, 1500)
      })
    }
  }
  return response.data
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
