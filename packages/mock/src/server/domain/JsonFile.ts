export interface MockDataItem {
  body?: any
  query?: any
  response: any
}

export interface ApiItem {
  name: string
  desc: string
  method: "POST" | "GET" | "DELETE" | "PUT" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE"
  status: number
  url: string
  responseType?: string // json form-data, text, json, html, xml, javascript, binary
  body?: any
  query?: object
  response: any
  mock_data: MockDataItem[]
  delay?: string | number
}

export interface MockFileContent {
  name: string
  desc: string
  apis: ApiItem[]
}
