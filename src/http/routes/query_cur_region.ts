import { Request, Response } from 'express';
import Config from '../../utils/Config';
import { QueryCurrRegionHttpRsp, RegionInfo, StopServerInfo } from '../../data/dispatch';
import { Ec2bKey, RSAUtils } from '../../crypto';
import Logger from '../../utils/Logger';

const c = new Logger('Dispatch', 'blue');

const ec2b = new Ec2bKey();

const NO_VERSION_CONFIG = 'CAESGE5vdCBGb3VuZCB2ZXJzaW9uIGNvbmZpZxoA'

export default async function query_cur_handle(req: Request, res: Response) {
  const key = req.query.key_id
  const region = req.params.region

  if(!key){
    res.send(NO_VERSION_CONFIG);
    return; // no legacy support
  }

  c.debug(`Client Key: ${key}`)
  
  const dispatchData = Config.DISPATCH.find(r => r.DISPATCH_NAME == region)

  if (dispatchData === undefined){
    res.send(NO_VERSION_CONFIG)
    return;
  }

  c.log(`${req.ip} is connecting to ${dispatchData.DISPATCH_TITLE}`)

  const dataObj = QueryCurrRegionHttpRsp.fromPartial({
    regionInfo: RegionInfo.fromPartial({
      gateserverIp: dispatchData.GAMESERVER_IP,
      gateserverPort: dispatchData.GAMESERVER_PORT,
      secretKey: ec2b.ec2b,
    }),
    clientSecretKey: ec2b.ec2b,
    regionCustomConfigEncrypted: ec2b.cipher(
      Buffer.from(
        JSON.stringify({
          coverSwitch: [8],
          perf_report_config_url: new URL(
            'config/verify',
            dispatchData.DISPATCH_BASE_URL
          ),
          perf_report_record_url: new URL(
            'dataUpload',
            dispatchData.DISPATCH_BASE_URL
          ),
        })
      )
    ),
  });

  res.send(RSAUtils.encryptAndSign(QueryCurrRegionHttpRsp.encode(dataObj).finish(), key.toString()))
}
