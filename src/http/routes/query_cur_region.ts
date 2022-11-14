import { Request, Response } from 'express';
import Config from '../../utils/Config';
import { QueryCurrRegionHttpRsp, RegionInfo } from '../../data/dispatch';
import { Ec2bKey, encryptAndSign } from '../../crypto';
import Logger from '../../utils/Logger';

const c = new Logger('Dispatch', 'blue');

const ec2b = new Ec2bKey();

export default async function handle(req: Request, res: Response) {
  const dataObj = QueryCurrRegionHttpRsp.fromPartial({
    regionInfo: RegionInfo.fromPartial({
      gateserverIp: Config.GAMESERVER.SERVER_IP,
      gateserverPort: Config.GAMESERVER.SERVER_PORT,
      secretKey: ec2b.ec2b,
    }),
    clientSecretKey: ec2b.ec2b,
    regionCustomConfigEncrypted: ec2b.cipher(
      Buffer.from(
        JSON.stringify({
          coverSwitch: [8],
          perf_report_config_url: new URL(
            'config/verify',
            'https://localhost/'
          ),
          perf_report_record_url: new URL(
            'dataUpload',
            'https://localhost/'
          ),
        })
      )
    ),
  });
  res.send(encryptAndSign(QueryCurrRegionHttpRsp.encode(dataObj).finish()));
}
