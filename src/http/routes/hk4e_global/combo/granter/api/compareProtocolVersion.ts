import { Request, Response } from 'express';

export default function handle(req: Request, res: Response) {
  // Test handler
  res.send({
    retcode: 0,
    message: 'OK',
    data: {
      modified: true,
      protocol: {
        id: 0,
        app_id: 4,
        major: 4,
        minimum: 0,
        create_time: '0',
        language: 'en',
      },
    },
  });
}
