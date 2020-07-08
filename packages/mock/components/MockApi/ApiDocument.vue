<template>
  <div class="api-document">
    <h2 class="api-title" v-if="apiDef.name">
      <span class="api-method">{{apiDef.method}}</span>
      {{apiDef.name}}  ({{apiDef.url}})
      <span class="api-test" @click="goTest">测试</span>
    </h2>
    <div class="api-desc">
      {{apiDef.desc}}
    </div>
    <div class="api-request"  v-if="apiDef.query">
      <h3 class="request-title">
        请求 query
      </h3>
      <ParamDetail :params="apiDef.query"/>
      <pre ref="query">
        <code class="json">{{parseDefObj(apiDef.query)}}</code>
      </pre>
    </div>
    <div class="api-request" v-if="apiDef.body">
      <h3 class="request-title">
        请求 body
      </h3>
      <ParamDetail :params="apiDef.body"/>
      <pre ref="body">
        <code class="json">{{parseDefObj(apiDef.body)}}</code>
      </pre>
    </div>
    <div class="api-request" v-if="apiDef.response && !apiDef.handle">
      <h3 class="request-title">
        响应 Response
      </h3>
      <ParamDetail :params="apiDef.response"/>
      <pre ref="body">
        <code class="json">{{parseDefObj(apiDef.response)}}</code>
      </pre>
    </div>
    <div v-if="apiDef.handle">
      <h3 class="request-title">
        响应处理定义
      </h3>
      <AceEditor
        v-model="apiDef.handle"
        :lang="'javascript'"
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
import hljs from 'highlight.js/lib/highlight.js';
// import 'highlight.js/styles/atom-one-dark.css'
import AceEditor from "../ui/ace-editor"
import ParamDetail from './ParamDetail';
import { isArray } from 'lodash';
import { mapMutations } from 'vuex'
import {baseUrl} from '@/assets/js/config'

export default {
  props: {
    apiDef: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    host: 'localhost',
    port: 4000,
  }),
  components: {
    ParamDetail,
    AceEditor
  },
  mounted() {
    fetch(`${baseUrl}/__api-info`).then(res => res.json()).then(res => {
      this.host = res.host;
      this.port = res.port;
    })
  },
  methods: {
    ...mapMutations(['setState']),
    parseDefObj(obj) {
      let result = {};
      if (obj.type) {
        return String(obj.type);
      }
      if (isArray(obj)) {
        result = [this.parseDefObj(obj[0])]
      } else {
        for (const key in obj) {
          if (isArray(obj[key])) {
            const val = obj[key][0];
            if (val.type) {
              result[key] = [val.type]
            } else {
              const {required, ...rest} = val;
              result[key] = [this.parseDefObj(rest)]
            }
          } else if (obj[key].type) {
            result[key] = obj[key].type;
          } else {
            const {required, ...rest} = obj[key];
            result[key] = this.parseDefObj(rest);
          }
        }
      }
      return result;
    },
    goTest() {
      const { method, url } = this.apiDef;
      let port = this.port;
      if (!port) {
        port = window.location.port;
      }
      this.setState({attribute: 'method', value: method});
      this.setState({attribute: 'url', value: `http://localhost:${port}`});
      this.setState({attribute: 'uri', value: `http://localhost:${port}${url}`});
      this.setState({attribute: 'path', value: url});
      this.$emit('api-test')
    }
  },
  watch: {
    apiDef() {
    }
  }
}
</script>

<style scoped>
.api-document {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
  text-align: left;
  background: rgba(255,255,255,0.8);
}
.api-title {
  font-size: 16px;
  color: #5573f8;
  font-weight: 400;
}
.api-title .api-method {
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  display: inline-block;
  padding: 0 12px;
  background: rgb(139, 187, 9);
  color: #fff;
  margin-right: 8px;
}
.api-title .api-test {
  display: inline-block;
  margin-left: 24px;
  width: 60px;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  background: #0c8de2;
  color: #fff;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  transition: all .3s;
}
.api-title .api-test:hover {
  opacity: 0.8;
}
.api-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
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
  margin: 8px 0;
  color: #0c8de2;
}
</style>
