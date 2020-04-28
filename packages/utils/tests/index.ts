import BabelRegister from '../src/BabelRegister';
import glob from 'glob';

const register = new BabelRegister();

register.setOnlyMap({
  key: 'smock',
  value: glob.sync("**/smock/**/*.ts", {root: process.cwd()})
});

register.register();

console.log(require('../../smock/index.ts'));