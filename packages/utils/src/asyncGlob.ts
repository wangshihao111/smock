import glob, { IOptions } from "glob";

export default async function asyncGlob(
  pattern: string,
  options: IOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, matches: string[]) => {
      if (err) {
        reject();
      } else {
        resolve(matches);
      }
    });
  });
}
