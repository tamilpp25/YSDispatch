/**
 * @package YSDispatch
 * @author tamilpp25
 * @license GPL-3.0
 */
import Logger from './utils/Logger';
import HttpServer from './http/HttpServer';
import Interface from './commands/Interface';

const c = new Logger('YSDispatch');
c.log('Starting YSDispatch...');

HttpServer.getInstance().start();
c.debug('Key Id: 5')
Interface.start()