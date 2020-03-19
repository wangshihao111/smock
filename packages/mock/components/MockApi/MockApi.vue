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
import SideNavContent from './APiSideNav'
import ApiDocument from './ApiDocument';
import {baseUrl} from '../../assets/js/config'

export default {
  name: 'App',
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
    fetchApiDefinition({name, apiName, type}) {
      const url = `${baseUrl}/__api?name=${name}&apiName=${apiName}&type=${type}`;
      fetch(url).then(res => res.json()).then(res => {
        this.apiDefinition = res;
      })
    }
  }
}
</script>

<style>
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
  background: #f1f1f1;
}
.api-side-nav {
  flex: 0 0 240px;
  background: #fff;
}
.api-content {
  flex: 1;
}
</style>
