import { GlobalContext } from './context-util';

export interface DB {
  apiList: string[];
  interceptList: string[];
}

type dbKeys = 'apiList' | 'interceptList';

export class DbUtil {
  private ctx: GlobalContext;
  constructor (ctx: GlobalContext) {
    this.ctx = ctx;
  }

  public set (key: dbKeys, value: any): void {
    const db = this.ctx.file.getSettings();
    db[key] = value;
    this.ctx.file.setSettings(db);
  }

  public get (key: dbKeys): any {
    const db = this.ctx.file.getSettings();
    return db[key];
  }

  public getDb (): DB {
    return this.ctx.file.getSettings();
  }

  public addStringArrayItem (arr: Array<string>, item: string): string {
    const index = arr.indexOf(item);
    if (index > -1) return arr[index];
    else {
      arr.push(item);
      return item;
    }
  }

  public deleteStringArrItem (arr: Array<string>, item: string): string {
    const index = arr.indexOf(item);
    if (index > -1) return arr.splice(index, 1)[0];
    else return item;
  }

  public hasArrayStringItem (arr: Array<string>, item: string): boolean {
    const index = arr.indexOf(item);
    return index > -1;
  }
}
