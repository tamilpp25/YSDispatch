import { readFileSync, readdirSync, writeFileSync } from "fs";
import { resolve } from 'path';
import { VerboseLevel } from './Logger';

const DEFAULT_CONFIG = {
    // General
    VERBOSE_LEVEL: 1,

    // MongoDB
    MONGO_URI: "mongodb://0.0.0.0:27017/YSDispatch",
    
    // HTTP
    HTTP: {
        HTTP_HOST: "0.0.0.0",
        HTTP_PORT: 3000
    },
    HTTPS: {
        HTTPS_HOST: "0.0.0.0",
        HTTPS_PORT: 443
    },

    // Dispatch
    DISPATCH: [{
        DISPATCH_NAME: "global",
        DISPATCH_TITLE: "YSDispatch - Global",
        DISPATCH_BASE_URL: "https://localhost/",
        GAMESERVER_IP: "127.0.0.1",
        GAMESERVER_PORT: 22102
    }],

    AUTO_ACCOUNT: false
}

type DefaultConfig = typeof DEFAULT_CONFIG;

function r(...args: string[]) {
    return readFileSync(resolve(__dirname, ...args)).toString();
}

function rd(...args: string[]) {
    return readdirSync(resolve(__dirname, ...args)).toString();
}

function readConfig(): any {
    let config: DefaultConfig;
    try {
        config = JSON.parse(r('../../config.json'));
        // Check if config object.keys is the same as DEFAULT_CONFIG.keys
        const missing = Object.keys(DEFAULT_CONFIG).filter(key => !config.hasOwnProperty(key));

        if (missing.length > 0) {
            missing.forEach(key => {
                // @ts-ignore
                config[key] = DEFAULT_CONFIG[key];
            });
            updateConfig(config);
            console.log(`Added missing config keys: ${missing.join(', ')}`);
        }
    } catch {
        console.error("Could not read config file. Creating one for you...");
        config = DEFAULT_CONFIG;
        updateConfig(config);
    }
    return config;
}

function updateConfig(config: any) {
    writeFileSync('./config.json', JSON.stringify(config, null, 2));
}

export function resolveWindyPath(folder: string,file: string){
    const pathData = r(folder,file,'.luac')
    return pathData
}

export default class Config {
    public static config = readConfig();
    public static VERBOSE_LEVEL: VerboseLevel = Config.config.VERBOSE_LEVEL;
    public static MONGO_URI: string = Config.config.MONGO_URI;
    public static HTTP: {
        HTTP_HOST: string,
        HTTP_PORT: number
    } = Config.config.HTTP;
    public static HTTPS: {
        HTTPS_HOST: string,
        HTTPS_PORT: number
    } = Config.config.HTTPS;
    public static DISPATCH: {
        DISPATCH_NAME: string;
        DISPATCH_TITLE: string;
        DISPATCH_BASE_URL: string;
        GAMESERVER_IP: string;
        GAMESERVER_PORT: number;
    }[] = Config.config.DISPATCH;
    public static AUTO_ACCOUNT: boolean = Config.config.AUTO_ACCOUNT;

    private constructor() { }
}
