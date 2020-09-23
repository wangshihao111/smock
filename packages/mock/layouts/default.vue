<template>
  <div class="wrapper">
    <div class="api-documents">
      <MockApi @api-test="showRequest = true" />
    </div>
    <!-- <div class="request-show-trigger" @click="triggerShowRequest">
      <span v-if="!showRequest">Post</span>
      <img v-else :src="require('../assets/icons/close.svg')" alt="close" />
    </div> -->
    <div class="request-modal-wrapper" :class="{'modal-wrapper-show': showRequest}">
      <div class="modal-mask" :class="showRequest ? 'modal-mask-show' : ''" @click="handleBgClick"></div>
      <transition name="api" appear>
        <div class="request-modal" v-show="showRequest">
          <div class="content">
            <div class="columns">
              <sidenav />
              <div class="main" id="main">
                <pw-header />
                <nuxt />
                <pw-footer />
              </div>
              <!-- <aside class="nav-second"></aside> -->
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import MockApi from "../components/MockApi/MockApi"
export default {
  components: {
    MockApi,
    sidenav: () => import("../components/layout/sidenav"),
    "pw-header": () => import("../components/layout/header"),
    "pw-footer": () => import("../components/layout/footer"),
  },
  data() {
    return {
      showRequest: false,
    }
  },
  beforeMount() {
    // Load theme settings
    ;(() => {
      // Apply theme from settings.
      document.documentElement.className = this.$store.state.postwoman.settings.THEME_CLASS || ""
      // Load theme color data from settings, or use default color.
      let color = this.$store.state.postwoman.settings.THEME_COLOR || "#50fa7b"
      let vibrant = this.$store.state.postwoman.settings.THEME_COLOR_VIBRANT || true
      document.documentElement.style.setProperty("--ac-color", color)
      document.documentElement.style.setProperty(
        "--act-color",
        vibrant ? "rgba(32, 33, 36, 1)" : "rgba(255, 255, 255, 1)"
      )
    })()
  },

  mounted() {
    if (process.client) {
      document.body.classList.add("afterLoad")
    }

    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", this.$store.state.postwoman.settings.THEME_TAB_COLOR || "#202124")

    console.log(
      "%cWe ❤︎ open source!",
      "background-color:white;padding:8px 16px;border-radius:8px;font-size:32px;color:red;"
    )
    console.log(
      "%cContribute: https://github.com/liyasthomas/postwoman",
      "background-color:black;padding:4px 8px;border-radius:8px;font-size:16px;color:white;"
    )
  },

  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener)
  },
  methods: {
    triggerShowRequest() {
      this.showRequest = !this.showRequest
    },
    handleBgClick(e) {
      this.showRequest = false
      e.stopPropagation()
      e.preventDefault()
    },
  },
}
</script>

<style lang="scss">
.request-show-trigger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: rgb(12, 141, 226);
  color: #fff;
  cursor: pointer;
  z-index: 5;
  border-radius: 50%;
}
.request-show-trigger img {
  width: 20px;
  height: 20px;
}
.request-modal {
  background: var(--bg-color);
  width: 100%;
  height: 100%;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  overflow: auto;
}
.modal-mask {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.2s;
}
.request-modal-wrapper.modal-wrapper-show {
  width: 100%;
  height: 100vh;
}
.modal-mask-show {
  background: rgba(15, 16, 17, 0.5);
}
.api-documents {
  width: 100%;
  height: 100vh;
  overflow: auto;
}
.request-modal-wrapper {
  width: 0;
  height: 0;
  position: fixed;
  top: 0;
  // background: rgba(15,16,17,0.2);
}
.api-enter,
.api-leave-to {
  transform: translate(-50%, -50%) scale(0);
}
.api-leave,
.api-enter-to {
  transform: translate(-50%, -50%) scale(0.9);
}
.api-enter-active,
.api-leave-active {
  transition: all 0.2s;
}
</style>
