/**
 * @package YSDispatch
 * @author tamilpp25
 * @license GPL-3.0
 */
import Logger from './utils/Logger';
import HttpServer from './http/HttpServer';
import Interface from './commands/Interface';
import { RSAUtils } from './crypto';
import Config from './utils/Config';

const c = new Logger('YSDispatch');
c.log('Starting YSDispatch...');

RSAUtils.initKeys();
HttpServer.getInstance().start();
Interface.start()