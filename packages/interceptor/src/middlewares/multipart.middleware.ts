import formidable from 'formidable';
import { Request, Response } from 'express';

export function multipartMiddleware (req: Request, res: Response, next): void {
  if ((req.headers['content-type'] || '').match('multipart/form-data')) {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
      }
      const body = { ...fields, ...files };
      console.log('body', body);
      req.body = body;
      next();
    });
  } else {
    next();
  }
}
