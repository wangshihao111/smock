import { Request, Response } from 'express';

export interface JsApiItem {
  name: string;
  desc?: string;
  url: string;
  method: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';
  handle: (req: Request, res: Response) => void;
}

export interface JsDefinition {
  name: string;
  desc: string;
  apis: JsApiItem[];
}
