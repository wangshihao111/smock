<template>
  <div class="param-detail">
    <ul class="list" v-if="params">
      <template v-for="item of list">
        <template v-if="item.responseType === 'primitive'">
          <li class="list-item" :key="item.name">
            <h3 class="primitive-title">Primitive</h3>
            <span class="type">类型：<span>{{item.type}}</span></span>
            <span class="required">是否必传：<span :style="{color: item.required ? '#0170fe' : '#999'}">{{ item.required ? "是" : "否" }}</span></span>
            <span class="desc" v-if="item.desc">描述：<span>{{ item.desc }}</span></span>
          </li>
        </template>
        <template v-if="item.responseType === 'array'">
          <li class="list-item" :key="item.name">
            <h3 class="list-item-title">Array</h3>
            <ParamDetail :params="item.child" />
          </li>
        </template>
        <template v-if="item.responseType === 'json'">
          <li class="list-item" :key="item.name" v-if="item.type === 'Object'">
            <span class="name">参数：<span>{{ item.name }}</span></span>
            <span class="type">类型：<span>Object</span></span>
            <span class="required">是否必传：<span :style="{color: item.required ? '#0170fe' : '#999'}">{{ item.required ? "是" : "否" }}</span></span>
            <span class="desc" v-if="item.desc">描述：<span>{{ item.desc }}</span></span>
            <!-- <ParamDetail :params="item.child" /> -->
          </li>
          <li
            class="list-item"
            :key="item.name"
            v-else-if="item.type === 'Array'"
          >
            <span class="name">参数：<span>{{ item.name }}</span></span>
            <span class="type">类型：<span>Array</span></span>
            <span class="desc" v-if="item.desc">描述：<span>{{ item.desc }}</span></span>
            <ParamDetail :params="item.child" />
          </li>
          <li
            class="list-item"
            :key="item.name"
            v-else-if="/^Array<.+>$/.test(item.type)"
          >
            <span class="name">参数：<span>{{ item.name }}</span></span>
            <span class="type">类型：<span>{{item.type}}</span></span>
            <span class="required">是否必传：<span :style="{color: item.required ? '#0170fe' : '#999'}">{{ item.required ? "是" : "否" }}</span></span>
            <span class="desc" v-if="item.desc">描述：<span>{{ item.desc }}</span></span>
          </li>
          <li class="list-item" :key="item.name" v-else>
            <span class="name">参数：<span>{{ item.name }}</span></span>
            <span class="type">类型：<span>{{ item.type }}</span></span>
            <span class="required">是否必传：<span :style="{color: item.required ? '#0170fe' : '#999'}">{{ item.required ? "是" : "否" }}</span></span>
            <span class="desc" v-if="item.desc">描述：<span>{{ item.desc }}</span></span>
          </li>
        </template>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  name: "ParamDetail",
  props: {
    params: {
      type: Object | Array,
      default: () => null
    }
  },
  created() {
  },
  computed: {
    list() {
      const { params } = this;
      const keys = Object.keys(params);
      if (params.type) {
        return [{
          responseType: 'primitive',
          type: params.type,
          desc: params.desc,
          required: params.required
        }]
      }
      if (this.isArray(params)) {
        return [{
          responseType: 'array',
          child: params[0]
        }]
      }
      const list = keys.map(key => {
        const param = params[key];
        const { type, required, desc } = param;
        // 单值情况
        
        if (!type && this.isObject(param)) {
          return {
            responseType: 'json',
            name: key,
            type: "Object",
            desc,
            child: param
          };
        } else if(this.isArray(param) && param[0].type) {
          return {
            responseType: 'json',
            name: key,
            type: `Array<${param[0].type}>`,
            desc,
            required: param[0].required
          };
        } else if (this.isArray(param) && !param[0].type) {
          return {
            responseType: 'json',
            desc,
            name: key,
            type: 'Array',
            required: param.required,
            child: param[0]
          }
        } else {
          return {
            responseType: 'json',
            desc,
            name: key,
            type,
            required
          };
        }
      });
      return list;
    }
  },
  methods: {
    isArray(value) {
      return toString.call(value) === "[object Array]";
    },
    isObject(value) {
      return toString.call(value) === "[object Object]";
    }
  }
};
</script>

<style scoped>
body ul, body li {
  display: block;
}
.param-detail {
  width: 100%;
  margin-bottom: 8px;
  box-shadow: 3px 3px 5px 0 #ccc;
}
.list {
  padding: 8px 0 8px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.list-item {
  list-style: none;
}
.list-item span {
  font-size: 14px;
  line-height: 32px;
  color: #666;
}
.list-item span span {
  font-size: 14px;
  color: #0c8de2;
  line-height: 32px;
}
.list-item .name {
}
.list-item .type {
  margin-left: 24px;
}
.list-item .required, .list-item .desc {
  margin-left: 24px;
}

</style>
