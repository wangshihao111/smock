import { GlobalContext } from '../utils/context-util';

export abstract class AbstractController {
  protected ctx: GlobalContext;

  constructor (ctx: GlobalContext) {
    this.ctx = ctx;
  }

  abstract run(): void;
}
