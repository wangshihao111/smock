import axios from "axios";

export function getApiList() {
  return axios.get("/tree");
}

export function getInterceptedList() {
  return axios.get("/intercepted");
}

export function updateInterceptedList(list: string[]) {
  return axios.post("/update-intercept", list);
}

export function deleteHistory(api: string | string[]) {
  return axios.post("/delete-history", { path: api });
}

export function getApiDetail(api: string, reset?: boolean) {
  return axios.get("/api-detail", {
    params: { api, reset },
  });
}

export function saveApiData(data: any) {
  return axios.post("/api-save", data);
}
