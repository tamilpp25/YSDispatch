import { Request, Response } from "express";
import Config from "../../utils/Config";
import { QueryRegionListHttpRsp, RegionSimpleInfo } from '../../data/dispatch';
import { Ec2bKey } from "../../crypto";

const ec2b = new Ec2bKey()

export default function handle(req: Request, res: Response) {
    const dataObj = QueryRegionListHttpRsp.fromPartial({
        regionList: [],
        clientSecretKey: ec2b.ec2b,
        clientCustomConfigEncrypted: ec2b.cipher(
            Buffer.from(
              JSON.stringify({
                sdkenv: 2,
                checkdevice: false,
                loadPatch: false,
                showexception: false,
                regionConfig: "pm|fk|add",
                downloadMode: 0,
              }),
              "utf8"
            )
          ),
          enableLoginPc: true
    });

    Config.DISPATCH.forEach(item => {
        dataObj.regionList.push(RegionSimpleInfo.fromPartial({
            title: item.DISPATCH_NAME,
            name: "os_asia",
            dispatchUrl: item.DISPATCH_URL,
            type: "DEV_PUBLIC",
        }));
    });

    res.send(Buffer.from(QueryRegionListHttpRsp.encode(dataObj).finish()).toString("base64"));
}