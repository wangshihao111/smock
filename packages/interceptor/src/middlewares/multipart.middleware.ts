import formidable from 'formidable';
import { Request, Response } from 'express';

export function multipartMiddleware (req: Request, res: Response, next) {
  if ((req.headers['content-type'] || '').match('multipart/form-data')) {
    const form = formidable({ multiples: true });
    return form.parse(req, (err, fields, files) => {
      const body = {...fields, ...files};
      console.log('body', body);
      req.body = body;
      next();
    });
  }
  console.log('out')
  next();
}