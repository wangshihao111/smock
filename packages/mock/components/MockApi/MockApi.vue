<template>
  <div class="mock-api">
    <div class="api-side-nav">
      <SideNavContent @change="handleMenuChange" />
    </div>
    <div class="api-content">
      <ApiDocument v-if="apiDefinition" :apiDef="apiDefinition" @api-test="$emit('api-test')" />
    </div>
  </div>
</template>

<script>
import ApiDocument from "./ApiDocument"
import SideNavContent from "./ApiSideNav"
import { baseUrl } from "../../assets/js/config"

export default {
  name: "App",
  components: {
    SideNavContent,
    ApiDocument,
  },
  data: () => ({
    apiDefinition: null,
  }),
  methods: {
    handleMenuChange(api) {
      this.fetchApiDefinition(api)
    },
    fetchApiDefinition({ key, apiName, type }) {
      const url = `${baseUrl}/__api?key=${key}&apiName=${apiName}&type=${type}`
      fetch(url)
        .then(res => res.json())
        .then(res => {
          this.apiDefinition = res
        })
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/css/variables.scss';
.mock-api {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  height: 100vh;
  width: 100%;
  flex-direction: row;
  background: $body-bg;
}
.api-side-nav {
  flex: 0 0 200px;
  background-color: $bg-color;
}
.api-content {
  flex: 1;
  margin-left: 8px;
  background-color: $bg-color;
}
</style>
