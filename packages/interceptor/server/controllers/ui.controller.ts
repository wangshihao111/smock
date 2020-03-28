import { Request, Response } from 'express';
import { AbstractController } from '../definitions/AbstractController';
import { bind } from 'lodash-decorators';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const prettier = require('prettier');

const baseUrl = '/__api';

export class UIController extends AbstractController {
  @bind()
  private getApiTree (req: Request, res: Response): void {
    const apiList = this.ctx.db.get('apiList') || [];
    res.status(200);
    res.send(apiList);
  }

  @bind()
  private updateIntercept (req: Request, res: Response): void {
    const { body } = req;
    const apiList: string[] = this.ctx.db.getDb().apiList;
    const safeList = (body as string[]).filter((i) => apiList.includes(i)); // 确保拦截api在缓存api列表中
    this.ctx.db.set('interceptList', safeList);
    res.status(200);
    res.send({
      code: 0,
      message: '更新成功',
      list: body
    });
  }

  @bind()
  private getIntercept (req: Request, res: Response): void {
    const list = this.ctx.db.get('interceptList') || [];
    res.status(200);
    res.send(list);
  }

  @bind()
  private deleteHistory (req: Request, res: Response): void {
    const api = req.body.path as string;
    try {
      this.ctx.file.deleteOneLog(api);
      res.status(200);
      res.send({
        code: 0,
        message: 'success'
      });
    } catch (e) {
      console.log(e);
      res.status(200);
      res.send({
        code: -1,
        message: 'failed'
      });
    }
  }

  @bind()
  private getApiDetail (req: Request, res: Response): void {
    const { query } = req;
    const { api } = query as { api: string };
    try {
      const json = this.ctx.file.getOneHistory(api) as any;
      const data: any = {};
      for (const key in json) {
        const value = json[key];
        data[key] = {
          request: prettier.format(JSON.stringify(value.request), {
            parser: 'json',
            printWidth: 40
          }),
          response: {
            ...(value.response || {}),
            data: prettier.format(JSON.stringify(value.response?.data || {}), {
              parser: 'json'
            })
          }
        };
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

  @bind()
  private apiSave (req: Request, res: Response): void {
    const { body } = req;
    this.ctx.file
      .updateRequestLog(body)
      .then(() => {
        res.status(200);
        res.send({
          code: 0,
          message: 'success'
        });
      })
      .catch((e) => {
        res.status(500);
        res.send({
          code: -1,
          message: '未发现api信息，请返回首页刷新后重试。'
        });
      });
  }

  public run (): void {
    this.ctx.app.get(`${baseUrl}/tree`, this.getApiTree);
    this.ctx.app.post(`${baseUrl}/update-intercept`, this.updateIntercept);
    this.ctx.app.get(`${baseUrl}/intercepted`, this.getIntercept);
    this.ctx.app.post(`${baseUrl}/delete-history`, this.deleteHistory);
    this.ctx.app.get(`${baseUrl}/api-detail`, this.getApiDetail);
    this.ctx.app.post(`${baseUrl}/api-save`, this.apiSave);
  }
}
