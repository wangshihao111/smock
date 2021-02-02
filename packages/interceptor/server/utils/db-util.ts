import { GlobalContext } from "./context-util";

export interface DB {
  apiList: string[];
  interceptList: string[];
}

type dbKeys = "apiList" | "interceptList";

export class DbUtil {
  private ctx: GlobalContext;
  private data: any;
  constructor(ctx: GlobalContext) {
    this.ctx = ctx;
    this.data = this.ctx.file.getSettings() || {};
  }

  public set(key: dbKeys, value: any): void {
    this.data = { ...this.data, [key]: value };
    this.ctx.file.setSettings(this.data);
  }

  public get(key: dbKeys): any {
    // const db = this.ctx.file.getSettings();
    return this.data[key];
  }

  public getDb(): DB {
    return this.data;
  }

  public addStringArrayItem(arr: Array<string>, item: string): string {
    const index = arr.indexOf(item);
    if (index > -1) return arr[index];
    else {
      arr.push(item);
      return item;
    }
  }

  public deleteStringArrItem(arr: Array<string>, item: string): string {
    const index = arr.indexOf(item);
    if (index > -1) return arr.splice(index, 1)[0];
    else return item;
  }

  public hasArrayStringItem(arr: Array<string>, item: string): boolean {
    const index = arr.indexOf(item);
    return index > -1;
  }
}
