import { FileUtil } from './file-util';

export class DbUtil {
  public static set(key: string, value: any): void {
    const db = FileUtil.getSettings();
    db[key] = value;
    FileUtil.setSettings(db);
  }
  public static get(key: string) {
    const db = FileUtil.getSettings();
    return db[key];
  }

  public static getDb() {
    return FileUtil.getSettings();
  }

  public static addStringArrayItem(arr: Array<string>, item: string): string {
    const index = arr.indexOf(item);
    if (index > -1) return arr[index];
    else {
      arr.push(item)
      return item;
    }
  }

  public static deleteStringArrItem(arr: Array<string>, item: string): string {
    const index = arr.indexOf(item);
    if (index > -1) return arr.splice(index, 1)[0];
    else return item;
  }
  public static hasArrayStringItem(arr: Array<string>, item: string): boolean {
    const index = arr.indexOf(item);
    return index > -1;
  }
}