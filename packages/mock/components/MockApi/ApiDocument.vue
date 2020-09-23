<template>
  <div class="api-document">
    <h2 class="api-title" v-if="apiDef.name">
      <div class="api-title-left">
        {{apiDef.name}} ({{apiDef.url}})
        <span class="api-method">
          <span class="api-method-inner">{{apiDef.method}}</span>
        </span>
      </div>
      <div class="api-title-right">
        <span class="api-test" @click="goTest">测试</span>
      </div>
    </h2>
    <div class="api-desc">{{apiDef.desc}}</div>
    <div class="api-request" v-if="apiDef.query">
      <h3 class="request-title">请求 query</h3>
      <ParamDetail :params="apiDef.query" />
      <AceEditor
        :value="parseJsonString(apiDef.query)"
        lang="json"
        theme="dracula"
        :options="{
          maxLines: '16',
          minLines: '5',
          fontSize: '16px',
          autoScrollEditorIntoView: true,
          showPrintMargin: false,
          useWorker: false,
          readOnly: true
        }"
      />
    </div>
    <div class="api-request" v-if="apiDef.body">
      <h3 class="request-title">请求 body</h3>
      <ParamDetail :params="apiDef.body" />
      <AceEditor
        :value="parseJsonString(apiDef.body)"
        theme="dracula"
        lang="json"
        :options="{
          maxLines: '16',
          minLines: '5',
          fontSize: '16px',
          autoScrollEditorIntoView: true,
          showPrintMargin: false,
          useWorker: false,
          readOnly: true
        }"
      />
    </div>
    <div class="api-request" v-if="apiDef.response && !apiDef.handle">
      <h3 class="request-title">响应 Response</h3>
      <ParamDetail :params="apiDef.response" />
      <!-- <code class="json">{{parseDefObj(apiDef.response)}}</code> -->
      <AceEditor
        :value="parseJsonString(apiDef.response)"
        lang="json"
        theme="dracula"
        :options="{
          maxLines: '16',
          minLines: '5',
          fontSize: '16px',
          autoScrollEditorIntoView: true,
          showPrintMargin: false,
          useWorker: false,
          readOnly: true
        }"
      />
    </div>
    <div v-if="apiDef.handle">
      <h3 class="request-title">响应处理定义</h3>
      <AceEditor
        v-model="apiDef.handle"
        :lang="'javascript'"
        theme="dracula"
        :options="{
          maxLines: '16',
          minLines: '5',
          fontSize: '16px',
          autoScrollEditorIntoView: true,
          showPrintMargin: false,
          useWorker: false,
          readOnly: true
        }"
      />
    </div>
  </div>
</template>

<script>
import hljs from "highlight.js/lib/highlight.js"
import 'highlight.js/styles/atom-one-dark.css'
import AceEditor from "../ui/ace-editor"
import ParamDetail from "./ParamDetail"
import { isArray } from "lodash"
import { mapMutations } from "vuex"
import { baseUrl } from "@/assets/js/config"

export default {
  props: {
    apiDef: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    host: "localhost",
    port: 4000,
  }),
  components: {
    ParamDetail,
    AceEditor,
  },
  mounted() {
    fetch(`${baseUrl}/__api-info`)
      .then(res => res.json())
      .then(res => {
        this.host = res.host
        this.port = res.port
      })
  },
  methods: {
    ...mapMutations(["setState"]),
    parseJsonString(obj) {
      return JSON.stringify(this.parseDefObj(obj), (key, v) => v, 2)
    },
    parseDefObj(obj) {
      let result = {}
      if (obj.type) {
        return String(obj.type)
      }
      if (isArray(obj)) {
        result = [this.parseDefObj(obj[0])]
      } else {
        for (const key in obj) {
          if (isArray(obj[key])) {
            const val = obj[key][0]
            if (val.type) {
              result[key] = [val.type]
            } else {
              const { required, ...rest } = val
              result[key] = [this.parseDefObj(rest)]
            }
          } else if (obj[key].type) {
            result[key] = obj[key].type
          } else {
            const { required, ...rest } = obj[key]
            result[key] = this.parseDefObj(rest)
          }
        }
      }
      return result
    },
    goTest() {
      const { method, url } = this.apiDef
      let port = this.port
      if (!port) {
        port = window.location.port
      }
      this.setState({ attribute: "method", value: method })
      this.setState({ attribute: "url", value: `http://localhost:${port}` })
      this.setState({ attribute: "uri", value: `http://localhost:${port}${url}` })
      this.setState({ attribute: "path", value: url })
      this.$emit("api-test")
    },
  },
  watch: {
    apiDef() {},
  },
}
</script>

<style scoped lang="scss">
@import "@/assets/css/variables.scss";

.api-document {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
  text-align: left;
}
.api-title {
  font-size: $doc-title-font-size;
  color: $doc-title-color;
  font-weight: normal;
  display: flex;
  justify-content: space-between;
  .api-method {
    height: 14px;
    line-height: 14px;
    font-size: 12px;
    display: inline-block;
    padding: 0 4px;
    color: #fff;
    margin-right: 8px;
    background: #48d2a0;
    border-radius: 2px;
    &-inner {
      display: inline-block;
      transform: scale(0.83);
    }
  }

  .api-test {
    display: inline-block;
    margin-left: 24px;
    width: 80px;
    height: 28px;
    line-height: 28px;
    border-radius: 2px;
    background: $primary;
    color: #fff;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      opacity: 0.8;
    }
  }
}
.api-desc {
  /* margin-top: 8px; */
  margin-bottom: 16px;
  font-size: 12px;
  color: #5d5d6b;
}
.api-request pre {
  /* padding: 8px; */
  background: #151617;
}
.api-request pre code {
  line-height: 22px;
  color: #fff;
}
.request-title {
  position: relative;
  margin: 8px 0;
  padding-left: 8px;
  font-size: 14px;
  color: #ffffff;
  line-height: 14px;
  font-weight: normal;
  &:before {
    content: "";
    display: block;
    width: 2px;
    height: 14px;
    background-color: $primary;
    position: absolute;
    left: 0;
    top: calc(50% - 7px);
  }
}
::v-deep {
  .ace_editor {
    border-radius: 0;
    &.ace-dracula {
      background-color: $editor-bg;
      box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.30);
      margin: 0;
    }
    & > .ace_gutter {
      width: 32px !important;
      background-color: #14141A;
      font-size: 12px;
      color: #5D5D6B;
      text-align: right;
      line-height: 24px;
      & > div {
        width: 32px !important;
        .ace_fold-widget {
          margin: 0 -8px 0 -2px;
        }
      }
    }
  }
}
</style>
