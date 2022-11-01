import { Request, Response } from 'express';

export default function handle(req: Request, res: Response) {
  res.send({
    retcode: 200,
    message: 'OK',
    data: {
      vals: {
        email_bind_remind: 'true',
        email_bind_remind_interval: '7',
        disable_email_bind_skip: 'false',
      },
    },
  });
}
