import { Request, Response } from "express";
import Config from "../../../../../../utils/Config";

export default function handle(req: Request, res: Response) {
    res.send({
        retcode: 0,
        message: "OK",
        data: {
            log_level: "INFO",
            protocol: true,
            qr_enabled: false,
            push_alias_type: 2,
            disable_ysdk_guard: false,
            enable_announce_pic_popup: true,
            announce_url: new URL("hk4e/announcement/index.html", 'https://osasiadispatch.yuanshen.com/'),
          }
    });
}