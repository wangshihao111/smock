import axios from 'axios'

export function getApiList() {
  return axios.get('/tree');
}