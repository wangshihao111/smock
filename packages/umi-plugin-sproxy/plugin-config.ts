/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
module.exports = {
  createClientController() {
    return {
      title: "拦截工具",
      icon: "@smock/umi-plugin-sproxy/icon.svg",
      controller: async ({ open }) => {
        const callRemote = (window as any).umi_callRemote
        let port = 0
        if (typeof callRemote === 'function') {
          port = (await callRemote({ type: 'global/smock/sproxy-port' })) || 10011;
        }
        if (open) {
          window.open(`http://localhost:${port}`);
        }
      },
    };
  },

  // node controller
  createNodeController() {
    const { __global_handler } = global as any;
    if (__global_handler && __global_handler.onSocket) {
      __global_handler.onSocket(({ action, success }) => {
        const { resolve } = require('path');
        const { readFileSync } = require('fs')
        if (action.type === 'global/smock/sproxy-port') {
          const cwd = process.cwd();
          let port = 10011;
          const paths = [resolve(cwd, '.smockrc.js'), resolve(cwd, '../../smockrc.js')];
          for (let i = 0; i < paths.length; i++) {
            const p = paths[i];
            try {
              port = eval(readFileSync(p, 'utf8')).workPort;
              break;
            } catch (error) { }
          }
          success(port);
        }
      })
    }

    return function ({ enable = true } = {}) {
      Object.defineProperties(process.env, {
        NO_SPROXY: {
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
