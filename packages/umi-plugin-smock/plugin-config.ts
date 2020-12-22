module.exports = {
  createClientController() {
    return {
      title: "Mock工具",
      icon: "@smock/umi-plugin-smock/mock-icon.svg",
      controller: ({ open }) => {
        if (open) {
          window.open(`${window.location.origin}/__doc__`)
        }
      },
    };
  },
};
