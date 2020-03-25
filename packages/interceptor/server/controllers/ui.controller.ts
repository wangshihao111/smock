import { FileUtil } from './../utils/file-util';
import { DbUtil } from './../utils/db-util';
import { Application, Request, Response } from 'express';
import prettier from 'prettier';

const baseUrl = '/__api';

export class UIController {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
    this.getApiTree = this.getApiTree.bind(this);
    this.updateIntercept = this.updateIntercept.bind(this);
  }

  private getApiTree(req: Request, res: Response) {
    const apiList = DbUtil.get('apiList') || [];
    res.status(200);
    res.send(apiList);
  }

  private updateIntercept(req: Request, res: Response) {
    const { body } = req;
    const apiList: string[] = DbUtil.getDb().apiList;
    const safeList = (body as string[]).filter(i => apiList.includes(i)); // 确保拦截api在缓存api列表中
    DbUtil.set('interceptList', safeList);
    res.status(200);
    res.send({
      code: 0,
      message: '更新成功',
      list: body,
    });
  }

  private getIntercept(req: Request, res: Response) {
    const list = DbUtil.get('interceptList') || [];
    res.status(200);
    res.send(list);
  }

  private deleteHistory(req: Request, res: Response) {
    const api = req.body.path as string;
    try {
      FileUtil.deleteOneLog(api);
      res.status(200);
      res.send({
        code: 0,
        message: 'success'
      })
    } catch(e) {
      console.log(e);
      res.status(200);
      res.send({
        code: -1,
        message: 'failed'
      })
    }
  }

  private getApiDetail(req: Request, res: Response) {
    const { query } = req;
    const { api } = query as { api: string };
    try {
      const json = FileUtil.getOneHistory(api) as any;
      const data: any = {}
      for (const key in json) {
        const value = json[key];
        data[key] = {
          request: prettier.format(JSON.stringify(value.request), { parser: 'json', printWidth: 40 }),
          response: {
            ...(value.response || {}),
            data: prettier.format(JSON.stringify(value.response?.data || {}), {
              parser: 'json'
            })
          }
        }
      }
      res.send(data);
    } catch (e) {
      res.status(500);
      res.send({
        code: -1,
        message: '未发现接口信息，请返回首页刷新后重试。'
      });
    }
  }

  private apiSave(req: Request, res: Response) {
    const { body } = req;
    FileUtil.updateRequestLog(body).then(() => {
      res.status(200);
      res.send({
        code: 0,
        message: 'success'
      })
    }).catch(e => {
      res.status(500);
      res.send({
        code: -1,
        message: '未发现api信息，请返回首页刷新后重试。'
      });
    })
  }

  public run(): void {
    this.app.get(`${baseUrl}/tree`, this.getApiTree)
    this.app.post(`${baseUrl}/update-intercept`, this.updateIntercept);
    this.app.get(`${baseUrl}/intercepted`, this.getIntercept);
    this.app.post(`${baseUrl}/delete-history`, this.deleteHistory);
    this.app.get(`${baseUrl}/api-detail`, this.getApiDetail);
    this.app.post(`${baseUrl}/api-save`, this.apiSave);
  }
}