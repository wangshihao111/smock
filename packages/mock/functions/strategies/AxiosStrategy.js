import axios from "axios"
import { baseUrl } from '../../assets/js/config';

function getFilteredHeaders(config = {}) {
  const { headers = {} } = config;
  const ret = {};
  for (const key in headers) {
    if (key) {
      ret[key] = headers[key];
    }
  }
  return ret;
}

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
  // console.log(req, _store)
  const requestUrl = `${baseUrl}/__api-proxy`;
  const res = await axios.post(requestUrl, {
    ...(req || {}),
    url: `${_store.state.request.url}${_store.state.request.path}`,
    headers: getFilteredHeaders(req)
  })
  return res
}

const axiosStrategy = (req, store) => {
  if (store.state.postwoman.settings.PROXY_ENABLED) {
    return axiosWithProxy(req, store)
  }
  return axiosWithoutProxy(req, store)
}

export default axiosStrategy
