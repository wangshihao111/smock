module.exports = {
  createClientController() {
    return {
      title: "Mock工具",
      icon: "@smock/umi-plugin-smock/mock-icon.svg",
      controller: ({ open }) => {
        if (open) {
          window.open(`${window.location.origin}/__doc__`);
        }
      },
    };
  },

  // node controller
  createNodeController() {
    return function ({ enable = true } = {}) {
      Object.defineProperties(process.env, {
        NO_SMOCK: {
          get() {
            return enable ? "" : "true";
          },
          // 这里设定的优先级最高
          set() {
            this.value = enable ? "" : "true";
          },
        },
      });
    };
  },
};
