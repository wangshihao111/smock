import winPath from "./winPath";
import lodash from "lodash";
import register from "@babel/register";

export default class BabelRegister {
  only: Record<string, string[]> = {};

  setOnlyMap({ key, value }: { key: string; value: string[] }) {
    this.only[key] = value;
    this.register();
  }

  register() {
    const only = lodash.uniq(
      Object.keys(this.only)
        .reduce<string[]>((memo, key) => {
          return memo.concat(this.only[key]);
        }, [])
        .map(winPath)
    );
    register({
      presets: [
        [
          require.resolve("@babel/preset-env"),
          {
            modules: "commonjs",
          },
        ],
        require.resolve("@babel/preset-typescript"),
      ],
      ignore: [/node_modules/],
      only,
      extensions: [".js", ".ts"],
      babelrc: false,
      cache: false,
    });
  }
}
