import axios from 'axios'
const baseURL = 'https://api.chameleon.exchange'

const http = axios.create({
  baseURL,
})
http.interceptors.request.use((config) => {
  const { intercept = true } = config
  if (!intercept) return config
  // const token = localStorage.getItem('token')
  // if (token) config.headers.authorization = `Bearer ${token}`
  return config
})
export default http
