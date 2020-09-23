<template>
  <div class="param-detail" :class="nested && 'param-detail-nested'">
    <ul class="list" v-if="params">
      <li class="list-item" v-if="!nested">
        <span>参数</span>
        <span>类型</span>
        <span>是否必传</span>
        <span>描述</span>
      </li>
      <template v-for="item of list">
        <template v-if="item.responseType === 'primitive'">
          <li class="list-item" :key="item.name">
            <span>- - -</span>
            <span>{{item.type}}</span>
            <span class="required">{{ item.required ? "是" : "否" }}</span>
            <span class="desc">{{ item.desc || '- - -' }}</span>
          </li>
        </template>

        <template v-if="item.responseType === 'json'">
          <li
            class="list-item"
            :key="item.name"
            :class="{'list-item-has-child': (item.type==='Object' || item.type==='Array'), 'list-item-open': openKeys.includes(item.key) }"
            @click="toggleListOpen(item.key)"
          >
            <span class="name">{{ item.name || '- - -' }}</span>
            <span class="type">{{ item.type || '- - -' }}</span>
            <span class="required">{{ item.required ? "是" : "否" }}</span>
            <span class="desc">{{ item.desc || '- - -' }}</span>
          </li>
          <li
            class="list-item-nested list-item"
            :key="item.key"
            v-if="item.type==='Object' || item.type==='Array'"
          >
            <ParamDetail nested :params="item.child" />
          </li>
        </template>
        <template v-if="item.responseType === 'array'">
          <li class="list-item-nested" :key="item.name">
            <ParamDetail nested :params="item.child" />
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
      default: () => null,
    },
    nested: Boolean,
  },
  data() {
    return {
      openKeys: []
    }
  },
  created() {},
  computed: {
    list() {
      const { params } = this
      const keys = Object.keys(params)
      if (params.type) {
        return [
          {
            key: Math.random() + Date.now(),
            responseType: "primitive",
            type: params.type,
            desc: params.desc,
            required: params.required,
          },
        ]
      }
      if (this.isArray(params)) {
        return [
          {
            key: Math.random() + Date.now(),
            responseType: "array",
            child: params[0],
          },
        ]
      }
      const list = keys.map(key => {
        const param = params[key]
        const { type, required, desc } = param
        // 单值情况

        if (!type && this.isObject(param)) {
          return {
            key: Math.random() + Date.now(),
            responseType: "json",
            name: key,
            type: "Object",
            desc,
            child: param,
          }
        } else if (this.isArray(param) && param[0].type) {
          return {
            key: Math.random() + Date.now(),
            responseType: "json",
            name: key,
            type: `Array<${param[0].type}>`,
            desc,
            required: param[0].required,
          }
        } else if (this.isArray(param) && !param[0].type) {
          return {
            key: Math.random() + Date.now(),
            responseType: "json",
            desc,
            name: key,
            type: "Array",
            required: param.required,
            child: param[0],
          }
        } else {
          return {
            key: Math.random() + Date.now(),
            responseType: "json",
            desc,
            name: key,
            type,
            required,
          }
        }
      })
      return list
    },
  },
  methods: {
    isArray(value) {
      return toString.call(value) === "[object Array]"
    },
    isObject(value) {
      return toString.call(value) === "[object Object]"
    },
    toggleListOpen(key) {
      const index = this.openKeys.findIndex(v => v === key)
      if (index > -1) {
        this.openKeys.splice(index, 1)
      } else {
        this.openKeys.push(key)
      }
    }
  },
}
</script>

<style scoped lang="scss">
@import "@/assets/css/variables.scss";
body ul,
body li {
  display: block;
  box-sizing: border-box;
}
.param-detail {
  width: 100%;
  &.param-detail-nested {
    .list .list-item span {
      color: #979797;
    }
  }
}
.list {
  padding: 8px 0;
  border-radius: 8px;
  .list-item-nested,
  .list-item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    list-style: none;
    padding-left: 24px;
    span {
      font-size: 12px;
      line-height: 32px;
      color: #fff;
      flex: 0 0 20%;
    }
  }
  .list-item {
    &-title {
      color: #fff;
      font-weight: normal;
      font-size: 12px;
    }

    &:nth-of-type(2n + 1) {
      background: $param-list-strip-bg;
    }

    &::v-deep {
      .param-detail {
        flex: 1;
      }
    }
    &.list-item-has-child {
      cursor: pointer;
      span:first-of-type {
        position: relative;
        &::after {
          content: '';
          display: inline-block;
          position: relative;
          top: -2px;
          width: 6px;
          height: 6px;
          margin-left: 8px;
          border-bottom: 1px solid #979797;
          border-right: 1px solid #979797;
          transform: rotateZ(45deg);
          transform-origin: 75% 75%;
          cursor: pointer;
          transition: transform .3s;
        }
      }
      &.list-item-open {
        span:first-of-type:after {
          transform: rotateZ(-135deg);
        }
      }
    }


  }
  .list-item-has-child + .list-item-nested {
    display: none;
  }
  .list-item-has-child.list-item-open + .list-item-nested {
    display: block
  }
  .list-item-nested {
    margin-left: -24px;
    width: calc(100% + 24px);
    background-color: $param-list-strip-bg;
  }
}
</style>
