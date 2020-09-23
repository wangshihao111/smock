<template>
  <div class="api-side-nav-content">
    <h2 class="list-title">
      <img src="./img/logo.svg" alt />
    </h2>
    <ul class="list" v-if="apiList">
      <li class="list-item" v-for="item of apiList" :key="item.name">
        <h3
          class="sub-api-title"
          :class="openNames.includes(item.key) ? 'list-open' : ''"
          @click="triggerListOpen(item)"
        >{{ item.name }}</h3>
        <!-- <transition @before-enter="handExpandAnim($event, 'before-enter')" @enter="handExpandAnim($event, 'enter', item.apiList.length)" @leave="handExpandAnim($event, 'leave')"> -->
        <ul
          class="inner-api-list"
          :class="openNames.includes(item.key) ? 'inner-api-list-open' : ''"
          v-if="openNames.includes(item.key)"
        >
          <li
            class="api-item"
            v-for="api in item.apiList"
            :key="api.name + item.method + item.path"
            @click="handleApiClick(item, api)"
            :class="
              selected.parentName === item.key && selected.childName === api.name ? 'selected' : ''
            "
          >
            <span class="api-method">[{{ api.method }}]</span>
            <span>{{ api.name }}</span>
          </li>
        </ul>
        <!-- </transition> -->
      </li>
    </ul>
  </div>
</template>

<script>
import { baseUrl } from "@/assets/js/config"
export default {
  data() {
    return {
      apiList: null,
      openNames: [],
      selected: {
        parentName: "",
        childName: "",
      },
    }
  },
  mounted() {
    this.init()
  },
  destroyed() {
    localStorage.setItem("__selected", JSON.stringify(this.selected))
  },
  computed: {},
  methods: {
    handExpandAnim(el, type, length) {
      console.log(el, type)
      if (type === "enter") {
        el.style.height = length * 32 + "px"
      } else if (type === "leave") {
        el.style.height = 0
      } else if (type === "before-enter") {
        el.style.display = "block"
        el.style.height = 0
      }
    },
    triggerListOpen({ name, key }) {
      const index = this.openNames.indexOf(key)
      if (index > -1) {
        this.openNames.splice(index, 1)
      } else {
        this.openNames.push(key)
      }
    },
    handleApiClick(parent, child) {
      this.selected.parentName = parent.key
      this.selected.childName = child.name
      localStorage.setItem("__selected", JSON.stringify(this.selected))
      this.$emit("change", { type: child.type, key: parent.key, apiName: child.name })
    },
    init() {
      let selected = localStorage.getItem("__selected")
      if (selected) {
        selected = JSON.parse(selected)
        this.selected.parentName = selected.parentName
        this.selected.childName = selected.childName
        this.openNames.push(selected.parentName)
      }
      const url = `${baseUrl}/__api-list`
      fetch(url)
        .then(res => res.json())
        .then(res => {
          this.apiList = res
          const current = res.find(v => v.key === this.selected.parentName)
          if (current) {
            const api = current.apiList.find(api => api.name === selected.childName)
            if (api) {
              this.$emit("change", { type: api.type, key: current.key, apiName: api.name })
            }
          }
        })
    },
  },
}
</script>

<style lang="scss">
@import "@/assets/css/variables.scss";
ul,
li {
  margin: 0;
  padding: 0;
  list-style-type: none;
  display: block;
  width: 100%;
}
.api-side-nav-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.list-title {
  font-size: 16px;
  text-align: center;
  flex: 0 0 40px;
  justify-content: flex-start;
  background-image: linear-gradient(134deg, #f78249 0%, #e27279 100%);
  & > img {
    height: 20px;
    margin-left: 16px;
  }
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  .list-item {
    list-style-type: none;
    text-align: left;
  }
}
.sub-api-title {
  font-size: 12px;
  text-indent: 16px;
  color: $side-item-title-color;
  font-weight: normal;
  line-height: $side-item-title-height;
  height: $side-item-title-height;
  padding: 0;
  margin: 0;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;

  &:after {
    content: "";
    position: absolute;
    right: 8px;
    top: calc(50% - 3px);
    width: 6px;
    height: 6px;
    border-right: 1px solid #ababab;
    border-bottom: 1px solid #ababab;
    transform: rotateZ(-45deg);
    transition: all 0.3s;
  }

  &.list-open {
    color: $side-item-title-active-color;
    &:after {
      transform: rotate(45deg);
    }
  }
}

.inner-api-list {
  transition: all 0.5s;
  overflow: hidden;
  background: $side-dropdown-bg;
  .api-item {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 12px;
    padding-left: 24px;
    flex-direction: row;
    height: $side-item-height;
    line-height: $side-item-height;
    color: $side-item-color;
    transition: all .3s;
    cursor: pointer;
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      transform: scaleY(0);
      background: $primary;
      transition: all .3s;
      transform-origin: center;
    }
    &.selected {
      color: $size-item-active-color;
      background-color: $side-dropdown-active-bg;
      &:before {
        transform: scaleY(1);
      }
    }
  }
  .api-method {
    width: auto;
    margin-right: 4px;
    display: inline-block;
  }
}

.expand-enter,
.expand-leave-to {
  transform: scaleY(0);
  opacity: 0;
}
.expand-enter-to,
.expand-leave {
  transform: scaleY(1);
  opacity: 1;
}
.expand-enter-active,
.expand-leave-active {
  transition: all 0.5;
}
</style>
