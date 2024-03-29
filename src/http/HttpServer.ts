import express from 'express';
import https from 'https';
import fs from 'fs';
import { resolve } from 'path';
import Config from '../utils/Config';
import Logger, { VerboseLevel } from '../utils/Logger';
import query_cur_handle from './routes/query_cur_region';
const c = new Logger("HTTP", "cyan");

function r(...args: string[]) {
    return fs.readFileSync(resolve(__dirname, ...args)).toString();
}

const HTTPS_CONFIG = {
    key: r('./cert/cert.key'),
    cert: r('./cert/cert.crt'),
}

export default class HttpServer {
    private readonly server;
    private static instance: HttpServer;

    private constructor() {
        this.server = express();
        this.server.use(express.json({limit: '50mb'}));
        this.server.use('/asb', express.static(resolve(__dirname, './routes/asb')));
        this.server.route('/query_cur_region/:region').all(query_cur_handle)
        this.server.route('/*').all((req, res) => {
            if (Logger.VERBOSE_LEVEL > VerboseLevel.WARNS) c.log(`${req.method} ${req.url}`);
            import(`./routes${req.url.split('?')[0]}`).then(async r => {
                await r.default(req, res);
            }).catch(err => {
                res.send({
                    code: 0
                });
                if (err.code === 'MODULE_NOT_FOUND') return;
                c.error(err);
            });
        });
    }

    public start(): void {
        https.createServer(HTTPS_CONFIG, this.server).listen(Config.config.HTTPS.HTTPS_PORT, Config.config.HTTPS.HTTP_HOST, () => {
            c.log(`Listening on HTTPS ${Config.config.HTTPS.HTTPS_HOST}:${Config.config.HTTPS.HTTPS_PORT}`);
        });
        this.server.listen(Config.config.HTTP.HTTP_PORT, Config.config.HTTP.HTTP_HOST, () => {
            c.log(`Listening on HTTP ${Config.config.HTTP.HTTP_HOST}:${Config.config.HTTP.HTTP_PORT}`);
        });
    }
    
    

    public static getInstance(): HttpServer {
        if (!HttpServer.instance) {
            HttpServer.instance = new HttpServer();
        }
        return HttpServer.instance;
    }
}