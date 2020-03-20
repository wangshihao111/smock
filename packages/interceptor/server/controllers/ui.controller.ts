import { DbUtil } from './../utils/db-util';
import { Application, Request, Response } from 'express';

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
    DbUtil.set('interceptList', body as string[]);
    res.status(200);
    res.send({
      code: 0,
      message: '更新成功'
    });
  }

  public getIntercept(req: Request, res: Response) {
    const list = DbUtil.get('interceptList') || [];
    res.status(200);
    res.send(list);
  }

  public run(): void {
    this.app.get(`${baseUrl}/tree`, this.getApiTree)
    this.app.post(`${baseUrl}/update-intercept`, this.updateIntercept);
  }
}