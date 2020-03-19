<template>
  <div class="api-side-nav-content">
    <h2 class="list-title">
      Api 列表
    </h2>
    <ul class="list" v-if="apiList">
      <li class="list-item" v-for="item of apiList" :key="item.name">
        <h3
          class="sub-api-title"
          :class="openNames.includes(item.name) ? 'list-open' : ''"
          @click="triggerListOpen(item)"
        >{{item.name}}</h3>
        <!-- <transition @before-enter="handExpandAnim($event, 'before-enter')" @enter="handExpandAnim($event, 'enter', item.apiList.length)" @leave="handExpandAnim($event, 'leave')"> -->
          <ul class="inner-api-list" :class="openNames.includes(item.name) ? 'inner-api-list-open' : ''" v-if="openNames.includes(item.name)">
            <li
              class="api-item"
              v-for="api in item.apiList"
              :key="api.name"
              @click="handleApiClick(item, api)"
              :class="selected.parentName === item.name && selected.childName === api.name ? 'selected' : ''"
            >
              <span class="api-method">[{{api.method}}]</span>
              <span>{{api.name}}</span>
            </li>
          </ul>
        <!-- </transition> -->
      </li>
    </ul>
  </div>
</template>

<script>
import {baseUrl} from '@/assets/js/config'
export default {
  data() {
    return {
      apiList: null,
      openNames: [],
      selected: {
        parentName: '',
        childName: ''
      }
    }
  },
  mounted() {
    this.init();
  },
  destroyed() {
    localStorage.setItem("__selected", JSON.stringify(this.selected))
  },
  computed: {
    
  },
  methods: {
    handExpandAnim(el, type, length) {
      console.log(el, type);
      if (type === 'enter') {
        el.style.height = length * 32 + 'px';
      } else if (type === 'leave') {
        el.style.height = 0;
      } else if (type === 'before-enter') {
        el.style.display = 'block';
        el.style.height = 0;
      }
    },
    triggerListOpen({name}) {
      const index = this.openNames.indexOf(name);
      if (index > -1) {
        this.openNames.splice(index, 1);
      } else {
        this.openNames.push(name);
      }
    },
    handleApiClick(parent, child) {
      this.selected.parentName = parent.name;
      this.selected.childName = child.name;
      localStorage.setItem("__selected", JSON.stringify(this.selected));
      this.$emit('change', {type: child.type, name: parent.name, apiName: child.name, });
    },
    init() {
      let selected = localStorage.getItem('__selected');
      if (selected) {
        selected = JSON.parse(selected);
        this.selected.parentName = selected.parentName;
        this.selected.childName = selected.childName;
        this.openNames.push(selected.parentName)
      }
      const url = `${baseUrl}/__api-list`;
      fetch(url).then(res => res.json()).then(res => {
        this.apiList = res;
        const current = res.find(v => v.name === this.selected.parentName);
        if (current) {
          const api = current.apiList.find(api => api.name === selected.childName);
          if (api) {
            this.$emit("change", {type: api.type, name: current.name, apiName: api.name })
          }
        }
      })
    }
  }
}
</script>

<style>
ul, li {
  margin: 0;
  padding: 0;
  list-style-type: none;
  display: block;
  width: 100%;
}
.api-side-nav-content {
  width: 100%;
  height: 100%;
  border-right: 1px solid #efefef;
  display: flex;
  flex-direction: column;
  box-shadow: 0 3px 5px 0 #666;
}
.list-title {
  font-size: 16px;
  text-align: center;
  color: #0c8de2;
  flex: 0 0 48px;
  justify-content: center;
}
.list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin: 0;
}
.list-item {
  list-style-type: none;
  text-align: left;
  padding: 0 16px;
}
.sub-api-title {
  font-size: 14px;
  color: #333;
  font-weight: normal;
  font-family:'Times New Roman', Times, serif;
  line-height: 42px;
  border-bottom: 1px solid #f1f1f1;
  line-height: 42px;
  padding: 0;
  margin: 0;
  position: relative;
  cursor: pointer;
  transition: all .3s;
}
.sub-api-title.list-open {
  color: #0c8de2;
}
.sub-api-title::after {
  content: '';
  position: absolute;
  right: 0;
  top: calc(50% - 3px);
  width: 6px;
  height: 6px;
  border-right: 1px solid #ababab;
  border-bottom: 1px solid #ababab;
  transform: rotateZ(-45deg);
  transition: all .3s;
}
.sub-api-title.list-open::after {
  transform: rotate(45deg);
}
.inner-api-list {
  transition: all .5s;
  overflow: hidden;
}
.api-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
}
.inner-api-list .api-method {
  width: auto;
  margin-right: 8px;
  font-size: 12px;
  display: inline-block;
  color: #999;
  font-style: italic;
}
.inner-api-list li {
  padding-left: 8px;
  line-height: 32px;
  color: #666;
  cursor: pointer;
}
.inner-api-list li.selected {
  color: #0295ece8;
}
.expand-enter, .expand-leave-to {
  transform: scaleY(0);
  opacity: 0;
}
.expand-enter-to, .expand-leave {
  transform: scaleY(1);
  opacity: 1;
}
.expand-enter-active, .expand-leave-active {
  transition: all 0.5;
}
</style>