import axios from "axios"
import { baseUrl } from '../../assets/js/config';

const axiosWithProxy = async (req, { state }) => {
  const { data } = await axios.post(
    state.postwoman.settings.PROXY_URL || "https://postwoman.apollosoftware.xyz/",
    req
  )
  return data
}

const axiosWithoutProxy = async (req, _store) => {
  // console.log(req)
  // const res = await axios(req)
  const requestUrl = `${baseUrl}/__api-proxy`;
  const res = await axios.post(requestUrl, req)
  return res
}

const axiosStrategy = (req, store) => {
  if (store.state.postwoman.settings.PROXY_ENABLED) {
    return axiosWithProxy(req, store)
  }
  return axiosWithoutProxy(req, store)
}

export default axiosStrategy
