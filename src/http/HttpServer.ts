import express from 'express';
import fs from 'fs';
import { resolve } from 'path';
import Config from '../utils/Config';
import Logger, { VerboseLevel } from '../utils/Logger';
import query_cur_handle from './routes/query_cur_region';
const c = new Logger("HTTP", "cyan");

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
        this.server.listen(Config.HTTP.HTTP_PORT, Config.HTTP.HTTP_HOST, () => {
            c.log(`Listening on ${Config.HTTP.HTTP_HOST}:${Config.HTTP.HTTP_PORT}`);
        });
    }

    public static getInstance(): HttpServer {
        if (!HttpServer.instance) {
            HttpServer.instance = new HttpServer();
        }
        return HttpServer.instance;
    }
}